<template>
  <PageLayout :title="user.name" :show-back="true">
    <template #navbar-right>
      <button class="more-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
        </svg>
      </button>
    </template>

    <!-- 滚动内容 -->
    <div class="scroll-content" @scroll="handleScroll">
      <!-- 头部背景 -->
      <div class="profile-header">
        <div class="header-bg"></div>
      </div>

      <!-- 骨架屏 -->
      <template v-if="loading">
        <div class="user-card">
          <div class="sk-avatar"></div>
          <div class="sk-name"></div>
          <div class="sk-bio"></div>
        </div>
      </template>

      <template v-else>
        <!-- 用户信息卡片 -->
        <div class="user-card">
          <div class="user-avatar">
            <img v-if="user.avatar" :src="user.avatar" alt="">
            <span v-else>{{ user.name.charAt(0) }}</span>
            <div v-if="user.verified" class="verified-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
          </div>
          <div class="user-name">{{ user.name }}</div>
          <div class="user-level" v-if="user.level">Lv.{{ user.level }}</div>
          <div class="user-bio">{{ user.bio }}</div>
          
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ user.posts }}</span>
              <span class="stat-label">动态</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ user.followers }}</span>
              <span class="stat-label">粉丝</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ user.following }}</span>
              <span class="stat-label">关注</span>
            </div>
          </div>

          <div class="user-actions">
            <button 
              :class="['follow-btn', { following: user.isFollowing }]"
              @click="toggleFollow"
            >
              {{ user.isFollowing ? '已关注' : '+ 关注' }}
            </button>
            <button class="chat-btn" @click="startChat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
              </svg>
              私信
            </button>
          </div>
        </div>

        <!-- 标签页 -->
        <div class="profile-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.key"
            :class="['tab-btn', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
          <div class="tab-indicator" :style="{ transform: `translateX(${tabIndex * 100}%)` }"></div>
        </div>

        <!-- 动态列表 -->
        <div class="posts-list" v-if="activeTab === 'posts'">
          <div 
            v-for="(post, idx) in userPosts" 
            :key="post.id"
            class="post-item animate-item"
            :style="{ animationDelay: `${idx * 0.08}s` }"
            @click="$router.push(`/post/${post.id}`)"
          >
            <div class="post-content">{{ post.content }}</div>
            <div class="post-images" v-if="post.images && post.images.length">
              <img v-for="(img, i) in post.images.slice(0, 3)" :key="i" :src="img" alt="">
            </div>
            <div class="post-footer">
              <span class="post-time">{{ post.time }}</span>
              <div class="post-stats">
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> {{ post.likes }}</span>
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> {{ post.comments }}</span>
              </div>
            </div>
          </div>

          <div class="empty-state" v-if="userPosts.length === 0">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
            </div>
            <p>暂无动态</p>
          </div>
        </div>

        <!-- 喜欢列表 -->
        <div class="likes-list" v-if="activeTab === 'likes'">
          <div class="empty-state">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            </div>
            <p>暂无喜欢的内容</p>
          </div>
        </div>

        <!-- 收藏列表 -->
        <div class="favorites-list" v-if="activeTab === 'favorites'">
          <div class="empty-state">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <p>暂无收藏的内容</p>
          </div>
        </div>
      </template>

      <div class="bottom-space"></div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageLayout from '../components/layout/PageLayout.vue'
import { alert } from '../utils/alert'
import { api } from '../utils/api'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const isScrolled = ref(false)
const activeTab = ref('posts')

const tabs = [
  { key: 'posts', label: '动态' },
  { key: 'likes', label: '喜欢' },
  { key: 'favorites', label: '收藏' }
]

const tabIndex = computed(() => tabs.findIndex(t => t.key === activeTab.value))

// 用户数据 - 从API加载
const user = ref({
  id: route.params.id,
  name: '',
  avatar: '',
  level: 0,
  bio: '',
  verified: false,
  posts: 0,
  followers: '0',
  following: 0,
  isFollowing: false
})

// 用户帖子 - 从API加载
const userPosts = ref([])

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const now = new Date()
  const d = new Date(dateStr)
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return `${d.getMonth() + 1}-${d.getDate()}`
}

const loadUserProfile = async () => {
  const userId = route.params.id
  loading.value = true
  
  try {
    // 加载用户信息
    const userRes = await api.get(`/user/profile/${userId}`)
    if (userRes.success && userRes.data) {
      const u = userRes.data
      user.value = {
        id: u.id || userId,
        name: u.nickname || u.username || '用户',
        avatar: u.avatar || '',
        level: u.level || 0,
        bio: u.bio || u.signature || '',
        verified: u.verified || false,
        posts: u.postCount || 0,
        followers: u.followerCount || '0',
        following: u.followingCount || 0,
        isFollowing: u.isFollowing || false
      }
    }
    
    // 加载用户帖子
    const postsRes = await api.square.getPosts({ userId, page: 1, pageSize: 20 })
    if (postsRes.success && postsRes.data?.list) {
      userPosts.value = postsRes.data.list.map(p => ({
        id: p.id,
        content: p.content,
        images: p.images || [],
        time: formatTime(p.createdAt),
        likes: p.likeCount || 0,
        comments: p.commentCount || 0
      }))
    }
  } catch (e) {
    console.error('加载用户资料失败:', e)
  } finally {
    loading.value = false
  }
}

const toggleFollow = () => {
  user.value.isFollowing = !user.value.isFollowing
}

const startChat = () => {
  if (!user.value.isFollowing) {
    alert('请先关注后再发起私信')
    return
  }
  router.push(`/chat/${user.value.id}`)
}

const handleScroll = (e) => {
  isScrolled.value = e.target.scrollTop > 100
}

onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.user-profile-page {
  width: 100%;
  max-width: 428px;
  min-height: 100vh;
  margin: 0 auto;
  background: var(--bg-base, #0D1117);
}

/* 固定头部 */
.fixed-header {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 428px;
  z-index: 100;
  background: transparent;
  transition: background 0.3s;
}

.fixed-header.scrolled {
  background: var(--bg-elevated, #161B22);
  border-bottom: 1px solid var(--border-primary, #21262D);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
}

.back-btn, .more-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 50%;
  color: white;
}

.scrolled .back-btn,
.scrolled .more-btn {
  background: transparent;
  color: #8B949E;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #E6EDF3;
}

/* 滚动内容 */
.scroll-content {
  height: 100vh;
  overflow-y: auto;
}

/* 头部背景 */
.profile-header {
  height: 140px;
  position: relative;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(200,170,110,0.3) 0%, rgba(13,17,23,1) 100%);
}

/* 骨架屏 */
.sk-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: var(--bg-surface, #21262D);
  margin: -44px auto 16px;
  animation: shimmer 1.5s infinite;
}

.sk-name {
  width: 100px;
  height: 20px;
  background: var(--bg-surface, #21262D);
  border-radius: 6px;
  margin: 0 auto 12px;
  animation: shimmer 1.5s infinite;
}

.sk-bio {
  width: 180px;
  height: 14px;
  background: var(--bg-surface, #21262D);
  border-radius: 4px;
  margin: 0 auto;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 用户卡片 */
.user-card {
  text-align: center;
  padding: 0 16px 20px;
  margin-top: -44px;
}

.user-avatar {
  position: relative;
  width: 88px;
  height: 88px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E) 0%, var(--color-brand-dark, #8B7355) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: white;
  border: 4px solid var(--bg-base, #0D1117);
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verified-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-brand, #C8AA6E);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0D1117;
  border: 3px solid var(--bg-base, #0D1117);
}

.user-name {
  font-size: 22px;
  font-weight: 700;
  color: #E6EDF3;
  margin-bottom: 6px;
}

.user-level {
  display: inline-block;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #C8AA6E;
  background: rgba(200,170,110,0.15);
  border-radius: 10px;
  margin-bottom: 10px;
}

.user-bio {
  font-size: 13px;
  color: #8B949E;
  margin-bottom: 20px;
  line-height: 1.5;
}

.user-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 20px;
}

.stat-item { text-align: center; }

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #E6EDF3;
}

.stat-label {
  font-size: 12px;
  color: #8B949E;
}

.user-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.follow-btn {
  padding: 12px 36px;
  background: var(--color-brand, #C8AA6E);
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  color: #0D1117;
  transition: all 0.2s;
}

.follow-btn.following {
  background: var(--bg-surface, #21262D);
  color: #8B949E;
}

.chat-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: var(--bg-surface, #21262D);
  border: none;
  border-radius: 24px;
  font-size: 14px;
  color: #E6EDF3;
}

/* 标签页 */
.profile-tabs {
  position: relative;
  display: flex;
  background: var(--bg-elevated, #161B22);
  border-bottom: 1px solid var(--border-primary, #21262D);
}

.tab-btn {
  flex: 1;
  padding: 14px 0;
  background: transparent;
  border: none;
  font-size: 14px;
  color: #8B949E;
  transition: color 0.2s;
}

.tab-btn.active {
  color: #E6EDF3;
  font-weight: 600;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 33.33%;
  height: 2px;
  background: var(--color-brand, #C8AA6E);
  transition: transform 0.3s ease;
}

/* 动态列表 */
.posts-list {
  padding: 16px;
}

.post-item {
  padding: 16px;
  background: var(--bg-elevated, #161B22);
  border: 1px solid var(--border-primary, #21262D);
  border-radius: 16px;
  margin-bottom: 12px;
}

.animate-item {
  animation: fadeInUp 0.4s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.post-content {
  font-size: 14px;
  color: #C9D1D9;
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-images {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.post-images img {
  width: calc((100% - 12px) / 3);
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  background: var(--bg-surface, #21262D);
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-time {
  font-size: 12px;
  color: #8B949E;
}

.post-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #8B949E;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 14px;
  color: #8B949E;
  margin: 0;
}

.bottom-space {
  height: 40px;
}
</style>
