<template>
  <PageLayout title="动态详情" :show-back="true">
    <template #navbar-right>
      <button class="action-btn" @click="showActions = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
        </svg>
      </button>
    </template>

    <div class="detail-container">
      <!-- 骨架屏 -->
      <template v-if="loading">
        <div class="content-card">
          <div class="skeleton-block">
            <div class="sk-row">
              <div class="sk-circle"></div>
              <div class="sk-lines">
                <div class="sk-line w60"></div>
                <div class="sk-line w40"></div>
              </div>
            </div>
            <div class="sk-line w100"></div>
            <div class="sk-line w100"></div>
            <div class="sk-line w70"></div>
          </div>
        </div>
      </template>

      <template v-else>
        <!-- 主内容区 -->
        <article class="post-article">
          <!-- 作者信息 -->
          <header class="author-header">
            <div class="author-profile" @click="goUser(post.authorId)">
              <div class="avatar-wrap">
                <img v-if="post.authorAvatar" :src="post.authorAvatar" class="avatar" alt="">
                <span v-else class="avatar placeholder">{{ post.author.charAt(0) }}</span>
                <span v-if="post.verified" class="verified-dot"></span>
              </div>
              <div class="author-detail">
                <div class="name-row">
                  <span class="name">{{ post.author }}</span>
                  <span v-if="post.level" class="level">Lv.{{ post.level }}</span>
                </div>
                <time class="time">{{ post.time }}</time>
              </div>
            </div>
            <button 
              class="follow-action" 
              :class="{ following: post.isFollowing }"
              @click="toggleFollow"
            >
              {{ post.isFollowing ? '已关注' : '关注' }}
            </button>
          </header>

          <!-- 正文内容 -->
          <div class="article-body">
            <p class="content-text">{{ post.content }}</p>
            
            <!-- 图片展示 -->
            <div v-if="post.images && post.images.length" class="media-grid" :class="[`count-${post.images.length}`]">
              <div 
                v-for="(img, idx) in post.images" 
                :key="idx" 
                class="media-item"
                @click="previewImage(idx)"
              >
                <img :src="img" alt="">
              </div>
            </div>

            <!-- 话题标签 -->
            <div v-if="post.topics && post.topics.length" class="topic-row">
              <span 
                v-for="topic in post.topics" 
                :key="topic" 
                class="topic-chip"
                @click="goTopic(topic)"
              >#{{ topic }}</span>
            </div>
          </div>

          <!-- 互动栏 -->
          <footer class="engagement-bar">
            <div class="stat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>{{ post.views }}</span>
            </div>
            <button class="action" :class="{ active: post.isLiked }" @click="toggleLike">
              <svg width="18" height="18" viewBox="0 0 24 24" :fill="post.isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              <span>{{ post.likes }}</span>
            </button>
            <div class="stat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              <span>{{ comments.length }}</span>
            </div>
            <button class="action" @click="sharePost">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>
          </footer>
        </article>

        <!-- 评论区 -->
        <section class="comments-section">
          <div class="section-head">
            <h3>评论 <span class="count">{{ comments.length }}</span></h3>
          </div>

          <div v-if="comments.length" class="comment-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="commenter-avatar" @click="goUser(comment.userId)">
                <img v-if="comment.avatar" :src="comment.avatar" alt="">
                <span v-else>{{ comment.userName.charAt(0) }}</span>
              </div>
              <div class="comment-main">
                <div class="comment-meta">
                  <span class="commenter-name" @click="goUser(comment.userId)">{{ comment.userName }}</span>
                  <time>{{ comment.time }}</time>
                </div>
                <p class="comment-text">{{ comment.content }}</p>
                <div class="comment-footer">
                  <button :class="{ liked: comment.liked }" @click="toggleCommentLike(comment)">
                    <svg width="14" height="14" viewBox="0 0 24 24" :fill="comment.liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                    </svg>
                    <span>{{ comment.likes }}</span>
                  </button>
                  <button class="reply-btn" @click="replyTo(comment)">回复</button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            <p>暂无评论</p>
            <span>快来发表第一条评论吧</span>
          </div>
        </section>
      </template>

      <div class="safe-bottom"></div>
    </div>

    <!-- 底部输入 -->
    <div class="input-dock">
      <div class="input-field">
        <input 
          type="text" 
          v-model="commentText" 
          :placeholder="replyTarget ? `回复 @${replyTarget.userName}` : '发表评论...'"
          @keyup.enter="sendComment"
        >
        <button v-if="replyTarget" class="clear-reply" @click="replyTarget = null">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </button>
      </div>
      <button class="send-action" :class="{ ready: commentText.trim() }" @click="sendComment">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </button>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageLayout from '../components/layout/PageLayout.vue'
import { api } from '../utils/api'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const showActions = ref(false)
const commentText = ref('')
const replyTarget = ref(null)

// 帖子数据 - 从API加载
const post = ref({
  id: '',
  authorId: 0,
  author: '',
  authorAvatar: '',
  level: 0,
  verified: false,
  time: '',
  content: '',
  images: [],
  topics: [],
  views: '0',
  likes: 0,
  isLiked: false,
  isFollowing: false
})

// 评论列表 - 从API加载
const comments = ref([])

// 加载帖子详情
const loadPostDetail = async () => {
  const postId = route.params.id
  if (!postId) return
  
  loading.value = true
  try {
    const res = await api.square.getPostDetail(postId)
    if (res.success && res.data) {
      const p = res.data
      post.value = {
        id: p.id,
        authorId: p.userId || p.user?.id,
        author: p.user?.nickname || p.user?.username || '用户',
        authorAvatar: p.user?.avatar || '',
        level: p.user?.level || 0,
        verified: p.user?.verified || false,
        time: p.time || formatTime(p.createdAt),
        content: p.content || '',
        images: p.images || [],
        topics: p.topics || [],
        views: p.viewCount || p.views || '0',
        likes: p.likeCount || 0,
        isLiked: p.isLiked || false,
        isFollowing: p.isFollowing || false
      }
    }
    
    // 加载评论
    const commentsRes = await api.square.getComments({ postId, page: 1, pageSize: 20 })
    if (commentsRes.success && commentsRes.data?.list) {
      comments.value = commentsRes.data.list.map(c => ({
        id: c.id,
        userId: c.userId || c.user?.id,
        userName: c.user?.nickname || c.user?.username || '用户',
        avatar: c.user?.avatar || '',
        content: c.content,
        time: c.time || formatTime(c.createdAt),
        likes: c.likeCount || 0,
        liked: c.isLiked || false
      }))
    }
  } catch (e) {
    console.error('加载帖子详情失败:', e)
  } finally {
    loading.value = false
  }
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

const toggleFollow = () => {
  post.value.isFollowing = !post.value.isFollowing
}

const toggleLike = () => {
  post.value.isLiked = !post.value.isLiked
  post.value.likes += post.value.isLiked ? 1 : -1
}

const toggleCommentLike = (comment) => {
  comment.liked = !comment.liked
  comment.likes += comment.liked ? 1 : -1
}

const replyTo = (comment) => {
  replyTarget.value = comment
}

const sendComment = () => {
  if (!commentText.value.trim()) return
  
  comments.value.push({
    id: Date.now(),
    userId: 999,
    userName: '我',
    avatar: '',
    content: replyTarget.value ? `@${replyTarget.value.userName} ${commentText.value}` : commentText.value,
    time: '刚刚',
    likes: 0,
    liked: false
  })
  
  commentText.value = ''
  replyTarget.value = null
}

const goUser = (userId) => {
  router.push(`/user/${userId}`)
}

const goTopic = (topic) => {
  router.push(`/topic/1?name=${encodeURIComponent(topic)}`)
}

const sharePost = () => {
  if (navigator.share) {
    navigator.share({ title: 'AGX社区', text: post.value.content.substring(0, 100), url: window.location.href })
  }
}

const previewImage = (index) => {
  // 图片预览
}

onMounted(() => {
  loadPostDetail()
})
</script>

<style scoped>
/* ============================================
   Design System: 8px Grid / Monochrome Icons
   Typography Scale: 12/13/14/15/16/20/24
   Spacing Scale: 4/8/12/16/20/24/32/48
   Border Radius: 4/8/12/16/24
   ============================================ */

.detail-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

/* ==================== 骨架屏 ==================== */
.skeleton-block {
  padding: 20px;
}

.sk-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.sk-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-surface, #21262D);
  animation: pulse 1.5s ease-in-out infinite;
}

.sk-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.sk-line {
  height: 14px;
  background: var(--bg-surface, #21262D);
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.sk-line.w100 { width: 100%; }
.sk-line.w70 { width: 70%; }
.sk-line.w60 { width: 60%; }
.sk-line.w40 { width: 40%; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ==================== 文章主体 ==================== */
.post-article {
  background: var(--bg-elevated, #161B22);
  animation: articleFadeIn 0.5s ease-out;
}

@keyframes articleFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 作者头部 */
.author-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-primary, #21262D);
}

.author-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.avatar-wrap {
  position: relative;
  width: 48px;
  height: 48px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-surface, #21262D);
}

.avatar.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--bg-base, #0D1117);
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), var(--color-brand-dark, #A08050));
  border-radius: 50%;
}

.verified-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: var(--color-brand, #C8AA6E);
  border: 2px solid var(--bg-elevated, #161B22);
  border-radius: 50%;
}

.verified-dot::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  width: 4px;
  height: 6px;
  border-left: 1.5px solid var(--bg-base, #0D1117);
  border-bottom: 1.5px solid var(--bg-base, #0D1117);
  margin-top: -1px;
}

.author-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
  letter-spacing: -0.01em;
}

.level {
  font-size: 10px;
  font-weight: 500;
  color: var(--color-brand, #C8AA6E);
  background: rgba(200, 170, 110, 0.12);
  padding: 2px 6px;
  border-radius: 4px;
}

.time {
  font-size: 12px;
  color: var(--text-quaternary, #6E7681);
}

.follow-action {
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  border-radius: 20px;
  background: var(--color-brand, #C8AA6E);
  color: var(--bg-base, #0D1117);
  transition: all 0.2s ease;
}

.follow-action.following {
  background: var(--bg-surface, #21262D);
  color: var(--text-tertiary, #8B949E);
}

/* 文章正文 */
.article-body {
  padding: 20px;
}

.content-text {
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-secondary, #C9D1D9);
  white-space: pre-wrap;
  margin: 0 0 16px 0;
  letter-spacing: 0.01em;
}

/* 图片网格 */
.media-grid {
  display: grid;
  gap: 4px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.media-grid.count-1 {
  grid-template-columns: 1fr;
}

.media-grid.count-2 {
  grid-template-columns: repeat(2, 1fr);
}

.media-grid.count-3,
.media-grid.count-4 {
  grid-template-columns: repeat(2, 1fr);
}

.media-item {
  position: relative;
  aspect-ratio: 1;
  background: var(--bg-surface, #21262D);
  cursor: pointer;
  overflow: hidden;
}

.media-grid.count-1 .media-item {
  aspect-ratio: 16/10;
}

.media-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.media-item:active img {
  transform: scale(1.02);
}

/* 话题 */
.topic-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.topic-chip {
  font-size: 13px;
  color: var(--color-brand, #C8AA6E);
  background: rgba(200, 170, 110, 0.1);
  padding: 6px 14px;
  border-radius: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.topic-chip:active {
  background: rgba(200, 170, 110, 0.2);
}

/* 互动栏 */
.engagement-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-primary, #21262D);
}

.engagement-bar .stat,
.engagement-bar .action {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-tertiary, #8B949E);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.engagement-bar .action.active {
  color: #F85149;
}

.engagement-bar .action:last-child {
  margin-left: auto;
}

/* ==================== 评论区 ==================== */
.comments-section {
  margin-top: 8px;
  background: var(--bg-elevated, #161B22);
}

.section-head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-primary, #21262D);
}

.section-head h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
  margin: 0;
}

.section-head .count {
  font-weight: 400;
  color: var(--text-quaternary, #6E7681);
  margin-left: 4px;
}

.comment-list {
  padding: 0 20px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-subtle, rgba(255,255,255,0.04));
  animation: commentSlideIn 0.4s ease-out backwards;
}

.comment-item:nth-child(1) { animation-delay: 0.1s; }
.comment-item:nth-child(2) { animation-delay: 0.15s; }
.comment-item:nth-child(3) { animation-delay: 0.2s; }
.comment-item:nth-child(4) { animation-delay: 0.25s; }
.comment-item:nth-child(5) { animation-delay: 0.3s; }
.comment-item:nth-child(n+6) { animation-delay: 0.35s; }

@keyframes commentSlideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.comment-item:last-child {
  border-bottom: none;
}

.commenter-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B82F6, #1D4ED8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  cursor: pointer;
}

.commenter-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.commenter-avatar span {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.comment-main {
  flex: 1;
  min-width: 0;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.commenter-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
  cursor: pointer;
}

.comment-meta time {
  font-size: 11px;
  color: var(--text-quaternary, #6E7681);
}

.comment-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary, #C9D1D9);
  margin: 0 0 10px 0;
  word-break: break-word;
}

.comment-footer {
  display: flex;
  align-items: center;
  gap: 20px;
}

.comment-footer button {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-quaternary, #6E7681);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.comment-footer button.liked {
  color: #F85149;
}

.comment-footer .reply-btn {
  color: var(--text-tertiary, #8B949E);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--text-quaternary, #6E7681);
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.4;
}

.empty-state p {
  font-size: 14px;
  color: var(--text-secondary, #C9D1D9);
  margin: 0 0 4px 0;
}

.empty-state span {
  font-size: 12px;
}

/* ==================== 底部输入 ==================== */
.input-dock {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 428px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: var(--bg-elevated, #161B22);
  border-top: 1px solid var(--border-primary, #21262D);
  z-index: 100;
}

.input-field {
  flex: 1;
  display: flex;
  align-items: center;
  height: 44px;
  background: var(--bg-base, #0D1117);
  border: 1px solid var(--border-primary, #21262D);
  border-radius: 22px;
  padding: 0 16px;
  transition: border-color 0.2s;
}

.input-field:focus-within {
  border-color: var(--color-brand, #C8AA6E);
}

.input-field input {
  flex: 1;
  height: 100%;
  background: none;
  border: none;
  color: var(--text-primary, #E6EDF3);
  font-size: 14px;
  outline: none;
}

.input-field input::placeholder {
  color: var(--text-quaternary, #6E7681);
}

.clear-reply {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface, #21262D);
  border: none;
  border-radius: 50%;
  color: var(--text-tertiary, #8B949E);
  cursor: pointer;
}

.send-action {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface, #21262D);
  border: none;
  border-radius: 50%;
  color: var(--text-quaternary, #6E7681);
  transition: all 0.2s ease;
}

.send-action.ready {
  background: var(--color-brand, #C8AA6E);
  color: var(--bg-base, #0D1117);
}

/* 底部安全区 */
.safe-bottom {
  height: calc(72px + env(safe-area-inset-bottom));
}

/* ==================== 顶部按钮 ==================== */
.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-tertiary, #8B949E);
  border-radius: 8px;
  transition: background 0.2s;
}

.action-btn:active {
  background: var(--bg-surface, #21262D);
}
</style>
