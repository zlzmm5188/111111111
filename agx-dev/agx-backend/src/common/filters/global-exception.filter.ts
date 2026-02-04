import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorCode, API_ERROR_MESSAGES } from '../dto/api-response.dto';

/**
 * 全局异常过滤器
 * 符合 API 设计最佳实践的错误处理
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 默认状态码和错误信息
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = ApiErrorCode.SYSTEM_ERROR;
    let message = '系统错误';
    let details: any = null;

    // HTTP 异常处理
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;
        message = resp.message || exception.message;
        details = resp.details || resp.error;
      } else {
        message = exceptionResponse as string;
      }

      // 映射 HTTP 状态码到业务错误码
      code = this.mapHttpStatusToErrorCode(status);
    }
    // 其他异常
    else if (exception instanceof Error) {
      message = exception.message;
      details = {
        name: exception.name,
        stack: process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      };
    }

    // 记录错误日志
    this.logger.error(
      `[${request.method}] ${request.url} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // 返回统一错误响应
    response.status(status).json({
      code,
      message,
      data: null,
      timestamp: Date.now(),
      path: request.url,
      details: process.env.NODE_ENV === 'development' ? details : undefined,
    });
  }

  /**
   * 映射 HTTP 状态码到业务错误码
   */
  private mapHttpStatusToErrorCode(status: number): ApiErrorCode {
    const mapping: Record<number, ApiErrorCode> = {
      [HttpStatus.BAD_REQUEST]: ApiErrorCode.INVALID_PARAMS,
      [HttpStatus.UNAUTHORIZED]: ApiErrorCode.UNAUTHORIZED,
      [HttpStatus.FORBIDDEN]: ApiErrorCode.FORBIDDEN,
      [HttpStatus.NOT_FOUND]: ApiErrorCode.NOT_FOUND,
      [HttpStatus.METHOD_NOT_ALLOWED]: ApiErrorCode.METHOD_NOT_ALLOWED,
      [HttpStatus.CONFLICT]: ApiErrorCode.CONFLICT,
      [HttpStatus.TOO_MANY_REQUESTS]: ApiErrorCode.TOO_MANY_REQUESTS,
      [HttpStatus.INTERNAL_SERVER_ERROR]: ApiErrorCode.SYSTEM_ERROR,
    };

    return mapping[status] || ApiErrorCode.UNKNOWN_ERROR;
  }
}
