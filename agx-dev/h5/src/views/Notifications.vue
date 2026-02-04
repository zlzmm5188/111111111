<template>
  <PageLayout title="消息中心" :show-back="true">
    <template #navbar-right>
      <button v-if="unreadCount > 0" class="mark-all-btn" @click="markAllRead">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </button>
    </template>

    <div class="page-content">
    <!-- Tab -->
    <div class="tabs">
      <button 
        v-for="t in tabs" 
        :key="t.key"
        :class="['tab', { on: activeTab === t.key }]"
        @click="activeTab = t.key"
      >
        {{ t.label }}
        <i v-if="getCount(t.key) > 0" class="num">{{ getCount(t.key) }}</i>
      </button>
    </div>

    <!-- 内容 -->
    <div class="body">
      <!-- 统计 -->
      <div class="stats">
        <div class="s"><b>{{ unreadCount }}</b><em>未读</em></div>
        <i></i>
        <div class="s"><b>{{ notifications.length }}</b><em>全部</em></div>
        <i></i>
        <div class="s"><b>{{ todayCount }}</b><em>今日</em></div>
      </div>

      <!-- 列表 -->
      <div v-if="loading" class="load"><span></span></div>
      <div v-else class="list">
        <div 
          v-for="n in filtered" 
          :key="n.id"
          :class="['card', { new: !n.read }]"
          @click="n.read = true"
        >
          <div class="icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </div>
          <div class="info">
            <p class="tit">{{ n.title }}<i v-if="!n.read"></i></p>
            <p class="txt">{{ n.content }}</p>
            <span class="time">{{ n.time }}</span>
          </div>
        </div>
        <div v-if="filtered.length === 0" class="empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" opacity="0.2">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
          <span>暂无消息</span>
        </div>
      </div>
    </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../utils/api'
import PageLayout from '../components/layout/PageLayout.vue'

const activeTab = ref('all')
const loading = ref(true)
const notifications = ref([])
const tabs = [
  { key: 'all', label: '全部' },
  { key: 'system', label: '系统' },
  { key: 'trade', label: '交易' },
  { key: 'asset', label: '资产' }
]

const filtered = computed(() => {
  if (activeTab.value === 'all') return notifications.value
  if (activeTab.value === 'system') return notifications.value.filter(n => ['system','notice','announcement'].includes(n.type))
  return notifications.value.filter(n => n.type === activeTab.value)
})

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
const todayCount = computed(() => {
  const t = new Date().toDateString()
  return notifications.value.filter(n => new Date(n.createdAt||Date.now()).toDateString() === t).length
})

const getCount = k => {
  if (k === 'all') return unreadCount.value
  if (k === 'system') return notifications.value.filter(n => !n.read && ['system','notice','announcement'].includes(n.type)).length
  return notifications.value.filter(n => !n.read && n.type === k).length
}

const fmtTime = d => {
  if (!d) return '刚刚'
  const df = Date.now() - new Date(d)
  if (df < 60000) return '刚刚'
  if (df < 3600000) return `${Math.floor(df/60000)}分钟前`
  if (df < 86400000) return `${Math.floor(df/3600000)}小时前`
  return `${new Date(d).getMonth()+1}月${new Date(d).getDate()}日`
}

const load = async () => {
  loading.value = true
  try {
    const r = await api.account.getNotices()
    if (r.success && r.data) {
      const ls = Array.isArray(r.data) ? r.data : r.data.list || []
      notifications.value = ls.map((n,i) => ({
        id: n.id || i,
        type: ['notice','announcement','popup'].includes(n.type) ? 'system' : (n.type||'system'),
        title: n.title || '系统通知',
        content: n.content || '',
        time: fmtTime(n.createdAt),
        createdAt: n.createdAt,
        read: n.read || n.isRead || false
      }))
    }
  } catch(e) { console.error(e) }
  finally { loading.value = false }
}

const markAllRead = () => notifications.value.forEach(n => n.read = true)
onMounted(load)
</script>

<style scoped>
.page-content {
  min-height: calc(100vh - 44px);
  background: linear-gradient(180deg, var(--bg-base, #0B0E11) 0%, var(--bg-elevated, #181A20) 100%);
  padding-bottom: max(24px, env(safe-area-inset-bottom));
}

.mark-all-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(240,185,11,0.1);
  border: none;
  border-radius: 8px;
  color: #C8AA6E;
}

.tabs {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  background: var(--bg-elevated, #181A20);
}
.tab {
  display: flex; align-items: center; gap: 5px;
  padding: 8px 16px;
  background: var(--bg-surface, #2B3139); border: 1px solid var(--border-secondary, #30363D); border-radius: 8px;
  font-size: 13px; color: #8B949E;
}
.tab.on {
  background: rgba(240,185,11,0.12); border-color: rgba(240,185,11,0.35); color: #C8AA6E;
}
.tab .num {
  min-width: 16px; height: 16px; padding: 0 4px;
  background: var(--color-error, #F85149); border-radius: 8px;
  font-size: 10px; font-style: normal; font-weight: 600; color: #fff;
  display: flex; align-items: center; justify-content: center;
}

.body {
  padding: 12px 16px;
}

.stats {
  display: flex; align-items: center;
  padding: 14px;
  background: var(--bg-elevated, #181A20); border: 1px solid rgba(240,185,11,0.15); border-radius: 12px;
  margin-bottom: 12px;
}
.stats .s { flex: 1; text-align: center; }
.stats b { display: block; font-size: 22px; font-weight: 700; color: #E6EDF3; }
.stats em { font-size: 11px; font-style: normal; color: #8B949E; }
.stats i { width: 1px; height: 24px; background: rgba(240,185,11,0.2); }

.load { padding: 40px; text-align: center; }
.load span {
  display: inline-block; width: 24px; height: 24px;
  border: 3px solid #2B3139; border-top-color: #C8AA6E; border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.list { display: flex; flex-direction: column; gap: 8px; }

.card {
  display: flex; gap: 10px;
  padding: 12px;
  background: var(--bg-elevated, #181A20); border: 1px solid var(--border-primary, #2B3139); border-radius: 10px;
}
.card.new { border-color: rgba(240,185,11,0.2); background: linear-gradient(135deg, rgba(240,185,11,0.04), #181A20); }

.card .icon {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(240,185,11,0.1); border-radius: 8px; color: #C8AA6E;
  flex-shrink: 0;
}

.card .info { flex: 1; min-width: 0; }
.card .tit {
  display: flex; align-items: center; gap: 5px;
  font-size: 14px; font-weight: 600; color: #E6EDF3; margin: 0 0 3px;
}
.card .tit i { width: 6px; height: 6px; background: var(--color-brand-yellow, #C8AA6E); border-radius: 50%; }
.card .txt {
  font-size: 12px; color: #8B949E; line-height: 1.4; margin: 0 0 5px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.card .time { font-size: 11px; color: #484F58; }

.empty {
  display: flex; flex-direction: column; align-items: center;
  padding: 50px 20px; color: #484F58; gap: 8px;
}
.empty span { font-size: 13px; }
</style>
