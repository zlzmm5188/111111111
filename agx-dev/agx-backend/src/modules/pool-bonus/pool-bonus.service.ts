import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PoolBonusConfig,
  PoolCommissionConfig,
  PoolRepurchaseConfig,
  PoolGlobalConfig,
  PoolHolding,
  PoolProduct,
  User,
  UserLevel,
} from '../../entities';

/**
 * 矿池增值功能服务
 */
@Injectable()
export class PoolBonusService {
  constructor(
    @InjectRepository(PoolBonusConfig)
    private readonly bonusConfigRepo: Repository<PoolBonusConfig>,
    @InjectRepository(PoolCommissionConfig)
    private readonly commissionConfigRepo: Repository<PoolCommissionConfig>,
    @InjectRepository(PoolRepurchaseConfig)
    private readonly repurchaseConfigRepo: Repository<PoolRepurchaseConfig>,
    @InjectRepository(PoolGlobalConfig)
    private readonly globalConfigRepo: Repository<PoolGlobalConfig>,
    @InjectRepository(PoolHolding)
    private readonly holdingRepo: Repository<PoolHolding>,
    @InjectRepository(PoolProduct)
    private readonly productRepo: Repository<PoolProduct>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserLevel)
    private readonly userLevelRepo: Repository<UserLevel>,
  ) {}

  // ==================== 红包计算 ====================

  /**
   * 计算红包金额
   */
  async calculateRedpacket(productId: number, amount: number): Promise<{ amount: number; coin: string }> {
    const config = await this.bonusConfigRepo.findOne({ where: { productId } });
    if (!config || !config.redpacketAmount || parseFloat(config.redpacketAmount.toString()) === 0) {
      return { amount: 0, coin: 'USDT' };
    }

    let redpacketAmount = 0;
    if (config.redpacketType === 'fixed') {
      redpacketAmount = parseFloat(config.redpacketAmount.toString());
    } else if (config.redpacketType === 'percent') {
      const percent = parseFloat(config.redpacketPercent.toString());
      redpacketAmount = (amount * percent) / 100;
    }

    return { amount: redpacketAmount, coin: config.redpacketCoin };
  }

  // ==================== 合约分红计算 ====================

  /**
   * 计算合约分红金额
   */
  async calculateDividend(productId: number, principal: number): Promise<{ amount: number; coin: string }> {
    const config = await this.bonusConfigRepo.findOne({ where: { productId } });
    if (!config || !config.dividendAmount || parseFloat(config.dividendAmount.toString()) === 0) {
      return { amount: 0, coin: 'USDT' };
    }

    let dividendAmount = 0;
    if (config.dividendType === 'fixed') {
      dividendAmount = parseFloat(config.dividendAmount.toString());
    } else if (config.dividendType === 'percent') {
      const percent = parseFloat(config.dividendPercent.toString());
      dividendAmount = (principal * percent) / 100;
    }

    return { amount: dividendAmount, coin: config.dividendCoin };
  }

  // ==================== 层级返利计算 ====================

  /**
   * 计算层级返利
   */
  async calculateCommission(
    productId: number,
    dailyIncome: number,
    inviterIds: number[],
  ): Promise<Array<{ userId: number; level: number; amount: number }>> {
    const config = await this.commissionConfigRepo.findOne({ where: { productId } });
    if (!config) return [];

    const commissions = [];
    const percents = [
      parseFloat(config.level1Percent.toString()),
      parseFloat(config.level2Percent.toString()),
      parseFloat(config.level3Percent.toString()),
    ];

    for (let i = 0; i < Math.min(inviterIds.length, config.maxCommissionLevels); i++) {
      const userId = inviterIds[i];
      const percent = percents[i];
      if (userId && percent > 0) {
        const amount = (dailyIncome * percent) / 100;
        commissions.push({ userId, level: i + 1, amount });
      }
    }

    return commissions;
  }

  // ==================== 复购补贴计算 ====================

  /**
   * 计算复购补贴
   */
  async calculateRepurchase(userId: number, amount: number, productType: string): Promise<{ amount: number; coin: string }> {
    const config = await this.repurchaseConfigRepo.findOne({ where: { } });
    if (!config || config.status !== 1) {
      return { amount: 0, coin: 'USDT' };
    }

    // 检查用户是否是新手
    const user = await this.holdingRepo
      .createQueryBuilder('h')
      .where('h.userId = :userId', { userId })
      .andWhere('h.status = 1')
      .getCount();

    const isNewbie = user === 0;
    if (isNewbie && config.excludeNewbieDays > 0) {
      // 检查注册时间
      // TODO: 需要用户表中的注册时间字段
      return { amount: 0, coin: 'USDT' };
    }

    // 检查持有项目数量
    const holdingCount = await this.holdingRepo
      .createQueryBuilder('h')
      .where('h.userId = :userId', { userId })
      .andWhere('h.status = 1')
      .getCount();

    if (config.minHoldingCount > 0 && holdingCount < config.minHoldingCount) {
      return { amount: 0, coin: 'USDT' };
    }

    // 检查是否有到期项目
    if (config.requireExpired === 1) {
      const hasExpired = await this.holdingRepo
        .createQueryBuilder('h')
        .where('h.userId = :userId', { userId })
        .andWhere('h.endAt IS NOT NULL')
        .andWhere('h.endAt <= :now', { now: new Date() })
        .getCount();

      if (hasExpired === 0) {
        return { amount: 0, coin: 'USDT' };
      }
    }

    // 计算补贴
    if (config.percentEnabled === 1) {
      const percent = parseFloat(config.repurchasePercent.toString());
      const subsidyAmount = (amount * percent) / 100;
      return { amount: subsidyAmount, coin: config.fixedCoin || 'USDT' };
    } else {
      const subsidyAmount = parseFloat(config.fixedAmount.toString());
      return { amount: subsidyAmount, coin: config.fixedCoin || 'USDT' };
    }
  }

  // ==================== 智能增益计算 ====================

  /**
   * 计算智能增益（基于会员等级的加成返利）
   */
  async calculateSmartBoost(userId: number, baseRate: number): Promise<{ baseRate: number; boostRate: number; finalRate: number }> {
    // 获取用户等级
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return { baseRate, boostRate: 0, finalRate: baseRate };
    }

    // 获取等级配置
    const levelConfig = await this.userLevelRepo.findOne({ where: { level: user.level } });
    if (!levelConfig) {
      return { baseRate, boostRate: 0, finalRate: baseRate };
    }

    // 解析加成比例
    const benefits = typeof levelConfig.benefits === 'string'
      ? JSON.parse(levelConfig.benefits)
      : levelConfig.benefits;

    const boostRate = parseFloat(benefits.pool_rate_bonus || 0);
    const finalRate = baseRate + boostRate;

    return {
      baseRate,
      boostRate,
      finalRate,
    };
  }

  // ==================== 经验值计算 ====================

  /**
   * 计算购买经验值
   */
  async calculateExp(productId: number, amount: number): Promise<number> {
    const globalConfig = await this.getGlobalConfig();

    // 基础经验：1U = 1经验
    let exp = Math.floor(amount);

    // 如果开启双倍经验
    if (globalConfig.doubleExpEnabled === 1) {
      const now = new Date();
      const startTime = globalConfig.doubleExpStartTime;
      const endTime = globalConfig.doubleExpEndTime;

      if (startTime && endTime && now >= startTime && now <= endTime) {
        exp *= 2; // 双倍经验
      }
    }

    return exp;
  }

  // ==================== 配置管理 ====================

  /**
   * 获取产品增值配置
   */
  async getBonusConfig(productId: number) {
    const bonusConfig = await this.bonusConfigRepo.findOne({ where: { productId } });
    const commissionConfig = await this.commissionConfigRepo.findOne({ where: { productId } });

    return {
      bonus: bonusConfig,
      commission: commissionConfig,
    };
  }

  /**
   * 更新产品增值配置
   */
  async updateBonusConfig(productId: number, dto: any) {
    let config = await this.bonusConfigRepo.findOne({ where: { productId } });

    if (config) {
      Object.assign(config, dto);
      await this.bonusConfigRepo.save(config);
    } else {
      const newConfig = {
        productId,
        ...(dto as any),
      };
      await this.bonusConfigRepo.insert(newConfig);
    }

    return {};
  }

  /**
   * 更新层级返利配置
   */
  async updateCommissionConfig(productId: number, dto: any) {
    let config = await this.commissionConfigRepo.findOne({ where: { productId } });

    if (config) {
      Object.assign(config, dto);
      await this.commissionConfigRepo.save(config);
    } else {
      const newConfig = {
        productId,
        ...(dto as any),
      };
      await this.commissionConfigRepo.insert(newConfig);
    }

    return {};
  }

  /**
   * 获取全局配置
   */
  async getGlobalConfig() {
    let config = await this.globalConfigRepo.findOne({ where: {} });
    if (!config) {
      config = this.globalConfigRepo.create({
        doubleExpEnabled: 0,
      });
      await this.globalConfigRepo.save(config);
    }
    return config;
  }

  /**
   * 更新全局配置
   */
  async updateGlobalConfig(data: any) {
    const config = await this.getGlobalConfig();
    Object.assign(config, data);
    await this.globalConfigRepo.save(config);
    return {};
  }

  /**
   * 获取复购补贴配置
   */
  async getRepurchaseConfig() {
    let config = await this.repurchaseConfigRepo.findOne({ where: {} });
    if (!config) {
      config = this.repurchaseConfigRepo.create({
        status: 1,
      });
      await this.repurchaseConfigRepo.save(config);
    }
    return config;
  }

  /**
   * 更新复购补贴配置
   */
  async updateRepurchaseConfig(data: any) {
    const config = await this.getRepurchaseConfig();
    Object.assign(config, data);
    await this.repurchaseConfigRepo.save(config);
    return {};
  }
}
