/**
 * 交易密码验证工具
 * 提供交易密码弹窗和验证功能
 */

import { createApp, h, ref } from 'vue'
import TradePasswordModal from '../components/common/TradePasswordModal.vue'
import api from './api'

let currentApp = null
let currentContainer = null

/**
 * 显示交易密码输入弹窗
 * @param {Object} options - 配置项
 * @param {string} options.title - 标题
 * @param {string} options.tip - 提示文字
 * @returns {Promise<string>} - 返回输入的密码
 */
export const showTradePasswordModal = (options = {}) => {
  return new Promise((resolve, reject) => {
    // 清理已存在的实例
    if (currentApp) {
      try {
        currentApp.unmount()
      } catch (e) { /* ignore */ }
      currentApp = null
    }
    if (currentContainer && currentContainer.parentNode) {
      currentContainer.parentNode.removeChild(currentContainer)
      currentContainer = null
    }

    // 创建容器
    const container = document.createElement('div')
    document.body.appendChild(container)
    currentContainer = container

    const visible = ref(true)

    const cleanup = () => {
      visible.value = false
      setTimeout(() => {
        if (currentApp) {
          try {
            currentApp.unmount()
          } catch (e) { /* ignore */ }
          currentApp = null
        }
        if (currentContainer && currentContainer.parentNode) {
          currentContainer.parentNode.removeChild(currentContainer)
          currentContainer = null
        }
      }, 300)
    }

    // 创建组件
    const app = createApp({
      setup() {
        return () => h(TradePasswordModal, {
          visible: visible.value,
          title: options.title || '请输入交易密码',
          tip: options.tip || '请输入6位数字交易密码',
          onConfirm: (password) => {
            cleanup()
            resolve(password)
          },
          onCancel: () => {
            cleanup()
            reject(new Error('用户取消'))
          },
          onForgot: () => {
            cleanup()
            reject(new Error('forgot'))
          }
        })
      }
    })

    currentApp = app
    app.mount(container)
  })
}

/**
 * 验证交易密码
 * @param {string} password - 交易密码
 * @returns {Promise<boolean>}
 */
export const verifyTradePassword = async (password) => {
  const res = await api.post('/account/trade-password/verify', { tradePassword: password })
  if (res.success && res.data?.verified) {
    return true
  }
  throw new Error(res.message || '交易密码错误')
}

/**
 * 获取交易密码状态
 * @returns {Promise<{hasTradePassword: boolean}>}
 */
export const getTradePasswordStatus = async () => {
  const res = await api.get('/account/trade-password/status')
  if (res.success) {
    return res.data
  }
  throw new Error(res.message || '获取状态失败')
}

/**
 * 设置交易密码
 * @param {string} tradePassword - 交易密码
 * @param {string} loginPassword - 登录密码（首次设置需要）
 * @returns {Promise<void>}
 */
export const setTradePassword = async (tradePassword, loginPassword) => {
  const res = await api.post('/account/trade-password', { tradePassword, loginPassword })
  if (!res.success) {
    throw new Error(res.message || '设置失败')
  }
}

/**
 * 修改交易密码
 * @param {string} oldTradePassword - 旧交易密码
 * @param {string} newTradePassword - 新交易密码
 * @returns {Promise<void>}
 */
export const changeTradePassword = async (oldTradePassword, newTradePassword) => {
  const res = await api.put('/account/trade-password', { oldTradePassword, newTradePassword })
  if (!res.success) {
    throw new Error(res.message || '修改失败')
  }
}

/**
 * 需要验证交易密码的操作包装器
 * 自动弹出交易密码输入框并验证
 * @param {Function} action - 需要执行的操作
 * @param {Object} options - 配置项
 * @returns {Promise<any>}
 */
export const withTradePassword = async (action, options = {}) => {
  try {
    // 先检查是否设置了交易密码
    const status = await getTradePasswordStatus()
    
    if (!status.hasTradePassword) {
      throw new Error('请先设置交易密码')
    }

    // 弹出密码输入框
    const password = await showTradePasswordModal(options)
    
    // 验证密码
    await verifyTradePassword(password)
    
    // 执行操作
    return await action(password)
  } catch (err) {
    if (err.message === '用户取消') {
      return null
    }
    throw err
  }
}

export default {
  showTradePasswordModal,
  verifyTradePassword,
  getTradePasswordStatus,
  setTradePassword,
  changeTradePassword,
  withTradePassword
}
