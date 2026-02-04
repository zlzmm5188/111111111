import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');
  private readonly slowThreshold = 1000; // 慢请求阈值（毫秒）

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const startTime = Date.now();
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const logLevel = duration > this.slowThreshold ? 'warn' : 'debug';
          
          if (logLevel === 'warn') {
            this.logger.warn(
              `[${requestId}] ${method} ${url} - ${duration}ms (慢请求) - IP: ${ip}`
            );
          } else if (duration > 100) {
            // 只记录超过100ms的请求
            this.logger.debug(
              `[${requestId}] ${method} ${url} - ${duration}ms`
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${requestId}] ${method} ${url} - ${duration}ms - Error: ${error.message}`
          );
        },
      }),
    );
  }
}
