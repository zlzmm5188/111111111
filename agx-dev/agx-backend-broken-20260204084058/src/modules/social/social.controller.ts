import { Controller, Get, Post, Body, Query, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard, AdminGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * 社交模块接口 - 用户端
 */
@Controller('api/user')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // ========== 用户资料 ==========

  @Get('profile/:id')
  async getUserProfile(
    @Param('id', ParseIntPipe) targetId: number,
    @CurrentUser('id') currentUserId?: number,
  ) {
    const data = await this.socialService.getUserProfile(targetId, currentUserId);
    return { code: 0, msg: 'ok', data };
  }

  // ========== 关注功能 ==========

  @Post('follow/:targetId')
  @UseGuards(JwtAuthGuard)
  async follow(
    @CurrentUser('id') userId: number,
    @Param('targetId', ParseIntPipe) targetId: number,
  ) {
    const data = await this.socialService.follow(userId, targetId);
    return { code: 0, msg: '关注成功', data };
  }

  @Post('unfollow/:targetId')
  @UseGuards(JwtAuthGuard)
  async unfollow(
    @CurrentUser('id') userId: number,
    @Param('targetId', ParseIntPipe) targetId: number,
  ) {
    const data = await this.socialService.unfollow(userId, targetId);
    return { code: 0, msg: '取消关注成功', data };
  }

  @Get('following')
  @UseGuards(JwtAuthGuard)
  async getFollowing(
    @CurrentUser('id') userId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const data = await this.socialService.getFollowing(userId, +page, +limit);
    return { code: 0, msg: 'ok', data };
  }

  @Get('followers')
  @UseGuards(JwtAuthGuard)
  async getFollowers(
    @CurrentUser('id') userId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const data = await this.socialService.getFollowers(userId, +page, +limit);
    return { code: 0, msg: 'ok', data };
  }

  // ========== 好友功能 ==========

  @Get('friends')
  @UseGuards(JwtAuthGuard)
  async getFriends(
    @CurrentUser('id') userId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const data = await this.socialService.getFriends(userId, +page, +limit);
    return { code: 0, msg: 'ok', data };
  }

  @Post('friend-request')
  @UseGuards(JwtAuthGuard)
  async sendFriendRequest(
    @CurrentUser('id') userId: number,
    @Body('targetId') targetId: number,
    @Body('message') message?: string,
  ) {
    const data = await this.socialService.sendFriendRequest(userId, targetId, message);
    return { code: 0, msg: '好友请求已发送', data };
  }

  @Get('friend-requests')
  @UseGuards(JwtAuthGuard)
  async getFriendRequests(
    @CurrentUser('id') userId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const data = await this.socialService.getFriendRequests(userId, +page, +limit);
    return { code: 0, msg: 'ok', data };
  }

  @Post('friend-request/:requestId/handle')
  @UseGuards(JwtAuthGuard)
  async handleFriendRequest(
    @CurrentUser('id') userId: number,
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body('accept') accept: boolean,
  ) {
    const data = await this.socialService.handleFriendRequest(userId, requestId, accept);
    return { code: 0, msg: accept ? '已同意好友请求' : '已拒绝好友请求', data };
  }

  // ========== 私聊功能 ==========

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  async getConversations(
    @CurrentUser('id') userId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const data = await this.socialService.getConversations(userId, +page, +limit);
    return { code: 0, msg: 'ok', data };
  }

  @Get('conversations/:conversationId/messages')
  @UseGuards(JwtAuthGuard)
  async getMessages(
    @CurrentUser('id') userId: number,
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    const data = await this.socialService.getMessages(userId, conversationId, +page, +limit);
    return { code: 0, msg: 'ok', data };
  }

  @Post('messages/send')
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @CurrentUser('id') userId: number,
    @Body('receiverId') receiverId: number,
    @Body('content') content: string,
    @Body('msgType') msgType = 1,
  ) {
    const data = await this.socialService.sendMessage(userId, receiverId, content, msgType);
    return { code: 0, msg: '发送成功', data };
  }

  @Post('messages/read/:conversationId')
  @UseGuards(JwtAuthGuard)
  async markMessagesRead(
    @CurrentUser('id') userId: number,
    @Param('conversationId', ParseIntPipe) conversationId: number,
  ) {
    const data = await this.socialService.markMessagesRead(userId, conversationId);
    return { code: 0, msg: '已标记已读', data };
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@CurrentUser('id') userId: number) {
    const data = await this.socialService.getUnreadCount(userId);
    return { code: 0, msg: 'ok', data };
  }
}

/**
 * 社交模块接口 - 管理后台
 */
@Controller('api/admin/social')
@UseGuards(JwtAuthGuard, AdminGuard)
export class SocialAdminController {
  constructor(private readonly socialService: SocialService) {}

  @Get('friends')
  async adminGetFriendRelations(@Query() query) {
    const data = await this.socialService.adminGetFriendRelations(query);
    return { code: 0, msg: 'ok', data };
  }

  @Post('remove-friend')
  async adminRemoveFriend(
    @Body('userAId') userAId: number,
    @Body('userBId') userBId: number,
  ) {
    const data = await this.socialService.adminRemoveFriend(userAId, userBId);
    return { code: 0, msg: '已解除好友关系', data };
  }

  @Post('user/:userId/social-status')
  async adminSetUserSocialStatus(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('status') status: number,
  ) {
    const data = await this.socialService.adminSetUserSocialStatus(userId, status);
    return { code: 0, msg: '已更新社交状态', data };
  }

  @Post('user/:userId/mute')
  async adminMuteUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('until') until?: string,
    @Body('duration') duration?: number,
  ) {
    let muteUntil: Date | null = null;
    
    if (duration !== undefined) {
      // 支持 duration（小时数）: 0或负数表示解除禁言，-1表示永久
      if (duration <= 0) {
        muteUntil = null; // 解除禁言
      } else if (duration === -1) {
        // 永久禁言：设置为100年后
        muteUntil = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
      } else {
        muteUntil = new Date(Date.now() + duration * 60 * 60 * 1000);
      }
    } else if (until) {
      // 兼容原有 until 参数
      muteUntil = new Date(until);
    }
    
    const data = await this.socialService.adminMuteUser(userId, muteUntil);
    return { code: 0, msg: muteUntil ? '已禁言用户' : '已解除禁言', data };
  }

  @Post('user/:userId/can-be-friended')
  async adminSetUserCanBeFriended(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('canBeFriended') canBeFriended: number,
  ) {
    const data = await this.socialService.adminSetUserCanBeFriended(userId, canBeFriended);
    return { code: 0, msg: '已更新好友设置', data };
  }

  @Post('user/:userId/can-chat')
  async adminSetUserCanChat(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('canChat') canChat: number,
  ) {
    const data = await this.socialService.adminSetUserCanChat(userId, canChat);
    return { code: 0, msg: '已更新私聊设置', data };
  }
}
