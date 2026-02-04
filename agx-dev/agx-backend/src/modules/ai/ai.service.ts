import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatDto, DevAssistDto, CustomerServiceChatDto } from './ai.dto';
import { User } from '../../entities/user.entity';
import { Wallet } from '../../entities/wallet.entity';
import { PoolHolding } from '../../entities/pool-holding.entity';
import { AssetLog } from '../../entities/asset-log.entity';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  
  // OpenAI/通用配置
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  
  // DeepSeek 配置 - 最高性能模式
  private readonly deepseekApiKey: string;
  private readonly deepseekBaseUrl: string;
  private readonly deepseekModel: string;
  private readonly deepseekMaxTokens: number;
  private readonly deepseekTemperature: number;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(PoolHolding)
    private readonly holdingRepo: Repository<PoolHolding>,
    @InjectRepository(AssetLog)
    private readonly assetLogRepo: Repository<AssetLog>,
  ) {
    // OpenAI 配置
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY', '');
    this.baseUrl = this.configService.get<string>('OPENAI_BASE_URL', 'https://api.openai.com/v1');
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
    
    // DeepSeek 配置 - 最高性能模式
    this.deepseekApiKey = this.configService.get<string>('DEEPSEEK_API_KEY', '');
    this.deepseekBaseUrl = this.configService.get<string>('DEEPSEEK_BASE_URL', 'https://api.deepseek.com');
    this.deepseekModel = this.configService.get<string>('DEEPSEEK_MODEL', 'deepseek-reasoner');
    this.deepseekMaxTokens = this.configService.get<number>('DEEPSEEK_MAX_TOKENS', 16384);
    this.deepseekTemperature = this.configService.get<number>('DEEPSEEK_TEMPERATURE', 0.0);
  }

  private getSystemPrompt(language: string): string {
    const prompts: Record<string, string> = {
      'zh-CN': `你是 AGX 平台的智能投资顾问。
你可以：
- 解答用户关于矿池产品、秒合约交易的问题
- 提供投资建议（但要提示风险）
- 说明平台功能使用方法
请用专业但友好的语气回答，使用中文。`,
      'en': `You are the AI investment advisor for AGX platform.
You can:
- Answer questions about mining pool products and second contracts trading
- Provide investment advice (with risk warnings)
- Explain platform features
Please respond professionally and friendly in English.`,
    };
    return prompts[language] || prompts['zh-CN'];
  }

  /**
   * 通用 OpenAI 兼容 API 调用
   */
  private async callOpenAICompatibleAPI(
    baseUrl: string,
    apiKey: string,
    model: string,
    messages: ChatMessage[],
    options: {
      maxTokens?: number;
      temperature?: number;
      stream?: boolean;
    } = {},
  ): Promise<string> {
    const { maxTokens = 2000, temperature = 0.7 } = options;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`API error: ${response.status} - ${errorText}`);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: ChatCompletionResponse = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * 用户 AI 对话（使用 OpenAI）
   */
  async chat(dto: ChatDto): Promise<{ reply: string }> {
    if (!this.apiKey) {
      return { reply: '抱歉，AI助手暂时不可用，请稍后再试。' };
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: this.getSystemPrompt(dto.language || 'zh-CN') },
    ];

    // 添加历史对话
    if (dto.history && dto.history.length > 0) {
      messages.push(...dto.history.slice(-10) as ChatMessage[]);
    }

    // 添加当前消息
    messages.push({ role: 'user', content: dto.message });

    try {
      const reply = await this.callOpenAICompatibleAPI(
        this.baseUrl,
        this.apiKey,
        this.model,
        messages,
        { maxTokens: 1000, temperature: 0.7 },
      );

      return { reply: reply || '抱歉，我无法理解您的问题。' };
    } catch (error) {
      this.logger.error('AI chat error:', error);
      return { reply: '抱歉，网络错误，请稍后再试。' };
    }
  }

  /**
   * 获取任务最优温度参数
   * 最高性能模式：所有任务使用0.0温度，确保最高准确度
   */
  private getDevTaskTemperature(task: string): number {
    // 最高性能模式：统一使用环境变量配置或0.0
    return this.deepseekTemperature;
  }

  /**
   * 获取任务最优max_tokens
   * 最高性能模式：所有任务使用最大token数
   */
  private getDevTaskMaxTokens(task: string): number {
    // 最高性能模式：统一使用环境变量配置或16384
    return this.deepseekMaxTokens;
  }

  /**
   * DeepSeek 开发辅助
   * 专门用于代码生成、代码审查、技术问答等开发相关任务
   * 已针对开发工作优化参数配置，使用最高性能模式
   */
  async devAssist(dto: DevAssistDto): Promise<{
    success: boolean;
    response: string;
    model: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }> {
    if (!this.deepseekApiKey) {
      return {
        success: false,
        response: 'DeepSeek API 未配置，请在 .env 中设置 DEEPSEEK_API_KEY',
        model: this.deepseekModel,
      };
    }

    const systemPrompts: Record<string, string> = {
      code: `你是一个顶级的编程专家，精通所有主流编程语言、框架和最佳实践。

核心原则：
- 生成生产级、高质量、可维护的代码
- 严格遵循 SOLID 原则和设计模式
- 代码必须类型安全、处理边界情况
- 包含必要的错误处理和输入验证
- 遵循项目约定和代码风格

输出要求：
- 直接输出可运行的代码
- 关键逻辑添加简洁注释
- 如有多种实现方案，选择最优方案
- 代码格式整洁，易于阅读`,

      review: `你是一位资深代码审查专家，具有10年+大型项目经验。

审查维度：
1. 正确性：逻辑错误、边界情况、潜在 bug
2. 安全性：注入攻击、XSS、CSRF、敏感数据泄露
3. 性能：时间/空间复杂度、内存泄漏、N+1查询
4. 可维护性：代码重复、耦合度、可读性
5. 最佳实践：设计模式、框架规范、类型安全

输出格式：
- 🔴 严重问题（必须修复）
- 🟡 警告（建议修复）
- 🟢 建议（可选优化）
- 每个问题附带具体修复方案`,

      explain: `你是一个技术教育专家，擅长将复杂概念讲解清晰。

讲解方法：
- 先给出核心概念的简洁定义
- 用类比或图示帮助理解
- 提供实际代码示例
- 说明常见陷阱和最佳实践
- 从简单到复杂，循序渐进`,

      debug: `你是一个调试大师，擅长快速定位和解决各类技术问题。

调试流程：
1. 分析错误信息，识别错误类型
2. 追踪错误源头，理解调用链
3. 定位根本原因（不只是表象）
4. 提供精确的修复方案
5. 说明如何避免类似问题

输出要求：
- 明确指出问题所在行/位置
- 解释为什么会出现这个问题
- 提供可直接使用的修复代码`,

      optimize: `你是一个性能优化专家，精通各类优化技术。

优化维度：
1. 算法优化：时间/空间复杂度改进
2. 数据库优化：查询优化、索引设计
3. 缓存策略：合理的缓存层次
4. 并发优化：异步处理、批量操作
5. 内存优化：减少内存分配、避免泄漏

输出要求：
- 量化分析当前性能瓶颈
- 提供优化前后的对比
- 给出优化后的完整代码`,

      test: `你是一个测试专家，精通各类测试方法论。

测试原则：
1. 覆盖正常路径和边界情况
2. 覆盖错误处理路径
3. 使用 AAA 模式（Arrange-Act-Assert）
4. 测试命名清晰表达意图
5. Mock 外部依赖

输出要求：
- 生成完整可运行的测试代码
- 包含测试用例说明
- 覆盖率目标 > 80%`,

      document: `你是一个技术文档专家，擅长编写清晰专业的文档。

文档标准：
- 函数/类的用途说明
- 参数类型和说明
- 返回值说明
- 使用示例
- 异常/错误说明
- 注意事项

格式要求：
- 使用 JSDoc/TSDoc 标准格式
- 示例代码可直接运行
- 语言简洁准确`,

      general: `你是一个全能的高级开发助手。

能力范围：
- 系统架构设计与技术选型
- 代码实现与问题解决
- 技术方案评估与建议
- 开发最佳实践指导

回答原则：
- 给出最佳实践方案
- 考虑可扩展性和维护性
- 必要时提供代码示例`,
    };

    const systemPrompt = systemPrompts[dto.task] || systemPrompts.general;
    const optimalTemp = this.getDevTaskTemperature(dto.task || 'general');
    const optimalMaxTokens = this.getDevTaskMaxTokens(dto.task || 'general');

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    // 添加上下文
    if (dto.context) {
      messages.push({
        role: 'user',
        content: `参考上下文：\n\`\`\`\n${dto.context}\n\`\`\``,
      });
      messages.push({
        role: 'assistant',
        content: '好的，我已了解上下文内容，请告诉我您的具体需求。',
      });
    }

    // 添加用户消息
    messages.push({ role: 'user', content: dto.prompt });

    try {
      const response = await fetch(`${this.deepseekBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.deepseekApiKey}`,
        },
        body: JSON.stringify({
          model: dto.model || this.deepseekModel,
          messages,
          max_tokens: dto.maxTokens || optimalMaxTokens,
          temperature: dto.temperature ?? optimalTemp,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`DeepSeek API error: ${response.status} - ${errorText}`);
        return {
          success: false,
          response: `API 请求失败: ${response.status}`,
          model: dto.model || this.deepseekModel,
        };
      }

      const data: ChatCompletionResponse = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      return {
        success: true,
        response: content,
        model: data.model,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      this.logger.error('DeepSeek API error:', error);
      return {
        success: false,
        response: `请求错误: ${error.message}`,
        model: dto.model || this.deepseekModel,
      };
    }
  }

  /**
   * 检查 DeepSeek API 状态
   */
  async checkDeepseekStatus(): Promise<{
    available: boolean;
    model: string;
    message: string;
  }> {
    if (!this.deepseekApiKey) {
      return {
        available: false,
        model: this.deepseekModel,
        message: 'DeepSeek API Key 未配置',
      };
    }

    try {
      // 发送一个简单的测试请求
      const response = await fetch(`${this.deepseekBaseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.deepseekApiKey}`,
        },
      });

      if (response.ok) {
        return {
          available: true,
          model: this.deepseekModel,
          message: 'DeepSeek API 可用',
        };
      } else {
        return {
          available: false,
          model: this.deepseekModel,
          message: `API 响应错误: ${response.status}`,
        };
      }
    } catch (error) {
      return {
        available: false,
        model: this.deepseekModel,
        message: `连接失败: ${error.message}`,
      };
    }
  }

  /**
   * 获取快捷问题列表
   */
  getQuickQuestions(language: string): { questions: string[] } {
    const questions: Record<string, string[]> = {
      'zh-CN': [
        '矿池怎么赚钱？',
        '秒合约怎么玩？',
        '如何邀请朋友？',
        '如何提现？',
      ],
      'en': [
        'How does mining pool work?',
        'How to trade second contracts?',
        'How to invite friends?',
        'How to withdraw?',
      ],
    };
    return { questions: questions[language] || questions['zh-CN'] };
  }

  /**
   * 获取用户数据上下文（用于AI客服）
   */
  private async getUserContext(userId: number): Promise<string> {
    try {
      // 获取用户基本信息
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) return '';

      // 获取用户钱包
      const wallets = await this.walletRepo.find({ where: { userId } });
      const walletInfo = wallets.map(w => `币种ID${w.coinId}: 可用${parseFloat(w.balance).toFixed(2)}, 冻结${parseFloat(w.frozen || '0').toFixed(2)}`).join('; ');

      // 获取矿池持仓
      const holdings = await this.holdingRepo.find({ 
        where: { userId, status: 1 },
        relations: ['product'],
      });
      const holdingInfo = holdings.length > 0 
        ? holdings.map(h => `${h.product?.name || '矿池产品'}: 本金${parseFloat(h.amount).toFixed(2)}USDT, 日收益率${(parseFloat(h.product?.dailyRate || '0') * 100).toFixed(2)}%`).join('; ')
        : '暂无持仓';

      // 获取最近交易记录（充值/提现）
      const recentLogs = await this.assetLogRepo.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 10,
      });
      
      let totalRecharge = 0;
      let totalWithdraw = 0;
      let totalRebate = 0;
      
      recentLogs.forEach(log => {
        const amount = Math.abs(parseFloat(log.amount));
        if (log.type === 'recharge' || log.type === 'deposit') totalRecharge += amount;
        if (log.type === 'withdraw') totalWithdraw += amount;
        if (log.type === 'rebate' || log.type === 'commission') totalRebate += amount;
      });

      return `
【当前用户信息】
- 用户ID: ${user.uid}
- 昵称: ${user.nickname || user.username}
- VIP等级: ${user.level || 0}
- 注册时间: ${user.createdAt?.toISOString().split('T')[0] || '未知'}

【资产概况】
- 钱包余额: ${walletInfo || '暂无'}
- 矿池持仓: ${holdingInfo}

【交易统计】
- 累计充值: ${totalRecharge.toFixed(2)} USDT
- 累计提现: ${totalWithdraw.toFixed(2)} USDT
- 累计返利: ${totalRebate.toFixed(2)} USDT
`;
    } catch (error) {
      this.logger.error('获取用户上下文失败:', error);
      return '';
    }
  }

  /**
   * AI客服聊天（对接DeepSeek，带用户数据）
   */
  async customerServiceChat(userId: number, dto: CustomerServiceChatDto): Promise<{ 
    code: number;
    msg: string;
    data: { reply: string };
  }> {
    if (!this.deepseekApiKey) {
      return { 
        code: 0, 
        msg: 'ok', 
        data: { reply: '抱歉，AI客服暂时不可用，请联系在线客服。' }
      };
    }

    // 获取用户数据上下文
    const userContext = userId ? await this.getUserContext(userId) : '';

    // 平台人设系统提示词
    const systemPrompt = `你是 AGX升达金指 平台的官方AI智能客服，名叫"小升"。

## 你的身份
- 你是AGX平台唯一官方AI客服，代表平台为用户提供专业服务
- 你的回答代表平台官方立场，必须准确、专业、友好
- 绝不透露其他用户的任何信息，严格保护用户隐私

## 平台介绍
AGX升达金指是一个专业的数字资产投资平台，主要业务包括：

1. **矿池理财**：用户可以购买矿池产品，获得每日稳定收益
   - 产品有不同的锁定期（7天、30天、90天等）
   - 日收益率根据产品不同，一般在0.3%-1%之间
   - 收益每日自动发放到账户余额

2. **IEO新币认购**：参与平台新币发行，低价认购优质代币
   - 认购需要使用USDT支付
   - 认购成功后等待开奖和代币发放

3. **邀请返利**：邀请好友注册可获得佣金奖励
   - 一级邀请返利比例较高
   - 好友投资矿池，邀请人可获得额外收益

4. **充值提现**：支持USDT-TRC20充值和提现
   - 充值秒到账，提现审核时间约1-24小时
   - 最低提现金额根据平台规定

## 回答原则
1. 始终站在平台角度正面回答，维护平台形象
2. 遇到投诉或负面问题，先表示理解，再积极解决
3. 不要编造不存在的功能或承诺
4. 如果不确定的问题，建议用户联系人工客服
5. 回答要简洁专业，不要过长
6. 对于收益相关问题，要提示投资有风险

## 当前用户数据
${userContext || '（用户未登录或无数据）'}

请根据以上信息为用户提供帮助。`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    // 添加历史对话（最多保留10条）
    if (dto.history && dto.history.length > 0) {
      messages.push(...dto.history.slice(-10) as ChatMessage[]);
    }

    // 添加当前消息
    messages.push({ role: 'user', content: dto.message });

    try {
      const response = await fetch(`${this.deepseekBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.deepseekApiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`DeepSeek API error: ${response.status} - ${errorText}`);
        return { 
          code: 0, 
          msg: 'ok', 
          data: { reply: '抱歉，网络繁忙，请稍后再试。' }
        };
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || '抱歉，我没有理解您的问题，请换个方式描述。';

      return { code: 0, msg: 'ok', data: { reply } };
    } catch (error) {
      this.logger.error('AI客服聊天错误:', error);
      return { 
        code: 0, 
        msg: 'ok', 
        data: { reply: '抱歉，网络错误，请稍后再试。' }
      };
    }
  }
}
