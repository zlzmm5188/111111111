import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * XSS 防护 Pipe - 清理用户输入中的潜在恶意代码
 */
@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any): any {
    if (typeof value !== 'object' || value === null) {
      return this.sanitizeString(value);
    }

    if (Array.isArray(value)) {
      return value.map(item => this.transform(item));
    }

    const sanitized: any = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        sanitized[key] = this.transform(value[key]);
      }
    }
    return sanitized;
  }

  private sanitizeString(value: any): any {
    if (typeof value !== 'string') {
      return value;
    }

    // 移除危险的 HTML 标签和脚本
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<embed\b[^>]*>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '') // 移除事件处理器如 onclick=
      .replace(/<[^>]*>/g, ''); // 移除所有 HTML 标签
  }
}

/**
 * 可选的 Sanitize Pipe，用于特定字段
 */
@Injectable()
export class OptionalSanitizePipe implements PipeTransform {
  transform(value: any): any {
    return new SanitizePipe().transform(value);
  }
}
