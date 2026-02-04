import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ContractConfig, ContractOrder, Wallet, Coin, GoldAccount, GoldSettlement, AssetLog, Commission, User, UserInvite } from '../../entities';
import { BusinessException, COIN_IDS } from '../../common';
import { CreateOrderDto } from './contract.dto';
import Decimal from 'decimal.js';
import { GoldService } from '../gold/gold.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DecimalCalculatorService } from '../../common/services/decimal-calculator.service';
import { AssetService } from '../wallet/services/asset.service';
import { ValidPositionService } from '../invite/services/valid-position.service';

@Injectable()
export class ContractService {
  private readonly logger = new Logger(ContractService.name);
  // 秒合约黄金结算配置
  private readonly OZ_PROFIT_RATE = 0.00001; // 每盈利1AGX = 0.00001oz黄金
  
  constructor(
    @InjectRepository(ContractConfig)
    private readonly configRepo: Repository<ContractConfig>,
    @InjectRepository(ContractOrder)
    private readonly orderRepo: Repository<ContractOrder>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Coin)
    private readonly coinRepo: Repository<Coin>,
    @InjectRepository(GoldAccount)
    private readonly goldAccountRepo: Repository<GoldAccount>,
    @InjectRepository(GoldSettlement)
    private readonly goldSettlementRepo: Repository<GoldSettlement>,
    @InjectRepository(AssetLog)
    private readonly assetLogRepo: Repository<AssetLog>,
    @InjectRepository(Commission)
    private readonly commissionRepo: Repository<Commission>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserInvite)
    private readonly userInviteRepo: Repository<UserInvite>,
    @Inject(forwardRef(() => GoldService))
    private readonly goldService: GoldService,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    private readonly decimalCalculator: DecimalCalculatorService,
    private readonly assetService: AssetService,
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

  private generateOrderNo(): string {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `C${datePart}${timePart}${random}`;
  }

  /**
   * 获取秒合约配置列表
   */
  async getConfigs() {
    const configs = await this.configRepo.find({
      where: { status: 1 },
      order: { symbol: 'ASC', duration: 'ASC' },
    });

    return {
      list: configs.map((c) => ({
        id: c.id,
        symbol: c.symbol,
        name: c.name,
        duration: c.duration,
        durationText: this.getDurationText(c.duration),
        profitRate: c.profitRate,
        profitRatePercent: new Decimal(c.profitRate).mul(100).toFixed(0) + '%',
        minAmount: c.minAmount,
        maxAmount: c.maxAmount,
      })),
    };
  }

  private getDurationText(seconds: number): string {
    if (seconds < 60) return `${seconds}秒`;
    return `${seconds / 60}分钟`;
  }

  /**
   * 创建订单（下单）
   */
  async createOrder(userId: number, dto: CreateOrderDto) {
    // 检查用户等级是否达到5级
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BusinessException(4000, '用户不存在');
    }
    if (user.level < 5) {
      throw new BusinessException(4010, '未达到级别，无法参与');
    }

    const config = await this.configRepo.findOne({
      where: { id: dto.configId, status: 1 },
    });

    if (!config) {
      throw new BusinessException(4001, '合约配置不存在');
    }

    const amount = new Decimal(dto.amount);

    if (amount.lt(config.minAmount)) {
      throw new BusinessException(4002, `最小下单金额 ${config.minAmount}`);
    }

    if (amount.gt(config.maxAmount)) {
      throw new BusinessException(4003, `最大下单金额 ${config.maxAmount}`);
    }

    // 获取AGX币种
    const agxCoin = await this.coinRepo.findOne({ where: { symbol: 'AGX' } });
    if (!agxCoin) {
      throw new BusinessException(4004, 'AGX币种未配置');
    }

    // 获取钱包（自动创建）
    const wallet = await this.getOrCreateWallet(userId, agxCoin.id);

    if (new Decimal(wallet.balance).lt(amount)) {
      throw new BusinessException(4005, `AGX余额不足，当前余额 ${wallet.balance}`);
    }

    // 模拟获取当前价格（实际应从外部API获取）
    const currentPrice = this.getMockPrice(config.symbol);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 扣减余额
      const balanceBefore = wallet.balance;
      const newBalance = new Decimal(wallet.balance).minus(amount).toString();
      await queryRunner.manager.update(Wallet, wallet.id, { balance: newBalance });

      // 创建订单
      const now = new Date();
      const closeAt = new Date(now.getTime() + config.duration * 1000);

      const order = this.orderRepo.create({
        orderNo: this.generateOrderNo(),
        userId,
        configId: config.id,
        symbol: config.symbol,
        duration: config.duration,
        direction: dto.direction,
        amount: amount.toString(),
        openPrice: currentPrice.toString(),
        profitRate: config.profitRate,
        status: 0,
        openAt: now,
      });

      await queryRunner.manager.save(order);

      // 记录资产流水 - 合约下单扣款
      const assetLog = this.assetLogRepo.create({
        userId,
        coin: 'AGX',
        type: 'contract_bet',
        amount: `-${amount.toString()}`,
        balanceBefore,
        balanceAfter: newBalance,
        refNo: order.orderNo,
        remark: `秒合约下单: ${config.symbol} ${dto.direction === 1 ? '看涨' : '看跌'}`,
      });
      await queryRunner.manager.save(assetLog);

      await queryRunner.commitTransaction();

      // 移除 setTimeout，改为由定时任务统一处理
      this.logger.log(`订单创建成功: ${order.orderNo}, 将在 ${config.duration} 秒后由定时任务自动结算`);

      return {
        orderId: order.id,
        orderNo: order.orderNo,
        symbol: order.symbol,
        direction: order.direction,
        directionText: order.direction === 1 ? '看涨' : '看跌',
        amount: order.amount,
        openPrice: order.openPrice,
        duration: order.duration,
        profitRate: config.profitRate,
        openAt: this.formatDate(now),
        closeAt: this.formatDate(closeAt),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 结算订单 - 使用用户胜率控制结果
   * 盈利时触发黄金结算
   * 添加完善的异常处理和事务管理
   */
  async settleOrder(orderId: number) {
    // 查找订单并加锁，防止重复结算
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(ContractOrder, {
        where: { id: orderId, status: 0 },
        lock: { mode: 'pessimistic_write' }, // 悲观锁，防止并发结算
      });

      if (!order) {
        await queryRunner.rollbackTransaction();
        this.logger.debug(`订单 ${orderId} 不存在或已结算`);
        return;
      }

      // 获取用户胜率
      let user;
      try {
        user = await queryRunner.manager.findOne('User', { where: { id: order.userId } });
      } catch (error) {
        this.logger.error(`获取用户 ${order.userId} 信息失败:`, error);
        user = null;
      }
      
      const winRate = user?.winRate ?? 50;

      const amount = new Decimal(order.amount);
      const profitRate = new Decimal(order.profitRate);

      // 根据用户胜率随机决定结果
      const random = Math.random() * 100;
      let result: number;
      let profitLoss: Decimal;

      if (random < winRate) {
        // 赢
        result = 1;
        profitLoss = amount.mul(profitRate);
      } else {
        // 输
        result = 2;
        profitLoss = amount.neg();
      }

      // 生成一个符合结果的收盘价
      const openPrice = new Decimal(order.openPrice);
      let closePrice: Decimal;
      
      try {
        const priceChange = openPrice.mul(0.001 + Math.random() * 0.005); // 0.1%-0.5%波动

        if (result === 1) {
          // 赢: 让价格向有利方向变动
          closePrice = order.direction === 1
            ? openPrice.plus(priceChange)  // 看涨 -> 价格上涨
            : openPrice.minus(priceChange); // 看跌 -> 价格下跌
        } else {
          // 输: 让价格向不利方向变动
          closePrice = order.direction === 1
            ? openPrice.minus(priceChange) // 看涨 -> 价格下跌
            : openPrice.plus(priceChange);  // 看跌 -> 价格上涨
        }
      } catch (error) {
        this.logger.error(`计算收盘价失败，使用开盘价:`, error);
        closePrice = openPrice;
      }

      // 计算黄金结算量（仅盈利时）
      let ozEarned = '0';
      if (result === 1) {
        // 盈利AGX * oz结算率 = 获得的oz
        ozEarned = profitLoss.times(this.OZ_PROFIT_RATE).toFixed(6);
      }

      // 更新订单
      await queryRunner.manager.update(ContractOrder, orderId, {
        closePrice: closePrice.toString(),
        profitLoss: profitLoss.toString(),
        result,
        status: 1,
        closeAt: new Date(),
      });

      // 返还本金 + 盈亏
      if (result === 1) {
        const agxCoin = await queryRunner.manager.findOne(Coin, { where: { symbol: 'AGX' } });
        
        if (!agxCoin) {
          throw new BusinessException(4004, 'AGX币种未配置');
        }

        const wallet = await queryRunner.manager.findOne(Wallet, {
          where: { userId: order.userId, coinId: agxCoin.id },
        });

        if (!wallet) {
          throw new BusinessException(4006, '用户钱包不存在');
        }

        const returnAmount = amount.plus(profitLoss);
        const balanceBefore = wallet.balance;
        const newBalance = new Decimal(wallet.balance).plus(returnAmount).toString();
        
        await queryRunner.manager.update(Wallet, wallet.id, { balance: newBalance });

        // 记录资产流水 - 合约盈利
        await queryRunner.manager.save(AssetLog, {
          userId: order.userId,
          coin: 'AGX',
          type: 'contract_win',
          amount: returnAmount.toString(),
          balanceBefore,
          balanceAfter: newBalance,
          refNo: order.orderNo,
          remark: `秒合约盈利: ${order.symbol} +${profitLoss.toFixed(2)} AGX`,
        });

        // 触发黄金结算（在事务内）
        if (new Decimal(ozEarned).gt(0)) {
          await this.processGoldSettlementInTransaction(
            queryRunner, 
            order.userId, 
            orderId, 
            ozEarned, 
            profitLoss.toString()
          );
        }
      } else {
        // 记录资产流水 - 合约亏损（本金已在下单时扣除，此处仅记录结果）
        await queryRunner.manager.save(AssetLog, {
          userId: order.userId,
          coin: 'AGX',
          type: 'contract_lose',
          amount: profitLoss.toString(),
          balanceBefore: '0',
          balanceAfter: '0',
          refNo: order.orderNo,
          remark: `秒合约亏损: ${order.symbol} ${profitLoss.toFixed(2)} AGX`,
        });
      }

      await queryRunner.commitTransaction();

      // 更新用户统计信息（订单数、胜率）
      this.updateUserStats(order.userId, orderId, result).catch(err => {
        this.logger.error(`更新用户统计失败:`, err.message);
      });

      // 触发邀请返佣（在事务外执行，失败不影响结算结果）
      this.processCommission(order.userId, order.id, order.amount).catch(err => {
        this.logger.error(`处理返佣失败:`, err.message);
      });

      // 发送结算通知事件
      this.eventEmitter.emit('contract.settled', {
        orderId: order.id,
        orderNo: order.orderNo,
        userId: order.userId,
        symbol: order.symbol,
        direction: order.direction,
        amount: order.amount,
        openPrice: order.openPrice,
        closePrice: closePrice.toString(),
        profitLoss: profitLoss.toString(),
        result,
        resultText: result === 1 ? '盈' : '亏',
        ozEarned,
        settledAt: new Date().toISOString(),
      });

      this.logger.log(`订单 ${order.orderNo} 结算完成: ${result === 1 ? '盈利' : '亏损'} ${profitLoss.toFixed(2)} AGX`);
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`订单 ${orderId} 结算失败:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 处理黄金结算（在事务内执行）
   */
  private async processGoldSettlementInTransaction(
    queryRunner: any,
    userId: number,
    orderId: number,
    ozAmount: string,
    agxProfit: string,
  ) {
    try {
      // 获取或创建黄金账户
      let goldAccount = await queryRunner.manager.findOne(GoldAccount, { where: { userId } });
      
      if (!goldAccount) {
        goldAccount = queryRunner.manager.create(GoldAccount, {
          userId,
          goldBalance: '0',
          goldFrozen: '0',
          usdtBalance: '0',
          usdtFrozen: '0',
          ozBalance: '0',
          ozFrozen: '0',
          ozTotalEarned: '0',
          ozFromHolding: '0',
          ozFromContract: '0',
          totalDeposit: '0',
          totalWithdraw: '0',
          totalIncome: '0',
          yesterdayIncome: '0',
          holdingCount: 0,
          holdingAmount: '0',
          status: 1,
        });
        await queryRunner.manager.save(GoldAccount, goldAccount);
      }

      const ozBefore = goldAccount.ozBalance || '0';
      const ozAfter = new Decimal(ozBefore).plus(ozAmount).toString();
      const today = new Date().toISOString().split('T')[0];

      // 获取金价（有异常处理）
      let pricePerOz = 2050; // 默认金价
      try {
        const goldPrices = await this.goldService.getGoldPrices();
        pricePerOz = parseFloat(goldPrices.gold.price);
      } catch (error) {
        this.logger.error('获取金价失败，使用默认金价:', error);
      }

      const usdValue = new Decimal(ozAmount).times(pricePerOz).toFixed(2);

      // 创建结算记录
      const settlementNo = `CS${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const settlement = queryRunner.manager.create(GoldSettlement, {
        userId,
        settlementNo,
        sourceType: 'contract',
        sourceId: orderId,
        ozAmount,
        ozBefore,
        ozAfter,
        agxAmount: agxProfit,
        goldPrice: pricePerOz.toString(),
        usdValue,
        remark: '秒合约盈利黄金结算',
        settlementDate: today,
      });
      await queryRunner.manager.save(GoldSettlement, settlement);

      // 更新黄金账户
      await queryRunner.manager.update(GoldAccount, { userId }, {
        ozBalance: ozAfter,
        ozTotalEarned: new Decimal(goldAccount.ozTotalEarned || '0').plus(ozAmount).toString(),
        ozFromContract: new Decimal(goldAccount.ozFromContract || '0').plus(ozAmount).toString(),
        lastSettlementDate: today,
      });

      this.logger.log(`[秒合约黄金结算] 用户${userId} 订单${orderId} 获得${ozAmount}oz`);
    } catch (error) {
      this.logger.error('黄金结算失败:', error);
      throw error; // 抛出异常让外层事务回滚
    }
  }

  /**
   * 处理黄金结算（独立事务，保持向后兼容）
   */
  private async processGoldSettlement(
    userId: number,
    orderId: number,
    ozAmount: string,
    agxProfit: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.processGoldSettlementInTransaction(queryRunner, userId, orderId, ozAmount, agxProfit);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('黄金结算事务失败:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取用户订单列表
   */
  async getOrders(userId: number, status?: number) {
    const where: any = { userId };
    if (status !== undefined) {
      where.status = status;
    }

    const orders = await this.orderRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return {
      list: orders.map((o) => ({
        id: o.id,
        orderNo: o.orderNo,
        symbol: o.symbol,
        direction: o.direction,
        directionText: o.direction === 1 ? '看涨' : '看跌',
        amount: o.amount,
        openPrice: o.openPrice,
        closePrice: o.closePrice,
        profitLoss: o.profitLoss,
        result: o.result,
        resultText: o.result === 1 ? '盈' : o.result === 2 ? '亏' : o.result === 3 ? '平' : '进行中',
        status: o.status,
        openAt: this.formatDate(o.openAt),
        closeAt: o.closeAt ? this.formatDate(o.closeAt) : null,
      })),
    };
  }

  /**
   * 模拟价格（实际应从外部API获取）
   */
  private getMockPrice(symbol: string): Decimal {
    const basePrices: Record<string, number> = {
      'XAU/USD': 2050,
      'XAG/USD': 24,
    };
    const basePrice = basePrices[symbol] || 100;
    // 随机波动 ±0.5%
    const fluctuation = 1 + (Math.random() - 0.5) * 0.01;
    return new Decimal(basePrice * fluctuation).toDecimalPlaces(2);
  }

  /**
   * 处理邀请返佣
   * 根据邀请人的有效好友数量计算返佣比例
   */
  private async processCommission(userId: number, orderId: number, amount: string) {
    try {
      // 获取交易用户的直接邀请人
      const directInvite = await this.userInviteRepo.findOne({
        where: { userId, level: 1 }
      });

      if (!directInvite) {
        this.logger.debug(`用户 ${userId} 没有邀请人，跳过返佣`);
        return;
      }

      const inviterId = directInvite.inviterId;

      // 使用 ValidPositionService 检查交易用户是否为有效用户（已建仓）
      const isValidUser = await this.validPositionService.isValidUser(userId);
      if (!isValidUser) {
        this.logger.debug(`用户 ${userId} 不是有效用户，跳过返佣`);
        return;
      }

      // 检查邀请人是否完成KYC
      const inviter = await this.userRepo.findOne({ where: { id: inviterId } });
      if (!inviter || inviter.kycStatus !== 2) {
        this.logger.debug(`邀请人 ${inviterId} 未完成KYC，跳过返佣`);
        return;
      }

      // 使用 ValidPositionService 获取返佣比例
      const commissionRate = await this.validPositionService.getCommissionRate(inviterId);
      const validInviteCount = await this.validPositionService.getValidInviteeCount(inviterId);

      // 使用 DecimalCalculatorService 计算返佣金额
      const commissionAmount = this.decimalCalculator.calculateCommission(amount, commissionRate);

      // 检查返佣金额是否大于0
      if (this.decimalCalculator.lessThanOrEqual(commissionAmount, '0.00000001')) {
        return;
      }

      // 获取AGX币种（合约使用AGX）
      const agxCoin = await this.coinRepo.findOne({ where: { symbol: 'AGX' } });
      if (!agxCoin) {
        this.logger.error('未找到AGX币种');
        return;
      }

      // 使用 AssetService 发放返佣（自动记录流水）
      await this.assetService.addBalance(
        inviterId,
        agxCoin.id,
        commissionAmount,
        'commission',
        `合约交易返佣 (订单: ${orderId})`,
        `COMMISSION_${orderId}_${Date.now()}`
      );

      // 记录返佣
      const commission = this.commissionRepo.create({
        userId: inviterId,
        fromUserId: userId,
        level: 1,
        sourceType: 'contract',
        sourceId: orderId,
        coinId: COIN_IDS.AGX,
        amount: commissionAmount,
        rate: commissionRate.toString(),
        status: 1, // 已发放
      });
      await this.commissionRepo.save(commission);

      // 更新邀请人累计返佣（使用 DecimalCalculatorService）
      const newTotalCommission = this.decimalCalculator.add(inviter.totalCommission || '0', commissionAmount);
      inviter.totalCommission = newTotalCommission;
      await this.userRepo.save(inviter);

      const ratePercent = this.decimalCalculator.multiply(commissionRate.toString(), 100);
      this.logger.log(`返佣成功: 邀请人${inviterId} (有效好友${validInviteCount}人, ${ratePercent}%) 从用户${userId}获得返佣${commissionAmount} AGX`);
    } catch (error) {
      this.logger.error('处理返佣失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户合约统计信息
   * 在订单结算后异步更新，不影响结算流程
   */
  private async updateUserStats(userId: number, orderId: number, result: number) {
    try {
      // 统计用户总订单数
      const totalOrders = await this.orderRepo.count({
        where: { userId, status: 1 } // 仅统计已结算的订单
      });

      // 统计盈利订单数
      const winOrders = await this.orderRepo.count({
        where: { userId, status: 1, result: 1 }
      });

      // 计算胜率（保留2位小数）
      const winRate = totalOrders > 0
        ? parseFloat(((winOrders / totalOrders) * 100).toFixed(2))
        : 50; // 默认50%

      // 更新用户表（只更新winRate字段）
      await this.userRepo.update(userId, {
        winRate: winRate
      });

      this.logger.debug(`用户${userId}统计更新: 总订单${totalOrders}, 胜率${winRate}%`);
    } catch (error) {
      this.logger.error(`更新用户${userId}统计失败:`, error);
      throw error;
    }
  }
}