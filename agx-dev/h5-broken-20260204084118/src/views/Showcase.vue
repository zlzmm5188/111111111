<template>
  <div class="showcase-page">
    <!-- Header -->
    <header class="page-header">
      <button class="back-btn" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="header-title">风采展示</span>
      <div class="header-right"></div>
    </header>

    <main class="content">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <h1>团队风采</h1>
          <p>升达数字资产集团核心团队</p>
        </div>
      </section>

      <!-- 企业宣传视频 -->
      <section class="video-section">
        <div class="section-header">
          <span class="section-tag">CORPORATE VIDEO</span>
          <h2>{{ currentLang === 'zh' ? '企业宣传' : 'Corporate Video' }}</h2>
        </div>
        <div class="video-container">
          <video 
            ref="corporateVideo"
            class="corporate-video"
            :src="corporateVideoUrl"
            controls
            playsinline
            poster="/company-logo.png"
            @play="onVideoPlay"
          >
            您的浏览器不支持视频播放
          </video>
          <div class="video-overlay" v-if="!videoPlaying" @click="playVideo">
            <div class="play-button">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <p>{{ currentLang === 'zh' ? '点击播放企业宣传片' : 'Play Corporate Video' }}</p>
          </div>
        </div>
      </section>

      <!-- 语言切换 -->
      <div class="lang-switch">
        <button :class="{ active: currentLang === 'zh' }" @click="currentLang = 'zh'">中文</button>
        <button :class="{ active: currentLang === 'en' }" @click="currentLang = 'en'">English</button>
      </div>

      <!-- 团队风采展示区 -->
      <section class="member-section">
        <!-- 创始人 -->
        <div class="member-card featured" @click="toggleScript('founder')">
          <div class="member-photo-container">
            <img :src="teamMembers.founder.photo" :alt="teamMembers.founder.name" class="member-photo">
            <div class="photo-overlay">
              <div class="expand-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14" v-if="expandedScript !== 'founder'"/>
                  <path d="M5 12h14" v-else/>
                </svg>
              </div>
            </div>
          </div>
          <div class="member-info">
            <div class="member-badge founder">创始人</div>
            <h3>{{ teamMembers.founder.name }}</h3>
            <p class="member-role">{{ teamMembers.founder.role }}</p>
            <p class="member-desc">{{ currentLang === 'zh' ? '点击查看介绍' : 'Tap to view intro' }}</p>
          </div>
          <transition name="slide">
            <div class="script-preview" v-if="expandedScript === 'founder'">
              <div class="script-text">{{ scripts.founder[currentLang] }}</div>
            </div>
          </transition>
        </div>

        <!-- 总裁 -->
        <div class="member-card featured" @click="toggleScript('president')">
          <div class="member-photo-container">
            <img :src="teamMembers.president.photo" :alt="teamMembers.president.name" class="member-photo">
            <div class="photo-overlay">
              <div class="expand-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14" v-if="expandedScript !== 'president'"/>
                  <path d="M5 12h14" v-else/>
                </svg>
              </div>
            </div>
          </div>
          <div class="member-info">
            <div class="member-badge president">总裁</div>
            <h3>{{ teamMembers.president.name }}</h3>
            <p class="member-role">{{ teamMembers.president.role }}</p>
            <p class="member-desc">{{ currentLang === 'zh' ? '点击查看介绍' : 'Tap to view intro' }}</p>
          </div>
          <transition name="slide">
            <div class="script-preview" v-if="expandedScript === 'president'">
              <div class="script-text">{{ scripts.president[currentLang] }}</div>
            </div>
          </transition>
        </div>

        <!-- 专业团队 -->
        <div class="section-header">
          <span class="section-tag">PROFESSIONAL TEAM</span>
          <h2>专业团队</h2>
        </div>

        <div class="member-grid">
          <div 
            v-for="(member, key) in otherMembers" 
            :key="key"
            class="member-card small" 
            @click="toggleScript(key)"
          >
            <div class="member-photo-container small">
              <img :src="member.photo" :alt="member.name" class="member-photo">
            </div>
            <div class="member-info compact">
              <h4>{{ member.name }}</h4>
              <p>{{ member.role }}</p>
            </div>
          </div>
        </div>

        <!-- 选中成员的脚本展示 -->
        <transition name="slide">
          <div class="selected-script" v-if="expandedScript && !['founder', 'president'].includes(expandedScript)">
            <div class="script-header">
              <img :src="teamMembers[expandedScript]?.photo" class="script-avatar">
              <div>
                <h4>{{ teamMembers[expandedScript]?.name }}</h4>
                <p>{{ teamMembers[expandedScript]?.role }}</p>
              </div>
              <button class="close-btn" @click.stop="expandedScript = null">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="script-text">{{ scripts[expandedScript]?.[currentLang] }}</div>
          </div>
        </transition>
      </section>

      <!-- 台词脚本区 -->
      <section class="script-section">
        <div class="section-header">
          <span class="section-tag">SCRIPTS</span>
          <h2>{{ currentLang === 'zh' ? '团队介绍' : 'Team Introduction' }}</h2>
        </div>

        <div class="script-tabs">
          <button 
            v-for="(member, key) in teamMembers" 
            :key="key"
            :class="{ active: activeScript === key }"
            @click="activeScript = key"
          >
            {{ member.name.length > 4 ? member.name.slice(0, 4) : member.name }}
          </button>
        </div>

        <div class="script-content">
          <div class="script-header">
            <img :src="teamMembers[activeScript]?.photo" class="script-avatar">
            <div>
              <h4>{{ teamMembers[activeScript]?.name }}</h4>
              <p>{{ teamMembers[activeScript]?.role }}</p>
            </div>
          </div>
          <div class="script-text">{{ scripts[activeScript]?.[currentLang] }}</div>
        </div>
      </section>

      <!-- 公司简介 -->
      <section class="promo-section">
        <div class="section-header">
          <span class="section-tag light">ABOUT US</span>
          <h2>{{ currentLang === 'zh' ? '了解升达' : 'About Ascenda' }}</h2>
        </div>
        <div class="promo-card">
          <div class="promo-stats">
            <div class="stat">
              <span class="stat-value">2019</span>
              <span class="stat-label">{{ currentLang === 'zh' ? '成立年份' : 'Founded' }}</span>
            </div>
            <div class="stat">
              <span class="stat-value">7+</span>
              <span class="stat-label">{{ currentLang === 'zh' ? '核心团队' : 'Core Team' }}</span>
            </div>
            <div class="stat">
              <span class="stat-value">24/7</span>
              <span class="stat-label">{{ currentLang === 'zh' ? '全天服务' : 'Service' }}</span>
            </div>
          </div>
          <router-link to="/team" class="promo-link">
            {{ currentLang === 'zh' ? '查看完整团队介绍' : 'View Full Team' }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </router-link>
        </div>
      </section>

      <div class="bottom-space"></div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentLang = ref('zh')
const activeScript = ref('founder')
const expandedScript = ref(null)
const corporateVideo = ref(null)
const videoPlaying = ref(false)
const corporateVideoUrl = '/videos/corporate-premium.mp4'

// 视频播放控制
const playVideo = () => {
  if (corporateVideo.value) {
    corporateVideo.value.play()
  }
}

const onVideoPlay = () => {
  videoPlaying.value = true
}

// 团队成员数据
const teamMembers = ref({
  founder: {
    name: '弗拉基米尔·亚历山德罗维奇·伊万诺夫',
    role: '创始人 & 董事长',
    photo: '/team/弗拉基米尔·亚历山德罗维奇·伊万诺夫.jpg'
  },
  president: {
    name: '陈启明',
    role: '大中华亚太区总裁',
    photo: '/team/陈启明.jpg'
  },
  analyst: {
    name: '李鹏',
    role: '分析师',
    photo: '/team/李鹏.jpg'
  },
  marketing: {
    name: '郭昭晏',
    role: '营销负责人',
    photo: '/team/郭昭晏.jpg'
  },
  legal: {
    name: '周刚',
    role: '法务部负责人',
    photo: '/team/周刚.jpg'
  },
  social: {
    name: '顾凌云',
    role: '社交媒体经理',
    photo: '/team/顾凌云-new.jpg'
  },
  designer: {
    name: '林鑫',
    role: '设计师',
    photo: '/team/林鑫.jpg'
  }
})

// 其他成员（除创始人和总裁）
const otherMembers = computed(() => {
  const { founder, president, ...others } = teamMembers.value
  return others
})

// 台词脚本 - 包含公司标识
const scripts = ref({
  founder: {
    zh: `各位投资者朋友们，大家好。我是升达数字资产集团创始人弗拉基米尔。
升达集团，英文名Ascenda，致力于打造全球领先的数字黄金投资平台。
我们将传统贵金属投资与现代区块链技术深度融合，为您提供安全、透明、高效的数字资产投资体验。
通过AGX代币，您可以随时随地参与黄金投资，享受区块链带来的便捷与安全。
感谢您选择升达数字资产集团，让我们携手共创财富未来。`,
    en: `Hello, dear investors. I am Vladimir, founder of Ascenda Digital Assets Group.
Ascenda is committed to building the world's leading digital gold investment platform.
We integrate traditional precious metal investment with modern blockchain technology to provide you with a safe, transparent, and efficient digital asset investment experience.
Through AGX tokens, you can participate in gold investment anytime, anywhere, enjoying the convenience and security of blockchain.
Thank you for choosing Ascenda Digital Assets Group. Let's create a prosperous future together.`
  },
  president: {
    zh: `大家好，我是升达数字资产集团大中华亚太区总裁陈启明。
很荣幸代表升达集团，为大中华区及亚太地区的投资者提供专业的数字黄金投资服务。
升达数字资产集团拥有专业的分析团队、完善的合规体系、以及全天候的客户服务。
选择升达，就是选择专业与信赖。期待与您携手，共同见证数字黄金的美好未来。`,
    en: `Hello everyone, I am Chen Qiming, President of Greater China and Asia Pacific at Ascenda Digital Assets Group.
It is my honor to represent Ascenda Group in providing professional digital gold investment services to investors in Greater China and the Asia Pacific region.
Ascenda Digital Assets Group has a professional analysis team, comprehensive compliance system, and 24/7 customer service.
Choosing Ascenda means choosing professionalism and trust. Looking forward to partnering with you to witness the bright future of digital gold.`
  },
  analyst: {
    zh: `投资者朋友们好，我是升达数字资产集团分析师李鹏。
作为升达的专业市场分析师，我每天追踪全球黄金市场动态，为您提供及时、准确的市场分析和投资建议。
升达数字资产集团会定期发布市场简报，帮助您把握投资时机。
关注升达，掌握财富先机。`,
    en: `Hello investors, I am Li Peng, analyst at Ascenda Digital Assets Group.
As Ascenda's professional market analyst, I track global gold market dynamics daily to provide you with timely and accurate market analysis and investment advice.
Ascenda Digital Assets Group regularly publishes market briefings to help you seize investment opportunities.
Follow Ascenda and stay ahead of the wealth curve.`
  },
  marketing: {
    zh: `大家好，我是升达数字资产集团营销负责人郭昭晏。
欢迎来到升达数字资产平台！我们致力于为您打造最佳的投资体验。
现在注册升达即可获得新手礼包，邀请好友还能获得丰厚奖励。
关注升达数字资产集团官方账号，获取最新活动资讯。升达，您的财富管理伙伴。`,
    en: `Hello everyone, I am Guo Zhaoyan, Marketing Director at Ascenda Digital Assets Group.
Welcome to the Ascenda Digital Assets platform! We are committed to creating the best investment experience for you.
Register now with Ascenda to receive a welcome package, and earn generous rewards by inviting friends.
Follow Ascenda Digital Assets Group official accounts for the latest promotions. Ascenda, your wealth management partner.`
  },
  legal: {
    zh: `尊敬的用户，我是升达数字资产集团法务部负责人周刚。
升达数字资产集团严格遵守各项法律法规，持有相关金融牌照，确保平台运营合法合规。
我们承诺保护您的个人信息安全，所有交易数据均采用银行级加密技术。
选择升达，选择安全与信赖。`,
    en: `Dear users, I am Zhou Gang, Head of Legal Department at Ascenda Digital Assets Group.
Ascenda Digital Assets Group strictly complies with all laws and regulations, holds relevant financial licenses, and ensures legal and compliant platform operations.
We are committed to protecting your personal information security. All transaction data is encrypted with bank-level technology.
Choose Ascenda, choose security and trust.`
  },
  social: {
    zh: `Hi，大家好！我是升达数字资产集团社交媒体经理顾凌云。
感谢您关注升达！在这里，我会为您带来最新的市场资讯、投资技巧和平台活动。
记得关注升达官方账号，第一时间获取独家福利和活动信息。
有任何问题欢迎留言互动，升达一直在这里！`,
    en: `Hi everyone! I am Gu Lingyun, Social Media Manager at Ascenda Digital Assets Group.
Thank you for following Ascenda! Here, I will bring you the latest market information, investment tips, and platform events.
Remember to follow Ascenda official accounts to be the first to receive exclusive benefits and event information.
Feel free to leave comments and interact with us. Ascenda is always here!`
  },
  designer: {
    zh: `大家好，我是升达数字资产集团设计师林鑫。
作为升达的产品设计师，我的目标是为您打造最流畅、最直观的投资体验。
您的每一条反馈都是升达进步的动力。如果您有任何使用体验上的建议，欢迎告诉我们。
升达数字资产，用设计创造价值。`,
    en: `Hello everyone, I am Lin Xin, designer at Ascenda Digital Assets Group.
As Ascenda's product designer, my goal is to create the smoothest and most intuitive investment experience for you.
Your feedback is the driving force for Ascenda's improvement. If you have any suggestions for the user experience, please let us know.
Ascenda Digital Assets, creating value through design.`
  }
})

// 切换脚本展示
const toggleScript = (member) => {
  if (expandedScript.value === member) {
    expandedScript.value = null
  } else {
    expandedScript.value = member
    activeScript.value = member
  }
}

const goBack = () => {
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push('/home')
  }
}
</script>

<style scoped>
.showcase-page {
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
  font-size: 15px;
  font-weight: 600;
  color: #F8FAFC;
}

.header-right { width: 40px; }

/* Content */
.content {
  padding-top: 56px;
}

/* Hero Section */
.hero-section {
  position: relative;
  padding: 40px 20px;
  text-align: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(200, 170, 110, 0.15) 0%, transparent 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-section h1 {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #C8AA6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px;
}

.hero-section p {
  font-size: 14px;
  color: #94A3B8;
  margin: 0;
}

/* Video Section */
.video-section {
  padding: 0 16px 24px;
}

.video-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  aspect-ratio: 16/9;
}

.corporate-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.play-button {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0D1117;
  margin-bottom: 12px;
  transition: transform 0.3s;
}

.play-button svg {
  width: 32px;
  height: 32px;
  margin-left: 4px;
}

.video-overlay:hover .play-button {
  transform: scale(1.1);
}

.video-overlay p {
  color: #F8FAFC;
  font-size: 14px;
  margin: 0;
}

/* Language Switch */
.lang-switch {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 0 16px 20px;
}

.lang-switch button {
  padding: 8px 20px;
  background: rgba(200, 170, 110, 0.1);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 20px;
  color: #94A3B8;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.lang-switch button.active {
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  border-color: transparent;
  color: #0D1117;
  font-weight: 600;
}

/* Section */
.section-header {
  padding: 0 16px;
  margin-bottom: 16px;
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

.section-header h2 {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #C8AA6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

/* Member Section */
.member-section {
  padding: 0 16px 24px;
}

/* Member Card */
.member-card {
  background: linear-gradient(145deg, rgba(30, 38, 50, 0.95), rgba(22, 27, 34, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.member-card:active {
  transform: scale(0.98);
}

.member-card.featured {
  border-color: rgba(200, 170, 110, 0.3);
}

.member-photo-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.member-photo-container.small {
  aspect-ratio: 1;
}

.member-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.member-card:hover .member-photo {
  transform: scale(1.05);
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.6) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 12px;
}

.expand-icon {
  width: 32px;
  height: 32px;
  background: rgba(200, 170, 110, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0D1117;
}

.expand-icon svg {
  width: 18px;
  height: 18px;
}

.member-info {
  padding: 16px;
}

.member-info.compact {
  padding: 12px;
}

.member-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 8px;
}

.member-badge.founder {
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  color: #0D1117;
}

.member-badge.president {
  background: rgba(200, 170, 110, 0.2);
  color: #C8AA6E;
}

.member-info h3 {
  font-size: 17px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0 0 4px;
}

.member-info h4 {
  font-size: 14px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0 0 2px;
}

.member-role {
  font-size: 13px;
  color: #C8AA6E;
  margin: 0 0 8px;
}

.member-desc {
  font-size: 12px;
  color: #8B949E;
  margin: 0;
}

.member-info.compact p {
  font-size: 11px;
  color: #8B949E;
  margin: 0;
}

/* Script Preview in Card */
.script-preview {
  padding: 0 16px 16px;
  border-top: 1px solid rgba(200, 170, 110, 0.1);
}

.script-preview .script-text {
  font-size: 13px;
  color: #94A3B8;
  line-height: 1.8;
  white-space: pre-line;
  padding-top: 12px;
}

/* Member Grid */
.member-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.member-card.small {
  margin-bottom: 0;
}

/* Selected Script */
.selected-script {
  background: rgba(200, 170, 110, 0.08);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}

.selected-script .script-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(200, 170, 110, 0.1);
}

.selected-script .script-header h4 {
  font-size: 14px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0 0 2px;
}

.selected-script .script-header p {
  font-size: 12px;
  color: #C8AA6E;
  margin: 0;
}

.selected-script .script-header > div:first-of-type {
  flex: 1;
}

.close-btn {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94A3B8;
  cursor: pointer;
}

.close-btn svg {
  width: 16px;
  height: 16px;
}

/* Script Section */
.script-section {
  padding: 24px 16px;
  background: linear-gradient(180deg, #0A0D12 0%, #0D1117 100%);
}

.script-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 16px;
  margin-bottom: 16px;
  -webkit-overflow-scrolling: touch;
}

.script-tabs::-webkit-scrollbar {
  display: none;
}

.script-tabs button {
  flex-shrink: 0;
  padding: 8px 16px;
  background: rgba(200, 170, 110, 0.1);
  border: 1px solid rgba(200, 170, 110, 0.15);
  border-radius: 20px;
  color: #94A3B8;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.script-tabs button.active {
  background: rgba(200, 170, 110, 0.2);
  border-color: rgba(200, 170, 110, 0.4);
  color: #C8AA6E;
}

.script-content {
  background: rgba(200, 170, 110, 0.05);
  border: 1px solid rgba(200, 170, 110, 0.15);
  border-radius: 12px;
  padding: 16px;
}

.script-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(200, 170, 110, 0.1);
}

.script-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(200, 170, 110, 0.3);
}

.script-header h4 {
  font-size: 14px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0 0 4px;
}

.script-header p {
  font-size: 12px;
  color: #C8AA6E;
  margin: 0;
}

.script-text {
  font-size: 13px;
  color: #94A3B8;
  line-height: 1.8;
  white-space: pre-line;
}

/* Promo Section */
.promo-section {
  padding: 24px 16px;
}

.promo-card {
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.1), rgba(22, 27, 34, 0.9));
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 16px;
  padding: 20px;
}

.promo-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #C8AA6E;
}

.stat-label {
  font-size: 11px;
  color: #8B949E;
}

.promo-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  border-radius: 8px;
  color: #0D1117;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.promo-link svg {
  width: 18px;
  height: 18px;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.bottom-space {
  height: calc(20px + env(safe-area-inset-bottom));
}
</style>
