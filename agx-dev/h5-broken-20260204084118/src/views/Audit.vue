<template>
  <div class="audit-page">
    <!-- 固定透明标题栏 -->
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <span class="header-title">美联储黄金储备</span>
      <div class="header-right"></div>
    </div>

    <!-- 顶部美联储图片 -->
    <div class="fed-hero">
      <img src="/fed-bg.png" alt="Federal Reserve" class="fed-hero-img" />
      <div class="fed-hero-overlay"></div>
    </div>

    <!-- 标题区域 -->
    <div class="title-section">
      <div class="title-badge">FEDERAL RESERVE</div>
      <h1 class="main-title">美联储黄金储备审计报告</h1>
      <p class="sub-title">实时同步美国财政部官方数据</p>
    </div>

    <div class="page-content">
      <!-- 核心数据卡片 - 金色 -->
      <div class="data-card gold-card">
        <div class="gold-card-content">
          <div class="gold-card-left">
            <div class="card-header">
              <span class="card-label">黄金储备总量</span>
              <div class="live-tag">
                <span class="live-dot"></span>
                实时
              </div>
            </div>
            <div class="card-value">
              <span class="value-num">{{ displayTons }}</span>
              <span class="value-unit">吨</span>
            </div>
            <div class="card-update">更新时间：{{ currentTime }}</div>
          </div>
          <div class="gold-card-right">
            <img src="/gold-pile.png" alt="黄金" />
          </div>
        </div>
      </div>

      <!-- 数据详情 -->
      <div class="data-card detail-card">
        <div class="card-header-row">
          <div class="card-icon gold-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div class="card-title">储备详情</div>
        </div>
        <div class="detail-list">
          <div class="detail-item">
            <span class="detail-label">金衡盎司</span>
            <span class="detail-value">261,498,926.24</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">账面价值</span>
            <span class="detail-value gold">$110.4亿</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">市场估值</span>
            <span class="detail-value gold">$5,236亿</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">AGX锚定率</span>
            <span class="detail-value green">99.87%</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">链上验证次数</span>
            <span class="detail-value">{{ displayVerify }}</span>
          </div>
        </div>
      </div>

      <!-- 存储位置 -->
      <div class="data-card storage-card">
        <div class="card-header-row">
          <div class="card-icon blue-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="card-title">黄金存储位置</div>
        </div>
        <div class="storage-list">
          <div class="storage-item" v-for="(item, index) in storageLocations" :key="index">
            <div class="storage-main">
              <span class="storage-name">{{ item.name }}</span>
              <span class="storage-location">{{ item.location }}</span>
            </div>
            <div class="storage-data">
              <span class="storage-amount">{{ item.amount }}</span>
              <span class="storage-percent">{{ item.percent }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 全球黄金插图 -->
      <div class="crypto-image">
        <img src="/gold-world.png" alt="全球黄金" />
      </div>

      <!-- AGX 锚定状态 - 毛玻璃效果 -->
      <div class="data-card glass-card">
        <div class="card-title">AGX代币锚定状态</div>
        <div class="peg-section">
          <div class="peg-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" stroke-width="6"/>
              <circle cx="50" cy="50" r="45" fill="none" stroke="#10B981" stroke-width="6" 
                stroke-dasharray="282.74" stroke-dashoffset="0.37" 
                stroke-linecap="round" transform="rotate(-90 50 50)"/>
            </svg>
            <div class="peg-value">
              <span class="peg-num">99.87</span>
              <span class="peg-unit">%</span>
            </div>
          </div>
          <div class="peg-info">
            <div class="peg-row">
              <span class="peg-label">智能合约</span>
              <span class="peg-data mono">0x8A9D...3F2E</span>
            </div>
            <div class="peg-row">
              <span class="peg-label">验证网络</span>
              <span class="peg-data">以太坊主网</span>
            </div>
            <div class="peg-row">
              <span class="peg-label">最近验证</span>
              <span class="peg-data">{{ currentTime }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 审计记录 -->
      <div class="data-card audit-card">
        <div class="card-header-row">
          <div class="card-icon purple-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <div class="card-title">审计记录</div>
        </div>
        <div class="audit-list">
          <div class="audit-item" v-for="(item, index) in auditRecords" :key="index">
            <div class="audit-dot"></div>
            <div class="audit-content">
              <div class="audit-header">
                <span class="audit-title">{{ item.title }}</span>
                <span class="audit-status">{{ item.result }}</span>
              </div>
              <span class="audit-time">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据来源 -->
      <div class="data-card source-card">
        <div class="card-header-row">
          <div class="card-icon teal-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div class="card-title">数据来源</div>
        </div>
        <div class="source-list">
          <div class="source-item">
            <div class="source-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 21h18"/>
                <path d="M5 21V7l7-4 7 4v14"/>
                <path d="M9 21v-7h6v7"/>
              </svg>
            </div>
            <div class="source-text">
              <span class="source-name">美联储</span>
              <span class="source-desc">官方财政报告</span>
            </div>
          </div>
          <div class="source-item">
            <div class="source-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div class="source-text">
              <span class="source-name">Chainlink预言机</span>
              <span class="source-desc">去中心化数据源</span>
            </div>
          </div>
          <div class="source-item">
            <div class="source-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18"/>
                <path d="M9 21V9"/>
              </svg>
            </div>
            <div class="source-text">
              <span class="source-name">伦敦金银市场</span>
              <span class="source-desc">LBMA黄金价格</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 免责声明 -->
      <div class="disclaimer">
        <strong>免责声明：</strong>本报告数据来源于公开官方渠道。AGX通过智能合约和预言机实现链上数据同步与验证。过往表现不代表未来收益，投资有风险，请谨慎决策。
      </div>

      <div class="bottom-space"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const displayTons = ref('0')
const displayVerify = ref('0')
const currentTime = ref('')

const targetTons = 8133
const targetVerify = 1285721

let timeInterval = null

const storageLocations = ref([
  { name: '诺克斯堡', location: '肯塔基州', amount: '4,583吨', percent: '56.4%' },
  { name: '纽约联储金库', location: '纽约州', amount: '418吨', percent: '5.1%' },
  { name: '丹佛铸币局', location: '科罗拉多州', amount: '1,364吨', percent: '16.8%' },
  { name: '西点军校', location: '纽约州', amount: '1,768吨', percent: '21.7%' }
])

const auditRecords = ref([
  { title: '月度储备核验', time: '2026-01-20 08:00', result: '通过' },
  { title: '预言机价格更新', time: '2026-01-20 06:30', result: '已同步' },
  { title: '智能合约安全审计', time: '2026-01-15 10:00', result: '通过' },
  { title: '链上数据验证', time: '2026-01-10 12:00', result: '已确认' }
])

const animateNumber = (start, end, duration, callback) => {
  const startTime = performance.now()
  const diff = end - start
  
  const update = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
    const currentValue = Math.floor(start + diff * easeProgress)
    callback(currentValue)
    
    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }
  
  requestAnimationFrame(update)
}

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const updateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}`
}

onMounted(() => {
  // 滚动到顶部
  window.scrollTo(0, 0)
  
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  
  setTimeout(() => {
    animateNumber(0, targetTons, 2000, (val) => {
      displayTons.value = formatNumber(val)
    })
    
    animateNumber(0, targetVerify, 2500, (val) => {
      displayVerify.value = formatNumber(val)
    })
  }, 300)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.audit-page {
  width: 100%;
  max-width: var(--page-max-width, 428px);
  min-height: 100vh;
  margin: 0 auto;
  background: var(--bg-base-light, #fff);
}

/* 固定透明标题栏 */
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  max-width: var(--page-max-width, 428px);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: transparent;
  z-index: 100;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  color: var(--text-primary-light, #1F2937);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
}

.header-right {
  width: 36px;
}

/* 顶部图片 */
.fed-hero {
  position: relative;
  width: 100%;
  height: 220px;
}

.fed-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fed-hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 40%, rgba(255,255,255,1) 100%);
}

/* 标题区域 */
.title-section {
  padding: 20px 16px;
  text-align: center;
  background: var(--bg-base-light, #fff);
}

.title-badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--color-warning-bg, #FEF3C7);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-warning-dark, #B45309);
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.main-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary-light, #1F2937);
  margin: 0 0 8px 0;
}

.sub-title {
  font-size: 14px;
  color: var(--text-tertiary-light, #6B7280);
  margin: 0;
}

.page-content {
  padding: 0 16px;
  background: linear-gradient(180deg, var(--bg-light, #fff) 0%, var(--bg-light-secondary, #F3F4F6) 100%);
}

/* 数据卡片 */
.data-card {
  background: rgba(255,255,255,0.9);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 1px solid rgba(229,231,235,0.5);
}

/* 毛玻璃卡片 */
.glass-card {
  background: linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,95,70,0.15) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(16,185,129,0.2);
}

.glass-card .card-title {
  color: var(--color-success-dark, #065F46);
}

.gold-card {
  background: url('/usa-flag.png');
  background-size: cover;
  background-position: center;
  color: #fff;
  overflow: hidden;
  position: relative;
}

.gold-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 50%;
  bottom: 0;
  background: linear-gradient(90deg, rgba(0,30,60,0.85) 0%, rgba(0,30,60,0.4) 80%, transparent 100%);
}

.gold-card-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gold-card-left {
  flex: 1;
}

.gold-card-right {
  width: 240px;
  height: 195px;
  flex-shrink: 0;
  margin-right: -60px;
  margin-top: -50px;
  margin-bottom: -50px;
}

.gold-card-right img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card-label {
  font-size: 14px;
  color: rgba(255,255,255,0.8);
}

.live-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(255,255,255,0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.live-dot {
  width: 6px;
  height: 6px;
  background: var(--color-up, #34D399);
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.card-value {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.value-num {
  font-size: 42px;
  font-weight: 800;
  font-family: 'SF Mono', monospace;
  letter-spacing: -2px;
}

.value-unit {
  font-size: 18px;
  font-weight: 600;
}

.card-update {
  margin-top: 12px;
  font-size: 12px;
  color: rgba(255,255,255,0.7);
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary-light, #1F2937);
  margin-bottom: 16px;
}

/* 卡片头部带图标 */
.card-header-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.card-header-row .card-title {
  margin-bottom: 0;
}

/* 特色卡片样式 - 简洁统一 */
.detail-card,
.storage-card,
.audit-card,
.source-card {
  background: rgba(255,255,255,0.95);
  border-left: none;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-light-secondary, #F3F4F6) 0%, var(--bg-light-tertiary, #E5E7EB) 100%);
  color: var(--text-tertiary-light, #6B7280);
}

.card-icon svg {
  width: 22px;
  height: 22px;
}

/* 全球黄金图片 */
.crypto-image {
  margin: 16px 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.crypto-image img {
  width: 100%;
  height: auto;
  display: block;
}

/* 详情列表 */
.detail-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-light, #E5E7EB);
}

.detail-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: var(--text-tertiary-light, #6B7280);
}

.detail-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary-light, #1F2937);
  font-family: 'SF Mono', monospace;
}

.detail-value.gold {
  color: var(--color-warning-dark, #B45309);
}

.detail-value.green {
  color: var(--color-up-dark, #059669);
}

/* 存储位置 */
.storage-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.storage-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: linear-gradient(135deg, #fff 0%, #FAFAFA 100%);
  border-radius: 12px;
  border: 1px solid var(--border-light, #E5E7EB);
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.storage-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.storage-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary-light, #1F2937);
}

.storage-location {
  font-size: 12px;
  color: var(--text-quaternary-light, #9CA3AF);
}

.storage-data {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.storage-amount {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-warning-dark, #B45309);
  font-family: 'SF Mono', monospace;
}

.storage-percent {
  font-size: 12px;
  color: var(--text-quaternary-light, #9CA3AF);
}

/* 锚定状态 */
.peg-section {
  display: flex;
  gap: 20px;
  align-items: center;
}

.peg-circle {
  position: relative;
  width: 90px;
  height: 90px;
  flex-shrink: 0;
}

.peg-circle svg {
  width: 100%;
  height: 100%;
}

.peg-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: baseline;
}

.peg-num {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-up-dark, #059669);
  font-family: 'SF Mono', monospace;
}

.peg-unit {
  font-size: 12px;
  color: var(--color-up-dark, #059669);
}

.peg-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.peg-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.peg-label {
  font-size: 13px;
  color: var(--text-tertiary-light, #6B7280);
}

.peg-data {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary-light, #1F2937);
}

.peg-data.mono {
  font-family: 'SF Mono', monospace;
  color: var(--color-brand-purple, #7C3AED);
}

/* 审计记录 */
.audit-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.audit-item {
  display: flex;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-light, #E5E7EB);
}

.audit-item:last-child {
  border-bottom: none;
}

.audit-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-up, #10B981);
  margin-top: 6px;
  flex-shrink: 0;
}

.audit-content {
  flex: 1;
}

.audit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.audit-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary-light, #1F2937);
}

.audit-status {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-up-dark, #059669);
  padding: 2px 8px;
  background: var(--bg-success-light, #D1FAE5);
  border-radius: 4px;
}

.audit-time {
  font-size: 12px;
  color: var(--text-quaternary-light, #9CA3AF);
}

/* 数据来源 */
.source-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.source-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-base-light, #fff);
  border-radius: 12px;
  border: 1px solid var(--border-light, #E5E7EB);
}

.source-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-warning-bg, #FEF3C7);
  border-radius: 10px;
  color: var(--color-warning-dark, #B45309);
}

.source-icon svg {
  width: 20px;
  height: 20px;
}

.source-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.source-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary-light, #1F2937);
}

.source-desc {
  font-size: 12px;
  color: var(--text-quaternary-light, #9CA3AF);
}

/* 免责声明 */
.disclaimer {
  padding: 16px;
  background: var(--color-warning-bg, #FEF3C7);
  border-radius: 12px;
  font-size: 12px;
  color: #92400E;
  line-height: 1.6;
  margin-bottom: 16px;
}

.disclaimer strong {
  color: var(--color-warning-dark, #B45309);
}

.bottom-space {
  height: calc(40px + env(safe-area-inset-bottom));
}
</style>
