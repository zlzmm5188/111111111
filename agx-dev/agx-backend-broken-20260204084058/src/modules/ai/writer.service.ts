import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// 文档类型
export type DocumentType = 
  | 'whitepaper'      // 白皮书
  | 'agreement'       // 协议/合同
  | 'terms'           // 条款（用户协议、隐私政策等）
  | 'announcement'    // 公告
  | 'proposal'        // 提案
  | 'report'          // 报告
  | 'manual'          // 手册/指南
  | 'faq'             // FAQ
  | 'pitch'           // 商业计划/路演材料
  | 'legal';          // 法律文书

export interface WriteDocumentDto {
  type: DocumentType;
  title: string;
  outline?: string;           // 大纲/要点
  context?: string;           // 背景信息
  style?: 'formal' | 'professional' | 'friendly';  // 风格
  language?: string;          // 语言 zh-CN, en, etc.
  sections?: string[];        // 指定章节
  length?: 'short' | 'medium' | 'long';  // 篇幅
  additionalRequirements?: string;  // 额外要求
}

export interface DocumentResult {
  success: boolean;
  title: string;
  content: string;
  sections?: Array<{ title: string; content: string }>;
  wordCount: number;
  language: string;
  generatedAt: Date;
  error?: string;
}

@Injectable()
export class WriterService {
  private readonly logger = new Logger(WriterService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY', '');
    this.baseUrl = this.configService.get<string>('DEEPSEEK_BASE_URL', 'https://api.deepseek.com');
    this.model = this.configService.get<string>('DEEPSEEK_WRITER_MODEL', 'deepseek-chat');
  }

  /**
   * 生成文档
   */
  async writeDocument(dto: WriteDocumentDto): Promise<DocumentResult> {
    if (!this.apiKey) {
      return {
        success: false,
        title: dto.title,
        content: '',
        wordCount: 0,
        language: dto.language || 'zh-CN',
        generatedAt: new Date(),
        error: 'API Key 未配置',
      };
    }

    const systemPrompt = this.buildSystemPrompt(dto);
    const userPrompt = this.buildUserPrompt(dto);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: this.getMaxTokens(dto.length),
          temperature: 0.3,  // 低温度保证专业性
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Writer API error: ${response.status} - ${errorText}`);
        return {
          success: false,
          title: dto.title,
          content: '',
          wordCount: 0,
          language: dto.language || 'zh-CN',
          generatedAt: new Date(),
          error: `API 请求失败: ${response.status}`,
        };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      return {
        success: true,
        title: dto.title,
        content,
        wordCount: this.countWords(content, dto.language),
        language: dto.language || 'zh-CN',
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Writer API error:', error);
      return {
        success: false,
        title: dto.title,
        content: '',
        wordCount: 0,
        language: dto.language || 'zh-CN',
        generatedAt: new Date(),
        error: error.message,
      };
    }
  }

  /**
   * 修订文档
   */
  async reviseDocument(dto: {
    originalContent: string;
    revisionNotes: string;
    language?: string;
  }): Promise<DocumentResult> {
    const systemPrompt = `你是一位专业的文档编辑专家。
你的任务是根据修订意见对文档进行修改，保持文档的专业性和一致性。

修订原则：
1. 保持原文的整体结构和风格
2. 根据修订意见进行针对性修改
3. 确保修改后的内容逻辑通顺
4. 保持专业术语的准确性
5. 语言：${dto.language || 'zh-CN'}`;

    const userPrompt = `请根据以下修订意见修改文档：

## 原文档
${dto.originalContent}

## 修订意见
${dto.revisionNotes}

请输出修订后的完整文档。`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 8000,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      return {
        success: true,
        title: 'Revised Document',
        content,
        wordCount: this.countWords(content, dto.language),
        language: dto.language || 'zh-CN',
        generatedAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        title: 'Revised Document',
        content: '',
        wordCount: 0,
        language: dto.language || 'zh-CN',
        generatedAt: new Date(),
        error: error.message,
      };
    }
  }

  /**
   * 生成文档大纲
   */
  async generateOutline(dto: {
    type: DocumentType;
    topic: string;
    keyPoints?: string[];
    language?: string;
  }): Promise<{ success: boolean; outline: string[]; error?: string }> {
    const typeNames = this.getDocumentTypeInfo(dto.type);
    
    const prompt = `为以下${typeNames.name}生成详细的大纲结构：

主题：${dto.topic}
${dto.keyPoints?.length ? `关键要点：\n${dto.keyPoints.map(p => `- ${p}`).join('\n')}` : ''}

请生成一个专业的大纲，包含主要章节和子章节。
使用 JSON 数组格式输出，如：["1. 简介", "1.1 背景", "1.2 目标", "2. 核心内容", ...]
语言：${dto.language || 'zh-CN'}`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: '你是专业的文档架构师，擅长设计清晰的文档结构。' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 2000,
          temperature: 0.3,
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      // 解析 JSON 数组
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const outline = JSON.parse(jsonMatch[0]);
        return { success: true, outline };
      }

      // 按行解析
      const lines = content.split('\n').filter(l => l.trim());
      return { success: true, outline: lines };
    } catch (error) {
      return { success: false, outline: [], error: error.message };
    }
  }

  /**
   * 翻译文档
   */
  async translateDocument(dto: {
    content: string;
    targetLanguage: string;
    preserveFormatting?: boolean;
  }): Promise<DocumentResult> {
    const langNames: Record<string, string> = {
      'zh-CN': '简体中文',
      'zh-TW': '繁体中文',
      'en': 'English',
      'ja': '日本語',
      'ko': '한국어',
      'th': 'ภาษาไทย',
      'vi': 'Tiếng Việt',
    };

    const targetLangName = langNames[dto.targetLanguage] || dto.targetLanguage;

    const systemPrompt = `你是专业的文档翻译专家。
将文档翻译成${targetLangName}，要求：
1. 保持专业术语的准确性
2. ${dto.preserveFormatting !== false ? '保持原文的格式和结构' : '可以适当调整格式'}
3. 确保翻译流畅自然
4. 保留专有名词（如品牌名、产品名）`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `请翻译以下文档：\n\n${dto.content}` },
          ],
          max_tokens: 8000,
          temperature: 0.2,
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      return {
        success: true,
        title: 'Translated Document',
        content,
        wordCount: this.countWords(content, dto.targetLanguage),
        language: dto.targetLanguage,
        generatedAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        title: 'Translated Document',
        content: '',
        wordCount: 0,
        language: dto.targetLanguage,
        generatedAt: new Date(),
        error: error.message,
      };
    }
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(dto: WriteDocumentDto): string {
    const typeInfo = this.getDocumentTypeInfo(dto.type);
    const styleDesc = this.getStyleDescription(dto.style);
    const langName = dto.language === 'en' ? 'English' : '中文';

    return `你是一位资深的${typeInfo.expert}，专门撰写${typeInfo.name}。

## 你的专业背景
${typeInfo.background}

## 写作风格
${styleDesc}

## 写作要求
1. 语言：使用${langName}撰写
2. 结构清晰，逻辑严密
3. 用词准确，表达专业
4. 格式规范，便于阅读
5. 内容完整，覆盖要点

## 格式要求
- 使用 Markdown 格式
- 合理使用标题层级（# ## ###）
- 重要内容可使用粗体或列表
- 数据和条款要准确规范`;
  }

  /**
   * 构建用户提示词
   */
  private buildUserPrompt(dto: WriteDocumentDto): string {
    const typeInfo = this.getDocumentTypeInfo(dto.type);
    
    let prompt = `请撰写一份${typeInfo.name}。\n\n`;
    prompt += `## 标题\n${dto.title}\n\n`;

    if (dto.outline) {
      prompt += `## 大纲/要点\n${dto.outline}\n\n`;
    }

    if (dto.context) {
      prompt += `## 背景信息\n${dto.context}\n\n`;
    }

    if (dto.sections?.length) {
      prompt += `## 需要包含的章节\n${dto.sections.map(s => `- ${s}`).join('\n')}\n\n`;
    }

    if (dto.additionalRequirements) {
      prompt += `## 额外要求\n${dto.additionalRequirements}\n\n`;
    }

    const lengthDesc = {
      short: '简洁版（约 1000-2000 字）',
      medium: '标准版（约 3000-5000 字）',
      long: '详细版（约 8000-15000 字）',
    };
    prompt += `## 篇幅\n${lengthDesc[dto.length || 'medium']}\n\n`;

    prompt += `请开始撰写完整的${typeInfo.name}。`;

    return prompt;
  }

  /**
   * 获取文档类型信息
   */
  private getDocumentTypeInfo(type: DocumentType): { name: string; expert: string; background: string } {
    const types: Record<DocumentType, { name: string; expert: string; background: string }> = {
      whitepaper: {
        name: '白皮书',
        expert: '区块链/金融科技专家',
        background: '你有丰富的区块链项目白皮书撰写经验，熟悉技术架构、代币经济学、市场分析等领域。你的白皮书既有技术深度，又能让投资者理解项目价值。',
      },
      agreement: {
        name: '协议/合同',
        expert: '法律顾问',
        background: '你是资深法律专家，精通合同法和商业协议。你撰写的协议条款清晰、权责明确、法律效力完备，能有效保护各方权益。',
      },
      terms: {
        name: '服务条款/隐私政策',
        expert: '互联网法务专家',
        background: '你专注于互联网平台的法律合规，熟悉 GDPR、数据保护法等法规。你撰写的条款既合规又用户友好。',
      },
      announcement: {
        name: '公告',
        expert: '企业公关专家',
        background: '你擅长撰写各类企业公告，包括产品发布、业务更新、重大事项等。你的公告信息准确、语气得当、影响力强。',
      },
      proposal: {
        name: '提案',
        expert: '战略顾问',
        background: '你有丰富的商业提案撰写经验，能够清晰阐述问题、分析方案、论证可行性，说服力强。',
      },
      report: {
        name: '报告',
        expert: '行业分析师',
        background: '你擅长撰写各类专业报告，数据分析严谨，结论有据可依，图表清晰，建议可行。',
      },
      manual: {
        name: '手册/指南',
        expert: '技术文档工程师',
        background: '你专注于技术文档和用户手册的撰写，内容组织清晰，步骤详尽，易于理解和操作。',
      },
      faq: {
        name: 'FAQ 常见问题',
        expert: '客户服务专家',
        background: '你了解用户需求，能预判常见问题，回答准确、简洁、实用。',
      },
      pitch: {
        name: '商业计划/路演材料',
        expert: '投融资顾问',
        background: '你有丰富的融资经验，熟悉投资人关注点，能够精准呈现项目亮点和商业价值。',
      },
      legal: {
        name: '法律文书',
        expert: '执业律师',
        background: '你是资深律师，熟悉各类法律文书的撰写规范，用词精准，条款严谨，法律效力完备。',
      },
    };

    return types[type] || types.whitepaper;
  }

  /**
   * 获取风格描述
   */
  private getStyleDescription(style?: string): string {
    const styles: Record<string, string> = {
      formal: '正式严肃：使用规范的书面语，语气庄重，适合正式场合和法律文件。',
      professional: '专业客观：使用专业术语，表达准确，保持客观中立的立场。',
      friendly: '亲切友好：保持专业的同时，语气亲和，易于理解，适合面向普通用户的文档。',
    };
    return styles[style || 'professional'];
  }

  /**
   * 获取最大 token 数
   */
  private getMaxTokens(length?: string): number {
    const tokens: Record<string, number> = {
      short: 3000,
      medium: 6000,
      long: 12000,
    };
    return tokens[length || 'medium'];
  }

  /**
   * 统计字数
   */
  private countWords(content: string, language?: string): number {
    if (language === 'en') {
      return content.split(/\s+/).filter(w => w.length > 0).length;
    }
    // 中文按字符数
    return content.replace(/\s/g, '').length;
  }
}
