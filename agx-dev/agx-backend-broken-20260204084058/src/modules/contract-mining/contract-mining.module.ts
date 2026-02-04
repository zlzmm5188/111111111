import { Module } from '@nestjs/common';
import { ContractMiningController } from './contract-mining.controller';

@Module({
  controllers: [ContractMiningController],
  providers: [],
  exports: [],
})
export class ContractMiningModule {}
