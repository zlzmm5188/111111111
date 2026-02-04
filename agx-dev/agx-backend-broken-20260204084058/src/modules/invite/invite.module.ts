import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteController } from './invite.controller';
import { InviteTreeController } from './invite-tree.controller';
import { InviteService } from './invite.service';
import { ValidPositionService } from './services/valid-position.service';
import { WalletModule } from '../wallet/wallet.module';
import { AuthModule } from '../auth/auth.module';
import {
  User, UserInvite, UserLevel, InviteReward, Commission, Rank, Recharge, Withdraw,
  CommissionTier, InviteBonusTier, InviteBonusRecord, MemberLevel, UserProductCommissionStats,
  UserTask, Kyc, Wallet
} from '../../entities';
import { PoolHolding } from '../../entities/pool-holding.entity';
import { PoolProduct } from '../../entities/pool-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, UserInvite, UserLevel, InviteReward, Commission, Rank, Recharge, Withdraw,
      CommissionTier, InviteBonusTier, InviteBonusRecord, MemberLevel, UserProductCommissionStats,
      PoolHolding, PoolProduct, UserTask, Kyc, Wallet
    ]),
    WalletModule,
    AuthModule,
  ],
  controllers: [InviteController, InviteTreeController],
  providers: [InviteService, ValidPositionService],
  exports: [InviteService, ValidPositionService],
})
export class InviteModule {}