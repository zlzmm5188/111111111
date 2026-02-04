<template>
  <div class="pool-page">
    <!-- 顶部标题栏 -->
    <header class="header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <span class="header-title">{{ $t('pool.title') }}</span>
      <div class="header-actions">
        <button class="help-btn" @click="showRules = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- 主内容 -->
    <div class="content">
      <!-- 总收益概览卡片 -->
      <div class="overview-card">
        <div class="overview-bg"></div>
        <div class="overview-content">
          <div class="overview-main">
            <span class="overview-label">{{ $t('pool.totalEarnings') }}</span>
            <div class="overview-value-wrap">
              <span class="overview-value">{{ hideAssets ? '****' : animatedTotalIncome }}</span>
              <span class="overview-unit">USDT</span>
            </div>
            <span class="overview-sub">{{ $t('pool.yesterdayEarnings') }}: +{{ hideAssets ? '**' : formatNumber(totalStats.yesterdayIncome) }}</span>
          </div>
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
        <div class="overview-stats">
          <div class="overview-stat">
            <span class="stat-label">{{ $t('pool.totalHolding') }}</span>
            <span class="stat-value gold">{{ hideAssets ? '****' : formatNumber(totalStats.totalAmount) }} AGX</span>
          </div>
          <div class="stat-divider"></div>
          <div class="overview-stat">
            <span class="stat-label">{{ $t('pool.activeProducts') }}</span>
            <span class="stat-value">{{ holdings.filter(h => h.status === 1).length }}</span>
          </div>
        </div>
      </div>

      <!-- 矿池产品列表 -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            {{ $t('pool.products') }}
          </h3>
          <span class="section-badge">{{ products.length }} {{ $t('common.total') }}</span>
        </div>

        <div class="product-list" v-if="products.length">
          <div 
            class="product-card" 
            v-for="product in products" 
            :key="product.id"
            :class="{ hot: product.isHot }"
          >
            <!-- 热门标签 -->
            <div class="hot-badge" v-if="product.isHot">热门</div>
            
            <!-- 头部：名称 -->
            <div class="card-top">
              <div class="card-left">
                <div class="product-icon"><img src="/agx-new.png" alt=""></div>
                <div class="product-title">
                  <h4>{{ product.name }}</h4>
                  <p>{{ product.type === 'flexible' ? '活期' : '定期' + product.lockDays + '天' }}</p>
                </div>
              </div>
              <!-- 福利图标条（移到右上角） -->
              <div class="card-benefits-top" v-if="hasValidBenefits(product) || (product.vipLevels && product.vipLevels !== 'all')">
                <span 
                  class="benefit-icon-mini" 
                  v-if="product.enableRedpacket && (parseFloat(product.redpacketPercent) > 0 || parseFloat(product.redpacketAmount) > 0)" 
                  @click.stop="toggleTooltip($event, 'redpacket', product)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><circle cx="12" cy="14" r="2"/></svg>
                </span>
                <span 
                  class="benefit-icon-mini" 
                  v-if="product.enableDividend && parseFloat(product.dividendPercent) > 0" 
                  @click.stop="toggleTooltip($event, 'dividend', product)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>
                </span>
                <span 
                  class="benefit-icon-mini" 
                  v-if="product.enableDoubleExp && parseFloat(product.doubleExpMultiplier) > 1" 
                  @click.stop="toggleTooltip($event, 'doubleExp', product)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </span>
                <span 
                  class="benefit-icon-mini" 
                  v-if="product.enableVipBonus" 
                  @click.stop="toggleTooltip($event, 'vipBonus', product)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </span>
                <span 
                  class="benefit-icon-mini" 
                  v-if="product.enableLevelCommission && parseFloat(product.levelCommissionRate) > 0" 
                  @click.stop="toggleTooltip($event, 'levelCommission', product)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                </span>
                <span 
                  class="benefit-icon-mini" 
                  v-if="product.enableRepurchase && (parseFloat(product.repurchasePercent) > 0 || parseFloat(product.repurchaseAmount) > 0)" 
                  @click.stop="toggleTooltip($event, 'repurchase', product)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                </span>
                <span 
                  class="benefit-icon-mini vip-limit" 
                  v-if="product.vipLevels && product.vipLevels !== 'all'" 
                  @click.stop="toggleTooltip($event, 'vipLimit', product)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
              </div>
            </div>

            <!-- 中部：核心数据 -->
            <div class="card-data">
              <div class="data-item">
                <label>投入 <em>{{ product.coinSymbol }}</em></label>
                <span>{{ formatCompactNumber(product.minAmount) }}<template v-if="product.maxAmount">-{{ formatCompactNumber(product.maxAmount) }}</template></span>
              </div>
              <div class="data-item">
                <label>日收益率</label>
                <span class="green">{{ formatNumber(product.minRate) }}<template v-if="parseFloat(product.maxRate) > parseFloat(product.minRate)">-{{ formatNumber(product.maxRate) }}</template>%</span>
              </div>
              <div class="data-item" v-if="product.investDays > 0">
                <label>收益周期</label>
                <span>{{ product.investDays }}{{ product.cycleUnit === 'hour' ? '小时' : '天' }}</span>
              </div>
              <div class="data-item" v-if="product.remainQuota">
                <label>剩余额度</label>
                <span>{{ formatCompactNumber(product.remainQuota) }}</span>
              </div>
            </div>

            <!-- 申购按钮 -->
            <button class="subscribe-btn" @click="openSubscribeModal(product)">立即申购</button>
          </div>
        </div>
        <div class="empty-state" v-else>
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="6" y="10" width="36" height="28" rx="3"/>
            <path d="M6 18h36M15 26h8M15 32h18"/>
          </svg>
          <span>{{ $t('pool.noProducts') }}</span>
        </div>
      </div>

      <!-- 我的持仓 -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            {{ $t('pool.myHoldings') }}
          </h3>
        </div>

        <div class="holdings-list" v-if="holdings.length">
          <div 
            class="holding-card" 
            v-for="holding in holdings" 
            :key="holding.id"
            :class="{ active: holding.status === 1 }"
          >
            <div class="holding-header">
              <div class="holding-info">
                <span class="holding-name">{{ holding.product?.name || '矿池产品' }}</span>
                <span class="holding-type">{{ holding.product?.type === 'flexible' ? $t('pool.flexible') : $t('pool.fixed') }}</span>
              </div>
              <div class="holding-status" :class="{ active: holding.status === 1 }">
                {{ holding.status === 1 ? $t('pool.holding') : $t('pool.redeemed') }}
              </div>
            </div>

            <div class="holding-data">
              <div class="data-item">
                <span class="data-label">{{ $t('pool.principal') }}</span>
                <span class="data-value">{{ hideAssets ? '****' : formatNumber(holding.amount) }} {{ holding.product?.coinSymbol || 'AGX' }}</span>
              </div>
              <div class="data-item highlight">
                <span class="data-label">{{ $t('pool.totalEarnings') }}</span>
                <span class="data-value income">+{{ hideAssets ? '****' : formatNumber(holding.totalIncome) }} {{ holding.product?.incomeCoinSymbol || 'USDT' }}</span>
              </div>
            </div>

            <div class="holding-progress" v-if="holding.status === 1 && holding.product?.type === 'fixed'">
              <div class="progress-info">
                <span>{{ formatDate(holding.startAt) }}</span>
                <span>{{ formatDate(holding.endAt) }}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: getHoldingProgress(holding) + '%' }"></div>
              </div>
            </div>

            <div class="holding-footer">
              <span class="holding-time">{{ $t('pool.startTime') }}: {{ formatDateTime(holding.startAt) }}</span>
              <button 
                class="redeem-btn" 
                v-if="holding.status === 1"
                @click="handleRedeem(holding)"
              >
                {{ holding.product?.type === 'flexible' ? $t('pool.redeemAnytime') : $t('pool.redeemOnExpiry') }}
              </button>
            </div>
          </div>
        </div>
        <div class="empty-state" v-else>
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M24 4L4 14v20l20 10 20-10V14L24 4z"/>
            <path d="M4 14l20 10 20-10M24 44V24"/>
          </svg>
          <span>{{ $t('pool.noHoldings') }}</span>
        </div>
      </div>
    </div>

    <!-- 申购弹窗 -->
    <div class="modal-mask" v-if="subscribeModal.show" @click="subscribeModal.show = false">
      <div class="modal-content subscribe-modal" @click.stop>
        <div class="modal-bar"></div>
        <h3>{{ $t('pool.subscribeNow') }}</h3>
        
        <div class="modal-product">
          <div class="product-icon">
            <img src="/agx-new.png" alt="AGX">
          </div>
          <div class="product-detail">
            <span class="name">{{ subscribeModal.product?.name }}</span>
          </div>
        </div>

        <div class="modal-input-group">
          <div class="input-header">
            <span class="input-label">投入金额</span>
            <span class="input-balance">可用: {{ formatNumber(agxBalance) }} {{ subscribeModal.product?.coinSymbol }}</span>
          </div>
          <div class="input-wrap">
            <input 
              type="number" 
              v-model.number="subscribeModal.amount" 
              :placeholder="`最小: ${subscribeModal.product?.minAmount}`"
            >
            <span class="input-unit">{{ subscribeModal.product?.coinSymbol }}</span>
            <button class="max-btn" @click="subscribeModal.amount = agxBalance">MAX</button>
          </div>
          <div class="input-hint" v-if="subscribeModal.product">
            范围: {{ formatNumber(subscribeModal.product.minAmount) }} - {{ formatNumber(subscribeModal.product.maxAmount) || '无上限' }}
          </div>
        </div>

        <!-- 收益计算卡片 -->
        <div class="income-calc" v-if="subscribeModal.amount > 0 && subscribeModal.product">
          <div class="calc-header">收益换算</div>
          <div class="calc-row">
            <span class="calc-label">投入金额</span>
            <span class="calc-value">{{ formatNumber(subscribeModal.amount) }} {{ subscribeModal.product.coinSymbol }}</span>
          </div>
          <div class="calc-row" v-if="subscribeModal.product.type === 'fixed'">
            <span class="calc-label">锁定周期</span>
            <span class="calc-value">{{ subscribeModal.product.lockDays }} 天</span>
          </div>
          <div class="calc-divider"></div>
          <div class="calc-row main">
            <span class="calc-label">每日收益</span>
            <span class="calc-value green">+{{ calcDailyIncome() }} {{ subscribeModal.product.incomeCoinSymbol || 'USDT' }}</span>
          </div>
          <div class="calc-row main" v-if="subscribeModal.product.type === 'fixed'">
            <span class="calc-label">到期总收益</span>
            <span class="calc-value green big">+{{ calcTotalIncome() }} {{ subscribeModal.product.incomeCoinSymbol || 'USDT' }}</span>
          </div>
          <div class="calc-row main" v-else>
            <span class="calc-label">预估月30天</span>
            <span class="calc-value green big">+{{ calcMonthlyIncome() }} {{ subscribeModal.product.incomeCoinSymbol || 'USDT' }}</span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="modal-btn cancel" @click="subscribeModal.show = false">{{ $t('common.cancel') }}</button>
          <button class="modal-btn confirm" @click="confirmSubscribe" :disabled="!canSubscribe">
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 悬浮提示 Tooltip -->
    <Teleport to="body">
      <Transition name="tooltip-fade">
        <div 
          class="benefit-tooltip" 
          v-if="tooltip.show" 
          :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
          @click.stop
        >
          <div class="tooltip-indicator" :class="tooltip.type"></div>
          <div class="tooltip-content">
            <div class="tooltip-row">
              <span class="tooltip-label">{{ tooltip.title }}</span>
              <span class="tooltip-val" :class="tooltip.type">{{ tooltip.value }}</span>
            </div>
            <p class="tooltip-note">{{ tooltip.desc }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 规则弹窗 -->
    <div class="modal-mask" v-if="showRules" @click="showRules = false">
      <div class="modal-content" @click.stop>
        <div class="modal-bar"></div>
        <h3>{{ $t('pool.rulesTitle') }}</h3>
        <div class="modal-body rules-body">
          <div class="rule-item">
            <span class="rule-icon">1</span>
            <span>{{ $t('pool.rule1') }}</span>
          </div>
          <div class="rule-item">
            <span class="rule-icon">2</span>
            <span>{{ $t('pool.rule2') }}</span>
          </div>
          <div class="rule-item">
            <span class="rule-icon">3</span>
            <span>{{ $t('pool.rule3') }}</span>
          </div>
          <div class="rule-item">
            <span class="rule-icon">4</span>
            <span>{{ $t('pool.rule4') }}</span>
          </div>
        </div>
        <button class="modal-btn full" @click="showRules = false">{{ $t('common.confirm') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import api from '../utils/api'
import { withTradePassword, getTradePasswordStatus } from '../utils/tradePassword'
import { showSuccess, showError, alert } from '../utils/alert'

defineOptions({ name: 'Pool' })

const { t } = useI18n()
const router = useRouter()

// 状态
const loading = ref(false)
const hideAssets = ref(false)
const showRules = ref(false)

// 数据
const products = ref([])
const holdings = ref([])
const agxBalance = ref(0)
const totalStats = ref({
  totalAmount: '0',
  totalIncome: '0',
  yesterdayIncome: '0'
})

// 动画数字
const animatedTotalIncome = ref('0.00')
let incomeAnimationFrame = null

// 申购弹窗
const subscribeModal = ref({
  show: false,
  product: null,
  amount: 0
})

// 悬浮提示 Tooltip
const tooltip = ref({
  show: false,
  type: '',
  title: '',
  desc: '',
  value: '',
  x: 0,
  y: 0
})

let tooltipTimer = null

// 计算属性
const canSubscribe = computed(() => {
  const product = subscribeModal.value.product
  const amount = subscribeModal.value.amount
  if (!product || !amount) return false
  if (amount < parseFloat(product.minAmount)) return false
  if (product.maxAmount && amount > parseFloat(product.maxAmount)) return false
  if (amount > agxBalance.value) return false
  return true
})

// 格式化数字
const formatNumber = (num) => {
  if (!num) return '0'
  const n = parseFloat(num)
  // 整数直接显示，小数保留合适位数并去掉末尾0
  if (Number.isInteger(n)) return n.toLocaleString('zh-CN')
  const fixed = n.toFixed(n < 1 ? 4 : 2)
  return fixed.replace(/\.?0+$/, '') || '0'
}

// 格式化紧凑数字（如100万）
const formatCompactNumber = (num) => {
  if (!num) return '0'
  const n = parseFloat(num)
  if (n >= 100000000) {
    return (n / 100000000).toFixed(n % 100000000 === 0 ? 0 : 1).replace(/\.0$/, '') + '亿'
  }
  if (n >= 10000) {
    return (n / 10000).toFixed(n % 10000 === 0 ? 0 : 1).replace(/\.0$/, '') + '万'
  }
  return n.toLocaleString('zh-CN')
}

// 检查是否有有效的福利标签
const hasValidBenefits = (product) => {
  if (product.enableRedpacket && (parseFloat(product.redpacketPercent) > 0 || parseFloat(product.redpacketAmount) > 0)) return true
  if (product.enableDividend && parseFloat(product.dividendPercent) > 0) return true
  if (product.enableDoubleExp && parseFloat(product.doubleExpMultiplier) > 1) return true
  if (product.enableVipBonus) return true
  if (product.enableLevelCommission && parseFloat(product.levelCommissionRate) > 0) return true
  if (product.enableRepurchase && (parseFloat(product.repurchasePercent) > 0 || parseFloat(product.repurchaseAmount) > 0)) return true
  return false
}

// 格式化VIP等级显示
const formatVipLevels = (levels) => {
  if (!levels || levels === 'all') return ''
  const arr = levels.split(',').map(v => v.trim()).filter(v => v)
  if (arr.length === 1) return arr[0]
  if (arr.length === 2) return `${arr[0]}/${arr[1]}`
  return `${arr[0]}+`
}

// 切换悬浮提示
const toggleTooltip = (event, type, product) => {
  // 如果点击的是同一个图标，关闭提示
  if (tooltip.value.show && tooltip.value.type === type) {
    tooltip.value.show = false
    return
  }
  
  // 获取点击元素的位置
  const rect = event.target.closest('.benefit-icon-mini').getBoundingClientRect()
  const scrollY = window.scrollY || document.documentElement.scrollTop
  
  // 计算 tooltip 位置（在图标上方居中）
  const tooltipWidth = 220
  let x = rect.left + rect.width / 2 - tooltipWidth / 2
  let y = rect.top + scrollY - 10
  
  // 边界检测
  if (x < 10) x = 10
  if (x + tooltipWidth > window.innerWidth - 10) x = window.innerWidth - tooltipWidth - 10
  
  // 获取提示内容
  let title = ''
  let desc = ''
  let value = ''
  
  if (type === 'vipLimit') {
    const levels = product.vipLevels?.split(',').map(v => v.trim()).filter(v => v) || []
    const levelNames = ['VIP0', 'VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5']
    const names = levels.map(l => levelNames[parseInt(l)] || `VIP${l}`).join('、')
    title = 'VIP专属'
    desc = '该产品仅限指定VIP等级购买'
    value = names
  } else {
    const tip = rewardTips[type]
    if (!tip) return
    title = tip.title
    desc = tip.desc
    
    if (type === 'redpacket') {
      value = product.redpacketType === 'percent' 
        ? `投入金额 ${formatNumber(product.redpacketPercent)}%`
        : `${formatNumber(product.redpacketAmount)} ${product.incomeCoinSymbol}`
    } else if (type === 'dividend') {
      value = `总收益 ${formatNumber(product.dividendPercent)}%`
    } else if (type === 'doubleExp') {
      value = `${product.doubleExpMultiplier}x 经验`
    } else if (type === 'vipBonus') {
      value = 'VIP专属加成'
    } else if (type === 'levelCommission') {
      value = `下级收益 ${formatNumber(product.levelCommissionRate)}%`
    } else if (type === 'repurchase') {
      value = product.repurchaseType === 'percent'
        ? `投入金额 ${formatNumber(product.repurchasePercent)}%`
        : `${formatNumber(product.repurchaseAmount)} ${product.incomeCoinSymbol}`
    }
  }
  
  tooltip.value = {
    show: true,
    type,
    title,
    desc,
    value,
    x,
    y
  }
  
  // 清除之前的定时器
  if (tooltipTimer) clearTimeout(tooltipTimer)
  
  // 3秒后自动关闭
  tooltipTimer = setTimeout(() => {
    tooltip.value.show = false
  }, 3000)
}

// 关闭 tooltip（点击页面其他地方）
const closeTooltip = () => {
  tooltip.value.show = false
  if (tooltipTimer) clearTimeout(tooltipTimer)
}

// 显示福利详情提示
const rewardTips = {
  redpacket: {
    title: '红包奖励',
    desc: '申购成功后，按投入金额的比例立即发放红包奖励到您的账户'
  },
  dividend: {
    title: '到期分红',
    desc: '产品到期后，除正常收益外，额外获得总收益的分红奖励'
  },
  doubleExp: {
    title: '经验加成',
    desc: '该产品可获得倍数经验加成，加速您的等级提升'
  },
  vipBonus: {
    title: 'VIP加成',
    desc: 'VIP用户可获得额外收益加成，等级越高加成越多'
  },
  levelCommission: {
    title: '推荐返利',
    desc: '推荐好友购买该产品，您可获得其收益的返利奖励'
  },
  repurchase: {
    title: '复购补贴',
    desc: '到期后继续购买该产品，可获得复购补贴奖励'
  }
}



// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 收益计算函数
const calcDailyIncome = () => {
  const product = subscribeModal.value.product
  const amount = subscribeModal.value.amount
  if (!product || !amount) return '0'
  const rate = parseFloat(product.minRate) / 100
  const daily = amount * rate
  return daily.toFixed(4).replace(/\.?0+$/, '')
}

const calcTotalIncome = () => {
  const product = subscribeModal.value.product
  const amount = subscribeModal.value.amount
  if (!product || !amount) return '0'
  const rate = parseFloat(product.minRate) / 100
  const days = parseInt(product.lockDays) || 30
  const total = amount * rate * days
  return total.toFixed(2).replace(/\.?0+$/, '')
}

const calcMonthlyIncome = () => {
  const product = subscribeModal.value.product
  const amount = subscribeModal.value.amount
  if (!product || !amount) return '0'
  const rate = parseFloat(product.minRate) / 100
  const monthly = amount * rate * 30
  return monthly.toFixed(2).replace(/\.?0+$/, '')
}

// 收益动画
const animateIncome = (target) => {
  const current = parseFloat(animatedTotalIncome.value) || 0
  const diff = target - current
  const duration = 1000
  const startTime = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    const value = current + diff * eased
    animatedTotalIncome.value = value.toFixed(2)
    
    if (progress < 1) {
      incomeAnimationFrame = requestAnimationFrame(animate)
    }
  }
  
  if (incomeAnimationFrame) cancelAnimationFrame(incomeAnimationFrame)
  animate()
}

// 计算持仓进度
const getHoldingProgress = (holding) => {
  if (!holding.startAt || !holding.endAt) return 0
  const start = new Date(holding.startAt).getTime()
  const end = new Date(holding.endAt).getTime()
  const now = Date.now()
  if (now >= end) return 100
  if (now <= start) return 0
  return Math.round(((now - start) / (end - start)) * 100)
}

// 计算预估收益
const calculateDailyIncome = (amount, dailyRate) => {
  if (!amount || !dailyRate) return '0'
  const result = (parseFloat(amount) * parseFloat(dailyRate)).toFixed(4)
  return result.replace(/\.?0+$/, '') || '0'
}

const calculateYearlyIncome = (amount, annualRate) => {
  if (!amount || !annualRate) return '0'
  const rate = parseFloat(annualRate.replace('%', '')) / 100
  const result = (parseFloat(amount) * rate).toFixed(2)
  return result.replace(/\.?0+$/, '') || '0'
}

// 打开申购弹窗
const openSubscribeModal = (product) => {
  subscribeModal.value = {
    show: true,
    product,
    amount: 0
  }
}

// 确认申购
const confirmSubscribe = async () => {
  const product = subscribeModal.value.product
  const amount = subscribeModal.value.amount
  
  if (!canSubscribe.value) return
  
  try {
    const status = await getTradePasswordStatus()
    if (!status.hasTradePassword) {
      await alert(t('common.setTradePasswordFirst'))
      router.push('/settings')
      return
    }
    
    const result = await withTradePassword(async (password) => {
      loading.value = true
      
      const res = await api.pool.subscribe({
        productId: product.id,
        amount: amount.toString(),
        tradePassword: password
      })
      
      // 兼容多种响应格式
      const isSuccess = res.code === 0 || res.success
      
      if (isSuccess) {
        showSuccess(t('pool.subscribeSuccess'))
        subscribeModal.value.show = false
        // 同时刷新持仓和余额
        await Promise.all([fetchHoldings(), fetchBalance()])
        return true
      } else {
        throw new Error(res.message || res.msg || t('pool.subscribeFailed'))
      }
    }, {
      title: t('pool.confirmSubscribe'),
      tip: `${t('pool.subscribeAmount')}: ${amount} ${product.coinSymbol}`
    })
    
    if (result === null) return
  } catch (error) {
    if (error.message === '用户取消') return
    showError(error.message || t('pool.subscribeFailed'))
  } finally {
    loading.value = false
  }
}

// 赎回持仓
const handleRedeem = async (holding) => {
  if (loading.value) return
  
  if (holding.product?.type === 'fixed') {
    const endTime = new Date(holding.endAt)
    if (endTime > new Date()) {
      showError(t('pool.notExpired'))
      return
    }
  }
  
  try {
    const status = await getTradePasswordStatus()
    if (!status.hasTradePassword) {
      await alert(t('common.setTradePasswordFirst'))
      router.push('/settings')
      return
    }
    
    const result = await withTradePassword(async (password) => {
      loading.value = true
      
      const res = await api.pool.redeem({
        holdingId: holding.id,
        tradePassword: password
      })
      
      if (res.code === 0) {
        showSuccess(t('pool.redeemSuccess'))
        await fetchHoldings()
        return true
      } else {
        throw new Error(res.message || res.msg || t('pool.redeemFailed'))
      }
    }, {
      title: t('pool.confirmRedeem'),
      tip: `${t('pool.principal')}: ${formatNumber(holding.amount)} ${holding.product?.coinSymbol}\n${t('pool.totalEarnings')}: ${formatNumber(holding.totalIncome)} ${holding.product?.incomeCoinSymbol}`
    })
    
    if (result === null) return
  } catch (error) {
    if (error.message === '用户取消') return
    showError(error.message || t('pool.redeemFailed'))
  } finally {
    loading.value = false
  }
}

// 获取产品列表
const fetchProducts = async () => {
  try {
    const res = await api.pool.getProducts()
    if (res.code === 0) {
      products.value = res.data?.list || res.data || []
    }
  } catch (error) {
    console.error('获取产品列表失败:', error)
  }
}

// 获取我的持仓
const fetchHoldings = async () => {
  try {
    const res = await api.pool.getHoldings()
    if (res.code === 0) {
      holdings.value = res.data?.list || res.data || []
      totalStats.value = {
        totalAmount: res.data?.totalAmount || '0',
        totalIncome: res.data?.totalIncome || '0',
        yesterdayIncome: res.data?.yesterdayIncome || '0'
      }
      animateIncome(parseFloat(totalStats.value.totalIncome))
    }
  } catch (error) {
    console.error('获取持仓失败:', error)
  }
}

// 获取AGX余额
const fetchBalance = async () => {
  try {
    const res = await api.account.balance()
    if (res.success && res.data) {
      // 支持多种返回格式
      if (res.data.assets && Array.isArray(res.data.assets)) {
        const agxAsset = res.data.assets.find(a => (a.currency || a.coin || a.symbol) === 'AGX')
        if (agxAsset) {
          const balance = parseFloat(agxAsset.available || agxAsset.balance || 0)
          const locked = parseFloat(agxAsset.locked || agxAsset.frozen || 0)
          agxBalance.value = balance - locked
        } else {
          agxBalance.value = 0
        }
      } else {
        agxBalance.value = parseFloat(res.data.agx || res.data.totalAgx || 0)
      }
    }
  } catch (error) {
    console.error('获取余额失败:', error)
  }
}

onMounted(async () => {
  await Promise.all([fetchProducts(), fetchHoldings(), fetchBalance()])
  // 点击页面其他地方关闭 tooltip
  document.addEventListener('click', closeTooltip)
})

onUnmounted(() => {
  if (incomeAnimationFrame) cancelAnimationFrame(incomeAnimationFrame)
  if (tooltipTimer) clearTimeout(tooltipTimer)
  document.removeEventListener('click', closeTooltip)
})
</script>

<style scoped>
.pool-page {
  min-height: 100vh;
  background: var(--bg-base, #0B0E11);
  color: var(--text-primary, #EAECEF);
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
  background: rgba(11, 14, 17, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
}

.back-btn, .help-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-tertiary, #848E9C);
  transition: color 0.2s;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}


.back-btn:active, .help-btn:active {
  color: var(--color-brand, #C8AA6E);
}

.back-btn svg, .help-btn svg {
  width: 18px;
  height: 18px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

/* 内容区 */
.content {
  padding: 12px;
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}

/* 总览卡片 */
.overview-card {
  position: relative;
  background: linear-gradient(135deg, rgba(14, 203, 129, 0.15) 0%, rgba(22, 27, 34, 0.95) 100%);
  border: 1px solid rgba(14, 203, 129, 0.25);
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 16px;
  overflow: hidden;
}

.overview-bg {
  position: absolute;
  top: -50%;
  right: -30%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(14, 203, 129, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.overview-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.overview-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.overview-label {
  font-size: 12px;
  color: var(--text-tertiary, #848E9C);
}

.overview-value-wrap {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.overview-value {
  font-family: 'DIN Alternate', -apple-system, monospace;
  font-size: 32px;
  font-weight: 800;
  color: var(--color-up, #0ECB81);
  text-shadow: 0 0 30px rgba(14, 203, 129, 0.4);
}

.overview-unit {
  font-size: 14px;
  color: var(--text-tertiary, #848E9C);
  font-weight: 500;
}

.overview-sub {
  font-size: 12px;
  color: var(--color-up, #0ECB81);
  opacity: 0.8;
}

.eye-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 8px;
  color: var(--text-quaternary, #5E6673);
  transition: all 0.2s;
}

.eye-btn:active {
  background: var(--color-brand, #C8AA6E);
  color: var(--bg-base, #0B0E11);
}

.eye-btn svg {
  width: 16px;
  height: 16px;
}

.overview-stats {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  padding: 12px 0;
}

.overview-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.overview-stat .stat-label {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
}

.overview-stat .stat-value {
  font-family: 'DIN Alternate', monospace;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.overview-stat .stat-value.gold {
  color: var(--color-brand, #C8AA6E);
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.08);
}

/* 区块 */
.section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
  margin: 0;
}

.section-title svg {
  width: 18px;
  height: 18px;
  color: var(--color-brand, #C8AA6E);
}

.section-badge {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
  background: rgba(255, 255, 255, 0.06);
  padding: 4px 10px;
  border-radius: 10px;
}

/* 产品列表 */
.product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-card {
  position: relative;
  background: linear-gradient(145deg, rgba(30, 38, 50, 0.9) 0%, rgba(22, 27, 34, 0.95) 100%);
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
  border-radius: 16px;
  padding: 16px;
  overflow: hidden;
}

.product-card.hot {
  border-color: rgba(14, 203, 129, 0.3);
  box-shadow: 0 4px 20px rgba(14, 203, 129, 0.1);
}

.hot-badge {
  position: absolute;
  top: 12px;
  right: -24px;
  background: linear-gradient(90deg, #F6465D, #FF6B6B);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 30px;
  transform: rotate(45deg);
}

/* 卡片头部 */
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.card-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-icon img {
  width: 28px;
  height: 28px;
}

.product-title h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
  margin: 0 0 4px 0;
}

.product-title p {
  font-size: 11px;
  color: var(--text-tertiary, #848E9C);
  margin: 0;
}

/* 收益率 */
.card-rate {
  text-align: right;
}

.rate-num {
  font-size: 28px;
  font-weight: 700;
  color: #0ECB81;
  line-height: 1;
}

.rate-num i {
  font-style: normal;
  font-size: 14px;
}

.rate-text {
  display: block;
  font-size: 10px;
  color: var(--text-tertiary, #848E9C);
  margin-top: 2px;
}

/* 核心数据 */
.card-data {
  display: flex;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 12px;
}

.data-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-item label {
  font-size: 10px;
  color: var(--text-tertiary, #848E9C);
}

.data-item span {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.data-item span em {
  font-style: normal;
  color: #C8AA6E;
}

.data-item span.green {
  color: #0ECB81;
}

.data-item label em {
  font-style: normal;
  color: #C8AA6E;
  margin-left: 2px;
}

/* 福利图标（右上角迷你版） */
.card-benefits-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.benefit-icon-mini {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-quaternary, #5E6673);
  cursor: pointer;
  transition: all 0.2s;
}

.benefit-icon-mini svg {
  width: 12px;
  height: 12px;
}

.benefit-icon-mini:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-tertiary, #848E9C);
}

.benefit-icon-mini:active {
  transform: scale(0.9);
  background: rgba(200, 170, 110, 0.15);
  color: #C8AA6E;
}

.benefit-icon-mini.vip-limit {
  background: rgba(200, 170, 110, 0.1);
  color: #C8AA6E;
}

.invest-value {
  color: var(--text-primary, #EAECEF);
  font-size: 13px;
  font-weight: 500;
}

.invest-value.highlight {
  color: #0ECB81;
}

/* 剩余额度 */
.product-quota {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(14, 203, 129, 0.08);
  border-radius: 8px;
  margin-bottom: 12px;
}

.quota-label {
  color: var(--text-tertiary, #848E9C);
  font-size: 12px;
}

.quota-value {
  color: #0ECB81;
  font-size: 13px;
  font-weight: 600;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(200, 170, 110, 0.3);
}

.product-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #EAECEF);
}

.product-type {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
}

.product-type svg {
  width: 12px;
  height: 12px;
}

.product-apy {
  text-align: right;
}

.apy-label {
  display: block;
  font-size: 10px;
  color: var(--text-quaternary, #5E6673);
  margin-bottom: 2px;
}

.apy-value {
  font-family: 'DIN Alternate', monospace;
  font-size: 22px;
  font-weight: 800;
  color: var(--color-up, #0ECB81);
  text-shadow: 0 0 15px rgba(14, 203, 129, 0.3);
}

/* 流向 */
.product-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
}

.flow-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.flow-label {
  font-size: 10px;
  color: var(--text-quaternary, #5E6673);
}

.flow-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.flow-value.highlight {
  color: var(--color-up, #0ECB81);
}

.flow-arrow {
  color: var(--text-quaternary, #5E6673);
}

.flow-arrow svg {
  width: 20px;
  height: 20px;
}

/* 产品统计 */
.product-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 14px;
}

.product-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-stat .stat-label {
  font-size: 10px;
  color: var(--text-quaternary, #5E6673);
}

.product-stat .stat-value {
  font-family: 'DIN Alternate', monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary, #B7BDC6);
}

/* 申购按钮 */
.subscribe-btn {
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), #A08A5B);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: var(--bg-base, #0B0E11);
  box-shadow: 0 4px 16px rgba(200, 170, 110, 0.35);
  transition: all 0.25s;
}

.subscribe-btn:active {
  transform: scale(0.97);
}

.subscribe-btn svg {
  width: 16px;
  height: 16px;
}

/* 持仓列表 */
.holdings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.holding-card {
  background: var(--bg-elevated, rgba(22, 27, 34, 0.9));
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
  border-radius: 14px;
  padding: 14px;
  opacity: 0.7;
  transition: all 0.3s;
}

.holding-card.active {
  opacity: 1;
  border-color: rgba(14, 203, 129, 0.2);
}

.holding-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.holding-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.holding-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.holding-type {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
}

.holding-status {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-quaternary, #5E6673);
}

.holding-status.active {
  background: rgba(14, 203, 129, 0.12);
  color: var(--color-up, #0ECB81);
}

.holding-data {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.data-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-item.highlight {
  margin-left: auto;
  text-align: right;
}

.data-label {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
}

.data-value {
  font-family: 'DIN Alternate', monospace;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.data-value.income {
  color: var(--color-up, #0ECB81);
}

/* 持仓进度 */
.holding-progress {
  margin-bottom: 12px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-quaternary, #5E6673);
  margin-bottom: 6px;
}

.progress-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-brand, #C8AA6E), #F5D063);
  border-radius: 2px;
  transition: width 0.5s;
}

.holding-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.holding-time {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
}

.redeem-btn {
  padding: 6px 14px;
  background: rgba(14, 203, 129, 0.12);
  border: 1px solid rgba(14, 203, 129, 0.25);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-up, #0ECB81);
  transition: all 0.2s;
}

.redeem-btn:active {
  background: var(--color-up, #0ECB81);
  color: white;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--text-quaternary, #5E6673);
}

.empty-state svg {
  width: 48px;
  height: 48px;
  opacity: 0.5;
}

.empty-state span {
  font-size: 13px;
}

/* 弹窗 */
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
}

.modal-bar {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 2px;
  margin: 0 auto 16px;
}

.modal-content h3 {
  font-size: 17px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 20px;
  color: var(--text-primary, #EAECEF);
}

/* 申购弹窗 */
.modal-product {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  margin-bottom: 16px;
}

.modal-product .product-icon {
  width: 44px;
  height: 44px;
}

.modal-product .product-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-product .name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.modal-product .apy {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-up, #0ECB81);
}

.modal-input-group {
  margin-bottom: 16px;
}

.input-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.input-label {
  font-size: 12px;
  color: var(--text-secondary, #B7BDC6);
}

.input-balance {
  font-size: 12px;
  color: var(--text-quaternary, #5E6673);
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-wrap input {
  flex: 1;
  height: 46px;
  padding: 0 14px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-family: 'DIN Alternate', monospace;
  font-size: 16px;
  color: var(--text-primary, #EAECEF);
  outline: none;
  transition: border-color 0.2s;
}

.input-wrap input:focus {
  border-color: var(--color-brand, #C8AA6E);
}

.input-wrap input::placeholder {
  color: var(--text-quaternary, #5E6673);
  font-size: 13px;
}

.input-unit {
  font-size: 13px;
  font-weight: 600;
  color: #C8AA6E;
}

.max-btn {
  padding: 0 16px;
  height: 46px;
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-brand, #C8AA6E);
  transition: all 0.2s;
}

.max-btn:active {
  background: var(--color-brand, #C8AA6E);
  color: var(--bg-base, #0B0E11);
}

.input-hint {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
  margin-top: 8px;
}

/* 收益计算卡片 */
.income-calc {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
}

.calc-header {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary, #B7BDC6);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.calc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.calc-label {
  font-size: 12px;
  color: var(--text-tertiary, #848E9C);
}

.calc-value {
  font-family: 'DIN Alternate', monospace;
  font-size: 13px;
  color: var(--text-primary, #EAECEF);
}

.calc-value.green {
  color: #0ECB81;
  font-weight: 600;
}

.calc-value.big {
  font-size: 18px;
  font-weight: 700;
}

.calc-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 10px 0;
}

.calc-row.main {
  padding: 8px 0;
}

/* 弹窗按钮 */
.modal-actions {
  display: flex;
  gap: 10px;
}

.modal-btn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  transition: all 0.25s;
}

.modal-btn.cancel {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-tertiary, #848E9C);
}

.modal-btn.confirm {
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), #A08A5B);
  border: none;
  color: var(--bg-base, #0B0E11);
  box-shadow: 0 4px 16px rgba(200, 170, 110, 0.35);
}

.modal-btn.confirm:disabled {
  opacity: 0.4;
  box-shadow: none;
}

.modal-btn.full {
  width: 100%;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), #A08A5B);
  border: none;
  color: var(--bg-base, #0B0E11);
  box-shadow: 0 4px 16px rgba(200, 170, 110, 0.35);
}

.modal-btn:active {
  transform: scale(0.98);
}

/* 规则 */
.rules-body {
  margin-bottom: 20px;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.rule-item:last-child {
  border-bottom: none;
}

.rule-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.15);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-brand, #C8AA6E);
  flex-shrink: 0;
}

.rule-item span:last-child {
  font-size: 13px;
  color: var(--text-tertiary, #848E9C);
  line-height: 1.6;
}

/* 悬浮提示 Tooltip - 金融风格 */
.benefit-tooltip {
  position: absolute;
  z-index: 2000;
  width: 240px;
  background: #1C2028;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  transform: translateY(-100%) translateY(-8px);
}

.tooltip-indicator {
  width: 3px;
  flex-shrink: 0;
  background: #0ECB81;
}

.tooltip-indicator.redpacket { background: #C8AA6E; }
.tooltip-indicator.dividend { background: #0ECB81; }
.tooltip-indicator.doubleExp { background: #8B5CF6; }
.tooltip-indicator.vipBonus { background: #C8AA6E; }
.tooltip-indicator.levelCommission { background: #3B82F6; }
.tooltip-indicator.repurchase { background: #EC4899; }
.tooltip-indicator.vipLimit { background: #C8AA6E; }

.tooltip-content {
  flex: 1;
  padding: 10px 12px;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.tooltip-label {
  font-size: 13px;
  font-weight: 500;
  color: #EAECEF;
  letter-spacing: 0.01em;
}

.tooltip-val {
  font-size: 12px;
  font-weight: 500;
  color: #0ECB81;
  font-family: 'SF Mono', 'Monaco', monospace;
}

.tooltip-val.redpacket { color: #C8AA6E; }
.tooltip-val.dividend { color: #0ECB81; }
.tooltip-val.doubleExp { color: #8B5CF6; }
.tooltip-val.vipBonus { color: #C8AA6E; }
.tooltip-val.levelCommission { color: #3B82F6; }
.tooltip-val.repurchase { color: #EC4899; }
.tooltip-val.vipLimit { color: #C8AA6E; }

.tooltip-note {
  font-size: 11px;
  color: #707A8A;
  line-height: 1.5;
  margin: 0;
}

/* Tooltip 动画 */
.tooltip-fade-enter-active {
  animation: tooltip-in 0.15s ease-out;
}

.tooltip-fade-leave-active {
  animation: tooltip-out 0.1s ease-in;
}

@keyframes tooltip-in {
  0% {
    opacity: 0;
    transform: translateY(-100%) translateY(-8px) translateY(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(-100%) translateY(-8px);
  }
}

@keyframes tooltip-out {
  0% {
    opacity: 1;
    transform: translateY(-100%) translateY(-8px);
  }
  100% {
    opacity: 0;
    transform: translateY(-100%) translateY(-8px) translateY(4px);
  }
}
</style>
