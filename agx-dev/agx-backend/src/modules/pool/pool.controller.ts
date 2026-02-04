import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { PoolService } from './pool.service';
import { SubscribePoolDto, RedeemPoolDto } from './pool.dto';
import { JwtAuthGuard, AdminGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/pool')
export class PoolController {
  constructor(private readonly poolService: PoolService) {}

  /**
   * 获取矿池产品列表
   */
  @Get('products')
  async getProducts() {
    return this.poolService.getProducts();
  }

  /**
   * 获取用户持仓
   */
  @UseGuards(JwtAuthGuard)
  @Get('holdings')
  async getHoldings(@CurrentUser() user: { id: number }) {
    return this.poolService.getHoldings(user.id);
  }

  /**
   * 获取用户收益记录
   */
  @UseGuards(JwtAuthGuard)
  @Get('incomes')
  async getIncomeRecords(
    @CurrentUser() user: { id: number },
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.poolService.getIncomeRecords(
      user.id,
      parseInt(page) || 1,
      parseInt(limit) || 20,
    );
  }

  /**
   * 申购矿池
   */
  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(
    @CurrentUser() user: { id: number },
    @Body() dto: SubscribePoolDto,
  ) {
    return this.poolService.subscribe(user.id, dto);
  }

  /**
   * 赎回矿池
   */
  @UseGuards(JwtAuthGuard)
  @Post('redeem')
  async redeem(
    @CurrentUser() user: { id: number },
    @Body() dto: RedeemPoolDto,
  ) {
    return this.poolService.redeem(user.id, dto);
  }

  /**
   * 手动触发收益派发（仅管理员）
   */
  @UseGuards(AdminGuard)
  @Post('distribute-income')
  async distributeIncome() {
    return this.poolService.manualDistributeIncome();
  }
}