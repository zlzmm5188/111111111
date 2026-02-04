import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Post, User } from '../../entities';

/**
 * 官方帖子类型
 */
export type OfficialPostType = 
  | 'market_analysis'    // 市场分析
  | 'agx_update'         // AGX 动态
  | 'crypto_news'        // 加密货币新闻
  | 'investment_tips'    // 投资小知识
  | 'weekly_summary'     // 周报
  | 'product_intro';     // 产品介绍

/**
 * 官方发帖服务
 * 使用 DeepSeek 生成内容，以官方身份发布到广场
 */
@Injectable()
export class OfficialPostService {
  private readonly logger = new Logger(OfficialPostService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly officialUserId: number;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    // Writer专用密钥，如果没配置则回退到通用密钥
    this.apiKey = this.configService.get<string>('DEEPSEEK_WRITER_API_KEY') 
      || this.configService.get<string>('DEEPSEEK_API_KEY', '');
    this.baseUrl = this.configService.get<string>('DEEPSEEK_BASE_URL', 'https://api.deepseek.com');
    this.model = this.configService.get<string>('DEEPSEEK_WRITER_MODEL', 'deepseek-chat');
    this.officialUserId = this.configService.get<number>('OFFICIAL_USER_ID', 1); // 官方账号ID
  }

  /**
   * 定时任务：每天发布内容
   * 早上 9:00 发市场分析
   * 下午 15:00 发投资知识
   * 晚上 20:00 发 AGX 动态
   */
  @Cron('0 9 * * *')
  async scheduleMorningPost() {
    this.logger.log('定时任务: 发布早间市场分析');
    await this.generateAndPublish('market_analysis');
  }

  @Cron('0 15 * * *')
  async scheduleAfternoonPost() {
    this.logger.log('定时任务: 发布投资小知识');
    await this.generateAndPublish('investment_tips');
  }

  @Cron('0 20 * * *')
  async scheduleEveningPost() {
    this.logger.log('定时任务: 发布 AGX 动态');
    await this.generateAndPublish('agx_update');
  }

  /**
   * 生成并发布官方帖子
   */
  async generateAndPublish(type: OfficialPostType, customTopic?: string): Promise<{ success: boolean; post?: any; error?: string }> {
    try {
      // 生成内容
      const content = await this.generateContent(type, customTopic);
      if (!content) {
        return { success: false, error: '内容生成失败' };
      }

      // 发布帖子
      const post = await this.publishOfficialPost(content, type);
      
      this.logger.log(`官方帖子发布成功: ID=${post.id}, 类型=${type}`);
      
      return { success: true, post };
    } catch (error) {
      this.logger.error(`官方帖子发布失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 生成帖子内容
   */
  private async generateContent(type: OfficialPostType, customTopic?: string): Promise<string | null> {
    if (!this.apiKey) {
      this.logger.warn('DeepSeek API Key 未配置');
      return null;
    }

    const prompt = this.buildPrompt(type, customTopic);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: this.getSystemPrompt() },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`DeepSeek API error: ${response.status} - ${errorText}`);
        return null;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // 清理内容（去掉可能的 markdown 代码块标记）
      return this.cleanContent(content);
    } catch (error) {
      this.logger.error('DeepSeek API 调用失败:', error);
      return null;
    }
  }

  /**
   * 系统提示词
   */
  private getSystemPrompt(): string {
    return `你是 AGX 数字黄金平台的官方内容运营，负责在社区广场发布高质量的内容。

## 平台背景
AGX 是一个创新的数字资产平台，主要业务包括：
- AGX 代币预售（$0.065/枚）
- 持币生金：持有 AGX 可获得黄金收益
- 云矿机挖矿：使用 AGX 购买矿机，获得 USDT 返利

## 内容风格
1. 专业但不枯燥，用通俗易懂的语言解释复杂概念
2. 积极正面，传递信心但不夸大
3. 适当使用表情符号增加亲和力
4. 控制在 300-500 字
5. 可以适当加入互动问句引导用户参与

## 注意事项
- 不要做任何投资建议或收益承诺
- 不要提及具体收益率数字
- 保持客观中立的分析视角
- 内容要有价值，不要水文`;
  }

  /**
   * 构建提示词
   */
  private buildPrompt(type: OfficialPostType, customTopic?: string): string {
    const today = new Date().toLocaleDateString('zh-CN');
    
    const prompts: Record<OfficialPostType, string> = {
      market_analysis: `请撰写一篇今日（${today}）的加密货币市场简析。
内容包括：
- 大盘走势简述（BTC/ETH）
- 市场情绪分析
- 需要关注的事件或数据
- 给社区用户的温馨提示

记住：不要给出具体的买卖建议，保持客观分析的角度。`,

      agx_update: `请撰写一篇关于 AGX 平台的动态更新。
可以从以下角度选择：
- 社区建设进展
- 平台功能优化
- 用户增长数据（用模糊的增长趋势描述）
- 未来发展规划展望
- 感谢社区用户的支持

内容要积极正面，传递平台发展的信心。`,

      crypto_news: `请撰写一篇今日加密货币行业要闻汇总。
选择 2-3 条重要新闻进行简要分析：
- 监管政策动向
- 大型机构动态
- 技术发展进展
- 市场热点事件

每条新闻附带简短的影响分析。`,

      investment_tips: `请撰写一篇投资小知识科普文章。
可选主题：
- 数字资产的配置策略
- 风险管理的重要性
- 长期投资 vs 短期交易
- 如何识别项目价值
- 常见的投资心理陷阱

内容要有教育意义，帮助用户建立正确的投资观念。`,

      weekly_summary: `请撰写一篇本周（截至${today}）的周报总结。
内容包括：
- 本周市场回顾
- AGX 平台本周亮点
- 社区活跃度总结
- 下周展望

语气温暖，感谢社区的陪伴。`,

      product_intro: `请撰写一篇介绍 AGX 平台核心功能的文章。
重点介绍：
- 持币生金：持有 AGX 获得黄金收益的机制
- 云矿机：使用 AGX 购买矿机获得 USDT 返利
- 邀请奖励：邀请好友获得返佣

突出平台的创新性和用户价值。`,
    };

    let prompt = prompts[type] || prompts.agx_update;
    
    if (customTopic) {
      prompt += `\n\n特别关注主题：${customTopic}`;
    }

    return prompt;
  }

  /**
   * 发布官方帖子
   */
  private async publishOfficialPost(content: string, type: OfficialPostType): Promise<Post> {
    // 确保官方账号存在
    const officialUser = await this.userRepo.findOne({ where: { id: this.officialUserId } });
    if (!officialUser) {
      throw new Error('官方账号不存在，请先配置 OFFICIAL_USER_ID');
    }

    // 生成话题标签
    const topic = this.getTopicByType(type);

    // 创建帖子
    const post = this.postRepo.create({
      userId: this.officialUserId,
      content,
      topic,
      type: 'news',
      mediaType: 'text',
      status: 1, // 直接发布
      isOfficial: 1, // 标记为官方
      weight: 100, // 较高权重
    });

    await this.postRepo.save(post);

    // 更新用户帖子数
    await this.userRepo.increment({ id: this.officialUserId }, 'postCount', 1);

    return post;
  }

  /**
   * 获取话题标签
   */
  private getTopicByType(type: OfficialPostType): string {
    const topics: Record<OfficialPostType, string> = {
      market_analysis: '#市场分析',
      agx_update: '#AGX动态',
      crypto_news: '#行业快讯',
      investment_tips: '#投资课堂',
      weekly_summary: '#周报',
      product_intro: '#平台介绍',
    };
    return topics[type] || '#AGX';
  }

  /**
   * 清理内容
   */
  private cleanContent(content: string): string {
    // 去掉 markdown 代码块标记
    return content
      .replace(/^```[\s\S]*?\n/, '')
      .replace(/\n```$/, '')
      .trim();
  }

  /**
   * 获取可用的帖子类型
   */
  getAvailableTypes(): Array<{ type: OfficialPostType; name: string; description: string }> {
    return [
      { type: 'market_analysis', name: '市场分析', description: '每日加密市场简析' },
      { type: 'agx_update', name: 'AGX 动态', description: '平台发展动态更新' },
      { type: 'crypto_news', name: '行业快讯', description: '加密货币行业要闻' },
      { type: 'investment_tips', name: '投资课堂', description: '投资知识科普' },
      { type: 'weekly_summary', name: '周报', description: '本周总结与展望' },
      { type: 'product_intro', name: '产品介绍', description: '平台功能介绍' },
    ];
  }

  /**
   * 获取最近的官方帖子
   */
  async getRecentOfficialPosts(limit: number = 10): Promise<Post[]> {
    return this.postRepo.find({
      where: { isOfficial: 1, status: 1 },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
