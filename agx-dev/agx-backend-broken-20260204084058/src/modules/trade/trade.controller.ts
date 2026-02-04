import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { TradeService } from './trade.service';
import { CreateOrderDto, CancelOrderDto, CreateTradingPairDto, UpdateTradingPairDto, CreateCoinIssueDto, SubscribeCoinDto } from './trade.dto';
import { JwtAuthGuard, AdminGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common';

/**
 * 交易接口 - 前台用户
 */
@Controller('api/trade')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  /**
   * 获取交易对列表
   * GET /api/trade/pairs
   */
  @Get('pairs')
  async getTradingPairs(@Query('status') status?: number) {
    const list = await this.tradeService.getTradingPairs(status);
    return { code: 0, msg: 'ok', data: { list } };
  }

  /**
   * 获取交易对详情
   * GET /api/trade/pair/:symbol
   */
  @Get('pair/:symbol')
  async getTradingPair(@Param('symbol') symbol: string) {
    const pair = await this.tradeService.getTradingPair(symbol);
    return { code: 0, msg: 'ok', data: pair };
  }

  /**
   * 创建订单
   * POST /api/trade/order
   */
  @Post('order')
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateOrderDto,
  ) {
    const order = await this.tradeService.createOrder(userId, dto);
    return { code: 0, msg: '订单创建成功', data: order };
  }

  /**
   * 取消订单
   * POST /api/trade/order/:orderNo/cancel
   */
  @Post('order/:orderNo/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(
    @CurrentUser('id') userId: number,
    @Param('orderNo') orderNo: string,
  ) {
    const order = await this.tradeService.cancelOrder(userId, orderNo);
    return { code: 0, msg: '订单已取消', data: order };
  }

  /**
   * 获取订单列表
   * GET /api/trade/orders?status=0&page=1&pageSize=20
   */
  @Get('orders')
  @UseGuards(JwtAuthGuard)
  async getOrders(
    @CurrentUser('id') userId: number,
    @Query('status') status?: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    const result = await this.tradeService.getOrders(userId, status, page, pageSize);
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 获取订单详情
   * GET /api/trade/order/:orderNo
   */
  @Get('order/:orderNo')
  @UseGuards(JwtAuthGuard)
  async getOrder(
    @CurrentUser('id') userId: number,
    @Param('orderNo') orderNo: string,
  ) {
    const order = await this.tradeService.getOrder(userId, orderNo);
    return { code: 0, msg: 'ok', data: order };
  }

  // ========== 新币发行与申购 ==========

  /**
   * 获取新币发行列表
   * GET /api/trade/ieo/list?status=1
   */
  @Get('ieo/list')
  async getCoinIssues(@Query('status') status?: number) {
    const list = await this.tradeService.getCoinIssues(status);
    return { code: 0, msg: 'ok', data: { list } };
  }

  /**
   * 获取我的申购记录
   * GET /api/trade/ieo/my-subscriptions
   * 注意：必须在 :id 路由之前，否则会被当作动态参数
   */
  @Get('ieo/my-subscriptions')
  @UseGuards(JwtAuthGuard)
  async getMySubscriptions(@CurrentUser('id') userId: number) {
    const list = await this.tradeService.getMySubscriptions(userId);
    return { code: 0, msg: 'ok', data: { list } };
  }

  /**
   * 获取新币发行详情
   * GET /api/trade/ieo/:id
   */
  @Get('ieo/:id')
  async getCoinIssue(@Param('id', ParseIntPipe) id: number) {
    const issue = await this.tradeService.getCoinIssue(id);
    return { code: 0, msg: 'ok', data: issue };
  }

  /**
   * 申购新币
   * POST /api/trade/ieo/subscribe
   */
  @Post('ieo/subscribe')
  @UseGuards(JwtAuthGuard)
  async subscribeCoin(
    @CurrentUser('id') userId: number,
    @Body() dto: SubscribeCoinDto,
  ) {
    const subscription = await this.tradeService.subscribeCoin(userId, dto);
    return { code: 0, msg: '申购成功', data: subscription };
  }
}

/**
 * 交易管理接口 - 管理后台
 */
@Controller('api/admin/trade')
@UseGuards(AdminGuard)
export class TradeAdminController {
  constructor(private readonly tradeService: TradeService) {}

  /**
   * 创建交易对
   * POST /api/admin/trade/pair
   */
  @Post('pair')
  async createTradingPair(@Body() dto: CreateTradingPairDto, @Request() req: any) {
    const pair = await this.tradeService.createTradingPair(dto);
    return { code: 0, msg: '创建成功', data: pair };
  }

  /**
   * 更新交易对
   * PUT /api/admin/trade/pair/:id
   */
  @Put('pair/:id')
  async updateTradingPair(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTradingPairDto,
    @Request() req: any
  ) {
    const pair = await this.tradeService.updateTradingPair(id, dto);
    return { code: 0, msg: '更新成功', data: pair };
  }

  /**
   * 删除交易对
   * DELETE /api/admin/trade/pair/:id
   */
  @Delete('pair/:id')
  async deleteTradingPair(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const result = await this.tradeService.deleteTradingPair(id);
    return { code: 0, msg: '删除成功', data: result };
  }

  /**
   * 获取新币发行列表（管理后台）
   * GET /api/admin/trade/ieo
   */
  @Get('ieo')
  async getCoinIssuesAdmin(@Query('status') status?: number) {
    const list = await this.tradeService.getCoinIssues(status);
    return { code: 0, msg: 'ok', data: { list } };
  }

  /**
   * 创建新币发行
   * POST /api/admin/trade/ieo
   */
  @Post('ieo')
  async createCoinIssue(@Body() dto: CreateCoinIssueDto, @Request() req: any) {
    const issue = await this.tradeService.createCoinIssue(dto);
    return { code: 0, msg: '创建成功', data: issue };
  }

  /**
   * 更新新币发行
   * PUT /api/admin/trade/ieo/:id
   */
  @Put('ieo/:id')
  async updateCoinIssue(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCoinIssueDto,
    @Request() req: any
  ) {
    const issue = await this.tradeService.updateCoinIssue(id, dto);
    return { code: 0, msg: '更新成功', data: issue };
  }

  /**
   * 删除新币发行
   * DELETE /api/admin/trade/ieo/:id
   */
  @Delete('ieo/:id')
  async deleteCoinIssue(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const result = await this.tradeService.deleteCoinIssue(id);
    return { code: 0, msg: '删除成功', data: result };
  }

  /**
   * 获取所有订单（管理后台）
   * GET /api/admin/trade/orders?page=1&pageSize=50
   */
  @Get('orders')
  async getAllOrders(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 50,
    @Query('symbol') symbol?: string,
    @Query('side') side?: string,
    @Query('status') status?: number,
    @Query('userId') userId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?: any
  ) {
    const result = await this.tradeService.getAllOrders(+page, +pageSize, {
      symbol,
      side,
      status: status !== undefined ? +status : undefined,
      userId: userId ? +userId : undefined,
      startDate,
      endDate,
    });
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 获取交易对列表（管理后台）
   * GET /api/admin/trade/pairs?page=1&pageSize=50
   */
  @Get('pairs')
  async getAllTradingPairs(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 50,
    @Query('status') status?: number,
    @Request() req?: any
  ) {
    const result = await this.tradeService.getAllTradingPairs(+page, +pageSize, status !== undefined ? +status : undefined);
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 获取申购记录列表（管理后台）
   * GET /api/admin/trade/subscriptions
   */
  @Get('subscriptions')
  async getAllSubscriptions(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 50,
    @Query('issueId') issueId?: number,
    @Query('userId') userId?: number,
    @Query('status') status?: number,
    @Request() req?: any
  ) {
    const result = await this.tradeService.getAllSubscriptions(+page, +pageSize, {
      issueId: issueId ? +issueId : undefined,
      userId: userId ? +userId : undefined,
      status: status !== undefined ? +status : undefined,
    });
    return { code: 0, msg: 'ok', data: result };
  }

  // ========== IEO 开奖/发币/退款 ==========

  /**
   * IEO开奖
   * POST /api/admin/trade/ieo/:issueId/lottery
   */
  @Post('ieo/:issueId/lottery')
  async lotteryIeo(@Param('issueId', ParseIntPipe) issueId: number, @Request() req?: any) {
    const result = await this.tradeService.lotteryIeo(issueId);
    return result;
  }

  /**
   * 单个发币
   * POST /api/admin/trade/subscription/:id/distribute
   */
  @Post('subscription/:id/distribute')
  async distributeIeo(@Param('id', ParseIntPipe) id: number, @Request() req?: any) {
    const result = await this.tradeService.distributeIeo(id);
    return result;
  }

  /**
   * 单个退款
   * POST /api/admin/trade/subscription/:id/refund
   */
  @Post('subscription/:id/refund')
  async refundIeo(@Param('id', ParseIntPipe) id: number, @Request() req?: any) {
    const result = await this.tradeService.refundIeo(id);
    return result;
  }

  /**
   * 批量发币
   * POST /api/admin/trade/ieo/:issueId/batch-distribute
   */
  @Post('ieo/:issueId/batch-distribute')
  async batchDistributeIeo(@Param('issueId', ParseIntPipe) issueId: number, @Request() req?: any) {
    const result = await this.tradeService.batchDistributeIeo(issueId);
    return result;
  }

  /**
   * 批量退款
   * POST /api/admin/trade/ieo/:issueId/batch-refund
   */
  @Post('ieo/:issueId/batch-refund')
  async batchRefundIeo(@Param('issueId', ParseIntPipe) issueId: number, @Request() req?: any) {
    const result = await this.tradeService.batchRefundIeo(issueId);
    return result;
  }
}
