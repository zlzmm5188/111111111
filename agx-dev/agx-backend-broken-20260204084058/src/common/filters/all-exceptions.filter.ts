import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/nestjs';
import { ResponseBuilder, ApiErrorCode, API_ERROR_MESSAGES } from '../dto/api-response.dto';

/**
 * 全局异常过滤器
 * 基于 API 设计最佳实践
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 默认错误码和消息
    let code = ApiErrorCode.SYSTEM_ERROR;
    let message = API_ERROR_MESSAGES[ApiErrorCode.SYSTEM_ERROR];
    let httpStatus = HttpStatus.OK; // 业务层统一返回 200

    // HTTP 异常处理
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      const status = exception.getStatus();

      // 映射 HTTP 状态码到业务错误码
      code = this.mapHttpStatusToErrorCode(status);

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        
        // 优先使用自定义错误码
        if (typeof resp['code'] === 'number') {
          code = resp['code'];
        }
        
        // 处理消息
        if (typeof resp['message'] === 'string') {
          message = resp['message'];
        } else if (Array.isArray(resp['message'])) {
          message = resp['message'].join('; ');
        } else if (typeof resp['msg'] === 'string') {
          message = resp['msg'];
        } else {
          message = API_ERROR_MESSAGES[code] || message;
        }
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        message = API_ERROR_MESSAGES[code] || message;
      }
    }
    // 其他异常
    else if (exception instanceof Error) {
      message = exception.message || message;
      this.logger.error(
        `[${request.method}] ${request.url} - ${message}`,
        exception.stack,
      );
      
      // 上报非 HTTP 异常到 Sentry
      Sentry.captureException(exception);
    }

    // 记录错误日志
    if (code >= ApiErrorCode.SYSTEM_ERROR) {
      this.logger.error(
        `Error ${code}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    // 返回统一错误响应
    const errorResponse = ResponseBuilder.error(code, message);
    response.status(httpStatus).json(errorResponse);
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
