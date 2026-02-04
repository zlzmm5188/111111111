import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoinIssue, Coin } from '../../entities';
import { OperationLogService } from '../../common/services/operation-log.service';

/**
 * 新币发行管理服务
 * 金融级别严谨性要求
 */
@Injectable()
export class CoinIssueService {
  private readonly logger = new Logger(CoinIssueService.name);

  constructor(
    @InjectRepository(CoinIssue)
    private readonly coinIssueRepo: Repository<CoinIssue>,
    @InjectRepository(Coin)
    private readonly coinRepo: Repository<Coin>,
    private readonly operationLog: OperationLogService,
  ) {}

  /**
   * 创建新币发行
   */
  async createIssue(
    data: {
      coinSymbol: string;
      coinName: string;
      logo?: string;
      description?: string;
      totalSupply: number;
      issuePrice: number;
      issueAmount: number;
      minBuyAmount: number;
      maxBuyAmount: number;
      startTime: Date;
      endTime: Date;
      lotteryTime: Date;
      unlockTime: Date;
    },
    admin: { id: number; username: string },
    ip?: string,
  ) {
    // 验证数据严谨性
    this.validateIssueData(data);

    // 检查币种是否存在
    const coin = await this.coinRepo.findOne({
      where: { symbol: data.coinSymbol }
    });

    if (!coin) {
      throw new Error(`币种 ${data.coinSymbol} 不存在，请先创建币种`);
    }

    // 检查是否有未结束的发行
    const existing = await this.coinIssueRepo.findOne({
      where: { coinSymbol: data.coinSymbol, status: 1 } // 进行中
    });

    if (existing) {
      throw new Error(`该币种有未结束的发行活动`);
    }

    // 创建发行记录
    const issue = this.coinIssueRepo.create({
      ...data,
      totalSubscribed: 0,
      subscriberCount: 0,
      winRate: null,
      status: 0, // 未开始
    });

    const saved = await this.coinIssueRepo.save(issue);

    // 记录审计日志
    await this.operationLog.logSuccess({
      adminId: admin.id,
      adminUsername: admin.username,
      module: 'coin_issue',
      action: 'create',
      targetType: 'CoinIssue',
      targetId: saved.id,
      newData: saved,
      ip,
    });

    this.logger.log(`新币发行创建成功: ${data.coinSymbol} - ${data.coinName}`);
    return saved;
  }

  /**
   * 更新新币发行
   */
  async updateIssue(
    id: number,
    data: Partial<CoinIssue>,
    admin: { id: number; username: string },
    ip?: string,
  ) {
    const existing = await this.coinIssueRepo.findOne({ where: { id } });
    if (!existing) {
      throw new Error('发行记录不存在');
    }

    // 已开始的发行不允许修改关键字段
    if (existing.status >= 1) {
      const protectedFields = ['issuePrice', 'issueAmount', 'totalSupply', 'startTime', 'endTime', 'lotteryTime'];
      const changedProtectedFields = protectedFields.filter(f => data[f] !== undefined && data[f] !== existing[f]);
      if (changedProtectedFields.length > 0) {
        throw new Error('发行已开始，不允许修改关键参数');
      }
    }

    // 记录变更
    const changes: any = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== existing[key]) {
        changes[key] = { old: existing[key], new: data[key] };
      }
    });

    const updated = await this.coinIssueRepo.save({
      ...existing,
      ...data,
    });

    // 记录审计日志
    await this.operationLog.logSuccess({
      adminId: admin.id,
      adminUsername: admin.username,
      module: 'coin_issue',
      action: 'update',
      targetType: 'CoinIssue',
      targetId: id,
      oldData: existing,
      newData: updated,
      changes,
      ip,
    });

    this.logger.log(`新币发行更新成功: ID=${id}`);
    return updated;
  }

  /**
   * 删除新币发行（仅未开始的可删除）
   */
  async deleteIssue(
    id: number,
    admin: { id: number; username: string },
    ip?: string,
  ) {
    const existing = await this.coinIssueRepo.findOne({ where: { id } });
    if (!existing) {
      throw new Error('发行记录不存在');
    }

    if (existing.status !== 0) {
      throw new Error('只有未开始的发行才能删除');
    }

    await this.coinIssueRepo.remove(existing);

    // 记录审计日志
    await this.operationLog.logSuccess({
      adminId: admin.id,
      adminUsername: admin.username,
      module: 'coin_issue',
      action: 'delete',
      targetType: 'CoinIssue',
      targetId: id,
      oldData: existing,
      ip,
    });

    this.logger.log(`新币发行删除成功: ID=${id}`);
    return { success: true };
  }

  /**
   * 获取发行列表
   */
  async getList(filters: {
    status?: number;
    coinSymbol?: string;
    page?: number;
    pageSize?: number;
  }) {
    const query = this.coinIssueRepo.createQueryBuilder('issue');

    if (filters.status !== undefined) {
      query.andWhere('issue.status = :status', { status: filters.status });
    }
    if (filters.coinSymbol) {
      query.andWhere('issue.coinSymbol = :coinSymbol', { coinSymbol: filters.coinSymbol });
    }

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;

    query
      .orderBy('issue.createdAt', 'DESC')
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

  /**
   * 获取发行详情
   */
  async getDetail(id: number) {
    const issue = await this.coinIssueRepo.findOne({ where: { id } });
    if (!issue) {
      throw new Error('发行记录不存在');
    }
    return issue;
  }

  /**
   * 获取统计数据
   */
  async getStats() {
    // 查询所有预售记录
    const allIssues = await this.coinIssueRepo.find();
    
    // 计算总已售出AGX、总募集USDT、参与人数
    let soldAmount = 0;
    let raisedUsdt = 0;
    let participantCount = 0;

    for (const issue of allIssues) {
      // totalSubscribed 是总申购数量（已售出的AGX数量）
      const subscribed = parseFloat(issue.totalSubscribed?.toString() || '0');
      soldAmount += subscribed;
      
      // 募集金额 = 总申购数量 * 价格
      const price = parseFloat(issue.issuePrice?.toString() || '0');
      raisedUsdt += subscribed * price;
      
      // 累计参与人数
      participantCount += issue.subscriberCount || 0;
    }

    return {
      soldAmount,
      raisedUsdt,
      participants: participantCount,
    };
  }

  /**
   * 验证发行数据
   */
  private validateIssueData(data: any) {
    if (!data.coinSymbol || data.coinSymbol.trim().length === 0) {
      throw new Error('币种符号不能为空');
    }

    if (!data.coinName || data.coinName.trim().length === 0) {
      throw new Error('币种名称不能为空');
    }

    if (data.totalSupply <= 0) {
      throw new Error('总发行量必须大于0');
    }

    if (data.issuePrice <= 0) {
      throw new Error('发行价格必须大于0');
    }

    if (data.issueAmount <= 0 || data.issueAmount > data.totalSupply) {
      throw new Error('本次发行量必须大于0且不超过总发行量');
    }

    if (data.minBuyAmount <= 0) {
      throw new Error('最小申购数量必须大于0');
    }

    if (data.maxBuyAmount < data.minBuyAmount) {
      throw new Error('最大申购数量不能小于最小申购数量');
    }

    if (new Date(data.startTime) >= new Date(data.endTime)) {
      throw new Error('结束时间必须大于开始时间');
    }

    if (new Date(data.lotteryTime) < new Date(data.endTime)) {
      throw new Error('开奖时间不能早于结束时间');
    }

    if (new Date(data.unlockTime) < new Date(data.lotteryTime)) {
      throw new Error('解锁时间不能早于开奖时间');
    }
  }
}
