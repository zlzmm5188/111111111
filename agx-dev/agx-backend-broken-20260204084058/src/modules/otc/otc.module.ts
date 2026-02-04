import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtcController } from './otc.controller';
import { OtcService } from './otc.service';
import { OtcOrder, OtcAdvertisement, User, Wallet } from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([OtcOrder, OtcAdvertisement, User, Wallet]),
  ],
  controllers: [OtcController],
  providers: [OtcService],
  exports: [OtcService],
})
export class OtcModule {}
