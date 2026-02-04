import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ErrorMessage, getErrorMessage } from '../dto/api-response.dto';

/**
 * 业务异常
 * 用于抛出带有业务错误码的异常
 */
export class BusinessException extends HttpException {
  private readonly errorCode: number;

  constructor(code: number, message?: string) {
    const msg = message || getErrorMessage(code, '未知错误');
    super({ code, msg, data: null }, HttpStatus.OK);
    this.errorCode = code;
  }

  getErrorCode(): number {
    return this.errorCode;
  }

  // ============ 通用错误 ============
  static paramError(message?: string): BusinessException {
    return new BusinessException(ErrorCode.PARAM_ERROR, message);
  }

  static unauthorized(message?: string): BusinessException {
    return new BusinessException(ErrorCode.UNAUTHORIZED, message);
  }

  static tokenExpired(): BusinessException {
    return new BusinessException(ErrorCode.TOKEN_EXPIRED);
  }

  static tokenInvalid(): BusinessException {
    return new BusinessException(ErrorCode.TOKEN_INVALID);
  }

  static noPermission(message?: string): BusinessException {
    return new BusinessException(ErrorCode.NO_PERMISSION, message);
  }

  static rateLimit(): BusinessException {
    return new BusinessException(ErrorCode.RATE_LIMIT);
  }

  static captchaError(): BusinessException {
    return new BusinessException(ErrorCode.CAPTCHA_ERROR);
  }

  static captchaExpired(): BusinessException {
    return new BusinessException(ErrorCode.CAPTCHA_EXPIRED);
  }

  // ============ 用户模块 ============
  static userNotFound(): BusinessException {
    return new BusinessException(ErrorCode.USER_NOT_FOUND);
  }

  static passwordError(): BusinessException {
    return new BusinessException(ErrorCode.PASSWORD_ERROR);
  }

  static userExists(): BusinessException {
    return new BusinessException(ErrorCode.USER_EXISTS);
  }

  static userDisabled(): BusinessException {
    return new BusinessException(ErrorCode.USER_DISABLED);
  }

  static inviteCodeInvalid(): BusinessException {
    return new BusinessException(ErrorCode.INVITE_CODE_INVALID);
  }

  static kycRequired(): BusinessException {
    return new BusinessException(ErrorCode.KYC_REQUIRED);
  }

  static kycPending(): BusinessException {
    return new BusinessException(ErrorCode.KYC_PENDING);
  }

  // ============ 交易模块 ============
  static tradePairNotFound(): BusinessException {
    return new BusinessException(ErrorCode.TRADE_PAIR_NOT_FOUND);
  }

  static orderNotFound(): BusinessException {
    return new BusinessException(ErrorCode.ORDER_NOT_FOUND);
  }

  static orderAmountMin(): BusinessException {
    return new BusinessException(ErrorCode.ORDER_AMOUNT_MIN);
  }

  static orderAmountMax(): BusinessException {
    return new BusinessException(ErrorCode.ORDER_AMOUNT_MAX);
  }

  // ============ 资产/财务模块 ============
  static balanceInsufficient(): BusinessException {
    return new BusinessException(ErrorCode.BALANCE_INSUFFICIENT);
  }

  static withdrawMin(): BusinessException {
    return new BusinessException(ErrorCode.WITHDRAW_MIN);
  }

  static withdrawMax(): BusinessException {
    return new BusinessException(ErrorCode.WITHDRAW_MAX);
  }

  static withdrawDailyLimit(): BusinessException {
    return new BusinessException(ErrorCode.WITHDRAW_DAILY_LIMIT);
  }

  static addressInvalid(): BusinessException {
    return new BusinessException(ErrorCode.ADDRESS_INVALID);
  }

  static coinNotFound(): BusinessException {
    return new BusinessException(ErrorCode.COIN_NOT_FOUND);
  }

  static coinDisabled(): BusinessException {
    return new BusinessException(ErrorCode.COIN_DISABLED);
  }

  // ============ 管理后台 ============
  static adminNotFound(): BusinessException {
    return new BusinessException(ErrorCode.ADMIN_NOT_FOUND);
  }

  static adminPasswordError(): BusinessException {
    return new BusinessException(ErrorCode.ADMIN_PASSWORD_ERROR);
  }

  static adminUsernameExists(): BusinessException {
    return new BusinessException(ErrorCode.ADMIN_USERNAME_EXISTS);
  }

  static currencyExists(): BusinessException {
    return new BusinessException(ErrorCode.CURRENCY_EXISTS);
  }

  static currencyNotFound(): BusinessException {
    return new BusinessException(ErrorCode.CURRENCY_NOT_FOUND);
  }

  static operationForbidden(message?: string): BusinessException {
    return new BusinessException(ErrorCode.OPERATION_FORBIDDEN, message);
  }

  // ============ 矿池/合约模块 ============
  static poolNotFound(): BusinessException {
    return new BusinessException(ErrorCode.POOL_NOT_FOUND);
  }

  static poolSoldOut(): BusinessException {
    return new BusinessException(ErrorCode.POOL_SOLD_OUT);
  }

  static holdingNotFound(): BusinessException {
    return new BusinessException(ErrorCode.HOLDING_NOT_FOUND);
  }

  static holdingLocked(): BusinessException {
    return new BusinessException(ErrorCode.HOLDING_LOCKED);
  }

  static contractNotFound(): BusinessException {
    return new BusinessException(ErrorCode.CONTRACT_NOT_FOUND);
  }

  // ============ 社区/广场模块 ============
  static postNotFound(): BusinessException {
    return new BusinessException(ErrorCode.POST_NOT_FOUND);
  }

  static contentSensitive(): BusinessException {
    return new BusinessException(ErrorCode.CONTENT_SENSITIVE);
  }

  static postReviewPending(): BusinessException {
    return new BusinessException(ErrorCode.POST_REVIEW_PENDING);
  }

  // ============ 系统错误 ============
  static systemError(message?: string): BusinessException {
    return new BusinessException(ErrorCode.SYSTEM_ERROR, message);
  }

  static databaseError(): BusinessException {
    return new BusinessException(ErrorCode.DATABASE_ERROR);
  }

  static thirdPartyError(message?: string): BusinessException {
    return new BusinessException(ErrorCode.THIRD_PARTY_ERROR, message);
  }

  static maintenance(): BusinessException {
    return new BusinessException(ErrorCode.MAINTENANCE);
  }
}
