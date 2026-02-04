<template>
  <div class="mining-page">
    <!-- 顶部标题栏 -->
    <header class="header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <span class="header-title">合约挖矿</span>
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
      <!-- 收益池总览卡片 -->
      <div class="pool-card">
        <div class="pool-header">
          <div class="pool-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div class="pool-title">
            <h2>合约收益池</h2>
            <span class="pool-badge">高收益</span>
          </div>
        </div>

        <div class="pool-stats">
          <div class="stat-item">
            <span class="stat-label">总锁仓量</span>
            <span class="stat-value">{{ formatNumber(poolData.totalLocked) }} USDT</span>
          </div>
          <div class="stat-item highlight">
            <span class="stat-label">预估年化</span>
            <span class="stat-value apy">{{ poolData.apy }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">我的份额</span>
            <span class="stat-value">{{ formatNumber(poolData.myShare) }} USDT</span>
          </div>
        </div>

        <div class="pool-divider"></div>

        <!-- 可领取收益 -->
        <div class="earnings-row">
          <div class="earnings-info">
            <span class="earnings-label">可领取收益</span>
            <span class="earnings-value">{{ formatNumber(claimableEarnings, 4) }} USDT</span>
          </div>
          <button class="claim-btn" :disabled="claimableEarnings <= 0" @click="handleClaim">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 7l-5-5-5 5"/>
            </svg>
            领取
          </button>
        </div>
      </div>

      <!-- 质押操作卡片 -->
      <div class="stake-card">
        <h3 class="card-title">创建质押</h3>
        
        <!-- 选择币种 -->
        <div class="form-group">
          <label>质押币种</label>
          <div class="coin-selector">
            <button 
              v-for="coin in ['AGX', 'USDT']" 
              :key="coin"
              :class="['coin-btn', { active: selectedCoin === coin }]"
              @click="selectedCoin = coin"
            >
              <img :src="`/crypto/${coin.toLowerCase()}.png`" :alt="coin">
              <span>{{ coin }}</span>
            </button>
          </div>
        </div>

        <!-- 输入数量 -->
        <div class="form-group">
          <label>质押数量</label>
          <div class="input-wrap">
            <input 
              type="number" 
              v-model.number="stakeAmount" 
              placeholder="输入质押数量"
            >
            <span class="unit">{{ selectedCoin }}</span>
            <button class="max-btn" @click="stakeAmount = availableBalance">MAX</button>
          </div>
          <div class="balance-hint">
            可用余额: {{ formatNumber(availableBalance, 4) }} {{ selectedCoin }}
          </div>
        </div>

        <!-- 选择期限 -->
        <div class="form-group">
          <label>锁定期限</label>
          <div class="period-selector">
            <button 
              v-for="period in periods" 
              :key="period.days"
              :class="['period-btn', { active: selectedPeriod === period.days }]"
              @click="selectedPeriod = period.days"
            >
              <span class="period-days">{{ period.days }}天</span>
              <span class="period-rate">{{ period.rate }}%</span>
            </button>
          </div>
        </div>

        <!-- 预估收益 -->
        <div class="estimate-section">
          <div class="estimate-row">
            <span class="estimate-label">预估收益</span>
            <span class="estimate-value">{{ formatNumber(estimatedEarnings, 4) }} USDT</span>
          </div>
          <div class="estimate-row">
            <span class="estimate-label">到期时间</span>
            <span class="estimate-value">{{ maturityDate }}</span>
          </div>
        </div>

        <button class="stake-btn" :disabled="!canStake" @click="handleStake">
          确认质押
        </button>
      </div>

      <!-- 我的质押记录 -->
      <div class="records-card">
        <div class="records-header">
          <h3 class="card-title">我的质押</h3>
          <div class="tab-switch">
            <button 
              :class="['tab-btn', { active: activeTab === 'active' }]"
              @click="activeTab = 'active'"
            >质押中</button>
            <button 
              :class="['tab-btn', { active: activeTab === 'ended' }]"
              @click="activeTab = 'ended'"
            >已结束</button>
          </div>
        </div>

        <div class="records-list" v-if="currentRecords.length > 0">
          <div 
            class="record-item" 
            v-for="record in currentRecords" 
            :key="record.id"
          >
            <div class="record-left">
              <img :src="`/crypto/${record.coin.toLowerCase()}.png`" :alt="record.coin" class="record-icon">
              <div class="record-info">
                <span class="record-amount">{{ formatNumber(record.amount) }} {{ record.coin }}</span>
                <span class="record-date">{{ record.startDate }} - {{ record.endDate }}</span>
              </div>
            </div>
            <div class="record-right">
              <span class="record-earnings" :class="{ ended: activeTab === 'ended' }">
                +{{ formatNumber(record.earnings, 4) }} USDT
              </span>
              <span class="record-status" :class="record.status">
                {{ record.status === 'active' ? '收益中' : '已结束' }}
              </span>
            </div>
          </div>
        </div>

        <div class="empty-state" v-else>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
          <span>暂无质押记录</span>
        </div>

        <!-- 累计统计 -->
        <div class="records-summary" v-if="activeTab === 'ended' && endedRecords.length > 0">
          <div class="summary-item">
            <span class="summary-label">累计质押</span>
            <span class="summary-value">{{ formatNumber(totalStaked) }} USDT</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">累计收益</span>
            <span class="summary-value green">+{{ formatNumber(totalEarnings, 4) }} USDT</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 帮助弹窗 -->
    <div class="modal-mask" v-if="showHelp" @click="showHelp = false">
      <div class="modal-content" @click.stop>
        <div class="modal-bar"></div>
        <h3>合约挖矿说明</h3>
        <div class="modal-body">
          <div class="rule-item">
            <span class="rule-num">1</span>
            <span class="rule-text">质押AGX或USDT参与合约收益池，按份额分享交易收益。</span>
          </div>
          <div class="rule-item">
            <span class="rule-num">2</span>
            <span class="rule-text">锁定期限越长，收益率越高。7天/30天/90天对应不同收益。</span>
          </div>
          <div class="rule-item">
            <span class="rule-num">3</span>
            <span class="rule-text">收益每日计算，锁定期满后本金和收益自动到账。</span>
          </div>
          <div class="rule-item">
            <span class="rule-num">4</span>
            <span class="rule-text">质押期间可随时领取已产生的收益。</span>
          </div>
        </div>
        <button class="modal-btn" @click="showHelp = false">我知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../utils/api'
import { alert } from '../utils/alert'

defineOptions({ name: 'ContractMining' })

const router = useRouter()

// 状态
const showHelp = ref(false)
const selectedCoin = ref('USDT')
const stakeAmount = ref('')
const selectedPeriod = ref(30)
const activeTab = ref('active')

// 模拟数据
const poolData = ref({
  totalLocked: 1256800,
  apy: 18.5,
  myShare: 5000
})

const claimableEarnings = ref(12.5678)
const availableBalance = ref(10000)

const periods = [
  { days: 7, rate: 8 },
  { days: 30, rate: 15 },
  { days: 90, rate: 25 }
]

const activeRecords = ref([
  { id: 1, coin: 'USDT', amount: 1000, startDate: '2025-01-20', endDate: '2025-02-19', earnings: 12.5, status: 'active' },
  { id: 2, coin: 'AGX', amount: 500, startDate: '2025-01-15', endDate: '2025-02-14', earnings: 8.2, status: 'active' }
])

const endedRecords = ref([
  { id: 3, coin: 'USDT', amount: 2000, startDate: '2024-12-01', endDate: '2025-01-01', earnings: 25.5, status: 'ended' }
])

// 计算属性
const currentRecords = computed(() => {
  return activeTab.value === 'active' ? activeRecords.value : endedRecords.value
})

const totalStaked = computed(() => {
  return endedRecords.value.reduce((sum, r) => sum + r.amount, 0)
})

const totalEarnings = computed(() => {
  return endedRecords.value.reduce((sum, r) => sum + r.earnings, 0)
})

const selectedRate = computed(() => {
  const period = periods.find(p => p.days === selectedPeriod.value)
  return period ? period.rate : 0
})

const estimatedEarnings = computed(() => {
  if (!stakeAmount.value || stakeAmount.value <= 0) return 0
  return (stakeAmount.value * selectedRate.value / 100 * selectedPeriod.value / 365)
})

const maturityDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + selectedPeriod.value)
  return date.toLocaleDateString('zh-CN')
})

const canStake = computed(() => {
  return stakeAmount.value > 0 && stakeAmount.value <= availableBalance.value
})

// 方法
const formatNumber = (num, decimals = 2) => {
  if (!num && num !== 0) return '0'
  return parseFloat(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

const handleClaim = async () => {
  if (claimableEarnings.value <= 0) return

  try {
    const result = await api.contractMining.claim()

    if (!result.success) {
      throw new Error(result.message || '领取失败')
    }

    await alert('领取成功!')
    claimableEarnings.value = 0

    // 重新加载数据
    loadData()
  } catch (error) {
    console.error('领取收益失败:', error)
    await alert(error.message || '领取失败，请重试')
  }
}

const handleStake = async () => {
  if (!canStake.value) return

  try {
    const result = await api.contractMining.stake({
      coin: selectedCoin.value,
      amount: stakeAmount.value,
      period: selectedPeriod.value
    })

    if (!result.success) {
      throw new Error(result.message || '质押失败')
    }

    await alert(`质押 ${stakeAmount.value} ${selectedCoin.value} 成功!`)
    stakeAmount.value = ''

    // 重新加载数据
    loadData()
  } catch (error) {
    console.error('质押失败:', error)
    await alert(error.message || '质押失败，请重试')
  }
}

// 加载数据
const loadData = async () => {
  try {
    const [poolRes, stakesRes] = await Promise.all([
      api.contractMining.getPool(),
      api.contractMining.getMyStakes()
    ])

    if (poolRes.success) {
      Object.assign(poolData.value, poolRes.data)
      claimableEarnings.value = poolRes.data.claimableEarnings || 0
    }

    if (stakesRes.success) {
      const stakes = stakesRes.data || []
      activeRecords.value = stakes.filter(s => s.status === 'active')
      endedRecords.value = stakes.filter(s => s.status === 'ended')
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.mining-page {
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
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

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

/* 通用卡片样式 */
.pool-card, .stake-card, .records-card {
  position: relative;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.pool-card::before, .stake-card::before, .records-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(192, 200, 210, 0.3) 20%, #C0C8D2 50%, rgba(192, 200, 210, 0.3) 80%, transparent 100%);
  border-radius: 16px 16px 0 0;
}

.pool-card::after, .stake-card::after, .records-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
}

/* 收益池卡片 */
.pool-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.pool-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.15) 0%, rgba(200, 170, 110, 0.05) 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 12px;
}

.pool-icon svg {
  width: 24px;
  height: 24px;
  color: #C8AA6E;
}

.pool-title h2 {
  font-size: 16px;
  font-weight: 600;
  color: #F0F2F5;
  margin: 0 0 4px;
}

.pool-badge {
  font-size: 10px;
  padding: 2px 8px;
  background: rgba(14, 203, 129, 0.15);
  color: #0ECB81;
  border-radius: 10px;
}

.pool-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: #6B7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #F0F2F5;
}

.stat-value.apy {
  font-size: 18px;
  color: #0ECB81;
}

.pool-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin-bottom: 16px;
}

.earnings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.earnings-label {
  font-size: 12px;
  color: #6B7280;
}

.earnings-value {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #C8AA6E, #E8D5A3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.claim-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08A5B 100%);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #0D1117;
}

.claim-btn:disabled {
  opacity: 0.5;
}

.claim-btn svg {
  width: 14px;
  height: 14px;
}

/* 质押卡片 */
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #F0F2F5;
  margin: 0 0 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 12px;
  color: #8B949E;
  margin-bottom: 8px;
}

.coin-selector {
  display: flex;
  gap: 10px;
}

.coin-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: #8B949E;
  transition: all 0.2s;
}

.coin-btn img {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.coin-btn.active {
  background: rgba(200, 170, 110, 0.15);
  border-color: rgba(200, 170, 110, 0.3);
  color: #C8AA6E;
}

.input-wrap {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  overflow: hidden;
}

.input-wrap input {
  flex: 1;
  height: 44px;
  padding: 0 12px;
  background: transparent;
  border: none;
  font-size: 16px;
  color: #F0F2F5;
}

.input-wrap input::placeholder {
  color: #6B7280;
}

.input-wrap .unit {
  font-size: 13px;
  color: #8B949E;
  padding-right: 8px;
}

.max-btn {
  padding: 6px 12px;
  background: rgba(200, 170, 110, 0.15);
  border: none;
  font-size: 11px;
  font-weight: 600;
  color: #C8AA6E;
  margin-right: 8px;
  border-radius: 6px;
}

.balance-hint {
  font-size: 11px;
  color: #6B7280;
  margin-top: 6px;
}

.period-selector {
  display: flex;
  gap: 10px;
}

.period-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  transition: all 0.2s;
}

.period-btn.active {
  background: rgba(200, 170, 110, 0.15);
  border-color: rgba(200, 170, 110, 0.3);
}

.period-days {
  font-size: 14px;
  font-weight: 600;
  color: #F0F2F5;
}

.period-rate {
  font-size: 12px;
  color: #0ECB81;
  margin-top: 2px;
}

.estimate-section {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
}

.estimate-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.estimate-label {
  font-size: 12px;
  color: #6B7280;
}

.estimate-value {
  font-size: 13px;
  font-weight: 600;
  color: #F0F2F5;
}

.stake-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08A5B 100%);
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  color: #0D1117;
  box-shadow: 0 4px 20px rgba(200, 170, 110, 0.4);
}

.stake-btn:disabled {
  opacity: 0.5;
}

/* 记录卡片 */
.records-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tab-switch {
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 2px;
}

.tab-btn {
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  color: #6B7280;
  transition: all 0.2s;
}

.tab-btn.active {
  background: rgba(200, 170, 110, 0.2);
  color: #C8AA6E;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.record-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.record-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.record-amount {
  font-size: 14px;
  font-weight: 600;
  color: #F0F2F5;
}

.record-date {
  font-size: 11px;
  color: #6B7280;
}

.record-right {
  text-align: right;
}

.record-earnings {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #0ECB81;
}

.record-earnings.ended {
  color: #8B949E;
}

.record-status {
  font-size: 10px;
  color: #6B7280;
}

.record-status.active {
  color: #0ECB81;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;
  color: #6B7280;
}

.empty-state svg {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.records-summary {
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  margin-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.summary-label {
  font-size: 11px;
  color: #6B7280;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: #F0F2F5;
}

.summary-value.green {
  color: #0ECB81;
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-content {
  width: 100%;
  max-width: 428px;
  max-height: 70vh;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 20px 20px 0 0;
  padding: 20px;
  overflow-y: auto;
}

.modal-bar {
  width: 36px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin: 0 auto 16px;
}

.modal-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #F0F2F5;
  text-align: center;
  margin: 0 0 16px;
}

.modal-body {
  margin-bottom: 20px;
}

.rule-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.rule-num {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200, 170, 110, 0.2);
  border-radius: 50%;
  font-size: 11px;
  font-weight: 600;
  color: #C8AA6E;
  flex-shrink: 0;
}

.rule-text {
  font-size: 13px;
  color: #8B949E;
  line-height: 1.5;
}

.modal-btn {
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08A5B 100%);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #0D1117;
}
</style>
