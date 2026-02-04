<template>
  <div class="earn-page">
    <!-- 顶部标题栏 -->
    <header class="header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <span class="header-title">{{ $t('earn.title') }}</span>
      <button class="help-btn" @click="showHelp = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </button>
    </header>

    <!-- 主内容 -->
    <div class="content">
      <!-- 未登录提示 -->
      <div class="guide-card not-active" v-if="!isLoggedIn">
        <div class="guide-visual">
          <div class="hourglass-icon">
            <svg viewBox="0 0 64 80" fill="none">
              <rect x="8" y="2" width="48" height="6" rx="2" fill="#C8AA6E"/>
              <rect x="10" y="4" width="44" height="2" fill="#E8D5A3"/>
              <rect x="8" y="72" width="48" height="6" rx="2" fill="#C8AA6E"/>
              <rect x="10" y="74" width="44" height="2" fill="#A08A5B"/>
              <path d="M12 8 L12 28 Q12 38 32 40 Q52 38 52 28 L52 8" stroke="#C8AA6E" stroke-width="2" fill="none" opacity="0.6"/>
              <path d="M12 72 L12 52 Q12 42 32 40 Q52 42 52 52 L52 72" stroke="#C8AA6E" stroke-width="2" fill="none" opacity="0.6"/>
              <defs>
                <linearGradient id="sandGradientLogin" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#E8D5A3"/>
                  <stop offset="100%" stop-color="#A08A5B"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div class="guide-badge">请先登录</div>
        </div>
        <div class="guide-content">
          <h2 class="guide-title">登录后查看持币生金</h2>
          <p class="guide-desc">持有 AGX 即可每日获得实物黄金收益</p>
        </div>
        <button class="cta-btn primary" @click="$router.push('/login')">
          <span>立即登录</span>
        </button>
      </div>

      <!-- 核心引导区 - 根据状态切换 -->
      
      <!-- 状态A: 未激活 (AGX < 100) -->
      <div class="guide-card not-active" v-else-if="!isActivated">
        <div class="guide-visual">
          <!-- 金色沙漏装饰 -->
          <div class="hourglass-icon">
            <svg viewBox="0 0 64 80" fill="none">
              <!-- 顶部金属框 -->
              <rect x="8" y="2" width="48" height="6" rx="2" fill="#C8AA6E"/>
              <rect x="10" y="4" width="44" height="2" fill="#E8D5A3"/>
              
              <!-- 底部金属框 -->
              <rect x="8" y="72" width="48" height="6" rx="2" fill="#C8AA6E"/>
              <rect x="10" y="74" width="44" height="2" fill="#A08A5B"/>
              
              <!-- 沙漏玻璃轮廓 -->
              <path d="M12 8 L12 28 Q12 38 32 40 Q52 38 52 28 L52 8" 
                    stroke="#C8AA6E" stroke-width="2" fill="none" opacity="0.6"/>
              <path d="M12 72 L12 52 Q12 42 32 40 Q52 42 52 52 L52 72" 
                    stroke="#C8AA6E" stroke-width="2" fill="none" opacity="0.6"/>
              
              <!-- 上部金沙 -->
              <path d="M16 12 L16 24 Q16 32 32 36 Q48 32 48 24 L48 12 Z" 
                    fill="url(#sandGradient)" opacity="0.8"/>
              
              <!-- 流动的沙流 -->
              <line x1="32" y1="36" x2="32" y2="44" stroke="#C8AA6E" stroke-width="2" stroke-linecap="round" class="sand-flow"/>
              
              <!-- 下部金沙堆 -->
              <path d="M22 72 Q22 62 32 58 Q42 62 42 72 Z" fill="url(#sandGradient)" opacity="0.9"/>
              
              <!-- 装饰柱子 -->
              <rect x="10" y="8" width="3" height="64" rx="1" fill="#C8AA6E" opacity="0.7"/>
              <rect x="51" y="8" width="3" height="64" rx="1" fill="#C8AA6E" opacity="0.7"/>
              
              <!-- 渐变定义 -->
              <defs>
                <linearGradient id="sandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#E8D5A3"/>
                  <stop offset="50%" stop-color="#C8AA6E"/>
                  <stop offset="100%" stop-color="#A08A5B"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div class="guide-badge">未激活</div>
        </div>
        
        <div class="guide-content">
          <h2 class="guide-title">持有 100 AGX 激活黄金账户</h2>
          <p class="guide-desc">每日自动获得实物黄金收益，无需锁仓</p>
          
          <div class="progress-section">
            <div class="progress-info">
              <span class="current">当前持有 <strong>{{ formatNumber(agxBalance, 0) }}</strong> AGX</span>
              <span class="target">目标 100 AGX</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: activationProgress + '%' }"></div>
            </div>
            <div class="progress-hint" v-if="agxBalance > 0">
              还需 <strong>{{ formatNumber(100 - agxBalance, 0) }}</strong> AGX 即可激活
            </div>
          </div>
        </div>
        
        <button class="cta-btn primary" @click="$router.push('/ieo')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <span>立即购买 AGX</span>
        </button>
        
        <div class="benefits-preview">
          <span class="benefits-label">激活后享受</span>
          <div class="benefit-tags">
            <span class="tag">日收益 0.005%</span>
            <span class="tag">年化约 1.8%</span>
            <span class="tag">实物黄金</span>
          </div>
        </div>
      </div>

      <!-- 状态B: 已激活 (AGX >= 100) -->
      <div class="guide-card active" v-else>
        <div class="active-header">
          <div class="status-badge">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
            <span>黄金账户已激活</span>
          </div>
          <div class="daily-rate">
            <span class="rate-value">{{ holdingStatus?.dailyRate || '0.005' }}%</span>
            <span class="rate-label">日收益率</span>
          </div>
        </div>

        <!-- 我的AGX -->
        <div class="my-asset">
          <div class="asset-left">
            <img src="/agx-new.png" class="coin-icon" alt="AGX">
            <div class="asset-info">
              <span class="asset-name">我的 AGX</span>
              <span class="asset-label">持有中</span>
            </div>
          </div>
          <div class="asset-right">
            <span class="asset-value">{{ hideAssets ? '****' : formatNumber(agxBalance, 2) }}</span>
            <button class="eye-btn" @click="hideAssets = !hideAssets">
              <svg v-if="hideAssets" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 累计黄金收益 -->
        <div class="earnings-section">
          <div class="earnings-header">
            <span class="earnings-label">累计黄金收益</span>
            <button class="record-btn" @click="$router.push('/orders?type=gold')">
              明细 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
          <div class="earnings-main">
            <span class="earnings-value">{{ hideAssets ? '****' : formatGold(goldEarned) }}</span>
            <span class="earnings-unit">oz</span>
          </div>
          <div class="earnings-sub">≈ ${{ hideAssets ? '****' : formatNumber(goldUsdValue, 2) }}</div>
          
          <div class="earnings-breakdown">
            <div class="breakdown-item">
              <span class="label">今日</span>
              <span class="value green">+{{ hideAssets ? '**' : formatGold(todayGold) }}</span>
            </div>
            <div class="breakdown-item">
              <span class="label">本周</span>
              <span class="value green">+{{ hideAssets ? '**' : formatGold(weekGold) }}</span>
            </div>
            <div class="breakdown-item">
              <span class="label">本月</span>
              <span class="value green">+{{ hideAssets ? '**' : formatGold(monthGold) }}</span>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <button class="action-btn primary" @click="$router.push('/ieo')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            增持 AGX
          </button>
          <button class="action-btn secondary" @click="$router.push('/pool')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            矿池挖矿
          </button>
        </div>
      </div>

      <!-- 实时金价 (精简版) -->
      <div class="gold-price-mini" v-if="goldPrice" @click="showGoldDetail = !showGoldDetail">
        <div class="price-left">
          <div class="gold-icon">Au</div>
          <div class="price-info">
            <span class="price-label">实时金价</span>
            <span class="price-value">${{ animatedGoldPrice }}/oz</span>
          </div>
        </div>
        <div class="price-right">
          <div class="price-change" :class="goldChange >= 0 ? 'up' : 'down'">
            {{ goldChange >= 0 ? '+' : '' }}{{ goldChange.toFixed(2) }}%
          </div>
          <svg :class="{ expanded: showGoldDetail }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>
      
      <!-- 金价详情 (展开) -->
      <div class="gold-detail" v-show="showGoldDetail && goldPrice">
        <div class="detail-row">
          <span class="label">每克价格</span>
          <span class="value">${{ goldPricePerGram }}</span>
        </div>
        <div class="detail-row">
          <span class="label">24h 最高</span>
          <span class="value green">${{ goldPrice?.high24h || '0.00' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">24h 最低</span>
          <span class="value red">${{ goldPrice?.low24h || '0.00' }}</span>
        </div>
      </div>

      <!-- 收益说明 (已激活时显示) -->
      <div class="reward-info-card" v-if="isActivated && holdingStatus">
        <div class="reward-header">
          <span class="reward-icon">💰</span>
          <span class="reward-title">持币生金收益</span>
        </div>
        <div class="reward-content">
          <div class="reward-item">
            <span class="label">日收益率</span>
            <span class="value gold">{{ holdingStatus.dailyRate || '0.005' }}%</span>
          </div>
          <div class="reward-item">
            <span class="label">预计今日收益</span>
            <span class="value gold">{{ formatGold(holdingStatus.estimatedDailyOz) }} oz</span>
          </div>
          <div class="reward-item">
            <span class="label">状态</span>
            <span class="value status">{{ holdingStatus.status }}</span>
          </div>
        </div>
      </div>

      <!-- 收益计算器入口 -->
      <button class="calculator-entry" @click="showCalculator = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="2" width="16" height="20" rx="2"/>
          <line x1="8" y1="6" x2="16" y2="6"/>
          <line x1="8" y1="10" x2="10" y2="10"/>
          <line x1="14" y1="10" x2="16" y2="10"/>
          <line x1="8" y1="14" x2="10" y2="14"/>
          <line x1="14" y1="14" x2="16" y2="14"/>
          <line x1="8" y1="18" x2="16" y2="18"/>
        </svg>
        <span>收益计算器</span>
        <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      <!-- 规则说明入口 -->
      <button class="rules-entry" @click="showRules = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <span>收益规则说明</span>
        <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>

    <!-- 收益计算器弹窗 -->
    <div class="modal-mask" v-if="showCalculator" @click="showCalculator = false">
      <div class="modal-content" @click.stop>
        <div class="modal-bar"></div>
        <h3>收益预估计算器</h3>
        <div class="modal-body">
          <div class="calc-input-group">
            <label>持有数量 (AGX)</label>
            <div class="calc-input-wrap">
              <input 
                type="number" 
                v-model.number="calcAmount" 
                placeholder="输入AGX数量"
                @input="calculateEarnings"
              >
              <button class="max-btn" @click="calcAmount = agxBalance; calculateEarnings()">MAX</button>
            </div>
          </div>
          <div class="calc-results" v-if="calcResult">
            <div class="calc-result-item">
              <span class="label">预计日收益</span>
              <span class="value gold">{{ calcResult.daily }} oz</span>
            </div>
            <div class="calc-result-item">
              <span class="label">预计月收益</span>
              <span class="value gold">{{ calcResult.monthly }} oz</span>
            </div>
            <div class="calc-result-item">
              <span class="label">预计年收益</span>
              <span class="value gold">{{ calcResult.yearly }} oz</span>
            </div>
            <div class="calc-result-item highlight">
              <span class="label">年化价值 (按当前金价)</span>
              <span class="value">${{ calcResult.yearlyUsd }}</span>
            </div>
          </div>
        </div>
        <button class="modal-btn" @click="showCalculator = false">{{ $t('common.confirm') }}</button>
      </div>
    </div>

    <!-- 规则说明弹窗 -->
    <div class="modal-mask" v-if="showRules" @click="showRules = false">
      <div class="modal-content" @click.stop>
        <div class="modal-bar"></div>
        <h3>{{ $t('earn.earningsRules') }}</h3>
        <div class="modal-body">
          <div class="rule-item">
            <span class="rule-num">1</span>
            <span class="rule-text">{{ $t('earn.rule1') }}</span>
          </div>
          <div class="rule-item">
            <span class="rule-num">2</span>
            <span class="rule-text">{{ $t('earn.rule2', { rate: goldRatePerThousand }) }}</span>
          </div>
          <div class="rule-item">
            <span class="rule-num">3</span>
            <span class="rule-text">{{ $t('earn.rule3') }}</span>
          </div>
        </div>
        <button class="modal-btn" @click="showRules = false">{{ $t('common.confirm') }}</button>
      </div>
    </div>

    <!-- 帮助弹窗 -->
    <div class="modal-mask" v-if="showHelp" @click="showHelp = false">
      <div class="modal-content" @click.stop>
        <div class="modal-bar"></div>
        <h3>{{ $t('earn.helpTitle') }}</h3>
        <div class="modal-body">
          <p><strong>{{ $t('earn.helpQ1') }}</strong><br>{{ $t('earn.helpA1') }}</p>
          <p><strong>{{ $t('earn.helpQ2') }}</strong><br>{{ $t('earn.helpA2') }}</p>
          <p><strong>{{ $t('earn.helpQ3') }}</strong><br>{{ $t('earn.helpA3') }}</p>
          <p><strong>{{ $t('earn.helpQ4') }}</strong><br>{{ $t('earn.helpA4') }}</p>
        </div>
        <button class="modal-btn" @click="showHelp = false">{{ $t('common.confirm') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../utils/api'
import { useUserStore } from '../stores/user'

defineOptions({ name: 'Earn' })

const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()

// 登录状态 - 使用 userStore
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 状态
const loading = ref(true)
const hideAssets = ref(false)
const showHelp = ref(false)
const showCalculator = ref(false)
const showRules = ref(false)
const showGoldDetail = ref(false)

// 资产数据
const agxBalance = ref(0)
const goldEarned = ref('0')
const goldUsdValue = ref(0)
const todayGold = ref('0')
const weekGold = ref('0')
const monthGold = ref('0')
const goldRatePerThousand = ref('0.05')

// 金价数据
const goldPrice = ref(null)
const goldChange = ref(0)
const goldPricePerGram = ref('0.00')
const animatedGoldPrice = ref('0.00')
let priceAnimationFrame = null
let priceUpdateTimer = null

// 持币状态
const holdingStatus = ref(null)

// 激活状态
const isActivated = computed(() => agxBalance.value >= 100)
const activationProgress = computed(() => Math.min(100, (agxBalance.value / 100) * 100))

// 计算器
const calcAmount = ref(0)
const calcResult = ref(null)

// 格式化数字
const formatNumber = (num, decimals = 2) => {
  if (!num && num !== 0) return '0'
  return parseFloat(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

// 格式化黄金数量 - 智能显示小数位
const formatGold = (num) => {
  const val = parseFloat(num) || 0
  if (val === 0) return '0'
  if (val >= 1) return val.toFixed(2)
  if (val >= 0.01) return val.toFixed(4)
  return val.toFixed(6)
}

// 格式化百分比 - 避免精度问题
const formatPercent = (num) => {
  const val = parseFloat(num) || 0
  if (val === 0) return '0'
  // 处理小数精度问题
  const fixed = val.toFixed(6)
  // 去掉末尾多余的 0
  return parseFloat(fixed).toString()
}

// 金价动画
const animateGoldPrice = (target) => {
  const current = parseFloat(animatedGoldPrice.value) || 0
  const diff = target - current
  const duration = 800
  const startTime = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    const value = current + diff * eased
    animatedGoldPrice.value = value.toFixed(2)
    
    if (progress < 1) {
      priceAnimationFrame = requestAnimationFrame(animate)
    }
  }
  
  if (priceAnimationFrame) cancelAnimationFrame(priceAnimationFrame)
  animate()
}

// 计算收益
const calculateEarnings = () => {
  if (!calcAmount.value || calcAmount.value <= 0) {
    calcResult.value = null
    return
  }
  
  // 使用后台配置的收益率，默认 0.00005 oz/AGX/天
  const rate = parseFloat(holdingStatus.value?.dailyOzRate) || 0.00005
  const currentGoldPrice = parseFloat(goldPrice.value?.price) || 2650
  
  const daily = (calcAmount.value * rate).toFixed(6)
  const monthly = (calcAmount.value * rate * 30).toFixed(4)
  const yearly = (calcAmount.value * rate * 365).toFixed(4)
  const yearlyUsd = (parseFloat(yearly) * currentGoldPrice).toFixed(2)
  
  calcResult.value = { daily, monthly, yearly, yearlyUsd }
}

// 加载金价
const loadGoldPrice = async () => {
  try {
    const res = await api.gold.getPrices()
    if (res.success && res.data) {
      const xau = res.data.xau || res.data.gold || res.data
      if (xau) {
        goldPrice.value = xau
        goldChange.value = parseFloat(xau.changePercent || xau.change24h) || 0
        goldPricePerGram.value = xau.pricePerGram || (parseFloat(xau.price) / 31.1035).toFixed(2)
        animateGoldPrice(parseFloat(xau.price))
      }
    }
  } catch (e) {
    console.error('加载金价失败:', e)
  }
}

// 加载持币状态
const loadHoldingStatus = async () => {
  try {
    const res = await api.gold.getHoldingStatus()
    if (res.success && res.data) {
      holdingStatus.value = res.data
    }
  } catch (e) {
    console.error('加载持币状态失败:', e)
    // 使用默认数据（无等级系统）
    holdingStatus.value = {
      isQualified: agxBalance.value >= 100,
      minAgxRequired: '100',
      dailyRate: 0.005,
      dailyOzRate: '0.00005',
      currentAmount: agxBalance.value,
      estimatedDailyOz: agxBalance.value >= 100 ? (agxBalance.value * 0.00005).toFixed(6) : '0',
      status: agxBalance.value >= 100 ? '生金中' : '未激活'
    }
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 未登录时不加载用户数据
    if (!isLoggedIn.value) {
      loading.value = false
      return
    }
    
    const balanceRes = await api.account.balance()
    if (balanceRes.success && balanceRes.data) {
      // 支持多种返回格式
      if (balanceRes.data.assets && Array.isArray(balanceRes.data.assets)) {
        const agxAsset = balanceRes.data.assets.find(a => (a.currency || a.coin || a.symbol) === 'AGX')
        if (agxAsset) {
          const balance = parseFloat(agxAsset.available || agxAsset.balance || 0)
          const locked = parseFloat(agxAsset.locked || agxAsset.frozen || 0)
          agxBalance.value = balance - locked
        } else {
          agxBalance.value = 0
        }
      } else {
        agxBalance.value = balanceRes.data.agx || balanceRes.data.totalAgx || 0
      }
      calcAmount.value = agxBalance.value
    }

    const earnRes = await api.gold.getHoldings()
    if (earnRes.success && earnRes.data) {
      goldEarned.value = earnRes.data.totalGold || '0.0000'
      goldUsdValue.value = parseFloat(goldEarned.value) * 2650
      todayGold.value = earnRes.data.todayGold || '0.0000'
      weekGold.value = earnRes.data.weekGold || '0.0000'
      monthGold.value = earnRes.data.monthGold || '0.0000'
    }
    
    // 加载持币状态
    await loadHoldingStatus()
    
    // 计算收益
    calculateEarnings()
  } catch (e) {
    console.error('加载数据失败:', e)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // 并行加载数据，提升性能
  await Promise.all([
    loadGoldPrice(),
    loadData()
  ])
  
  // 每30秒更新金价
  priceUpdateTimer = setInterval(loadGoldPrice, 30000)
})

onUnmounted(() => {
  if (priceAnimationFrame) cancelAnimationFrame(priceAnimationFrame)
  if (priceUpdateTimer) clearInterval(priceUpdateTimer)
})
</script>

<style scoped>
.earn-page {
  min-height: 100vh;
  background: #0D1117;
  color: #F0F2F5;
}

/* 头部 */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 12px;
  padding-top: env(safe-area-inset-top);
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: none;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* 底部金色装饰线 */
.header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
}

.back-btn, .help-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #8B949E;
  transition: color 0.2s;
}

.back-btn:active, .help-btn:active {
  color: #C8AA6E;
}

.back-btn svg, .help-btn svg {
  width: 18px;
  height: 18px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #F0F2F5;
}

/* 内容区 */
.content {
  padding: 16px;
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}

/* ===== 核心引导卡片 ===== */
.guide-card {
  position: relative;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* 顶部银色装饰线 */
.guide-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(192, 200, 210, 0.3) 20%, #C0C8D2 50%, rgba(192, 200, 210, 0.3) 80%, transparent 100%);
  border-radius: 16px 16px 0 0;
}

/* 底部金色装饰线 */
.guide-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
}

/* 未激活状态 */
.guide-card.not-active {
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: none;
}

.guide-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

/* 金色沙漏图标 */
.hourglass-icon {
  width: 80px;
  height: 100px;
  margin-bottom: 12px;
  filter: drop-shadow(0 4px 12px rgba(200, 170, 110, 0.3));
}

.hourglass-icon svg {
  width: 100%;
  height: 100%;
}

.hourglass-icon .sand-flow {
  animation: sandPulse 1.5s ease-in-out infinite;
}

@keyframes sandPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.lock-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  margin-bottom: 10px;
}

.lock-icon svg {
  width: 32px;
  height: 32px;
  color: var(--text-tertiary, #848E9C);
}

.guide-badge {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 11px;
  color: var(--text-tertiary, #848E9C);
}

.guide-content {
  text-align: center;
  margin-bottom: 20px;
}

.guide-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #EAECEF);
  margin: 0 0 8px;
}

.guide-desc {
  font-size: 13px;
  color: var(--text-tertiary, #848E9C);
  margin: 0 0 16px;
}

.progress-section {
  text-align: left;
  padding: 14px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.progress-info .current {
  color: #8B949E;
}

.progress-info .current strong {
  color: #F0F2F5;
}

.progress-info .target {
  color: #6B7280;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #C8AA6E, #E8D5A3);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-hint {
  font-size: 11px;
  color: #C8AA6E;
}

.progress-hint strong {
  font-weight: 700;
}

.cta-btn {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 16px;
  transition: all 0.25s;
}

.cta-btn:active {
  transform: scale(0.98);
}

.cta-btn svg {
  width: 20px;
  height: 20px;
}

.cta-btn.primary {
  background: linear-gradient(135deg, #C8AA6E 0%, #A08A5B 100%);
  color: #0D1117;
  box-shadow: 0 4px 20px rgba(200, 170, 110, 0.4);
}

.benefits-preview {
  text-align: center;
}

.benefits-label {
  display: block;
  font-size: 11px;
  color: #6B7280;
  margin-bottom: 8px;
}

.benefit-tags {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.benefit-tags .tag {
  padding: 4px 10px;
  background: rgba(200, 170, 110, 0.15);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 12px;
  font-size: 11px;
  color: #C8AA6E;
}

/* 已激活状态 */
.guide-card.active {
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: none;
}

.active-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(14, 203, 129, 0.15);
  border-radius: 20px;
}

.status-badge svg {
  width: 16px;
  height: 16px;
  color: #0ECB81;
}

.status-badge span {
  font-size: 12px;
  font-weight: 600;
  color: #0ECB81;
}

.daily-rate {
  text-align: right;
}

.daily-rate .rate-value {
  display: block;
  font-family: 'DIN Alternate', monospace;
  font-size: 18px;
  font-weight: 700;
  color: #0ECB81;
}

.daily-rate .rate-label {
  font-size: 10px;
  color: #6B7280;
}

.my-asset {
  display: flex;
  align-items: center;
  padding: 14px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  margin-bottom: 16px;
}

.coin-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.asset-info {
  display: flex;
  flex-direction: column;
}

.asset-name {
  font-size: 14px;
  font-weight: 600;
  color: #F0F2F5;
}

.asset-label {
  font-size: 11px;
  color: #6B7280;
}

.asset-left {
  display: flex;
  align-items: center;
}

.asset-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.asset-value {
  font-family: 'DIN Alternate', monospace;
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #C8AA6E, #E8D5A3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.eye-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 6px;
  color: #6B7280;
}

.eye-btn svg {
  width: 14px;
  height: 14px;
}

.earnings-section {
  margin-bottom: 16px;
}

.earnings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.earnings-label {
  font-size: 12px;
  color: #8B949E;
}

.record-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  font-size: 11px;
  color: #C8AA6E;
}

.record-btn svg {
  width: 12px;
  height: 12px;
}

.earnings-main {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 4px;
}

.earnings-value {
  font-family: 'DIN Alternate', monospace;
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #C8AA6E, #E8D5A3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.earnings-unit {
  font-size: 14px;
  color: #C8AA6E;
  font-weight: 600;
}

.earnings-sub {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 12px;
}

.earnings-breakdown {
  display: flex;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 10px 0;
}

.breakdown-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.breakdown-item:last-child {
  border-right: none;
}

.breakdown-item .label {
  font-size: 10px;
  color: #6B7280;
}

.breakdown-item .value {
  font-family: 'DIN Alternate', monospace;
  font-size: 13px;
  font-weight: 600;
}

.breakdown-item .value.green {
  color: #0ECB81;
}

.quick-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.action-btn:active {
  transform: scale(0.97);
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.action-btn.primary {
  background: linear-gradient(135deg, #C8AA6E 0%, #A08A5B 100%);
  color: #0D1117;
}

.action-btn.secondary {
  background: rgba(14, 203, 129, 0.12);
  color: #0ECB81;
  border: 1px solid rgba(14, 203, 129, 0.25);
}

/* ===== 金价迷你卡 ===== */
.gold-price-mini {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: none;
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* 顶部银色装饰线 */
.gold-price-mini::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(192, 200, 210, 0.3) 20%, #C0C8D2 50%, rgba(192, 200, 210, 0.3) 80%, transparent 100%);
  border-radius: 12px 12px 0 0;
}

/* 底部金色装饰线 */
.gold-price-mini::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
}

.price-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.gold-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #E8D5A3, #C8AA6E);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 800;
  color: #0D1117;
}

.price-info {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
}

.price-value {
  font-family: 'DIN Alternate', monospace;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #EAECEF);
}

.price-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-change {
  padding: 3px 8px;
  border-radius: 6px;
  font-family: 'DIN Alternate', monospace;
  font-size: 12px;
  font-weight: 600;
}

.price-change.up {
  background: rgba(14, 203, 129, 0.12);
  color: var(--color-up, #0ECB81);
}

.price-change.down {
  background: rgba(246, 70, 93, 0.12);
  color: var(--color-down, #F6465D);
}

.price-right > svg {
  width: 16px;
  height: 16px;
  color: var(--text-quaternary, #5E6673);
  transition: transform 0.25s;
}

.price-right > svg.expanded {
  transform: rotate(180deg);
}

/* 金价详情 */
.gold-detail {
  padding: 12px 14px;
  background: var(--bg-elevated, rgba(22, 27, 34, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-top: none;
  border-radius: 0 0 12px 12px;
  margin-top: -10px;
  margin-bottom: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.detail-row .label {
  font-size: 12px;
  color: var(--text-quaternary, #5E6673);
}

.detail-row .value {
  font-family: 'DIN Alternate', monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #B7BDC6);
}

.detail-row .value.green {
  color: var(--color-up, #0ECB81);
}

.detail-row .value.red {
  color: var(--color-down, #F6465D);
}

/* ===== 收益说明卡 ===== */
.reward-info-card {
  position: relative;
  padding: 16px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 16px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.reward-info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(192, 200, 210, 0.3) 20%, #C0C8D2 50%, rgba(192, 200, 210, 0.3) 80%, transparent 100%);
}

.reward-info-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
}

.reward-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.reward-icon {
  font-size: 18px;
}

.reward-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.reward-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reward-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reward-item .label {
  font-size: 13px;
  color: var(--text-tertiary, #848E9C);
}

.reward-item .value {
  font-family: 'DIN Alternate', monospace;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.reward-item .value.gold {
  color: var(--color-brand, #C8AA6E);
}

.reward-item .value.status {
  padding: 2px 8px;
  background: rgba(14, 203, 129, 0.15);
  border-radius: 10px;
  font-size: 12px;
  color: var(--color-up, #0ECB81);
}

/* ===== 入口按钮 ===== */
.calculator-entry,
.rules-entry {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  background: var(--bg-elevated, rgba(22, 27, 34, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  margin-bottom: 10px;
  color: var(--text-primary, #EAECEF);
  font-size: 14px;
  transition: background 0.2s;
}

.calculator-entry:active,
.rules-entry:active {
  background: rgba(255, 255, 255, 0.04);
}

.calculator-entry > svg:first-child,
.rules-entry > svg:first-child {
  width: 20px;
  height: 20px;
  color: var(--color-brand, #C8AA6E);
}

.calculator-entry span,
.rules-entry span {
  flex: 1;
  text-align: left;
}

.calculator-entry .arrow,
.rules-entry .arrow {
  width: 16px;
  height: 16px;
  color: var(--text-quaternary, #5E6673);
}

/* ===== 弹窗样式 ===== */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 428px;
  background: var(--bg-elevated, #1A1F26);
  border: 1px solid var(--border-primary, rgba(255,255,255,0.08));
  border-bottom: none;
  border-radius: 20px 20px 0 0;
  padding: 12px 16px calc(24px + env(safe-area-inset-bottom));
  box-shadow: 0 -8px 40px rgba(0,0,0,0.4);
  max-height: 80vh;
  overflow-y: auto;
}

.modal-bar {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 2px;
  margin: 0 auto 14px;
}

.modal-content h3 {
  font-size: 17px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 18px;
  color: var(--text-primary, #EAECEF);
}

.modal-body {
  margin-bottom: 18px;
}

.modal-body p {
  font-size: 13px;
  color: var(--text-tertiary, #848E9C);
  margin: 0 0 14px;
  line-height: 1.7;
}

.modal-body strong {
  color: var(--text-primary, #EAECEF);
}

.modal-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), #A08A5B);
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  color: var(--bg-base, #0B0E11);
  box-shadow: 0 4px 16px rgba(200, 170, 110, 0.35);
  transition: all 0.25s;
}

.modal-btn:active {
  transform: scale(0.98);
}

/* 计算器弹窗 */
.calc-input-group {
  margin-bottom: 16px;
}

.calc-input-group label {
  display: block;
  font-size: 12px;
  color: var(--text-tertiary, #848E9C);
  margin-bottom: 8px;
}

.calc-input-wrap {
  display: flex;
  gap: 8px;
}

.calc-input-wrap input {
  flex: 1;
  height: 44px;
  padding: 0 14px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-family: 'DIN Alternate', monospace;
  font-size: 16px;
  color: var(--text-primary, #EAECEF);
  outline: none;
}

.calc-input-wrap input:focus {
  border-color: var(--color-brand, #C8AA6E);
}

.max-btn {
  padding: 0 14px;
  height: 44px;
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-brand, #C8AA6E);
}

.calc-results {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.calc-result-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
}

.calc-result-item.highlight {
  grid-column: span 2;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.05) 100%);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.calc-result-item .label {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
}

.calc-result-item .value {
  font-family: 'DIN Alternate', monospace;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.calc-result-item .value.gold {
  color: var(--color-brand, #C8AA6E);
}

/* 规则弹窗 */
.rule-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.rule-item:last-child {
  border-bottom: none;
}

.rule-num {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-brand, #C8AA6E);
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  color: var(--bg-base, #0B0E11);
  flex-shrink: 0;
}

.rule-text {
  font-size: 13px;
  color: var(--text-tertiary, #848E9C);
  line-height: 1.6;
}
</style>
