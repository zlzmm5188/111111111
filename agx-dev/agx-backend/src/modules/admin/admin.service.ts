import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import Decimal from 'decimal.js';
import { Admin, Coin, CoinChain, User, UserInvite, PoolProduct, ContractConfig, PoolHolding, ContractOrder, Kyc, Recharge, Withdraw, AssetLog, Config, Wallet, Notice, Commission, AdminLog, Banner, UserLevel, LoginLog, Blacklist, RiskAlert, OtcOrder, MarketConfig, AppMenu, I18nText, CoinIssue } from '../../entities';
import { LevelBonusLog } from '../../entities/level-bonus-log.entity';
import { BusinessException } from '../../common';
import {
  AdminLoginDto,
  CurrencyListDto,
  CreateCurrencyDto,
  UpdateCurrencyDto,
  UserListDto,
  UpdateUserStatusDto,
  PoolProductListDto,
  CreatePoolProductDto,
  UpdatePoolProductDto,
  ContractConfigListDto,
  CreateContractConfigDto,
  UpdateContractConfigDto,
} from './admin.dto';
import { JwtPayload } from '../auth/jwt.strategy';
import { TelegramNotifyService } from '../notify/notify.service';
import { InviteService } from '../invite/invite.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    @InjectRepository(Coin)
    private readonly coinRepo: Repository<Coin>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(PoolProduct)
    private readonly poolProductRepo: Repository<PoolProduct>,
    @InjectRepository(ContractConfig)
    private readonly contractConfigRepo: Repository<ContractConfig>,
    @InjectRepository(PoolHolding)
    private readonly poolHoldingRepo: Repository<PoolHolding>,
    @InjectRepository(ContractOrder)
    private readonly contractOrderRepo: Repository<ContractOrder>,
    @InjectRepository(Kyc)
    private readonly kycRepo: Repository<Kyc>,
    @InjectRepository(Recharge)
    private readonly rechargeRepo: Repository<Recharge>,
    @InjectRepository(Withdraw)
    private readonly withdrawRepo: Repository<Withdraw>,
    @InjectRepository(AssetLog)
    private readonly assetLogRepo: Repository<AssetLog>,
    @InjectRepository(Config)
    private readonly configRepo: Repository<Config>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Notice)
    private readonly noticeRepo: Repository<Notice>,
    @InjectRepository(CoinChain)
    private readonly coinChainRepo: Repository<CoinChain>,
    @InjectRepository(UserInvite)
    private readonly userInviteRepo: Repository<UserInvite>,
    @InjectRepository(Commission)
    private readonly commissionRepo: Repository<Commission>,
    @InjectRepository(AdminLog)
    private readonly adminLogRepo: Repository<AdminLog>,
    @InjectRepository(Banner)
    private readonly bannerRepo: Repository<Banner>,
    @InjectRepository(UserLevel)
    private readonly userLevelRepo: Repository<UserLevel>,
    @InjectRepository(LoginLog)
    private readonly loginLogRepo: Repository<LoginLog>,
    @InjectRepository(Blacklist)
    private readonly blacklistRepo: Repository<Blacklist>,
    @InjectRepository(RiskAlert)
    private readonly riskAlertRepo: Repository<RiskAlert>,
    @InjectRepository(OtcOrder)
    private readonly otcOrderRepo: Repository<OtcOrder>,
    @InjectRepository(MarketConfig)
    private readonly marketConfigRepo: Repository<MarketConfig>,
    @InjectRepository(AppMenu)
    private readonly appMenuRepo: Repository<AppMenu>,
    @InjectRepository(I18nText)
    private readonly i18nTextRepo: Repository<I18nText>,
    @InjectRepository(CoinIssue)
    private readonly coinIssueRepo: Repository<CoinIssue>,
    @InjectRepository(LevelBonusLog)
    private readonly levelBonusLogRepo: Repository<LevelBonusLog>,
    private readonly jwtService: JwtService,
    private readonly telegramNotify: TelegramNotifyService,
    private readonly inviteService: InviteService,
  ) {}

  /**
   * 安全解析整数参数，避免 NaN
   */
  private safeInt(value: any, defaultValue: number): number {
    if (value === undefined || value === null || value === '') return defaultValue;
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * 安全解析可选整数参数
   */
  private safeOptionalInt(value: any): number | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? undefined : parsed;
  }

  /**
   * 格式化日期为 YYYY-MM-DD HH:mm:ss
   */
  private formatDate(date: Date | null): string | null {
    if (!date) return null;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  /**
   * 管理员登录
   */
  async login(dto: AdminLoginDto, ip?: string) {
    const admin = await this.adminRepo.findOne({
      where: { username: dto.username },
    });
    if (!admin) {
      throw BusinessException.adminNotFound();
    }

    if (admin.status !== 1) {
      throw new BusinessException(1001, '账号已被禁用');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!isPasswordValid) {
      throw BusinessException.adminPasswordError();
    }

    // 更新最后登录时间和 IP
    admin.lastLoginAt = new Date();
    admin.lastLoginIp = ip || null;
    await this.adminRepo.save(admin);

    // 生成 JWT
    const payload: JwtPayload = {
      sub: admin.id,
      uid: String(admin.id),
      username: admin.username,
      type: 'admin',
      adminGroup: admin.adminGroup ?? 0, // 默认超级管理员
    };
    const token = this.jwtService.sign(payload);

    return {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        adminGroup: admin.adminGroup ?? 0,
        lastLoginAt: this.formatDate(admin.lastLoginAt),
      },
    };
  }

  /**
   * 根据ID获取管理员
   */
  async getAdminById(id: number) {
    return this.adminRepo.findOne({ where: { id } });
  }

  // ==================== 管理员管理 ====================

  /**
   * 获取管理员列表
   */
  async getAdminList(dto: any, currentAdminGroup?: number) {
    const page = this.safeInt(dto.page, 1);
    const pageSize = this.safeInt(dto.pageSize, 20);
    const adminGroup = this.safeOptionalInt(dto.adminGroup);
    const status = this.safeOptionalInt(dto.status);
    const { keyword } = dto;

    const query = this.adminRepo.createQueryBuilder('admin');

    // 只显示当前管理组的管理员（超级管理员可以看到所有）
    if (currentAdminGroup !== undefined && currentAdminGroup !== 0) {
      query.andWhere('admin.adminGroup = :adminGroup', { adminGroup: currentAdminGroup });
    }

    if (adminGroup !== undefined) {
      query.andWhere('admin.adminGroup = :adminGroup', { adminGroup });
    }

    if (status !== undefined) {
      query.andWhere('admin.status = :status', { status });
    }

    if (keyword) {
      query.andWhere(
        '(admin.username ILIKE :keyword OR admin.nickname ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    query
      .orderBy('admin.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map((a) => ({
        id: a.id,
        username: a.username,
        nickname: a.nickname,
        role: a.role,
        adminGroup: a.adminGroup ?? 0,
        status: a.status,
        lastLoginAt: this.formatDate(a.lastLoginAt),
        lastLoginIp: a.lastLoginIp,
        createdAt: this.formatDate(a.createdAt),
      })),
      total,
    };
  }

  /**
   * 创建管理员
   */
  async createAdmin(dto: any) {
    // 检查用户名是否已存在
    const existing = await this.adminRepo.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw BusinessException.adminUsernameExists();
    }

    // 密码加密
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const admin = this.adminRepo.create({
      username: dto.username,
      passwordHash,
      nickname: dto.nickname,
      role: dto.role || 'admin',
      adminGroup: dto.adminGroup ?? 0,
      status: dto.status ?? 1,
    });

    await this.adminRepo.save(admin);

    return { id: admin.id };
  }

  /**
   * 更新管理员
   */
  async updateAdmin(id: number, dto: any) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) {
      throw BusinessException.adminNotFound();
    }

    if (dto.nickname !== undefined) admin.nickname = dto.nickname;
    if (dto.role !== undefined) admin.role = dto.role;
    if (dto.adminGroup !== undefined) admin.adminGroup = dto.adminGroup;
    if (dto.status !== undefined) admin.status = dto.status;

    // 如果要修改密码
    if (dto.password) {
      admin.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    await this.adminRepo.save(admin);

    return {};
  }

  /**
   * 删除管理员
   */
  async deleteAdmin(id: number) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) {
      throw BusinessException.adminNotFound();
    }

    // 不能删除自己
    // TODO: 需要传入当前管理员ID进行比较

    await this.adminRepo.remove(admin);
    return {};
  }

  /**
   * 分配用户给管理员
   */
  async assignUserToAdmin(userId: number, assignedAdminId: number | null, operatorId: number, ip?: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw BusinessException.userNotFound();
    }

    // 验证管理员是否存在
    if (assignedAdminId !== null) {
      const admin = await this.adminRepo.findOne({ where: { id: assignedAdminId } });
      if (!admin) {
        throw new BusinessException(1001, '指定的管理员不存在');
      }
    }

    user.assignedAdminId = assignedAdminId;
    await this.userRepo.save(user);

    // 记录操作日志
    await this.logAdminAction(
      operatorId,
      '用户管理',
      `将用户 ${userId} 分配给管理员 ${assignedAdminId || '(无)'}`,
      'User',
      userId,
      ip,
    );

    return {};
  }

  /**
   * 获取币种列表
   */
  async getCurrencyList(dto: CurrencyListDto) {
    const page = this.safeInt(dto.page, 1);
    const pageSize = this.safeInt(dto.pageSize, 20);
    const status = this.safeOptionalInt(dto.status);
    const { keyword } = dto;

    const where: FindOptionsWhere<Coin> = {};

    if (status !== undefined) {
      where.status = status;
    }

    const query = this.coinRepo.createQueryBuilder('coin');

    if (keyword) {
      query.andWhere(
        '(coin.name ILIKE :keyword OR coin.symbol ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (status !== undefined) {
      query.andWhere('coin.status = :status', { status });
    }

    query
      .orderBy('coin.sortOrder', 'ASC')
      .addOrderBy('coin.id', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map((coin) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        icon: coin.icon,
        status: coin.status,
        sort: coin.sortOrder,
        createdAt: this.formatDate(coin.createdAt),
      })),
      total,
    };
  }

  /**
   * 创建币种
   */
  async createCurrency(dto: CreateCurrencyDto) {
    // 检查 symbol 是否已存在
    const existing = await this.coinRepo.findOne({
      where: { symbol: dto.symbol },
    });
    if (existing) {
      throw BusinessException.currencyExists();
    }

    const coin = this.coinRepo.create({
      name: dto.name,
      symbol: dto.symbol,
      icon: dto.icon || null,
      status: dto.status ?? 1,
      sortOrder: dto.sort ?? 0,
    });
    await this.coinRepo.save(coin);

    return { id: coin.id };
  }

  /**
   * 更新币种
   */
  async updateCurrency(id: number, dto: UpdateCurrencyDto) {
    const coin = await this.coinRepo.findOne({ where: { id } });
    if (!coin) {
      throw BusinessException.currencyNotFound();
    }

    // 如果要修改 symbol，检查是否与其他币种冲突
    if (dto.symbol && dto.symbol !== coin.symbol) {
      const existing = await this.coinRepo.findOne({
        where: { symbol: dto.symbol },
      });
      if (existing) {
        throw BusinessException.currencyExists();
      }
    }

    if (dto.name !== undefined) coin.name = dto.name;
    if (dto.symbol !== undefined) coin.symbol = dto.symbol;
    if (dto.icon !== undefined) coin.icon = dto.icon;
    if (dto.status !== undefined) coin.status = dto.status;
    if (dto.sort !== undefined) coin.sortOrder = dto.sort;

    await this.coinRepo.save(coin);
    return {};
  }

  /**
   * 删除币种
   */
  async deleteCurrency(id: number) {
    const coin = await this.coinRepo.findOne({ where: { id } });
    if (!coin) {
      throw BusinessException.currencyNotFound();
    }

    await this.coinRepo.remove(coin);
    return {};
  }

  // ==================== 用户管理 ====================

  async getUserList(dto: UserListDto, currentAdminGroup?: number, currentAdminId?: number) {
    const page = this.safeInt(dto.page, 1);
    const pageSize = this.safeInt(dto.pageSize, 20);
    const status = this.safeOptionalInt(dto.status);
    const kycStatus = this.safeOptionalInt(dto.kycStatus);
    const isInternal = this.safeOptionalInt(dto.isInternal);
    const vipLevel = this.safeOptionalInt(dto.vipLevel);
    const assignedAdminId = this.safeOptionalInt(dto.assignedAdminId);
    const { keyword } = dto;

    const query = this.userRepo.createQueryBuilder('user')
      .where('user.deletedAt IS NULL');

    // 管理员分组过滤：如果不是超级管理员(adminGroup=0)，只显示分配给该管理员的用户
    if (currentAdminGroup !== undefined && currentAdminGroup !== 0 && currentAdminId) {
      query.andWhere('user.assignedAdminId = :currentAdminId', { currentAdminId });
    }

    if (keyword) {
      query.andWhere(
        '(user.username ILIKE :keyword OR user.uid ILIKE :keyword OR user.nickname ILIKE :keyword OR user.tronAddress ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (status !== undefined) {
      query.andWhere('user.status = :status', { status });
    }

    if (kycStatus !== undefined) {
      query.andWhere('user.kycStatus = :kycStatus', { kycStatus });
    }

    if (isInternal !== undefined) {
      query.andWhere('user.isInternal = :isInternal', { isInternal });
    }

    if (vipLevel !== undefined) {
      query.andWhere('user.level = :vipLevel', { vipLevel });
    }

    if (assignedAdminId !== undefined) {
      query.andWhere('user.assignedAdminId = :assignedAdminId', { assignedAdminId });
    }

    const skipValue = (page - 1) * pageSize;

    query
      .orderBy('user.createdAt', 'DESC')
      .skip(skipValue)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    // 获取统计数据
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = await this.userRepo.createQueryBuilder('u')
      .where('u.deletedAt IS NULL')
      .andWhere('u.createdAt >= :today', { today })
      .getCount();

    const kycPassedCount = await this.userRepo.count({
      where: { kycStatus: 2, deletedAt: null as any }
    });

    const addressBoundCount = await this.userRepo.createQueryBuilder('u')
      .where('u.deletedAt IS NULL')
      .andWhere('u.tronAddress IS NOT NULL')
      .andWhere("u.tronAddress != ''")
      .getCount();

    // 获取所有推荐人信息
    const inviterIds = list.map(u => u.inviterId).filter(id => id);
    let invitersMap: Record<number, { username: string; uid: string }> = {};
    
    if (inviterIds.length > 0) {
      const inviters = await this.userRepo.createQueryBuilder('u')
        .select(['u.id', 'u.username', 'u.uid'])
        .where('u.id IN (:...ids)', { ids: inviterIds })
        .getMany();
      
      invitersMap = inviters.reduce((acc, inv) => {
        acc[inv.id] = { username: inv.username, uid: inv.uid };
        return acc;
      }, {} as Record<number, { username: string; uid: string }>);
    }

    // 获取用户余额
    const userIds = list.map(u => u.id);
    let balancesMap: Record<number, { usdt: string; agx: string }> = {};
    
    if (userIds.length > 0) {
      const wallets = await this.walletRepo.createQueryBuilder('w')
        .leftJoin('w.coin', 'coin')
        .select(['w.userId', 'coin.symbol', 'w.balance'])
        .where('w.userId IN (:...ids)', { ids: userIds })
        .andWhere("coin.symbol IN ('USDT', 'AGX')")
        .getRawMany();

      for (const w of wallets) {
        if (!balancesMap[w.w_user_id]) {
          balancesMap[w.w_user_id] = { usdt: '0', agx: '0' };
        }
        if (w.coin_symbol === 'USDT') {
          balancesMap[w.w_user_id].usdt = w.w_balance || '0';
        } else if (w.coin_symbol === 'AGX') {
          balancesMap[w.w_user_id].agx = w.w_balance || '0';
        }
      }
    }

    // 获取用户下级人数
    const inviteCounts = await this.userInviteRepo.createQueryBuilder('i')
      .select(['i.inviterId', 'COUNT(*) as count'])
      .where('i.inviterId IN (:...ids)', { ids: userIds.length > 0 ? userIds : [0] })
      .andWhere('i.level = 1')
      .groupBy('i.inviterId')
      .getRawMany();

    const inviteCountMap: Record<number, number> = {};
    for (const ic of inviteCounts) {
      inviteCountMap[ic.i_inviter_id] = parseInt(ic.count) || 0;
    }

    return {
      list: list.map((u) => ({
        id: u.id,
        uid: u.uid,
        username: u.username,
        nickname: u.nickname,
        avatar: u.avatar,
        inviteCode: u.inviteCode,
        inviterId: u.inviterId,
        inviter: u.inviterId ? invitersMap[u.inviterId] : null,
        inviteCount: inviteCountMap[u.id] || 0,
        tronAddress: u.tronAddress,
        usdtBalance: balancesMap[u.id]?.usdt || '0',
        agxBalance: balancesMap[u.id]?.agx || '0',
        kycStatus: u.kycStatus,
        status: u.status,
        isInternal: u.isInternal || 0,
        vipLevel: u.level || 0,
        lastLoginAt: this.formatDate(u.lastLoginAt),
        createdAt: this.formatDate(u.createdAt),
      })),
      total,
      stats: {
        total,
        today: todayCount,
        kycPassed: kycPassedCount,
        addressBound: addressBoundCount,
      }
    };
  }

  async updateUserStatus(id: number, dto: any) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw BusinessException.userNotFound();
    }
    if (dto.status !== undefined) user.status = dto.status;
    if (dto.winRate !== undefined) user.winRate = dto.winRate;
    await this.userRepo.save(user);
    return {};
  }

  /**
   * 获取用户详情（包含KYC信息、钱包信息、统计数据）
   */
  async getUserDetail(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw BusinessException.userNotFound();
    }

    // 获取KYC信息
    const kyc = await this.kycRepo.findOne({
      where: { userId: id },
      order: { createdAt: 'DESC' }
    });

    // 获取钱包列表
    const wallets = await this.walletRepo.createQueryBuilder('w')
      .leftJoinAndSelect('w.coin', 'coin')
      .where('w.userId = :userId', { userId: id })
      .getMany();

    // 获取上级推荐人信息
    let inviterName = null;
    if (user.inviterId) {
      const inviter = await this.userRepo.findOne({ 
        where: { id: user.inviterId },
        select: ['id', 'username', 'nickname']
      });
      if (inviter) {
        inviterName = inviter.nickname || inviter.username;
      }
    }

    // 获取直推人数（一级下线）
    const inviteCount = await this.userRepo.count({
      where: { inviterId: id }
    });

    // 团队人数 = 直接下级人数（只计算一级下线）
    const teamCount = inviteCount;

    // 获取累计充值金额（状态=1成功的）
    const rechargeResult = await this.rechargeRepo
      .createQueryBuilder('r')
      .select('COALESCE(SUM(CAST(r.amount AS DECIMAL)), 0)', 'total')
      .where('r.userId = :userId', { userId: id })
      .andWhere('r.status = 1')
      .getRawOne();
    const totalRecharge = parseFloat(rechargeResult?.total || '0');

    // 获取累计提现金额（状态=1已通过的）
    const withdrawResult = await this.withdrawRepo
      .createQueryBuilder('w')
      .select('COALESCE(SUM(CAST(w.amount AS DECIMAL)), 0)', 'total')
      .where('w.userId = :userId', { userId: id })
      .andWhere('w.status = 1')
      .getRawOne();
    const totalWithdraw = parseFloat(withdrawResult?.total || '0');

    // 用户基本信息
    const userData = {
      id: user.id,
      uid: user.uid,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      inviteCode: user.inviteCode,
      inviterId: user.inviterId,
      inviterName,
      kycStatus: user.kycStatus,
      status: user.status,
      winRate: user.winRate ?? 50,
      level: user.level,
      vipLevel: user.level || 0,
      isInternal: user.isInternal || 0,
      role: user.role,
      remark: user.remark,
      tronAddress: user.tronAddress,
      teamCount,
      lastLoginAt: this.formatDate(user.lastLoginAt),
      lastLoginIp: user.lastLoginIp,
      createdAt: this.formatDate(user.createdAt),
      updatedAt: this.formatDate(user.updatedAt),
    };

    // KYC信息
    const kycData = kyc ? {
      id: kyc.id,
      realName: kyc.realName,
      idNumber: kyc.idNumber,
      idType: kyc.idType,
      frontImage: kyc.frontImage,
      backImage: kyc.backImage,
      holdImage: kyc.holdImage,
      status: kyc.status,
      remark: kyc.remark,
      reviewedAt: this.formatDate(kyc.reviewedAt),
      createdAt: this.formatDate(kyc.createdAt),
    } : null;

    // 钱包信息（转换为资产格式）
    const assets = wallets.map(w => ({
      coin: w.coin?.symbol || 'UNKNOWN',
      balance: w.balance,
      frozen: w.frozen,
    }));

    // 计算用户USDT总资产（余额+冻结）
    const usdtWallet = wallets.find(w => w.coin?.symbol === 'USDT');
    const totalAssets = usdtWallet 
      ? (parseFloat(usdtWallet.balance || '0') + parseFloat(usdtWallet.frozen || '0')).toFixed(2)
      : '0.00';

    return {
      user: userData,
      kyc: kycData,
      assets,
      totalAssets, // 新增：后端计算的USDT总资产
      inviteCount,
      totalRecharge,
      totalWithdraw,
    };
  }

  /**
   * 调整用户资金（增加/减少）
   */
  async adjustUserFunds(id: number, dto: any, adminId?: number, ip?: string) {
    const { coin, amount, type, remark } = dto; // type: 'increase' | 'decrease'

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw BusinessException.userNotFound();
    }

    // 查找币种
    const coinEntity = await this.coinRepo.findOne({ where: { symbol: coin, status: 1 } });
    if (!coinEntity) {
      throw new BusinessException(7002, '币种不存在或已禁用');
    }

    const queryRunner = this.userRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 查找或创建钱包
      let wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: id, coinId: coinEntity.id }
      });

      if (!wallet) {
        wallet = queryRunner.manager.create(Wallet, {
          userId: id,
          coinId: coinEntity.id,
          balance: '0',
          frozen: '0',
        });
      }

      const currentBalance = parseFloat(wallet.balance || '0');
      const adjustAmount = parseFloat(amount);
      const newBalance = type === 'increase'
        ? currentBalance + adjustAmount
        : currentBalance - adjustAmount;

      if (newBalance < 0) {
        throw new BusinessException(7003, '余额不足，无法扣减');
      }

      // 更新钱包余额
      wallet.balance = newBalance.toFixed(8);
      await queryRunner.manager.save(Wallet, wallet);

      // 记录资产流水
      const assetLog = queryRunner.manager.create(AssetLog, {
        userId: id,
        coin: coin,
        type: type === 'increase' ? 'admin_recharge' : 'admin_deduct',
        amount: amount,
        balanceBefore: currentBalance.toFixed(8),
        balanceAfter: newBalance.toFixed(8),
        refNo: 'ADMIN_' + Date.now(),
        remark: remark || (type === 'increase' ? '后台充值' : '后台扣款'),
      });
      await queryRunner.manager.save(AssetLog, assetLog);

      await queryRunner.commitTransaction();

      // 记录操作日志
      if (adminId) {
        const actionText = type === 'increase' ? '增加资金' : '扣减资金';
        await this.logAdminAction(
          adminId,
          `用户管理-${actionText}`,
          `用户:${user.username}(ID:${id}), 币种:${coin}, 金额:${amount}, 备注:${remark || '无'}`,
          'user',
          id,
          ip
        );
      }

      return {
        userId: id,
        coin,
        type,
        amount,
        balanceBefore: currentBalance.toFixed(8),
        balanceAfter: newBalance.toFixed(8),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 更新用户备注
   */
  async updateUserRemark(id: number, dto: any, adminId?: number, ip?: string) {
    const { remark } = dto;

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw BusinessException.userNotFound();
    }

    const oldRemark = user.remark || '无';
    user.remark = remark || '';
    await this.userRepo.save(user);

    // 记录操作日志
    if (adminId) {
      await this.logAdminAction(
        adminId,
        '用户管理-更新备注',
        `用户:${user.username}(ID:${id}), 旧备注:${oldRemark}, 新备注:${remark || '无'}`,
        'user',
        id,
        ip
      );
    }

    return {};
  }

  /**
   * 重置用户登录密码
   */
  async resetUserPassword(id: number, newPassword: string, adminId?: number, ip?: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw BusinessException.userNotFound();
    }

    if (!newPassword || newPassword.length < 6) {
      throw new BusinessException(7010, '密码长度至少6位');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await this.userRepo.save(user);

    // 记录操作日志
    if (adminId) {
      await this.logAdminAction(
        adminId,
        '重置登录密码',
        `用户:${user.username}(ID:${id})`,
        'user',
        id,
        ip
      );
    }

    return { code: 0, msg: '登录密码重置成功' };
  }

  /**
   * 重置用户支付密码
   */
  async resetUserTradePassword(id: number, newPassword: string, adminId?: number, ip?: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw BusinessException.userNotFound();
    }

    if (!newPassword || newPassword.length < 6) {
      throw new BusinessException(7011, '支付密码长度至少6位');
    }

    const tradePasswordHash = await bcrypt.hash(newPassword, 10);
    user.tradePasswordHash = tradePasswordHash;
    user.hasTradePassword = 1;
    await this.userRepo.save(user);

    // 记录操作日志
    if (adminId) {
      await this.logAdminAction(
        adminId,
        '重置支付密码',
        `用户:${user.username}(ID:${id})`,
        'user',
        id,
        ip
      );
    }

    return { code: 0, msg: '支付密码重置成功' };
  }

  /**
   * 更新用户实名信息（KYC）
   */
  async updateUserKyc(id: number, dto: { realName?: string; idNumber?: string; idType?: number }, adminId?: number, ip?: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw BusinessException.userNotFound();
    }

    // 查找或创建KYC记录
    let kyc = await this.kycRepo.findOne({ where: { userId: id } });
    
    if (!kyc) {
      // 创建新的KYC记录
      kyc = this.kycRepo.create({
        userId: id,
        realName: dto.realName || '',
        idNumber: dto.idNumber || '',
        idType: dto.idType || 1,
        status: 1, // 管理员设置直接通过
        reviewedAt: new Date(),
      });
    } else {
      // 更新现有记录
      if (dto.realName !== undefined) kyc.realName = dto.realName;
      if (dto.idNumber !== undefined) kyc.idNumber = dto.idNumber;
      if (dto.idType !== undefined) kyc.idType = dto.idType;
      kyc.status = 1;
      kyc.reviewedAt = new Date();
    }
    
    await this.kycRepo.save(kyc);

    // 更新用户KYC状态
    user.kycStatus = 2; // 已认证
    await this.userRepo.save(user);

    // 记录操作日志
    if (adminId) {
      await this.logAdminAction(
        adminId,
        '更新实名信息',
        `用户:${user.username}(ID:${id}), 姓名:${dto.realName || kyc.realName}, 证件号:${dto.idNumber || kyc.idNumber}`,
        'user',
        id,
        ip
      );
    }

    return { success: true };
  }

  /**
   * 更新用户TRON充值地址
   */
  async updateUserTronAddress(id: number, tronAddress: string | null, adminId?: number, ip?: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw BusinessException.userNotFound();
    }

    // 验证地址格式
    if (tronAddress && !/^T[a-zA-Z0-9]{33}$/.test(tronAddress)) {
      throw new BusinessException(1003, '无效的TRON地址格式（应以T开头，共34位）');
    }

    // 检查地址是否已被其他用户绑定
    if (tronAddress) {
      const existingUser = await this.userRepo.findOne({
        where: { tronAddress },
      });
      if (existingUser && existingUser.id !== id) {
        throw new BusinessException(1004, '该TRON地址已被其他用户绑定');
      }
    }

    const oldAddress = user.tronAddress || '未绑定';
    user.tronAddress = tronAddress || null;
    await this.userRepo.save(user);

    // 记录操作日志
    if (adminId) {
      await this.logAdminAction(
        adminId,
        '用户管理-修改TRON地址',
        `用户:${user.username}(ID:${id}), 旧地址:${oldAddress}, 新地址:${tronAddress || '已清除'}`,
        'user',
        id,
        ip
      );
    }

    return {};
  }

  /**
   * 设置用户为内部用户
   * 内部用户的充值/提现不计入总账统计
   * 内部用户自动通过KYC认证
   * 取消内部用户时，如果没有真实KYC记录，需要重新认证
   */
  async setUserInternal(id: number, isInternal: number, adminId?: number, ip?: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw BusinessException.userNotFound();
    }

    const oldValue = user.isInternal || 0;
    user.isInternal = isInternal ? 1 : 0;

    // 设置为内部用户：自动通过KYC认证
    if (isInternal && !oldValue) {
      user.kycStatus = 2; // 设置为已认证
      this.logger.log(`用户 ${user.username}(ID:${id}) 被设置为内部用户，自动通过KYC认证`);
    }

    // 取消内部用户：检查是否有真实的KYC认证记录
    if (!isInternal && oldValue) {
      const realKyc = await this.kycRepo.findOne({
        where: { userId: id, status: 2 } // 2 = 已通过的真实KYC记录
      });

      if (!realKyc) {
        // 没有真实的KYC记录，重置为未认证
        user.kycStatus = 0;
        this.logger.log(`用户 ${user.username}(ID:${id}) 取消内部用户身份，无真实KYC记录，重置为未认证`);
      } else {
        // 有真实的KYC记录，保持已认证状态
        this.logger.log(`用户 ${user.username}(ID:${id}) 取消内部用户身份，保留真实KYC认证状态`);
      }
    }

    await this.userRepo.save(user);

    // 记录操作日志
    if (adminId) {
      await this.logAdminAction(
        adminId,
        '用户管理-设置内部用户',
        `用户:${user.username}(ID:${id}), ${oldValue ? '取消内部用户' : '设为内部用户'}`,
        'user',
        id,
        ip
      );
    }

    return {};
  }

  /**
   * 变更用户推荐人
   */
  async changeUserInviter(id: number, newInviterId: number | null, adminId?: number, ip?: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw BusinessException.userNotFound();
    }

    // 不能设置自己为推荐人
    if (newInviterId && newInviterId === id) {
      throw new BusinessException(1005, '不能设置自己为推荐人');
    }

    // 验证新推荐人是否存在
    let newInviter = null;
    if (newInviterId) {
      newInviter = await this.userRepo.findOne({ where: { id: newInviterId } });
      if (!newInviter) {
        throw new BusinessException(1006, '新推荐人不存在');
      }
      // 检查是否会形成循环（新推荐人不能是当前用户的下级）
      const isSubordinate = await this.userInviteRepo.findOne({
        where: { userId: newInviterId, inviterId: id }
      });
      if (isSubordinate) {
        throw new BusinessException(1007, '不能将下级用户设置为推荐人');
      }
    }

    const oldInviterId = user.inviterId;
    const oldInviter = oldInviterId ? await this.userRepo.findOne({ where: { id: oldInviterId } }) : null;

    // 更新用户的推荐人
    user.inviterId = newInviterId;
    await this.userRepo.save(user);

    // 更新原推荐人的邀请计数
    if (oldInviterId) {
      await this.userRepo.decrement({ id: oldInviterId }, 'inviteCount', 1);
    }

    // 更新新推荐人的邀请计数
    if (newInviterId) {
      await this.userRepo.increment({ id: newInviterId }, 'inviteCount', 1);
    }

    // 更新邀请关系表
    // 删除旧的邀请关系
    if (oldInviterId) {
      await this.userInviteRepo.delete({ userId: id, inviterId: oldInviterId, level: 1 });
    }

    // 创建新的邀请关系
    if (newInviterId) {
      const existingRelation = await this.userInviteRepo.findOne({
        where: { userId: id, inviterId: newInviterId, level: 1 }
      });
      if (!existingRelation) {
        await this.userInviteRepo.save({
          userId: id,
          inviterId: newInviterId,
          level: 1,
        });
      }
    }

    // 记录操作日志
    if (adminId) {
      const oldName = oldInviter ? `${oldInviter.username}(ID:${oldInviterId})` : '无';
      const newName = newInviter ? `${newInviter.username}(ID:${newInviterId})` : '无';
      await this.logAdminAction(
        adminId,
        '用户管理-变更推荐人',
        `用户:${user.username}(ID:${id}), 原推荐人:${oldName}, 新推荐人:${newName}`,
        'user',
        id,
        ip
      );
    }

    return {
      oldInviterId,
      newInviterId,
    };
  }

  // ==================== 矿池产品管理 ====================

  async getPoolProductList(dto: PoolProductListDto) {
    const page = this.safeInt(dto.page, 1);
    const pageSize = this.safeInt(dto.pageSize, 20);
    const status = this.safeOptionalInt(dto.status);
    const { type } = dto;

    const query = this.poolProductRepo.createQueryBuilder('p');

    if (type) {
      query.andWhere('p.type = :type', { type });
    }
    if (status !== undefined) {
      query.andWhere('p.status = :status', { status });
    }

    query
      .orderBy('p.sortOrder', 'ASC')
      .addOrderBy('p.id', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map((p) => ({
        id: p.id,
        name: p.name,
        coinId: p.coinId,
        type: p.type,
        lockDays: p.lockDays,
        dailyRate: p.dailyRate,
        minAmount: p.minAmount,
        maxAmount: p.maxAmount,
        totalQuota: p.totalQuota,
        soldAmount: p.soldAmount,
        payCurrencies: p.payCurrencies,
        isHot: p.isHot,
        sortOrder: p.sortOrder,
        status: p.status,
        incomeCoinId: p.incomeCoinId,
        // 扩展字段
        image: p.image,
        region: p.region,
        robotRent: p.robotRent,
        robotDays: p.robotDays,
        minRate: p.minRate,
        maxRate: p.maxRate,
        maxInvestCount: p.maxInvestCount,
        vipLevels: p.vipLevels,
        shares: p.shares,
        investDays: p.investDays,
        startTime: p.startTime,
        endTime: p.endTime,
        progress: p.progress,
        // 开关字段
        enableRedpacket: p.enableRedpacket,
        redpacketPercent: p.redpacketPercent,
        enableDividend: p.enableDividend,
        dividendPercent: p.dividendPercent,
        enableDoubleExp: p.enableDoubleExp,
        enableVipBonus: p.enableVipBonus,
        vipBonusRates: p.vipBonusRates,
        createdAt: this.formatDate(p.createdAt),
      })),
      total,
    };
  }

  async createPoolProduct(dto: CreatePoolProductDto) {
    // 验证币种是否存在
    const inputCoin = await this.coinRepo.findOne({ where: { id: dto.coinId } });
    if (!inputCoin) {
      throw new BusinessException(3010, `投入币种 ID ${dto.coinId} 不存在`);
    }

    // 验证收益币种
    if (dto.incomeCoinId) {
      const incomeCoin = await this.coinRepo.findOne({ where: { id: dto.incomeCoinId } });
      if (!incomeCoin) {
        throw new BusinessException(3011, `收益币种 ID ${dto.incomeCoinId} 不存在`);
      }
    }

    // 验证日收益率格式
    if (!dto.dailyRate && dto.dailyRate !== '0') {
      throw new BusinessException(3012, '日收益率不能为空');
    }
    const dailyRate = new Decimal(String(dto.dailyRate || 0));
    if (dailyRate.lt(0) || dailyRate.gt(1)) {
      throw new BusinessException(3012, '日收益率必须在 0-1 之间');
    }

    // 验证金额
    if (!dto.minAmount && dto.minAmount !== '0') {
      throw new BusinessException(3013, '最小金额不能为空');
    }
    const minAmount = new Decimal(String(dto.minAmount || 0));
    if (minAmount.lte(0)) {
      throw new BusinessException(3013, '最小金额必须大于 0');
    }

    if (dto.maxAmount) {
      const maxAmount = new Decimal(dto.maxAmount);
      if (maxAmount.lt(minAmount)) {
        throw new BusinessException(3014, '最大金额不能小于最小金额');
      }
    }

    if (dto.totalQuota) {
      const totalQuota = new Decimal(dto.totalQuota);
      if (totalQuota.lt(minAmount)) {
        throw new BusinessException(3015, '总额度不能小于最小金额');
      }
    }

    // 验证定期产品的锁定天数
    if (dto.type === 'fixed' && dto.lockDays <= 0) {
      throw new BusinessException(3016, '定期产品的锁定天数必须大于 0');
    }

    const product = this.poolProductRepo.create({
      name: dto.name,
      coinId: dto.coinId,
      type: dto.type,
      lockDays: dto.lockDays,
      dailyRate: dto.dailyRate,
      minAmount: dto.minAmount,
      maxAmount: dto.maxAmount || null,
      totalQuota: dto.totalQuota || null,
      soldAmount: '0',
      payCurrencies: dto.payCurrencies || 'USDT',
      incomeCoinId: dto.incomeCoinId || null,
      isHot: dto.isHot ?? 0,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? 1,
      // 扩展字段
      image: dto.image || null,
      region: dto.region || null,
      robotRent: dto.robotRent || '0',
      robotDays: dto.robotDays ?? 7,
      minRate: dto.minRate || '0',
      maxRate: dto.maxRate || '0',
      maxInvestCount: dto.maxInvestCount ?? 0,
      vipLevels: dto.vipLevels || null,
      shares: dto.shares || '0',
      investDays: dto.investDays ?? 0,
      startTime: dto.startTime ? new Date(dto.startTime) : null,
      endTime: dto.endTime ? new Date(dto.endTime) : null,
      progress: dto.progress || '0',
      enableRedpacket: dto.enableRedpacket ?? 0,
      redpacketPercent: dto.redpacketPercent || '0',
      enableDividend: dto.enableDividend ?? 0,
      dividendPercent: dto.dividendPercent || '0',
      enableDoubleExp: dto.enableDoubleExp ?? 0,
      enableVipBonus: dto.enableVipBonus ?? 0,
      vipBonusRates: typeof dto.vipBonusRates === 'string' ? JSON.parse(dto.vipBonusRates || '{}') : (dto.vipBonusRates || null),
    });
    await this.poolProductRepo.save(product);

    this.logger.log(`创建矿池产品成功: ${product.id} - ${product.name} (${inputCoin.symbol} → ${dto.incomeCoinId ? 'USDT' : inputCoin.symbol})`);

    return { id: product.id };
  }

  async updatePoolProduct(id: number, dto: UpdatePoolProductDto) {
    const product = await this.poolProductRepo.findOne({ where: { id } });
    if (!product) {
      throw new BusinessException(3001, '矿池产品不存在');
    }

    // 基础字段
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.coinId !== undefined) product.coinId = dto.coinId;
    if (dto.type !== undefined) product.type = dto.type;
    if (dto.lockDays !== undefined) product.lockDays = dto.lockDays;
    if (dto.dailyRate !== undefined) product.dailyRate = dto.dailyRate;
    if (dto.minAmount !== undefined) product.minAmount = dto.minAmount;
    if (dto.maxAmount !== undefined) product.maxAmount = dto.maxAmount;
    if (dto.totalQuota !== undefined) product.totalQuota = dto.totalQuota;
    if (dto.payCurrencies !== undefined) product.payCurrencies = dto.payCurrencies;
    if (dto.incomeCoinId !== undefined) product.incomeCoinId = dto.incomeCoinId;
    if (dto.isHot !== undefined) product.isHot = dto.isHot;
    if (dto.sortOrder !== undefined) product.sortOrder = dto.sortOrder;
    if (dto.status !== undefined) product.status = dto.status;

    // 扩展字段
    if (dto.image !== undefined) product.image = dto.image;
    if (dto.region !== undefined) product.region = dto.region;
    if (dto.robotRent !== undefined) product.robotRent = dto.robotRent;
    if (dto.robotDays !== undefined) product.robotDays = dto.robotDays;
    if (dto.minRate !== undefined) product.minRate = dto.minRate;
    if (dto.maxRate !== undefined) product.maxRate = dto.maxRate;
    if (dto.maxInvestCount !== undefined) product.maxInvestCount = dto.maxInvestCount;
    if (dto.vipLevels !== undefined) product.vipLevels = dto.vipLevels;
    if (dto.shares !== undefined) product.shares = dto.shares;
    if (dto.investDays !== undefined) product.investDays = dto.investDays;
    if (dto.startTime !== undefined) product.startTime = dto.startTime ? new Date(dto.startTime) : null;
    if (dto.endTime !== undefined) product.endTime = dto.endTime ? new Date(dto.endTime) : null;
    if (dto.progress !== undefined) product.progress = dto.progress;

    // 开关字段
    if (dto.enableRedpacket !== undefined) product.enableRedpacket = dto.enableRedpacket;
    if (dto.redpacketPercent !== undefined) product.redpacketPercent = dto.redpacketPercent;
    if (dto.enableDividend !== undefined) product.enableDividend = dto.enableDividend;
    if (dto.dividendPercent !== undefined) product.dividendPercent = dto.dividendPercent;
    if (dto.enableDoubleExp !== undefined) product.enableDoubleExp = dto.enableDoubleExp;
    if (dto.enableVipBonus !== undefined) product.enableVipBonus = dto.enableVipBonus;
    if (dto.vipBonusRates !== undefined) {
      // 处理JSON字符串或对象
      if (typeof dto.vipBonusRates === 'string') {
        try {
          product.vipBonusRates = JSON.parse(dto.vipBonusRates);
        } catch (e) {
          product.vipBonusRates = {};
        }
      } else {
        product.vipBonusRates = dto.vipBonusRates;
      }
    }

    await this.poolProductRepo.save(product);
    return {};
  }

  async deletePoolProduct(id: number) {
    const product = await this.poolProductRepo.findOne({ where: { id } });
    if (!product) {
      throw new BusinessException(3001, '矿池产品不存在');
    }
    await this.poolProductRepo.remove(product);
    return {};
  }

  /**
   * 矿池产品统计
   */
  async getPoolProductStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 在售产品数
    const activeCount = await this.poolProductRepo.count({ where: { status: 1 } });

    // 总销售额
    const soldStats = await this.poolProductRepo
      .createQueryBuilder('p')
      .select('SUM(CAST(p.soldAmount AS DECIMAL))', 'total')
      .getRawOne();

    // 持仓用户数（去重）
    const holdingUsers = await this.poolHoldingRepo
      .createQueryBuilder('h')
      .select('COUNT(DISTINCT h.userId)', 'count')
      .where('h.status = :status', { status: 1 })
      .getRawOne();

    // 今日收益（从 pool_income 表统计）
    const todayIncomeStats = await this.poolHoldingRepo.manager
      .createQueryBuilder()
      .select('COALESCE(SUM(CAST(amount AS DECIMAL)), 0)', 'total')
      .from('agx_pool_income', 'i')
      .where('i.income_date = :today', { today: today.toISOString().split('T')[0] })
      .getRawOne();

    return {
      activeCount,
      totalSold: parseFloat(soldStats?.total || '0').toFixed(2),
      todayIncome: parseFloat(todayIncomeStats?.total || '0').toFixed(2),
      holdingUsers: parseInt(holdingUsers?.count || '0'),
    };
  }

  /**
   * 新币预售统计
   */
  async getCoinIssueStats() {
    // 从 coin_issue 表获取统计数据
    const stats = await this.coinIssueRepo
      .createQueryBuilder('c')
      .select('SUM(CAST(c.totalSubscribed AS DECIMAL))', 'totalSubscribed')
      .addSelect('SUM(c.subscriberCount)', 'totalParticipants')
      .addSelect('SUM(CAST(c.totalSubscribed AS DECIMAL) * CAST(c.issuePrice AS DECIMAL))', 'totalRaised')
      .getRawOne();

    // 活动数量
    const activeCount = await this.coinIssueRepo.count({ where: { status: 1 } });
    const totalCount = await this.coinIssueRepo.count();

    return {
      soldAmount: parseFloat(stats?.totalSubscribed || '0').toFixed(2),
      raisedUsdt: parseFloat(stats?.totalRaised || '0').toFixed(2),
      participants: parseInt(stats?.totalParticipants || '0'),
      activeCount,
      totalCount,
    };
  }

  // ==================== 秒合约配置管理 ====================

  async getContractConfigList(dto: ContractConfigListDto) {
    const page = this.safeInt(dto.page, 1);
    const pageSize = this.safeInt(dto.pageSize, 20);
    const status = this.safeOptionalInt(dto.status);
    const { symbol } = dto;

    const query = this.contractConfigRepo.createQueryBuilder('c');

    if (symbol) {
      query.andWhere('c.symbol = :symbol', { symbol });
    }
    if (status !== undefined) {
      query.andWhere('c.status = :status', { status });
    }

    query
      .orderBy('c.symbol', 'ASC')
      .addOrderBy('c.duration', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map((c) => ({
        id: c.id,
        symbol: c.symbol,
        name: c.name,
        duration: c.duration,
        profitRate: c.profitRate,
        minAmount: c.minAmount,
        maxAmount: c.maxAmount,
        payCurrencies: c.payCurrencies,
        status: c.status,
        createdAt: this.formatDate(c.createdAt),
      })),
      total,
    };
  }

  async createContractConfig(dto: CreateContractConfigDto) {
    const config = this.contractConfigRepo.create({
      symbol: dto.symbol,
      name: dto.name,
      duration: dto.duration,
      profitRate: dto.profitRate,
      minAmount: dto.minAmount,
      maxAmount: dto.maxAmount,
      payCurrencies: dto.payCurrencies || 'USDT',
      status: dto.status ?? 1,
    });
    await this.contractConfigRepo.save(config);
    return { id: config.id };
  }

  async updateContractConfig(id: number, dto: UpdateContractConfigDto) {
    const config = await this.contractConfigRepo.findOne({ where: { id } });
    if (!config) {
      throw new BusinessException(4001, '合约配置不存在');
    }

    if (dto.name !== undefined) config.name = dto.name;
    if (dto.profitRate !== undefined) config.profitRate = dto.profitRate;
    if (dto.minAmount !== undefined) config.minAmount = dto.minAmount;
    if (dto.maxAmount !== undefined) config.maxAmount = dto.maxAmount;
    if (dto.payCurrencies !== undefined) config.payCurrencies = dto.payCurrencies;
    if (dto.status !== undefined) config.status = dto.status;

    await this.contractConfigRepo.save(config);
    return {};
  }

  async deleteContractConfig(id: number) {
    const config = await this.contractConfigRepo.findOne({ where: { id } });
    if (!config) {
      throw new BusinessException(4001, '合约配置不存在');
    }
    await this.contractConfigRepo.remove(config);
    return {};
  }

  // ==================== 仪表盘统计 ====================

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 本周开始
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    // 用户统计
    const totalUsers = await this.userRepo.count();
    const todayUsers = await this.userRepo
      .createQueryBuilder('u')
      .where('u.createdAt >= :today', { today })
      .getCount();
    const yesterdayUsers = await this.userRepo
      .createQueryBuilder('u')
      .where('u.createdAt >= :yesterday AND u.createdAt < :today', { yesterday, today })
      .getCount();
    const weekUsers = await this.userRepo
      .createQueryBuilder('u')
      .where('u.createdAt >= :weekStart', { weekStart })
      .getCount();

    // 充值统计（排除内部用户）
    const totalRechargeStats = await this.rechargeRepo
      .createQueryBuilder('r')
      .leftJoin('agx_user', 'u', 'u.id = r.user_id')
      .select('SUM(CAST(r.amount AS DECIMAL))', 'total')
      .where('r.status = :status', { status: 1 })
      .andWhere('(u.is_internal IS NULL OR u.is_internal = 0)')
      .getRawOne();

    const todayRechargeStats = await this.rechargeRepo
      .createQueryBuilder('r')
      .leftJoin('agx_user', 'u', 'u.id = r.user_id')
      .select('SUM(CAST(r.amount AS DECIMAL))', 'total')
      .where('r.createdAt >= :today', { today })
      .andWhere('r.status = :status', { status: 1 })
      .andWhere('(u.is_internal IS NULL OR u.is_internal = 0)')
      .getRawOne();

    const yesterdayRechargeStats = await this.rechargeRepo
      .createQueryBuilder('r')
      .leftJoin('agx_user', 'u', 'u.id = r.user_id')
      .select('SUM(CAST(r.amount AS DECIMAL))', 'total')
      .where('r.createdAt >= :yesterday AND r.createdAt < :today', { yesterday, today })
      .andWhere('r.status = :status', { status: 1 })
      .andWhere('(u.is_internal IS NULL OR u.is_internal = 0)')
      .getRawOne();

    // 提现统计（排除内部用户）
    const totalWithdrawStats = await this.withdrawRepo
      .createQueryBuilder('w')
      .leftJoin('agx_user', 'u', 'u.id = w.user_id')
      .select('SUM(CAST(w.amount AS DECIMAL))', 'total')
      .where('w.status IN (:...statuses)', { statuses: [1, 2] })
      .andWhere('(u.is_internal IS NULL OR u.is_internal = 0)')
      .getRawOne();

    const todayWithdrawStats = await this.withdrawRepo
      .createQueryBuilder('w')
      .leftJoin('agx_user', 'u', 'u.id = w.user_id')
      .select('SUM(CAST(w.amount AS DECIMAL))', 'total')
      .where('w.createdAt >= :today', { today })
      .andWhere('w.status IN (:...statuses)', { statuses: [1, 2] })
      .andWhere('(u.is_internal IS NULL OR u.is_internal = 0)')
      .getRawOne();

    const yesterdayWithdrawStats = await this.withdrawRepo
      .createQueryBuilder('w')
      .leftJoin('agx_user', 'u', 'u.id = w.user_id')
      .select('SUM(CAST(w.amount AS DECIMAL))', 'total')
      .where('w.createdAt >= :yesterday AND w.createdAt < :today', { yesterday, today })
      .andWhere('w.status IN (:...statuses)', { statuses: [1, 2] })
      .andWhere('(u.is_internal IS NULL OR u.is_internal = 0)')
      .getRawOne();

    const pendingWithdraw = await this.withdrawRepo.count({ where: { status: 0 } });
    const pendingRecharge = await this.rechargeRepo.count({ where: { status: 0 } });

    // 合约订单统计
    const totalOrders = await this.contractOrderRepo.count();
    const todayOrders = await this.contractOrderRepo
      .createQueryBuilder('o')
      .where('o.createdAt >= :today', { today })
      .getCount();
    const yesterdayOrders = await this.contractOrderRepo
      .createQueryBuilder('o')
      .where('o.createdAt >= :yesterday AND o.createdAt < :today', { yesterday, today })
      .getCount();

    // 平台资产统计（按币种分组）
    const assetByCoins = await this.walletRepo
      .createQueryBuilder('w')
      .leftJoin('w.coin', 'coin')
      .select('coin.symbol', 'coin')
      .addSelect('SUM(CAST(w.balance AS DECIMAL) + CAST(w.frozen AS DECIMAL))', 'amount')
      .groupBy('coin.symbol')
      .getRawMany();

    // 总资产
    const totalAssets = assetByCoins.reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);

    // USDT 和 AGX 单独统计
    const totalUsdt = assetByCoins.find(a => a.coin === 'USDT')?.amount || '0';
    const totalAgx = assetByCoins.find(a => a.coin === 'AGX')?.amount || '0';

    // 矿池统计
    const poolStats = await this.poolHoldingRepo
      .createQueryBuilder('h')
      .select('SUM(CAST(h.amount AS DECIMAL))', 'total')
      .where('h.status = :status', { status: 1 })
      .getRawOne();

    // KYC待审核
    const pendingKyc = await this.kycRepo.count({ where: { status: 0 } });

    // 计算趋势百分比
    const calcTrend = (today: number, yesterday: number): number => {
      if (yesterday === 0) return today > 0 ? 100 : 0;
      return Math.round((today - yesterday) / yesterday * 100);
    };

    const todayRechargeValue = parseFloat(todayRechargeStats?.total || '0');
    const yesterdayRechargeValue = parseFloat(yesterdayRechargeStats?.total || '0');
    const todayWithdrawValue = parseFloat(todayWithdrawStats?.total || '0');
    const yesterdayWithdrawValue = parseFloat(yesterdayWithdrawStats?.total || '0');

    return {
      // 今日数据
      todayUsers,
      todayUsersTrend: calcTrend(todayUsers, yesterdayUsers),
      todayRecharge: todayRechargeValue.toFixed(2),
      todayRechargeTrend: calcTrend(todayRechargeValue, yesterdayRechargeValue),
      todayWithdraw: todayWithdrawValue.toFixed(2),
      todayWithdrawTrend: calcTrend(todayWithdrawValue, yesterdayWithdrawValue),
      todayOrders,
      todayOrdersTrend: calcTrend(todayOrders, yesterdayOrders),
      
      // 总体数据
      totalUsers,
      weekUsers,
      totalUsdt: parseFloat(totalUsdt).toFixed(2),
      totalAgx: parseFloat(totalAgx).toFixed(2),
      totalPool: parseFloat(poolStats?.total || '0').toFixed(2),
      totalRecharge: parseFloat(totalRechargeStats?.total || '0').toFixed(2),
      totalWithdraw: parseFloat(totalWithdrawStats?.total || '0').toFixed(2),
      totalAssets: totalAssets.toFixed(2),
      totalOrders,
      
      // 待处理
      pendingKyc,
      pendingWithdraw,
      pendingRecharge,
      
      // 资产分布
      assetDistribution: assetByCoins.map(item => ({
        coin: item.coin || 'Unknown',
        amount: parseFloat(item.amount || '0').toFixed(2),
      })).filter(item => parseFloat(item.amount) > 0),
    };
  }

  // 获取待审核列表(仪表盘用)
  async getPendingList() {
    // 待审核KYC
    const kycList = await this.kycRepo.find({
      where: { status: 0 },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // 待审核提现
    const withdrawList = await this.withdrawRepo.find({
      where: { status: 0 },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      pendingKyc: kycList.map(k => ({
        id: k.id,
        userId: k.userId,
        username: k.user?.username || '-',
        realName: k.realName,
        createdAt: this.formatDate(k.createdAt),
      })),
      pendingWithdraw: withdrawList.map(w => ({
        id: w.id,
        userId: w.userId,
        username: w.user?.username || '-',
        amount: w.amount,
        coin: w.coin,
        createdAt: this.formatDate(w.createdAt),
      })),
    };
  }

  /**
   * 仪表盘图表数据
   */
  async getDashboardCharts() {
    const days = 7;
    const dates: string[] = [];
    const now = new Date();
    
    // 生成近 7 天日期
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    // 用户增长趋势
    const userTrend = [];
    for (const date of dates) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      const count = await this.userRepo
        .createQueryBuilder('u')
        .where('u.createdAt >= :start AND u.createdAt < :end', {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        })
        .getCount();

      userTrend.push({
        date: date.slice(5), // MM-DD
        count,
      });
    }

    // 充提趋势
    const financeTrend = [];
    for (const date of dates) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      // 充值
      const rechargeResult = await this.rechargeRepo
        .createQueryBuilder('r')
        .select('COALESCE(SUM(CAST(r.amount AS DECIMAL)), 0)', 'total')
        .where('r.status = 1')
        .andWhere('r.createdAt >= :start AND r.createdAt < :end', {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        })
        .getRawOne();

      // 提现
      const withdrawResult = await this.withdrawRepo
        .createQueryBuilder('w')
        .select('COALESCE(SUM(CAST(w.amount AS DECIMAL)), 0)', 'total')
        .where('w.status = 1')
        .andWhere('w.createdAt >= :start AND w.createdAt < :end', {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        })
        .getRawOne();

      financeTrend.push({
        date: date.slice(5), // MM-DD
        recharge: parseFloat(rechargeResult?.total || '0'),
        withdraw: parseFloat(withdrawResult?.total || '0'),
      });
    }

    return { userTrend, financeTrend };
  }

  /**
   * 最近活动（包括操作日志、用户注册、充提等）
   */
  async getRecentActivities(limit: number = 10) {
    const activities: { content: string; createdAt: string; type: string }[] = [];

    // 获取最近的操作日志
    const logs = await this.adminLogRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['admin'],
    });
    logs.forEach(log => {
      activities.push({
        content: `管理员 ${log.admin?.username || 'admin'} ${log.action}`,
        createdAt: this.formatDate(log.createdAt),
        type: 'info',
      });
    });

    // 获取最近用户注册
    const newUsers = await this.userRepo.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });
    newUsers.forEach(user => {
      activities.push({
        content: `新用户 ${user.username} 注册`,
        createdAt: this.formatDate(user.createdAt),
        type: 'success',
      });
    });

    // 获取最近充值
    const recharges = await this.rechargeRepo.find({
      where: { status: 1 },
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['user'],
    });
    recharges.forEach(r => {
      activities.push({
        content: `${r.user?.username || '用户'} 充值 ${r.amount} ${r.coin}`,
        createdAt: this.formatDate(r.createdAt),
        type: 'success',
      });
    });

    // 获取最近提现审核
    const withdraws = await this.withdrawRepo.find({
      where: { status: 1 },
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['user'],
    });
    withdraws.forEach(w => {
      activities.push({
        content: `${w.user?.username || '用户'} 提现 ${w.amount} ${w.coin} 已审核`,
        createdAt: this.formatDate(w.createdAt),
        type: 'warning',
      });
    });

    // 按时间排序并截取
    activities.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return activities.slice(0, limit);
  }

  // ==================== 矿池持仓列表 ====================

  async getPoolHoldingList(dto: any) {
    const page = this.safeInt(dto.page, 1);
    const pageSize = this.safeInt(dto.pageSize, 20);
    const status = this.safeOptionalInt(dto.status);
    const isInternal = this.safeOptionalInt(dto.isInternal);
    const { keyword, realName, startDate, endDate } = dto;

    const query = this.poolHoldingRepo
      .createQueryBuilder('h')
      .leftJoinAndSelect('h.user', 'user')
      .leftJoinAndSelect('h.product', 'product')
      .leftJoin('agx_kyc', 'kyc', 'kyc.user_id = user.id AND kyc.status = 1')
      .addSelect('kyc.real_name', 'realName');

    if (status !== undefined) {
      query.andWhere('h.status = :status', { status });
    }
    
    // 关键词搜索（用户名）
    if (keyword) {
      query.andWhere('user.username ILIKE :keyword', { keyword: `%${keyword}%` });
    }
    
    // 实名搜索
    if (realName) {
      query.andWhere('kyc.real_name ILIKE :realName', { realName: `%${realName}%` });
    }
    
    // 内部/普通会员筛选
    if (isInternal !== undefined) {
      query.andWhere('user.isInternal = :isInternal', { isInternal });
    }

    // 购买时间日期范围筛选
    if (startDate) {
      query.andWhere('h.createdAt >= :startDate', { startDate: new Date(startDate) });
    }
    if (endDate) {
      query.andWhere('h.createdAt <= :endDate', { endDate: new Date(endDate + ' 23:59:59') });
    }

    query
      .orderBy('h.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    // 获取KYC信息
    const result = await Promise.all(list.map(async (h) => {
      let userRealName = '-';
      if (h.user?.id) {
        const kyc = await this.kycRepo.findOne({
          where: { userId: h.user.id, status: 1 }
        });
        if (kyc) {
          userRealName = kyc.realName;
        }
      }
      
      return {
        id: h.id,
        userId: h.user?.id || 0,
        username: h.user?.username || '-',
        realName: userRealName,
        isInternal: h.user?.isInternal || 0,
        productName: h.product?.name || '-',
        coin: 'USDT',
        principal: h.amount,
        profit: h.totalIncome,
        dailyRate: h.product?.dailyRate || '0',
        status: h.status === 1 ? 'holding' : 'redeemed',
        createdAt: this.formatDate(h.createdAt),
      };
    }));

    return {
      list: result,
      total,
    };
  }

  async exportPoolHoldings(dto: any) {
    const status = this.safeOptionalInt(dto.status);
    const isInternal = this.safeOptionalInt(dto.isInternal);
    const { keyword, realName, startDate, endDate } = dto;

    const query = this.poolHoldingRepo
      .createQueryBuilder('h')
      .leftJoinAndSelect('h.user', 'user')
      .leftJoinAndSelect('h.product', 'product')
      .leftJoin('agx_kyc', 'kyc', 'kyc.user_id = user.id AND kyc.status = 1')
      .addSelect('kyc.real_name', 'realName');

    if (status !== undefined) {
      query.andWhere('h.status = :status', { status });
    }
    if (keyword) {
      query.andWhere('user.username ILIKE :keyword', { keyword: `%${keyword}%` });
    }
    if (realName) {
      query.andWhere('kyc.real_name ILIKE :realName', { realName: `%${realName}%` });
    }
    if (isInternal !== undefined) {
      query.andWhere('user.isInternal = :isInternal', { isInternal });
    }

    // 购买时间日期范围筛选
    if (startDate) {
      query.andWhere('h.createdAt >= :startDate', { startDate: new Date(startDate) });
    }
    if (endDate) {
      query.andWhere('h.createdAt <= :endDate', { endDate: new Date(endDate + ' 23:59:59') });
    }

    query.orderBy('h.createdAt', 'DESC');

    const list = await query.getMany();

    // 获取KYC信息
    const result = await Promise.all(list.map(async (h) => {
      let userRealName = '-';
      if (h.user?.id) {
        const kyc = await this.kycRepo.findOne({
          where: { userId: h.user.id, status: 1 }
        });
        if (kyc) {
          userRealName = kyc.realName;
        }
      }
      
      return {
        id: h.id,
        userId: h.user?.id || 0,
        username: h.user?.username || '-',
        realName: userRealName,
        isInternal: h.user?.isInternal || 0,
        productName: h.product?.name || '-',
        coin: 'USDT',
        principal: h.amount,
        profit: h.totalIncome,
        dailyRate: h.product?.dailyRate || '0',
        status: h.status === 1 ? 'holding' : 'redeemed',
        createdAt: this.formatDate(h.createdAt),
      };
    }));

    return result;
  }

  // ==================== 合约订单列表 ====================

  async getContractOrderList(dto: any) {
    const page = this.safeInt(dto.page, 1);
    const pageSize = this.safeInt(dto.pageSize, 20);
    const { symbol, result, userId } = dto;

    const query = this.contractOrderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.user', 'user');

    if (symbol) {
      query.andWhere('o.symbol = :symbol', { symbol });
    }
    if (result) {
      query.andWhere('o.result = :result', { result });
    }
    if (userId) {
      query.andWhere('o.userId = :userId', { userId: parseInt(userId) });
    }

    query
      .orderBy('o.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map((o) => ({
        id: o.id,
        username: o.user?.username || '-',
        symbol: o.symbol,
        direction: o.direction === 1 ? 'up' : 'down',
        amount: o.amount,
        duration: o.duration,
        openPrice: o.openPrice,
        closePrice: o.closePrice,
        profit: o.profitLoss || '0',
        result: o.result === 1 ? 'win' : o.result === 2 ? 'lose' : 'pending',
        createdAt: this.formatDate(o.createdAt),
      })),
      total,
    };
  }

  // 手动结算合约订单
  async settleContractOrder(id: number, dto: any, adminId?: number, ip?: string) {
    const order = await this.contractOrderRepo.findOne({ where: { id }, relations: ['user'] });
    if (!order) {
      throw new BusinessException(6001, '订单不存在');
    }
    if (order.result !== 0) {
      throw new BusinessException(6002, '订单已结算');
    }

    const result = dto.result; // 1=win, 2=lose
    const closePrice = dto.closePrice || order.openPrice;
    const profitRate = parseFloat(order.profitRate || '0.85');
    const amount = parseFloat(order.amount);
    let profitLoss = '0';

    if (result === 1) {
      // 用户赢，返还本金+收益
      profitLoss = (amount * profitRate).toFixed(8);
      // 给用户加钱
      const wallet = await this.walletRepo.findOne({ where: { userId: order.userId, coinId: 1 } });
      if (wallet) {
        wallet.balance = (parseFloat(wallet.balance) + amount + parseFloat(profitLoss)).toFixed(8);
        await this.walletRepo.save(wallet);
      }
    } else {
      // 用户输，本金已扣除
      profitLoss = (-amount).toFixed(8);
    }

    order.result = result;
    order.closePrice = closePrice;
    order.profitLoss = profitLoss;
    order.closeAt = new Date();
    await this.contractOrderRepo.save(order);

    // 记录操作日志
    if (adminId) {
      const resultText = result === 1 ? '设赢' : '设输';
      await this.logAdminAction(
        adminId,
        `合约订单-${resultText}`,
        `订单ID:${id}, 用户:${order.user?.username}, 金额:${amount}, 盈亏:${profitLoss}`,
        'contract_order',
        id,
        ip
      );
    }

    return {};
  }

  // ==================== KYC管理 ====================

  async getKycList(dto: any) {
    const page = this.safeInt(dto.page, 1);
    const pageSize = this.safeInt(dto.pageSize, 20);
    const status = this.safeOptionalInt(dto.status);

    const query = this.kycRepo
      .createQueryBuilder('k')
      .leftJoinAndSelect('k.user', 'user');

    if (status !== undefined) {
      query.andWhere('k.status = :status', { status });
    }

    query
      .orderBy('k.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map((k) => ({
        id: k.id,
        userId: k.userId,
        username: k.user?.username || '-',
        realName: k.realName,
        idNumber: k.idNumber,
        idType: k.idType,
        frontImage: k.frontImage,
        backImage: k.backImage,
        holdImage: k.holdImage,
        status: k.status,
        remark: k.remark,
        reviewedAt: this.formatDate(k.reviewedAt),
        createdAt: this.formatDate(k.createdAt),
      })),
      total,
    };
  }

  async reviewKyc(id: number, dto: any, adminId?: number, ip?: string) {
    const kyc = await this.kycRepo.findOne({ where: { id } });
    if (!kyc) {
      throw new BusinessException(5001, 'KYC记录不存在');
    }

    // 获取用户信息用于通知
    const user = await this.userRepo.findOne({ where: { id: kyc.userId } });

    kyc.status = dto.status;
    kyc.remark = dto.remark || '';
    kyc.reviewedAt = new Date();
    await this.kycRepo.save(kyc);

    // 同步更新用户KYC状态
    if (dto.status === 1) {
      await this.userRepo.update(kyc.userId, { kycStatus: 2 });

      // 发放双向奖励（KYC通过后触发）
      try {
        await this.inviteService.processKycApproval(kyc.userId);
      } catch (err) {
        this.logger.error(`双向奖励发放失败: ${err.message}`);
      }

      // 发送 Telegram 通知（KYC 通过）
      if (user) {
        await this.telegramNotify.notifyKycApproved({
          userId: user.id,
          username: user.username,
        }).catch(err => {
          this.logger.error('Telegram 通知失败:', err.message);
        });
      }
    } else if (dto.status === 2) {
      await this.userRepo.update(kyc.userId, { kycStatus: 3 });

      // 发送 Telegram 通知（KYC 驳回）
      if (user) {
        await this.telegramNotify.notifyKycRejected({
          userId: user.id,
          username: user.username,
          reason: dto.remark || '未提供原因',
        }).catch(err => {
          this.logger.error('Telegram 通知失败:', err.message);
        });
      }
    }

    // 记录操作日志
    if (adminId) {
      const statusText = dto.status === 1 ? '通过' : '拒绝';
      await this.logAdminAction(
        adminId,
        `KYC审核-${statusText}`,
        `KYC ID:${id}, 用户ID:${kyc.userId}, 原因:${dto.remark || '无'}`,
        'kyc',
        id,
        ip
      );
    }

    return {};
  }

  // ==================== 充值记录 ====================

  async getRechargeList(dto: any) {
    const page = this.safeInt(dto.page, 1);
    const pageSize = this.safeInt(dto.pageSize, 20);
    const status = this.safeOptionalInt(dto.status);
    const { keyword, userId, username, realName } = dto;

    const query = this.rechargeRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'user')
      .leftJoinAndSelect('user.kyc', 'kyc')
      .leftJoin('agx_user', 'inviter', 'inviter.id = user.inviterId')
      .leftJoin('agx_kyc', 'inviterKyc', 'inviterKyc.userId = inviter.id')
      .addSelect(['inviter.username', 'inviterKyc.realName']);

    if (status !== undefined) {
      query.andWhere('r.status = :status', { status });
    }
    
    // 用户名搜索
    if (username) {
      query.andWhere('user.username ILIKE :username', { username: `%${username}%` });
    }
    
    // 实名搜索
    if (realName) {
      query.andWhere('kyc.realName ILIKE :realName', { realName: `%${realName}%` });
    }
    
    // 通用关键词搜索（订单号、交易哈希）
    if (keyword) {
      query.andWhere(
        '(r.orderNo ILIKE :keyword OR r.txHash ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }
    
    if (userId) {
      query.andWhere('r.userId = :userId', { userId: parseInt(userId) });
    }

    query
      .orderBy('r.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    // 获取邀请人信息
    const result = await Promise.all(list.map(async (r) => {
      let inviterUsername = '-';
      let inviterRealName = '-';
      
      if (r.user?.inviterId) {
        const inviter = await this.userRepo.findOne({
          where: { id: r.user.inviterId },
          select: ['id', 'username']
        });
        if (inviter) {
          inviterUsername = inviter.username;
          const inviterKyc = await this.kycRepo.findOne({
            where: { userId: inviter.id, status: 1 }
          });
          if (inviterKyc) {
            inviterRealName = inviterKyc.realName;
          }
        }
      }

      return {
        id: r.id,
        orderNo: r.orderNo,
        userId: r.userId,
        username: r.user?.username || '-',
        realName: r.user?.kyc?.realName || '-',
        inviterUsername,
        inviterRealName,
        coin: r.coin,
        chain: r.chain,
        amount: r.amount,
        txHash: r.txHash,
        fromAddress: r.fromAddress,
        toAddress: r.toAddress,
        status: r.status,
        confirmations: r.confirmations,
        createdAt: this.formatDate(r.createdAt),
      };
    }));

    return {
      list: result,
      total,
    };
  }

  // 充值统计（用于充值记录页面）
  async getRechargeStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 今日充值（已完成）
    const todayStats = await this.rechargeRepo
      .createQueryBuilder('r')
      .select('SUM(CAST(r.amount AS DECIMAL))', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('r.createdAt >= :today', { today })
      .andWhere('r.status = :status', { status: 1 })
      .getRawOne();

    // 本月充值（已完成）
    const monthStats = await this.rechargeRepo
      .createQueryBuilder('r')
      .select('SUM(CAST(r.amount AS DECIMAL))', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('r.createdAt >= :monthStart', { monthStart })
      .andWhere('r.status = :status', { status: 1 })
      .getRawOne();

    // 待确认数量
    const pendingCount = await this.rechargeRepo.count({ where: { status: 0 } });

    return {
      todayAmount: parseFloat(todayStats?.total || '0').toFixed(2),
      todayCount: parseInt(todayStats?.count || '0'),
      monthAmount: parseFloat(monthStats?.total || '0').toFixed(2),
      monthCount: parseInt(monthStats?.count || '0'),
      pendingCount,
    };
  }

  // 手动充值
  async manualRecharge(dto: any, adminId?: number, ip?: string) {
    const { userId, coin, amount, remark } = dto;
    
    // 查找用户
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BusinessException(7001, '用户不存在');
    }

    // 查找币种
    const coinEntity = await this.coinRepo.findOne({ where: { symbol: coin } });
    if (!coinEntity) {
      throw new BusinessException(7002, '币种不存在');
    }

    // 查找或创建钱包
    let wallet = await this.walletRepo.findOne({ where: { userId, coinId: coinEntity.id } });
    const balanceBefore = wallet ? wallet.balance : '0';
    if (!wallet) {
      wallet = this.walletRepo.create({
        userId,
        coinId: coinEntity.id,
        balance: '0',
        frozen: '0',
      });
    }
    wallet.balance = (parseFloat(wallet.balance) + parseFloat(amount)).toFixed(8);
    await this.walletRepo.save(wallet);

    // 创建充值记录
    const orderNo = 'MR' + Date.now() + Math.floor(Math.random() * 1000);
    const recharge = this.rechargeRepo.create({
      userId,
      orderNo,
      coin,
      chain: 'MANUAL',
      amount,
      txHash: 'MANUAL_' + orderNo,
      fromAddress: 'admin',
      toAddress: 'user_' + userId,
      status: 1,
      confirmations: 999,
    });
    await this.rechargeRepo.save(recharge);

    // 创建资产流水记录（前台可见）
    const assetLog = this.assetLogRepo.create({
      userId,
      coin,
      type: 'recharge',
      amount: amount,
      balanceBefore: balanceBefore,
      balanceAfter: wallet.balance,
      refNo: orderNo,
      remark: remark || '管理员手动充值',
    });
    await this.assetLogRepo.save(assetLog);

    // 记录操作日志
    if (adminId) {
      await this.logAdminAction(
        adminId,
        '手动充值',
        `用户:${user.username}(ID:${userId}), 币种:${coin}, 金额:${amount}, 备注:${remark || '无'}`,
        'recharge',
        recharge.id,
        ip
      );
    }

    return { id: recharge.id };
  }

  /**
   * 获取充值订单详情
   */
  async getRechargeDetail(id: number) {
    const recharge = await this.rechargeRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!recharge) {
      throw new BusinessException(7003, '充值订单不存在');
    }

    return {
      id: recharge.id,
      orderNo: recharge.orderNo,
      userId: recharge.userId,
      username: recharge.user?.username || '-',
      coin: recharge.coin,
      chain: recharge.chain,
      amount: recharge.amount,
      txHash: recharge.txHash,
      fromAddress: recharge.fromAddress,
      toAddress: recharge.toAddress,
      status: recharge.status,
      confirmations: recharge.confirmations,
      createdAt: this.formatDate(recharge.createdAt),
      updatedAt: this.formatDate(recharge.updatedAt),
    };
  }

  /**
   * 处理充值订单（手动入账/拒绝）
   * status: 1=通过入账, 2=拒绝/失败
   */
  async processRecharge(id: number, dto: any, adminId?: number, ip?: string) {
    const { status, remark } = dto;

    if (status !== 1 && status !== 2) {
      throw new BusinessException(7004, '无效的状态值');
    }

    const recharge = await this.rechargeRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!recharge) {
      throw new BusinessException(7003, '充值订单不存在');
    }

    if (recharge.status !== 0) {
      throw new BusinessException(7005, '该充值订单已处理');
    }

    const queryRunner = this.rechargeRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 查找币种
      const coin = await queryRunner.manager.findOne(Coin, {
        where: { symbol: recharge.coin, status: 1 }
      });

      if (!coin) {
        throw new BusinessException(7006, '币种不存在或已禁用');
      }

      // 更新充值订单状态
      recharge.status = status;
      await queryRunner.manager.save(Recharge, recharge);

      // 如果通过，执行入账操作
      if (status === 1) {
        // 查找或创建钱包
        let wallet = await queryRunner.manager.findOne(Wallet, {
          where: { userId: recharge.userId, coinId: coin.id }
        });

        if (!wallet) {
          wallet = queryRunner.manager.create(Wallet, {
            userId: recharge.userId,
            coinId: coin.id,
            balance: '0',
            frozen: '0',
          });
        }

        // 入账
        const currentBalance = parseFloat(wallet.balance || '0');
        const amount = parseFloat(recharge.amount);
        const newBalance = currentBalance + amount;

        wallet.balance = newBalance.toFixed(8);
        await queryRunner.manager.save(Wallet, wallet);

        // 记录资产流水
        const assetLog = queryRunner.manager.create(AssetLog, {
          userId: recharge.userId,
          coin: recharge.coin,
          type: 'deposit',
          amount: amount.toFixed(6),
          balanceBefore: currentBalance.toFixed(8),
          balanceAfter: newBalance.toFixed(8),
          refNo: recharge.orderNo,
          remark: `管理员手动入账\nTxHash: ${recharge.txHash || 'N/A'}`,
        });
        await queryRunner.manager.save(AssetLog, assetLog);

        // 发送充值成功通知
        if (recharge.user) {
          // 获取 KYC 真实姓名
          const kyc = await this.kycRepo.findOne({
            where: { userId: recharge.user.id, status: 1 }
          });

          // 获取推荐人用户名
          let inviterName = undefined;
          if (recharge.user.inviterId) {
            const inviter = await this.userRepo.findOne({
              where: { id: recharge.user.inviterId },
              select: ['username']
            });
            inviterName = inviter?.username;
          }

          await this.telegramNotify.notifyDepositSuccess({
            userId: recharge.user.id,
            username: recharge.user.username,
            amount: amount.toFixed(2),
            txid: recharge.txHash || recharge.orderNo,
            isInternal: recharge.user.isInternal,
            realName: kyc?.realName,
            inviterName: inviterName,
          }).catch(err => {
            this.logger.error('Telegram 通知失败:', err.message);
          });
        }
      }

      await queryRunner.commitTransaction();

      // 记录操作日志
      if (adminId) {
        const statusText = status === 1 ? '通过入账' : '拒绝';
        await this.logAdminAction(
          adminId,
          `充值审核-${statusText}`,
          `订单:${recharge.orderNo}, 用户:${recharge.user?.username || recharge.userId}, 金额:${recharge.amount}, 原因:${remark || '无'}`,
          'recharge',
          id,
          ip
        );
      }

      return {};
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== 提现管理 ====================

  async getWithdrawList(dto: any) {
    const page = this.safeInt(dto.page, 1);
    const pageSize = this.safeInt(dto.pageSize, 20);
    const status = this.safeOptionalInt(dto.status);
    const { keyword, userId, username, realName, address } = dto;

    const query = this.withdrawRepo
      .createQueryBuilder('w')
      .leftJoinAndSelect('w.user', 'user')
      .leftJoin('agx_kyc', 'kyc', 'kyc.user_id = user.id AND kyc.status = 1')
      .leftJoin('agx_user', 'inviter', 'inviter.id = user.inviter_id')
      .leftJoin('agx_kyc', 'inviterKyc', 'inviterKyc.user_id = inviter.id AND inviterKyc.status = 1')
      .addSelect('kyc.real_name', 'realName')
      .addSelect('inviter.username', 'inviterUsername')
      .addSelect('inviterKyc.real_name', 'inviterRealName');

    if (status !== undefined) {
      query.andWhere('w.status = :status', { status });
    }
    if (keyword) {
      query.andWhere(
        '(user.username ILIKE :keyword OR w.orderNo ILIKE :keyword OR w.toAddress ILIKE :keyword OR kyc.real_name ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }
    // 用户名搜索
    if (username) {
      query.andWhere('user.username ILIKE :username', { username: `%${username}%` });
    }
    // 实名搜索
    if (realName) {
      query.andWhere('kyc.real_name ILIKE :realName', { realName: `%${realName}%` });
    }
    // 提现地址搜索
    if (address) {
      query.andWhere('w.toAddress ILIKE :address', { address: `%${address}%` });
    }
    if (userId) {
      query.andWhere('w.userId = :userId', { userId: parseInt(userId) });
    }

    query
      .orderBy('w.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map((w) => {
        const raw = (w as any);
        return {
          id: w.id,
          orderNo: w.orderNo,
          userId: w.userId,
          username: w.user?.username || '-',
          realName: raw.realName || '-',
          inviterUsername: raw.inviterUsername || '-',
          inviterRealName: raw.inviterRealName || '-',
          coin: w.coin,
          chain: w.chain,
          amount: w.amount,
          fee: w.fee,
          actualAmount: w.actualAmount,
          toAddress: w.toAddress,
          txHash: w.txHash,
          status: w.status,
          remark: w.remark,
          reviewedAt: this.formatDate(w.reviewedAt),
          createdAt: this.formatDate(w.createdAt),
        };
      }),
      total,
    };
  }

  async reviewWithdraw(id: number, dto: any, adminId?: number, ip?: string) {
    const withdraw = await this.withdrawRepo.findOne({ where: { id }, relations: ['user'] });
    if (!withdraw) {
      throw new BusinessException(6001, '提现记录不存在');
    }

    if (withdraw.status !== 0) {
      throw new BusinessException(6002, '该提现订单已处理');
    }

    const oldStatus = withdraw.status;
    withdraw.status = dto.status;
    withdraw.remark = dto.remark || '';
    withdraw.reviewedAt = new Date();
    if (dto.txHash) {
      withdraw.txHash = dto.txHash;
    }
    await this.withdrawRepo.save(withdraw);

    // 发送通知
    if (dto.status === 1 && withdraw.user) {
      // 提款通过
      // 获取 KYC 真实姓名
      const kyc = await this.kycRepo.findOne({
        where: { userId: withdraw.user.id, status: 1 }
      });

      // 获取推荐人用户名
      let inviterName = undefined;
      if (withdraw.user.inviterId) {
        const inviter = await this.userRepo.findOne({
          where: { id: withdraw.user.inviterId },
          select: ['username']
        });
        inviterName = inviter?.username;
      }

      await this.telegramNotify.notifyWithdrawCompleted({
        userId: withdraw.user.id,
        username: withdraw.user.username,
        amount: withdraw.amount,
        txid: dto.txHash || 'N/A',
        isInternal: withdraw.user.isInternal,
        realName: kyc?.realName,
        inviterName: inviterName,
      }).catch(err => {
        this.logger.error('Telegram 通知失败:', err.message);
      });
    } else if (dto.status === 2 && withdraw.user) {
      // 提款拒绝
      await this.telegramNotify.notifyWithdrawFailed({
        userId: withdraw.user.id,
        username: withdraw.user.username,
        amount: withdraw.amount,
        reason: dto.remark || '未提供原因',
      }).catch(err => {
        this.logger.error('Telegram 通知失败:', err.message);
      });
    }

    // 如果拒绝，退还用户冻结金额
    if (dto.status === 2) {
      const coinEntity = await this.coinRepo.findOne({ where: { symbol: withdraw.coin } });
      if (coinEntity) {
        const wallet = await this.walletRepo.findOne({ where: { userId: withdraw.userId, coinId: coinEntity.id } });
        if (wallet) {
          const frozenAmount = parseFloat(wallet.frozen || '0');
          const returnAmount = parseFloat(withdraw.amount);
          // 解冻并退还到余额
          wallet.frozen = Math.max(0, frozenAmount - returnAmount).toFixed(8);
          wallet.balance = (parseFloat(wallet.balance) + returnAmount).toFixed(8);
          await this.walletRepo.save(wallet);

          // 记录资产流水
          const log = this.assetLogRepo.create({
            userId: withdraw.userId,
            coin: withdraw.coin,
            type: 'withdraw_refund',
            amount: returnAmount.toFixed(8),
            balanceBefore: (parseFloat(wallet.balance) - returnAmount).toFixed(8),
            balanceAfter: wallet.balance,
            refNo: withdraw.orderNo,
            remark: '提现拒绝退款:' + (dto.remark || ''),
          });
          await this.assetLogRepo.save(log);
        }
      }
    }

    // 记录操作日志
    if (adminId) {
      const statusText = dto.status === 1 ? '通过' : dto.status === 2 ? '拒绝' : '其他';
      await this.logAdminAction(
        adminId,
        `提现审核-${statusText}`,
        `订单:${withdraw.orderNo}, 用户:${withdraw.user?.username}, 金额:${withdraw.amount}, 原因:${dto.remark || '无'}`,
        'withdraw',
        id,
        ip
      );
    }

    return {};
  }

  /**
   * 创建默认管理员（如果不存在）
   */
  async ensureDefaultAdmin() {
    const admin = await this.adminRepo.findOne({ where: { username: 'admin' } });
    if (!admin) {
      const passwordHash = await bcrypt.hash('Admin123', 10);
      const newAdmin = this.adminRepo.create({
        username: 'admin',
        passwordHash,
        nickname: '超级管理员',
        role: 'super',
        status: 1,
      });
      await this.adminRepo.save(newAdmin);
      this.logger.log('Default admin created: admin / Admin123');
    }
  }

  // ==================== 用户资产管理 ====================

  async getUserAssets(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw BusinessException.userNotFound();
    }

    const wallets = await this.walletRepo.find({
      where: { userId },
      relations: ['coin'],
    });

    return {
      user: {
        id: user.id,
        uid: user.uid,
        username: user.username,
      },
      assets: wallets.map(w => ({
        coinId: w.coinId,
        coin: w.coin?.symbol || '-',
        balance: w.balance,
        frozen: w.frozen,
      })),
    };
  }

  async adjustUserAsset(userId: number, dto: any) {
    const { coinId, amount, type, remark } = dto;

    const wallet = await this.walletRepo.findOne({
      where: { userId, coinId },
      relations: ['coin'],
    });

    if (!wallet) {
      throw new BusinessException(7001, '用户钱包不存在');
    }

    const balanceBefore = wallet.balance;
    const adjustAmount = parseFloat(amount);
    let newBalance: number;

    if (type === 'add') {
      newBalance = parseFloat(wallet.balance) + adjustAmount;
    } else {
      newBalance = parseFloat(wallet.balance) - adjustAmount;
      if (newBalance < 0) {
        throw new BusinessException(7002, '余额不足');
      }
    }

    wallet.balance = newBalance.toFixed(8);
    await this.walletRepo.save(wallet);

    // 记录资产流水
    const log = this.assetLogRepo.create({
      userId,
      coin: wallet.coin?.symbol || 'UNKNOWN',
      type: type === 'add' ? 'admin_add' : 'admin_sub',
      amount: (type === 'add' ? adjustAmount : -adjustAmount).toFixed(8),
      balanceBefore,
      balanceAfter: wallet.balance,
      remark: remark || '管理员调整',
    });
    await this.assetLogRepo.save(log);

    return {
      balanceBefore,
      balanceAfter: wallet.balance,
    };
  }

  async getAssetLogs(dto: any) {
    const page = this.safeInt(dto.page, 1);
    const pageSize = this.safeInt(dto.pageSize, 20);
    const { userId, type } = dto;

    const query = this.assetLogRepo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.user', 'user');

    if (userId) {
      query.andWhere('l.userId = :userId', { userId: parseInt(userId) });
    }
    if (type) {
      query.andWhere('l.type = :type', { type });
    }

    query
      .orderBy('l.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map(l => ({
        id: l.id,
        userId: l.userId,
        username: l.user?.username || '-',
        coin: l.coin,
        type: l.type,
        amount: l.amount,
        balanceBefore: l.balanceBefore,
        balanceAfter: l.balanceAfter,
        refNo: l.refNo,
        remark: l.remark,
        createdAt: this.formatDate(l.createdAt),
      })),
      total,
    };
  }

  // ==================== 系统配置 ====================

  async getConfigList(dto: any) {
    const { group } = dto;

    const query = this.configRepo.createQueryBuilder('c');

    if (group) {
      query.andWhere('c.configGroup = :group', { group });
    }

    query.orderBy('c.configGroup', 'ASC').addOrderBy('c.id', 'ASC');

    const list = await query.getMany();

    return {
      list: list.map(c => ({
        id: c.id,
        key: c.configKey,
        value: c.configValue,
        description: c.description,
        configGroup: c.configGroup,
        updatedAt: this.formatDate(c.updatedAt),
      })),
    };
  }

  async updateConfig(key: string, dto: any) {
    let config = await this.configRepo.findOne({ where: { configKey: key } });

    if (!config) {
      config = this.configRepo.create({
        configKey: key,
        configValue: dto.value,
        description: dto.description,
        configGroup: dto.configGroup || dto.group || 'basic',
      });
    } else {
      config.configValue = dto.value;
      if (dto.description !== undefined) config.description = dto.description;
      if (dto.configGroup !== undefined) config.configGroup = dto.configGroup;
    }

    await this.configRepo.save(config);
    return {};
  }

  async batchUpdateConfigs(configs: Array<{ key: string; value: string }>) {
    for (const item of configs) {
      await this.updateConfig(item.key, { value: item.value });
    }
    return {};
  }

  // ============ 公告管理 ============

  async getNoticeList(dto: any) {
    const page = this.safeInt(dto.page, 1);
    const pageSize = this.safeInt(dto.pageSize, 20);
    const status = this.safeOptionalInt(dto.status);
    const { type } = dto;

    const query = this.noticeRepo.createQueryBuilder('n');

    if (status !== undefined) {
      query.andWhere('n.status = :status', { status });
    }
    if (type) {
      query.andWhere('n.type = :type', { type });
    }

    query.orderBy('n.sortOrder', 'ASC').addOrderBy('n.id', 'DESC');
    query.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        type: n.type,
        status: n.status,
        sortOrder: n.sortOrder,
        startAt: this.formatDate(n.startAt),
        endAt: this.formatDate(n.endAt),
        createdAt: this.formatDate(n.createdAt),
      })),
      total,
    };
  }

  async createNotice(dto: any) {
    const notice = this.noticeRepo.create({
      title: dto.title,
      content: dto.content,
      type: dto.type || 'notice',
      status: dto.status ?? 1,
      sortOrder: dto.sortOrder ?? 0,
      startAt: dto.startAt ? new Date(dto.startAt) : null,
      endAt: dto.endAt ? new Date(dto.endAt) : null,
    });
    await this.noticeRepo.save(notice);
    return { id: notice.id };
  }

  async updateNotice(id: number, dto: any) {
    const notice = await this.noticeRepo.findOne({ where: { id } });
    if (!notice) {
      throw new BusinessException(1001, '公告不存在');
    }

    if (dto.title !== undefined) notice.title = dto.title;
    if (dto.content !== undefined) notice.content = dto.content;
    if (dto.type !== undefined) notice.type = dto.type;
    if (dto.status !== undefined) notice.status = dto.status;
    if (dto.sortOrder !== undefined) notice.sortOrder = dto.sortOrder;
    if (dto.startAt !== undefined) notice.startAt = dto.startAt ? new Date(dto.startAt) : null;
    if (dto.endAt !== undefined) notice.endAt = dto.endAt ? new Date(dto.endAt) : null;

    await this.noticeRepo.save(notice);
    return {};
  }

  async deleteNotice(id: number) {
    const notice = await this.noticeRepo.findOne({ where: { id } });
    if (!notice) {
      throw new BusinessException(1001, '公告不存在');
    }
    await this.noticeRepo.remove(notice);
    return {};
  }

  // 用户端获取有效公告
  async getActiveNotices() {
    const now = new Date();
    const list = await this.noticeRepo.createQueryBuilder('n')
      .where('n.status = 1')
      .andWhere('(n.startAt IS NULL OR n.startAt <= :now)', { now })
      .andWhere('(n.endAt IS NULL OR n.endAt >= :now)', { now })
      .orderBy('n.sortOrder', 'ASC')
      .addOrderBy('n.id', 'DESC')
      .getMany();

    return list.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      type: n.type,
    }));
  }

  // ============ 币种链管理 ============

  async getCoinChainList(coinId?: number) {
    const query = this.coinChainRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.coin', 'coin');

    if (coinId) {
      query.andWhere('c.coinId = :coinId', { coinId });
    }

    query.orderBy('c.coinId', 'ASC').addOrderBy('c.sortOrder', 'ASC');

    const list = await query.getMany();

    return {
      list: list.map(c => ({
        id: c.id,
        coinId: c.coinId,
        coinSymbol: c.coin?.symbol,
        chain: c.chain,
        chainSymbol: c.chainSymbol,
        contractAddress: c.contractAddress,
        withdrawFee: c.withdrawFee,
        minWithdraw: c.minWithdraw,
        maxWithdraw: c.maxWithdraw,
        confirmations: c.confirmations,
        status: c.status,
        sortOrder: c.sortOrder,
      })),
    };
  }

  async createCoinChain(dto: any) {
    const chain = this.coinChainRepo.create({
      coinId: dto.coinId,
      chain: dto.chain,
      chainSymbol: dto.chainSymbol,
      contractAddress: dto.contractAddress,
      withdrawFee: dto.withdrawFee || '0',
      minWithdraw: dto.minWithdraw || '0',
      maxWithdraw: dto.maxWithdraw || '0',
      confirmations: dto.confirmations || 6,
      status: dto.status ?? 1,
      sortOrder: dto.sortOrder ?? 0,
    });
    await this.coinChainRepo.save(chain);
    return { id: chain.id };
  }

  async updateCoinChain(id: number, dto: any) {
    const chain = await this.coinChainRepo.findOne({ where: { id } });
    if (!chain) {
      throw new BusinessException(1001, '链配置不存在');
    }

    if (dto.chain !== undefined) chain.chain = dto.chain;
    if (dto.chainSymbol !== undefined) chain.chainSymbol = dto.chainSymbol;
    if (dto.contractAddress !== undefined) chain.contractAddress = dto.contractAddress;
    if (dto.withdrawFee !== undefined) chain.withdrawFee = dto.withdrawFee;
    if (dto.minWithdraw !== undefined) chain.minWithdraw = dto.minWithdraw;
    if (dto.maxWithdraw !== undefined) chain.maxWithdraw = dto.maxWithdraw;
    if (dto.confirmations !== undefined) chain.confirmations = dto.confirmations;
    if (dto.status !== undefined) chain.status = dto.status;
    if (dto.sortOrder !== undefined) chain.sortOrder = dto.sortOrder;

    await this.coinChainRepo.save(chain);
    return {};
  }

  async deleteCoinChain(id: number) {
    const chain = await this.coinChainRepo.findOne({ where: { id } });
    if (!chain) {
      throw new BusinessException(1001, '链配置不存在');
    }
    await this.coinChainRepo.remove(chain);
    return {};
  }

  // ============ 邀请管理 ============

  async getInviteList(dto: any) {
    const page = this.safeInt(dto.page, 1);
    const pageSize = this.safeInt(dto.pageSize, 20);
    const { userId, inviterId } = dto;

    const query = this.userInviteRepo.createQueryBuilder('i')
      .leftJoinAndSelect('i.user', 'user')
      .leftJoinAndSelect('i.inviter', 'inviter');

    if (userId) {
      query.andWhere('i.userId = :userId', { userId });
    }
    if (inviterId) {
      query.andWhere('i.inviterId = :inviterId', { inviterId });
    }

    query.orderBy('i.id', 'DESC');
    query.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map(i => ({
        id: i.id,
        userId: i.userId,
        username: i.user?.username,
        inviterId: i.inviterId,
        inviterName: i.inviter?.username,
        level: i.level,
        createdAt: this.formatDate(i.createdAt),
      })),
      total,
    };
  }

  // ============ 返佣管理 ============

  async getCommissionList(dto: any) {
    const page = this.safeInt(dto.page, 1);
    const pageSize = this.safeInt(dto.pageSize, 20);
    const status = this.safeOptionalInt(dto.status);
    const { userId } = dto;

    const query = this.commissionRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'user')
      .leftJoinAndSelect('c.fromUser', 'fromUser')
      .leftJoinAndSelect('c.coin', 'coin');

    if (userId) {
      query.andWhere('c.userId = :userId', { userId });
    }
    if (status !== undefined) {
      query.andWhere('c.status = :status', { status });
    }

    query.orderBy('c.id', 'DESC');
    query.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map(c => ({
        id: c.id,
        userId: c.userId,
        username: c.user?.username,
        fromUserId: c.fromUserId,
        fromUsername: c.fromUser?.username,
        level: c.level,
        source: c.sourceType,
        coin: c.coin?.symbol || 'USDT',
        amount: c.amount,
        rate: c.rate,
        status: c.status,
        createdAt: this.formatDate(c.createdAt),
      })),
      total,
    };
  }

  // ============ 操作日志 ============

  async getAdminLogList(dto: any) {
    const page = this.safeInt(dto.page, 1);
    const pageSize = this.safeInt(dto.pageSize, 20);
    const { adminId, targetType, action } = dto;

    const query = this.adminLogRepo.createQueryBuilder('l')
      .leftJoinAndSelect('l.admin', 'admin');

    if (adminId) {
      query.andWhere('l.adminId = :adminId', { adminId });
    }
    if (targetType) {
      query.andWhere('l.targetType = :targetType', { targetType });
    }
    if (action) {
      query.andWhere('l.action ILIKE :action', { action: `%${action}%` });
    }

    query.orderBy('l.id', 'DESC');
    query.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map(l => ({
        id: l.id,
        adminId: l.adminId,
        adminName: l.admin?.username,
        action: l.action,
        targetType: l.targetType,
        targetId: l.targetId,
        content: l.content,
        ip: l.ip,
        createdAt: this.formatDate(l.createdAt),
      })),
      total,
    };
  }

  /**
   * 记录管理员操作日志
   */
  async logAdminAction(
    adminId: number,
    action: string,
    content?: string,
    targetType?: string,
    targetId?: number,
    ip?: string
  ) {
    try {
      const log = this.adminLogRepo.create({
        adminId,
        action,
        content,
        targetType,
        targetId,
        ip,
      });
      await this.adminLogRepo.save(log);
    } catch (e) {
      console.error('记录操作日志失败:', e.message);
    }
  }

  // ===== Banner管理 =====

  /**
   * 获取Banner列表
   */
  async getBannerList(options: { position?: string; status?: number }) {
    const { position, status } = options;
    const query = this.bannerRepo.createQueryBuilder('banner');

    if (position) {
      query.andWhere('banner.position = :position', { position });
    }
    if (status !== undefined) {
      query.andWhere('banner.status = :status', { status });
    }

    query.orderBy('banner.sortOrder', 'DESC').addOrderBy('banner.id', 'DESC');

    const list = await query.getMany();
    return {
      list: list.map(b => ({
        id: b.id,
        title: b.title,
        imageUrl: b.imageUrl,
        linkUrl: b.linkUrl,
        position: b.position,
        sortOrder: b.sortOrder,
        startTime: this.formatDate(b.startTime),
        endTime: this.formatDate(b.endTime),
        status: b.status,
        createdAt: this.formatDate(b.createdAt),
      })),
    };
  }

  /**
   * 创建Banner
   */
  async createBanner(data: {
    title?: string;
    imageUrl: string;
    linkUrl?: string;
    position?: string;
    sortOrder?: number;
    startTime?: Date;
    endTime?: Date;
    status?: number;
  }) {
    const banner = this.bannerRepo.create({
      title: data.title || null,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl || null,
      position: data.position || 'home',
      sortOrder: data.sortOrder || 0,
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      status: data.status ?? 1,
    });
    await this.bannerRepo.save(banner);
    return { id: banner.id };
  }

  /**
   * 更新Banner
   */
  async updateBanner(id: number, data: {
    title?: string;
    imageUrl?: string;
    linkUrl?: string;
    position?: string;
    sortOrder?: number;
    startTime?: Date;
    endTime?: Date;
    status?: number;
  }) {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) {
      throw new BusinessException(1001, 'Banner不存在');
    }
    Object.assign(banner, data);
    await this.bannerRepo.save(banner);
    return { id: banner.id };
  }

  /**
   * 删除Banner
   */
  async deleteBanner(id: number) {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) {
      throw new BusinessException(1001, 'Banner不存在');
    }
    await this.bannerRepo.delete(id);
  }

  // ===== 用户等级管理 =====

  /**
   * 获取用户等级分布统计
   */
  async getUserLevelStats() {
    const stats = await this.userRepo
      .createQueryBuilder('user')
      .select('user.level', 'level')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.level')
      .getRawMany();

    // 获取等级配置
    const levels = await this.userLevelRepo.find({ order: { level: 'ASC' } });
    
    // 默认等级配置（V0-V5，6个等级）
    const defaultLevels = [
      { level: 0, name: '启蒙会员', icon: '👤', color: '#6B7280' },
      { level: 1, name: '准入层', icon: '🥉', color: '#8B9DC3' },
      { level: 2, name: '优选层', icon: '🥈', color: '#C0C0C0' },
      { level: 3, name: '资本层', icon: '🥇', color: '#FFD700' },
      { level: 4, name: '执行官层', icon: '💎', color: '#00CED1' },
      { level: 5, name: '主权层', icon: '🔥', color: '#FF4500' },
    ];

    return defaultLevels.map(dl => {
      const levelConfig = levels.find(l => l.level === dl.level);
      const stat = stats.find(s => Number(s.level) === dl.level);
      return {
        level: dl.level,
        name: levelConfig?.name || dl.name,
        icon: levelConfig?.icon || dl.icon,
        color: levelConfig?.color || dl.color,
        count: Number(stat?.count || 0),
      };
    });
  }

  /**
   * 获取用户列表（带等级信息）
   */
  async getUsersWithLevel(options: {
    page?: number;
    pageSize?: number;
    level?: number;
    keyword?: string;
  }) {
    const page = this.safeInt(options.page, 1);
    const pageSize = this.safeInt(options.pageSize, 20);
    const level = this.safeOptionalInt(options.level);
    const { keyword } = options;
    const query = this.userRepo.createQueryBuilder('user');

    if (level !== undefined) {
      query.andWhere('user.level = :level', { level });
    }
    if (keyword) {
      query.andWhere('(user.username ILIKE :keyword OR user.nickname ILIKE :keyword OR user.uid ILIKE :keyword)', { keyword: `%${keyword}%` });
    }

    query
      .orderBy('user.level', 'DESC')
      .addOrderBy('user.totalCommission', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map(u => ({
        id: u.id,
        uid: u.uid,
        username: u.username,
        nickname: u.nickname,
        level: u.level,
        inviteCount: u.inviteCount,
        teamCount: u.teamCount,
        totalCommission: u.totalCommission,
        levelUpAt: this.formatDate(u.updatedAt),
      })),
      total,
    };
  }

  /**
   * 调整用户等级
   */
  async adjustUserLevel(userId: number, newLevel: number, reason?: string, adminId?: number, ip?: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BusinessException(1001, '用户不存在');
    }

    const oldLevel = user.level;
    user.level = newLevel;
    await this.userRepo.save(user);

    // 记录操作日志
    if (adminId) {
      await this.logAdminAction(adminId, '用户等级-调整', `用户ID:${userId}, ${oldLevel}->${newLevel}, 原因:${reason || '无'}`, 'user', userId, ip);
    }

    return { id: userId, oldLevel, newLevel };
  }

  /**
   * 获取等级配置列表
   */
  async getLevelConfigList() {
    const levels = await this.userLevelRepo.find({ order: { level: 'ASC' } });

    if (levels.length === 0) {
      // 返回默认配置（minAssets 现在表示充值金额要求）
      return [
        { level: 1, name: '准入会员', nameEn: 'Access Member', icon: 'shield', color: '#8B9DC3', minAssets: '0', minInvites: 0, commissionRate1: '0.20', commissionRate2: '0.10', feeDiscount: '1.00', poolBonus: '0.00' },
        { level: 2, name: '优选会员', nameEn: 'Select Member', icon: 'star', color: '#4A90D9', minAssets: '1000', minInvites: 0, commissionRate1: '0.22', commissionRate2: '0.11', feeDiscount: '0.95', poolBonus: '0.06' },
        { level: 3, name: '资本合伙人', nameEn: 'Capital Partner', icon: 'diamond', color: '#D4AF37', minAssets: '5000', minInvites: 0, commissionRate1: '0.25', commissionRate2: '0.12', feeDiscount: '0.90', poolBonus: '0.10' },
        { level: 4, name: '执行官合伙人', nameEn: 'Executive Partner', icon: 'crown', color: '#9B59B6', minAssets: '20000', minInvites: 0, commissionRate1: '0.28', commissionRate2: '0.14', feeDiscount: '0.85', poolBonus: '0.16' },
        { level: 5, name: '主权合伙人', nameEn: 'Sovereign Partner', icon: 'trophy', color: '#C9A962', minAssets: '100000', minInvites: 0, commissionRate1: '0.30', commissionRate2: '0.15', feeDiscount: '0.80', poolBonus: '0.22' },
      ];
    }

    return levels.map(l => ({
      id: l.id,
      level: l.level,
      name: l.name,
      nameEn: l.nameEn,
      icon: l.icon,
      color: l.color,
      minAssets: l.minAssets,
      minInvites: l.minInvites,
      minTradeVolume: l.minTradeVolume,
      commissionRate1: l.commissionRate1,
      commissionRate2: l.commissionRate2,
      feeDiscount: l.feeDiscount,
      poolBonus: l.poolBonus || '0.00',
      status: l.status,
    }));
  }

  /**
   * 更新等级配置
   */
  async updateLevelConfig(level: number, data: any) {
    let config = await this.userLevelRepo.findOne({ where: { level } });
    
    if (!config) {
      // 创建新配置
      const newConfig = this.userLevelRepo.create({ level, ...data });
      await this.userLevelRepo.save(newConfig);
    } else {
      Object.assign(config, data);
      await this.userLevelRepo.save(config);
    }
    
    return { level };
  }

  /**
   * 获取用户升级记录
   */
  async getUserUpgradeLogs(userId: number) {
    // 获取用户信息
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return { code: 0, data: { user: null, logs: [] } };
    }
    
    // 获取升级奖励记录
    const logs = await this.levelBonusLogRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    
    // 获取充值记录（状态=1已到账）
    const recharges = await this.rechargeRepo.find({
      where: { userId, status: 1 },
      order: { createdAt: 'DESC' },
      take: 50,
    });
    
    // 获取等级配置
    const levelConfigs = await this.userLevelRepo.find({ order: { level: 'ASC' } });
    const getLevelName = (lv: number) => {
      const found = levelConfigs.find(c => c.level === lv);
      return found?.name || `VIP${lv}`;
    };
    
    return {
      code: 0,
      data: {
        user: {
          id: user.id,
          username: user.username || user.nickname,
          level: user.level,
          levelName: getLevelName(user.level),
        },
        logs: logs.map(log => ({
          id: log.id,
          fromLevel: log.fromLevel,
          fromLevelName: getLevelName(log.fromLevel),
          toLevel: log.toLevel,
          toLevelName: getLevelName(log.toLevel),
          bonusAmount: log.bonusAmount,
          remark: log.remark,
          createdAt: this.formatDate(log.createdAt),
        })),
        recharges: recharges.map(r => ({
          id: r.id,
          amount: r.amount,
          coin: r.coin,
          status: r.status,
          createdAt: this.formatDate(r.createdAt as any),
        })),
      }
    };
  }

  // ===== 邀请记录管理 =====

  /**
   * 获取邀请统计
   */
  async getInviteStats() {
    // 总邀请用户数
    const totalInvites = await this.userInviteRepo.count({ where: { level: 1 } });
    
    // 今日邀请
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayInvites = await this.userInviteRepo.count({
      where: { level: 1, createdAt: { $gte: today } as any }
    });
    
    // 总返佣金额
    const commissionResult = await this.commissionRepo
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.amount), 0)', 'total')
      .getRawOne();
    const totalCommission = commissionResult?.total || '0.00';
    
    // 有效推广员（至少邀请过1人的用户）
    const activePromoters = await this.userInviteRepo
      .createQueryBuilder('i')
      .select('COUNT(DISTINCT i.inviterId)', 'count')
      .where('i.level = 1')
      .getRawOne();
    
    return {
      code: 0,
      data: {
        totalInvites,
        todayInvites,
        totalCommission,
        activePromoters: parseInt(activePromoters?.count || '0')
      }
    };
  }

  /**
   * 获取邀请记录列表
   */
  async getInviteRecords(options: { page?: number; pageSize?: number; keyword?: string }) {
    const page = this.safeInt(options.page, 1);
    const pageSize = this.safeInt(options.pageSize, 20);
    const { keyword } = options;
    
    // 查询有邀请记录的用户
    let query = this.userRepo.createQueryBuilder('u')
      .select([
        'u.id as "userId"',
        'COALESCE(u.username, u.nickname) as "username"',
        'u.level',
        'u.created_at as "createdAt"',
        '(SELECT COUNT(*) FROM agx_user_invite i WHERE i.inviter_id = u.id AND i.level = 1) as "directCount"',
        '(SELECT COUNT(*) FROM agx_user_invite i WHERE i.inviter_id = u.id AND i.level = 2) as "indirectCount"',
        '(SELECT COUNT(*) FROM agx_user_invite i WHERE i.inviter_id = u.id) as "inviteCount"',
        '(SELECT COALESCE(SUM(c.amount), 0) FROM agx_commission c WHERE c.user_id = u.id) as "totalCommission"'
      ])
      .where('EXISTS (SELECT 1 FROM agx_user_invite i WHERE i.inviter_id = u.id)');
    
    if (keyword) {
      query.andWhere('(u.username ILIKE :keyword OR u.nickname ILIKE :keyword OR u.id::text = :exactId)', { 
        keyword: `%${keyword}%`,
        exactId: keyword 
      });
    }
    
    const total = await query.getCount();
    
    const list = await query
      .orderBy('"inviteCount"', 'DESC')
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .getRawMany();
    
    return {
      code: 0,
      data: {
        list: list.map(item => ({
          userId: item.userId,
          username: item.username,
          level: item.level,
          inviteCount: parseInt(item.inviteCount || '0'),
          directCount: parseInt(item.directCount || '0'),
          indirectCount: parseInt(item.indirectCount || '0'),
          totalCommission: item.totalCommission,
          createdAt: this.formatDate(item.createdAt)
        })),
        total
      }
    };
  }

  /**
   * 获取用户邀请详情
   */
  async getUserInviteDetail(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return { code: 0, data: { user: null, invites: [] } };
    }
    
    // 获取该用户邀请的所有人
    const invites = await this.userInviteRepo.find({
      where: { inviterId: userId },
      order: { createdAt: 'DESC' },
      take: 100
    });
    
    // 获取被邀请用户的信息和返佣
    const inviteDetails = await Promise.all(invites.map(async (inv) => {
      const invitedUser = await this.userRepo.findOne({ where: { id: inv.userId } });
      const commission = await this.commissionRepo
        .createQueryBuilder('c')
        .select('COALESCE(SUM(c.amount), 0)', 'total')
        .where('c.user_id = :userId AND c.from_user_id = :fromUserId', { 
          userId, 
          fromUserId: inv.userId 
        })
        .getRawOne();
      
      return {
        userId: inv.userId,
        username: invitedUser?.username || invitedUser?.nickname || `用户${inv.userId}`,
        level: inv.level,
        status: invitedUser?.status || 0,
        commission: commission?.total || '0.00',
        createdAt: this.formatDate(inv.createdAt)
      };
    }));
    
    // 统计
    const totalCommission = await this.commissionRepo
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.amount), 0)', 'total')
      .where('c.user_id = :userId', { userId })
      .getRawOne();
    
    return {
      code: 0,
      data: {
        user: {
          id: user.id,
          username: user.username || user.nickname,
          inviteCount: invites.length,
          totalCommission: totalCommission?.total || '0.00'
        },
        invites: inviteDetails
      }
    };
  }

  // ===== 登录日志管理 =====

  /**
   * 获取登录日志列表
   */
  async getLoginLogList(options: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = this.safeInt(options.page, 1);
    const pageSize = this.safeInt(options.pageSize, 20);
    const status = this.safeOptionalInt(options.status);
    const { keyword, startDate, endDate } = options;
    const query = this.loginLogRepo.createQueryBuilder('log');

    if (keyword) {
      // Fix: use actual column names to avoid TypeORM naming conversion issues
      query.andWhere('("user_id"::text ILIKE :keyword OR username ILIKE :keyword OR login_ip ILIKE :keyword)', { keyword: `%${keyword}%` });
    }
    if (status) {
      query.andWhere('log.status = :status', { status });
    }
    if (startDate) {
      query.andWhere('log.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('log.createdAt <= :endDate', { endDate });
    }

    query.orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map(l => ({
        id: l.id,
        userId: l.userId,
        username: l.username,
        loginTime: this.formatDate(l.createdAt),
        status: l.status,
        ip: l.loginIp,
        location: l.location,
        deviceType: l.deviceType,
        device: l.deviceInfo,
        loginType: l.loginType,
      })),
      total,
    };
  }

  /**
   * 获取登录统计
   */
  async getLoginStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await this.loginLogRepo
      .createQueryBuilder('log')
      .where('log.createdAt >= :today', { today })
      .getCount();

    // 今日活跃用户数
    const activeResult = await this.loginLogRepo
      .createQueryBuilder('log')
      .select('COUNT(DISTINCT "user_id")', 'count')
      .where('log.createdAt >= :today', { today })
      .andWhere('log.status = :status', { status: 1 })
      .getRawOne();

    const failedCount = await this.loginLogRepo.count({
      where: { status: 0 }  // 0 表示失败
    });

    // 暂时禁用异常登录统计（数据库中没有isAbnormal字段）
    const abnormalCount = 0;

    return {
      todayCount,
      todayActiveUsers: Number(activeResult?.count || 0),
      failedCount,
      abnormalCount,
    };
  }

  /**
   * 标记异常登录（暂时禁用）
   */
  async markAbnormalLogin(id: number) {
    // 数据库中没有isAbnormal字段，暂时不实现
    return { success: false, message: '该功能暂时不可用' };
  }

  // ===== 黑名单管理 =====

  /**
   * 获取黑名单列表
   */
  async getBlacklistList(options: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    type?: string;
  }) {
    const page = this.safeInt(options.page, 1);
    const pageSize = this.safeInt(options.pageSize, 20);
    const { keyword, type } = options;
    const query = this.blacklistRepo.createQueryBuilder('b');

    if (keyword) {
      query.andWhere('b.value ILIKE :keyword', { keyword: `%${keyword}%` });
    }
    if (type) {
      query.andWhere('b.type = :type', { type });
    }

    query.orderBy('b.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map(b => ({
        id: b.id,
        type: b.type,
        value: b.value,
        reason: b.reason,
        operatorId: b.operatorId,
        createdAt: this.formatDate(b.createdAt),
        expireAt: b.expireAt ? this.formatDate(b.expireAt) : '-',
        status: b.status === 1,
      })),
      total,
    };
  }

  /**
   * 添加黑名单
   */
  async addToBlacklist(data: {
    value: string;
    type: string;
    reason: string;
    expireAt?: Date;
    operatorId?: number;
  }) {
    const blacklist = this.blacklistRepo.create({
      value: data.value,
      type: data.type,
      reason: data.reason,
      expireAt: data.expireAt,
      operatorId: data.operatorId,
      status: 1,
    });
    await this.blacklistRepo.save(blacklist);
    return { id: blacklist.id };
  }

  /**
   * 更新黑名单
   */
  async updateBlacklist(id: number, data: any) {
    const blacklist = await this.blacklistRepo.findOne({ where: { id } });
    if (!blacklist) {
      throw new BusinessException(1001, '黑名单记录不存在');
    }
    Object.assign(blacklist, data);
    await this.blacklistRepo.save(blacklist);
    return { id };
  }

  /**
   * 移出黑名单
   */
  async removeFromBlacklist(id: number) {
    await this.blacklistRepo.delete(id);
  }

  /**
   * 获取风控预警列表
   */
  async getRiskAlertList(options: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) {
    const page = this.safeInt(options.page, 1);
    const pageSize = this.safeInt(options.pageSize, 20);
    const { status } = options;
    const query = this.riskAlertRepo.createQueryBuilder('r');

    if (status) {
      query.andWhere('r.status = :status', { status });
    }

    query.orderBy('r.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map(r => ({
        id: r.id,
        userId: r.userId,
        username: r.username,
        riskType: r.riskType,
        level: r.level,
        description: r.description,
        status: r.status,
        triggerTime: this.formatDate(r.createdAt),
      })),
      total,
    };
  }

  /**
   * 处理风控预警
   */
  async processRiskAlert(id: number, status: string, processNote?: string) {
    await this.riskAlertRepo.update(id, { status, processNote });
  }

  // ===== OTC订单管理 =====

  /**
   * 获取OTC订单列表
   */
  async getOtcOrderList(options: {
    page?: number;
    pageSize?: number;
    status?: string;
    keyword?: string;
  }) {
    const page = this.safeInt(options.page, 1);
    const pageSize = this.safeInt(options.pageSize, 20);
    const { status, keyword } = options;
    const query = this.otcOrderRepo.createQueryBuilder('o');

    if (status) {
      query.andWhere('o.status = :status', { status });
    }
    if (keyword) {
      query.andWhere('o.orderNo ILIKE :keyword', { keyword: `%${keyword}%` });
    }

    query.orderBy('o.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map(o => ({
        id: o.id,
        orderId: o.orderNo,
        buyerId: o.buyerId,
        sellerId: o.sellerId,
        amount: o.amount,
        price: o.price,
        totalPrice: o.totalPrice,
        paymentMethod: o.paymentMethod,
        status: o.status,
        createdAt: this.formatDate(o.createdAt),
        paidAt: o.paidAt ? this.formatDate(o.paidAt) : null,
        releasedAt: o.releasedAt ? this.formatDate(o.releasedAt) : null,
        cancelledAt: o.cancelledAt ? this.formatDate(o.cancelledAt) : null,
      })),
      total,
    };
  }

  /**
   * 获取OTC订单统计
   */
  async getOtcOrderStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await this.otcOrderRepo
      .createQueryBuilder('o')
      .where('o.createdAt >= :today', { today })
      .getCount();

    const pendingCount = await this.otcOrderRepo.count({
      where: { status: 'pending' }
    });

    const appealCount = await this.otcOrderRepo.count({
      where: { status: 'appeal' }
    });

    const todayAmountResult = await this.otcOrderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(CAST(o.totalPrice AS DECIMAL)), 0)', 'total')
      .where('o.createdAt >= :today', { today })
      .andWhere('o.status = :status', { status: 'completed' })
      .getRawOne();

    const totalAmountResult = await this.otcOrderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(CAST(o.totalPrice AS DECIMAL)), 0)', 'total')
      .where('o.status = :status', { status: 'completed' })
      .getRawOne();

    const completedCount = await this.otcOrderRepo.count({
      where: { status: 'completed' }
    });
    const totalOrders = await this.otcOrderRepo.count();

    return {
      todayCount,
      todayAmount: Number(todayAmountResult?.total || 0),
      pendingCount,
      appealCount,
      completeRate: totalOrders > 0 ? (completedCount / totalOrders * 100).toFixed(1) : 0,
      totalAmount: Number(totalAmountResult?.total || 0),
    };
  }

  /**
   * 处理OTC申诉
   */
  async processOtcAppeal(id: number, result: string, remark: string) {
    const order = await this.otcOrderRepo.findOne({ where: { id } });
    if (!order) {
      throw new BusinessException(1001, '订单不存在');
    }
    if (order.status !== 'appeal') {
      throw new BusinessException(1002, '订单状态不正确');
    }

    order.appealResult = result;
    order.appealRemark = remark;
    
    if (result === 'cancel') {
      order.status = 'cancelled';
      order.cancelledAt = new Date();
    } else {
      order.status = 'completed';
      order.completedAt = new Date();
    }
    
    await this.otcOrderRepo.save(order);
    return { id };
  }

  /**
   * 确认完成OTC订单
   */
  async completeOtcOrder(id: number) {
    const order = await this.otcOrderRepo.findOne({ where: { id } });
    if (!order) {
      throw new BusinessException(1001, '订单不存在');
    }
    order.status = 'completed';
    order.completedAt = new Date();
    await this.otcOrderRepo.save(order);
    return { id };
  }

  /**
   * 取消OTC订单
   */
  async cancelOtcOrder(id: number) {
    const order = await this.otcOrderRepo.findOne({ where: { id } });
    if (!order) {
      throw new BusinessException(1001, '订单不存在');
    }
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await this.otcOrderRepo.save(order);
    return { id };
  }

  // ==================== 行情配置管理 ====================

  /**
   * 获取行情配置列表
   */
  async getMarketConfigList(dto: any) {
    const page = this.safeInt(dto.page, 1);
    const pageSize = this.safeInt(dto.pageSize, 20);
    const { assetType } = dto;

    const query = this.marketConfigRepo.createQueryBuilder('m');
    if (assetType) {
      query.andWhere('m.assetType = :assetType', { assetType });
    }

    query.orderBy('m.sortOrder', 'DESC').addOrderBy('m.id', 'ASC');
    query.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map(m => ({
        id: m.id,
        symbol: m.symbol,
        name: m.name,
        assetType: m.assetType,
        dataSource: m.dataSource,
        mockPrice: m.mockPrice,
        isVisible: m.isVisible,
        sortOrder: m.sortOrder,
        icon: m.icon,
        updatedAt: this.formatDate(m.updatedAt),
      })),
      total,
    };
  }

  /**
   * 获取贵金属行情（带实时价格）
   */
  async getMetalMarketList() {
    // 先从配置表获取
    let configs = await this.marketConfigRepo.find({
      where: { assetType: 'metal' },
      order: { sortOrder: 'DESC' },
    });

    // 如果没有配置，返回默认贵金属数据
    if (configs.length === 0) {
      return [
        { type: 'XAU', name: '黄金', icon: '🥇', priceUsd: 2650.25, priceCny: 608.50, changePercent: 0.85, high24h: 2665.00, low24h: 2635.80, dataSource: 'mock', updatedAt: this.formatDate(new Date()), isVisible: true },
        { type: 'XAG', name: '白银', icon: '🥈', priceUsd: 31.52, priceCny: 7.24, changePercent: 1.25, high24h: 31.80, low24h: 31.05, dataSource: 'mock', updatedAt: this.formatDate(new Date()), isVisible: true },
        { type: 'XPT', name: '铂金', icon: '💎', priceUsd: 985.60, priceCny: 226.50, changePercent: -0.35, high24h: 992.00, low24h: 978.50, dataSource: 'mock', updatedAt: this.formatDate(new Date()), isVisible: true },
        { type: 'XPD', name: '钯金', icon: '⚪', priceUsd: 1052.80, priceCny: 241.95, changePercent: -0.82, high24h: 1065.00, low24h: 1045.20, dataSource: 'mock', updatedAt: this.formatDate(new Date()), isVisible: false },
      ];
    }

    const cnyRate = 7.29; // 美元兑人民币汇率
    return configs.map(m => {
      const basePrice = parseFloat(m.mockPrice || '100');
      const changePercent = (Math.random() - 0.5) * 2; // Mock涨跌幅
      return {
        type: m.symbol,
        name: m.name,
        icon: m.icon || '🔶',
        priceUsd: basePrice,
        priceCny: (basePrice / 31.1035 * cnyRate).toFixed(2), // 盎司转克
        changePercent: changePercent.toFixed(2),
        high24h: (basePrice * 1.01).toFixed(2),
        low24h: (basePrice * 0.99).toFixed(2),
        dataSource: m.dataSource,
        updatedAt: this.formatDate(m.updatedAt),
        isVisible: m.isVisible === 1,
      };
    });
  }

  /**
   * 更新行情配置
   */
  async updateMarketConfig(id: number, dto: any) {
    const config = await this.marketConfigRepo.findOne({ where: { id } });
    if (!config) {
      throw new BusinessException(1001, '配置不存在');
    }

    if (dto.dataSource !== undefined) config.dataSource = dto.dataSource;
    if (dto.mockPrice !== undefined) config.mockPrice = String(dto.mockPrice);
    if (dto.isVisible !== undefined) config.isVisible = dto.isVisible ? 1 : 0;
    if (dto.sortOrder !== undefined) config.sortOrder = dto.sortOrder;
    if (dto.icon !== undefined) config.icon = dto.icon;
    if (dto.name !== undefined) config.name = dto.name;

    await this.marketConfigRepo.save(config);
    return { id };
  }

  /**
   * 创建行情配置
   */
  async createMarketConfig(dto: any) {
    const existing = await this.marketConfigRepo.findOne({ where: { symbol: dto.symbol } });
    if (existing) {
      throw new BusinessException(1002, '该资产配置已存在');
    }

    const config = this.marketConfigRepo.create({
      symbol: dto.symbol,
      name: dto.name,
      assetType: dto.assetType,
      dataSource: dto.dataSource || 'mock',
      mockPrice: dto.mockPrice ? String(dto.mockPrice) : null,
      isVisible: dto.isVisible !== false ? 1 : 0,
      sortOrder: dto.sortOrder || 0,
      icon: dto.icon,
    });

    await this.marketConfigRepo.save(config);
    return { id: config.id };
  }

  /**
   * 同步行情（模拟）
   */
  async syncMarketPrices(assetType: string) {
    // 这里可以接入真实的行情API，目前只是模拟
    return { message: '行情同步成功' };
  }

  // ==================== 菜单配置管理 ====================

  /**
   * 获取菜单列表
   */
  async getAppMenuList(position?: string) {
    const where: any = {};
    if (position) where.position = position;

    const list = await this.appMenuRepo.find({
      where,
      order: { sortOrder: 'DESC', id: 'ASC' },
    });

    return list.map(m => ({
      id: m.id,
      title: m.title,
      icon: m.icon,
      path: m.path,
      position: m.position,
      group: m.groupName,
      sort: m.sortOrder,
      status: m.status,
      permissions: m.permissions ? JSON.parse(m.permissions) : [],
    }));
  }

  /**
   * 创建菜单
   */
  async createAppMenu(dto: any) {
    const menu = this.appMenuRepo.create({
      title: dto.title,
      icon: dto.icon,
      path: dto.path,
      position: dto.position,
      groupName: dto.group,
      sortOrder: dto.sort || 0,
      status: dto.status ? 1 : 0,
      permissions: dto.permissions ? JSON.stringify(dto.permissions) : null,
    });

    await this.appMenuRepo.save(menu);
    return { id: menu.id };
  }

  /**
   * 更新菜单
   */
  async updateAppMenu(id: number, dto: any) {
    const menu = await this.appMenuRepo.findOne({ where: { id } });
    if (!menu) {
      throw new BusinessException(1001, '菜单不存在');
    }

    if (dto.title !== undefined) menu.title = dto.title;
    if (dto.icon !== undefined) menu.icon = dto.icon;
    if (dto.path !== undefined) menu.path = dto.path;
    if (dto.position !== undefined) menu.position = dto.position;
    if (dto.group !== undefined) menu.groupName = dto.group;
    if (dto.sort !== undefined) menu.sortOrder = dto.sort;
    if (dto.status !== undefined) menu.status = dto.status ? 1 : 0;
    if (dto.permissions !== undefined) menu.permissions = dto.permissions ? JSON.stringify(dto.permissions) : null;

    await this.appMenuRepo.save(menu);
    return { id };
  }

  /**
   * 删除菜单
   */
  async deleteAppMenu(id: number) {
    const menu = await this.appMenuRepo.findOne({ where: { id } });
    if (!menu) {
      throw new BusinessException(1001, '菜单不存在');
    }
    await this.appMenuRepo.remove(menu);
    return { id };
  }

  /**
   * 菜单排序
   */
  async sortAppMenu(id: number, direction: 'up' | 'down') {
    const menu = await this.appMenuRepo.findOne({ where: { id } });
    if (!menu) {
      throw new BusinessException(1001, '菜单不存在');
    }

    // 找相邻的菜单
    const siblings = await this.appMenuRepo.find({
      where: { position: menu.position },
      order: { sortOrder: 'DESC' },
    });

    const currentIndex = siblings.findIndex(m => m.id === id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < siblings.length) {
      const target = siblings[targetIndex];
      // 交换排序值
      const tempSort = menu.sortOrder;
      menu.sortOrder = target.sortOrder;
      target.sortOrder = tempSort;
      await this.appMenuRepo.save([menu, target]);
    }

    return { id };
  }

  /**
   * 初始化默认菜单
   */
  async initDefaultMenus() {
    const count = await this.appMenuRepo.count();
    if (count > 0) {
      return { message: '菜单已存在' };
    }

    const defaultMenus = [
      // 底部导航
      { title: '首页', icon: '🏠', path: '/home', position: 'bottom', sortOrder: 100, status: 1 },
      { title: '行情', icon: '📈', path: '/market', position: 'bottom', sortOrder: 99, status: 1 },
      { title: '交易', icon: '💰', path: '/trade', position: 'bottom', sortOrder: 98, status: 1 },
      { title: '广场', icon: '🏆', path: '/square', position: 'bottom', sortOrder: 97, status: 1 },
      { title: '我的', icon: '👤', path: '/mine', position: 'bottom', sortOrder: 96, status: 1 },
      // 九宫格入口
      { title: '现货交易', icon: '🪙', path: '/trade/spot', position: 'grid', sortOrder: 100, status: 1 },
      { title: '秒合约', icon: '⚡', path: '/trade/contract', position: 'grid', sortOrder: 99, status: 1 },
      { title: '黄金理财', icon: '🥇', path: '/gold', position: 'grid', sortOrder: 98, status: 1 },
      { title: '矿池', icon: '⛏️', path: '/pool', position: 'grid', sortOrder: 97, status: 1 },
      { title: '新币认购', icon: '🎁', path: '/newcoin', position: 'grid', sortOrder: 96, status: 1 },
      { title: '充值', icon: '💳', path: '/recharge', position: 'grid', sortOrder: 95, status: 1 },
      { title: '提现', icon: '📤', path: '/withdraw', position: 'grid', sortOrder: 94, status: 1 },
      { title: '邀请好友', icon: '🎯', path: '/invite', position: 'grid', sortOrder: 93, status: 1 },
      { title: '更多', icon: '📋', path: '/more', position: 'grid', sortOrder: 92, status: 1 },
    ];

    for (const menu of defaultMenus) {
      await this.appMenuRepo.save(this.appMenuRepo.create(menu));
    }

    return { message: '初始化成功' };
  }

  // ==================== 多语言文案管理 ====================

  /**
   * 获取文案列表
   */
  async getI18nTextList(dto: any) {
    const page = this.safeInt(dto.page, 1);
    const pageSize = this.safeInt(dto.pageSize, 20);
    const { category, keyword, lang } = dto;

    const query = this.i18nTextRepo.createQueryBuilder('t');
    if (category) {
      query.andWhere('t.category = :category', { category });
    }
    if (keyword) {
      query.andWhere('(t.key ILIKE :keyword OR t.zhCN ILIKE :keyword)', { keyword: `%${keyword}%` });
    }

    query.orderBy('t.id', 'DESC');
    query.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map(t => ({
        id: t.id,
        key: t.key,
        category: t.category,
        content: t.zhCN,
        remark: t.remark,
        langs: this.getAvailableLangs(t),
        updatedAt: this.formatDate(t.updatedAt),
      })),
      total,
    };
  }

  private getAvailableLangs(t: any): string[] {
    const langs: string[] = [];
    if (t.zhCN) langs.push('中');
    if (t.zhTW) langs.push('繁');
    if (t.en) langs.push('EN');
    if (t.ja) langs.push('日');
    if (t.ko) langs.push('韩');
    return langs;
  }

  /**
   * 获取单个文案详情
   */
  async getI18nTextDetail(id: number) {
    const text = await this.i18nTextRepo.findOne({ where: { id } });
    if (!text) {
      throw new BusinessException(1001, '文案不存在');
    }
    return {
      id: text.id,
      key: text.key,
      category: text.category,
      remark: text.remark,
      zhCN: text.zhCN,
      zhTW: text.zhTW,
      en: text.en,
      ja: text.ja,
      ko: text.ko,
    };
  }

  /**
   * 创建文案
   */
  async createI18nText(dto: any) {
    const existing = await this.i18nTextRepo.findOne({ where: { key: dto.key } });
    if (existing) {
      throw new BusinessException(1002, '文案Key已存在');
    }

    const text = this.i18nTextRepo.create({
      key: dto.key,
      category: dto.category,
      remark: dto.remark,
      zhCN: dto.zhCN,
      zhTW: dto.zhTW,
      en: dto.en,
      ja: dto.ja,
      ko: dto.ko,
    });

    await this.i18nTextRepo.save(text);
    return { id: text.id };
  }

  /**
   * 更新文案
   */
  async updateI18nText(id: number, dto: any) {
    const text = await this.i18nTextRepo.findOne({ where: { id } });
    if (!text) {
      throw new BusinessException(1001, '文案不存在');
    }

    if (dto.category !== undefined) text.category = dto.category;
    if (dto.remark !== undefined) text.remark = dto.remark;
    if (dto.zhCN !== undefined) text.zhCN = dto.zhCN;
    if (dto.zhTW !== undefined) text.zhTW = dto.zhTW;
    if (dto.en !== undefined) text.en = dto.en;
    if (dto.ja !== undefined) text.ja = dto.ja;
    if (dto.ko !== undefined) text.ko = dto.ko;

    await this.i18nTextRepo.save(text);
    return { id };
  }

  /**
   * 删除文案
   */
  async deleteI18nText(id: number) {
    const text = await this.i18nTextRepo.findOne({ where: { id } });
    if (!text) {
      throw new BusinessException(1001, '文案不存在');
    }
    await this.i18nTextRepo.remove(text);
    return { id };
  }

  /**
   * 导出文案
   */
  async exportI18nTexts(category?: string) {
    const where: any = {};
    if (category) where.category = category;

    const list = await this.i18nTextRepo.find({ where, order: { key: 'ASC' } });
    return list.map(t => ({
      key: t.key,
      category: t.category,
      remark: t.remark,
      'zh-CN': t.zhCN,
      'zh-TW': t.zhTW,
      en: t.en,
      ja: t.ja,
      ko: t.ko,
    }));
  }

  // ==================== 黄金玩法配置 ====================

  /**
   * 获取黄金玩法配置
   */
  async getGoldPlayConfig(configType: string) {
    const configKey = `gold_play_${configType}`;
    const config = await this.configRepo.findOne({ where: { configKey } });
    if (!config) {
      return this.getDefaultGoldPlayConfig(configType);
    }
    try {
      return JSON.parse(config.configValue);
    } catch {
      return this.getDefaultGoldPlayConfig(configType);
    }
  }

  private getDefaultGoldPlayConfig(configType: string) {
    const defaults: Record<string, any> = {
      types: [
        { id: 1, name: '黄金秒合约', code: 'gold_contract', description: '预测黄金价格涨跌，周期30秒-5分钟', sort: 100, status: 1 },
        { id: 2, name: 'AGX权益映射', code: 'agx_mapping', description: 'AGX代币映射黄金克数，享受每日收益', sort: 99, status: 1 },
        { id: 3, name: '黄金定投', code: 'gold_invest', description: '定期定额购买黄金，平摊成本', sort: 98, status: 1 },
        { id: 4, name: '黄金借贷', code: 'gold_loan', description: '质押黄金借出USDT', sort: 97, status: 0 },
      ],
      contract: {
        enabled: true,
        tradingHours: '24h',
        settlementPeriod: 60,
        upRate: 85,
        downRate: 85,
        tieAction: 'refund',
        minBet: 10,
        maxBet: 10000,
        maxDailyBets: 100
      },
      mapping: {
        enabled: true,
        ratio: 0.001,
        dailyRate: 0.05,
        minHolding: 100,
        settlementTime: '00:00',
        payoutType: 'gold'
      },
      invest: {
        enabled: true,
        periods: ['daily', 'weekly', 'monthly'],
        minAmount: 100,
        maxAmount: 100000,
        feeRate: 0.1
      },
      loan: {
        enabled: false,
        pledgeRate: 70,
        liquidationRate: 85,
        dailyInterest: 0.05,
        maxDays: 90,
        minLoan: 1000
      }
    };
    return defaults[configType] || {};
  }

  /**
   * 保存黄金玩法配置
   */
  async saveGoldPlayConfig(configType: string, data: any) {
    const configKey = `gold_play_${configType}`;
    let config = await this.configRepo.findOne({ where: { configKey } });
    
    if (!config) {
      config = this.configRepo.create({
        configKey,
        configValue: JSON.stringify(data),
        description: `黄金玩法配置 - ${configType}`,
      });
    } else {
      config.configValue = JSON.stringify(data);
    }

    await this.configRepo.save(config);
    return { success: true };
  }

  // ==================== 权限矩阵配置 ====================

  /**
   * 获取权限矩阵配置
   */
  async getPermissionMatrix() {
    const configKey = 'permission_matrix';
    const config = await this.configRepo.findOne({ where: { configKey } });
    
    if (!config) {
      return this.getDefaultPermissionMatrix();
    }
    
    try {
      return JSON.parse(config.configValue);
    } catch {
      return this.getDefaultPermissionMatrix();
    }
  }

  private getDefaultPermissionMatrix() {
    return [
      {
        key: 'can_post', name: '可以发帖', hasLimit: false,
        levels: [1,2,3,4,5].map(l => ({ level: l, allowed: 1, limitValue: null }))
      },
      {
        key: 'can_comment', name: '可以评论', hasLimit: false,
        levels: [1,2,3,4,5].map(l => ({ level: l, allowed: 1, limitValue: null }))
      },
      {
        key: 'can_add_friend', name: '可以加好友', hasLimit: false,
        levels: [1,2,3,4,5].map(l => ({ level: l, allowed: 1, limitValue: null }))
      },
      {
        key: 'can_chat', name: '可以私聊', hasLimit: false,
        levels: [1,2,3,4,5].map(l => ({ level: l, allowed: 1, limitValue: null }))
      },
      {
        key: 'daily_post_limit', name: '每日发帖上限', hasLimit: true,
        levels: [
          { level: 1, allowed: 1, limitValue: 5 },
          { level: 2, allowed: 1, limitValue: 10 },
          { level: 3, allowed: 1, limitValue: 20 },
          { level: 4, allowed: 1, limitValue: 50 },
          { level: 5, allowed: 1, limitValue: 100 },
        ]
      },
      {
        key: 'friend_limit', name: '好友数量上限', hasLimit: true,
        levels: [
          { level: 1, allowed: 1, limitValue: 100 },
          { level: 2, allowed: 1, limitValue: 200 },
          { level: 3, allowed: 1, limitValue: 500 },
          { level: 4, allowed: 1, limitValue: 1000 },
          { level: 5, allowed: 1, limitValue: 5000 },
        ]
      },
      {
        key: 'daily_message_limit', name: '每日私聊消息上限', hasLimit: true,
        levels: [
          { level: 1, allowed: 1, limitValue: 50 },
          { level: 2, allowed: 1, limitValue: 100 },
          { level: 3, allowed: 1, limitValue: 200 },
          { level: 4, allowed: 1, limitValue: 500 },
          { level: 5, allowed: 1, limitValue: 999999 },
        ]
      },
    ];
  }

  /**
   * 保存权限矩阵配置
   */
  async savePermissionMatrix(data: any[]) {
    const configKey = 'permission_matrix';
    let config = await this.configRepo.findOne({ where: { configKey } });

    if (!config) {
      config = this.configRepo.create({
        configKey,
        configValue: JSON.stringify(data),
        description: '等级权限矩阵配置',
      });
    } else {
      config.configValue = JSON.stringify(data);
    }

    await this.configRepo.save(config);
    return { success: true };
  }

  // ==================== 社交关系管理 ====================

  /**
   * 获取社交关系列表
   */
  async getSocialFriends(dto: any) {
    const page = this.safeInt(dto.page, 1);
    const pageSize = this.safeInt(dto.pageSize, 20);
    const { keyword } = dto;
    const query = this.userInviteRepo.createQueryBuilder('invite');

    if (keyword) {
      query.andWhere('invite.inviterId IN (SELECT id FROM agx_user WHERE username ILIKE :keyword OR nickname ILIKE :keyword)', { keyword: `%${keyword}%` });
    }

    query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('invite.createdAt', 'DESC');

    const [list, total] = await query.getManyAndCount();

    return {
      code: 0,
      data: {
        list: list.map(item => ({
          id: item.id,
          userId: item.userId,
          inviterId: item.inviterId,
          level: item.level,
          createdAt: this.formatDate(item.createdAt),
        })),
        total,
      },
    };
  }

  /**
   * 移除好友关系
   */
  async removeFriend(userId: number, friendId: number) {
    // 检查关系是否存在 - userId是被邀请人，inviterId是邀请人
    const relation = await this.userInviteRepo.findOne({
      where: { userId: friendId, inviterId: userId },
    });

    if (!relation) {
      return { code: 1001, msg: '好友关系不存在' };
    }

    await this.userInviteRepo.remove(relation);
    return { code: 0, msg: '已移除好友关系' };
  }

  // ==================== 系统功能开关 ====================

  /**
   * 获取系统功能开关配置
   */
  async getSystemToggles() {
    const configKey = 'system_toggles';
    const config = await this.configRepo.findOne({ where: { configKey } });

    const defaultToggles = {
      kyc_enabled: true,
      invite_enabled: true,
      pool_enabled: true,
      contract_enabled: true,
      gold_enabled: true,
      social_enabled: true,
      otc_enabled: false,
    };

    return {
      code: 0,
      data: config ? JSON.parse(config.configValue) : defaultToggles,
    };
  }

  /**
   * 更新系统功能开关配置
   */
  async updateSystemToggles(dto: any) {
    const configKey = 'system_toggles';
    let config = await this.configRepo.findOne({ where: { configKey } });

    const configValue = JSON.stringify(dto);

    if (!config) {
      config = this.configRepo.create({
        configKey,
        configValue,
        description: '系统功能开关配置',
      });
    } else {
      config.configValue = configValue;
    }

    await this.configRepo.save(config);
    return { code: 0, msg: '已更新系统功能开关' };
  }

  // ==================== 交易对管理 ====================

  /**
   * 获取交易对列表
   */
  async getTradePairs(dto: any) {
    // 暂时返回空数据，后续需要实现TradePair实体
    return {
      code: 0,
      data: {
        list: [],
        total: 0,
      },
    };
  }

  /**
   * 创建交易对
   */
  async createTradePair(dto: any) {
    return { code: 0, msg: '交易对创建成功（待实现）' };
  }

  /**
   * 更新交易对
   */
  async updateTradePair(id: number, dto: any) {
    return { code: 0, msg: '交易对更新成功（待实现）' };
  }

  /**
   * 删除交易对
   */
  async deleteTradePair(id: number) {
    return { code: 0, msg: '交易对删除成功（待实现）' };
  }

  /**
   * 获取IEO列表
   */
  async getIeoList(dto: any) {
    // 暂时返回空数据，后续需要实现IEO实体
    return {
      code: 0,
      data: {
        list: [],
        total: 0,
      },
    };
  }

  /**
   * 调整用户积分/经验值
   */
  async adjustUserPoints(id: number, dto: any, adminId?: number, ip?: string) {
    const { amount, type, remark } = dto; // type: 'increase' | 'decrease'

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw BusinessException.userNotFound();
    }

    const currentPoints = parseFloat(user.experiencePoints || '0');
    const adjustAmount = parseFloat(amount);
    const newPoints = type === 'increase'
      ? currentPoints + adjustAmount
      : currentPoints - adjustAmount;

    if (newPoints < 0) {
      throw new BusinessException(7003, '积分不足，无法扣减');
    }

    // 根据积分计算VIP等级
    const newVipLevel = this.calculateVipLevel(newPoints);

    user.experiencePoints = newPoints.toFixed(2);
    user.vipLevel = newVipLevel;
    await this.userRepo.save(user);

    // 记录操作日志
    if (adminId) {
      const actionText = type === 'increase' ? '增加积分' : '扣减积分';
      await this.logAdminAction(
        adminId,
        `用户管理-${actionText}`,
        `用户:${user.username}(ID:${id}), 积分:${amount}, VIP等级:${newVipLevel}, 备注:${remark || '无'}`,
        'user',
        id,
        ip
      );
    }

    return {
      userId: id,
      type,
      amount,
      pointsBefore: currentPoints.toFixed(2),
      pointsAfter: newPoints.toFixed(2),
      vipLevel: newVipLevel,
    };
  }

  /**
   * 根据积分计算VIP等级
   * V0 启蒙会员: 0-999
   * V1 准入会员: 1000-4999
   * V2 优选会员: 5000-19999
   * V3 资本合伙人: 20000-49999
   * V4 执行官合伙人: 50000-99999
   * V5 主权合伙人: 100000+
   */
  private calculateVipLevel(points: number): number {
    if (points >= 100000) return 5;
    if (points >= 50000) return 4;
    if (points >= 20000) return 3;
    if (points >= 5000) return 2;
    if (points >= 1000) return 1;
    return 0;
  }
}
