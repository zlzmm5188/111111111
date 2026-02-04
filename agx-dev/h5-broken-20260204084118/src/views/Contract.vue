<template>
  <PageLayout :title="'黄金期权'" :show-back="true">
    <template #navbar-right>
      <button class="header-btn" @click="handleRecordsClick">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
      </button>
    </template>

    <div class="contract-content">
      <!-- 行情卡片 -->
      <div class="quote-card">
        <div class="quote-header">
          <div class="quote-left">
            <div class="gold-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="url(#goldGradient)"/>
                <path d="M12 6v12M8 10l4-4 4 4M8 14l4 4 4-4" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="24" y2="24">
                    <stop stop-color="#F5D063"/>
                    <stop offset="1" stop-color="#C8AA6E"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="quote-info">
              <span class="quote-symbol">XAU/USD</span>
              <span class="quote-name">国际黄金</span>
            </div>
          </div>
          <div class="quote-right">
            <span class="quote-price" :class="changeClass">${{ formatPrice(currentPrice) }}</span>
            <span class="quote-change" :class="changeClass">
              {{ priceChange >= 0 ? '+' : '' }}{{ priceChange.toFixed(2) }}%
            </span>
          </div>
        </div>
        
        <!-- 实时分时图 -->
        <div class="realtime-chart" ref="chartContainer"></div>
        
        <!-- 行情数据 -->
        <div class="quote-stats">
          <div class="stat">
            <span class="stat-label">24H最高</span>
            <span class="stat-value up">${{ formatPrice(high24h || currentPrice * 1.002) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">24H最低</span>
            <span class="stat-value down">${{ formatPrice(low24h || currentPrice * 0.998) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">实时更新</span>
            <span class="stat-value live">
              <span class="live-dot"></span>
              LIVE
            </span>
          </div>
        </div>
      </div>

      <!-- 未达到级别提示 -->
      <div class="locked-card" v-if="!canAccessContract">
        <div class="locked-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>
        <div class="locked-text">
          <span class="locked-title">功能暂未开放</span>
          <span class="locked-desc">需达到 V{{ requiredLevel }} 级别后解锁</span>
        </div>
        <div class="locked-current">当前等级：V{{ userLevel }}</div>
      </div>

      <!-- 投资产品 -->
      <div class="product-card" v-if="canAccessContract">
        <div class="card-title">
          <span class="title-text">选择投资期限</span>
          <span class="title-hint">收益随期限递增</span>
        </div>
        <div class="product-grid">
          <button
            v-for="config in contractConfigs"
            :key="config.id"
            class="product-item"
            :class="{ active: selectedConfig?.id === config.id }"
            @click="selectConfig(config)"
          >
            <span class="product-duration">{{ config.duration }}秒</span>
            <span class="product-yield">年化 {{ config.profitRatePercent }}</span>
          </button>
        </div>
      </div>

      <!-- 投资周期 -->
      <div class="cycle-card" v-if="canAccessContract && selectedConfig">
        <div class="cycle-info">
          <div class="cycle-left">
            <span class="cycle-label">当前周期倒计时</span>
            <span class="cycle-time">{{ countdown }} 秒</span>
          </div>
          <div class="cycle-right">
            <span class="cycle-label">本期收益率</span>
            <span class="cycle-rate">{{ selectedConfig.profitRatePercent }}</span>
          </div>
        </div>
        <div class="cycle-progress">
          <div class="progress-bar" :style="{ width: (countdown / selectedConfig.duration * 100) + '%' }"></div>
        </div>
      </div>

      <!-- 投资方向 -->
      <div class="direction-card" v-if="canAccessContract">
        <div class="card-title">
          <span class="title-text">选择投资方向</span>
        </div>
        <div class="direction-options">
          <button 
            class="direction-item bullish" 
            :class="{ active: direction === 'rise' }"
            @click="direction = 'rise'"
          >
            <div class="direction-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </div>
            <div class="direction-text">
              <span class="direction-title">看涨</span>
              <span class="direction-desc">预期价格上涨</span>
            </div>
          </button>
          <button 
            class="direction-item bearish" 
            :class="{ active: direction === 'fall' }"
            @click="direction = 'fall'"
          >
            <div class="direction-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12l7 7 7-7"/>
              </svg>
            </div>
            <div class="direction-text">
              <span class="direction-title">看跌</span>
              <span class="direction-desc">预期价格下跌</span>
            </div>
          </button>
        </div>
      </div>

      <!-- 投资金额 -->
      <div class="amount-card" v-if="canAccessContract">
        <div class="card-title">
          <span class="title-text">投资金额</span>
          <span class="balance-info">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v12M8 10h8M8 14h8"/>
            </svg>
            可用 {{ formatNumber(balance) }} AGX
          </span>
        </div>
        <div class="amount-presets">
          <button
            v-for="amt in amountOptions"
            :key="amt"
            class="preset-btn"
            :class="{ active: amount === amt }"
            @click="selectAmount(amt)"
          >{{ amt }}</button>
        </div>
        <div class="amount-input">
          <input
            type="number"
            placeholder="输入自定义金额"
            v-model="customAmount"
            @input="onCustomAmountChange"
          >
          <span class="input-unit">AGX</span>
        </div>
      </div>

      <!-- 收益预估 -->
      <div class="profit-card" v-if="canAccessContract && amount > 0 && selectedConfig">
        <div class="profit-header">投资收益预估</div>
        <div class="profit-detail">
          <div class="profit-item">
            <span class="profit-label">投资金额</span>
            <span class="profit-value">{{ amount }} AGX</span>
          </div>
          <div class="profit-item">
            <span class="profit-label">预期收益</span>
            <span class="profit-value highlight">+{{ calculateProfit().profit }} AGX</span>
          </div>
          <div class="profit-item total">
            <span class="profit-label">到期返还</span>
            <span class="profit-value">{{ calculateProfit().total }} AGX</span>
          </div>
        </div>
      </div>

      <!-- 持仓订单 -->
      <div class="orders-card" v-if="canAccessContract && activeOrders.length > 0">
        <div class="card-title">
          <span class="title-text">当前持仓</span>
          <span class="order-count">{{ activeOrders.length }}</span>
        </div>
        <div class="order-list">
          <div class="order-item" v-for="order in activeOrders" :key="order.id">
            <div class="order-direction" :class="order.direction === 1 ? 'bullish' : 'bearish'">
              {{ order.direction === 1 ? '涨' : '跌' }}
            </div>
            <div class="order-info">
              <span class="order-amount">{{ order.amount }} AGX</span>
              <span class="order-time">{{ formatOrderTime(order.createdAt) }}</span>
            </div>
            <div class="order-countdown">{{ getOrderCountdown(order) }}s</div>
          </div>
        </div>
      </div>


    </div>

    <!-- 底部操作 -->
    <div class="footer-action" v-if="canAccessContract">
      <button
        class="action-btn"
        :class="{ 
          bullish: direction === 'rise', 
          bearish: direction === 'fall',
          disabled: !canPlaceOrder 
        }"
        :disabled="!canPlaceOrder || orderLoading"
        @click="placeOrder"
      >
        <span v-if="orderLoading">提交中...</span>
        <span v-else-if="!direction">请选择投资方向</span>
        <span v-else-if="!amount">请输入投资金额</span>
        <span v-else>确认投资 {{ amount }} AGX</span>
      </button>
    </div>
  </PageLayout>
</template>

<script setup>
defineOptions({ name: 'Contract' })

import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from "vue-i18n"
import { createChart, ColorType, CrosshairMode, AreaSeries, LineSeries } from 'lightweight-charts'
import PageLayout from '@/components/PageLayout.vue'
import api from '@/utils/api'
import { showSuccess, showError } from '@/utils/alert'

const router = useRouter()
const { t } = useI18n()

const contractConfigs = ref([])
const selectedConfig = ref(null)
const currentPrice = ref(0)
const priceChange = ref(0)
const prevPrice = ref(0)
const countdown = ref(30)
const direction = ref('')
const amount = ref(0)
const customAmount = ref('')
const balance = ref(0)
const userLevel = ref(1)
const activeOrders = ref([])
const historyOrders = ref([])
const orderLoading = ref(false)
const isRecordsOpen = ref(false) // 投资记录功能状态
const requiredLevel = ref(5) // 后台配置的最低级别要求

// 是否达到投资级别
const canAccessContract = computed(() => userLevel.value >= requiredLevel.value)

const chartContainer = ref(null)
const high24h = ref(0)
const low24h = ref(0)

let chart = null
let areaSeries = null
let priceData = []

const amountOptions = [10, 50, 100, 500, 1000]

let priceTimer = null
let countdownTimer = null
let orderTimer = null

const canPlaceOrder = computed(() => {
  if (!direction.value || !amount.value || !selectedConfig.value) return false
  const min = parseFloat(selectedConfig.value.minAmount)
  const max = parseFloat(selectedConfig.value.maxAmount)
  return amount.value >= min && amount.value <= max && amount.value <= balance.value
})

const changeClass = computed(() => priceChange.value >= 0 ? 'up' : 'down')

const formatPrice = (price) => price ? parseFloat(price).toFixed(2) : '0.00'

const formatNumber = (num) => num ? parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'

const formatTime = (time) => {
  if (!time) return ''
  const d = new Date(time)
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

const formatOrderTime = (time) => {
  if (!time) return ''
  const d = new Date(time)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
}

const selectConfig = (config) => {
  selectedConfig.value = config
  countdown.value = config.duration
}

const selectAmount = (amt) => {
  amount.value = amt
  customAmount.value = ''
}

const onCustomAmountChange = () => {
  if (customAmount.value) amount.value = parseFloat(customAmount.value) || 0
}

const calculateProfit = () => {
  if (!amount.value || !selectedConfig.value) return { profit: '0.00', total: '0.00' }
  const profit = amount.value * parseFloat(selectedConfig.value.profitRate)
  return { profit: profit.toFixed(2), total: (amount.value + profit).toFixed(2) }
}

const getResultClass = (order) => {
  if (order.status === 0) return ''
  if (order.result === 1) return 'profit'
  if (order.result === 2) return 'loss'
  return ''
}

const getResultText = (order) => {
  if (order.status === 0) return '进行中'
  if (order.result === 1) return `+${parseFloat(order.profitLoss || 0).toFixed(2)}`
  if (order.result === 2) return `${parseFloat(order.profitLoss || 0).toFixed(2)}`
  if (order.result === 3) return '平局'
  return ''
}

const getOrderCountdown = (order) => {
  if (!order.closeAt) return 0
  return Math.max(0, Math.floor((new Date(order.closeAt).getTime() - Date.now()) / 1000))
}

const handleRecordsClick = () => {
  if (!isRecordsOpen.value) {
    showError('功能暂未开放，敬请期待')
    return
  }
  router.push('/orders?type=contract')
}

const loadConfigs = async () => {
  try {
    const res = await api.get('/contract/configs')
    if (res.code === 0 && res.data?.list) {
      contractConfigs.value = res.data.list
      if (res.data.list.length > 0 && !selectedConfig.value) {
        selectedConfig.value = res.data.list[0]
        countdown.value = res.data.list[0].duration
      }
    }
  } catch (err) { console.error(err) }
}

const loadBalance = async () => {
  try {
    const res = await api.get('/account/balance')
    if (res.code === 0 && res.data) {
      const agx = res.data.find?.(a => a.currency === 'AGX') || res.data.agx
      balance.value = parseFloat(agx?.available || agx || 0)
    }
    // 获取用户等级
    const profileRes = await api.get('/account/profile')
    if (profileRes.code === 0 && profileRes.data) {
      userLevel.value = profileRes.data.level || 1
    }
  } catch (err) { console.error(err) }
}

const loadOrders = async () => {
  try {
    const activeRes = await api.get('/contract/orders', { params: { status: 0 } })
    if (activeRes.code === 0) activeOrders.value = activeRes.data?.list || []
    const historyRes = await api.get('/contract/orders')
    if (historyRes.code === 0) historyOrders.value = (historyRes.data?.list || []).filter(o => o.status !== 0).slice(0, 5)
  } catch (err) { console.error(err) }
}

const updatePrice = async () => {
  try {
    const res = await api.get('/market/tickers', { params: { type: 'metal' } })
    const list = res.data?.data?.list || res.data?.list || []
    if (list.length > 0) {
      const gold = list.find(m => m.symbol === 'XAU/USD' || m.symbol === 'XAU' || m.name?.includes('黄金'))
      if (gold) {
        const newPrice = parseFloat(gold.lastPrice || gold.price)
        if (prevPrice.value === 0) prevPrice.value = newPrice
        currentPrice.value = newPrice
        let change = parseFloat(gold.priceChangePercent || gold.changePercent || 0)
        if (change === 0 && prevPrice.value > 0) change = ((newPrice - prevPrice.value) / prevPrice.value) * 100
        priceChange.value = change
        high24h.value = parseFloat(gold.high24h || gold.highPrice || newPrice * 1.002)
        low24h.value = parseFloat(gold.low24h || gold.lowPrice || newPrice * 0.998)
      }
    }
  } catch (err) { console.error(err) }
}

const changeInterval = (interval) => {
  selectedInterval.value = interval
  loadKlineData()
}

const initChart = () => {
  if (!chartContainer.value || chart) return
  
  const containerWidth = chartContainer.value.clientWidth
  
  chart = createChart(chartContainer.value, {
    width: containerWidth,
    height: 180,
    layout: {
      background: { type: ColorType.Solid, color: 'transparent' },
      textColor: '#5E6673',
      fontSize: 10,
      fontFamily: "'SF Mono', 'Monaco', monospace",
    },
    grid: {
      vertLines: { visible: false },
      horzLines: { color: 'rgba(255, 255, 255, 0.06)', style: 1 },
    },
    crosshair: {
      mode: CrosshairMode.Magnet,
      vertLine: { color: 'rgba(200, 170, 110, 0.5)', width: 1, style: 3, labelVisible: false },
      horzLine: { color: 'rgba(200, 170, 110, 0.5)', width: 1, style: 3, labelBackgroundColor: '#C8AA6E' },
    },
    rightPriceScale: {
      borderVisible: false,
      scaleMargins: { top: 0.15, bottom: 0.1 },
      textColor: '#5E6673',
    },
    timeScale: {
      borderVisible: false,
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 3,
      barSpacing: 6,
      minBarSpacing: 3,
      fixLeftEdge: true,
      fixRightEdge: true,
      tickMarkFormatter: (time) => {
        const date = new Date(time * 1000)
        return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
      },
    },
    handleScale: { mouseWheel: false, pinch: false, axisPressedMouseMove: false },
    handleScroll: { mouseWheel: false, pressedMouseMove: false, horzTouchDrag: false, vertTouchDrag: false },
    localization: {
      priceFormatter: (price) => price.toFixed(2),
    },
  })
  
  // 实时分时图 - 专业样式
  areaSeries = chart.addSeries(AreaSeries, {
    lineColor: '#26A69A',
    topColor: 'rgba(38, 166, 154, 0.28)',
    bottomColor: 'rgba(38, 166, 154, 0.02)',
    lineWidth: 2,
    lineType: 0,
    priceLineVisible: true,
    priceLineColor: '#26A69A',
    priceLineWidth: 1,
    priceLineStyle: 2,
    lastValueVisible: true,
    crosshairMarkerVisible: true,
    crosshairMarkerRadius: 4,
    crosshairMarkerBorderColor: '#26A69A',
    crosshairMarkerBackgroundColor: '#1E262F',
    priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
  })
  
  // 初始化历史数据
  initPriceData()
  
  // 响应式调整
  const resizeObserver = new ResizeObserver(() => {
    if (chart && chartContainer.value) {
      chart.applyOptions({ width: chartContainer.value.clientWidth })
    }
  })
  resizeObserver.observe(chartContainer.value)
}

const initPriceData = () => {
  const now = Math.floor(Date.now() / 1000)
  const basePrice = currentPrice.value || 2650
  priceData = []
  
  // 生成过去60秒的平滑数据
  let price = basePrice * (1 - 0.0003) // 从稍低点开始
  for (let i = 59; i >= 0; i--) {
    // 平滑随机波动
    const change = (Math.random() - 0.48) * 0.0002 // 轻微上涨趋势
    price = price * (1 + change)
    priceData.push({ time: now - i, value: parseFloat(price.toFixed(2)) })
  }
  
  // 最后一个点设为当前价格
  if (priceData.length > 0) {
    priceData[priceData.length - 1].value = basePrice
  }
  
  if (areaSeries && priceData.length > 0) {
    areaSeries.setData(priceData)
    chart.timeScale().fitContent()
  }
}

const updateRealtimePrice = () => {
  if (!areaSeries || !currentPrice.value || priceData.length === 0) return
  
  const now = Math.floor(Date.now() / 1000)
  const lastData = priceData[priceData.length - 1]
  const price = parseFloat(currentPrice.value.toFixed(2))
  
  // 如果是新的一秒，添加新数据点
  if (now > lastData.time) {
    priceData.push({ time: now, value: price })
    // 保留最近90秒数据
    while (priceData.length > 90) priceData.shift()
    areaSeries.setData(priceData)
  } else {
    // 更新最后一个数据点
    lastData.value = price
    areaSeries.update(lastData)
  }
  
  // 根据涨跌更新颜色
  const firstPrice = priceData[0]?.value || price
  const isUp = price >= firstPrice
  const lineColor = isUp ? '#26A69A' : '#EF5350'
  const topColor = isUp ? 'rgba(38, 166, 154, 0.28)' : 'rgba(239, 83, 80, 0.28)'
  const bottomColor = isUp ? 'rgba(38, 166, 154, 0.02)' : 'rgba(239, 83, 80, 0.02)'
  
  areaSeries.applyOptions({
    lineColor,
    topColor,
    bottomColor,
    priceLineColor: lineColor,
    crosshairMarkerBorderColor: lineColor,
  })
}

const placeOrder = async () => {
  // 检查等级限制
  if (userLevel.value < 5) {
    showError('未达到级别，无法参与')
    return
  }
  if (!canPlaceOrder.value || orderLoading.value) return
  orderLoading.value = true
  try {
    const res = await api.post('/contract/order', {
      configId: selectedConfig.value.id,
      amount: amount.value,
      direction: direction.value === 'rise' ? 1 : 2
    })
    if (res.code === 0) {
      showSuccess('投资成功')
      direction.value = ''
      amount.value = 0
      customAmount.value = ''
      loadOrders()
      loadBalance()
    } else {
      showError(res.msg || '投资失败')
    }
  } catch (err) {
    showError(err.response?.data?.msg || '网络错误')
  } finally {
    orderLoading.value = false
  }
}

onMounted(async () => {
  loadConfigs()
  loadBalance()
  loadOrders()
  // 必须先获取价格，否则图表无法正确初始化
  await updatePrice()
  await nextTick()
  
  // 确保有价格后再初始化图表
  if (currentPrice.value > 0) {
    initChart()
  } else {
    // 如果第一次没获取到价格，使用默认价格
    currentPrice.value = 2650
    initChart()
  }
  
  // 每秒更新实时价格
  priceTimer = setInterval(async () => {
    await updatePrice()
    updateRealtimePrice()
  }, 1000)
  countdownTimer = setInterval(() => {
    if (countdown.value > 0) countdown.value--
    else if (selectedConfig.value) countdown.value = selectedConfig.value.duration
  }, 1000)
  orderTimer = setInterval(loadOrders, 10000)
})

onUnmounted(() => {
  if (priceTimer) clearInterval(priceTimer)
  if (countdownTimer) clearInterval(countdownTimer)
  if (orderTimer) clearInterval(orderTimer)
  if (chart) { chart.remove(); chart = null; areaSeries = null }
})
</script>

<style scoped>
.contract-content {
  padding: 0 16px 100px;
}

/* 未开放提示卡片 */
.locked-card {
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 16px;
  padding: 32px 20px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.locked-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200, 170, 110, 0.1);
  border-radius: 50%;
  color: #C8AA6E;
}

.locked-icon svg {
  width: 32px;
  height: 32px;
}

.locked-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.locked-title {
  font-size: 18px;
  font-weight: 600;
  color: #EAECEF;
}

.locked-desc {
  font-size: 14px;
  color: #848E9C;
}

.locked-current {
  font-size: 13px;
  color: #5E6673;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
}

/* 行情卡片 */
.quote-card {
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.quote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.quote-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gold-icon {
  width: 40px;
  height: 40px;
}

.gold-icon svg {
  width: 100%;
  height: 100%;
}

.quote-info {
  display: flex;
  flex-direction: column;
}

.quote-symbol {
  font-size: 16px;
  font-weight: 600;
  color: #EAECEF;
}

.quote-name {
  font-size: 12px;
  color: #5E6673;
}

.quote-right {
  text-align: right;
}

.quote-price {
  display: block;
  font-size: 22px;
  font-weight: 700;
  font-family: 'DIN Alternate', monospace;
  color: #EAECEF;
}

.quote-price.up { color: #C8AA6E; }
.quote-price.down { color: #E57373; }

.quote-change {
  font-size: 13px;
  font-weight: 600;
}

.quote-change.up { color: #C8AA6E; }
.quote-change.down { color: #E57373; }

/* 实时分时图 */
.realtime-chart {
  height: 180px;
  margin: 8px -4px 12px;
  background: transparent;
  border-radius: 8px;
  overflow: hidden;
}

.realtime-chart :deep(canvas) {
  border-radius: 4px;
}

.realtime-chart :deep(.tv-lightweight-charts) {
  border-radius: 4px;
}

.quote-stats {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: #5E6673;
}

.stat-value {
  font-size: 13px;
  font-weight: 600;
  color: #EAECEF;
  font-family: monospace;
}

.stat-value.up { color: #C8AA6E; }
.stat-value.down { color: #E57373; }

.stat-value.live {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #C8AA6E;
  font-size: 11px;
}

.live-dot {
  width: 6px;
  height: 6px;
  background: #C8AA6E;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* 通用卡片样式 */
.product-card, .cycle-card, .direction-card, .amount-card, .profit-card, .orders-card, .history-card {
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.title-text {
  font-size: 14px;
  font-weight: 600;
  color: #EAECEF;
}

.title-hint {
  font-size: 11px;
  color: #5E6673;
}

/* 产品选择 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.product-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid transparent;
  border-radius: 10px;
  transition: all 0.2s;
}

.product-item.active {
  background: rgba(200, 170, 110, 0.1);
  border-color: #C8AA6E;
}

.product-duration {
  font-size: 15px;
  font-weight: 700;
  color: #EAECEF;
}

.product-yield {
  font-size: 11px;
  color: #C8AA6E;
}

/* 周期倒计时 */
.cycle-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.cycle-left, .cycle-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cycle-label {
  font-size: 11px;
  color: #5E6673;
}

.cycle-time {
  font-size: 18px;
  font-weight: 700;
  color: #C8AA6E;
  font-family: monospace;
}

.cycle-rate {
  font-size: 18px;
  font-weight: 700;
  color: #C8AA6E;
}

.cycle-progress {
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #C8AA6E, #F5D063);
  transition: width 1s linear;
}

/* 方向选择 */
.direction-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.direction-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid transparent;
  border-radius: 12px;
  transition: all 0.2s;
}

.direction-item.bullish.active {
  background: rgba(200, 170, 110, 0.1);
  border-color: #C8AA6E;
}

.direction-item.bearish.active {
  background: rgba(229, 115, 115, 0.1);
  border-color: #E57373;
}

.direction-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.direction-item.bullish .direction-icon {
  background: rgba(200, 170, 110, 0.15);
  color: #C8AA6E;
}

.direction-item.bearish .direction-icon {
  background: rgba(229, 115, 115, 0.15);
  color: #E57373;
}

.direction-icon svg {
  width: 20px;
  height: 20px;
}

.direction-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.direction-title {
  font-size: 15px;
  font-weight: 600;
  color: #EAECEF;
}

.direction-desc {
  font-size: 11px;
  color: #5E6673;
}

/* 金额输入 */
.balance-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #C8AA6E;
}

.amount-presets {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.preset-btn {
  height: 36px;
  background: rgba(255,255,255,0.03);
  border: 1px solid transparent;
  border-radius: 8px;
  color: #EAECEF;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.preset-btn.active {
  background: #C8AA6E;
  color: #0D1117;
}

.amount-input {
  position: relative;
}

.amount-input input {
  width: 100%;
  height: 46px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 0 60px 0 14px;
  color: #EAECEF;
  font-size: 15px;
}

.amount-input input:focus {
  border-color: #C8AA6E;
  outline: none;
}

.input-unit {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  color: #5E6673;
}

/* 收益预估 */
.profit-header {
  font-size: 13px;
  color: #5E6673;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.profit-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.profit-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.profit-label {
  color: #5E6673;
}

.profit-value {
  color: #EAECEF;
  font-weight: 500;
}

.profit-value.highlight {
  color: #C8AA6E;
  font-weight: 700;
}

.profit-item.total {
  padding-top: 10px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.profit-item.total .profit-value {
  font-size: 15px;
  font-weight: 700;
}

/* 订单列表 */
.order-count {
  background: #C8AA6E;
  color: #0D1117;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.more-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #C8AA6E;
  background: none;
  border: none;
}

.order-list, .history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-item, .history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255,255,255,0.02);
  border-radius: 10px;
}

.order-direction, .history-direction {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.order-direction.bullish, .history-direction.bullish {
  background: rgba(200, 170, 110, 0.15);
  color: #C8AA6E;
}

.order-direction.bearish, .history-direction.bearish {
  background: rgba(229, 115, 115, 0.15);
  color: #E57373;
}

.order-info, .history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-amount, .history-amount {
  font-size: 14px;
  font-weight: 600;
  color: #EAECEF;
}

.order-time, .history-time {
  font-size: 11px;
  color: #5E6673;
}

.order-countdown {
  font-size: 16px;
  font-weight: 700;
  color: #C8AA6E;
  font-family: monospace;
}

.history-result {
  font-size: 14px;
  font-weight: 600;
  font-family: monospace;
}

.history-result.profit { color: #C8AA6E; }
.history-result.loss { color: #E57373; }

.empty-history {
  text-align: center;
  padding: 24px;
  color: #5E6673;
  font-size: 13px;
}

/* 底部操作 */
.footer-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, transparent 0%, #0D1117 20%);
}

.action-btn {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: #2B3139;
  color: #5E6673;
  transition: all 0.2s;
}

.action-btn.bullish {
  background: linear-gradient(135deg, #C8AA6E 0%, #D4B978 100%);
  color: #0D1117;
}

.action-btn.bearish {
  background: linear-gradient(135deg, #E57373 0%, #EF5350 100%);
  color: #fff;
}

.action-btn:disabled {
  opacity: 0.5;
}

/* Header button */
.header-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #848E9C;
}
</style>
