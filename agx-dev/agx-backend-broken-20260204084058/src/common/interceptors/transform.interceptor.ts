import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseBuilder } from '../dto/api-response.dto';

/**
 * 响应转换拦截器
 * 统一包装所有响应为标准格式
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, any>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // 如果已经是标准响应格式，直接返回
        if (data && typeof data === 'object' && 'code' in data && 'message' in data) {
          return data;
        }

        // 否则包装为标准响应
        return ResponseBuilder.success(data);
      }),
    );
  }
}
