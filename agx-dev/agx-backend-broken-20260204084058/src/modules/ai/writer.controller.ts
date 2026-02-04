import { Controller, Post, Body } from '@nestjs/common';
import { WriterService, WriteDocumentDto, DocumentType } from './writer.service';

class GenerateOutlineDto {
  type: DocumentType;
  topic: string;
  keyPoints?: string[];
  language?: string;
}

class ReviseDocumentDto {
  originalContent: string;
  revisionNotes: string;
  language?: string;
}

class TranslateDocumentDto {
  content: string;
  targetLanguage: string;
  preserveFormatting?: boolean;
}

@Controller('api/writer')
export class WriterController {
  constructor(private readonly writerService: WriterService) {}

  /**
   * 生成文档
   * 
   * @example
   * POST /api/writer/document
   * {
   *   "type": "whitepaper",
   *   "title": "AGX 黄金数字资产白皮书",
   *   "outline": "1. 项目简介 2. 市场分析 3. 技术架构 4. 代币经济 5. 路线图",
   *   "context": "AGX 是一个黄金锚定的数字资产平台...",
   *   "style": "professional",
   *   "language": "zh-CN",
   *   "length": "long"
   * }
   * 
   * 支持的文档类型 (type):
   * - whitepaper: 白皮书
   * - agreement: 协议/合同
   * - terms: 服务条款/隐私政策
   * - announcement: 公告
   * - proposal: 提案
   * - report: 报告
   * - manual: 手册/指南
   * - faq: FAQ
   * - pitch: 商业计划/路演材料
   * - legal: 法律文书
   */
  @Post('document')
  async writeDocument(@Body() dto: WriteDocumentDto) {
    return this.writerService.writeDocument(dto);
  }

  /**
   * 生成文档大纲
   * 
   * @example
   * POST /api/writer/outline
   * {
   *   "type": "whitepaper",
   *   "topic": "去中心化黄金交易平台",
   *   "keyPoints": ["黄金锚定", "区块链技术", "DeFi生态"],
   *   "language": "zh-CN"
   * }
   */
  @Post('outline')
  async generateOutline(@Body() dto: GenerateOutlineDto) {
    return this.writerService.generateOutline(dto);
  }

  /**
   * 修订文档
   * 
   * @example
   * POST /api/writer/revise
   * {
   *   "originalContent": "原文档内容...",
   *   "revisionNotes": "1. 第二章需要增加更多数据 2. 语气需要更正式",
   *   "language": "zh-CN"
   * }
   */
  @Post('revise')
  async reviseDocument(@Body() dto: ReviseDocumentDto) {
    return this.writerService.reviseDocument(dto);
  }

  /**
   * 翻译文档
   * 
   * @example
   * POST /api/writer/translate
   * {
   *   "content": "文档内容...",
   *   "targetLanguage": "en",
   *   "preserveFormatting": true
   * }
   * 
   * 支持的语言:
   * - zh-CN: 简体中文
   * - zh-TW: 繁体中文
   * - en: English
   * - ja: 日本語
   * - ko: 한국어
   * - th: ภาษาไทย
   * - vi: Tiếng Việt
   */
  @Post('translate')
  async translateDocument(@Body() dto: TranslateDocumentDto) {
    return this.writerService.translateDocument(dto);
  }
}
