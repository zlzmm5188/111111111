import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Wallet, AssetLog, User, Coin, Recharge, Kyc } from '../../entities';
import { TronMonitorService } from './tron-monitor.service';
import { NotifyModule } from '../notify/notify.module';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Wallet, AssetLog, User, Coin, Recharge, Kyc]),
    ScheduleModule,
    NotifyModule,
    AccountModule,
  ],
  providers: [TronMonitorService],
  exports: [TronMonitorService],
})
export class TronMonitorModule {}

