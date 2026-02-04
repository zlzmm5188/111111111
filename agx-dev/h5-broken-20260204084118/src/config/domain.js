/**
 * 域名配置管理
 * 根据主域名自动生成所有相关域名
 */

/**
 * 获取主域名
 * @returns {string} 主域名
 */
export const getMainDomain = () => {
  return import.meta.env.VITE_MAIN_DOMAIN || 'agx.bi'
}

/**
 * 获取API域名
 * @returns {string} API完整URL
 */
export const getApiDomain = () => {
  const mainDomain = getMainDomain()
  
  // 如果是localhost，返回本地API
  if (mainDomain.includes('localhost')) {
    return 'http://localhost:3001'
  }
  
  // 生产环境，自动生成 api.{主域名}
  return `https://api.${mainDomain}`
}

/**
 * 获取WebSocket地址
 * @returns {string} WebSocket完整URL
 */
export const getWsUrl = () => {
  const mainDomain = getMainDomain()
  
  // 如果是localhost，返回本地WebSocket
  if (mainDomain.includes('localhost')) {
    return 'ws://localhost:3001'
  }
  
  // 生产环境，使用 wss://{主域名}
  return `wss://${mainDomain}`
}

/**
 * 获取邀请链接域名
 * @returns {string} 邀请域名
 */
export const getInviteDomain = () => {
  return getMainDomain()
}

/**
 * 获取完整的邀请链接（子域名方式）
 * 格式: {邀请码}.{主域名}
 * 例如: 邀请码123456 + 域名agx.bi = https://123456.agx.bi
 * @param {string} inviteCode - 邀请码
 * @returns {string} 完整邀请链接（子域名格式）
 */
export const getInviteLink = (inviteCode) => {
  const mainDomain = getMainDomain()
  const protocol = mainDomain.includes('localhost') ? 'http' : 'https'
  // 邀请码转小写，生成子域名格式
  const subdomain = inviteCode.toLowerCase()
  return `${protocol}://${subdomain}.${mainDomain}`
}

/**
 * 获取管理后台域名
 * @returns {string} 管理后台URL
 */
export const getAdminDomain = () => {
  const mainDomain = getMainDomain()
  
  if (mainDomain.includes('localhost')) {
    return 'http://localhost:3000'
  }
  
  return `https://admin.${mainDomain}`
}

/**
 * 获取所有域名配置（用于调试）
 * @returns {object} 所有域名配置
 */
export const getAllDomains = () => {
  return {
    main: getMainDomain(),
    api: getApiDomain(),
    ws: getWsUrl(),
    invite: getInviteDomain(),
    admin: getAdminDomain()
  }
}

/**
 * 检查当前是否为生产环境
 * @returns {boolean}
 */
export const isProduction = () => {
  return import.meta.env.VITE_APP_ENV === 'production' || import.meta.env.PROD
}

/**
 * 检查当前是否为开发环境
 * @returns {boolean}
 */
export const isDevelopment = () => {
  return import.meta.env.VITE_APP_ENV === 'development' || import.meta.env.DEV
}
