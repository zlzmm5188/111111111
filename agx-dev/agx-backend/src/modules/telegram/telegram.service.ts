import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import { Anthropic } from '@anthropic-ai/sdk';

interface TelegramMessage {
  groupId: string;
  groupName: string;
  userId: string;
  userName: string;
  message: string;
  messageId: number;
}

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Telegraf;
  private anthropic: Anthropic;
  private allowedGroupIds: string[];

  constructor(private configService: ConfigService) {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    const allowedGroups = this.configService.get<string>('TELEGRAM_ALLOWED_GROUPS', '');

    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is required');
    }

    if (!anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }

    this.bot = new Telegraf(botToken);
    this.anthropic = new Anthropic({ apiKey: anthropicKey });
    this.allowedGroupIds = allowedGroups.split(',').map(id => id.trim()).filter(Boolean);

    this.logger.log(`Telegram Bot initialized with allowed groups: ${this.allowedGroupIds.join(', ') || 'all groups'}`);
  }

  async onModuleInit() {
    await this.setupBotHandlers();
    this.logger.log('Telegram Bot started and listening for messages');
  }

  async onModuleDestroy() {
    // Telegraf doesn't have a proper shutdown method in all versions
    // But we can stop polling if needed
    this.logger.log('Telegram Bot stopped');
  }

  private async setupBotHandlers() {
    // Handle messages in groups
    this.bot.on('message', async (ctx) => {
      try {
        await this.handleMessage(ctx);
      } catch (error) {
        this.logger.error(`Error handling message: ${error.message}`, error.stack);
        await ctx.reply('抱歉，处理消息时出错了。请稍后再试。');
      }
    });

    // Start the bot
    this.bot.launch().catch((error) => {
      this.logger.error(`Failed to launch bot: ${error.message}`, error.stack);
    });

    // Enable graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  private async handleMessage(ctx: Context) {
    const chat = ctx.chat;
    const from = ctx.from;
    const message = ctx.message;

    if (!chat || !from || !message) {
      return;
    }

    // Only process messages from allowed groups (if configured)
    if (this.allowedGroupIds.length > 0 && !this.allowedGroupIds.includes(chat.id.toString())) {
      this.logger.debug(`Ignoring message from unauthorized group: ${chat.id}`);
      return;
    }

    // Only process messages from groups (not private chats)
    if (chat.type !== 'group' && chat.type !== 'supergroup') {
      this.logger.debug(`Ignoring message from non-group chat: ${chat.type}`);
      return;
    }

    // Ignore messages without text
    if (!('text' in message)) {
      this.logger.debug('Ignoring non-text message');
      return;
    }

    const telegramMessage: TelegramMessage = {
      groupId: chat.id.toString(),
      groupName: chat.title || 'Unknown Group',
      userId: from.id.toString(),
      userName: from.username || from.first_name || 'Unknown User',
      message: message.text,
      messageId: message.message_id,
    };

    this.logger.log(
      `Received message from group "${telegramMessage.groupName}" (${telegramMessage.groupId}) ` +
      `by user ${telegramMessage.userName}: ${telegramMessage.message}`
    );

    // Check if the message is mentioning the bot
    const botInfo = ctx.botInfo;
    const isMentioningBot = message.text.includes(`@${botInfo.username}`);

    if (isMentioningBot) {
      this.logger.log('Bot is mentioned, processing with Claude...');
      await this.processWithClaude(ctx, telegramMessage);
    } else {
      this.logger.debug('Bot is not mentioned, ignoring message');
    }
  }

  private async processWithClaude(ctx: Context, telegramMessage: TelegramMessage) {
    try {
      // Remove the bot mention from the message
      const botInfo = ctx.botInfo;
      const cleanMessage = telegramMessage.message
        .replace(`@${botInfo.username}`, '')
        .trim();

      this.logger.log(`Processing message with Claude: "${cleanMessage}"`);

      // Call Claude API
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250129',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are a helpful assistant in a Telegram group. The user "${telegramMessage.userName}" is asking: "${cleanMessage}"

Please provide a helpful and concise response. Keep it friendly and conversational.`,
          },
        ],
      });

      // Extract the response text
      const responseText = response.content[0].type === 'text'
        ? response.content[0].text
        : 'Sorry, I could not generate a response.';

      this.logger.log(`Claude response: ${responseText.substring(0, 100)}...`);

      // Reply to the message
      await ctx.reply(responseText, {
        reply_parameters: { message_id: telegramMessage.messageId },
      });

      this.logger.log('Response sent successfully');
    } catch (error) {
      this.logger.error(`Error calling Claude API: ${error.message}`, error.stack);

      // Send a fallback message
      await ctx.reply(
        '抱歉，我遇到了一些问题。请稍后再试。',
        {
          reply_parameters: { message_id: telegramMessage.messageId },
        }
      );
    }
  }

  // Helper method to send a message to a specific group
  async sendToGroup(groupId: string, message: string) {
    try {
      await this.bot.telegram.sendMessage(groupId, message);
      this.logger.log(`Message sent to group ${groupId}`);
    } catch (error) {
      this.logger.error(`Failed to send message to group ${groupId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Helper method to get bot information
  async getBotInfo() {
    try {
      const botInfo = await this.bot.telegram.getMe();
      return botInfo;
    } catch (error) {
      this.logger.error(`Failed to get bot info: ${error.message}`, error.stack);
      throw error;
    }
  }
}
