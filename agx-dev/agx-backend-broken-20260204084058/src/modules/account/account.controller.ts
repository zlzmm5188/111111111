import { Controller, Get, Post, Put, Body, UseGuards, Req, Query, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountService } from './account.service';
import { MemberLevelService } from './member-level.service';
import { RegisterDto, LoginDto, ChangePasswordDto, UpdateProfileDto, SubmitKycDto, WithdrawDto, GetDepositAddressDto } from './account.dto';

@Controller('api/account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly memberLevelService: MemberLevelService,
  ) {}

  // ==================== 认证相关 ====================

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const data = await this.accountService.register(dto);
    return { code: 0, msg: '注册成功', data };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: any) {
    const ip = req.ip || req.connection?.remoteAddress;
    const data = await this.accountService.login(dto, ip);
    return { code: 0, msg: '登录成功', data };
  }

  @Post('check-username')
  async checkUsername(@Body() body: { username: string }, @Req() req: any) {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const result = await this.accountService.verifyUsernameForPasswordReset(body.username, ip);
    return { code: 0, msg: 'ok', data: result };
  }

  @Post('verify-identity')
  async verifyIdentity(@Body() body: { username?: string; idNumber: string }, @Req() req: any) {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const result = await this.accountService.verifyIdentityForPasswordReset(body.idNumber, ip);
    return { code: 0, msg: 'ok', data: result };
  }

  // ==================== 用户信息 ====================

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    const data = await this.accountService.getProfile(req.user.id);
    return { code: 0, msg: 'ok', data };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const data = await this.accountService.updateProfile(req.user.id, dto);
    return { code: 0, msg: '更新成功', data };
  }

  // ==================== 资产相关 ====================

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  async getBalance(@Req() req: any) {
    const data = await this.accountService.getBalance(req.user.id);
    return { code: 0, msg: 'ok', data };
  }

  @Get('assets/overview')
  @UseGuards(JwtAuthGuard)
  async getAssetsOverview(@Req() req: any) {
    const data = await this.accountService.getAssetsOverview(req.user.id);
    return { code: 0, msg: 'ok', data };
  }

  @Get('asset/logs')
  @UseGuards(JwtAuthGuard)
  async getAssetLogs(@Req() req: any, @Query() query: any) {
    const data = await this.accountService.getAssetLogs(req.user.id, query);
    return { code: 0, msg: 'ok', data };
  }

  // ==================== 充值相关 ====================

  @Get('deposit/address')
  @UseGuards(JwtAuthGuard)
  async getDepositAddress(@Req() req: any, @Query() dto: GetDepositAddressDto) {
    const data = await this.accountService.getDepositAddress(req.user.id, dto);
    return { code: 0, msg: 'ok', data };
  }

  @Post('deposit/order')
  @UseGuards(JwtAuthGuard)
  async createDepositOrder(@Req() req: any, @Body() dto: any) {
    const data = await this.accountService.createDepositOrder(req.user.id, dto);
    return { code: 0, msg: '订单创建成功', data };
  }

  @Get('deposit/order/:orderNo')
  @UseGuards(JwtAuthGuard)
  async getDepositOrderStatus(@Req() req: any, @Param('orderNo') orderNo: string) {
    const data = await this.accountService.getDepositOrderStatus(req.user.id, orderNo);
    return { code: 0, msg: 'ok', data };
  }

  @Get('deposit/history')
  @UseGuards(JwtAuthGuard)
  async getDepositHistory(@Req() req: any, @Query() query: any) {
    const data = await this.accountService.getDepositHistory(req.user.id, query);
    return { code: 0, msg: 'ok', data };
  }

  // ==================== 提现相关 ====================

  @Get('withdraw/config')
  @UseGuards(JwtAuthGuard)
  async getWithdrawConfig() {
    const data = await this.accountService.getWithdrawConfig();
    return { code: 0, msg: 'ok', data };
  }

  @Post('withdraw')
  @UseGuards(JwtAuthGuard)
  async withdraw(@Req() req: any, @Body() dto: WithdrawDto) {
    const data = await this.accountService.withdraw(req.user.id, dto);
    return { code: 0, msg: '提现申请已提交', data };
  }

  @Get('withdraw/history')
  @UseGuards(JwtAuthGuard)
  async getWithdrawHistory(@Req() req: any, @Query() query: any) {
    const data = await this.accountService.getWithdrawHistory(req.user.id, query);
    return { code: 0, msg: 'ok', data };
  }

  // ==================== KYC相关 ====================

  @Get('kyc')
  @UseGuards(JwtAuthGuard)
  async getKycStatus(@Req() req: any) {
    const data = await this.accountService.getKycStatus(req.user.id);
    return { code: 0, msg: 'ok', data };
  }

  @Post('kyc')
  @UseGuards(JwtAuthGuard)
  async submitKyc(@Req() req: any, @Body() dto: SubmitKycDto) {
    const data = await this.accountService.submitKyc(req.user.id, dto);
    return { code: 0, msg: '提交成功，等待审核', data };
  }

  // ==================== 邀请相关 ====================

  @Get('invites')
  @UseGuards(JwtAuthGuard)
  async getInvites(@Req() req: any, @Query() query: any) {
    const data = await this.accountService.getInviteList(req.user.id, query);
    return { code: 0, msg: 'ok', data };
  }

  @Get('invite/stats')
  @UseGuards(JwtAuthGuard)
  async getInviteStats(@Req() req: any) {
    const data = await this.accountService.getInviteStats(req.user.id);
    return { code: 0, msg: 'ok', data };
  }

  // ==================== 会员等级 ====================

  @Get('member-levels')
  async getMemberLevels() {
    const data = await this.memberLevelService.getAllLevels();
    return { code: 0, msg: 'ok', data };
  }

  @Get('my-level')
  @UseGuards(JwtAuthGuard)
  async getMyLevel(@Req() req: any) {
    const data = await this.memberLevelService.getUserLevelInfo(req.user.id);
    return { code: 0, msg: 'ok', data };
  }

  // ==================== 通知相关 ====================

  @Get('notices')
  async getNotices() {
    const data = await this.accountService.getActiveNotices();
    return { code: 0, msg: 'ok', data };
  }

  // ==================== 密码相关 ====================

  @Post('password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    await this.accountService.changePassword(req.user.id, dto);
    return { code: 0, msg: '密码修改成功' };
  }

  // ==================== 交易密码 ====================

  @Get('trade-password/status')
  @UseGuards(JwtAuthGuard)
  async getTradePasswordStatus(@Req() req: any) {
    const data = await this.accountService.getTradePasswordStatus(req.user.id);
    return { code: 0, msg: 'ok', data };
  }

  @Post('trade-password')
  @UseGuards(JwtAuthGuard)
  async setTradePassword(@Req() req: any, @Body() dto: { tradePassword: string; loginPassword?: string }) {
    await this.accountService.setTradePassword(req.user.id, dto);
    return { code: 0, msg: '交易密码设置成功' };
  }

  @Put('trade-password')
  @UseGuards(JwtAuthGuard)
  async changeTradePassword(@Req() req: any, @Body() dto: { oldTradePassword: string; newTradePassword: string }) {
    await this.accountService.changeTradePassword(req.user.id, dto);
    return { code: 0, msg: '交易密码修改成功' };
  }

  @Post('trade-password/verify')
  @UseGuards(JwtAuthGuard)
  async verifyTradePassword(@Req() req: any, @Body() dto: { tradePassword: string }) {
    const data = await this.accountService.verifyTradePassword(req.user.id, dto);
    return { code: 0, msg: 'ok', data };
  }
}
