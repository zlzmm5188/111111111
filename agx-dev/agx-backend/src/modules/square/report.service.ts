import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, Post, Comment, User, ReviewLog } from '../../entities';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
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

  private safeOptionalInt(value: any): number | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? undefined : parsed;
  }

  /**
   * 创建举报
   */
  async createReport(data: {
    reporterId: number;
    targetType: string;
    targetId: number;
    reason: string;
    description?: string;
  }) {
    // 检查是否重复举报
    const existingReport = await this.reportRepository.findOne({
      where: {
        reporterId: data.reporterId,
        targetType: data.targetType,
        targetId: data.targetId,
        status: 0 // 待处理
      }
    });

    if (existingReport) {
      throw new Error('您已经举报过该内容，请等待处理');
    }

    const report = this.reportRepository.create(data);
    return await this.reportRepository.save(report);
  }

  /**
   * 获取举报列表
   */
  async getReportList(params: {
    page?: number;
    pageSize?: number;
    targetType?: string;
    reason?: string;
    status?: number;
  }) {
    const page = this.safeInt(params.page, 1);
    const pageSize = this.safeInt(params.pageSize, 20);
    const status = this.safeOptionalInt(params.status);
    const { targetType, reason } = params;
    
    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter');

    if (targetType) {
      queryBuilder.andWhere('report.targetType = :targetType', { targetType });
    }

    if (reason) {
      queryBuilder.andWhere('report.reason = :reason', { reason });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('report.status = :status', { status });
    }

    const [list, total] = await queryBuilder
      .orderBy('report.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  /**
   * 处理举报
   */
  async handleReport(userId: number, data: {
    reportId: number;
    action: 'accept' | 'ignore';
    measures?: string[];
    banDays?: number;
    remark?: string;
  }) {
    // 检查用户权限
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      throw new Error('权限不足，无法处理举报');
    }

    // 获取举报
    const report = await this.reportRepository.findOne({ where: { id: data.reportId } });
    if (!report) {
      throw new Error('举报不存在');
    }

    if (report.status !== 0) {
      throw new Error('该举报已经处理过了');
    }

    // 更新举报状态
    report.status = data.action === 'accept' ? 1 : -1;
    report.handlerId = userId;
    report.action = data.action;
    report.measures = data.measures ? JSON.stringify(data.measures) : null;
    report.remark = data.remark;
    report.handledAt = new Date();

    await this.reportRepository.save(report);

    // 如果接受举报，执行相应的处理措施
    if (data.action === 'accept' && data.measures && data.measures.length > 0) {
      await this.executeMeasures(report, data.measures, data.banDays);
    }

    // 记录审核日志
    await this.createReviewLog({
      reviewType: 'report',
      reviewerId: userId,
      targetType: report.targetType,
      targetId: report.targetId,
      action: data.action,
      reason: `举报处理: ${data.action === 'accept' ? '接受' : '忽略'}`,
      remark: data.remark
    });

    return { success: true, report };
  }

  /**
   * 执行处理措施
   */
  private async executeMeasures(report: Report, measures: string[], banDays?: number) {
    // 删除内容
    if (measures.includes('delete')) {
      if (report.targetType === 'post') {
        await this.postRepository.update(report.targetId, { status: -1 });
      } else if (report.targetType === 'comment') {
        await this.commentRepository.update(report.targetId, { status: -1 });
      }
    }

    // 封禁用户
    if (measures.includes('ban_user')) {
      let targetUserId: number;
      
      if (report.targetType === 'post') {
        const post = await this.postRepository.findOne({ where: { id: report.targetId } });
        targetUserId = post?.userId;
      } else if (report.targetType === 'comment') {
        const comment = await this.commentRepository.findOne({ where: { id: report.targetId } });
        targetUserId = comment?.userId;
      } else if (report.targetType === 'user') {
        targetUserId = report.targetId;
      }

      if (targetUserId) {
        const banUntil = new Date();
        banUntil.setDate(banUntil.getDate() + (banDays || 7));
        await this.userRepository.update(targetUserId, {
          status: 0
          // bannedUntil: banUntil // 如果User实体有此字段请取消注释
        });
      }
    }

    // 警告用户
    if (measures.includes('warning')) {
      // 这里可以发送系统通知给用户
      // 暂时不实现具体逻辑
    }
  }

  /**
   * 获取举报目标内容
   */
  async getReportTarget(targetType: string, targetId: number) {
    if (targetType === 'post') {
      return await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .where('post.id = :targetId', { targetId })
        .getOne();
    } else if (targetType === 'comment') {
      return await this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.author', 'author')
        .where('comment.id = :targetId', { targetId })
        .getOne();
    } else if (targetType === 'user') {
      return await this.userRepository.findOne({ where: { id: targetId } });
    }

    return null;
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