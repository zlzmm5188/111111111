<template>
  <div class="landing-page">
    <!-- 背景装饰 -->
    <div class="bg-effects">
      <div class="glow-top"></div>
      <div class="glow-bottom"></div>
      <div class="particles">
        <span v-for="i in 20" :key="i" :style="particleStyle(i)"></span>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="landing-content">
      <!-- Logo -->
      <div class="brand-section">
        <div class="logo-wrapper">
          <img src="/agx-new.png" alt="AGX" class="logo">
        </div>
        <h1 class="brand-name">AGX</h1>
        <p class="brand-slogan">黄金数字化 · 全球化投资平台</p>
      </div>

      <!-- 邀请人信息 -->
      <div class="inviter-card" v-if="inviterInfo">
        <div class="inviter-avatar">
          <img v-if="inviterInfo.avatar" :src="inviterInfo.avatar" alt="">
          <div v-else class="avatar-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>
            </svg>
          </div>
        </div>
        <div class="inviter-info">
          <span class="inviter-label">您的好友</span>
          <span class="inviter-name">{{ inviterInfo.nickname }}</span>
          <span class="inviter-desc">邀请您加入 AGX</span>
        </div>
      </div>

      <!-- 特权卡片 -->
      <div class="benefits-section">
        <h2 class="section-title">新用户专属特权</h2>
        <div class="benefit-cards">
          <div class="benefit-card">
            <div class="benefit-icon gold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z"/>
                <path d="M12 22V12"/>
                <path d="M3 7l9 5 9-5"/>
              </svg>
            </div>
            <div class="benefit-text">
              <span class="benefit-title">10 AGX</span>
              <span class="benefit-desc">注册即送代币</span>
            </div>
          </div>
          <div class="benefit-card">
            <div class="benefit-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
              </svg>
            </div>
            <div class="benefit-text">
              <span class="benefit-title">高收益</span>
              <span class="benefit-desc">持币生金 日息可观</span>
            </div>
          </div>
          <div class="benefit-card">
            <div class="benefit-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="benefit-text">
              <span class="benefit-title">邀请返佣</span>
              <span class="benefit-desc">最高28%返佣比例</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据展示 -->
      <div class="stats-section">
        <div class="stat-item">
          <span class="stat-value">100,000+</span>
          <span class="stat-label">注册用户</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">$50M+</span>
          <span class="stat-label">交易额</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">100%</span>
          <span class="stat-label">资金安全</span>
        </div>
      </div>

      <!-- 行动按钮 -->
      <div class="action-section">
        <button class="btn-primary" @click="goRegister">
          <span>立即加入</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        <p class="login-hint">
          已有账号？<a @click="goLogin">立即登录</a>
        </p>
      </div>

      <!-- 底部信息 -->
      <div class="footer-section">
        <p class="security-badge">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>安全可信 · 合规运营</span>
        </p>
        <p class="copyright">© 2024 AGX Global. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../utils/api'

defineOptions({
  name: 'InviteLanding'
})

const router = useRouter()
const route = useRoute()

// 邀请码（从二级域名或URL参数获取）
const inviteCode = ref('')
const inviterInfo = ref(null)

// 获取邀请码
const getInviteCode = () => {
  // 1. 从URL路由参数获取 (/i/xxx)
  if (route.params.code) {
    return route.params.code
  }
  // 2. 从二级域名获取 (xxx.agx.bi)
  const hostname = window.location.hostname
  const inviteDomain = import.meta.env.VITE_INVITE_DOMAIN || 'agx.bi'
  const domainParts = inviteDomain.split('.')
  const hostParts = hostname.split('.')
  
  // 如果主机名比邀请域名多一级，说明是二级域名
  if (hostParts.length === domainParts.length + 1) {
    const potentialCode = hostParts[0]
    // 验证剩余部分匹配邀请域名
    const remainingHost = hostParts.slice(1).join('.')
    if (remainingHost === inviteDomain && potentialCode !== 'www') {
      return potentialCode
    }
  }
  // 3. 从URL查询参数获取 (?ref=xxx 或 ?code=xxx)
  return route.query.ref || route.query.code || ''
}

// 获取邀请人信息
const fetchInviterInfo = async () => {
  if (!inviteCode.value) return
  
  try {
    const res = await api.invite.getInviterByCode(inviteCode.value)
    if (res.success && res.data) {
      inviterInfo.value = res.data
    }
  } catch (e) {
    console.error('获取邀请人信息失败', e)
  }
}

// 跳转注册
const goRegister = () => {
  const mainDomain = import.meta.env.VITE_MAIN_DOMAIN || 'agx.bi'
  const registerUrl = `https://${mainDomain}/register?ref=${inviteCode.value}`
  window.location.href = registerUrl
}

// 跳转登录
const goLogin = () => {
  const mainDomain = import.meta.env.VITE_MAIN_DOMAIN || 'agx.bi'
  const loginUrl = `https://${mainDomain}/login`
  window.location.href = loginUrl
}

// 粒子动画样式
const particleStyle = (i) => {
  const size = Math.random() * 4 + 2
  const left = Math.random() * 100
  const delay = Math.random() * 5
  const duration = Math.random() * 10 + 10
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

onMounted(() => {
  inviteCode.value = getInviteCode()
  fetchInviterInfo()
})
</script>

<style scoped>
.landing-page {
  width: 100%;
  max-width: 428px;
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0 auto;
  background: linear-gradient(180deg, #0A0D10 0%, #111419 50%, #0A0D10 100%);
  position: relative;
  overflow: hidden;
}

/* 背景效果 */
.bg-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.glow-top {
  position: absolute;
  width: 300px;
  height: 300px;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(200, 170, 110, 0.15) 0%, transparent 70%);
  filter: blur(60px);
}

.glow-bottom {
  position: absolute;
  width: 400px;
  height: 400px;
  bottom: -150px;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(200, 170, 110, 0.1) 0%, transparent 70%);
  filter: blur(80px);
}

.particles span {
  position: absolute;
  background: rgba(200, 170, 110, 0.6);
  border-radius: 50%;
  animation: float-up 15s linear infinite;
  opacity: 0;
}

@keyframes float-up {
  0% {
    transform: translateY(100vh);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px);
    opacity: 0;
  }
}

/* 主内容 */
.landing-content {
  position: relative;
  z-index: 1;
  padding: 40px 20px 24px;
  padding-top: calc(40px + env(safe-area-inset-top));
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  min-height: 100dvh;
  justify-content: space-between;
}

/* 品牌区域 */
.brand-section {
  text-align: center;
  margin-bottom: 16px;
}

.logo-wrapper {
  width: 72px;
  height: 72px;
  margin: 0 auto 12px;
  position: relative;
}

.logo-wrapper::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 32px;
  background: conic-gradient(
    from 0deg,
    rgba(200, 170, 110, 0.5),
    rgba(200, 170, 110, 0.1),
    rgba(200, 170, 110, 0.5)
  );
  animation: rotate-border 4s linear infinite;
}

.logo-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 24px;
  background: #0A0D10;
}

@keyframes rotate-border {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.logo {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 40px rgba(200, 170, 110, 0.3);
}

.brand-name {
  font-size: 32px;
  font-weight: 800;
  color: #E6EDF3;
  letter-spacing: 4px;
  margin: 0 0 4px;
}

.brand-slogan {
  font-size: 12px;
  color: #C8AA6E;
  letter-spacing: 1px;
  margin: 0;
  opacity: 0.9;
}

/* 邀请人卡片 */
.inviter-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(200, 170, 110, 0.08);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 12px;
  margin-bottom: 16px;
  width: 100%;
  max-width: 300px;
}

.inviter-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(200, 170, 110, 0.15);
}

.inviter-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C8AA6E;
}

.avatar-placeholder svg {
  width: 28px;
  height: 28px;
}

.inviter-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.inviter-label {
  font-size: 12px;
  color: #6E7681;
}

.inviter-name {
  font-size: 15px;
  font-weight: 600;
  color: #E6EDF3;
}

.inviter-desc {
  font-size: 13px;
  color: #C8AA6E;
}

/* 特权区域 */
.benefits-section {
  width: 100%;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #E6EDF3;
  text-align: center;
  margin: 0 0 10px;
}

.benefit-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.benefit-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  transition: all 0.3s;
}

.benefit-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(200, 170, 110, 0.2);
}

.benefit-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.benefit-icon svg {
  width: 20px;
  height: 20px;
}

.benefit-icon.gold {
  background: rgba(200, 170, 110, 0.15);
  color: #C8AA6E;
}

.benefit-icon.blue {
  background: rgba(59, 130, 246, 0.15);
  color: #3B82F6;
}

.benefit-icon.green {
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
}

.benefit-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.benefit-title {
  font-size: 15px;
  font-weight: 600;
  color: #E6EDF3;
}

.benefit-desc {
  font-size: 12px;
  color: #8B949E;
}

/* 数据展示 */
.stats-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px 0;
  margin-bottom: 16px;
  width: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #E6EDF3;
  font-family: 'DIN Alternate', 'SF Mono', monospace;
}

.stat-label {
  font-size: 11px;
  color: #6E7681;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
}

/* 行动按钮 */
.action-section {
  width: 100%;
  max-width: 300px;
}

.btn-primary {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #0D1117;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 6px 24px rgba(200, 170, 110, 0.3);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary svg {
  width: 20px;
  height: 20px;
}

.login-hint {
  text-align: center;
  margin-top: 12px;
  font-size: 13px;
  color: #6E7681;
}

.login-hint a {
  color: #C8AA6E;
  font-weight: 600;
  cursor: pointer;
}

/* 底部 */
.footer-section {
  text-align: center;
  margin-top: auto;
}

.security-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #6E7681;
  margin: 0 0 8px;
}

.security-badge svg {
  color: #C8AA6E;
}

.copyright {
  font-size: 11px;
  color: #484F58;
  margin: 0;
}
</style>
