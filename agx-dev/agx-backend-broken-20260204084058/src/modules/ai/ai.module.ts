import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { WriterController } from './writer.controller';
import { WriterService } from './writer.service';
import { ClaudeController } from './claude.controller';
import { ClaudeService } from './claude.service';
import { User } from '../../entities/user.entity';
import { Wallet } from '../../entities/wallet.entity';
import { PoolHolding } from '../../entities/pool-holding.entity';
import { AssetLog } from '../../entities/asset-log.entity';
import { Kyc } from '../../entities/kyc.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Wallet, PoolHolding, AssetLog, Kyc]),
  ],
  controllers: [AiController, AgentController, WriterController, ClaudeController],
  providers: [AiService, AgentService, WriterService, ClaudeService],
  exports: [AiService, AgentService, WriterService, ClaudeService],
})
export class AiModule {}
