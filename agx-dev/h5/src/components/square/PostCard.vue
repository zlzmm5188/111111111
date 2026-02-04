<template>
  <div class="post-card" :class="{ 'official-post': post.isOfficial }" @click="$emit('click', post)">
    <!-- 用户信息 -->
    <div class="post-header">
      <div class="avatar-wrapper">
        <div class="avatar-ring" :class="{ 'verified': post.user?.isVerified }">
          <img :src="post.user?.avatar || defaultAvatar" class="avatar" alt="">
        </div>
        <div class="online-dot" v-if="post.user?.isOnline"></div>
      </div>
      <div class="user-info">
        <div class="user-row">
          <span class="username" :class="{ 'official': post.isOfficial }">
            {{ post.isOfficial ? 'AGX官方' : (post.user?.name || '用户') }}
          </span>
          <span class="official-badge" v-if="post.isOfficial">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0L6.6 3.4L3 3.9L5.5 6.4L4.8 10L8 8.1L11.2 10L10.5 6.4L13 3.9L9.4 3.4L8 0Z"/>
            </svg>
            官方
          </span>
          <span class="verified-badge" v-else-if="post.user?.isVerified">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0l2.1 5.3L16 6l-4.2 3.9L13 16l-5-3.1L3 16l1.2-6.1L0 6l5.9-.7L8 0z"/>
            </svg>
          </span>
          <span class="user-level" v-if="post.user?.level && !post.isOfficial">Lv.{{ post.user.level }}</span>
        </div>
        <div class="meta-row">
          <span class="post-time">{{ post.time }}</span>
          <span class="separator">·</span>
          <span class="post-device" v-if="post.device">来自 {{ post.device }}</span>
        </div>
      </div>
      <button class="more-btn" @click.stop>
        <svg viewBox="0 0 20 20" fill="currentColor">
          <circle cx="4" cy="10" r="1.5"/>
          <circle cx="10" cy="10" r="1.5"/>
          <circle cx="16" cy="10" r="1.5"/>
        </svg>
      </button>
    </div>

    <!-- 内容 -->
    <div class="post-body">
      <p class="post-content" :class="{ 'expanded': isExpanded }">{{ post.content }}</p>
      <button class="expand-btn" v-if="shouldShowExpand" @click.stop="isExpanded = !isExpanded">
        {{ isExpanded ? '收起' : '展开全文' }}
      </button>
    </div>

    <!-- 图片网格 -->
    <div class="post-images" v-if="post.images && post.images.length > 0" :class="imageGridClass">
      <div 
        class="image-item" 
        v-for="(img, idx) in displayImages" 
        :key="idx"
        @click.stop="$emit('preview', post.images, idx)"
      >
        <img :src="img" loading="lazy" @error="handleImgError">
        <div class="image-more" v-if="idx === 2 && post.images.length > 3">
          <span>+{{ post.images.length - 3 }}</span>
        </div>
      </div>
    </div>

    <!-- 话题标签 -->
    <div class="post-topics" v-if="post.topic || post.tags?.length">
      <span class="topic-tag" v-if="post.topic">
        <span class="tag-hash">#</span>{{ post.topic }}
      </span>
      <span class="topic-tag" v-for="tag in (post.tags || []).slice(0, 2)" :key="tag">
        <span class="tag-hash">#</span>{{ tag }}
      </span>
    </div>

    <!-- 操作栏 -->
    <div class="post-actions">
      <button 
        class="action-btn like-btn" 
        :class="{ active: post.isLiked }"
        @click.stop="handleLike"
      >
        <div class="icon-wrapper">
          <svg class="icon heart-icon" viewBox="0 0 24 24" :fill="post.isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <div class="like-particles" v-if="showParticles">
            <span v-for="i in 6" :key="i"></span>
          </div>
        </div>
        <span class="count">{{ formatNum(post.likes || 0) }}</span>
      </button>
      
      <button class="action-btn comment-btn" @click.stop="$emit('comment', post)">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="count">{{ formatNum(post.comments || 0) }}</span>
      </button>
      
      <button class="action-btn share-btn" @click.stop="$emit('share', post)">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16,6 12,2 8,6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        <span class="count">分享</span>
      </button>
    </div>
    
    <!-- 装饰 -->
    <div class="card-shine"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'like', 'comment', 'preview', 'share'])

const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
const isExpanded = ref(false)
const showParticles = ref(false)

const displayImages = computed(() => {
  if (!props.post.images) return []
  return props.post.images.slice(0, 3)
})

const imageGridClass = computed(() => {
  const count = props.post.images?.length || 0
  if (count === 1) return 'single'
  if (count === 2) return 'double'
  return 'triple'
})

const shouldShowExpand = computed(() => {
  return props.post.content && props.post.content.length > 120
})

const formatNum = (num) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num
}

const handleLike = () => {
  if (!props.post.isLiked) {
    showParticles.value = true
    setTimeout(() => {
      showParticles.value = false
    }, 600)
  }
  emit('like', props.post)
}

const handleImgError = (e) => {
  e.target.src = '/placeholder.png'
}
</script>

<style scoped>
.post-card {
  position: relative;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: none;
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* 顶部银色装饰线 */
.post-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(192, 200, 210, 0.3) 20%, #C0C8D2 50%, rgba(192, 200, 210, 0.3) 80%, transparent 100%);
  z-index: 2;
}

/* 官方帖子特殊样式 */
.post-card.official-post {
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.08) 0%, rgba(200, 170, 110, 0.03) 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
}

.post-card.official-post::before {
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.4) 20%, rgba(200, 170, 110, 0.8) 50%, rgba(200, 170, 110, 0.4) 80%, transparent 100%);
}

/* 底部金色装饰线 */
.post-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
  z-index: 2;
}

.post-card:active {
  transform: scale(0.99) translateY(1px);
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 3px rgba(0, 0, 0, 0.15);
}

/* 用户头部 */
.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.avatar-wrapper {
  position: relative;
}

.avatar-ring {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, #3D3D3D 0%, #2D2D2D 100%);
  transition: all 0.3s ease;
}

.avatar-ring.verified {
  background: linear-gradient(135deg, #C8AA6E 0%, #E8D5A3 50%, #A08A5B 100%);
  animation: ringGlow 3s ease-in-out infinite;
}

@keyframes ringGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(200, 170, 110, 0); }
  50% { box-shadow: 0 0 12px 2px rgba(200, 170, 110, 0.3); }
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background: #21262D;
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background: #22C55E;
  border: 2px solid #161B22;
  border-radius: 50%;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.username {
  font-size: 15px;
  font-weight: 700;
  color: #E6EDF3;
}

.username.official {
  background: linear-gradient(135deg, #C8AA6E 0%, #E8D5A3 50%, #C8AA6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
}

.official-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  color: #FFF;
  background: linear-gradient(135deg, #C8AA6E 0%, #E8D5A3 50%, #C8AA6E 100%);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(200, 170, 110, 0.3);
  animation: officialGlow 2s ease-in-out infinite;
}

@keyframes officialGlow {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(200, 170, 110, 0.3);
  }
  50% {
    box-shadow: 0 2px 12px rgba(200, 170, 110, 0.5);
  }
}

.official-badge svg {
  width: 10px;
  height: 10px;
}

.verified-badge {
  width: 14px;
  height: 14px;
  color: #C8AA6E;
}

.user-level {
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 600;
  color: #C8AA6E;
  background: rgba(200, 170, 110, 0.12);
  border-radius: 8px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
  font-size: 12px;
  color: #6B7280;
}

.separator {
  opacity: 0.5;
}

.more-btn {
  padding: 8px;
  background: transparent;
  border: none;
  color: #6B7280;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.more-btn:active {
  background: rgba(255, 255, 255, 0.05);
  color: #E6EDF3;
}

.more-btn svg {
  width: 18px;
  height: 18px;
}

/* 内容 */
.post-body {
  margin-bottom: 14px;
}

.post-content {
  font-size: 14px;
  line-height: 1.7;
  color: #C9D1D9;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-content.expanded {
  -webkit-line-clamp: unset;
}

.expand-btn {
  margin-top: 8px;
  padding: 0;
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: #C8AA6E;
}

/* 图片网格 */
.post-images {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
  border-radius: 12px;
  overflow: hidden;
}

.post-images.single {
  grid-template-columns: 1fr;
}

.post-images.single .image-item {
  max-width: 260px;
  aspect-ratio: 16/10;
}

.post-images.double {
  grid-template-columns: repeat(2, 1fr);
}

.post-images.triple {
  grid-template-columns: repeat(3, 1fr);
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(135deg, #21262D 0%, #161B22 100%);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.image-item:active img {
  transform: scale(1.05);
}

.image-more {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(2px);
}

.image-more span {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

/* 话题 */
.post-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.topic-tag {
  display: inline-flex;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #C8AA6E;
  background: rgba(200, 170, 110, 0.08);
  border: 1px solid rgba(200, 170, 110, 0.12);
  border-radius: 16px;
  transition: all 0.2s ease;
}

.topic-tag:active {
  background: rgba(200, 170, 110, 0.15);
}

.tag-hash {
  margin-right: 2px;
  opacity: 0.7;
}

/* 操作栏 */
.post-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  background: rgba(255, 255, 255, 0.02);
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
  transition: all 0.25s ease;
}

.action-btn:active {
  background: rgba(255, 255, 255, 0.06);
}

.action-btn .icon {
  width: 18px;
  height: 18px;
}

.action-btn .count {
  font-size: 12px;
}

/* 点赞特效 */
.icon-wrapper {
  position: relative;
}

.like-btn.active {
  color: #FF6B8A;
}

.like-btn.active .heart-icon {
  animation: heartBeat 0.4s ease;
}

@keyframes heartBeat {
  0% { transform: scale(1); }
  25% { transform: scale(1.25); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.like-particles {
  position: absolute;
  inset: -8px;
  pointer-events: none;
}

.like-particles span {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #FF6B8A;
  border-radius: 50%;
  animation: particle 0.6s ease-out forwards;
}

.like-particles span:nth-child(1) { top: 0; left: 50%; }
.like-particles span:nth-child(2) { top: 20%; right: 0; }
.like-particles span:nth-child(3) { bottom: 20%; right: 0; }
.like-particles span:nth-child(4) { bottom: 0; left: 50%; }
.like-particles span:nth-child(5) { bottom: 20%; left: 0; }
.like-particles span:nth-child(6) { top: 20%; left: 0; }

@keyframes particle {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--x, 10px), var(--y, -10px)) scale(0); opacity: 0; }
}

.like-particles span:nth-child(1) { --x: 0; --y: -15px; }
.like-particles span:nth-child(2) { --x: 12px; --y: -8px; }
.like-particles span:nth-child(3) { --x: 12px; --y: 8px; }
.like-particles span:nth-child(4) { --x: 0; --y: 15px; }
.like-particles span:nth-child(5) { --x: -12px; --y: 8px; }
.like-particles span:nth-child(6) { --x: -12px; --y: -8px; }

.comment-btn:active {
  color: #4ECDC4;
}

.share-btn:active {
  color: #C8AA6E;
}

/* 装饰 */
.card-shine {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 40%,
    rgba(200, 170, 110, 0.02) 45%,
    rgba(200, 170, 110, 0.05) 50%,
    rgba(200, 170, 110, 0.02) 55%,
    transparent 60%
  );
  transform: translateX(-100%);
  transition: transform 0.8s ease;
  pointer-events: none;
}

.post-card:active .card-shine {
  transform: translateX(50%);
}
</style>
