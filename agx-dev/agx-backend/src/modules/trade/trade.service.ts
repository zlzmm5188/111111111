import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TradingPair, SpotOrder, Wallet, Coin, CoinIssue, CoinSubscription, AssetLog } from '../../entities';
import { CreateOrderDto, SubscribeCoinDto, CreateTradingPairDto, UpdateTradingPairDto, CreateCoinIssueDto } from './trade.dto';
import { BusinessException } from '../../common';
import Decimal from 'decimal.js';

/**
 * IEO申购状态常量
 */
export const IEO_STATUS = {
  PENDING: 0,      // 待支付
  FROZEN: 1,       // 已冻结/待开奖
  WON: 2,          // 已中签待发币
  LOST: 3,         // 未中签待退款
  DISTRIBUTED: 4,  // 已发币完成
  REFUNDED: 5,     // 已退款完成
  CANCELLED: 6,    // 已取消
};

/**
 * 交易服务
 * 币币交易 + 新币发行
 */
@Injectable()
export class TradeService {
  constructor(
    @InjectRepository(TradingPair)
    private readonly pairRepo: Repository<TradingPair>,
    @InjectRepository(SpotOrder)
    private readonly orderRepo: Repository<SpotOrder>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Coin)
    private readonly coinRepo: Repository<Coin>,
    @InjectRepository(CoinIssue)
    private readonly issueRepo: Repository<CoinIssue>,
    @InjectRepository(CoinSubscription)
    private readonly subscriptionRepo: Repository<CoinSubscription>,
    @InjectRepository(AssetLog)
    private readonly assetLogRepo: Repository<AssetLog>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 生成订单号
   */
  private generateOrderNo(): string {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `S${datePart}${timePart}${random}`;
  }

  /**
   * 获取交易对列表
   */
  async getTradingPairs(status?: number) {
    const where: any = {};
    const statusNum = Number(status);
    if (!isNaN(statusNum)) {
      where.status = statusNum;
    } else {
      where.status = 1;
    }
    
    const pairs = await this.pairRepo.find({
      where,
      order: { sortOrder: 'ASC', symbol: 'ASC' },
    });

    return pairs.map((p) => ({
      id: p.id,
      symbol: p.symbol,
      baseCoin: p.baseCoin,
      quoteCoin: p.quoteCoin,
      minQty: p.minQty,
      maxQty: p.maxQty,
      pricePrecision: p.pricePrecision,
      qtyPrecision: p.qtyPrecision,
      tradeFee: p.tradeFee,
    }));
  }

  /**
   * 获取单个交易对详情
   */
  async getTradingPair(symbol: string) {
    const pair = await this.pairRepo.findOne({
      where: { symbol, status: 1 },
    });
    return pair;
  }

  /**
   * 创建订单
   */
  async createOrder(userId: number, dto: CreateOrderDto) {
    return this.createSpotOrder(userId, dto);
  }

  /**
   * 创建现货订单（限价单/市价单）
   */
  async createSpotOrder(userId: number, dto: CreateOrderDto) {
    // 查找交易对
    const pair = await this.pairRepo.findOne({
      where: { symbol: dto.symbol, status: 1 },
    });

    if (!pair) {
      throw new BusinessException(5001, '交易对不存在或已禁用');
    }

    // 验证限价单必须有价格
    if (dto.type === 'limit' && !dto.price) {
      throw new BusinessException(5002, '限价单必须指定价格');
    }

    // 验证数量
    const qty = new Decimal(dto.quantity);
    if (qty.lt(pair.minQty)) {
      throw new BusinessException(5003, `最小交易量 ${pair.minQty}`);
    }

    if (pair.maxQty && qty.gt(pair.maxQty)) {
      throw new BusinessException(5004, `最大交易量 ${pair.maxQty}`);
    }

    // 获取币种信息
    const baseCoin = await this.coinRepo.findOne({ where: { symbol: pair.baseCoin } });
    const quoteCoin = await this.coinRepo.findOne({ where: { symbol: pair.quoteCoin } });

    if (!baseCoin || !quoteCoin) {
      throw new BusinessException(5005, '币种配置缺失');
    }

    // 查询钱包余额
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let wallet: Wallet;
      let needAmount: Decimal;

      if (dto.side === 'buy') {
        // 买入：检查quote币余额
        wallet = await queryRunner.manager.findOne(Wallet, {
          where: { userId, coinId: quoteCoin.id },
        });

        if (!wallet) {
          throw new BusinessException(5006, `${quoteCoin.symbol} 钱包不存在`);
        }

        // 市价单：按当前市价估算所需金额（此处简化，实际需从行情获取）
        const price = dto.type === 'limit' ? new Decimal(dto.price) : new Decimal(100000); // mock价格
        needAmount = qty.mul(price);

        if (new Decimal(wallet.balance).lt(needAmount)) {
          throw new BusinessException(5007, `${quoteCoin.symbol} 余额不足`);
        }

        // 冻结资金
        wallet.balance = new Decimal(wallet.balance).minus(needAmount).toString();
        wallet.frozen = new Decimal(wallet.frozen).plus(needAmount).toString();
        await queryRunner.manager.save(wallet);
      } else {
        // 卖出：检查base币余额
        wallet = await queryRunner.manager.findOne(Wallet, {
          where: { userId, coinId: baseCoin.id },
        });

        if (!wallet) {
          throw new BusinessException(5008, `${baseCoin.symbol} 钱包不存在`);
        }

        needAmount = qty;

        if (new Decimal(wallet.balance).lt(needAmount)) {
          throw new BusinessException(5009, `${baseCoin.symbol} 余额不足`);
        }

        // 冻结资金
        wallet.balance = new Decimal(wallet.balance).minus(needAmount).toString();
        wallet.frozen = new Decimal(wallet.frozen).plus(needAmount).toString();
        await queryRunner.manager.save(wallet);
      }

      // 创建订单
      const order = this.orderRepo.create({
        orderNo: this.generateOrderNo(),
        userId,
        pairId: pair.id,
        symbol: dto.symbol,
        side: dto.side,
        type: dto.type,
        price: dto.type === 'limit' ? dto.price : null,
        quantity: dto.quantity,
        executedQty: 0,
        avgPrice: null,
        fee: 0,
        feeCoin: pair.quoteCoin,
        status: 0, // 待成交
      });

      await queryRunner.manager.save(order);

      // 市价单立即成交（模拟）
      if (dto.type === 'market') {
        const mockPrice = new Decimal(100000); // 实际应从行情获取
        order.executedQty = order.quantity;
        order.avgPrice = parseFloat(mockPrice.toString());
        order.status = 2; // 全部成交
        order.fee = mockPrice.mul(qty).mul(pair.tradeFee).toNumber();
        await queryRunner.manager.save(order);

        // 解冻并完成交易
        // ... 实际需要更复杂的撮合逻辑
      }

      await queryRunner.commitTransaction();

      return {
        code: 0,
        msg: 'ok',
        data: {
          orderNo: order.orderNo,
          symbol: order.symbol,
          side: order.side,
          type: order.type,
          price: order.price,
          quantity: order.quantity,
          status: order.status,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 撤销订单
   */
  async cancelOrder(userId: number, orderNo: string) {
    const order = await this.orderRepo.findOne({
      where: { orderNo, userId },
    });

    if (!order) {
      throw new BusinessException(5010, '订单不存在');
    }

    if (order.status !== 0 && order.status !== 1) {
      throw new BusinessException(5011, '订单不可撤销');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 计算未成交数量
      const remainQty = new Decimal(order.quantity).minus(order.executedQty);

      if (remainQty.gt(0)) {
        const pair = await this.pairRepo.findOne({ where: { id: order.pairId } });
        
        // 解冻资金
        if (order.side === 'buy') {
          const quoteCoin = await this.coinRepo.findOne({ where: { symbol: pair.quoteCoin } });
          const wallet = await queryRunner.manager.findOne(Wallet, {
            where: { userId, coinId: quoteCoin.id },
          });

          const price = new Decimal(order.price || 100000);
          const unfreezeAmount = remainQty.mul(price);

          wallet.balance = new Decimal(wallet.balance).plus(unfreezeAmount).toString();
          wallet.frozen = new Decimal(wallet.frozen).minus(unfreezeAmount).toString();
          await queryRunner.manager.save(wallet);
        } else {
          const baseCoin = await this.coinRepo.findOne({ where: { symbol: pair.baseCoin } });
          const wallet = await queryRunner.manager.findOne(Wallet, {
            where: { userId, coinId: baseCoin.id },
          });

          wallet.balance = new Decimal(wallet.balance).plus(remainQty.toString()).toString();
          wallet.frozen = new Decimal(wallet.frozen).minus(remainQty.toString()).toString();
          await queryRunner.manager.save(wallet);
        }
      }

      // 更新订单状态
      order.status = 3; // 已取消
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      return { code: 0, msg: '撤单成功', data: { orderNo } };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取用户订单列表
   */
  async getOrders(userId: number, status?: number, page: number = 1, pageSize: number = 20) {
    const query = this.orderRepo.createQueryBuilder('order')
      .where('order.userId = :userId', { userId })
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (status !== undefined) {
      query.andWhere('order.status = :status', { status });
    }

    const [orders, total] = await query.getManyAndCount();

    return {
      list: orders.map((o) => ({
        orderNo: o.orderNo,
        symbol: o.symbol,
        side: o.side,
        type: o.type,
        price: o.price,
        quantity: o.quantity,
        executedQty: o.executedQty,
        avgPrice: o.avgPrice,
        fee: o.fee,
        status: o.status,
        statusText: this.getStatusText(o.status),
        createdAt: this.formatDate(o.createdAt),
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取单个订单详情
   */
  async getOrder(userId: number, orderNo: string) {
    const order = await this.orderRepo.findOne({
      where: { userId, orderNo },
    });
    return order;
  }

  /**
   * 获取新币发行列表
   */
  async getCoinIssues(status?: number) {
    const where: any = {};
    const statusNum = Number(status);
    if (!isNaN(statusNum)) {
      where.status = statusNum;
    } else {
      where.status = 1;
    }
    
    const issues = await this.issueRepo.find({
      where,
      order: { startTime: 'DESC' },
    });

    return issues.map((i) => ({
      id: i.id,
      coinSymbol: i.coinSymbol,
      coinName: i.coinName,
      logo: i.logo,
      description: i.description,
      totalSupply: i.totalSupply,
      issuePrice: i.issuePrice,
      issueAmount: i.issueAmount,
      minBuyAmount: i.minBuyAmount,
      maxBuyAmount: i.maxBuyAmount,
      startTime: this.formatDate(i.startTime),
      endTime: this.formatDate(i.endTime),
      lotteryTime: this.formatDate(i.lotteryTime),
      unlockTime: this.formatDate(i.unlockTime),
      totalSubscribed: i.totalSubscribed,
      subscriberCount: i.subscriberCount,
      winRate: i.winRate,
      subscribeRate: new Decimal(i.totalSubscribed).div(i.issueAmount).mul(100).toFixed(2),
    }));
  }

  /**
   * 获取单个新币发行详情
   */
  async getCoinIssue(id: number) {
    const issue = await this.issueRepo.findOne({ where: { id } });
    return issue;
  }

  /**
   * 获取我的申购记录
   */
  async getMySubscriptions(userId: number) {
    const subscriptions = await this.subscriptionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return subscriptions;
  }

  /**
   * 新币申购 - 完整流程
   * 1. 验证项目和用户资格
   * 2. 冻结USDT（不直接扣减）
   * 3. 创建申购记录
   * 4. 记录资产流水
   */
  async subscribeCoin(userId: number, dto: SubscribeCoinDto) {
    const issue = await this.issueRepo.findOne({
      where: { id: dto.issueId, status: 1 },
    });

    if (!issue) {
      throw new BusinessException(5020, '发行项目不存在');
    }

    const now = new Date();
    if (now < issue.startTime) {
      throw new BusinessException(5021, '申购尚未开始');
    }

    if (now > issue.endTime) {
      throw new BusinessException(5022, '申购已结束');
    }

    const buyAmount = new Decimal(dto.buyAmount);

    if (buyAmount.lt(issue.minBuyAmount)) {
      throw new BusinessException(5023, `最小申购数量 ${issue.minBuyAmount}`);
    }

    if (buyAmount.gt(issue.maxBuyAmount)) {
      throw new BusinessException(5024, `最大申购数量 ${issue.maxBuyAmount}`);
    }

    // 检查是否已申购
    const existing = await this.subscriptionRepo.findOne({
      where: { userId, issueId: dto.issueId },
    });

    if (existing) {
      throw new BusinessException(5025, '您已参与过此次申购');
    }

    const payAmount = buyAmount.mul(issue.issuePrice);

    // 检查USDT余额
    const usdtCoin = await this.coinRepo.findOne({ where: { symbol: 'USDT' } });
    const wallet = await this.walletRepo.findOne({
      where: { userId, coinId: usdtCoin.id },
    });

    if (!wallet || new Decimal(wallet.balance).lt(payAmount)) {
      throw new BusinessException(5026, 'USDT余额不足');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const balanceBefore = wallet.balance;
      const newBalance = new Decimal(wallet.balance).minus(payAmount.toString()).toString();
      const newFrozen = new Decimal(wallet.frozen || '0').plus(payAmount.toString()).toString();

      // 冻结资金（从可用余额转到冻结）
      wallet.balance = newBalance;
      wallet.frozen = newFrozen;
      await queryRunner.manager.save(wallet);

      // 创建申购记录
      const subscription = this.subscriptionRepo.create({
        userId,
        issueId: dto.issueId,
        buyAmount: dto.buyAmount,
        payAmount: payAmount.toNumber(),
        winAmount: 0,
        refundAmount: 0,
        status: IEO_STATUS.FROZEN, // 已冻结/待开奖
      });
      await queryRunner.manager.save(subscription);

      // 记录资产流水 - IEO申购冻结
      const assetLog = this.assetLogRepo.create({
        userId,
        coin: 'USDT',
        type: 'ieo_freeze',
        amount: `-${payAmount.toString()}`,
        balanceBefore,
        balanceAfter: newBalance,
        refNo: `IEO${subscription.id}`,
        remark: `IEO申购冻结: ${issue.coinSymbol}`,
      });
      await queryRunner.manager.save(assetLog);

      // 更新发行统计
      issue.totalSubscribed = new Decimal(issue.totalSubscribed).plus(buyAmount.toString()).toNumber();
      issue.subscriberCount += 1;
      await queryRunner.manager.save(issue);

      await queryRunner.commitTransaction();

      return {
        code: 0,
        msg: '申购成功，资金已冻结',
        data: {
          id: subscription.id,
          buyAmount: subscription.buyAmount,
          payAmount: subscription.payAmount,
          status: subscription.status,
          statusLabel: '待开奖',
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * IEO开奖 - 管理员触发
   * 根据中签率随机选择中签用户
   */
  async lotteryIeo(issueId: number) {
    const issue = await this.issueRepo.findOne({ where: { id: issueId } });
    if (!issue) {
      throw new BusinessException(5030, '发行项目不存在');
    }

    // 获取所有待开奖的申购记录
    const subscriptions = await this.subscriptionRepo.find({
      where: { issueId, status: IEO_STATUS.FROZEN },
    });

    if (subscriptions.length === 0) {
      return { code: 0, msg: '没有待开奖的申购记录', data: { won: 0, lost: 0 } };
    }

    const winRate = issue.winRate || 100; // 中签率，默认100%
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let wonCount = 0;
      let lostCount = 0;

      for (const sub of subscriptions) {
        // 根据中签率随机决定是否中签
        const isWon = Math.random() * 100 < winRate;
        
        if (isWon) {
          sub.status = IEO_STATUS.WON;
          sub.winAmount = sub.buyAmount; // 全额中签
          wonCount++;
        } else {
          sub.status = IEO_STATUS.LOST;
          sub.winAmount = 0;
          lostCount++;
        }
        await queryRunner.manager.save(sub);
      }

      await queryRunner.commitTransaction();
      return {
        code: 0,
        msg: '开奖完成',
        data: { total: subscriptions.length, won: wonCount, lost: lostCount },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * IEO发币 - 给中签用户发放代币
   */
  async distributeIeo(subscriptionId: number) {
    const sub = await this.subscriptionRepo.findOne({
      where: { id: subscriptionId },
      relations: ['issue'],
    });

    if (!sub) {
      throw new BusinessException(5031, '申购记录不存在');
    }

    if (sub.status !== IEO_STATUS.WON) {
      throw new BusinessException(5032, '该记录不是中签状态');
    }

    const issue = sub.issue;
    const coinSymbol = issue.coinSymbol;

    // 获取代币信息
    const coin = await this.coinRepo.findOne({ where: { symbol: coinSymbol } });
    if (!coin) {
      throw new BusinessException(5033, `代币 ${coinSymbol} 不存在`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 获取或创建用户代币钱包
      let wallet = await this.walletRepo.findOne({
        where: { userId: sub.userId, coinId: coin.id },
      });

      if (!wallet) {
        wallet = this.walletRepo.create({
          userId: sub.userId,
          coinId: coin.id,
          balance: '0',
          frozen: '0',
        });
      }

      const balanceBefore = wallet.balance;
      const distributeAmount = new Decimal(sub.winAmount);
      wallet.balance = new Decimal(wallet.balance).plus(distributeAmount).toString();
      await queryRunner.manager.save(wallet);

      // 记录资产流水 - 发币
      const assetLog = this.assetLogRepo.create({
        userId: sub.userId,
        coin: coinSymbol,
        type: 'ieo_distribute',
        amount: distributeAmount.toString(),
        balanceBefore,
        balanceAfter: wallet.balance,
        refNo: `IEO${sub.id}`,
        remark: `IEO发币: ${coinSymbol}`,
      });
      await queryRunner.manager.save(assetLog);

      // 扣减USDT冻结（正式扣款）
      const usdtCoin = await this.coinRepo.findOne({ where: { symbol: 'USDT' } });
      const usdtWallet = await this.walletRepo.findOne({
        where: { userId: sub.userId, coinId: usdtCoin.id },
      });

      if (usdtWallet) {
        const payAmount = new Decimal(sub.payAmount);
        usdtWallet.frozen = new Decimal(usdtWallet.frozen).minus(payAmount).toString();
        await queryRunner.manager.save(usdtWallet);

        // 记录USDT扣款流水
        const usdtLog = this.assetLogRepo.create({
          userId: sub.userId,
          coin: 'USDT',
          type: 'ieo_pay',
          amount: `-${payAmount.toString()}`,
          balanceBefore: usdtWallet.frozen,
          balanceAfter: usdtWallet.frozen,
          refNo: `IEO${sub.id}`,
          remark: `IEO扣款: ${coinSymbol}`,
        });
        await queryRunner.manager.save(usdtLog);
      }

      // 更新申购状态
      sub.status = IEO_STATUS.DISTRIBUTED;
      await queryRunner.manager.save(sub);

      await queryRunner.commitTransaction();
      return { code: 0, msg: '发币成功', data: { amount: sub.winAmount } };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * IEO退款 - 给未中签用户退款
   */
  async refundIeo(subscriptionId: number) {
    const sub = await this.subscriptionRepo.findOne({
      where: { id: subscriptionId },
      relations: ['issue'],
    });

    if (!sub) {
      throw new BusinessException(5031, '申购记录不存在');
    }

    if (sub.status !== IEO_STATUS.LOST) {
      throw new BusinessException(5034, '该记录不是未中签状态');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 获取USDT钱包
      const usdtCoin = await this.coinRepo.findOne({ where: { symbol: 'USDT' } });
      const wallet = await this.walletRepo.findOne({
        where: { userId: sub.userId, coinId: usdtCoin.id },
      });

      if (!wallet) {
        throw new BusinessException(5035, '钱包不存在');
      }

      const refundAmount = new Decimal(sub.payAmount);
      const balanceBefore = wallet.balance;

      // 从冻结转回可用
      wallet.frozen = new Decimal(wallet.frozen).minus(refundAmount).toString();
      wallet.balance = new Decimal(wallet.balance).plus(refundAmount).toString();
      await queryRunner.manager.save(wallet);

      // 记录资产流水 - 退款
      const assetLog = this.assetLogRepo.create({
        userId: sub.userId,
        coin: 'USDT',
        type: 'ieo_refund',
        amount: refundAmount.toString(),
        balanceBefore,
        balanceAfter: wallet.balance,
        refNo: `IEO${sub.id}`,
        remark: `IEO退款: ${sub.issue.coinSymbol}`,
      });
      await queryRunner.manager.save(assetLog);

      // 更新申购状态
      sub.status = IEO_STATUS.REFUNDED;
      sub.refundAmount = sub.payAmount;
      await queryRunner.manager.save(sub);

      await queryRunner.commitTransaction();
      return { code: 0, msg: '退款成功', data: { amount: sub.payAmount } };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 批量发币 - 给所有中签用户发币
   */
  async batchDistributeIeo(issueId: number) {
    const subscriptions = await this.subscriptionRepo.find({
      where: { issueId, status: IEO_STATUS.WON },
    });

    let success = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await this.distributeIeo(sub.id);
        success++;
      } catch (e) {
        failed++;
      }
    }

    return { code: 0, msg: '批量发币完成', data: { success, failed } };
  }

  /**
   * 批量退款 - 给所有未中签用户退款
   */
  async batchRefundIeo(issueId: number) {
    const subscriptions = await this.subscriptionRepo.find({
      where: { issueId, status: IEO_STATUS.LOST },
    });

    let success = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await this.refundIeo(sub.id);
        success++;
      } catch (e) {
        failed++;
      }
    }

    return { code: 0, msg: '批量退款完成', data: { success, failed } };
  }

  private getStatusText(status: number): string {
    const map = {
      0: '待成交',
      1: '部分成交',
      2: '全部成交',
      3: '已取消',
      4: '失败',
    };
    return map[status] || '未知';
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    const second = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  // ========== 管理后台方法 ==========

  /**
   * 创建交易对
   */
  async createTradingPair(dto: CreateTradingPairDto) {
    const pair = this.pairRepo.create({
      symbol: dto.symbol,
      baseCoin: dto.baseCoin,
      quoteCoin: dto.quoteCoin,
      minQty: dto.minQty,
      maxQty: dto.maxQty,
      pricePrecision: dto.pricePrecision,
      qtyPrecision: dto.qtyPrecision,
      tradeFee: dto.tradeFee,
      status: dto.status ?? 1,
      sortOrder: dto.sortOrder ?? 0,
    });
    await this.pairRepo.save(pair);
    return pair;
  }

  /**
   * 更新交易对
   */
  async updateTradingPair(id: number, dto: UpdateTradingPairDto) {
    const pair = await this.pairRepo.findOne({ where: { id } });
    if (!pair) {
      throw new BusinessException(5030, '交易对不存在');
    }
    Object.assign(pair, dto);
    await this.pairRepo.save(pair);
    return pair;
  }

  /**
   * 删除交易对
   */
  async deleteTradingPair(id: number) {
    const pair = await this.pairRepo.findOne({ where: { id } });
    if (!pair) {
      throw new BusinessException(5031, '交易对不存在');
    }
    await this.pairRepo.remove(pair);
    return { success: true };
  }

  /**
   * 创建新币发行
   */
  async createCoinIssue(dto: CreateCoinIssueDto) {
    const issue = this.issueRepo.create({
      coinSymbol: dto.coinSymbol,
      coinName: dto.coinName,
      totalSupply: dto.totalSupply,
      issuePrice: dto.issuePrice,
      issueAmount: dto.issueAmount,
      minBuyAmount: dto.minBuyAmount,
      maxBuyAmount: dto.maxBuyAmount,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      lotteryTime: new Date(dto.lotteryTime),
      unlockTime: new Date(dto.unlockTime),
      status: 1,
      totalSubscribed: 0,
      subscriberCount: 0,
    });
    await this.issueRepo.save(issue);
    return issue;
  }

  /**
   * 更新新币发行
   */
  async updateCoinIssue(id: number, dto: CreateCoinIssueDto) {
    const issue = await this.issueRepo.findOne({ where: { id } });
    if (!issue) {
      throw new BusinessException(5040, '发行项目不存在');
    }

    // 更新字段
    if (dto.coinSymbol) issue.coinSymbol = dto.coinSymbol;
    if (dto.coinName) issue.coinName = dto.coinName;
    if (dto.totalSupply) issue.totalSupply = dto.totalSupply;
    if (dto.issuePrice) issue.issuePrice = dto.issuePrice;
    if (dto.issueAmount) issue.issueAmount = dto.issueAmount;
    if (dto.minBuyAmount) issue.minBuyAmount = dto.minBuyAmount;
    if (dto.maxBuyAmount) issue.maxBuyAmount = dto.maxBuyAmount;
    if (dto.startTime) issue.startTime = new Date(dto.startTime);
    if (dto.endTime) issue.endTime = new Date(dto.endTime);
    if (dto.lotteryTime) issue.lotteryTime = new Date(dto.lotteryTime);
    if (dto.unlockTime) issue.unlockTime = new Date(dto.unlockTime);

    await this.issueRepo.save(issue);
    return issue;
  }

  /**
   * 删除新币发行
   */
  async deleteCoinIssue(id: number) {
    const issue = await this.issueRepo.findOne({ where: { id } });
    if (!issue) {
      throw new BusinessException(5041, '发行项目不存在');
    }

    // 检查是否有申购记录
    const subscriptionCount = await this.subscriptionRepo.count({ where: { issueId: id } });
    if (subscriptionCount > 0) {
      throw new BusinessException(5042, '已有申购记录，无法删除');
    }

    await this.issueRepo.remove(issue);
    return { success: true };
  }

  /**
   * 获取所有订单列表（管理后台）
   */
  async getAllOrders(
    page: number = 1,
    pageSize: number = 50,
    filters?: {
      symbol?: string;
      side?: string;
      status?: number;
      userId?: number;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const query = this.orderRepo
      .createQueryBuilder('order')
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (filters?.symbol) {
      query.andWhere('order.symbol = :symbol', { symbol: filters.symbol });
    }
    if (filters?.side) {
      query.andWhere('order.side = :side', { side: filters.side });
    }
    if (filters?.status !== undefined) {
      query.andWhere('order.status = :status', { status: filters.status });
    }
    if (filters?.userId) {
      query.andWhere('order.userId = :userId', { userId: filters.userId });
    }
    if (filters?.startDate) {
      query.andWhere('order.createdAt >= :startDate', { startDate: new Date(filters.startDate) });
    }
    if (filters?.endDate) {
      query.andWhere('order.createdAt <= :endDate', { endDate: new Date(filters.endDate) });
    }

    const [orders, total] = await query.getManyAndCount();

    return {
      list: orders.map((o) => ({
        id: o.id,
        orderNo: o.orderNo,
        userId: o.userId,
        symbol: o.symbol,
        side: o.side,
        sideText: o.side === 'buy' ? '买入' : '卖出',
        type: o.type,
        typeText: o.type === 'limit' ? '限价单' : '市价单',
        price: o.price,
        quantity: o.quantity,
        executedQty: o.executedQty,
        avgPrice: o.avgPrice,
        fee: o.fee,
        feeCoin: o.feeCoin,
        status: o.status,
        statusText: this.getStatusText(o.status),
        createdAt: this.formatDate(o.createdAt),
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取交易对列表（管理后台）
   */
  async getAllTradingPairs(page: number = 1, pageSize: number = 50, status?: number) {
    const query = this.pairRepo
      .createQueryBuilder('pair')
      .orderBy('pair.sortOrder', 'ASC')
      .addOrderBy('pair.symbol', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (status !== undefined) {
      query.andWhere('pair.status = :status', { status });
    }

    const [pairs, total] = await query.getManyAndCount();

    return {
      list: pairs.map((p) => ({
        id: p.id,
        symbol: p.symbol,
        baseCoin: p.baseCoin,
        quoteCoin: p.quoteCoin,
        minQty: p.minQty,
        maxQty: p.maxQty,
        pricePrecision: p.pricePrecision,
        qtyPrecision: p.qtyPrecision,
        tradeFee: p.tradeFee,
        status: p.status,
        sortOrder: p.sortOrder,
        createdAt: this.formatDate(p.createdAt),
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取申购记录列表（管理后台）
   */
  async getAllSubscriptions(
    page: number = 1,
    pageSize: number = 50,
    filters?: {
      issueId?: number;
      userId?: number;
      status?: number;
    },
  ) {
    const query = this.subscriptionRepo
      .createQueryBuilder('sub')
      .leftJoinAndSelect('sub.issue', 'issue')
      .orderBy('sub.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (filters?.issueId) {
      query.andWhere('sub.issueId = :issueId', { issueId: filters.issueId });
    }
    if (filters?.userId) {
      query.andWhere('sub.userId = :userId', { userId: filters.userId });
    }
    if (filters?.status !== undefined) {
      query.andWhere('sub.status = :status', { status: filters.status });
    }

    const [subscriptions, total] = await query.getManyAndCount();

    const statusTextMap = {
      0: '待开奖',
      1: '已中签',
      2: '未中签',
      3: '已退款',
    };

    return {
      list: subscriptions.map((s) => ({
        id: s.id,
        userId: s.userId,
        issueId: s.issueId,
        coinSymbol: s.issue?.coinSymbol || '-',
        buyAmount: s.buyAmount,
        payAmount: s.payAmount,
        winAmount: s.winAmount,
        refundAmount: s.refundAmount,
        status: s.status,
        statusText: statusTextMap[s.status] || '未知',
        createdAt: this.formatDate(s.createdAt),
      })),
      total,
      page,
      pageSize,
    };
  }
}
