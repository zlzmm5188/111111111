/**
 * Token检查和修复工具
 * 解决token不一致和自动退出问题
 */

import { tokenStorage } from './security'
import { logger } from './logger'

/**
 * 检查token一致性
 * @returns {boolean} token是否一致
 */
export function checkTokenConsistency() {
  try {
    const sessionToken = sessionStorage.getItem('token')
    const localToken = localStorage.getItem('token')
    
    logger.log('Token检查:')
    logger.log('sessionStorage:', sessionToken ? '有token' : '无token')
    logger.log('localStorage:', localToken ? '有token' : '无token')
    
    if (sessionToken && localToken && sessionToken !== localToken) {
      logger.warn('Token不一致! sessionStorage和localStorage中的token不同')
      return false
    }
    
    if (!sessionToken && localToken) {
      logger.log('从localStorage恢复token到sessionStorage')
      sessionStorage.setItem('token', localToken)
    }
    
    return true
  } catch (error) {
    logger.error('Token检查失败:', error)
    return false
  }
}

/**
 * 获取有效token
 * @returns {string} token或空字符串
 */
export function getValidToken() {
  // 先检查一致性
  checkTokenConsistency()
  
  // 获取token
  const token = tokenStorage.getToken()
  
  if (!token) {
    logger.log('未找到有效token')
    return ''
  }
  
  // 简单验证token格式（至少看起来像JWT）
  if (token.split('.').length !== 3) {
    logger.warn('Token格式异常:', token.substring(0, 20) + '...')
    return ''
  }
  
  return token
}

/**
 * 清除所有token
 */
export function clearAllTokens() {
  try {
    sessionStorage.removeItem('token')
    localStorage.removeItem('token')
    logger.log('已清除所有token')
  } catch (error) {
    logger.error('清除token失败:', error)
  }
}

/**
 * 设置token（确保一致性）
 * @param {string} token - JWT token
 */
export function setTokenConsistently(token) {
  try {
    sessionStorage.setItem('token', token)
    localStorage.setItem('token', token)
    logger.log('Token已设置（确保一致性）')
  } catch (error) {
    logger.error('设置token失败:', error)
  }
}
