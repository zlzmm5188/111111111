/**
 * AGX 统一错误码定义
 * 与后端保持同步: agx-backend/src/common/dto/api-response.dto.ts
 */

/**
 * 错误码枚举
 * 
 * 错误码规范:
 * - 0: 成功
 * - 1xxx: 通用错误 (参数、认证、权限)
 * - 2xxx: 用户模块错误
 * - 3xxx: 交易模块错误
 * - 4xxx: 资产/财务模块错误
 * - 5xxx: 管理后台错误
 * - 6xxx: 矿池/合约模块错误
 * - 7xxx: 社区/广场模块错误
 * - 9xxx: 系统错误
 */
export const ErrorCode = {
  // 成功
  SUCCESS: 0,

  // 通用错误 (1000-1999)
  UNKNOWN_ERROR: 1000,
  PARAM_ERROR: 1001,
  UNAUTHORIZED: 1002,
  TOKEN_EXPIRED: 1003,
  TOKEN_INVALID: 1004,
  NO_PERMISSION: 1005,
  NOT_FOUND: 1006,
  METHOD_NOT_ALLOWED: 1007,
  CONFLICT: 1008,
  RATE_LIMIT: 1009,
  CAPTCHA_ERROR: 1010,
  CAPTCHA_EXPIRED: 1011,

  // 用户模块 (2000-2099)
  USER_NOT_FOUND: 2001,
  USER_EXISTS: 2002,
  PASSWORD_ERROR: 2003,
  USER_DISABLED: 2004,
  INVITE_CODE_INVALID: 2005,
  KYC_REQUIRED: 2006,
  KYC_PENDING: 2007,

  // 交易模块 (2100-2199)
  TRADE_PAIR_NOT_FOUND: 2101,
  ORDER_NOT_FOUND: 2102,
  ORDER_AMOUNT_MIN: 2103,
  ORDER_AMOUNT_MAX: 2104,

  // 资产/财务模块 (2200-2299)
  BALANCE_INSUFFICIENT: 2201,
  WITHDRAW_MIN: 2202,
  WITHDRAW_MAX: 2203,
  WITHDRAW_DAILY_LIMIT: 2204,
  ADDRESS_INVALID: 2205,
  COIN_NOT_FOUND: 2206,
  COIN_DISABLED: 2207,

  // 矿池/合约模块 (2300-2399)
  POOL_NOT_FOUND: 2301,
  POOL_SOLD_OUT: 2302,
  HOLDING_NOT_FOUND: 2303,
  HOLDING_LOCKED: 2304,
  CONTRACT_NOT_FOUND: 2305,

  // 社区/广场模块 (2400-2499)
  POST_NOT_FOUND: 2401,
  CONTENT_SENSITIVE: 2402,
  POST_REVIEW_PENDING: 2403,

  // 系统错误 (9000-9999)
  SYSTEM_ERROR: 9000,
  DATABASE_ERROR: 9001,
  THIRD_PARTY_ERROR: 9002,
  MAINTENANCE: 9003,
}

/**
 * 错误码消息映射 (中文)
 */
export const ErrorMessage = {
  [ErrorCode.SUCCESS]: '操作成功',

  // 通用错误
  [ErrorCode.UNKNOWN_ERROR]: '未知错误',
  [ErrorCode.PARAM_ERROR]: '参数错误',
  [ErrorCode.UNAUTHORIZED]: '请先登录',
  [ErrorCode.TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [ErrorCode.TOKEN_INVALID]: '登录状态无效',
  [ErrorCode.NO_PERMISSION]: '没有操作权限',
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.METHOD_NOT_ALLOWED]: '方法不允许',
  [ErrorCode.CONFLICT]: '资源冲突',
  [ErrorCode.RATE_LIMIT]: '请求过于频繁，请稍后再试',
  [ErrorCode.CAPTCHA_ERROR]: '验证码错误',
  [ErrorCode.CAPTCHA_EXPIRED]: '验证码已过期',

  // 用户模块
  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.USER_EXISTS]: '用户已存在',
  [ErrorCode.PASSWORD_ERROR]: '密码错误',
  [ErrorCode.USER_DISABLED]: '账号已被禁用',
  [ErrorCode.INVITE_CODE_INVALID]: '邀请码无效',
  [ErrorCode.KYC_REQUIRED]: '请先完成实名认证',
  [ErrorCode.KYC_PENDING]: 'KYC审核中，请耐心等待',

  // 交易模块
  [ErrorCode.TRADE_PAIR_NOT_FOUND]: '交易对不存在',
  [ErrorCode.ORDER_NOT_FOUND]: '订单不存在',
  [ErrorCode.ORDER_AMOUNT_MIN]: '订单金额低于最小限额',
  [ErrorCode.ORDER_AMOUNT_MAX]: '订单金额超过最大限额',

  // 资产/财务模块
  [ErrorCode.BALANCE_INSUFFICIENT]: '余额不足',
  [ErrorCode.WITHDRAW_MIN]: '提现金额低于最小限额',
  [ErrorCode.WITHDRAW_MAX]: '提现金额超过最大限额',
  [ErrorCode.WITHDRAW_DAILY_LIMIT]: '提现金额超过当日限额',
  [ErrorCode.ADDRESS_INVALID]: '钱包地址格式无效',
  [ErrorCode.COIN_NOT_FOUND]: '币种不存在',
  [ErrorCode.COIN_DISABLED]: '币种已禁用',

  // 矿池/合约模块
  [ErrorCode.POOL_NOT_FOUND]: '矿池产品不存在',
  [ErrorCode.POOL_SOLD_OUT]: '矿池产品已售罄',
  [ErrorCode.HOLDING_NOT_FOUND]: '持仓记录不存在',
  [ErrorCode.HOLDING_LOCKED]: '持仓锁定中，暂不可操作',
  [ErrorCode.CONTRACT_NOT_FOUND]: '合约配置不存在',

  // 社区/广场模块
  [ErrorCode.POST_NOT_FOUND]: '帖子不存在',
  [ErrorCode.CONTENT_SENSITIVE]: '内容包含敏感词，请修改后重试',
  [ErrorCode.POST_REVIEW_PENDING]: '帖子审核中',

  // 系统错误
  [ErrorCode.SYSTEM_ERROR]: '系统错误，请稍后再试',
  [ErrorCode.DATABASE_ERROR]: '数据库错误',
  [ErrorCode.THIRD_PARTY_ERROR]: '第三方服务错误',
  [ErrorCode.MAINTENANCE]: '系统维护中，请稍后访问',
}

/**
 * 获取错误消息
 */
export function getErrorMessage(code, defaultMsg = '操作失败') {
  return ErrorMessage[code] || defaultMsg
}

/**
 * 判断是否需要重新登录的错误码
 */
export function isAuthError(code) {
  return [ErrorCode.UNAUTHORIZED, ErrorCode.TOKEN_EXPIRED, ErrorCode.TOKEN_INVALID].includes(code)
}

/**
 * 判断是否是系统级错误
 */
export function isSystemError(code) {
  return code >= 9000 && code < 10000
}

export default { ErrorCode, ErrorMessage, getErrorMessage, isAuthError, isSystemError }
