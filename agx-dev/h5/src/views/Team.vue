<template>
  <div class="team-page">
    <!-- 开场动画：创始人展示 -->
    <Transition name="intro-fade">
      <div class="intro-screen" v-if="showIntro">
        <div class="intro-content">
          <div class="intro-glow"></div>
          <div class="intro-avatar">
            <img src="/team/弗拉基米尔·亚历山德罗维奇·伊万诺夫.jpg" alt="">
          </div>
          <div class="intro-badge">创始人 & 董事长</div>
          <h1 class="intro-name">弗拉基米尔·亚历山德罗维奇·伊万诺夫</h1>
          <p class="intro-desc">拥有超过25年国际金融与资产管理经验，2019年创立升达数字资产集团，致力于将传统贵金属投资与现代区块链技术深度融合。</p>
          <div class="intro-tags">
            <span>资产管理规模超10亿美元</span>
            <span>跨境金融专家</span>
            <span>区块链战略布局</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Header -->
    <header class="page-header" :class="{ 'visible': !showIntro }">
      <button class="back-btn" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="header-title">团队介绍</span>
      <div class="header-right"></div>
    </header>

    <!-- 主内容 -->
    <Transition name="main-fade">
      <main class="content" v-if="!showIntro">
        <!-- 总裁区域 -->
        <section class="president-section">
          <div class="president-card" @click="openModal('president')">
            <div class="president-photo">
              <img src="/team/陈启明.jpg" alt="">
              <div class="photo-overlay"></div>
            </div>
            <div class="president-info">
              <span class="info-label">大中华亚太区</span>
              <h2 class="info-name">陈启明</h2>
              <p class="info-title">总裁</p>
              <div class="info-divider"></div>
              <p class="info-desc">20年金融行业管理经验，负责大中华及亚太区全面业务拓展与运营管理</p>
              <button class="info-btn">
                <span>查看详情</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </section>

        <!-- 团队成员网格 -->
        <section class="team-section">
          <div class="section-header">
            <span class="section-tag">TEAM</span>
            <h3 class="section-title">核心团队</h3>
            <p class="section-subtitle">专业精英 · 值得信赖</p>
          </div>
          
          <div class="team-grid">
            <div 
              class="team-card" 
              v-for="(member, key, index) in teamMembers" 
              :key="key"
              :style="{ animationDelay: `${index * 0.1}s` }"
              @click="openModal(key)"
            >
              <div class="card-glow"></div>
              <div class="card-avatar">
                <img :src="member.photo" alt="">
                <div class="avatar-ring"></div>
              </div>
              <div class="card-badge">{{ member.badge }}</div>
              <h4 class="card-name">{{ member.name }}</h4>
              <p class="card-title">{{ member.title }}</p>
              <div class="card-footer">
                <span class="view-more">查看详情</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        </section>

        <!-- 公司介绍 -->
        <section class="about-section">
          <p>升达数字资产集团汇聚金融、科技、法律等领域精英，团队成员平均拥有10年以上行业经验，致力于为全球投资者提供安全、专业的数字资产服务。</p>
        </section>

        <div class="bottom-space"></div>
      </main>
    </Transition>

    <!-- Modal 弹窗 -->
    <Transition name="modal">
      <div class="modal-overlay" v-if="showModal" @click="closeModal">
        <div class="modal-container" :class="{ 'premium': currentMember?.level === 'president' }" @click.stop>
          <!-- 关闭按钮 -->
          <button class="modal-close" @click="closeModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          
          <!-- 总裁特殊布局 -->
          <template v-if="currentMember?.level === 'president'">
            <div class="modal-hero">
              <img :src="currentMember?.photo" alt="">
              <div class="hero-gradient"></div>
            </div>
            <div class="modal-details">
              <div class="detail-badge">{{ currentMember?.badge }}</div>
              <h2 class="detail-name">{{ currentMember?.name }}</h2>
              <p class="detail-title">{{ currentMember?.title }}</p>
              <div class="detail-divider"></div>
              <p class="detail-about">{{ currentMember?.about }}</p>
            </div>
          </template>
          
          <!-- 普通成员布局 - 大图展示 -->
          <template v-else>
            <div class="modal-hero member">
              <img :src="currentMember?.photo" alt="">
              <div class="hero-gradient"></div>
              <div class="member-badge">{{ currentMember?.badge }}</div>
            </div>
            <div class="modal-details">
              <h2 class="detail-name">{{ currentMember?.name }}</h2>
              <p class="detail-title">{{ currentMember?.title }}</p>
              <div class="detail-divider"></div>
              <div class="modal-section">
                <h4>关于</h4>
                <p>{{ currentMember?.about }}</p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showModal = ref(false)
const selectedMember = ref(null)
const showIntro = ref(true)

onMounted(() => {
  setTimeout(() => {
    showIntro.value = false
  }, 3500)
})

const members = {
  founder: {
    name: '弗拉基米尔·亚历山德罗维奇·伊万诺夫',
    title: '创始人 & 董事长',
    badge: '创始人',
    level: 'founder',
    photo: '/team/弗拉基米尔·亚历山德罗维奇·伊万诺夫.jpg',
    about: '拥有超过25年国际金融与资产管理经验，曾任职于多家欧洲顶级投资机构。2019年创立升达数字资产集团，致力于将传统贵金属投资与现代区块链技术深度融合，打造全球领先的数字黄金生态系统。',
    skills: ['资产管理规模超10亿美元', '跨境金融专家', '区块链战略布局', '国际金融']
  },
  president: {
    name: '陈启明',
    title: '大中华亚太区总裁',
    badge: '总裁',
    level: 'president',
    photo: '/team/陈启明.jpg',
    about: '20年金融行业管理经验，曾任职于多家知名金融机构高管。精通亚太区市场运营，具备卓越的战略规划和团队领导能力。负责升达集团大中华及亚太区全面业务拓展与运营管理。',
    skills: ['区域战略规划', '业务拓展', '合作伙伴关系', '团队建设']
  },
  analyst: {
    name: '李鹏',
    title: '分析师',
    badge: '分析师',
    level: 'team',
    photo: '/team/李鹏.jpg',
    about: '8年金融数据分析经验，专注于数字资产市场研究与投资策略分析。曾任职于多家知名金融机构，具备扎实的量化分析能力和敏锐的市场洞察力。',
    skills: ['数据分析', '市场研究', '投资策略', '量化分析']
  },
  marketing: {
    name: '郭昭晏',
    title: '营销负责人',
    badge: '营销',
    level: 'team',
    photo: '/team/郭昭晏.jpg',
    about: '10年品牌营销经验，擅长数字营销策略制定与执行。曾成功策划多个百万级别的营销活动，在金融科技领域拥有丰富的市场推广经验和资源整合能力。',
    skills: ['品牌营销', '数字营销', '活动策划', '资源整合']
  },
  legal: {
    name: '周刚',
    title: '法务部负责人',
    badge: '法务',
    level: 'team',
    photo: '/team/周刚.jpg',
    about: '12年法律从业经验，专注于金融监管、合规管理和企业风险防控。持有律师执业资格，熟悉境内外金融法规，为公司业务发展提供全面的法律保障。',
    skills: ['合规管理', '风险控制', '金融法规', '企业法务']
  },
  social: {
    name: '顾凌云',
    title: '社交媒体经理',
    badge: '社媒',
    level: 'team',
    photo: '/team/顾凌云.jpg',
    about: '6年新媒体运营经验，擅长社交媒体内容策划与社群运营。精通各大社交平台运营规则，具备出色的内容创作能力和用户互动技巧。',
    skills: ['内容运营', '社群管理', '新媒体', '用户增长']
  },
  designer: {
    name: '林鑫',
    title: '设计师',
    badge: '设计',
    level: 'team',
    photo: '/team/林鑫.jpg',
    about: '7年UI/UX设计经验，专注于金融科技产品的用户体验设计。精通移动端和Web端界面设计，注重用户研究和交互细节，致力于创造简洁高效的产品体验。',
    skills: ['UI/UX设计', '视觉设计', '交互设计', '用户研究']
  }
}

const teamMembers = computed(() => {
  const { founder, president, ...rest } = members
  return rest
})

const currentMember = computed(() => {
  return selectedMember.value ? members[selectedMember.value] : null
})

const openModal = (key) => {
  selectedMember.value = key
  showModal.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  showModal.value = false
  document.body.style.overflow = ''
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
/* ===== 变量 ===== */
.team-page {
  --gold: #C8AA6E;
  --gold-light: #F0D78C;
  --gold-dark: #A08050;
  --bg-primary: #1A2233;
  --bg-secondary: #232D40;
  --bg-card: rgba(200, 170, 110, 0.08);
  --text-primary: #F8FAFC;
  --text-secondary: #B8C5D6;
  --text-muted: #8899AA;
  
  width: 100%;
  max-width: var(--page-max-width, 428px);
  min-height: 100vh;
  margin: 0 auto;
  background: linear-gradient(180deg, #1A2233 0%, #1E2840 50%, #1A2233 100%);
}

/* ===== 开场动画 ===== */
.intro-screen {
  position: fixed;
  inset: 0;
  max-width: var(--page-max-width, 428px);
  margin: 0 auto;
  background: linear-gradient(180deg, #1A2233 0%, #232D40 50%, #1A2233 100%);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.intro-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
}

.intro-glow {
  position: absolute;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(200, 170, 110, 0.3) 0%, transparent 70%);
  top: -20px;
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

.intro-avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 4px solid var(--gold);
  overflow: hidden;
  box-shadow: 0 0 40px rgba(200, 170, 110, 0.4);
  animation: avatarEnter 0.8s ease-out 0.2s both;
  position: relative;
  z-index: 1;
}

.intro-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

.intro-badge {
  margin-top: 20px;
  padding: 8px 20px;
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: var(--bg-primary);
  animation: fadeUp 0.6s ease-out 0.5s both;
}

.intro-name {
  margin: 16px 0 0;
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeUp 0.6s ease-out 0.7s both;
}

.intro-desc {
  margin: 16px 0 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  animation: fadeUp 0.6s ease-out 0.9s both;
}

.intro-tags {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  animation: fadeUp 0.6s ease-out 1.1s both;
}

.intro-tags span {
  padding: 6px 14px;
  background: rgba(200, 170, 110, 0.15);
  border: 1px solid rgba(200, 170, 110, 0.3);
  border-radius: 20px;
  font-size: 12px;
  color: var(--gold);
}

@keyframes avatarEnter {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 过渡动画 */
.intro-fade-leave-active { transition: opacity 0.8s ease; }
.intro-fade-leave-to { opacity: 0; }
.main-fade-enter-active { transition: all 0.6s ease-out 0.2s; }
.main-fade-enter-from { opacity: 0; transform: translateY(20px); }

/* ===== Header ===== */
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
  background: rgba(26, 34, 51, 0.95);
  backdrop-filter: blur(12px);
  z-index: 100;
  border-bottom: 1px solid rgba(200, 170, 110, 0.15);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.page-header.visible { opacity: 1; }

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--gold);
  cursor: pointer;
  transition: opacity 0.2s;
}

.back-btn:active { opacity: 0.7; }

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-right { width: 40px; }

/* ===== Content ===== */
.content {
  padding-top: 56px;
}

/* ===== 总裁区域 ===== */
.president-section {
  padding: 20px 16px;
}

.president-card {
  background: transparent;
  border: 1px solid rgba(200, 170, 110, 0.25);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.president-card:hover {
  border-color: rgba(200, 170, 110, 0.4);
}

.president-card:active {
  transform: scale(0.98);
}

.president-photo {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.president-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
}

.president-info {
  padding: 20px;
  margin-top: -20px;
  position: relative;
  background: transparent;
}

.info-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--gold);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.info-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 4px 0 0;
}

.info-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 4px 0 0;
}

.info-divider {
  width: 40px;
  height: 2px;
  background: var(--gold);
  margin: 16px 0;
}

.info-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}

.info-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--bg-primary);
  cursor: pointer;
  transition: opacity 0.2s;
}

.info-btn:active { opacity: 0.8; }

/* ===== 团队区域 ===== */
.team-section {
  padding: 8px 16px 24px;
}

.section-header {
  margin-bottom: 20px;
  text-align: center;
}

.section-tag {
  font-size: 10px;
  font-weight: 600;
  color: var(--gold);
  letter-spacing: 1.5px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 4px 0 0;
}

.section-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  margin: 6px 0 0;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.team-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 12px 16px;
  background: linear-gradient(165deg, rgba(200, 170, 110, 0.12) 0%, rgba(200, 170, 110, 0.04) 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 16px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: cardFadeIn 0.5s ease-out both;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.team-card:hover {
  border-color: rgba(200, 170, 110, 0.4);
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(200, 170, 110, 0.15);
}

.team-card:active {
  transform: translateY(-2px);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(200, 170, 110, 0.1) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.team-card:hover .card-glow {
  opacity: 1;
}

.card-avatar {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.card-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

.avatar-ring {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 2px solid var(--gold);
  opacity: 0.6;
  transition: all 0.3s ease;
}

.team-card:hover .avatar-ring {
  opacity: 1;
  border-width: 3px;
  inset: -4px;
}

.card-badge {
  margin-top: 10px;
  padding: 4px 12px;
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  color: var(--bg-primary);
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 10px 0 0;
  text-align: center;
}

.card-title {
  font-size: 11px;
  color: var(--text-muted);
  margin: 2px 0 0;
  text-align: center;
}

.card-skills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  margin-top: 10px;
}

.card-skills span {
  padding: 3px 8px;
  background: rgba(200, 170, 110, 0.1);
  border-radius: 6px;
  font-size: 9px;
  color: var(--gold);
  white-space: nowrap;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.card-footer .view-more {
  font-size: 11px;
}

.card-footer svg {
  transition: transform 0.2s ease;
}

.team-card:hover .card-footer {
  color: var(--gold);
}

.team-card:hover .card-footer svg {
  transform: translateX(3px);
}

/* ===== 公司介绍 ===== */
.about-section {
  padding: 0 20px 24px;
}

.about-section p {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.8;
  text-align: center;
  margin: 0;
}

.bottom-space {
  height: calc(20px + env(safe-area-inset-bottom));
}

/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 1000;
}

.modal-container {
  width: 100%;
  max-width: var(--page-max-width, 428px);
  max-height: 100vh;
  background: transparent;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
}

.modal-container.premium {
  background: transparent;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s;
}

.modal-close:hover { background: rgba(0, 0, 0, 0.7); }
.modal-close svg { width: 20px; height: 20px; }

/* 总裁模态框 */
.modal-hero {
  position: relative;
  height: 55vh;
  min-height: 320px;
}

.modal-hero.member {
  height: auto;
  max-height: 50vh;
  min-height: 280px;
}

.modal-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 60%, rgba(0, 0, 0, 0.4) 100%);
}

.member-badge {
  position: absolute;
  bottom: 80px;
  left: 24px;
  padding: 6px 20px;
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: var(--bg-primary);
  z-index: 2;
}

.modal-details {
  padding: 0 24px 40px;
  margin-top: -40px;
  position: relative;
  background: transparent;
  z-index: 2;
}

.detail-badge {
  display: inline-block;
  padding: 6px 16px;
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: var(--bg-primary);
}

.detail-name {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 12px 0 0;
}

.detail-title {
  font-size: 15px;
  color: var(--gold);
  margin: 4px 0 0;
}

.detail-divider {
  width: 50px;
  height: 2px;
  background: var(--gold);
  margin: 20px 0;
}

.detail-about {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin: 0;
}

.detail-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 0;
}

.detail-skills span {
  padding: 8px 14px;
  background: rgba(200, 170, 110, 0.1);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 8px;
  font-size: 12px;
  color: var(--gold);
}

/* modal-section 用于普通成员弹窗 */
.modal-section {
  margin-bottom: 20px;
}

.modal-section:last-child { margin-bottom: 0; }

.modal-section h4 {
  font-size: 11px;
  font-weight: 600;
  color: var(--gold);
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.modal-section p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin: 0;
}

/* Modal 过渡 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container {
  transform: translateY(30px);
}

.modal-leave-to .modal-container {
  transform: translateY(30px);
}

/* ===== 响应式 ===== */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
