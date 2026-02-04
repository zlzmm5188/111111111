import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExchangeRecordService } from './exchange-record.service';

/**
 * 兑换记录控制器
 * 处理 /api/admin/exchange/* 路由
 */
@Controller('api/admin/exchange')
@UseGuards(JwtAuthGuard)
export class ExchangeController {
  constructor(
    private readonly exchangeRecordService: ExchangeRecordService,
  ) {}

  /**
   * 获取兑换记录列表
   * GET /api/admin/exchange/records
   */
  @Get('records')
  async getRecords(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('exchangeType') exchangeType?: string,
    @Query('userId') userId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const result = await this.exchangeRecordService.getRecords({
        page,
        pageSize,
        exchangeType,
        userId,
        startDate,
        endDate,
      });
      return { code: 0, msg: 'ok', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message || '查询失败', data: null };
    }
  }

  /**
   * 获取兑换记录详情
   * GET /api/admin/exchange/record/:id
   */
  @Get('record/:id')
  async getDetail(@Param('id') id: string) {
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
  @Get('export')
  async exportRecords(
    @Query('exchangeType') exchangeType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const records = await this.exchangeRecordService.exportRecords({
        exchangeType,
        startDate,
        endDate,
      });
      return { code: 0, msg: 'ok', data: records };
    } catch (error) {
      return { code: 1001, msg: error.message || '导出失败', data: null };
    }
  }
}
