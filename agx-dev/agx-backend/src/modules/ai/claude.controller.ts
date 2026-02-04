import { Controller, Post, Get, Body } from '@nestjs/common';
import { ClaudeService, ClaudeChatDto, ClaudeTaskDto, ClaudeTaskType } from './claude.service';

class AnalyzeDto {
  topic: string;
  context?: string;
  language?: string;
}

class ArchitectDto {
  requirements: string;
  context?: string;
  language?: string;
}

class ReviewDto {
  content: string;
  reviewType?: 'code' | 'document' | 'plan';
  language?: string;
}

class StrategyDto {
  goal: string;
  context?: string;
  language?: string;
}

@Controller('api/claude')
export class ClaudeController {
  constructor(private readonly claudeService: ClaudeService) {}

  /**
   * 基础对话
   * 
   * @example
   * POST /api/claude/chat
   * {
   *   "prompt": "解释一下微服务架构的优缺点",
   *   "systemPrompt": "你是一位技术专家",
   *   "maxTokens": 2000
   * }
   */
  @Post('chat')
  async chat(@Body() dto: ClaudeChatDto) {
    return this.claudeService.chat(dto);
  }

  /**
   * 执行特定任务
   * 
   * @example
   * POST /api/claude/task
   * {
   *   "task": "analyze",
   *   "prompt": "分析当前加密货币市场的趋势",
   *   "context": "比特币刚突破历史新高...",
   *   "language": "zh-CN"
   * }
   * 
   * 支持的任务类型 (task):
   * - analyze: 深度分析
   * - architect: 架构设计
   * - review: 代码/文档审查
   * - strategy: 战略规划
   * - research: 调研分析
   * - creative: 创意内容
   * - general: 通用对话
   */
  @Post('task')
  async executeTask(@Body() dto: ClaudeTaskDto) {
    return this.claudeService.executeTask(dto);
  }

  /**
   * 深度分析
   * 
   * @example
   * POST /api/claude/analyze
   * {
   *   "topic": "黄金作为避险资产在数字时代的演变",
   *   "context": "近年来黄金ETF和数字黄金产品快速增长...",
   *   "language": "zh-CN"
   * }
   */
  @Post('analyze')
  async analyze(@Body() dto: AnalyzeDto) {
    return this.claudeService.analyze(dto.topic, dto.context, dto.language);
  }

  /**
   * 架构设计
   * 
   * @example
   * POST /api/claude/architect
   * {
   *   "requirements": "设计一个高并发的订单处理系统，支持每秒10万订单",
   *   "context": "现有系统是单体架构，使用MySQL...",
   *   "language": "zh-CN"
   * }
   */
  @Post('architect')
  async architect(@Body() dto: ArchitectDto) {
    return this.claudeService.architect(dto.requirements, dto.context, dto.language);
  }

  /**
   * 审查
   * 
   * @example
   * POST /api/claude/review
   * {
   *   "content": "function add(a, b) { return a + b; }",
   *   "reviewType": "code",
   *   "language": "zh-CN"
   * }
   */
  @Post('review')
  async review(@Body() dto: ReviewDto) {
    return this.claudeService.review(dto.content, dto.reviewType, dto.language);
  }

  /**
   * 战略规划
   * 
   * @example
   * POST /api/claude/strategy
   * {
   *   "goal": "在6个月内将用户量从10万增长到100万",
   *   "context": "当前产品是一个黄金交易平台...",
   *   "language": "zh-CN"
   * }
   */
  @Post('strategy')
  async strategize(@Body() dto: StrategyDto) {
    return this.claudeService.strategize(dto.goal, dto.context, dto.language);
  }

  /**
   * 检查 Claude API 状态
   */
  @Get('status')
  async checkStatus() {
    return this.claudeService.checkStatus();
  }
}
