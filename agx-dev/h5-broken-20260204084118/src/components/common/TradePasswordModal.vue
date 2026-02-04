<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="visible" class="password-modal-overlay" @click.self="handleCancel">
        <transition name="modal-scale">
          <div v-if="visible" class="password-modal">
            <!-- 头部 -->
            <div class="modal-header">
              <h3>{{ title }}</h3>
              <button class="close-btn" @click="handleCancel">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- 内容 -->
            <div class="modal-body">
              <p class="modal-tip">{{ tip }}</p>
              
              <!-- 6位密码输入框 -->
              <div class="password-inputs">
                <input
                  v-for="(_, index) in 6"
                  :key="index"
                  :ref="el => inputRefs[index] = el"
                  type="password"
                  inputmode="numeric"
                  maxlength="1"
                  class="password-input"
                  :class="{ filled: password[index], error: hasError }"
                  :value="password[index]"
                  @input="handleInput(index, $event)"
                  @keydown="handleKeydown(index, $event)"
                  @focus="handleFocus(index)"
                  @paste="handlePaste"
                />
              </div>

              <!-- 错误提示 -->
              <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

              <!-- 忘记密码 -->
              <p class="forgot-link" @click="handleForgot">忘记交易密码?</p>
            </div>

            <!-- 底部按钮 -->
            <div class="modal-footer">
              <button class="cancel-btn" @click="handleCancel">取消</button>
              <button 
                class="confirm-btn" 
                :disabled="password.join('').length < 6 || loading"
                @click="handleConfirm"
              >
                <span v-if="loading" class="btn-loading"></span>
                <span v-else>确认</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '请输入交易密码'
  },
  tip: {
    type: String,
    default: '请输入6位数字交易密码'
  }
})

const emit = defineEmits(['confirm', 'cancel', 'forgot'])

const password = ref(['', '', '', '', '', ''])
const inputRefs = ref([])
const loading = ref(false)
const hasError = ref(false)
const errorMsg = ref('')

// 重置状态
const reset = () => {
  password.value = ['', '', '', '', '', '']
  hasError.value = false
  errorMsg.value = ''
  loading.value = false
}

// 监听显示状态
watch(() => props.visible, (val) => {
  if (val) {
    reset()
    nextTick(() => {
      inputRefs.value[0]?.focus()
    })
  }
})

// 处理输入
const handleInput = (index, event) => {
  const value = event.target.value.replace(/\D/g, '')
  
  if (value) {
    password.value[index] = value.slice(-1)
    hasError.value = false
    errorMsg.value = ''
    
    // 自动跳转到下一个
    if (index < 5) {
      nextTick(() => {
        inputRefs.value[index + 1]?.focus()
      })
    }
  } else {
    password.value[index] = ''
  }
}

// 处理键盘事件
const handleKeydown = (index, event) => {
  if (event.key === 'Backspace') {
    if (!password.value[index] && index > 0) {
      // 当前格为空，删除上一格
      password.value[index - 1] = ''
      nextTick(() => {
        inputRefs.value[index - 1]?.focus()
      })
    } else {
      password.value[index] = ''
    }
  } else if (event.key === 'ArrowLeft' && index > 0) {
    inputRefs.value[index - 1]?.focus()
  } else if (event.key === 'ArrowRight' && index < 5) {
    inputRefs.value[index + 1]?.focus()
  } else if (event.key === 'Enter' && password.value.join('').length === 6) {
    handleConfirm()
  }
}

// 处理聚焦
const handleFocus = (index) => {
  // 选中内容
  inputRefs.value[index]?.select()
}

// 处理粘贴
const handlePaste = (event) => {
  event.preventDefault()
  const pasteData = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
  
  if (pasteData) {
    for (let i = 0; i < 6; i++) {
      password.value[i] = pasteData[i] || ''
    }
    
    const focusIndex = Math.min(pasteData.length, 5)
    nextTick(() => {
      inputRefs.value[focusIndex]?.focus()
    })
  }
}

// 确认
const handleConfirm = async () => {
  const pwd = password.value.join('')
  if (pwd.length < 6) return
  
  loading.value = true
  
  try {
    await emit('confirm', pwd)
  } catch (err) {
    hasError.value = true
    errorMsg.value = err.message || '交易密码错误'
    // 清空密码
    password.value = ['', '', '', '', '', '']
    nextTick(() => {
      inputRefs.value[0]?.focus()
    })
  } finally {
    loading.value = false
  }
}

// 取消
const handleCancel = () => {
  reset()
  emit('cancel')
}

// 忘记密码
const handleForgot = () => {
  emit('forgot')
}

// 设置错误
const setError = (msg) => {
  hasError.value = true
  errorMsg.value = msg
  password.value = ['', '', '', '', '', '']
  nextTick(() => {
    inputRefs.value[0]?.focus()
  })
}

// 暴露方法
defineExpose({
  reset,
  setError
})
</script>

<style scoped>
.password-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.password-modal {
  width: 100%;
  max-width: 340px;
  background: linear-gradient(145deg, rgba(30, 35, 42, 0.98) 0%, rgba(22, 27, 34, 0.98) 100%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-header h3 {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  border-radius: 8px;
  color: var(--text-tertiary, #7D8590);
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px 20px;
}

.modal-tip {
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary, #8B949E);
  margin: 0 0 20px;
}

/* 密码输入框 */
.password-inputs {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.password-input {
  width: 44px;
  height: 52px;
  background: rgba(255, 255, 255, 0.06);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  color: var(--text-primary, #E6EDF3);
  outline: none;
  transition: all 0.2s;
  -webkit-text-security: disc;
}

.password-input:focus {
  border-color: var(--color-brand, #C8AA6E);
  background: rgba(200, 170, 110, 0.08);
  box-shadow: 0 0 0 3px rgba(200, 170, 110, 0.15);
}

.password-input.filled {
  border-color: rgba(200, 170, 110, 0.4);
  background: rgba(200, 170, 110, 0.06);
}

.password-input.error {
  border-color: #EF4444;
  background: rgba(239, 68, 68, 0.08);
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

.error-msg {
  text-align: center;
  font-size: 13px;
  color: #EF4444;
  margin: 16px 0 0;
}

.forgot-link {
  text-align: center;
  font-size: 13px;
  color: var(--color-brand, #C8AA6E);
  margin: 20px 0 0;
  cursor: pointer;
}

.forgot-link:hover {
  text-decoration: underline;
}

/* 底部按钮 */
.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px 20px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-secondary, #8B949E);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.confirm-btn {
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E) 0%, #A08A5B 100%);
  color: #1a1a1a;
}

.confirm-btn:hover:not(:disabled) {
  filter: brightness(1.1);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-loading {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(26, 26, 26, 0.3);
  border-top-color: #1a1a1a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-scale-leave-active {
  transition: all 0.2s ease;
}

.modal-scale-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
