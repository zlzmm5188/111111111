import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { NewcomerTask, UserTask, User, Wallet } from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([NewcomerTask, UserTask, User, Wallet]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
