import { Injectable, ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * 简单的速率限制 Guard
 * 防止暴力攻击和 API 滥用
 */
@Injectable()
export class ThrottlerGuard {
  private readonly requests = new Map<string, { count: number; resetTime: number }>();
  private readonly limit: number;
  private readonly ttl: number;

  constructor(
    private reflector: Reflector,
    limit: number = 100, // 默认限制：每个时间窗口100次请求
    ttl: number = 60000, // 默认时间窗口：60秒
  ) {
    this.limit = limit;
    this.ttl = ttl;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // 从 reflector 获取自定义配置
    const throttleLimit = this.reflector.get<number>('throttle-limit', context.getHandler());
    const throttleTtl = this.reflector.get<number>('throttle-ttl', context.getHandler());

    const limit = throttleLimit ?? this.limit;
    const ttl = throttleTtl ?? this.ttl;

    // 使用 IP 地址作为标识符
    const identifier = request.ip || request.connection.remoteAddress;
    const now = Date.now();

    // 清理过期记录
    this.cleanupExpiredRecords(now);

    // 获取或创建请求记录
    let record = this.requests.get(identifier);
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + ttl };
      this.requests.set(identifier, record);
    }

    // 检查是否超过限制
    if (record.count >= limit) {
      throw new HttpException(
        '请求过于频繁，请稍后再试',
        429,
      );
    }

    // 增加计数
    record.count++;

    // 设置响应头
    response.setHeader('X-RateLimit-Limit', limit.toString());
    response.setHeader('X-RateLimit-Remaining', (limit - record.count).toString());
    response.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    return true;
  }

  private cleanupExpiredRecords(now: number): void {
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}
