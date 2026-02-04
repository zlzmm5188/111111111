import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Comment, User, ReviewLog } from '../../entities';

@Injectable()
export class CommentReviewService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ReviewLog)
    private reviewLogRepository: Repository<ReviewLog>,
  ) {}

  private safeInt(value: any, defaultValue: number): number {
    if (value === undefined || value === null || value === '') return defaultValue;
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * 获取待审核评论列表
   */
  async getPendingComments(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    userId?: number;
    postId?: number;
  }) {
    const page = this.safeInt(params.page, 1);
    const pageSize = this.safeInt(params.pageSize, 20);
    const { keyword, userId, postId } = params;
    
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .where('comment.status = :status', { status: 0 }); // 待审核

    if (keyword) {
      queryBuilder.andWhere('comment.content LIKE :keyword', { keyword: `%${keyword}%` });
    }

    if (userId) {
      queryBuilder.andWhere('comment.userId = :userId', { userId });
    }

    if (postId) {
      queryBuilder.andWhere('comment.postId = :postId', { postId });
    }

    const [list, total] = await queryBuilder
      .orderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  /**
   * 审核评论
   */
  async reviewComment(userId: number, commentId: number, action: 'approve' | 'delete') {
    // 检查用户权限
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      throw new Error('权限不足，无法审核评论');
    }

    // 获取评论
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new Error('评论不存在');
    }

    // 根据审核操作更新评论状态
    switch (action) {
      case 'approve':
        comment.status = 1; // 正常
        break;
      case 'delete':
        comment.status = -1; // 已删除
        break;
      default:
        throw new Error('无效的审核操作');
    }

    await this.commentRepository.save(comment);

    // 记录审核日志
    await this.createReviewLog({
      reviewType: 'comment',
      reviewerId: userId,
      targetType: 'comment',
      targetId: commentId,
      action,
      reason: action === 'approve' ? '审核通过' : '审核删除'
    });

    return { success: true, comment };
  }

  /**
   * 批量审核评论
   */
  async batchReviewComments(userId: number, commentIds: number[], action: 'approve' | 'delete') {
    // 检查用户权限
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      throw new Error('权限不足，无法审核评论');
    }

    // 获取需要审核的评论
    const comments = await this.commentRepository.find({
      where: { id: In(commentIds) }
    });

    const results = [];
    for (const comment of comments) {
      // 更新评论状态
      switch (action) {
        case 'approve':
          comment.status = 1; // 正常
          break;
        case 'delete':
          comment.status = -1; // 已删除
          break;
      }

      await this.commentRepository.save(comment);

      // 记录审核日志
      await this.createReviewLog({
        reviewType: 'comment',
        reviewerId: userId,
        targetType: 'comment',
        targetId: comment.id,
        action,
        reason: action === 'approve' ? '批量审核通过' : '批量删除'
      });

      results.push({ commentId: comment.id, status: comment.status });
    }

    return { success: true, results };
  }

  /**
   * 获取评论详情
   */
  async getCommentDetail(commentId: number) {
    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .where('comment.id = :commentId', { commentId })
      .getOne();

    if (!comment) {
      throw new Error('评论不存在');
    }

    return comment;
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
