import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoolBonusService } from './pool-bonus.service';
import {
  UpdateBonusConfigDto,
  UpdateCommissionConfigDto,
  UpdateGlobalConfigDto,
  UpdateRepurchaseConfigDto,
} from './pool-bonus.dto';

/**
 * 矿池增值功能控制器
 */
@Controller('pool/bonus')
@UseGuards(JwtAuthGuard)
export class PoolBonusController {
  constructor(private readonly poolBonusService: PoolBonusService) {}

  // ==================== 产品增值配置 ====================

  /**
   * 获取产品增值配置
   * GET /pool/bonus/config/:productId
   */
  @Get('config/:productId')
  async getBonusConfig(@Param('productId') productId: string) {
    return await this.poolBonusService.getBonusConfig(parseInt(productId));
  }

  /**
   * 更新产品增值配置
   * PUT /pool/bonus/config/:productId
   */
  @Put('config/:productId')
  async updateBonusConfig(
    @Param('productId') productId: string,
    @Body() dto: UpdateBonusConfigDto,
  ) {
    return await this.poolBonusService.updateBonusConfig(parseInt(productId), dto);
  }

  // ==================== 层级返利配置 ====================

  /**
   * 获取层级返利配置
   * GET /pool/bonus/commission/:productId
   */
  @Get('commission/:productId')
  async getCommissionConfig(@Param('productId') productId: string) {
    const config = await this.poolBonusService['commissionConfigRepo'].findOne({
      where: { productId: parseInt(productId) },
    });
    return config || {};
  }

  /**
   * 更新层级返利配置
   * PUT /pool/bonus/commission/:productId
   */
  @Put('commission/:productId')
  async updateCommissionConfig(
    @Param('productId') productId: string,
    @Body() dto: UpdateCommissionConfigDto,
  ) {
    return await this.poolBonusService.updateCommissionConfig(parseInt(productId), dto);
  }

  // ==================== 全局配置 ====================

  /**
   * 获取全局配置
   * GET /pool/bonus/global/config
   */
  @Get('global/config')
  async getGlobalConfig() {
    return await this.poolBonusService.getGlobalConfig();
  }

  /**
   * 更新全局配置
   * PUT /pool/bonus/global/config
   */
  @Put('global/config')
  async updateGlobalConfig(@Body() dto: UpdateGlobalConfigDto) {
    const config = await this.poolBonusService.getGlobalConfig();
    Object.assign(config, dto);
    await this.poolBonusService['globalConfigRepo'].save(config);
    return {};
  }

  // ==================== 复购补贴配置 ====================

  /**
   * 获取复购补贴配置
   * GET /pool/bonus/repurchase/config
   */
  @Get('repurchase/config')
  async getRepurchaseConfig() {
    return await this.poolBonusService.getRepurchaseConfig();
  }

  /**
   * 更新复购补贴配置
   * PUT /pool/bonus/repurchase/config
   */
  @Put('repurchase/config')
  async updateRepurchaseConfig(@Body() dto: UpdateRepurchaseConfigDto) {
    const config = await this.poolBonusService.getRepurchaseConfig();
    Object.assign(config, dto);
    await this.poolBonusService['repurchaseConfigRepo'].save(config);
    return {};
  }
}
