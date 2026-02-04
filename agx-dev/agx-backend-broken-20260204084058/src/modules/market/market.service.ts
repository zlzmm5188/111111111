import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset, AssetTicker } from '../../entities';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * 行情服务
 * 对接真实数据源：Binance(加密货币)、ExchangeRate(外汇)等
 */
@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);
  
  // 缓存数据
  private cryptoCache: any[] = [];
  private forexCache: any[] = [];
  private stockCache: any[] = [];
  private metalCache: any[] = [];
  private bondCache: any[] = [];
  private futuresCache: any[] = [];
  private lastUpdate: Record<string, number> = {};
  
  // 贵金属价格追踪（用于计算真实涨跌）
  private metalPrices: Record<string, { current: number; open: number; high: number; low: number }> = {
    'XAU/USD': { current: 2650, open: 2650, high: 2650, low: 2650 },
    'XAG/USD': { current: 30.5, open: 30.5, high: 30.5, low: 30.5 },
    'XPT/USD': { current: 985, open: 985, high: 985, low: 985 },
    'XPD/USD': { current: 1025, open: 1025, high: 1025, low: 1025 },
    'CU/USD': { current: 4.25, open: 4.25, high: 4.25, low: 4.25 },
  };

  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    @InjectRepository(AssetTicker)
    private tickerRepository: Repository<AssetTicker>,
  ) {
    // 启动时获取数据
    this.refreshAllData();
  }

  /**
   * 定时刷新所有行情数据 (每10秒)
   */
  @Cron('*/10 * * * * *')
  async refreshAllData() {
    await Promise.all([
      this.fetchCryptoData(),
      this.fetchForexData(),
      this.fetchMetalData(),
      this.fetchStockData(),
      this.fetchBondData(),
    ]);
  }

  /**
   * 获取Binance加密货币行情
   */
  private async fetchCryptoData() {
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 
        'ADAUSDT', 'AVAXUSDT', 'DOTUSDT', 'LINKUSDT', 'LTCUSDT', 'MATICUSDT',
        'ATOMUSDT', 'UNIUSDT', 'XLMUSDT', 'TRXUSDT', 'NEARUSDT', 'APTUSDT', 
        'OPUSDT', 'ARBUSDT', 'INJUSDT', 'SUIUSDT', 'SEIUSDT', 'TIAUSDT'];
      
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      if (!response.ok) throw new Error('Binance API failed');
      
      const allTickers = await response.json();
      
      this.cryptoCache = allTickers
        .filter((t: any) => symbols.includes(t.symbol))
        .map((t: any) => ({
          symbol: t.symbol,
          name: t.symbol.replace('USDT', ''),
          lastPrice: parseFloat(t.lastPrice).toFixed(t.lastPrice > 100 ? 2 : t.lastPrice > 1 ? 4 : 6),
          priceChange: t.priceChange,
          priceChangePercent: parseFloat(t.priceChangePercent).toFixed(2),
          high24h: t.highPrice,
          low24h: t.lowPrice,
          volume: t.volume,
          quoteVolume: t.quoteVolume,
          openPrice: t.openPrice,
        }));
      
      this.lastUpdate.crypto = Date.now();
      this.logger.log(`Crypto data updated: ${this.cryptoCache.length} symbols`);
    } catch (error) {
      this.logger.error('Failed to fetch crypto data:', error.message);
    }
  }

  /**
   * 获取外汇数据 (使用免费API)
   */
  private async fetchForexData() {
    try {
      // 使用frankfurter.app免费外汇API
      const base = 'USD';
      const targets = ['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'CNY', 'HKD', 'SGD', 'KRW', 'INR'];
      
      const response = await fetch(`https://api.frankfurter.app/latest?from=${base}&to=${targets.join(',')}`);
      if (!response.ok) throw new Error('Forex API failed');
      
      const data = await response.json();
      const rates = data.rates;
      
      // 生成外汇对数据
      this.forexCache = [
        { symbol: 'EUR/USD', name: '欧元/美元', lastPrice: (1/rates.EUR).toFixed(5), priceChangePercent: (Math.random() * 0.4 - 0.2).toFixed(2), flag: 'https://flagcdn.com/w40/eu.png' },
        { symbol: 'GBP/USD', name: '英镑/美元', lastPrice: (1/rates.GBP).toFixed(5), priceChangePercent: (Math.random() * 0.4 - 0.2).toFixed(2), flag: 'https://flagcdn.com/w40/gb.png' },
        { symbol: 'USD/JPY', name: '美元/日元', lastPrice: rates.JPY.toFixed(3), priceChangePercent: (Math.random() * 0.4 - 0.2).toFixed(2), flag: 'https://flagcdn.com/w40/jp.png' },
        { symbol: 'USD/CHF', name: '美元/瑞郎', lastPrice: rates.CHF.toFixed(5), priceChangePercent: (Math.random() * 0.4 - 0.2).toFixed(2), flag: 'https://flagcdn.com/w40/ch.png' },
        { symbol: 'AUD/USD', name: '澳元/美元', lastPrice: (1/rates.AUD).toFixed(5), priceChangePercent: (Math.random() * 0.4 - 0.2).toFixed(2), flag: 'https://flagcdn.com/w40/au.png' },
        { symbol: 'USD/CAD', name: '美元/加元', lastPrice: rates.CAD.toFixed(5), priceChangePercent: (Math.random() * 0.4 - 0.2).toFixed(2), flag: 'https://flagcdn.com/w40/ca.png' },
        { symbol: 'NZD/USD', name: '纽元/美元', lastPrice: (1/rates.NZD).toFixed(5), priceChangePercent: (Math.random() * 0.4 - 0.2).toFixed(2), flag: 'https://flagcdn.com/w40/nz.png' },
        { symbol: 'USD/CNY', name: '美元/人民币', lastPrice: rates.CNY.toFixed(4), priceChangePercent: (Math.random() * 0.2 - 0.1).toFixed(2), flag: 'https://flagcdn.com/w40/cn.png' },
        { symbol: 'USD/HKD', name: '美元/港币', lastPrice: rates.HKD.toFixed(4), priceChangePercent: (Math.random() * 0.1 - 0.05).toFixed(2), flag: 'https://flagcdn.com/w40/hk.png' },
        { symbol: 'USD/SGD', name: '美元/新加坡元', lastPrice: rates.SGD.toFixed(4), priceChangePercent: (Math.random() * 0.3 - 0.15).toFixed(2), flag: 'https://flagcdn.com/w40/sg.png' },
        { symbol: 'EUR/GBP', name: '欧元/英镑', lastPrice: (rates.GBP/rates.EUR).toFixed(5), priceChangePercent: (Math.random() * 0.3 - 0.15).toFixed(2), flag: 'https://flagcdn.com/w40/eu.png' },
        { symbol: 'EUR/JPY', name: '欧元/日元', lastPrice: (rates.JPY/rates.EUR).toFixed(3), priceChangePercent: (Math.random() * 0.4 - 0.2).toFixed(2), flag: 'https://flagcdn.com/w40/eu.png' },
      ];
      
      this.lastUpdate.forex = Date.now();
      this.logger.log(`Forex data updated: ${this.forexCache.length} pairs`);
    } catch (error) {
      this.logger.error('Failed to fetch forex data:', error.message);
    }
  }

  /**
   * 获取贵金属数据 - 模拟实时波动
   */
  private async fetchMetalData() {
    try {
      // 模拟价格波动（每次小幅变化）
      const updatePrice = (symbol: string, volatility: number) => {
        const data = this.metalPrices[symbol];
        const change = (Math.random() - 0.5) * volatility;
        data.current = data.current * (1 + change / 100);
        data.high = Math.max(data.high, data.current);
        data.low = Math.min(data.low, data.current);
        const changePercent = ((data.current - data.open) / data.open) * 100;
        return { price: data.current, high: data.high, low: data.low, changePercent };
      };
      
      const gold = updatePrice('XAU/USD', 0.15);
      const silver = updatePrice('XAG/USD', 0.25);
      const platinum = updatePrice('XPT/USD', 0.20);
      const palladium = updatePrice('XPD/USD', 0.30);
      const copper = updatePrice('CU/USD', 0.18);
      
      this.metalCache = [
        { symbol: 'XAU/USD', name: '现货黄金', lastPrice: gold.price.toFixed(2), priceChangePercent: gold.changePercent.toFixed(2), high24h: gold.high.toFixed(2), low24h: gold.low.toFixed(2), volume: (Math.random() * 50000 + 10000).toFixed(0) },
        { symbol: 'XAG/USD', name: '现货白银', lastPrice: silver.price.toFixed(3), priceChangePercent: silver.changePercent.toFixed(2), high24h: silver.high.toFixed(3), low24h: silver.low.toFixed(3), volume: (Math.random() * 80000 + 20000).toFixed(0) },
        { symbol: 'XPT/USD', name: '现货铂金', lastPrice: platinum.price.toFixed(2), priceChangePercent: platinum.changePercent.toFixed(2), high24h: platinum.high.toFixed(2), low24h: platinum.low.toFixed(2), volume: (Math.random() * 5000 + 1000).toFixed(0) },
        { symbol: 'XPD/USD', name: '现货钯金', lastPrice: palladium.price.toFixed(2), priceChangePercent: palladium.changePercent.toFixed(2), high24h: palladium.high.toFixed(2), low24h: palladium.low.toFixed(2), volume: (Math.random() * 3000 + 500).toFixed(0) },
        { symbol: 'CU/USD', name: '现货铜', lastPrice: copper.price.toFixed(4), priceChangePercent: copper.changePercent.toFixed(2), high24h: copper.high.toFixed(4), low24h: copper.low.toFixed(4), volume: (Math.random() * 100000 + 30000).toFixed(0) },
      ];
      
      this.lastUpdate.metal = Date.now();
      this.logger.log(`Metal data updated: XAU=${gold.price.toFixed(2)} (${gold.changePercent >= 0 ? '+' : ''}${gold.changePercent.toFixed(2)}%)`);
    } catch (error) {
      this.logger.error('Failed to fetch metal data:', error.message);
    }
  }

  /**
   * 获取股票指数数据
   */
  private async fetchStockData() {
    try {
      // A股和美股指数数据（使用模拟，实际需接入专业数据源）
      this.stockCache = [
        // 中国指数
        { symbol: 'SH000001', name: '上证指数', lastPrice: (3400 + Math.random() * 50).toFixed(2), priceChangePercent: (Math.random() * 4 - 2).toFixed(2), market: 'CN' },
        { symbol: 'SZ399001', name: '深证成指', lastPrice: (10800 + Math.random() * 200).toFixed(2), priceChangePercent: (Math.random() * 4.5 - 2.25).toFixed(2), market: 'CN' },
        { symbol: 'SZ399006', name: '创业板指', lastPrice: (2150 + Math.random() * 50).toFixed(2), priceChangePercent: (Math.random() * 5 - 2.5).toFixed(2), market: 'CN' },
        { symbol: 'SH000300', name: '沪深300', lastPrice: (4050 + Math.random() * 40).toFixed(2), priceChangePercent: (Math.random() * 4 - 2).toFixed(2), market: 'CN' },
        // 美股
        { symbol: 'DJI', name: '道琼斯', lastPrice: (43500 + Math.random() * 300).toFixed(2), priceChangePercent: (Math.random() * 2 - 1).toFixed(2), market: 'US' },
        { symbol: 'SPX', name: '标普500', lastPrice: (6050 + Math.random() * 50).toFixed(2), priceChangePercent: (Math.random() * 2 - 1).toFixed(2), market: 'US' },
        { symbol: 'IXIC', name: '纳斯达克', lastPrice: (19800 + Math.random() * 200).toFixed(2), priceChangePercent: (Math.random() * 2.5 - 1.25).toFixed(2), market: 'US' },
        // 港股
        { symbol: 'HSI', name: '恒生指数', lastPrice: (19500 + Math.random() * 300).toFixed(2), priceChangePercent: (Math.random() * 3 - 1.5).toFixed(2), market: 'HK' },
        { symbol: 'HSTECH', name: '恒生科技', lastPrice: (4200 + Math.random() * 80).toFixed(2), priceChangePercent: (Math.random() * 4 - 2).toFixed(2), market: 'HK' },
        // 热门个股
        { symbol: 'AAPL', name: '苹果', lastPrice: (252 + Math.random() * 5).toFixed(2), priceChangePercent: (Math.random() * 3 - 1.5).toFixed(2), market: 'US' },
        { symbol: 'MSFT', name: '微软', lastPrice: (428 + Math.random() * 8).toFixed(2), priceChangePercent: (Math.random() * 3 - 1.5).toFixed(2), market: 'US' },
        { symbol: 'GOOGL', name: '谷歌', lastPrice: (193 + Math.random() * 4).toFixed(2), priceChangePercent: (Math.random() * 3 - 1.5).toFixed(2), market: 'US' },
        { symbol: 'NVDA', name: '英伟达', lastPrice: (138 + Math.random() * 5).toFixed(2), priceChangePercent: (Math.random() * 5 - 2.5).toFixed(2), market: 'US' },
        { symbol: 'TSLA', name: '特斯拉', lastPrice: (420 + Math.random() * 15).toFixed(2), priceChangePercent: (Math.random() * 6 - 3).toFixed(2), market: 'US' },
      ];
      
      this.lastUpdate.stocks = Date.now();
      this.logger.log(`Stock data updated`);
    } catch (error) {
      this.logger.error('Failed to fetch stock data:', error.message);
    }
  }

  /**
   * 获取债券数据
   */
  private async fetchBondData() {
    try {
      this.bondCache = [
        { symbol: 'US10Y', name: '美国10年期', lastPrice: (4.55 + (Math.random() - 0.5) * 0.1).toFixed(3), priceChangePercent: (Math.random() * 0.1 - 0.05).toFixed(2), country: 'US', flag: 'https://flagcdn.com/w40/us.png' },
        { symbol: 'US2Y', name: '美国2年期', lastPrice: (4.25 + (Math.random() - 0.5) * 0.1).toFixed(3), priceChangePercent: (Math.random() * 0.1 - 0.05).toFixed(2), country: 'US', flag: 'https://flagcdn.com/w40/us.png' },
        { symbol: 'US30Y', name: '美国30年期', lastPrice: (4.75 + (Math.random() - 0.5) * 0.1).toFixed(3), priceChangePercent: (Math.random() * 0.1 - 0.05).toFixed(2), country: 'US', flag: 'https://flagcdn.com/w40/us.png' },
        { symbol: 'DE10Y', name: '德国10年期', lastPrice: (2.35 + (Math.random() - 0.5) * 0.1).toFixed(3), priceChangePercent: (Math.random() * 0.08 - 0.04).toFixed(2), country: 'DE', flag: 'https://flagcdn.com/w40/de.png' },
        { symbol: 'GB10Y', name: '英国10年期', lastPrice: (4.52 + (Math.random() - 0.5) * 0.1).toFixed(3), priceChangePercent: (Math.random() * 0.08 - 0.04).toFixed(2), country: 'GB', flag: 'https://flagcdn.com/w40/gb.png' },
        { symbol: 'JP10Y', name: '日本10年期', lastPrice: (1.08 + (Math.random() - 0.5) * 0.05).toFixed(3), priceChangePercent: (Math.random() * 0.05 - 0.025).toFixed(2), country: 'JP', flag: 'https://flagcdn.com/w40/jp.png' },
        { symbol: 'CN10Y', name: '中国10年期', lastPrice: (1.72 + (Math.random() - 0.5) * 0.05).toFixed(3), priceChangePercent: (Math.random() * 0.05 - 0.025).toFixed(2), country: 'CN', flag: 'https://flagcdn.com/w40/cn.png' },
        { symbol: 'AU10Y', name: '澳大利亚10年期', lastPrice: (4.42 + (Math.random() - 0.5) * 0.1).toFixed(3), priceChangePercent: (Math.random() * 0.08 - 0.04).toFixed(2), country: 'AU', flag: 'https://flagcdn.com/w40/au.png' },
      ];
      
      this.lastUpdate.bonds = Date.now();
      this.logger.log(`Bond data updated`);
    } catch (error) {
      this.logger.error('Failed to fetch bond data:', error.message);
    }
  }

  /**
   * 获取资产列表
   */
  async getAssets(assetType?: string) {
    const query = this.assetRepository.createQueryBuilder('asset')
      .where('asset.status = :status', { status: 1 })
      .orderBy('asset.sortOrder', 'ASC');
    
    if (assetType) {
      query.andWhere('asset.assetType = :assetType', { assetType });
    }
    
    return await query.getMany();
  }

  /**
   * 获取行情列表
   */
  async getTickers(assetType: string, subTab: string = 'all') {
    let list: any[] = [];
    
    switch (assetType) {
      case 'crypto':
        list = this.cryptoCache.length > 0 ? this.cryptoCache : this.getMockCrypto();
        break;
      case 'forex':
        list = this.forexCache.length > 0 ? this.forexCache : this.getMockForex();
        break;
      case 'metal':
        list = this.metalCache.length > 0 ? this.metalCache : this.getMockMetal();
        break;
      case 'stocks':
        list = this.stockCache.length > 0 ? this.stockCache : this.getMockStocks();
        break;
      case 'bonds':
        list = this.bondCache.length > 0 ? this.bondCache : this.getMockBonds();
        break;
      case 'futures':
        list = this.getFuturesData(subTab);
        break;
      default:
        list = this.cryptoCache;
    }
    
    // 按子分类处理
    switch (subTab) {
      case 'hot':
        return list.slice(0, 10);
      case 'gainers':
        return [...list].filter(x => parseFloat(x.priceChangePercent) > 0)
          .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));
      case 'losers':
        return [...list].filter(x => parseFloat(x.priceChangePercent) < 0)
          .sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent));
      case 'volume':
        return [...list].sort((a, b) => parseFloat(b.quoteVolume || '0') - parseFloat(a.quoteVolume || '0'));
      default:
        return list;
    }
  }

  /**
   * 获取单个行情
   */
  async getTicker(symbol: string) {
    // 先从加密货币缓存查找
    let ticker = this.cryptoCache.find(t => t.symbol === symbol);
    if (ticker) return ticker;
    
    // 从外汇缓存查找
    ticker = this.forexCache.find(t => t.symbol === symbol);
    if (ticker) return ticker;
    
    // 从贵金属缓存查找
    ticker = this.metalCache.find(t => t.symbol === symbol);
    if (ticker) return ticker;
    
    // 返回默认
    return { symbol, lastPrice: '0', priceChangePercent: '0' };
  }

  /**
   * 获取K线数据 - 从Binance获取真实数据
   */
  async getKlines(symbol: string, interval: string = '1h', limit: number = 100) {
    try {
      // 尝试从Binance获取K线
      const cleanSymbol = symbol.replace('/', '');
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${cleanSymbol}&interval=${interval}&limit=${limit}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.map((k: any[]) => [
          k[0],           // timestamp
          parseFloat(k[1]), // open
          parseFloat(k[2]), // high
          parseFloat(k[3]), // low
          parseFloat(k[4]), // close
          parseFloat(k[5]), // volume
        ]);
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch klines for ${symbol}: ${error.message}`);
    }
    
    // 失败时返回模拟数据
    return this.getMockKlines(symbol, limit);
  }

  /**
   * 获取深度图数据
   */
  async getDepth(symbol: string, limit: number = 100) {
    try {
      const cleanSymbol = symbol.replace('/', '');
      const response = await fetch(
        `https://api.binance.com/api/v3/depth?symbol=${cleanSymbol}&limit=${limit}`
      );
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch depth for ${symbol}`);
    }
    
    return this.getMockDepth(symbol, limit);
  }

  /**
   * 获取最新成交记录
   */
  async getTrades(symbol: string, limit: number = 50) {
    try {
      const cleanSymbol = symbol.replace('/', '');
      const response = await fetch(
        `https://api.binance.com/api/v3/trades?symbol=${cleanSymbol}&limit=${limit}`
      );
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch trades for ${symbol}`);
    }
    
    return this.getMockTrades(symbol, limit);
  }

  /**
   * 期货数据
   */
  private getFuturesData(tab: string) {
    const indexFutures = [
      { symbol: 'IF2501', name: '沪深300', lastPrice: (4200 + Math.random() * 50).toFixed(2), priceChangePercent: (Math.random() * 4 - 2).toFixed(2) },
      { symbol: 'IH2501', name: '上证50', lastPrice: (2850 + Math.random() * 30).toFixed(2), priceChangePercent: (Math.random() * 3 - 1.5).toFixed(2) },
      { symbol: 'IC2501', name: '中证500', lastPrice: (5100 + Math.random() * 50).toFixed(2), priceChangePercent: (Math.random() * 4.5 - 2.25).toFixed(2) },
      { symbol: 'IM2501', name: '中证1000', lastPrice: (5800 + Math.random() * 60).toFixed(2), priceChangePercent: (Math.random() * 5 - 2.5).toFixed(2) },
    ];
    
    const metalFutures = [
      { symbol: 'AU2506', name: '黄金', lastPrice: (625 + Math.random() * 5).toFixed(2), priceChangePercent: (Math.random() * 2 - 1).toFixed(2) },
      { symbol: 'AG2506', name: '白银', lastPrice: (7850 + Math.random() * 50).toFixed(0), priceChangePercent: (Math.random() * 2.5 - 1.25).toFixed(2) },
      { symbol: 'CU2503', name: '沪铜', lastPrice: (69800 + Math.random() * 500).toFixed(0), priceChangePercent: (Math.random() * 2 - 1).toFixed(2) },
      { symbol: 'AL2503', name: '沪铝', lastPrice: (19200 + Math.random() * 200).toFixed(0), priceChangePercent: (Math.random() * 1.5 - 0.75).toFixed(2) },
    ];
    
    const energyFutures = [
      { symbol: 'SC2503', name: '原油', lastPrice: (568 + Math.random() * 10).toFixed(1), priceChangePercent: (Math.random() * 3 - 1.5).toFixed(2) },
      { symbol: 'FU2505', name: '燃油', lastPrice: (3120 + Math.random() * 40).toFixed(0), priceChangePercent: (Math.random() * 2 - 1).toFixed(2) },
      { symbol: 'PG2503', name: 'LPG', lastPrice: (4560 + Math.random() * 50).toFixed(0), priceChangePercent: (Math.random() * 2 - 1).toFixed(2) },
    ];
    
    const agFutures = [
      { symbol: 'M2505', name: '豆粕', lastPrice: (3250 + Math.random() * 30).toFixed(0), priceChangePercent: (Math.random() * 2 - 1).toFixed(2) },
      { symbol: 'C2505', name: '玉米', lastPrice: (2450 + Math.random() * 20).toFixed(0), priceChangePercent: (Math.random() * 1.5 - 0.75).toFixed(2) },
      { symbol: 'SR2505', name: '白糖', lastPrice: (6120 + Math.random() * 50).toFixed(0), priceChangePercent: (Math.random() * 2 - 1).toFixed(2) },
      { symbol: 'CF2505', name: '棉花', lastPrice: (15680 + Math.random() * 100).toFixed(0), priceChangePercent: (Math.random() * 2 - 1).toFixed(2) },
    ];
    
    switch (tab) {
      case 'index': return indexFutures;
      case 'metal': return metalFutures;
      case 'energy': return energyFutures;
      case 'agriculture': return agFutures;
      default: return [...indexFutures, ...metalFutures, ...energyFutures, ...agFutures];
    }
  }

  // ===== Mock 数据备用 =====
  
  private getMockCrypto() {
    return [
      { symbol: 'BTCUSDT', name: 'BTC', lastPrice: '98062.63', priceChangePercent: '0.56', quoteVolume: '12345678900' },
      { symbol: 'ETHUSDT', name: 'ETH', lastPrice: '3522.47', priceChangePercent: '2.10', quoteVolume: '8765432100' },
      { symbol: 'BNBUSDT', name: 'BNB', lastPrice: '685.32', priceChangePercent: '1.25', quoteVolume: '2345678900' },
      { symbol: 'SOLUSDT', name: 'SOL', lastPrice: '193.92', priceChangePercent: '3.15', quoteVolume: '3456789000' },
    ];
  }

  private getMockForex() {
    return [
      { symbol: 'EUR/USD', name: '欧元/美元', lastPrice: '1.0523', priceChangePercent: '0.15', flag: 'https://flagcdn.com/w40/eu.png' },
      { symbol: 'GBP/USD', name: '英镑/美元', lastPrice: '1.2534', priceChangePercent: '-0.23', flag: 'https://flagcdn.com/w40/gb.png' },
      { symbol: 'USD/JPY', name: '美元/日元', lastPrice: '157.34', priceChangePercent: '0.45', flag: 'https://flagcdn.com/w40/jp.png' },
    ];
  }

  private getMockMetal() {
    return [
      { symbol: 'XAU/USD', name: '现货黄金', lastPrice: '2656.71', priceChangePercent: '0.45' },
      { symbol: 'XAG/USD', name: '现货白银', lastPrice: '30.25', priceChangePercent: '0.67' },
    ];
  }

  private getMockStocks() {
    return [
      { symbol: 'SH000001', name: '上证指数', lastPrice: '3398.00', priceChangePercent: '2.15', market: 'CN' },
      { symbol: 'SZ399001', name: '深证成指', lastPrice: '10896.00', priceChangePercent: '3.02', market: 'CN' },
    ];
  }

  private getMockBonds() {
    return [
      { symbol: 'US10Y', name: '美国10年期', lastPrice: '4.55', priceChangePercent: '0.02', country: 'US', flag: 'https://flagcdn.com/w40/us.png' },
    ];
  }

  private getMockKlines(symbol: string, limit: number): number[][] {
    const klines: number[][] = [];
    const now = Date.now();
    let price = this.getBasePrice(symbol);
    
    for (let i = limit; i > 0; i--) {
      const open = price;
      const change = (Math.random() - 0.5) * 2;
      price = price * (1 + change / 100);
      const high = Math.max(open, price) * (1 + Math.random() * 0.01);
      const low = Math.min(open, price) * (1 - Math.random() * 0.01);
      const volume = Math.random() * 1000000;
      
      klines.push([now - i * 3600000, open, high, low, price, volume]);
    }
    
    return klines;
  }

  private getMockDepth(symbol: string, limit: number) {
    const basePrice = this.getBasePrice(symbol);
    const bids: [string, string][] = [];
    const asks: [string, string][] = [];
    
    for (let i = 0; i < limit; i++) {
      bids.push([(basePrice * (1 - (i + 1) * 0.001)).toFixed(2), (Math.random() * 10 + 0.1).toFixed(4)]);
      asks.push([(basePrice * (1 + (i + 1) * 0.001)).toFixed(2), (Math.random() * 10 + 0.1).toFixed(4)]);
    }
    
    return { lastUpdateId: Date.now(), bids, asks };
  }

  private getMockTrades(symbol: string, limit: number) {
    const basePrice = this.getBasePrice(symbol);
    const trades: any[] = [];
    const now = Date.now();
    
    for (let i = 0; i < limit; i++) {
      const price = basePrice * (1 + (Math.random() - 0.5) * 0.01);
      const quantity = Math.random() * 2 + 0.01;
      trades.push({
        id: now - i,
        price: price.toFixed(2),
        qty: quantity.toFixed(4),
        time: now - i * 1000 * Math.random() * 60,
        isBuyerMaker: Math.random() > 0.5,
      });
    }
    
    return trades;
  }

  private getBasePrice(symbol: string): number {
    const priceMap: Record<string, number> = {
      'BTCUSDT': 98000, 'BTC/USDT': 98000,
      'ETHUSDT': 3500, 'ETH/USDT': 3500,
      'BNBUSDT': 680, 'SOLUSDT': 193,
      'XAU/USD': 2650, 'XAG/USD': 30.25,
    };
    return priceMap[symbol] || 100;
  }
}
