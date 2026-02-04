import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, Comment, ReviewLog } from '../../entities';
import { SensitiveWordService } from './sensitive-word.service';

/**
 * 自动审核服务
 * 用于自动审核帖子和评论内容
 */
@Injectable()
export class AutoReviewService {
  private readonly logger = new Logger(AutoReviewService.name);

  // 黑名单关键词列表(可以配置到数据库)
  private readonly blacklistKeywords = [
    '赌博', '色情', '暴力', '恐怖', '反动', '政治',
    '毒品', '枪支', '诈骗', '洗钱', '黑客', '病毒'
  ];

  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(ReviewLog)
    private reviewLogRepository: Repository<ReviewLog>,
    private sensitiveWordService: SensitiveWordService,
  ) {}

  /**
   * 自动审核帖子内容
   */
  async autoReviewPost(postId: number): Promise<{ needManualReview: boolean; reason?: string }> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new Error('帖子不存在');
    }

    // 1. 检查黑名单关键词
    const blacklistCheck = this.checkBlacklist(post.content);
    if (blacklistCheck.matched) {
      // 直接拒绝
      post.status = -1;
      post.reviewRemark = `包含黑名单关键词: ${blacklistCheck.keywords.join(', ')}`;
      await this.postRepository.save(post);

      // 记录审核日志
      await this.createReviewLog({
        reviewType: 'post',
        reviewerId: 0, // 系统自动审核
        targetType: 'post',
        targetId: postId,
        action: 'reject',
        reason: post.reviewRemark,
        remark: '自动审核拒绝'
      });

      return { needManualReview: false, reason: post.reviewRemark };
    }

    // 2. 检查敏感词
    const sensitiveCheck = await this.sensitiveWordService.checkSensitiveWords(post.content);
    if (sensitiveCheck.hasSensitive) {
      // 需要人工审核
      return {
        needManualReview: true,
        reason: `包含敏感词: ${sensitiveCheck.matchedWords.join(', ')}`
      };
    }

    // 3. 检查内容长度(过短的内容可能是垃圾信息)
    if (post.content.length < 5) {
      return {
        needManualReview: true,
        reason: '内容过短，建议人工审核'
      };
    }

    // 4. 检查是否包含大量特殊字符
    const specialCharRatio = this.calculateSpecialCharRatio(post.content);
    if (specialCharRatio > 0.3) {
      return {
        needManualReview: true,
        reason: '包含大量特殊字符，建议人工审核'
      };
    }

    // 5. 检查是否包含大量重复字符
    if (this.hasExcessiveRepetition(post.content)) {
      return {
        needManualReview: true,
        reason: '包含大量重复内容，可能是垃圾信息'
      };
    }

    // 6. 检查是否包含网址链接(可能是广告)
    if (this.hasUrl(post.content)) {
      return {
        needManualReview: true,
        reason: '包含网址链接，建议人工审核'
      };
    }

    // 通过所有自动审核规则，自动通过
    post.status = 1;
    post.reviewRemark = '自动审核通过';
    await this.postRepository.save(post);

    // 记录审核日志
    await this.createReviewLog({
      reviewType: 'post',
      reviewerId: 0, // 系统自动审核
      targetType: 'post',
      targetId: postId,
      action: 'approve',
      reason: '自动审核通过',
      remark: '内容符合规范'
    });

    return { needManualReview: false };
  }

  /**
   * 自动审核评论内容
   */
  async autoReviewComment(commentId: number): Promise<{ needManualReview: boolean; reason?: string }> {
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new Error('评论不存在');
    }

    // 1. 检查黑名单关键词
    const blacklistCheck = this.checkBlacklist(comment.content);
    if (blacklistCheck.matched) {
      // 直接删除
      comment.status = -1;
      await this.commentRepository.save(comment);

      // 记录审核日志
      await this.createReviewLog({
        reviewType: 'comment',
        reviewerId: 0,
        targetType: 'comment',
        targetId: commentId,
        action: 'delete',
        reason: `包含黑名单关键词: ${blacklistCheck.keywords.join(', ')}`,
        remark: '自动审核删除'
      });

      return { needManualReview: false, reason: '包含黑名单关键词' };
    }

    // 2. 检查敏感词
    const sensitiveCheck = await this.sensitiveWordService.checkSensitiveWords(comment.content);
    if (sensitiveCheck.hasSensitive) {
      // 需要人工审核
      return {
        needManualReview: true,
        reason: `包含敏感词: ${sensitiveCheck.matchedWords.join(', ')}`
      };
    }

    // 3. 检查是否包含大量重复字符
    if (this.hasExcessiveRepetition(comment.content)) {
      return {
        needManualReview: true,
        reason: '包含大量重复内容，可能是垃圾信息'
      };
    }

    // 4. 检查是否包含网址链接
    if (this.hasUrl(comment.content)) {
      return {
        needManualReview: true,
        reason: '包含网址链接，建议人工审核'
      };
    }

    // 通过所有自动审核规则，自动通过
    comment.status = 1;
    await this.commentRepository.save(comment);

    // 记录审核日志
    await this.createReviewLog({
      reviewType: 'comment',
      reviewerId: 0,
      targetType: 'comment',
      targetId: commentId,
      action: 'approve',
      reason: '自动审核通过',
      remark: '内容符合规范'
    });

    return { needManualReview: false };
  }

  /**
   * 检查黑名单关键词
   */
  private checkBlacklist(text: string): { matched: boolean; keywords: string[] } {
    const matchedKeywords = [];
    for (const keyword of this.blacklistKeywords) {
      if (text.includes(keyword)) {
        matchedKeywords.push(keyword);
      }
    }

    return {
      matched: matchedKeywords.length > 0,
      keywords: matchedKeywords
    };
  }

  /**
   * 计算特殊字符比例
   */
  private calculateSpecialCharRatio(text: string): number {
    const specialChars = text.match(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g);
    if (!specialChars) return 0;
    return specialChars.length / text.length;
  }

  /**
   * 检查是否有过度重复
   */
  private hasExcessiveRepetition(text: string): boolean {
    // 检查是否有连续重复的字符或词组
    const patterns = [
      /(.)\1{4,}/, // 5个以上连续相同字符
      /(.{2,})\1{3,}/, // 4次以上重复的词组
    ];

    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 检查是否包含URL
   */
  private hasUrl(text: string): boolean {
    const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?(:\d{1,5})?(\/[^\s]*)?)/gi;
    return urlPattern.test(text);
  }

  /**
   * 批量自动审核待审核帖子
   */
  async batchAutoReviewPosts(limit: number = 100): Promise<{ processed: number; manual: number; approved: number; rejected: number }> {
    const posts = await this.postRepository.find({
      where: { status: 0 }, // 待审核
      take: limit,
      order: { createdAt: 'ASC' }
    });

    let processed = 0;
    let manual = 0;
    let approved = 0;
    let rejected = 0;

    for (const post of posts) {
      try {
        const result = await this.autoReviewPost(post.id);
        processed++;
        
        if (result.needManualReview) {
          manual++;
        } else {
          if (post.status === 1) {
            approved++;
          } else {
            rejected++;
          }
        }
      } catch (error) {
        this.logger.error(`自动审核帖子 ${post.id} 失败:`, error);
      }
    }

    return { processed, manual, approved, rejected };
  }

  /**
   * 批量自动审核待审核评论
   */
  async batchAutoReviewComments(limit: number = 100): Promise<{ processed: number; manual: number; approved: number; rejected: number }> {
    const comments = await this.commentRepository.find({
      where: { status: 0 }, // 待审核
      take: limit,
      order: { createdAt: 'ASC' }
    });

    let processed = 0;
    let manual = 0;
    let approved = 0;
    let rejected = 0;

    for (const comment of comments) {
      try {
        const result = await this.autoReviewComment(comment.id);
        processed++;
        
        if (result.needManualReview) {
          manual++;
        } else {
          if (comment.status === 1) {
            approved++;
          } else {
            rejected++;
          }
        }
      } catch (error) {
        this.logger.error(`自动审核评论 ${comment.id} 失败:`, error);
      }
    }

    return { processed, manual, approved, rejected };
  }

  /**
   * 创建审核日志
   */
  private async createReviewLog(data: {
    reviewType: string;
    reviewerId: number;
    targetType: string;
    targetId: number;
    action: string;
    reason?: string;
    remark?: string;
  }) {
    const log = this.reviewLogRepository.create(data);
    return await this.reviewLogRepository.save(log);
  }
}
