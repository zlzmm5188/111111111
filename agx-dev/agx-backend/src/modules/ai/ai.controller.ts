import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatDto, DevAssistDto, CustomerServiceChatDto } from './ai.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * AI对话（用户端）
   */
  @Post('chat')
  async chat(@Body() dto: ChatDto) {
    return this.aiService.chat(dto);
  }

  /**
   * AI客服对话（带用户数据）
   * POST /api/ai/customer-service
   */
  @Post('customer-service')
  @UseGuards(JwtAuthGuard)
  async customerServiceChat(
    @CurrentUser('id') userId: number,
    @Body() dto: CustomerServiceChatDto,
  ) {
    return this.aiService.customerServiceChat(userId, dto);
  }

  /**
   * AI客服对话（游客模式，无用户数据）
   * POST /api/ai/customer-service/guest
   */
  @Post('customer-service/guest')
  async customerServiceChatGuest(@Body() dto: CustomerServiceChatDto) {
    return this.aiService.customerServiceChat(0, dto);
  }

  /**
   * 获取快捷问题
   */
  @Get('questions')
  getQuickQuestions(@Query('language') language?: string) {
    return this.aiService.getQuickQuestions(language || 'zh-CN');
  }

  /**
   * DeepSeek 开发辅助
   * 
   * 任务类型 (task):
   * - code: 代码生成
   * - review: 代码审查
   * - explain: 技术解释
   * - debug: 调试帮助
   * - optimize: 性能优化
   * - test: 测试生成
   * - document: 文档生成
   * - general: 通用问答
   */
  @Post('dev-assist')
  async devAssist(@Body() dto: DevAssistDto) {
    return this.aiService.devAssist(dto);
  }

  /**
   * 检查 DeepSeek API 状态
   */
  @Get('deepseek/status')
  async checkDeepseekStatus() {
    return this.aiService.checkDeepseekStatus();
  }
}
