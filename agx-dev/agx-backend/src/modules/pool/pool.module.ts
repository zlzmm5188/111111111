import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoolController } from './pool.controller';
import { PoolService } from './pool.service';
import { PoolProduct, PoolHolding, PoolIncome, Wallet, Coin, AssetLog, User, CommissionTier, UserInvite, Commission } from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([PoolProduct, PoolHolding, PoolIncome, Wallet, Coin, AssetLog, User, CommissionTier, UserInvite, Commission]),
  ],
  controllers: [PoolController],
  providers: [PoolService],
  exports: [PoolService],
})
export class PoolModule {}