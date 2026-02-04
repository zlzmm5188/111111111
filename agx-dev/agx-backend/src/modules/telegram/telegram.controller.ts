import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(private readonly telegramService: TelegramService) {}

  @Get('info')
  async getBotInfo() {
    try {
      const botInfo = await this.telegramService.getBotInfo();
      return {
        success: true,
        data: botInfo,
      };
    } catch (error) {
      this.logger.error(`Failed to get bot info: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('send/:groupId')
  async sendMessage(
    @Param('groupId') groupId: string,
    @Body() body: { message: string },
  ) {
    try {
      await this.telegramService.sendToGroup(groupId, body.message);
      return {
        success: true,
        message: 'Message sent successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to send message: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
