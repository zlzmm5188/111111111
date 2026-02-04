import { Controller, Get, Query, Param } from '@nestjs/common';
import { MarketService } from './market.service';

/**
 * 行情接口
 * 提供多资产行情数据
 */
@Controller('api/market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  /**
   * 获取行情列表
   * GET /api/market/tickers?type=crypto&tab=all
   */
  @Get('tickers')
  async getTickers(
    @Query('type') type: string = 'crypto',
    @Query('tab') tab: string = 'all',
  ) {
    const list = await this.marketService.getTickers(type, tab);
    return { code: 0, msg: 'ok', data: { list } };
  }

  /**
   * 获取单个行情
   * GET /api/market/ticker/:symbol
   */
  @Get('ticker/:symbol')
  async getTicker(@Param('symbol') symbol: string) {
    const ticker = await this.marketService.getTicker(symbol);
    return { code: 0, msg: 'ok', data: ticker };
  }

  /**
   * 获取K线数据
   * GET /api/market/klines?symbol=BTCUSDT&interval=1h&limit=100
   */
  @Get('klines')
  async getKlines(
    @Query('symbol') symbol: string,
    @Query('interval') interval: string = '1h',
    @Query('limit') limit: number = 100,
  ) {
    const klines = await this.marketService.getKlines(symbol, interval, limit);
    return { code: 0, msg: 'ok', data: { klines } };
  }

  /**
   * 获取深度图数据
   * GET /api/market/depth?symbol=BTCUSDT&limit=100
   */
  @Get('depth')
  async getDepth(
    @Query('symbol') symbol: string,
    @Query('limit') limit: number = 100,
  ) {
    const depth = await this.marketService.getDepth(symbol, limit);
    return { code: 0, msg: 'ok', data: depth };
  }

  /**
   * 获取最新成交记录
   * GET /api/market/trades?symbol=BTCUSDT&limit=50
   */
  @Get('trades')
  async getTrades(
    @Query('symbol') symbol: string,
    @Query('limit') limit: number = 50,
  ) {
    const trades = await this.marketService.getTrades(symbol, limit);
    return { code: 0, msg: 'ok', data: { trades } };
  }

  /**
   * 获取资产配置列表
   * GET /api/market/assets?type=crypto
   */
  @Get('assets')
  async getAssets(@Query('type') type?: string) {
    const list = await this.marketService.getAssets(type);
    return { code: 0, msg: 'ok', data: { list } };
  }
}
