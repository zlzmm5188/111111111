import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { ContractSettlementService } from './contract-settlement.service';
import { ContractGateway } from './contract.gateway';
import { ContractConfig, ContractOrder, Wallet, Coin, GoldAccount, GoldSettlement, AssetLog, Commission, User, UserInvite } from '../../entities';
import { GoldModule } from '../gold/gold.module';
import { WalletModule } from '../wallet/wallet.module';
import { InviteModule } from '../invite/invite.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContractConfig, ContractOrder, Wallet, Coin, GoldAccount, GoldSettlement, AssetLog, Commission, User, UserInvite]),
    forwardRef(() => GoldModule),
    WalletModule,
    forwardRef(() => InviteModule),
  ],
  controllers: [ContractController],
  providers: [ContractService, ContractSettlementService, ContractGateway],
  exports: [ContractService],
})
export class ContractModule {}