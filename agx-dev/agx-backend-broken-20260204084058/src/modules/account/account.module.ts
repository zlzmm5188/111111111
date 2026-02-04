import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { MemberLevelService } from './member-level.service';
import { User, Wallet, UserInvite, Coin, Kyc, Recharge, Withdraw, Notice, GoldAccount, InviteReward, AssetLog, Config, MemberLevel, Admin } from '../../entities';
import { LevelBonusLog } from '../../entities/level-bonus-log.entity';
import { AuthModule } from '../auth/auth.module';
import { NotifyModule } from '../notify/notify.module';
import { MarketModule } from '../market/market.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Wallet, UserInvite, Coin, Kyc, Recharge, Withdraw, Notice, GoldAccount, InviteReward, AssetLog, Config, MemberLevel, LevelBonusLog, Admin]),
    AuthModule,
    NotifyModule,
    MarketModule,
  ],
  controllers: [AccountController],
  providers: [AccountService, MemberLevelService],
  exports: [AccountService, MemberLevelService],
})
export class AccountModule {}
