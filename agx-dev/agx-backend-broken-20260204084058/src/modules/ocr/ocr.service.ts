import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

interface OcrResult {
  idNumber?: string;
  name?: string;
  gender?: string;
  nationality?: string;
  birthDate?: string;
  address?: string;
  confidence?: number;
}

interface LivenessResult {
  isReal: boolean;
  confidence: number;
  reason?: string;
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  
  private readonly deepseekApiKey: string;
  private readonly deepseekBaseUrl: string;
  
  // 百度OCR配置
  private readonly baiduApiKey: string;
  private readonly baiduSecretKey: string;
  private baiduAccessToken: string = '';
  private baiduTokenExpireTime: number = 0;

  constructor(private readonly configService: ConfigService) {
    this.deepseekApiKey = this.configService.get<string>('DEEPSEEK_API_KEY', '');
    this.deepseekBaseUrl = this.configService.get<string>('DEEPSEEK_BASE_URL', 'https://api.deepseek.com');
    
    // 百度OCR - 支持BCE V3 Token或传统API Key
    this.baiduApiKey = this.configService.get<string>('BAIDU_OCR_API_KEY', '');
    this.baiduSecretKey = this.configService.get<string>('BAIDU_OCR_SECRET_KEY', '');
    
    if (this.baiduApiKey) {
      this.logger.log('百度OCR已配置');
    }
  }

  /**
   * 识别身份证正面 - 优先使用百度OCR
   * @param imageSource 图片路径或 Buffer
   */
  async recognizeIdCardFront(imageSource: string | Buffer): Promise<OcrResult> {
    this.logger.log('开始识别身份证');

    try {
      let base64Image: string;

      if (typeof imageSource === 'string') {
        // 文件路径
        if (!fs.existsSync(imageSource)) {
          this.logger.error(`文件不存在: ${imageSource}`);
          return { idNumber: null, name: null };
        }
        const imageBuffer = fs.readFileSync(imageSource);
        base64Image = imageBuffer.toString('base64');
      } else {
        // Buffer
        base64Image = imageSource.toString('base64');
      }

      // 优先使用百度OCR
      if (this.baiduApiKey && this.baiduSecretKey) {
        const result = await this.callBaiduOcr(base64Image);
        if (result.idNumber) {
          this.logger.log(`百度OCR识别成功 - 身份证号: ${this.maskIdNumber(result.idNumber)}`);
          return result;
        }
      }

      // 百度OCR未配置或失败，返空结果让用户手动输入
      this.logger.warn('百度OCR未配置或识别失败，请用户手动输入');
      return { idNumber: null, name: null };
    } catch (error) {
      this.logger.error(`身份证识别错误: ${error.message}`);
      return { idNumber: null, name: null };
    }
  }

  /**
   * 获取百度OCR access_token
   * 支持BCE V3 Token直接使用，或通过API Key+Secret Key获取
   */
  private async getBaiduAccessToken(): Promise<string> {
    // 如果是BCE V3格式的token，直接使用
    if (this.baiduApiKey.startsWith('bce-v3/')) {
      return this.baiduApiKey;
    }
    
    // 检查缓存的token是否有效
    if (this.baiduAccessToken && Date.now() < this.baiduTokenExpireTime) {
      return this.baiduAccessToken;
    }

    // 需要Secret Key来获取access_token
    if (!this.baiduSecretKey) {
      throw new Error('百度OCR Secret Key未配置');
    }

    const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.baiduApiKey}&client_secret=${this.baiduSecretKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!response.ok) {
      throw new Error(`获取百度access_token失败: ${response.status}`);
    }

    const data = await response.json();
    this.baiduAccessToken = data.access_token;
    // token有4周有效期，提前1小时刷新
    this.baiduTokenExpireTime = Date.now() + (data.expires_in - 3600) * 1000;
    
    this.logger.log('百度OCR access_token获取成功');
    return this.baiduAccessToken;
  }

  /**
   * 调用百度身份证OCR API
   * 支持BCE V3 Token和传统access_token两种认证方式
   */
  private async callBaiduOcr(base64Image: string): Promise<OcrResult> {
    try {
      const token = await this.getBaiduAccessToken();
      const isBceV3 = token.startsWith('bce-v3/');
      
      // BCE V3 Token使用Authorization header
      // 传统token使用URL参数
      const url = isBceV3 
        ? 'https://aip.baidubce.com/rest/2.0/ocr/v1/idcard'
        : `https://aip.baidubce.com/rest/2.0/ocr/v1/idcard?access_token=${token}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      
      if (isBceV3) {
        headers['Authorization'] = token;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: `image=${encodeURIComponent(base64Image)}&id_card_side=front`,
      });

      if (!response.ok) {
        throw new Error(`百度OCR请求失败: ${response.status}`);
      }

      const data = await response.json();
      this.logger.debug(`百度OCR响应: ${JSON.stringify(data)}`);

      // 检查错误
      if (data.error_code) {
        this.logger.error(`百度OCR错误: ${data.error_code} - ${data.error_msg}`);
        return { idNumber: null, name: null };
      }

      // 解析结果
      const wordsResult = data.words_result || {};
      const idNumber = wordsResult['公民身份号码']?.words || null;
      const name = wordsResult['姓名']?.words || null;
      const gender = wordsResult['性别']?.words || null;
      const nationality = wordsResult['民族']?.words || null;
      const birthDate = wordsResult['出生']?.words || null;
      const address = wordsResult['住址']?.words || null;

      return {
        idNumber,
        name,
        gender,
        nationality,
        birthDate,
        address,
        confidence: 99, // 百度OCR准确率非常高
      };
    } catch (error) {
      this.logger.error(`百度OCR调用失败: ${error.message}`);
      return { idNumber: null, name: null };
    }
  }

  /**
   * 真人自拍检测 - 跳过AI检测，直接返回成功
   * 实际审核由后台人工完成
   * @param imageSource 图片路径或 Buffer
   */
  async detectLiveness(imageSource: string | Buffer): Promise<LivenessResult> {
    this.logger.log('真人自拍已上传，跳过AI检测，由后台人工审核');

    // 只验证图片是否存在
    if (typeof imageSource === 'string') {
      if (!fs.existsSync(imageSource)) {
        this.logger.error(`文件不存在: ${imageSource}`);
        return { isReal: false, confidence: 0, reason: '文件不存在' };
      }
    }

    // 直接返回成功，由后台人工审核
    return {
      isReal: true,
      confidence: 100,
      reason: '已接收，待人工审核',
    };
  }

  /**
   * 调用 DeepSeek Vision API
   */
  private async callDeepseekVision(
    base64Image: string,
    mimeType: string,
    task: 'idcard' | 'liveness',
  ): Promise<any> {
    if (!this.deepseekApiKey) {
      this.logger.warn('DeepSeek API Key 未配置');
      throw new Error('AI服务未配置');
    }

    const prompts = {
      idcard: `你是一个专业的身份证OCR识别系统。请仔细分析这张身份证正面照片，提取以下信息：

1. 身份证号码（18位数字，最后一位可能是X）
2. 姓名（中文姓名）

请以JSON格式返回，格式如下：
{
  "idNumber": "身份证号码",
  "name": "姓名"
}

注意事项：
- 身份证号码必须是18位（或15位老版）
- 如果无法识别清楚，对应字段返回null
- 只返回JSON，不要其他文字
- 确保身份证号码准确无误`,

      liveness: `你是一个专业的人脸活体检测AI。请分析这张自拍照片，判断是否为真人实时拍摄。

检测要点：
1. 是否为真人面部（非照片翻拍、非打印件、非屏幕显示）
2. 人脸是否清晰可见
3. 是否有明显的PS或合成痕迹
4. 光线和阴影是否自然
5. 背景是否符合自拍场景

请以JSON格式返回：
{
  "isReal": true/false,
  "confidence": 0-100的置信度,
  "reason": "判断理由"
}

注意：
- 只返回JSON格式
- confidence为0-100的整数
- 宁可严格，不可放过可疑图片`,
    };

    const response = await fetch(`${this.deepseekBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompts[task],
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`DeepSeek API错误: ${response.status} - ${errorText}`);
      throw new Error(`AI服务请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    this.logger.debug(`DeepSeek响应: ${content}`);

    // 解析 JSON 响应
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      this.logger.warn(`JSON解析失败: ${e.message}`);
    }

    // 如果无法解析JSON，尝试从文本中提取身份证号
    if (task === 'idcard') {
      const idNumber = this.extractIdNumber(content);
      return { idNumber, name: null };
    }

    return { isReal: false, confidence: 0, reason: '无法解析AI响应' };
  }

  /**
   * 获取文件MIME类型
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  /**
   * 从文本中提取身份证号码
   */
  private extractIdNumber(text: string): string | null {
    const idCardRegex18 = /[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]/;
    const cleanText = text.replace(/\s+/g, '').replace(/[oO]/g, '0');
    
    const match = cleanText.match(idCardRegex18);
    if (match) {
      return match[0].toUpperCase();
    }
    return null;
  }

  /**
   * 脱敏显示身份证号
   */
  private maskIdNumber(id: string): string {
    if (!id || id.length < 8) return id;
    return id.substring(0, 4) + '**********' + id.substring(id.length - 4);
  }

  /**
   * 验证身份证号码格式
   */
  validateIdNumber(idNumber: string): { valid: boolean; message: string } {
    if (!idNumber) {
      return { valid: false, message: '身份证号码不能为空' };
    }

    idNumber = idNumber.trim().toUpperCase();

    if (idNumber.length !== 18 && idNumber.length !== 15) {
      return { valid: false, message: '身份证号码长度不正确' };
    }

    if (idNumber.length === 18) {
      const regex = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/;
      if (!regex.test(idNumber)) {
        return { valid: false, message: '身份证号码格式不正确' };
      }

      // 校验码验证
      const id17 = idNumber.substring(0, 17);
      const checkCode = this.calculateCheckCode(id17);
      if (checkCode !== idNumber[17]) {
        return { valid: false, message: '身份证号码校验码错误' };
      }
    }

    return { valid: true, message: '验证通过' };
  }

  /**
   * 计算身份证校验码
   */
  private calculateCheckCode(id17: string): string {
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += parseInt(id17[i]) * weights[i];
    }
    
    return checkCodes[sum % 11];
  }
}
