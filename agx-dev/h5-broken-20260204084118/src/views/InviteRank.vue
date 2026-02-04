<template>
  <PageLayout title="邀请排行榜" :show-back="true">
    <div class="page-content">
      <!-- 排行榜类型切换 -->
      <div class="rank-tabs">
        <button 
          class="rank-tab" 
          :class="{ active: rankType === 'invite' }"
          @click="switchRankType('invite')">
          邀请排行
        </button>
        <button 
          class="rank-tab" 
          :class="{ active: rankType === 'profit' }"
          @click="switchRankType('profit')">
          收益排行
        </button>
      </div>

      <!-- 时间范围 -->
      <div class="time-range">
        <button 
          v-for="range in timeRanges" 
          :key="range.value"
          class="time-btn" 
          :class="{ active: timeRange === range.value }"
          @click="switchTimeRange(range.value)">
          {{ range.label }}
        </button>
      </div>

      <!-- 我的排名 -->
      <div class="my-rank-card" v-if="myRank">
        <div class="my-rank-label">我的排名</div>
        <div class="my-rank-content">
          <div class="my-rank-position">
            <span class="position-label">排名</span>
            <span class="position-value">{{ myRank.position > 999 ? '999+' : myRank.position }}</span>
          </div>
          <div class="my-rank-value">
            <span class="value-label">{{ rankType === 'invite' ? '邀请人数' : '返佣收益' }}</span>
            <span class="value-amount">{{ myRank.value }}</span>
          </div>
        </div>
      </div>

      <!-- 排行榜列表 -->
      <div class="rank-list">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        <div v-else-if="rankList.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <p>暂无排行数据</p>
        </div>
        <div v-else>
          <div 
            v-for="(item, index) in rankList" 
            :key="item.userId || index" 
            class="rank-item"
            :class="{ 'top-three': item.position <= 3 }">
            <div class="rank-position">
              <span v-if="item.position === 1" class="medal gold">1st</span>
              <span v-else-if="item.position === 2" class="medal silver">2nd</span>
              <span v-else-if="item.position === 3" class="medal bronze">3rd</span>
              <span v-else class="position-number">{{ item.position }}</span>
            </div>
            <div class="rank-user">
              <div class="user-avatar">{{ getUserInitial(item.user?.nickname || item.user?.username) }}</div>
              <div class="user-info">
                <div class="user-name-row">
                  <span class="user-name">{{ maskUsername(item.user?.nickname || item.user?.username || '用户') }}</span>
                  <span v-if="item.user?.isVerified" class="verified-badge">✓</span>
                </div>
                <div class="user-level">
                  <span class="level-badge" :style="{ background: getLevelColor(item.user?.level) }">
                    {{ getLevelName(item.user?.level) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="rank-value">
              <span class="value-amount">{{ item.value }}</span>
              <span v-if="item.changePercent" class="value-change" :class="{ positive: item.changePercent.startsWith('+') }">
                {{ item.changePercent }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../utils/api'
import PageLayout from '../components/layout/PageLayout.vue'

const loading = ref(false)
const rankType = ref('invite')
const timeRange = ref('week')
const rankList = ref([])
const myRank = ref(null)

const timeRanges = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '全部', value: 'all' }
]

const levelNames = {
  1: '普通',
  2: '银牌',
  3: '金牌',
  4: '钻石',
  5: '黑金'
}

const levelColors = {
  1: '#848E9C',
  2: '#C0C0C0',
  3: '#D4B872',
  4: '#00D1FF',
  5: '#1E1E1E'
}

const switchRankType = async (type) => {
  if (rankType.value === type) return
  rankType.value = type
  await fetchRankList()
}

const switchTimeRange = async (range) => {
  if (timeRange.value === range) return
  timeRange.value = range
  await fetchRankList()
}

const fetchRankList = async () => {
  loading.value = true
  try {
    // 获取排行榜
    const res = await api.invite.getRank({ 
      type: rankType.value, 
      range: timeRange.value,
      page: 1,
      pageSize: 50 
    })
    if (res.success && res.data?.list) {
      rankList.value = res.data.list
    } else {
      rankList.value = []
    }

    // 获取我的排名
    const myRes = await api.invite.getMyRank({ 
      type: rankType.value, 
      range: timeRange.value 
    })
    if (myRes.success && myRes.data) {
      myRank.value = myRes.data
    }
  } catch (e) {
    console.error('获取排行榜失败', e)
    rankList.value = []
  } finally {
    loading.value = false
  }
}

const getUserInitial = (name) => {
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
}

const maskUsername = (name) => {
  if (!name || name.length < 3) return '用户***'
  return `${name.slice(0, 2)}***${name.slice(-1)}`
}

const getLevelName = (level) => {
  return levelNames[level] || '普通'
}

const getLevelColor = (level) => {
  return levelColors[level] || levelColors[1]
}

onMounted(() => {
  fetchRankList()
})
</script>

<style scoped>
.page-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: max(24px, env(safe-area-inset-bottom));
}

/* 排行榜类型切换 */
.rank-tabs {
  display: flex;
  gap: 12px;
  padding: 16px 16px 0;
}

.rank-tab {
  flex: 1;
  padding: 12px 20px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-tertiary, #848e9c);
  cursor: pointer;
  transition: all 0.2s;
}

.rank-tab.active {
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), var(--color-brand-dark, #A88B4A));
  border-color: var(--color-brand, #C8AA6E);
  color: var(--bg-base, #0f1317);
  font-weight: 600;
}

/* 时间范围 */
.time-range {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
}

.time-btn {
  padding: 8px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  font-size: 13px;
  color: var(--text-tertiary, #848e9c);
  cursor: pointer;
  transition: all 0.2s;
}

.time-btn.active {
  background: rgba(201,169,98,0.15);
  border-color: rgba(201,169,98,0.3);
  color: var(--color-brand, #C8AA6E);
  font-weight: 600;
}

/* 我的排名 */
.my-rank-card {
  margin: 0 16px 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(201, 169, 98, 0.15), rgba(139, 115, 85, 0.1));
  border: 1px solid rgba(201, 169, 98, 0.2);
  border-radius: 16px;
}

.my-rank-label {
  font-size: 12px;
  color: var(--text-tertiary, #848e9c);
  margin-bottom: 12px;
}

.my-rank-content {
  display: flex;
  gap: 20px;
}

.my-rank-position, .my-rank-value {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.position-label, .value-label {
  font-size: 12px;
  color: var(--text-tertiary, #848e9c);
}

.position-value, .value-amount {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-brand, #C8AA6E);
  font-family: 'DIN Alternate', monospace;
}

/* 排行榜列表 */
.rank-list {
  padding: 0 16px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  margin-bottom: 8px;
  transition: all 0.2s;
}

.rank-item.top-three {
  background: linear-gradient(135deg, rgba(201, 169, 98, 0.1), rgba(139, 115, 85, 0.05));
  border-color: rgba(201, 169, 98, 0.15);
}

.rank-position {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.medal {
  font-size: 28px;
}

.position-number {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-tertiary, #5e6673);
}

.rank-user {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-info, #60A5FA), var(--color-info-dark, #3B82F6));
  border-radius: 50%;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-on-brand, #fff);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #eaecef);
}

.verified-badge {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-up, #0ECB81), var(--color-up-dark, #0BA968));
  border-radius: 50%;
  font-size: 10px;
  color: var(--text-on-brand, #fff);
}

.user-level {
  display: flex;
  gap: 4px;
}

.level-badge {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-on-brand, #fff);
}

.rank-value {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.rank-value .value-amount {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary, #eaecef);
  font-family: 'DIN Alternate', monospace;
}

.value-change {
  font-size: 11px;
  color: var(--color-down, #F6465D);
}

.value-change.positive {
  color: var(--color-up, #0ECB81);
}

/* 加载和空状态 */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-tertiary, #5e6673);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(201,169,98,0.2);
  border-top-color: var(--color-brand, #C8AA6E);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state svg {
  margin-bottom: 12px;
  opacity: 0.4;
}

.empty-state p, .loading-state p {
  font-size: 13px;
  margin: 0;
}
</style>
