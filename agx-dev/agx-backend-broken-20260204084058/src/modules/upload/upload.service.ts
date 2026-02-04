import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;
  private readonly useCloudflare: boolean;

  constructor(private configService: ConfigService) {
    // Cloudflare R2 配置
    const endpoint = this.configService.get<string>('R2_ENDPOINT', '');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY', '');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_KEY', '');
    this.bucketName = this.configService.get<string>('R2_BUCKET', '');
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL', '');
    
    // 检查是否配置了 R2
    this.useCloudflare = !!(endpoint && accessKeyId && secretAccessKey && this.bucketName);

    if (this.useCloudflare) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log(`R2 存储已启用: ${this.bucketName}`);
    } else {
      this.logger.warn('R2 存储未配置，将使用本地存储');
    }
  }

  /**
   * 上传文件到 Cloudflare R2
   */
  async uploadToCloudflare(
    file: Express.Multer.File,
    type: string,
  ): Promise<{ url: string; key: string }> {
    const ext = path.extname(file.originalname).toLowerCase();
    const key = `${type}/${uuidv4()}${ext}`;

    try {
      // 读取文件内容
      const fileContent = fs.readFileSync(file.path);

      // 上传到 R2
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: fileContent,
          ContentType: file.mimetype,
        }),
      );

      // 删除本地临时文件
      fs.unlinkSync(file.path);

      // 返回公开访问 URL
      const url = this.publicUrl 
        ? `${this.publicUrl}/${key}`
        : await this.getSignedUrl(key);

      this.logger.log(`文件已上传到 CF R2: ${key}`);

      return { url, key };
    } catch (error) {
      this.logger.error(`上传到 CF R2 失败: ${error.message}`);
      throw new BadRequestException('文件上传失败');
    }
  }

  /**
   * 获取签名 URL（用于私有访问）
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * 从 Cloudflare R2 删除文件
   */
  async deleteFromCloudflare(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      this.logger.log(`文件已从 CF R2 删除: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`从 CF R2 删除失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 从 Cloudflare R2 获取文件内容（用于 OCR 等处理）
   */
  async getFileBuffer(key: string): Promise<Buffer> {
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      // 将流转换为 Buffer
      const chunks: Buffer[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(`从 CF R2 获取文件失败: ${error.message}`);
      throw new BadRequestException('文件获取失败');
    }
  }

  /**
   * 统一上传接口 - 优先使用 Cloudflare R2
   */
  async uploadFile(
    file: Express.Multer.File,
    type: string,
  ): Promise<{ url: string; key?: string }> {
    if (this.useCloudflare) {
      return this.uploadToCloudflare(file, type);
    }
    
    // 回退到本地存储
    const url = this.getFileUrl(file.filename, type);
    return { url };
  }

  /**
   * 生成本地文件访问URL（备用）
   */
  getFileUrl(filename: string, type: string): string {
    const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3001');
    return `${baseUrl}/uploads/${type}/${filename}`;
  }

  /**
   * 验证文件大小
   */
  validateFileSize(size: number, maxSize: number = 5 * 1024 * 1024): boolean {
    return size <= maxSize;
  }

  /**
   * 验证文件类型
   */
  validateFileType(mimetype: string): boolean {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return allowedMimes.includes(mimetype);
  }

  /**
   * 删除文件（统一接口）
   */
  async deleteFile(keyOrFilename: string, type?: string): Promise<boolean> {
    if (this.useCloudflare && keyOrFilename.includes('/')) {
      return this.deleteFromCloudflare(keyOrFilename);
    }

    // 本地文件删除
    try {
      const filePath = path.join(process.cwd(), 'uploads', type || '', keyOrFilename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('删除文件失败:', error);
      return false;
    }
  }

  /**
   * 检查是否使用 Cloudflare 存储
   */
  isUsingCloudflare(): boolean {
    return this.useCloudflare;
  }

  /**
   * 创建本地上传目录（备用）
   */
  async ensureUploadDirs(): Promise<void> {
    const uploadTypes = ['kyc', 'avatar', 'post', 'others', 'ocr'];
    const baseDir = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    uploadTypes.forEach((type) => {
      const dir = path.join(baseDir, type);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
}
