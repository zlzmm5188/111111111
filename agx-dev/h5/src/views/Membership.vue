<template>
  <PageLayout title="升达主权会员体系" :show-back="true">
    <div class="membership-page">
      <!-- 页面介绍 -->
      <div class="intro-section">
        <div class="intro-title">🏆 升达主权会员体系</div>
        <div class="intro-desc">经验值成长 · 阶梯式权益 · 尊贵特权</div>
        <div class="intro-rules">
          <span class="rule-item">📊 1U = 1点经验值</span>
          <span class="rule-item">⚡ 自动升级</span>
          <span class="rule-item">🎁 立享奖励</span>
        </div>
      </div>

      <!-- 当前等级卡片 -->
      <div class="current-level-card" :style="{ borderColor: currentLevel.color }">
        <div class="level-badge" :style="{ background: `linear-gradient(135deg, ${currentLevel.color}40, ${currentLevel.color}20)` }">
          <span class="level-icon" :style="{ color: currentLevel.color }" v-html="getLevelIcon(currentLevel.level)"></span>
        </div>
        <div class="level-info">
          <div class="level-name" :style="{ color: currentLevel.color }">
            {{ currentLevel.name }}
          </div>
          <div class="level-name-en">{{ currentLevel.nameEn }}</div>
          <div class="level-desc">{{ getLevelDesc(currentLevel.level) }}</div>
        </div>
        <div class="level-tag" :style="{ background: currentLevel.color }">
          Lv.{{ currentLevel.level }}
        </div>
      </div>

      <!-- 升级进度 -->
      <div class="progress-section">
        <div class="progress-header">
          <span>经验值进度</span>
          <span class="progress-value">{{ totalPoints }} / {{ nextLevelPoints }} 点</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar" :style="{ width: progressPercent + '%', background: currentLevel.color }"></div>
        </div>
        <div class="progress-tip" v-if="nextLevel">
          再获得 <strong>{{ needMorePoints }} 点</strong> 经验值即可升级至 <span :style="{color: nextLevel.color}">{{ nextLevel.name }}</span>
        </div>
        <div class="progress-tip max-level" v-else>
          🎉 恭喜！您已达到最高等级
        </div>
      </div>

      <!-- 等级权益列表 - 横向滑动卡片 -->
      <div class="levels-section">
        <div class="section-title">
          <span>全部等级</span>
          <span class="section-subtitle">5阶成长体系</span>
        </div>

        <!-- 横向滑动容器 -->
        <div class="levels-scroll-container">
          <div class="levels-scroll-track">
            <div
              v-for="level in allLevels"
              :key="level.level"
              class="level-card-premium"
              :class="'theme-' + level.level"
              @click="showLevelDetail(level)"
            >
              <!-- 卡片内容层 -->
              <div class="card-inner">
                <!-- 顶部标签 -->
                <div class="card-top">
                  <span class="level-tag">Lv.{{ level.level }}</span>
                  <span v-if="level.level === currentLevel.level" class="current-badge">当前</span>
                </div>

                <!-- 中心等级图标 - 高端设计 -->
                <div class="card-icon">
                  <div v-html="getLevelIcon(level.level)"></div>
                </div>

                <!-- 底部信息 -->
                <div class="card-bottom">
                  <div class="level-name">{{ level.name }}</div>
                  <div class="level-name-en">{{ level.nameEn }}</div>
                  <div class="level-req">{{ formatPoints(level.minPoints) }} - {{ formatPoints(level.maxPoints) }}</div>
                  <div class="level-reward">+{{ level.upgradeBonus }} U</div>
                </div>
              </div>

              <!-- 立体光晕效果 -->
              <div class="card-glow"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 等级详情弹窗 -->
      <div class="modal-overlay" v-if="showDetail" @click="showDetail = false">
        <div class="modal-content glass-modal" @click.stop>
          <!-- 头部装饰线 -->
          <div class="modal-glow" :style="{ background: `linear-gradient(90deg, transparent, ${detailLevel.color}40, transparent)` }"></div>

          <div class="modal-header">
            <div class="modal-badge" :style="{ borderColor: detailLevel.color + '60' }">
              <span class="badge-icon" :style="{ color: detailLevel.color }" v-html="getLevelIcon(detailLevel.level)"></span>
            </div>
            <div class="modal-title-group">
              <div class="modal-name" :style="{ color: detailLevel.color }">{{ detailLevel.name }}</div>
              <div class="modal-name-en">{{ detailLevel.nameEn }}</div>
              <div class="modal-points">{{ formatPoints(detailLevel.minPoints) }} - {{ formatPoints(detailLevel.maxPoints) }} 经验值</div>
            </div>
            <button class="close-btn" @click="showDetail = false">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- 核心权益 -->
            <div class="benefit-card primary">
              <div class="benefit-row">
                <div class="benefit-label">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 110-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 100-5C13 2 12 7 12 7z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>进阶奖励金</span>
                </div>
                <div class="benefit-value gold">{{ detailLevel.upgradeBonus }} USDT</div>
              </div>
              <div class="benefit-row">
                <div class="benefit-label">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>矿机利率加成</span>
                </div>
                <div class="benefit-value gold">+{{ (parseFloat(detailLevel.poolRateBonus || 0) * 100).toFixed(2) }}%</div>
              </div>
            </div>

            <!-- 附加权益 -->
            <div class="benefit-list">
              <div class="benefit-item" v-if="detailLevel.freeWithdrawDays > 0">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>{{ getFreeWithdrawText(detailLevel.freeWithdrawDays) }}</span>
              </div>
              <div class="benefit-item" v-if="detailLevel.withdrawFeeFree">
                <svg viewBox="0 0 24 24" fill="none"><path d="M6 3h12l4 6-10 13L2 9l4-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>终生提现手续费全免</span>
              </div>
              <div class="benefit-item" v-if="detailLevel.withdrawPriority">
                <svg viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>提现优先到账</span>
              </div>
              <div class="benefit-item" v-if="detailLevel.contractEnabled">
                <svg viewBox="0 0 24 24" fill="none"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>合约交易权限</span>
              </div>
              <div class="benefit-item" v-if="detailLevel.newCoinPriority">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>新币抢先交易</span>
              </div>
              <div class="benefit-item" v-if="detailLevel.maxTradeEnabled">
                <svg viewBox="0 0 24 24" fill="none"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>最大交易额度</span>
              </div>
              <div class="benefit-item" v-if="detailLevel.vipSupport">
                <svg viewBox="0 0 24 24" fill="none"><path d="M2 7l4 5 6-7 6 7 4-5v11H2V7z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>VIP专属客服</span>
              </div>
              <div class="benefit-item" v-if="detailLevel.ticketPriority">
                <svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>工单优先处理</span>
              </div>
              <div class="benefit-item" v-if="detailLevel.oneToOneService">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>重大异常1V1对接</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <div class="unlock-badge unlocked" v-if="detailLevel.level <= currentLevel.level">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>已解锁</span>
            </div>
            <div class="unlock-badge locked" v-else>
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <span>需要 {{ formatPoints(detailLevel.minPoints) }} 经验值</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '../utils/api'
import PageLayout from '../components/layout/PageLayout.vue'

const { t } = useI18n()

const loading = ref(true)
const allLevels = ref([])
const userLevelInfo = ref(null)
const totalPoints = ref('0')

const showDetail = ref(false)
const detailLevel = ref({})

// 当前等级
const currentLevel = computed(() => {
  if (userLevelInfo.value) {
    const level = allLevels.value.find(l => l.level === userLevelInfo.value.level)
    return level || defaultLevel
  }
  return defaultLevel
})

const defaultLevel = {
  level: 1,
  name: '准入会员',
  nameEn: 'Access',
  color: '#8B9DC3',
  minPoints: 0,
  maxPoints: 200,
  upgradeBonus: '200',
  poolRateBonus: '0.0002'
}

// 静态等级数据 - 与后端migration一致（按充值金额）
const staticLevels = [
  {
    level: 1,
    name: '准入会员',
    nameEn: 'Access',
    color: '#8B9DC3',
    minPoints: 0,
    maxPoints: 200,
    upgradeBonus: '200',
    poolRateBonus: '0.0002',
    freeWithdrawDays: 0,
    contractEnabled: 0,
    withdrawPriority: 0,
    newCoinPriority: 0,
    maxTradeEnabled: 0,
    vipSupport: 0,
    ticketPriority: 0,
    oneToOneService: 0,
    withdrawFeeFree: 0
  },
  {
    level: 2,
    name: '优选会员',
    nameEn: 'Prime',
    color: '#4A90D9',
    minPoints: 200,
    maxPoints: 600,
    upgradeBonus: '600',
    poolRateBonus: '0.0006',
    freeWithdrawDays: 7,
    contractEnabled: 1,
    withdrawPriority: 0,
    newCoinPriority: 0,
    maxTradeEnabled: 0,
    vipSupport: 0,
    ticketPriority: 0,
    oneToOneService: 0,
    withdrawFeeFree: 0
  },
  {
    level: 3,
    name: '资本合伙人',
    nameEn: 'Capital',
    color: '#C8AA6E',
    minPoints: 600,
    maxPoints: 1500,
    upgradeBonus: '1500',
    poolRateBonus: '0.0010',
    freeWithdrawDays: 3,
    contractEnabled: 1,
    withdrawPriority: 1,
    newCoinPriority: 0,
    maxTradeEnabled: 0,
    vipSupport: 0,
    ticketPriority: 0,
    oneToOneService: 0,
    withdrawFeeFree: 0
  },
  {
    level: 4,
    name: '执行官合伙人',
    nameEn: 'Executive',
    color: '#9B59B6',
    minPoints: 1500,
    maxPoints: 5000,
    upgradeBonus: '5000',
    poolRateBonus: '0.0016',
    freeWithdrawDays: 2,
    contractEnabled: 1,
    withdrawPriority: 1,
    newCoinPriority: 1,
    maxTradeEnabled: 1,
    vipSupport: 0,
    ticketPriority: 0,
    oneToOneService: 0,
    withdrawFeeFree: 0
  },
  {
    level: 5,
    name: '主权合伙人',
    nameEn: 'Sovereign',
    color: '#C8AA6E',
    minPoints: 5000,
    maxPoints: null,
    upgradeBonus: '10000',
    poolRateBonus: '0.0022',
    freeWithdrawDays: 0,
    contractEnabled: 1,
    withdrawPriority: 1,
    newCoinPriority: 1,
    maxTradeEnabled: 1,
    vipSupport: 1,
    ticketPriority: 1,
    oneToOneService: 1,
    withdrawFeeFree: 1
  }
]

// 高端等级图标SVG（1-5级）
const getLevelIcon = (level) => {
  const icons = {
    1: `<svg viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="shieldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#A0B4C8"/>
          <stop offset="100%" stop-color="#6B7D93"/>
        </linearGradient>
      </defs>
      <path d="M40 10 L15 25 L15 55 L40 70 L65 55 L65 25 Z"
            fill="url(#shieldGrad1)"
            stroke="#C5D4E8"
            stroke-width="2"/>
      <path d="M40 20 L25 30 L25 50 L40 60 L55 50 L55 30 Z"
            fill="#8B9DC3"
            opacity="0.3"/>
      <path d="M40 30 L30 37 L30 47 L40 52 L50 47 L50 37 Z"
            fill="#8B9DC3"
            opacity="0.5"/>
    </svg>`,
    2: `<svg viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="primeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E8F4FD"/>
          <stop offset="100%" stop-color="#B8D4E8"/>
        </linearGradient>
      </defs>
      <path d="M40 15 L46 30 L62 30 L50 40 L55 55 L40 48 L25 55 L30 40 L18 30 L34 30 Z"
            fill="url(#primeGrad2)"
            stroke="#D4E9F7"
            stroke-width="2"/>
      <circle cx="40" cy="38" r="12" fill="#4A90D9" opacity="0.4"/>
      <circle cx="40" cy="38" r="6" fill="#4A90D9" opacity="0.6"/>
    </svg>`,
    3: `<svg viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="goldGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFE57F"/>
          <stop offset="50%" stop-color="#FFC107"/>
          <stop offset="100%" stop-color="#FF9800"/>
        </linearGradient>
      </defs>
      <path d="M40 12 L20 28 L28 50 L40 38 L52 50 L60 28 Z"
            fill="url(#goldGrad3)"
            stroke="#FFD54F"
            stroke-width="2"/>
      <path d="M40 20 L28 32 L34 48 L40 40 L46 48 L52 32 Z"
            fill="#B8860B"
            opacity="0.3"/>
      <circle cx="40" cy="35" r="8" fill="#FFF" opacity="0.6"/>
    </svg>`,
    4: `<svg viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="execGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#B39DDB"/>
          <stop offset="100%" stop-color="#7E57C2"/>
        </linearGradient>
        <linearGradient id="execGlow4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#D1C4E9" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#D1C4E9" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="M15 30 L15 20 L30 12 L50 12 L65 20 L65 30 L50 38 L50 55 L40 65 L30 55 L30 38 Z"
            fill="url(#execGrad4)"
            stroke="#B39DDB"
            stroke-width="2"/>
      <path d="M20 25 L35 18 L40 22 L45 18 L60 25"
            stroke="url(#execGlow4)"
            stroke-width="3"/>
      <circle cx="40" cy="40" r="10" fill="#D1C4E9" opacity="0.8"/>
      <path d="M40 35 L40 45 M35 40 L45 40" stroke="#FFF" stroke-width="2"/>
    </svg>`,
    5: `<svg viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="sovGrad5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#C8AA6E"/>
          <stop offset="50%" stop-color="#B8860B"/>
          <stop offset="100%" stop-color="#8B6914"/>
        </linearGradient>
        <radialGradient id="sovGlow5" cx="50%" cy="30%" r="50%">
          <stop offset="0%" stop-color="#FFD700" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#FFD700" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="35" fill="url(#sovGlow5)"/>
      <path d="M15 35 L15 25 L25 18 L40 15 L55 18 L65 25 L65 35 L55 42 L55 58 L40 70 L25 58 L25 42 Z"
            fill="url(#sovGrad5)"
            stroke="#C8AA6E"
            stroke-width="2.5"/>
      <path d="M25 30 L40 25 L55 30 M40 25 L40 45 M25 42 L40 52 L55 42"
            stroke="#FFD700"
            stroke-width="2"
            opacity="0.6"/>
      <circle cx="40" cy="40" r="8" fill="#FFD700"/>
      <circle cx="40" cy="40" r="4" fill="#FFF8DC"/>
    </svg>`
  }
  return icons[level] || icons[0]
}

// 下一等级
const nextLevel = computed(() => {
  const current = currentLevel.value.level
  return allLevels.value.find(l => l.level === current + 1)
})

const nextLevelPoints = computed(() => {
  return nextLevel.value ? nextLevel.value.maxPoints : currentLevel.value.maxPoints
})

const needMorePoints = computed(() => {
  if (!nextLevel.value) return '0'
  const current = parseFloat(totalPoints.value)
  const target = nextLevel.value.minPoints
  const need = target - current
  return need > 0 ? need.toLocaleString() : '0'
})

const progressPercent = computed(() => {
  if (!nextLevel.value) return 100
  const current = parseFloat(totalPoints.value)
  const target = nextLevel.value.minPoints
  const prev = currentLevel.value.minPoints
  if (target <= prev) return 100
  return Math.min(100, ((current - prev) / (target - prev)) * 100)
})

// 格式化经验值显示
const formatPoints = (points) => {
  if (points === null || points === undefined) return '∞'
  return points.toLocaleString()
}

// 等级描述文案
const getLevelDesc = (level) => {
  const descs = {
    0: '🌱 开启财富之旅，探索数字资产世界',
    1: '🛡️ 基础权益，正式开启投资之路',
    2: '⭐ 优选权益，每周免费提现1次',
    3: '💎 资本跨越，每3天免费提现',
    4: '👑 新币抢先，每2天免费提现',
    5: '🏆 终身免手续费，VIP专属服务'
  }
  return descs[level] || ''
}

// 获取免费提现文案
const getFreeWithdrawText = (days) => {
  const map = { 7: '每周免费提现1次', 3: '每3天免费提现1次', 2: '每2天免费提现1次' }
  return map[days] || '免费提现'
}

// 获取会员等级配置
const fetchLevels = async () => {
  try {
    const res = await api.account.getMemberLevels()
    if (res.code === 0 && res.data && res.data.length > 0) {
      allLevels.value = res.data
    } else {
      // 使用静态数据作为fallback
      allLevels.value = staticLevels
    }
  } catch (error) {
    console.error('获取等级配置失败:', error)
    allLevels.value = staticLevels
  }
}

// 获取用户等级信息
const fetchUserLevel = async () => {
  try {
    const res = await api.account.getMyLevel()
    if (res.code === 0 && res.data) {
      userLevelInfo.value = res.data
      // 使用totalRecharge作为经验值（1U = 1点）
      totalPoints.value = res.data.totalRecharge || '0'
    }
  } catch (error) {
    console.error('获取用户等级失败:', error)
  }
}

// 显示等级详情
const showLevelDetail = (level) => {
  detailLevel.value = level
  showDetail.value = true
}

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchLevels(), fetchUserLevel()])
  loading.value = false
})
</script>

<style scoped>
.membership-page {
  min-height: calc(100vh - 44px);
  background: var(--bg-base, #0B0E11);
  padding: 16px;
  padding-bottom: max(32px, env(safe-area-inset-bottom));
}

/* 页面介绍 */
.intro-section {
  text-align: center;
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.08) 0%, rgba(200, 170, 110, 0.03) 100%);
  border-radius: 16px;
  border: 1px solid rgba(200, 170, 110, 0.15);
}

.intro-title {
  font-size: 20px;
  font-weight: 700;
  color: #C8AA6E;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.intro-desc {
  font-size: 14px;
  color: #8B949E;
  line-height: 1.5;
  margin-bottom: 12px;
}

.intro-rules {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.rule-item {
  font-size: 12px;
  color: #C8AA6E;
  padding: 4px 10px;
  background: rgba(200, 170, 110, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(200, 170, 110, 0.2);
}

/* 当前等级卡片 */
.current-level-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 16px;
  border: 2px solid;
  position: relative;
  overflow: hidden;
}

.current-level-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
}

.level-badge {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.level-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.level-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.level-info {
  flex: 1;
}

.level-name {
  font-size: 20px;
  font-weight: 700;
}

.level-name-en {
  font-size: 13px;
  color: #848E9C;
  margin-top: 4px;
}

.level-desc {
  font-size: 11px;
  color: #8B949E;
  margin-top: 6px;
  line-height: 1.4;
}

.level-tag {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

/* 进度条区域 */
.progress-section {
  margin-top: 16px;
  padding: 16px;
  background: #1A1D21;
  border-radius: 12px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #848E9C;
  margin-bottom: 10px;
}

.progress-value {
  color: #C8AA6E;
  font-weight: 500;
}

.progress-bar-wrap {
  height: 8px;
  background: #2A2A2A;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #848E9C;
}

.progress-tip.max-level {
  color: #C8AA6E;
}

/* 等级列表 */
.levels-section {
  margin-top: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #E6E8EA;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-subtitle {
  font-size: 12px;
  color: #C8AA6E;
  font-weight: 500;
}

.section-title::before {
  content: '';
  width: 3px;
  height: 16px;
  background: linear-gradient(to bottom, #C8AA6E, #B8860B);
  border-radius: 2px;
}

.level-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px;
  background: linear-gradient(145deg, rgba(30, 35, 42, 0.9) 0%, rgba(22, 26, 32, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.level-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
}

.level-card:active {
  transform: scale(0.98);
}

.level-card.current {
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.12) 0%, rgba(30, 35, 42, 0.95) 100%);
  border: 1px solid rgba(200, 170, 110, 0.35);
  box-shadow: 
    0 4px 20px rgba(200, 170, 110, 0.15),
    inset 0 1px 0 rgba(200, 170, 110, 0.2);
}

.level-card.current::before {
  background: linear-gradient(90deg, transparent 10%, rgba(200, 170, 110, 0.5) 50%, transparent 90%);
}

.level-card.unlocked {
  border-color: rgba(255, 255, 255, 0.08);
}

.level-card.locked {
  opacity: 0.55;
  filter: grayscale(0.3);
}

.level-card.locked:hover {
  opacity: 0.7;
}

.level-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.level-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.level-icon-wrap .icon {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.level-icon-wrap .icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.check-icon {
  position: absolute;
  bottom: -3px;
  right: -3px;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border-radius: 50%;
  padding: 3px;
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.4);
}

.level-text {
  flex: 1;
  min-width: 0;
}

.level-text .name {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.level-text .name-en {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 3px;
}

.level-text .level-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  margin-top: 5px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.level-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.recharge-req {
  text-align: right;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.recharge-req .label {
  display: block;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 2px;
}

.recharge-req .value {
  font-size: 13px;
  font-weight: 600;
  color: #C8AA6E;
}

.level-card.locked .recharge-req .value {
  color: rgba(255, 255, 255, 0.5);
}

.arrow {
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.3);
}

/* ============================================
   高端会员卡片 - 3D立体玻璃风格
   ============================================ */

/* 横向滑动容器 */
.levels-scroll-container {
  margin: 0 -20px;
  padding: 20px 0 30px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.levels-scroll-container::-webkit-scrollbar {
  display: none;
}

.levels-scroll-track {
  display: flex;
  gap: 16px;
  padding: 0 20px;
  width: max-content;
}

/* 单个卡片 - 高端玻璃质感 */
.level-card-premium {
  position: relative;
  width: 180px;
  height: 240px;
  flex-shrink: 0;
  border-radius: 28px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform-style: preserve-3d;
}

.level-card-premium:active {
  transform: scale(0.96) translateY(2px);
}

/* 卡片内容层 */
.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  border-radius: 28px;
  overflow: hidden;
  z-index: 2;
}

/* 立体光晕效果 - 顶部光泽 */
.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%);
  border-radius: 28px 28px 0 0;
  pointer-events: none;
  z-index: 3;
}

/* 顶部标签区域 */
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: auto;
}

.level-tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 5px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.current-badge {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  border-radius: 12px;
  background: linear-gradient(135deg, #C8AA6E 0%, #B8860B 100%);
  color: #000;
  box-shadow: 0 4px 15px rgba(200, 170, 110, 0.4);
}

/* 中心等级图标 - 高端设计 */
.card-icon {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  min-height: 90px;
}

.card-icon :deep(svg) {
  width: 80px;
  height: 80px;
  filter: drop-shadow(0 8px 25px rgba(0, 0, 0, 0.4));
}

/* 底部信息 */
.card-bottom {
  text-align: center;
  margin-top: auto;
}

.level-card-premium .level-name {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  margin-bottom: 2px;
}

.level-card-premium .level-name-en {
  font-size: 10px;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
}

.level-req {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 6px;
  padding: 0;
}

.level-reward {
  font-size: 11px;
  font-weight: 700;
  color: #C8AA6E;
  padding: 4px 12px;
  background: rgba(200, 170, 110, 0.15);
  border: 1px solid rgba(200, 170, 110, 0.3);
  border-radius: 12px;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(200, 170, 110, 0.2);
}

.modal-points {
  font-size: 12px;
  color: #8B949E;
  margin-top: 4px;
}

/* ============================================
   5种等级主题 - 高端3D渐变
   ============================================ */

/* Lv.0 - 启蒙会员 - 清新青绿 */
.theme-0 .card-inner {
  background:
    radial-gradient(ellipse at 30% 0%, rgba(109, 213, 199, 0.35) 0%, transparent 50%),
    linear-gradient(160deg, #2D4A47 0%, #1E3634 40%, #152726 100%);
  border: 1px solid rgba(109, 213, 199, 0.2);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 8px 25px rgba(78, 205, 196, 0.15),
    inset 0 1px 0 rgba(168, 230, 207, 0.2),
    inset 0 -2px 0 rgba(0, 0, 0, 0.3);
}
.theme-0 .card-icon { color: #6DD5C7; }
.theme-0 .level-name { color: #A8E6CF; text-shadow: 0 2px 10px rgba(109, 213, 199, 0.4); }
.theme-0 .level-name-en { color: rgba(168, 230, 207, 0.6); }
.theme-0 .level-tag { background: rgba(109, 213, 199, 0.15); border-color: rgba(109, 213, 199, 0.25); color: #6DD5C7; }
.theme-0 .level-reward { background: rgba(109, 213, 199, 0.15); border-color: rgba(109, 213, 199, 0.25); color: #6DD5C7; }
.theme-0 .card-glow { background: linear-gradient(180deg, rgba(168, 230, 207, 0.15) 0%, transparent 100%); }

/* Lv.1 - 准入会员 - 深空灰 */
.theme-1 .card-inner {
  background:
    radial-gradient(ellipse at 30% 0%, rgba(120, 130, 145, 0.3) 0%, transparent 50%),
    linear-gradient(160deg, #3D4556 0%, #252A34 40%, #171B22 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 8px 25px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -2px 0 rgba(0, 0, 0, 0.3);
}
.theme-1 .card-icon { color: #8892A0; }
.theme-1 .level-name { color: #B8C0CC; }
.theme-1 .level-name-en { color: rgba(184, 192, 204, 0.5); }
.theme-1 .level-tag { background: rgba(136, 146, 160, 0.15); border-color: rgba(136, 146, 160, 0.2); }
.theme-1 .level-reward { background: rgba(136, 146, 160, 0.15); border-color: rgba(136, 146, 160, 0.2); color: #8892A0; }
.theme-1 .card-glow { background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 100%); }

/* Lv.2 - 优选层 - 银白立体 */
.theme-2 .card-inner {
  background:
    radial-gradient(ellipse at 30% 0%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
    linear-gradient(160deg, #E8EDF2 0%, #B8C5D0 30%, #8A9CAB 60%, #5C6D7E 100%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    0 20px 60px rgba(92, 109, 126, 0.4),
    0 8px 25px rgba(0, 0, 0, 0.2),
    inset 0 2px 0 rgba(255, 255, 255, 0.6),
    inset 0 -2px 0 rgba(0, 0, 0, 0.1);
}
.theme-2 .card-icon { color: #3D4A5C; }
.theme-2 .level-name { color: #1A2332; text-shadow: 0 1px 3px rgba(255,255,255,0.4); }
.theme-2 .level-name-en { color: rgba(26, 35, 50, 0.5); }
.theme-2 .level-tag { background: rgba(26, 35, 50, 0.12); color: #1A2332; border-color: rgba(26, 35, 50, 0.15); }
.theme-2 .level-reward { background: rgba(26, 35, 50, 0.12); border-color: rgba(26, 35, 50, 0.15); color: #1A2332; }
.theme-2 .card-glow { background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%); }

/* Lv.3 - 资本层 - 黄金质感 */
.theme-3 .card-inner {
  background:
    radial-gradient(ellipse at 30% 0%, rgba(255, 223, 128, 0.5) 0%, transparent 50%),
    linear-gradient(160deg, #F7DC6F 0%, #D4AC0D 25%, #B7950B 50%, #7D6608 80%, #5D4E06 100%);
  border: 1px solid rgba(255, 223, 128, 0.4);
  box-shadow:
    0 20px 60px rgba(212, 172, 13, 0.45),
    0 8px 30px rgba(183, 149, 11, 0.35),
    0 0 80px rgba(247, 220, 111, 0.15),
    inset 0 2px 0 rgba(255, 255, 255, 0.4),
    inset 0 -2px 0 rgba(93, 78, 6, 0.4);
}
.theme-3 .card-icon { color: rgba(255, 255, 255, 0.95); }
.theme-3 .level-name { color: #fff; text-shadow: 0 2px 10px rgba(93, 78, 6, 0.6); }
.theme-3 .level-name-en { color: rgba(255, 255, 255, 0.7); }
.theme-3 .level-tag { background: rgba(93, 78, 6, 0.25); border-color: rgba(255, 223, 128, 0.3); }
.theme-3 .level-reward { background: rgba(255, 223, 128, 0.2); border-color: rgba(255, 223, 128, 0.3); color: #5D4E06; }
.theme-3 .card-glow { background: linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%); }

/* Lv.4 - 执行官层 - 深空蓝紫 */
.theme-4 .card-inner {
  background:
    radial-gradient(ellipse at 30% 0%, rgba(165, 180, 252, 0.35) 0%, transparent 50%),
    linear-gradient(160deg, #8B9CF4 0%, #6366F1 25%, #4F46E5 50%, #3730A3 80%, #1E1B4B 100%);
  border: 1px solid rgba(165, 180, 252, 0.3);
  box-shadow:
    0 20px 60px rgba(99, 102, 241, 0.4),
    0 8px 30px rgba(79, 70, 229, 0.3),
    0 0 80px rgba(139, 156, 244, 0.15),
    inset 0 2px 0 rgba(255, 255, 255, 0.2),
    inset 0 -2px 0 rgba(30, 27, 75, 0.5);
}
.theme-4 .card-icon { color: rgba(199, 210, 254, 0.95); }
.theme-4 .level-name { color: #E0E7FF; text-shadow: 0 2px 10px rgba(30, 27, 75, 0.6); }
.theme-4 .level-name-en { color: rgba(224, 231, 255, 0.6); }
.theme-4 .level-tag { background: rgba(30, 27, 75, 0.3); border-color: rgba(165, 180, 252, 0.25); }
.theme-4 .level-reward { background: rgba(165, 180, 252, 0.2); border-color: rgba(165, 180, 252, 0.25); color: #7C3AED; }
.theme-4 .card-glow { background: linear-gradient(180deg, rgba(165, 180, 252, 0.15) 0%, transparent 100%); }

/* Lv.5 - 主权层 - 尊享黑金 */
.theme-5 .card-inner {
  background:
    radial-gradient(ellipse at 50% 30%, rgba(200, 170, 110, 0.25) 0%, transparent 45%),
    radial-gradient(ellipse at 80% 80%, rgba(200, 170, 110, 0.15) 0%, transparent 40%),
    linear-gradient(160deg, #2A2520 0%, #1A1815 40%, #0F0E0D 70%, #050505 100%);
  border: 1px solid rgba(200, 170, 110, 0.35);
  box-shadow:
    0 20px 70px rgba(0, 0, 0, 0.6),
    0 8px 35px rgba(200, 170, 110, 0.2),
    0 0 100px rgba(200, 170, 110, 0.1),
    inset 0 1px 0 rgba(200, 170, 110, 0.3),
    inset 0 -2px 0 rgba(0, 0, 0, 0.6);
}
.theme-5 .card-icon { color: #C8AA6E; }
.theme-5 .level-name {
  background: linear-gradient(135deg, #F0E68C 0%, #C8AA6E 40%, #B8860B 70%, #8B7500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 4px rgba(200, 170, 110, 0.4));
}
.theme-5 .level-name-en { color: rgba(200, 170, 110, 0.6); }
.theme-5 .level-tag {
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.2) 0%, rgba(200, 170, 110, 0.1) 100%);
  border: 1px solid rgba(200, 170, 110, 0.35);
  color: #C8AA6E;
}
.theme-5 .level-reward {
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.25) 0%, rgba(200, 170, 110, 0.15) 100%);
  border: 1px solid rgba(200, 170, 110, 0.4);
  color: #C8AA6E;
  box-shadow: 0 2px 12px rgba(200, 170, 110, 0.3);
}
.theme-5 .card-glow {
  background:
    radial-gradient(ellipse at 30% 0%, rgba(200, 170, 110, 0.2) 0%, transparent 50%),
    linear-gradient(180deg, rgba(200, 170, 110, 0.1) 0%, transparent 60%);
}

/* 弹窗 - Liquid Glass 设计 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.glass-modal {
  width: 100%;
  max-width: 360px;
  background: linear-gradient(145deg, rgba(30, 35, 42, 0.95) 0%, rgba(22, 26, 32, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 8px 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 24px 20px 20px;
  position: relative;
}

.modal-badge {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.badge-icon {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.modal-title-group {
  flex: 1;
}

.modal-name {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.modal-name-en {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 3px;
}

.close-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.close-btn svg {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.5);
}

.modal-body {
  padding: 0 20px 20px;
}

/* 核心权益卡片 */
.benefit-card.primary {
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.12) 0%, rgba(200, 170, 110, 0.05) 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 16px;
}

.benefit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
}

.benefit-row:first-child {
  padding-top: 0;
}

.benefit-row:last-child {
  padding-bottom: 0;
}

.benefit-row:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.benefit-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.benefit-label svg {
  width: 18px;
  height: 18px;
  color: #C8AA6E;
  flex-shrink: 0;
}

.benefit-value {
  font-size: 15px;
  font-weight: 600;
}

.benefit-value.gold {
  color: #C8AA6E;
}

/* 附加权益列表 */
.benefit-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.benefit-list .benefit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  transition: background 0.2s ease;
}

.benefit-list .benefit-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.benefit-list .benefit-item svg {
  width: 18px;
  height: 18px;
  color: #C8AA6E;
  flex-shrink: 0;
}

.benefit-list .benefit-item span {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.modal-footer {
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.25);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.unlock-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
}

.unlock-badge.unlocked {
  background: rgba(76, 175, 80, 0.15);
  color: #4CAF50;
}

.unlock-badge.unlocked svg {
  width: 18px;
  height: 18px;
}

.unlock-badge.locked {
  background: rgba(100, 100, 100, 0.15);
  color: rgba(255, 255, 255, 0.5);
}

.unlock-badge.locked svg {
  width: 18px;
  height: 18px;
}
</style>
