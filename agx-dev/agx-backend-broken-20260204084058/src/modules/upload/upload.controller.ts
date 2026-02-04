import {
  Controller,
  Post,
  Get,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Body,
  BadRequestException,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService } from './upload.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Multer 配置 - 临时存储后上传到 CF
const multerConfig = {
  storage: diskStorage({
    destination: './uploads/temp',
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/)) {
      cb(new BadRequestException('只支持图片格式'), false);
    } else {
      cb(null, true);
    }
  },
};

@Controller('api/upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  /**
   * 单文件上传 - 上传到 Cloudflare R2
   */
  @Post('single')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string = 'others',
  ) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    if (!this.uploadService.validateFileSize(file.size)) {
      throw new BadRequestException('文件大小不能超过5MB');
    }

    if (!this.uploadService.validateFileType(file.mimetype)) {
      throw new BadRequestException('只允许上传图片文件');
    }

    const result = await this.uploadService.uploadFile(file, type);

    return {
      code: 0,
      msg: '上传成功',
      data: {
        url: result.url,
        key: result.key,
        size: file.size,
        mimetype: file.mimetype,
      },
    };
  }

  /**
   * 多文件上传 - 上传到 Cloudflare R2
   */
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 9, multerConfig))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('type') type: string = 'others',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('请选择要上传的文件');
    }

    const results = await Promise.all(
      files.map(async (file) => {
        if (!this.uploadService.validateFileSize(file.size)) {
          throw new BadRequestException(`文件 ${file.originalname} 大小不能超过5MB`);
        }
        if (!this.uploadService.validateFileType(file.mimetype)) {
          throw new BadRequestException(`文件 ${file.originalname} 类型不支持`);
        }
        const result = await this.uploadService.uploadFile(file, type);
        return {
          url: result.url,
          key: result.key,
          size: file.size,
          mimetype: file.mimetype,
        };
      }),
    );

    return {
      code: 0,
      msg: '上传成功',
      data: results,
    };
  }

  /**
   * KYC证件上传 - 上传到 Cloudflare R2
   */
  @Post('kyc')
  @UseInterceptors(FilesInterceptor('files', 3, multerConfig))
  async uploadKyc(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('请上传证件照片');
    }

    const fileTypes = ['front', 'back', 'selfie'];
    const results: any = {};

    await Promise.all(
      files.map(async (file, index) => {
        const fileType = fileTypes[index] || 'other';
        const result = await this.uploadService.uploadFile(file, 'kyc');
        results[fileType] = {
          url: result.url,
          key: result.key,
          size: file.size,
        };
      }),
    );

    return {
      code: 0,
      msg: '上传成功',
      data: results,
    };
  }

  /**
   * 头像上传 - 上传到 Cloudflare R2
   */
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择头像图片');
    }

    if (!this.uploadService.validateFileSize(file.size, 2 * 1024 * 1024)) {
      throw new BadRequestException('头像大小不能超过2MB');
    }

    const result = await this.uploadService.uploadFile(file, 'avatar');

    return {
      code: 0,
      msg: '上传成功',
      data: {
        url: result.url,
        key: result.key,
        size: file.size,
      },
    };
  }

  /**
   * 帖子图片上传 - 上传到 Cloudflare R2
   */
  @Post('post')
  @UseInterceptors(FilesInterceptor('files', 9, multerConfig))
  async uploadPost(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('请选择图片');
    }

    if (files.length > 9) {
      throw new BadRequestException('最多只能上传9张图片');
    }

    const results = await Promise.all(
      files.map(async (file) => {
        const result = await this.uploadService.uploadFile(file, 'post');
        return {
          url: result.url,
          key: result.key,
          size: file.size,
        };
      }),
    );

    return {
      code: 0,
      msg: '上传成功',
      data: results,
    };
  }

  /**
   * 图片代理接口 - 用于后台获取R2中的图片
   * 支持签名URL或直接获取文件
   */
  @Get('proxy')
  async proxyImage(@Query('key') key: string, @Res() res: Response) {
    if (!key) {
      throw new BadRequestException('缺少文件key参数');
    }

    try {
      // 如果key是完整URL，提取实际的key
      let actualKey = key;
      if (key.includes('://')) {
        // 从 URL 中提取 key，如 https://xxx/kyc/uuid.jpg -> kyc/uuid.jpg
        const urlParts = key.split('/');
        actualKey = urlParts.slice(-2).join('/');
      }

      const buffer = await this.uploadService.getFileBuffer(actualKey);
      
      // 设置响应头
      const ext = actualKey.split('.').pop()?.toLowerCase();
      const mimeTypes = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
      };
      
      res.setHeader('Content-Type', mimeTypes[ext] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(buffer);
    } catch (error) {
      this.logger.error(`获取图片失败: ${error.message}`);
      throw new BadRequestException('图片获取失败');
    }
  }
}
