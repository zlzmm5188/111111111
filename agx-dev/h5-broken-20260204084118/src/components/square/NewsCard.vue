<template>
  <div class="news-card" @click="$emit('click', news)">
    <!-- 热门标记 -->
    <div class="hot-badge" v-if="news.isHot">
      <svg class="hot-icon" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-3-1.5-4-.5-.5-1-1-1.5-1.5C9.5 3.5 8 2 8 0c0 4-4 5-4 8 0 1.5 1 3 2 4-.5-.5-1-1.5-1-3 0 2.5 2.5 4 5 4z"/>
      </svg>
      <span>热门</span>
    </div>
    
    <div class="card-content">
      <div class="news-body">
        <div class="news-meta">
          <span class="source-badge" :class="sourceClass">
            <span class="source-dot"></span>
            {{ news.source || '快讯' }}
          </span>
          <span class="news-time">
            <svg class="time-icon" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.2"/>
              <path d="M8 4.5v4l2.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
            {{ news.time }}
          </span>
        </div>
        <h3 class="news-title">{{ news.title }}</h3>
        <p class="news-summary" v-if="news.summary">{{ news.summary }}</p>
      </div>
      
      <div class="news-thumb" v-if="news.cover">
        <img :src="news.cover" alt="" loading="lazy" @error="handleImgError">
        <div class="thumb-overlay"></div>
      </div>
    </div>
    
    <!-- 底部信息 -->
    <div class="news-footer">
      <div class="stats">
        <span class="stat-item">
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M8 3C4.5 3 1.5 8 1.5 8s3 5 6.5 5 6.5-5 6.5-5-3-5-6.5-5z" stroke="currentColor" stroke-width="1.2"/>
            <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/>
          </svg>
          {{ formatNum(news.views || 0) }}
        </span>
      </div>
      <div class="read-more">
        <span>阅读详情</span>
        <svg viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
    
    <!-- 装饰元素 -->
    <div class="card-glow"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  news: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const sourceClass = computed(() => {
  const source = props.news.source || ''
  if (source.includes('头条') || source.includes('快讯')) return 'urgent'
  if (source.includes('时报') || source.includes('日报')) return 'media'
  return ''
})

const formatNum = (num) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num
}

const handleImgError = (e) => {
  e.target.parentElement.style.display = 'none'
}
</script>

<style scoped>
.news-card {
  position: relative;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: none;
  border-radius: 16px;
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
.news-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(192, 200, 210, 0.3) 20%, #C0C8D2 50%, rgba(192, 200, 210, 0.3) 80%, transparent 100%);
  z-index: 2;
}

/* 底部金色装饰线 */
.news-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
  z-index: 2;
}

.news-card:active {
  transform: scale(0.985) translateY(1px);
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 3px rgba(0, 0, 0, 0.15);
}

/* 热门标记 */
.hot-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 107, 107, 0.1) 100%);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  color: #FF6B6B;
  z-index: 2;
}

.hot-icon {
  width: 12px;
  height: 12px;
  animation: flicker 1s ease-in-out infinite;
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 卡片内容 */
.card-content {
  display: flex;
  gap: 14px;
  position: relative;
  z-index: 1;
}

.news-body {
  flex: 1;
  min-width: 0;
}

/* Meta信息 */
.news-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.source-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #C8AA6E;
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.15) 0%, rgba(200, 170, 110, 0.08) 100%);
  border: 1px solid rgba(200, 170, 110, 0.15);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.source-badge.urgent {
  color: #FF6B6B;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 107, 107, 0.08) 100%);
  border-color: rgba(255, 107, 107, 0.2);
}

.source-badge.urgent .source-dot {
  background: #FF6B6B;
}

.source-badge.media {
  color: #4ECDC4;
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.15) 0%, rgba(78, 205, 196, 0.08) 100%);
  border-color: rgba(78, 205, 196, 0.2);
}

.source-badge.media .source-dot {
  background: #4ECDC4;
}

.source-dot {
  width: 5px;
  height: 5px;
  background: #C8AA6E;
  border-radius: 50%;
  animation: blink 2s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.news-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #6B7280;
}

.time-icon {
  width: 12px;
  height: 12px;
  opacity: 0.7;
}

/* 标题和摘要 */
.news-title {
  font-size: 15px;
  font-weight: 700;
  color: #E6EDF3;
  line-height: 1.5;
  margin: 0 0 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s ease;
}

.news-card:active .news-title {
  color: #C8AA6E;
}

.news-summary {
  font-size: 13px;
  color: #6B7280;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 缩略图 */
.news-thumb {
  flex-shrink: 0;
  position: relative;
  width: 100px;
  height: 72px;
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(135deg, #21262D 0%, #161B22 100%);
}

.news-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.news-card:active .news-thumb img {
  transform: scale(1.05);
}

.thumb-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 50%, rgba(200, 170, 110, 0.1) 100%);
  pointer-events: none;
}

/* 底部信息 */
.news-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  position: relative;
  z-index: 1;
}

.stats {
  display: flex;
  gap: 14px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #6B7280;
}

.stat-item svg {
  width: 14px;
  height: 14px;
  opacity: 0.7;
}

.read-more {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 500;
  color: #C8AA6E;
  opacity: 0.8;
  transition: all 0.2s ease;
}

.read-more svg {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.news-card:active .read-more {
  opacity: 1;
}

.news-card:active .read-more svg {
  transform: translateX(2px);
}

/* 装饰光晕 */
.card-glow {
  position: absolute;
  bottom: -50%;
  right: -30%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(200, 170, 110, 0.06) 0%, transparent 70%);
  pointer-events: none;
}
</style>
