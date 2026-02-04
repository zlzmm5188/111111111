import { Controller, Get, Put, Query, Body, Request, UnauthorizedException } from '@nestjs/common';
import { InviteService } from './invite.service';
import { JwtService } from '@nestjs/jwt';

/**
 * 邀请与等级接口
 */
@Controller('api/invite')
export class InviteController {
  constructor(
    private readonly inviteService: InviteService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * 从请求中提取用户ID
   */
  private extractUserId(req: any): number | null {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }

      const token = authHeader.substring(7);
      const payload = this.jwtService.verify(token);
      return payload.sub || payload.userId;
    } catch (e) {
      return null;
    }
  }

  /**
   * 获取邀请信息
   * GET /api/invite/info
   */
  @Get('info')
  async getInviteInfo(@Request() req: any) {
    const userId = this.extractUserId(req);
    if (!userId) {
      return { code: 1002, msg: '请先登录', data: null };
    }
    const info = await this.inviteService.getInviteInfo(userId);
    return { code: 0, msg: 'ok', data: info };
  }

  /**
   * 获取邀请记录
   * GET /api/invite/records?page=1&pageSize=20&level=1
   */
  @Get('records')
  async getInviteRecords(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('level') level?: string,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      return { code: 1002, msg: '请先登录', data: null };
    }
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 20;
    const levelNum = level ? parseInt(level, 10) : undefined;
    const result = await this.inviteService.getInviteRecords(userId, pageNum, pageSizeNum, levelNum);
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 获取返佣记录
   * GET /api/invite/commissions?page=1&pageSize=20
   */
  @Get('commissions')
  async getCommissionRecords(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ) {
    const userId = req.user?.id;
    if (!userId) {
      return { code: 1002, msg: '请先登录', data: null };
    }
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 20;
    const result = await this.inviteService.getCommissionRecords(userId, pageNum, pageSizeNum);
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 获取返佣信息（新增接口）
   * GET /api/invite/commission-info
   *
   * 返回用户的返佣相关信息，包括：
   * - 有效建仓好友数
   * - 当前返佣比例
   * - 下一档所需人数
   * - 等级信息
   * - 累计返佣
   */
  @Get('commission-info')
  async getCommissionInfo(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      return { code: 1002, msg: '请先登录', data: null };
    }
    const result = await this.inviteService.getCommissionInfo(userId);
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 获取等级配置
   * GET /api/invite/levels
   */
  @Get('levels')
  async getLevels() {
    const levels = await this.inviteService.getAllLevels();
    return { code: 0, msg: 'ok', data: { list: levels } };
  }

  /**
   * 获取排行榜
   * GET /api/invite/rank?type=profit&range=week&page=1&pageSize=50
   */
  @Get('rank')
  async getRankList(
    @Query('type') rankType: string = 'profit',
    @Query('range') timeRange: string = 'week',
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '50',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 50;
    const list = await this.inviteService.getRankList(rankType, timeRange, pageNum, pageSizeNum);
    return { code: 0, msg: 'ok', data: { list } };
  }

  /**
   * 获取我的排名
   * GET /api/invite/myrank?type=profit&range=week
   */
  @Get('myrank')
  async getMyRank(
    @Request() req: any,
    @Query('type') rankType: string = 'profit',
    @Query('range') timeRange: string = 'week',
  ) {
    const userId = req.user?.id;
    if (!userId) {
      return { code: 0, msg: 'ok', data: { position: 999, value: '0' } };
    }
    const rank = await this.inviteService.getUserRank(userId, rankType, timeRange);
    return { code: 0, msg: 'ok', data: rank };
  }

  // ========== 管理后台 - 邀请关系树 ==========

  /**
   * 获取邀请关系树形数据
   * GET /api/invite/tree/data?maxDepth=5
   */
  @Get('tree/data')
  async getInviteTreeData(@Query('maxDepth') maxDepth: number = 5) {
    const treeData = await this.inviteService.getGlobalInviteTreeData(maxDepth);
    return { code: 0, msg: 'ok', data: treeData };
  }

  /**
   * 获取邀请统计数据
   * GET /api/invite/tree/stats?userId=
   */
  @Get('tree/stats')
  async getInviteTreeStats(@Query('userId') userId?: number) {
    const stats = await this.inviteService.getInviteTreeStats(userId);
    return { code: 0, msg: 'ok', data: stats };
  }

  /**
   * 搜索邀请用户及其所有下级
   * GET /api/invite/tree/search?keyword=
   */
  @Get('tree/search')
  async searchInviteUser(@Query('keyword') keyword: string) {
    const result = await this.inviteService.searchInviteUser(keyword);
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 导出邀请关系下级用户数据
   * GET /api/invite/tree/export?keyword=
   */
  @Get('tree/export')
  async exportInviteUsers(@Query('keyword') keyword: string) {
    const result = await this.inviteService.searchInviteUser(keyword);
    
    if (!result.list || result.list.length === 0) {
      return { code: 1, msg: '未找到匹配的用户或该用户没有下级', data: null };
    }

    // 转换为导出格式
    const exportData = result.list.map(user => ({
      姓名: user.realName || user.nickname || user.username,
      用户名: user.username,
      'VIP等级': this.getLevelName(user.level),
      'USDT余额': user.usdtBalance,
      'AGX余额': user.agxBalance,
      累计充值金额: user.totalRecharge,
      累计提现金额: user.totalWithdraw,
      当前矿机持仓金额: user.currentHolding,
      累计矿机建仓金额: user.totalHolding,
      推荐人姓名: user.inviter ? (user.inviter.realName || user.inviter.nickname || user.inviter.username) : '-',
      推荐人用户名: user.inviter ? user.inviter.username : '-',
    }));

    return { code: 0, msg: 'ok', data: exportData };
  }

  /**
   * 获取等级名称
   */
  private getLevelName(level: number): string {
    const levelMap = {
      0: 'V0-启蒙会员',
      2: 'V2-优选会员',
      3: 'V3-资本合伙人',
      4: 'V4-执行官合伙人',
      5: 'V5-主权合伙人',
    };
    return levelMap[level] || 'V1-准入会员';
  }

  /**
   * 获取邀请用户列表
   * GET /api/invite/tree/users?page=1&pageSize=15&keyword=
   */
  @Get('tree/users')
  async getInviteUserList(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '15',
    @Query('keyword') keyword?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 15;
    const result = await this.inviteService.getInviteUserList(pageNum, pageSizeNum, keyword);
    return { code: 0, msg: 'ok', data: result };
  }

  // ========== 激励体系配置 ==========

  /**
   * 获取返佣阶梯配置
   * GET /api/invite/commission-tiers
   */
  @Get('commission-tiers')
  async getCommissionTiers() {
    const tiers = await this.inviteService.getCommissionTiers();
    return { code: 0, msg: 'ok', data: tiers };
  }

  /**
   * 获取双向奖励配置
   * GET /api/invite/bonus-tiers
   */
  @Get('bonus-tiers')
  async getInviteBonusTiers() {
    const tiers = await this.inviteService.getInviteBonusTiers();
    return { code: 0, msg: 'ok', data: tiers };
  }

  /**
   * 获取会员等级配置
   * GET /api/invite/member-levels
   */
  @Get('member-levels')
  async getMemberLevels() {
    const levels = await this.inviteService.getMemberLevels();
    return { code: 0, msg: 'ok', data: levels };
  }

  /**
   * 保存返佣阶梯配置
   * PUT /api/invite/commission-tiers
   */
  @Put('commission-tiers')
  async saveCommissionTiers(@Body() body: { tiers: any[] }) {
    await this.inviteService.saveCommissionTiers(body.tiers);
    return { code: 0, msg: 'ok', data: null };
  }

  /**
   * 保存双向奖励配置
   * PUT /api/invite/bonus-tiers
   */
  @Put('bonus-tiers')
  async saveInviteBonusTiers(@Body() body: { tiers: any[] }) {
    await this.inviteService.saveInviteBonusTiers(body.tiers);
    return { code: 0, msg: 'ok', data: null };
  }

  /**
   * 保存会员等级配置
   * PUT /api/invite/member-levels
   */
  @Put('member-levels')
  async saveMemberLevels(@Body() body: { levels: any[] }) {
    await this.inviteService.saveMemberLevels(body.levels);
    return { code: 0, msg: 'ok', data: null };
  }

  // ========== 按产品返佣和双向奖励 ==========

  /**
   * 获取按产品的返佣统计
   * GET /api/invite/commission-by-product
   */
  @Get('commission-by-product')
  async getCommissionByProduct(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      return { code: 1002, msg: '请先登录', data: null };
    }
    const result = await this.inviteService.getCommissionByProduct(userId);
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 获取双向奖励统计
   * GET /api/invite/bonus-stats
   */
  @Get('bonus-stats')
  async getBonusStats(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      return { code: 1002, msg: '请先登录', data: null };
    }
    const result = await this.inviteService.getBonusStats(userId);
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 获取双向奖励记录
   * GET /api/invite/bonus-records?page=1&pageSize=20
   */
  @Get('bonus-records')
  async getBonusRecords(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ) {
    const userId = req.user?.id;
    if (!userId) {
      return { code: 1002, msg: '请先登录', data: null };
    }
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 20;
    const result = await this.inviteService.getBonusRecords(userId, pageNum, pageSizeNum);
    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 根据邀请码获取邀请人信息（公开接口，用于落地页）
   * GET /api/invite/inviter?code=xxx
   */
  @Get('inviter')
  async getInviterByCode(@Query('code') code: string) {
    const result = await this.inviteService.getInviterByCode(code);
    return { code: 0, msg: 'ok', data: result };
  }
}