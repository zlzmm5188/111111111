import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OcrService } from './ocr.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

// 图片文件头魔数验证
const IMAGE_MAGIC_NUMBERS = {
  'ffd8ff': 'image/jpeg',      // JPEG
  '89504e47': 'image/png',     // PNG
  '47494638': 'image/gif',     // GIF
  '52494646': 'image/webp',    // WEBP (RIFF)
  '00000018': 'image/heic',    // HEIC
  '0000001c': 'image/heic',    // HEIC variant
  '00000020': 'image/heif',    // HEIF
};

const validateImageMagicNumber = (buffer: Buffer): boolean => {
  const hex = buffer.slice(0, 4).toString('hex').toLowerCase();
  // 检查是否匹配任一图片格式
  for (const magic of Object.keys(IMAGE_MAGIC_NUMBERS)) {
    if (hex.startsWith(magic.slice(0, hex.length)) || hex.startsWith(magic)) {
      return true;
    }
  }
  return false;
};

// OCR 临时文件配置 - 处理完立即删除
const ocrMulterConfig = {
  storage: diskStorage({
    destination: './uploads/temp',
    filename: (req, file, cb) => {
      const uniqueName = `ocr_${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // 支持移动端常见图片格式，包括HEIC
    const allowedMimes = /^image\/(jpeg|jpg|png|gif|webp|heic|heif|bmp)$/i;
    // 也检查文件扩展名
    const ext = file.originalname.toLowerCase().split('.').pop();
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp'];
    
    if (allowedMimes.test(file.mimetype) || allowedExts.includes(ext) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new BadRequestException('只支持图片格式'), false);
    }
  },
};

@Controller('api/ocr')
@UseGuards(JwtAuthGuard)
export class OcrController {
  private readonly logger = new Logger(OcrController.name);

  constructor(private readonly ocrService: OcrService) {}

  /**
   * 身份证OCR识别（DeepSeek AI）
   * 注意：临时文件处理完后立即删除，不保存在服务器
   */
  @Post('idcard')
  @UseInterceptors(FileInterceptor('file', ocrMulterConfig))
  async recognizeIdCard(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string = 'idcard_front',
  ) {
    if (!file) {
      throw new BadRequestException('请上传身份证照片');
    }

    this.logger.log(`收到身份证OCR请求: ${file.filename}`);

    // 安全检查：验证文件头魔数
    const fileBuffer = fs.readFileSync(file.path);
    if (!validateImageMagicNumber(fileBuffer)) {
      this.cleanupTempFile(file.path);
      this.logger.warn(`可疑文件上传被拦截: ${file.originalname}`);
      throw new BadRequestException('文件格式不合法');
    }

    try {
      const result = await this.ocrService.recognizeIdCardFront(file.path);

      // 立即删除临时文件 - 不在服务器保存任何图片
      this.cleanupTempFile(file.path);

      if (result.idNumber) {
        const validation = this.ocrService.validateIdNumber(result.idNumber);
        
        return {
          code: 0,
          msg: '识别成功',
          data: {
            idNumber: result.idNumber,
            name: result.name,
            confidence: result.confidence || 95,
            valid: validation.valid,
          },
        };
      } else {
        return {
          code: 1,
          msg: 'AI识别未成功，请手动输入或重新拍照',
          data: null,
        };
      }
    } catch (error) {
      // 确保发生错误时也删除临时文件
      this.cleanupTempFile(file.path);
      
      this.logger.error(`OCR识别失败: ${error.message}`);
      return {
        code: 1,
        msg: 'AI识别失败，请手动输入',
        data: null,
      };
    }
  }

  /**
   * 真人检测（DeepSeek AI）
   * 注意：临时文件处理完后立即删除，不保存在服务器
   */
  @Post('liveness')
  @UseInterceptors(FileInterceptor('file', ocrMulterConfig))
  async detectLiveness(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请上传自拍照片');
    }

    this.logger.log(`收到真人检测请求: ${file.filename}`);

    // 安全检查：验证文件头魔数
    const fileBuffer = fs.readFileSync(file.path);
    if (!validateImageMagicNumber(fileBuffer)) {
      this.cleanupTempFile(file.path);
      this.logger.warn(`可疑文件上传被拦截: ${file.originalname}`);
      throw new BadRequestException('文件格式不合法');
    }

    try {
      const result = await this.ocrService.detectLiveness(file.path);

      // 立即删除临时文件 - 不在服务器保存任何图片
      this.cleanupTempFile(file.path);

      return {
        code: result.isReal ? 0 : 1,
        msg: result.isReal ? '检测通过' : (result.reason || '检测未通过'),
        data: {
          isReal: result.isReal,
          confidence: result.confidence,
          reason: result.reason,
        },
      };
    } catch (error) {
      // 确保发生错误时也删除临时文件
      this.cleanupTempFile(file.path);
      
      this.logger.error(`真人检测失败: ${error.message}`);
      return {
        code: 1,
        msg: '检测失败，请重新拍照',
        data: {
          isReal: false,
          confidence: 0,
        },
      };
    }
  }

  /**
   * 验证身份证号码格式
   */
  @Post('validate')
  async validateIdNumber(@Body('idNumber') idNumber: string) {
    if (!idNumber) {
      throw new BadRequestException('请提供身份证号码');
    }

    const result = this.ocrService.validateIdNumber(idNumber);

    return {
      code: result.valid ? 0 : 1,
      msg: result.message,
      data: {
        valid: result.valid,
      },
    };
  }

  /**
   * 清理临时文件 - 安全删除
   */
  private cleanupTempFile(filePath: string): void {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.debug(`临时文件已删除: ${filePath}`);
      }
    } catch (error) {
      this.logger.warn(`删除临时文件失败: ${filePath} - ${error.message}`);
    }
  }
}
