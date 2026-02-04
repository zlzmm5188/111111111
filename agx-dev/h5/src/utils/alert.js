/**
 * 全局消息提示工具
 * 提供 Alert 弹窗和 Toast 消息功能
 */

import { createApp, h, ref } from 'vue'
import IOSAlert from '../components/IOSAlert.vue'
import ToastComponent from '../components/common/Toast.vue'

// ============ Alert 弹窗 ============

let currentApp = null
let currentContainer = null

export const showAlert = (options) => {
  return new Promise((resolve) => {
    // 如果已存在实例，先移除
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

    // 规范化选项
    const props = typeof options === 'string' 
      ? { message: options }
      : { ...options }

    // 清理函数
    const cleanup = () => {
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

    // 创建组件实例
    const app = createApp(IOSAlert, {
      ...props,
      onConfirm: () => {
        cleanup()
        resolve(true)
      },
      onCancel: () => {
        cleanup()
        resolve(false)
      },
      onClose: () => {
        cleanup()
        resolve(false)
      }
    })

    currentApp = app
    app.mount(container)
  })
}

// 确认对话框
export const confirm = (message, title = '提示') => {
  return showAlert({
    title,
    message,
    showCancel: true
  })
}

// 普通提示
export const alert = (message, title = '') => {
  return showAlert({
    title,
    message,
    showCancel: false
  })
}

// 成功提示（弹窗）
export const success = (message) => {
  return showAlert({
    title: '成功',
    message,
    showCancel: false
  })
}

// 错误提示（弹窗）
export const error = (message) => {
  return showAlert({
    title: '错误',
    message,
    showCancel: false
  })
}

// ============ Toast 轻量级消息 ============

let toastInstance = null
let toastContainer = null

const initToast = () => {
  if (toastInstance) return toastInstance
  
  toastContainer = document.createElement('div')
  toastContainer.id = 'global-toast-container'
  document.body.appendChild(toastContainer)
  
  const app = createApp(ToastComponent)
  toastInstance = app.mount(toastContainer)
  
  return toastInstance
}

export const toast = {
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

// 快捷方法 - 自动消失的轻提示
export const showSuccess = (message, duration = 2000) => toast.success(message, { duration })
export const showError = (message, duration = 3000) => toast.error(message, { duration })
export const showWarning = (message, duration = 2500) => toast.warning(message, { duration })
export const showInfo = (message, duration = 2500) => toast.info(message, { duration })

export default {
  showAlert,
  confirm,
  alert,
  success,
  error,
  toast,
  showSuccess,
  showError,
  showWarning,
  showInfo
}
