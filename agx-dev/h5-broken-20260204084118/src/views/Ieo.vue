<template>
  <PageLayout title="AGX申购" :show-back="true">
    <div class="page-content">
      <!-- 加载中 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <template v-else>
        <!-- AGX 项目卡片 -->
        <div class="project-card" v-if="project">
          <div class="card-header">
            <div class="project-badge">
              <span class="badge-dot"></span>
              认购中
            </div>
          </div>
          
          <div class="project-main">
            <div class="project-logo">
              <img :src="project.logo || '/agx-new.png'" alt="AGX">
            </div>
            <div class="project-info">
              <h2 class="project-name">{{ project.coinName || 'AGX' }}</h2>
              <span class="project-symbol">{{ project.coinSymbol || 'AGX' }}</span>
            </div>
          </div>
          
          <p class="project-desc">{{ project.description || '基于黄金储备的数字资产，安全稳定' }}</p>

          <!-- 倒计时 -->
          <div class="countdown-box">
            <div class="countdown-label">认购截止倒计时</div>
            <div class="countdown-row">
              <div class="cd-item"><span class="cd-num">{{ countdown.days }}</span><span class="cd-unit">天</span></div>
              <span class="cd-sep">:</span>
              <div class="cd-item"><span class="cd-num">{{ countdown.hours }}</span><span class="cd-unit">时</span></div>
              <span class="cd-sep">:</span>
              <div class="cd-item"><span class="cd-num">{{ countdown.mins }}</span><span class="cd-unit">分</span></div>
              <span class="cd-sep">:</span>
              <div class="cd-item"><span class="cd-num">{{ countdown.secs }}</span><span class="cd-unit">秒</span></div>
            </div>
          </div>

          <!-- 核心数据 -->
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">认购价格</span>
              <span class="stat-value gold">${{ formatPrice(project.issuePrice || project.price) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">发行总量</span>
              <span class="stat-value">{{ formatNum(project.issueAmount) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">已售出</span>
              <span class="stat-value green">{{ formatNum(project.soldAmount || 0) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">参与人数</span>
              <span class="stat-value">{{ project.participantCount || 0 }}</span>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="progress-box">
            <div class="progress-head">
              <span>认购进度</span>
              <span class="progress-pct">{{ progressPercent }}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
          </div>

          <!-- 购买表单 -->
          <div class="buy-form">
            <div class="form-row">
              <label>支付方式</label>
              <div class="pay-method">
                <span class="method-name">USDT</span>
                <span class="method-balance">余额: {{ formatNum(usdtBalance) }}</span>
              </div>
            </div>
            
            <div class="form-row">
              <label>购买数量 ({{ project.coinSymbol || 'AGX' }})</label>
              <div class="input-box">
                <input 
                  type="number" 
                  v-model="buyAmount" 
                  :placeholder="`最少 ${project.minBuyAmount || 100}`"
                >
                <button class="max-btn" @click="setMax">MAX</button>
              </div>
              <div class="input-hint">
                <span>限额: {{ project.minBuyAmount || 100 }} - {{ formatNum(project.maxBuyAmount || 50000) }} {{ project.coinSymbol || 'AGX' }}</span>
              </div>
            </div>

            <div class="cost-summary">
              <div class="cost-row">
                <span>单价</span>
                <span>${{ formatPrice(project.issuePrice || project.price) }}</span>
              </div>
              <div class="cost-row">
                <span>数量</span>
                <span>{{ buyAmount || 0 }} {{ project.coinSymbol || 'AGX' }}</span>
              </div>
              <div class="cost-row total">
                <span>需支付</span>
                <span class="gold">${{ totalCost }}</span>
              </div>
            </div>

            <button class="buy-btn" :disabled="!canBuy || submitting" @click="handleBuy">
              {{ submitting ? '处理中...' : '立即认购' }}
            </button>
          </div>
        </div>

        <!-- 无项目 -->
        <div v-else class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
          </svg>
          <p>暂无认购项目</p>
        </div>

        <!-- 我的认购记录 -->
        <div class="records-section">
          <div class="section-header">
            <h3>我的认购记录</h3>
            <span class="record-count">共 {{ myRecords.length }} 条</span>
          </div>
          
          <div v-if="myRecords.length === 0" class="empty-records">
            <p>暂无认购记录</p>
          </div>
          
          <div v-else class="records-list">
            <div class="record-item" v-for="r in myRecords" :key="r.id">
              <div class="record-left">
                <div class="record-icon">AGX</div>
                <div class="record-info">
                  <span class="record-amount">{{ formatNum(r.amount) }} AGX</span>
                  <span class="record-time">{{ formatTime(r.createdAt) }}</span>
                </div>
              </div>
              <div class="record-right">
                <span class="record-cost">-${{ formatNum(r.payAmount || r.amount * (project?.price || 0.065)) }}</span>
                <span class="record-status" :class="getStatusClass(r.status)">{{ getStatusText(r.status) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </PageLayout>
</template>

<script setup>
/**
 * IEO申购页面
 * 功能：显示AGX申购项目、倒计时、购买表单、认购记录
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api } from '../utils/api'
import PageLayout from '../components/layout/PageLayout.vue'
import { showSuccess, showError } from '../utils/alert'
import Decimal from 'decimal.js'

// ========== 状态定义 ==========
const loading = ref(true)
const project = ref(null)
const usdtBalance = ref(0)
const buyAmount = ref('')
const submitting = ref(false)
const myRecords = ref([])
const countdown = ref({ days: '00', hours: '00', mins: '00', secs: '00' })

let countdownTimer = null

// ========== 计算属性 ==========

/** 认购进度百分比 */
const progressPercent = computed(() => {
  if (!project.value?.issueAmount) return 0
  const sold = new Decimal(project.value.soldAmount || 0)
  const total = new Decimal(project.value.issueAmount)
  return Math.min(100, sold.div(total).mul(100).toDP(0).toNumber())
})

/** 总费用（使用Decimal.js精确计算） */
const totalCost = computed(() => {
  const amt = new Decimal(buyAmount.value || 0)
  const price = new Decimal(project.value?.issuePrice || project.value?.price || 0.065)
  return amt.mul(price).toDP(2).toString()
})

/** 是否可以购买 */
const canBuy = computed(() => {
  const amt = new Decimal(buyAmount.value || 0)
  const min = new Decimal(project.value?.minBuyAmount || 100)
  const max = new Decimal(project.value?.maxBuyAmount || 50000)
  const cost = new Decimal(totalCost.value)
  const balance = new Decimal(usdtBalance.value)
  return amt.gte(min) && amt.lte(max) && cost.lte(balance)
})

// ========== 方法定义 ==========

/** 设置最大购买数量 */
const setMax = () => {
  const price = new Decimal(project.value?.issuePrice || project.value?.price || 0.065)
  const balance = new Decimal(usdtBalance.value)
  const maxByBalance = balance.div(price).floor()
  const maxByLimit = new Decimal(project.value?.maxBuyAmount || 50000)
  buyAmount.value = Decimal.min(maxByBalance, maxByLimit).toString()
}

/** 格式化数字 */
const formatNum = (num) => {
  if (!num) return '0'
  return Number(num).toLocaleString()
}

/** 格式化价格 */
const formatPrice = (price) => {
  if (!price) return '0.065'
  const num = Number(price)
  // 根据价格大小决定小数位数
  if (num >= 1) return num.toFixed(2)
  if (num >= 0.01) return num.toFixed(4)
  return num.toFixed(6)
}

/** 格式化时间 */
const formatTime = (time) => {
  if (!time) return ''
  const d = new Date(time)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = String(d.getHours()).padStart(2, '0')
  const mins = String(d.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${mins}`
}

/** 获取状态样式类 */
const getStatusClass = (status) => {
  const classMap = { 0: 'pending', 1: 'success', 2: 'failed', 3: 'success', 4: 'failed' }
  return classMap[status] || ''
}

/** 获取状态文本 */
const getStatusText = (status) => {
  const textMap = { 0: '处理中', 1: '已中签', 2: '未中签', 3: '已发放', 4: '已退款' }
  return textMap[status] || '处理中'
}

/** 更新倒计时 */
const updateCountdown = () => {
  if (!project.value?.endTime) return
  
  const endTime = new Date(project.value.endTime).getTime()
  const diff = endTime - Date.now()
  
  if (diff <= 0) {
    countdown.value = { days: '00', hours: '00', mins: '00', secs: '00' }
    return
  }
  
  const MS_PER_DAY = 86400000
  const MS_PER_HOUR = 3600000
  const MS_PER_MIN = 60000
  const MS_PER_SEC = 1000
  
  countdown.value = {
    days: String(Math.floor(diff / MS_PER_DAY)).padStart(2, '0'),
    hours: String(Math.floor((diff % MS_PER_DAY) / MS_PER_HOUR)).padStart(2, '0'),
    mins: String(Math.floor((diff % MS_PER_HOUR) / MS_PER_MIN)).padStart(2, '0'),
    secs: String(Math.floor((diff % MS_PER_MIN) / MS_PER_SEC)).padStart(2, '0')
  }
}

/** 解析API响应数据（处理嵌套结构） */
const parseApiResponse = (res, key = 'list') => {
  if (!res?.success || !res?.data) return []
  const innerData = res.data.data || res.data
  return innerData[key] || innerData || []
}

/** 加载数据 */
const loadData = async () => {
  loading.value = true
  try {
    // 并行加载数据
    const [ieoRes, balRes, recRes] = await Promise.all([
      api.trade.getIeoList(),
      api.account.balance(),
      api.trade.getMyIeoSubscriptions()
    ])
    
    // 处理IEO项目列表
    const list = parseApiResponse(ieoRes)
    const agxProject = list.find(p => p.coinSymbol === 'AGX')
    project.value = agxProject || list[0] || null
    
    if (project.value) {
      project.value.soldAmount = parseFloat(project.value.totalSubscribed) || 0
      project.value.participantCount = project.value.subscriberCount || 0
      project.value.price = project.value.issuePrice || 0.065
    }
    
    // 处理余额
    if (balRes.success && balRes.data) {
      const coins = balRes.data.coins || balRes.data
      if (Array.isArray(coins)) {
        const usdt = coins.find(c => c.coin === 'USDT')
        usdtBalance.value = parseFloat(usdt?.available || 0)
      }
    }
    
    // 处理认购记录
    myRecords.value = parseApiResponse(recRes)
    
    // 启动倒计时
    updateCountdown()
    countdownTimer = setInterval(updateCountdown, 1000)
  } catch (e) {
    showError('数据加载失败，请刷新重试')
  } finally {
    loading.value = false
  }
}

/** 处理购买 */
const handleBuy = async () => {
  if (!canBuy.value || submitting.value) return
  
  const amt = new Decimal(buyAmount.value)
  const min = new Decimal(project.value?.minBuyAmount || 100)
  
  if (amt.lt(min)) {
    showError(`最少购买 ${min.toString()} ${project.value?.coinSymbol || 'AGX'}`)
    return
  }
  
  submitting.value = true
  try {
    const res = await api.trade.subscribeIeo({
      issueId: project.value.id,
      amount: amt.toNumber()
    })
    
    if (res.success) {
      showSuccess('认购成功！')
      buyAmount.value = ''
      loadData()
    } else {
      showError(res.message || '认购失败')
    }
  } catch (e) {
    showError(e.message || '网络错误，请重试')
  } finally {
    submitting.value = false
  }
}

// ========== 生命周期 ==========
onMounted(loadData)

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})
</script>

<style scoped>
.page-content {
  padding: 16px;
  background: var(--bg-page, #0D1117);
  min-height: 100vh;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color, #2B3139);
  border-top-color: var(--color-brand, #C8AA6E);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-state p { color: var(--text-tertiary, #8B949E); }

/* 项目卡片 */
.project-card {
  background: var(--bg-elevated, #1E262F);
  border: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.project-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(14, 203, 129, 0.15);
  border-radius: 8px;
  color: var(--color-success, #0ECB81);
  font-size: 12px;
  font-weight: 600;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--color-success, #0ECB81);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.project-main {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

.project-logo {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), #A08A5B);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.project-logo img { width: 100%; height: 100%; object-fit: cover; }

.project-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #E6EDF3);
  margin: 0 0 4px;
}

.project-symbol {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-brand, #C8AA6E);
}

.project-desc {
  font-size: 14px;
  color: var(--text-tertiary, #8B949E);
  line-height: 1.5;
  margin-bottom: 20px;
}

/* 倒计时 */
.countdown-box {
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.15), rgba(200, 170, 110, 0.05));
  border: 1px solid rgba(200, 170, 110, 0.3);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: center;
}

.countdown-label {
  font-size: 12px;
  color: var(--text-tertiary, #8B949E);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.countdown-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.cd-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
}

.cd-num {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-brand, #C8AA6E);
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  line-height: 1;
}

.cd-unit {
  font-size: 10px;
  color: var(--text-tertiary, #8B949E);
  margin-top: 4px;
}

.cd-sep {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-brand, #C8AA6E);
  opacity: 0.6;
}

/* 数据网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.stat-item {
  background: var(--bg-secondary, #161B22);
  border-radius: 12px;
  padding: 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 72px;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: var(--text-tertiary, #8B949E);
  margin-bottom: 6px;
  text-transform: uppercase;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary, #E6EDF3);
}

.stat-value.gold { color: var(--color-brand, #C8AA6E); }
.stat-value.green { color: var(--color-success, #0ECB81); }

/* 进度条 */
.progress-box { margin-bottom: 24px; }

.progress-head {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-tertiary, #8B949E);
  margin-bottom: 8px;
}

.progress-pct { color: var(--color-brand, #C8AA6E); font-weight: 600; }

.progress-track {
  height: 8px;
  background: var(--bg-secondary, #161B22);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-brand, #C8AA6E), var(--color-brand-light, #E8D5A3));
  border-radius: 4px;
  transition: width 0.3s;
}

/* 购买表单 */
.buy-form {
  border-top: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
  padding-top: 20px;
}

.form-row {
  margin-bottom: 16px;
}

.form-row label {
  display: block;
  font-size: 13px;
  color: var(--text-tertiary, #8B949E);
  margin-bottom: 8px;
}

.pay-method {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: var(--bg-secondary, #161B22);
  border-radius: 12px;
}

.method-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
}

.method-balance {
  font-size: 13px;
  color: var(--text-tertiary, #8B949E);
}

.input-box {
  display: flex;
  align-items: center;
  background: var(--bg-secondary, #161B22);
  border: 1px solid var(--border-color, #2B3139);
  border-radius: 12px;
  padding: 0 14px;
  transition: border-color 0.2s;
}

.input-box:focus-within {
  border-color: var(--color-brand, #C8AA6E);
}

.input-box input {
  flex: 1;
  height: 50px;
  background: none;
  border: none;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
  outline: none;
}

.input-box input::placeholder {
  color: var(--text-tertiary, #8B949E);
  font-weight: 400;
}

.max-btn {
  padding: 6px 12px;
  background: var(--bg-hover, rgba(200,170,110,0.1));
  border: none;
  border-radius: 6px;
  color: var(--color-brand, #C8AA6E);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.input-hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-tertiary, #8B949E);
}

.cost-summary {
  background: var(--bg-secondary, #161B22);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 20px;
}

.cost-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: var(--text-tertiary, #8B949E);
  border-bottom: 1px solid var(--border-subtle, rgba(255,255,255,0.04));
}

.cost-row:last-child { border-bottom: none; }

.cost-row.total {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
  padding-top: 12px;
}

.gold { color: var(--color-brand, #C8AA6E); }

.buy-btn {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), var(--color-brand-dark, #A08A5B));
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  color: var(--bg-page, #0D1117);
  cursor: pointer;
  transition: all 0.2s;
}

.buy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.buy-btn:not(:disabled):active {
  transform: scale(0.98);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state svg {
  width: 60px;
  height: 60px;
  color: var(--text-tertiary, #8B949E);
  margin-bottom: 16px;
}

.empty-state p {
  color: var(--text-tertiary, #8B949E);
}

/* 认购记录 */
.records-section {
  background: var(--bg-elevated, #1E262F);
  border: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 100px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
  margin: 0;
}

.record-count {
  font-size: 13px;
  color: var(--text-tertiary, #8B949E);
}

.empty-records {
  padding: 40px 0;
  text-align: center;
}

.empty-records p {
  color: var(--text-tertiary, #8B949E);
  font-size: 14px;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: var(--bg-secondary, #161B22);
  border-radius: 12px;
}

.record-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.record-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), #A08A5B);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--bg-page, #0D1117);
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-amount {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
}

.record-time {
  font-size: 12px;
  color: var(--text-tertiary, #8B949E);
}

.record-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.record-cost {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-down, #F6465D);
}

.record-status {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
}

.record-status.pending {
  background: rgba(200, 170, 110, 0.15);
  color: var(--color-brand, #C8AA6E);
}

.record-status.success {
  background: rgba(14, 203, 129, 0.15);
  color: var(--color-success, #0ECB81);
}

.record-status.failed {
  background: rgba(246, 70, 93, 0.15);
  color: var(--color-down, #F6465D);
}
</style>
