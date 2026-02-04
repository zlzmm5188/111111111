import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HedraService } from './hedra.service';
import { HedraController } from './hedra.controller';

@Module({
  imports: [ConfigModule],
  controllers: [HedraController],
  providers: [HedraService],
  exports: [HedraService]
})
export class HedraModule {}
