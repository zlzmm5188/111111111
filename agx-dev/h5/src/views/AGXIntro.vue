<template>
  <div class="intro-page">
    <!-- Header -->
    <header class="page-header">
      <button class="back-btn" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="header-title">AGX</span>
      <div class="header-right"></div>
    </header>

    <main class="content">
      <!-- Hero Banner -->
      <section class="hero-banner">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <img src="/agx-new.png" alt="AGX" class="hero-logo">
          <h1>Ascenda</h1>
          <p class="hero-tagline">全球领先的数字黄金资产平台</p>
          <div class="hero-badges">
            <span class="badge">MSB 持牌</span>
            <span class="badge">CertiK 审计</span>
            <span class="badge">链上透明</span>
          </div>
        </div>
      </section>

      <!-- 平台介绍 -->
      <section class="section">
        <div class="section-header">
          <span class="section-tag">ABOUT PLATFORM</span>
          <h2>关于 Ascenda</h2>
        </div>
        <div class="intro-card">
          <p>Ascenda 是一家专注于数字黄金资产的金融科技公司，致力于通过区块链技术将传统黄金投资与数字资产相结合，为全球投资者提供安全、透明、高效的黄金投资解决方案。</p>
          <p>公司总部位于新加坡，持有美国 FinCEN MSB 牌照、加拿大 FINTRAC MSB 牌照及澳大利亚 AUSTRAC DCE 注册，业务覆盖全球 50+ 国家和地区。</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-value">50+</span>
            <span class="stat-label">覆盖国家</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">100万+</span>
            <span class="stat-label">注册用户</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">$10亿+</span>
            <span class="stat-label">交易额</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">99.9%</span>
            <span class="stat-label">系统可用</span>
          </div>
        </div>
      </section>

      <!-- AGX 代币介绍 -->
      <section class="section dark">
        <div class="section-header">
          <span class="section-tag light">ABOUT AGX TOKEN</span>
          <h2>AGX 升达金指币</h2>
        </div>
        <div class="intro-card light">
          <p>AGX（升达金指币）是全球首款锚定美联储黄金储备价值的数字资产。通过独创的 GIB（Gold Index Binding）机制，AGX 实现了与实物黄金价值的动态绑定。</p>
        </div>

        <div class="token-info">
          <div class="token-row">
            <span class="token-key">代币名称</span>
            <span class="token-val">AGX Token</span>
          </div>
          <div class="token-row">
            <span class="token-key">代币符号</span>
            <span class="token-val">AGX</span>
          </div>
          <div class="token-row">
            <span class="token-key">发行总量</span>
            <span class="token-val">21,000,000 AGX</span>
          </div>
          <div class="token-row">
            <span class="token-key">首发价格</span>
            <span class="token-val highlight">$0.065</span>
          </div>
          <div class="token-row">
            <span class="token-key">部署网络</span>
            <span class="token-val">TRON (TRC-20)</span>
          </div>
        </div>

        <div class="gib-formula">
          <div class="formula-label">GIB 价值锚定公式</div>
          <div class="formula-content">
            <span class="formula-text">GIB = (R × P × W) / S</span>
          </div>
          <div class="formula-vars">
            <span><b>R</b> = 黄金储备量</span>
            <span><b>P</b> = 黄金现货价</span>
            <span><b>W</b> = 权重系数</span>
            <span><b>S</b> = 总供应量</span>
          </div>
        </div>
      </section>

      <!-- 核心优势 -->
      <section class="section">
        <div class="section-header">
          <span class="section-tag">CORE ADVANTAGES</span>
          <h2>核心优势</h2>
        </div>
        
        <div class="advantage-list">
          <div class="adv-card">
            <div class="adv-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 17l2-7h12l2 7H4z" stroke-linejoin="round"/>
                <path d="M6 10l1.5-4h9L18 10" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="adv-content">
              <h3>真实资产支撑</h3>
              <p>锚定美联储 8,133 吨黄金储备价值，非空气币</p>
            </div>
          </div>

          <div class="adv-card">
            <div class="adv-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div class="adv-content">
              <h3>抗通胀属性</h3>
              <p>黄金历史证明长期保值，对冲货币贬值风险</p>
            </div>
          </div>

          <div class="adv-card">
            <div class="adv-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <div class="adv-content">
              <h3>透明可验证</h3>
              <p>数据来源公开，任何人可独立验证储备证明</p>
            </div>
          </div>

          <div class="adv-card">
            <div class="adv-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <div class="adv-content">
              <h3>全球即时流通</h3>
              <p>24/7 全天候交易，秒级跨境转账结算</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 生态系统 -->
      <section class="section alt">
        <div class="section-header">
          <span class="section-tag">ECOSYSTEM</span>
          <h2>AGX 生态系统</h2>
        </div>

        <div class="eco-grid">
          <div class="eco-card">
            <div class="eco-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <h4>现货交易</h4>
            <p>AGX/USDT 实时交易</p>
          </div>

          <div class="eco-card">
            <div class="eco-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <h4>合约交易</h4>
            <p>高杠杆秒合约</p>
          </div>

          <div class="eco-card">
            <div class="eco-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h4>持币生金</h4>
            <p>年化 3-15% 收益</p>
          </div>

          <div class="eco-card">
            <div class="eco-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h4>邀请奖励</h4>
            <p>双向返利机制</p>
          </div>
        </div>
      </section>

      <!-- 安全合规 -->
      <section class="section">
        <div class="section-header">
          <span class="section-tag">SECURITY & COMPLIANCE</span>
          <h2>安全与合规</h2>
        </div>

        <div class="license-list">
          <div class="license-card">
            <div class="license-flag">🇺🇸</div>
            <div class="license-info">
              <h4>美国 MSB</h4>
              <p>FinCEN 货币服务牌照</p>
            </div>
          </div>
          <div class="license-card">
            <div class="license-flag">🇨🇦</div>
            <div class="license-info">
              <h4>加拿大 MSB</h4>
              <p>FINTRAC 注册</p>
            </div>
          </div>
          <div class="license-card">
            <div class="license-flag">🇦🇺</div>
            <div class="license-info">
              <h4>澳大利亚 DCE</h4>
              <p>AUSTRAC 注册</p>
            </div>
          </div>
        </div>

        <div class="audit-badges">
          <div class="audit-badge">
            <span class="audit-name">CertiK</span>
            <span class="audit-label">智能合约审计</span>
          </div>
          <div class="audit-badge">
            <span class="audit-name">SlowMist</span>
            <span class="audit-label">安全审计</span>
          </div>
          <div class="audit-badge">
            <span class="audit-name">ISO 27001</span>
            <span class="audit-label">信息安全</span>
          </div>
        </div>
      </section>


      <!-- 快速入口 -->
      <section class="quick-links">
        <router-link to="/whitepaper" class="quick-link">
          <span class="link-icon">📄</span>
          <span class="link-text">白皮书</span>
        </router-link>
        <router-link to="/audit" class="quick-link">
          <span class="link-icon">🔒</span>
          <span class="link-text">审计报告</span>
        </router-link>
        <router-link to="/help" class="quick-link">
          <span class="link-icon">❓</span>
          <span class="link-text">帮助中心</span>
        </router-link>
      </section>
    </main>

    <!-- Fixed CTA -->
    <div class="cta-container">
      <router-link to="/ieo" class="cta-btn">立即购买 AGX</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push('/home')
  }
}

onMounted(() => {
  // Page initialized
})
</script>

<style scoped>
.intro-page {
  width: 100%;
  max-width: var(--page-max-width, 428px);
  min-height: 100vh;
  margin: 0 auto;
  background: #0D1117;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
}

/* Header */
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  max-width: var(--page-max-width, 428px);
  margin: 0 auto;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: rgba(13, 17, 23, 0.95);
  backdrop-filter: blur(12px);
  z-index: 100;
  border-bottom: 1px solid rgba(200, 170, 110, 0.1);
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #C8AA6E;
  cursor: pointer;
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: #F8FAFC;
  letter-spacing: 0.5px;
}

.header-right { width: 40px; }

/* Content */
.content {
  padding-top: 56px;
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}

/* Hero Banner */
.hero-banner {
  position: relative;
  padding: 48px 24px;
  text-align: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(200, 170, 110, 0.1) 0%, transparent 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-logo {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  margin-bottom: 16px;
  box-shadow: 0 8px 32px rgba(200, 170, 110, 0.3);
  border: 2px solid rgba(200, 170, 110, 0.3);
}

.hero-banner h1 {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #C8AA6E 50%, #A68B4B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px;
  letter-spacing: 2px;
}

.hero-tagline {
  font-size: 14px;
  color: #94A3B8;
  margin: 0 0 20px;
}

.hero-badges {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 12px;
  background: rgba(200, 170, 110, 0.1);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 100px;
  font-size: 11px;
  color: #C8AA6E;
}

/* Section */
.section {
  padding: 32px 20px;
  background: #0D1117;
}

.section.dark {
  background: linear-gradient(180deg, #111111 0%, #0D0D0D 100%);
}

.section.alt {
  background: linear-gradient(180deg, #0F0F0F 0%, #0D1117 100%);
}

.section-header {
  margin-bottom: 20px;
}

.section-tag {
  font-size: 10px;
  font-weight: 600;
  color: #C8AA6E;
  letter-spacing: 1.5px;
  margin-bottom: 6px;
  display: block;
}

.section-tag.light {
  color: #F0D78C;
}

.section h2 {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #C8AA6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

/* Intro Card */
.intro-card {
  background: rgba(200, 170, 110, 0.05);
  border: 1px solid rgba(200, 170, 110, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.intro-card p {
  font-size: 13px;
  color: #94A3B8;
  line-height: 1.7;
  margin: 0 0 12px;
}

.intro-card p:last-child {
  margin-bottom: 0;
}

.intro-card.light {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(200, 170, 110, 0.15);
}

.intro-card.light p {
  color: #E2E8F0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-card {
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #C8AA6E;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  color: #8B949E;
}

/* Token Info */
.token-info {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(200, 170, 110, 0.1);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 20px;
}

.token-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 4px;
  border-bottom: 1px solid rgba(200, 170, 110, 0.08);
}

.token-row:last-child {
  border-bottom: none;
}

.token-key {
  font-size: 13px;
  color: #8B949E;
}

.token-val {
  font-size: 13px;
  font-weight: 500;
  color: #E2E8F0;
}

.token-val.highlight {
  color: #C8AA6E;
  font-weight: 600;
}

/* GIB Formula */
.gib-formula {
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.1) 0%, rgba(200, 170, 110, 0.03) 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.formula-label {
  font-size: 10px;
  color: #8B949E;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.formula-content {
  margin-bottom: 16px;
}

.formula-text {
  font-size: 18px;
  font-weight: 600;
  color: #C8AA6E;
  font-family: 'Georgia', serif;
}

.formula-vars {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.formula-vars span {
  font-size: 11px;
  color: #94A3B8;
}

.formula-vars b {
  color: #C8AA6E;
}

/* Advantage List */
.advantage-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.adv-card {
  display: flex;
  gap: 14px;
  padding: 14px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 12px;
}

.adv-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200, 170, 110, 0.1);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 12px;
  flex-shrink: 0;
}

.adv-icon svg {
  width: 22px;
  height: 22px;
  color: #C8AA6E;
}

.adv-content h3 {
  font-size: 14px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0 0 4px;
}

.adv-content p {
  font-size: 12px;
  color: #8B949E;
  margin: 0;
  line-height: 1.5;
}

/* Eco Grid */
.eco-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.eco-card {
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.eco-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200, 170, 110, 0.1);
  border-radius: 10px;
  margin: 0 auto 10px;
}

.eco-icon svg {
  width: 20px;
  height: 20px;
  color: #C8AA6E;
}

.eco-card h4 {
  font-size: 13px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0 0 4px;
}

.eco-card p {
  font-size: 11px;
  color: #8B949E;
  margin: 0;
}

/* License List */
.license-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.license-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 10px;
}

.license-flag {
  font-size: 24px;
}

.license-info h4 {
  font-size: 13px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0 0 2px;
}

.license-info p {
  font-size: 11px;
  color: #8B949E;
  margin: 0;
}

/* Audit Badges */
.audit-badges {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.audit-badge {
  flex: 1;
  min-width: 100px;
  padding: 12px;
  background: rgba(200, 170, 110, 0.05);
  border: 1px solid rgba(200, 170, 110, 0.15);
  border-radius: 10px;
  text-align: center;
}

.audit-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #C8AA6E;
  margin-bottom: 2px;
}

.audit-label {
  font-size: 10px;
  color: #8B949E;
}

/* Contact List */
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.contact-label {
  font-size: 13px;
  color: #8B949E;
}

.contact-value {
  font-size: 13px;
  color: #E2E8F0;
}

/* Quick Links */
.quick-links {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background: linear-gradient(180deg, #0D1117 0%, #111 100%);
  border-top: 1px solid rgba(200, 170, 110, 0.1);
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.link-icon {
  font-size: 24px;
}

.link-text {
  font-size: 11px;
  color: #94A3B8;
}

/* CTA */
.cta-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: var(--page-max-width, 428px);
  margin: 0 auto;
  padding: 12px 16px;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
  background: linear-gradient(to top, #0D1117 0%, rgba(13, 17, 23, 0.95) 50%, transparent 100%);
}

.cta-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #0D1117;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(200, 170, 110, 0.25);
}

.cta-btn:active {
  opacity: 0.9;
}
</style>
