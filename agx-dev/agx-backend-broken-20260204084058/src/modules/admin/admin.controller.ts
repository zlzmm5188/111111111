import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import {
  AdminLoginDto,
  CurrencyListDto,
  CreateCurrencyDto,
  UpdateCurrencyDto,
  UserListDto,
  UpdateUserStatusDto,
  PoolProductListDto,
  CreatePoolProductDto,
  UpdatePoolProductDto,
  ContractConfigListDto,
  CreateContractConfigDto,
  UpdateContractConfigDto,
} from './admin.dto';
import { AdminGuard } from '../auth/jwt-auth.guard';
import { OfficialPostService, OfficialPostType } from '../square/official-post.service';
import { MemberLevelService } from '../account/member-level.service';

@Controller('api/admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly officialPostService: OfficialPostService,
    private readonly memberLevelService: MemberLevelService,
  ) {}

  /**
   * 管理员登录
   * POST /api/admin/login
   */
  @Post('login')
  async login(@Body() dto: AdminLoginDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.login(dto, ip);
  }

  /**
   * 获取币种列表
   * GET /api/admin/currency/list
   */
  @Get('currency/list')
  @UseGuards(AdminGuard)
  async getCurrencyList(@Query() dto: CurrencyListDto) {
    return this.adminService.getCurrencyList(dto);
  }

  /**
   * 新增币种
   * POST /api/admin/currency
   */
  @Post('currency')
  @UseGuards(AdminGuard)
  async createCurrency(@Body() dto: CreateCurrencyDto) {
    return this.adminService.createCurrency(dto);
  }

  /**
   * 更新币种
   * PUT /api/admin/currency/:id
   */
  @Put('currency/:id')
  @UseGuards(AdminGuard)
  async updateCurrency(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCurrencyDto,
  ) {
    return this.adminService.updateCurrency(id, dto);
  }

  /**
   * 删除币种
   * DELETE /api/admin/currency/:id
   */
  @Delete('currency/:id')
  @UseGuards(AdminGuard)
  async deleteCurrency(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCurrency(id);
  }

  // ==================== 管理员管理 ====================

  @Get('admin/list')
  @UseGuards(AdminGuard)
  async getAdminList(@Query() dto: any, @Req() req: Request) {
    const adminGroup = (req as any).user?.adminGroup ?? 0;
    return this.adminService.getAdminList(dto, adminGroup);
  }

  @Post('admin')
  @UseGuards(AdminGuard)
  async createAdmin(@Body() dto: any, @Req() req: Request) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;

    // 检查权限：只有超级管理员可以创建管理员
    const currentAdminGroup = (req as any).user?.adminGroup ?? 0;
    if (currentAdminGroup !== 0) {
      return { code: 1001, msg: '只有超级管理员可以创建管理员', data: null };
    }

    const result = await this.adminService.createAdmin(dto);

    // 记录操作日志
    await this.adminService.logAdminAction(
      adminId,
      '管理员管理',
      `创建管理员: ${dto.username}`,
      'Admin',
      result.id,
      ip,
    );

    return { code: 0, msg: '创建成功', data: result };
  }

  @Put('admin/:id')
  @UseGuards(AdminGuard)
  async updateAdmin(@Param('id', ParseIntPipe) id: number, @Body() dto: any, @Req() req: Request) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;

    // 检查权限：只有超级管理员可以修改管理员
    const currentAdminGroup = (req as any).user?.adminGroup ?? 0;
    if (currentAdminGroup !== 0) {
      return { code: 1001, msg: '只有超级管理员可以修改管理员', data: null };
    }

    const result = await this.adminService.updateAdmin(id, dto);

    // 记录操作日志
    await this.adminService.logAdminAction(
      adminId,
      '管理员管理',
      `更新管理员: ${id}`,
      'Admin',
      id,
      ip,
    );

    return { code: 0, msg: '更新成功', data: result };
  }

  @Delete('admin/:id')
  @UseGuards(AdminGuard)
  async deleteAdmin(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;

    // 检查权限：只有超级管理员可以删除管理员
    const currentAdminGroup = (req as any).user?.adminGroup ?? 0;
    if (currentAdminGroup !== 0) {
      return { code: 1001, msg: '只有超级管理员可以删除管理员', data: null };
    }

    const result = await this.adminService.deleteAdmin(id);

    // 记录操作日志
    await this.adminService.logAdminAction(
      adminId,
      '管理员管理',
      `删除管理员: ${id}`,
      'Admin',
      id,
      ip,
    );

    return { code: 0, msg: '删除成功', data: result };
  }

  @Post('user/:id/assign')
  @UseGuards(AdminGuard)
  async assignUserToAdmin(
    @Param('id', ParseIntPipe) userId: number,
    @Body() dto: { assignedAdminId?: number | null },
    @Req() req: Request
  ) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;

    await this.adminService.assignUserToAdmin(userId, dto.assignedAdminId ?? null, adminId, ip);

    return { code: 0, msg: '分配成功' };
  }

  // ==================== 用户管理 ====================

  @Get('user/list')
  @UseGuards(AdminGuard)
  async getUserList(@Query() dto: UserListDto, @Req() req: Request) {
    const adminId = (req as any).user?.sub;
    const adminGroup = (req as any).user?.adminGroup ?? 0;
    return this.adminService.getUserList(dto, adminGroup, adminId);
  }

  @Get('user/:id')
  @UseGuards(AdminGuard)
  async getUserDetail(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserDetail(id);
  }

  @Put('user/:id/status')
  @UseGuards(AdminGuard)
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(id, dto);
  }

  @Put('user/:id/remark')
  @UseGuards(AdminGuard)
  async updateUserRemark(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @Req() req: Request
  ) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.updateUserRemark(id, dto, adminId, ip);
  }

  @Put('user/:id/tron-address')
  @UseGuards(AdminGuard)
  async updateUserTronAddress(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { tronAddress: string | null },
    @Req() req: Request
  ) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.updateUserTronAddress(id, dto.tronAddress, adminId, ip);
  }

  @Put('user/:id/reset-password')
  @UseGuards(AdminGuard)
  async resetUserPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { password: string },
    @Req() req: Request
  ) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.resetUserPassword(id, dto.password, adminId, ip);
  }

  @Put('user/:id/reset-trade-password')
  @UseGuards(AdminGuard)
  async resetUserTradePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { password: string },
    @Req() req: Request
  ) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.resetUserTradePassword(id, dto.password, adminId, ip);
  }

  @Put('user/:id/kyc')
  @UseGuards(AdminGuard)
  async updateUserKyc(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { realName?: string; idNumber?: string; idType?: number },
    @Req() req: Request
  ) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.updateUserKyc(id, dto, adminId, ip);
  }

  @Post('user/:id/adjust-funds')
  @UseGuards(AdminGuard)
  async adjustUserFunds(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @Req() req: Request
  ) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.adjustUserFunds(id, dto, adminId, ip);
  }

  @Post('user/:id/adjust-points')
  @UseGuards(AdminGuard)
  async adjustUserPoints(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @Req() req: Request
  ) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.adjustUserPoints(id, dto, adminId, ip);
  }

  @Put('user/:id/internal')
  @UseGuards(AdminGuard)
  async setUserInternal(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { isInternal: number },
    @Req() req: Request
  ) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.setUserInternal(id, dto.isInternal, adminId, ip);
  }

  @Put('user/:id/inviter')
  @UseGuards(AdminGuard)
  async changeUserInviter(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { inviterId: number | null },
    @Req() req: Request
  ) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.changeUserInviter(id, dto.inviterId, adminId, ip);
  }

  // ==================== 矿池产品管理 ====================

  @Get('pool/list')
  @UseGuards(AdminGuard)
  async getPoolProductList(@Query() dto: PoolProductListDto) {
    return this.adminService.getPoolProductList(dto);
  }

  @Post('pool')
  @UseGuards(AdminGuard)
  async createPoolProduct(@Body() dto: CreatePoolProductDto) {
    return this.adminService.createPoolProduct(dto);
  }

  @Put('pool/:id')
  @UseGuards(AdminGuard)
  async updatePoolProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePoolProductDto,
  ) {
    return this.adminService.updatePoolProduct(id, dto);
  }

  @Delete('pool/:id')
  @UseGuards(AdminGuard)
  async deletePoolProduct(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deletePoolProduct(id);
  }

  @Get('pool/stats')
  @UseGuards(AdminGuard)
  async getPoolProductStats() {
    return this.adminService.getPoolProductStats();
  }

  // ==================== 新币预售管理 ====================

  @Get('coin-issue/stats')
  @UseGuards(AdminGuard)
  async getCoinIssueStats() {
    return this.adminService.getCoinIssueStats();
  }

  // ==================== 秒合约配置管理 ====================

  @Get('contract/list')
  @UseGuards(AdminGuard)
  async getContractConfigList(@Query() dto: ContractConfigListDto) {
    return this.adminService.getContractConfigList(dto);
  }

  @Post('contract')
  @UseGuards(AdminGuard)
  async createContractConfig(@Body() dto: CreateContractConfigDto) {
    return this.adminService.createContractConfig(dto);
  }

  @Put('contract/:id')
  @UseGuards(AdminGuard)
  async updateContractConfig(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContractConfigDto,
  ) {
    return this.adminService.updateContractConfig(id, dto);
  }

  @Delete('contract/:id')
  @UseGuards(AdminGuard)
  async deleteContractConfig(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteContractConfig(id);
  }

  // ==================== 仪表盘 ====================

  @Get('dashboard/stats')
  @UseGuards(AdminGuard)
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/pending')
  @UseGuards(AdminGuard)
  async getPendingList() {
    return this.adminService.getPendingList();
  }

  @Get('dashboard/charts')
  @UseGuards(AdminGuard)
  async getDashboardCharts() {
    return this.adminService.getDashboardCharts();
  }

  @Get('dashboard/activities')
  @UseGuards(AdminGuard)
  async getRecentActivities(@Query('limit') limit?: string) {
    return this.adminService.getRecentActivities(limit ? parseInt(limit) : 10);
  }

  // ==================== 订单管理 ====================

  @Get('holding/list')
  @UseGuards(AdminGuard)
  async getPoolHoldingList(@Query() dto: any) {
    return this.adminService.getPoolHoldingList(dto);
  }

  @Get('holding/export')
  @UseGuards(AdminGuard)
  async exportPoolHoldings(@Query() dto: any) {
    const data = await this.adminService.exportPoolHoldings(dto);
    return { code: 0, msg: 'ok', data };
  }

  @Get('order/list')
  @UseGuards(AdminGuard)
  async getContractOrderList(@Query() dto: any) {
    return this.adminService.getContractOrderList(dto);
  }

  @Put('order/:id/settle')
  @UseGuards(AdminGuard)
  async settleContractOrder(@Param('id', ParseIntPipe) id: number, @Body() dto: any, @Req() req: Request) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.settleContractOrder(id, dto, adminId, ip);
  }

  // ==================== KYC管理 ====================

  @Get('kyc/list')
  @UseGuards(AdminGuard)
  async getKycList(@Query() dto: any) {
    return this.adminService.getKycList(dto);
  }

  @Put('kyc/:id/review')
  @UseGuards(AdminGuard)
  async reviewKyc(@Param('id', ParseIntPipe) id: number, @Body() dto: any, @Req() req: Request) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.reviewKyc(id, dto, adminId, ip);
  }

  // ==================== 充值记录 ====================

  @Get('recharge/stats')
  @UseGuards(AdminGuard)
  async getRechargeStats() {
    return this.adminService.getRechargeStats();
  }

  @Get('recharge/list')
  @UseGuards(AdminGuard)
  async getRechargeList(@Query() dto: any) {
    return this.adminService.getRechargeList(dto);
  }

  @Post('recharge/manual')
  @UseGuards(AdminGuard)
  async manualRecharge(@Body() dto: any, @Req() req: Request) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.manualRecharge(dto, adminId, ip);
  }

  @Get('recharge/:id')
  @UseGuards(AdminGuard)
  async getRechargeDetail(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getRechargeDetail(id);
  }

  @Put('recharge/:id/process')
  @UseGuards(AdminGuard)
  async processRecharge(@Param('id', ParseIntPipe) id: number, @Body() dto: any, @Req() req: Request) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.processRecharge(id, dto, adminId, ip);
  }

  // ==================== 提现管理 ====================

  @Get('withdraw/list')
  @UseGuards(AdminGuard)
  async getWithdrawList(@Query() dto: any) {
    return this.adminService.getWithdrawList(dto);
  }

  @Put('withdraw/:id/review')
  @UseGuards(AdminGuard)
  async reviewWithdraw(@Param('id', ParseIntPipe) id: number, @Body() dto: any, @Req() req: Request) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.reviewWithdraw(id, dto, adminId, ip);
  }

  // ==================== 用户资产管理 ====================

  @Get('user/:id/assets')
  @UseGuards(AdminGuard)
  async getUserAssets(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserAssets(id);
  }

  @Post('user/:id/asset/adjust')
  @UseGuards(AdminGuard)
  async adjustUserAsset(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.adminService.adjustUserAsset(id, dto);
  }

  @Get('asset/logs')
  @UseGuards(AdminGuard)
  async getAssetLogs(@Query() dto: any) {
    return this.adminService.getAssetLogs(dto);
  }

  // ==================== 系统配置 ====================

  @Get('config/list')
  @UseGuards(AdminGuard)
  async getConfigList(@Query() dto: any) {
    return this.adminService.getConfigList(dto);
  }

  @Put('config/:key')
  @UseGuards(AdminGuard)
  async updateConfig(@Param('key') key: string, @Body() dto: any) {
    return this.adminService.updateConfig(key, dto);
  }

  @Post('config/batch')
  @UseGuards(AdminGuard)
  async batchUpdateConfigs(@Body() dto: any) {
    return this.adminService.batchUpdateConfigs(dto.configs || []);
  }

  // ==================== 公告管理 ====================

  @Get('notice/list')
  @UseGuards(AdminGuard)
  async getNoticeList(@Query() dto: any) {
    return this.adminService.getNoticeList(dto);
  }

  @Post('notice')
  @UseGuards(AdminGuard)
  async createNotice(@Body() dto: any) {
    return this.adminService.createNotice(dto);
  }

  @Put('notice/:id')
  @UseGuards(AdminGuard)
  async updateNotice(@Param('id') id: number, @Body() dto: any) {
    return this.adminService.updateNotice(id, dto);
  }

  @Delete('notice/:id')
  @UseGuards(AdminGuard)
  async deleteNotice(@Param('id') id: number) {
    return this.adminService.deleteNotice(id);
  }

  // ==================== 币种链管理 ====================

  @Get('chain/list')
  @UseGuards(AdminGuard)
  async getCoinChainList(@Query('coinId') coinId?: number) {
    return this.adminService.getCoinChainList(coinId);
  }

  @Post('chain')
  @UseGuards(AdminGuard)
  async createCoinChain(@Body() dto: any) {
    return this.adminService.createCoinChain(dto);
  }

  @Put('chain/:id')
  @UseGuards(AdminGuard)
  async updateCoinChain(@Param('id') id: number, @Body() dto: any) {
    return this.adminService.updateCoinChain(id, dto);
  }

  @Delete('chain/:id')
  @UseGuards(AdminGuard)
  async deleteCoinChain(@Param('id') id: number) {
    return this.adminService.deleteCoinChain(id);
  }

  // ==================== 邀请管理 ====================

  @Get('invite/list')
  @UseGuards(AdminGuard)
  async getInviteList(@Query() dto: any) {
    return this.adminService.getInviteList(dto);
  }

  // ==================== 返佣管理 ====================

  @Get('commission/list')
  @UseGuards(AdminGuard)
  async getCommissionList(@Query() dto: any) {
    return this.adminService.getCommissionList(dto);
  }

  // ==================== 操作日志 ====================

  @Get('log/list')
  @UseGuards(AdminGuard)
  async getAdminLogList(@Query() dto: any) {
    return this.adminService.getAdminLogList(dto);
  }

  // ==================== Banner管理 ====================

  @Get('banner/list')
  @UseGuards(AdminGuard)
  async getBannerList(@Query('position') position?: string, @Query('status') status?: string) {
    return this.adminService.getBannerList({
      position,
      status: status !== undefined ? parseInt(status, 10) : undefined,
    });
  }

  @Post('banner')
  @UseGuards(AdminGuard)
  async createBanner(@Body() dto: any) {
    return this.adminService.createBanner(dto);
  }

  @Put('banner/:id')
  @UseGuards(AdminGuard)
  async updateBanner(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.adminService.updateBanner(id, dto);
  }

  @Delete('banner/:id')
  @UseGuards(AdminGuard)
  async deleteBanner(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteBanner(id);
  }

  // ==================== 用户等级管理 ====================

  @Get('level/stats')
  @UseGuards(AdminGuard)
  async getUserLevelStats() {
    return this.adminService.getUserLevelStats();
  }

  @Get('level/users')
  @UseGuards(AdminGuard)
  async getUsersWithLevel(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('level') level?: string,
    @Query('keyword') keyword?: string
  ) {
    return this.adminService.getUsersWithLevel({
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      level: level ? parseInt(level) : undefined,
      keyword
    });
  }

  @Post('level/adjust/:userId')
  @UseGuards(AdminGuard)
  async adjustUserLevel(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: { newLevel: number; reason?: string },
    @Req() req: Request
  ) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    return this.adminService.adjustUserLevel(userId, dto.newLevel, dto.reason, adminId, ip);
  }

  @Get('level/config')
  @UseGuards(AdminGuard)
  async getLevelConfigList() {
    return this.adminService.getLevelConfigList();
  }

  @Put('level/config/:level')
  @UseGuards(AdminGuard)
  async updateLevelConfig(@Param('level', ParseIntPipe) level: number, @Body() dto: any) {
    return this.adminService.updateLevelConfig(level, dto);
  }

  /**
   * 获取用户升级记录
   * GET /api/admin/level/upgrade-logs/:userId
   */
  @Get('level/upgrade-logs/:userId')
  @UseGuards(AdminGuard)
  async getUserUpgradeLogs(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminService.getUserUpgradeLogs(userId);
  }

  // ==================== 邀请记录 ====================

  /**
   * 邀请统计
   * GET /api/admin/invite/stats
   */
  @Get('invite/stats')
  @UseGuards(AdminGuard)
  async getInviteStats() {
    return this.adminService.getInviteStats();
  }

  /**
   * 邀请记录列表
   * GET /api/admin/invite/records
   */
  @Get('invite/records')
  @UseGuards(AdminGuard)
  async getInviteRecords(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('keyword') keyword?: string
  ) {
    return this.adminService.getInviteRecords({
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      keyword
    });
  }

  /**
   * 获取用户邀请详情
   * GET /api/admin/invite/user/:userId
   */
  @Get('invite/user/:userId')
  @UseGuards(AdminGuard)
  async getUserInviteDetail(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminService.getUserInviteDetail(userId);
  }

  // ==================== 登录日志 ====================

  @Get('login-log/list')
  @UseGuards(AdminGuard)
  async getLoginLogList(@Query() dto: any) {
    return this.adminService.getLoginLogList(dto);
  }

  @Get('login-log/stats')
  @UseGuards(AdminGuard)
  async getLoginStats() {
    return this.adminService.getLoginStats();
  }

  @Post('login-log/:id/abnormal')
  @UseGuards(AdminGuard)
  async markAbnormalLogin(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.markAbnormalLogin(id);
  }

  // ==================== 黑名单管理 ====================

  @Get('blacklist/list')
  @UseGuards(AdminGuard)
  async getBlacklistList(@Query() dto: any) {
    return this.adminService.getBlacklistList(dto);
  }

  @Post('blacklist')
  @UseGuards(AdminGuard)
  async addToBlacklist(@Body() dto: any, @Req() req: Request) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const admin = await this.adminService.getAdminById(adminId);
    return this.adminService.addToBlacklist({
      ...dto,
      operatorId: adminId,
      operator: admin?.username || 'admin'
    });
  }

  @Put('blacklist/:id')
  @UseGuards(AdminGuard)
  async updateBlacklist(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.adminService.updateBlacklist(id, dto);
  }

  @Delete('blacklist/:id')
  @UseGuards(AdminGuard)
  async removeFromBlacklist(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.removeFromBlacklist(id);
  }

  // ==================== 风控预警 ====================

  @Get('risk-alert/list')
  @UseGuards(AdminGuard)
  async getRiskAlertList(@Query() dto: any) {
    return this.adminService.getRiskAlertList(dto);
  }

  @Post('risk-alert/:id/process')
  @UseGuards(AdminGuard)
  async processRiskAlert(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { status: string; processNote?: string }
  ) {
    return this.adminService.processRiskAlert(id, dto.status, dto.processNote);
  }

  // ==================== OTC订单管理 ====================

  @Get('otc/orders')
  @UseGuards(AdminGuard)
  async getOtcOrderList(@Query() dto: any) {
    return this.adminService.getOtcOrderList(dto);
  }

  @Get('otc/stats')
  @UseGuards(AdminGuard)
  async getOtcOrderStats() {
    return this.adminService.getOtcOrderStats();
  }

  @Post('otc/:id/appeal')
  @UseGuards(AdminGuard)
  async processOtcAppeal(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { result: string; remark: string }
  ) {
    return this.adminService.processOtcAppeal(id, dto.result, dto.remark);
  }

  @Post('otc/:id/complete')
  @UseGuards(AdminGuard)
  async completeOtcOrder(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.completeOtcOrder(id);
  }

  @Post('otc/:id/cancel')
  @UseGuards(AdminGuard)
  async cancelOtcOrder(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.cancelOtcOrder(id);
  }

  // ==================== 行情配置管理 ====================

  @Get('market/config/list')
  @UseGuards(AdminGuard)
  async getMarketConfigList(@Query() dto: any) {
    return this.adminService.getMarketConfigList(dto);
  }

  @Get('market/metal/list')
  @UseGuards(AdminGuard)
  async getMetalMarketList() {
    return this.adminService.getMetalMarketList();
  }

  @Post('market/config')
  @UseGuards(AdminGuard)
  async createMarketConfig(@Body() dto: any) {
    return this.adminService.createMarketConfig(dto);
  }

  @Put('market/config/:id')
  @UseGuards(AdminGuard)
  async updateMarketConfig(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any
  ) {
    return this.adminService.updateMarketConfig(id, dto);
  }

  @Post('market/sync/:assetType')
  @UseGuards(AdminGuard)
  async syncMarketPrices(@Param('assetType') assetType: string) {
    return this.adminService.syncMarketPrices(assetType);
  }

  // ==================== 菜单配置管理 ====================

  @Get('menu/list')
  @UseGuards(AdminGuard)
  async getAppMenuList(@Query('position') position?: string) {
    return this.adminService.getAppMenuList(position);
  }

  @Post('menu')
  @UseGuards(AdminGuard)
  async createAppMenu(@Body() dto: any) {
    return this.adminService.createAppMenu(dto);
  }

  @Put('menu/:id')
  @UseGuards(AdminGuard)
  async updateAppMenu(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any
  ) {
    return this.adminService.updateAppMenu(id, dto);
  }

  @Delete('menu/:id')
  @UseGuards(AdminGuard)
  async deleteAppMenu(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteAppMenu(id);
  }

  @Post('menu/:id/sort')
  @UseGuards(AdminGuard)
  async sortAppMenu(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { direction: 'up' | 'down' }
  ) {
    return this.adminService.sortAppMenu(id, dto.direction);
  }

  @Post('menu/init')
  @UseGuards(AdminGuard)
  async initDefaultMenus() {
    return this.adminService.initDefaultMenus();
  }

  // ==================== 多语言文案管理 ====================

  @Get('i18n/list')
  @UseGuards(AdminGuard)
  async getI18nTextList(@Query() dto: any) {
    return this.adminService.getI18nTextList(dto);
  }

  @Get('i18n/:id')
  @UseGuards(AdminGuard)
  async getI18nTextDetail(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getI18nTextDetail(id);
  }

  @Post('i18n')
  @UseGuards(AdminGuard)
  async createI18nText(@Body() dto: any) {
    return this.adminService.createI18nText(dto);
  }

  @Put('i18n/:id')
  @UseGuards(AdminGuard)
  async updateI18nText(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any
  ) {
    return this.adminService.updateI18nText(id, dto);
  }

  @Delete('i18n/:id')
  @UseGuards(AdminGuard)
  async deleteI18nText(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteI18nText(id);
  }

  @Get('i18n/export')
  @UseGuards(AdminGuard)
  async exportI18nTexts(@Query('category') category?: string) {
    return this.adminService.exportI18nTexts(category);
  }

  // ==================== 黄金玩法配置 ====================

  @Get('gold-play/:configType')
  @UseGuards(AdminGuard)
  async getGoldPlayConfig(@Param('configType') configType: string) {
    return this.adminService.getGoldPlayConfig(configType);
  }

  @Post('gold-play/:configType')
  @UseGuards(AdminGuard)
  async saveGoldPlayConfig(
    @Param('configType') configType: string,
    @Body() dto: any
  ) {
    return this.adminService.saveGoldPlayConfig(configType, dto);
  }

  // ==================== 权限矩阵配置 ====================

  @Get('permission-matrix')
  @UseGuards(AdminGuard)
  async getPermissionMatrix() {
    return this.adminService.getPermissionMatrix();
  }

  @Post('permission-matrix')
  @UseGuards(AdminGuard)
  async savePermissionMatrix(@Body() dto: any[]) {
    return this.adminService.savePermissionMatrix(dto);
  }

  // ==================== 社交关系管理 ====================

  @Get('social/friends')
  @UseGuards(AdminGuard)
  async getSocialFriends(@Query() dto: any) {
    return this.adminService.getSocialFriends(dto);
  }

  @Post('social/remove-friend')
  @UseGuards(AdminGuard)
  async removeFriend(@Body() dto: { userId: number; friendId: number }) {
    return this.adminService.removeFriend(dto.userId, dto.friendId);
  }

  // ==================== 系统功能开关 ====================

  @Get('system/toggles')
  @UseGuards(AdminGuard)
  async getSystemToggles() {
    return this.adminService.getSystemToggles();
  }

  @Put('system/toggles')
  @UseGuards(AdminGuard)
  async updateSystemToggles(@Body() dto: any) {
    return this.adminService.updateSystemToggles(dto);
  }

  // ==================== 交易对管理 ====================

  @Get('trade/pairs')
  @UseGuards(AdminGuard)
  async getTradePairs(@Query() dto: any) {
    return this.adminService.getTradePairs(dto);
  }

  @Post('trade/pair')
  @UseGuards(AdminGuard)
  async createTradePair(@Body() dto: any) {
    return this.adminService.createTradePair(dto);
  }

  @Put('trade/pair/:id')
  @UseGuards(AdminGuard)
  async updateTradePair(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.adminService.updateTradePair(id, dto);
  }

  @Delete('trade/pair/:id')
  @UseGuards(AdminGuard)
  async deleteTradePair(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteTradePair(id);
  }

  @Get('trade/ieo')
  @UseGuards(AdminGuard)
  async getIeoList(@Query() dto: any) {
    return this.adminService.getIeoList(dto);
  }

  // ==================== 官方发帖管理 ====================

  /**
   * 获取可用的帖子类型
   * GET /api/admin/official-post/types
   */
  @Get('official-post/types')
  @UseGuards(AdminGuard)
  async getOfficialPostTypes() {
    const types = this.officialPostService.getAvailableTypes();
    return { code: 0, msg: 'ok', data: types };
  }

  /**
   * 生成并发布官方帖子
   * POST /api/admin/official-post/publish
   */
  @Post('official-post/publish')
  @UseGuards(AdminGuard)
  async publishOfficialPost(
    @Body() dto: { type: OfficialPostType; customTopic?: string },
    @Req() req: Request
  ) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    
    const result = await this.officialPostService.generateAndPublish(dto.type, dto.customTopic);

    if (result.success) {
      // 记录操作日志
      await this.adminService.logAdminAction(
        adminId,
        '广场管理',
        '发布官方帖子',
        'OfficialPost',
        result.post?.id,
        ip
      );
    }
    
    return {
      code: result.success ? 0 : 1,
      msg: result.success ? '发布成功' : result.error,
      data: result.post
    };
  }

  /**
   * 获取最近的官方帖子
   * GET /api/admin/official-post/recent
   */
  @Get('official-post/recent')
  @UseGuards(AdminGuard)
  async getRecentOfficialPosts(@Query('limit') limit?: number) {
    const posts = await this.officialPostService.getRecentOfficialPosts(limit || 10);
    return { code: 0, msg: 'ok', data: posts };
  }

  // ===== 会员等级管理 =====

  /**
   * 获取所有会员等级配置
   * GET /api/admin/member-levels
   */
  @Get('member-levels')
  @UseGuards(AdminGuard)
  async getMemberLevels() {
    const levels = await this.memberLevelService.getAdminLevels();
    return { code: 0, msg: 'ok', data: levels };
  }

  /**
   * 更新会员等级配置
   * PUT /api/admin/member-levels/:id
   */
  @Put('member-levels/:id')
  @UseGuards(AdminGuard)
  async updateMemberLevel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { 
      name?: string;
      nameEn?: string;
      icon?: string;
      color?: string;
      minRecharge?: string;
      rebateRate?: string;
      feeDiscount?: string;
      benefits?: string;
      isEnabled?: number;
    },
    @Req() req: Request
  ) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    
    const level = await this.memberLevelService.updateLevel(id, dto);
    
    await this.adminService.logAdminAction(
      adminId,
      '会员等级',
      '更新等级配置',
      'MemberLevel',
      id,
      ip
    );
    
    return { code: 0, msg: '更新成功', data: level };
  }

  /**
   * 初始化默认等级配置
   * POST /api/admin/member-levels/init
   */
  @Post('member-levels/init')
  @UseGuards(AdminGuard)
  async initMemberLevels(@Req() req: Request) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    
    await this.memberLevelService.initDefaultLevels();
    
    await this.adminService.logAdminAction(
      adminId,
      '会员等级',
      '初始化等级配置',
      'MemberLevel',
      undefined,
      ip
    );
    
    return { code: 0, msg: '初始化成功' };
  }

  /**
   * 重新计算所有用户等级
   * POST /api/admin/member-levels/recalculate
   */
  @Post('member-levels/recalculate')
  @UseGuards(AdminGuard)
  async recalculateUserLevels(@Req() req: Request) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;
    
    const result = await this.memberLevelService.recalculateAllUserLevels();
    
    await this.adminService.logAdminAction(
      adminId,
      '会员等级',
      '重新计算用户等级',
      'MemberLevel',
      undefined,
      ip
    );
    
    return { code: 0, msg: `已更新 ${result.updated} 个用户等级`, data: result };
  }
}
