<template>
  <PageLayout :title="$t('gold.title')">
    <div class="gold-page">
      <!-- 金价卡片 -->
      <div class="price-card">
        <div class="price-main">
          <div class="price-left">
            <div class="gold-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="url(#goldGrad)"/>
                <path d="M12 6v12M8 10l4-4 4 4M8 14l4 4 4-4" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="24" y2="24">
                    <stop stop-color="#F5D063"/>
                    <stop offset="1" stop-color="#C8AA6E"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="price-info">
              <span class="price-label">XAU/USD</span>
              <span class="current-price">${{ goldPrice }}</span>
            </div>
          </div>
          <div class="price-right">
            <div class="price-change" :class="priceChange >= 0 ? 'up' : 'down'">
              <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                <path v-if="priceChange >= 0" d="M12 4l8 8h-6v8h-4v-8H4l8-8z"/>
                <path v-else d="M12 20l-8-8h6V4h4v8h6l-8 8z"/>
              </svg>
              {{ priceChange >= 0 ? '+' : '' }}{{ priceChange }}%
            </div>
            <span class="update-time">{{ $t('gold.realtime') }}</span>
          </div>
        </div>
        
        <!-- 迷你走势图 -->
        <div class="mini-chart">
          <svg viewBox="0 0 200 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#C8AA6E" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#C8AA6E" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path :d="chartPath" fill="url(#chartGrad)" />
            <path :d="chartLine" fill="none" stroke="#C8AA6E" stroke-width="1.5"/>
          </svg>
        </div>
        
        <!-- 24H高低 -->
        <div class="price-stats">
          <div class="stat-item">
            <span class="stat-label">24H {{ $t('gold.high') }}</span>
            <span class="stat-value up">${{ highPrice }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">24H {{ $t('gold.low') }}</span>
            <span class="stat-value down">${{ lowPrice }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">24H {{ $t('gold.volume') }}</span>
            <span class="stat-value">{{ volume }}kg</span>
          </div>
        </div>
      </div>

      <!-- 我的账户 -->
      <div class="account-card" v-if="isLoggedIn">
        <div class="account-header">
          <span class="account-title">{{ $t('gold.myAccount') }}</span>
          <button class="detail-btn" @click="showDetail = true">
            {{ $t('common.detail') }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        <div class="account-stats">
          <div class="acc-item main">
            <span class="acc-label">{{ $t('gold.holding') }}</span>
            <span class="acc-value">{{ goldBalance }}<small>g</small></span>
            <span class="acc-sub">≈ ${{ holdingValue }}</span>
          </div>
          <div class="acc-divider"></div>
          <div class="acc-item">
            <span class="acc-label">{{ $t('gold.profit') }}</span>
            <span class="acc-value" :class="profit >= 0 ? 'up' : 'down'">
              {{ profit >= 0 ? '+' : '' }}${{ Math.abs(profit).toFixed(2) }}
            </span>
            <span class="acc-sub" :class="profitRate >= 0 ? 'up' : 'down'">
              {{ profitRate >= 0 ? '+' : '' }}{{ profitRate }}%
            </span>
          </div>
        </div>
      </div>

      <!-- 交易表单 -->
      <div class="trade-form-card">
        <div class="trade-tabs">
          <!-- 买入功能暂未开放 -->
          <button class="trade-tab exchange active">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M7.5 21.5l4-4m0 0l-4-4m4 4H3m13.5-10l-4 4m0 0l4 4m-4-4H21"/>
            </svg>
            {{ $t('gold.exchange') || '兑换' }}
          </button>
        </div>

        <div class="form-section">
          <div class="form-header">
            <span class="form-label">{{ $t('gold.amount') }} (g)</span>
            <span class="available">{{ $t('common.available') }}: {{ goldBalance }}g</span>
          </div>
          <div class="input-wrap">
            <input type="number" class="form-input" :placeholder="$t('gold.enterAmount')" v-model="tradeAmount">
            <button class="max-btn" @click="setMax">MAX</button>
          </div>
          <div class="amount-presets">
            <button v-for="p in presets" :key="p.value" class="preset-btn" :class="{ active: tradeAmount == p.value }" @click="tradeAmount = p.value">
              {{ p.label }}
            </button>
          </div>
        </div>

        <div class="trade-summary">
          <div class="summary-row">
            <span>{{ $t('gold.currentPrice') }}</span>
            <span class="gold-text">${{ goldPrice }}/g</span>
          </div>
          <div class="summary-row">
            <span>{{ $t('gold.tradeAmount') }}</span>
            <span>${{ totalAmount }}</span>
          </div>
          <div class="summary-row">
            <span>{{ $t('gold.fee') }} (0.1%)</span>
            <span>-${{ fee }}</span>
          </div>
          <div class="summary-row total">
            <span>{{ $t('gold.totalReceive') }}</span>
            <span class="total-value">${{ finalAmount }}</span>
          </div>
        </div>

        <button class="submit-btn exchange" :disabled="!canSubmit || submitting" @click="handleExchange">
          <span v-if="submitting">{{ $t('common.submitting') || '提交中...' }}</span>
          <span v-else-if="!isLoggedIn">{{ $t('user.pleaseLogin') }}</span>
          <span v-else>{{ $t('gold.confirmExchange') || '确认兑换' }}</span>
        </button>
      </div>

      <!-- 交易记录 -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">{{ $t('gold.history') }}</h3>
          <button class="more-btn" @click="$router.push('/gold/history')">{{ $t('common.viewAll') }}</button>
        </div>
        <div class="history-list" v-if="history.length > 0">
          <div class="history-item" v-for="item in history" :key="item.id">
            <div class="history-icon" :class="item.type">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path v-if="item.type === 'buy'" d="M12 4l8 8h-6v8h-4v-8H4l8-8z"/>
                <path v-else d="M12 20l-8-8h6V4h4v8h6l-8 8z"/>
              </svg>
            </div>
            <div class="history-content">
              <div class="history-title">{{ item.type === 'buy' ? $t('gold.buyGold') : $t('gold.sellGold') }}</div>
              <div class="history-detail">{{ item.amount }}g @ ${{ item.price }}/g</div>
            </div>
            <div class="history-right">
              <span class="history-amount" :class="item.type">{{ item.type === 'buy' ? '-' : '+' }}${{ (item.amount * item.price).toFixed(2) }}</span>
              <span class="history-time">{{ item.time }}</span>
            </div>
          </div>
        </div>
        <div class="empty-state" v-else>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18M9 21V9"/>
          </svg>
          <span>{{ $t('gold.noHistory') }}</span>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import PageLayout from '../components/layout/PageLayout.vue'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { api } from '../utils/api'
import { alert, showSuccess, showError } from '../utils/alert'
import { withTradePassword, getTradePasswordStatus } from '../utils/tradePassword'

const { t } = useI18n()
const router = useRouter()

const goldPrice = ref('62.83')
const priceChange = ref(0.53)
const highPrice = ref('63.25')
const lowPrice = ref('62.10')
const volume = ref('1,256')
const tradeType = ref('buy')
const tradeAmount = ref('')
const goldBalance = ref('156.80')
const usdtBalance = ref('5,280.00')
const profit = ref(326.40)
const profitRate = ref(3.43)
const showDetail = ref(false)
const submitting = ref(false)

const isLoggedIn = computed(() => !!localStorage.getItem('token'))

const holdingValue = computed(() => {
  return (parseFloat(goldBalance.value) * parseFloat(goldPrice.value)).toFixed(2)
})

const presets = [
  { label: '1g', value: 1 },
  { label: '10g', value: 10 },
  { label: '100g', value: 100 },
  { label: '1kg', value: 1000 }
]

const totalAmount = computed(() => {
  if (!tradeAmount.value) return '0.00'
  return (parseFloat(tradeAmount.value) * parseFloat(goldPrice.value)).toFixed(2)
})

const fee = computed(() => {
  if (!tradeAmount.value) return '0.00'
  return (parseFloat(totalAmount.value) * 0.001).toFixed(2)
})

const finalAmount = computed(() => {
  if (!tradeAmount.value) return '0.00'
  const total = parseFloat(totalAmount.value)
  const feeVal = parseFloat(fee.value)
  return tradeType.value === 'buy' 
    ? (total + feeVal).toFixed(2) 
    : (total - feeVal).toFixed(2)
})

const canSubmit = computed(() => {
  if (!isLoggedIn.value) return true
  if (!tradeAmount.value || parseFloat(tradeAmount.value) <= 0) return false
  if (tradeType.value === 'sell' && parseFloat(tradeAmount.value) > parseFloat(goldBalance.value)) return false
  return true
})

const setMax = () => {
  if (tradeType.value === 'sell') {
    tradeAmount.value = parseFloat(goldBalance.value)
  } else {
    const maxGold = parseFloat(usdtBalance.value.replace(',', '')) / parseFloat(goldPrice.value)
    tradeAmount.value = Math.floor(maxGold * 100) / 100
  }
}

// 迷你图表数据
const chartPoints = [20, 25, 22, 28, 32, 30, 35, 33, 38, 36, 32, 35, 30, 28, 32, 35, 38, 36, 40, 38]
const chartLine = computed(() => {
  const points = chartPoints.map((y, i) => `${i * 10.5},${40 - y}`).join(' ')
  return `M${points.replace(/ /g, ' L')}`
})
const chartPath = computed(() => {
  return `${chartLine.value} L200,40 L0,40 Z`
})

const history = ref([])

// 兑换黄金为USDT
const handleExchange = async () => {
  if (!canSubmit.value || submitting.value) return
  
  // 未登录跳转
  if (!isLoggedIn.value) {
    await alert(t('user.pleaseLogin'))
    router.push('/login')
    return
  }
  
  try {
    // 检查是否设置了交易密码
    const status = await getTradePasswordStatus()
    if (!status.hasTradePassword) {
      await alert('请先设置交易密码')
      router.push('/settings')
      return
    }
    
    // 使用交易密码验证包装器执行兑换
    const result = await withTradePassword(async (password) => {
      submitting.value = true
      
      const res = await api.gold.subscribe({
        type: 'sell', // 兑换即卖出黄金换USDT
        amount: parseFloat(tradeAmount.value),
        tradePassword: password
      })
      
      if (res.success) {
        showSuccess(t('gold.exchangeSuccess') || '兑换成功')
        tradeAmount.value = ''
        loadData()
        return true
      } else {
        throw new Error(res.message || '兑换失败')
      }
    })
  } catch (e) {
    showError(e.message || '兑换失败')
  } finally {
    submitting.value = false
  }
}

// 提交买卖（保留兼容）
const handleSubmit = async () => {
  if (!canSubmit.value || submitting.value) return
  
  // 未登录跳转
  if (!isLoggedIn.value) {
    await alert(t('user.pleaseLogin'))
    router.push('/login')
    return
  }
  
  try {
    // 检查是否设置了交易密码
    const status = await getTradePasswordStatus()
    if (!status.hasTradePassword) {
      await alert('请先设置交易密码')
      router.push('/settings')
      return
    }
    
    // 使用交易密码验证包装器执行买卖
    const result = await withTradePassword(async (password) => {
      submitting.value = true
      
      const res = await api.gold.subscribe({
        type: tradeType.value,
        amount: parseFloat(tradeAmount.value),
        tradePassword: password
      })
      
      if (res.success) {
        showSuccess(tradeType.value === 'buy' ? t('gold.buySuccess') || '买入成功' : t('gold.sellSuccess') || '卖出成功')
        tradeAmount.value = ''
        // 刷新数据
        loadData()
        return true
      } else {
        throw new Error(res.message || (tradeType.value === 'buy' ? '买入失败' : '卖出失败'))
      }
    }, {
      title: tradeType.value === 'buy' ? t('gold.confirmBuy') || '确认买入' : t('gold.confirmSell') || '确认卖出',
      tip: `${tradeType.value === 'buy' ? '买入' : '卖出'} ${tradeAmount.value}g 黄金，金额 $${finalAmount.value}`
    })
    
    if (result === null) {
      return
    }
  } catch (error) {
    if (error.message === '用户取消') return
    console.error('交易失败:', error)
    showError(error.message || '交易失败')
  } finally {
    submitting.value = false
  }
}

// 加载数据
const loadData = async () => {
  try {
    const res = await api.gold.getDetail()
    if (res.success && res.data) {
      goldPrice.value = res.data.price || goldPrice.value
      priceChange.value = res.data.change || priceChange.value
      highPrice.value = res.data.high || highPrice.value
      lowPrice.value = res.data.low || lowPrice.value
    }
    
    // 加载用户账户数据
    if (isLoggedIn.value) {
      const accountRes = await api.gold.getAccount()
      if (accountRes.success && accountRes.data) {
        goldBalance.value = accountRes.data.goldBalance || '0'
        profit.value = accountRes.data.profit || 0
        profitRate.value = accountRes.data.profitRate || 0
      }
      
      const balanceRes = await api.account.balance()
      if (balanceRes.success && balanceRes.data) {
        const assets = balanceRes.data.assets || balanceRes.data.list || []
        const usdt = assets.find(a => (a.asset || a.currency || a.coin || a.symbol) === 'USDT')
        if (usdt) {
          const balance = parseFloat(usdt.available || usdt.balance || usdt.free || 0)
          const locked = parseFloat(usdt.locked || usdt.frozen || 0)
          usdtBalance.value = (balance - locked).toFixed(2)
        } else {
          usdtBalance.value = '0'
        }
      }
      
      // 加载交易记录
      try {
        const historyRes = await api.gold.getSettlements({ page: 1, pageSize: 5 })
        if (historyRes.success && historyRes.data?.list) {
          history.value = historyRes.data.list.map(item => ({
            id: item.id,
            type: item.type || (item.direction === 1 ? 'buy' : 'sell'),
            amount: item.amount,
            price: item.price,
            time: item.createdAt || item.time
          }))
        }
      } catch (e) {
        console.error('加载交易记录失败:', e)
      }
    }
  } catch (e) {
    console.error('加载数据失败:', e)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* ================================================
   黄金交易页面 - 优化版
   ================================================ */

.gold-page {
  min-height: calc(100vh - 56px - env(safe-area-inset-top, 0px));
  background: transparent;
  padding: 16px;
  padding-bottom: 120px;
}

/* ==================== 价格卡片 ==================== */
.price-card {
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.12) 0%, rgba(200, 170, 110, 0.04) 100%);
  border: 1px solid rgba(200, 170, 110, 0.25);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  overflow: hidden;
}

.price-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.price-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.gold-icon {
  width: 36px;
  height: 36px;
  filter: drop-shadow(0 2px 8px rgba(200, 170, 110, 0.3));
}

.gold-icon svg { width: 100%; height: 100%; }

.price-info { display: flex; flex-direction: column; gap: 4px; }

.price-label {
  font-size: 12px;
  color: var(--text-tertiary, #848E9C);
  font-weight: 600;
}

.current-price {
  font-family: 'DIN Alternate', -apple-system, monospace;
  font-size: 30px;
  font-weight: 800;
  background: linear-gradient(135deg, #F5D063 0%, var(--color-brand, #C8AA6E) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.price-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.price-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
}

.price-change.up {
  background: rgba(14, 203, 129, 0.15);
  color: var(--color-up, #0ECB81);
}

.price-change.down {
  background: rgba(246, 70, 93, 0.15);
  color: var(--color-down, #F6465D);
}

.update-time {
  font-size: 10px;
  color: var(--text-quaternary, #5E6673);
}

/* 迷你走势图 */
.mini-chart {
  height: 40px;
  margin: 0 -20px;
  opacity: 0.8;
}

.mini-chart svg { width: 100%; height: 100%; }

/* 24H统计 */
.price-stats {
  display: flex;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid rgba(200, 170, 110, 0.15);
  margin-top: 12px;
}

.stat-item { text-align: center; }

.stat-label {
  display: block;
  font-size: 10px;
  color: var(--text-quaternary, #5E6673);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary, #EAECEF);
}

.stat-value.up { color: var(--color-up, #0ECB81); }
.stat-value.down { color: var(--color-down, #F6465D); }

/* ==================== 我的账户 ==================== */
.account-card {
  background: var(--bg-elevated, #181A20);
  border: 1px solid var(--border-primary, #2B3139);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.account-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.detail-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-brand, #C8AA6E);
  background: none;
  border: none;
}

.detail-btn svg { width: 14px; height: 14px; }

.account-stats {
  display: flex;
  align-items: center;
}

.acc-item {
  flex: 1;
  padding: 12px;
  background: var(--bg-base, #0B0E11);
  border-radius: 12px;
}

.acc-item.main {
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.1) 0%, rgba(200, 170, 110, 0.05) 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
}

.acc-divider {
  width: 12px;
  flex-shrink: 0;
}

.acc-label {
  display: block;
  font-size: 11px;
  color: var(--text-tertiary, #848E9C);
  margin-bottom: 6px;
}

.acc-value {
  display: block;
  font-family: 'DIN Alternate', monospace;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #EAECEF);
}

.acc-value small {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary, #848E9C);
}

.acc-value.up { color: var(--color-up, #0ECB81); }
.acc-value.down { color: var(--color-down, #F6465D); }

.acc-sub {
  display: block;
  font-size: 11px;
  color: var(--text-tertiary, #848E9C);
  margin-top: 4px;
}

.acc-sub.up { color: var(--color-up, #0ECB81); }
.acc-sub.down { color: var(--color-down, #F6465D); }

/* ==================== 交易表单 ==================== */
.trade-form-card {
  background: var(--bg-elevated, #181A20);
  border: 1px solid var(--border-primary, #2B3139);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
}

.trade-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.trade-tab {
  flex: 1;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--bg-base, #0B0E11);
  border: 1px solid var(--border-primary, #2B3139);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-tertiary, #848E9C);
  transition: all 0.25s;
}

.trade-tab.buy.active {
  background: linear-gradient(135deg, var(--color-up, #0ECB81) 0%, #0AA868 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 16px rgba(14, 203, 129, 0.35);
}

.trade-tab.sell.active {
  background: linear-gradient(135deg, var(--color-down, #F6465D) 0%, #D73A4D 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 16px rgba(246, 70, 93, 0.35);
}

.form-section { margin-bottom: 20px; }

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.form-label {
  font-size: 13px;
  color: var(--text-tertiary, #848E9C);
  font-weight: 600;
}

.available {
  font-size: 12px;
  color: var(--text-quaternary, #5E6673);
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.form-input {
  flex: 1;
  height: 52px;
  background: var(--bg-base, #0B0E11);
  border: 1px solid var(--border-primary, #2B3139);
  border-radius: 12px;
  padding: 0 16px;
  color: var(--text-primary, #EAECEF);
  font-size: 18px;
  font-weight: 600;
  transition: all 0.2s;
}

.form-input::placeholder { color: var(--text-quaternary, #5E6673); }

.form-input:focus {
  border-color: var(--color-brand, #C8AA6E);
  outline: none;
  box-shadow: 0 0 0 3px rgba(200, 170, 110, 0.15);
}

.max-btn {
  height: 52px;
  padding: 0 20px;
  background: rgba(200, 170, 110, 0.15);
  border: 1px solid rgba(200, 170, 110, 0.3);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-brand, #C8AA6E);
}

.max-btn:active {
  background: rgba(200, 170, 110, 0.25);
}

.amount-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.preset-btn {
  height: 40px;
  background: var(--bg-base, #0B0E11);
  border: 1px solid var(--border-primary, #2B3139);
  border-radius: 8px;
  color: var(--text-secondary, #C9D1D9);
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.preset-btn.active, .preset-btn:active {
  background: rgba(200, 170, 110, 0.15);
  border-color: var(--color-brand, #C8AA6E);
  color: var(--color-brand, #C8AA6E);
}

/* 交易摘要 */
.trade-summary {
  padding: 14px;
  background: var(--bg-base, #0B0E11);
  border-radius: 12px;
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 8px 0;
}

.summary-row:not(:last-child) {
  border-bottom: 1px solid var(--border-subtle, rgba(255,255,255,0.04));
}

.summary-row span:first-child { color: var(--text-tertiary, #848E9C); }
.summary-row span:last-child { color: var(--text-primary, #EAECEF); font-weight: 600; }

.summary-row.total {
  padding-top: 12px;
  margin-top: 4px;
  border-top: 1px dashed rgba(200, 170, 110, 0.3);
}

.gold-text {
  background: linear-gradient(135deg, #F5D063 0%, var(--color-brand, #C8AA6E) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.total-value {
  font-family: 'DIN Alternate', monospace !important;
  font-size: 18px !important;
  font-weight: 700 !important;
  color: var(--color-brand, #C8AA6E) !important;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 54px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  transition: all 0.25s;
}

.submit-btn.buy {
  background: linear-gradient(135deg, var(--color-up, #0ECB81) 0%, #0AA868 100%);
  box-shadow: 0 4px 20px rgba(14, 203, 129, 0.4);
}

.submit-btn.sell {
  background: linear-gradient(135deg, var(--color-down, #F6465D) 0%, #D73A4D 100%);
  box-shadow: 0 4px 20px rgba(246, 70, 93, 0.4);
}

.submit-btn:active { transform: scale(0.98); }

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ==================== 区块标题 ==================== */
.section { margin-bottom: 20px; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #EAECEF);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.section-title::before {
  content: '';
  width: 3px;
  height: 16px;
  background: linear-gradient(180deg, var(--color-brand, #C8AA6E) 0%, #A08A5B 100%);
  border-radius: 2px;
}

.more-btn {
  font-size: 12px;
  color: var(--text-tertiary, #848E9C);
  background: none;
  border: none;
}

/* ==================== 历史记录 ==================== */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-elevated, #181A20);
  border: 1px solid var(--border-primary, #2B3139);
  border-radius: 14px;
  padding: 14px;
  transition: all 0.2s;
}

.history-item:active {
  background: var(--bg-card, #2B3139);
}

.history-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-icon svg { width: 18px; height: 18px; }

.history-icon.buy {
  background: rgba(14, 203, 129, 0.15);
  color: var(--color-up, #0ECB81);
}

.history-icon.sell {
  background: rgba(246, 70, 93, 0.15);
  color: var(--color-down, #F6465D);
}

.history-content { flex: 1; }

.history-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
  margin-bottom: 4px;
}

.history-detail {
  font-size: 12px;
  color: var(--text-quaternary, #5E6673);
}

.history-right { text-align: right; }

.history-amount {
  display: block;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
}

.history-amount.buy { color: var(--color-down, #F6465D); }
.history-amount.sell { color: var(--color-up, #0ECB81); }

.history-time {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background: var(--bg-elevated, #181A20);
  border-radius: 14px;
  border: 1px solid var(--border-primary, #2B3139);
}

.empty-state svg {
  width: 48px;
  height: 48px;
  color: var(--text-quaternary, #5E6673);
  margin-bottom: 12px;
}

.empty-state span {
  font-size: 13px;
  color: var(--text-tertiary, #848E9C);
}
</style>
