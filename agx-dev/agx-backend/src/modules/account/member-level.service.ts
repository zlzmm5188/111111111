import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, DataSource } from 'typeorm';
import { MemberLevel, User, Wallet } from '../../entities';
import { LevelBonusLog } from '../../entities/level-bonus-log.entity';

export interface LevelInfo {
  level: number;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  rebateRate: string;
  feeDiscount: string;
  benefits: string;
  minRecharge: string;
  // 用户累计充值（经验值，1U=1点）
  totalExperience?: string;
  // 积分和VIP等级
  totalPoints?: string;
  vipLevel?: number;
  // 升达主权会员新增字段
  upgradeBonus?: string;
  poolRateBonus?: string;
  freeWithdrawDays?: number;
  withdrawPriority?: number;
  contractEnabled?: number;
  newCoinPriority?: number;
  vipSupport?: number;
  ticketPriority?: number;
  withdrawFeeFree?: number;
  nextLevel?: {
    level: number;
    name: string;
    minRecharge: string;
    needMore: string;
  };
}

@Injectable()
export class MemberLevelService {
  private readonly logger = new Logger(MemberLevelService.name);

  constructor(
    @InjectRepository(MemberLevel)
    private readonly levelRepo: Repository<MemberLevel>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(LevelBonusLog)
    private readonly bonusLogRepo: Repository<LevelBonusLog>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 获取所有等级配置
   */
  async getAllLevels(): Promise<MemberLevel[]> {
    return this.levelRepo.find({
      where: { isEnabled: 1 },
      order: { level: 'ASC' },
    });
  }

  /**
   * 根据充值金额计算等级
   */
  async calculateLevel(totalExperience: string | number): Promise<number> {
    const experience = parseFloat(String(totalExperience)) || 0;
    
    const levels = await this.levelRepo.find({
      where: { isEnabled: 1 },
      order: { minRecharge: 'DESC' },
    });

    for (const level of levels) {
      if (experience >= parseFloat(level.minRecharge)) {
        return level.level;
      }
    }

    return 0; // 默认等级（启蒙会员）
  }

  /**
   * 获取用户等级信息
   */
  async getUserLevelInfo(userId: number): Promise<LevelInfo> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('用户不存在');
    }

    const totalExperience = parseFloat(user.totalExperience || '0');
    const experiencePoints = parseFloat(user.experiencePoints || '0');
    const vipLevel = user.vipLevel || 0;
    const currentLevel = user.level || 1;

    // 获取当前等级配置
    let levelConfig = await this.levelRepo.findOne({
      where: { level: currentLevel, isEnabled: 1 },
    });

    // 如果没找到，获取默认等级
    if (!levelConfig) {
      levelConfig = await this.levelRepo.findOne({
        where: { level: 1, isEnabled: 1 },
      });
    }

    // 如果还是没有，返回默认配置
    if (!levelConfig) {
      // 根据积分返回VIP等级信息
      return {
        level: vipLevel,
        name: this.getVipLevelName(vipLevel),
        nameEn: this.getVipLevelNameEn(vipLevel),
        icon: 'shield',
        color: this.getVipLevelColor(vipLevel),
        rebateRate: '0',
        feeDiscount: '1',
        benefits: '',
        minRecharge: '0',
        totalExperience: totalExperience.toFixed(2),
        totalPoints: experiencePoints.toFixed(2),
        vipLevel: vipLevel,
      };
    }

    const result: LevelInfo = {
      level: levelConfig.level,
      name: levelConfig.name,
      nameEn: levelConfig.nameEn,
      icon: levelConfig.icon,
      color: levelConfig.color,
      rebateRate: levelConfig.rebateRate,
      feeDiscount: levelConfig.feeDiscount,
      benefits: levelConfig.benefits,
      minRecharge: levelConfig.minRecharge,
      // 用户累计充值（经验值）
      totalExperience: totalExperience.toFixed(2),
      // 积分和VIP等级
      totalPoints: experiencePoints.toFixed(2),
      vipLevel: vipLevel,
      // 升达主权会员新增字段
      upgradeBonus: levelConfig.upgradeBonus,
      poolRateBonus: levelConfig.poolRateBonus,
      freeWithdrawDays: levelConfig.freeWithdrawDays,
      withdrawPriority: levelConfig.withdrawPriority,
      contractEnabled: levelConfig.contractEnabled,
      newCoinPriority: levelConfig.newCoinPriority,
      vipSupport: levelConfig.vipSupport,
      ticketPriority: levelConfig.ticketPriority,
      withdrawFeeFree: levelConfig.withdrawFeeFree,
    };

    // 获取下一等级
    const nextLevel = await this.levelRepo.findOne({
      where: { level: currentLevel + 1, isEnabled: 1 },
    });

    if (nextLevel) {
      const needMore = parseFloat(nextLevel.minRecharge) - totalExperience;
      result.nextLevel = {
        level: nextLevel.level,
        name: nextLevel.name,
        minRecharge: nextLevel.minRecharge,
        needMore: needMore > 0 ? needMore.toFixed(2) : '0',
      };
    }

    return result;
  }

  /**
   * 更新用户等级（充值后调用）
   */
  async updateUserLevel(userId: number, addExperience?: string): Promise<{ oldLevel: number; newLevel: number; levelInfo: LevelInfo }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('用户不存在');
    }

    const oldLevel = user.level || 1;
    let totalExperience = parseFloat(user.experiencePoints || '0');

    // 如果有新增经验值，累加
    if (addExperience) {
      totalExperience += parseFloat(addExperience);
      user.experiencePoints = totalExperience.toFixed(2);
    }

    // 计算新等级
    const newLevel = await this.calculateLevel(totalExperience);

    // 更新用户
    if (newLevel !== oldLevel || addExperience) {
      user.level = newLevel;
      await this.userRepo.save(user);

      if (newLevel > oldLevel) {
        this.logger.log(`用户 ${userId} 等级提升: ${oldLevel} -> ${newLevel}, 累计经验值: ${totalExperience}`);
        
        // 发放升级奖励金
        await this.grantUpgradeBonus(userId, oldLevel, newLevel);
      }
    }

    const levelInfo = await this.getUserLevelInfo(userId);

    return { oldLevel, newLevel, levelInfo };
  }

  /**
   * 初始化默认等级配置
   */
  async initDefaultLevels(): Promise<void> {
    const count = await this.levelRepo.count();
    if (count > 0) {
      return; // 已有数据，不初始化
    }

    const defaultLevels = [
      // level 0: 启蒙会员（新手，0经验值）
      { level: 0, name: '启蒙会员', nameEn: 'Initiate Member', icon: 'user', color: '#8B949E', minRecharge: '0', rebateRate: '0', feeDiscount: '1', benefits: '新手基础权限', sortOrder: 0, upgradeBonus: '0' },
      
      // level 1: 准入会员（需要6000经验值，升级奖励200U）
      { level: 1, name: '准入会员', nameEn: 'Access Member', icon: 'shield', color: '#8B9DC3', minRecharge: '6000', rebateRate: '0', feeDiscount: '1', benefits: '基础交易权限', sortOrder: 1, upgradeBonus: '200' },
      
      // level 2: 优选会员（需要？经验值）
      { level: 2, name: '优选会员', nameEn: 'Select Member', icon: 'star', color: '#4A90D9', minRecharge: '20000', rebateRate: '0.01', feeDiscount: '0.95', benefits: '合约交易权限，矿池加成+0.06%', sortOrder: 2, upgradeBonus: '500' },
      
      // level 3: 资本合伙人（需要？经验值）
      { level: 3, name: '资本合伙人', nameEn: 'Capital Partner', icon: 'diamond', color: '#D4AF37', minRecharge: '100000', rebateRate: '0.02', feeDiscount: '0.90', benefits: '提币优先处理，矿池加成+0.1%', sortOrder: 3, upgradeBonus: '1000' },
      
      // level 4: 执行官合伙人（需要？经验值）
      { level: 4, name: '执行官合伙人', nameEn: 'Executive Partner', icon: 'crown', color: '#9B59B6', minRecharge: '500000', rebateRate: '0.03', feeDiscount: '0.85', benefits: '新币优先认购，矿池加成+0.16%', sortOrder: 4, upgradeBonus: '5000' },
      
      // level 5: 主权合伙人（需要？经验值）
      { level: 5, name: '主权合伙人', nameEn: 'Sovereign Partner', icon: 'trophy', color: '#C9A962', minRecharge: '2000000', rebateRate: '0.05', feeDiscount: '0.80', benefits: 'VIP专属客服，提币免手续费', sortOrder: 5, upgradeBonus: '20000' },
    ];

    for (const levelData of defaultLevels) {
      const level = this.levelRepo.create({
        ...levelData,
        isEnabled: 1,
      });
      await this.levelRepo.save(level);
    }

    this.logger.log('已初始化默认会员等级配置');
  }

  // ===== 后台管理方法 =====

  /**
   * 获取所有等级（含禁用）
   */
  async getAdminLevels(): Promise<MemberLevel[]> {
    return this.levelRepo.find({
      order: { level: 'ASC' },
    });
  }

  /**
   * 更新等级配置
   */
  async updateLevel(id: number, data: Partial<MemberLevel>): Promise<MemberLevel> {
    const level = await this.levelRepo.findOne({ where: { id } });
    if (!level) {
      throw new Error('等级配置不存在');
    }

    Object.assign(level, data);
    return this.levelRepo.save(level);
  }

  /**
   * 批量重新计算所有用户等级
   */
  async recalculateAllUserLevels(): Promise<{ updated: number }> {
    const users = await this.userRepo.find({
      select: ['id', 'level', 'totalExperience'],
    });

    let updated = 0;
    for (const user of users) {
      const newLevel = await this.calculateLevel(user.totalExperience || '0');
      if (newLevel !== user.level) {
        await this.userRepo.update(user.id, { level: newLevel });
        updated++;
      }
    }

    this.logger.log(`已重新计算 ${updated} 个用户等级`);
    return { updated };
  }

  // ===== 升达主权会员体系奖励发放 =====

  /**
   * 发放升级奖励金
   * 当用户等级提升时，发放对应等级的进阶奖励金到USDT余额
   */
  async grantUpgradeBonus(userId: number, oldLevel: number, newLevel: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 获取新等级配置
      const levelConfig = await this.levelRepo.findOne({ where: { level: newLevel } });
      if (!levelConfig || parseFloat(levelConfig.upgradeBonus || '0') <= 0) {
        await queryRunner.rollbackTransaction();
        return;
      }

      const bonusAmount = parseFloat(levelConfig.upgradeBonus);

      // 检查是否已经发放过该等级奖励
      const existingBonus = await this.bonusLogRepo.findOne({
        where: { userId, toLevel: newLevel },
      });
      if (existingBonus) {
        this.logger.warn(`用户 ${userId} 已获得过等级 ${newLevel} 的奖励金，跳过`);
        await queryRunner.rollbackTransaction();
        return;
      }

      // 获取用户USDT钱包 (USDT coinId = 2)
      const USDT_COIN_ID = 2;
      let wallet = await this.walletRepo.findOne({
        where: { userId, coinId: USDT_COIN_ID },
      });

      if (!wallet) {
        // 创建钱包
        wallet = this.walletRepo.create({
          userId,
          coinId: USDT_COIN_ID,
          balance: '0',
          frozen: '0',
        });
        await queryRunner.manager.save(wallet);
      }

      // 增加余额
      const newBalance = parseFloat(wallet.balance || '0') + bonusAmount;
      wallet.balance = newBalance.toFixed(2);
      await queryRunner.manager.save(wallet);

      // 记录奖励发放日志
      const bonusLog = this.bonusLogRepo.create({
        userId,
        fromLevel: oldLevel,
        toLevel: newLevel,
        bonusAmount: bonusAmount.toFixed(2),
        remark: `升级至${levelConfig.name}，获得进阶奖励金`,
      });
      await queryRunner.manager.save(bonusLog);

      await queryRunner.commitTransaction();
      this.logger.log(`用户 ${userId} 升级到 ${levelConfig.name}，发放奖励金 ${bonusAmount} USDT`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`发放升级奖励失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取用户升级奖励记录
   */
  async getUserBonusLogs(userId: number): Promise<LevelBonusLog[]> {
    return this.bonusLogRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据VIP等级获取名称
   */
  private getVipLevelName(level: number): string {
    const names = {
      0: '启蒙会员',
      1: '准入会员',
      2: '优选会员',
      3: '资本合伙人',
      4: '执行官合伙人',
      5: '主权合伙人',
    };
    return names[level] || '启蒙会员';
  }

  /**
   * 根据VIP等级获取英文名称
   */
  private getVipLevelNameEn(level: number): string {
    const names = {
      0: 'Initiate Member',
      1: 'Access Member',
      2: 'Select Member',
      3: 'Capital Partner',
      4: 'Executive Partner',
      5: 'Sovereign Partner',
    };
    return names[level] || 'Initiate Member';
  }

  /**
   * 根据VIP等级获取颜色
   */
  private getVipLevelColor(level: number): string {
    const colors = {
      0: '#8B949E',
      1: '#8B9DC3',
      2: '#4A90D9',
      3: '#D4AF37',
      4: '#9B59B6',
      5: '#C9A962',
    };
    return colors[level] || '#8B949E';
  }
}
