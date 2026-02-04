/**
 * AGX Admin 统一错误码定义
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

  // 通用错误
  PARAM_ERROR: 1001,
  UNAUTHORIZED: 1002,
  TOKEN_EXPIRED: 1003,
  TOKEN_INVALID: 1004,
  NO_PERMISSION: 1005,
  RATE_LIMIT: 1006,
  CAPTCHA_ERROR: 1007,
  CAPTCHA_EXPIRED: 1008,

  // 用户模块
  USER_NOT_FOUND: 2001,
  PASSWORD_ERROR: 2002,
  USER_EXISTS: 2003,
  USER_DISABLED: 2004,

  // 交易模块
  TRADE_PAIR_NOT_FOUND: 3001,
  ORDER_NOT_FOUND: 3003,

  // 资产/财务模块
  BALANCE_INSUFFICIENT: 4001,
  COIN_NOT_FOUND: 4009,

  // 管理后台
  ADMIN_NOT_FOUND: 5001,
  ADMIN_PASSWORD_ERROR: 5002,
  ADMIN_DISABLED: 5003,
  CURRENCY_EXISTS: 5004,
  CURRENCY_NOT_FOUND: 5005,
  CONFIG_NOT_FOUND: 5006,
  NOTICE_NOT_FOUND: 5007,
  OPERATION_FORBIDDEN: 5008,

  // 矿池/合约模块
  POOL_NOT_FOUND: 6001,
  POOL_SOLD_OUT: 6002,
  CONTRACT_NOT_FOUND: 6006,

  // 社区/广场模块
  POST_NOT_FOUND: 7001,
  CONTENT_SENSITIVE: 7004,

  // 系统错误
  SYSTEM_ERROR: 9001,
  DATABASE_ERROR: 9002,
  SERVICE_UNAVAILABLE: 9005,
  MAINTENANCE: 9006,
}

/**
 * 错误码消息映射 (中文)
 */
export const ErrorMessage = {
  [ErrorCode.SUCCESS]: '操作成功',

  // 通用错误
  [ErrorCode.PARAM_ERROR]: '参数错误',
  [ErrorCode.UNAUTHORIZED]: '请先登录',
  [ErrorCode.TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [ErrorCode.TOKEN_INVALID]: '登录状态无效',
  [ErrorCode.NO_PERMISSION]: '没有操作权限',
  [ErrorCode.RATE_LIMIT]: '请求过于频繁，请稍后再试',
  [ErrorCode.CAPTCHA_ERROR]: '验证码错误',
  [ErrorCode.CAPTCHA_EXPIRED]: '验证码已过期',

  // 用户模块
  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.PASSWORD_ERROR]: '密码错误',
  [ErrorCode.USER_EXISTS]: '用户已存在',
  [ErrorCode.USER_DISABLED]: '账号已被禁用',

  // 交易模块
  [ErrorCode.TRADE_PAIR_NOT_FOUND]: '交易对不存在',
  [ErrorCode.ORDER_NOT_FOUND]: '订单不存在',

  // 资产/财务模块
  [ErrorCode.BALANCE_INSUFFICIENT]: '余额不足',
  [ErrorCode.COIN_NOT_FOUND]: '币种不存在',

  // 管理后台
  [ErrorCode.ADMIN_NOT_FOUND]: '管理员不存在',
  [ErrorCode.ADMIN_PASSWORD_ERROR]: '管理员密码错误',
  [ErrorCode.ADMIN_DISABLED]: '管理员已禁用',
  [ErrorCode.CURRENCY_EXISTS]: '币种代码已存在',
  [ErrorCode.CURRENCY_NOT_FOUND]: '币种不存在',
  [ErrorCode.CONFIG_NOT_FOUND]: '配置项不存在',
  [ErrorCode.NOTICE_NOT_FOUND]: '公告不存在',
  [ErrorCode.OPERATION_FORBIDDEN]: '该操作被禁止',

  // 矿池/合约模块
  [ErrorCode.POOL_NOT_FOUND]: '矿池产品不存在',
  [ErrorCode.POOL_SOLD_OUT]: '矿池产品已售罄',
  [ErrorCode.CONTRACT_NOT_FOUND]: '合约配置不存在',

  // 社区/广场模块
  [ErrorCode.POST_NOT_FOUND]: '帖子不存在',
  [ErrorCode.CONTENT_SENSITIVE]: '内容包含敏感词',

  // 系统错误
  [ErrorCode.SYSTEM_ERROR]: '系统错误，请稍后再试',
  [ErrorCode.DATABASE_ERROR]: '数据服务异常',
  [ErrorCode.SERVICE_UNAVAILABLE]: '服务暂不可用',
  [ErrorCode.MAINTENANCE]: '系统维护中',
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
