import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  Put,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OtcService } from './otc.service';

@Controller('api/otc')
export class OtcController {
  constructor(private readonly otcService: OtcService) {}

  /**
   * 获取OTC实时汇率
   */
  @Get('rate')
  async getRate() {
    const data = await this.otcService.getRate();
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 获取商家广告列表
   */
  @Get('advertisements')
  @UseGuards(JwtAuthGuard)
  async getAdvertisements(
    @Request() req,
    @Query('type') type: 'buy' | 'sell' = 'buy',
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const data = await this.otcService.getAdvertisements(type, Number(page), Number(limit), req.user?.sub);
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 创建挂单/发布广告
   */
  @Post('advertisement')
  @UseGuards(JwtAuthGuard)
  async createAdvertisement(
    @Request() req,
    @Body('type') type: 'buy' | 'sell',
    @Body('price') price: string,
    @Body('amount') amount: string,
    @Body('minLimit') minLimit: string,
    @Body('maxLimit') maxLimit: string,
    @Body('paymentMethods') paymentMethods: string[],
    @Body('remark') remark?: string,
    @Body('payTimeLimit') payTimeLimit?: number,
  ) {
    const data = await this.otcService.createAdvertisement(
      req.user.sub,
      type,
      price,
      amount,
      minLimit,
      maxLimit,
      paymentMethods,
      remark,
      payTimeLimit,
    );
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 获取我的挂单
   */
  @Get('my-advertisements')
  @UseGuards(JwtAuthGuard)
  async getMyAdvertisements(
    @Request() req,
    @Query('status') status?: string,
  ) {
    const data = await this.otcService.getMyAdvertisements(
      req.user.sub,
      status !== undefined ? Number(status) : undefined,
    );
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 下架挂单
   */
  @Delete('advertisement/:id')
  @UseGuards(JwtAuthGuard)
  async cancelAdvertisement(
    @Request() req,
    @Param('id') id: string,
  ) {
    const data = await this.otcService.cancelAdvertisement(req.user.sub, Number(id));
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 更新挂单价格
   */
  @Put('advertisement/:id/price')
  @UseGuards(JwtAuthGuard)
  async updateAdvertisementPrice(
    @Request() req,
    @Param('id') id: string,
    @Body('price') price: string,
  ) {
    const data = await this.otcService.updateAdvertisementPrice(req.user.sub, Number(id), price);
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 创建OTC订单
   */
  @Post('order')
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Request() req,
    @Body('type') type: 'buy' | 'sell',
    @Body('advertisementId') advertisementId: number,
    @Body('amount') amount: number,
    @Body('payMethod') payMethod: string,
  ) {
    const data = await this.otcService.createOrder(
      req.user.sub,
      type,
      advertisementId,
      amount,
      payMethod,
    );
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 获取用户订单列表
   */
  @Get('orders')
  @UseGuards(JwtAuthGuard)
  async getUserOrders(
    @Request() req,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const data = await this.otcService.getUserOrders(
      req.user.sub,
      status,
      Number(page),
      Number(limit),
    );
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 获取订单详情
   */
  @Get('order/:orderNo')
  @UseGuards(JwtAuthGuard)
  async getOrderDetail(@Param('orderNo') orderNo: string, @Request() req) {
    const data = await this.otcService.getOrderDetail(orderNo, req.user.sub);
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 确认付款
   */
  @Post('order/:orderNo/paid')
  @UseGuards(JwtAuthGuard)
  async confirmPaid(@Param('orderNo') orderNo: string, @Request() req) {
    const data = await this.otcService.confirmPaid(orderNo, req.user.sub);
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 确认放币
   */
  @Post('order/:orderNo/release')
  @UseGuards(JwtAuthGuard)
  async confirmRelease(@Param('orderNo') orderNo: string, @Request() req) {
    const data = await this.otcService.confirmRelease(orderNo, req.user.sub);
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 取消订单
   */
  @Post('order/:orderNo/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(@Param('orderNo') orderNo: string, @Request() req) {
    const data = await this.otcService.cancelOrder(orderNo, req.user.sub);
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 获取用户OTC统计
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Request() req) {
    const data = await this.otcService.getUserStats(req.user.sub);
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 兼容旧接口 - 获取订单列表
   */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(@Request() req) {
    const data = await this.otcService.getUserOrders(req.user.sub, undefined, 1, 20);
    return { code: 0, msg: 'ok', data };
  }
}
