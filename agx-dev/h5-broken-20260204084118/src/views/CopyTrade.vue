<template>
  <div class="copy-page">
    <!-- 顶部导航 -->
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h1 class="page-title">{{ $t('copyTrade.title') }}</h1>
      <div class="header-right">
        <button class="records-btn" @click="showMyOrders = true" v-if="isLoggedIn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 全网统计 -->
    <div class="stats-card">
      <div class="stats-row">
        <div class="stat-cell">
          <span class="stat-num">{{ stats.totalProfit }}</span>
          <span class="stat-label">{{ $t('copyTrade.totalProfit') }}(USDT)</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-cell">
          <span class="stat-num">{{ stats.followers }}</span>
          <span class="stat-label">{{ $t('copyTrade.totalFollowers') }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-cell">
          <span class="stat-num highlight">{{ stats.avgWinRate }}%</span>
          <span class="stat-label">{{ $t('copyTrade.avgWinRate') }}</span>
        </div>
      </div>
    </div>

    <!-- 我的跟单 -->
    <div class="my-panel" v-if="isLoggedIn && myFollowing.length > 0">
      <div class="panel-head">
        <span class="panel-title">{{ $t('copyTrade.myFollowing') }}</span>
        <span class="panel-extra" @click="showMyOrders = true">{{ $t('copyTrade.viewAll') }} ></span>
      </div>
      <div class="following-list">
        <div class="following-item" v-for="f in myFollowing.slice(0, 2)" :key="f.id">
          <div class="f-left">
            <div class="f-avatar">{{ f.traderName.charAt(0) }}</div>
            <div class="f-info">
              <span class="f-name">{{ f.traderName }}</span>
              <span class="f-status">{{ $t('copyTrade.copyAmount') }}: {{ f.copyAmount }} USDT</span>
            </div>
          </div>
          <div class="f-right">
            <span :class="['f-profit', f.totalProfit >= 0 ? 'up' : 'down']">
              {{ f.totalProfit >= 0 ? '+' : '' }}{{ f.totalProfit }}
            </span>
            <button class="stop-btn" @click="stopCopy(f)">{{ $t('copyTrade.stopCopy') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 未登录 -->
    <div class="login-card" v-else-if="!isLoggedIn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
      <p>{{ $t('copyTrade.loginToFollow') }}</p>
      <button class="login-btn" @click="$router.push('/login')">{{ $t('user.login') }}</button>
    </div>

    <!-- 排序切换 -->
    <div class="sort-tabs">
      <button 
        v-for="tab in sortTabs" 
        :key="tab.key"
        :class="['sort-tab', { active: sortBy === tab.key }]"
        @click="sortBy = tab.key"
      >{{ tab.label }}</button>
    </div>

    <!-- 交易员列表 -->
    <div class="section">
      <div class="loading-box" v-if="loading">
        <div class="loader"></div>
        <span>{{ $t('common.loading') }}</span>
      </div>

      <div class="trader-list" v-else-if="sortedTraders.length > 0">
        <div 
          class="trader-card" 
          v-for="trader in sortedTraders" 
          :key="trader.id"
          @click="openTraderDetail(trader)"
        >
          <div class="trader-badge" v-if="trader.rank <= 3">TOP{{ trader.rank }}</div>
          <div class="trader-top">
            <div class="trader-avatar" :class="'rank-' + Math.min(trader.rank, 4)">
              {{ trader.name.charAt(0) }}
            </div>
            <div class="trader-meta">
              <div class="trader-name-row">
                <span class="trader-name">{{ trader.name }}</span>
                <span class="verified-icon" v-if="trader.verified">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                </span>
              </div>
              <div class="trader-tags">
                <span class="tag">{{ $t('copyTrade.winRate') }} {{ trader.winRate }}%</span>
                <span class="tag">{{ trader.followers }}{{ $t('copyTrade.followerUnit') }}</span>
              </div>
            </div>
            <div class="trader-roi">
              <span :class="['roi-num', trader.roi >= 0 ? 'up' : 'down']">
                {{ trader.roi >= 0 ? '+' : '' }}{{ trader.roi }}%
              </span>
              <span class="roi-label">{{ $t('copyTrade.roi30d') }}</span>
            </div>
          </div>
          <div class="trader-stats">
            <div class="ts-item">
              <span class="ts-val">{{ trader.totalTrades }}</span>
              <span class="ts-label">{{ $t('copyTrade.totalTrades') }}</span>
            </div>
            <div class="ts-item">
              <span class="ts-val green">+{{ trader.totalProfit }}</span>
              <span class="ts-label">{{ $t('copyTrade.totalProfit') }}</span>
            </div>
            <div class="ts-item">
              <span class="ts-val">{{ trader.avgHoldTime }}</span>
              <span class="ts-label">{{ $t('copyTrade.avgHoldTime') }}</span>
            </div>
          </div>
          <button class="copy-btn" @click.stop="openCopyModal(trader)">
            {{ $t('copyTrade.followNow') }}
          </button>
        </div>
      </div>

      <div class="empty-box" v-else>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
        </svg>
        <span>{{ $t('copyTrade.noTraders') }}</span>
      </div>
    </div>

    <div class="safe-bottom"></div>

    <!-- 跟单设置弹窗 -->
    <div class="modal-mask" v-if="showCopyModal" @click="showCopyModal = false">
      <div class="modal-box" @click.stop>
        <div class="modal-head">
          <h3>{{ $t('copyTrade.copySettings') }}</h3>
          <button class="close-btn" @click="showCopyModal = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body" v-if="selectedTrader">
          <div class="trader-preview">
            <div class="tp-avatar">{{ selectedTrader.name.charAt(0) }}</div>
            <div class="tp-info">
              <span class="tp-name">{{ selectedTrader.name }}</span>
              <span class="tp-roi up">{{ $t('copyTrade.roi30d') }} +{{ selectedTrader.roi }}%</span>
            </div>
          </div>
          
          <div class="form-group">
            <label>{{ $t('copyTrade.copyAmountLabel') }}</label>
            <div class="input-box">
              <input type="number" v-model="copyAmount" placeholder="100">
              <span class="input-suffix">USDT</span>
            </div>
            <div class="quick-btns">
              <button v-for="amt in [100, 500, 1000, 5000]" :key="amt" @click="copyAmount = amt">{{ amt }}</button>
            </div>
          </div>

          <div class="form-group">
            <label>{{ $t('copyTrade.copyMode') }}</label>
            <div class="mode-options">
              <button :class="['mode-btn', { active: copyMode === 'fixed' }]" @click="copyMode = 'fixed'">
                {{ $t('copyTrade.fixedAmount') }}
              </button>
              <button :class="['mode-btn', { active: copyMode === 'ratio' }]" @click="copyMode = 'ratio'">
                {{ $t('copyTrade.ratioMode') }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>{{ $t('copyTrade.stopLoss') }}</label>
            <div class="input-box">
              <input type="number" v-model="stopLoss" placeholder="20">
              <span class="input-suffix">%</span>
            </div>
            <span class="hint">{{ $t('copyTrade.stopLossHint') }}</span>
          </div>

          <div class="form-group">
            <label>{{ $t('copyTrade.takeProfit') }}</label>
            <div class="input-box">
              <input type="number" v-model="takeProfit" placeholder="50">
              <span class="input-suffix">%</span>
            </div>
            <span class="hint">{{ $t('copyTrade.takeProfitHint') }}</span>
          </div>

          <div class="risk-warn">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.5L19.5 19h-15L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
            <span>{{ $t('copyTrade.riskWarning') }}</span>
          </div>
        </div>
        <div class="modal-foot">
          <button class="confirm-btn" :disabled="!canConfirm || copyLoading" @click="confirmCopy">
            {{ copyLoading ? $t('copyTrade.processing') : $t('copyTrade.startCopy') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 我的跟单订单 -->
    <div class="fullscreen-modal" v-if="showMyOrders">
      <div class="fs-header">
        <button class="fs-back" @click="showMyOrders = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h3>{{ $t('copyTrade.myOrders') }}</h3>
        <div class="fs-placeholder"></div>
      </div>
      <div class="fs-content">
        <div class="order-tabs">
          <button :class="['ot', { active: orderTab === 'active' }]" @click="orderTab = 'active'">{{ $t('copyTrade.activeOrders') }}</button>
          <button :class="['ot', { active: orderTab === 'history' }]" @click="orderTab = 'history'">{{ $t('copyTrade.historyOrders') }}</button>
        </div>
        <div class="order-list" v-if="myOrders.length > 0">
          <div class="order-item" v-for="o in myOrders" :key="o.id">
            <div class="o-top">
              <span class="o-trader">{{ o.traderName }}</span>
              <span :class="['o-profit', o.profit >= 0 ? 'up' : 'down']">{{ o.profit >= 0 ? '+' : '' }}{{ o.profit }} USDT</span>
            </div>
            <div class="o-info">
              <span>{{ $t('copyTrade.copyAmount') }}: {{ o.amount }} USDT</span>
              <span>{{ o.createTime }}</span>
            </div>
          </div>
        </div>
        <div class="empty-records" v-else>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          </svg>
          <span>{{ $t('copyTrade.noOrders') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { alert } from '@/utils/alert'

const router = useRouter()
const { t } = useI18n()

// 数据
const loading = ref(true)
const traders = ref([])
const myFollowing = ref([])
const myOrders = ref([])
const stats = ref({ totalProfit: '--', followers: '--', avgWinRate: '--' })

// UI
const sortBy = ref('roi')
const showCopyModal = ref(false)
const showMyOrders = ref(false)
const selectedTrader = ref(null)
const copyAmount = ref(500)
const copyMode = ref('fixed')
const stopLoss = ref(20)
const takeProfit = ref(50)
const copyLoading = ref(false)
const orderTab = ref('active')

// 计算
const isLoggedIn = computed(() => !!localStorage.getItem('token'))

const sortTabs = computed(() => [
  { key: 'roi', label: t('copyTrade.sortByROI') },
  { key: 'winRate', label: t('copyTrade.sortByWinRate') },
  { key: 'followers', label: t('copyTrade.sortByFollowers') },
  { key: 'profit', label: t('copyTrade.sortByProfit') }
])

const sortedTraders = computed(() => {
  const list = [...traders.value]
  switch (sortBy.value) {
    case 'roi': return list.sort((a, b) => b.roi - a.roi)
    case 'winRate': return list.sort((a, b) => b.winRate - a.winRate)
    case 'followers': return list.sort((a, b) => b.followers - a.followers)
    case 'profit': return list.sort((a, b) => parseFloat(b.totalProfit) - parseFloat(a.totalProfit))
    default: return list
  }
})

const canConfirm = computed(() => {
  return copyAmount.value >= 100 && stopLoss.value > 0 && takeProfit.value > 0
})

// 方法
const loadTraders = async () => {
  loading.value = true
  try {
    // TODO: 调用真实API
    // const res = await api.copyTrade.getTraders()
    // if (res.success) traders.value = res.data
    traders.value = []
  } catch (err) {
    console.error('loadTraders error:', err)
  } finally {
    loading.value = false
  }
}

const loadMyFollowing = async () => {
  if (!isLoggedIn.value) return
  try {
    // TODO: 调用真实API
    // const res = await api.copyTrade.getMyFollowing()
    // if (res.success) myFollowing.value = res.data
    myFollowing.value = []
  } catch (err) {
    console.error('loadMyFollowing error:', err)
  }
}

const openTraderDetail = (trader) => {
  // 查看交易员详情
  router.push(`/copy-trade/${trader.id}`)
}

const openCopyModal = (trader) => {
  if (!isLoggedIn.value) {
    alert(t('copyTrade.loginFirst'))
    router.push('/login')
    return
  }
  selectedTrader.value = trader
  copyAmount.value = 500
  stopLoss.value = 20
  takeProfit.value = 50
  showCopyModal.value = true
}

const confirmCopy = async () => {
  if (!canConfirm.value || copyLoading.value) return
  
  copyLoading.value = true
  try {
    // TODO: 调用真实API
    // const res = await api.copyTrade.startCopy({
    //   traderId: selectedTrader.value.id,
    //   amount: copyAmount.value,
    //   stopLoss: stopLoss.value,
    //   takeProfit: takeProfit.value
    // })
    // if (res.success) { ... }
    await alert(t('copyTrade.copySuccess'))
    showCopyModal.value = false
    loadMyFollowing()
  } catch (err) {
    await alert(err.message || t('copyTrade.copyFailed'))
  } finally {
    copyLoading.value = false
  }
}

const stopCopy = async (following) => {
  try {
    await alert(t('copyTrade.stopSuccess'))
    loadMyFollowing()
  } catch (err) {
    await alert(err.message || t('copyTrade.stopFailed'))
  }
}

onMounted(() => {
  loadTraders()
  loadMyFollowing()
})
</script>

<style scoped>
/* ==================== 跟单交易页面 - 金色主题 ==================== */
.copy-page {
  min-height: 100vh;
  background: var(--bg-base, #0B0E11);
  padding-bottom: env(safe-area-inset-bottom);
}

/* 顶部导航 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: max(12px, env(safe-area-inset-top));
  background: var(--bg-base, #0B0E11);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--border-primary, #2B3139);
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-tertiary, #848E9C);
}

.back-btn:active { color: var(--color-brand, #C8AA6E); }
.back-btn svg { width: 24px; height: 24px; }

.page-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.header-right { width: 40px; display: flex; justify-content: flex-end; }

.records-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated, #181A20);
  border: 1px solid var(--border-primary, #2B3139);
  border-radius: 10px;
  color: var(--color-brand, #C8AA6E);
}

.records-btn svg { width: 18px; height: 18px; }

/* 统计卡片 */
.stats-card {
  margin: 16px;
  padding: 20px;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E) 0%, #A08A5B 100%);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(200, 170, 110, 0.3);
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-cell { flex: 1; text-align: center; }

.stat-num {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--bg-base, #0B0E11);
  margin-bottom: 4px;
}

.stat-num.highlight { font-size: 22px; }

.stat-label {
  font-size: 11px;
  color: var(--text-tertiary-light, #3D3D3D);
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: rgba(11, 14, 17, 0.15);
}

/* 我的跟单 */
.my-panel {
  margin: 0 16px 16px;
  padding: 16px;
  background: var(--bg-elevated, #181A20);
  border-radius: 14px;
  border: 1px solid var(--border-primary, #2B3139);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.panel-extra {
  font-size: 12px;
  color: var(--color-brand, #C8AA6E);
}

.following-list { display: flex; flex-direction: column; gap: 10px; }

.following-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-base, #0B0E11);
  border-radius: 10px;
}

.f-left { display: flex; align-items: center; gap: 10px; }

.f-avatar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E) 0%, #8B7355 100%);
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-on-brand, #fff);
}

.f-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.f-status {
  font-size: 11px;
  color: var(--text-tertiary, #848E9C);
}

.f-right { display: flex; align-items: center; gap: 10px; }

.f-profit {
  font-size: 14px;
  font-weight: 700;
}

.f-profit.up { color: var(--color-up, #0ECB81); }
.f-profit.down { color: var(--color-down, #F6465D); }

.stop-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--color-down, #F6465D);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-down, #F6465D);
}

/* 登录卡片 */
.login-card {
  margin: 0 16px 16px;
  padding: 32px;
  background: var(--bg-elevated, #181A20);
  border-radius: 14px;
  border: 1px solid var(--border-primary, #2B3139);
  text-align: center;
}

.login-card svg {
  width: 48px;
  height: 48px;
  color: var(--color-brand, #C8AA6E);
  margin-bottom: 16px;
}

.login-card p {
  font-size: 14px;
  color: var(--text-tertiary, #848E9C);
  margin-bottom: 16px;
}

.login-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E) 0%, #A08A5B 100%);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--bg-base, #0B0E11);
  box-shadow: 0 4px 16px rgba(200, 170, 110, 0.35);
}

/* 排序切换 */
.sort-tabs {
  display: flex;
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 16px;
  overflow-x: auto;
}

.sort-tabs::-webkit-scrollbar { display: none; }

.sort-tab {
  padding: 8px 14px;
  background: var(--bg-elevated, #181A20);
  border: 1px solid var(--border-primary, #2B3139);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-tertiary, #848E9C);
  white-space: nowrap;
  transition: all 0.2s;
}

.sort-tab.active {
  background: rgba(200, 170, 110, 0.15);
  border-color: var(--color-brand, #C8AA6E);
  color: var(--color-brand, #C8AA6E);
}

/* 交易员列表 */
.section { margin: 0 16px; }

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;
  color: var(--text-tertiary, #848E9C);
  font-size: 13px;
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-primary, #2B3139);
  border-top-color: var(--color-brand, #C8AA6E);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.trader-list { display: flex; flex-direction: column; gap: 12px; }

.trader-card {
  position: relative;
  background: var(--bg-elevated, #181A20);
  border: 1px solid var(--border-primary, #2B3139);
  border-radius: 14px;
  padding: 16px;
  transition: all 0.2s;
}

.trader-card:active { transform: scale(0.99); }

.trader-badge {
  position: absolute;
  top: 0;
  right: 16px;
  padding: 4px 10px;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E) 0%, #A08A5B 100%);
  border-radius: 0 0 8px 8px;
  font-size: 10px;
  font-weight: 700;
  color: var(--bg-base, #0B0E11);
}

.trader-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.trader-avatar {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-on-brand, #fff);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.trader-avatar.rank-1 { background: linear-gradient(135deg, var(--color-rank-gold, #FFD700) 0%, var(--color-rank-gold-dark, #FFA500) 100%); }
.trader-avatar.rank-2 { background: linear-gradient(135deg, var(--color-rank-silver, #C0C0C0) 0%, var(--color-rank-silver-dark, #A0A0A0) 100%); }
.trader-avatar.rank-3 { background: linear-gradient(135deg, var(--color-rank-bronze, #CD7F32) 0%, var(--color-rank-bronze-dark, #B8860B) 100%); }
.trader-avatar.rank-4 { background: linear-gradient(135deg, var(--color-brand, #C8AA6E) 0%, #8B7355 100%); }

.trader-meta { flex: 1; }

.trader-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.trader-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.verified-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-brand, #C8AA6E);
  border-radius: 50%;
  color: var(--bg-base, #0B0E11);
}

.verified-icon svg { width: 10px; height: 10px; }

.trader-tags { display: flex; gap: 8px; }

.tag {
  font-size: 11px;
  color: var(--text-tertiary, #848E9C);
  padding: 2px 6px;
  background: var(--bg-base, #0B0E11);
  border-radius: 4px;
}

.trader-roi { text-align: right; }

.roi-num {
  display: block;
  font-size: 20px;
  font-weight: 700;
}

.roi-num.up { color: var(--color-up, #0ECB81); }
.roi-num.down { color: var(--color-down, #F6465D); }

.roi-label {
  font-size: 11px;
  color: var(--text-tertiary, #848E9C);
}

.trader-stats {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-base, #0B0E11);
  border-radius: 10px;
  margin-bottom: 14px;
}

.ts-item { flex: 1; text-align: center; }

.ts-val {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
  margin-bottom: 2px;
}

.ts-val.green { color: var(--color-up, #0ECB81); }

.ts-label {
  font-size: 10px;
  color: var(--text-tertiary, #848E9C);
}

.copy-btn {
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E) 0%, #A08A5B 100%);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: var(--bg-base, #0B0E11);
  box-shadow: 0 4px 16px rgba(200, 170, 110, 0.3);
}

.copy-btn:active { transform: scale(0.98); }

/* 空状态 */
.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;
  background: var(--bg-elevated, #181A20);
  border-radius: 12px;
  border: 1px solid var(--border-primary, #2B3139);
}

.empty-box svg {
  width: 48px;
  height: 48px;
  color: var(--text-quaternary, #5E6673);
  margin-bottom: 12px;
}

.empty-box span {
  font-size: 13px;
  color: var(--text-tertiary, #848E9C);
}

.safe-bottom { height: 24px; }

/* 弹窗 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  background: var(--bg-elevated, #181A20);
  border-radius: 16px 16px 0 0;
  overflow-y: auto;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-primary, #2B3139);
}

.modal-head h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-base, #0B0E11);
  border: none;
  border-radius: 50%;
  color: var(--text-tertiary, #848E9C);
}

.close-btn svg { width: 18px; height: 18px; }

.modal-body { padding: 20px; }

.trader-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--bg-base, #0B0E11);
  border-radius: 12px;
  margin-bottom: 20px;
}

.tp-avatar {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E) 0%, #8B7355 100%);
  border-radius: 50%;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-on-brand, #fff);
}

.tp-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
  margin-bottom: 2px;
}

.tp-roi {
  font-size: 12px;
  font-weight: 600;
}

.tp-roi.up { color: var(--color-up, #0ECB81); }

.form-group { margin-bottom: 20px; }

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-tertiary, #848E9C);
  margin-bottom: 8px;
}

.input-box {
  display: flex;
  align-items: center;
  background: var(--bg-base, #0B0E11);
  border: 1px solid var(--border-primary, #2B3139);
  border-radius: 10px;
  padding: 0 14px;
  transition: border-color 0.2s;
}

.input-box:focus-within { border-color: var(--color-brand, #C8AA6E); }

.input-box input {
  flex: 1;
  height: 46px;
  background: transparent;
  border: none;
  color: var(--text-primary, #EAECEF);
  font-size: 15px;
  font-weight: 500;
  outline: none;
}

.input-box input::placeholder { color: var(--text-quaternary, #5E6673); }

.input-suffix {
  font-size: 13px;
  color: var(--text-tertiary, #848E9C);
}

.quick-btns {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.quick-btns button {
  flex: 1;
  padding: 8px;
  background: var(--bg-base, #0B0E11);
  border: 1px solid var(--border-primary, #2B3139);
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-tertiary, #848E9C);
  transition: all 0.2s;
}

.quick-btns button:active {
  background: rgba(200, 170, 110, 0.15);
  border-color: var(--color-brand, #C8AA6E);
  color: var(--color-brand, #C8AA6E);
}

.mode-options { display: flex; gap: 10px; }

.mode-btn {
  flex: 1;
  padding: 12px;
  background: var(--bg-base, #0B0E11);
  border: 1px solid var(--border-primary, #2B3139);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-tertiary, #848E9C);
  transition: all 0.2s;
}

.mode-btn.active {
  background: rgba(200, 170, 110, 0.15);
  border-color: var(--color-brand, #C8AA6E);
  color: var(--color-brand, #C8AA6E);
}

.hint {
  display: block;
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
  margin-top: 6px;
}

.risk-warn {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: rgba(246, 70, 93, 0.1);
  border-radius: 8px;
  font-size: 11px;
  color: var(--color-down, #F6465D);
}

.risk-warn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.modal-foot { padding: 16px 20px; }

.confirm-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E) 0%, #A08A5B 100%);
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  color: var(--bg-base, #0B0E11);
  box-shadow: 0 4px 16px rgba(200, 170, 110, 0.3);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 全屏弹窗 */
.fullscreen-modal {
  position: fixed;
  inset: 0;
  background: var(--bg-base, #0B0E11);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.fs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: max(12px, env(safe-area-inset-top));
  border-bottom: 1px solid var(--border-primary, #2B3139);
}

.fs-back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-tertiary, #848E9C);
}

.fs-back svg { width: 24px; height: 24px; }

.fs-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.fs-placeholder { width: 40px; }

.fs-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.order-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.ot {
  flex: 1;
  padding: 10px;
  background: var(--bg-elevated, #181A20);
  border: 1px solid var(--border-primary, #2B3139);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-tertiary, #848E9C);
}

.ot.active {
  background: rgba(200, 170, 110, 0.15);
  border-color: var(--color-brand, #C8AA6E);
  color: var(--color-brand, #C8AA6E);
}

.order-list { display: flex; flex-direction: column; gap: 10px; }

.order-item {
  padding: 14px;
  background: var(--bg-elevated, #181A20);
  border-radius: 10px;
  border: 1px solid var(--border-primary, #2B3139);
}

.o-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.o-trader {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.o-profit { font-size: 14px; font-weight: 700; }
.o-profit.up { color: var(--color-up, #0ECB81); }
.o-profit.down { color: var(--color-down, #F6465D); }

.o-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-tertiary, #848E9C);
}

.empty-records {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;
}

.empty-records svg {
  width: 48px;
  height: 48px;
  color: var(--text-quaternary, #5E6673);
  margin-bottom: 12px;
}

.empty-records span {
  font-size: 13px;
  color: var(--text-tertiary, #848E9C);
}

.green { color: var(--color-up, #0ECB81) !important; }
</style>
