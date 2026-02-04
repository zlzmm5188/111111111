import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoolBonusController } from './pool-bonus.controller';
import { PoolBonusService } from './pool-bonus.service';
import {
  PoolBonusConfig,
  PoolCommissionConfig,
  PoolRepurchaseConfig,
  PoolGlobalConfig,
  PoolHolding,
  PoolProduct,
  User,
  UserLevel,
} from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PoolBonusConfig,
      PoolCommissionConfig,
      PoolRepurchaseConfig,
      PoolGlobalConfig,
      PoolHolding,
      PoolProduct,
      User,
      UserLevel,
    ]),
  ],
  controllers: [PoolBonusController],
  providers: [PoolBonusService],
  exports: [PoolBonusService],
})
export class PoolBonusModule {}
