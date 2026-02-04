import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemController } from './system.controller';
import { SystemPublicController } from './system-public.controller';
import { SystemService } from './system.service';
import { SystemToggle, LevelPermission, Config, Notice } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([SystemToggle, LevelPermission, Config, Notice])],
  controllers: [SystemController, SystemPublicController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
