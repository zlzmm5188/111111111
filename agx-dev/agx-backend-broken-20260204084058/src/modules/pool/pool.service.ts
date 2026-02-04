import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThan, LessThanOrEqual } from 'typeorm';
import { PoolProduct, PoolHolding, PoolIncome, Wallet, Coin, AssetLog, User, CommissionTier, UserInvite, Commission } from '../../entities';
import { BusinessException, COIN_IDS } from '../../common';
import { SubscribePoolDto, RedeemPoolDto } from './pool.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CacheService } from '../cache';
import { ValidPositionService } from '../invite/services/valid-position.service';
import Decimal from 'decimal.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PoolService {
  private readonly logger = new Logger(PoolService.name);


  constructor(
    @InjectRepository(PoolProduct)
    private readonly productRepo: Repository<PoolProduct>,
    @InjectRepository(PoolHolding)
    private readonly holdingRepo: Repository<PoolHolding>,
    @InjectRepository(PoolIncome)
    private readonly incomeRepo: Repository<PoolIncome>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Coin)
    private readonly coinRepo: Repository<Coin>,
    @InjectRepository(AssetLog)
    private readonly assetLogRepo: Repository<AssetLog>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(CommissionTier)
    private readonly commissionTierRepo: Repository<CommissionTier>,
    @InjectRepository(UserInvite)
    private readonly userInviteRepo: Repository<UserInvite>,
    @InjectRepository(Commission)
    private readonly commissionRepo: Repository<Commission>,
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
    @Inject(forwardRef(() => ValidPositionService))
    private readonly validPositionService: ValidPositionService,
  ) {}

  private formatDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  /**
   * 获取或创建用户钱包
   */
  private async getOrCreateWallet(userId: number, coinId: number): Promise<Wallet> {
    let wallet = await this.walletRepo.findOne({
      where: { userId, coinId },
    });

    if (!wallet) {
      this.logger.log(`为用户 ${userId} 自动创建币种 ${coinId} 的钱包`);
      wallet = this.walletRepo.create({
        userId,
        coinId,
        balance: '0',
        frozen: '0',
      });
      await this.walletRepo.save(wallet);
    }

    return wallet;
  }

  /**
   * 验证交易密码
   */
  private async verifyTradePassword(userId: number, password: string): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'tradePasswordHash', 'hasTradePassword'],
    });

    if (!user) {
      throw new BusinessException(1001, '用户不存在');
    }

    // 如果用户没有设置交易密码，暂时跳过验证（兼容老用户）
    if (!user.hasTradePassword || !user.tradePasswordHash) {
      this.logger.warn(`用户 ${userId} 未设置交易密码，跳过验证`);
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.tradePasswordHash);
    if (!isPasswordValid) {
      throw new BusinessException(3017, '交易密码错误');
    }
  }

  /**
   * 获取矿池产品列表（带缓存）
   */
  async getProducts() {
    const CACHE_KEY = 'pool:products';
    const CACHE_TTL = 60 * 1000; // 60秒

    return this.cacheService.getOrSet(CACHE_KEY, async () => {
      const products = await this.productRepo.find({
        where: { status: 1 },
        relations: ['coin'],
        order: { sortOrder: 'ASC', id: 'ASC' },
      });

      // 获取所有币种信息（使用缓存）
      const coins = await this.getCachedCoins();
      const coinMap = new Map(coins.map(c => [c.id, c]));

      return {
        list: products.map((p) => {
          const inputCoin = coinMap.get(p.coinId);
          const incomeCoin = p.incomeCoinId ? coinMap.get(p.incomeCoinId) : inputCoin;

          // 计算进度百分比
          let progress = parseFloat(p.progress) || 0;
          if (p.totalQuota && parseFloat(p.totalQuota) > 0) {
            progress = new Decimal(p.soldAmount || 0).div(p.totalQuota).mul(100).toNumber();
          }

          return {
            id: p.id,
            name: p.name,
            type: p.type,
            lockDays: p.lockDays,
            dailyRate: p.dailyRate,
            annualRate: new Decimal(p.dailyRate || 0).mul(365).mul(100).toFixed(2) + '%',
            minAmount: p.minAmount,
            maxAmount: p.maxAmount,
            totalQuota: p.totalQuota,
            soldAmount: p.soldAmount,
            remainQuota: p.totalQuota ? new Decimal(p.totalQuota).minus(p.soldAmount || 0).toString() : null,
            isHot: p.isHot === 1,
            // 币种信息
            coinId: p.coinId,
            coinSymbol: inputCoin?.symbol || 'AGX',
            incomeCoinId: p.incomeCoinId || p.coinId,
            incomeCoinSymbol: incomeCoin?.symbol || 'AGX',
            // 新增字段
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
            cycleUnit: p.cycleUnit || 'day',
            startTime: p.startTime,
            endTime: p.endTime,
            progress: progress.toFixed(2),
            // 福利开关
            enableRedpacket: p.enableRedpacket === 1,
            enableDividend: p.enableDividend === 1,
            enableDoubleExp: p.enableDoubleExp === 1,
            enableVipBonus: p.enableVipBonus === 1,
            enableLevelCommission: p.enableLevelCommission === 1,
            enableRepurchase: p.enableRepurchase === 1,
            // 福利详细参数
            redpacketType: p.redpacketType,
            redpacketPercent: p.redpacketPercent,
            redpacketAmount: p.redpacketAmount,
            dividendPercent: p.dividendPercent,
            doubleExpMultiplier: p.doubleExpMultiplier,
            vipBonusRates: p.vipBonusRates,
            levelCommissionRate: p.levelCommissionRate,
            repurchaseType: p.repurchaseType,
            repurchasePercent: p.repurchasePercent,
            repurchaseAmount: p.repurchaseAmount,
          };
        }),
      };
    }, CACHE_TTL);
  }

  /**
   * 获取币种列表（带缓存）
   */
  private async getCachedCoins(): Promise<Coin[]> {
    const CACHE_KEY = 'coins:all';
    const CACHE_TTL = 5 * 60 * 1000; // 5分钟

    return this.cacheService.getOrSet(CACHE_KEY, async () => {
      return await this.coinRepo.find();
    }, CACHE_TTL);
  }

  /**
   * 获取用户矿池持仓（优化版：减少N+1查询）
   */
  async getHoldings(userId: number) {
    const holdings = await this.holdingRepo.find({
      where: { userId, status: 1 },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });

    if (holdings.length === 0) {
      return {
        totalAmount: '0',
        totalIncome: '0',
        yesterdayIncome: '0',
        list: [],
        stats: {
          totalStaked: '0',
          stakingUsers: 0,
          avgAPY: 0,
        },
      };
    }

    let totalAmount = new Decimal(0);
    let totalIncome = new Decimal(0);
    let yesterdayIncome = new Decimal(0);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // 使用IN查询获取昨日收益
    const holdingIds = holdings.map(h => h.id);
    const yesterdayIncomeMap = new Map<number, string>();
    if (holdingIds.length > 0) {
      const incomeRecords = await this.incomeRepo
        .createQueryBuilder('income')
        .where('income.holdingId IN (:...ids)', { ids: holdingIds })
        .andWhere('income.incomeDate = :date', { date: yesterday })
        .getMany();

      incomeRecords.forEach(r => {
        yesterdayIncomeMap.set(r.holdingId, r.amount);
      });
    }

    // 获取币种信息（使用缓存）
    const coins = await this.getCachedCoins();
    const coinMap = new Map(coins.map(c => [c.id, c]));

    const list = holdings.map((h) => {
      totalAmount = totalAmount.plus(h.amount);
      totalIncome = totalIncome.plus(h.totalIncome);

      const yesterdayEarning = yesterdayIncomeMap.get(h.id) || '0';
      if (yesterdayEarning !== '0') {
        yesterdayIncome = yesterdayIncome.plus(yesterdayEarning);
      }

      const coin = coinMap.get(h.product.coinId);
      const coinSymbol = coin?.symbol || 'AGX';

      return {
        id: h.id,
        productName: h.product.name,
        productType: h.product.type,
        coinSymbol,
        amount: h.amount,
        totalIncome: h.totalIncome,
        dailyRate: h.product.dailyRate,
        apy: new Decimal(h.product.dailyRate).mul(365).mul(100).toFixed(2),
        startAt: this.formatDate(h.startAt),
        endAt: h.endAt ? this.formatDate(h.endAt) : null,
        lockDays: h.product.lockDays,
        canRedeem: h.product.type === 'flexible' || (h.endAt && new Date() >= h.endAt),
        redemptionType: h.product.type === 'flexible' ? '随时赎回' : '到期自动',
        dailyIncome: h.product.dailyRate ? new Decimal(h.amount).mul(h.product.dailyRate).toFixed(8) : '0',
        yesterdayEarnings: yesterdayEarning,
        annualIncome: h.product.dailyRate ? new Decimal(h.amount).mul(h.product.dailyRate).mul(365).toFixed(8) : '0',
      };
    });

    return {
      totalAmount: totalAmount.toString(),
      totalIncome: totalIncome.toString(),
      yesterdayIncome: yesterdayIncome.toString(),
      list,
      stats: {
        totalStaked: totalAmount.toString(),
        stakingUsers: await this.holdingRepo.count({ where: { status: 1 } }),
        avgAPY: list.length > 0 ? list.reduce((sum, h) => sum + parseFloat(h.apy), 0) / list.length : 0,
      },
    };
  }

  /**
   * 获取用户收益记录
   */
  async getIncomeRecords(userId: number, page = 1, limit = 20) {
    const [records, total] = await this.incomeRepo.findAndCount({
      where: { userId },
      relations: ['holding', 'holding.product'],
      order: { incomeDate: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const list = records.map((r) => ({
      id: r.id,
      holdingId: r.holdingId,
      productName: r.holding.product.name,
      amount: r.amount,
      dailyRate: r.dailyRate,
      incomeDate: r.incomeDate,
      createdAt: this.formatDate(r.createdAt),
      remark: r.remark,
    }));

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 计算矿池收益
   */
  private calculatePoolIncome(amount: string, dailyRate: string, days: number): string {
    const decimalAmount = new Decimal(amount);
    const decimalRate = new Decimal(dailyRate);
    return decimalAmount.mul(decimalRate).mul(days).toFixed(8);
  }

  /**
   * 申购矿池
   */
  async subscribe(userId: number, dto: SubscribePoolDto) {
    // 验证交易密码
    await this.verifyTradePassword(userId, dto.tradePassword);

    const product = await this.productRepo.findOne({
      where: { id: dto.productId, status: 1 },
      relations: ['coin'],
    });

    if (!product) {
      throw new BusinessException(3001, '矿池产品不存在或已下架');
    }

    // 验证VIP等级限制
    if (product.vipLevels && product.vipLevels !== 'all') {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      const userLevel = user?.level || 0;
      const allowedLevels = product.vipLevels.split(',').map(v => v.trim());
      
      if (!allowedLevels.includes('all') && !allowedLevels.includes(String(userLevel))) {
        const levelNames = ['探索者', '进阶者', '先锋者', '智控者', '量化师', '策动师'];
        const requiredLevels = allowedLevels.map(l => `VIP${l}`).join('/');
        throw new BusinessException(3020, `该产品仅限 ${requiredLevels} 会员购买`);
      }
    }

    // 检查最大投资次数
    if (product.maxInvestCount && product.maxInvestCount > 0) {
      const userHoldingCount = await this.holdingRepo.count({
        where: { userId, productId: product.id, status: 1 }
      });
      if (userHoldingCount >= product.maxInvestCount) {
        throw new BusinessException(3021, `该产品最多可购买 ${product.maxInvestCount} 次`);
      }
    }

    // 验证产品配置
    if (!product.incomeCoinId) {
      this.logger.warn(`产品 ${product.id} 未设置收益币种，将使用投入币种 ${product.coinId}`);
    }

    const amount = new Decimal(dto.amount);

    // 检查最小申购
    if (amount.lt(product.minAmount)) {
      throw new BusinessException(3002, `最低申购 ${product.minAmount} ${product.coin?.symbol || 'AGX'}`);
    }

    // 检查最大申购
    if (product.maxAmount && amount.gt(product.maxAmount)) {
      throw new BusinessException(3003, `最高申购 ${product.maxAmount} ${product.coin?.symbol || 'AGX'}`);
    }

    // 检查额度
    if (product.totalQuota) {
      const remain = new Decimal(product.totalQuota).minus(product.soldAmount);
      if (amount.gt(remain)) {
        throw new BusinessException(3004, `剩余额度不足，仅剩 ${remain.toString()} ${product.coin?.symbol || 'AGX'}`);
      }
    }

    // 获取用户钱包（自动创建）
    const wallet = await this.getOrCreateWallet(userId, product.coinId);

    if (new Decimal(wallet.balance).lt(amount)) {
      const coinSymbol = product.coin?.symbol || 'AGX';
      throw new BusinessException(3005, `${coinSymbol} 余额不足，当前余额 ${wallet.balance}`);
    }

    // 开始事务
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 获取币种信息
      const coin = await this.coinRepo.findOne({ where: { id: product.coinId } });
      const coinSymbol = coin?.symbol || 'AGX';

      // 扣减余额
      const newBalance = new Decimal(wallet.balance).minus(amount).toString();
      await queryRunner.manager.update(Wallet, wallet.id, { balance: newBalance });

      // 更新已售额度
      const newSoldAmount = new Decimal(product.soldAmount).plus(amount).toString();
      await queryRunner.manager.update(PoolProduct, product.id, { soldAmount: newSoldAmount });

      // 创建持仓
      const now = new Date();
      const endAt = product.lockDays > 0
        ? new Date(now.getTime() + product.lockDays * 24 * 60 * 60 * 1000)
        : null;

      const holding = this.holdingRepo.create({
        userId,
        productId: product.id,
        amount: amount.toString(),
        totalIncome: '0',
        startAt: now,
        endAt,
        status: 1,
      });

      await queryRunner.manager.save(holding);

      // 记录资产流水
      const assetLog = this.assetLogRepo.create({
        userId,
        coin: coinSymbol,
        type: 'pool_in',
        amount: `-${amount.toString()}`,
        balanceBefore: wallet.balance,
        balanceAfter: newBalance,
        refNo: `POOL${holding.id}`,
        remark: `矿池申购: ${product.name}`,
      });
      await queryRunner.manager.save(assetLog);

      // 获取收益币种信息（用于福利发放）
      const incomeCoinId = product.incomeCoinId || product.coinId;
      const incomeCoin = await this.coinRepo.findOne({ where: { id: incomeCoinId } });
      const incomeCoinSymbol = incomeCoin?.symbol || 'USDT';

      // 用于记录福利发放金额
      let redpacketAmountStr = '0';
      let repurchaseAmountStr = '0';
      let expGained = 0;

      // ========== 福利1: 红包奖励（购买时立即发放）==========
      if (product.enableRedpacket === 1) {
        let redpacketAmount = new Decimal(0);
        
        if (product.redpacketType === 'percent' && product.redpacketPercent) {
          // 百分比红包：购买金额 × 红包百分比
          redpacketAmount = amount.mul(new Decimal(product.redpacketPercent)).div(100);
        } else if (product.redpacketType === 'fixed' && product.redpacketAmount) {
          // 固定金额红包
          redpacketAmount = new Decimal(product.redpacketAmount);
        }

        if (redpacketAmount.gt(0)) {
          // 获取收益币种钱包
          const incomeWallet = await this.getOrCreateWallet(userId, incomeCoinId);
          const newIncomeBalance = new Decimal(incomeWallet.balance).plus(redpacketAmount).toString();
          
          // 更新钱包余额
          await queryRunner.manager.update(Wallet, incomeWallet.id, { balance: newIncomeBalance });
          
          // 记录红包流水
          const redpacketLog = this.assetLogRepo.create({
            userId,
            coin: incomeCoinSymbol,
            type: 'pool_redpacket',
            amount: redpacketAmount.toFixed(8),
            balanceBefore: incomeWallet.balance,
            balanceAfter: newIncomeBalance,
            refNo: `POOL_REDPACKET_${holding.id}`,
            remark: `矿池红包奖励: ${product.name}`,
          });
          await queryRunner.manager.save(redpacketLog);
          
          redpacketAmountStr = redpacketAmount.toFixed(8);
          this.logger.log(`用户 ${userId} 获得红包奖励: ${redpacketAmountStr} ${incomeCoinSymbol}`);
        }
      }

      // ========== 福利2: 双倍经验（建仓金额计算经验值）==========
      if (product.enableDoubleExp === 1) {
        // 基础经验：1U = 1经验值
        let baseExp = amount.toNumber();
        
        // 应用经验倍数
        const multiplier = parseFloat(product.doubleExpMultiplier as any) || 2;
        expGained = Math.floor(baseExp * multiplier);
        
        if (expGained > 0) {
          // 更新用户经验值
          const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
          if (user) {
            const currentExp = parseFloat(user.experiencePoints || '0');
            const newExp = (currentExp + expGained).toFixed(2);
            await queryRunner.manager.update(User, userId, { experiencePoints: newExp });
            
            this.logger.log(`用户 ${userId} 获得经验值: ${expGained} (${multiplier}倍经验)`);
          }
        }
      }

      // ========== 福利3: 复购补贴（同产品到期后再购买）==========
      if (product.enableRepurchase === 1) {
        // 查询用户该产品已结束的持仓次数（status=0 表示已赎回/到期）
        const productHistoryCount = await queryRunner.manager.count(PoolHolding, {
          where: { userId, productId: product.id, status: 0 }
        });

        // 该产品有到期/赎回记录才算复购
        if (productHistoryCount >= 1) {
          let repurchaseAmount = new Decimal(0);
          
          if (product.repurchaseType === 'percent' && product.repurchasePercent) {
            repurchaseAmount = amount.mul(new Decimal(product.repurchasePercent)).div(100);
          } else if (product.repurchaseType === 'fixed' && product.repurchaseAmount) {
            repurchaseAmount = new Decimal(product.repurchaseAmount);
          }

          if (repurchaseAmount.gt(0)) {
            // 获取收益币种钱包（可能已在红包步骤更新过）
            const incomeWallet = await this.getOrCreateWallet(userId, incomeCoinId);
            // 重新读取余额
            const currentWallet = await queryRunner.manager.findOne(Wallet, { where: { id: incomeWallet.id } });
            const newRepurchaseBalance = new Decimal(currentWallet.balance).plus(repurchaseAmount).toString();
            
            await queryRunner.manager.update(Wallet, incomeWallet.id, { balance: newRepurchaseBalance });
            
            // 记录复购补贴流水
            const repurchaseLog = this.assetLogRepo.create({
              userId,
              coin: incomeCoinSymbol,
              type: 'pool_repurchase',
              amount: repurchaseAmount.toFixed(8),
              balanceBefore: currentWallet.balance,
              balanceAfter: newRepurchaseBalance,
              refNo: `POOL_REPURCHASE_${holding.id}`,
              remark: `矿池复购补贴: ${product.name}（第${productHistoryCount + 1}次购买）`,
            });
            await queryRunner.manager.save(repurchaseLog);
            
            repurchaseAmountStr = repurchaseAmount.toFixed(8);
            this.logger.log(`用户 ${userId} 获得复购补贴: ${repurchaseAmountStr} ${incomeCoinSymbol}`);
          }
        }
      }

      await queryRunner.commitTransaction();

      // 计算预计收益
      const dailyIncome = new Decimal(amount).mul(product.dailyRate).toFixed(8);
      const annualIncome = new Decimal(amount).mul(product.dailyRate).mul(365).toFixed(8);

      return {
        holdingId: holding.id,
        amount: holding.amount,
        amountDisplay: `${new Decimal(amount).toFixed(2)} ${coinSymbol}`,
        startAt: this.formatDate(now),
        endAt: endAt ? this.formatDate(endAt) : null,
        // 币种信息
        coinId: product.coinId,
        coinSymbol: coinSymbol,
        incomeCoinId: incomeCoinId,
        incomeCoinSymbol: incomeCoinSymbol,
        // 收益信息
        dailyIncome: dailyIncome,
        dailyIncomeDisplay: `${dailyIncome} ${incomeCoinSymbol}`,
        annualIncome: annualIncome,
        annualIncomeDisplay: `${annualIncome} ${incomeCoinSymbol}`,
        annualRate: new Decimal(product.dailyRate).mul(365).mul(100).toFixed(2) + '%',
        // 福利发放信息
        redpacketAmount: redpacketAmountStr,
        repurchaseAmount: repurchaseAmountStr,
        expGained: expGained,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 赎回矿池
   */
  async redeem(userId: number, dto: RedeemPoolDto) {
    // 验证交易密码
    await this.verifyTradePassword(userId, dto.tradePassword);

    const holding = await this.holdingRepo.findOne({
      where: { id: dto.holdingId, userId, status: 1 },
      relations: ['product'],
    });

    if (!holding) {
      throw new BusinessException(3006, '持仓不存在');
    }

    // 检查是否可赎回
    if (holding.product.type === 'fixed' && holding.endAt && new Date() < holding.endAt) {
      const endDate = new Date(holding.endAt);
      const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      throw new BusinessException(3007, `定期产品未到期，还需等待 ${daysLeft} 天`);
    }

    // 获取收益币种信息（用于显示）
    const incomeCoinId = holding.product.incomeCoinId || holding.product.coinId;
    let incomeCoinSymbol = 'AGX';
    if (incomeCoinId !== holding.product.coinId) {
      const incomeCoin = await this.coinRepo.findOne({ where: { id: incomeCoinId } });
      if (incomeCoin) {
        incomeCoinSymbol = incomeCoin.symbol;
      }
    }

    // 开始事务
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 获取币种信息
      const principalCoin = await this.coinRepo.findOne({ where: { id: holding.product.coinId } });
      const principalCoinSymbol = principalCoin?.symbol || 'AGX';

      // 返还本金到投入币种钱包（自动创建）
      const principalWallet = await this.getOrCreateWallet(userId, holding.product.coinId);

      const newPrincipalBalance = new Decimal(principalWallet.balance)
        .plus(holding.amount)
        .toString();

      await queryRunner.manager.update(Wallet, principalWallet.id, {
        balance: newPrincipalBalance,
      });

      // 记录本金融水
      const principalAssetLog = this.assetLogRepo.create({
        userId,
        coin: principalCoinSymbol,
        type: 'pool_out',
        amount: holding.amount,
        balanceBefore: principalWallet.balance,
        balanceAfter: newPrincipalBalance,
        refNo: `POOL${holding.id}`,
        remark: `矿池赎回本金: ${holding.product.name}`,
      });
      await queryRunner.manager.save(principalAssetLog);

      // 更新持仓状态
      await queryRunner.manager.update(PoolHolding, holding.id, {
        status: 0,
        redeemedAt: new Date(),
      });

      // 更新产品已售额度
      const newSoldAmount = new Decimal(holding.product.soldAmount).minus(holding.amount).toString();
      await queryRunner.manager.update(PoolProduct, holding.product.id, { soldAmount: newSoldAmount });

      await queryRunner.commitTransaction();

      // 返回数据（收益已每日到账，这里只返回本金信息）
      return {
        // 本金信息
        principal: holding.amount,
        principalDisplay: `${new Decimal(holding.amount).toFixed(2)} ${principalCoinSymbol}`,
        principalCoinId: holding.product.coinId,
        principalCoinSymbol: principalCoinSymbol,
        // 收益信息（已每日到账，显示累计收益）
        income: holding.totalIncome,
        incomeDisplay: `${new Decimal(holding.totalIncome).toFixed(2)} ${incomeCoinSymbol}`,
        incomeCoinId: incomeCoinId,
        incomeCoinSymbol: incomeCoinSymbol,
        totalIncome: holding.totalIncome,
        // 提示信息
        note: '本金已返还，收益已每日到账',
        // 总计
        totalDisplay: `${new Decimal(holding.amount).toFixed(2)} ${principalCoinSymbol} + ${new Decimal(holding.totalIncome).toFixed(2)} ${incomeCoinSymbol}`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 每小时检查并派发收益 - 以买入时间为准（24小时后产生收益）
   */
  @Cron('0 0 * * * *')
  async distributePoolIncome() {
    this.logger.log('开始检查并派发矿池收益（以买入时间为准）...');

    try {
      // 获取所有活跃持仓
      const holdings = await this.holdingRepo.find({
        where: { status: 1 },
        relations: ['product', 'user'],
      });

      this.logger.log(`找到 ${holdings.length} 个活跃持仓`);

      let successCount = 0;
      let errorCount = 0;

      for (const holding of holdings) {
        try {
          const now = new Date();
          const startAt = new Date(holding.startAt);

          // 计算自买入以来经过的完整24小时周期数
          const hoursPassed = Math.floor((now.getTime() - startAt.getTime()) / (1000 * 60 * 60));

          if (hoursPassed < 24) {
            // 买入不足24小时，跳过
            continue;
          }

          // 计算应该已派发的收益次数
          const expectedIncomeCount = Math.floor(hoursPassed / 24);

          // 查询已派发的收益次数
          const actualIncomeCount = await this.incomeRepo.count({
            where: { holdingId: holding.id }
          });

          // 如果已派发次数 >= 应该派发次数，跳过
          if (actualIncomeCount >= expectedIncomeCount) {
            continue;
          }

          // 检查是否到期
          const isMatured = holding.endAt && now >= new Date(holding.endAt);

          // 计算日收益（投入AGX数量 × 日收益率 = USDT收益）
          let dailyIncome = new Decimal(holding.amount)
            .mul(holding.product.dailyRate);

          // 计算VIP加成收益
          if (holding.product.enableVipBonus === 1 && holding.product.vipBonusRates) {
            const userLevel = holding.user?.level || 0;
            const vipRates = typeof holding.product.vipBonusRates === 'string'
              ? JSON.parse(holding.product.vipBonusRates)
              : holding.product.vipBonusRates;
            const bonusRate = parseFloat(vipRates[`vip${userLevel}`] || 0) / 100;
            if (bonusRate > 0) {
              const bonusAmount = dailyIncome.mul(bonusRate);
              dailyIncome = dailyIncome.plus(bonusAmount);
              this.logger.debug(`用户 ${holding.userId} VIP${userLevel} 加成 ${(bonusRate * 100).toFixed(2)}%`);
            }
          }

          const dailyIncomeStr = dailyIncome.toFixed(8);

          // 获取收益币种（如果产品未设置，默认使用投入币种）
          const incomeCoinId = holding.product.incomeCoinId || holding.product.coinId;

          // 开始事务
          const queryRunner = this.dataSource.createQueryRunner();
          await queryRunner.connect();
          await queryRunner.startTransaction();

          try {
            // 如果到期了，需要处理：本金 + 收益 + 分红 + VIP增益
            if (isMatured) {
              await this.processMaturedHolding(queryRunner, holding, dailyIncomeStr, incomeCoinId);
            } else {
              // 未到期，只派发每日收益
              await this.processDailyIncome(queryRunner, holding, dailyIncomeStr, incomeCoinId);
            }

            await queryRunner.commitTransaction();
            successCount++;

            this.logger.debug(
              `持仓 ${holding.id} 派发${isMatured ? '到期' : ''}收益成功 (用户 ${holding.userId})`,
            );

            // 处理邀请返佣（异步，不影响主流程）
            this.processPoolCommission(
              holding.userId,
              holding.id,
              dailyIncomeStr,
              holding.product,
              incomeCoinId
            ).catch(err => {
              this.logger.error(`矿池收益返佣处理失败: ${err.message}`);
            });
          } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
          } finally {
            await queryRunner.release();
          }
        } catch (error) {
          errorCount++;
          this.logger.error(
            `持仓 ${holding.id} 派发收益失败: ${error.message}`,
            error.stack,
          );
        }
      }

      this.logger.log(
        `矿池收益派发完成: 成功 ${successCount} 笔, 失败 ${errorCount} 笔`,
      );
    } catch (error) {
      this.logger.error(`矿池收益派发任务失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 处理每日收益（未到期）
   */
  private async processDailyIncome(queryRunner: any, holding: any, dailyIncomeStr: string, incomeCoinId: number) {
    const incomeWallet = await this.getOrCreateWallet(holding.userId, incomeCoinId);

    // 更新钱包余额
    const newBalance = new Decimal(incomeWallet.balance)
      .plus(dailyIncomeStr)
      .toString();

    await queryRunner.manager.update(Wallet, incomeWallet.id, {
      balance: newBalance,
    });

    // 创建收益记录
    const incomeRecord = this.incomeRepo.create({
      userId: holding.userId,
      holdingId: holding.id,
      productId: holding.product.id,
      amount: dailyIncomeStr,
      coinId: incomeCoinId,
      dailyRate: holding.product.dailyRate,
      incomeDate: new Date(),
      remark: `矿池日收益 - ${holding.product.name}`,
    });

    await queryRunner.manager.save(incomeRecord);

    // 更新持仓累计收益
    const newTotalIncome = new Decimal(holding.totalIncome)
      .plus(dailyIncomeStr)
      .toString();

    await queryRunner.manager.update(PoolHolding, holding.id, {
      totalIncome: newTotalIncome,
    });

    // 获取币种信息用于记录流水
    const incomeCoin = await this.coinRepo.findOne({ where: { id: incomeCoinId } });
    const incomeCoinSymbol = incomeCoin?.symbol || 'USDT';

    // 记录资产流水
    const assetLog = this.assetLogRepo.create({
      userId: holding.userId,
      coin: incomeCoinSymbol,
      type: 'pool_income',
      amount: dailyIncomeStr,
      balanceBefore: incomeWallet.balance,
      balanceAfter: newBalance,
      refNo: `POOL_INCOME_${holding.id}_${Date.now()}`,
      remark: `矿池日收益: ${holding.product.name}`,
    });

    await queryRunner.manager.save(assetLog);
  }

  /**
   * 处理到期持仓：本金 + 收益 + 分红 + VIP增益 同时到账
   */
  private async processMaturedHolding(queryRunner: any, holding: any, dailyIncomeStr: string, incomeCoinId: number) {
    const incomeCoin = await this.coinRepo.findOne({ where: { id: incomeCoinId } });
    const incomeCoinSymbol = incomeCoin?.symbol || 'USDT';

    const principalCoin = await this.coinRepo.findOne({ where: { id: holding.product.coinId } });
    const principalCoinSymbol = principalCoin?.symbol || 'AGX';

    // 1. 派发最后一天的收益
    const incomeWallet = await this.getOrCreateWallet(holding.userId, incomeCoinId);
    const newIncomeBalance = new Decimal(incomeWallet.balance)
      .plus(dailyIncomeStr)
      .toString();

    await queryRunner.manager.update(Wallet, incomeWallet.id, {
      balance: newIncomeBalance,
    });

    // 创建最后收益记录
    const incomeRecord = this.incomeRepo.create({
      userId: holding.userId,
      holdingId: holding.id,
      productId: holding.product.id,
      amount: dailyIncomeStr,
      coinId: incomeCoinId,
      dailyRate: holding.product.dailyRate,
      incomeDate: new Date(),
      remark: `矿池日收益（到期） - ${holding.product.name}`,
    });

    await queryRunner.manager.save(incomeRecord);

    // 记录收益流水
    const incomeAssetLog = this.assetLogRepo.create({
      userId: holding.userId,
      coin: incomeCoinSymbol,
      type: 'pool_income',
      amount: dailyIncomeStr,
      balanceBefore: incomeWallet.balance,
      balanceAfter: newIncomeBalance,
      refNo: `POOL_INCOME_FINAL_${holding.id}_${Date.now()}`,
      remark: `矿池日收益（到期）: ${holding.product.name}`,
    });

    await queryRunner.manager.save(incomeAssetLog);

    // 2. 返还本金
    const principalWallet = await this.getOrCreateWallet(holding.userId, holding.product.coinId);
    const newPrincipalBalance = new Decimal(principalWallet.balance)
      .plus(holding.amount)
      .toString();

    await queryRunner.manager.update(Wallet, principalWallet.id, {
      balance: newPrincipalBalance,
    });

    // 记录本金融水
    const principalAssetLog = this.assetLogRepo.create({
      userId: holding.userId,
      coin: principalCoinSymbol,
      type: 'pool_out',
      amount: holding.amount,
      balanceBefore: principalWallet.balance,
      balanceAfter: newPrincipalBalance,
      refNo: `POOL_PRINCIPAL_${holding.id}_${Date.now()}`,
      remark: `矿池到期本金: ${holding.product.name}`,
    });

    await queryRunner.manager.save(principalAssetLog);

    // 3. 处理分红（如果启用）
    if (holding.product.enableDividend === 1 && holding.product.dividendPercent) {
      // 分红金额 = 本金 × 分红百分比
      const dividendAmount = new Decimal(holding.amount)
        .mul(new Decimal(holding.product.dividendPercent).div(100))
        .toFixed(8);

      if (parseFloat(dividendAmount) > 0) {
        // 重新读取钱包余额（可能被前面的收益更新过）
        const currentIncomeWallet = await queryRunner.manager.findOne(Wallet, { where: { id: incomeWallet.id } });
        const dividendBalance = new Decimal(currentIncomeWallet.balance)
          .plus(dividendAmount)
          .toString();

        await queryRunner.manager.update(Wallet, incomeWallet.id, {
          balance: dividendBalance,
        });

        // 记录分红流水
        const dividendAssetLog = this.assetLogRepo.create({
          userId: holding.userId,
          coin: incomeCoinSymbol,
          type: 'pool_dividend',
          amount: dividendAmount,
          balanceBefore: currentIncomeWallet.balance,
          balanceAfter: dividendBalance,
          refNo: `POOL_DIVIDEND_${holding.id}_${Date.now()}`,
          remark: `矿池到期分红(${holding.product.dividendPercent}%): ${holding.product.name}`,
        });

        await queryRunner.manager.save(dividendAssetLog);
        
        this.logger.log(`持仓 ${holding.id} 分红发放: ${dividendAmount} ${incomeCoinSymbol}`);
      }
    }

    // 4. 更新持仓状态为已赎回
    await queryRunner.manager.update(PoolHolding, holding.id, {
      status: 0,
      redeemedAt: new Date(),
      totalIncome: new Decimal(holding.totalIncome).plus(dailyIncomeStr).toString(),
    });

    // 5. 更新产品已售额度
    const newSoldAmount = new Decimal(holding.product.soldAmount).minus(holding.amount).toString();
    await queryRunner.manager.update(PoolProduct, holding.product.id, { soldAmount: newSoldAmount });

    this.logger.log(
      `持仓 ${holding.id} 到期处理完成: 本金 ${holding.amount} ${principalCoinSymbol} + 收益 ${dailyIncomeStr} ${incomeCoinSymbol}`,
    );
  }

  /**
   * 手动触发收益派发（用于测试）
   */
  async manualDistributeIncome() {
    return this.distributePoolIncome();
  }

  /**
   * 处理矿池收益返佣
   * 当用户获得矿池收益时，其邀请人可获得返佣
   * 支持两种模式并存：产品配置优先，若未配置则使用好友数阶梯
   */
  private async processPoolCommission(
    userId: number, 
    holdingId: number, 
    incomeAmount: string, 
    product: PoolProduct,
    incomeCoinId: number
  ) {
    try {
      // 获取用户的直接邀请人
      const directInvite = await this.userInviteRepo.findOne({
        where: { userId, level: 1 }
      });

      if (!directInvite) {
        this.logger.debug(`用户 ${userId} 没有邀请人，跳过矿池返佣`);
        return;
      }

      const inviterId = directInvite.inviterId;

      // 检查邀请人是否完成KYC
      const inviter = await this.userRepo.findOne({ where: { id: inviterId } });
      if (!inviter || inviter.kycStatus !== 2) {
        this.logger.debug(`邀请人 ${inviterId} 未完成KYC，跳过矿池返佣`);
        return;
      }

      // 检查用户是否为有效用户（已建仓）
      const isValidUser = await this.checkIsValidUser(userId);
      if (!isValidUser) {
        this.logger.debug(`用户 ${userId} 不是有效用户，跳过矿池返佣`);
        return;
      }

      let commissionRate: number | null = null;
      let rateSource = '';

      // 优先使用产品配置的层级返佣比例
      if (product.enableLevelCommission === 1 && product.levelCommissionRate) {
        commissionRate = parseFloat(product.levelCommissionRate as any) / 100;
        rateSource = 'product';
        this.logger.debug(`使用产品配置返佣比例: ${(commissionRate * 100).toFixed(2)}%`);
      } else {
        // 回退到好友数阶梯返佣
        const validInviteCount = await this.getValidInviteCount(inviterId);
        commissionRate = await this.getCommissionRateByInviteCount(validInviteCount);
        rateSource = `tier(${validInviteCount}人)`;
        
        if (commissionRate === null) {
          this.logger.warn(`[Commission Alert] 邀请人 ${inviterId} 有 ${validInviteCount} 个有效好友，未匹配阶梯，跳过返佣 (来源用户: ${userId}, 持仓: ${holdingId})`);
          return;
        }
      }

      if (commissionRate === null || commissionRate <= 0) {
        return;
      }
      
      const commissionAmount = new Decimal(incomeAmount).mul(commissionRate).toFixed(8);

      if (parseFloat(commissionAmount) < 0.00000001) {
        return;
      }

      // 获取币种信息
      const coinEntity = await this.coinRepo.findOne({ where: { id: incomeCoinId } });
      if (!coinEntity) {
        this.logger.error(`未找到币种ID: ${incomeCoinId}`);
        return;
      }
      const coinSymbol = coinEntity.symbol;

      // 获取邀请人的钱包
      const inviterWallet = await this.getOrCreateWallet(inviterId, incomeCoinId);

      // 开始事务
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // 发放返佣
        const currentBalance = new Decimal(inviterWallet.balance || '0');
        const newBalance = currentBalance.add(commissionAmount);

        await queryRunner.manager.update(Wallet, inviterWallet.id, {
          balance: newBalance.toFixed(8)
        });

        // 记录资产流水
        const assetLog = this.assetLogRepo.create({
          userId: inviterId,
          coin: coinSymbol,
          type: 'pool_level_commission',
          amount: commissionAmount,
          balanceBefore: currentBalance.toFixed(8),
          balanceAfter: newBalance.toFixed(8),
          refNo: `POOL_COMMISSION_${holdingId}_${Date.now()}`,
          remark: `矿池层级返佣(${rateSource})`,
        });
        await queryRunner.manager.save(assetLog);

        // 记录返佣
        const commission = this.commissionRepo.create({
          userId: inviterId,
          fromUserId: userId,
          level: 1,
          sourceType: 'pool',
          sourceId: holdingId,
          coinId: incomeCoinId,
          amount: commissionAmount,
          rate: commissionRate.toString(),
          status: 1, // 已发放
        });
        await queryRunner.manager.save(commission);

        // 更新邀请人累计返佣
        inviter.totalCommission = new Decimal(inviter.totalCommission || '0').add(commissionAmount).toFixed(8);
        await queryRunner.manager.save(inviter);

        await queryRunner.commitTransaction();

        this.logger.log(`矿池返佣成功: 邀请人${inviterId} (${rateSource}, ${(commissionRate*100).toFixed(1)}%) 从用户${userId}获得返佣${commissionAmount} ${coinSymbol}`);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error(`矿池返佣处理失败:`, error);
      throw error;
    }
  }

  /**
   * 根据有效好友数量获取返佣比例（从数据库配置读取）
   */
  private async getCommissionRateByInviteCount(inviteCount: number): Promise<number | null> {
    try {
      const tiers = await this.commissionTierRepo.find({
        where: { isEnabled: 1 },
        order: { minInvites: 'DESC' }
      });
      
      if (tiers.length === 0) {
        this.logger.warn('[Commission Alert] 未找到任何返佣阶梯配置');
        return null;
      }
      
      for (const tier of tiers) {
        if (inviteCount >= tier.minInvites) {
          return parseFloat(tier.commissionRate as any);
        }
      }
      
      // 未匹配到任何阶梯
      return null;
    } catch (e) {
      this.logger.error('[Commission Alert] 获取返佣阶梯配置失败: ' + e.message);
      return null;
    }
  }

  /**
   * 检查用户是否为有效用户
   * 统一使用 ValidPositionService 的判定标准
   */
  private async checkIsValidUser(userId: number): Promise<boolean> {
    try {
      return await this.validPositionService.isValidUser(userId);
    } catch (error) {
      this.logger.error(`检查用户${userId}有效性失败:`, error);
      return false;
    }
  }

  /**
   * 获取邀请人的有效好友数量
   * 统一使用 ValidPositionService 的统计方法
   */
  private async getValidInviteCount(inviterId: number): Promise<number> {
    return await this.validPositionService.getValidInviteeCount(inviterId);
  }

}