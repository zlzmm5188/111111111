import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '../../entities/wallet.entity';
import { AssetLog } from '../../entities/asset-log.entity';
import { Coin } from '../../entities/coin.entity';
import { AssetService } from './services/asset.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, AssetLog, Coin])],
  providers: [AssetService],
  exports: [AssetService],
})
export class WalletModule {}
