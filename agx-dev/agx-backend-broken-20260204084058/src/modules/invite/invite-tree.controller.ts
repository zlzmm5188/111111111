import { Controller, Get, Query, Request } from '@nestjs/common';
import { InviteService } from './invite.service';

/**
 * 邀请关系树形图接口
 */
@Controller('api/invite/tree')
export class InviteTreeController {
  constructor(private readonly inviteService: InviteService) {}

  /**
   * 获取邀请关系树形图数据
   * GET /api/invite/tree/data?userId=1&maxDepth=5
   */
  @Get('data')
  async getInviteTree(
    @Request() req: any,
    @Query('userId') userId?: string,
    @Query('maxDepth') maxDepth: string = '3',
  ) {
    try {
      const userIdNum = userId ? parseInt(userId, 10) : undefined;
      const maxDepthNum = parseInt(maxDepth, 10) || 3;
      // 如果没有指定 userId，获取系统根节点（所有顶级用户）
      const treeData = await this.inviteService.getAdminInviteTree(userIdNum, maxDepthNum);
      return { code: 0, msg: 'ok', data: treeData };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 搜索用户
   * GET /api/invite/tree/search?keyword=xxx
   */
  @Get('search')
  async searchUsers(
    @Request() req: any,
    @Query('keyword') keyword: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ) {
    if (!keyword) {
      return { code: 1001, msg: '关键词不能为空', data: null };
    }

    try {
      const pageNum = parseInt(page, 10) || 1;
      const pageSizeNum = parseInt(pageSize, 10) || 20;
      const users = await this.inviteService.searchUsers(keyword, pageNum, pageSizeNum);
      return { code: 0, msg: 'ok', data: users };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 获取邀请统计
   * GET /api/invite/tree/stats
   */
  @Get('stats')
  async getInviteStats(
    @Request() req: any,
    @Query('userId') userId: string,
  ) {
    try {
      const userIdNum = parseInt(userId, 10);
      const stats = await this.inviteService.getAdminInviteStats(userIdNum);
      return { code: 0, msg: 'ok', data: stats };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 获取邀请关系用户列表
   * GET /api/invite/tree/users?page=1&pageSize=15&keyword=xxx
   */
  @Get('users')
  async getInviteUsers(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '15',
    @Query('keyword') keyword: string,
  ) {
    try {
      const pageNum = parseInt(page, 10) || 1;
      const pageSizeNum = parseInt(pageSize, 10) || 15;
      const result = await this.inviteService.getAdminUserList(pageNum, pageSizeNum, keyword);
      return { code: 0, msg: 'ok', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }


  /**
   * 获取增强版用户列表（包含余额、KYC、矿机仓位）
   * GET /api/invite/tree/users-detail?page=1&pageSize=15&keyword=xxx&inviterId=123
   */
  @Get('users-detail')
  async getInviteUsersWithDetails(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '15',
    @Query('keyword') keyword: string,
    @Query('inviterId') inviterId: string,
  ) {
    try {
      const pageNum = parseInt(page, 10) || 1;
      const pageSizeNum = parseInt(pageSize, 10) || 15;
      const inviterIdNum = inviterId ? parseInt(inviterId, 10) : undefined;
      const result = await this.inviteService.getAdminUserListWithDetails(pageNum, pageSizeNum, keyword, inviterIdNum);
      return { code: 0, msg: 'ok', data: result };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

  /**
   * 导出邀请关系用户数据（CSV格式）
   * GET /api/invite/tree/export?keyword=xxx&inviterId=123
   */
  @Get('export')
  async exportInviteUsers(
    @Request() req: any,
    @Query('keyword') keyword: string,
    @Query('inviterId') inviterId: string,
  ) {
    try {
      const inviterIdNum = inviterId ? parseInt(inviterId, 10) : undefined;
      const data = await this.inviteService.exportInviteUsers(keyword, inviterIdNum);
      
      // 返回CSV格式数据
      const headers = ['UID', '用户名', '真实姓名', 'VIP等级', 'USDT余额', 'AGX余额', '直推人数', '团队人数', '累计充值', '累计提现', '矿机仓位', '注册时间'];
      const rows = data.map(item => [
        item.uid,
        item.username,
        item.realName,
        item.vipLevel,
        item.usdtBalance,
        item.agxBalance,
        item.directCount,
        item.teamCount,
        item.recharge,
        item.withdraw,
        item.poolPosition,
        item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : ''
      ]);
      
      return { 
        code: 0, 
        msg: 'ok', 
        data: {
          headers,
          rows,
          total: data.length
        }
      };
    } catch (error) {
      return { code: 1001, msg: error.message, data: null };
    }
  }

}
