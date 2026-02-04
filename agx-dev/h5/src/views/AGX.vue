<template>
  <div class="agx-page">
    <!-- 顶部标题栏 - Mine.vue风格 -->
    <header class="page-header">
      <div class="header-brand">
        <img src="/company-logo.png" alt="AGX" class="brand-logo">
        <span class="brand-name">
          <span v-for="(char, i) in brandText" :key="i" class="wave-char" :style="{ animationDelay: `${i * 0.08}s` }">{{ char === ' ' ? '\u00A0' : char }}</span>
        </span>
      </div>
    </header>

    <div class="page-content">
      <!-- AGX 价格卡片 -->
      <div class="price-card">
        <!-- 右侧黄金装饰图 -->
        <div class="card-deco">
          <img src="/gold-s.png" alt="Gold" class="deco-img">
        </div>
        
        <div class="card-header">
          <div class="token-info">
            <div class="token-icon">
              <img src="/agx-new.png" alt="AGX">
            </div>
            <div class="token-text">
              <span class="token-pair">AGX / USDT</span>
              <span class="token-desc">黄金锚定资产</span>
            </div>
          </div>
          <div class="status-tag">认购中</div>
        </div>

        <div class="price-row">
          <span class="price-value">${{ formatPrice(agxPrice) }}</span>
          <span class="price-change" :class="priceChange >= 0 ? 'up' : 'down'">
            {{ priceChange >= 0 ? '+' : '' }}{{ priceChange.toFixed(2) }}%
          </span>
        </div>

        <div class="stats-row">
          <div class="stat">
            <span class="stat-label">24H高</span>
            <span class="stat-value up">${{ formatPrice(high24h) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">24H低</span>
            <span class="stat-value down">${{ formatPrice(low24h) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">数量</span>
            <span class="stat-value">{{ formatVolume(volume24h) }}</span>
          </div>
        </div>

        <button class="buy-btn" @click="$router.push('/ieo')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <span>立即认购</span>
        </button>
      </div>

      <!-- 美联储黄金储备入口 -->
      <div class="fed-entry" @click="$router.push('/audit')">
        <div class="fed-entry-bg"></div>
        <div class="fed-entry-overlay"></div>
        <div class="fed-entry-content">
          <div class="fed-entry-left">
            <span class="fed-entry-badge">FEDERAL RESERVE</span>
            <span class="fed-entry-title">美联储黄金储备</span>
            <span class="fed-entry-value">{{ displayFedTons }} 吨</span>
          </div>
          <div class="fed-entry-right">
            <span class="fed-entry-btn">查看报告</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- 矿机服务 -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">矿机服务</span>
        </div>

        <div class="service-card" @click="$router.push('/earn')">
          <div class="service-icon coin-stack">
            <img src="/coin-stack.png" alt="持币生金">
          </div>
          <div class="service-info">
            <span class="service-name">持币生金</span>
            <span class="service-desc">灵活存取 · 每日计息</span>
          </div>
          <div class="service-stats">
            <span class="stats-num" ref="earnNumRef">{{ displayEarnUsers }}</span>
            <span class="stats-label">人参与</span>
          </div>
          <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>

        <div class="service-card" @click="$router.push('/pool')">
          <div class="service-icon mining-icon">
            <img src="/mining-icon.png" alt="矿池挖矿">
          </div>
          <div class="service-info">
            <span class="service-name">矿池挖矿</span>
            <span class="service-desc">定期锁仓 · 高额收益</span>
          </div>
          <div class="service-stats">
            <span class="stats-num" ref="miningNumRef">{{ displayMiningUsers }}</span>
            <span class="stats-label">人参与</span>
          </div>
          <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>

      <!-- 更多服务 -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">快捷入口</span>
        </div>

        <div class="more-grid">
          <div class="more-item" @click="$router.push('/invite')">
            <div class="more-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/>
                <path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M19 8v6M16 11h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <span>邀请好友</span>
          </div>

          <div class="more-item" @click="$router.push('/help')">
            <div class="more-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                <path d="M9 9a3 3 0 015.12 2.12c0 1.11-.89 2.05-1.65 2.6-.37.27-.59.71-.59 1.18V15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="12" cy="18" r="0.5" fill="currentColor" stroke="currentColor"/>
              </svg>
            </div>
            <span>帮助中心</span>
          </div>

          <div class="more-item" @click="$router.push('/about')">
            <div class="more-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                <path d="M12 16v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="8" r="0.5" fill="currentColor" stroke="currentColor"/>
              </svg>
            </div>
            <span>关于AGX</span>
          </div>
        </div>
      </div>

      <div class="bottom-space"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '../utils/api'

// 品牌文字动画
const brandText = computed(() => 'AGX 生态'.split(''))

const agxPrice = ref(0.065)
const priceChange = ref(0)
const high24h = ref(0.068)
const low24h = ref(0.062)
const volume24h = ref(12600000)

// 目标值
// 从localStorage获取上次的数字，避免每次都从0开始增长
const getStoredNum = (key, fallback) => {
  try {
    return parseInt(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

const earnUsers = ref(getStoredNum('agx_earn_users_cache', 8562))
const miningUsers = ref(getStoredNum('agx_mining_users_cache', 3847))
const fedGoldTons = ref(8133)
const chainVerify = ref(1285721)

// 显示值（用于动画）
const displayEarnUsers = ref('0')
const displayMiningUsers = ref('0')
const displayFedTons = ref('0')
const displayChainVerify = ref('0')
const currentTime = ref('')

let timeInterval = null
let continuousInterval = null
let animationStarted = false

// 数字滚动动画
const animateNumber = (start, end, duration, callback) => {
  const startTime = performance.now()
  const diff = end - start
  
  const update = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // easeOutExpo 缓动函数
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
    const currentValue = Math.floor(start + diff * easeProgress)
    
    callback(currentValue)
    
    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }
  
  requestAnimationFrame(update)
}

// 格式化数字
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 启动所有数字动画
const startAnimations = () => {
  if (animationStarted) return
  animationStarted = true
  
  // 持币生金人数动画
  animateNumber(parseFloat(localStorage.getItem('agx_earn_users_cache')) || 0, earnUsers.value, 2000, (val) => {
    displayEarnUsers.value = formatNumber(val);
    localStorage.setItem('agx_earn_users_cache', earnUsers.value.toString());
  })
  
  // 合约挖矿人数动画
  animateNumber(parseFloat(localStorage.getItem('agx_mining_users_cache')) || 0, miningUsers.value, 2000, (val) => {
    displayMiningUsers.value = formatNumber(val);
    localStorage.setItem('agx_mining_users_cache', miningUsers.value.toString());
  })
  
  // 美联储黄金吨数动画
  animateNumber(0, fedGoldTons.value, 2500, (val) => {
    displayFedTons.value = formatNumber(val)
  })
  
  // 链上验证数动画
  animateNumber(0, chainVerify.value, 2500, (val) => {
    displayChainVerify.value = formatNumber(val)
  })
}

// 持续递增动画 - 降低频率减少性能消耗
const startContinuousIncrement = () => {
  continuousInterval = setInterval(() => {
    // 随机增加参与人数
    const earnIncrement = Math.floor(Math.random() * 3) + 1
    earnUsers.value += earnIncrement
    displayEarnUsers.value = formatNumber(earnUsers.value)
    
    // 随机增加挖矿人数
    if (Math.random() > 0.5) {
      const miningIncrement = Math.floor(Math.random() * 2) + 1
      miningUsers.value += miningIncrement
      displayMiningUsers.value = formatNumber(miningUsers.value)
    }
    
    // 随机增加链上验证数
    const verifyIncrement = Math.floor(Math.random() * 10) + 1
    chainVerify.value += verifyIncrement
    displayChainVerify.value = formatNumber(chainVerify.value)
  }, 5000) // 从3秒改为5秒
}

const formatPrice = (val) => {
  if (!val) return '0.000'
  return Number(val).toFixed(3)
}

const formatVolume = (val) => {
  if (!val) return '0'
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M'
  if (val >= 1000) return (val / 1000).toFixed(1) + 'K'
  return val.toString()
}

const updateTime = () => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`
}

const loadData = async () => {
  try {
    const res = await api.gold.getAgx()
    if (res?.data) {
      agxPrice.value = res.data.price || res.data.lastPrice || 0.065
      priceChange.value = res.data.change24h || res.data.priceChangePercent || 0
      high24h.value = res.data.high24h || 0.068
      low24h.value = res.data.low24h || 0.062
      volume24h.value = res.data.volume24h || res.data.quoteVolume || 12600000
    }
  } catch (e) {
    console.error('Failed to load AGX data:', e)
  }
}

onMounted(() => {
  loadData()
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  
  // 启动数字动画
  setTimeout(() => {
    startAnimations()
  }, 300)
  
  // 启动持续递增
  setTimeout(() => {
    startContinuousIncrement()
  }, 3000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  if (continuousInterval) {
    clearInterval(continuousInterval)
  }
})
</script>

<style scoped>
.agx-page {
  width: 100%;
  max-width: var(--page-max-width, 428px);
  min-height: 100vh;
  margin: 0 auto;
  background: linear-gradient(180deg, var(--bg-secondary, #0f1318) 0%, var(--bg-primary, #0a0c10) 100%);
}

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
  display: flex;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  overflow: hidden;
}

.wave-char {
  display: inline-block;
  background: linear-gradient(
    180deg, 
    #F5E6C4 0%,
    #C8AA6E 50%, 
    #A08A5B 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  opacity: 0;
  transform: translateX(-10px) scale(0.8);
  animation: charFlow 0.5s ease-out forwards, charFloat 3s ease-in-out infinite;
}

@keyframes charFlow {
  0% { 
    opacity: 0;
    transform: translateX(-10px) scale(0.8);
  }
  100% { 
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes charFloat {
  0%, 100% { 
    transform: translateY(0);
  }
  50% { 
    transform: translateY(-2px);
  }
}

.page-content {
  padding: 0 12px;
  padding-top: calc(68px + env(safe-area-inset-top));
}

/* 价格卡片 */
.price-card {
  position: relative;
  background: linear-gradient(145deg, rgba(30, 38, 50, 0.95), rgba(22, 27, 34, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

/* 右侧装饰图 */
.card-deco {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  width: 90px;
  height: 90px;
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}

.card-deco .deco-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.token-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.token-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid var(--color-brand, #C8AA6E);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-base-dark, #0a0c10);
}

.token-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.token-text {
  display: flex;
  flex-direction: column;
}

.token-pair {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
}

.token-desc {
  font-size: 12px;
  color: var(--text-secondary, #6E7681);
}

.status-tag {
  padding: 4px 10px;
  background: rgba(200, 170, 110, 0.15);
  border: 1px solid rgba(200, 170, 110, 0.3);
  border-radius: 6px;
  font-size: 12px;
  color: var(--color-brand, #C8AA6E);
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}

.price-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary, #E6EDF3);
}

.price-change {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.price-change.up {
  background: rgba(14, 203, 129, 0.15);
  color: var(--color-up, #0ECB81);
}

.price-change.down {
  background: rgba(246, 70, 93, 0.15);
  color: var(--color-down, #F6465D);
}

.stats-row {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary, #6E7681);
}

.stat-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #E6EDF3);
}

.stat-value.up { color: var(--color-up, #0ECB81); }
.stat-value.down { color: var(--color-down, #F6465D); }

.buy-btn {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E) 0%, var(--color-brand-dark, #A08050) 100%);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--bg-base, #0a0c10);
}

.buy-btn svg {
  width: 20px;
  height: 20px;
}

/* 区块 */
.section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
}

.section-note {
  font-size: 11px;
  color: var(--text-secondary, #6E7681);
}

/* 服务卡片 */
.service-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(145deg, rgba(30, 38, 50, 0.95), rgba(22, 27, 34, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  margin-bottom: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.service-card:active {
  background: rgba(40, 48, 60, 0.95);
}

.service-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(165deg, rgba(50, 55, 65, 0.95) 0%, rgba(28, 32, 40, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 6px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
}

.service-icon svg {
  width: 24px;
  height: 24px;
  color: var(--color-brand, #C8AA6E);
  stroke-width: 1.6;
}

.service-icon.coin-stack {
  background: transparent;
  border: none;
  box-shadow: none;
  overflow: hidden;
}

.service-icon.coin-stack img {
  width: 85%;
  height: 85%;
  object-fit: contain;
}

.service-icon.mining-icon {
  background: transparent;
  border: none;
  box-shadow: none;
  overflow: hidden;
}

.service-icon.mining-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.service-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.service-name {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
}

.service-desc {
  font-size: 12px;
  color: var(--text-secondary, #6E7681);
}

.service-stats {
  text-align: right;
}

.stats-num {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-brand, #C8AA6E);
  font-family: 'SF Mono', monospace;
  transition: all 0.3s ease;
}

.stats-label {
  font-size: 11px;
  color: var(--text-secondary, #6E7681);
}

.service-card .arrow {
  width: 20px;
  height: 20px;
  color: var(--text-quaternary, #484F58);
}

/* 交易网格 */
.trade-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 18px 14px;
  background: linear-gradient(145deg, rgba(30, 38, 50, 0.95), rgba(22, 27, 34, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.trade-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  transition: transform 0.15s ease;
}

.trade-item:active {
  transform: scale(0.95);
}

.trade-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(165deg, rgba(50, 55, 65, 0.95) 0%, rgba(28, 32, 40, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 6px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
}

.trade-icon svg {
  width: 24px;
  height: 24px;
  color: var(--color-brand, #C8AA6E);
  stroke-width: 1.6;
}

.trade-name {
  font-size: 12px;
  color: var(--text-secondary, #B8BCC5);
  font-weight: 500;
}

/* 更多服务 */
.more-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 10px;
  padding: 18px 14px;
  background: rgba(25, 30, 40, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
}

.more-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  transition: transform 0.15s ease;
}

.more-item:active {
  transform: scale(0.95);
}

.more-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(165deg, rgba(50, 55, 65, 0.95) 0%, rgba(28, 32, 40, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 6px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
}

.more-icon svg {
  width: 24px;
  height: 24px;
  color: var(--color-brand, #C8AA6E);
  stroke-width: 1.6;
}

.more-item span {
  font-size: 12px;
  color: var(--text-secondary, #B8BCC5);
  font-weight: 500;
}

/* 美联储入口 - 简洁版 */
.fed-entry {
  position: relative;
  margin: 16px 0;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  height: 90px;
}

.fed-entry:active {
  transform: scale(0.98);
  transition: transform 0.15s ease;
}

.fed-entry-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/fed-bg.png');
  background-size: cover;
  background-position: center right;
}

.fed-entry-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(10, 15, 25, 0.6) 0%, rgba(10, 15, 25, 0.15) 60%, transparent 100%);
}

.fed-entry-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.fed-entry-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fed-entry-badge {
  display: inline-block;
  padding: 2px 6px;
  background: rgba(200, 170, 110, 0.25);
  border-radius: 3px;
  font-size: 8px;
  font-weight: 700;
  color: var(--color-brand, #C8AA6E);
  letter-spacing: 0.5px;
  width: fit-content;
}

.fed-entry-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-on-brand, #fff);
}

.fed-entry-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-up, #0ECB81);
  font-family: 'SF Mono', monospace;
}

.fed-entry-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fed-entry-btn {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-brand, #C8AA6E);
}

.fed-entry-right svg {
  width: 18px;
  height: 18px;
  color: var(--color-brand, #C8AA6E);
}

.bottom-space {
  height: calc(80px + env(safe-area-inset-bottom));
}
</style>
