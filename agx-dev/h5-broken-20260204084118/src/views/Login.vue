<template>
  <div class="login-page">
    <!-- 背景 -->
    <div class="bg-layer">
      <div class="grid-pattern"></div>
      <div class="gradient-glow"></div>
    </div>

    <!-- 主内容 -->
    <div class="main-content">
      <!-- 品牌区 -->
      <div class="brand-section">
        <div class="logo-wrap">
          <div class="logo-ring">
            <span class="line-top"></span>
            <span class="line-right"></span>
            <span class="line-bottom"></span>
            <span class="line-left"></span>
          </div>
          <div class="logo-box">
            <img src="/agx-new.png" alt="Ascenda" class="logo-img">
          </div>
        </div>
        <h1 class="brand-name">Ascenda</h1>
        <div class="brand-line">
          <span class="line"></span>
          <span class="dot"></span>
          <span class="line"></span>
        </div>
        <p class="brand-slogan">{{ $t('user.slogan') }}</p>
      </div>

      <!-- 表单区 -->
      <div class="form-section">
        <!-- 用户名 -->
        <div class="form-group">
          <div class="input-box" :class="{ focus: focusField === 'username' }">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input 
              type="text" 
              v-model="form.username"
              :placeholder="$t('user.enterUsername')"
              @focus="focusField = 'username'"
              @blur="focusField = ''"
              autocomplete="username"
            >
          </div>
        </div>

        <!-- 密码 -->
        <div class="form-group">
          <div class="input-box" :class="{ focus: focusField === 'password' }">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <input 
              :type="showPwd ? 'text' : 'password'" 
              v-model="form.password"
              :placeholder="$t('user.enterPassword')"
              @focus="focusField = 'password'"
              @blur="focusField = ''"
              autocomplete="current-password"
            >
            <button class="toggle-btn" @click="showPwd = !showPwd" type="button">
              <svg v-if="!showPwd" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 选项 -->
        <div class="options-row">
          <label class="check-label">
            <input type="checkbox" v-model="rememberMe">
            <span class="checkmark"></span>
            <span>{{ $t('user.rememberLogin') }}</span>
          </label>
          <a class="link-text" @click.prevent="forgotPwd">{{ $t('user.forgotPassword') }}</a>
        </div>

        <!-- 登录按钮 -->
        <button class="submit-btn" :disabled="loading" @click="handleLogin">
          <span v-if="!loading">{{ $t('user.login') }}</span>
          <span v-else class="spinner"></span>
        </button>

        <!-- 注册引导 -->
        <p class="switch-link">
          {{ $t('user.noAccount') }}
          <router-link to="/register">{{ $t('user.registerNow') }}</router-link>
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
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { alert } from '../utils/alert'
import { useUserStore } from '../stores/user'
import api from '../utils/api'
import { validateRequired, validateUsername, validatePassword } from '../utils/validators'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { t } = useI18n()

const focusField = ref('')
const showPwd = ref(false)
const rememberMe = ref(false)
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!validateRequired(form.username)) {
    return alert(t('user.enterUsername'))
  }
  
  const usernameValidation = validateUsername(form.username)
  if (!usernameValidation.valid) {
    return alert(usernameValidation.message)
  }
  
  if (!validateRequired(form.password)) {
    return alert(t('user.enterPassword'))
  }
  
  const passwordValidation = validatePassword(form.password)
  if (!passwordValidation.valid) {
    return alert(passwordValidation.message)
  }
  
  loading.value = true
  try {
    const res = await api.account.login({
      username: form.username.trim(),
      password: form.password
    })
    
    if (res.success && res.data) {
      userStore.setToken(res.data.token)
      if (res.data.user) userStore.setUserInfo(res.data.user)
      if (rememberMe.value) {
        localStorage.setItem('rememberedUsername', form.username)
      } else {
        localStorage.removeItem('rememberedUsername')
      }
      router.push(route.query.redirect || '/home')
    } else {
      alert(res.message || t('user.loginFailed'))
    }
  } catch (e) {
    alert(e.message || t('user.loginFailed'))
  } finally {
    loading.value = false
  }
}

const forgotPwd = () => alert(t('user.contactSupport'))

const saved = localStorage.getItem('rememberedUsername')
if (saved) {
  form.username = saved
  rememberMe.value = true
}
</script>

<style scoped>
.login-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
    linear-gradient(rgba(200, 170, 110, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200, 170, 110, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
}

.gradient-glow {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(200, 170, 110, 0.08) 0%, transparent 70%);
  filter: blur(60px);
}

/* 主内容 */
.main-content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 360px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 品牌区 */
.brand-section {
  text-align: center;
  margin-bottom: 24px;
}

.logo-wrap {
  position: relative;
  width: 64px;
  height: 64px;
  margin: 0 auto 12px;
}

.logo-ring {
  position: absolute;
  inset: -4px;
  border-radius: 24px;
  border: 1px solid rgba(200, 170, 110, 0.15);
  overflow: hidden;
}

/* 上边线条 */
.logo-ring .line-top {
  position: absolute;
  top: 0;
  left: 0;
  width: 40%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #C8AA6E, #C8AA6E, transparent);
  animation: flow-top 2s linear infinite;
}

/* 右边线条 */
.logo-ring .line-right {
  position: absolute;
  top: 0;
  right: 0;
  width: 2px;
  height: 40%;
  background: linear-gradient(180deg, transparent, #C8AA6E, #C8AA6E, transparent);
  animation: flow-right 2s linear infinite;
  animation-delay: 0.5s;
}

/* 下边线条 */
.logo-ring .line-bottom {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40%;
  height: 2px;
  background: linear-gradient(270deg, transparent, #C8AA6E, #C8AA6E, transparent);
  animation: flow-bottom 2s linear infinite;
  animation-delay: 1s;
}

/* 左边线条 */
.logo-ring .line-left {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 2px;
  height: 40%;
  background: linear-gradient(0deg, transparent, #C8AA6E, #C8AA6E, transparent);
  animation: flow-left 2s linear infinite;
  animation-delay: 1.5s;
}

@keyframes flow-top {
  0% { left: -40%; }
  100% { left: 100%; }
}

@keyframes flow-right {
  0% { top: -40%; }
  100% { top: 100%; }
}

@keyframes flow-bottom {
  0% { right: -40%; }
  100% { right: 100%; }
}

@keyframes flow-left {
  0% { bottom: -40%; }
  100% { bottom: 100%; }
}

.logo-box {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.12), rgba(200, 170, 110, 0.04));
  border: 1px solid rgba(200, 170, 110, 0.25);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.brand-name {
  font-size: 24px;
  font-weight: 300;
  color: #F8FAFC;
  letter-spacing: 4px;
  margin: 0 0 8px;
  font-family: 'Georgia', serif;
}

.brand-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 6px;
}

.brand-line .line {
  width: 28px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200, 170, 110, 0.5), transparent);
}

.brand-line .dot {
  width: 5px;
  height: 5px;
  background: #C8AA6E;
  border-radius: 50%;
}

.brand-slogan {
  font-size: 11px;
  color: #C8AA6E;
  letter-spacing: 1px;
  margin: 0;
  position: relative;
  background: linear-gradient(
    90deg,
    #C8AA6E 0%,
    #E8D5A8 25%,
    #C8AA6E 50%,
    #E8D5A8 75%,
    #C8AA6E 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: text-shimmer 3s ease-in-out infinite;
}

@keyframes text-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

/* 表单区 */
.form-section {
  width: 100%;
}

.form-group {
  margin-bottom: 12px;
}

.input-box {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 14px;
  background: linear-gradient(145deg, #1E262F, #181F28);
  border: 1px solid rgba(200, 170, 110, 0.1);
  border-radius: 12px;
  transition: all 0.25s ease;
}

.input-box.focus {
  border-color: rgba(200, 170, 110, 0.4);
  box-shadow: 0 0 0 3px rgba(200, 170, 110, 0.08);
}

.input-icon {
  width: 20px;
  height: 20px;
  color: #8B949E;
  flex-shrink: 0;
  margin-right: 12px;
  transition: color 0.25s;
}

.input-box.focus .input-icon {
  color: #C8AA6E;
}

.input-box input {
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-size: 15px;
  color: #F8FAFC;
  caret-color: #C8AA6E;
}

.input-box input::placeholder {
  color: #6E7681;
}

.toggle-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #8B949E;
  cursor: pointer;
  margin-right: -8px;
  transition: color 0.2s;
}

.toggle-btn:hover { color: #94A3B8; }
.toggle-btn svg { width: 20px; height: 20px; }

/* 选项 */
.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.check-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #8B949E;
}

.check-label input { display: none; }

.checkmark {
  width: 16px;
  height: 16px;
  border: 1.5px solid rgba(200, 170, 110, 0.4);
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

.check-label input:checked + .checkmark {
  background: linear-gradient(135deg, #C8AA6E, #A08050);
  border-color: #C8AA6E;
}

.check-label input:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid #0D1117;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.link-text {
  font-size: 13px;
  color: #C8AA6E;
  text-decoration: none;
  cursor: pointer;
}

.link-text:hover { opacity: 0.8; }

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #0D1117;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(200, 170, 110, 0.25);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(200, 170, 110, 0.35);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
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

/* 注册链接 */
.switch-link {
  margin-top: 16px;
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
  bottom: max(16px, env(safe-area-inset-bottom));
  left: 0;
  right: 0;
}

.copyright {
  font-size: 10px;
  color: #6E7681;
  text-align: center;
  margin: 0;
  letter-spacing: 0.5px;
}

/* 小屏 */
@media (max-height: 600px) {
  .main-content { padding: 12px 20px; }
  .brand-section { margin-bottom: 16px; }
  .logo-wrap { width: 52px; height: 52px; }
  .logo-img { width: 32px; height: 32px; }
  .brand-name { font-size: 20px; margin-bottom: 4px; }
  .brand-line { margin-bottom: 4px; }
  .form-group { margin-bottom: 10px; }
  .input-box { height: 44px; }
  .options-row { margin-bottom: 12px; }
  .submit-btn { height: 44px; }
  .switch-link { margin-top: 12px; }
}
</style>
