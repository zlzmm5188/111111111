import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * 统一日志拦截器
 * 记录所有请求和响应的详细信息
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const requestId = headers['x-request-id'] || this.generateRequestId();

    // 添加请求ID到请求对象
    request.requestId = requestId;

    const startTime = Date.now();

    // 记录请求开始
    this.logger.log(
      `[${requestId}] ${method} ${url} - ${ip} - ${userAgent.substring(0, 50)}`,
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // 记录成功响应
          this.logger.log(
            `[${requestId}] ${method} ${url} - ${statusCode} - ${duration}ms`,
          );

          // 慢查询警告
          if (duration > 1000) {
            this.logger.warn(
              `[${requestId}] SLOW REQUEST: ${method} ${url} took ${duration}ms`,
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          // 记录错误响应
          this.logger.error(
            `[${requestId}] ${method} ${url} - ${statusCode} - ${duration}ms - ${error.message}`,
          );

          // 记录详细错误堆栈
          if (statusCode >= 500) {
            this.logger.error(
              `[${requestId}] Error Stack:`,
              error.stack,
            );
          }
        },
      }),
    );
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * 业务日志拦截器
 * 记录业务操作的关键信息
 */
@Injectable()
export class BusinessLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('BUSINESS');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const className = context.getClass().name;
    const methodName = handler.name;
    const userId = request.user?.id || 'anonymous';
    const requestId = request.requestId || 'unknown';

    return next.handle().pipe(
      tap({
        next: (data) => {
          // 只记录重要的业务操作
          const importantOperations = [
            'create', 'update', 'delete', 'withdraw', 'deposit',
            'transfer', 'trade', 'buy', 'sell', 'approve', 'reject'
          ];

          const isImportant = importantOperations.some(op =>
            methodName.toLowerCase().includes(op),
          );

          if (isImportant) {
            this.logger.log(
              `[${requestId}] User[${userId}] ${className}.${methodName} - Success`,
            );
          }
        },
        error: (error) => {
          this.logger.error(
            `[${requestId}] User[${userId}] ${className}.${methodName} - Failed: ${error.message}`,
          );
        },
      }),
    );
  }
}
