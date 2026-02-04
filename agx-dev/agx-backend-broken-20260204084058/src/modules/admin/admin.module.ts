import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminV2Controller } from './admin-v2.controller';
import { AdminService } from './admin.service';
import { Admin, Coin, CoinChain, User, UserInvite, PoolProduct, ContractConfig, PoolHolding, ContractOrder, Kyc, Recharge, Withdraw, AssetLog, Config, Wallet, Notice, Commission, AdminLog, Banner, UserLevel, LoginLog, Blacklist, RiskAlert, OtcOrder, MarketConfig, AppMenu, I18nText, MemberLevel, CoinIssue } from '../../entities';
import { LevelBonusLog } from '../../entities/level-bonus-log.entity';
import { AuthModule } from '../auth/auth.module';
import { MarketModule } from '../market/market.module';
import { NotifyModule } from '../notify/notify.module';
import { SquareModule } from '../square/square.module';
import { InviteModule } from '../invite/invite.module';
import { AccountModule } from '../account/account.module';

import { HoldingManagementController } from './holding-management.controller';
import { HoldingManagementService } from './holding-management.service';
import { ExchangeRecordService } from './exchange-record.service';
import { ExchangeController } from './exchange.controller';
import { FinancialProductController } from './financial-product.controller';
import { CoinIssueService } from './coin-issue.service';
import { PoolProductService } from './pool-product.service';
import { HoldingConfig, HoldingDistribution, GoldAccount, ExchangeRecord, OperationLog } from '../../entities';
import { OperationLogService } from '../../common/services/operation-log.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Coin, CoinChain, User, UserInvite, PoolProduct, ContractConfig, PoolHolding, ContractOrder, Kyc, Recharge, Withdraw, AssetLog, Config, Wallet, Notice, Commission, AdminLog, Banner, UserLevel, LoginLog, Blacklist, RiskAlert, OtcOrder, MarketConfig, AppMenu, I18nText, MemberLevel, CoinIssue, LevelBonusLog, HoldingConfig, HoldingDistribution, GoldAccount, ExchangeRecord, OperationLog]),
    AuthModule,
    NotifyModule,
    SquareModule,
    InviteModule,
    AccountModule,
    MarketModule,
  ],
  controllers: [AdminController, AdminV2Controller, HoldingManagementController, ExchangeController, FinancialProductController],
  providers: [AdminService, HoldingManagementService, ExchangeRecordService, OperationLogService, CoinIssueService, PoolProductService],
  exports: [AdminService],
})
export class AdminModule implements OnModuleInit {
  constructor(private readonly adminService: AdminService) {}

  async onModuleInit() {
    // 确保默认管理员存在
    await this.adminService.ensureDefaultAdmin();
  }
}
