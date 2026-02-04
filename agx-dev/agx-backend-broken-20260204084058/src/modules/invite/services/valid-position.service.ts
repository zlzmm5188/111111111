import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PoolHolding } from '../../../entities/pool-holding.entity';
import { PoolProduct } from '../../../entities/pool-product.entity';
import { UserInvite } from '../../../entities/user-invite.entity';
import { UserProductCommissionStats } from '../../../entities/user-product-commission-stats.entity';
import { CommissionTier } from '../../../entities/commission-tier.entity';
import { UserTask } from '../../../entities/user-task.entity';
import { DecimalCalculatorService } from '../../../common/services/decimal-calculator.service';

/**
 * 有效建仓判定服务
 *
 * 业务规则：
 * 1. 有效用户 = 建仓用户 + 完成新人任务
 * 2. 建仓判定：有任意理财持仓记录
 * 3. 新人任务：4个任务全部完成（status=2）
 * 4. 历史完成过一次即可，永久有效
 * 5. 同一用户只计1次，不重复计数
 * 6. 返佣比例按有效用户总数计算（5档位）
 */
@Injectable()
export class ValidPositionService {
  // 新人任务数量（4个任务全部完成才算有效用户）
  private readonly REQUIRED_TASKS = ['kyc', 'bindAddress', 'readWhitepaper', 'shareInvite'];

  constructor(
    @InjectRepository(PoolHolding)
    private poolHoldingRepo: Repository<PoolHolding>,
    @InjectRepository(PoolProduct)
    private poolProductRepo: Repository<PoolProduct>,
    @InjectRepository(UserInvite)
    private userInviteRepo: Repository<UserInvite>,
    @InjectRepository(UserProductCommissionStats)
    private userProductStatsRepo: Repository<UserProductCommissionStats>,
    @InjectRepository(CommissionTier)
    private commissionTierRepo: Repository<CommissionTier>,
    @InjectRepository(UserTask)
    private userTaskRepo: Repository<UserTask>,
    private decimalCalculator: DecimalCalculatorService,
  ) {}

  /**
   * 判断用户是否为有效用户
   *
   * 判定标准（需同时满足）：
   * 1. 用户有建仓记录（任意理财持仓）
   * 2. 用户完成所有新人任务（4个任务全部status=2）
   *
   * @param userId 用户ID
   * @returns 是否为有效用户
   */
  async isValidUser(userId: number): Promise<boolean> {
    // 条件1：检查是否有建仓记录
    const hasHolding = await this.poolHoldingRepo
      .createQueryBuilder('h')
      .where('h.user_id = :userId', { userId })
      .andWhere('h.amount > 0')
      .getOne();

    if (!hasHolding) {
      return false;
    }

    // 条件2：检查是否完成所有新人任务
    const completedTasks = await this.userTaskRepo
      .createQueryBuilder('t')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.task_key IN (:...taskKeys)', { taskKeys: this.REQUIRED_TASKS })
      .andWhere('t.status = 2') // status=2 表示已领取（任务完成）
      .getCount();

    return completedTasks >= this.REQUIRED_TASKS.length;
  }

  /**
   * 获取用户的有效直邀建仓人数
   *
   * 统计规则：
   * 1. 只统计直邀用户（level = 1）
   * 2. 去重：同一用户只计1次
   * 3. 永久有效：历史达成过即永久计入
   *
   * @param inviterId 邀请人ID
   * @returns 有效直邀建仓人数
   */
  async getValidInviteeCount(inviterId: number): Promise<number> {
    // 获取所有直邀用户
    const invitees = await this.userInviteRepo.find({
      where: { inviterId, level: 1 },
    });

    if (invitees.length === 0) {
      return 0;
    }

    // 逐个检查是否为有效建仓用户
    let validCount = 0;
    for (const invitee of invitees) {
      const isValid = await this.isValidUser(invitee.userId);
      if (isValid) {
        validCount++;
      }
    }

    return validCount;
  }

  /**
   * 批量获取用户的有效直邀建仓人数
   *
   * @param inviterIds 邀请人ID数组
   * @returns Map<inviterId, validCount>
   */
  async getBatchValidInviteeCount(
    inviterIds: number[],
  ): Promise<Map<number, number>> {
    const result = new Map<number, number>();

    for (const inviterId of inviterIds) {
      const count = await this.getValidInviteeCount(inviterId);
      result.set(inviterId, count);
    }

    return result;
  }

  /**
   * 判断用户是否已达最高返佣档位（30%）
   *
   * 5档位规则：
   * - 1-3人：3%
   * - 4-9人：8%
   * - 10-15人：12%
   * - 16-25人：18%
   * - 26人及以上：30%
   *
   * @param inviterId 邀请人ID
   * @returns 是否已达最高档位
   */
  async isMaxLevel(inviterId: number): Promise<boolean> {
    const count = await this.getValidInviteeCount(inviterId);
    return count >= 26;
  }

  /**
   * 获取用户当前返佣比例
   * 
   * 5档位规则：
   * - 1-3人：3%
   * - 4-9人：8%
   * - 10-15人：12%
   * - 16-25人：18%
   * - 26人及以上：30%
   *
   * @param inviterId 邀请人ID
   * @returns 返佣比例（小数，如 0.12 = 12%）
   */
  async getCommissionRate(inviterId: number): Promise<number> {
    const count = await this.getValidInviteeCount(inviterId);
    return this.getRateByCount(count);
  }

  /**
   * 根据有效用户数获取返佣比例
   */
  private getRateByCount(count: number): number {
    if (count >= 26) return 0.30; // 30%
    if (count >= 16) return 0.18; // 18%
    if (count >= 10) return 0.12; // 12%
    if (count >= 4) return 0.08;  // 8%
    if (count >= 1) return 0.03;  // 3%
    return 0;                      // 0人时无返佣
  }

  /**
   * 获取用户下一档位所需有效人数
   *
   * @param inviterId 邀请人ID
   * @returns 下一档所需人数，如果已达最高档则返回 null
   */
  async getNextLevelThreshold(inviterId: number): Promise<number | null> {
    const count = await this.getValidInviteeCount(inviterId);

    if (count >= 26) return null; // 已达最高档
    if (count >= 16) return 26;   // 下档需要26人
    if (count >= 10) return 16;   // 下档需要16人
    if (count >= 4) return 10;    // 下档需要10人
    if (count >= 1) return 4;     // 下档需要4人
    return 1;                      // 下档需要1人
  }

  /**
   * 获取用户当前等级信息
   *
   * @param inviterId 邀请人ID
   * @returns 等级信息
   */
  async getLevelInfo(inviterId: number): Promise<{
    level: number;
    levelName: string;
    commissionRate: number;
    validInviteeCount: number;
    nextLevelThreshold: number | null;
    isMaxLevel: boolean;
  }> {
    const count = await this.getValidInviteeCount(inviterId);
    const rate = this.getRateByCount(count);
    const nextThreshold = await this.getNextLevelThreshold(inviterId);
    const isMax = count >= 26;

    // 根据人数确定等级（5档）
    let level = 0;
    let levelName = '新手';

    if (count >= 26) {
      level = 5;
      levelName = '主权合伙人';
    } else if (count >= 16) {
      level = 4;
      levelName = '执行官合伙人';
    } else if (count >= 10) {
      level = 3;
      levelName = '资本合伙人';
    } else if (count >= 4) {
      level = 2;
      levelName = '优选会员';
    } else if (count >= 1) {
      level = 1;
      levelName = '启蒙会员';
    }

    return {
      level,
      levelName,
      commissionRate: rate,
      validInviteeCount: count,
      nextLevelThreshold: nextThreshold,
      isMaxLevel: isMax,
    };
  }

  /**
   * 计算进度百分比（当前档位）
   *
   * @param inviterId 邀请人ID
   * @returns 当前进度百分比（0-100）
   */
  async getProgressPercent(inviterId: number): Promise<number> {
    const count = await this.getValidInviteeCount(inviterId);
    const nextThreshold = await this.getNextLevelThreshold(inviterId);

    if (nextThreshold === null) {
      return 100; // 已达最高档
    }

    // 计算当前档位起始人数
    let currentLevelStart = 0;
    if (count >= 16) currentLevelStart = 16;
    else if (count >= 10) currentLevelStart = 10;
    else if (count >= 4) currentLevelStart = 4;
    else if (count >= 1) currentLevelStart = 1;

    // 计算进度
    const progress = ((count - currentLevelStart) / (nextThreshold - currentLevelStart)) * 100;
    return Math.min(100, Math.max(0, progress));
  }

  // ========== 简化的返佣方法（不再按产品单独计算） ==========

  /**
   * 根据有效人数获取返佣比例
   * 直接使用5档位规则，不再查数据库
   */
  async getCommissionRateByCount(validCount: number): Promise<number> {
    return this.getRateByCount(validCount);
  }

  /**
   * 获取返佣阶梯配置（用于前端显示）
   */
  getCommissionTiers(): Array<{ minInvites: number; maxInvites: number | null; commissionRate: number; description: string }> {
    return [
      { minInvites: 1, maxInvites: 3, commissionRate: 0.03, description: '1-3人建仓 - 3%' },
      { minInvites: 4, maxInvites: 9, commissionRate: 0.08, description: '4-9人建仓 - 8%' },
      { minInvites: 10, maxInvites: 15, commissionRate: 0.12, description: '10-15人建仓 - 12%' },
      { minInvites: 16, maxInvites: 25, commissionRate: 0.18, description: '16-25人建仓 - 18%' },
      { minInvites: 26, maxInvites: null, commissionRate: 0.30, description: '26人以上 - 30%' },
    ];
  }
}