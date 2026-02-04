import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GoldPrice } from '../../entities';
import Decimal from 'decimal.js';

/**
 * 金价数据源服务
 * 负责从外部API获取实时金价并缓存
 */
@Injectable()
export class GoldPriceService {
  private readonly logger = new Logger(GoldPriceService.name);
  
  // 价格缓存（内存）
  private priceCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60 * 1000; // 1分钟缓存

  // 支持的金属类型
  private readonly METAL_SYMBOLS = {
    XAU: { name: '黄金', apiCode: 'gold' },
    XAG: { name: '白银', apiCode: 'silver' },
    XPT: { name: '铂金', apiCode: 'platinum' },
    XPD: { name: '钯金', apiCode: 'palladium' },
  };

  constructor(
    @InjectRepository(GoldPrice)
    private goldPriceRepository: Repository<GoldPrice>,
  ) {}

  /**
   * 从实时API获取金价
   */
  private async fetchFromRealApi(symbol: string): Promise<any | null> {
    try {
      // 使用免费的金价API
      const apiUrl = `https://api.gold-api.com/price/${symbol}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API响应错误: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.price) {
        const price = parseFloat(data.price);
        const prevClose = parseFloat(data.prev_close_price || data.price);
        const priceChange = price - prevClose;
        const changePercent = prevClose > 0 ? (priceChange / prevClose) * 100 : 0;
        const pricePerGram = price / 31.1035;
        
        this.logger.log(`${symbol} 实时价格: $${price}/oz (来源: gold-api.com)`);
        
        return {
          symbol,
          price: price.toFixed(2),
          pricePerGram: pricePerGram.toFixed(4),
          openPrice: (data.open_price || price).toFixed(2),
          high24h: (data.high_price || price).toFixed(2),
          low24h: (data.low_price || price).toFixed(2),
          prevClose: prevClose.toFixed(2),
          priceChange: priceChange.toFixed(2),
          changePercent: changePercent.toFixed(2),
          dataSource: 'gold-api.com',
          timestamp: Date.now(),
        };
      }
      
      return null;
    } catch (error) {
      this.logger.warn(`从实时API获取 ${symbol} 价格失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 获取实时金价（带缓存）
   */
  async getCurrentPrice(symbol: string = 'XAU'): Promise<any> {
    // 检查缓存
    const cached = this.priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.debug(`使用缓存的 ${symbol} 价格数据`);
      return cached.data;
    }

    // 从数据库获取最新价格
    const dbPrice = await this.goldPriceRepository.findOne({
      where: { symbol },
      order: { updatedAt: 'DESC' },
    });

    // 如果数据库有近期数据（5分钟内），直接使用
    if (dbPrice && Date.now() - dbPrice.updatedAt.getTime() < this.CACHE_TTL) {
      const data = this.formatPriceData(dbPrice);
      this.priceCache.set(symbol, { data, timestamp: Date.now() });
      return data;
    }

    // 否则从API获取
    return await this.fetchAndUpdatePrice(symbol);
  }

  /**
   * 获取所有贵金属价格
   */
  async getAllPrices(): Promise<any> {
    const prices = {};
    
    for (const symbol of Object.keys(this.METAL_SYMBOLS)) {
      try {
        prices[symbol.toLowerCase()] = await this.getCurrentPrice(symbol);
      } catch (error) {
        this.logger.error(`获取 ${symbol} 价格失败:`, error.message);
        // 使用数据库中的最后价格
        const lastPrice = await this.goldPriceRepository.findOne({
          where: { symbol },
          order: { updatedAt: 'DESC' },
        });
        if (lastPrice) {
          prices[symbol.toLowerCase()] = this.formatPriceData(lastPrice);
        }
      }
    }

    return prices;
  }

  /**
   * 从API获取价格并更新数据库
   * 使用免费金价API获取实时数据
   */
  async fetchAndUpdatePrice(symbol: string): Promise<any> {
    try {
      const metalInfo = this.METAL_SYMBOLS[symbol];
      if (!metalInfo) {
        throw new Error(`不支持的金属类型: ${symbol}`);
      }

      this.logger.debug(`更新 ${symbol} 价格...`);

      // 尝试从实时API获取价格
      let priceData = await this.fetchFromRealApi(symbol);
      
      if (!priceData) {
        // API失败，使用数据库历史价格 + 微波动
        const lastPrice = await this.goldPriceRepository.findOne({
          where: { symbol },
          order: { updatedAt: 'DESC' },
        });

        if (lastPrice) {
          const basePrice = parseFloat(lastPrice.price);
          const fluctuation = (Math.random() - 0.5) * (basePrice * 0.002);
          const currentPrice = basePrice + fluctuation;
          const pricePerGram = currentPrice / 31.1035;

          priceData = {
            symbol,
            price: currentPrice.toFixed(2),
            pricePerGram: pricePerGram.toFixed(4),
            openPrice: lastPrice.openPrice,
            high24h: Math.max(parseFloat(lastPrice.high24h), currentPrice).toFixed(2),
            low24h: Math.min(parseFloat(lastPrice.low24h), currentPrice).toFixed(2),
            prevClose: lastPrice.price,
            priceChange: (currentPrice - basePrice).toFixed(2),
            changePercent: ((currentPrice - basePrice) / basePrice * 100).toFixed(2),
            dataSource: 'database+fluctuation',
            timestamp: Date.now(),
          };
        } else {
          priceData = this.getInitialMockPrice(symbol);
        }
      }

      // 保存到数据库
      await this.savePriceToDb(symbol, priceData);

      // 更新缓存
      const formattedData = this.formatPriceForApi(symbol, priceData);
      this.priceCache.set(symbol, { data: formattedData, timestamp: Date.now() });

      this.logger.debug(`${symbol} 价格更新成功: $${priceData.price}/oz`);

      return formattedData;
    } catch (error) {
      this.logger.error(`更新 ${symbol} 价格失败:`, error.message);

      // 降级: 返回数据库中的最后价格
      const lastPrice = await this.goldPriceRepository.findOne({
        where: { symbol },
        order: { updatedAt: 'DESC' },
      });

      if (lastPrice) {
        return this.formatPriceData(lastPrice);
      }

      // 最后降级: 使用模拟数据
      return this.getMockPrice(symbol);
    }
  }

  /**
   * 获取初始模拟价格（首次使用）
   */
  private getInitialMockPrice(symbol: string): any {
    const basePrices = {
      XAU: 2656.71,
      XAG: 30.25,
      XPT: 985.50,
      XPD: 1050.00,
    };

    const basePrice = basePrices[symbol] || 1000;
    const pricePerGram = basePrice / 31.1035;

    return {
      symbol,
      price: basePrice.toFixed(2),
      pricePerGram: pricePerGram.toFixed(4),
      openPrice: (basePrice * 0.998).toFixed(2),
      high24h: (basePrice * 1.005).toFixed(2),
      low24h: (basePrice * 0.995).toFixed(2),
      prevClose: (basePrice * 0.998).toFixed(2),
      priceChange: '0.00',
      changePercent: '0.00',
      dataSource: 'initial',
      timestamp: Date.now(),
    };
  }

  /**
   * 保存价格到数据库
   */
  private async savePriceToDb(symbol: string, priceData: any): Promise<void> {
    try {
      // 查找是否已存在
      let goldPrice = await this.goldPriceRepository.findOne({ where: { symbol } });

      if (goldPrice) {
        // 更新现有记录
        Object.assign(goldPrice, {
          price: priceData.price,
          pricePerGram: priceData.pricePerGram,
          openPrice: priceData.openPrice,
          high24h: priceData.high24h,
          low24h: priceData.low24h,
          prevClose: priceData.prevClose,
          priceChange: priceData.priceChange,
          changePercent: priceData.changePercent,
          dataSource: priceData.dataSource,
          updatedAt: new Date(),
        });
      } else {
        // 创建新记录
        goldPrice = this.goldPriceRepository.create({
          symbol,
          name: this.METAL_SYMBOLS[symbol]?.name || symbol,
          price: priceData.price,
          pricePerGram: priceData.pricePerGram,
          openPrice: priceData.openPrice,
          high24h: priceData.high24h,
          low24h: priceData.low24h,
          prevClose: priceData.prevClose,
          priceChange: priceData.priceChange,
          changePercent: priceData.changePercent,
          dataSource: priceData.dataSource,
        });
      }

      await this.goldPriceRepository.save(goldPrice);
      
      // 保存历史记录（用于K线）
      await this.saveHistoryRecord(symbol, priceData);
    } catch (error) {
      this.logger.error(`保存 ${symbol} 价格到数据库失败:`, error.message);
    }
  }

  /**
   * 保存历史价格记录
   */
  private async saveHistoryRecord(symbol: string, priceData: any): Promise<void> {
    // 可以选择保存到专门的历史表，或在 gold_price 表的 klineData 字段中追加
    // 这里简化处理，仅在 klineData 中保存最近的100条记录

    try {
      const record = await this.goldPriceRepository.findOne({ where: { symbol } });
      if (!record) return;

      // klineData 是 json 类型，直接获取数组或初始化为空数组
      let klineData: any[] = [];
      if (Array.isArray(record.klineData)) {
        klineData = record.klineData;
      }

      // 添加新记录 [timestamp, open, high, low, close, volume]
      const timestamp = priceData.timestamp || Date.now();
      const price = parseFloat(priceData.price);

      klineData.push([
        timestamp,
        price,
        parseFloat(priceData.high24h) || price,
        parseFloat(priceData.low24h) || price,
        price,
        Math.random() * 10000, // 模拟交易量
      ]);

      // 保留最近100条
      if (klineData.length > 100) {
        klineData = klineData.slice(-100);
      }

      record.klineData = klineData;
      await this.goldPriceRepository.save(record);
    } catch (error) {
      this.logger.error(`保存 ${symbol} 历史记录失败:`, error.message);
    }
  }

  /**
   * 格式化数据库价格数据
   */
  private formatPriceData(price: GoldPrice): any {
    const changePercent = parseFloat(price.changePercent || '0');
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
      change24h: changePercent, // 前端期望的字段名
      dataSource: price.dataSource,
      updateTime: price.updatedAt.toISOString(),
    };
  }

  /**
   * 格式化API价格数据
   */
  private formatPriceForApi(symbol: string, priceData: any): any {
    const changePercent = parseFloat(priceData.changePercent || '0');
    return {
      symbol,
      name: this.METAL_SYMBOLS[symbol]?.name || symbol,
      ...priceData,
      change24h: changePercent, // 前端期望的字段名
    };
  }

  /**
   * 获取K线历史数据
   */
  async getKlineData(symbol: string = 'XAU', limit: number = 100): Promise<any[]> {
    try {
      const record = await this.goldPriceRepository.findOne({ where: { symbol } });

      if (record?.klineData && Array.isArray(record.klineData)) {
        return record.klineData.slice(-limit);
      }
    } catch (error) {
      this.logger.error(`获取 ${symbol} K线数据失败:`, error.message);
    }

    // 返回模拟K线数据
    return this.generateMockKlines(limit);
  }

  /**
   * 定时任务：每1分钟更新一次所有金属价格
   */
  @Cron('*/1 * * * *') // 每1分钟执行一次
  async updateAllPricesScheduled() {
    this.logger.debug('定时任务: 更新贵金属价格...');
    
    for (const symbol of Object.keys(this.METAL_SYMBOLS)) {
      try {
        await this.fetchAndUpdatePrice(symbol);
        // 间隔1秒，避免API限流
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        this.logger.error(`定时更新 ${symbol} 失败:`, error.message);
      }
    }
    
    this.logger.log('定时任务: 价格更新完成');
  }

  /**
   * 定时任务：每小时记录一次历史快照
   */
  @Cron(CronExpression.EVERY_HOUR)
  async saveHourlySnapshot() {
    this.logger.log('定时任务: 保存小时价格快照...');
    
    for (const symbol of Object.keys(this.METAL_SYMBOLS)) {
      try {
        const price = await this.getCurrentPrice(symbol);
        await this.saveHistoryRecord(symbol, price);
      } catch (error) {
        this.logger.error(`保存 ${symbol} 快照失败:`, error.message);
      }
    }
  }

  // ===== 降级数据 =====

  /**
   * 获取模拟价格（降级方案）
   */
  private getMockPrice(symbol: string): any {
    const basePrices = {
      XAU: 2656.71,
      XAG: 30.25,
      XPT: 985.50,
      XPD: 1050.00,
    };

    const basePrice = basePrices[symbol] || 1000;
    const change = (Math.random() - 0.5) * (basePrice * 0.01);
    const price = basePrice + change;
    const pricePerGram = price / 31.1035;

    return {
      symbol,
      name: this.METAL_SYMBOLS[symbol]?.name || symbol,
      price: price.toFixed(2),
      pricePerGram: pricePerGram.toFixed(4),
      openPrice: (basePrice - 5).toFixed(2),
      high24h: (basePrice + 15).toFixed(2),
      low24h: (basePrice - 12).toFixed(2),
      prevClose: (basePrice - 3).toFixed(2),
      priceChange: change.toFixed(2),
      changePercent: ((change / basePrice) * 100).toFixed(2),
      dataSource: 'mock',
      updateTime: new Date().toISOString(),
    };
  }

  /**
   * 生成模拟K线数据
   */
  private generateMockKlines(limit: number): any[] {
    const klines: any[] = [];
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

  /**
   * 清空缓存
   */
  clearCache() {
    this.priceCache.clear();
    this.logger.log('价格缓存已清空');
  }

  /**
   * 手动触发价格更新
   */
  async forceUpdate() {
    this.logger.log('手动触发价格更新...');
    this.clearCache();
    return await this.updateAllPricesScheduled();
  }
}
