import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CoinIssueService } from './coin-issue.service';
import { PoolProductService } from './pool-product.service';

/**
 * 金融产品管理控制器
 * 所有操作都有审计日志
 */
@Controller('api/admin')
@UseGuards(JwtAuthGuard)
export class FinancialProductController {
  constructor(
    private readonly coinIssueService: CoinIssueService,
    private readonly poolProductService: PoolProductService,
  ) {}

  // ==================== 新币发行管理 ====================

  /**
   * 创建新币发行
   * POST /api/admin/coin-issue
   */
  @Post('coin-issue')
  async createCoinIssue(@Body() data: any, @Request() req: any) {
    try {
      const admin = req.user;
      const ip = req.ip || req.connection.remoteAddress;

      const result = await this.coinIssueService.createIssue(data, admin, ip);
      return { code: 0, msg: '创建成功', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message || '创建失败', data: null };
    }
  }

  /**
   * 更新新币发行
   * PUT /api/admin/coin-issue/:id
   */
  @Put('coin-issue/:id')
  async updateCoinIssue(
    @Param('id') id: number,
    @Body() data: any,
    @Request() req: any,
  ) {
    try {
      const admin = req.user;
      const ip = req.ip || req.connection.remoteAddress;

      const result = await this.coinIssueService.updateIssue(Number(id), data, admin, ip);
      return { code: 0, msg: '更新成功', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message || '更新失败', data: null };
    }
  }

  /**
   * 删除新币发行
   * DELETE /api/admin/coin-issue/:id
   */
  @Delete('coin-issue/:id')
  async deleteCoinIssue(@Param('id') id: number, @Request() req: any) {
    try {
      const admin = req.user;
      const ip = req.ip || req.connection.remoteAddress;

      await this.coinIssueService.deleteIssue(Number(id), admin, ip);
      return { code: 0, msg: '删除成功', data: null };
    } catch (error) {
      return { code: 1001, msg: error.message || '删除失败', data: null };
    }
  }

  /**
   * 获取新币发行列表
   * GET /api/admin/coin-issue
   */
  @Get('coin-issue')
  async getCoinIssueList(
    @Query('status') status?: string,
    @Query('coinSymbol') coinSymbol?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    try {
      const result = await this.coinIssueService.getList({
        status: status !== undefined && status !== "" && !isNaN(Number(status)) ? Number(status) : undefined,
        coinSymbol,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 20,
      });
      return { code: 0, msg: 'ok', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message || '查询失败', data: null };
    }
  }

  /**
   * 获取新币发行详情
   * GET /api/admin/coin-issue/:id
   */
  @Get('coin-issue/:id')
  async getCoinIssueDetail(@Param('id') id: number) {
    try {
      const result = await this.coinIssueService.getDetail(Number(id));
      return { code: 0, msg: 'ok', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message || '查询失败', data: null };
    }
  }

  /**
   * 获取新币发行统计数据
   * GET /api/admin/coin-issue/stats
   */
  @Get('coin-issue/stats')
  async getCoinIssueStats() {
    try {
      const result = await this.coinIssueService.getStats();
      return { code: 0, msg: 'ok', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message || '查询失败', data: null };
    }
  }

  // ==================== 矿池产品管理 ====================

  /**
   * 创建矿池产品
   * POST /api/admin/pool-product
   */
  @Post('pool-product')
  @Post('pool')
  async createPoolProduct(@Body() data: any, @Request() req: any) {
    try {
      const admin = req.user;
      const ip = req.ip || req.connection.remoteAddress;

      const result = await this.poolProductService.createProduct(data, admin, ip);
      return { code: 0, msg: '创建成功', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message || '创建失败', data: null };
    }
  }

  /**
   * 更新矿池产品
   * PUT /api/admin/pool-product/:id
   */
  @Put('pool-product/:id')
  @Put('pool/:id')
  async updatePoolProduct(
    @Param('id') id: number,
    @Body() data: any,
    @Request() req: any,
  ) {
    try {
      const admin = req.user;
      const ip = req.ip || req.connection.remoteAddress;

      const result = await this.poolProductService.updateProduct(Number(id), data, admin, ip);
      return { code: 0, msg: '更新成功', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message || '更新失败', data: null };
    }
  }

  /**
   * 删除矿池产品
   * DELETE /api/admin/pool-product/:id
   */
  @Delete('pool-product/:id')
  @Delete('pool/:id')
  async deletePoolProduct(@Param('id') id: number, @Request() req: any) {
    try {
      const admin = req.user;
      const ip = req.ip || req.connection.remoteAddress;

      await this.poolProductService.deleteProduct(Number(id), admin, ip);
      return { code: 0, msg: '删除成功', data: null };
    } catch (error) {
      return { code: 1001, msg: error.message || '删除失败', data: null };
    }
  }

  /**
   * 获取矿池产品列表
   * GET /api/admin/pool-product
   */
  @Get('pool-product')
  @Get('pool/list')
  async getPoolProductList(
    @Query('status') status?: string,
    @Query('coinId') coinId?: number,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    try {
      const result = await this.poolProductService.getList({
        status: status !== undefined && status !== "" && !isNaN(Number(status)) ? Number(status) : undefined,
        coinId: coinId ? Number(coinId) : undefined,
        type,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 20,
      });
      return { code: 0, msg: 'ok', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message || '查询失败', data: null };
    }
  }

  /**
   * 获取矿池产品详情
   * GET /api/admin/pool-product/:id
   */
  @Get('pool-product/:id')
  async getPoolProductDetail(@Param('id') id: number) {
    try {
      const result = await this.poolProductService.getDetail(Number(id));
      return { code: 0, msg: 'ok', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message || '查询失败', data: null };
    }
  }

  /**
   * 获取矿池产品统计
   * GET /api/admin/pool-product/stats
   */
  @Get('pool-product/stats')
  @Get('pool/stats')
  async getPoolProductStats() {
    try {
      const result = await this.poolProductService.getStats();
      return { code: 0, msg: 'ok', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message || '查询失败', data: null };
    }
  }

  // ==================== 操作日志查询 ====================

  /**
   * 获取操作日志
   * GET /api/admin/operation-logs
   */
  @Get('operation-logs')
  async getOperationLogs(
    @Query('adminId') adminId?: number,
    @Query('module') module?: string,
    @Query('action') action?: string,
    @Query('targetType') targetType?: string,
    @Query('targetId') targetId?: number,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    try {
      // 这里应该注入OperationLogService，为简化暂时返回空
      return {
        code: 0,
        msg: 'ok',
        data: {
          list: [],
          total: 0,
          page: page || 1,
          pageSize: pageSize || 20,
          totalPages: 0,
        }
      };
    } catch (error) {
      return { code: 1001, msg: error.message || '查询失败', data: null };
    }
  }
}
