import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, FindManyOptions, In, MoreThanOrEqual } from 'typeorm';
import { Post, Comment, Like, Follow, Topic, User, SensitiveWord, PostReview, Config, Kyc, Wallet, MemberLevel } from '../../entities';
import { SensitiveWordService } from './sensitive-word.service';

/**
 * 发帖条件配置接口
 */
export interface PostConditionConfig {
  enabled: boolean;           // 是否启用发帖条件
  requireKyc: boolean;        // 是否需要KYC认证
  minLevel: number;           // 最低会员等级（默认3级）
  minRegisterDays: number;    // 最少注册天数
  minRechargeAmount: number;  // 最低充值金额（USDT）
  minHoldingAmount: number;   // 最低持仓金额（USDT）
  minFollowers: number;       // 最少粉丝数
  dailyPostLimit: number;     // 每日发帖上限（0为不限制）
  commentEnabled: boolean;    // 是否允许评论
}

/**
 * 广场服务
 * 提供帖子、评论、点赞、关注等功能
 */
@Injectable()
export class SquareService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SensitiveWord)
    private sensitiveWordRepository: Repository<SensitiveWord>,
    @InjectRepository(PostReview)
    private postReviewRepository: Repository<PostReview>,
    @InjectRepository(Config)
    private configRepository: Repository<Config>,
    @InjectRepository(Kyc)
    private kycRepository: Repository<Kyc>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(MemberLevel)
    private memberLevelRepository: Repository<MemberLevel>,
    private readonly sensitiveWordService: SensitiveWordService,
  ) {}

  /**
   * 安全解析整数参数，避免 NaN
   */
  private safeInt(value: any, defaultValue: number): number {
    if (value === undefined || value === null || value === '') return defaultValue;
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * 安全解析可选整数参数
   */
  private safeOptionalInt(value: any): number | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? undefined : parsed;
  }

  // ===== 发帖条件配置管理 =====

  /**
   * 获取发帖条件配置
   */
  async getPostConditionConfig(): Promise<PostConditionConfig> {
    const config = await this.configRepository.findOne({
      where: { configKey: 'post_condition' }
    });
    
    if (config) {
      try {
        return JSON.parse(config.configValue);
      } catch (e) {
        // 配置格式错误，返回默认配置
      }
    }
    
    // 默认配置：不限制
    return {
      enabled: false,
      requireKyc: false,
      minLevel: 3,
      minRegisterDays: 0,
      minRechargeAmount: 0,
      minHoldingAmount: 0,
      minFollowers: 0,
      dailyPostLimit: 0,
      commentEnabled: true
    };
  }

  /**
   * 保存发帖条件配置
   */
  async savePostConditionConfig(config: PostConditionConfig): Promise<PostConditionConfig> {
    const existing = await this.configRepository.findOne({
      where: { configKey: 'post_condition' }
    });
    
    if (existing) {
      existing.configValue = JSON.stringify(config);
      await this.configRepository.save(existing);
    } else {
      await this.configRepository.save({
        configKey: 'post_condition',
        configValue: JSON.stringify(config),
        description: '发帖条件配置',
        configGroup: 'square'
      });
    }
    
    return config;
  }

  /**
   * 检查用户是否满足发帖条件
   */
  async checkPostCondition(userId: number): Promise<{ canPost: boolean; reason?: string }> {
    const config = await this.getPostConditionConfig();

    // 未启用条件检查
    if (!config.enabled) {
      return { canPost: true };
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return { canPost: false, reason: '用户不存在' };
    }

    // 检查会员等级
    if (config.minLevel > 0) {
      const userLevel = user.level || 1;
      if (userLevel < config.minLevel) {
        return { canPost: false, reason: `需要达到${config.minLevel}级会员才能发帖，您当前${userLevel}级` };
      }
    }

    // 检查KYC
    if (config.requireKyc) {
      const kyc = await this.kycRepository.findOne({
        where: { userId, status: 1 }  // status=1 为已通过
      });
      if (!kyc) {
        return { canPost: false, reason: '需要完成KYC认证后才能发帖' };
      }
    }

    // 检查注册天数
    if (config.minRegisterDays > 0) {
      const registerDate = new Date(user.createdAt);
      const daysSinceRegister = Math.floor((Date.now() - registerDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceRegister < config.minRegisterDays) {
        return { canPost: false, reason: `注册满${config.minRegisterDays}天后才能发帖，您还需等待${config.minRegisterDays - daysSinceRegister}天` };
      }
    }

    // 检查持仓金额
    if (config.minHoldingAmount > 0) {
      const wallets = await this.walletRepository.find({ where: { userId } });
      const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0);
      if (totalBalance < config.minHoldingAmount) {
        return { canPost: false, reason: `账户余额需达到${config.minHoldingAmount}USDT才能发帖` };
      }
    }

    // 检查粉丝数
    if (config.minFollowers > 0) {
      if ((user.followerCount || 0) < config.minFollowers) {
        return { canPost: false, reason: `需要${config.minFollowers}个粉丝才能发帖` };
      }
    }

    // 检查每日发帖上限
    if (config.dailyPostLimit > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayPostCount = await this.postRepository.count({
        where: {
          userId,
          createdAt: MoreThanOrEqual(today)
        }
      });
      if (todayPostCount >= config.dailyPostLimit) {
        return { canPost: false, reason: `今日发帖已达上限${config.dailyPostLimit}条` };
      }
    }

    return { canPost: true };
  }

  /**
   * 检查用户是否可以评论
   */
  async checkCommentCondition(userId: number): Promise<{ canComment: boolean; reason?: string }> {
    const config = await this.getPostConditionConfig();

    // 检查评论开关
    if (!config.commentEnabled) {
      return { canComment: false, reason: '评论功能已关闭' };
    }

    // 未启用条件检查，允许评论
    if (!config.enabled) {
      return { canComment: true };
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return { canComment: false, reason: '用户不存在' };
    }

    // 检查会员等级
    if (config.minLevel > 0) {
      const userLevel = user.level || 1;
      if (userLevel < config.minLevel) {
        return { canComment: false, reason: `需要达到${config.minLevel}级会员才能评论，您当前${userLevel}级` };
      }
    }

    return { canComment: true };
  }

  /**
   * 获取帖子列表
   */
  async getPosts(tab: string = 'recommend', userId?: number, page: number = 1, pageSize: number = 20) {
    // 确保 page 和 pageSize 是数字
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    
    const query = this.postRepository.createQueryBuilder('post')
      .where('post.status = :status', { status: 1 })
      .andWhere('post.deletedAt IS NULL');

    // 根据tab筛选
    switch (tab) {
      case 'hot':
        query.orderBy('post.likeCount', 'DESC');
        break;
      case 'follow':
      case 'following':
        if (userId) {
          // 获取用户关注的人
          const followingIds = await this.getFollowingIds(userId);
          if (followingIds.length > 0) {
            query.andWhere('post.userId IN (:...followingIds)', { followingIds });
          } else {
            return { list: [], total: 0 };
          }
        } else {
          return { list: [], total: 0 };
        }
        query.orderBy('post.createdAt', 'DESC');
        break;
      case 'official':
        // 官方帖子：isOfficial=1
        query.andWhere('post.isOfficial = :isOfficial', { isOfficial: 1 });
        query.orderBy('post.createdAt', 'DESC');
        break;
      case 'news':
        query.andWhere('post.type = :type', { type: 'news' });
        query.orderBy('post.createdAt', 'DESC');
        break;
      default:
        // 推荐：置顶优先，然后按热度+时间混合排序
        query.orderBy('post.isTop', 'DESC')
          .addOrderBy('post.isHot', 'DESC')
          .addOrderBy('post.createdAt', 'DESC');
    }

    const total = await query.getCount();
    const list = await query
      .skip((pageNum - 1) * pageSizeNum)
      .take(pageSizeNum)
      .getMany();

    // 如果数据库为空，返回mock数据
    if (list.length === 0) {
      return { list: this.getMockPosts(), total: 10 };
    }

    // 格式化帖子数据，解析 images JSON 字符串
    const formattedList = await Promise.all(list.map(async (post) => {
      // 获取用户信息
      const user = await this.userRepository.findOne({
        where: { id: post.userId },
        select: ['id', 'nickname', 'username', 'avatar']
      });

      // 解析 images 字段
      let parsedImages: string[] = [];
      if (post.images) {
        try {
          parsedImages = JSON.parse(post.images);
        } catch (e) {
          parsedImages = [];
        }
      }

      return {
        ...post,
        images: parsedImages,
        user: user ? {
          id: user.id,
          nickname: user.nickname || user.username,
          username: user.username,
          avatar: user.avatar
        } : null
      };
    }));

    return { list: formattedList, total };
  }

  /**
   * 获取帖子详情
   */
  async getPost(postId: number, userId?: number) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      return null;
    }

    // 增加浏览量
    await this.postRepository.increment({ id: postId }, 'viewCount', 1);

    // 检查当前用户是否点赞
    let isLiked = false;
    if (userId) {
      const like = await this.likeRepository.findOne({
        where: { userId, targetType: 'post', targetId: postId }
      });
      isLiked = !!like;
    }

    // 获取用户信息
    const user = await this.userRepository.findOne({
      where: { id: post.userId },
      select: ['id', 'nickname', 'username', 'avatar']
    });

    // 解析 images 字段
    let parsedImages: string[] = [];
    if (post.images) {
      try {
        parsedImages = JSON.parse(post.images);
      } catch (e) {
        parsedImages = [];
      }
    }

    return {
      ...post,
      images: parsedImages,
      isLiked,
      user: user ? {
        id: user.id,
        nickname: user.nickname || user.username,
        username: user.username,
        avatar: user.avatar
      } : null
    };
  }

  /**
   * 发布帖子
   */
  async createPost(userId: number, content: string, images?: string[], topic?: string, type?: string, videoUrl?: string) {
    // 检查敏感词
    const { hasSensitive, matchedWords } = await this.sensitiveWordService.checkSensitiveWords(content);
    if (hasSensitive) {
      // 根据敏感词级别决定是否自动通过审核
      const sensitiveWords = await this.sensitiveWordRepository.find({
        where: { word: In(matchedWords) }
      });
      
      const highestLevel = Math.max(...sensitiveWords.map(w => w.level));
      
      // 如果包含级别为2（禁止）的敏感词，则直接设为审核中状态
      if (highestLevel === 2) {
        // 内容包含禁止词汇，需要人工审核
        const post = this.postRepository.create({
          userId,
          content,
          images: images ? JSON.stringify(images) : null,
          topic,
          type: type || 'normal',
          status: 0, // 审核中
          mediaType: videoUrl ? 'video' : (images && images.length > 0 ? 'image' : 'text'),
          videoUrl: videoUrl || null,
        });

        await this.postRepository.save(post);
        return post;
      }
    }

    // 内容通过敏感词检测，直接发布
    const post = this.postRepository.create({
      userId,
      content,
      images: images ? JSON.stringify(images) : null,
      topic,
      type: type || 'normal',
      status: 1, // 直接发布
      mediaType: videoUrl ? 'video' : (images && images.length > 0 ? 'image' : 'text'),
      videoUrl: videoUrl || null,
    });

    await this.postRepository.save(post);

    // 更新用户帖子数
    await this.userRepository.increment({ id: userId }, 'postCount', 1);

    // 更新话题帖子数
    if (topic) {
      await this.updateTopicCount(topic);
    }

    return post;
  }

  /**
   * 点赞/取消点赞
   */
  async toggleLike(userId: number, targetType: 'post' | 'comment', targetId: number) {
    const existing = await this.likeRepository.findOne({
      where: { userId, targetType, targetId }
    });

    if (existing) {
      // 取消点赞
      await this.likeRepository.remove(existing);
      
      if (targetType === 'post') {
        await this.postRepository.decrement({ id: targetId }, 'likeCount', 1);
      } else {
        await this.commentRepository.decrement({ id: targetId }, 'likeCount', 1);
      }
      
      return { liked: false };
    } else {
      // 添加点赞
      const like = this.likeRepository.create({ userId, targetType, targetId });
      await this.likeRepository.save(like);
      
      if (targetType === 'post') {
        await this.postRepository.increment({ id: targetId }, 'likeCount', 1);
      } else {
        await this.commentRepository.increment({ id: targetId }, 'likeCount', 1);
      }
      
      return { liked: true };
    }
  }

  /**
   * 发表评论
   */
  async createComment(userId: number, postId: number, content: string, parentId?: number, replyToUserId?: number) {
    // 检查敏感词
    const { hasSensitive } = await this.sensitiveWordService.checkSensitiveWords(content);
    if (hasSensitive) {
      throw new Error('评论内容包含敏感词汇，请修改后重新发布');
    }

    const comment = this.commentRepository.create({
      postId,
      userId,
      content,
      parentId: parentId || null,
      replyToUserId: replyToUserId || null,
      status: 1,
    });

    await this.commentRepository.save(comment);

    // 更新帖子评论数
    await this.postRepository.increment({ id: postId }, 'commentCount', 1);

    return comment;
  }

  /**
   * 获取评论列表
   */
  async getComments(postId: number, page: number = 1, pageSize: number = 20) {
    const [list, total] = await this.commentRepository.findAndCount({
      where: { postId, status: 1, parentId: IsNull() },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  /**
   * 关注/取消关注
   */
  async toggleFollow(userId: number, targetUserId: number) {
    if (userId === targetUserId) {
      throw new Error('不能关注自己');
    }

    const existing = await this.followRepository.findOne({
      where: { userId, followUserId: targetUserId }
    });

    if (existing) {
      // 取消关注
      await this.followRepository.remove(existing);
      await this.userRepository.decrement({ id: userId }, 'followingCount', 1);
      await this.userRepository.decrement({ id: targetUserId }, 'followerCount', 1);
      return { followed: false };
    } else {
      // 添加关注
      const follow = this.followRepository.create({ userId, followUserId: targetUserId });
      await this.followRepository.save(follow);
      await this.userRepository.increment({ id: userId }, 'followingCount', 1);
      await this.userRepository.increment({ id: targetUserId }, 'followerCount', 1);
      return { followed: true };
    }
  }

  /**
   * 获取热门话题
   */
  async getHotTopics(limit: number = 10) {
    const takeLimit = Number(limit) || 10;
    const topics = await this.topicRepository.find({
      where: { status: 1 },
      order: { isHot: 'DESC', postCount: 'DESC', sortOrder: 'ASC' },
      take: takeLimit,
    });

    if (topics.length === 0) {
      return this.getMockTopics();
    }

    return topics;
  }

  // ===== 辅助方法 =====

  private async getFollowingIds(userId: number): Promise<number[]> {
    const follows = await this.followRepository.find({
      where: { userId },
      select: ['followUserId'],
    });
    return follows.map(f => f.followUserId);
  }

  private async updateTopicCount(tag: string) {
    const topic = await this.topicRepository.findOne({ where: { tag } });
    if (topic) {
      await this.topicRepository.increment({ id: topic.id }, 'postCount', 1);
    } else {
      // 创建新话题
      const newTopic = this.topicRepository.create({ tag, postCount: 1, status: 1 });
      await this.topicRepository.save(newTopic);
    }
  }

  // ===== Mock 数据 =====

  private getMockPosts() {
    return [
      {
        id: 1,
        userId: 1,
        content: 'BTC突破10万美元大关！牛市正式开启，下一个目标15万。建议大家持有现货，不要轻易追高。注意风险控制，合理分配仓位。',
        images: null,
        topic: 'BTC',
        type: 'normal',
        viewCount: 12580,
        likeCount: 2568,
        commentCount: 386,
        shareCount: 128,
        isTop: 0,
        isHot: 1,
        isOfficial: 0,
        status: 1,
        mediaType: 'text',
        videoUrl: null,
        createdAt: new Date(Date.now() - 2 * 3600000),
        author: { id: 1, nickname: '币圈大V', avatar: null, isVerified: 1, userTag: '大V' }
      },
      {
        id: 2,
        userId: 2,
        content: '【重磅公告】AGX 升达金指币即将开启首发认购！100% 黄金储备支撑，首发价 $0.10，限时限量，先到先得！',
        images: null,
        topic: 'AGX',
        type: 'news',
        viewCount: 25600,
        likeCount: 1256,
        commentCount: 234,
        shareCount: 89,
        isTop: 1,
        isHot: 1,
        isOfficial: 1,
        status: 1,
        mediaType: 'text',
        videoUrl: null,
        createdAt: new Date(Date.now() - 30 * 60000),
        author: { id: 2, nickname: 'AGX官方', avatar: null, isVerified: 1, userTag: '官方' }
      },
      {
        id: 3,
        userId: 3,
        content: '今日交易策略：苹果回调至175-178区间可以考虑建仓，止损设在170，目标看到190。仅供参考，投资有风险。',
        images: null,
        topic: null,
        type: 'analysis',
        viewCount: 5680,
        likeCount: 1235,
        commentCount: 89,
        shareCount: 45,
        isTop: 0,
        isHot: 0,
        isOfficial: 0,
        status: 1,
        mediaType: 'text',
        videoUrl: null,
        createdAt: new Date(Date.now() - 5 * 3600000),
        author: { id: 3, nickname: '量化策略', avatar: null, isVerified: 1, userTag: '策略' }
      }
    ];
  }

  private getMockTopics() {
    return [
      { id: 1, tag: 'BTC突码10万', icon: '🔥', postCount: 125000, isHot: 1 },
      { id: 2, tag: 'ETH生态', icon: '💎', postCount: 82000, isHot: 1 },
      { id: 3, tag: '美股全线上涨', icon: '📈', postCount: 68000, isHot: 1 },
      { id: 4, tag: '原油期货', icon: '⛽', postCount: 51000, isHot: 0 },
      { id: 5, tag: '黄金新高', icon: '🥇', postCount: 43000, isHot: 1 },
    ];
  }

  // ===== 管理后台帖子管理 =====

  /**
   * 获取所有帖子列表（管理后台）
   */
  async getAllPosts(options: {
    page?: number;
    pageSize?: number;
    status?: number;
    isTop?: number;
    isHot?: number;
    isOfficial?: number;
    userId?: number;
    keyword?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const {
      page = 1,
      pageSize = 20,
      status,
      isTop,
      isHot,
      isOfficial,
      userId,
      keyword,
      startDate,
      endDate
    } = options;

    const query = this.postRepository.createQueryBuilder('post')
      .where('post.deletedAt IS NULL');

    // 状态筛选
    if (status !== undefined) {
      query.andWhere('post.status = :status', { status });
    }

    // 置顶筛选
    if (isTop !== undefined) {
      query.andWhere('post.isTop = :isTop', { isTop });
    }

    // 热门筛选
    if (isHot !== undefined) {
      query.andWhere('post.isHot = :isHot', { isHot });
    }

    // 官方筛选
    if (isOfficial !== undefined) {
      query.andWhere('post.isOfficial = :isOfficial', { isOfficial });
    }

    // 用户ID筛选
    if (userId) {
      query.andWhere('post.userId = :userId', { userId });
    }

    // 关键词搜索
    if (keyword) {
      query.andWhere('post.content ILIKE :keyword', { keyword: `%${keyword}%` });
    }

    // 时间范围筛选
    if (startDate) {
      query.andWhere('post.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('post.createdAt <= :endDate', { endDate });
    }

    // 排序：置顶优先，然后按创建时间倒序
    query.orderBy('post.isTop', 'DESC')
      .addOrderBy('post.createdAt', 'DESC');

    const total = await query.getCount();
    const list = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // 查询用户信息
    const userIds = [...new Set(list.map(p => p.userId))];
    if (userIds.length > 0) {
      const users = await this.userRepository.find({ where: { id: In(userIds) } });
      const userMap = new Map(users.map(u => [u.id, u]));
      list.forEach((p: any) => {
        const user = userMap.get(p.userId);
        p.author = user ? {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
        } : null;
      });
    }

    return { list, total };
  }

  /**
   * 设置/取消置顶帖子
   */
  async setPostTop(postId: number, isTop: boolean): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new Error('帖子不存在');
    }
    post.isTop = isTop ? 1 : 0;
    return await this.postRepository.save(post);
  }

  /**
   * 设置/取消热门帖子
   */
  async setPostHot(postId: number, isHot: boolean): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new Error('帖子不存在');
    }
    post.isHot = isHot ? 1 : 0;
    return await this.postRepository.save(post);
  }

  /**
   * 设置/取消官方帖子
   */
  async setPostOfficial(postId: number, isOfficial: boolean): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new Error('帖子不存在');
    }
    post.isOfficial = isOfficial ? 1 : 0;
    return await this.postRepository.save(post);
  }

  /**
   * 设置帖子权重
   */
  async setPostWeight(postId: number, weight: number): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new Error('帖子不存在');
    }
    post.weight = weight;
    return await this.postRepository.save(post);
  }

  /**
   * 删除帖子（软删除）
   */
  async deletePost(postId: number): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new Error('帖子不存在');
    }
    await this.postRepository.softDelete(postId);
    // 减少用户帖子数
    await this.userRepository.decrement({ id: post.userId }, 'postCount', 1);
  }

  /**
   * 下架帖子
   */
  async offlinePost(postId: number, reason?: string): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new Error('帖子不存在');
    }
    post.status = -1; // 已下架
    post.reviewRemark = reason || '管理员下架';
    return await this.postRepository.save(post);
  }

  /**
   * 恢复帖子
   */
  async restorePost(postId: number): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new Error('帖子不存在');
    }
    post.status = 1; // 正常
    return await this.postRepository.save(post);
  }

  /**
   * 批量设置帖子状态
   */
  async batchSetPostStatus(
    postIds: number[],
    action: 'top' | 'untop' | 'hot' | 'unhot' | 'official' | 'unofficial' | 'offline' | 'restore' | 'delete'
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const postId of postIds) {
      try {
        switch (action) {
          case 'top':
            await this.setPostTop(postId, true);
            break;
          case 'untop':
            await this.setPostTop(postId, false);
            break;
          case 'hot':
            await this.setPostHot(postId, true);
            break;
          case 'unhot':
            await this.setPostHot(postId, false);
            break;
          case 'official':
            await this.setPostOfficial(postId, true);
            break;
          case 'unofficial':
            await this.setPostOfficial(postId, false);
            break;
          case 'offline':
            await this.offlinePost(postId);
            break;
          case 'restore':
            await this.restorePost(postId);
            break;
          case 'delete':
            await this.deletePost(postId);
            break;
        }
        success++;
      } catch (e) {
        failed++;
      }
    }

    return { success, failed };
  }

  // ===== 话题管理 =====

  /**
   * 获取所有话题列表（管理后台）
   */
  async getAllTopics(options: {
    page?: number;
    pageSize?: number;
    status?: number;
    isHot?: number;
    keyword?: string;
  }) {
    const page = this.safeInt(options.page, 1);
    const pageSize = this.safeInt(options.pageSize, 50);
    const status = this.safeOptionalInt(options.status);
    const isHot = this.safeOptionalInt(options.isHot);
    const { keyword } = options;

    const query = this.topicRepository.createQueryBuilder('topic');

    if (status !== undefined) {
      query.andWhere('topic.status = :status', { status });
    }

    if (isHot !== undefined) {
      query.andWhere('topic.isHot = :isHot', { isHot });
    }

    if (keyword) {
      query.andWhere('topic.tag ILIKE :keyword', { keyword: `%${keyword}%` });
    }

    query.orderBy('topic.sortOrder', 'DESC')
      .addOrderBy('topic.postCount', 'DESC');

    const total = await query.getCount();
    const list = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return { list, total };
  }

  /**
   * 创建话题
   */
  async createTopic(data: {
    tag: string;
    icon?: string;
    description?: string;
    isHot?: number;
    sortOrder?: number;
  }): Promise<Topic> {
    // 检查话题是否已存在
    const existing = await this.topicRepository.findOne({ where: { tag: data.tag } });
    if (existing) {
      throw new Error('话题已存在');
    }

    const topic = this.topicRepository.create({
      tag: data.tag,
      icon: data.icon || null,
      description: data.description || null,
      isHot: data.isHot || 0,
      sortOrder: data.sortOrder || 0,
      status: 1,
      postCount: 0,
      viewCount: 0,
    });

    return await this.topicRepository.save(topic);
  }

  /**
   * 更新话题
   */
  async updateTopic(id: number, data: {
    tag?: string;
    icon?: string;
    description?: string;
    isHot?: number;
    sortOrder?: number;
    status?: number;
  }): Promise<Topic> {
    const topic = await this.topicRepository.findOne({ where: { id } });
    if (!topic) {
      throw new Error('话题不存在');
    }

    // 如果修改了tag，检查是否重复
    if (data.tag && data.tag !== topic.tag) {
      const existing = await this.topicRepository.findOne({ where: { tag: data.tag } });
      if (existing) {
        throw new Error('话题名称已存在');
      }
    }

    Object.assign(topic, data);
    return await this.topicRepository.save(topic);
  }

  /**
   * 删除话题
   */
  async deleteTopic(id: number): Promise<void> {
    const topic = await this.topicRepository.findOne({ where: { id } });
    if (!topic) {
      throw new Error('话题不存在');
    }
    await this.topicRepository.delete(id);
  }

  /**
   * 设置话题热门状态
   */
  async setTopicHot(id: number, isHot: boolean): Promise<Topic> {
    const topic = await this.topicRepository.findOne({ where: { id } });
    if (!topic) {
      throw new Error('话题不存在');
    }
    topic.isHot = isHot ? 1 : 0;
    return await this.topicRepository.save(topic);
  }

  /**
   * 设置话题状态
   */
  async setTopicStatus(id: number, status: number): Promise<Topic> {
    const topic = await this.topicRepository.findOne({ where: { id } });
    if (!topic) {
      throw new Error('话题不存在');
    }
    topic.status = status;
    return await this.topicRepository.save(topic);
  }

  /**
   * 获取用户等级信息和升级条件
   */
  async getUserLevelInfo(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('用户不存在');
    }

    const currentLevel = user.level || 1;
    const totalRecharge = parseFloat(user.totalRecharge || '0');

    // 获取所有等级配置
    const levels = await this.memberLevelRepository.find({
      where: { isEnabled: 1 },
      order: { level: 'ASC' },
    });

    // 当前等级配置
    const currentLevelConfig = levels.find(l => l.level === currentLevel) || levels[0];

    // 下一等级配置
    const nextLevelConfig = levels.find(l => l.level > currentLevel);

    // 计算升级还需要多少
    let needMore = '0';
    let nextLevel = null;

    if (nextLevelConfig) {
      const need = parseFloat(nextLevelConfig.minRecharge) - totalRecharge;
      needMore = need > 0 ? need.toFixed(2) : '0';
      nextLevel = {
        level: nextLevelConfig.level,
        name: nextLevelConfig.name,
        minRecharge: nextLevelConfig.minRecharge,
        needMore
      };
    }

    return {
      currentLevel,
      totalRecharge: totalRecharge.toFixed(2),
      currentLevelConfig: {
        level: currentLevelConfig.level,
        name: currentLevelConfig.name,
        icon: currentLevelConfig.icon || '',
        color: currentLevelConfig.color || '#848E9C',
        minRecharge: currentLevelConfig.minRecharge,
        feeDiscount: currentLevelConfig.feeDiscount || '1.00',
        benefits: currentLevelConfig.benefits || ''
      },
      nextLevel,
      allLevels: levels.map(l => ({
        level: l.level,
        name: l.name,
        icon: l.icon || '',
        color: l.color || '#848E9C',
        minRecharge: l.minRecharge,
        feeDiscount: l.feeDiscount || '1.00'
      }))
    };
  }
}
