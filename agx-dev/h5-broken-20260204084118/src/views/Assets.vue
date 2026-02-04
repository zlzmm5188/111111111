<template>
  <PageLayout :title="$t('assets.title')" :show-back="true">
    <template #navbar-right>
      <button class="header-btn" @click="$router.push('/orders')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
        </svg>
      </button>
    </template>

    <div class="page-content">
      <!-- 总资产卡片 -->
      <div class="total-card">
        <div class="card-bg"></div>
        <div class="card-content">
          <div class="total-header">
            <span class="total-label">{{ $t('assets.totalAssets') }}</span>
            <button class="eye-btn" @click="hideAssets = !hideAssets">
              <svg v-if="hideAssets" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <div class="total-value">{{ hideAssets ? '******' : formatNum(totalValue) }}</div>
          <div class="total-sub">
            <span class="unit">≈ ¥</span>
            <span>{{ hideAssets ? '******' : formatNum(totalValue * cnyRate) }}</span>
          </div>
        </div>
      </div>

      <!-- 账户类型 -->
      <div class="account-tabs">
        <button 
          v-for="acc in accounts" 
          :key="acc.key"
          :class="['acc-tab', { active: activeAccount === acc.key }]"
          @click="switchAccount(acc.key)"
        >
          <span class="acc-name">{{ acc.label }}</span>
          <span class="acc-value">{{ hideAssets ? '****' : acc.value }}</span>
        </button>
      </div>

      <!-- 资产列表 -->
      <div class="asset-section">
        <div class="section-header">
          <span class="section-title">{{ $t('assets.holdingDetail') }}</span>
          <button class="hide-small" :class="{ active: hideSmall }" @click="hideSmall = !hideSmall">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path v-if="hideSmall" d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              <rect v-else x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
            {{ $t('assets.hideSmall') }}
          </button>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredAssets.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <p>{{ $t('assets.noAssets') || '暂无资产' }}</p>
          <router-link to="/deposit" class="deposit-link">{{ $t('assets.goDeposit') || '去充值' }}</router-link>
        </div>

        <!-- 资产列表 -->
        <div v-else class="asset-list">
          <div 
            v-for="asset in filteredAssets" 
            :key="asset.symbol" 
            class="asset-item"
            @click="goAssetDetail(asset)"
          >
            <div class="asset-left">
              <div class="asset-icon" :style="{ background: asset.color }">
                <img v-if="asset.icon" :src="asset.icon" :alt="asset.symbol" loading="lazy" @error="onIconError($event, asset)">
                <span v-else>{{ asset.symbol.charAt(0) }}</span>
              </div>
              <div class="asset-info">
                <span class="asset-symbol">{{ asset.symbol }}</span>
                <span class="asset-name">{{ asset.name }}</span>
              </div>
            </div>
            <div class="asset-right">
              <span class="asset-amount">{{ hideAssets ? '****' : formatAmount(asset.amount) }}</span>
              <span class="asset-value">≈ ${{ hideAssets ? '****' : formatNum(asset.value) }}</span>
            </div>
            <div class="asset-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageLayout from '../components/layout/PageLayout.vue'
import { api } from '../utils/api'

const router = useRouter()
const { t } = useI18n()

const hideAssets = ref(false)
const hideSmall = ref(false)
const activeAccount = ref('all')
const loading = ref(true)
const totalValue = ref(0)
const cnyRate = ref(parseFloat(import.meta.env.VITE_CNY_RATE) || 7.25)

const accounts = ref([
  { key: 'all', label: '全部', value: '0.00' },
  { key: 'spot', label: '', value: '0.00' },
  { key: 'earn', label: '', value: '0.00' },
  { key: 'contract', label: '', value: '0.00' }
])

// 初始化账户标签
const initAccountLabels = () => {
  accounts.value = [
    { key: 'all', label: t('assets.allAccount') || '全部', value: '0.00' },
    { key: 'spot', label: t('assets.spotAccount'), value: '0.00' },
    { key: 'earn', label: t('assets.earnAccount'), value: '0.00' },
    { key: 'contract', label: t('assets.contractAccount'), value: '0.00' }
  ]
}

// 币种颜色配置
const coinColors = {
  BTC: 'linear-gradient(135deg, #F7931A, #E2820A)',
  ETH: 'linear-gradient(135deg, #627EEA, #4C64C7)',
  USDT: 'linear-gradient(135deg, #0ECB81, #059669)',
  AGX: 'linear-gradient(135deg, #C8AA6E, #8B7355)',
  BNB: 'linear-gradient(135deg, #C8AA6E, #D9A400)',
  SOL: 'linear-gradient(135deg, #9945FF, #7B2CF3)',
  DOGE: 'linear-gradient(135deg, #C3A634, #A58E20)',
  XRP: 'linear-gradient(135deg, #23292F, #0D1115)'
}

// 币种图标配置
const coinIcons = {
  BTC: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  USDT: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
  AGX: '',
  BNB: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  DOGE: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
  XRP: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png'
}

// 币种名称
const getCoinName = (symbol) => {
  const key = `coins.${symbol}`
  const translated = t(key)
  return translated !== key ? translated : symbol
}

const allAssets = ref([])

// 根据账户类型过滤资产
const assets = computed(() => {
  if (activeAccount.value === 'all') {
    return allAssets.value
  }
  return allAssets.value.filter(a => a.accountType === activeAccount.value)
})

const filteredAssets = computed(() => {
  let list = assets.value
  if (hideSmall.value) {
    list = list.filter(a => parseFloat(a.value) > 10)
  }
  return list
})

// 加载资产数据
const fetchBalance = async () => {
  loading.value = true
  try {
    const res = await api.account.balance()
    if (res.success && res.data) {
      const balanceList = res.data.assets || res.data.list || res.data.balances || []
      
      // 直接使用后端返回的汇总字段
      const backendTotal = parseFloat(res.data.totalUsdValue || 0)
      const backendSpot = parseFloat(res.data.spotTotal || 0)
      const backendEarn = parseFloat(res.data.earnTotal || 0)
      const backendContract = parseFloat(res.data.contractTotal || 0)
      
      if (Array.isArray(balanceList)) {
        allAssets.value = balanceList.map(b => {
          const symbol = b.symbol || b.currency || b.coin
          return {
            symbol: symbol,
            name: getCoinName(symbol) || b.name || symbol,
            amount: b.balance || b.available || b.amount || 0,
            value: parseFloat(b.usdValue || b.value || 0),
            color: coinColors[symbol] || 'linear-gradient(135deg, #5E6673, #3a3f47)',
            icon: coinIcons[symbol] || b.icon || '',
            accountType: b.accountType || 'spot'
          }
        }).filter(a => parseFloat(a.amount) > 0 || parseFloat(a.value) > 0)
        
        // 使用后端汇总值，不再前端计算
        totalValue.value = backendTotal
        accounts.value = [
          { key: 'all', label: t('assets.allAccount') || '全部', value: formatNum(backendTotal) },
          { key: 'spot', label: t('assets.spotAccount'), value: formatNum(backendSpot) },
          { key: 'earn', label: t('assets.earnAccount'), value: formatNum(backendEarn) },
          { key: 'contract', label: t('assets.contractAccount'), value: formatNum(backendContract) }
        ]
      }
    }
    } catch (e) {
    // 静默处理认证错误，不污染控制台
    if (e?.response?.status !== 401 && e?.response?.status !== 403) {
      console.warn('加载资产失败:', e.message || e)
    }
    allAssets.value = [
      { symbol: 'USDT', name: getCoinName('USDT'), amount: 0, value: 0, color: coinColors.USDT, icon: coinIcons.USDT, accountType: 'spot' },
      { symbol: 'AGX', name: getCoinName('AGX'), amount: 0, value: 0, color: coinColors.AGX, icon: '', accountType: 'spot' }
    ]
    totalValue.value = 0
    accounts.value = [
      { key: 'all', label: t('assets.allAccount') || '全部', value: '0.00' },
      { key: 'spot', label: t('assets.spotAccount'), value: '0.00' },
      { key: 'earn', label: t('assets.earnAccount'), value: '0.00' },
      { key: 'contract', label: t('assets.contractAccount'), value: '0.00' }
    ]
  } finally {
    loading.value = false
  }
}

const switchAccount = (key) => {
  activeAccount.value = key
}

const goAssetDetail = (asset) => {
  // 可以跳转到币种详情页
  router.push(`/coin/${asset.symbol}`)
}

const onIconError = (e, asset) => {
  // 图标加载失败时隐藏
  asset.icon = ''
}

const formatNum = (num) => {
  return parseFloat(num || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatAmount = (num) => {
  const n = parseFloat(num || 0)
  if (n === 0) return '0'
  if (n < 0.0001) return n.toExponential(2)
  if (n < 1) return n.toFixed(6)
  if (n < 1000) return n.toFixed(4)
  return formatNum(n)
}

onMounted(() => {
  initAccountLabels()
  fetchBalance()
})
</script>

<style scoped>
.header-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary, #848E9C);
  background: rgba(255, 255, 255, 0.04);
  border: none;
  border-radius: 10px;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.2s;
}

.header-btn:active {
  background: rgba(255, 255, 255, 0.08);
}

.page-content {
  min-height: calc(100vh - 44px);
  background: var(--bg-base, #0B0E11);
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  will-change: transform;
  transform: translateZ(0);
}

/* 总资产卡片 - Pro Max 3D */
.total-card {
  margin: 16px;
  padding: 24px 20px;
  position: relative;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.5),
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

/* 金色装饰线 */
.total-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(200, 170, 110, 0.6) 20%, 
    rgba(200, 170, 110, 0.8) 50%, 
    rgba(200, 170, 110, 0.6) 80%, 
    transparent 100%);
  border-radius: 1px;
}

.card-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(200, 170, 110, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 80% 60%, rgba(200, 170, 110, 0.06) 0%, transparent 50%);
  pointer-events: none;
}

.card-content {
  position: relative;
  z-index: 1;
}

.total-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.total-label {
  font-size: 13px;
  color: var(--text-tertiary, #848E9C);
}

.eye-btn {
  color: var(--text-tertiary, #848E9C);
  background: none;
  border: none;
  padding: 4px;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.2s;
}

.eye-btn:active {
  color: var(--color-brand, #C8AA6E);
}

.total-value {
  font-size: 36px;
  font-weight: 500;
  color: var(--text-primary, #EAECEF);
  font-family: var(--font-mono, 'DIN Alternate', monospace);
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.total-sub {
  font-size: 14px;
  color: var(--text-quaternary, #5E6673);
  margin-bottom: 24px;
}

.total-sub .unit {
  margin-right: 2px;
}

/* 账户类型Tabs - 3D卡片风格 */
.account-tabs {
  display: flex;
  gap: 10px;
  padding: 0 16px;
  margin-bottom: 20px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.account-tabs::-webkit-scrollbar { display: none; }

.acc-tab {
  flex: 1;
  min-width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 8px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: all 0.2s;
}

.acc-tab.active {
  background: linear-gradient(145deg, #252D38 0%, #1E262F 100%);
  border-color: rgba(200, 170, 110, 0.3);
  box-shadow: 
    0 4px 16px rgba(200, 170, 110, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(200, 170, 110, 0.2);
}

.acc-name {
  font-size: 12px;
  color: var(--text-tertiary, #848E9C);
}

.acc-tab.active .acc-name {
  color: var(--color-brand, #C8AA6E);
}

.acc-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
  font-family: var(--font-mono, 'DIN Alternate', monospace);
}

/* 资产列表区块 */
.asset-section {
  padding: 0 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.hide-small {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-quaternary, #5E6673);
  background: none;
  border: none;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.2s;
}

.hide-small.active {
  color: var(--color-brand, #C8AA6E);
}

/* 加载状态 */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(200, 170, 110, 0.2);
  border-top-color: var(--color-brand, #C8AA6E);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 - 3D卡片 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 16px;
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.empty-icon {
  color: var(--text-quaternary, #5E6673);
  opacity: 0.5;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 14px;
  color: var(--text-tertiary, #848E9C);
  margin: 0 0 16px;
}

.deposit-link {
  padding: 12px 28px;
  background: linear-gradient(145deg, #C8AA6E 0%, #A08050 100%);
  border-radius: 12px;
  color: #0B0E11;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 
    0 4px 12px rgba(200, 170, 110, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
}

.deposit-link:active {
  transform: scale(0.98);
}

/* 资产列表容器 - 3D风格 */
.asset-list {
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  position: relative;
}

/* 顶部装饰线 */
.asset-list::before {
  content: '';
  display: block;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(200, 170, 110, 0.4) 20%, 
    rgba(200, 170, 110, 0.6) 50%, 
    rgba(200, 170, 110, 0.4) 80%, 
    transparent 100%);
  margin: 0 16px;
}

/* 底部银色装饰线 */
.asset-list::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(200, 210, 220, 0.6) 15%, 
    rgba(240, 245, 250, 0.95) 50%, 
    rgba(200, 210, 220, 0.6) 85%, 
    transparent 100%);
  z-index: 1;
}

/* 资产列表项 */
.asset-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.15s;
  cursor: pointer;
}

.asset-item:last-child {
  border-bottom: none;
}

.asset-item:active {
  background: rgba(255, 255, 255, 0.03);
}

.asset-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}

/* 币种图标 - 3D立体效果 */
.asset-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.2),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.asset-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.asset-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.asset-symbol {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.asset-name {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
}

.asset-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  margin-right: 8px;
}

.asset-amount {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
  font-family: var(--font-mono, 'DIN Alternate', monospace);
}

.asset-value {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
  font-family: var(--font-mono, 'DIN Alternate', monospace);
}

.asset-arrow {
  color: var(--text-quaternary, #5E6673);
  transition: transform 0.2s;
}

.asset-item:active .asset-arrow {
  transform: translateX(2px);
}

/* ==================== Light 主题 ==================== */
:root[data-theme="light"] .assets-page {
  background: #F5F7FA;
}

:root[data-theme="light"] .overview-card {
  background: linear-gradient(145deg, #FFFFFF 0%, #F8F9FA 100%);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

:root[data-theme="light"] .overview-card::before {
  background: linear-gradient(90deg, transparent 0%, rgba(200,170,110,0.2) 50%, transparent 100%);
}

:root[data-theme="light"] .tab-item {
  color: #6B7280;
  background: #F3F4F6;
}

:root[data-theme="light"] .tab-item.active {
  color: #A08A5B;
}

:root[data-theme="light"] .section-header {
  background: linear-gradient(145deg, #FFFFFF 0%, #F8F9FA 100%);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

:root[data-theme="light"] .assets-list {
  background: linear-gradient(145deg, #FFFFFF 0%, #F8F9FA 100%);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

:root[data-theme="light"] .asset-item {
  border-bottom-color: #F3F4F6;
}

:root[data-theme="light"] .asset-item:active {
  background: rgba(200,170,110,0.06);
}
</style>
