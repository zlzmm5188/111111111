/**
 * 全局消息提示工具
 * 提供 Toast 消息和 Alert 弹窗功能
 */

import { createApp, h, ref } from 'vue'
import ToastComponent from '../components/common/Toast.vue'
import IOSAlert from '../components/IOSAlert.vue'

// Toast 实例
let toastInstance = null
let toastApp = null

/**
 * 初始化 Toast 容器
 */
const initToast = () => {
  if (toastInstance) return toastInstance
  
  const container = document.createElement('div')
  container.id = 'global-toast-container'
  document.body.appendChild(container)
  
  toastApp = createApp(ToastComponent)
  toastInstance = toastApp.mount(container)
  
  return toastInstance
}

/**
 * Toast 消息提示
 */
export const toast = {
  /**
   * 显示消息
   * @param {string} message - 消息内容
   * @param {Object} options - 配置项
   * @param {string} options.type - 类型: success | error | warning | info
   * @param {number} options.duration - 持续时间(ms)
   * @param {boolean} options.icon - 是否显示图标
   */
  show(message, options = {}) {
    const instance = initToast()
    return instance.show(message, options)
  },
  
  success(message, options = {}) {
    const instance = initToast()
    return instance.success(message, options)
  },
  
  error(message, options = {}) {
    const instance = initToast()
    return instance.error(message, options)
  },
  
  warning(message, options = {}) {
    const instance = initToast()
    return instance.warning(message, options)
  },
  
  info(message, options = {}) {
    const instance = initToast()
    return instance.info(message, options)
  },
  
  clear() {
    if (toastInstance) {
      toastInstance.clear()
    }
  }
}

/**
 * Alert 弹窗 - 替代原生 alert()
 * @param {string} message - 消息内容
 * @param {Object} options - 配置项
 * @param {string} options.title - 标题
 * @param {string} options.confirmText - 确认按钮文字
 * @returns {Promise<void>}
 */
export const showAlert = (message, options = {}) => {
  return new Promise((resolve) => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    
    const app = createApp({
      render() {
        return h(IOSAlert, {
          message,
          title: options.title || '',
          confirmText: options.confirmText || '确定',
          showCancel: false,
          onConfirm: () => {
            resolve()
          },
          onClose: () => {
            setTimeout(() => {
              app.unmount()
              container.remove()
            }, 100)
          }
        })
      }
    })
    
    app.mount(container)
  })
}

/**
 * Confirm 确认弹窗 - 替代原生 confirm()
 * @param {string} message - 消息内容
 * @param {Object} options - 配置项
 * @param {string} options.title - 标题
 * @param {string} options.confirmText - 确认按钮文字
 * @param {string} options.cancelText - 取消按钮文字
 * @returns {Promise<boolean>}
 */
export const showConfirm = (message, options = {}) => {
  return new Promise((resolve) => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    
    const app = createApp({
      render() {
        return h(IOSAlert, {
          message,
          title: options.title || '',
          confirmText: options.confirmText || '确定',
          cancelText: options.cancelText || '取消',
          showCancel: true,
          closeOnClickOverlay: options.closeOnClickOverlay || false,
          onConfirm: () => {
            resolve(true)
          },
          onCancel: () => {
            resolve(false)
          },
          onClose: () => {
            setTimeout(() => {
              app.unmount()
              container.remove()
            }, 100)
          }
        })
      }
    })
    
    app.mount(container)
  })
}

/**
 * 成功提示 (自动消失)
 */
export const showSuccess = (message, duration = 2000) => {
  return toast.success(message, { duration })
}

/**
 * 错误提示 (自动消失)
 */
export const showError = (message, duration = 3000) => {
  return toast.error(message, { duration })
}

/**
 * 警告提示 (自动消失)
 */
export const showWarning = (message, duration = 2500) => {
  return toast.warning(message, { duration })
}

/**
 * 信息提示 (自动消失)
 */
export const showInfo = (message, duration = 2500) => {
  return toast.info(message, { duration })
}

// 默认导出
export default {
  toast,
  showAlert,
  showConfirm,
  showSuccess,
  showError,
  showWarning,
  showInfo
}
