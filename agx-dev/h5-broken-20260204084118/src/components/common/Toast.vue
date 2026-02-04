<template>
  <teleport to="body">
    <transition-group name="toast-slide" tag="div" class="toast-container">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="toast-item"
        :class="[toast.type, { 'with-icon': toast.icon !== false }]"
      >
        <!-- 图标 -->
        <div v-if="toast.icon !== false" class="toast-icon">
          <!-- 成功 -->
          <svg v-if="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M8 12l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <!-- 错误 -->
          <svg v-else-if="toast.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <!-- 警告 -->
          <svg v-else-if="toast.type === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2"/>
          </svg>
          <!-- 信息 -->
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <!-- 内容 -->
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

const show = (message, options = {}) => {
  const id = ++toastId
  const toast = {
    id,
    message,
    type: options.type || 'info',
    icon: options.icon !== false,
    duration: options.duration || 2500
  }
  
  toasts.value.push(toast)
  
  // 自动移除
  setTimeout(() => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }, toast.duration)
  
  return id
}

const success = (message, options = {}) => show(message, { ...options, type: 'success' })
const error = (message, options = {}) => show(message, { ...options, type: 'error' })
const warning = (message, options = {}) => show(message, { ...options, type: 'warning' })
const info = (message, options = {}) => show(message, { ...options, type: 'info' })

const remove = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

const clear = () => {
  toasts.value = []
}

// 暴露方法供外部调用
defineExpose({
  show,
  success,
  error,
  warning,
  info,
  remove,
  clear
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 60px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
  width: 100%;
  max-width: 360px;
  padding: 0 16px;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(30, 35, 42, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 12px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: auto;
  max-width: 100%;
}

.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-content {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #E6EDF3);
  line-height: 1.5;
  word-break: break-word;
}

/* 类型样式 */
.toast-item.success {
  border-color: rgba(16, 185, 129, 0.3);
}
.toast-item.success .toast-icon {
  color: #10B981;
}

.toast-item.error {
  border-color: rgba(239, 68, 68, 0.3);
}
.toast-item.error .toast-icon {
  color: #EF4444;
}

.toast-item.warning {
  border-color: rgba(245, 158, 11, 0.3);
}
.toast-item.warning .toast-icon {
  color: #F59E0B;
}

.toast-item.info {
  border-color: rgba(200, 170, 110, 0.3);
}
.toast-item.info .toast-icon {
  color: #C8AA6E;
}

/* 动画 */
.toast-slide-enter-active {
  transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-slide-leave-active {
  transition: all 0.25s ease-out;
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.toast-slide-move {
  transition: transform 0.3s ease;
}
</style>
