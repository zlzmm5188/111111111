import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramNotifyService } from './notify.service';

@Module({
  imports: [ConfigModule],
  providers: [TelegramNotifyService],
  exports: [TelegramNotifyService],
})
export class NotifyModule {}
