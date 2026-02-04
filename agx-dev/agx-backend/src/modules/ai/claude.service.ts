import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeChatDto {
  prompt: string;
  systemPrompt?: string;
  history?: ClaudeMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ClaudeResponse {
  success: boolean;
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  error?: string;
}

// Claude 任务类型
export type ClaudeTaskType = 
  | 'analyze'      // 深度分析
  | 'architect'    // 架构设计
  | 'review'       // 代码/文档审查
  | 'strategy'     // 战略规划
  | 'research'     // 调研分析
  | 'creative'     // 创意内容
  | 'general';     // 通用对话

export interface ClaudeTaskDto {
  task: ClaudeTaskType;
  prompt: string;
  context?: string;
  language?: string;
  maxTokens?: number;
}

@Injectable()
export class ClaudeService {
  private readonly logger = new Logger(ClaudeService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('CLAUDE_API_KEY', '');
    this.baseUrl = this.configService.get<string>('CLAUDE_BASE_URL', 'https://api.z.ai/api/anthropic');
    this.model = this.configService.get<string>('CLAUDE_MODEL', 'claude-sonnet-4-20250514');
    this.maxTokens = this.configService.get<number>('CLAUDE_MAX_TOKENS', 16384);
    this.temperature = this.configService.get<number>('CLAUDE_TEMPERATURE', 0.0);
  }

  /**
   * 基础对话
   */
  async chat(dto: ClaudeChatDto): Promise<ClaudeResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        content: '',
        model: this.model,
        error: 'Claude API Key 未配置',
      };
    }

    const messages: ClaudeMessage[] = [];

    // 添加历史消息
    if (dto.history?.length) {
      messages.push(...dto.history);
    }

    // 添加当前消息
    messages.push({ role: 'user', content: dto.prompt });

    try {
      const response = await fetch(`${this.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: dto.model || this.model,
          max_tokens: dto.maxTokens || 4096,
          temperature: dto.temperature ?? 0.7,
          system: dto.systemPrompt || 'You are a helpful assistant.',
          messages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Claude API error: ${response.status} - ${errorText}`);
        return {
          success: false,
          content: '',
          model: dto.model || this.model,
          error: `API 请求失败: ${response.status}`,
        };
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || '';

      return {
        success: true,
        content,
        model: data.model || this.model,
        usage: data.usage ? {
          inputTokens: data.usage.input_tokens,
          outputTokens: data.usage.output_tokens,
        } : undefined,
      };
    } catch (error) {
      this.logger.error('Claude API error:', error);
      return {
        success: false,
        content: '',
        model: dto.model || this.model,
        error: error.message,
      };
    }
  }

  /**
   * 执行特定任务
   * 使用针对开发任务优化的参数配置
   */
  async executeTask(dto: ClaudeTaskDto): Promise<ClaudeResponse> {
    const systemPrompt = this.getTaskSystemPrompt(dto.task, dto.language);
    const optimalTemp = this.getTaskTemperature(dto.task);
    const optimalMaxTokens = this.getTaskMaxTokens(dto.task);
    
    let prompt = dto.prompt;
    if (dto.context) {
      prompt = `## 背景/上下文\n${dto.context}\n\n## 任务\n${dto.prompt}`;
    }

    return this.chat({
      prompt,
      systemPrompt,
      maxTokens: dto.maxTokens || optimalMaxTokens,
      temperature: optimalTemp,
    });
  }

  /**
   * 深度分析
   */
  async analyze(topic: string, context?: string, language = 'zh-CN'): Promise<ClaudeResponse> {
    return this.executeTask({
      task: 'analyze',
      prompt: topic,
      context,
      language,
    });
  }

  /**
   * 架构设计
   */
  async architect(requirements: string, context?: string, language = 'zh-CN'): Promise<ClaudeResponse> {
    return this.executeTask({
      task: 'architect',
      prompt: requirements,
      context,
      language,
    });
  }

  /**
   * 代码/方案审查
   */
  async review(content: string, reviewType: 'code' | 'document' | 'plan' = 'code', language = 'zh-CN'): Promise<ClaudeResponse> {
    const typePrompts = {
      code: '请审查以下代码，关注：代码质量、潜在bug、安全问题、性能优化、最佳实践',
      document: '请审查以下文档，关注：内容准确性、逻辑清晰度、完整性、专业性',
      plan: '请审查以下方案，关注：可行性、风险点、改进建议、资源需求',
    };

    return this.executeTask({
      task: 'review',
      prompt: `${typePrompts[reviewType]}\n\n${content}`,
      language,
    });
  }

  /**
   * 战略规划
   */
  async strategize(goal: string, context?: string, language = 'zh-CN'): Promise<ClaudeResponse> {
    return this.executeTask({
      task: 'strategy',
      prompt: goal,
      context,
      language,
    });
  }

  /**
   * 检查 API 状态
   */
  async checkStatus(): Promise<{ available: boolean; model: string; message: string }> {
    if (!this.apiKey) {
      return {
        available: false,
        model: this.model,
        message: 'Claude API Key 未配置',
      };
    }

    try {
      // 发送一个简单测试
      const result = await this.chat({
        prompt: 'Hello',
        maxTokens: 10,
      });

      return {
        available: result.success,
        model: this.model,
        message: result.success ? 'Claude API 可用' : result.error || '未知错误',
      };
    } catch (error) {
      return {
        available: false,
        model: this.model,
        message: `连接失败: ${error.message}`,
      };
    }
  }

  /**
   * 获取任务系统提示词
   */
  private getTaskSystemPrompt(task: ClaudeTaskType, language = 'zh-CN'): string {
    const lang = language === 'en' ? 'English' : '中文';

    const prompts: Record<ClaudeTaskType, string> = {
      analyze: `你是一位资深的分析专家，擅长深度分析复杂问题。

你的分析特点：
1. 多角度思考，全面覆盖
2. 深入挖掘根本原因
3. 数据驱动，逻辑严密
4. 提供可行的洞察和建议

请用${lang}回答，结构清晰，层次分明。`,

      architect: `你是一位资深的系统架构师，拥有丰富的技术架构经验。

你的职责：
1. 设计可扩展、高可用的系统架构
2. 选择合适的技术栈和工具
3. 考虑性能、安全、成本等因素
4. 提供清晰的架构图和说明

请用${lang}回答，包含架构图（用 ASCII 或 Mermaid）和详细说明。`,

      review: `你是一位严谨的审查专家，擅长发现问题和提供改进建议。

审查标准：
1. 准确性和正确性
2. 完整性和一致性
3. 最佳实践和规范
4. 潜在风险和改进空间

请用${lang}回答，明确指出问题和改进建议。`,

      strategy: `你是一位战略顾问，擅长制定清晰可执行的战略规划。

规划要点：
1. 明确目标和愿景
2. 分析现状和差距
3. 制定路径和里程碑
4. 识别风险和应对措施
5. 确定资源和优先级

请用${lang}回答，提供可落地的战略方案。`,

      research: `你是一位研究专家，擅长深入调研和信息整合。

研究方法：
1. 全面收集相关信息
2. 分析和对比不同观点
3. 提炼关键发现
4. 形成有价值的结论

请用${lang}回答，引用来源，客观中立。`,

      creative: `你是一位创意专家，擅长创新思维和内容创作。

创意原则：
1. 突破常规，独特新颖
2. 符合目标受众需求
3. 实用性和可行性并重
4. 引人注目，令人印象深刻

请用${lang}回答，展现创意和想象力。`,

      general: `你是一位智能助手，知识渊博，思维敏捷。

请用${lang}回答，准确、有帮助、友好。`,
    };

    return prompts[task] || prompts.general;
  }

  /**
   * 获取任务最优温度参数
   * 最高性能模式：所有任务使用0.0温度，确保最高准确度
   */
  private getTaskTemperature(task: ClaudeTaskType): number {
    // 最高性能模式：统一使用环境变量配置或0.0
    return this.temperature;
  }

  /**
   * 获取任务最优 max_tokens
   * 最高性能模式：所有任务使用最大token数
   */
  private getTaskMaxTokens(task: ClaudeTaskType): number {
    // 最高性能模式：统一使用环境变量配置或16384
    return this.maxTokens;
  }
}
