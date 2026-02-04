/**
 * API 统一响应格式
 * 基于 API 设计最佳实践
 */

export interface ApiResponse<T = any> {
  /** 响应状态码 (0=成功, >0=业务错误) */
  code: number;
  
  /** 响应消息 */
  message: string;
  
  /** 响应数据 */
  data: T;
  
  /** 时间戳 */
  timestamp: number;
  
  /** 请求路径 */
  path?: string;
}

export interface PaginatedResponse<T = any> {
  /** 数据列表 */
  items: T[];
  
  /** 总记录数 */
  total: number;
  
  /** 当前页码 */
  page: number;
  
  /** 每页数量 */
  pageSize: number;
  
  /** 总页数 */
  totalPages: number;
  
  /** 是否有下一页 */
  hasNext: boolean;
  
  /** 是否有上一页 */
  hasPrev: boolean;
}

export interface ErrorResponse {
  /** 错误码 */
  code: number;
  
  /** 错误消息 */
  message: string;
  
  /** 错误详情 (开发环境) */
  details?: any;
  
  /** 错误堆栈 (开发环境) */
  stack?: string;
  
  /** 时间戳 */
  timestamp: number;
  
  /** 请求路径 */
  path: string;
  
  /** 请求ID (用于追踪) */
  requestId?: string;
}

/**
 * 成功响应构造器
 */
export class ResponseBuilder {
  /**
   * 构建成功响应
   */
  static success<T>(data: T, message = '操作成功'): ApiResponse<T> {
    return {
      code: 0,
      message,
      data,
      timestamp: Date.now(),
    };
  }

  /**
   * 构建分页响应
   */
  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    pageSize: number,
  ): ApiResponse<PaginatedResponse<T>> {
    const totalPages = Math.ceil(total / pageSize);
    
    return this.success({
      items,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  }

  /**
   * 构建错误响应
   */
  static error(
    code: number,
    message: string,
    details?: any,
  ): ApiResponse<null> {
    return {
      code,
      message,
      data: null,
      timestamp: Date.now(),
    };
  }
}

/**
 * API 错误码定义
 */
export enum ApiErrorCode {
  // 成功
  SUCCESS = 0,

  // 通用错误 (1000-1999)
  UNKNOWN_ERROR = 1000,
  INVALID_PARAMS = 1001,    // PARAM_ERROR 兼容
  PARAM_ERROR = 1001,       // 兼容旧版
  UNAUTHORIZED = 1002,
  TOKEN_EXPIRED = 1003,
  TOKEN_INVALID = 1004,
  FORBIDDEN = 1005,
  NO_PERMISSION = 1005,     // 兼容旧版
  NOT_FOUND = 1006,
  METHOD_NOT_ALLOWED = 1007,
  CONFLICT = 1008,
  TOO_MANY_REQUESTS = 1009,
  RATE_LIMIT = 1009,        // 兼容旧版
  CAPTCHA_ERROR = 1010,
  CAPTCHA_EXPIRED = 1011,

  // 业务错误 - 用户 (2000-2099)
  USER_NOT_FOUND = 2001,
  USER_ALREADY_EXISTS = 2002,
  USER_EXISTS = 2002,       // 兼容旧版
  INVALID_PASSWORD = 2003,
  PASSWORD_ERROR = 2003,    // 兼容旧版
  ACCOUNT_DISABLED = 2004,
  USER_DISABLED = 2004,     // 兼容旧版
  INVITE_CODE_INVALID = 2005,
  KYC_REQUIRED = 2006,
  KYC_PENDING = 2007,

  // 业务错误 - 交易 (2100-2199)
  TRADE_PAIR_NOT_FOUND = 2101,
  ORDER_NOT_FOUND = 2102,
  ORDER_AMOUNT_MIN = 2103,
  ORDER_AMOUNT_MAX = 2104,

  // 业务错误 - 财务 (2200-2299)
  INSUFFICIENT_BALANCE = 2201,
  BALANCE_INSUFFICIENT = 2201,  // 兼容旧版
  WITHDRAW_MIN = 2202,
  WITHDRAW_MAX = 2203,
  WITHDRAW_DAILY_LIMIT = 2204,
  ADDRESS_INVALID = 2205,
  COIN_NOT_FOUND = 2206,
  COIN_DISABLED = 2207,
  CURRENCY_NOT_FOUND = 2208,
  CURRENCY_EXISTS = 2209,

  // 业务错误 - 矿池/合约 (2300-2399)
  POOL_NOT_FOUND = 2301,
  POOL_SOLD_OUT = 2302,
  HOLDING_NOT_FOUND = 2303,
  HOLDING_LOCKED = 2304,
  CONTRACT_NOT_FOUND = 2305,

  // 业务错误 - 社区/广场 (2400-2499)
  POST_NOT_FOUND = 2401,
  CONTENT_SENSITIVE = 2402,
  POST_REVIEW_PENDING = 2403,
  
  // 管理员错误 (3000-3999)
  ADMIN_NOT_FOUND = 3001,
  ADMIN_NO_PERMISSION = 3002,
  ADMIN_ALREADY_EXISTS = 3003,
  ADMIN_PASSWORD_ERROR = 3004,
  ADMIN_USERNAME_EXISTS = 3005,
  OPERATION_FORBIDDEN = 3006,
  
  // 系统错误 (9000-9999)
  SYSTEM_ERROR = 9000,
  DATABASE_ERROR = 9001,
  EXTERNAL_API_ERROR = 9002,
  THIRD_PARTY_ERROR = 9002,  // 兼容旧版
  MAINTENANCE = 9003,
}

/**
 * API 错误码消息映射
 */
export const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  [ApiErrorCode.SUCCESS]: '操作成功',
  [ApiErrorCode.UNKNOWN_ERROR]: '未知错误',
  [ApiErrorCode.INVALID_PARAMS]: '参数错误',
  [ApiErrorCode.UNAUTHORIZED]: '未授权',
  [ApiErrorCode.TOKEN_EXPIRED]: 'Token已过期',
  [ApiErrorCode.TOKEN_INVALID]: 'Token无效',
  [ApiErrorCode.FORBIDDEN]: '无权限',
  [ApiErrorCode.NOT_FOUND]: '资源不存在',
  [ApiErrorCode.METHOD_NOT_ALLOWED]: '方法不允许',
  [ApiErrorCode.CONFLICT]: '资源冲突',
  [ApiErrorCode.TOO_MANY_REQUESTS]: '请求过于频繁',
  [ApiErrorCode.CAPTCHA_ERROR]: '验证码错误',
  [ApiErrorCode.CAPTCHA_EXPIRED]: '验证码已过期',
  
  [ApiErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ApiErrorCode.USER_ALREADY_EXISTS]: '用户已存在',
  [ApiErrorCode.INVALID_PASSWORD]: '密码错误',
  [ApiErrorCode.ACCOUNT_DISABLED]: '账户已禁用',
  [ApiErrorCode.INVITE_CODE_INVALID]: '邀请码无效',
  [ApiErrorCode.KYC_REQUIRED]: '需要KYC认证',
  [ApiErrorCode.KYC_PENDING]: 'KYC审核中',
  
  [ApiErrorCode.TRADE_PAIR_NOT_FOUND]: '交易对不存在',
  [ApiErrorCode.ORDER_NOT_FOUND]: '订单不存在',
  [ApiErrorCode.ORDER_AMOUNT_MIN]: '订单金额过小',
  [ApiErrorCode.ORDER_AMOUNT_MAX]: '订单金额过大',
  
  [ApiErrorCode.INSUFFICIENT_BALANCE]: '余额不足',
  [ApiErrorCode.WITHDRAW_MIN]: '提现金额过小',
  [ApiErrorCode.WITHDRAW_MAX]: '提现金额过大',
  [ApiErrorCode.WITHDRAW_DAILY_LIMIT]: '超出每日提现限额',
  [ApiErrorCode.ADDRESS_INVALID]: '地址无效',
  [ApiErrorCode.COIN_NOT_FOUND]: '币种不存在',
  [ApiErrorCode.COIN_DISABLED]: '币种已禁用',
  [ApiErrorCode.CURRENCY_NOT_FOUND]: '货币不存在',
  [ApiErrorCode.CURRENCY_EXISTS]: '货币已存在',
  
  [ApiErrorCode.POOL_NOT_FOUND]: '矿池产品不存在',
  [ApiErrorCode.POOL_SOLD_OUT]: '矿池产品已售罄',
  [ApiErrorCode.HOLDING_NOT_FOUND]: '持仓不存在',
  [ApiErrorCode.HOLDING_LOCKED]: '持仓已锁定',
  [ApiErrorCode.CONTRACT_NOT_FOUND]: '合约不存在',
  
  [ApiErrorCode.POST_NOT_FOUND]: '帖子不存在',
  [ApiErrorCode.CONTENT_SENSITIVE]: '内容敏感',
  [ApiErrorCode.POST_REVIEW_PENDING]: '帖子审核中',
  
  [ApiErrorCode.ADMIN_NOT_FOUND]: '管理员不存在',
  [ApiErrorCode.ADMIN_NO_PERMISSION]: '管理员权限不足',
  [ApiErrorCode.ADMIN_ALREADY_EXISTS]: '管理员已存在',
  [ApiErrorCode.ADMIN_PASSWORD_ERROR]: '管理员密码错误',
  [ApiErrorCode.ADMIN_USERNAME_EXISTS]: '管理员用户名已存在',
  [ApiErrorCode.OPERATION_FORBIDDEN]: '操作禁止',
  
  [ApiErrorCode.SYSTEM_ERROR]: '系统错误',
  [ApiErrorCode.DATABASE_ERROR]: '数据库错误',
  [ApiErrorCode.EXTERNAL_API_ERROR]: '外部API错误',
  [ApiErrorCode.MAINTENANCE]: '系统维护中',
};

/**
 * 兼容旧版本错误码（用于 BusinessException）
 */
export const ErrorCode = ApiErrorCode;
export type ErrorCode = ApiErrorCode;

/**
 * 获取错误消息（兼容旧版本）
 */
export function getErrorMessage(code: number, defaultMessage = '未知错误'): string {
  return API_ERROR_MESSAGES[code as ApiErrorCode] || defaultMessage;
}

/**
 * 错误消息映射（兼容旧版本）
 */
export const ErrorMessage = API_ERROR_MESSAGES;
