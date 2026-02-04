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
 * 业务异常过滤器
 * 统一处理业务异常和 HTTP 异常
 */
@Catch()
export class BusinessExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(BusinessExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request as any).requestId || 'unknown';

    let code = ApiErrorCode.SYSTEM_ERROR;
    let msg = API_ERROR_MESSAGES[ApiErrorCode.SYSTEM_ERROR];
    let httpStatus = HttpStatus.OK;
    let shouldLogError = true;

    // 处理 HTTP 异常
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      httpStatus = this.getHttpStatus(exception);

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        if (typeof resp['code'] === 'number') {
          code = resp['code'] as number;
          msg = (resp['msg'] as string) || msg;
        } else if (typeof resp['message'] === 'string') {
          msg = resp['message'];
        } else if (Array.isArray(resp['message'])) {
          msg = resp['message'].join(', ');
        }
      } else if (typeof exceptionResponse === 'string') {
        msg = exceptionResponse;
      }

      // 业务异常（4xx）不需要记录错误日志
      shouldLogError = httpStatus >= 500;
    }
    // 处理普通 Error
    else if (exception instanceof Error) {
      msg = exception.message;
      shouldLogError = true;

      // 上报到 Sentry
      Sentry.captureException(exception);
    }

    // 记录错误日志
    if (shouldLogError) {
      this.logger.error(
        `[${requestId}] Exception:`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    // 返回统一格式的错误响应
    response.status(httpStatus).json(ResponseBuilder.error(code, msg));
  }

  private getHttpStatus(exception: HttpException): number {
    const status = exception.getStatus();
    // 业务错误统一返回 200
    return status < 500 ? HttpStatus.OK : status;
  }
}

/**
 * 验证异常过滤器
 * 专门处理 DTO 验证失败的情况
 */
@Catch(Error)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request as any).requestId || 'unknown';

    // 检查是否是验证错误
    if (exception.message.includes('validation')) {
      this.logger.warn(
        `[${requestId}] Validation Error: ${exception.message}`,
      );

      response.status(HttpStatus.OK).json(
        ResponseBuilder.error(ApiErrorCode.INVALID_PARAMS, '参数验证失败'),
      );
      return;
    }

    // 其他错误交给下一个过滤器处理
    throw exception;
  }
}
