<template>
  <div class="mine-page">
    <!-- 顶部背景装饰 -->
    <div class="page-bg"></div>

    <!-- 顶部导航栏 -->
    <header class="page-header">
      <div class="header-brand">
        <img src="/company-logo.png" alt="AGX" class="brand-logo">
        <span class="brand-name">{{ brandText }}</span>
      </div>
    </header>

    <!-- 可滚动内容区域 -->
    <div class="page-content">
      <!-- 用户信息卡片 -->
      <div class="user-section" v-if="isLoggedIn">
        <div class="user-card" @click="goToPage('/settings')">
          <div class="user-avatar-wrapper">
            <div class="user-avatar">
              <img v-if="userInfo.avatar" :src="userInfo.avatar" alt="avatar">
              <img v-else src="/agx-new.png" alt="AGX" class="default-avatar">
            </div>
            <!-- 会员铭牌 - 金边黑底样式 -->
            <div class="member-plate" :class="'level-' + userLevel">
              <span class="plate-text">{{ levelText }}</span>
            </div>
          </div>
          <div class="user-detail">
            <div class="user-name-row">
              <span class="user-name">{{ userInfo.nickname || userInfo.username || 'User' }}</span>
            </div>
            <div class="user-meta">
              <span class="uid-text">UID: {{ userInfo.uid || userInfo.id || '-' }}</span>
              <span class="exp-text">{{ $t('mine.expPoints') }}: {{ formatExp(totalPoints) }}</span>
            </div>
          </div>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- 未登录状态 -->
      <div class="login-section" v-else>
        <div class="login-card" @click="goToPage('/login')">
          <div class="login-avatar">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/>
              <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="login-content">
            <div class="login-title">{{ $t('mine.loginRegister') }}</div>
            <div class="login-desc">{{ $t('mine.loginDesc') }}</div>
          </div>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- 资产总览卡片 - 始终显示，未登录时点击跳转登录 -->
      <div class="assets-section">
        <div class="assets-card">
          <!-- 总资产与图片并排 -->
          <div class="assets-top-row">
            <div class="assets-info">
              <div class="assets-header">
                <span class="assets-label">{{ $t('mine.totalAssets') }} (USDT)</span>
                <button class="hide-btn" @click="toggleHideAssets">
                  <svg v-if="hideAssets" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <div class="assets-value">{{ (hideAssets || !isLoggedIn) ? '****' : formatAmount(totalAssets) }}</div>
            </div>
            <img src="/gold-s.png" alt="Gold" class="assets-gold-img">
          </div>
          
          <!-- 币种明细 -->
          <div class="assets-detail">
            <div class="asset-row usdt">
              <div class="asset-left">
                <div class="asset-icon usdt-icon">
                  <img src="https://cryptologos.cc/logos/tether-usdt-logo.png" alt="USDT">
                </div>
                <span class="asset-name">USDT</span>
              </div>
              <span class="asset-amount">{{ (hideAssets || !isLoggedIn) ? '****' : formatAmount(usdtBalance) }}</span>
            </div>
            <div class="asset-row agx">
              <div class="asset-left">
                <div class="asset-icon agx-icon">
                  <img src="/agx-new.png" alt="AGX">
                </div>
                <span class="asset-name">AGX</span>
              </div>
              <span class="asset-amount">{{ (hideAssets || !isLoggedIn) ? '****' : formatAmount(agxBalance) }}</span>
            </div>
            <div class="asset-row gold">
              <div class="asset-left">
                <div class="asset-icon gold-icon">
                  <img src="/gold-bar.png" alt="Gold">
                </div>
                <span class="asset-name">{{ $t('mine.goldLabel') }}</span>
              </div>
              <span class="asset-amount">{{ (hideAssets || !isLoggedIn) ? '****' : goldBalance }}</span>
            </div>
          </div>

          <!-- 快捷操作 - 8个按钮 -->
          <div class="action-grid-8">
            <button class="action-btn" @click="goToPage('/deposit')">
              <div class="action-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 4v12m0 0l-4-4m4 4l4-4" stroke="#C8AA6E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M5 18h14" stroke="#C8AA6E" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <span class="action-label">{{ $t('mine.deposit') }}</span>
            </button>
            <button class="action-btn" @click="goToPage('/withdraw')">
              <div class="action-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 20V8m0 0l-4 4m4-4l4 4" stroke="#C8AA6E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M5 6h14" stroke="#C8AA6E" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <span class="action-label">{{ $t('mine.withdraw') }}</span>
            </button>
            <button class="action-btn" @click="goToPage('/orders')">
              <div class="action-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="4" width="14" height="16" rx="2" stroke="#C8AA6E" stroke-width="1.8"/>
                  <path d="M9 9h6M9 13h6M9 17h4" stroke="#C8AA6E" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </div>
              <span class="action-label">{{ $t('mine.orders') }}</span>
            </button>
            <button class="action-btn" @click="goToPage('/assets')">
              <div class="action-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="6" width="18" height="12" rx="2" stroke="#C8AA6E" stroke-width="1.8"/>
                  <path d="M3 10h18" stroke="#C8AA6E" stroke-width="1.8"/>
                  <circle cx="16" cy="14" r="1.5" fill="#C8AA6E"/>
                </svg>
              </div>
              <span class="action-label">{{ $t('mine.assets') }}</span>
            </button>
            <button class="action-btn" @click="goToPage('/orders')">
              <div class="action-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="#C8AA6E" stroke-width="1.8"/>
                  <rect x="9" y="3" width="6" height="4" rx="1" stroke="#C8AA6E" stroke-width="1.8"/>
                  <path d="M9 12h6M9 16h4" stroke="#C8AA6E" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </div>
              <span class="action-label">{{ $t('mine.tradeRecord') }}</span>
            </button>
            <button class="action-btn" @click="goToPage('/kyc')">
              <div class="action-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="4" width="16" height="16" rx="2" stroke="#C8AA6E" stroke-width="1.8"/>
                  <circle cx="12" cy="10" r="3" stroke="#C8AA6E" stroke-width="1.8"/>
                  <path d="M7 17c0-2 2.5-3 5-3s5 1 5 3" stroke="#C8AA6E" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </div>
              <span class="action-label">{{ $t('mine.realNameAuth') }}</span>
            </button>
            <button class="action-btn" @click="goToPage('/tasks')">
              <div class="action-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 2z" stroke="#C8AA6E" stroke-width="1.8" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="action-label">{{ $t('task.title') }}</span>
            </button>
            <button class="action-btn" @click="goToPage('/invite')">
              <div class="action-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="#C8AA6E" stroke-width="1.8" stroke-linecap="round"/>
                  <circle cx="9" cy="7" r="4" stroke="#C8AA6E" stroke-width="1.8"/>
                  <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#C8AA6E" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </div>
              <span class="action-label">{{ $t('mine.inviteFriends') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 核心团队架构 / Core Team Structure -->
      <div class="core-team-section">
        <div class="section-header">
          <div class="section-title-wrapper">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.8"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="section-titles">
              <span class="section-title-cn">核心团队架构</span>
              <span class="section-title-en">Core Team Structure</span>
            </div>
          </div>
        </div>
        
        <!-- 公司信息卡片 -->
        <div class="team-info-card" @click="goToPage('/about')">
          <div class="info-card-icon company-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 21h18M4 21V7l8-4v18M12 21V3l8 4v14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 9h1M7 13h1M15 9h1M15 13h1M7 17h1M15 17h1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="info-card-content">
            <div class="info-card-title">升达数字资产集团</div>
            <div class="info-card-subtitle">Shengda Digital Capital Group</div>
            <div class="info-card-desc">专注数字资产投资与管理的全球化金融科技集团</div>
          </div>
          <svg class="info-card-arrow" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <!-- 团队介绍卡片 - 放在中间 -->
        <div class="team-info-card" @click="goToPage('/team')">
          <div class="info-card-icon team-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.8"/>
              <path d="M5.5 21c0-3.9 2.9-7 6.5-7s6.5 3.1 6.5 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <circle cx="19" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M21 17c0-1.7-1-3-2.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="5" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M3 17c0-1.7 1-3 2.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="info-card-content">
            <div class="info-card-title">核心管理团队</div>
            <div class="info-card-subtitle">Executive Leadership Team</div>
            <div class="info-card-desc">由资深金融与科技专家组成的精英管理团队</div>
          </div>
          <svg class="info-card-arrow" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <!-- 会员体系卡片 -->
        <div class="team-info-card" @click="goToPage('/membership')">
          <div class="info-card-icon member-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 2z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              <circle cx="12" cy="17" r="3" stroke="currentColor" stroke-width="1.5"/>
              <path d="M12 20v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="info-card-content">
            <div class="info-card-title">升达主权会员体系</div>
            <div class="info-card-subtitle">Ascenda Sovereign Membership Program</div>
            <div class="info-card-desc">六级会员权益体系，尊享专属投资特权与服务</div>
          </div>
          <svg class="info-card-arrow" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- 关于AGX卡片 -->
      <div class="about-card" @click="goToPage('/about')">
        <div class="about-left">
          <div class="about-logo">
            <img src="/agx-new.png" alt="AGX" loading="lazy">
          </div>
          <div class="about-info">
            <div class="about-title">{{ $t('mine.companyName') }}</div>
            <div class="about-desc">{{ $t('mine.companyNameEn') }}</div>
          </div>
        </div>
        <div class="about-right">
          <span class="about-version">v2.2.0</span>
          <svg class="about-arrow" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- 退出登录 -->
      <div class="logout-section" v-if="isLoggedIn">
        <button class="logout-btn" @click="handleLogout">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ $t('user.logout') }}
        </button>
      </div>

      <!-- 底部安全区 -->
      <div class="safe-bottom"></div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'Mine'
})

import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../stores/user'
import api from '../utils/api'

const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()

// 品牌名称波浪动画
const brandText = 'Shengda Digital Capital Group'

// 登录状态
const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo || {})

// 资产数据
const totalAssets = ref(0)
const usdtBalance = ref(0)
const agxBalance = ref(0)
const goldBalance = ref('0.00')
const stakingAmount = ref(0)
const dailyEarning = ref('0.00')
const hideAssets = ref(localStorage.getItem('hideAssets') === 'true')

// 邀请数据
const inviteCount = ref(0)

// 新手任务数据
const completedTasks = ref(0)
const totalTasks = ref(5)
const taskReward = ref(100)
const taskProgress = computed(() => {
  return totalTasks.value > 0 ? Math.round((completedTasks.value / totalTasks.value) * 100) : 0
})

// KYC状态
const kycStatus = ref(0)
const kycText = computed(() => {
  const map = { 
    0: t('kyc.notVerified'), 
    1: t('kyc.pending'), 
    2: t('kyc.verified'), 
    3: t('kyc.rejected') 
  }
  return map[kycStatus.value] || t('kyc.notVerified')
})
const kycClass = computed(() => {
  const map = { 0: 'unverified', 1: 'pending', 2: 'verified', 3: 'rejected' }
  return map[kycStatus.value] || 'unverified'
})

// VIP等级（使用前端 i18n 统一翻译）
const memberLevelInfo = ref(null)
const totalPoints = ref(0)  // 经验值（1U = 1点）
const userLevel = computed(() => memberLevelInfo.value?.level ?? userInfo.value.vipLevel ?? 0)
const levelText = computed(() => {
  // 等级0-5，与后端保持一致
  const levels = [
    t("mine.levels.initiate"),  // 0级：启蒙会员
    t("mine.levels.normal"),    // 1级：准入会员
    t("mine.levels.silver"),    // 2级：优选会员
    t("mine.levels.gold"),      // 3级：资本合伙人
    t("mine.levels.diamond"),   // 4级：执行官合伙人
    t("mine.levels.black")      // 5级：主权合伙人
  ]
  return levels[Math.min(userLevel.value, 5)] || t("mine.levels.initiate")
})
const levelTextEn = computed(() => {
  if (memberLevelInfo.value?.nameEn) {
    return `(${memberLevelInfo.value.nameEn})`
  }
  const levels = ['(Initiate)', '(Access)', '(Select)', '(Capital)', '(Executive)', '(Sovereign)']
  return levels[Math.min(userLevel.value, 5)] || '(Initiate)'
})
const levelColor = computed(() => {
  if (memberLevelInfo.value?.color) {
    return memberLevelInfo.value.color
  }
  const colors = ["#8B949E", "#8B9DC3", "#4A90D9", "#C8AA6E", "#9B59B6", "#C8AA6E"]
  return colors[Math.min(userLevel.value, 5)] || "#8B949E"
})
const vipClass = computed(() => {
  const classes = ['vip-0', 'vip-1', 'vip-2', 'vip-3', 'vip-4', 'vip-5']
  return classes[Math.min(userLevel.value, 5)] || 'vip-0'
})
const vipGradient = computed(() => {
  const gradients = [
    'linear-gradient(135deg, #8B949E, #6C757D)',  // vip-0
    'linear-gradient(135deg, #8B9DC3, #6B8E23)',  // vip-1
    'linear-gradient(135deg, #4A90D9, #1E90FF)',  // vip-2
    'linear-gradient(135deg, #C8AA6E, #FFD700)',  // vip-3
    'linear-gradient(135deg, #9B59B6, #7E57C2)',  // vip-4
    'linear-gradient(135deg, #C8AA6E, #B8860B)'   // vip-5
  ]
  return gradients[Math.min(userLevel.value, 5)] || gradients[0]
})
// 返佣比例根据有效邀请人数计算（后端9档位）
const commissionRate = computed(() => {
  const count = inviteCount.value || 0
  if (count >= 60) return 28
  if (count >= 40) return 20
  if (count >= 28) return 15
  if (count >= 20) return 12
  if (count >= 15) return 9
  if (count >= 9) return 6
  if (count >= 5) return 3
  if (count >= 3) return 1.5
  if (count >= 1) return 0.5
  return 0.5
})
// 下一档位所需邀请人数
const nextLevelRequire = computed(() => {
  const count = inviteCount.value || 0
  if (count >= 60) return 60
  if (count >= 40) return 60
  if (count >= 28) return 40
  if (count >= 20) return 28
  if (count >= 15) return 20
  if (count >= 9) return 15
  if (count >= 5) return 9
  if (count >= 3) return 5
  if (count >= 1) return 3
  return 1
})

// 未读消息
const unreadCount = ref(0)

// 格式化金额
const formatAmount = (amount) => {
  if (!amount) return '0.00'
  return parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化经验值
const formatExp = (points) => {
  const num = parseFloat(points) || 0
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return Math.floor(num).toString()
}

// 切换资产隐藏
const toggleHideAssets = () => {
  hideAssets.value = !hideAssets.value
  localStorage.setItem('hideAssets', hideAssets.value)
}

// 需要登录才能访问的路径
// 路由跳转（由路由守卫统一处理认证）
const goToPage = (path) => {
  // 直接跳转，让路由守卫统一处理认证
  router.push(path)
}

// 退出登录
const handleLogout = () => {
  if (confirm(t('mine.confirmLogout'))) {
    userStore.logout()
    router.push('/login')
  }
}

// 加载数据
const loadData = async () => {
  if (!isLoggedIn.value) return

  // 逐个加载核心数据，避免并发请求导致401
  // 1. 先加载KYC状态
  try {
    const kycRes = await api.account.getKycStatus()
    if (kycRes.success && kycRes.data) {
      kycStatus.value = kycRes.data.kycStatus || kycRes.data.status || 0
    }
  } catch (e) {
    console.error('[Mine] KYC加载失败:', e)
  }

  // 2. 加载资产数据
  try {
    const assetsRes = await api.account.balance()
    if (assetsRes.success && assetsRes.data) {
      const data = assetsRes.data
      
      // 优先使用后端汇总字段（与 account.service.ts:534 对齐）
      // 后端返回: { assets, totalUsdValue, spotTotal, earnTotal, contractTotal }
      
      // 直接使用后端返回的总资产
      totalAssets.value = parseFloat(data.totalUsdValue || data.totalUsd || data.total || 0)
      goldBalance.value = data.goldOz || '0.00'
      
      // 从资产列表中提取各币种余额
      const assetList = data.assets || data.list || data.balances || []
      if (Array.isArray(assetList)) {
        assetList.forEach(item => {
          const currency = item.symbol || item.currency || item.coin || item.asset
          // 直接使用后端返回的 balance（可用余额），不再做 balance - locked 计算
          const balance = parseFloat(item.balance || item.available || 0)
          
          if (currency === 'USDT') {
            usdtBalance.value = balance
          } else if (currency === 'AGX') {
            agxBalance.value = balance
          }
        })
      } else {
        // 对象格式兼容
        usdtBalance.value = parseFloat(data.usdt || data.USDT || 0)
        agxBalance.value = parseFloat(data.agx || data.AGX || 0)
      }
    }
  } catch (e) {
    console.error('[Mine] 资产加载失败:', e)
    totalAssets.value = 0
    usdtBalance.value = 0
    agxBalance.value = 0
    goldBalance.value = '0.00'
  }

  // 3. 次要数据延迟异步加载（性能优化：不阻塞首屏渲染）
  setTimeout(() => {
    // 质押信息
    api.pool.getHoldings().then(res => {
      if (res.success && res.data) {
        const holdings = res.data?.list || res.data || []
        stakingAmount.value = holdings.reduce((sum, h) => sum + (parseFloat(h.amount) || 0), 0)
        dailyEarning.value = holdings.reduce((sum, h) => sum + (parseFloat(h.dailyIncome) || 0), 0).toFixed(2)
      }
    }).catch(e => console.warn('[Mine] 质押信息加载失败:', e.message))

    // 邀请数据
    api.invite.getInfo().then(res => {
      if (res.success && res.data) {
        inviteCount.value = res.data?.inviteCount || 0
      }
    }).catch(e => console.warn('[Mine] 邀请数据加载失败:', e.message))

    // 新手任务进度
    api.task?.getProgress?.().then(res => {
      if (res.success && res.data) {
        completedTasks.value = res.data?.completed || 0
        totalTasks.value = res.data?.total || 5
        taskReward.value = res.data?.totalReward || 100
      }
    }).catch(e => console.warn('[Mine] 任务进度加载失败:', e.message))

    // 会员等级
    api.account.getMyLevel().then(res => {
      if (res.success && res.data) {
        memberLevelInfo.value = res.data
        totalPoints.value = res.data.totalPoints || res.data.totalRecharge || 0
      }
    }).catch(e => console.warn('[Mine] 会员等级加载失败:', e.message))

    // 通知
    api.account.getNotices().then(res => {
      if (res.success && res.data) {
        const notices = res.data?.list || res.data || []
        unreadCount.value = notices.filter(n => !n.read && !n.isRead).length
      }
    }).catch(e => console.warn('[Mine] 通知加载失败:', e.message))
  }, 300) // 延迟300ms加载次要数据
}

// 监听登录状态
watch(isLoggedIn, (val) => {
  if (val) loadData()
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* ==================== Pro Max 3D 立体风格 ==================== */

/* 页面容器 */
.mine-page {
  width: 100%;
  max-width: 428px;
  min-height: 100vh;
  margin: 0 auto;
  background: #000000;
  position: relative;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

/* 背景 - 纯黑色 */
.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  max-width: 428px;
  margin: 0 auto;
  background: #000000;
  pointer-events: none;
  z-index: 0;
  will-change: transform;
  transform: translateZ(0);
}

/* 顶部导航栏 - 3D 质感 */
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  max-width: 428px;
  margin: 0 auto;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 16px;
  padding: 0 16px;
  padding-top: env(safe-area-inset-top, 0px);
  background: linear-gradient(180deg, #1C242E 0%, #161C24 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  /* 使用 will-change 优化渲染性能，避免闪烁 */
  will-change: transform;
  transform: translateZ(0);
}

/* 底部金色装饰线 */
.page-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.4) 30%, #C8AA6E 50%, rgba(200, 170, 110, 0.4) 70%, transparent 100%);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 34px;
  height: 34px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.brand-name {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  /* 性能优化：使用整体动画代替每字符独立动画 */
  background: linear-gradient(
    180deg, 
    #F5E6C4 0%,
    #C8AA6E 50%, 
    #A08A5B 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: brandFlow 0.8s ease-out forwards;
}

@keyframes brandFlow {
  0% { 
    opacity: 0;
    transform: translateX(-20px);
  }
  100% { 
    opacity: 1;
    transform: translateX(0);
  }
}


/* 内容区域 */
.page-content {
  position: relative;
  padding: 68px 0 0;
  z-index: 1;
}

/* ==================== 用户信息卡片 - Pro Max 3D ==================== */
.user-section {
  margin-bottom: 14px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  margin: 0 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* 右上角KYC标签 */
.kyc-badge-corner {
  position: absolute;
  top: 12px;
  right: 40px;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 10px;
  background: rgba(94, 102, 115, 0.3);
  color: #8B95A5;
  border: 1px solid rgba(94, 102, 115, 0.4);
}

.kyc-badge-corner.verified {
  background: rgba(200, 170, 110, 0.15);
  color: #C8AA6E;
  border-color: rgba(200, 170, 110, 0.3);
}

/* 右上角会员等级标签 */
.member-badge-corner {
  position: absolute;
  top: 12px;
  right: 40px;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 10px;
  font-weight: 500;
}

.member-badge-corner.level-1 {
  background: rgba(139, 157, 195, 0.15);
  color: #8B9DC3;
  border: 1px solid rgba(139, 157, 195, 0.3);
}

.member-badge-corner.level-2 {
  background: rgba(74, 144, 217, 0.15);
  color: #4A90D9;
  border: 1px solid rgba(74, 144, 217, 0.3);
}

.member-badge-corner.level-3 {
  background: rgba(212, 175, 55, 0.15);
  color: #C8AA6E;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.member-badge-corner.level-4 {
  background: rgba(155, 89, 182, 0.15);
  color: #9B59B6;
  border: 1px solid rgba(155, 89, 182, 0.3);
}

.member-badge-corner.level-5 {
  background: rgba(201, 169, 98, 0.15);
  color: #C8AA6E;
  border: 1px solid rgba(201, 169, 98, 0.3);
}

/* 会员等级行 */
.user-level {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.level-text {
  font-size: 13px;
  font-weight: 500;
}

.level-text-en {
  font-size: 11px;
  color: #6E7681;
}

/* 顶部银色装饰线 */
.user-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(192, 200, 210, 0.3) 20%, #C0C8D2 50%, rgba(192, 200, 210, 0.3) 80%, transparent 100%);
}

/* 底部金色装饰线 */
.user-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
}

.user-card:active {
  transform: scale(0.98) translateY(1px);
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 3px rgba(0, 0, 0, 0.15);
}

.user-avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

/* 头像容器 - 3D 立体质感 */
.user-avatar {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #2A323C 0%, #1E252E 100%);
  border: 2px solid rgba(200, 170, 110, 0.2);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 -1px 0 rgba(255, 255, 255, 0.05);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar .default-avatar {
  width: 60%;
  height: 60%;
  object-fit: contain;
  opacity: 0.6;
}

.vip-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F0D78C 0%, #C8AA6E 50%, #A68B4B 100%);
  border-radius: 50%;
  border: 2.5px solid #181A20;
  box-shadow: 0 2px 10px rgba(200, 170, 110, 0.4);
}

.vip-badge svg {
  width: 15px;
  height: 15px;
  stroke: #1A1D24;
  fill: none;
  filter: drop-shadow(0 1px 2px rgba(255, 255, 255, 0.3));
}

/* 会员铭牌 - 实心渐变样式 */
.member-plate {
  margin-top: 8px;
  padding: 4px 16px;
  min-width: 80px;
  border-radius: 12px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #d4af37 0%, #f0d878 50%, #d4af37 100%);
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.4);
}

.member-plate .plate-text {
  font-size: 11px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 1px;
  white-space: nowrap;
  position: relative;
  z-index: 1;
}

/* 不同等级的铭牌颜色 */
.member-plate.level-0 {
  background: linear-gradient(135deg, #6B7280 0%, #9CA3AF 50%, #6B7280 100%);
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.4);
}
.member-plate.level-0 .plate-text { color: #fff; }

.member-plate.level-1 {
  background: linear-gradient(135deg, #a0a0a0 0%, #d0d0d0 50%, #a0a0a0 100%);
  box-shadow: 0 2px 8px rgba(160, 160, 160, 0.4);
}
.member-plate.level-1 .plate-text { color: #1a1a1a; }

.member-plate.level-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #f0f0f0 50%, #c0c0c0 100%);
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.5);
}
.member-plate.level-2 .plate-text { color: #1a1a1a; }

.member-plate.level-3 {
  background: linear-gradient(135deg, #d4af37 0%, #f0d878 50%, #d4af37 100%);
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.5);
}
.member-plate.level-3 .plate-text { color: #1a1a1a; }

.member-plate.level-4 {
  background: linear-gradient(135deg, #9b59b6 0%, #c39bd3 50%, #9b59b6 100%);
  box-shadow: 0 2px 8px rgba(155, 89, 182, 0.5);
}
.member-plate.level-4 .plate-text { color: #fff; }

.member-plate.level-5 {
  background: linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(255, 215, 0, 0.3);
  border: 1px solid #ffd700;
}
.member-plate.level-5 .plate-text { color: #ffd700; }

/* 原 VIP徽章样式 - 保留但不使用 */
.vip-badge-below {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin-top: 10px;
  padding: 5px 14px;
  background: rgba(200, 170, 110, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(200, 170, 110, 0.3);
  border-radius: 20px;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

/* 玻璃高光效果 */
.vip-badge-below::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%);
  border-radius: 20px 20px 0 0;
  pointer-events: none;
}

.vip-badge-below .badge-v {
  font-size: 11px;
  font-weight: 600;
  color: rgba(200, 170, 110, 0.9);
  letter-spacing: 0.5px;
}

.vip-badge-below .badge-num {
  font-size: 13px;
  font-weight: 700;
  color: #C8AA6E;
}

/* VIP 1 - 准入会员 - 银灰玻璃 */
.vip-badge-below.vip-1 { 
  background: rgba(156, 163, 175, 0.12);
  border-color: rgba(156, 163, 175, 0.25);
}
.vip-badge-below.vip-1 .badge-v { color: rgba(156, 163, 175, 0.8); }
.vip-badge-below.vip-1 .badge-num { color: #9CA3AF; }

/* VIP 2 - 优选会员 - 银白玻璃 */
.vip-badge-below.vip-2 { 
  background: rgba(212, 212, 212, 0.15);
  border-color: rgba(212, 212, 212, 0.35);
}
.vip-badge-below.vip-2 .badge-v { color: rgba(212, 212, 212, 0.85); }
.vip-badge-below.vip-2 .badge-num { color: #E5E5E5; }

/* VIP 3 - 资本合伙人 - 金色玻璃 */
.vip-badge-below.vip-3 { 
  background: rgba(212, 175, 55, 0.15);
  border-color: rgba(212, 175, 55, 0.4);
  box-shadow: 
    0 4px 20px rgba(212, 175, 55, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
.vip-badge-below.vip-3 .badge-v { color: rgba(212, 175, 55, 0.85); }
.vip-badge-below.vip-3 .badge-num { color: #C8AA6E; }

/* VIP 4 - 执行官合伙人 - 紫色玻璃 */
.vip-badge-below.vip-4 { 
  background: rgba(155, 89, 182, 0.15);
  border-color: rgba(155, 89, 182, 0.4);
  box-shadow: 
    0 4px 20px rgba(155, 89, 182, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
.vip-badge-below.vip-4 .badge-v { color: rgba(192, 132, 252, 0.85); }
.vip-badge-below.vip-4 .badge-num { color: #C084FC; }

/* VIP 5 - 主权合伙人 - 尊贵金玻璃 */
.vip-badge-below.vip-5 { 
  background: rgba(200, 170, 110, 0.18);
  border-color: rgba(200, 170, 110, 0.5);
  box-shadow: 
    0 4px 24px rgba(200, 170, 110, 0.35),
    0 0 30px rgba(200, 170, 110, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
.vip-badge-below.vip-5 .badge-v { color: rgba(240, 215, 140, 0.9); }
.vip-badge-below.vip-5 .badge-num { color: #F0D78C; }
.vip-3 svg { stroke: #fff; fill: none; filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.5)); }

/* VIP 4 - 执行官合伙人 - 青蓝光芒 */
.vip-4 { 
  background: linear-gradient(145deg, #A0FFFF 0%, #00E5FF 40%, #00B8D4 100%); 
  box-shadow: 
    0 3px 15px rgba(0, 229, 255, 0.7), 
    0 0 25px rgba(0, 229, 255, 0.4),
    inset 0 2px 0 rgba(255, 255, 255, 0.4);
}
.vip-4 svg { stroke: #003840; fill: none; }

/* VIP 5 - 主权合伙人 - 黑底金边发光 */
.vip-5 { 
  background: linear-gradient(145deg, #2A2A2A 0%, #1A1A1A 50%, #0D0D0D 100%); 
  border: 2.5px solid #C8AA6E;
  box-shadow: 
    0 0 15px rgba(212, 175, 55, 0.7), 
    0 0 30px rgba(212, 175, 55, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
.vip-5 svg { stroke: #C8AA6E; fill: none; filter: drop-shadow(0 0 4px rgba(212, 175, 55, 0.9)); }

.user-detail {
  flex: 1;
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
  color: #F0F2F5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* KYC 徽章 - 3D 立体质感 */
.kyc-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 12px;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.kyc-badge.verified {
  color: #fff;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  box-shadow: 
    0 2px 6px rgba(16, 185, 129, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.kyc-badge.pending {
  color: #fff;
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  box-shadow: 
    0 2px 6px rgba(245, 158, 11, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.kyc-badge.unverified {
  color: #9CA3AF;
  background: linear-gradient(135deg, #374151 0%, #1F2937 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.kyc-badge.rejected {
  color: #fff;
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  box-shadow: 
    0 2px 6px rgba(239, 68, 68, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
}

.uid-text {
  color: #6B7684;
  font-size: 13px;
  font-family: 'SF Mono', Monaco, monospace;
}

.exp-text {
  color: #C8AA6E;
  font-size: 12px;
  margin-left: 8px;
  padding: 2px 6px;
  background: rgba(200, 170, 110, 0.1);
  border-radius: 4px;
}

.level-text {
  font-weight: 600;
  font-size: 13px;
}

/* 箭头图标 - 金色渐变 */
.arrow-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #C8AA6E;
  opacity: 0.6;
}

/* ==================== 未登录区域 - Pro Max 3D ==================== */
.login-section {
  margin-bottom: 14px;
}

.login-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 20px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  margin: 0 12px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* 顶部高光 */
.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.2) 30%, rgba(200, 170, 110, 0.4) 50%, rgba(200, 170, 110, 0.2) 70%, transparent 100%);
}

/* 底部装饰线 */
.login-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
}

.login-avatar {
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #2A323C 0%, #1E252E 100%);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 4px 10px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.login-avatar svg {
  width: 28px;
  height: 28px;
  color: #6B7684;
}

.login-content {
  flex: 1;
}

.login-title {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #C8AA6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 6px;
}

.login-desc {
  font-size: 13px;
  color: #6B7684;
}

/* ==================== 资产区域 - Pro Max 3D ==================== */
.assets-section {
  margin-bottom: 14px;
}

.assets-card {
  padding: 18px 20px;
  background: linear-gradient(145deg, #1A222B 0%, #141A22 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  position: relative;
  overflow: visible;
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.4),
    0 2px 6px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

/* 总资产与图片并排 */
.assets-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.assets-info {
  flex: 1;
}

.assets-gold-img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  flex-shrink: 0;
  margin-left: 16px;
  opacity: 0.5;
}

/* 顶部金色装饰线 */
.assets-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.4) 20%, #C8AA6E 50%, rgba(200, 170, 110, 0.4) 80%, transparent 100%);
}

/* 底部金色装饰线 */
.assets-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.6) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
}

.assets-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.assets-value-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 总资产与图片并排布局 */
.assets-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.assets-left {
  flex: 1;
}

.assets-right {
  flex-shrink: 0;
  margin-left: 12px;
}

.assets-deco-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 8px;
}

/* 标签下方金色装饰线 */
.assets-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(200, 170, 110, 0.5) 0%, rgba(200, 170, 110, 0.2) 30%, transparent 60%);
}

.assets-label {
  font-size: 12px;
  color: #7A8494;
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* 隐藏按钮 - 3D 质感 */
.hide-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #2A323C 0%, #1E252E 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: #6B7684;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.hide-btn:active {
  transform: scale(0.95);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
}

.hide-btn svg {
  width: 14px;
  height: 14px;
}

/* 资产数值 - 大字金色渐变 */
.assets-value {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #F5E6C4 0%, #C8AA6E 50%, #A08A5B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  letter-spacing: -1px;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* ==================== 币种明细 - Pro Max 3D ==================== */
.assets-detail {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 18px;
  padding: 0;
  background: linear-gradient(145deg, #242D38 0%, #1C242E 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
}

/* 顶部银色装饰线 */
.assets-detail::before {
  content: '';
  position: absolute;
  top: 0;
  left: 16px;
  right: 16px;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(200, 210, 220, 0.5) 15%, 
    rgba(240, 245, 250, 0.9) 50%, 
    rgba(200, 210, 220, 0.5) 85%, 
    transparent 100%);
  z-index: 1;
  border-radius: 16px 16px 0 0;
}

/* 底部银色装饰线 */
.assets-detail::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(200, 210, 220, 0.5) 15%, 
    rgba(240, 245, 250, 0.9) 50%, 
    rgba(200, 210, 220, 0.5) 85%, 
    transparent 100%);
  z-index: 1;
  border-radius: 0 0 16px 16px;
}

.asset-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  transition: all 0.15s ease;
  position: relative;
}

.asset-row:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 18px;
  right: 18px;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.06) 20%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.06) 80%, transparent 100%);
}

.asset-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* 币种图标 - 3D 立体圆形 */
.asset-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(145deg, #2A323C 0%, #1E252E 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
}

.asset-icon img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.asset-icon svg {
  width: 20px;
  height: 20px;
}

.asset-name {
  font-size: 15px;
  font-weight: 600;
  color: #A0A8B4;
}

.asset-amount {
  font-size: 17px;
  font-weight: 700;
  color: #E8EAED;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

/* 币种特定颜色 - 金色强调 */
.asset-row.usdt .asset-name { color: #26A17B; }
.asset-row.usdt .asset-amount { 
  color: #2ECC9A;
  text-shadow: 0 0 12px rgba(46, 204, 154, 0.3);
}

.asset-row.agx .asset-name { color: #A0A8B4; }
.asset-row.agx .asset-amount { color: #C0C8D0; }

.asset-row.gold .asset-name { 
  background: linear-gradient(135deg, #D4B87A 0%, #C8AA6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.asset-row.gold .asset-amount { 
  background: linear-gradient(135deg, #F0D78C 0%, #C8AA6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
}

/* ==================== 快捷操作 - 8按钮网格 Pro Max 3D ==================== */
.action-grid-8 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px 0;
  padding: 20px 14px;
  margin: 8px -20px -18px -20px;
  width: calc(100% + 40px);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%);
  border-radius: 0 0 16px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  position: relative;
}

/* 金色装饰条 - 顶部 */
.action-grid-8::before {
  content: '';
  position: absolute;
  top: 0;
  left: 15%;
  right: 15%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(200, 170, 110, 0.3) 20%, 
    rgba(200, 170, 110, 0.6) 50%, 
    rgba(200, 170, 110, 0.3) 80%, 
    transparent 100%);
  border-radius: 1px;
}

/* 金色装饰条 - 中间分割线 */
.action-grid-8::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(200, 170, 110, 0.15) 20%, 
    rgba(200, 170, 110, 0.25) 50%, 
    rgba(200, 170, 110, 0.15) 80%, 
    transparent 100%);
  transform: translateY(-50%);
  pointer-events: none;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s ease;
}

.action-btn:active {
  transform: scale(0.92);
}

/* 图标容器 - Pro Max 精致风格 + 金色边框 */
.action-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #252D38 0%, #1A2028 100%);
  border: 1.5px solid rgba(200, 170, 110, 0.35);
  border-radius: 14px;
  transition: all 0.2s ease;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(200, 170, 110, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  position: relative;
}

/* 图标内部金色光晕 */
.action-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 13px;
  background: radial-gradient(ellipse at 50% 0%, rgba(200, 170, 110, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

/* 图标底部微光 */
.action-icon::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200, 170, 110, 0.3), transparent);
  border-radius: 1px;
}

.action-icon svg {
  width: 24px;
  height: 24px;
  color: #C8AA6E;
}

/* 按压效果 */
.action-btn:active .action-icon {
  background: linear-gradient(145deg, #1E262F 0%, #252D38 100%);
  transform: scale(0.96);
  border-color: rgba(200, 170, 110, 0.5);
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.2),
    0 0 8px rgba(200, 170, 110, 0.15),
    inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

/* 标签文字 */
.action-label {
  font-size: 12px;
  color: #7A8494;
  font-weight: 600;
  line-height: 1.3;
  text-align: center;
  letter-spacing: 0.2px;
}

/* ==================== 升达主权会员入口卡片 ==================== */
.member-entry-card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  margin: 0 16px 14px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 14px;
  border: 1px solid rgba(200, 170, 110, 0.15);
  cursor: pointer;
  transition: all 0.2s;
}

.member-entry-card:active {
  transform: scale(0.98);
}

.member-card-header {
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.member-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #C8AA6E;
  margin-bottom: 4px;
}

.member-card-subtitle {
  font-size: 12px;
  color: #6E7681;
  font-weight: 400;
}

.member-card-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.member-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* VIP徽章样式 - 和截图一致 */
.member-badge-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(135deg, #B8860B 0%, #8B6914 100%);
  border: 2px solid rgba(255, 215, 0, 0.4);
}

.member-badge-box .badge-icon {
  font-size: 14px;
  font-weight: 700;
  color: #FFD700;
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  line-height: 1;
}

.member-badge-box .badge-num {
  font-size: 16px;
  font-weight: 800;
  color: #FFD700;
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  line-height: 1;
}

/* 不同等级的徽章颜色 */
.member-badge-box.level-1 {
  background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%);
  border-color: rgba(156, 163, 175, 0.4);
}
.member-badge-box.level-1 .badge-icon,
.member-badge-box.level-1 .badge-num { color: #E5E7EB; }

.member-badge-box.level-2 {
  background: linear-gradient(135deg, #4A90D9 0%, #2563EB 100%);
  border-color: rgba(96, 165, 250, 0.4);
}
.member-badge-box.level-2 .badge-icon,
.member-badge-box.level-2 .badge-num { color: #BFDBFE; }

.member-badge-box.level-3 {
  background: linear-gradient(135deg, #B8860B 0%, #8B6914 100%);
  border-color: rgba(255, 215, 0, 0.4);
}
.member-badge-box.level-3 .badge-icon,
.member-badge-box.level-3 .badge-num { color: #FFD700; }

.member-badge-box.level-4 {
  background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
  border-color: rgba(167, 139, 250, 0.4);
}
.member-badge-box.level-4 .badge-icon,
.member-badge-box.level-4 .badge-num { color: #DDD6FE; }

.member-badge-box.level-5 {
  background: linear-gradient(135deg, #1A1A1A 0%, #0D0D0D 100%);
  border: 2px solid #C8AA6E;
  box-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
}
.member-badge-box.level-5 .badge-icon,
.member-badge-box.level-5 .badge-num { color: #C8AA6E; }

.member-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.member-name {
  font-size: 15px;
  font-weight: 600;
  color: #F0F6FC;
}

.member-name-en {
  font-size: 12px;
  color: #6E7681;
  font-weight: 400;
}

.member-status {
  display: flex;
  align-items: center;
}

.status-text {
  font-size: 12px;
  color: #848E9C;
}

.member-status.max .status-text {
  color: #C8AA6E;
}

.member-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.view-benefits {
  font-size: 13px;
  color: #848E9C;
}

.member-right .arrow {
  width: 16px;
  height: 16px;
  color: #848E9C;
}

/* ==================== 核心团队架构 Section ==================== */
.core-team-section {
  margin: 0 0 14px 0;
  padding: 0;
}

.section-header {
  padding: 16px 16px 12px;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  width: 28px;
  height: 28px;
  color: #C8AA6E;
  flex-shrink: 0;
}

.section-titles {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.section-title-cn {
  font-size: 18px;
  font-weight: 700;
  color: #F0F2F5;
  letter-spacing: 0.5px;
}

.section-title-en {
  font-size: 12px;
  color: #6B7684;
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* 团队信息卡片 */
.team-info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  margin: 0 12px 12px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4px 14px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* 顶部装饰线 */
.team-info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 12px;
  right: 12px;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(200, 170, 110, 0.3) 20%, 
    rgba(200, 170, 110, 0.5) 50%, 
    rgba(200, 170, 110, 0.3) 80%, 
    transparent 100%);
}

.team-info-card:active {
  transform: scale(0.98) translateY(1px);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.25),
    inset 0 1px 3px rgba(0, 0, 0, 0.15);
}

/* 信息卡片图标 */
.info-card-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  flex-shrink: 0;
  position: relative;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.info-card-icon svg {
  width: 28px;
  height: 28px;
}

/* 公司图标 - 金色渐变 */
.info-card-icon.company-icon {
  background: linear-gradient(145deg, #2A3542 0%, #1E282F 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
}
.info-card-icon.company-icon svg {
  color: #C8AA6E;
}

/* 会员图标 - 金色渐变（与公司图标统一） */
.info-card-icon.member-icon {
  background: linear-gradient(145deg, #2A3542 0%, #1E282F 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
}
.info-card-icon.member-icon svg {
  color: #C8AA6E;
}

/* 团队图标 - 金色渐变（与公司图标统一） */
.info-card-icon.team-icon {
  background: linear-gradient(145deg, #2A3542 0%, #1E282F 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
}
.info-card-icon.team-icon svg {
  color: #C8AA6E;
}

/* 信息卡片内容 */
.info-card-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #F0F2F5;
  line-height: 1.3;
}

.info-card-subtitle {
  font-size: 12px;
  color: #7A8494;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.info-card-desc {
  font-size: 12px;
  color: #5A6370;
  line-height: 1.4;
  margin-top: 2px;
}

.info-card-arrow {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #C8AA6E;
  opacity: 0.5;
}

/* ==================== 关于AGX卡片 - Pro Max 3D ==================== */
.about-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  margin-bottom: 14px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* 顶部金色装饰线 */
.about-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 16px;
  right: 16px;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(200, 170, 110, 0.5) 15%, 
    rgba(220, 190, 120, 0.9) 50%, 
    rgba(200, 170, 110, 0.5) 85%, 
    transparent 100%);
}

/* 底部金色装饰线 */
.about-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
}

.about-card:active {
  transform: scale(0.98) translateY(1px);
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 3px rgba(0, 0, 0, 0.15);
}

.about-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Logo 容器 - 3D 立体 */
.about-logo {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(145deg, #2A323C 0%, #1E252E 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  box-shadow: 
    0 4px 10px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
}

.about-logo img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

/* 会员卡片特殊样式 */
.member-card .member-logo {
  background: transparent;
  border: none;
  box-shadow: none;
}

.member-badge-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(200, 170, 110, 0.4));
}

.member-card .member-badge-box {
  width: 40px;
  height: 40px;
}

.view-benefits {
  font-size: 12px;
  color: #C8AA6E;
  font-weight: 500;
}

.about-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.about-title {
  font-size: 16px;
  font-weight: 700;
  color: #F0F2F5;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.about-desc {
  font-size: 13px;
  color: #6B7684;
}

.about-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 版本号 - 金色渐变徽章 */
.about-version {
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 10px;
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.15) 0%, rgba(200, 170, 110, 0.08) 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
  color: #C8AA6E;
  letter-spacing: 0.5px;
}

.about-arrow {
  width: 20px;
  height: 20px;
  color: #C8AA6E;
  opacity: 0.6;
}

/* ==================== 退出登录 - Pro Max 3D ==================== */
.logout-section {
  margin-bottom: 24px;
}

.logout-btn {
  width: 100%;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  font-size: 15px;
  font-weight: 600;
  color: #7A8494;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* 顶部高光 */
.logout-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 30%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.08) 70%, transparent 100%);
}

.logout-btn:active {
  transform: scale(0.98) translateY(1px);
  background: linear-gradient(145deg, #181F28 0%, #1E262F 100%);
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.25),
    inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.logout-btn svg {
  width: 20px;
  height: 20px;
  opacity: 0.8;
}

/* 底部安全区 */
.safe-bottom {
  height: calc(100px + env(safe-area-inset-bottom));
}

/* ==================== 浅色主题适配 - Pro Max 优化 ==================== */
:root[data-theme="light"] .mine-page {
  background: #F0F2F5;
}

:root[data-theme="light"] .page-bg {
  background: url('/mine-bg.png') center center / cover no-repeat;
  background-color: #F0F2F5;
}

:root[data-theme="light"] .page-header {
  background: #FFFFFF;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

:root[data-theme="light"] .page-header::after {
  background: linear-gradient(90deg, transparent 0%, rgba(180, 150, 90, 0.3) 30%, rgba(180, 150, 90, 0.5) 50%, rgba(180, 150, 90, 0.3) 70%, transparent 100%);
}

:root[data-theme="light"] .brand-name {
  background: linear-gradient(135deg, #92400E 0%, #78350F 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

:root[data-theme="light"] .user-card,
:root[data-theme="light"] .login-card,
:root[data-theme="light"] .assets-card,
:root[data-theme="light"] .about-card,
:root[data-theme="light"] .logout-btn {
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

:root[data-theme="light"] .user-card::before,
:root[data-theme="light"] .login-card::before,
:root[data-theme="light"] .assets-card::before,
:root[data-theme="light"] .about-card::before {
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.15) 30%, rgba(200, 170, 110, 0.25) 50%, rgba(200, 170, 110, 0.15) 70%, transparent 100%);
}

:root[data-theme="light"] .user-avatar,
:root[data-theme="light"] .login-avatar,
:root[data-theme="light"] .about-logo {
  border-color: rgba(200, 170, 110, 0.3);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

:root[data-theme="light"] .asset-icon,
:root[data-theme="light"] .action-icon {
  background: linear-gradient(145deg, #F5F0E6 0%, #EBE4D6 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

:root[data-theme="light"] .hide-btn {
  background: #F3F4F6;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

:root[data-theme="light"] .assets-detail {
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

:root[data-theme="light"] .user-name,
:root[data-theme="light"] .assets-value,
:root[data-theme="light"] .about-title {
  color: #111827;
  text-shadow: none;
}

:root[data-theme="light"] .uid-text,
:root[data-theme="light"] .assets-label,
:root[data-theme="light"] .about-desc,
:root[data-theme="light"] .action-label {
  color: #6B7280;
}

:root[data-theme="light"] .logout-btn {
  color: #6B7280;
  background: #FFFFFF;
}

:root[data-theme="light"] .asset-name,
:root[data-theme="light"] .asset-amount {
  color: #374151;
}

:root[data-theme="light"] .action-icon svg {
  color: #92400E;
}

/* 浅色主题 - 核心团队架构 */
:root[data-theme="light"] .section-title-cn {
  color: #111827;
}

:root[data-theme="light"] .section-title-en {
  color: #6B7280;
}

:root[data-theme="light"] .team-info-card {
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

:root[data-theme="light"] .team-info-card::before {
  background: linear-gradient(90deg, transparent 0%, rgba(180, 150, 90, 0.3) 30%, rgba(180, 150, 90, 0.5) 50%, rgba(180, 150, 90, 0.3) 70%, transparent 100%);
}

:root[data-theme="light"] .info-card-icon.company-icon {
  background: linear-gradient(145deg, #FEF3C7 0%, #FDE68A 100%);
  border-color: rgba(180, 150, 90, 0.3);
}

:root[data-theme="light"] .info-card-icon.member-icon {
  background: linear-gradient(145deg, #FEF3C7 0%, #FDE68A 100%);
  border-color: rgba(180, 150, 90, 0.3);
}

:root[data-theme="light"] .info-card-icon.team-icon {
  background: linear-gradient(145deg, #FEF3C7 0%, #FDE68A 100%);
  border-color: rgba(180, 150, 90, 0.3);
}

:root[data-theme="light"] .info-card-title {
  color: #111827;
}

:root[data-theme="light"] .info-card-subtitle {
  color: #6B7280;
}

:root[data-theme="light"] .info-card-desc {
  color: #9CA3AF;
}
</style>
