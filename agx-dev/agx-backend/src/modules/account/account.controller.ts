import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/account')
export class AccountController {
  @Post('register')
  register(@Body() body: any) {
    return { code: 0, msg: '注册成功', data: { userId: Date.now() } };
  }

  @Post('login')
  login(@Body() body: any) {
    return { 
      code: 0, 
      msg: '登录成功', 
      data: { 
        token: 'test_token_' + Date.now(),
        user: { id: 1, username: body.username || 'testuser' }
      } 
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return { 
      code: 0, 
      msg: 'ok', 
      data: { 
        id: req.user?.id || 1,
        username: 'testuser',
        email: 'test@example.com'
      } 
    };
  }

    @Get('balance')
  getBalance(@Req() req: any) {
    // 检查是否有用户认证
    const hasAuth = req.user && req.user.id;
    
    if (hasAuth) {
      // 有认证的用户返回正常数据
      return {
        code: 0,
        msg: 'ok',
        data: {
          list: [
            {
              symbol: 'USDT',
              name: 'Tether USD',
              balance: '1000.00',
              usdValue: '1000.00',
              value: '1000.00',
              available: '1000.00',
              amount: '1000.00',
              locked: '0.00',
              icon: '',
              price: '1.00',
              accountType: 'spot',
              currency: 'USDT',
              coin: 'USDT'
            },
            {
              symbol: 'AGX',
              name: 'Ascenda Gold Index',
              balance: '5000.00',
              usdValue: '500.00',
              value: '500.00',
              available: '5000.00',
              amount: '5000.00',
              locked: '0.00',
              icon: '',
              price: '0.10',
              accountType: 'spot',
              currency: 'AGX',
              coin: 'AGX'
            }
          ],
          assets: [
            {
              symbol: 'USDT',
              balance: '1000.00',
              usdValue: '1000.00'
            },
            {
              symbol: 'AGX',
              balance: '5000.00',
              usdValue: '500.00'
            }
          ],
          balances: [
            {
              symbol: 'USDT',
              balance: '1000.00',
              available: '1000.00',
              locked: '0.00'
            },
            {
              symbol: 'AGX',
              balance: '5000.00',
              available: '5000.00',
              locked: '0.00'
            }
          ],
          totalUsdValue: '1500.00',
          spotTotal: '1500.00',
          earnTotal: '0.00',
          contractTotal: '0.00'
        }
      };
    } else {
      // 未登录用户返回0数据
      return {
        code: 0,
        msg: 'ok',
        data: {
          list: [],
          assets: [],
          balances: [],
          totalUsdValue: '0.00',
          spotTotal: '0.00',
          earnTotal: '0.00',
          contractTotal: '0.00'
        }
      };
    }
  }@Get('debug')
  debug() {
    return {
      success: true,
      code: 0,
      message: '系统调试信息',
      data: {
        timestamp: Date.now(),
        issues: [
          { id: 1, name: '实名认证自拍照bug', status: '待修复' },
          { id: 2, name: '个人头像无法更改', status: '待修复' },
          { id: 3, name: '矿机购买扣款问题', status: '待修复' },
          { id: 4, name: 'USDT/AGX价值显示', status: '已修复' },
          { id: 5, name: '邀请关系数据导出', status: '待开发' }
        ],
        system: {
          backend: '运行中',
          frontend: '运行中',
          database: '运行中'
        }
      },
      timestamp: Date.now()
    };
  }

  @Get('test-balance')
  testBalance() {
    return {
      success: true,
      code: 0,
      message: '测试数据',
      data: {
        list: [
          {
            symbol: 'USDT',
            name: 'Tether USD',
            balance: '1000.00',
            usdValue: '1000.00',
            value: '1000.00',
            available: '1000.00',
            amount: '1000.00',
            locked: '0.00',
            icon: '',
            price: '1.00',
            accountType: 'spot',
            currency: 'USDT',
            coin: 'USDT'
          },
          {
            symbol: 'AGX',
            name: 'Ascenda Gold Index',
            balance: '5000.00',
            usdValue: '500.00',
            value: '500.00',
            available: '5000.00',
            amount: '5000.00',
            locked: '0.00',
            icon: '',
            price: '0.10',
            accountType: 'spot',
            currency: 'AGX',
            coin: 'AGX'
          }
        ],
        totalUsdValue: '1500.00'
      },
      timestamp: Date.now()
    };
  }
}
