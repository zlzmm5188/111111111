import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractSettlementService } from './contract-settlement.service';
import { CreateOrderDto } from './contract.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/contract')
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
    private readonly settlementService: ContractSettlementService,
  ) {}

  /**
   * 获取秒合约配置列表
   */
  @Get('configs')
  async getConfigs() {
    return this.contractService.getConfigs();
  }

  /**
   * 创建订单（下单）
   */
  @UseGuards(JwtAuthGuard)
  @Post('order')
  async createOrder(
    @CurrentUser() user: { id: number },
    @Body() dto: CreateOrderDto,
  ) {
    return this.contractService.createOrder(user.id, dto);
  }

  /**
   * 获取用户订单列表
   */
  @UseGuards(JwtAuthGuard)
  @Get('orders')
  async getOrders(
    @CurrentUser() user: { id: number },
    @Query('status') status?: string,
  ) {
    const statusNum = status !== undefined ? parseInt(status, 10) : undefined;
    return this.contractService.getOrders(user.id, statusNum);
  }

  /**
   * 手动触发结算检查（管理员功能）
   */
  @Get('admin/check-settlements')
  async manualCheckSettlements() {
    const result = await this.settlementService.manualCheckExpiredOrders();
    return {
      success: true,
      message: '手动结算检查完成',
      data: result,
    };
  }
}