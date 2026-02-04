import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { GoldPrice, Config, GoldProduct, GoldAccount, GoldHolding, Wallet, GoldSettlement, DailySnapshot, HoldingConfig, Coin } from '../../entities';
import { BusinessException } from '../../common/filters/business.exception';
import { GoldPriceService } from './gold-price.service';
import Decimal from 'decimal.js';

/**
 * 黄金模块服务
 * 提供黄金价格、贵金属行情、AGX与黄金关系等数据
 */
@Injectable()
export class GoldService {
  constructor(
    @InjectRepository(GoldPrice)
    private goldPriceRepository: Repository<GoldPrice>,
    @InjectRepository(Config)
    private configRepository: Repository<Config>,
    @InjectRepository(GoldProduct)
    private goldProductRepository: Repository<GoldProduct>,
    @InjectRepository(GoldAccount)
    private goldAccountRepository: Repository<GoldAccount>,
    @InjectRepository(GoldHolding)
    private goldHoldingRepository: Repository<GoldHolding>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(GoldSettlement)
    private goldSettlementRepository: Repository<GoldSettlement>,
    @InjectRepository(DailySnapshot)
    private dailySnapshotRepository: Repository<DailySnapshot>,
    @InjectRepository(HoldingConfig)
    private holdingConfigRepository: Repository<HoldingConfig>,
    @InjectRepository(Coin)
    private coinRepository: Repository<Coin>,
    private goldPriceService: GoldPriceService,
    private dataSource: DataSource,
  ) {}

  // AGX 配置
  private readonly agxConfig = {
    totalSupply: 100000000,    // 1亿枚总量
    price: 0.10,               // 首发价格 USD
    goldBacking: 100,          // 100% 黄金储备支撑
  };

  // 美联储黄金储备数据（公开数据）
  private readonly fedReserve = {
    goldTons: 8133.46,         // 吨
    bookValue: 692,            // 十亿美元（账面价值）
  };

  /**
   * 获取贵金属价格
   */
  async getGoldPrices() {
    try {
      // 从新的金价服务获取实时数据
      const prices = await this.goldPriceService.getAllPrices();
      
      return {
        gold: prices.xau || this.getMockGoldPrice(),
        silver: prices.xag || this.getMockSilverPrice(),
        platinum: prices.xpt || this.getMockPlatinumPrice(),
        palladium: prices.xpd || this.getMockPalladiumPrice(),
        updateTime: new Date().toISOString(),
      };
    } catch (error) {
      // 降级：返回mock数据
      return {
        gold: this.getMockGoldPrice(),
        silver: this.getMockSilverPrice(),
        platinum: this.getMockPlatinumPrice(),
        palladium: this.getMockPalladiumPrice(),
        updateTime: new Date().toISOString(),
      };
    }
  }

  /**
   * 获取黄金详情
   */
  async getGoldDetail() {
    const prices = await this.getGoldPrices();
    const goldPrice = parseFloat(prices.gold.price);
    const pricePerGram = goldPrice / 31.1035; // 盎司转克

    // AGX 与黄金的关系
    const agxGoldGrams = (this.agxConfig.price / pricePerGram).toFixed(6);

    // 美联储储备当前市值
    const fedCurrentValue = (this.fedReserve.goldTons * 1000 * 1000 / 31.1035 * goldPrice) / 1e9;

    return {
      // 金价信息
      gold: prices.gold,
      silver: prices.silver,
      platinum: prices.platinum,

      // AGX 信息
      agx: {
        price: this.agxConfig.price,
        totalSupply: this.agxConfig.totalSupply,
        goldBacking: this.agxConfig.goldBacking,
        goldGrams: agxGoldGrams,           // 每个AGX对应的黄金克数
        pricePerGram: pricePerGram.toFixed(2),
      },

      // 美联储储备信息
      fedReserve: {
        goldTons: this.fedReserve.goldTons,
        bookValue: this.fedReserve.bookValue,
        currentValue: fedCurrentValue.toFixed(0),  // 当前市值（十亿美元）
      },

      updateTime: new Date().toISOString(),
    };
  }

  /**
   * 获取黄金K线数据
   */
  async getGoldKlines(symbol: string = 'XAU', interval: string = '1h', limit: number = 100) {
    try {
      // 从金价服务获取K线数据
      const klines = await this.goldPriceService.getKlineData(symbol, limit);
      return klines;
    } catch (error) {
      // 降级：返回模拟数据
      return this.getMockKlines(limit);
    }
  }

  // ===== 辅助方法 =====

  private formatPriceData(price: GoldPrice) {
    return {
      symbol: price.symbol,
      name: price.name,
      price: price.price,
      pricePerGram: price.pricePerGram,
      openPrice: price.openPrice,
      high24h: price.high24h,
      low24h: price.low24h,
      prevClose: price.prevClose,
      priceChange: price.priceChange,
      changePercent: price.changePercent,
    };
  }

  // ===== Mock 数据 =====

  private getMockGoldPrice() {
    const basePrice = 2656.71;
    const change = (Math.random() - 0.5) * 10;
    const price = basePrice + change;
    const pricePerGram = price / 31.1035;
    
    return {
      symbol: 'XAU',
      name: '黄金',
      price: price.toFixed(2),
      pricePerGram: pricePerGram.toFixed(2),
      openPrice: (basePrice - 5).toFixed(2),
      high24h: (basePrice + 15).toFixed(2),
      low24h: (basePrice - 12).toFixed(2),
      prevClose: (basePrice - 3).toFixed(2),
      priceChange: change.toFixed(2),
      changePercent: ((change / basePrice) * 100).toFixed(2),
    };
  }

  private getMockSilverPrice() {
    const basePrice = 30.25;
    const change = (Math.random() - 0.5) * 0.5;
    const price = basePrice + change;
    
    return {
      symbol: 'XAG',
      name: '白银',
      price: price.toFixed(2),
      pricePerGram: (price / 31.1035).toFixed(4),
      openPrice: (basePrice - 0.1).toFixed(2),
      high24h: (basePrice + 0.3).toFixed(2),
      low24h: (basePrice - 0.25).toFixed(2),
      prevClose: (basePrice - 0.05).toFixed(2),
      priceChange: change.toFixed(2),
      changePercent: ((change / basePrice) * 100).toFixed(2),
    };
  }

  private getMockPlatinumPrice() {
    const basePrice = 985.50;
    const change = (Math.random() - 0.5) * 5;
    const price = basePrice + change;
    
    return {
      symbol: 'XPT',
      name: '铂金',
      price: price.toFixed(2),
      pricePerGram: (price / 31.1035).toFixed(2),
      openPrice: (basePrice - 2).toFixed(2),
      high24h: (basePrice + 8).toFixed(2),
      low24h: (basePrice - 6).toFixed(2),
      prevClose: (basePrice - 1).toFixed(2),
      priceChange: change.toFixed(2),
      changePercent: ((change / basePrice) * 100).toFixed(2),
    };
  }

  private getMockPalladiumPrice() {
    const basePrice = 1050.00;
    const change = (Math.random() - 0.5) * 6;
    const price = basePrice + change;
    
    return {
      symbol: 'XPD',
      name: '钯金',
      price: price.toFixed(2),
      pricePerGram: (price / 31.1035).toFixed(2),
      openPrice: (basePrice - 3).toFixed(2),
      high24h: (basePrice + 10).toFixed(2),
      low24h: (basePrice - 8).toFixed(2),
      prevClose: (basePrice - 2).toFixed(2),
      priceChange: change.toFixed(2),
      changePercent: ((change / basePrice) * 100).toFixed(2),
    };
  }

  private getMockKlines(limit: number): number[][] {
    const klines: number[][] = [];
    const now = Date.now();
    let price = 2650;

    for (let i = limit; i > 0; i--) {
      const open = price;
      const change = (Math.random() - 0.5) * 5;
      price = price + change;
      const high = Math.max(open, price) * (1 + Math.random() * 0.002);
      const low = Math.min(open, price) * (1 - Math.random() * 0.002);
      const volume = Math.random() * 10000;

      klines.push([
        now - i * 3600000,  // timestamp
        open,                // open
        high,                // high
        low,                 // low
        price,               // close
        volume,              // volume
      ]);
    }

    return klines;
  }

  // ===== 黄金玩法接口 =====

  /**
   * 获取黄金玩法分类列表
   */
  async getProductCategories() {
    return [
      { type: 'spot', name: '现货黄金', nameEn: 'Spot Gold', icon: '🥇', desc: '实时金价交易，买入即持有', color: '#FFD700' },
      { type: 'contract', name: '黄金秒合约', nameEn: 'Gold Contract', icon: '⚡', desc: '短周期合约，快速交易', color: '#FF6B6B' },
      { type: 'finance', name: '黄金理财', nameEn: 'Gold Finance', icon: '💰', desc: '稳定收益，灵活存取', color: '#4ECDC4' },
      { type: 'agx', name: 'AGX首发', nameEn: 'AGX Launch', icon: '🚀', desc: '黄金储备支撑，限时认购', color: '#9B59B6' },
    ];
  }

  /**
   * 获取黄金玩法产品列表
   * @param productType 玩法类型: spot, contract, finance, agx
   */
  async getProducts(productType?: string) {
    const query = this.goldProductRepository.createQueryBuilder('product')
      .where('product.status = :status', { status: 1 })
      .orderBy('product.sortOrder', 'ASC');
    
    if (productType) {
      query.andWhere('product.productType = :productType', { productType });
    }
    
    const list = await query.getMany();
    
    // 如果数据库为空，返回mock数据
    if (list.length === 0) {
      return this.getMockProducts(productType);
    }
    
    return list;
  }

  /**
   * 获取黄金玩法产品详情
   */
  async getProductDetail(productId: number) {
    const product = await this.goldProductRepository.findOne({ where: { id: productId } });
    
    if (!product) {
      // 返回mock详情
      return this.getMockProductDetail(productId);
    }
    
    // 添加当前金价信息
    const prices = await this.getGoldPrices();
    
    return {
      ...product,
      currentGoldPrice: prices.gold,
    };
  }

  /**
   * 获取黄金理财产品列表（包含可用额度）
   */
  async getFinanceProducts() {
    const products = await this.getProducts('finance');
    const goldPrice = await this.getGoldPrices();
    
    return {
      products,
      goldPrice: goldPrice.gold,
    };
  }

  /**
   * 获取黄金秒合约配置
   */
  async getContractConfig() {
    const products = await this.getProducts('contract');
    const goldPrice = await this.getGoldPrices();
    
    return {
      products,
      goldPrice: goldPrice.gold,
      // 默认配置
      defaultConfig: {
        periods: [30, 60, 120, 300],  // 秒
        amounts: [10, 50, 100, 500, 1000],  // USDT
        profitRate: 0.85,  // 85%盈利率
      },
    };
  }

  /**
   * 获取AGX首发信息
   */
  async getAgxLaunch() {
    const products = await this.getProducts('agx');
    const goldPrice = await this.getGoldPrices();
    const pricePerGram = parseFloat(goldPrice.gold.price) / 31.1035;
    
    const agxProduct = products[0] || {
      agxPrice: '0.10',
      agxTotalSupply: '100000000',
      agxSold: '0',
      agxGoldBacking: 100,
      agxStartTime: new Date(),
      agxEndTime: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    };
    
    const agxPrice = parseFloat(agxProduct.agxPrice || '0.10');
    const agxGoldGrams = (agxPrice / pricePerGram).toFixed(6);
    
    return {
      product: agxProduct,
      goldPrice: goldPrice.gold,
      agx: {
        price: agxPrice,
        totalSupply: parseFloat(agxProduct.agxTotalSupply || '100000000'),
        sold: parseFloat(agxProduct.agxSold || '0'),
        remaining: parseFloat(agxProduct.agxTotalSupply || '100000000') - parseFloat(agxProduct.agxSold || '0'),
        goldBacking: agxProduct.agxGoldBacking || 100,
        goldGrams: agxGoldGrams,
        pricePerGram: pricePerGram.toFixed(2),
        startTime: agxProduct.agxStartTime,
        endTime: agxProduct.agxEndTime,
        isActive: true,
      },
      fedReserve: this.fedReserve,
    };
  }

  // ===== Mock 产品数据 =====

  private getMockProducts(productType?: string): any[] {
    const allProducts = [
      // 现货黄金
      {
        id: 1, code: 'GOLD_SPOT', name: '现货黄金', productType: 'spot',
        description: '实时跟踪国际金价，随时买卖，交易灵活',
        minAmount: '0.01', maxAmount: '10000', feeRate: '0.001',
        isHot: 1, isRecommend: 1, tag: '热门', status: 1, sortOrder: 1,
      },
      // 黄金秒合约
      {
        id: 2, code: 'GOLD_30S', name: '黄金30秒合约', productType: 'contract',
        description: '30秒快速交易，预测涨跌，盈利率高达85%',
        contractPeriods: '[30]', contractProfitRate: '0.85', contractAmounts: '[10,50,100,500]',
        isHot: 1, isRecommend: 1, tag: '新上线', status: 1, sortOrder: 1,
      },
      {
        id: 3, code: 'GOLD_60S', name: '黄金60秒合约', productType: 'contract',
        description: '60秒交易，稳健之选，盈利率高达85%',
        contractPeriods: '[60]', contractProfitRate: '0.85', contractAmounts: '[10,50,100,500,1000]',
        isHot: 0, isRecommend: 1, status: 1, sortOrder: 2,
      },
      {
        id: 4, code: 'GOLD_300S', name: '黄金5分钟合约', productType: 'contract',
        description: '5分钟交易，专业之选，盈利率高达85%',
        contractPeriods: '[300]', contractProfitRate: '0.85', contractAmounts: '[50,100,500,1000,5000]',
        isHot: 0, isRecommend: 0, status: 1, sortOrder: 3,
      },
      // 黄金理财
      {
        id: 5, code: 'GOLD_FLEX', name: '黄金活期宝', productType: 'finance',
        description: '灵活存取，每日计息，随存随取',
        financePeriodDays: 0, financeApy: '0.0365', financeMinAmount: '100',
        financeTotalAmount: '10000000', financeSoldAmount: '5234567',
        isHot: 1, isRecommend: 1, tag: '推荐', status: 1, sortOrder: 1,
      },
      {
        id: 6, code: 'GOLD_7D', name: '黄金7天宝', productType: 'finance',
        description: '7天定期，较高收益，到期自动到账',
        financePeriodDays: 7, financeApy: '0.0520', financeMinAmount: '500',
        financeTotalAmount: '5000000', financeSoldAmount: '2345678',
        isHot: 0, isRecommend: 1, status: 1, sortOrder: 2,
      },
      {
        id: 7, code: 'GOLD_30D', name: '黄金30天宝', productType: 'finance',
        description: '30天定期，高收益，稳定增值',
        financePeriodDays: 30, financeApy: '0.0680', financeMinAmount: '1000',
        financeTotalAmount: '8000000', financeSoldAmount: '4567890',
        isHot: 0, isRecommend: 0, status: 1, sortOrder: 3,
      },
      // AGX首发
      {
        id: 8, code: 'AGX_LAUNCH', name: 'AGX升达金指币', productType: 'agx',
        description: '100%黄金储备支撑，首发价$0.10，限时限量',
        agxPrice: '0.10', agxTotalSupply: '100000000', agxSold: '12345678',
        agxGoldBacking: 100,
        agxStartTime: new Date('2026-01-01'),
        agxEndTime: new Date('2026-03-01'),
        isHot: 1, isRecommend: 1, tag: '限时', status: 1, sortOrder: 1,
      },
    ];
    
    if (productType) {
      return allProducts.filter(p => p.productType === productType);
    }
    return allProducts;
  }

  private getMockProductDetail(productId: number): any {
    const products = this.getMockProducts();
    return products.find(p => p.id === productId) || products[0];
  }

  // ===== 持币生金接口 =====

  /**
   * 获取用户黄金账户
   * 返回以oz为核心的账户信息
   */
  async getGoldAccount(userId: number) {
    let account = await this.goldAccountRepository.findOne({ where: { userId } });
    
    // 如果账户不存在，自动创建
    if (!account) {
      account = this.goldAccountRepository.create({
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
      await this.goldAccountRepository.save(account);
    }
    
    // 获取当前金价(USD/oz)
    const goldPrice = await this.getGoldPrices();
    const pricePerOz = parseFloat(goldPrice.gold.price);
    
    // 计算黄金账户的USD价值
    const ozValue = new Decimal(account.ozBalance || '0').times(pricePerOz).toFixed(2);
    
    // 获取用户AGX余额
    const agxBalance = await this.getAgxBalance(userId);
    
    // 获取持币生金状态
    const holdingStatus = await this.getHoldingStatus(userId, agxBalance);
    
    return {
      // 基本信息
      userId: account.userId,
      status: account.status,
      
      // 核心: 黄金账户(oz)
      ozBalance: account.ozBalance || '0',
      ozFrozen: account.ozFrozen || '0',
      ozTotalEarned: account.ozTotalEarned || '0',
      ozFromHolding: account.ozFromHolding || '0',
      ozFromContract: account.ozFromContract || '0',
      ozValue, // USD价值
      
      // AGX持有
      agxBalance,
      
      // 持币生金状态
      holdingStatus,
      
      // 金价信息
      goldPrice: pricePerOz,
      goldPriceFormatted: goldPrice.gold.price,
      
      // 最近结算
      lastSettlementDate: account.lastSettlementDate,
      
      // 其他统计
      totalDeposit: account.totalDeposit,
      totalWithdraw: account.totalWithdraw,
      holdingCount: account.holdingCount,
      holdingAmount: account.holdingAmount,
    };
  }

  /**
   * 获取用户AGX余额
   */
  async getAgxBalance(userId: number): Promise<string> {
    try {
      const agxCoin = await this.coinRepository.findOne({ where: { symbol: 'AGX' } });
      if (!agxCoin) return '0';
      
      const wallet = await this.walletRepository.findOne({
        where: { userId, coinId: agxCoin.id },
      });
      
      return wallet?.balance || '0';
    } catch (e) {
      return '0';
    }
  }

  /**
   * 获取持币生金状态
   */
  async getHoldingStatus(userId: number, agxBalance: string) {
    const balance = new Decimal(agxBalance);
    const configs = await this.holdingConfigRepository.find({
      where: { status: 1 },
      order: { sortOrder: 'ASC' },
    });
    
    // 查找当前等级和下一等级
    let currentLevel = null;
    let nextLevel = null;
    let currentLevelIndex = -1;
    let isQualified = false;
    let dailyOzRate = '0';
    
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      const minAgx = new Decimal(config.minAgx);
      const maxAgx = config.maxAgx ? new Decimal(config.maxAgx) : null;
      
      if (balance.gte(minAgx) && (!maxAgx || balance.lte(maxAgx))) {
        currentLevel = config;
        currentLevelIndex = i;
        isQualified = true;
        dailyOzRate = config.dailyOzRate;
        // 获取下一等级
        if (i + 1 < configs.length) {
          nextLevel = configs[i + 1];
        }
        break;
      }
    }
    
    // 如果还没达到任何等级，第一个就是下一个目标
    if (!isQualified && configs.length > 0) {
      nextLevel = configs[0];
    }
    
    // 获取最近的快照记录
    const today = new Date().toISOString().split('T')[0];
    const snapshot = await this.dailySnapshotRepository.findOne({
      where: { userId, snapshotDate: today },
    });
    
    // 计算预计每日oz收益
    const estimatedDailyOz = isQualified 
      ? new Decimal(agxBalance).times(dailyOzRate).toFixed(6)
      : '0';
    
    // 计算距下一等级还差多少
    const toNextLevel = nextLevel 
      ? Math.max(0, parseFloat(nextLevel.minAgx) - parseFloat(agxBalance))
      : 0;
    
    return {
      isQualified,
      currentLevel: currentLevel?.levelName || '未达标',
      nextLevel: nextLevel?.levelName || null,
      levelName: currentLevel?.levelName || '未达标',
      minAgxRequired: configs[0]?.minAgx || '100',
      currentAgx: agxBalance,
      currentAmount: parseFloat(agxBalance),
      toNextLevel,
      dailyRate: parseFloat(dailyOzRate) * 100, // 转为百分比显示
      dailyOzRate,
      nextRate: nextLevel ? parseFloat(nextLevel.dailyOzRate) * 100 : null,
      estimatedDailyOz,
      todayMinBalance: snapshot?.minBalance || agxBalance,
      status: isQualified ? '进行中' : '未达标',
    };
  }

  /**
   * 获取黄金结算记录
   */
  async getSettlementRecords(userId: number, page = 1, pageSize = 20) {
    const [list, total] = await this.goldSettlementRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    
    return {
      list: list.map(item => ({
        id: item.id,
        settlementNo: item.settlementNo,
        sourceType: item.sourceType,
        sourceTypeText: this.getSourceTypeText(item.sourceType),
        ozAmount: item.ozAmount,
        ozBefore: item.ozBefore,
        ozAfter: item.ozAfter,
        agxAmount: item.agxAmount,
        goldPrice: item.goldPrice,
        usdValue: item.usdValue,
        remark: item.remark,
        settlementDate: item.settlementDate,
        createdAt: item.createdAt,
      })),
      total,
      page,
      pageSize,
    };
  }

  private getSourceTypeText(type: string): string {
    const map = {
      holding: '持币生金',
      contract: '秒合约',
      trade: '交易',
    };
    return map[type] || type;
  }

  /**
   * 创建黄金结算记录
   */
  async createSettlement(data: {
    userId: number;
    sourceType: string;
    sourceId?: number;
    ozAmount: string;
    agxAmount?: string;
    remark?: string;
  }) {
    const account = await this.getOrCreateAccount(data.userId);
    const goldPrice = await this.getGoldPrices();
    const pricePerOz = parseFloat(goldPrice.gold.price);
    
    const ozBefore = account.ozBalance || '0';
    const ozAfter = new Decimal(ozBefore).plus(data.ozAmount).toString();
    const usdValue = new Decimal(data.ozAmount).times(pricePerOz).toFixed(2);
    
    const settlementNo = `GS${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const today = new Date().toISOString().split('T')[0];
    
    // 创建结算记录
    const settlement = this.goldSettlementRepository.create({
      userId: data.userId,
      settlementNo,
      sourceType: data.sourceType,
      sourceId: data.sourceId,
      ozAmount: data.ozAmount,
      ozBefore,
      ozAfter,
      agxAmount: data.agxAmount,
      goldPrice: pricePerOz.toString(),
      usdValue,
      remark: data.remark,
      settlementDate: today,
    });
    
    await this.goldSettlementRepository.save(settlement);
    
    // 更新账户余额
    const updateData: any = {
      ozBalance: ozAfter,
      ozTotalEarned: new Decimal(account.ozTotalEarned || '0').plus(data.ozAmount).toString(),
      lastSettlementDate: today,
    };
    
    if (data.sourceType === 'holding') {
      updateData.ozFromHolding = new Decimal(account.ozFromHolding || '0').plus(data.ozAmount).toString();
    } else if (data.sourceType === 'contract') {
      updateData.ozFromContract = new Decimal(account.ozFromContract || '0').plus(data.ozAmount).toString();
    }
    
    await this.goldAccountRepository.update({ userId: data.userId }, updateData);
    
    return settlement;
  }

  /**
   * 获取或创建账户
   */
  async getOrCreateAccount(userId: number): Promise<GoldAccount> {
    let account = await this.goldAccountRepository.findOne({ where: { userId } });
    
    if (!account) {
      account = this.goldAccountRepository.create({
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
      await this.goldAccountRepository.save(account);
    }
    
    return account;
  }

  /**
   * 每日持币生金结算（定时任务调用）
   */
  async processDailyHoldingSettlement() {
    const today = new Date().toISOString().split('T')[0];
    
    // 获取所有达标的快照
    const snapshots = await this.dailySnapshotRepository.find({
      where: { snapshotDate: today, isQualified: 1 },
    });
    
    const configs = await this.holdingConfigRepository.find({
      where: { status: 1 },
      order: { minAgx: 'ASC' },
    });
    
    let processedCount = 0;
    let totalOzSettled = new Decimal(0);
    
    for (const snapshot of snapshots) {
      const minBalance = new Decimal(snapshot.minBalance);
      
      // 查找对应的配置等级
      let config = null;
      for (const c of configs) {
        const minAgx = new Decimal(c.minAgx);
        const maxAgx = c.maxAgx ? new Decimal(c.maxAgx) : null;
        
        if (minBalance.gte(minAgx) && (!maxAgx || minBalance.lte(maxAgx))) {
          config = c;
          break;
        }
      }
      
      if (!config) continue;
      
      // 计算当日oz收益
      const dailyOz = minBalance.times(config.dailyOzRate).toFixed(6);
      
      if (new Decimal(dailyOz).lte(0)) continue;
      
      // 创建结算记录
      await this.createSettlement({
        userId: snapshot.userId,
        sourceType: 'holding',
        ozAmount: dailyOz,
        agxAmount: snapshot.minBalance,
        remark: `持币生金日结-${config.levelName}`,
      });
      
      processedCount++;
      totalOzSettled = totalOzSettled.plus(dailyOz);
    }
    
    return {
      date: today,
      processedCount,
      totalOzSettled: totalOzSettled.toString(),
    };
  }

  /**
   * 记录用户AGX余额快照（定时任务每小时调用）
   */
  async recordBalanceSnapshot(userId: number) {
    const agxBalance = await this.getAgxBalance(userId);
    const today = new Date().toISOString().split('T')[0];
    
    // 获取最低持仓要求
    const minConfig = await this.holdingConfigRepository.findOne({
      where: { status: 1 },
      order: { minAgx: 'ASC' },
    });
    const minRequired = minConfig?.minAgx || '100';
    
    let snapshot = await this.dailySnapshotRepository.findOne({
      where: { userId, snapshotDate: today },
    });
    
    if (!snapshot) {
      // 创建新快照
      snapshot = this.dailySnapshotRepository.create({
        userId,
        snapshotDate: today,
        minBalance: agxBalance,
        avgBalance: agxBalance,
        startBalance: agxBalance,
        endBalance: agxBalance,
        isQualified: new Decimal(agxBalance).gte(minRequired) ? 1 : 0,
      });
    } else {
      // 更新快照
      const currentMin = new Decimal(snapshot.minBalance);
      const balance = new Decimal(agxBalance);
      
      if (balance.lt(currentMin)) {
        snapshot.minBalance = agxBalance;
      }
      snapshot.endBalance = agxBalance;
      snapshot.isQualified = new Decimal(snapshot.minBalance).gte(minRequired) ? 1 : 0;
    }
    
    await this.dailySnapshotRepository.save(snapshot);
    return snapshot;
  }

  /**
   * 获取用户持仓列表
   */
  async getGoldHoldings(userId: number, status?: number) {
    const query = this.goldHoldingRepository.createQueryBuilder('h')
      .where('h.user_id = :userId', { userId })
      .orderBy('h.created_at', 'DESC');
    
    if (status !== undefined) {
      query.andWhere('h.status = :status', { status });
    }
    
    const list = await query.getMany();
    
    return {
      list,
      total: list.length,
    };
  }

  /**
   * 申购理财产品（持币生金）
   */
  async subscribeFinance(userId: number, dto: { productId: number; amount: string }) {
    const { productId, amount } = dto;
    
    // 检查产品
    const product = await this.goldProductRepository.findOne({ where: { id: productId } });
    if (!product || product.status !== 1) {
      throw new BusinessException(4001, '产品不存在或已下架');
    }
    
    if (product.productType !== 'finance') {
      throw new BusinessException(4002, '该产品不支持申购');
    }
    
    const amountDecimal = new Decimal(amount);
    
    // 检查最小申购金额
    if (amountDecimal.lt(product.financeMinAmount)) {
      throw new BusinessException(4003, `最低申购 ${product.financeMinAmount} USDT`);
    }
    
    // 检查额度
    if (product.financeTotalAmount) {
      const remain = new Decimal(product.financeTotalAmount).minus(product.financeSoldAmount || '0');
      if (amountDecimal.gt(remain)) {
        throw new BusinessException(4004, `剩余额度不足，仅剩 ${remain.toString()} USDT`);
      }
    }
    
    // 获取用户USDT钱包（假设 coinId=1 是 USDT）
    const wallet = await this.walletRepository.findOne({
      where: { userId, coinId: 1 },
    });
    
    if (!wallet || new Decimal(wallet.balance).lt(amountDecimal)) {
      throw new BusinessException(4005, 'USDT余额不足');
    }
    
    // 开始事务
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // 扣减USDT余额
      const newBalance = new Decimal(wallet.balance).minus(amountDecimal).toString();
      await queryRunner.manager.update(Wallet, wallet.id, { balance: newBalance });
      
      // 更新产品已售额度
      const newSoldAmount = new Decimal(product.financeSoldAmount || '0').plus(amountDecimal).toString();
      await queryRunner.manager.update(GoldProduct, product.id, { financeSoldAmount: newSoldAmount });
      
      // 创建持仓记录
      const orderNo = `GH${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const startAt = new Date();
      startAt.setDate(startAt.getDate() + 1); // T+1开始计息
      
      let endAt: Date | null = null;
      if (product.financePeriodDays > 0) {
        endAt = new Date(startAt);
        endAt.setDate(endAt.getDate() + product.financePeriodDays);
      }
      
      const holding = this.goldHoldingRepository.create({
        orderNo,
        userId,
        productId: product.id,
        productType: 'finance',
        productName: product.name,
        amount: amountDecimal.toString(),
        apy: product.financeApy,
        periodDays: product.financePeriodDays,
        totalIncome: '0',
        yesterdayIncome: '0',
        incomeDays: 0,
        startAt,
        endAt,
        status: 2, // 待计息
        autoRenew: 0,
      });
      
      await queryRunner.manager.save(holding);
      
      // 更新黄金账户
      let goldAccount = await this.goldAccountRepository.findOne({ where: { userId } });
      if (!goldAccount) {
        goldAccount = this.goldAccountRepository.create({ userId });
      }
      goldAccount.totalDeposit = new Decimal(goldAccount.totalDeposit || '0').plus(amountDecimal).toString();
      goldAccount.holdingCount = (goldAccount.holdingCount || 0) + 1;
      goldAccount.holdingAmount = new Decimal(goldAccount.holdingAmount || '0').plus(amountDecimal).toString();
      await queryRunner.manager.save(goldAccount);
      
      await queryRunner.commitTransaction();
      
      return {
        orderNo: holding.orderNo,
        productName: product.name,
        amount: holding.amount,
        apy: holding.apy,
        periodDays: holding.periodDays,
        startAt: holding.startAt,
        endAt: holding.endAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 赎回持仓
   */
  async redeemHolding(userId: number, holdingId: number) {
    const holding = await this.goldHoldingRepository.findOne({
      where: { id: holdingId, userId },
      relations: ['product'],
    });
    
    if (!holding) {
      throw new BusinessException(4006, '持仓不存在');
    }
    
    if (holding.status === 0) {
      throw new BusinessException(4007, '该持仓已赎回');
    }
    
    // 检查是否到期（定期产品）
    if (holding.periodDays > 0 && holding.endAt && new Date() < holding.endAt) {
      throw new BusinessException(4008, '定期产品未到期，无法赎回');
    }
    
    // 开始事务
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // 计算返还金额（本金 + 收益）
      const returnAmount = new Decimal(holding.amount).plus(holding.totalIncome);
      
      // 返还到USDT钱包
      const wallet = await this.walletRepository.findOne({
        where: { userId, coinId: 1 },
      });
      
      const newBalance = new Decimal(wallet?.balance || '0').plus(returnAmount).toString();
      if (wallet) {
        await queryRunner.manager.update(Wallet, wallet.id, { balance: newBalance });
      }
      
      // 更新持仓状态
      await queryRunner.manager.update(GoldHolding, holding.id, {
        status: 0,
        redeemedAt: new Date(),
      });
      
      // 更新黄金账户
      const goldAccount = await this.goldAccountRepository.findOne({ where: { userId } });
      if (goldAccount) {
        goldAccount.totalWithdraw = new Decimal(goldAccount.totalWithdraw || '0').plus(returnAmount).toString();
        goldAccount.holdingCount = Math.max(0, (goldAccount.holdingCount || 1) - 1);
        goldAccount.holdingAmount = new Decimal(goldAccount.holdingAmount || '0').minus(holding.amount).toString();
        await queryRunner.manager.save(goldAccount);
      }
      
      await queryRunner.commitTransaction();
      
      return {
        holdingId: holding.id,
        returnAmount: returnAmount.toString(),
        principal: holding.amount,
        income: holding.totalIncome,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 生成持仓每日收益（定时任务调用）
   */
  async calculateDailyIncome() {
    // 获取所有持仓中的订单
    const holdings = await this.goldHoldingRepository.find({
      where: { status: 1 },
    });
    
    for (const holding of holdings) {
      // 计算日收益 = 本金 * 年化率 / 365
      const dailyIncome = new Decimal(holding.amount)
        .times(holding.apy)
        .div(365)
        .toFixed(8);
      
      holding.yesterdayIncome = dailyIncome;
      holding.totalIncome = new Decimal(holding.totalIncome || '0').plus(dailyIncome).toString();
      holding.incomeDays = (holding.incomeDays || 0) + 1;
      
      // 检查是否到期
      if (holding.endAt && new Date() >= holding.endAt) {
        holding.status = 3; // 到期待赎回
      }
      
      await this.goldHoldingRepository.save(holding);
      
      // 更新黄金账户的昨日收益和累计收益
      const goldAccount = await this.goldAccountRepository.findOne({ where: { userId: holding.userId } });
      if (goldAccount) {
        goldAccount.yesterdayIncome = dailyIncome;
        goldAccount.totalIncome = new Decimal(goldAccount.totalIncome || '0').plus(dailyIncome).toString();
        await this.goldAccountRepository.save(goldAccount);
      }
    }
    
    // 将待计息状态转为持仓中
    await this.goldHoldingRepository.createQueryBuilder()
      .update()
      .set({ status: 1 })
      .where('status = :status AND start_at <= :now', { status: 2, now: new Date() })
      .execute();
    
    return { processed: holdings.length };
  }
}