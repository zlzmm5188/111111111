import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Post, User } from '../../entities';
import axios from 'axios';

/**
 * 新闻源配置
 */
interface NewsSource {
  name: string;
  enabled: boolean;
  apiUrl: string;
  parseMethod: string;
}

/**
 * 采集到的新闻条目
 */
interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  time: Date;
  url?: string;
  tag?: string;
}

/**
 * 新闻采集服务
 * 定时从外部新闻源（金十数据、财联社等）抓取财经新闻
 * 自动发布到广场作为官方帖子
 */
@Injectable()
export class NewsCrawlerService {
  private readonly logger = new Logger(NewsCrawlerService.name);
  private readonly officialUserId: number;
  private readonly enabled: boolean;

  // 已发布的新闻ID缓存（避免重复发布）
  private publishedNewsIds = new Set<string>();

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    this.officialUserId = this.configService.get<number>('OFFICIAL_USER_ID', 1);
    this.enabled = this.configService.get<string>('NEWS_CRAWLER_ENABLED', 'true') === 'true';
    
    // 初始化时加载最近24小时已发布的新闻ID
    this.loadRecentPublishedNews();
  }

  /**
   * 加载最近已发布的新闻（避免重启后重复发布）
   */
  private async loadRecentPublishedNews() {
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentPosts = await this.postRepo.find({
        where: {
          isOfficial: 1,
          type: 'news',
          createdAt: MoreThan(since)
        },
        select: ['id', 'content']
      });

      // 用内容的前50个字符作为唯一标识
      recentPosts.forEach(post => {
        const key = this.getContentKey(post.content);
        this.publishedNewsIds.add(key);
      });

      this.logger.log(`已加载${recentPosts.length}条最近发布的新闻`);
    } catch (e) {
      this.logger.error('加载已发布新闻失败:', e);
    }
  }

  /**
   * 获取内容的唯一标识
   */
  private getContentKey(content: string): string {
    return content.slice(0, 50).replace(/\s+/g, '');
  }

  /**
   * 定时任务：每30分钟采集一次新闻
   */
  @Cron('0 */30 * * * *')
  async scheduledCrawl() {
    if (!this.enabled) {
      return;
    }
    this.logger.log('开始定时新闻采集...');
    await this.crawlAndPublish();
  }

  /**
   * 手动触发采集
   */
  async manualCrawl(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const count = await this.crawlAndPublish();
      return { success: true, count };
    } catch (e) {
      return { success: false, count: 0, error: e.message };
    }
  }

  /**
   * 采集并发布新闻
   */
  private async crawlAndPublish(): Promise<number> {
    const allNews: NewsItem[] = [];

    // 从金十数据采集
    const jin10News = await this.fetchJin10News();
    allNews.push(...jin10News);

    // 从财联社采集
    const clsNews = await this.fetchClsNews();
    allNews.push(...clsNews);

    // 过滤已发布的新闻
    const newNews = allNews.filter(n => {
      const key = this.getContentKey(n.content);
      return !this.publishedNewsIds.has(key);
    });

    if (newNews.length === 0) {
      this.logger.log('没有新的新闻需要发布');
      return 0;
    }

    // 每次最多发布5条，避免刷屏
    const toPublish = newNews.slice(0, 5);
    let publishedCount = 0;

    for (const news of toPublish) {
      try {
        await this.publishNews(news);
        const key = this.getContentKey(news.content);
        this.publishedNewsIds.add(key);
        publishedCount++;
      } catch (e) {
        this.logger.error(`发布新闻失败: ${e.message}`);
      }
    }

    this.logger.log(`成功发布${publishedCount}条新闻`);
    return publishedCount;
  }

  /**
   * 从金十数据采集
   */
  private async fetchJin10News(): Promise<NewsItem[]> {
    try {
      const response = await axios.get('https://flash-api.jin10.com/get_flash_list', {
        params: {
          channel: '-8200',
          max_time: '',
          vip: 0
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.jin10.com/'
        },
        timeout: 10000
      });

      if (!response.data?.data) {
        return [];
      }

      return response.data.data
        .slice(0, 20) // 取最新20条
        .map((item: any) => ({
          id: `jin10_${item.id}`,
          title: this.extractTitle(item),
          content: this.cleanHtmlTags(item.data?.content || item.content || ''),
          source: '金十数据',
          time: new Date(item.time),
          url: `https://www.jin10.com/flash_detail/${item.id}.html`,
          tag: this.categorizeNews(item.data?.content || item.content || '')
        }))
        .filter((n: NewsItem) => n.content.length > 20); // 过滤太短的
    } catch (e) {
      this.logger.warn('金十数据采集失败:', e.message);
      return [];
    }
  }

  /**
   * 从财联社采集
   */
  private async fetchClsNews(): Promise<NewsItem[]> {
    try {
      // 财联社电报API
      const response = await axios.get('https://www.cls.cn/api/telegraph/list', {
        params: {
          page: 1,
          limit: 20
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.cls.cn/'
        },
        timeout: 10000
      });

      if (!response.data?.data?.list) {
        return [];
      }

      return response.data.data.list
        .map((item: any) => ({
          id: `cls_${item.id}`,
          title: item.title || this.extractTitle(item),
          content: item.content || item.brief || '',
          source: '财联社',
          time: new Date(item.ctime * 1000),
          url: `https://www.cls.cn/detail/${item.id}`,
          tag: item.subjects?.[0]?.name || '财经'
        }))
        .filter((n: NewsItem) => n.content.length > 20);
    } catch (e) {
      this.logger.warn('财联社采集失败:', e.message);
      return [];
    }
  }

  /**
   * 发布新闻为帖子
   */
  private async publishNews(news: NewsItem): Promise<Post> {
    // 确保官方账号存在
    const officialUser = await this.userRepo.findOne({ where: { id: this.officialUserId } });
    if (!officialUser) {
      throw new Error('官方账号不存在');
    }

    // 格式化内容
    const content = this.formatNewsContent(news);

    // 创建帖子
    const post = this.postRepo.create({
      userId: this.officialUserId,
      content,
      topic: this.getTopicTag(news.tag),
      type: 'news',
      mediaType: 'text',
      status: 1,
      isOfficial: 1,
      weight: 80, // 新闻权重略低于AI生成的内容
    });

    await this.postRepo.save(post);

    // 更新用户帖子数
    await this.userRepo.increment({ id: this.officialUserId }, 'postCount', 1);

    return post;
  }

  /**
   * 格式化新闻内容
   */
  private formatNewsContent(news: NewsItem): string {
    const emoji = this.getEmojiByTag(news.tag);
    const parts = [
      `${emoji}【${news.source}】${news.title || ''}`,
      '',
      news.content,
      '',
      `📍 来源：${news.source}`,
    ];

    return parts.join('\n').trim();
  }

  /**
   * 根据标签获取话题
   */
  private getTopicTag(tag?: string): string {
    if (!tag) return '#行业快讯';
    
    const tagMap: Record<string, string> = {
      '行情': '#市场行情',
      '黄金': '#黄金资讯',
      '加密': '#加密货币',
      '政策': '#财经政策',
      '美股': '#美股动态',
      'A股': '#A股动态',
      '外汇': '#外汇市场',
      '原油': '#能源市场',
    };

    for (const [key, value] of Object.entries(tagMap)) {
      if (tag.includes(key)) {
        return value;
      }
    }

    return '#行业快讯';
  }

  /**
   * 根据标签获取表情
   */
  private getEmojiByTag(tag?: string): string {
    if (!tag) return '📰';
    
    if (tag.includes('黄金')) return '🥇';
    if (tag.includes('加密') || tag.includes('币')) return '🪙';
    if (tag.includes('美股')) return '🇺🇸';
    if (tag.includes('A股')) return '🇨🇳';
    if (tag.includes('原油')) return '⛽';
    if (tag.includes('政策')) return '📋';
    if (tag.includes('行情')) return '📈';
    
    return '📰';
  }

  /**
   * 提取标题
   */
  private extractTitle(item: any): string {
    const content = item.data?.content || item.content || '';
    // 取第一句话作为标题
    const match = content.match(/^[【\[]?([^。！？\n]{10,50})[】\]]?/);
    return match ? match[1] : content.slice(0, 50);
  }

  /**
   * 清除HTML标签
   */
  private cleanHtmlTags(html: string): string {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();
  }

  /**
   * 自动分类新闻
   */
  private categorizeNews(content: string): string {
    if (content.includes('黄金') || content.includes('金价')) return '黄金';
    if (content.includes('比特币') || content.includes('BTC') || content.includes('加密')) return '加密';
    if (content.includes('美股') || content.includes('纳斯达克') || content.includes('道琼斯')) return '美股';
    if (content.includes('A股') || content.includes('沪指') || content.includes('深成指')) return 'A股';
    if (content.includes('原油') || content.includes('油价')) return '原油';
    if (content.includes('美联储') || content.includes('央行') || content.includes('利率')) return '政策';
    return '行情';
  }

  /**
   * 获取采集状态
   */
  getStatus(): { enabled: boolean; publishedCount: number; sources: string[] } {
    return {
      enabled: this.enabled,
      publishedCount: this.publishedNewsIds.size,
      sources: ['金十数据', '财联社']
    };
  }

  /**
   * 清空已发布缓存（用于测试）
   */
  clearCache() {
    this.publishedNewsIds.clear();
  }
}
