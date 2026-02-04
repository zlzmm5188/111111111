<!--
 - AGX Admin Login Page
 - Professional Digital Asset Management Platform
-->
<script setup>
import { reactive, ref } from 'vue'
import verifyCode from '@cps/ma-verifyCode/index.vue'
import { useUserStore } from '@/store'
import { useTagStore } from '@/store'
import { useRouter, useRoute } from 'vue-router'
import { request } from '@/utils/request'

const router = useRouter()
const route  = useRoute()
const Verify = ref(null)

const loading = ref(false)

let isDevelop =  import.meta.env.VITE_APP_ENV === 'development'

var odata = isDevelop ?
    { username: 'admin', password: 'Admin123', code: '' }
    : { username: '', password: '', code: '' }


const form = reactive(odata)

const userStore = useUserStore()

const redirect = route.query.redirect ? route.query.redirect : '/'

const handleSubmit = async ({ values, errors }) => {
  if (loading.value) {
    return
  }
  loading.value = true
  if ((isDevelop || Verify.value.checkResult(form.code)) && (! errors)) {
    const result = await userStore.login(form)
    if (! result) {
      loading.value = false
      return
    }
    useTagStore().clearTags()
    router.push(redirect)
  }
  loading.value = false
}
</script>
<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-pattern"></div>
    <div class="bg-overlay"></div>
    
    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 左侧品牌区 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="logo-area">
            <img :src="`${$url}agx-logo.png`" class="logo-img" alt="AGX" />
            <div class="brand-name">AGX</div>
          </div>
          <div class="brand-tagline">数字资产管理平台</div>
          <div class="brand-subtitle">Digital Asset Management Platform</div>
          
          <div class="features">
            <div class="feature-item">
              <icon-safe class="feature-icon" />
              <span>安全可靠的资产管理</span>
            </div>
            <div class="feature-item">
              <icon-dashboard class="feature-icon" />
              <span>实时数据监控分析</span>
            </div>
            <div class="feature-item">
              <icon-user-group class="feature-icon" />
              <span>完善的用户管理体系</span>
            </div>
          </div>
        </div>
        <div class="brand-footer">
          © 2024 AGX. All Rights Reserved.
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="form-section">
        <div class="form-header">
          <h2 class="form-title">管理员登录</h2>
          <p class="form-subtitle">Admin Console</p>
        </div>
        
        <a-form :model="form" @submit="handleSubmit" class="login-form">
          <a-form-item
              field="username"
              :hide-label="true"
              :rules="[{ required: true, message: $t('sys.login.usernameNotice') }]"
          >
            <a-input
                v-model="form.username"
                class="login-input"
                size="large"
                :placeholder="$t('sys.login.username')"
                allow-clear
            >
              <template #prefix><icon-user /></template>
            </a-input>
          </a-form-item>

          <a-form-item
              field="password"
              :hide-label="true"
              :rules="[{ required: true, message: $t('sys.login.passwordNotice') }]"
          >
            <a-input-password
                v-model="form.password"
                :placeholder="$t('sys.login.password')"
                class="login-input"
                size="large"
                allow-clear
            >
              <template #prefix><icon-lock /></template>
            </a-input-password>
          </a-form-item>

          <a-form-item
              v-if="!isDevelop"
              field="code"
              :hide-label="true"
              :rules="[{
              required: true,
              match: /^[a-zA-Z0-9]{4}$/,
              message: $t('sys.login.verifyCodeNotice')
            }]"
          >
            <a-input
                v-model="form.code"
                :placeholder="$t('sys.login.verifyCode')"
                class="login-input"
                size="large"
                allow-clear
            >
              <template #prefix><icon-safe /></template>
              <template #append>
                <verify-code ref="Verify" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item :hide-label="true" class="mt-6">
            <a-button html-type="submit" type="primary" long size="large" :loading="loading" class="login-btn">
              {{ $t('sys.login.loginBtn') }}
            </a-button>
          </a-form-item>
        </a-form>
        
        <div class="form-footer">
          <span class="security-note">
            <icon-lock class="lock-icon" /> 安全连接
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  position: relative;
  overflow: hidden;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.05) 0%, transparent 50%);
  z-index: 1;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  z-index: 1;
}

.login-card {
  display: flex;
  width: 900px;
  min-height: 520px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  z-index: 2;
}

.brand-section {
  width: 45%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 40px 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }
}

.brand-content {
  position: relative;
  z-index: 1;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.logo-img {
  width: 48px;
  height: 48px;
  border-radius: 10px;
}

.brand-name {
  font-size: 32px;
  font-weight: 700;
  color: #d4af37;
  letter-spacing: 4px;
}

.brand-tagline {
  font-size: 20px;
  color: #fff;
  margin-bottom: 4px;
  font-weight: 500;
}

.brand-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 1px;
  margin-bottom: 40px;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.feature-icon {
  color: #d4af37;
  font-size: 18px;
}

.brand-footer {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.form-section {
  width: 55%;
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  margin-bottom: 32px;
  text-align: center;
}

.form-title {
  font-size: 26px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 4px 0;
}

.form-subtitle {
  font-size: 14px;
  color: #86909c;
  margin: 0;
}

.login-form {
  max-width: 320px;
  margin: 0 auto;
  width: 100%;
}

.login-input {
  border-radius: 8px;
  
  :deep(.arco-input-wrapper) {
    border-radius: 8px;
    background: #f7f8fa;
    border: 1px solid #e5e6eb;
    
    &:hover, &:focus-within {
      border-color: #d4af37;
      background: #fff;
    }
  }
}

.login-btn {
  background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
  border: none;
  border-radius: 8px;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  
  &:hover {
    background: linear-gradient(135deg, #e5c04a 0%, #d4af37 100%);
  }
}

.form-footer {
  margin-top: 24px;
  text-align: center;
}

.security-note {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #86909c;
  font-size: 12px;
}

.lock-icon {
  color: #52c41a;
}

:deep(.arco-input-append) {
  padding: 0 !important;
  background: transparent;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-card {
    flex-direction: column;
    width: 90%;
    max-width: 400px;
    min-height: auto;
  }
  
  .brand-section {
    width: 100%;
    padding: 30px 20px;
    
    .features {
      display: none;
    }
  }
  
  .form-section {
    width: 100%;
    padding: 30px 20px;
  }
  
  .brand-subtitle {
    margin-bottom: 0;
  }
}
</style>
