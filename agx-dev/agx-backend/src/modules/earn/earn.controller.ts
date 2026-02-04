import { Controller, Get, Post, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/earn')
export class EarnController {
  @Get('overview')
  @UseGuards(JwtAuthGuard)
  async getOverview(@Req() req) {
    return {
      code: 0,
      msg: 'ok',
      data: {
        totalHolding: 0,
        totalEarnings: 0,
        todayEarnings: 0,
        claimableEarnings: 0,
        activationStatus: false,
        agxBalance: 0,
        annualRate: 0.12,
        lastSettleTime: null,
      }
    };
  }

  @Get('records')
  @UseGuards(JwtAuthGuard)
  async getRecords(@Req() req, @Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    return { code: 0, msg: 'ok', data: { list: [], total: 0, page, pageSize } };
  }

  @Post('claim')
  @UseGuards(JwtAuthGuard)
  async claim(@Req() req) {
    return { code: 0, msg: '领取成功', data: { claimedAmount: 0, newBalance: 0 } };
  }
}
