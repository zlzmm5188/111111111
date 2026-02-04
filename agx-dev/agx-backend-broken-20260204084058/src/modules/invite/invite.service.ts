import { Injectable, Logger } from '@nestjs/common';
import { BusinessException, COIN_IDS } from '../../common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  User, UserInvite, UserLevel, InviteReward, Commission, Rank, Recharge, Withdraw,
  CommissionTier, InviteBonusTier, InviteBonusRecord, MemberLevel, UserProductCommissionStats, Kyc, Wallet
} from '../../entities';
import { DecimalCalculatorService } from '../../common/services/decimal-calculator.service';
import { AssetService } from '../wallet/services/asset.service';
import { ValidPositionService } from './services/valid-position.service';

/**
 * 邀请与等级服务
 */
@Injectable()
export class InviteService {
  private readonly logger = new Logger(InviteService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserInvite)
    private userInviteRepository: Repository<UserInvite>,
    @InjectRepository(UserLevel)
    private userLevelRepository: Repository<UserLevel>,
    @InjectRepository(InviteReward)
    private inviteRewardRepository: Repository<InviteReward>,
    @InjectRepository(Commission)
    private commissionRepository: Repository<Commission>,
    @InjectRepository(Rank)
    private rankRepository: Repository<Rank>,
    @InjectRepository(Recharge)
    private rechargeRepository: Repository<Recharge>,
    @InjectRepository(Withdraw)
    private withdrawRepository: Repository<Withdraw>,
    // 激励体系
    @InjectRepository(CommissionTier)
    private commissionTierRepository: Repository<CommissionTier>,
    @InjectRepository(InviteBonusTier)
    private inviteBonusTierRepository: Repository<InviteBonusTier>,
    @InjectRepository(InviteBonusRecord)
    private inviteBonusRecordRepository: Repository<InviteBonusRecord>,
    @InjectRepository(MemberLevel)
    private memberLevelRepository: Repository<MemberLevel>,
    @InjectRepository(UserProductCommissionStats)
    private userProductCommissionStatsRepository: Repository<UserProductCommissionStats>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Kyc)
    private kycRepository: Repository<Kyc>,
    private readonly decimalCalculator: DecimalCalculatorService,
    private readonly assetService: AssetService,
    private readonly validPositionService: ValidPositionService,
  ) {}

  /**
   * 获取用户邀请信息
   */
  async getInviteInfo(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }

    // 获取邀请统计
    const inviteCount = user.inviteCount || 0;
    const teamCount = user.teamCount || 0;
    const totalCommission = user.totalCommission || '0';

    // 获取邀请码和链接
    const inviteCode = user.inviteCode;
    const inviteLink = `https://agx.bi/register?ref=${inviteCode}`;

    // 获取等级信息
    const levelInfo = await this.getUserLevel(user.level);

    // 获取当前返佣比例
    const currentRate = await this.getCommissionRateByInviteCount(inviteCount);

    return {
      inviteCode,
      inviteLink,
      inviteCount,
      teamCount,
      totalCommission,
      level: user.level,
      levelInfo,
      // 双向奖励信息
      inviteBonusCount: (user as any).inviteBonusCount || 0,
      inviteBonusTotal: (user as any).inviteBonusTotal || '0',
      rewards: {
        signup: 10,  // 注册奖励 AGX
        trade: Math.round(currentRate * 100),   // 交易返佣比例 %
        lifetime: true // 终身返佣
      }
    };
  }

  /**
   * 计算返佣金额
   * @param userId 获得返佣的用户ID
   * @param fromUserId 产生返佣的下级用户ID
   * @param amount 交易金额或手续费金额
   * @param sourceType 来源类型: contract/pool/spot/gold/otc
   * @param sourceId 来源订单ID
   */
  /**
   * 根据有效用户数量获取返佣比例
   * 
   * 返佣规则（5档位）：
   * - 1-3人：3%
   * - 4-9人：8%
   * - 10-15人：12%
   * - 16-25人：18%
   * - 26人以上：30%
   * 
   * 有效用户判定标准：
   * 1. 有建仓记录
   * 2. 完成所有新人任务
   */
  async getCommissionRateByInviteCount(inviteCount: number): Promise<number> {
    // 使用5档位规则
    if (inviteCount >= 26) return 0.30; // 30%
    if (inviteCount >= 16) return 0.18; // 18%
    if (inviteCount >= 10) return 0.12; // 12%
    if (inviteCount >= 4) return 0.08;  // 8%
    if (inviteCount >= 1) return 0.03;  // 3%
    return 0;
  }

  /**
   * 计算返佣金额（只有直邀返佣）
   */
  async calculateCommission(userId: number, fromUserId: number, amount: string, sourceType: string, sourceId?: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BusinessException(9001, '用户不存在');
    }

    if (user.kycStatus !== 2) {
      this.logger.debug(`用户 ${userId} 未完成KYC认证，跳过返佣`);
      return { commissionAmount: '0', commissionLevel: 0 };
    }

    const invite = await this.userInviteRepository.findOne({
      where: { userId: fromUserId, inviterId: userId, level: 1 },
    });

    if (!invite) {
      this.logger.debug(`用户 ${userId} 和 ${fromUserId} 不存在直邀关系`);
      return { commissionAmount: '0', commissionLevel: 0 };
    }

    // 使用 ValidPositionService 获取返佣比例
    const commissionRate = await this.validPositionService.getCommissionRate(userId);
    const validInviteCount = await this.validPositionService.getValidInviteeCount(userId);

    // 使用 DecimalCalculatorService 计算返佣金额
    const commissionAmount = this.decimalCalculator.calculateCommission(amount, commissionRate);

    // 检查返佣金额是否大于0
    if (this.decimalCalculator.lessThanOrEqual(commissionAmount, '0.00000001')) {
      return { commissionAmount: '0', commissionLevel: 0 };
    }

    const commission = this.commissionRepository.create({
      userId,
      fromUserId,
      level: 1,
      sourceType: sourceType,
      sourceId: sourceId || null,
      coinId: COIN_IDS.USDT,
      amount: commissionAmount,
      rate: commissionRate.toString(),
      status: 0,
    });
    await this.commissionRepository.save(commission);

    // 使用 DecimalCalculatorService 更新累计返佣
    const newTotalCommission = this.decimalCalculator.add(user.totalCommission || '0', commissionAmount);
    user.totalCommission = newTotalCommission;
    await this.userRepository.save(user);

    const ratePercent = this.decimalCalculator.multiply(commissionRate.toString(), 100);
    this.logger.log(`返佣成功: 用户${userId}(直邀${validInviteCount}人,${ratePercent}%)从用户${fromUserId}获得返佣${commissionAmount} USDT`);

    return { commissionAmount, commissionLevel: 1, commissionId: commission.id };
  }

  /**
   * 批量计算返佣（只给直邀人返佣）
   */
  async calculateMultiLevelCommission(fromUserId: number, amount: string, sourceType: string, sourceId?: number) {
    const directInvite = await this.userInviteRepository.findOne({
      where: { userId: fromUserId, level: 1 }
    });

    if (!directInvite) {
      this.logger.debug(`用户 ${fromUserId} 没有直邀人，不返佣`);
      return [];
    }

    const result = await this.calculateCommission(
      directInvite.inviterId,
      fromUserId,
      amount,
      sourceType,
      sourceId
    );

    return [result];
  }

  async bindInviteRelation(userId: number, inviteCode: string) {
    if (!inviteCode) {
      this.logger.debug(`用户 ${userId} 注册时未填写邀请码`);
      return false;
    }

    // 查找邀请人
    const inviter = await this.userRepository.findOne({
      where: { inviteCode }
    });

    if (!inviter) {
      this.logger.debug(`邀请码 ${inviteCode} 不存在`);
      return false;
    }

    if (inviter.id === userId) {
      this.logger.debug(`用户不能邀请自己`);
      return false;
    }

    // 检查是否已经有邀请人
    const existingInvite = await this.userInviteRepository.findOne({
      where: { userId, level: 1 }
    });

    if (existingInvite) {
      this.logger.debug(`用户 ${userId} 已经有邀请人 ${existingInvite.inviterId}`);
      return false;
    }

    // 创建一级邀请关系
    const invite1 = this.userInviteRepository.create({
      userId,
      inviterId: inviter.id,
      level: 1
    });
    await this.userInviteRepository.save(invite1);

    // 更新邀请人的邀请数量
    inviter.inviteCount = (inviter.inviteCount || 0) + 1;
    inviter.teamCount = (inviter.teamCount || 0) + 1;
    await this.userRepository.save(inviter);

    // 更新被邀请人的inviterId
    await this.userRepository.update(userId, { inviterId: inviter.id });

    this.logger.log(`建立邀请关系: 用户${userId} <- 邀请人${inviter.id}`);

    // 查找二级邀请人
    const level2Inviter = await this.userInviteRepository.findOne({
      where: { userId: inviter.id, level: 1 }
    });

    if (level2Inviter) {
      // 创建二级邀请关系
      const invite2 = this.userInviteRepository.create({
        userId,
        inviterId: level2Inviter.inviterId,
        level: 2
      });
      await this.userInviteRepository.save(invite2);

      // 更新二级邀请人的团队数量
      const secondLevelInviter = await this.userRepository.findOne({
        where: { id: level2Inviter.inviterId }
      });
      if (secondLevelInviter) {
        secondLevelInviter.teamCount = (secondLevelInviter.teamCount || 0) + 1;
        await this.userRepository.save(secondLevelInviter);
      }

      this.logger.log(`建立二级邀请关系: 用户${userId} <- 二级邀请人${level2Inviter.inviterId}`);
    }

    return true;
  }

  /**
   * 获取用户等级信息
   */
  async getUserLevel(level: number) {
    const levelInfo = await this.userLevelRepository.findOne({ where: { level } });
    if (levelInfo) return levelInfo;

    // 返回默认等级配置
    return this.getDefaultLevel(level);
  }

  /**
   * 获取所有等级配置
   */
  async getAllLevels() {
    const levels = await this.userLevelRepository.find({
      where: { status: 1 },
      order: { level: 'ASC' }
    });

    if (levels.length === 0) {
      return this.getMockLevels();
    }

    return levels;
  }

  /**
   * 获取邀请记录
   * @param userId 用户ID
   * @param page 页码
   * @param pageSize 每页数量
   * @param level 邀请层级 1=直邀 2=间邀
   */
  async getInviteRecords(userId: number, page: number = 1, pageSize: number = 20, level?: number) {
    const whereCondition: any = { inviterId: userId };
    if (level) {
      whereCondition.level = level;
    }

    const [list, total] = await this.userInviteRepository.findAndCount({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 填充用户信息
    const records = await Promise.all(list.map(async (invite) => {
      const user = await this.userRepository.findOne({ 
        where: { id: invite.userId },
        select: ['id', 'uid', 'username', 'nickname', 'avatar', 'kycStatus', 'createdAt']
      });
      return {
        ...invite,
        user,
        status: user?.kycStatus >= 2 ? 'active' : 'pending',
      };
    }));

    // 如果没有数据，返回mock
    if (records.length === 0) {
      return { list: this.getMockInviteRecords(), total: 3 };
    }

    return { list: records, total };
  }

  /**
   * 获取返佣记录
   */
  async getCommissionRecords(userId: number, page: number = 1, pageSize: number = 20) {
    const [list, total] = await this.commissionRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    if (list.length === 0) {
      return { list: this.getMockCommissions(), total: 5 };
    }

    return { list, total };
  }

  /**
   * 获取排行榜
   */
  async getRankList(rankType: string = 'profit', timeRange: string = 'week', page: number = 1, pageSize: number = 50) {
    const ranks = await this.rankRepository.find({
      where: { rankType, timeRange },
      order: { position: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    if (ranks.length === 0) {
      return this.getMockRankList(rankType);
    }

    // 填充用户信息
    const list = await Promise.all(ranks.map(async (rank) => {
      const user = await this.userRepository.findOne({
        where: { id: rank.userId },
        select: ['id', 'uid', 'nickname', 'avatar', 'level', 'isVerified']
      });
      return { ...rank, user };
    }));

    return list;
  }

  /**
   * 获取用户在排行榜的位置
   */
  async getUserRank(userId: number, rankType: string = 'profit', timeRange: string = 'week') {
    const rank = await this.rankRepository.findOne({
      where: { userId, rankType, timeRange }
    });

    if (!rank) {
      return { position: 999, value: '0' };
    }

    return rank;
  }

  // ===== Mock 数据 =====

  private getDefaultLevel(level: number) {
    // 返佣比例: 3%, 6%, 12%, 18%, 30%
    const levels: Record<number, any> = {
      1: { level: 1, name: '启蒙会员', icon: 'user', color: '#8B9DC3', commissionRate1: '0.03', commissionRate2: '0.01' },
      2: { level: 2, name: '优选会员', icon: 'star', color: '#4A90D9', commissionRate1: '0.06', commissionRate2: '0.02' },
      3: { level: 3, name: '资本合伙人', icon: 'diamond', color: '#D4AF37', commissionRate1: '0.12', commissionRate2: '0.04' },
      4: { level: 4, name: '执行官合伙人', icon: 'crown', color: '#9B59B6', commissionRate1: '0.18', commissionRate2: '0.06' },
      5: { level: 5, name: '主权合伙人', icon: 'trophy', color: '#C9A962', commissionRate1: '0.30', commissionRate2: '0.10' },
    };
    return levels[level] || levels[1];
  }

  private getMockLevels() {
    // 等级体系: 资产要求 + 邀请人数要求
    // 返佣比例: 3% -> 6% -> 12% -> 18% -> 30%
    return [
      { level: 1, name: '启蒙会员', nameEn: 'Initiate Member', icon: 'user', color: '#8B9DC3', minAssets: '0', minInvites: 0, commissionRate1: '0.03', commissionRate2: '0.01', feeDiscount: '1.00' },
      { level: 2, name: '优选会员', nameEn: 'Select Member', icon: 'star', color: '#4A90D9', minAssets: '100', minInvites: 1, commissionRate1: '0.06', commissionRate2: '0.02', feeDiscount: '0.95' },
      { level: 3, name: '资本合伙人', nameEn: 'Capital Partner', icon: 'diamond', color: '#D4AF37', minAssets: '500', minInvites: 3, commissionRate1: '0.12', commissionRate2: '0.04', feeDiscount: '0.90' },
      { level: 4, name: '执行官合伙人', nameEn: 'Executive Partner', icon: 'crown', color: '#9B59B6', minAssets: '1000', minInvites: 5, commissionRate1: '0.18', commissionRate2: '0.06', feeDiscount: '0.85' },
      { level: 5, name: '主权合伙人', nameEn: 'Sovereign Partner', icon: 'trophy', color: '#C9A962', minAssets: '5000', minInvites: 10, commissionRate1: '0.30', commissionRate2: '0.10', feeDiscount: '0.80' },
    ];
  }

  private getMockInviteRecords() {
    return [
      { id: 1, userId: 101, user: { nickname: 'user***888', avatar: null }, createdAt: new Date(Date.now() - 86400000), status: 'active' },
      { id: 2, userId: 102, user: { nickname: 'trader***999', avatar: null }, createdAt: new Date(Date.now() - 2 * 86400000), status: 'active' },
      { id: 3, userId: 103, user: { nickname: 'crypto***666', avatar: null }, createdAt: new Date(Date.now() - 3 * 86400000), status: 'pending' },
    ];
  }

  private getMockCommissions() {
    return [
      { id: 1, fromUserId: 101, level: 1, sourceType: 'contract', amount: '25.60', rate: '0.20', createdAt: new Date(Date.now() - 3600000) },
      { id: 2, fromUserId: 102, level: 1, sourceType: 'pool', amount: '12.80', rate: '0.20', createdAt: new Date(Date.now() - 7200000) },
      { id: 3, fromUserId: 103, level: 2, sourceType: 'contract', amount: '8.50', rate: '0.10', createdAt: new Date(Date.now() - 86400000) },
      { id: 4, fromUserId: 104, level: 1, sourceType: 'otc', amount: '5.20', rate: '0.20', createdAt: new Date(Date.now() - 2 * 86400000) },
      { id: 5, fromUserId: 105, level: 2, sourceType: 'pool', amount: '3.00', rate: '0.10', createdAt: new Date(Date.now() - 3 * 86400000) },
    ];
  }

  private getMockRankList(rankType: string) {
    const mockUsers = [
      { position: 1, nickname: '王者归来', value: rankType === 'invite' ? '256' : '128560.00', change: '+15.2%' },
      { position: 2, nickname: '币圈老韭菜', value: rankType === 'invite' ? '198' : '96780.00', change: '+12.8%' },
      { position: 3, nickname: '交易达人', value: rankType === 'invite' ? '156' : '85420.00', change: '+8.5%' },
      { position: 4, nickname: '量化策略师', value: rankType === 'invite' ? '128' : '72350.00', change: '+6.2%' },
      { position: 5, nickname: '稳健投资者', value: rankType === 'invite' ? '96' : '65280.00', change: '+5.8%' },
      { position: 6, nickname: '期货大神', value: rankType === 'invite' ? '85' : '58960.00', change: '+4.5%' },
      { position: 7, nickname: '合约高手', value: rankType === 'invite' ? '72' : '52340.00', change: '+3.2%' },
      { position: 8, nickname: '价值投资', value: rankType === 'invite' ? '65' : '48650.00', change: '+2.8%' },
      { position: 9, nickname: '技术分析', value: rankType === 'invite' ? '58' : '42180.00', change: '+2.1%' },
      { position: 10, nickname: '趋势交易', value: rankType === 'invite' ? '52' : '38560.00', change: '+1.5%' },
    ];

    return mockUsers.map((u, i) => ({
      position: u.position,
      value: u.value,
      changePercent: u.change,
      user: { id: i + 1, nickname: u.nickname, avatar: null, level: Math.min(5, Math.ceil((10 - i) / 2)), isVerified: i < 5 ? 1 : 0 }
    }));
  }

  /**
   * 获取邀请关系树形图数据
   */
  async getInviteTreeData(userId: number, maxDepth: number = 3) {
    // 首先获取指定用户信息
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'uid', 'username', 'nickname', 'avatar', 'level', 'inviteCount', 'teamCount', 'totalCommission', 'createdAt']
    });
    
    if (!user) {
      return null;
    }

    // 获取用户等级信息
    const levelInfo = await this.getUserLevel(user.level);

    // 构建根节点
    const rootNode = {
      id: user.id,
      uid: user.uid,
      name: user.nickname || user.username,
      level: user.level,
      levelName: levelInfo?.name || '普通用户',
      inviteCount: user.inviteCount,
      teamCount: user.teamCount,
      totalCommission: user.totalCommission,
      createdAt: user.createdAt,
      children: []
    };

    // 递归构建子节点
    await this.buildTreeChildren(rootNode, maxDepth, 1);

    return rootNode;
  }

  /**
   * 递归构建树形图的子节点
   */
  private async buildTreeChildren(node: any, maxDepth: number, currentDepth: number) {
    if (currentDepth >= maxDepth) {
      return;
    }

    // 获取当前节点用户的直接邀请用户
    const directInvites = await this.userInviteRepository.find({
      where: { inviterId: node.id, level: 1 }, // level 1 表示直接下级
      select: ['userId']
    });

    // 获取用户详细信息并构建子节点
    for (const invite of directInvites) {
      const childUser = await this.userRepository.findOne({ 
        where: { id: invite.userId },
        select: ['id', 'uid', 'username', 'nickname', 'avatar', 'level', 'inviteCount', 'teamCount', 'totalCommission', 'createdAt']
      });
      
      if (childUser) {
        const childLevelInfo = await this.getUserLevel(childUser.level);
        
        const childNode = {
          id: childUser.id,
          uid: childUser.uid,
          name: childUser.nickname || childUser.username,
          level: childUser.level,
          levelName: childLevelInfo?.name || '普通用户',
          inviteCount: childUser.inviteCount,
          teamCount: childUser.teamCount,
          totalCommission: childUser.totalCommission,
          createdAt: childUser.createdAt,
          children: []
        };
        
        // 递归构建更深层的子节点
        await this.buildTreeChildren(childNode, maxDepth, currentDepth + 1);
        
        node.children.push(childNode);
      }
    }
  }

  /**
   * 搜索用户
   */
  async searchUsers(keyword: string, page: number = 1, pageSize: number = 20) {
    if (!keyword) {
      return { list: [], total: 0 };
    }

    // 构建查询条件
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .where('user.uid LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('user.username LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('user.nickname LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('user.inviteCode LIKE :keyword', { keyword: `%${keyword}%` });

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // 处理返回数据格式
    const result = list.map(user => {
      return {
        id: user.id,
        uid: user.uid,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        level: user.level,
        inviteCount: user.inviteCount,
        teamCount: user.teamCount,
        totalCommission: user.totalCommission,
        createdAt: user.createdAt,
      };
    });

    return { list: result, total };
  }

  /**
   * 获取邀请统计信息
   */
  async getInviteStats(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }

    // 获取直接邀请统计
    const directInviteCount = await this.userInviteRepository.count({
      where: { inviterId: userId, level: 1 }
    });

    // 获取二级邀请统计
    const secondLevelInviteCount = await this.userInviteRepository.count({
      where: { inviterId: userId, level: 2 }
    });

    // 获取三级邀请统计
    const thirdLevelInviteCount = await this.userInviteRepository.count({
      where: { inviterId: userId, level: 3 }
    });

    // 获取团队统计
    const teamStats = await this.getTeamStats(userId);

    return {
      userId: user.id,
      directInviteCount,
      secondLevelInviteCount,
      thirdLevelInviteCount,
      totalInviteCount: user.inviteCount,
      teamCount: user.teamCount,
      totalCommission: user.totalCommission,
      teamStats,
    };
  }

  /**
   * 获取团队统计信息
   */
  private async getTeamStats(userId: number) {
    // 这里可以计算更详细的团队统计信息
    // 比如各层级人数分布、活跃用户数等
    const levelStats = [];
    
    for (let level = 1; level <= 3; level++) {
      const count = await this.userInviteRepository.count({
        where: { inviterId: userId, level }
      });
      
      levelStats.push({
        level,
        count
      });
    }

    return {
      levelStats,
      // 其他统计信息
    };
  }

  // ===== 后台管理系统专用方法 =====

  /**
   * 后台管理 - 获取邀请树形数据
   */
  async getAdminInviteTree(userId: number, maxDepth: number = 5) {
    // 如果指定了用户ID，获取该用户的邀请树
    if (userId) {
      return this.getInviteTreeData(userId, maxDepth);
    }

    // 否则获取系统根节点 - 所有顶级用户（没有邀请人的用户）
    const topLevelUsers = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user_invite', 'invite', 'invite.user_id = user.id')
      .where('invite.id IS NULL')
      .select(['user.id', 'user.uid', 'user.username', 'user.nickname', 'user.level', 'user.inviteCount', 'user.teamCount'])
      .take(50)
      .getMany();

    // 获取统计数据
    const totalUsers = await this.userRepository.count();
    
    // 构建根节点
    const rootNode = {
      username: '系统根节点',
      uid: 'ROOT',
      directCount: topLevelUsers.length,
      teamCount: totalUsers,
      recharge: 0,
      withdraw: 0,
      children: [] as any[]
    };

    // 构建子节点
    for (const user of topLevelUsers) {
      const childNode = await this.buildAdminTreeNode(user, maxDepth, 1);
      rootNode.children.push(childNode);
    }

    return rootNode;
  }

  /**
   * 后台管理 - 构建树节点
   */
  private async buildAdminTreeNode(user: any, maxDepth: number, currentDepth: number): Promise<any> {
    const node: any = {
      username: user.nickname || user.username,
      uid: user.uid || `U${user.id}`,
      directCount: user.inviteCount || 0,
      teamCount: user.teamCount || 0,
      recharge: 0,
      withdraw: 0,
      isInternal: user.isInternal || false,
    };

    // 如果还没到最大深度，继续获取子节点
    if (currentDepth < maxDepth) {
      const directInvites = await this.userInviteRepository.find({
        where: { inviterId: user.id, level: 1 },
        select: ['userId']
      });

      if (directInvites.length > 0) {
        node.children = [];
        for (const invite of directInvites.slice(0, 20)) { // 限制每层最多20个子节点
          const childUser = await this.userRepository.findOne({
            where: { id: invite.userId },
            select: ['id', 'uid', 'username', 'nickname', 'level', 'inviteCount', 'teamCount']
          });
          if (childUser) {
            const childNode = await this.buildAdminTreeNode(childUser, maxDepth, currentDepth + 1);
            node.children.push(childNode);
          }
        }
      }
    }

    return node;
  }

  /**
   * 后台管理 - 获取邀请统计
   */
  async getAdminInviteStats(userId?: number) {
    // 获取总用户数
    const totalUsers = await this.userRepository.count();

    // 获取一级邀请总数
    const level1Total = await this.userInviteRepository.count({ where: { level: 1 } });

    // 获取二级邀请总数
    const level2Total = await this.userInviteRepository.count({ where: { level: 2 } });

    // 从充值表获取总充值金额
    const rechargeResult = await this.rechargeRepository
      .createQueryBuilder('r')
      .select('COALESCE(SUM(r.amount), 0)', 'total')
      .where('r.status = :status', { status: 1 })
      .getRawOne();
    const totalRecharge = parseFloat(rechargeResult?.total || '0');

    // 从提现表获取总提现金额
    const withdrawResult = await this.withdrawRepository
      .createQueryBuilder('w')
      .select('COALESCE(SUM(w.amount), 0)', 'total')
      .where('w.status = :status', { status: 2 })
      .getRawOne();
    const totalWithdraw = parseFloat(withdrawResult?.total || '0');

    // 内部业绩 = 总充值 - 总提现
    const internalPerformance = totalRecharge - totalWithdraw;

    return {
      totalUsers,
      totalRecharge,
      totalWithdraw,
      internalPerformance,
      level1Total,
      level2Total,
    };
  }

  /**
   * 后台管理 - 获取用户列表
   */
  async getAdminUserList(page: number = 1, pageSize: number = 15, keyword?: string) {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (keyword) {
      queryBuilder
        .where('user.uid LIKE :keyword', { keyword: `%${keyword}%` })
        .orWhere('user.username LIKE :keyword', { keyword: `%${keyword}%` })
        .orWhere('user.nickname LIKE :keyword', { keyword: `%${keyword}%` });
    }

    const [users, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('user.teamCount', 'DESC')
      .getManyAndCount();

    // 批量获取邀请人信息和财务数据
    const list = await Promise.all(users.map(async (user) => {
      // 获取邀请人信息
      const inviteRelation = await this.userInviteRepository.findOne({
        where: { userId: user.id, level: 1 }
      });
      let inviterInfo = null;
      if (inviteRelation) {
        const inviter = await this.userRepository.findOne({ where: { id: inviteRelation.inviterId } });
        if (inviter) {
          inviterInfo = { uid: inviter.uid, username: inviter.nickname || inviter.username };
        }
      }

      // 获取用户充值总额
      const rechargeResult = await this.rechargeRepository
        .createQueryBuilder('r')
        .select('COALESCE(SUM(r.amount), 0)', 'total')
        .where('r.userId = :userId AND r.status = 1', { userId: user.id })
        .getRawOne();

      // 获取用户提现总额
      const withdrawResult = await this.withdrawRepository
        .createQueryBuilder('w')
        .select('COALESCE(SUM(w.amount), 0)', 'total')
        .where('w.userId = :userId AND w.status = 2', { userId: user.id })
        .getRawOne();

      return {
        id: user.id,
        uid: user.uid,
        username: user.nickname || user.username,
        inviter: inviterInfo,
        directCount: user.inviteCount || 0,
        teamCount: user.teamCount || 0,
        recharge: parseFloat(rechargeResult?.total || '0'),
        withdraw: parseFloat(withdrawResult?.total || '0'),
        isInternal: false,
      };
    }));

    return { list, total };
  }

  // ========== 管理后台 - 邀请关系树API ==========

  /**
   * 获取邀请关系树形数据（全局）
   */
  async getGlobalInviteTreeData(maxDepth: number = 5) {
    // 获取顶级用户（没有邀请人的用户）
    const topUsers = await this.userRepository.createQueryBuilder('user')
      .leftJoin('agx_user_invite', 'invite', 'invite.user_id = user.id AND invite.level = 1')
      .where('invite.id IS NULL')
      .orderBy('user.inviteCount', 'DESC')
      .limit(10)
      .getMany();

    if (topUsers.length === 0) {
      // 返回模拟数据
      return this.getMockTreeData();
    }

    // 构建 ROOT 节点
    const rootNode = {
      uid: 'ROOT',
      username: '平台',
      nickname: '平台总部',
      recharge: 0,
      withdraw: 0,
      directCount: topUsers.length,
      teamCount: await this.userRepository.count(),
      children: []
    };

    // 构建子节点
    for (const user of topUsers) {
      const childNode = await this.buildUserTreeNode(user.id, maxDepth, 1);
      if (childNode) {
        rootNode.children.push(childNode);
      }
    }

    return rootNode;
  }

  /**
   * 构建用户树节点
   */
  private async buildUserTreeNode(userId: number, maxDepth: number, currentDepth: number): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return null;

    // 从充值表获取用户充值总额
    const rechargeResult = await this.rechargeRepository
      .createQueryBuilder('r')
      .select('COALESCE(SUM(r.amount), 0)', 'total')
      .where('r.userId = :userId AND r.status = 1', { userId })
      .getRawOne();

    // 从提现表获取用户提现总额
    const withdrawResult = await this.withdrawRepository
      .createQueryBuilder('w')
      .select('COALESCE(SUM(w.amount), 0)', 'total')
      .where('w.userId = :userId AND w.status = 2', { userId })
      .getRawOne();

    const node = {
      uid: user.uid,
      username: user.username,
      nickname: user.nickname || user.username,
      recharge: parseFloat(rechargeResult?.total || '0'),
      withdraw: parseFloat(withdrawResult?.total || '0'),
      directCount: user.inviteCount || 0,
      teamCount: user.teamCount || 0,
      children: []
    };

    if (currentDepth >= maxDepth) {
      return node;
    }

    // 获取直接下级
    const invites = await this.userInviteRepository.find({
      where: { inviterId: userId, level: 1 },
    });

    for (const invite of invites) {
      const childNode = await this.buildUserTreeNode(invite.userId, maxDepth, currentDepth + 1);
      if (childNode) {
        node.children.push(childNode);
      }
    }

    return node;
  }

  /**
   * 获取邀请统计数据
   */
  async getInviteTreeStats(userId?: number) {
    const totalUsers = await this.userRepository.count();
    
    // 简化统计
    return {
      totalUsers,
      totalRecharge: 125800.50,
      totalWithdraw: 45600.00,
      internalPerformance: 80200.50,
      level1Total: Math.floor(totalUsers * 0.3),
      level2Total: Math.floor(totalUsers * 0.2),
    };
  }

  /**
   * 搜索邀请用户（搜索下级）
   * 根据用户名搜索，返回该用户的所有下级（包括所有层级）
   */
  async searchInviteUser(keyword: string) {
    if (!keyword) {
      return { list: [], total: 0 };
    }

    // 先找到匹配的用户
    const [users] = await this.userRepository.createQueryBuilder('user')
      .where('user.uid LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('user.username LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('user.nickname LIKE :keyword', { keyword: `%${keyword}%` })
      .limit(1)
      .getManyAndCount();

    if (!users || users.length === 0) {
      return { list: [], total: 0 };
    }

    const targetUser = users[0];

    // 递归获取所有下级
    const allSubordinates = await this.getAllSubordinates(targetUser.id);

    return { list: allSubordinates, total: allSubordinates.length };
  }

  /**
   * 递归获取用户的所有下级
   */
  private async getAllSubordinates(userId: number): Promise<any[]> {
    const result = [];

    // 获取直接下级
    const invites = await this.userInviteRepository.find({
      where: { inviterId: userId, level: 1 },
    });

    for (const invite of invites) {
      const user = await this.userRepository.findOne({ where: { id: invite.userId } });
      if (!user) continue;

      // 获取充值总额
      const rechargeResult = await this.rechargeRepository
        .createQueryBuilder('r')
        .select('COALESCE(SUM(r.amount), 0)', 'total')
        .where('r.userId = :userId AND r.status = 1', { userId: user.id })
        .getRawOne();

      // 获取提现总额
      const withdrawResult = await this.withdrawRepository
        .createQueryBuilder('w')
        .select('COALESCE(SUM(w.amount), 0)', 'total')
        .where('w.userId = :userId AND w.status = 2', { userId: user.id })
        .getRawOne();

      // 获取 USDT 余额
      const usdtBalance = await this.assetService.getBalance(user.id, 2); // coinId=2 是 USDT

      // 获取 AGX 余额
      const agxBalance = await this.assetService.getBalance(user.id, 1); // coinId=1 是 AGX

      // 获取当前矿机持仓金额
      const currentHoldingResult = await this.userRepository.manager.query(`
        SELECT COALESCE(SUM(ph.amount), 0) as total 
        FROM agx_pool_holding ph 
        WHERE ph.user_id = ? AND ph.status = 1
      `, [user.id]);

      // 获取累计矿机建仓金额（包括已赎回的）
      const totalHoldingResult = await this.userRepository.manager.query(`
        SELECT COALESCE(SUM(ph.amount), 0) as total 
        FROM agx_pool_holding ph 
        WHERE ph.user_id = ?
      `, [user.id]);

      // 获取邀请人信息
      let inviterInfo = null;
      if (user.inviterId) {
        const inviter = await this.userRepository.findOne({ where: { id: user.inviterId } });
        if (inviter) {
          // 获取邀请人KYC真实姓名
          const inviterKyc = await this.kycRepository.findOne({ 
            where: { userId: inviter.id, status: 1 },
            order: { createdAt: 'DESC' }
          });
          inviterInfo = {
            uid: inviter.uid,
            username: inviter.username,
            nickname: inviter.nickname || inviter.username,
            realName: inviterKyc?.realName || '',
          };
        }
      }

      // 获取当前用户KYC真实姓名
      const userKyc = await this.kycRepository.findOne({ 
        where: { userId: user.id, status: 1 },
        order: { createdAt: 'DESC' }
      });

      result.push({
        uid: user.uid,
        username: user.username,
        nickname: user.nickname || user.username,
        realName: userKyc?.realName || '',
        level: user.level,
        usdtBalance: usdtBalance || '0',
        agxBalance: agxBalance || '0',
        totalRecharge: parseFloat(rechargeResult?.total || '0'),
        totalWithdraw: parseFloat(withdrawResult?.total || '0'),
        currentHolding: parseFloat(currentHoldingResult[0]?.total || '0'),
        totalHolding: parseFloat(totalHoldingResult[0]?.total || '0'),
        inviter: inviterInfo,
        directCount: user.inviteCount || 0,
        teamCount: user.teamCount || 0,
      });

      // 递归获取该用户的下级
      const subUsers = await this.getAllSubordinates(user.id);
      result.push(...subUsers);
    }

    return result;
  }

  /**
   * 获取邀请用户列表
   */
  async getInviteUserList(page: number = 1, pageSize: number = 15, keyword?: string) {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (keyword) {
      queryBuilder
        .where('user.uid LIKE :keyword', { keyword: `%${keyword}%` })
        .orWhere('user.username LIKE :keyword', { keyword: `%${keyword}%` });
    }

    const [list, total] = await queryBuilder
      .orderBy('user.inviteCount', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const result = list.map(user => ({
      uid: user.uid,
      username: user.nickname || user.username,
      directCount: user.inviteCount || 0,
      teamCount: user.teamCount || 0,
      recharge: 0,
      withdraw: 0,
      inviter: null,
      isInternal: false,
    }));

    return { list: result, total };
  }

  /**
   * 模拟树形数据
   */
  private getMockTreeData() {
    return {
      uid: 'ROOT',
      username: '平台',
      nickname: '平台总部',
      recharge: 125800,
      withdraw: 45600,
      directCount: 2,
      teamCount: 156,
      children: [
        {
          uid: 'U001',
          username: 'leader1',
          nickname: '主账户A',
          recharge: 50000,
          withdraw: 15000,
          directCount: 25,
          teamCount: 78,
          children: [
            { uid: 'U101', username: 'member1', nickname: '成员A1', recharge: 5000, withdraw: 1000, directCount: 5, teamCount: 12, children: [] },
            { uid: 'U102', username: 'member2', nickname: '成员A2', recharge: 8000, withdraw: 2000, directCount: 8, teamCount: 20, children: [] },
          ]
        },
        {
          uid: 'U002',
          username: 'leader2',
          nickname: '内部线',
          recharge: 75800,
          withdraw: 30600,
          directCount: 15,
          teamCount: 78,
          children: [
            { uid: 'U201', username: 'internal1', nickname: '内部成员B1', recharge: 20000, withdraw: 8000, directCount: 10, teamCount: 25, children: [] },
          ]
        }
      ]
    };
  }

  // ========== 激励体系配置 ==========

  /**
   * 获取返佣阶梯配置
   */
  async getCommissionTiers() {
    try {
      const tiers = await this.commissionTierRepository.find({
        order: { tierLevel: 'ASC' }
      });
      return tiers.map(tier => ({
        tierLevel: tier.tierLevel,
        minInvites: tier.minInvites,
        commissionRate: parseFloat(tier.commissionRate as any),
        isEnabled: tier.isEnabled,
        description: tier.description
      }));
    } catch (e) {
      this.logger.warn('获取返佣阶梯配置失败，返回默认配置', e);
      return this.getDefaultCommissionTiers();
    }
  }

  /**
   * 获取双向奖励配置
   */
  async getInviteBonusTiers() {
    try {
      const tiers = await this.inviteBonusTierRepository.find({
        where: { isEnabled: 1 },
        order: { inviteOrder: 'ASC' }
      });
      return tiers.map(tier => ({
        inviteOrder: tier.inviteOrder,
        inviteeBonus: tier.inviteeBonus,
        inviterBonus: tier.inviterBonus,
        isEnabled: tier.isEnabled
      }));
    } catch (e) {
      this.logger.warn('获取双向奖励配置失败，返回默认配置', e);
      return this.getDefaultInviteBonusTiers();
    }
  }

  /**
   * 获取会员等级配置
   */
  async getMemberLevels() {
    try {
      const levels = await this.memberLevelRepository.find({
        where: { isEnabled: 1 },
        order: { level: 'ASC' }
      });
      return levels.map(level => ({
        level: level.level,
        name: level.name,
        nameEn: level.nameEn,
        icon: level.icon,
        color: level.color,
        minRecharge: parseFloat(level.minRecharge as any),
        feeDiscount: parseFloat(level.feeDiscount as any),
        incomeBonus: parseFloat(level.incomeBonus as any),
        withdrawLimit: level.withdrawLimit ? parseFloat(level.withdrawLimit as any) : null,
        benefits: level.benefits
      }));
    } catch (e) {
      this.logger.warn('获取会员等级配置失败，返回默认配置', e);
      return this.getDefaultMemberLevels();
    }
  }

  /**
   * 默认返佣阶梯（5档位）
   */
  private getDefaultCommissionTiers() {
    return [
      { tierLevel: 1, minInvites: 1, commissionRate: 0.03, isEnabled: 1, description: '1-3人建仓 - 3%' },
      { tierLevel: 2, minInvites: 4, commissionRate: 0.08, isEnabled: 1, description: '4-9人建仓 - 8%' },
      { tierLevel: 3, minInvites: 10, commissionRate: 0.12, isEnabled: 1, description: '10-15人建仓 - 12%' },
      { tierLevel: 4, minInvites: 16, commissionRate: 0.18, isEnabled: 1, description: '16-25人建仓 - 18%' },
      { tierLevel: 5, minInvites: 26, commissionRate: 0.30, isEnabled: 1, description: '26人以上 - 30%' },
    ];
  }

  /**
   * 默认双向奖励配置
   */
  private getDefaultInviteBonusTiers() {
    return [
      { inviteOrder: 1, inviteeBonus: '10', inviterBonus: '5', isEnabled: 1 },
      { inviteOrder: 2, inviteeBonus: '10', inviterBonus: '8', isEnabled: 1 },
      { inviteOrder: 3, inviteeBonus: '10', inviterBonus: '12', isEnabled: 1 },
      { inviteOrder: 4, inviteeBonus: '10', inviterBonus: '18', isEnabled: 1 },
      { inviteOrder: 5, inviteeBonus: '10', inviterBonus: '25', isEnabled: 1 },
      { inviteOrder: 6, inviteeBonus: '10', inviterBonus: '32', isEnabled: 1 },
      { inviteOrder: 7, inviteeBonus: '10', inviterBonus: '42', isEnabled: 1 },
      { inviteOrder: 8, inviteeBonus: '10', inviterBonus: '55', isEnabled: 1 },
      { inviteOrder: 9, inviteeBonus: '10', inviterBonus: '70', isEnabled: 1 },
      { inviteOrder: 10, inviteeBonus: '10', inviterBonus: '90', isEnabled: 1 },
    ];
  }

  /**
   * 默认会员等级配置（与migration 013_ascenda_membership.sql一致）
   */
  private getDefaultMemberLevels() {
    return [
      { level: 1, name: '启蒙会员', nameEn: 'Initiate', icon: '🛡️', color: '#8B9DC3', minRecharge: 200, feeDiscount: 1.00, incomeBonus: 0.0002, withdrawLimit: 5000 },
      { level: 2, name: '优选会员', nameEn: 'Prime', icon: '⭐', color: '#4A90D9', minRecharge: 600, feeDiscount: 0.98, incomeBonus: 0.0006, withdrawLimit: 10000 },
      { level: 3, name: '资本合伙人', nameEn: 'Capital', icon: '💎', color: '#D4AF37', minRecharge: 1500, feeDiscount: 0.95, incomeBonus: 0.0010, withdrawLimit: 50000 },
      { level: 4, name: '执行官合伙人', nameEn: 'Executive', icon: '👑', color: '#9B59B6', minRecharge: 5000, feeDiscount: 0.90, incomeBonus: 0.0016, withdrawLimit: 100000 },
      { level: 5, name: '主权合伙人', nameEn: 'Sovereign', icon: '🏆', color: '#C9A962', minRecharge: 10000, feeDiscount: 0.80, incomeBonus: 0.0022, withdrawLimit: null },
    ];
  }

  // ========== 保存配置方法 ==========

  /**
   * 保存返佣阶梯配置
   */
  async saveCommissionTiers(tiers: any[]) {
    for (const tier of tiers) {
      await this.commissionTierRepository
        .createQueryBuilder()
        .update()
        .set({
          minInvites: tier.minInvites,
          commissionRate: tier.commissionRate,
          isEnabled: tier.isEnabled,
          description: tier.description,
        })
        .where('tierLevel = :tierLevel', { tierLevel: tier.tierLevel })
        .execute();
    }
    this.logger.log('返佣阶梯配置已更新');
  }

  /**
   * 保存双向奖励配置
   */
  async saveInviteBonusTiers(tiers: any[]) {
    for (const tier of tiers) {
      await this.inviteBonusTierRepository
        .createQueryBuilder()
        .update()
        .set({
          inviteeBonus: tier.inviteeBonus,
          inviterBonus: tier.inviterBonus,
          isEnabled: tier.isEnabled,
        })
        .where('inviteOrder = :inviteOrder', { inviteOrder: tier.inviteOrder })
        .execute();
    }
    this.logger.log('双向奖励配置已更新');
  }

  /**
   * 保存会员等级配置
   */
  async saveMemberLevels(levels: any[]) {
    for (const level of levels) {
      await this.memberLevelRepository
        .createQueryBuilder()
        .update()
        .set({
          name: level.name,
          nameEn: level.nameEn,
          icon: level.icon,
          color: level.color,
          minRecharge: level.minRecharge,
          feeDiscount: level.feeDiscount,
          incomeBonus: level.incomeBonus,
          withdrawLimit: level.withdrawLimit,
        })
        .where('level = :level', { level: level.level })
        .execute();
    }
    this.logger.log('会员等级配置已更新');
  }

  /**
   * 获取用户返佣信息（新增）
   *
   * 返回用户的返佣相关信息
   */
  async getCommissionInfo(userId: number) {
    // 使用 ValidPositionService 获取等级信息
    const levelInfo = await this.validPositionService.getLevelInfo(userId);

    // 获取团队总人数
    const teamCount = await this.userInviteRepository
      .createQueryBuilder('invite')
      .where('invite.inviterId = :inviterId', { inviterId: userId })
      .getCount();

    // 获取直邀总人数
    const directInviteCount = await this.userInviteRepository
      .createQueryBuilder('invite')
      .where('invite.inviterId = :inviterId', { inviterId: userId })
      .andWhere('invite.level = 1')
      .getCount();

    // 返佣比例百分比
    const commissionRatePercent = this.decimalCalculator.multiply(
      levelInfo.commissionRate.toString(),
      100
    );

    // 进度百分比
    const progressPercent = await this.validPositionService.getProgressPercent(userId);

    // 生成文案
    const validFriendDescription = '有效建仓好友：指您邀请的好友中，完成过真实投资的用户';
    let progressTip = '';

    if (levelInfo.isMaxLevel) {
      progressTip = '已达到最高返佣比例 30%';
    } else {
      const needCount = (levelInfo.nextLevelThreshold || 0) - levelInfo.validInviteeCount;
      progressTip = `再增加 ${needCount} 位有效建仓好友可升级至${levelInfo.levelName}（${commissionRatePercent}%返佣）`;
    }

    // 累计返佣分币种统计
    const commissionStats = await this.commissionRepository
      .createQueryBuilder('c')
      .select('c.coin_id', 'coinId')
      .addSelect('SUM(CAST(c.amount AS DECIMAL(30,8)))', 'total')
      .where('c.user_id = :userId', { userId })
      .andWhere('c.status = 1')
      .groupBy('c.coin_id')
      .getRawMany();

    const totalCommissions = {
      USDT: '0',
      AGX: '0',
    };
    for (const stat of commissionStats) {
      if (stat.coinId === 2) totalCommissions.USDT = parseFloat(stat.total || 0).toFixed(8);
      if (stat.coinId === 1) totalCommissions.AGX = parseFloat(stat.total || 0).toFixed(8);
    }

    return {
      // 核心字段
      validInviteeCount: levelInfo.validInviteeCount,
      commissionRate: levelInfo.commissionRate,
      commissionRatePercent: commissionRatePercent,
      nextLevelThreshold: levelInfo.nextLevelThreshold,
      isMaxLevel: levelInfo.isMaxLevel,

      // 等级信息
      level: levelInfo.level,
      levelName: levelInfo.levelName,

      // 统计信息
      teamCount: teamCount,
      directInviteCount: directInviteCount,
      totalCommissions: totalCommissions,

      // 文案（后端生成）
      validFriendDescription,
      progressTip,
      progressPercent: Math.round(progressPercent),
    };
  }

  // ========== 按产品返佣和双向奖励 ==========

  /**
   * 获取按产品的返佣统计
   * GET /api/invite/commission-by-product
   */
  async getCommissionByProduct(userId: number) {
    const stats = await this.commissionRepository
      .createQueryBuilder('c')
      .select('c.source_type', 'sourceType')
      .addSelect('SUM(CAST(c.amount AS DECIMAL(30,8)))', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('c.user_id = :userId', { userId })
      .andWhere('c.status = 1')
      .groupBy('c.source_type')
      .getRawMany();

    const result = {
      pool: { total: '0', count: 0 },
      contract: { total: '0', count: 0 },
    };

    for (const stat of stats) {
      if (stat.sourceType === 'pool') {
        result.pool = { total: parseFloat(stat.total || 0).toFixed(8), count: parseInt(stat.count) };
      } else if (stat.sourceType === 'contract') {
        result.contract = { total: parseFloat(stat.total || 0).toFixed(8), count: parseInt(stat.count) };
      }
    }

    return result;
  }

  /**
   * 获取双向奖励统计
   * GET /api/invite/bonus-stats
   */
  async getBonusStats(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }

    // 获取用户作为邀请人获得的奖励记录
    const bonusRecords = await this.inviteBonusRecordRepository.find({
      where: { inviterId: userId, status: 1 },
      order: { createdAt: 'DESC' }
    });

    // 计算累计获得的 AGX
    let totalBonus = '0';
    for (const record of bonusRecords) {
      totalBonus = this.decimalCalculator.add(totalBonus, record.inviterBonus);
    }

    // 已邀请并KYC的人数
    const kycInviteCount = bonusRecords.length;

    // 获取下一档奖励配置
    const nextOrder = kycInviteCount + 1;
    let nextBonus = null;
    if (nextOrder <= 10) {
      const nextTier = await this.inviteBonusTierRepository.findOne({
        where: { inviteOrder: nextOrder, isEnabled: 1 }
      });
      if (nextTier) {
        nextBonus = {
          order: nextOrder,
          inviterBonus: nextTier.inviterBonus,
          inviteeBonus: nextTier.inviteeBonus
        };
      }
    }

    return {
      kycInviteCount,
      totalBonus,
      nextBonus,
      maxOrder: 10,
      isMaxReached: kycInviteCount >= 10
    };
  }

  /**
   * 获取双向奖励记录
   * GET /api/invite/bonus-records
   */
  async getBonusRecords(userId: number, page: number = 1, pageSize: number = 20) {
    const [list, total] = await this.inviteBonusRecordRepository.findAndCount({
      where: { inviterId: userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['invitee']
    });

    const records = list.map(record => ({
      id: record.id,
      inviteOrder: record.inviteOrder,
      inviterBonus: record.inviterBonus,
      inviteeBonus: record.inviteeBonus,
      status: record.status,
      createdAt: record.createdAt,
      invitee: record.invitee ? {
        id: record.invitee.id,
        nickname: record.invitee.nickname || record.invitee.username,
        avatar: record.invitee.avatar
      } : null
    }));

    return { list: records, total };
  }

  /**
   * KYC通过后发放双向奖励
   * 在 KYC 审核通过时调用
   */
  async processKycApproval(userId: number): Promise<boolean> {
    try {
      // 获取用户的邀请人
      const inviteRelation = await this.userInviteRepository.findOne({
        where: { userId, level: 1 }
      });

      if (!inviteRelation) {
        this.logger.debug(`用户 ${userId} 没有邀请人，跳过双向奖励`);
        return false;
      }

      const inviterId = inviteRelation.inviterId;

      // 检查是否已经发放过奖励
      const existingRecord = await this.inviteBonusRecordRepository.findOne({
        where: { inviterId, inviteeId: userId }
      });

      if (existingRecord) {
        this.logger.debug(`用户 ${userId} 的双向奖励已发放过`);
        return false;
      }

      // 统计邀请人已KYC的邀请数量
      const kycCount = await this.inviteBonusRecordRepository.count({
        where: { inviterId, status: 1 }
      });

      const inviteOrder = kycCount + 1;

      // 获取对应档位的奖励配置
      let bonusTier = await this.inviteBonusTierRepository.findOne({
        where: { inviteOrder, isEnabled: 1 }
      });

      // 超过10人使用第10档配置
      if (!bonusTier && inviteOrder > 10) {
        bonusTier = await this.inviteBonusTierRepository.findOne({
          where: { inviteOrder: 10, isEnabled: 1 }
        });
      }

      if (!bonusTier) {
        this.logger.warn(`未找到第 ${inviteOrder} 档的双向奖励配置`);
        return false;
      }

      // 创建奖励记录
      const bonusRecord = this.inviteBonusRecordRepository.create({
        inviterId,
        inviteeId: userId,
        inviteOrder,
        inviterBonus: bonusTier.inviterBonus,
        inviteeBonus: bonusTier.inviteeBonus,
        status: 1
      });
      await this.inviteBonusRecordRepository.save(bonusRecord);

      // AGX 币种ID (与数据库配置一致)
      const AGX_COIN_ID = 1;

      // 发放 AGX 代币给邀请人
      await this.assetService.addBalance(
        inviterId, 
        AGX_COIN_ID, 
        bonusTier.inviterBonus.toString(), 
        'invite_bonus', 
        '邀请人奖励', 
        `INVITE_BONUS_${bonusRecord.id}`
      );

      // 发放 AGX 代币给被邀请人
      await this.assetService.addBalance(
        userId, 
        AGX_COIN_ID, 
        bonusTier.inviteeBonus.toString(), 
        'invite_bonus', 
        '被邀请人奖励', 
        `INVITE_BONUS_${bonusRecord.id}`
      );

      this.logger.log(`双向奖励发放成功: 邀请人${inviterId}获得${bonusTier.inviterBonus}AGX, 被邀请人${userId}获得${bonusTier.inviteeBonus}AGX (第${inviteOrder}人)`);

      return true;
    } catch (e) {
      this.logger.error(`发放双向奖励失败: ${e.message}`, e.stack);
      return false;
    }
  }

  /**
   * 根据邀请码获取邀请人信息（公开接口，用于落地页）
   */
  async getInviterByCode(inviteCode: string) {
    if (!inviteCode) {
      return null;
    }

    const inviter = await this.userRepository.findOne({
      where: { inviteCode },
      select: ['id', 'nickname', 'username', 'avatar', 'level', 'inviteCount']
    });

    if (!inviter) {
      return null;
    }

    return {
      nickname: inviter.nickname || this.maskUsername(inviter.username),
      avatar: inviter.avatar,
      level: inviter.level,
      inviteCount: inviter.inviteCount || 0
    };
  }

  /**
   * 用户名脱敏
   */
  private maskUsername(username: string): string {
    if (!username || username.length < 3) {
      return username || '***';
    }
    const first = username.charAt(0);
    const last = username.charAt(username.length - 1);
    return `${first}***${last}`;
  }


  /**
   * 获取用户列表（增强版 - 包含余额、KYC、矿机仓位）
   */
  async getAdminUserListWithDetails(page: number = 1, pageSize: number = 15, keyword?: string, inviterId?: number) {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (keyword) {
      queryBuilder
        .where('user.uid LIKE :keyword', { keyword: `%${keyword}%` })
        .orWhere('user.username LIKE :keyword', { keyword: `%${keyword}%` })
        .orWhere('user.nickname LIKE :keyword', { keyword: `%${keyword}%` });
    }

    // 如果指定了inviterId，只获取该用户的下级
    if (inviterId) {
      const subQuery = this.userInviteRepository.createQueryBuilder('invite')
        .select('invite.userId')
        .where('invite.inviterId = :inviterId', { inviterId });
      queryBuilder.andWhere('user.id IN (' + subQuery.getQuery() + ')');
      queryBuilder.setParameter('inviterId', inviterId);
    }

    const [users, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('user.teamCount', 'DESC')
      .getManyAndCount();

    // 批量获取详细信息
    const list = await Promise.all(users.map(async (user) => {
      // 获取KYC信息（真实姓名）
      const kyc = await this.kycRepository.findOne({ where: { userId: user.id, status: 2 } });
      const realName = kyc?.realName || '';

      // 获取钱包余额
      const wallets = await this.walletRepository.find({
        where: { userId: user.id },
        relations: ['coin']
      });
      const usdtWallet = wallets.find(w => w.coin?.symbol === 'USDT');
      const agxWallet = wallets.find(w => w.coin?.symbol === 'AGX');

      // 获取邀请人信息
      const inviteRelation = await this.userInviteRepository.findOne({
        where: { userId: user.id, level: 1 }
      });
      let inviterInfo = null;
      if (inviteRelation) {
        const inviter = await this.userRepository.findOne({ where: { id: inviteRelation.inviterId } });
        if (inviter) {
          inviterInfo = { uid: inviter.uid, username: inviter.nickname || inviter.username };
        }
      }

      // 获取充值/提现总额
      const rechargeResult = await this.rechargeRepository
        .createQueryBuilder('r')
        .select('COALESCE(SUM(r.amount), 0)', 'total')
        .where('r.userId = :userId AND r.status = 1', { userId: user.id })
        .getRawOne();

      const withdrawResult = await this.withdrawRepository
        .createQueryBuilder('w')
        .select('COALESCE(SUM(w.amount), 0)', 'total')
        .where('w.userId = :userId AND w.status = 2', { userId: user.id })
        .getRawOne();

      // 获取矿机仓位（PoolHolding）
      const poolHoldingResult = await this.userRepository.manager
        .createQueryBuilder()
        .select('COALESCE(SUM(h.amount), 0)', 'total')
        .from('agx_pool_holding', 'h')
        .where('h.user_id = :userId AND h.status IN (1,2)', { userId: user.id })
        .getRawOne();

      return {
        id: user.id,
        uid: user.uid,
        username: user.nickname || user.username,
        nickname: user.nickname || '',
        realName,
        level: user.level || 0,
        vipLevel: user.level || 0,
        usdtBalance: parseFloat(usdtWallet?.balance || '0'),
        agxBalance: parseFloat(agxWallet?.balance || '0'),
        inviter: inviterInfo,
        directCount: user.inviteCount || 0,
        teamCount: user.teamCount || 0,
        recharge: parseFloat(rechargeResult?.total || '0'),
        withdraw: parseFloat(withdrawResult?.total || '0'),
        totalRecharge: parseFloat(rechargeResult?.total || '0'),
        totalWithdraw: parseFloat(withdrawResult?.total || '0'),
        poolPosition: parseFloat(poolHoldingResult?.total || '0'),
        currentHolding: parseFloat(poolHoldingResult?.total || '0'),
        totalHolding: parseFloat(poolHoldingResult?.total || '0'),
        createdAt: user.createdAt,
      };
    }));

    return { list, total };
  }

  /**
   * 导出邀请关系用户数据
   */
  async exportInviteUsers(keyword?: string, inviterId?: number) {
    // 获取所有匹配的用户（不分页）
    const { list } = await this.getAdminUserListWithDetails(1, 10000, keyword, inviterId);
    return list;
  }

}
