import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * 空投接口
 * 提供空投活动列表、领取等功能
 */
@Controller('api/airdrop')
export class AirdropController {
  /**
   * 获取空投列表
   * GET /api/airdrop/list
   */
  @Get('list')
  @UseGuards(JwtAuthGuard)
  async getList(@Request() req: any) {
    return {
      success: true,
      data: {
        active: [],
        upcoming: [],
        history: [],
        stats: {
          totalRewards: 0,
          completedTasks: 0,
          claimCount: 0
        }
      }
    };
  }

  /**
   * 获取空投活动
   * GET /api/airdrop/events
   */
  @Get('events')
  @UseGuards(JwtAuthGuard)
  async getEvents(@Request() req: any) {
    return {
      success: true,
      data: {
        list: []
      }
    };
  }

  /**
   * 领取空投
   * POST /api/airdrop/claim
   */
  @Post('claim')
  @UseGuards(JwtAuthGuard)
  async claim(@Body() body: { id: number }, @Request() req: any) {
    return {
      success: false,
      message: '暂无可领取的空投'
    };
  }

  /**
   * 获取领取历史
   * GET /api/airdrop/history
   */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(@Request() req: any) {
    return {
      success: true,
      data: {
        list: []
      }
    };
  }
}
