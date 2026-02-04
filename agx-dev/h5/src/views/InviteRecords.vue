<template>
  <div class="records-page">
    <header class="nav-header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <span class="nav-title">邀请记录</span>
      <div class="placeholder"></div>
    </header>

    <div class="page-content">
      <!-- 统计摘要 -->
      <div class="summary-bar">
        <div class="summary-item">
          <span class="summary-num">{{ list.length }}</span>
          <span class="summary-label">总邀请</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <span class="summary-num">{{ kycCount }}</span>
          <span class="summary-label">已认证</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <span class="summary-num">{{ positionCount }}</span>
          <span class="summary-label">已建仓</span>
        </div>
      </div>

      <!-- 加载中 -->
      <div class="loading-state" v-if="loading">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- 列表 -->
      <div class="record-list" v-else-if="list.length > 0">
        <div class="record-item" v-for="item in list" :key="item.id || item.uid">
          <div class="record-avatar">
            <span>{{ getInitial(item.nickname || item.username) }}</span>
          </div>
          <div class="record-info">
            <div class="record-name">{{ item.nickname || item.username || '用户' + (item.uid || '').slice(-4) }}</div>
            <div class="record-meta">
              <span class="record-time">{{ formatTime(item.createdAt) }}</span>
              <span class="record-status" :class="getStatusClass(item)">{{ getStatusText(item) }}</span>
            </div>
          </div>
          <div class="record-reward" v-if="item.reward">
            <span>+{{ item.reward }}</span>
            <small>AGX</small>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <p>暂无邀请记录</p>
        <span>分享邀请码邀请好友加入</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../utils/api'

const loading = ref(true)
const list = ref([])

const kycCount = computed(() => list.value.filter(i => i.kycVerified || i.status >= 1).length)
const positionCount = computed(() => list.value.filter(i => i.hasPosition || i.status >= 2).length)

const getInitial = (name) => (name || 'U').charAt(0).toUpperCase()

const getStatusClass = (item) => {
  if (item.hasPosition || item.status >= 2) return 'traded'
  if (item.kycVerified || item.status >= 1) return 'verified'
  return 'pending'
}

const getStatusText = (item) => {
  if (item.hasPosition || item.status >= 2) return '已建仓'
  if (item.kycVerified || item.status >= 1) return '已认证'
  return '待认证'
}

const formatTime = (time) => {
  if (!time) return ''
  const d = new Date(time)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await api.invite.getInvites()
    if (res.success && res.data) {
      list.value = res.data.list || res.data || []
    }
  } catch (e) {
    console.error('获取邀请记录失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.records-page {
  min-height: 100vh;
  background: #0B0E11;
}

.nav-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  padding-top: env(safe-area-inset-top);
  background: linear-gradient(180deg, rgba(18, 22, 28, 0.98) 0%, rgba(14, 18, 22, 0.95) 100%);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(200, 170, 110, 0.15);
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200, 170, 110, 0.08);
  border: none;
  border-radius: 12px;
  color: #C8AA6E;
}

.back-btn svg { width: 20px; height: 20px; }

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #E6EDF3;
}

.placeholder { width: 40px; }

.page-content {
  padding-bottom: max(24px, env(safe-area-inset-bottom));
}

/* 统计栏 */
.summary-bar {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(145deg, #1A1F26 0%, #14181E 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.summary-item {
  flex: 1;
  text-align: center;
}

.summary-num {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #C8AA6E;
  font-family: 'DIN Alternate', monospace;
}

.summary-label {
  font-size: 11px;
  color: #6E7681;
  margin-top: 4px;
  display: block;
}

.summary-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.08);
}

/* 加载 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  color: #6E7681;
  gap: 12px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(200, 170, 110, 0.2);
  border-top-color: #C8AA6E;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* 列表 */
.record-list {
  padding: 0;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.record-avatar {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.15) 0%, rgba(200, 170, 110, 0.08) 100%);
  border-radius: 50%;
  font-size: 18px;
  font-weight: 600;
  color: #C8AA6E;
}

.record-info {
  flex: 1;
  min-width: 0;
}

.record-name {
  font-size: 15px;
  font-weight: 500;
  color: #E6EDF3;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.record-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-time {
  font-size: 12px;
  color: #6E7681;
}

.record-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}

.record-status.pending {
  background: rgba(139, 148, 158, 0.15);
  color: #8B949E;
}

.record-status.verified {
  background: rgba(200, 170, 110, 0.15);
  color: #C8AA6E;
}

.record-status.traded {
  background: rgba(14, 203, 129, 0.15);
  color: #0ECB81;
}

.record-reward {
  text-align: right;
}

.record-reward span {
  font-size: 16px;
  font-weight: 700;
  color: #0ECB81;
}

.record-reward small {
  display: block;
  font-size: 10px;
  color: #6E7681;
  margin-top: 2px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  color: #3D444D;
  margin-bottom: 20px;
}

.empty-state p {
  font-size: 15px;
  color: #8B949E;
  margin: 0 0 8px;
}

.empty-state span {
  font-size: 13px;
  color: #6E7681;
}
</style>
