import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationLog } from '../../entities/operation-log.entity';

export interface LogOptions {
  adminId: number;
  adminUsername: string;
  module: string;
  action: string;
  targetType: string;
  targetId?: number;
  oldData?: any;
  newData?: any;
  changes?: any;
  ip?: string;
  userAgent?: string;
  environment?: string;
  error?: any;
}

/**
 * 操作审计日志服务
 */
@Injectable()
export class OperationLogService {
  private readonly logger = new Logger(OperationLogService.name);

  constructor(
    @InjectRepository(OperationLog)
    private readonly logRepo: Repository<OperationLog>,
  ) {}

  /**
   * 记录操作日志
   */
  async log(options: LogOptions): Promise<OperationLog> {
    try {
      const log = this.logRepo.create({
        adminId: options.adminId,
        adminUsername: options.adminUsername,
        module: options.module,
        action: options.action,
        targetType: options.targetType,
        targetId: options.targetId,
        oldData: options.oldData ? JSON.stringify(options.oldData) : null,
        newData: options.newData ? JSON.stringify(options.newData) : null,
        changes: options.changes ? JSON.stringify(options.changes) : null,
        ip: options.ip || '0.0.0.0',
        userAgent: options.userAgent || '',
        environment: options.environment || process.env.NODE_ENV || 'dev',
        status: options.error ? 0 : 1,
        error: options.error ? JSON.stringify(options.error) : null,
      });

      const saved = await this.logRepo.save(log);

      // 同时记录到应用日志
      this.logger.log(
        `[${options.module}:${options.action}] Admin:${options.adminUsername} ` +
        `Target:${options.targetType}${options.targetId ? '#' + options.targetId : ''} ` +
        `${options.error ? 'FAILED' : 'SUCCESS'}`
      );

      return saved;
    } catch (error) {
      this.logger.error('Failed to save operation log:', error);
      throw error;
    }
  }

  /**
   * 记录成功操作
   */
  async logSuccess(options: Omit<LogOptions, 'error'>): Promise<OperationLog> {
    return this.log(options);
  }

  /**
   * 记录失败操作
   */
  async logFailure(options: LogOptions): Promise<OperationLog> {
    return this.log(options);
  }

  /**
   * 查询操作日志
   */
  async queryLogs(filters: {
    adminId?: number;
    module?: string;
    action?: string;
    targetType?: string;
    targetId?: number;
    status?: number;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    pageSize?: number;
  }) {
    const query = this.logRepo.createQueryBuilder('log');

    if (filters.adminId) {
      query.andWhere('log.adminId = :adminId', { adminId: filters.adminId });
    }
    if (filters.module) {
      query.andWhere('log.module = :module', { module: filters.module });
    }
    if (filters.action) {
      query.andWhere('log.action = :action', { action: filters.action });
    }
    if (filters.targetType) {
      query.andWhere('log.targetType = :targetType', { targetType: filters.targetType });
    }
    if (filters.targetId) {
      query.andWhere('log.targetId = :targetId', { targetId: filters.targetId });
    }
    if (filters.status !== undefined) {
      query.andWhere('log.status = :status', { status: filters.status });
    }
    if (filters.startDate) {
      query.andWhere('log.createdAt >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      query.andWhere('log.createdAt <= :endDate', { endDate: filters.endDate });
    }

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 50;

    query
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
