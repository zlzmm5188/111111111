import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { SquareService, PostConditionConfig } from './square.service';
import { SensitiveWordService } from './sensitive-word.service';
import { ReviewService } from './review.service';
import { PrivateMessageService } from './private-message.service';
import { CommentReviewService } from './comment-review.service';
import { ReportService } from './report.service';
import { AutoReviewService } from './auto-review.service';
import { OfficialPostService } from './official-post.service';
import { NewsCrawlerService } from './news-crawler.service';
import { CreateSensitiveWordDto, UpdateSensitiveWordDto, PostReviewDto } from './dto/sensitive-word.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import axios from 'axios';

/**
 * 广场接口
 * 提供帖子、评论、点赞、关注等功能
 */
@Controller('api/square')
export class SquareController {
  constructor(
    private readonly squareService: SquareService,
    private readonly sensitiveWordService: SensitiveWordService,
    private readonly reviewService: ReviewService,
    private readonly privateMessageService: PrivateMessageService,
    private readonly commentReviewService: CommentReviewService,
    private readonly reportService: ReportService,
    private readonly autoReviewService: AutoReviewService,
    private readonly officialPostService: OfficialPostService,
    private readonly newsCrawlerService: NewsCrawlerService,
  ) {}

  /**
   * 获取7x24快讯 (代理finance-news服务)
   * GET /api/square/flash?limit=20
   */
  @Get('flash')
  async getFlash(@Query('limit') limit: number = 20) {
    try {
      // 从本地finance-news服务获取快讯
      const response = await axios.get('http://localhost:4000/api/flash', {
        params: { limit },
        timeout: 3000
      });
      if (response.data && response.data.data) {
        return { code: 0, msg: 'ok', data: response.data.data };
      }
    } catch (e) {
      console.log('Finance-news快讯获取失败，使用金十数据');
    }
    
    // 备用：金十数据
    try {
      const jin10 = await axios.get('https://flash-api.jin10.com/get_flash_list', {
        params: { channel: '-8200', max_time: '', vip: 0 },
        headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.jin10.com/' },
        timeout: 5000
      });
      if (jin10.data?.data) {
        return {
          code: 0,
          msg: 'ok',
          data: jin10.data.data.slice(0, limit).map((item: any) => ({
            id: item.id,
            time: this.formatNewsTime(item.time),
            tag: '快讯',
            text: this.cleanHtmlTags(item.data?.content || item.content || '')
          }))
        };
      }
    } catch (e) {
      console.log('金十数据API也失败');
    }
    
    return { code: 0, msg: 'ok', data: [] };
  }

  /**
   * 获取新闻列表
   * GET /api/square/news?page=1&pageSize=20
   */
  @Get('news')
  async getNews(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    try {
      // 优先从finance-news获取
      const response = await axios.get('http://localhost:4000/api/news', {
        params: { page, limit: pageSize },
        timeout: 3000
      });
      if (response.data?.data) {
        return { 
          code: 0, 
          msg: 'ok', 
          data: { 
            list: response.data.data.map((n: any) => ({
              id: n.id,
              title: n.title,
              source: n.source || '东方财经',
              time: this.formatNewsTime(n.createTime),
              cover: n.image,
              url: n.url,
              tag: n.category || '要闻',
              text: n.summary || n.title
            })), 
            page, 
            pageSize 
          } 
        };
      }
    } catch (e) {
      console.log('Finance-news新闻获取失败，使用备用源');
    }
    
    try {
      const news = await this.fetchFinanceNews(page, pageSize);
      return { code: 0, msg: 'ok', data: { list: news, page, pageSize } };
    } catch (error) {
      console.error('获取新闻失败:', error);
      return { 
        code: 0, 
        msg: 'ok', 
        data: { 
          list: this.getDefaultNews(), 
          page, 
          pageSize 
        } 
      };
    }
  }

  /**
   * 获取财经新闻
   */
  private async fetchFinanceNews(page: number, pageSize: number) {
    // 尝试从金十数据API获取新闻
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
        timeout: 5000
      });
      
      if (response.data && response.data.data) {
        const items = response.data.data.slice(0, pageSize);
        return items.map((item: any, idx: number) => ({
          id: item.id || idx + 1,
          title: this.cleanHtmlTags(item.data?.content || item.content || ''),
          source: '金十数据',
          time: this.formatNewsTime(item.time),
          cover: null,
          url: `https://www.jin10.com/flash_detail/${item.id}.html`
        })).filter((n: any) => n.title && n.title.length > 10);
      }
    } catch (e) {
      console.log('金十数据API请求失败，使用备用数据');
    }
    
    return this.getDefaultNews();
  }

  /**
   * 清除HTML标签
   */
  private cleanHtmlTags(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }

  /**
   * 格式化新闻时间
   */
  private formatNewsTime(timeStr: string): string {
    if (!timeStr) return '刚刚';
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
      return `${Math.floor(diff / 86400000)}天前`;
    } catch {
      return '刚刚';
    }
  }

  /**
   * 默认新闻数据
   */
  private getDefaultNews() {
    const now = new Date();
    return [
      {
        id: 1,
        title: '【行情】现货黄金短线走高，日内涨幅扩大至0.5%',
        source: '市场快讯',
        time: '5分钟前',
        cover: null
      },
      {
        id: 2,
        title: '美联储官员：将根据经济数据决定未来利率路径',
        source: '财经要闻',
        time: '15分钟前',
        cover: null
      },
      {
        id: 3,
        title: '全球央行黄金储备持续增加，新兴市场国家购金意愿强烈',
        source: '黄金资讯',
        time: '32分钟前',
        cover: null
      },
      {
        id: 4,
        title: '机构观点：黄金中长期配置价值依然突出',
        source: '投资参考',
        time: '1小时前',
        cover: null
      },
      {
        id: 5,
        title: '数字黄金概念持续受到关注，区块链技术赋能贵金属投资',
        source: 'AGX快讯',
        time: '2小时前',
        cover: null
      }
    ];
  }

  /**
   * 获取帖子列表
   * GET /api/square/posts?tab=recommend&page=1&pageSize=20
   */
  @Get('posts')
  async getPosts(
    @Query('tab') tab: string = 'recommend',
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    const result = await this.squareService.getPosts(tab, userId, page, pageSize);
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 获取帖子详情
   * GET /api/square/post/:id
   */
  @Get('post/:id')
  async getPost(@Param('id') id: number, @Request() req: any) {
    const userId = req.user?.id;
    const post = await this.squareService.getPost(id, userId);
    if (!post) {
      return { code: 1001, msg: '帖子不存在', data: null };
    }
    return { code: 0, msg: 'ok', data: post };
  }

  /**
   * 发布帖子
   * POST /api/square/post
   */
  @Post('post')
  async createPost(
    @Body() body: { content: string; images?: string[]; topic?: string; type?: string; videoUrl?: string },
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      return { code: 1002, msg: '请先登录', data: null };
    }
    
    // 检查发帖条件
    const conditionCheck = await this.squareService.checkPostCondition(userId);
    if (!conditionCheck.canPost) {
      return { code: 1003, msg: conditionCheck.reason, data: null };
    }
    
    const post = await this.squareService.createPost(
      userId, 
      body.content, 
      body.images, 
      body.topic, 
      body.type,
      body.videoUrl
    );
    return { code: 0, msg: 'ok', data: post };
  }

  /**
   * 点赞/取消点赞
   * POST /api/square/like
   */
  @Post('like')
  async toggleLike(
    @Body() body: { targetType: 'post' | 'comment'; targetId: number },
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      return { code: 1002, msg: '请先登录', data: null };
    }
    const result = await this.squareService.toggleLike(userId, body.targetType, body.targetId);
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 发表评论
   * POST /api/square/comment
   */
  @Post('comment')
  async createComment(
    @Body() body: { postId: number; content: string; parentId?: number; replyToUserId?: number },
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      return { code: 1002, msg: '请先登录', data: null };
    }

    // 检查评论权限
    const commentCheck = await this.squareService.checkCommentCondition(userId);
    if (!commentCheck.canComment) {
      return { code: 1003, msg: commentCheck.reason || '暂无评论权限', data: null };
    }

    const comment = await this.squareService.createComment(
      userId, body.postId, body.content, body.parentId, body.replyToUserId
    );
    return { code: 0, msg: 'ok', data: comment };
  }

  /**
   * 获取评论列表
   * GET /api/square/comments?postId=1&page=1&pageSize=20
   */
  @Get('comments')
  async getComments(
    @Query('postId') postId: number,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    const result = await this.squareService.getComments(postId, page, pageSize);
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 关注/取消关注
   * POST /api/square/follow
   */
  @Post('follow')
  async toggleFollow(
    @Body() body: { targetUserId: number },
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      return { code: 1002, msg: '请先登录', data: null };
    }
    try {
      const result = await this.squareService.toggleFollow(userId, body.targetUserId);
      return { code: 0, msg: 'ok', data: result };
    } catch (e) {
      return { code: 1001, msg: e.message, data: null };
    }
  }

  /**
   * 获取热门话题
   * GET /api/square/topics?limit=10
   */
  @Get('topics')
  async getHotTopics(@Query('limit') limit: number = 10) {
    const topics = await this.squareService.getHotTopics(limit);
    return { code: 0, msg: 'ok', data: { list: topics } };
  }

  /**
   * 获取热门话题 (别名路由)
   * GET /api/square/topics/hot
   */
  @Get('topics/hot')
  async getHotTopicsAlias(@Query('limit') limit: number = 10) {
    const topics = await this.squareService.getHotTopics(limit);
    return { code: 0, msg: 'ok', data: { list: topics } };
  }

  /**
   * 获取学习内容
   * GET /api/square/learn?page=1&pageSize=20
   */
  @Get('learn')
  async getLearnContent(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    // 返回官方发布的教程类帖子
    const result = await this.squareService.getPosts('official', undefined, page, pageSize);
    return { code: 0, msg: 'ok', data: result };
  }

  // ===== 敏感词管理接口（管理后台） =====

  /**
   * 获取敏感词列表
   * GET /api/square/sensitive-words
   */
  @Get('sensitive-words')
  @UseGuards(JwtAuthGuard)
  async getSensitiveWords(@Query('status') status?: number) {
    const where: any = {};
    if (status !== undefined) {
      where.status = status;
    }
    const words = await this.sensitiveWordService.getSensitiveWords({ where, order: { id: 'DESC' } });
    return { code: 0, msg: 'ok', data: { list: words } };
  }

  /**
   * 创建敏感词
   * POST /api/square/sensitive-words
   */
  @Post('sensitive-words')
  @UseGuards(JwtAuthGuard)
  async createSensitiveWord(@Body() dto: CreateSensitiveWordDto) {
    const word = await this.sensitiveWordService.createSensitiveWord(dto);
    return { code: 0, msg: '创建成功', data: word };
  }

  /**
   * 更新敏感词
   * PUT /api/square/sensitive-words/:id
   */
  @Post('sensitive-words/:id')
  @UseGuards(JwtAuthGuard)
  async updateSensitiveWord(@Param('id') id: number, @Body() dto: UpdateSensitiveWordDto) {
    const word = await this.sensitiveWordService.updateSensitiveWord(id, dto);
    return { code: 0, msg: '更新成功', data: word };
  }

  /**
   * 删除敏感词
   * DELETE /api/square/sensitive-words/:id
   */
  @Post('sensitive-words/:id/delete')
  @UseGuards(JwtAuthGuard)
  async deleteSensitiveWord(@Param('id') id: number) {
    await this.sensitiveWordService.deleteSensitiveWord(id);
    return { code: 0, msg: '删除成功', data: null };
  }

  // ===== 帖子审核接口（管理后台） =====

  /**
   * 审核帖子
   * POST /api/square/review
   */
  @Post('review')
  @UseGuards(JwtAuthGuard)
  async reviewPost(@Body() dto: PostReviewDto, @Request() req: any) {
    const userId = req.user?.id;
    try {
      const result = await this.reviewService.reviewPost(userId, dto);
      return { code: 0, msg: '审核成功', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 获取待审核帖子
   * GET /api/square/pending-posts
   */
  @Get('pending-posts')
  @UseGuards(JwtAuthGuard)
  async getPendingPosts(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    const result = await this.reviewService.getPendingPosts(page, pageSize);
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 获取帖子审核记录
   * GET /api/square/review-history/:postId
   */
  @Get('review-history/:postId')
  @UseGuards(JwtAuthGuard)
  async getReviewHistory(@Param('postId') postId: number) {
    const history = await this.reviewService.getReviewHistory(postId);
    return { code: 0, msg: 'ok', data: { list: history } };
  }

  /**
   * 批量审核帖子
   * POST /api/square/batch-review
   */
  @Post('batch-review')
  @UseGuards(JwtAuthGuard)
  async batchReviewPosts(
    @Body() body: { postIds: number[]; action: 'approve' | 'reject'; reason?: string },
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    try {
      const result = await this.reviewService.batchReviewPosts(userId, body.postIds, body.action, body.reason);
      return { code: 0, msg: '批量审核成功', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  // ===== 私信查看接口（管理后台） =====

  /**
   * 获取用户间私信记录
   * GET /api/square/messages/:userId1/:userId2
   */
  @Get('messages/:userId1/:userId2')
  @UseGuards(JwtAuthGuard)
  async getUserMessages(
    @Param('userId1') userId1: number,
    @Param('userId2') userId2: number,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    const result = await this.privateMessageService.getUserMessages(userId1, userId2, page, pageSize);
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 获取所有私信记录（管理后台）
   * GET /api/square/all-messages
   */
  @Get('all-messages')
  @UseGuards(JwtAuthGuard)
  async getAllMessages(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.privateMessageService.getAllMessages(page, pageSize, startDate, endDate);
    return { code: 0, msg: 'ok', data: result };
  }

  // ===== 发帖条件配置接口（管理后台） =====

  /**
   * 获取发帖条件配置
   * GET /api/square/post-condition
   */
  @Get('post-condition')
  @UseGuards(JwtAuthGuard)
  async getPostCondition() {
    const config = await this.squareService.getPostConditionConfig();
    return { code: 0, msg: 'ok', data: config };
  }

  /**
   * 保存发帖条件配置
   * PUT /api/square/post-condition
   */
  @Put('post-condition')
  @UseGuards(JwtAuthGuard)
  async savePostCondition(@Body() config: PostConditionConfig) {
    const result = await this.squareService.savePostConditionConfig(config);
    return { code: 0, msg: '保存成功', data: result };
  }

  /**
   * 检查当前用户发帖条件
   * GET /api/square/check-post-condition
   */
  @Get('check-post-condition')
  @UseGuards(JwtAuthGuard)
  async checkPostCondition(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      return { code: 1002, msg: '请先登录', data: null };
    }
    const result = await this.squareService.checkPostCondition(userId);
    return { code: 0, msg: 'ok', data: result };
  }

  // ===== 帖子管理接口（管理后台） =====

  /**
   * 获取所有帖子列表（管理后台）
   * GET /api/square/admin/posts
   */
  @Get('admin/posts')
  @UseGuards(JwtAuthGuard)
  async getAllPosts(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('status') status?: string,
    @Query('isTop') isTop?: string,
    @Query('isHot') isHot?: string,
    @Query('isOfficial') isOfficial?: string,
    @Query('userId') userId?: string,
    @Query('keyword') keyword?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 20;
    const result = await this.squareService.getAllPosts({
      page: pageNum,
      pageSize: pageSizeNum,
      status: status !== undefined && status !== '' ? parseInt(status, 10) : undefined,
      isTop: isTop !== undefined && isTop !== '' ? parseInt(isTop, 10) : undefined,
      isHot: isHot !== undefined && isHot !== '' ? parseInt(isHot, 10) : undefined,
      isOfficial: isOfficial !== undefined && isOfficial !== '' ? parseInt(isOfficial, 10) : undefined,
      userId: userId && userId !== '' ? parseInt(userId, 10) : undefined,
      keyword,
      startDate,
      endDate,
    });
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 设置/取消置顶
   * POST /api/square/admin/post/:id/top
   */
  @Post('admin/post/:id/top')
  @UseGuards(JwtAuthGuard)
  async setPostTop(
    @Param('id') id: number,
    @Body() body: { isTop: boolean },
  ) {
    try {
      const post = await this.squareService.setPostTop(Number(id), body.isTop);
      return { code: 0, msg: body.isTop ? '置顶成功' : '取消置顶成功', data: post };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 设置/取消热门
   * POST /api/square/admin/post/:id/hot
   */
  @Post('admin/post/:id/hot')
  @UseGuards(JwtAuthGuard)
  async setPostHot(
    @Param('id') id: number,
    @Body() body: { isHot: boolean },
  ) {
    try {
      const post = await this.squareService.setPostHot(Number(id), body.isHot);
      return { code: 0, msg: body.isHot ? '设为热门成功' : '取消热门成功', data: post };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 设置/取消官方
   * POST /api/square/admin/post/:id/official
   */
  @Post('admin/post/:id/official')
  @UseGuards(JwtAuthGuard)
  async setPostOfficial(
    @Param('id') id: number,
    @Body() body: { isOfficial: boolean },
  ) {
    try {
      const post = await this.squareService.setPostOfficial(Number(id), body.isOfficial);
      return { code: 0, msg: body.isOfficial ? '设为官方成功' : '取消官方成功', data: post };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 设置帖子权重
   * POST /api/square/admin/post/:id/weight
   */
  @Post('admin/post/:id/weight')
  @UseGuards(JwtAuthGuard)
  async setPostWeight(
    @Param('id') id: number,
    @Body() body: { weight: number },
  ) {
    try {
      const post = await this.squareService.setPostWeight(Number(id), body.weight);
      return { code: 0, msg: '设置权重成功', data: post };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 下架帖子
   * POST /api/square/admin/post/:id/offline
   */
  @Post('admin/post/:id/offline')
  @UseGuards(JwtAuthGuard)
  async offlinePost(
    @Param('id') id: number,
    @Body() body: { reason?: string },
  ) {
    try {
      const post = await this.squareService.offlinePost(Number(id), body.reason);
      return { code: 0, msg: '下架成功', data: post };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 恢复帖子
   * POST /api/square/admin/post/:id/restore
   */
  @Post('admin/post/:id/restore')
  @UseGuards(JwtAuthGuard)
  async restorePost(@Param('id') id: number) {
    try {
      const post = await this.squareService.restorePost(Number(id));
      return { code: 0, msg: '恢复成功', data: post };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 删除帖子
   * DELETE /api/square/admin/post/:id
   */
  @Delete('admin/post/:id')
  @UseGuards(JwtAuthGuard)
  async deletePost(@Param('id') id: number) {
    try {
      await this.squareService.deletePost(Number(id));
      return { code: 0, msg: '删除成功', data: null };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 批量操作帖子
   * POST /api/square/admin/posts/batch
   */
  @Post('admin/posts/batch')
  @UseGuards(JwtAuthGuard)
  async batchSetPostStatus(
    @Body() body: {
      postIds: number[];
      action: 'top' | 'untop' | 'hot' | 'unhot' | 'official' | 'unofficial' | 'offline' | 'restore' | 'delete';
    },
  ) {
    try {
      const result = await this.squareService.batchSetPostStatus(body.postIds, body.action);
      return { code: 0, msg: '批量操作完成', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  // ===== 话题管理接口（管理后台） =====

  /**
   * 获取所有话题列表（管理后台）
   * GET /api/square/admin/topics
   */
  @Get('admin/topics')
  @UseGuards(JwtAuthGuard)
  async getAllTopics(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '50',
    @Query('status') status?: string,
    @Query('isHot') isHot?: string,
    @Query('keyword') keyword?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 50;
    const result = await this.squareService.getAllTopics({
      page: pageNum,
      pageSize: pageSizeNum,
      status: status !== undefined && status !== '' ? parseInt(status, 10) : undefined,
      isHot: isHot !== undefined && isHot !== '' ? parseInt(isHot, 10) : undefined,
      keyword,
    });
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 创建话题
   * POST /api/square/admin/topic
   */
  @Post('admin/topic')
  @UseGuards(JwtAuthGuard)
  async createTopic(
    @Body() body: {
      tag: string;
      icon?: string;
      description?: string;
      isHot?: number;
      sortOrder?: number;
    },
  ) {
    try {
      const topic = await this.squareService.createTopic(body);
      return { code: 0, msg: '创建成功', data: topic };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 更新话题
   * PUT /api/square/admin/topic/:id
   */
  @Put('admin/topic/:id')
  @UseGuards(JwtAuthGuard)
  async updateTopic(
    @Param('id') id: number,
    @Body() body: {
      tag?: string;
      icon?: string;
      description?: string;
      isHot?: number;
      sortOrder?: number;
      status?: number;
    },
  ) {
    try {
      const topic = await this.squareService.updateTopic(Number(id), body);
      return { code: 0, msg: '更新成功', data: topic };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 删除话题
   * DELETE /api/square/admin/topic/:id
   */
  @Delete('admin/topic/:id')
  @UseGuards(JwtAuthGuard)
  async deleteTopic(@Param('id') id: number) {
    try {
      await this.squareService.deleteTopic(Number(id));
      return { code: 0, msg: '删除成功', data: null };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 设置话题热门状态
   * POST /api/square/admin/topic/:id/hot
   */
  @Post('admin/topic/:id/hot')
  @UseGuards(JwtAuthGuard)
  async setTopicHot(
    @Param('id') id: number,
    @Body() body: { isHot: boolean },
  ) {
    try {
      const topic = await this.squareService.setTopicHot(Number(id), body.isHot);
      return { code: 0, msg: body.isHot ? '已设为热门' : '已取消热门', data: topic };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 设置话题状态
   * POST /api/square/admin/topic/:id/status
   */
  @Post('admin/topic/:id/status')
  @UseGuards(JwtAuthGuard)
  async setTopicStatus(
    @Param('id') id: number,
    @Body() body: { status: number },
  ) {
    try {
      const topic = await this.squareService.setTopicStatus(Number(id), body.status);
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }
  // ===== 评论审核接口(管理后台) =====

  /**
   * 获取待审核评论列表
   * GET /api/square/pending-comments
   */
  @Get('pending-comments')
  @UseGuards(JwtAuthGuard)
  async getPendingComments(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('keyword') keyword?: string,
    @Query('userId') userId?: string,
    @Query('postId') postId?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 20;
    const result = await this.commentReviewService.getPendingComments({
      page: pageNum,
      pageSize: pageSizeNum,
      keyword,
      userId: userId && userId !== '' ? parseInt(userId, 10) : undefined,
      postId: postId && postId !== '' ? parseInt(postId, 10) : undefined,
    });
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 审核评论
   * POST /api/square/review-comment
   */
  @Post('review-comment')
  @UseGuards(JwtAuthGuard)
  async reviewComment(
    @Body() body: { commentId: number; action: 'approve' | 'delete' },
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    try {
      const result = await this.commentReviewService.reviewComment(userId, body.commentId, body.action);
      return { code: 0, msg: '审核成功', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 批量审核评论
   * POST /api/square/batch-review-comments
   */
  @Post('batch-review-comments')
  @UseGuards(JwtAuthGuard)
  async batchReviewComments(
    @Body() body: { commentIds: number[]; action: 'approve' | 'delete' },
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    try {
      const result = await this.commentReviewService.batchReviewComments(userId, body.commentIds, body.action);
      return { code: 0, msg: '批量审核成功', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 获取评论详情
   * GET /api/square/comment-detail/:id
   */
  @Get('comment-detail/:id')
  @UseGuards(JwtAuthGuard)
  async getCommentDetail(@Param('id') id: number) {
    try {
      const comment = await this.commentReviewService.getCommentDetail(Number(id));
      return { code: 0, msg: 'ok', data: comment };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  // ===== 举报管理接口(管理后台) =====

  /**
   * 创建举报
   * POST /api/square/report
   */
  @Post('report')
  @UseGuards(JwtAuthGuard)
  async createReport(
    @Body() body: {
      targetType: string;
      targetId: number;
      reason: string;
      description?: string;
    },
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      return { code: 1002, msg: '请先登录', data: null };
    }

    try {
      const report = await this.reportService.createReport({
        reporterId: userId,
        ...body
      });
      return { code: 0, msg: '举报成功', data: report };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 获取举报列表(管理后台)
   * GET /api/square/report-list
   */
  @Get('report-list')
  @UseGuards(JwtAuthGuard)
  async getReportList(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('targetType') targetType?: string,
    @Query('reason') reason?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 20;
    const result = await this.reportService.getReportList({
      page: pageNum,
      pageSize: pageSizeNum,
      targetType,
      reason,
      status: status !== undefined && status !== '' ? parseInt(status, 10) : undefined,
    });
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 处理举报
   * POST /api/square/handle-report
   */
  @Post('handle-report')
  @UseGuards(JwtAuthGuard)
  async handleReport(
    @Body() body: {
      reportId: number;
      action: 'accept' | 'ignore';
      measures?: string[];
      banDays?: number;
      remark?: string;
    },
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    try {
      const result = await this.reportService.handleReport(userId, body);
      return { code: 0, msg: '处理成功', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 获取举报目标内容
   * GET /api/square/report-target/:targetType/:targetId
   */
  @Get('report-target/:targetType/:targetId')
  @UseGuards(JwtAuthGuard)
  async getReportTarget(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: number,
  ) {
    try {
      const target = await this.reportService.getReportTarget(targetType, Number(targetId));
      return { code: 0, msg: 'ok', data: target };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  // ===== 自动审核接口(管理后台) =====

  /**
   * 执行批量自动审核
   * POST /api/square/auto-review/batch
   */
  @Post('auto-review/batch')
  @UseGuards(JwtAuthGuard)
  async batchAutoReview(@Body() body: { type: 'post' | 'comment'; limit?: number }) {
    try {
      let result;
      if (body.type === 'post') {
        result = await this.autoReviewService.batchAutoReviewPosts(body.limit || 100);
      } else {
        result = await this.autoReviewService.batchAutoReviewComments(body.limit || 100);
      }
      return { code: 0, msg: '批量自动审核完成', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  // ===== AI官方发帖接口(管理后台) =====

  /**
   * 手动触发AI生成并发布官方帖子
   * POST /api/square/admin/ai-post
   */
  @Post('admin/ai-post')
  @UseGuards(JwtAuthGuard)
  async generateAIPost(
    @Body() body: {
      type: 'market_analysis' | 'agx_update' | 'crypto_news' | 'investment_tips' | 'weekly_summary' | 'product_intro';
      customTopic?: string;
    },
  ) {
    try {
      const result = await this.officialPostService.generateAndPublish(body.type, body.customTopic);
      if (result.success) {
        return { code: 0, msg: 'AI帖子发布成功', data: result.post };
      } else {
        return { code: 1002, msg: result.error || 'AI帖子发布失败', data: null };
      }
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 获取可用的AI帖子类型
   * GET /api/square/admin/ai-post-types
   */
  @Get('admin/ai-post-types')
  @UseGuards(JwtAuthGuard)
  async getAIPostTypes() {
    try {
      const types = this.officialPostService.getAvailableTypes();
      return { code: 0, msg: 'ok', data: types };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 获取最近的官方帖子
   * GET /api/square/admin/official-posts?limit=10
   */
  @Get('admin/official-posts')
  @UseGuards(JwtAuthGuard)
  async getOfficialPosts(@Query('limit') limit: string = '10') {
    try {
      const posts = await this.officialPostService.getRecentOfficialPosts(parseInt(limit, 10) || 10);
      return { code: 0, msg: 'ok', data: posts };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  // ===== 发帖条件配置接口(管理后台) =====

  /**
   * 获取发帖条件配置
   * GET /api/square/admin/post-condition-config
   */
  @Get('admin/post-condition-config')
  @UseGuards(JwtAuthGuard)
  async getPostConditionConfig() {
    try {
      const config = await this.squareService.getPostConditionConfig();
      return { code: 0, msg: 'ok', data: config };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 更新发帖条件配置
   * POST /api/square/admin/post-condition-config
   */
  @Post('admin/post-condition-config')
  @UseGuards(JwtAuthGuard)
  async updatePostConditionConfig(
    @Body() body: {
      enabled?: boolean;
      requireKyc?: boolean;
      minLevel?: number;
      minRegisterDays?: number;
      minRechargeAmount?: number;
      minHoldingAmount?: number;
      minFollowers?: number;
      dailyPostLimit?: number;
      commentEnabled?: boolean;
    },
  ) {
    try {
      const currentConfig = await this.squareService.getPostConditionConfig();

      // 合并配置
      const newConfig: any = {
        ...currentConfig,
        ...body
      };

      await this.squareService.savePostConditionConfig(newConfig);
      return { code: 0, msg: '配置更新成功', data: newConfig };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 获取用户当前等级和升级条件
   * GET /api/square/admin/user-level-info/:userId
   */
  @Get('admin/user-level-info/:userId')
  @UseGuards(JwtAuthGuard)
  async getUserLevelInfo(@Param('userId') userId: number) {
    try {
      const info = await this.squareService.getUserLevelInfo(Number(userId));
      return { code: 0, msg: 'ok', data: info };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  // ===== 新闻采集接口(管理后台) =====

  /**
   * 获取新闻采集状态
   * GET /api/square/admin/news-crawler/status
   */
  @Get('admin/news-crawler/status')
  @UseGuards(JwtAuthGuard)
  async getNewsCrawlerStatus() {
    try {
      const status = this.newsCrawlerService.getStatus();
      return { code: 0, msg: 'ok', data: status };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 手动触发新闻采集
   * POST /api/square/admin/news-crawler/crawl
   */
  @Post('admin/news-crawler/crawl')
  @UseGuards(JwtAuthGuard)
  async triggerNewsCrawl() {
    try {
      const result = await this.newsCrawlerService.manualCrawl();
      if (result.success) {
        return { code: 0, msg: `成功采集并发布${result.count}条新闻`, data: result };
      } else {
        return { code: 1002, msg: result.error || '采集失败', data: null };
      }
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 清空采集缓存（用于测试）
   * POST /api/square/admin/news-crawler/clear-cache
   */
  @Post('admin/news-crawler/clear-cache')
  @UseGuards(JwtAuthGuard)
  async clearNewsCrawlerCache() {
    try {
      this.newsCrawlerService.clearCache();
      return { code: 0, msg: '缓存已清空', data: null };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  // ===== Hedra 视频API代理 =====

  /**
   * 获取Hedra视频列表
   * GET /api/square/videos?type=video
   */
  @Get('videos')
  async getHedraVideos(@Query('type') type: string = 'video') {
    const hedraApiKey = process.env.HEDRA_API_KEY;
    
    if (!hedraApiKey) {
      // 没有配置API key，返回默认视频
      return {
        code: 0,
        msg: 'ok',
        data: [
          {
            id: 'default-intro',
            type: 'video',
            name: 'AGX平台介绍',
            thumbnail_url: '/agx-new.png',
            url: '/videos/agx-intro.mp4',
            description: 'AGX升达金指币 - 全球领先的数字黄金资产平台'
          }
        ]
      };
    }

    try {
      const response = await axios.get('https://api.hedra.com/web-app/public/assets', {
        params: { type },
        headers: {
          'X-API-Key': hedraApiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data) {
        return { code: 0, msg: 'ok', data: response.data };
      }
    } catch (error) {
      console.error('Hedra API error:', error.message);
    }

    return { code: 0, msg: 'ok', data: [] };
  }
}
