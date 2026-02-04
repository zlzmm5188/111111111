/**
 * 条件日志工具
 * 在开发环境输出日志，在生产环境自动禁用
 */

const isDevelopment = import.meta.env.MODE === 'development'

/**
 * 开发环境日志（生产环境禁用）
 */
export const logger = {
  log: isDevelopment ? console.log : () => {},
  warn: isDevelopment ? console.warn : () => {},
  error: isDevelopment ? console.error : () => {},
  debug: isDevelopment ? console.debug : () => {},
  info: isDevelopment ? console.info : () => {}
}

/**
 * 保留用于特殊场景的强制日志（如错误上报）
 */
export const forceLog = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
  info: console.info
}

export default logger
