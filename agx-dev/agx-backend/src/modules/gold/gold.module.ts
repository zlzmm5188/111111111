import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoldController } from './gold.controller';
import { GoldService } from './gold.service';
import { GoldPriceService } from './gold-price.service';
import { GoldPrice, Config, GoldProduct, GoldAccount, GoldHolding, Wallet, GoldSettlement, DailySnapshot, HoldingConfig, Coin } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([GoldPrice, Config, GoldProduct, GoldAccount, GoldHolding, Wallet, GoldSettlement, DailySnapshot, HoldingConfig, Coin])],
  controllers: [GoldController],
  providers: [GoldService, GoldPriceService],
  exports: [GoldService, GoldPriceService],
})
export class GoldModule {}