import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { OtcOrder, OtcAdvertisement, User, Wallet } from '../../entities';
import Decimal from 'decimal.js';

/**
 * OTC交易服务
 */
@Injectable()
export class OtcService {
  constructor(
    @InjectRepository(OtcOrder)
    private otcOrderRepo: Repository<OtcOrder>,
    @InjectRepository(OtcAdvertisement)
    private otcAdRepo: Repository<OtcAdvertisement>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
  ) {}

  /**
   * 获取OTC实时汇率
   */
  async getRate(): Promise<{ buyRate: number; sellRate: number; currency: string }> {
    // 基准汇率
    const baseRate = 7.25;
    const fluctuation = (Math.random() - 0.5) * 0.02;
    const buyRate = Number((baseRate + fluctuation + 0.01).toFixed(2));
    const sellRate = Number((baseRate + fluctuation - 0.01).toFixed(2));
    
    return {
      buyRate,
      sellRate,
      currency: 'CNY',
    };
  }

  /**
   * 获取广告列表（从数据库读取真实挂单）
   */
  async getAdvertisements(
    type: 'buy' | 'sell',
    page = 1,
    limit = 10,
    userId?: number,
  ): Promise<{ list: any[]; total: number }> {
    const queryBuilder = this.otcAdRepo
      .createQueryBuilder('ad')
      .leftJoinAndSelect('ad.user', 'user')
      .where('ad.type = :type', { type })
      .andWhere('ad.status = 1')
      .andWhere('ad.availableAmount > 0');

    // 排除自己的挂单
    if (userId) {
      queryBuilder.andWhere('ad.userId != :userId', { userId });
    }

    // 按价格排序：买入时从低到高，卖出时从高到低
    queryBuilder.orderBy('ad.price', type === 'buy' ? 'ASC' : 'DESC');

    const [ads, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const list = ads.map(ad => ({
      id: ad.id,
      userId: ad.userId,
      merchant: ad.user?.nickname || ad.user?.username || `用户${ad.userId}`,
      avatar: ad.user?.avatar,
      verified: ad.user?.kycStatus === 2,
      price: parseFloat(ad.price),
      currency: 'USDT',
      fiatCurrency: 'CNY',
      minAmount: parseFloat(ad.minLimit),
      maxAmount: parseFloat(ad.maxLimit),
      available: `${parseFloat(ad.availableAmount).toLocaleString()} USDT`,
      availableNum: parseFloat(ad.availableAmount),
      totalAmount: parseFloat(ad.totalAmount),
      payments: JSON.parse(ad.paymentMethods || '[]'),
      payTimeLimit: ad.payTimeLimit,
      remark: ad.remark,
      completedCount: ad.completedCount,
      type: ad.type,
      createdAt: ad.createdAt,
    }));

    return { list, total };
  }

  /**
   * 创建挂单/发布广告
   */
  async createAdvertisement(
    userId: number,
    type: 'buy' | 'sell',
    price: string,
    amount: string,
    minLimit: string,
    maxLimit: string,
    paymentMethods: string[],
    remark?: string,
    payTimeLimit = 15,
  ) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 如果是卖出，检查USDT余额
    if (type === 'sell') {
      const wallet = await this.walletRepo.findOne({
        where: { userId, coin: { symbol: 'USDT' } },
        relations: ['coin'],
      });
      
      const balance = new Decimal(wallet?.balance || 0);
      const sellAmount = new Decimal(amount);
      
      if (balance.lt(sellAmount)) {
        throw new BadRequestException('USDT余额不足');
      }

      // 冻结USDT
      await this.walletRepo.update(wallet.id, {
        balance: balance.minus(sellAmount).toString(),
        frozen: new Decimal(wallet.frozen || 0).plus(sellAmount).toString(),
      });
    }

    const ad = this.otcAdRepo.create({
      userId,
      type,
      coinId: 2, // USDT
      price,
      totalAmount: amount,
      availableAmount: amount,
      minLimit,
      maxLimit,
      paymentMethods: JSON.stringify(paymentMethods),
      remark,
      payTimeLimit,
      status: 1,
    });

    await this.otcAdRepo.save(ad);
    return ad;
  }

  /**
   * 获取我的挂单
   */
  async getMyAdvertisements(userId: number, status?: number) {
    const where: any = { userId };
    if (status !== undefined) {
      where.status = status;
    }

    const ads = await this.otcAdRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });

    return ads.map(ad => ({
      id: ad.id,
      type: ad.type,
      price: ad.price,
      totalAmount: ad.totalAmount,
      availableAmount: ad.availableAmount,
      minLimit: ad.minLimit,
      maxLimit: ad.maxLimit,
      payments: JSON.parse(ad.paymentMethods || '[]'),
      remark: ad.remark,
      status: ad.status,
      completedCount: ad.completedCount,
      completedAmount: ad.completedAmount,
      createdAt: ad.createdAt,
    }));
  }

  /**
   * 下架挂单
   */
  async cancelAdvertisement(userId: number, adId: number) {
    const ad = await this.otcAdRepo.findOne({ where: { id: adId, userId } });
    if (!ad) {
      throw new BadRequestException('挂单不存在');
    }

    if (ad.status !== 1) {
      throw new BadRequestException('挂单状态不正确');
    }

    // 如果是卖出挂单，解冻USDT
    if (ad.type === 'sell') {
      const wallet = await this.walletRepo.findOne({
        where: { userId, coin: { symbol: 'USDT' } },
        relations: ['coin'],
      });
      
      if (wallet) {
        const availableAmount = new Decimal(ad.availableAmount);
        await this.walletRepo.update(wallet.id, {
          balance: new Decimal(wallet.balance || 0).plus(availableAmount).toString(),
          frozen: new Decimal(wallet.frozen || 0).minus(availableAmount).toString(),
        });
      }
    }

    ad.status = 0;
    await this.otcAdRepo.save(ad);
    return { success: true };
  }

  /**
   * 更新挂单价格
   */
  async updateAdvertisementPrice(userId: number, adId: number, price: string) {
    const ad = await this.otcAdRepo.findOne({ where: { id: adId, userId } });
    if (!ad) {
      throw new BadRequestException('挂单不存在');
    }

    if (ad.status !== 1) {
      throw new BadRequestException('挂单状态不正确');
    }

    ad.price = price;
    await this.otcAdRepo.save(ad);
    return ad;
  }

  /**
   * 创建OTC订单
   */
  async createOrder(
    userId: number,
    type: 'buy' | 'sell',
    advertisementId: number,
    amount: number,
    payMethod: string,
  ): Promise<OtcOrder> {
    // 获取用户
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 获取广告信息
    const ads = await this.getAdvertisements(type, 1, 100);
    const ad = ads.list.find(a => a.id === advertisementId);
    if (!ad) {
      throw new BadRequestException('广告不存在');
    }

    // 验证金额
    if (amount < ad.minAmount || amount > ad.maxAmount) {
      throw new BadRequestException(`金额需在 ${ad.minAmount} - ${ad.maxAmount} 之间`);
    }

    // 计算USDT数量
    const usdtAmount = Number((amount / ad.price).toFixed(2));

    // 生成订单号
    const orderNo = `OTC${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // 创建订单
    const order = this.otcOrderRepo.create({
      orderNo,
      type,
      adId: ad.id,
      buyerId: type === 'buy' ? userId : ad.merchantId,
      sellerId: type === 'sell' ? userId : ad.merchantId,
      coinId: 2, // USDT
      amount: usdtAmount.toString(),
      price: ad.price.toString(),
      totalPrice: amount.toString(),
      totalAmount: amount.toString(),
      paymentMethod: payMethod,
      status: 'pending',
    });

    await this.otcOrderRepo.save(order);
    return order;
  }

  /**
   * 获取用户订单历史
   */
  async getUserOrders(
    userId: number,
    status?: string,
    page = 1,
    limit = 10,
  ): Promise<{ list: OtcOrder[]; total: number }> {
    const query = this.otcOrderRepo.createQueryBuilder('order')
      .where('(order.buyer_id = :userId OR order.seller_id = :userId)', { userId })
      .orderBy('order.created_at', 'DESC');

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { list, total };
  }

  /**
   * 获取订单详情
   */
  async getOrderDetail(orderNo: string, userId: number): Promise<OtcOrder> {
    const order = await this.otcOrderRepo.findOne({ where: { orderNo } });
    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    // 验证用户权限
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new BadRequestException('无权访问此订单');
    }

    return order;
  }

  /**
   * 确认付款
   */
  async confirmPaid(orderNo: string, userId: number): Promise<OtcOrder> {
    const order = await this.getOrderDetail(orderNo, userId);

    if (order.status !== 'pending') {
      throw new BadRequestException('订单状态不正确');
    }

    // 只有买家可以确认付款
    if (order.buyerId !== userId) {
      throw new BadRequestException('只有买家可以确认付款');
    }

    order.status = 'paid';
    order.paidAt = new Date();
    await this.otcOrderRepo.save(order);

    return order;
  }

  /**
   * 确认收款并放币
   */
  async confirmRelease(orderNo: string, userId: number): Promise<OtcOrder> {
    const order = await this.getOrderDetail(orderNo, userId);

    if (order.status !== 'paid') {
      throw new BadRequestException('订单状态不正确');
    }

    // 只有卖家可以确认放币
    if (order.sellerId !== userId) {
      throw new BadRequestException('只有卖家可以确认放币');
    }

    order.status = 'completed';
    order.releasedAt = new Date();
    await this.otcOrderRepo.save(order);

    return order;
  }

  /**
   * 取消订单
   */
  async cancelOrder(orderNo: string, userId: number): Promise<OtcOrder> {
    const order = await this.getOrderDetail(orderNo, userId);

    if (!['pending', 'paid'].includes(order.status)) {
      throw new BadRequestException('订单状态不正确');
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await this.otcOrderRepo.save(order);

    return order;
  }

  /**
   * 获取用户OTC统计
   */
  async getUserStats(userId: number): Promise<{
    totalOrders: number;
    completedOrders: number;
    totalBuyAmount: string;
    totalSellAmount: string;
  }> {
    const orders = await this.otcOrderRepo.find({
      where: [{ buyerId: userId }, { sellerId: userId }],
    });

    const completed = orders.filter(o => o.status === 'completed');
    const buyOrders = completed.filter(o => o.buyerId === userId);
    const sellOrders = completed.filter(o => o.sellerId === userId);

    return {
      totalOrders: orders.length,
      completedOrders: completed.length,
      totalBuyAmount: buyOrders.reduce((sum, o) => sum + Number(o.amount), 0).toFixed(2),
      totalSellAmount: sellOrders.reduce((sum, o) => sum + Number(o.amount), 0).toFixed(2),
    };
  }
}
