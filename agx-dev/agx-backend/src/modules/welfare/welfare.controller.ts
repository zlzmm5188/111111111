import { Controller, Get, Post, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common';
import { WelfareService } from './welfare.service';

/**
 * 福利模块接口
 * 提供分红、红包、返利、积分等福利功能
 */
@Controller('api/welfare')
export class WelfareController {
  constructor(private readonly welfareService: WelfareService) {}

  /**
   * 获取福利统计
   * GET /api/welfare/stats
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@CurrentUser('id') userId: number) {
    const data = await this.welfareService.getStats(userId);
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 获取分红记录
   * GET /api/welfare/dividends?page=1&pageSize=20
   */
  @Get('dividends')
  @UseGuards(JwtAuthGuard)
  async getDividends(
    @CurrentUser('id') userId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    const data = await this.welfareService.getDividends(userId, +page, +pageSize);
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 获取红包列表
   * GET /api/welfare/redpackets
   */
  @Get('redpackets')
  @UseGuards(JwtAuthGuard)
  async getRedpackets(@CurrentUser('id') userId: number) {
    const data = await this.welfareService.getRedpackets(userId);
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 领取红包
   * POST /api/welfare/redpacket/:id/claim
   */
  @Post('redpacket/:id/claim')
  @UseGuards(JwtAuthGuard)
  async claimRedpacket(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.welfareService.claimRedpacket(userId, id);
    return data;
  }

  /**
   * 获取返利记录
   * GET /api/welfare/rebates?page=1&pageSize=20
   */
  @Get('rebates')
  @UseGuards(JwtAuthGuard)
  async getRebates(
    @CurrentUser('id') userId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    const data = await this.welfareService.getRebates(userId, +page, +pageSize);
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 获取积分历史
   * GET /api/welfare/points/history?page=1&pageSize=20
   */
  @Get('points/history')
  @UseGuards(JwtAuthGuard)
  async getPointsHistory(
    @CurrentUser('id') userId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    const data = await this.welfareService.getPointsHistory(userId, +page, +pageSize);
    return { code: 0, msg: 'ok', data };
  }
}
