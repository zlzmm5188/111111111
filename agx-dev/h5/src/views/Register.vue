<template>
  <div class="register-page">
    <!-- 背景 -->
    <div class="bg-layer">
      <div class="grid-pattern"></div>
    </div>

    <!-- 主内容 -->
    <div class="main-content">
      <!-- 顶部 -->
      <header class="page-header">
        <button class="back-btn" @click="$router.back()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <div class="header-center">
          <span class="header-title">Ascenda</span>
          <span class="header-sub">{{ $t('user.createAccount') }}</span>
        </div>
        <div class="header-space"></div>
      </header>

      <!-- 表单区 -->
      <div class="form-section">
        <!-- 用户名 -->
        <div class="form-group">
          <div class="input-box" :class="{ focus: focusField === 'username', error: usernameError }">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input 
              type="text" 
              v-model="form.username"
              :placeholder="$t('user.enterUsername')"
              @focus="focusField = 'username'"
              @blur="validateUsernameField"
              autocomplete="username"
            >
            <span class="required">*</span>
          </div>
          <p v-if="usernameError" class="error-text">{{ usernameError }}</p>
          <p v-else class="hint-text">4-20位，只能包含字母、数字、下划线</p>
        </div>

        <!-- 密码 -->
        <div class="form-group">
          <div class="input-box" :class="{ focus: focusField === 'password', error: passwordError }">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <input 
              :type="showPwd ? 'text' : 'password'" 
              v-model="form.password"
              :placeholder="$t('user.passwordHint')"
              @focus="focusField = 'password'"
              @blur="validatePasswordField"
              autocomplete="new-password"
            >
            <button class="toggle-btn" @click="showPwd = !showPwd" type="button">
              <svg v-if="!showPwd" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
              </svg>
            </button>
            <span class="required">*</span>
          </div>
          <p v-if="passwordError" class="error-text">{{ passwordError }}</p>
          <p v-else class="hint-text">8-20位</p>
        </div>

        <!-- 确认密码 -->
        <div class="form-group">
          <div class="input-box" :class="{ focus: focusField === 'confirmPwd', success: form.confirmPwd && form.confirmPwd === form.password }">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <input 
              :type="showPwd ? 'text' : 'password'" 
              v-model="form.confirmPwd"
              :placeholder="$t('user.reenterPassword')"
              @focus="focusField = 'confirmPwd'"
              @blur="focusField = ''"
              autocomplete="new-password"
            >
            <svg v-if="form.confirmPwd && form.confirmPwd === form.password" class="check-icon" viewBox="0 0 24 24" fill="#10B981">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
        </div>

        <!-- 邀请码 -->
        <div class="form-group">
          <div class="input-box" :class="{ focus: focusField === 'inviteCode', error: inviteCodeError }">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <input 
              type="text" 
              v-model="form.inviteCode"
              :placeholder="$t('user.enterInviteCode')"
              @focus="focusField = 'inviteCode'"
              @blur="focusField = ''"
              maxlength="6"
            >
            <span class="required">*</span>
          </div>
          <p v-if="inviteCodeError" class="error-text">{{ inviteCodeError }}</p>
          <p v-else class="hint-text">必须填写6位邀请码</p>
        </div>

        <!-- 服务条款 -->
        <div class="terms-wrap">
          <label class="check-label">
            <input type="checkbox" v-model="agreeTerms">
            <span class="checkmark"></span>
            <span class="terms-text">
              {{ $t('user.agreeTerms') }}
              <a @click.stop.prevent="showTerms">{{ $t('user.userAgreement') }}</a>
            </span>
          </label>
        </div>

        <!-- 注册按钮 -->
        <button class="submit-btn" :disabled="loading || !agreeTerms" @click="handleRegister">
          <span v-if="!loading">{{ $t('user.register') }}</span>
          <span v-else class="spinner"></span>
        </button>

        <!-- 登录引导 -->
        <p class="switch-link">
          {{ $t('user.hasAccount') }}
          <router-link to="/login">{{ $t('user.loginNow') }}</router-link>
        </p>
      </div>
    </div>

    <!-- 底部 -->
    <div class="footer">
      <p class="copyright">© 2024 Ascenda Digital Capital Group</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { alert } from '../utils/alert'
import api from '../utils/api'
import { validateRequired } from '../utils/validators'
import { getInviteCode } from '../utils/security'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const focusField = ref('')
const showPwd = ref(false)
const agreeTerms = ref(false)
const loading = ref(false)

const usernameError = ref('')
const passwordError = ref('')
const inviteCodeError = ref('')

const form = reactive({
  username: '',
  password: '',
  confirmPwd: '',
  inviteCode: ''
})

onMounted(() => {
  const refFromQuery = route.query.ref || route.query.inviteCode
  if (refFromQuery) {
    form.inviteCode = refFromQuery
  } else {
    const savedInviteCode = getInviteCode()
    if (savedInviteCode) {
      form.inviteCode = savedInviteCode
    }
  }
})

// 验证用户名（与后端规则一致：4-20位，只能包含字母、数字、下划线）
const validateUsernameField = () => {
  focusField.value = ''
  if (!form.username.trim()) {
    usernameError.value = ''
    return
  }
  const username = form.username.trim()
  if (username.length < 4 || username.length > 20) {
    usernameError.value = '用户名长度 4-20 位'
    return
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    usernameError.value = '用户名只能包含字母、数字、下划线'
    return
  }
  usernameError.value = ''
}

// 验证密码（与后端规则一致：8-20位）
const validatePasswordField = () => {
  focusField.value = ''
  if (!form.password) {
    passwordError.value = ''
    return
  }
  if (form.password.length < 8 || form.password.length > 20) {
    passwordError.value = '密码长度 8-20 位'
    return
  }
  passwordError.value = ''
}

const handleRegister = async () => {
  // 验证用户名
  if (!validateRequired(form.username)) {
    return alert(t('user.enterUsername'))
  }
  
  const username = form.username.trim()
  if (username.length < 4 || username.length > 20) {
    usernameError.value = '用户名长度 4-20 位'
    return alert('用户名长度 4-20 位')
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    usernameError.value = '用户名只能包含字母、数字、下划线'
    return alert('用户名只能包含字母、数字、下划线')
  }
  
  // 验证密码
  if (!validateRequired(form.password)) {
    return alert(t('user.enterPassword'))
  }
  
  if (form.password.length < 8 || form.password.length > 20) {
    passwordError.value = '密码长度 8-20 位'
    return alert('密码长度 8-20 位')
  }
  
  // 确认密码
  if (form.password !== form.confirmPwd) {
    return alert(t('user.passwordMismatch'))
  }
  
  // 验证邀请码（必须是6位）
  if (!form.inviteCode.trim()) {
    inviteCodeError.value = '请输入邀请码'
    return alert('请输入邀请码')
  }
  
  if (form.inviteCode.trim().length !== 6) {
    inviteCodeError.value = '邀请码必须是 6 位'
    return alert('邀请码必须是 6 位')
  }
  
  // 同意条款
  if (!agreeTerms.value) {
    return alert(t('user.pleaseAgreeTerms'))
  }
  
  loading.value = true
  inviteCodeError.value = ''
  
  try {
    const res = await api.account.register({
      username: form.username.trim().toLowerCase(),
      password: form.password,
      inviteCode: form.inviteCode.trim().toUpperCase()
    })
    
    if (res.success) {
      await alert(t('user.registerSuccess'))
      const mainDomain = import.meta.env.VITE_MAIN_DOMAIN || 'agx.bi'
      const currentHost = window.location.hostname
      if (currentHost !== mainDomain && currentHost !== `www.${mainDomain}`) {
        window.location.href = `https://${mainDomain}/login`
      } else {
        router.push('/login')
      }
    } else {
      if (res.message && res.message.includes('邀请码')) {
        inviteCodeError.value = res.message
      }
      alert(res.message || t('user.registerFailed'))
    }
  } catch (e) {
    if (e.message && e.message.includes('邀请码')) {
      inviteCodeError.value = e.message
    }
    alert(e.message || t('user.registerFailed'))
  } finally {
    loading.value = false
  }
}

const showTerms = () => {
  alert(t('user.termsContent'))
}
</script>

<style scoped>
.register-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #0D1117;
  overflow: hidden;
}

/* 背景 */
.bg-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.grid-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(200, 170, 110, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200, 170, 110, 0.025) 1px, transparent 1px);
  background-size: 50px 50px;
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
}

/* 主内容 */
.main-content {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  padding: 0 28px;
  padding-top: max(12px, env(safe-area-inset-top));
}

/* 顶部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  margin-bottom: 8px;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #1E262F, #181F28);
  border: 1px solid rgba(200, 170, 110, 0.15);
  border-radius: 12px;
  color: #C8AA6E;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: rgba(200, 170, 110, 0.3);
}

.back-btn svg { width: 18px; height: 18px; }

.header-center {
  text-align: center;
}

.header-title {
  display: block;
  font-size: 24px;
  font-weight: 300;
  color: #F8FAFC;
  letter-spacing: 3px;
  font-family: 'Georgia', serif;
}

.header-sub {
  display: block;
  font-size: 12px;
  color: #C8AA6E;
  letter-spacing: 2px;
  margin-top: 1px;
}

.header-space { width: 36px; }

/* 表单区 */
.form-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 20px;
}

.form-group {
  margin-bottom: 14px;
}

.input-box {
  display: flex;
  align-items: center;
  height: 54px;
  padding: 0 16px;
  background: linear-gradient(145deg, #1E262F, #181F28);
  border: 1px solid rgba(200, 170, 110, 0.15);
  border-radius: 14px;
  transition: all 0.25s ease;
}

.input-box.focus {
  border-color: rgba(200, 170, 110, 0.4);
  box-shadow: 0 0 0 3px rgba(200, 170, 110, 0.08);
}

.input-box.success {
  border-color: rgba(16, 185, 129, 0.4);
}

.input-box.error {
  border-color: rgba(239, 68, 68, 0.5);
}

.input-icon {
  width: 20px;
  height: 20px;
  color: #8B949E;
  flex-shrink: 0;
  margin-right: 12px;
  transition: color 0.25s;
}

.input-box.focus .input-icon { color: #C8AA6E; }
.input-box.success .input-icon { color: #10B981; }
.input-box.error .input-icon { color: #EF4444; }

.required {
  color: #EF4444;
  font-size: 12px;
  margin-left: 4px;
}

.error-text {
  font-size: 10px;
  color: #EF4444;
  margin: 3px 0 0 4px;
}

.hint-text {
  font-size: 10px;
  color: #6E7681;
  margin: 3px 0 0 4px;
}

.input-box input {
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  color: #F8FAFC;
  caret-color: #C8AA6E;
}

.input-box input::placeholder {
  color: #6E7681;
}

.toggle-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #8B949E;
  cursor: pointer;
  margin-right: -6px;
  transition: color 0.2s;
}

.toggle-btn:hover { color: #94A3B8; }
.toggle-btn svg { width: 16px; height: 16px; }

.check-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* 服务条款 */
.terms-wrap {
  margin: 10px 0 14px;
}

.check-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
}

.check-label input { display: none; }

.checkmark {
  width: 14px;
  height: 14px;
  border: 1.5px solid rgba(200, 170, 110, 0.4);
  border-radius: 3px;
  position: relative;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.2s;
}

.check-label input:checked + .checkmark {
  background: linear-gradient(135deg, #C8AA6E, #A08050);
  border-color: #C8AA6E;
}

.check-label input:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 0px;
  width: 4px;
  height: 7px;
  border: solid #0D1117;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.terms-text {
  font-size: 12px;
  color: #8B949E;
  line-height: 1.5;
}

.terms-text a {
  color: #C8AA6E;
  text-decoration: none;
  cursor: pointer;
}

.terms-text a:hover { text-decoration: underline; }

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  border: none;
  border-radius: 14px;
  font-size: 18px;
  font-weight: 600;
  color: #0D1117;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 6px 20px rgba(200, 170, 110, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(200, 170, 110, 0.35);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 22px;
  height: 22px;
  border: 2.5px solid rgba(13, 17, 23, 0.3);
  border-top-color: #0D1117;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 登录链接 */
.switch-link {
  margin-top: 14px;
  font-size: 13px;
  color: #8B949E;
  text-align: center;
}

.switch-link a {
  color: #C8AA6E;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}

.switch-link a:hover { opacity: 0.8; }

/* 底部 */
.footer {
  position: absolute;
  bottom: max(12px, env(safe-area-inset-bottom));
  left: 0;
  right: 0;
}

.copyright {
  font-size: 10px;
  color: #6E7681;
  text-align: center;
  margin: 0;
}

/* 小屏 */
@media (max-height: 640px) {
  .main-content { padding: 0 16px; padding-top: max(4px, env(safe-area-inset-top)); }
  .page-header { height: 36px; margin-bottom: 4px; }
  .back-btn { width: 32px; height: 32px; }
  .header-title { font-size: 16px; }
  .header-sub { font-size: 9px; }
  .form-section { padding-bottom: 12px; }
  .form-group { margin-bottom: 8px; }
  .input-box { height: 42px; }
  .hint-text, .error-text { margin: 2px 0 0 4px; }
  .terms-wrap { margin: 8px 0 10px; }
  .submit-btn { height: 42px; }
  .switch-link { margin-top: 10px; }
}
</style>
