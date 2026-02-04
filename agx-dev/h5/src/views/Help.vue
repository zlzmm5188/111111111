<template>
  <div class="help-page">
    <!-- Header -->
    <header class="page-header">
      <button class="back-btn" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="header-title">帮助中心</span>
      <div class="header-right"></div>
    </header>

    <main class="page-content">
      <!-- 快捷入口 -->
      <section class="quick-section">
        <div class="quick-grid">
          <div class="quick-item" @click="scrollTo('account')">
            <div class="quick-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2"/>
              </svg>
            </div>
            <span>账户问题</span>
          </div>
          <div class="quick-item" @click="scrollTo('trade')">
            <div class="quick-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 3v18h18"/>
                <path d="M7 14l4-4 4 4 5-6"/>
              </svg>
            </div>
            <span>交易相关</span>
          </div>
          <div class="quick-item" @click="scrollTo('asset')">
            <div class="quick-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="6" width="20" height="12" rx="2"/>
                <path d="M22 10H2"/>
              </svg>
            </div>
            <span>充提问题</span>
          </div>
          <div class="quick-item" @click="scrollTo('security')">
            <div class="quick-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span>安全设置</span>
          </div>
        </div>
      </section>

      <!-- 常见问题 -->
      <section class="faq-section" id="account">
        <h3 class="section-title">账户问题</h3>
        <div class="faq-list">
          <div v-for="faq in accountFaqs" :key="faq.id" 
               :class="['faq-item', { expanded: expandedId === faq.id }]"
               @click="toggle(faq.id)">
            <div class="faq-header">
              <span class="faq-q">{{ faq.q }}</span>
              <svg class="faq-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <div v-show="expandedId === faq.id" class="faq-answer">{{ faq.a }}</div>
          </div>
        </div>
      </section>

      <section class="faq-section" id="trade">
        <h3 class="section-title">交易相关</h3>
        <div class="faq-list">
          <div v-for="faq in tradeFaqs" :key="faq.id" 
               :class="['faq-item', { expanded: expandedId === faq.id }]"
               @click="toggle(faq.id)">
            <div class="faq-header">
              <span class="faq-q">{{ faq.q }}</span>
              <svg class="faq-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <div v-show="expandedId === faq.id" class="faq-answer">{{ faq.a }}</div>
          </div>
        </div>
      </section>

      <section class="faq-section" id="asset">
        <h3 class="section-title">充提问题</h3>
        <div class="faq-list">
          <div v-for="faq in assetFaqs" :key="faq.id" 
               :class="['faq-item', { expanded: expandedId === faq.id }]"
               @click="toggle(faq.id)">
            <div class="faq-header">
              <span class="faq-q">{{ faq.q }}</span>
              <svg class="faq-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <div v-show="expandedId === faq.id" class="faq-answer">{{ faq.a }}</div>
          </div>
        </div>
      </section>

      <section class="faq-section" id="security">
        <h3 class="section-title">安全设置</h3>
        <div class="faq-list">
          <div v-for="faq in securityFaqs" :key="faq.id" 
               :class="['faq-item', { expanded: expandedId === faq.id }]"
               @click="toggle(faq.id)">
            <div class="faq-header">
              <span class="faq-q">{{ faq.q }}</span>
              <svg class="faq-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <div v-show="expandedId === faq.id" class="faq-answer">{{ faq.a }}</div>
          </div>
        </div>
      </section>

      <div class="bottom-space"></div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const expandedId = ref(null)

const goBack = () => {
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push('/mine')
  }
}

const toggle = (id) => {
  expandedId.value = expandedId.value === id ? null : id
}

const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const accountFaqs = [
  { id: 'a1', q: '如何注册账号？', a: '点击首页"注册"按钮，输入手机号或邮箱，设置登录密码即可完成注册。' },
  { id: 'a2', q: '如何进行身份认证(KYC)？', a: '进入"我的"-"身份认证"，上传身份证正反面照片，填写信息后提交审核，通常1-3个工作日完成。' },
  { id: 'a3', q: '忘记密码怎么办？', a: '在登录页点击"忘记密码"，通过手机号或邮箱验证后即可重置密码。' }
]

const tradeFaqs = [
  { id: 't1', q: '如何购买AGX？', a: '在"交易"页面选择AGX，输入购买金额，使用USDT支付即可完成购买。' },
  { id: 't2', q: '交易手续费是多少？', a: '现货交易手续费为0.1%，VIP用户享受更低费率，具体请查看费率说明。' },
  { id: 't3', q: '什么是矿池挖矿？', a: '矿池挖矿是定期锁仓产品，锁仓AGX可获得额外收益，锁仓时间越长收益越高。' }
]

const assetFaqs = [
  { id: 'd1', q: '充值多久到账？', a: 'TRC20通常1-5分钟，ERC20通常5-30分钟到账，网络拥堵时可能延迟。' },
  { id: 'd2', q: '如何提币？', a: '进入"提币"页面，选择币种和网络，输入地址和数量，验证后提交。首次提币需完成KYC。' },
  { id: 'd3', q: '最低充值/提币金额？', a: '最低充值10 USDT，最低提币20 USDT，具体以页面显示为准。' }
]

const securityFaqs = [
  { id: 's1', q: '如何设置交易密码？', a: '进入"我的"-"安全中心"-"交易密码"，设置6位数字密码，用于提币等敏感操作。' },
  { id: 's2', q: '如何绑定谷歌验证器？', a: '进入"安全中心"-"谷歌验证"，扫描二维码或输入密钥，输入验证码完成绑定。' },
  { id: 's3', q: '账号被盗怎么办？', a: '立即联系在线客服冻结账户，修改密码并重置所有安全设置。' }
]
</script>

<style scoped>
.help-page {
  width: 100%;
  max-width: var(--page-max-width, 428px);
  min-height: 100vh;
  margin: 0 auto;
  background: #0D1117;
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
  font-size: 16px;
  font-weight: 600;
  color: #F8FAFC;
}

.header-right { width: 40px; }

/* Content */
.page-content {
  padding: 68px 16px 0;
}

/* Quick Section */
.quick-section {
  margin-bottom: 20px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.15s;
}

.quick-item:active {
  transform: scale(0.95);
}

.quick-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200, 170, 110, 0.1);
  border-radius: 10px;
}

.quick-icon svg {
  width: 20px;
  height: 20px;
  color: #C8AA6E;
}

.quick-item span {
  font-size: 12px;
  color: #94A3B8;
  text-align: center;
}

/* FAQ Section */
.faq-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0 0 12px;
  padding-left: 2px;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.faq-item {
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
}

.faq-item.expanded {
  border: 1px solid rgba(200, 170, 110, 0.2);
}

.faq-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
}

.faq-q {
  font-size: 15px;
  color: #E2E8F0;
  flex: 1;
  padding-right: 10px;
}

.faq-arrow {
  color: #8B949E;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.faq-item.expanded .faq-arrow {
  transform: rotate(180deg);
  color: #C8AA6E;
}

.faq-answer {
  padding: 0 14px 14px;
  font-size: 14px;
  color: #94A3B8;
  line-height: 1.7;
}

.bottom-space {
  height: calc(24px + env(safe-area-inset-bottom));
}
</style>
