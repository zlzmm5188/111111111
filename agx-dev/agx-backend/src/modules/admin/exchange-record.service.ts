import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRecord } from '../../entities';
import { OperationLogService } from '../../common/services/operation-log.service';

/**
 * 兑换记录管理服务
 */
@Injectable()
export class ExchangeRecordService {
  private readonly logger = new Logger(ExchangeRecordService.name);

  constructor(
    @InjectRepository(ExchangeRecord)
    private readonly exchangeRepo: Repository<ExchangeRecord>,
    private readonly operationLog: OperationLogService,
  ) {}

  /**
   * 获取兑换记录列表
   */
  async getRecords(filters: {
    userId?: number;
    exchangeType?: string;
    status?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) {
    const query = this.exchangeRepo.createQueryBuilder('record')
      .leftJoinAndSelect('record.user', 'user');

    if (filters.userId) {
      query.andWhere('record.userId = :userId', { userId: filters.userId });
    }
    if (filters.exchangeType) {
      query.andWhere('record.exchangeType = :exchangeType', {
        exchangeType: filters.exchangeType,
      });
    }
    if (filters.status !== undefined) {
      query.andWhere('record.status = :status', { status: filters.status });
    }
    if (filters.startDate && filters.endDate) {
      query.andWhere('record.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;

    query
      .orderBy('record.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    // 汇总统计
    const stats = await this.exchangeRepo
      .createQueryBuilder('record')
      .select([
        'record.exchangeType',
        'COUNT(*) as count',
        'SUM(record.toAmount) as totalAmount',
        'SUM(record.feeAmount) as totalFee',
      ])
      .where('record.status = :status', { status: 1 })
      .groupBy('record.exchangeType')
      .getRawMany();

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      summary: stats,
    };
  }

  /**
   * 获取兑换详情
   */
  async getDetail(id: number) {
    const record = await this.exchangeRepo
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.user', 'user')
      .where('record.id = :id', { id })
      .getOne();

    if (!record) {
      throw new Error('记录不存在');
    }

    return record;
  }

  /**
   * 导出兑换记录
   */
  async exportRecords(filters: {
    userId?: number;
    exchangeType?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const query = this.exchangeRepo.createQueryBuilder('record')
      .leftJoinAndSelect('record.user', 'user')
      .where('record.status = :status', { status: 1 });

    if (filters.userId) {
      query.andWhere('record.userId = :userId', { userId: filters.userId });
    }
    if (filters.exchangeType) {
      query.andWhere('record.exchangeType = :exchangeType', {
        exchangeType: filters.exchangeType,
      });
    }
    if (filters.startDate && filters.endDate) {
      query.andWhere('record.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    const records = await query
      .orderBy('record.createdAt', 'DESC')
      .limit(10000) // 限制导出数量
      .getMany();

    return records;
  }
}
