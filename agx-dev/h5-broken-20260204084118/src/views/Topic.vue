<template>
  <PageLayout :title="'#' + topicInfo.name" :show-back="true">
    <template #navbar-right>
      <button class="share-btn" @click="shareTopic">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
      </button>
    </template>

    <!-- 滚动内容 -->
    <div class="scroll-content">
      <!-- 骨架屏 -->
      <template v-if="loading">
        <div class="topic-header-skeleton">
          <div class="sk-title"></div>
          <div class="sk-stats"></div>
        </div>
        <div class="skeleton-post" v-for="i in 3" :key="i">
          <div class="sk-header">
            <div class="sk-avatar"></div>
            <div class="sk-info">
              <div class="sk-name"></div>
              <div class="sk-time"></div>
            </div>
          </div>
          <div class="sk-content"></div>
          <div class="sk-content short"></div>
        </div>
      </template>

      <template v-else>
        <!-- 话题信息卡片 -->
        <div class="topic-info-card">
          <div class="topic-main">
            <span class="topic-tag">#{{ topicInfo.name }}</span>
            <p class="topic-desc">{{ topicInfo.desc }}</p>
          </div>
          <div class="topic-stats">
            <div class="stat-item">
              <span class="stat-value">{{ topicInfo.postCount }}</span>
              <span class="stat-label">讨论</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ topicInfo.viewCount }}</span>
              <span class="stat-label">浏览</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ topicInfo.followCount }}</span>
              <span class="stat-label">关注</span>
            </div>
          </div>
          <button class="follow-btn" :class="{ followed: topicInfo.isFollowed }" @click="toggleFollow">
            {{ topicInfo.isFollowed ? '已关注' : '+ 关注话题' }}
          </button>
        </div>

        <!-- 排序筛选 -->
        <div class="sort-bar">
          <button 
            v-for="sort in sortOptions" 
            :key="sort.key"
            :class="{ active: currentSort === sort.key }"
            @click="currentSort = sort.key"
          >{{ sort.name }}</button>
        </div>

        <!-- 帖子列表 -->
        <div class="post-list">
          <div 
            class="post-card animate-item" 
            v-for="(post, idx) in posts" 
            :key="post.id"
            :style="{ animationDelay: `${idx * 0.08}s` }"
            @click="goPostDetail(post)"
          >
            <div class="post-header">
              <div class="user-info" @click.stop="goUser(post.user)">
                <img :src="post.user.avatar" class="user-avatar" alt="">
                <div class="user-meta">
                  <span class="user-name">{{ post.user.name }}</span>
                  <span class="user-level" v-if="post.user.level">Lv.{{ post.user.level }}</span>
                </div>
              </div>
              <span class="post-time">{{ post.time }}</span>
            </div>

            <div class="post-body">
              <p class="post-content">{{ post.content }}</p>
              <div class="post-images" v-if="post.images && post.images.length">
                <img 
                  v-for="(img, idx) in post.images.slice(0, 3)" 
                  :key="idx" 
                  :src="img" 
                  class="post-img"
                  :class="{ single: post.images.length === 1 }"
                >
              </div>
            </div>

            <div class="post-footer">
              <button class="action-btn" @click.stop="likePost(post)" :class="{ active: post.isLiked }">
                <svg width="18" height="18" viewBox="0 0 24 24" :fill="post.isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <span>{{ post.likes }}</span>
              </button>
              <button class="action-btn" @click.stop="goPostDetail(post)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>{{ post.comments }}</span>
              </button>
              <button class="action-btn" @click.stop="sharePost(post)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-if="posts.length === 0">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </div>
          <p>暂无讨论，快来发表第一条吧</p>
        </div>

        <!-- 加载更多 -->
        <div class="load-more" v-if="hasMore && posts.length > 0" @click="loadMore">
          <span v-if="!loadingMore">加载更多</span>
          <span v-else>加载中...</span>
        </div>
      </template>

      <div class="tabbar-space"></div>
    </div>

    <!-- 发帖按钮 -->
    <button class="fab-btn" @click="goCreatePost">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
    </button>
  </PageLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageLayout from '../components/layout/PageLayout.vue'
import { api } from '../utils/api'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(true)
const currentSort = ref('hot')

const sortOptions = [
  { key: 'hot', name: '热门' },
  { key: 'new', name: '最新' },
  { key: 'follow', name: '关注' }
]

const topicInfo = reactive({
  id: '',
  name: '',
  desc: '',
  postCount: '',
  viewCount: '',
  followCount: '',
  isFollowed: false
})

const posts = ref([])

const toggleFollow = () => {
  topicInfo.isFollowed = !topicInfo.isFollowed
}

const likePost = (post) => {
  post.isLiked = !post.isLiked
  post.likes += post.isLiked ? 1 : -1
}

const sharePost = (post) => {
  if (navigator.share) {
    navigator.share({ title: `#${topicInfo.name}`, text: post.content, url: window.location.href })
  }
}

const shareTopic = () => {
  if (navigator.share) {
    navigator.share({ title: `#${topicInfo.name}`, text: topicInfo.desc, url: window.location.href })
  }
}

const goPostDetail = (post) => {
  router.push(`/post/${post.id}`)
}

const goUser = (user) => {
  router.push(`/user/${user.id}`)
}

const goCreatePost = () => {
  router.push(`/create-post?topic=${topicInfo.name}`)
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const now = new Date()
  const d = new Date(dateStr)
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${d.getMonth() + 1}-${d.getDate()}`
}

const loadTopicData = async () => {
  const id = route.params.id
  const name = route.query.name || ''
  
  loading.value = true
  try {
    // 加载话题信息
    const topicRes = await api.square.getTopics({ id, name })
    if (topicRes.success && topicRes.data) {
      const t = topicRes.data
      Object.assign(topicInfo, {
        id: t.id || id,
        name: t.name || name || '话题',
        desc: t.desc || t.description || '',
        postCount: t.postCount || '0',
        viewCount: t.viewCount || '0',
        followCount: t.followCount || '0',
        isFollowed: t.isFollowed || false
      })
    } else {
      topicInfo.name = name || '话题'
    }
    
    // 加载话题下的帖子
    const postsRes = await api.square.getPosts({ topic: topicInfo.name, page: 1, pageSize: 20 })
    if (postsRes.success && postsRes.data?.list) {
      posts.value = postsRes.data.list.map(p => ({
        id: p.id,
        user: {
          id: p.userId || p.user?.id,
          name: p.user?.nickname || p.user?.username || '用户',
          avatar: p.user?.avatar || '',
          level: p.user?.level || 0
        },
        content: p.content,
        images: p.images || [],
        time: formatTime(p.createdAt),
        likes: p.likeCount || 0,
        comments: p.commentCount || 0,
        isLiked: p.isLiked || false
      }))
    }
  } catch (e) {
    console.error('加载话题数据失败:', e)
    topicInfo.name = route.query.name || '话题'
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loadingMore.value) return
  loadingMore.value = true
  // 可以在这里加载更多帖子
  loadingMore.value = false
  hasMore.value = false
}

onMounted(() => {
  loadTopicData()
})
</script>

<style scoped>
.topic-page {
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

.back-btn, .share-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #8B949E;
  border-radius: 10px;
}

.header-content h1 {
  font-size: 18px;
  font-weight: 700;
  color: #C8AA6E;
  margin: 0;
}

/* 滚动内容 */
.scroll-content {
  padding-top: calc(64px + env(safe-area-inset-top));
}

/* 骨架屏 */
.topic-header-skeleton {
  padding: 20px 16px;
  background: var(--bg-elevated, #161B22);
  margin-bottom: 12px;
}

.sk-title {
  width: 120px;
  height: 24px;
  background: var(--bg-surface, #21262D);
  border-radius: 6px;
  margin-bottom: 12px;
  animation: shimmer 1.5s infinite;
}

.sk-stats {
  width: 200px;
  height: 16px;
  background: var(--bg-surface, #21262D);
  border-radius: 4px;
  animation: shimmer 1.5s infinite;
}

.skeleton-post {
  margin: 12px 16px;
  padding: 16px;
  background: var(--bg-elevated, #161B22);
  border-radius: 16px;
}

.sk-header {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.sk-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-surface, #21262D);
  animation: shimmer 1.5s infinite;
}

.sk-info { flex: 1; }

.sk-name {
  width: 80px;
  height: 14px;
  background: var(--bg-surface, #21262D);
  border-radius: 4px;
  margin-bottom: 6px;
  animation: shimmer 1.5s infinite;
}

.sk-time {
  width: 50px;
  height: 12px;
  background: var(--bg-surface, #21262D);
  border-radius: 4px;
  animation: shimmer 1.5s infinite;
}

.sk-content {
  height: 14px;
  background: var(--bg-surface, #21262D);
  border-radius: 4px;
  margin-bottom: 8px;
  animation: shimmer 1.5s infinite;
}

.sk-content.short { width: 60%; }

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 话题信息卡片 */
.topic-info-card {
  padding: 20px 16px;
  background: var(--bg-elevated, #161B22);
  border-bottom: 1px solid var(--border-primary, #21262D);
}

.topic-main { margin-bottom: 16px; }

.topic-tag {
  font-size: 22px;
  font-weight: 700;
  color: #C8AA6E;
}

.topic-desc {
  font-size: 14px;
  color: #8B949E;
  line-height: 1.5;
  margin: 8px 0 0 0;
}

.topic-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #E6EDF3;
}

.stat-label {
  font-size: 12px;
  color: #8B949E;
}

.follow-btn {
  width: 100%;
  padding: 12px;
  background: var(--color-brand, #C8AA6E);
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #0D1117;
  transition: all 0.2s;
}

.follow-btn.followed {
  background: var(--bg-surface, #21262D);
  color: #8B949E;
}

/* 排序筛选 */
.sort-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-base, #0D1117);
  position: sticky;
  top: calc(64px + env(safe-area-inset-top));
  z-index: 10;
}

.sort-bar button {
  padding: 8px 16px;
  background: var(--bg-elevated, #161B22);
  border: 1px solid var(--border-primary, #21262D);
  border-radius: 20px;
  font-size: 13px;
  color: #8B949E;
  transition: all 0.2s;
}

.sort-bar button.active {
  background: rgba(200,170,110,0.15);
  border-color: var(--color-brand, #C8AA6E);
  color: #C8AA6E;
}

/* 帖子列表 */
.post-list {
  padding: 0 16px;
}

.post-card {
  background: var(--bg-elevated, #161B22);
  border: 1px solid var(--border-primary, #21262D);
  border-radius: 16px;
  padding: 16px;
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

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-surface, #21262D);
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #E6EDF3;
}

.user-level {
  font-size: 10px;
  color: #C8AA6E;
  background: rgba(200,170,110,0.15);
  padding: 1px 6px;
  border-radius: 4px;
  width: fit-content;
}

.post-time {
  font-size: 12px;
  color: #8B949E;
}

.post-body { margin-bottom: 12px; }

.post-content {
  font-size: 14px;
  line-height: 1.6;
  color: #C9D1D9;
  margin: 0 0 10px 0;
}

.post-images {
  display: flex;
  gap: 6px;
}

.post-img {
  width: calc((100% - 12px) / 3);
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  background: var(--bg-surface, #21262D);
}

.post-img.single {
  width: 100%;
  max-width: 280px;
  aspect-ratio: 16/10;
}

.post-footer {
  display: flex;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid var(--border-primary, #21262D);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  font-size: 13px;
  color: #8B949E;
}

.action-btn.active {
  color: #F85149;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 14px;
  color: #8B949E;
}

/* 加载更多 */
.load-more {
  padding: 20px;
  text-align: center;
  font-size: 14px;
  color: #8B949E;
}

/* 发帖按钮 */
.fab-btn {
  position: fixed;
  bottom: calc(80px + env(safe-area-inset-bottom));
  right: calc(50% - 214px + 20px);
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E) 0%, var(--color-brand-dark, #A08050) 100%);
  border: none;
  border-radius: 50%;
  color: #0D1117;
  box-shadow: 0 4px 20px rgba(200,170,110,0.4);
  z-index: 99;
}

@media (max-width: 428px) {
  .fab-btn { right: 20px; }
}

.tabbar-space {
  height: calc(70px + env(safe-area-inset-bottom));
}
</style>
