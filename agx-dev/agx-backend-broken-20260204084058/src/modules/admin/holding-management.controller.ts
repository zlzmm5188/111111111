import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HoldingManagementService } from './holding-management.service';
import { ExchangeRecordService } from './exchange-record.service';

/**
 * 持币生金管理控制器
 * 包含配置、发放记录、兑换记录
 */
@Controller('api/admin/holding')
@UseGuards(JwtAuthGuard)
export class HoldingManagementController {
  constructor(
    private readonly holdingService: HoldingManagementService,
    private readonly exchangeRecordService: ExchangeRecordService,
  ) {}

  // ==================== 持币生金配置管理 ====================

  /**
   * 获取配置列表
   * GET /api/admin/holding/configs
   */
  @Get('configs')
  async getConfigs() {
    try {
      const configs = await this.holdingService.getConfigs();
      return { code: 0, msg: 'ok', data: configs };
    } catch (error) {
      return { code: 1001, msg: error.message || '查询失败', data: null };
    }
  }

  /**
   * 更新配置
   * PUT /api/admin/holding/config/:id
   */
  @Put('config/:id')
  async updateConfig(
    @Param('id') id: number,
    @Body() data: any,
    @Request() req: any,
  ) {
    try {
      const admin = req.user;
      const ip = req.ip || req.connection.remoteAddress;

      const result = await this.holdingService.updateConfig(id, data, admin, ip);
      return { code: 0, msg: '更新成功', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message || '更新失败', data: null };
    }
  }

  /**
   * 手动触发发放
   * POST /api/admin/holding/distribute
   */
  @Post('distribute')
  async manualDistribute(
    @Body() body: { targetDate: string },
    @Request() req: any,
  ) {
    try {
      const admin = req.user;
      const ip = req.ip || req.connection.remoteAddress;

      const result = await this.holdingService.manualDistribution(
        body.targetDate,
        admin,
        ip,
      );
      return result;
    } catch (error) {
      return { code: 1001, msg: error.message || '发放失败', data: null };
    }
  }

  /**
   * 获取发放记录
   * GET /api/admin/holding/distributions
   */
  @Get('distributions')
  async getDistributions(
    @Query('userId') userId?: number,
    @Query('distributionDate') distributionDate?: string,
    @Query('status') status?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('keyword') keyword?: string,
    @Query('userType') userType?: string,
  ) {
    try {
      const result = await this.holdingService.getDistributions({
        userId,
        distributionDate,
        status,
        startDate,
        endDate,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 20,
        keyword,
        userType,
      });
      return { code: 0, msg: 'ok', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message || '查询失败', data: null };
    }
  }

  /**
   * 导出持币生金发放记录
   * GET /api/admin/holding/export
   */
  @Get('export')
  async exportDistributions(
    @Query('userId') userId?: number,
    @Query('distributionDate') distributionDate?: string,
    @Query('status') status?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('keyword') keyword?: string,
    @Query('userType') userType?: string,
  ) {
    try {
      const records = await this.holdingService.exportDistributions({
        userId,
        distributionDate,
        status,
        startDate,
        endDate,
        keyword,
        userType,
      });

      return {
        code: 0,
        msg: 'ok',
        data: {
          records,
          total: records.length,
        },
      };
    } catch (error) {
      return { code: 1001, msg: error.message || '导出失败', data: null };
    }
  }

  // ==================== 兑换记录查询 ====================

  /**
   * 获取兑换记录列表
   * GET /api/admin/exchange/records
   */
  @Get('exchange/records')
  async getExchangeRecords(
    @Query('userId') userId?: number,
    @Query('exchangeType') exchangeType?: string,
    @Query('status') status?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    try {
      const result = await this.exchangeRecordService.getRecords({
        userId,
        exchangeType,
        status,
        startDate,
        endDate,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 20,
      });
      return { code: 0, msg: 'ok', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message || '查询失败', data: null };
    }
  }

  /**
   * 获取兑换详情
   * GET /api/admin/exchange/record/:id
   */
  @Get('exchange/record/:id')
  async getExchangeRecordDetail(@Param('id') id: number) {
    try {
      const result = await this.exchangeRecordService.getDetail(Number(id));
      return { code: 0, msg: 'ok', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message || '查询失败', data: null };
    }
  }

  /**
   * 导出兑换记录
   * GET /api/admin/exchange/export
   */
  @Get('exchange/export')
  async exportExchangeRecords(
    @Query('userId') userId?: number,
    @Query('exchangeType') exchangeType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const records = await this.exchangeRecordService.exportRecords({
        userId,
        exchangeType,
        startDate,
        endDate,
      });

      // 这里应该实现Excel或CSV导出，暂时返回JSON
      return {
        code: 0,
        msg: 'ok',
        data: {
          records,
          total: records.length,
        },
      };
    } catch (error) {
      return { code: 1001, msg: error.message || '导出失败', data: null };
    }
  }
}
