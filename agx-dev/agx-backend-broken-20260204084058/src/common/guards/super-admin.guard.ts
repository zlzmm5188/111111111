import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { API_ERROR_MESSAGES, ApiErrorCode } from '../dto/api-response.dto';

/**
 * 超级管理员守卫
 * 仅允许超级管理员（adminGroup = 0）访问
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new HttpException(
        API_ERROR_MESSAGES[ApiErrorCode.UNAUTHORIZED],
        HttpStatus.UNAUTHORIZED,
      );
    }

    const adminGroup = user.adminGroup ?? 999;

    if (adminGroup !== 0) {
      throw new HttpException(
        API_ERROR_MESSAGES[ApiErrorCode.ADMIN_NO_PERMISSION],
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
