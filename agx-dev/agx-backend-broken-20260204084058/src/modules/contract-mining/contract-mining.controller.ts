import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/contract-mining')
export class ContractMiningController {
  @Get('pool')
  getPool() {
    return {
      code: 0,
      msg: 'ok',
      data: {
        totalLocked: 1250000,
        apy: 18.5,
        myShare: 0,
        claimableEarnings: 0,
        totalParticipants: 568,
        poolStatus: 'active',
      }
    };
  }

  @Get('my-stakes')
  @UseGuards(JwtAuthGuard)
  getMyStakes(@Req() req: any) {
    return { code: 0, msg: 'ok', data: [] };
  }

  @Post('stake')
  @UseGuards(JwtAuthGuard)
  stake(@Req() req: any, @Body() body: any) {
    return {
      success: true,
      code: 0,
      message: '矿机购买成功',
      data: {
        stakeId: Date.now(),
        coin: body.coin || 'USDT',
        amount: body.amount || 100,
        period: body.period || 30,
        startDate: new Date(),
        endDate: new Date(Date.now() + (body.period || 30) * 24 * 60 * 60 * 1000),
        transactionId: 'TX_' + Date.now()
      },
      timestamp: Date.now()
    };
  }

  @Post('unstake')
  @UseGuards(JwtAuthGuard)
  unstake(@Req() req: any, @Body() body: any) {
    return {
      success: true,
      code: 0,
      message: '解除质押成功',
      data: { returnedAmount: 100, earnings: 15.5 },
      timestamp: Date.now()
    };
  }

  @Post('claim')
  @UseGuards(JwtAuthGuard)
  claim(@Req() req: any) {
    return {
      success: true,
      code: 0,
      message: '收益领取成功',
      data: { claimedAmount: 25.3 },
      timestamp: Date.now()
    };
  }

  @Post('test-stake')
  testStake(@Body() body: any) {
    return {
      success: true,
      code: 0,
      message: '矿机购买测试成功',
      data: {
        stakeId: Date.now(),
        coin: body.coin || 'USDT',
        amount: body.amount || 100,
        period: body.period || 30,
        startDate: new Date(),
        endDate: new Date(Date.now() + (body.period || 30) * 24 * 60 * 60 * 1000),
        transactionId: 'TEST_TX_' + Date.now()
      },
      timestamp: Date.now()
    };
  }
}
