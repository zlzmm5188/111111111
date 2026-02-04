import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, PoolIncome, Commission } from '../../entities';

/**
 * 福利服务
 * 提供分红、红包、返利、积分等福利功能
 */
@Injectable()
export class WelfareService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(PoolIncome)
    private readonly poolIncomeRepo: Repository<PoolIncome>,
    @InjectRepository(Commission)
    private readonly commissionRepo: Repository<Commission>,
  ) {}

  /**
   * 获取福利统计
   */
  async getStats(userId: number) {
    // 获取用户的矿池收益作为分红
    const dividendResult = await this.poolIncomeRepo
      .createQueryBuilder('pi')
      .select('COALESCE(SUM(pi.amount), 0)', 'total')
      .where('pi.userId = :userId', { userId })
      .getRawOne();

    // 获取返佣统计
    const rebateResult = await this.commissionRepo
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.amount), 0)', 'total')
      .where('c.userId = :userId', { userId })
      .getRawOne();

    return {
      totalDividend: parseFloat(dividendResult?.total || '0'),
      redpacketCount: 0, // 红包功能暂未实现
      totalRebate: parseFloat(rebateResult?.total || '0'),
      points: 0, // 积分功能暂未实现
    };
  }

  /**
   * 获取分红记录（矿池收益）
   */
  async getDividends(userId: number, page: number, pageSize: number) {
    const [list, total] = await this.poolIncomeRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: list.map(item => ({
        id: item.id,
        amount: item.amount,
        type: 'pool_income',
        typeName: '矿池收益',
        createdAt: item.createdAt,
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取红包列表
   */
  async getRedpackets(userId: number) {
    // 红包功能暂未实现，返回空列表
    return [];
  }

  /**
   * 领取红包
   */
  async claimRedpacket(userId: number, redpacketId: number) {
    // 红包功能暂未实现
    return { code: 1, msg: '暂无可领取的红包', data: null };
  }

  /**
   * 获取返利记录
   */
  async getRebates(userId: number, page: number, pageSize: number) {
    const [list, total] = await this.commissionRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: list.map(item => ({
        id: item.id,
        amount: item.amount,
        type: item.sourceType,
        typeName: this.getCommissionTypeName(item.sourceType),
        fromUserId: item.fromUserId,
        createdAt: item.createdAt,
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取积分历史
   */
  async getPointsHistory(userId: number, page: number, pageSize: number) {
    // 积分功能暂未实现，返回空列表
    return {
      list: [],
      total: 0,
      page,
      pageSize,
    };
  }

  /**
   * 获取返佣类型名称
   */
  private getCommissionTypeName(type: string): string {
    const typeMap = {
      pool: '矿池返佣',
      trade: '交易返佣',
      ieo: 'IEO返佣',
      invite: '邀请奖励',
    };
    return typeMap[type] || '返佣';
  }
}
