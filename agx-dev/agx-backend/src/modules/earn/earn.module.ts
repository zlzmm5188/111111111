import { Module } from '@nestjs/common';
import { EarnController } from './earn.controller';

@Module({
  controllers: [EarnController],
  providers: [],
  exports: [],
})
export class EarnModule {}
