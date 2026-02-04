<template>
  <div class="ecosystem-page">
    <!-- 顶部装饰背景 -->
    <div class="page-bg"></div>

    <!-- 顶部导航栏 - 与Mine.vue一致 -->
    <header class="page-header">
      <div class="header-brand">
        <img src="/company-logo.png" alt="AGX" class="brand-logo">
        <span class="brand-name">
          <span v-for="(char, i) in brandText" :key="i" class="wave-char" :style="{ animationDelay: `${i * 0.08}s` }">{{ char === ' ' ? '\u00A0' : char }}</span>
        </span>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="page-content px-page">

      <!-- AGX 价格卡片 -->
      <div class="hero-card">
        <div class="hero-bg"></div>
        <div class="token-header">
          <div class="token-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 3"/>
            </svg>
          </div>
          <div class="token-info">
            <h2 class="token-title">AGX/USDT</h2>
            <span class="token-subtitle">黄金锚定资产 · 100%储备</span>
          </div>
        </div>

        <div class="price-section">
          <div class="current-price">{{ agxPrice }}</div>
          <div class="price-change" :class="priceChange >= 0 ? 'up' : 'down'">
            {{ priceChange >= 0 ? '+' : '' }}{{ priceChange }}%
          </div>
        </div>

        <div class="market-stats">
          <div class="stat-item">
            <span class="stat-label">24H高</span>
            <span class="stat-value up">${{ highPrice }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">24H低</span>
            <span class="stat-value down">${{ lowPrice }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">24H额</span>
            <span class="stat-value">{{ volume }}M</span>
          </div>
        </div>

        <router-link to="/trade?pair=AGX_USDT" class="buy-btn">
          <span>立即交易</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </router-link>
      </div>

      <!-- 矿机服务 -->
      <section class="section">
        <h3 class="section-title">矿机服务</h3>
        <div class="service-grid">
          <router-link to="/earn" class="service-card earn">
            <div class="service-header">
              <div class="service-icon">
                <img src="/coin-stack.png" alt="持币生金" class="service-img">
              </div>
              <div class="service-badge">{{ totalEarned }} USDT</div>
            </div>
            <h4 class="service-name">持币生金</h4>
            <p class="service-desc">灵活存取 · 每日计息</p>
            <div class="service-users"><AnimatedNumber :value="earnedUsers" />人参与</div>
          </router-link>

          <router-link to="/pool" class="service-card mining">
            <div class="service-header">
              <div class="service-icon">
                <img src="/mining-icon.png" alt="矿池挖矿" class="service-img">
              </div>
              <div class="service-badge">{{ totalMined }} USDT</div>
            </div>
            <h4 class="service-name">矿池挖矿</h4>
            <p class="service-desc">定期锁仓 · 高额收益</p>
            <div class="service-users"><AnimatedNumber :value="minedUsers" />人参与</div>
          </router-link>
        </div>
      </section>

      <!-- 交易服务 -->
      <section class="section">
        <h3 class="section-title">交易服务</h3>
        <div class="trade-grid">
          <router-link to="/trade" class="trade-card">
            <div class="trade-icon spot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 3v18h18"/>
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
              </svg>
            </div>
            <h4>现货交易</h4>
            <p>多币种交易</p>
          </router-link>

          <router-link to="/contract" class="trade-card">
            <div class="trade-icon contract">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <h4>秒合约</h4>
            <p>30秒快速交易</p>
          </router-link>

          <router-link to="/otc" class="trade-card">
            <div class="trade-icon otc">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <h4>{{ $t('otc.trading') }}</h4>
            <p>{{ $t('otc.fiatDepositWithdraw') }}</p>
          </router-link>

          <router-link to="/gold" class="trade-card">
            <div class="trade-icon gold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                <path d="M12 18V6"/>
              </svg>
            </div>
            <h4>黄金交易</h4>
            <p>100%金锚定</p>
          </router-link>
        </div>
      </section>

      <!-- 生态模块 -->
      <section class="section">
        <h3 class="section-title">生态模块</h3>
        <div class="eco-grid">
          <router-link to="/pool" class="eco-card">
            <div class="eco-icon pool">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <h4>流动性矿池</h4>
            <p>提供流动性获得奖励</p>
          </router-link>

          <router-link to="/ieo" class="eco-card">
            <div class="eco-icon ieo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
              </svg>
            </div>
            <h4>AGX申购</h4>
            <p>优质项目首发</p>
          </router-link>

          <router-link to="/airdrop" class="eco-card">
            <div class="eco-icon airdrop">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
                <line x1="16" y1="8" x2="2" y2="22"/>
                <line x1="17.5" y1="15" x2="9" y2="15"/>
              </svg>
            </div>
            <h4>空投奖励</h4>
            <p>代币空投活动</p>
          </router-link>

          <div class="eco-card coming-soon">
            <div class="eco-icon nft">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
            </div>
            <h4>NFT市场</h4>
            <p class="coming-tag">即将上线</p>
          </div>
        </div>
      </section>

      <!-- 邀请返佣 -->
      <section class="section">
        <router-link to="/invite" class="invite-card">
          <div class="invite-left">
            <div class="invite-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </div>
            <div class="invite-info">
              <h3>邀请好友</h3>
              <p>最高30%返佣奖励</p>
            </div>
          </div>
          <svg class="invite-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
        </router-link>
      </section>

      <!-- 底部安全区 -->
      <!-- 审计报告 -->
      <div class="audit-trigger" @click="toggleAuditModal">
        <svg class="audit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
        <span>智能合约审计报告</span>
      </div>
      </div>
      <div class="safe-bottom"></div>

    <AuditModal :show="showAuditModal" @close="showAuditModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AuditModal from '../components/AuditModal.vue'
import AnimatedNumber from '../components/AnimatedNumber.vue'

defineOptions({
  name: 'EcosystemHome'
})

// 品牌文字动画
const brandText = computed(() => 'AGX 生态'.split(''))

// 数据
const agxPrice = ref('$0.065')
const priceChange = ref('+2.35')
const highPrice = ref('0.068')
const lowPrice = ref('0.062')
const volume = ref('12.6')
const totalEarned = ref('8,562')
const earnedUsers = ref('12,453')
const totalMined = ref('3,847')
const minedUsers = ref('8,231')

const showAuditModal = ref(false)

const toggleAuditModal = () => {
  showAuditModal.value = !showAuditModal.value
}

onMounted(() => {
  // 可以从后端加载实时数据
})
</script>

<style scoped>
/* ========== Design System: Fintech/Crypto Dark Mode ========== */
/* Primary: #C8AA6E (Gold) | Background: #0F172A | Text: #F8FAFC */
/* Hierarchy: Hero > Service > Trade > Eco */

/* ========== 页面容器 ========== */
.ecosystem-page {
  width: 100%;
  max-width: var(--page-max-width, 428px);
  min-height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background: #0D1117;
  position: relative;
}

/* 顶部渐变光晕 */
.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 320px;
  max-width: var(--page-max-width, 428px);
  margin: 0 auto;
  background: 
    radial-gradient(ellipse 70% 40% at 50% 0%, rgba(200, 170, 110, 0.06) 0%, transparent 100%),
    radial-gradient(ellipse 50% 30% at 80% 10%, rgba(200, 170, 110, 0.04) 0%, transparent 100%);
  pointer-events: none;
  z-index: 0;
}

/* ========== 顶部导航栏 ========== */
.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: linear-gradient(180deg, rgba(13, 17, 23, 0.95) 0%, rgba(13, 17, 23, 0.85) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: contain;
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
  color: #F0F2F5;
  letter-spacing: 0.5px;
}

.wave-char {
  display: inline-block;
  animation: waveFloat 2s ease-in-out infinite;
}

@keyframes waveFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

.page-content {
  position: relative;
  z-index: 1;
  padding: 16px 16px calc(90px + env(safe-area-inset-bottom)) 16px;
}

a:active { opacity: 0.92; }

/* ========== Hero Card (层级0 - 最突出) ========== */
.hero-card {
  position: relative;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: none;
  border-radius: 16px;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

/* 顶部银色装饰线 */
.hero-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(192, 200, 210, 0.3) 20%, #C0C8D2 50%, rgba(192, 200, 210, 0.3) 80%, transparent 100%);
  z-index: 2;
}

/* 底部金色装饰线 */
.hero-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
  z-index: 2;
}

.hero-bg {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle at center, rgba(212, 175, 55, 0.1) 0%, transparent 65%);
  pointer-events: none;
}

.token-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
}

.token-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.15) 0%, rgba(200, 170, 110, 0.05) 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 11px;
}

.token-icon svg {
  width: 20px;
  height: 20px;
  color: #C8AA6E;
}

.token-info {
  flex: 1;
}

.token-title {
  font-size: 16px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0 0 2px 0;
  letter-spacing: -0.2px;
}

.token-subtitle {
  font-size: 11px;
  color: #8B949E;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.current-price {
  font-size: 32px;
  font-weight: 700;
  color: #F8FAFC;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  letter-spacing: -1px;
}

.price-change {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 5px;
}

.price-change.up {
  background: rgba(16, 185, 129, 0.12);
  color: #10B981;
}

.price-change.down {
  background: rgba(239, 68, 68, 0.12);
  color: #EF4444;
}

.market-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
  padding: 14px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 1;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 10px;
  color: #8B949E;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.stat-value {
  font-size: 13px;
  font-weight: 600;
  color: #94A3B8;
  font-family: -apple-system, 'Inter', sans-serif;
}

.stat-value.up { color: #10B981; }
.stat-value.down { color: #EF4444; }

.buy-btn {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, #C8AA6E 0%, #B8963A 100%);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #0C1017;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 
    0 2px 8px rgba(212, 175, 55, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  text-decoration: none;
}

.buy-btn:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(212, 175, 55, 0.2);
}

.buy-btn svg {
  width: 16px;
  height: 16px;
}

/* ========== Section ========== */
.section {
  margin-bottom: 28px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #8B949E;
  margin: 0 0 14px 2px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

/* ========== Service Grid (层级1 - 重点模块) ========== */
.service-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.service-card {
  position: relative;
  display: block;
  padding: 16px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  text-decoration: none;
}

/* 顶部银色装饰线 */
.service-card::before {
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
.service-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
}

.service-card:active {
  transform: scale(0.98) translateY(1px);
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 3px rgba(0, 0, 0, 0.15);
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.service-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.15) 0%, rgba(200, 170, 110, 0.05) 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 9px;
  overflow: hidden;
}

.service-icon svg {
  width: 17px;
  height: 17px;
  color: #C8AA6E;
}

.service-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-badge {
  font-size: 10px;
  font-weight: 600;
  color: #10B981;
  background: rgba(16, 185, 129, 0.1);
  padding: 3px 6px;
  border-radius: 4px;
}

.service-name {
  font-size: 14px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0 0 4px 0;
}

.service-desc {
  font-size: 11px;
  color: #8B949E;
  margin: 0 0 10px 0;
}

.service-users {
  font-size: 10px;
  color: #6E7681;
}

/* ========== Trade Grid (层级2 - 功能模块) ========== */
.trade-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.trade-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 12px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  text-decoration: none;
}

/* 顶部银色装饰线 */
.trade-card::before {
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
.trade-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
}

.trade-card:active {
  transform: scale(0.98) translateY(1px);
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 3px rgba(0, 0, 0, 0.15);
}

.trade-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.15) 0%, rgba(200, 170, 110, 0.05) 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 10px;
  margin-bottom: 12px;
}

.trade-icon svg {
  width: 18px;
  height: 18px;
  color: #C8AA6E;
}

.trade-card h4 {
  font-size: 14px;
  font-weight: 600;
  color: #E2E8F0;
  margin: 0 0 4px 0;
}

.trade-card p {
  font-size: 11px;
  color: #6E7681;
  margin: 0;
}

/* ========== Eco Grid (层级3 - 次要模块) ========== */
.eco-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.eco-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 12px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  text-decoration: none;
}

/* 顶部银色装饰线 */
.eco-card::before {
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
.eco-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
}

.eco-card.coming-soon {
  opacity: 0.35;
  cursor: default;
}

.eco-card:active:not(.coming-soon) {
  transform: scale(0.98) translateY(1px);
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 3px rgba(0, 0, 0, 0.15);
}

.eco-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.15) 0%, rgba(200, 170, 110, 0.05) 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 10px;
  margin-bottom: 12px;
}

.eco-icon svg {
  width: 18px;
  height: 18px;
  color: #C8AA6E;
}

.eco-card h4 {
  font-size: 14px;
  font-weight: 600;
  color: #94A3B8;
  margin: 0 0 4px 0;
}

.eco-card p {
  font-size: 11px;
  color: #6E7681;
  margin: 0;
}

.coming-tag {
  color: rgba(212, 175, 55, 0.5);
}

/* ========== Invite Card (强调模块 - 金色边框) ========== */
.invite-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  text-decoration: none;
}

/* 顶部银色装饰线 */
.invite-card::before {
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
.invite-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
}

.invite-card:active {
  transform: scale(0.98) translateY(1px);
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 3px rgba(0, 0, 0, 0.15);
}

.invite-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.invite-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.15) 0%, rgba(200, 170, 110, 0.05) 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 9px;
}

.invite-icon svg {
  width: 18px;
  height: 18px;
  color: #C8AA6E;
}

.invite-info h3 {
  font-size: 15px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0 0 4px 0;
}

.invite-info p {
  font-size: 12px;
  color: rgba(212, 175, 55, 0.7);
  margin: 0;
}

.invite-arrow {
  width: 16px;
  height: 16px;
  color: #6E7681;
  flex-shrink: 0;
}

/* ========== Audit Trigger ========== */
.audit-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: rgba(16, 185, 129, 0.04);
  border: 1px solid rgba(16, 185, 129, 0.08);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.audit-trigger:active {
  background: rgba(16, 185, 129, 0.08);
}

.audit-icon {
  width: 16px;
  height: 16px;
  color: #10B981;
}

.audit-trigger span {
  font-size: 12px;
  color: #8B949E;
}

/* ========== Bottom ========== */
.safe-bottom {
  height: calc(90px + env(safe-area-inset-bottom));
}
</style>
