<template>
  <PageLayout :title="$t('airdrop.title')" :show-back="true">
    <template #navbar-right>
      <button class="header-btn" @click="showRules = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
      </button>
    </template>

    <div class="page-content">
      <!-- 未认证提示 -->
      <div v-if="!loading && kycStatus !== 2" class="kyc-warning">
        <div class="warning-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
        </div>
        <div class="warning-content">
          <span class="warning-title">请先完成实名认证</span>
          <span class="warning-desc">完成实名认证后即可参与空投活动</span>
        </div>
        <button class="kyc-btn" @click="router.push('/kyc')">去认证</button>
      </div>

      <!-- 已认证内容 -->
      <template v-if="kycStatus === 2">
      <!-- 顶部统计概览 -->
      <div class="stats-header">
        <div class="stat-box">
          <span class="stat-value">{{ formatNum(totalRewards) }}</span>
          <span class="stat-label">累计奖励 AGX</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-box">
          <span class="stat-value">{{ claimCount }}</span>
          <span class="stat-label">已领取次数</span>
        </div>
      </div>

      <!-- 筛选按钮 -->
      <div class="filter-bar">
        <button :class="['filter-btn', { active: filter === 'all' }]" @click="filter = 'all'">全部</button>
        <button :class="['filter-btn', { active: filter === 'active' }]" @click="filter = 'active'">
          <span class="dot active"></span>进行中
        </button>
        <button :class="['filter-btn', { active: filter === 'upcoming' }]" @click="filter = 'upcoming'">
          <span class="dot upcoming"></span>即将开始
        </button>
        <button :class="['filter-btn', { active: filter === 'claimed' }]" @click="filter = 'claimed'">
          <span class="dot claimed"></span>已领取
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredTimeline.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <p>暂无空投活动</p>
      </div>

      <!-- 时间轴 -->
      <div v-else class="timeline">
        <div 
          v-for="(item, idx) in filteredTimeline" 
          :key="item.id" 
          :class="['timeline-item', item.status]"
        >
          <!-- 时间轴线 -->
          <div class="timeline-line">
            <div class="line-node" :class="item.status">
              <svg v-if="item.status === 'claimed'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <svg v-else-if="item.status === 'active'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div v-if="idx < filteredTimeline.length - 1" class="line-connector"></div>
          </div>

          <!-- 内容卡片 -->
          <div class="timeline-card" @click="toggleExpand(item)">
            <!-- 卡片头部 -->
            <div class="card-top">
              <div class="card-time">{{ formatTimeLabel(item) }}</div>
              <div class="card-badge" :class="item.status">
                {{ getStatusText(item.status) }}
              </div>
            </div>

            <!-- 卡片主体 -->
            <div class="card-main">
              <div class="card-icon" :style="{ background: item.color || '#C8AA6E' }">
                <img v-if="item.logo" :src="item.logo" @error="e => e.target.style.display='none'" />
                <span v-else>{{ item.token?.charAt(0) || 'A' }}</span>
              </div>
              <div class="card-info">
                <h4>{{ item.name }}</h4>
                <div class="card-reward">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span>{{ item.reward || item.totalReward || item.amount }} AGX</span>
                </div>
              </div>
              <div class="card-arrow" :class="{ expanded: item.expanded }">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            <!-- 展开详情 - 进行中的空投显示任务 -->
            <transition name="expand">
              <div v-if="item.expanded && item.status === 'active'" class="card-detail">
                <div class="tasks-section">
                  <div class="tasks-head">
                    <span>完成任务领取奖励</span>
                    <span class="tasks-progress">{{ item.completedCount || 0 }}/{{ item.tasks?.length || 0 }}</span>
                  </div>
                  <div class="task-list">
                    <div 
                      v-for="task in (item.tasks || [])" 
                      :key="task.id" 
                      class="task-row"
                      :class="{ done: task.completed }"
                      @click.stop="!task.completed && goTask(task)"
                    >
                      <div class="task-check">
                        <svg v-if="task.completed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <span class="task-name">{{ task.name }}</span>
                      <span class="task-pts">+{{ task.reward }}</span>
                    </div>
                  </div>
                  <button 
                    class="claim-btn" 
                    :class="{ ready: item.canClaim }" 
                    :disabled="!item.canClaim"
                    @click.stop="claimAirdrop(item)"
                  >
                    {{ item.canClaim ? '立即领取' : '完成任务后领取' }}
                  </button>
                </div>
              </div>
            </transition>

            <!-- 展开详情 - 即将开始显示倒计时 -->
            <transition name="expand">
              <div v-if="item.expanded && item.status === 'upcoming'" class="card-detail">
                <div class="countdown-section">
                  <p>距离开始还有</p>
                  <div class="countdown-nums">
                    <div class="countdown-unit">
                      <span class="num">{{ getCountdownParts(item.startTime).days }}</span>
                      <span class="unit">天</span>
                    </div>
                    <span class="countdown-sep">:</span>
                    <div class="countdown-unit">
                      <span class="num">{{ getCountdownParts(item.startTime).hours }}</span>
                      <span class="unit">时</span>
                    </div>
                    <span class="countdown-sep">:</span>
                    <div class="countdown-unit">
                      <span class="num">{{ getCountdownParts(item.startTime).mins }}</span>
                      <span class="unit">分</span>
                    </div>
                  </div>
                  <button 
                    class="remind-btn" 
                    :class="{ active: item.reminded }"
                    @click.stop="toggleRemind(item)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    {{ item.reminded ? '已设置提醒' : '开始时提醒我' }}
                  </button>
                </div>
              </div>
            </transition>

            <!-- 展开详情 - 已领取显示领取详情 -->
            <transition name="expand">
              <div v-if="item.expanded && item.status === 'claimed'" class="card-detail">
                <div class="claimed-section">
                  <div class="claimed-row">
                    <span class="claimed-label">领取时间</span>
                    <span class="claimed-val">{{ item.time || item.claimTime }}</span>
                  </div>
                  <div class="claimed-row">
                    <span class="claimed-label">获得奖励</span>
                    <span class="claimed-val highlight">+{{ item.amount }} AGX</span>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <div class="bottom-space"></div>
      </template>
    </div>

    <!-- 规则弹窗 -->
    <transition name="fade">
      <div class="rules-overlay" v-if="showRules" @click="showRules = false">
        <div class="rules-sheet" @click.stop>
          <div class="sheet-handle"></div>
          <h3>{{ $t('airdrop.rules') }}</h3>
          <div class="rules-content">
            <div class="rule-item">
              <div class="rule-num">1</div>
              <div class="rule-text">{{ $t('airdrop.rule1') }}</div>
            </div>
            <div class="rule-item">
              <div class="rule-num">2</div>
              <div class="rule-text">{{ $t('airdrop.rule2') }}</div>
            </div>
            <div class="rule-item">
              <div class="rule-num">3</div>
              <div class="rule-text">{{ $t('airdrop.rule3') }}</div>
            </div>
            <div class="rule-item">
              <div class="rule-num">4</div>
              <div class="rule-text">{{ $t('airdrop.rule4') }}</div>
            </div>
          </div>
          <button class="rules-close" @click="showRules = false">{{ $t('airdrop.gotIt') }}</button>
        </div>
      </div>
    </transition>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../utils/api'
import PageLayout from '../components/layout/PageLayout.vue'
import { alert, showSuccess, showError } from '../utils/alert'

const { t } = useI18n()
const router = useRouter()

// 状态
const showRules = ref(false)
const loading = ref(true)
const filter = ref('all')
const kycStatus = ref(0) // 0-未认证 1-审核中 2-已通过

// 统计数据
const totalRewards = ref(0)
const claimCount = ref(0)

// 空投数据 - 从API加载
const activeAirdrops = ref([])
const upcomingAirdrops = ref([])
const claimHistory = ref([])

// 合并所有数据为时间轴
const allTimeline = computed(() => {
  const items = []
  
  // 进行中的空投
  activeAirdrops.value.forEach(item => {
    items.push({ ...item, status: 'active', sortTime: item.endTime || Date.now() + 86400000 })
  })
  
  // 即将开始的空投
  upcomingAirdrops.value.forEach(item => {
    items.push({ ...item, status: 'upcoming', sortTime: item.startTimeMs || Date.now() + 172800000 })
  })
  
  // 已领取的空投
  claimHistory.value.forEach(item => {
    items.push({ ...item, status: 'claimed', sortTime: item.claimTimeMs || 0 })
  })
  
  // 按时间排序（进行中优先，然后即将开始，最后已领取）
  return items.sort((a, b) => {
    const statusOrder = { active: 0, upcoming: 1, claimed: 2 }
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status]
    }
    return a.sortTime - b.sortTime
  })
})

// 根据筛选条件过滤
const filteredTimeline = computed(() => {
  if (filter.value === 'all') return allTimeline.value
  return allTimeline.value.filter(item => item.status === filter.value)
})

// 方法
const formatNum = (num) => {
  if (!num) return '0'
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getStatusText = (status) => {
  const map = { active: '进行中', upcoming: '即将开始', claimed: '已领取' }
  return map[status] || status
}

const formatTimeLabel = (item) => {
  if (item.status === 'active') {
    return item.endTime ? `结束于 ${formatCountdown(item.endTime)}` : '进行中'
  } else if (item.status === 'upcoming') {
    return item.startTime || '即将开始'
  } else {
    return item.time || item.claimTime || '已领取'
  }
}

const formatCountdown = (endTime) => {
  const diff = endTime - Date.now()
  if (diff <= 0) return '已结束'
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  return `${days}天${hours}小时`
}

const getCountdownParts = (startTime) => {
  const diff = (startTime instanceof Date ? startTime.getTime() : startTime) - Date.now()
  if (diff <= 0) return { days: '00', hours: '00', mins: '00' }
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    mins: String(mins).padStart(2, '0')
  }
}

const toggleExpand = (item) => {
  item.expanded = !item.expanded
}

const goTask = (task) => {
  // 跳转到任务
}

const claimAirdrop = async (airdrop) => {
  if (!airdrop.canClaim) return

  try {
    const result = await api.airdrop.claim(airdrop.id)
    if (!result.success) {
      throw new Error(result.message || '领取失败')
    }
    await showSuccess(`领取成功！获得 ${airdrop.totalReward}`)
    loadData()
  } catch (e) {
    console.error('空投领取失败:', e)
    await showError(e.message || '领取失败，请重试')
  }
}

const toggleRemind = (item) => {
  item.reminded = !item.reminded
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 先检查KYC状态
    const kycRes = await api.account.getKycStatus()
    if (kycRes.success && kycRes.data) {
      kycStatus.value = kycRes.data.kycStatus || 0
    }
    
    // 只有通过KYC才加载空投数据
    if (kycStatus.value === 2) {
      const res = await api.airdrop.getList()
      if (res.success && res.data) {
        if (res.data.active) activeAirdrops.value = res.data.active
        if (res.data.upcoming) upcomingAirdrops.value = res.data.upcoming
        if (res.data.history) claimHistory.value = res.data.history
        if (res.data.stats) {
          totalRewards.value = res.data.stats.totalRewards || 0
          claimCount.value = res.data.stats.claimCount || 0
        }
      }
    }
  } catch (e) {
    console.error('加载空投数据失败:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 页面内容 */
.page-content { padding: 64px 16px 0; }

/* KYC警告 */
.kyc-warning {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 20px;
  margin: 20px 0;
  background: linear-gradient(145deg, rgba(30,38,50,0.9), rgba(22,27,34,0.85));
  border: 1px solid rgba(200,170,110,0.2);
  border-radius: 16px;
}
.kyc-warning .warning-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200,170,110,0.15);
  border-radius: 50%;
  margin-bottom: 16px;
}
.kyc-warning .warning-icon svg { width: 32px; height: 32px; color: #C8AA6E; }
.kyc-warning .warning-title { display: block; font-size: 16px; font-weight: 600; color: #E6EDF3; margin-bottom: 8px; }
.kyc-warning .warning-desc { display: block; font-size: 13px; color: #8B949E; margin-bottom: 20px; }
.kyc-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #C8AA6E, #A08050);
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #0D1117;
}

/* 顶部统计 */
.stats-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  background: linear-gradient(145deg, rgba(200,170,110,0.12), rgba(200,170,110,0.04));
  border: 1px solid rgba(200,170,110,0.2);
  border-radius: 16px;
  padding: 20px 16px;
  margin-bottom: 16px;
}
.stat-box { flex: 1; text-align: center; }
.stat-value { display: block; font-size: 24px; font-weight: 700; color: var(--color-brand, #C8AA6E); }
.stat-label { font-size: 12px; color: var(--text-quaternary, #6B7280); margin-top: 4px; }
.stat-divider { width: 1px; height: 36px; background: rgba(200,170,110,0.2); margin: 0 16px; }

/* 筛选栏 */
.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary, #8B949E);
  white-space: nowrap;
  transition: all 0.2s;
}
.filter-btn.active {
  background: rgba(200,170,110,0.15);
  border-color: rgba(200,170,110,0.3);
  color: var(--color-brand, #C8AA6E);
}
.filter-btn .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.filter-btn .dot.active { background: var(--color-up, #0ECB81); }
.filter-btn .dot.upcoming { background: #6366F1; }
.filter-btn .dot.claimed { background: var(--text-quaternary, #6B7280); }

/* 加载和空状态 */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}
.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(200,170,110,0.2);
  border-top-color: var(--color-brand, #C8AA6E);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state p, .empty-state p { font-size: 14px; color: var(--text-quaternary, #6B7280); }
.empty-state svg { width: 48px; height: 48px; color: var(--text-muted, #3B4048); margin-bottom: 16px; }

/* 时间轴 */
.timeline { position: relative; padding-left: 0; }

.timeline-item {
  display: flex;
  gap: 16px;
  margin-bottom: 0;
}

/* 时间轴线 */
.timeline-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 32px;
}
.line-node {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--bg-surface, #161B22);
  border: 2px solid var(--text-muted, #3B4048);
  z-index: 1;
}
.line-node svg { width: 14px; height: 14px; color: var(--text-quaternary, #6B7280); }
.line-node.active {
  background: rgba(14,203,129,0.15);
  border-color: var(--color-up, #0ECB81);
}
.line-node.active svg { color: var(--color-up, #0ECB81); }
.line-node.upcoming {
  background: rgba(99,102,241,0.15);
  border-color: #6366F1;
}
.line-node.upcoming svg { color: #6366F1; }
.line-node.claimed {
  background: rgba(200,170,110,0.15);
  border-color: var(--color-brand, #C8AA6E);
}
.line-node.claimed svg { color: var(--color-brand, #C8AA6E); }

.line-connector {
  width: 2px;
  flex: 1;
  min-height: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
}

/* 时间轴卡片 */
.timeline-card {
  flex: 1;
  background: linear-gradient(145deg, rgba(30,38,50,0.9), rgba(22,27,34,0.85));
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s;
}
.timeline-card:active { transform: scale(0.98); }

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.card-time { font-size: 12px; color: var(--text-quaternary, #6B7280); }
.card-badge {
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}
.card-badge.active {
  background: rgba(14,203,129,0.15);
  color: var(--color-up, #0ECB81);
}
.card-badge.upcoming {
  background: rgba(99,102,241,0.15);
  color: #6366F1;
}
.card-badge.claimed {
  background: rgba(200,170,110,0.12);
  color: var(--color-brand, #C8AA6E);
}

.card-main {
  display: flex;
  align-items: center;
  gap: 12px;
}
.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.card-icon img { width: 100%; height: 100%; object-fit: cover; }
.card-icon span { font-size: 18px; font-weight: 800; color: #fff; }

.card-info { flex: 1; min-width: 0; }
.card-info h4 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary, #E6EDF3);
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-reward {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-brand, #C8AA6E);
}
.card-reward svg { width: 14px; height: 14px; }

.card-arrow {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}
.card-arrow svg { width: 18px; height: 18px; color: var(--text-muted, #3B4048); }
.card-arrow.expanded { transform: rotate(180deg); }

/* 展开动画 */
.expand-enter-active, .expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to, .expand-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* 卡片详情 */
.card-detail {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

/* 任务区块 */
.tasks-section {}
.tasks-head {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary, #8B949E);
  margin-bottom: 12px;
}
.tasks-progress { color: var(--color-brand, #C8AA6E); font-weight: 600; }

.task-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.task-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
  transition: background 0.2s;
}
.task-row:active { background: rgba(0,0,0,0.3); }
.task-row.done { opacity: 0.6; }
.task-check {
  width: 20px;
  height: 20px;
  border: 2px solid var(--text-muted, #3B4048);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.task-row.done .task-check {
  background: var(--color-up, #0ECB81);
  border-color: var(--color-up, #0ECB81);
}
.task-check svg { width: 12px; height: 12px; color: #fff; }
.task-name { flex: 1; font-size: 13px; color: var(--text-primary, #E6EDF3); }
.task-pts { font-size: 12px; font-weight: 700; color: var(--color-brand, #C8AA6E); }

.claim-btn {
  width: 100%;
  height: 44px;
  background: var(--layer-surface-2, #21262D);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-quaternary, #6B7280);
  cursor: not-allowed;
}
.claim-btn.ready {
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), #A08050);
  color: #fff;
  cursor: pointer;
}

/* 倒计时区块 */
.countdown-section { text-align: center; }
.countdown-section p { font-size: 13px; color: var(--text-secondary, #8B949E); margin-bottom: 12px; }
.countdown-nums { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px; }
.countdown-unit { display: flex; flex-direction: column; align-items: center; }
.countdown-unit .num {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99,102,241,0.15);
  border-radius: 10px;
  font-size: 20px;
  font-weight: 700;
  color: #6366F1;
}
.countdown-unit .unit { font-size: 11px; color: var(--text-quaternary, #6B7280); margin-top: 4px; }
.countdown-sep { font-size: 20px; font-weight: 700; color: var(--text-muted, #3B4048); }

.remind-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: rgba(99,102,241,0.12);
  border: 1px solid rgba(99,102,241,0.25);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #6366F1;
}
.remind-btn svg { width: 16px; height: 16px; }
.remind-btn.active {
  background: rgba(200,170,110,0.15);
  border-color: rgba(200,170,110,0.3);
  color: var(--color-brand, #C8AA6E);
}

/* 已领取详情 */
.claimed-section {}
.claimed-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}
.claimed-row:not(:last-child) { border-bottom: 1px solid rgba(255,255,255,0.05); }
.claimed-label { font-size: 13px; color: var(--text-quaternary, #6B7280); }
.claimed-val { font-size: 13px; color: var(--text-primary, #E6EDF3); }
.claimed-val.highlight { color: var(--color-up, #0ECB81); font-weight: 600; }

/* 底部间距 */
.bottom-space { height: calc(80px + env(safe-area-inset-bottom)); }

/* 头部按钮 */
.header-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-secondary, #8B949E);
}
.header-btn svg { width: 22px; height: 22px; }

/* 规则弹窗 */
.rules-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 500;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.rules-sheet {
  width: 100%;
  max-width: 428px;
  background: linear-gradient(180deg, var(--bg-elevated-alt, #1E2530) 0%, var(--bg-surface-dark, #151A23) 100%);
  border-radius: 24px 24px 0 0;
  padding: 12px 20px calc(24px + env(safe-area-inset-bottom));
}
.sheet-handle { width: 40px; height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px; margin: 0 auto 20px; }
.rules-sheet h3 { font-size: 18px; font-weight: 700; color: var(--text-primary, #E6EDF3); text-align: center; margin-bottom: 20px; }
.rules-content { margin-bottom: 24px; }
.rule-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.rule-item:last-child { border-bottom: none; }
.rule-num { width: 24px; height: 24px; background: rgba(200,170,110,0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--color-brand, #C8AA6E); flex-shrink: 0; }
.rule-text { font-size: 14px; color: var(--text-secondary, #8B949E); line-height: 1.5; }
.rules-close { width: 100%; height: 48px; background: linear-gradient(135deg, var(--color-brand, #C8AA6E), #A08050); border: none; border-radius: 12px; font-size: 15px; font-weight: 700; color: #fff; cursor: pointer; }
</style>
