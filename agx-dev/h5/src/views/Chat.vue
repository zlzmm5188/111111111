<template>
  <PageLayout title="消息" :show-back="true">
    <template #navbar-right>
      <button class="header-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
      </button>
    </template>

    <div class="page-content">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input type="text" v-model="searchQuery" placeholder="搜索好友">
      </div>

      <!-- 消息分类 -->
      <div class="chat-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span v-if="tab.count" class="tab-badge">{{ tab.count }}</span>
        </button>
      </div>

      <!-- 好友/消息列表 -->
      <div class="chat-list">
        <router-link 
          v-for="chat in filteredChats" 
          :key="chat.id"
          :to="`/chat/${chat.id}`"
          class="chat-item"
        >
          <div class="chat-avatar" :class="{ online: chat.online }">
            <span>{{ chat.name.charAt(0) }}</span>
            <span v-if="chat.online" class="online-dot"></span>
          </div>
          <div class="chat-info">
            <div class="chat-header">
              <span class="chat-name">{{ chat.name }}</span>
              <span class="chat-time">{{ chat.time }}</span>
            </div>
            <div class="chat-preview">
              <span class="chat-msg">{{ chat.lastMsg }}</span>
              <span v-if="chat.unread" class="unread-badge">{{ chat.unread }}</span>
            </div>
          </div>
        </router-link>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredChats.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
        </svg>
        <p>暂无消息</p>
        <span>关注好友后可以开始聊天</span>
      </div>

      <!-- 新好友请求 -->
      <div v-if="friendRequests.length > 0 && activeTab === 'all'" class="friend-requests">
        <div class="section-title">好友请求</div>
        <div v-for="req in friendRequests" :key="req.id" class="request-item">
          <div class="req-avatar">{{ req.name.charAt(0) }}</div>
          <div class="req-info">
            <span class="req-name">{{ req.name }}</span>
            <span class="req-msg">{{ req.message || '请求添加你为好友' }}</span>
          </div>
          <div class="req-actions">
            <button class="accept-btn" @click="acceptRequest(req)">接受</button>
            <button class="reject-btn" @click="rejectRequest(req)">拒绝</button>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PageLayout from '../components/layout/PageLayout.vue'
import { api } from '../utils/api'

const searchQuery = ref('')
const activeTab = ref('all')
const chats = ref([])
const friendRequests = ref([])
const loading = ref(false)

const tabs = [
  { key: 'all', label: '全部', count: 0 },
  { key: 'unread', label: '未读', count: 0 },
  { key: 'groups', label: '群聊', count: 0 }
]

// 加载会话列表
const loadConversations = async () => {
  loading.value = true
  try {
    const response = await api.social.getConversations({ page: 1, limit: 50 })
    if (response.success) {
      chats.value = (response.data.list || []).map(conv => ({
        id: conv.id,
        name: conv.otherUser?.nickname || '用户',
        avatar: conv.otherUser?.avatar,
        lastMsg: conv.lastMessage || '',
        time: formatTime(conv.lastMessageAt),
        unread: conv.unread || 0,
        online: false,
        userId: conv.otherUser?.id
      }))
      
      // 更新未读数
      const unreadCount = chats.value.reduce((sum, c) => sum + c.unread, 0)
      tabs[1].count = unreadCount
      tabs[0].count = chats.value.length
    }
  } catch (error) {
    console.error('加载会话列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = (now - date) / 1000 / 60 // 分钟
  
  if (diff < 60) return Math.floor(diff) + '分钟前'
  if (diff < 60 * 24) return Math.floor(diff / 60) + '小时前'
  if (diff < 60 * 24 * 7) return Math.floor(diff / 60 / 24) + '天前'
  return date.toLocaleDateString()
}

const filteredChats = computed(() => {
  let result = chats.value
  if (searchQuery.value) {
    result = result.filter(c => c.name.includes(searchQuery.value))
  }
  if (activeTab.value === 'unread') {
    result = result.filter(c => c.unread > 0)
  }
  return result
})

const acceptRequest = async (req) => {
  try {
    const response = await api.social.handleFriendRequest(req.id, true)
    if (response.success) {
      friendRequests.value = friendRequests.value.filter(r => r.id !== req.id)
      loadConversations()
    }
  } catch (error) {
    console.error('接受好友请求失败:', error)
  }
}

const rejectRequest = async (req) => {
  try {
    const response = await api.social.handleFriendRequest(req.id, false)
    if (response.success) {
      friendRequests.value = friendRequests.value.filter(r => r.id !== req.id)
    }
  } catch (error) {
    console.error('拒绝好友请求失败:', error)
  }
}

onMounted(() => {
  loadConversations()
})
</script>

<style scoped>

.header-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #848e9c;
  background: transparent;
  border: none;
  border-radius: 10px;
}

.page-content {
  min-height: calc(100vh - 44px);
  background: linear-gradient(180deg, var(--bg-elevated, #181a20) 0%, var(--bg-surface-alt, #131518) 50%, var(--bg-base, #0c0e12) 100%);
  padding-bottom: max(24px, env(safe-area-inset-bottom));
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 16px;
  padding: 12px 14px;
  background: var(--bg-elevated-alt, #1e2329);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.06);
}

.search-bar svg { color: #5e6673; flex-shrink: 0; }

.search-bar input {
  flex: 1;
  background: none;
  border: none;
  color: #eaecef;
  font-size: 14px;
  outline: none;
}

.search-bar input::placeholder { color: #5e6673; }

.chat-tabs {
  display: flex;
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 12px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-elevated-alt, #1e2329);
  border-radius: 20px;
  font-size: 13px;
  color: #848e9c;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: linear-gradient(135deg, rgba(201,169,98,0.2), rgba(201,169,98,0.1));
  color: #C8AA6E;
  border: 1px solid rgba(201,169,98,0.3);
}

.tab-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--color-down, #F6465D);
  border-radius: 9px;
  font-size: 10px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-list { padding: 0 16px; }

.chat-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: var(--bg-elevated-alt, #1e2329);
  border-radius: 14px;
  margin-bottom: 10px;
  text-decoration: none;
  transition: all 0.15s;
}

.chat-item:active { transform: scale(0.99); background: var(--bg-surface-hover, #242930); }

.chat-avatar {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), var(--color-brand-dark, #8B7355));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: var(--color-up, #0ECB81);
  border: 2px solid var(--bg-elevated-alt, #1e2329);
  border-radius: 50%;
}

.chat-info { flex: 1; min-width: 0; }

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.chat-name {
  font-size: 15px;
  font-weight: 500;
  color: #eaecef;
}

.chat-time {
  font-size: 12px;
  color: #5e6673;
}

.chat-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-msg {
  font-size: 13px;
  color: #848e9c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.unread-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--color-down, #F6465D);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 16px;
  color: #5e6673;
}

.empty-state svg { margin-bottom: 16px; opacity: 0.4; }
.empty-state p { font-size: 16px; color: #848e9c; margin-bottom: 8px; }
.empty-state span { font-size: 13px; }

.friend-requests {
  padding: 16px;
  margin-top: 8px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #848e9c;
  margin-bottom: 12px;
}

.request-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--bg-elevated-alt, #1e2329);
  border-radius: 12px;
  margin-bottom: 10px;
}

.req-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-info-light, #60A5FA), var(--color-info, #3B82F6));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.req-info { flex: 1; }
.req-name { display: block; font-size: 14px; color: #eaecef; margin-bottom: 4px; }
.req-msg { font-size: 12px; color: #5e6673; }

.req-actions { display: flex; gap: 8px; }

.accept-btn {
  padding: 6px 14px;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), var(--color-brand-alt, #A88B4A));
  border: none;
  border-radius: 16px;
  font-size: 12px;
  color: #0f1317;
  font-weight: 500;
  cursor: pointer;
}

.reject-btn {
  padding: 6px 14px;
  background: var(--bg-surface, #2B3139);
  border: none;
  border-radius: 16px;
  font-size: 12px;
  color: #848e9c;
  cursor: pointer;
}
</style>
