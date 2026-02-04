import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoolController } from './pool.controller';
import { PoolService } from './pool.service';
import { PoolProduct, PoolHolding, PoolIncome, Wallet, Coin, AssetLog, User, CommissionTier, UserInvite, Commission } from '../../entities';
import { InviteModule } from '../invite/invite.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PoolProduct, PoolHolding, PoolIncome, Wallet, Coin, AssetLog, User, CommissionTier, UserInvite, Commission]),
    forwardRef(() => InviteModule),
  ],
  controllers: [PoolController],
  providers: [PoolService],
  exports: [PoolService],
})
export class PoolModule {}