<template>
  <div class="square-page">
    <!-- Tabs -->
    <nav class="tabs">
      <div class="tabs-track">
        <button 
          v-for="t in tabs" 
          :key="t.key" 
          class="tab-btn" 
          :class="{ active: tab === t.key }"
          @click="tab = t.key"
        >
          <span class="tab-text">{{ t.label }}</span>
          <span v-if="tab === t.key" class="tab-indicator"></span>
        </button>
      </div>
    </nav>

    <!-- Content -->
    <main class="content">
      <!-- Feed Tab -->
      <div v-if="tab === 'feed'" class="feed-section">
        <!-- Hot Topics -->
        <div class="hot-topics">
          <div class="hot-topics-header">
            <svg viewBox="0 0 24 24" fill="currentColor" class="fire-icon">
              <path d="M12 23c-3.866 0-7-3.134-7-7 0-2.577 1.409-4.824 3.5-6.023V6.5A4.5 4.5 0 0 1 13 2c.276 0 .5.224.5.5v3.793l.854-.854a.5.5 0 0 1 .792.561l-1.5 4.5a.5.5 0 0 1-.646.354V10.5a.5.5 0 0 0-.5-.5A2.5 2.5 0 0 0 10 12.5v.5c0 1.381 1.119 2.5 2.5 2.5s2.5-1.119 2.5-2.5v-1c0-.276.224-.5.5-.5s.5.224.5.5v1c0 1.933-1.567 3.5-3.5 3.5S9 14.933 9 13v-.5c0-1.933 1.567-3.5 3.5-3.5.276 0 .5.224.5.5v.354a.5.5 0 0 1-.646-.354l-1.5-4.5a.5.5 0 0 1 .792-.561l.854.854V2.5c0-.276.224-.5.5-.5a4.5 4.5 0 0 1 4.5 4.5v3.477C19.591 11.176 21 13.423 21 16c0 3.866-3.134 7-7 7h-2z"/>
            </svg>
            <span>热门话题</span>
          </div>
          <div class="hot-topics-scroll">
            <span 
              v-for="topic in hotTopics" 
              :key="topic" 
              class="hot-topic-tag"
              @click="goTopic(topic)"
            >#{{ topic }}</span>
          </div>
        </div>

        <!-- Quick Post -->
        <div class="quick-post" @click="goCreate">
          <div class="quick-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="quick-input">分享你的想法...</div>
          <button class="quick-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        <!-- Posts -->
        <div class="posts-list">
          <article v-for="p in postsList" :key="p.id" class="post-card" @click="goPost(p)">
            <div class="post-header">
              <div class="post-avatar" :class="{ 'official-avatar': p.isOfficial }">
                <img v-if="p.isOfficial" src="/agx-new.png" alt="AGX" class="agx-logo">
                <img v-else-if="p.avatar" :src="p.avatar" alt="">
                <span v-else class="avatar-letter">{{ p.author?.charAt(0) || 'U' }}</span>
              </div>
              <div class="post-meta">
                <div class="post-author">
                  <span class="author-name">{{ p.author }}</span>
                  <span v-if="p.isOfficial" class="author-badge official">官方</span>
                  <span v-if="p.verified" class="author-badge verified">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </span>
                </div>
                <span class="post-time">{{ p.time }}</span>
              </div>
              <button v-if="!p.isFollowing && !p.isOfficial" class="follow-btn" @click.stop="follow(p)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                  <path d="M12 5v14m-7-7h14"/>
                </svg>
                关注
              </button>
            </div>

            <p class="post-text">{{ p.content }}</p>

            <div v-if="p.images?.length" class="post-images" :class="'img-' + Math.min(p.images.length, 4)">
              <div v-for="(img, i) in p.images.slice(0, 4)" :key="i" class="post-img">
                <img :src="img" alt="" loading="lazy">
                <div v-if="i === 3 && p.images.length > 4" class="img-more">+{{ p.images.length - 4 }}</div>
              </div>
            </div>

            <div v-if="p.topics?.length" class="post-tags">
              <span v-for="t in p.topics" :key="t" class="post-tag" @click.stop="goTopic(t)">#{{ t }}</span>
            </div>

            <div class="post-actions">
              <button class="action-btn" :class="{ liked: p.isLiked }" @click.stop="like(p)">
                <svg viewBox="0 0 24 24" :fill="p.isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{{ fmt(p.likes) }}</span>
              </button>
              <button class="action-btn" @click.stop="goPost(p)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                <span>{{ fmt(p.comments) }}</span>
              </button>
              <button class="action-btn" @click.stop="share(p)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              </button>
            </div>
          </article>
        </div>

        <!-- Empty State -->
        <div v-if="!postsList.length && !postsLoading" class="empty">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </div>
          <p class="empty-title">暂无动态</p>
          <p class="empty-desc">发布第一条动态，分享你的想法</p>
          <button class="empty-btn" @click="goCreate">发布动态</button>
        </div>
      </div>

      <!-- Following Tab -->
      <div v-else-if="tab === 'following'" class="feed-section">
        <div class="posts-list">
          <article v-for="p in followingList" :key="p.id" class="post-card" @click="goPost(p)">
            <div class="post-header">
              <div class="post-avatar" :class="{ 'official-avatar': p.isOfficial }">
                <img v-if="p.isOfficial" src="/agx-new.png" alt="AGX" class="agx-logo">
                <img v-else-if="p.avatar" :src="p.avatar" alt="">
                <span v-else class="avatar-letter">{{ p.author?.charAt(0) || 'U' }}</span>
              </div>
              <div class="post-meta">
                <span class="author-name">{{ p.author }}</span>
                <span class="post-time">{{ p.time }}</span>
              </div>
            </div>
            <p class="post-text">{{ p.content }}</p>
            <div class="post-actions">
              <button class="action-btn" :class="{ liked: p.isLiked }" @click.stop="like(p)">
                <svg viewBox="0 0 24 24" :fill="p.isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{{ fmt(p.likes) }}</span>
              </button>
              <button class="action-btn" @click.stop="goPost(p)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                <span>{{ fmt(p.comments) }}</span>
              </button>
            </div>
          </article>
        </div>

        <div v-if="!followingList.length && !followingLoading" class="empty">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <p class="empty-title">暂无关注</p>
          <p class="empty-desc">关注感兴趣的用户，查看他们的动态</p>
        </div>
      </div>

      <!-- News Tab - 东方财经风格 -->
      <div v-else-if="tab === 'news'" class="news-section">
        <!-- Header -->
        <div class="news-header">
          <div class="news-header-left">
            <span class="news-live-badge">
              <span class="live-dot"></span>
              实时
            </span>
            <span class="news-title">7×24快讯</span>
          </div>
          <span class="news-date-text">{{ currentDate }}</span>
        </div>

        <!-- News List -->
        <div class="news-list">
          <div 
            v-for="n in filteredNewsList" 
            :key="n.id" 
            class="news-row"
            :class="{ hot: n.important }"
            @click="openNews(n)"
          >
            <span class="news-row-time">{{ formatNewsTime(n.time) }}</span>
            <div class="news-row-content">
              <span v-if="n.source" class="news-src" :class="getSrcClass(n.source)">{{ n.source }}</span>
              <span class="news-row-text">{{ n.title || n.text }}</span>
              <span v-if="n.important" class="news-hot-badge">热</span>
            </div>
          </div>

          <!-- Empty -->
          <div v-if="!filteredNewsList.length && !newsLoading" class="news-empty">
            暂无快讯
          </div>
        </div>

        <!-- Load More -->
        <div class="news-more" v-if="filteredNewsList.length >= 10">
          <button class="news-more-btn" @click="loadMoreNews">加载更多</button>
        </div>
      </div>

      <!-- Learn Tab -->
      <div v-else-if="tab === 'learn'" class="learn-section">
        <!-- Learn Banner -->
        <div class="edu-banner">
          <div class="edu-banner-content">
            <span class="edu-vip-tag">AGX VIP</span>
            <h2 class="edu-banner-title">专业投资者培训</h2>
            <p class="edu-banner-desc">解锁全部课程，掌握财富密码</p>
          </div>
          <img src="/agx-new.png" alt="AGX" class="edu-banner-logo">
        </div>

        <!-- Stats Row -->
        <div class="edu-stats">
          <div class="edu-stat">
            <span class="edu-stat-value">{{ learnStats.lessons }}</span>
            <span class="edu-stat-unit">节</span>
            <span class="edu-stat-label">已学课程</span>
          </div>
          <div class="edu-stat">
            <span class="edu-stat-value">{{ learnStats.hours }}</span>
            <span class="edu-stat-unit">h</span>
            <span class="edu-stat-label">学习时长</span>
          </div>
          <div class="edu-stat">
            <span class="edu-stat-value">{{ learnStats.points || 860 }}</span>
            <span class="edu-stat-unit">分</span>
            <span class="edu-stat-label">学习积分</span>
          </div>
        </div>

        <!-- Courses Header -->
        <div class="edu-courses-header">
          <span class="edu-courses-title">精选课程</span>
          <span class="edu-courses-count">共 {{ filteredCourses.length }} 门</span>
        </div>

        <!-- Course List -->
        <div class="edu-course-list">
          <div 
            v-for="course in filteredCourses" 
            :key="course.id" 
            class="edu-course-card"
            @click="openCourse(course)"
          >
            <div class="edu-course-left">
              <div class="edu-course-icon">
                <span class="edu-icon-emoji">{{ course.icon }}</span>
              </div>
              <span class="edu-course-level" :class="getLevelClass(course.level)">{{ course.level }}</span>
              <span v-if="course.completed" class="edu-course-done">已完成</span>
            </div>
            <div class="edu-course-main">
              <div class="edu-course-title-row">
                <h4 class="edu-course-title">{{ course.title }}</h4>
                <svg v-if="course.locked" class="edu-lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <p class="edu-course-desc">{{ course.description }}</p>
              <div class="edu-course-meta">
                <span class="edu-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  {{ course.lessons }}节
                </span>
                <span class="edu-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {{ course.duration }}
                </span>
                <span class="edu-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  {{ course.students }}
                </span>
              </div>
            </div>
            <button class="edu-course-btn" :class="{ unlock: course.locked }">
              {{ course.locked ? '解锁' : '学习' }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- FAB -->
    <button class="fab" @click="goCreate">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>

    <!-- Course Detail Modal -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showCourseModal" class="course-modal-overlay" @click.self="closeCourseModal">
          <div class="course-modal">
            <div class="course-modal-header">
              <div class="course-modal-icon">{{ selectedCourse?.icon }}</div>
              <div class="course-modal-info">
                <h2 class="course-modal-title">{{ selectedCourse?.title }}</h2>
                <div class="course-modal-meta">
                  <span class="course-modal-level" :class="getLevelClass(selectedCourse?.level)">{{ selectedCourse?.level }}</span>
                  <span>{{ selectedCourse?.lessons }}节课</span>
                  <span>{{ selectedCourse?.duration }}</span>
                </div>
              </div>
              <button class="course-modal-close" @click="closeCourseModal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div class="course-modal-body">
              <p class="course-modal-desc">{{ selectedCourse?.description }}</p>
              
              <div class="course-lessons">
                <h3 class="lessons-title">课程大纲</h3>
                <div class="lessons-list">
                  <div 
                    v-for="(lesson, idx) in selectedCourse?.lessons_detail" 
                    :key="idx" 
                    class="lesson-item"
                    :class="{ completed: lesson.completed, locked: lesson.locked }"
                    @click="openLesson(lesson)"
                  >
                    <div class="lesson-num">{{ idx + 1 }}</div>
                    <div class="lesson-content">
                      <h4 class="lesson-title">{{ lesson.title }}</h4>
                      <span class="lesson-duration">{{ lesson.duration }}</span>
                    </div>
                    <div class="lesson-status">
                      <svg v-if="lesson.completed" viewBox="0 0 24 24" fill="currentColor" class="icon-done">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <svg v-else-if="lesson.locked" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-lock">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <svg v-else viewBox="0 0 24 24" fill="currentColor" class="icon-play">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="course-modal-footer">
              <button class="course-start-btn" @click="startLearning">
                {{ selectedCourse?.completed ? '继续学习' : '开始学习' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Lesson Content Modal -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showLessonModal" class="lesson-modal-overlay" @click.self="closeLessonModal">
          <div class="lesson-modal">
            <div class="lesson-modal-header">
              <button class="lesson-back-btn" @click="closeLessonModal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <h2 class="lesson-modal-title">{{ currentLesson?.title }}</h2>
              <span class="lesson-modal-num">{{ currentLessonIndex + 1 }}/{{ selectedCourse?.lessons_detail?.length }}</span>
            </div>
            
            <div class="lesson-modal-body">
              <article class="lesson-article" v-html="sanitizeHtml(currentLesson?.content || '')"></article>
            </div>

            <div class="lesson-modal-footer">
              <button class="lesson-nav-btn" :disabled="currentLessonIndex === 0" @click="prevLesson">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                上一节
              </button>
              <button class="lesson-complete-btn" @click="completeLesson">
                {{ currentLesson?.completed ? '已完成' : '标记完成' }}
              </button>
              <button class="lesson-nav-btn" :disabled="currentLessonIndex >= (selectedCourse?.lessons_detail?.length || 1) - 1" @click="nextLesson">
                下一节
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSquareNews, useSquarePosts, useSquareTopics, useSquareFollowing, useSquareLearn } from '../composables/useSquare'
import { alert } from '../utils/alert'
import { api } from '../utils/api'
import { sanitizeHtml } from '../utils/sanitize'

const router = useRouter()

const tabs = [
  { key: 'feed', label: '发现' },
  { key: 'following', label: '关注' },
  { key: 'news', label: '快讯' },
  { key: 'learn', label: '学堂' }
]

const tab = ref('feed')
const isRefreshing = ref(false)

const newsSubTabs = [
  { key: 'all', label: '全部' },
  { key: 'market', label: '行情' },
  { key: 'policy', label: '政策' },
  { key: 'crypto', label: '加密' },
  { key: 'stocks', label: 'A股' }
]

const newsFilter = ref('all')

const learnCategories = [
  { key: 'all', label: '全部' },
  { key: 'basics', label: '入门基础' },
  { key: 'technical', label: '进阶技巧' },
  { key: 'risk', label: '风险管理' }
]

const learnFilter = ref('all')

const learnStats = ref({ courses: 7, lessons: 12, hours: 8.5, points: 860 })
const hotTopicsCount = ref(24)

const hotTopics = ref(['BTC突破10万', '以太坊2.0', 'AI概念币', '减半行情', 'Meme币', 'DeFi挖矿', 'NFT回暖', '合约爆仓'])

const currentDate = computed(() => {
  const now = new Date()
  return `${now.getMonth() + 1}月${now.getDate()}日`
})

const formatNewsTime = (time) => {
  if (!time) return '--:--'
  if (time.includes(':')) return time.substring(0, 5)
  return time
}

const loadMoreNews = () => {
  loadMoreNewsApi()
}

// Course Modal State
const showCourseModal = ref(false)
const showLessonModal = ref(false)
const selectedCourse = ref(null)
const currentLesson = ref(null)
const currentLessonIndex = ref(0)

const { topics, loadTopics } = useSquareTopics()
const { followingList, loading: followingLoading, loadFollowing } = useSquareFollowing()
const { learnList, loading: learnLoading, loadLearn } = useSquareLearn()
const { newsList, loading: newsLoading, loadNews, loadMoreNews: loadMoreNewsApi } = useSquareNews()
const { postsList, loading: postsLoading, loadPosts, likePost } = useSquarePosts()

const featuredCourses = ref([
  { 
    id: 1, 
    icon: 'BTC', 
    title: '比特币基础入门', 
    description: '了解比特币的起源、运作原理和价值逻辑，掌握加密货币的核心概念。', 
    level: '入门', 
    lessons: 6, 
    duration: '2h', 
    students: '5,832', 
    category: 'basics', 
    completed: true,
    lessons_detail: [
      { title: '什么是比特币？', duration: '15分钟', completed: true, content: `<h2>比特币：数字黄金的诞生</h2><p>比特币（Bitcoin）是一种去中心化的数字货币，由中本聪（Satoshi Nakamoto）于2008年提出，2009年正式上线。</p><h3>核心特点</h3><ul><li><strong>去中心化</strong>：没有中央银行或单一管理者控制</li><li><strong>有限供应</strong>：总量上限为2100万枚</li><li><strong>点对点交易</strong>：无需第三方中介</li><li><strong>透明可追溯</strong>：所有交易记录在区块链上公开可查</li></ul><h3>比特币的价值来源</h3><p>比特币的价值主要来自以下几个方面：</p><ol><li>稀缺性 - 类似黄金，供应有限</li><li>实用性 - 可作为价值储存和转移工具</li><li>网络效应 - 用户和商家接受度不断提高</li><li>抗审查性 - 任何人都可以自由使用</li></ol>` },
      { title: '区块链技术原理', duration: '20分钟', completed: true, content: `<h2>区块链：比特币的底层技术</h2><p>区块链是一种分布式账本技术，是比特币和其他加密货币的基础设施。</p><h3>区块链如何工作</h3><p>想象一个公开的账本，记录着所有交易：</p><ul><li><strong>区块</strong>：交易被打包成"区块"</li><li><strong>链</strong>：区块按时间顺序链接</li><li><strong>哈希</strong>：每个区块都有唯一的加密指纹</li><li><strong>共识</strong>：网络节点验证交易的有效性</li></ul><h3>为什么区块链难以篡改？</h3><p>每个区块都包含前一个区块的哈希值。如果有人试图修改某个区块的数据，该区块的哈希值就会改变，导致后续所有区块失效。攻击者需要重新计算整个链条，这在计算上几乎不可能。</p>` },
      { title: '比特币钱包详解', duration: '18分钟', completed: false, content: `<h2>比特币钱包：你的数字金库</h2><p>比特币钱包用于存储、发送和接收比特币。实际上，钱包存储的是"私钥"，而不是比特币本身。</p><h3>钱包类型</h3><ul><li><strong>热钱包</strong>：连接互联网，方便日常使用（如手机App、网页钱包）</li><li><strong>冷钱包</strong>：离线存储，安全性更高（如硬件钱包、纸钱包）</li><li><strong>托管钱包</strong>：由交易所管理，方便但需信任第三方</li><li><strong>非托管钱包</strong>：自己掌控私钥，完全自主</li></ul><h3>安全建议</h3><ol><li>永远备份助记词（12-24个单词）</li><li>大额资产使用冷钱包</li><li>启用双重验证（2FA）</li><li>警惕钓鱼网站和诈骗</li></ol>` },
      { title: '如何购买比特币', duration: '15分钟', completed: false, content: `<h2>购买比特币的渠道</h2><h3>1. 中心化交易所（CEX）</h3><p>最常见的购买方式，如币安、OKX、Coinbase等：</p><ul><li>完成KYC身份认证</li><li>充值法币或稳定币</li><li>在交易市场下单购买</li></ul><h3>2. 去中心化交易所（DEX）</h3><p>无需注册，直接用钱包交易。但需要先拥有其他加密货币。</p><h3>3. 场外交易（OTC）</h3><p>大额交易的首选，通过OTC服务商或P2P平台进行。</p><h3>购买建议</h3><ul><li>选择合规的主流交易所</li><li>小额试水，熟悉流程后再加仓</li><li>定投策略降低择时风险</li><li>购买后转移到自己的钱包</li></ul>` },
      { title: '比特币交易基础', duration: '22分钟', completed: false, content: `<h2>比特币交易入门</h2><h3>交易类型</h3><ul><li><strong>现货交易</strong>：直接买卖比特币</li><li><strong>合约交易</strong>：带杠杆的衍生品（高风险）</li><li><strong>定投</strong>：定期定额购买</li></ul><h3>基本术语</h3><ul><li><strong>买入/做多</strong>：预期价格上涨</li><li><strong>卖出/做空</strong>：预期价格下跌</li><li><strong>限价单</strong>：指定价格成交</li><li><strong>市价单</strong>：立即以当前价格成交</li><li><strong>止损/止盈</strong>：自动平仓条件</li></ul><h3>风险管理</h3><p>永远不要投入超过你能承受损失的资金。加密货币市场波动剧烈，新手应该：</p><ol><li>从小额开始</li><li>设置止损</li><li>分散投资</li><li>保持理性，不追涨杀跌</li></ol>` },
      { title: '比特币的未来展望', duration: '15分钟', completed: false, content: `<h2>比特币的发展趋势</h2><h3>机构采用</h3><p>越来越多的机构投资者和公司将比特币纳入资产配置：</p><ul><li>MicroStrategy持有超过15万枚BTC</li><li>特斯拉、Square等公司买入比特币</li><li>比特币ETF获批，传统投资者可便捷参与</li></ul><h3>技术升级</h3><ul><li><strong>闪电网络</strong>：二层扩容方案，实现即时小额支付</li><li><strong>Taproot升级</strong>：增强隐私性和智能合约功能</li></ul><h3>监管态势</h3><p>各国对加密货币的监管态度不一，但总体趋向于建立合规框架。萨尔瓦多已将比特币定为法定货币。</p><h3>长期价值</h3><p>作为"数字黄金"，比特币被视为对抗通胀和货币贬值的工具。其固定供应量和去中心化特性使其具有独特的价值主张。</p>` }
    ]
  },
  { 
    id: 2, 
    icon: 'POW', 
    title: '加密货币挖矿入门', 
    description: '深入了解PoW挖矿原理、矿机选择、矿池运作及收益计算。', 
    level: '入门', 
    lessons: 8, 
    duration: '3h', 
    students: '3,421', 
    category: 'mining',
    lessons_detail: [
      { title: '什么是加密货币挖矿？', duration: '18分钟', completed: false, content: `<h2>挖矿：区块链的核心机制</h2><p>挖矿是验证和记录区块链交易的过程，矿工通过提供算力获得加密货币奖励。</p><h3>挖矿的作用</h3><ul><li><strong>交易验证</strong>：确认交易的有效性</li><li><strong>网络安全</strong>：防止双重支付和攻击</li><li><strong>代币发行</strong>：新币通过挖矿进入流通</li><li><strong>去中心化</strong>：任何人都可以参与</li></ul><h3>工作量证明（PoW）</h3><p>比特币使用PoW共识机制：矿工需要解决复杂的数学难题（哈希计算），第一个找到答案的矿工获得出块权和奖励。</p><h3>挖矿难度</h3><p>网络会自动调整挖矿难度，确保平均每10分钟产生一个新区块，无论总算力如何变化。</p>` },
      { title: '挖矿硬件详解', duration: '25分钟', completed: false, content: `<h2>挖矿设备选择指南</h2><h3>硬件类型</h3><ul><li><strong>CPU挖矿</strong>：最早的挖矿方式，现在几乎无利可图</li><li><strong>GPU挖矿</strong>：用显卡挖矿，适合ETH等币种</li><li><strong>ASIC矿机</strong>：专用集成电路，效率最高，主要用于BTC</li><li><strong>FPGA</strong>：可编程芯片，介于GPU和ASIC之间</li></ul><h3>主流矿机</h3><ul><li><strong>比特大陆蚂蚁矿机</strong>：Antminer S19系列</li><li><strong>MicroBT神马矿机</strong>：M30系列</li><li><strong>嘉楠耘智</strong>：阿瓦隆系列</li></ul><h3>选购要点</h3><ol><li>算力（TH/s）- 越高越好</li><li>功耗（W）- 越低越好</li><li>能效比（J/TH）- 核心指标</li><li>散热和噪音 - 影响部署环境</li><li>价格和回本周期</li></ol>` },
      { title: '矿池选择与配置', duration: '20分钟', completed: false, content: `<h2>矿池：联合挖矿的力量</h2><p>单独挖矿获得区块奖励的概率极低，矿池让矿工联合算力，按贡献分配收益。</p><h3>主流矿池</h3><ul><li><strong>F2Pool（鱼池）</strong>：老牌矿池，支持多币种</li><li><strong>AntPool（蚂蚁矿池）</strong>：比特大陆旗下</li><li><strong>ViaBTC</strong>：支持多种结算方式</li><li><strong>Foundry USA</strong>：北美最大矿池</li><li><strong>Binance Pool</strong>：币安旗下矿池</li></ul><h3>收益分配模式</h3><ul><li><strong>PPS</strong>：按算力比例固定支付</li><li><strong>PPLNS</strong>：按最近N个份额分配</li><li><strong>PPS+</strong>：PPS + 交易费分成</li><li><strong>FPPS</strong>：完整块奖励+交易费</li></ul><h3>选择建议</h3><p>考虑矿池稳定性、费率、支付门槛、所在地区和声誉。</p>` },
      { title: '挖矿收益计算', duration: '22分钟', completed: false, content: `<h2>挖矿收益分析</h2><h3>影响收益的因素</h3><ul><li><strong>算力</strong>：你的矿机计算能力</li><li><strong>网络难度</strong>：全网算力越高，难度越大</li><li><strong>币价</strong>：直接影响法币收益</li><li><strong>电费</strong>：最大的运营成本</li><li><strong>矿池费率</strong>：通常1-3%</li></ul><h3>收益公式</h3><p>日收益 = (你的算力 / 全网算力) × 日产出总量 × 币价 - 电费 - 其他成本</p><h3>关键指标</h3><ul><li><strong>回本周期</strong>：矿机成本 / 日净收益</li><li><strong>关机币价</strong>：收益刚好覆盖电费的币价</li></ul><h3>实用工具</h3><p>使用在线挖矿计算器（如WhatToMine、CryptoCompare）估算收益，输入算力、功耗、电费即可。</p>` },
      { title: '矿场建设与运维', duration: '25分钟', completed: false, content: `<h2>矿场运营指南</h2><h3>选址要素</h3><ul><li><strong>电力成本</strong>：最关键因素，寻找低电价地区</li><li><strong>气候条件</strong>：寒冷地区降低散热成本</li><li><strong>网络稳定</strong>：确保低延迟连接</li><li><strong>政策环境</strong>：了解当地法规</li></ul><h3>基础设施</h3><ul><li><strong>电力系统</strong>：变压器、配电柜、UPS</li><li><strong>散热系统</strong>：风冷或水冷</li><li><strong>监控系统</strong>：温度、算力、网络监控</li><li><strong>消防安全</strong>：必备设施</li></ul><h3>日常运维</h3><ol><li>定期巡检设备状态</li><li>清理灰尘，保持散热效率</li><li>监控算力波动，及时排查故障</li><li>关注电费账单和币价变化</li><li>固件更新和安全维护</li></ol>` },
      { title: '挖矿风险与应对', duration: '18分钟', completed: false, content: `<h2>挖矿风险管理</h2><h3>主要风险</h3><ul><li><strong>币价下跌</strong>：收益可能无法覆盖成本</li><li><strong>难度上升</strong>：全网算力增加导致收益下降</li><li><strong>政策风险</strong>：部分国家限制或禁止挖矿</li><li><strong>设备折旧</strong>：矿机更新换代快</li><li><strong>运营风险</strong>：停电、设备故障等</li></ul><h3>风险应对</h3><ol><li><strong>套期保值</strong>：用期货锁定未来币价</li><li><strong>分散布局</strong>：不要把所有矿机放在一个地方</li><li><strong>成本控制</strong>：持续优化电费和运维成本</li><li><strong>现金流管理</strong>：保持充足流动性</li><li><strong>及时止损</strong>：关机币价到达时果断决策</li></ol>` },
      { title: '云挖矿与算力租赁', duration: '15分钟', completed: false, content: `<h2>云挖矿：无需矿机的挖矿方式</h2><h3>什么是云挖矿？</h3><p>租用他人的矿机算力进行挖矿，无需购买和维护硬件。</p><h3>优势</h3><ul><li>无需购买昂贵的矿机</li><li>无需处理噪音、散热问题</li><li>无需担心电费和运维</li><li>门槛低，随时开始</li></ul><h3>风险</h3><ul><li>骗局风险：许多云挖矿平台是庞氏骗局</li><li>收益不透明</li><li>无法控制硬件</li><li>合同条款可能不利</li></ul><h3>选择建议</h3><p>如果要尝试云挖矿，选择知名矿池或交易所提供的云算力产品，如：</p><ul><li>币安云挖矿</li><li>比特小鹿（BitDeer）</li><li>Genesis Mining</li></ul><p>务必小心，做好亏损准备。</p>` },
      { title: '其他挖矿方式', duration: '20分钟', completed: false, content: `<h2>挖矿的多样化选择</h2><h3>权益证明（PoS）质押</h3><p>不需要算力，通过锁定代币获得收益：</p><ul><li>以太坊2.0质押</li><li>Cardano（ADA）质押</li><li>Solana（SOL）质押</li></ul><h3>流动性挖矿</h3><p>在DeFi协议中提供流动性获得奖励：</p><ul><li>Uniswap、Curve等DEX</li><li>借贷协议如Aave、Compound</li></ul><h3>硬盘挖矿</h3><p>使用硬盘存储空间挖矿：</p><ul><li>Chia（奇亚）</li><li>Filecoin</li></ul><h3>手机挖矿</h3><p>警告：大多数"手机挖矿"都是骗局。真正的挖矿需要大量算力，手机无法完成。</p><h3>选择建议</h3><p>根据自己的资源（资金、设备、电力）选择合适的挖矿方式，PoS质押是入门友好的选择。</p>` }
    ]
  },
  { 
    id: 3, 
    icon: 'ETH', 
    title: '以太坊与智能合约', 
    description: '掌握以太坊生态、智能合约原理、DeFi应用及NFT基础知识。', 
    level: '进阶', 
    lessons: 10, 
    duration: '4h', 
    students: '2,156', 
    category: 'technical',
    lessons_detail: [
      { title: '以太坊简介', duration: '20分钟', completed: false, content: `<h2>以太坊：可编程的区块链</h2><p>以太坊（Ethereum）由Vitalik Buterin于2013年提出，2015年上线。它不仅是加密货币，更是一个去中心化的计算平台。</p><h3>以太坊 vs 比特币</h3><ul><li><strong>比特币</strong>：数字黄金，主要用于价值储存</li><li><strong>以太坊</strong>：世界计算机，可运行去中心化应用</li></ul><h3>核心创新</h3><ul><li><strong>智能合约</strong>：自动执行的代码协议</li><li><strong>EVM</strong>：以太坊虚拟机，运行智能合约</li><li><strong>Gas</strong>：支付计算资源的费用</li><li><strong>代币标准</strong>：ERC-20、ERC-721等</li></ul><h3>ETH 2.0升级</h3><p>以太坊已从PoW转向PoS共识机制，大幅降低能耗，提高扩展性。</p>` },
      { title: '智能合约原理', duration: '25分钟', completed: false, content: `<h2>智能合约：代码即法律</h2><p>智能合约是存储在区块链上的程序，当预设条件满足时自动执行。</p><h3>特点</h3><ul><li><strong>自动执行</strong>：无需人工干预</li><li><strong>不可篡改</strong>：部署后代码不可更改</li><li><strong>透明公开</strong>：任何人都可查看</li><li><strong>去信任化</strong>：不依赖第三方</li></ul><h3>应用场景</h3><ul><li>去中心化金融（DeFi）</li><li>NFT铸造和交易</li><li>DAO治理投票</li><li>游戏道具和虚拟资产</li><li>供应链溯源</li></ul><h3>编程语言</h3><p>Solidity是以太坊智能合约的主要编程语言，语法类似JavaScript。</p>` },
      { title: 'DeFi去中心化金融', duration: '25分钟', completed: false, content: `<h2>DeFi：金融的未来</h2><p>DeFi（Decentralized Finance）是基于区块链的金融服务生态系统。</p><h3>主要应用</h3><ul><li><strong>DEX去中心化交易所</strong>：Uniswap、SushiSwap</li><li><strong>借贷协议</strong>：Aave、Compound</li><li><strong>稳定币</strong>：DAI、USDC</li><li><strong>收益聚合器</strong>：Yearn Finance</li><li><strong>衍生品</strong>：dYdX、GMX</li></ul><h3>DeFi的优势</h3><ul><li>无需许可，人人可用</li><li>透明，代码开源</li><li>可组合，协议之间可互操作</li><li>全天候运行</li></ul><h3>风险</h3><ul><li>智能合约漏洞</li><li>无常损失</li><li>清算风险</li><li>监管不确定性</li></ul>` },
      { title: 'NFT数字藏品', duration: '20分钟', completed: false, content: `<h2>NFT：独一无二的数字资产</h2><p>NFT（Non-Fungible Token）非同质化代币，每个都是独特的。</p><h3>NFT vs 加密货币</h3><ul><li><strong>加密货币</strong>：可互换，1 BTC = 1 BTC</li><li><strong>NFT</strong>：独特，每个都不同</li></ul><h3>应用领域</h3><ul><li><strong>数字艺术</strong>：Beeple、CryptoPunks</li><li><strong>游戏道具</strong>：Axie Infinity</li><li><strong>音乐/视频</strong>：创作者版税</li><li><strong>域名</strong>：ENS以太坊域名</li><li><strong>会员权益</strong>：社区准入</li></ul><h3>主要平台</h3><ul><li>OpenSea</li><li>Blur</li><li>Magic Eden</li></ul>` },
      { title: '以太坊钱包使用', duration: '20分钟', completed: false, content: `<h2>以太坊钱包指南</h2><h3>热门钱包</h3><ul><li><strong>MetaMask</strong>：最流行的浏览器钱包</li><li><strong>Trust Wallet</strong>：币安支持的移动钱包</li><li><strong>Rainbow</strong>：用户友好的移动钱包</li><li><strong>Ledger/Trezor</strong>：硬件钱包</li></ul><h3>MetaMask使用教程</h3><ol><li>安装浏览器扩展或移动App</li><li>创建新钱包，备份助记词</li><li>添加网络（以太坊主网、L2等）</li><li>接收或购买ETH</li><li>连接DApp进行交互</li></ol><h3>Gas费优化</h3><ul><li>选择网络空闲时段交易</li><li>使用L2如Arbitrum、Optimism</li><li>合理设置Gas Price</li></ul>` },
      { title: 'Layer 2扩容方案', duration: '22分钟', completed: false, content: `<h2>Layer 2：解决以太坊拥堵</h2><p>L2是建立在以太坊之上的扩容方案，提供更快更便宜的交易。</p><h3>主要L2类型</h3><ul><li><strong>Optimistic Rollups</strong>：Arbitrum、Optimism、Base</li><li><strong>ZK Rollups</strong>：zkSync、StarkNet、Polygon zkEVM</li><li><strong>Validium</strong>：数据存储在链下</li></ul><h3>L2 vs 主网</h3><table><tr><td></td><td>主网</td><td>L2</td></tr><tr><td>Gas费</td><td>$5-50+</td><td>$0.01-0.5</td></tr><tr><td>速度</td><td>12秒</td><td>即时确认</td></tr><tr><td>安全性</td><td>最高</td><td>继承主网安全</td></tr></table><h3>如何使用L2</h3><ol><li>在MetaMask添加L2网络</li><li>通过跨链桥将资产转入L2</li><li>在L2上进行交易和DApp交互</li></ol>` },
      { title: '以太坊质押指南', duration: '18分钟', completed: false, content: `<h2>ETH质押：获取稳定收益</h2><p>以太坊转为PoS后，持有者可以质押ETH获得收益。</p><h3>质押方式</h3><ul><li><strong>独立验证者</strong>：需要32 ETH，运行节点</li><li><strong>质押池</strong>：如Lido、Rocket Pool，无最低门槛</li><li><strong>交易所质押</strong>：最便捷，但需信任交易所</li></ul><h3>Lido质押教程</h3><ol><li>访问stake.lido.fi</li><li>连接钱包</li><li>输入质押ETH数量</li><li>获得stETH代币</li><li>stETH可在DeFi中使用</li></ol><h3>收益与风险</h3><ul><li>年化收益约3-5%</li><li>Slashing惩罚风险</li><li>智能合约风险</li><li>流动性风险</li></ul>` },
      { title: '以太坊生态项目', duration: '20分钟', completed: false, content: `<h2>以太坊生态全景</h2><h3>DeFi龙头</h3><ul><li><strong>Uniswap</strong>：最大DEX</li><li><strong>Aave</strong>：领先借贷协议</li><li><strong>MakerDAO</strong>：DAI稳定币发行方</li><li><strong>Lido</strong>：最大质押协议</li></ul><h3>基础设施</h3><ul><li><strong>Chainlink</strong>：预言机</li><li><strong>The Graph</strong>：数据索引</li><li><strong>ENS</strong>：域名服务</li></ul><h3>NFT平台</h3><ul><li><strong>OpenSea</strong>：最大NFT市场</li><li><strong>Blur</strong>：专业交易平台</li></ul><h3>工具</h3><ul><li><strong>Etherscan</strong>：区块浏览器</li><li><strong>DefiLlama</strong>：TVL追踪</li><li><strong>Dune</strong>：数据分析</li></ul>` },
      { title: '智能合约安全', duration: '22分钟', completed: false, content: `<h2>智能合约安全指南</h2><h3>常见漏洞</h3><ul><li><strong>重入攻击</strong>：DAO事件的罪魁祸首</li><li><strong>整数溢出</strong>：数值计算错误</li><li><strong>权限控制</strong>：未正确限制访问</li><li><strong>逻辑漏洞</strong>：业务逻辑缺陷</li></ul><h3>用户安全建议</h3><ol><li>只与经过审计的协议交互</li><li>检查合约是否开源</li><li>关注TVL和历史记录</li><li>使用小额测试</li><li>警惕高收益诱惑</li></ol><h3>安全工具</h3><ul><li><strong>Revoke.cash</strong>：撤销授权</li><li><strong>DeBank</strong>：查看钱包风险</li><li><strong>Token Sniffer</strong>：代币安全检测</li></ul>` },
      { title: '以太坊投资策略', duration: '18分钟', completed: false, content: `<h2>ETH投资分析</h2><h3>价值来源</h3><ul><li>智能合约平台龙头</li><li>DeFi和NFT的基础设施</li><li>转PoS后通缩压力</li><li>机构采用增加</li></ul><h3>投资策略</h3><ul><li><strong>长期持有</strong>：看好以太坊生态发展</li><li><strong>定投</strong>：降低择时风险</li><li><strong>质押</strong>：持币同时获得收益</li><li><strong>参与生态</strong>：使用DeFi、空投机会</li></ul><h3>风险因素</h3><ul><li>竞争链崛起（Solana等）</li><li>监管风险</li><li>技术风险</li><li>市场周期</li></ul><h3>估值参考</h3><p>关注指标：TVL、活跃地址、Gas消耗、ETH销毁量、质押比例等。</p>` }
    ]
  },
  { 
    id: 4, 
    icon: 'K线', 
    title: '技术分析与K线', 
    description: '学习加密货币技术分析方法，掌握K线形态、指标应用和交易策略。', 
    level: '进阶', 
    lessons: 12, 
    duration: '5h', 
    students: '4,567', 
    category: 'technical',
    lessons_detail: [
      { title: 'K线基础', duration: '20分钟', completed: false, content: `<h2>K线图：价格的语言</h2><p>K线图是展示价格走势的最直观方式，每根K线代表一个时间周期的价格变动。</p><h3>K线组成</h3><ul><li><strong>开盘价</strong>：周期开始时的价格</li><li><strong>收盘价</strong>：周期结束时的价格</li><li><strong>最高价</strong>：周期内的最高价格</li><li><strong>最低价</strong>：周期内的最低价格</li></ul><h3>颜色含义</h3><ul><li><strong>绿色/红色（涨）</strong>：收盘价 > 开盘价</li><li><strong>红色/绿色（跌）</strong>：收盘价 < 开盘价</li></ul><h3>时间周期</h3><p>1分钟、5分钟、1小时、4小时、日线、周线等。短线看小周期，长线看大周期。</p>` },
      { title: '支撑与阻力', duration: '22分钟', completed: false, content: `<h2>支撑与阻力：关键价格位</h2><h3>支撑位</h3><p>价格下跌时可能停止的位置，因为买盘增加：</p><ul><li>前期低点</li><li>整数关口（如$10000）</li><li>移动平均线</li><li>趋势线</li></ul><h3>阻力位</h3><p>价格上涨时可能遇阻的位置，因为卖盘增加：</p><ul><li>前期高点</li><li>心理关口</li><li>密集成交区</li></ul><h3>支撑阻力转换</h3><p>突破阻力后，该位置往往变成支撑；跌破支撑后，该位置变成阻力。</p><h3>实战应用</h3><ul><li>支撑位买入，阻力位卖出</li><li>突破阻力位追涨</li><li>跌破支撑位止损</li></ul>` },
      { title: '趋势线与通道', duration: '20分钟', completed: false, content: `<h2>趋势线：顺势而为</h2><h3>趋势类型</h3><ul><li><strong>上升趋势</strong>：高点和低点不断抬高</li><li><strong>下降趋势</strong>：高点和低点不断降低</li><li><strong>横盘整理</strong>：价格在区间内波动</li></ul><h3>画趋势线</h3><ul><li>上升趋势线：连接两个以上的低点</li><li>下降趋势线：连接两个以上的高点</li><li>至少需要两个点，三个点以上更可靠</li></ul><h3>通道</h3><p>平行的趋势线构成通道：</p><ul><li>上升通道：在通道下沿买入，上沿卖出</li><li>下降通道：在通道上沿做空，下沿平仓</li></ul><h3>趋势突破</h3><p>突破趋势线往往预示趋势反转，是重要的交易信号。</p>` },
      { title: '经典K线形态', duration: '25分钟', completed: false, content: `<h2>K线形态识别</h2><h3>反转形态</h3><ul><li><strong>锤子线/上吊线</strong>：下影线长，可能反转</li><li><strong>吞没形态</strong>：大阳吞没阴线看涨</li><li><strong>十字星</strong>：犹豫信号，可能变盘</li><li><strong>早晨之星/黄昏之星</strong>：三根K线组合反转信号</li></ul><h3>持续形态</h3><ul><li><strong>三连阳/三连阴</strong>：趋势延续</li><li><strong>旗形/三角形</strong>：整理后继续原趋势</li></ul><h3>顶底形态</h3><ul><li><strong>双顶/双底</strong>：M顶、W底</li><li><strong>头肩顶/头肩底</strong>：经典反转形态</li><li><strong>圆弧顶/圆弧底</strong>：缓慢反转</li></ul><h3>注意事项</h3><p>形态需要结合成交量和趋势位置综合判断，单独形态准确率有限。</p>` },
      { title: '移动平均线', duration: '22分钟', completed: false, content: `<h2>均线：趋势的指南针</h2><h3>常用均线</h3><ul><li><strong>MA5/MA10</strong>：短期趋势</li><li><strong>MA20</strong>：中期趋势</li><li><strong>MA50/MA60</strong>：中长期趋势</li><li><strong>MA200</strong>：长期趋势，牛熊分界</li></ul><h3>均线类型</h3><ul><li><strong>SMA</strong>：简单移动平均</li><li><strong>EMA</strong>：指数移动平均，对近期价格更敏感</li></ul><h3>均线策略</h3><ul><li><strong>金叉</strong>：短期均线上穿长期均线，看涨</li><li><strong>死叉</strong>：短期均线下穿长期均线，看跌</li><li><strong>均线支撑</strong>：价格回踩均线后反弹</li></ul><h3>注意</h3><p>均线是滞后指标，在震荡市场中信号较多噪音。结合其他指标使用效果更好。</p>` },
      { title: 'RSI相对强弱指标', duration: '20分钟', completed: false, content: `<h2>RSI：超买超卖信号</h2><p>RSI（Relative Strength Index）衡量价格变动的速度和幅度。</p><h3>计算方法</h3><p>RSI = 100 - 100/(1+RS)</p><p>RS = 平均上涨幅度 / 平均下跌幅度</p><h3>信号解读</h3><ul><li><strong>RSI > 70</strong>：超买区，可能回调</li><li><strong>RSI < 30</strong>：超卖区，可能反弹</li><li><strong>RSI = 50</strong>：多空平衡</li></ul><h3>背离信号</h3><ul><li><strong>顶背离</strong>：价格创新高，RSI未创新高→看跌</li><li><strong>底背离</strong>：价格创新低，RSI未创新低→看涨</li></ul><h3>使用建议</h3><ul><li>在震荡市场中效果好</li><li>强趋势中RSI可能长期超买/超卖</li><li>结合趋势判断使用</li></ul>` },
      { title: 'MACD指标详解', duration: '22分钟', completed: false, content: `<h2>MACD：趋势动量指标</h2><p>MACD（Moving Average Convergence Divergence）是最常用的技术指标之一。</p><h3>组成部分</h3><ul><li><strong>DIF（快线）</strong>：12日EMA - 26日EMA</li><li><strong>DEA（慢线）</strong>：DIF的9日EMA</li><li><strong>柱状图</strong>：DIF - DEA</li></ul><h3>交易信号</h3><ul><li><strong>金叉</strong>：DIF上穿DEA，买入信号</li><li><strong>死叉</strong>：DIF下穿DEA，卖出信号</li><li><strong>零轴上方</strong>：多头市场</li><li><strong>零轴下方</strong>：空头市场</li></ul><h3>MACD背离</h3><p>与RSI类似，价格与MACD背离是重要的反转信号。</p><h3>实战技巧</h3><ul><li>零轴上方金叉更可靠</li><li>结合成交量确认</li><li>大周期判断方向，小周期找入场点</li></ul>` },
      { title: '布林带', duration: '18分钟', completed: false, content: `<h2>布林带：波动率通道</h2><p>布林带（Bollinger Bands）由三条线组成，反映价格波动范围。</p><h3>组成</h3><ul><li><strong>中轨</strong>：20日移动平均线</li><li><strong>上轨</strong>：中轨 + 2倍标准差</li><li><strong>下轨</strong>：中轨 - 2倍标准差</li></ul><h3>信号解读</h3><ul><li>价格触及上轨：可能超买</li><li>价格触及下轨：可能超卖</li><li>布林带收窄：即将突破</li><li>布林带扩张：趋势加速</li></ul><h3>交易策略</h3><ul><li><strong>震荡市</strong>：上轨卖出，下轨买入</li><li><strong>趋势市</strong>：沿着轨道运行，不要逆势</li><li><strong>突破</strong>：收窄后的突破往往是大行情</li></ul>` },
      { title: '成交量分析', duration: '20分钟', completed: false, content: `<h2>成交量：价格的引擎</h2><p>成交量反映市场参与度，是验证趋势的重要工具。</p><h3>量价关系</h3><ul><li><strong>放量上涨</strong>：健康的上升趋势</li><li><strong>缩量上涨</strong>：上涨动力不足</li><li><strong>放量下跌</strong>：恐慌性抛售</li><li><strong>缩量下跌</strong>：下跌动力减弱</li></ul><h3>成交量形态</h3><ul><li><strong>天量天价</strong>：可能见顶</li><li><strong>地量地价</strong>：可能见底</li><li><strong>突破放量</strong>：有效突破</li><li><strong>突破缩量</strong>：假突破风险</li></ul><h3>常用指标</h3><ul><li><strong>OBV</strong>：能量潮指标</li><li><strong>成交量均线</strong>：判断量能趋势</li></ul>` },
      { title: '斐波那契回调', duration: '22分钟', completed: false, content: `<h2>斐波那契：黄金比例交易</h2><p>斐波那契回调基于数学比例，用于预测支撑阻力位。</p><h3>关键比例</h3><ul><li><strong>23.6%</strong>：浅回调</li><li><strong>38.2%</strong>：常见回调位</li><li><strong>50%</strong>：重要心理位</li><li><strong>61.8%</strong>：黄金分割位，最重要</li><li><strong>78.6%</strong>：深度回调</li></ul><h3>使用方法</h3><ol><li>确定一波明显的趋势</li><li>从起点画到终点</li><li>回调时关注各比例位置</li><li>结合其他支撑阻力确认</li></ol><h3>斐波那契扩展</h3><p>用于预测趋势目标位：127.2%、161.8%、261.8%</p><h3>注意事项</h3><p>斐波那契是辅助工具，不是万能预测器。需要结合其他分析方法。</p>` },
      { title: '交易策略制定', duration: '25分钟', completed: false, content: `<h2>构建你的交易系统</h2><h3>策略要素</h3><ul><li><strong>入场条件</strong>：什么时候买入</li><li><strong>出场条件</strong>：什么时候卖出</li><li><strong>止损设置</strong>：最大可接受亏损</li><li><strong>仓位管理</strong>：每次投入多少</li></ul><h3>常见策略</h3><ul><li><strong>趋势跟踪</strong>：顺势而为，突破买入</li><li><strong>均值回归</strong>：超卖买入，超买卖出</li><li><strong>突破策略</strong>：关键位置突破入场</li><li><strong>网格交易</strong>：固定区间买卖</li></ul><h3>回测验证</h3><p>在历史数据上测试策略，评估胜率、盈亏比、最大回撤。</p><h3>纪律执行</h3><ul><li>严格按策略执行</li><li>记录每笔交易</li><li>定期复盘优化</li><li>控制情绪，不要报复性交易</li></ul>` },
      { title: '风险管理', duration: '20分钟', completed: false, content: `<h2>交易风控：活下去最重要</h2><h3>核心原则</h3><ul><li>永远不要全仓操作</li><li>设置止损，限制单笔亏损</li><li>不要让盈利变亏损</li><li>保护本金是第一要务</li></ul><h3>仓位管理</h3><ul><li><strong>固定金额法</strong>：每次投入固定金额</li><li><strong>固定比例法</strong>：每次投入总资金的固定比例</li><li><strong>凯利公式</strong>：根据胜率优化仓位</li></ul><h3>止损方法</h3><ul><li><strong>固定止损</strong>：亏损X%止损</li><li><strong>技术止损</strong>：跌破支撑位止损</li><li><strong>移动止损</strong>：随盈利提高止损位</li></ul><h3>情绪管理</h3><ul><li>亏损后不要急于回本</li><li>盈利后不要过度自信</li><li>保持冷静，理性决策</li></ul>` }
    ]
  },
  { 
    id: 5, 
    icon: '安全', 
    title: '加密资产安全', 
    description: '学习加密货币安全知识，保护你的数字资产免受黑客和诈骗威胁。', 
    level: '入门', 
    lessons: 6, 
    duration: '2h', 
    students: '6,789', 
    category: 'security',
    lessons_detail: [
      { title: '私钥与助记词', duration: '18分钟', completed: false, content: `<h2>私钥：你的数字资产钥匙</h2><p>掌握私钥就是掌握资产，这是加密货币最重要的安全概念。</p><h3>私钥是什么？</h3><p>私钥是一串256位的随机数，是你访问和控制加密资产的唯一凭证。</p><h3>助记词</h3><p>12-24个英文单词，是私钥的人类可读形式。</p><h3>安全准则</h3><ul><li><strong>永远不要分享</strong>：没有任何正当理由需要你提供私钥/助记词</li><li><strong>离线备份</strong>：写在纸上，存放安全位置</li><li><strong>多重备份</strong>：至少2-3份，放在不同地点</li><li><strong>不要截图/拍照</strong>：可能被黑客获取</li><li><strong>不要存在云端</strong>：iCloud、Google Drive等</li></ul><h3>记住</h3><p>"Not your keys, not your coins"——私钥不在你手里，币就不是你的。</p>` },
      { title: '钱包安全设置', duration: '20分钟', completed: false, content: `<h2>钱包安全配置指南</h2><h3>热钱包安全</h3><ul><li>设置强密码</li><li>启用生物识别（指纹/面容）</li><li>定期检查已连接的DApp</li><li>只存储日常使用的金额</li></ul><h3>冷钱包使用</h3><ul><li>从官方渠道购买硬件钱包</li><li>首次使用时重置设备</li><li>验证设备是否被篡改</li><li>大额资产使用冷钱包存储</li></ul><h3>多签钱包</h3><p>需要多个私钥签名才能执行交易，适合：</p><ul><li>团队资金管理</li><li>大额个人资产</li><li>DAO金库</li></ul><h3>授权管理</h3><ul><li>定期检查代币授权</li><li>撤销不再使用的DApp授权</li><li>使用revoke.cash等工具</li></ul>` },
      { title: '常见骗局识别', duration: '22分钟', completed: false, content: `<h2>骗局防范：保护你的资产</h2><h3>钓鱼攻击</h3><ul><li>假冒官网（检查URL）</li><li>假冒客服（官方不会私聊要密码）</li><li>假空投（不要连接可疑网站）</li></ul><h3>诈骗类型</h3><ul><li><strong>Rug Pull</strong>：项目方卷款跑路</li><li><strong>蜜罐骗局</strong>：只能买入不能卖出的代币</li><li><strong>假代币</strong>：仿冒知名项目的空气币</li><li><strong>杀猪盘</strong>：交友诱导投资的骗局</li></ul><h3>识别信号</h3><ul><li>承诺高额固定收益</li><li>要求转账到个人地址</li><li>催促立即行动</li><li>项目方匿名</li><li>代码未审计</li></ul><h3>安全原则</h3><p>如果听起来好得不像真的，那它很可能就不是真的。</p>` },
      { title: '交易所安全', duration: '18分钟', completed: false, content: `<h2>交易所账户安全</h2><h3>选择交易所</h3><ul><li>选择主流合规交易所</li><li>检查是否有储备金证明</li><li>了解保险和赔付政策</li></ul><h3>账户安全设置</h3><ul><li><strong>强密码</strong>：16位以上，含大小写数字符号</li><li><strong>2FA双重验证</strong>：优先使用Google Authenticator</li><li><strong>防钓鱼码</strong>：设置邮件识别码</li><li><strong>提币白名单</strong>：限制提币地址</li><li><strong>登录提醒</strong>：开启新设备登录通知</li></ul><h3>使用建议</h3><ul><li>不要把所有资产放在交易所</li><li>定期提币到自己的钱包</li><li>分散存放在多个交易所</li><li>关注交易所公告和安全事件</li></ul>` },
      { title: '网络安全基础', duration: '20分钟', completed: false, content: `<h2>上网安全守则</h2><h3>设备安全</h3><ul><li>及时更新操作系统</li><li>安装杀毒软件</li><li>不要下载来路不明的软件</li><li>使用专用设备处理大额交易</li></ul><h3>网络安全</h3><ul><li><strong>避免公共WiFi</strong>：使用VPN或移动网络</li><li><strong>HTTPS</strong>：确认网站使用加密连接</li><li><strong>DNS</strong>：使用安全的DNS服务</li></ul><h3>浏览器安全</h3><ul><li>使用主流浏览器最新版</li><li>安装广告拦截插件</li><li>检查MetaMask等扩展是否官方版</li><li>定期清理浏览器缓存</li></ul><h3>邮箱安全</h3><ul><li>为加密相关账户使用专用邮箱</li><li>启用2FA</li><li>警惕钓鱼邮件</li></ul>` },
      { title: '资产继承方案', duration: '15分钟', completed: false, content: `<h2>数字资产传承规划</h2><p>如果你发生意外，你的加密资产能否被家人找到和使用？</p><h3>问题</h3><ul><li>私钥只有你知道</li><li>家人可能不懂加密货币</li><li>资产可能永久丢失</li></ul><h3>解决方案</h3><ul><li><strong>教育家人</strong>：基础的加密货币知识</li><li><strong>文档记录</strong>：写下资产清单和访问方法</li><li><strong>安全存放</strong>：将信息存放在保险箱或律师处</li><li><strong>多签设置</strong>：家人持有部分密钥</li></ul><h3>Shamir秘密共享</h3><p>将助记词拆分成多份，需要一定数量才能恢复。例如：3份中需要2份。</p><h3>服务商</h3><ul><li>Casa：多签继承方案</li><li>Vault12：数字资产守护</li></ul><p>提前规划，确保资产可以传承。</p>` }
    ]
  },
  { 
    id: 6, 
    icon: 'ALT', 
    title: '山寨币投资指南', 
    description: '了解主流山寨币，学会评估新项目，掌握投资策略和风险控制。', 
    level: '高级', 
    lessons: 8, 
    duration: '3.5h', 
    students: '1,876', 
    category: 'advanced', 
    locked: true,
    lessons_detail: [
      { title: '山寨币概述', duration: '18分钟', locked: true, content: '' },
      { title: '项目评估方法', duration: '25分钟', locked: true, content: '' },
      { title: '代币经济学分析', duration: '22分钟', locked: true, content: '' },
      { title: '主流公链对比', duration: '20分钟', locked: true, content: '' },
      { title: 'Meme币投资', duration: '18分钟', locked: true, content: '' },
      { title: '空投策略', duration: '22分钟', locked: true, content: '' },
      { title: 'IDO/IEO参与', duration: '20分钟', locked: true, content: '' },
      { title: '山寨币周期', duration: '18分钟', locked: true, content: '' }
    ]
  },
  { 
    id: 7, 
    icon: 'QT', 
    title: '量化交易入门', 
    description: '学习量化交易基础，了解交易机器人、API接口和自动化策略。', 
    level: '高级', 
    lessons: 10, 
    duration: '5h', 
    students: '987', 
    category: 'advanced', 
    locked: true,
    lessons_detail: [
      { title: '量化交易概述', duration: '20分钟', locked: true, content: '' },
      { title: '交易API入门', duration: '25分钟', locked: true, content: '' },
      { title: '网格交易策略', duration: '22分钟', locked: true, content: '' },
      { title: '套利策略', duration: '20分钟', locked: true, content: '' },
      { title: '趋势跟踪策略', duration: '25分钟', locked: true, content: '' },
      { title: 'Python量化基础', duration: '30分钟', locked: true, content: '' },
      { title: '回测与优化', duration: '25分钟', locked: true, content: '' },
      { title: '风控系统', duration: '20分钟', locked: true, content: '' },
      { title: '交易机器人部署', duration: '25分钟', locked: true, content: '' },
      { title: '实盘注意事项', duration: '18分钟', locked: true, content: '' }
    ]
  }
])

const filteredCourses = computed(() => {
  return featuredCourses.value
})

const filteredNewsList = computed(() => {
  return newsList.value
})

const filteredLearnList = computed(() => {
  if (learnFilter.value === 'all') return learnList.value
  return learnList.value.filter(item => {
    const category = (item.category || '').toLowerCase()
    if (learnFilter.value === 'basics') return category.includes('入门') || category.includes('基础')
    if (learnFilter.value === 'technical') return category.includes('技术') || category.includes('K线')
    if (learnFilter.value === 'fundamentals') return category.includes('基本面') || category.includes('分析')
    if (learnFilter.value === 'risk') return category.includes('风险') || category.includes('管理')
    return true
  })
})

const fmt = n => { if (!n) return ''; if (n >= 10000) return (n / 10000).toFixed(1) + 'w'; if (n >= 1000) return (n / 1000).toFixed(1) + 'k'; return n }

const getLevelClass = (level) => {
  if (level === '入门') return 'beginner'
  if (level === '进阶') return 'intermediate'
  if (level === '高级') return 'advanced'
  return 'beginner'
}

const getSourceColor = (source) => {
  if (!source) return 'gold'
  const s = source.toLowerCase()
  if (s.includes('金十') || s.includes('jin10')) return 'red'
  if (s.includes('财联社') || s.includes('cls')) return 'orange'
  if (s.includes('华尔街') || s.includes('wall')) return 'blue'
  if (s.includes('bloomberg') || s.includes('彭博')) return 'purple'
  return 'gold'
}

const getSrcClass = (source) => {
  if (!source) return 'src-default'
  const s = source.toLowerCase()
  if (s.includes('金十')) return 'src-jin10'
  if (s.includes('财联社')) return 'src-cls'
  if (s.includes('华尔街')) return 'src-wsj'
  return 'src-default'
}

const goSearch = () => router.push('/search')
const goPost = p => router.push('/post/' + p.id)
const goTopic = t => router.push('/topic/1?name=' + encodeURIComponent(t))

const goCreate = async () => {
  try {
    const result = await api.square.checkPostCondition()
    if (result.success && result.data) {
      if (!result.data.canPost) { await alert(result.data.reason || '您暂时无法发帖'); return }
      if (result.data.rateLimited) { await alert('发帖过于频繁，请稍后再试'); return }
    }
  } catch (e) { console.log('发帖条件检查失败') }
  router.push('/create-post')
}

const like = p => likePost(p)
const follow = async (p) => {
  // 乐观更新
  p.isFollowing = true
  try {
    await api.square.follow({ targetUserId: p.authorId || p.userId })
  } catch (e) {
    // 回滚
    p.isFollowing = false
    console.error('关注失败', e)
  }
}
const share = p => navigator.share?.({ title: 'AGX', text: p.content?.slice(0, 100), url: location.origin + '/post/' + p.id })
const openNews = async (n) => { if (n.url) { window.open(n.url, '_blank') } else { await alert(n.content || n.text || n.title || '暂无详细内容') } }
const openCourse = async (course) => {
  if (course.locked) { await alert('请升级VIP解锁高级课程'); return }
  selectedCourse.value = course
  showCourseModal.value = true
}

const closeCourseModal = () => {
  showCourseModal.value = false
  selectedCourse.value = null
}

const openLesson = (lesson) => {
  if (lesson.locked) { alert('请先解锁课程'); return }
  currentLesson.value = lesson
  currentLessonIndex.value = selectedCourse.value?.lessons_detail?.indexOf(lesson) || 0
  showLessonModal.value = true
}

const closeLessonModal = () => {
  showLessonModal.value = false
  currentLesson.value = null
}

const startLearning = () => {
  const lessons = selectedCourse.value?.lessons_detail
  if (!lessons?.length) return
  const firstIncomplete = lessons.find(l => !l.completed && !l.locked)
  if (firstIncomplete) {
    openLesson(firstIncomplete)
  } else {
    openLesson(lessons[0])
  }
}

const prevLesson = () => {
  if (currentLessonIndex.value > 0) {
    currentLessonIndex.value--
    currentLesson.value = selectedCourse.value?.lessons_detail?.[currentLessonIndex.value]
  }
}

const nextLesson = () => {
  const lessons = selectedCourse.value?.lessons_detail
  if (lessons && currentLessonIndex.value < lessons.length - 1) {
    currentLessonIndex.value++
    currentLesson.value = lessons[currentLessonIndex.value]
  }
}

const completeLesson = () => {
  if (currentLesson.value) {
    currentLesson.value.completed = true
    learnStats.value.lessons++
  }
}
const openLearn = item => item.url && window.open(item.url, '_blank')

const refreshData = async () => {
  isRefreshing.value = true
  await Promise.all([loadTopics(), loadPosts()])
  setTimeout(() => { isRefreshing.value = false }, 800)
}

// 快讯实时更新定时器
let newsRefreshTimer = null
const NEWS_REFRESH_INTERVAL = 30000 // 30秒刷新一次

const startNewsRefresh = () => {
  if (newsRefreshTimer) return
  newsRefreshTimer = setInterval(() => {
    if (tab.value === 'news') {
      loadNews()
    }
  }, NEWS_REFRESH_INTERVAL)
}

const stopNewsRefresh = () => {
  if (newsRefreshTimer) {
    clearInterval(newsRefreshTimer)
    newsRefreshTimer = null
  }
}

// 监听tab切换，加载对应数据
watch(tab, (newTab) => {
  if (newTab === 'feed' && !postsList.value.length) {
    loadPosts()
  } else if (newTab === 'following') {
    loadFollowing()
  } else if (newTab === 'news') {
    if (!newsList.value.length) {
      loadNews()
    }
    startNewsRefresh()
  } else {
    stopNewsRefresh()
  }
})

// 从API加载热门话题
const loadHotTopics = async () => {
  try {
    const topicsData = await topics.value
    if (topicsData?.length) {
      hotTopics.value = topicsData.map(t => t.name || t.tag).slice(0, 8)
    }
  } catch (e) {
    console.log('加载热门话题失败')
  }
}

onMounted(() => { 
  loadTopics()
  loadPosts()
  loadNews()
  loadHotTopics()
})

onUnmounted(() => {
  stopNewsRefresh()
})
</script>

<style scoped>
/* Base */
.square-page {
  min-height: 100vh;
  background: var(--bg-page, #0D1117);
  padding-bottom: 100px;
}

/* Tabs */
.tabs {
  background: linear-gradient(180deg, rgba(13, 17, 23, 0.98) 0%, rgba(13, 17, 23, 0.95) 100%);
  border-bottom: none;
  position: sticky;
  top: 0;
  z-index: 99;
  padding-top: env(safe-area-inset-top);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 1px 0 rgba(200, 170, 110, 0.1);
}

.tabs-track {
  display: flex;
  padding: 0 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tabs-track::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  position: relative;
  flex-shrink: 0;
  padding: 14px 18px;
  background: none;
  border: none;
  color: var(--text-tertiary, #8B949E);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.tab-btn.active {
  color: var(--color-brand, #C8AA6E);
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: linear-gradient(90deg, #C8AA6E, #E8D5A3);
  border-radius: 3px;
  box-shadow: 
    0 0 8px rgba(200, 170, 110, 0.6),
    0 0 16px rgba(200, 170, 110, 0.3);
}

/* Content */
.content {
  padding: 16px;
}

/* Quick Post */
.quick-post {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: none;
  border-radius: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* 顶部银色装饰线 */
.quick-post::before {
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
.quick-post::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
  z-index: 2;
}

.quick-post:active {
  transform: scale(0.98);
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 3px rgba(0, 0, 0, 0.15);
}

.quick-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-hover, rgba(200, 170, 110, 0.08));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-brand, #C8AA6E);
}

.quick-avatar svg {
  width: 20px;
  height: 20px;
}

.quick-input {
  flex: 1;
  color: var(--text-tertiary, #8B949E);
  font-size: 14px;
}

.quick-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), var(--color-brand-dark, #A08A5B));
  border: none;
  border-radius: 50%;
  color: var(--bg-page, #0D1117);
  cursor: pointer;
}

.quick-btn svg {
  width: 20px;
  height: 20px;
}

/* Hot Topics */
.hot-topics {
  position: relative;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: none;
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* 顶部银色装饰线 */
.hot-topics::before {
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
.hot-topics::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
  z-index: 2;
}

.hot-topics-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--color-brand, #C8AA6E);
  font-size: 14px;
  font-weight: 600;
}

.fire-icon {
  width: 18px;
  height: 18px;
}

.hot-topics-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
}

.hot-topics-scroll::-webkit-scrollbar {
  display: none;
}

.hot-topic-tag {
  flex-shrink: 0;
  padding: 6px 14px;
  background: var(--bg-hover, rgba(200, 170, 110, 0.08));
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
  border-radius: 20px;
  color: var(--text-secondary, #C9D1D9);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.hot-topic-tag:active {
  background: var(--bg-active, rgba(200, 170, 110, 0.15));
  color: var(--color-brand, #C8AA6E);
}

/* Posts */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-card {
  position: relative;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: none;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
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
  transform: scale(0.98);
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 3px rgba(0, 0, 0, 0.15);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.post-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--bg-hover, rgba(200, 170, 110, 0.08)), var(--bg-elevated, #1E262F));
  border: 2px solid var(--border-color, #2B3139);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.post-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-avatar.official-avatar {
  background: linear-gradient(135deg, #1E262F, #181F28);
  border: 2px solid var(--color-brand, #C8AA6E);
  padding: 4px;
}

.post-avatar .agx-logo {
  border-radius: 6px;
  object-fit: contain;
}

.avatar-letter {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), var(--color-brand-light, #E8D5A3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.post-meta {
  flex: 1;
  min-width: 0;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.author-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
}

.author-badge {
  padding: 2px 6px;
  border-radius: var(--radius-sm, 4px);
  font-size: 10px;
  font-weight: 600;
}

.author-badge.official {
  background: var(--bg-hover, rgba(200, 170, 110, 0.08));
  color: var(--color-brand, #C8AA6E);
}

.author-badge.verified {
  color: var(--color-info, #3B82F6);
}

.post-time {
  font-size: 12px;
  color: var(--text-tertiary, #8B949E);
}

.follow-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), var(--color-brand-dark, #A08A5B));
  border: none;
  border-radius: var(--radius-xl, 16px);
  color: var(--bg-page, #0D1117);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.follow-btn:active {
  transform: scale(0.95);
}

.post-text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-secondary, #C9D1D9);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Post Images */
.post-images {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
}

.post-images.img-1 { grid-template-columns: 1fr; }
.post-images.img-2 { grid-template-columns: repeat(2, 1fr); }
.post-images.img-3, .post-images.img-4 { grid-template-columns: repeat(2, 1fr); }

.post-img {
  position: relative;
  aspect-ratio: 1;
  background: var(--bg-secondary, #161B22);
}

.post-images.img-1 .post-img {
  aspect-ratio: 16/9;
}

.post-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-more {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 20px;
  font-weight: 700;
}

/* Tags */
.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.post-tag {
  padding: 4px 10px;
  background: var(--bg-hover, rgba(200, 170, 110, 0.08));
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
  border-radius: var(--radius-lg, 12px);
  color: var(--color-brand, #C8AA6E);
  font-size: 12px;
  cursor: pointer;
}

/* Actions */
.post-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: none;
  border: none;
  border-radius: 20px;
  color: var(--text-tertiary, #8B949E);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:active {
  background: var(--bg-hover, rgba(200, 170, 110, 0.08));
}

.action-btn.liked {
  color: var(--color-down, #F6465D);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

/* Empty State */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-hover, rgba(200, 170, 110, 0.08));
  border-radius: 50%;
  color: var(--color-brand, #C8AA6E);
  margin-bottom: 20px;
}

.empty-icon svg {
  width: 36px;
  height: 36px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-tertiary, #8B949E);
  margin-bottom: 24px;
}

.empty-btn {
  padding: 12px 28px;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), var(--color-brand-dark, #A08A5B));
  border: none;
  border-radius: 24px;
  color: var(--bg-page, #0D1117);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-md, 0 4px 8px rgba(0, 0, 0, 0.3));
}

/* News Section - 东方财经风格 */
.news-section {
  padding: 0;
}

.news-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
  margin-bottom: 12px;
}

.news-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.news-live-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(14, 203, 129, 0.15);
  border-radius: 4px;
  color: var(--color-success, #0ECB81);
  font-size: 12px;
  font-weight: 600;
}

.news-live-badge .live-dot {
  width: 6px;
  height: 6px;
  background: var(--color-success, #0ECB81);
  border-radius: 50%;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.news-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
}

.news-date-text {
  font-size: 13px;
  color: var(--text-tertiary, #8B949E);
}

/* News Tabs */
.news-tabs {
  display: flex;
  gap: 4px;
  padding: 6px;
  background: var(--bg-secondary, #161B22);
  border-radius: 8px;
  margin-bottom: 12px;
}

.news-tab-btn {
  flex: 1;
  padding: 8px 12px;
  background: none;
  border: none;
  border-radius: 6px;
  color: var(--text-tertiary, #8B949E);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.news-tab-btn.active {
  background: var(--bg-elevated, #1E262F);
  color: var(--color-brand, #C8AA6E);
  font-weight: 600;
}

/* News List */
.news-list {
  display: flex;
  flex-direction: column;
}

.news-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.04));
  cursor: pointer;
  transition: background 0.15s;
}

.news-row:active {
  background: var(--bg-hover, rgba(200, 170, 110, 0.06));
  margin: 0 -16px;
  padding: 12px 16px;
}

.news-row.hot {
  background: rgba(246, 70, 93, 0.05);
  margin: 0 -16px;
  padding: 12px 16px;
  border-radius: 6px;
}

.news-row-time {
  flex-shrink: 0;
  width: 40px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-tertiary, #8B949E);
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  padding-top: 2px;
}

.news-row-content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.news-src {
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
}

.news-src.src-jin10 {
  background: rgba(246, 70, 93, 0.15);
  color: #F6465D;
}

.news-src.src-cls {
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
}

.news-src.src-wsj {
  background: rgba(59, 130, 246, 0.15);
  color: #3B82F6;
}

.news-src.src-default {
  background: rgba(200, 170, 110, 0.15);
  color: var(--color-brand, #C8AA6E);
}

.news-row-text {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary, #C9D1D9);
  word-break: break-word;
}

.news-row.hot .news-row-text {
  color: var(--text-primary, #E6EDF3);
  font-weight: 500;
}

.news-hot-badge {
  flex-shrink: 0;
  padding: 1px 6px;
  background: var(--color-down, #F6465D);
  border-radius: 3px;
  color: white;
  font-size: 10px;
  font-weight: 700;
}

.news-empty {
  padding: 60px 0;
  text-align: center;
  color: var(--text-tertiary, #8B949E);
  font-size: 14px;
}

/* News Load More */
.news-more {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.news-more-btn {
  padding: 10px 24px;
  background: var(--bg-elevated, #1E262F);
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
  border-radius: 6px;
  color: var(--text-secondary, #C9D1D9);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.news-more-btn:active {
  background: var(--bg-surface, #21262D);
}

/* Education Section - New Design */
.learn-section {
  padding: 0;
}

.edu-banner {
  position: relative;
  background: linear-gradient(135deg, var(--bg-elevated, #1E262F) 0%, var(--bg-page, #0D1117) 100%);
  border-radius: var(--radius-xl, 16px);
  padding: 24px 20px;
  margin-bottom: 16px;
  overflow: hidden;
}

.edu-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(200, 170, 110, 0.15) 0%, transparent 70%);
}

.edu-banner-content {
  position: relative;
  z-index: 1;
}

.edu-vip-tag {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), var(--color-brand-dark, #A08A5B));
  border-radius: var(--radius-sm, 4px);
  color: var(--bg-page, #0D1117);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 10px;
}

.edu-banner-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-brand, #C8AA6E);
  margin-bottom: 6px;
}

.edu-banner-desc {
  font-size: 13px;
  color: var(--text-tertiary, #8B949E);
}

.edu-banner-logo {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  object-fit: contain;
  opacity: 0.9;
}

/* Stats */
.edu-stats {
  display: flex;
  background: var(--bg-secondary, #161B22);
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
  border-radius: var(--radius-lg, 12px);
  margin-bottom: 16px;
  overflow: hidden;
}

.edu-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border-right: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
}

.edu-stat:last-child {
  border-right: none;
}

.edu-stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary, #E6EDF3);
  line-height: 1;
}

.edu-stat-unit {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-brand, #C8AA6E);
  margin-left: 2px;
}

.edu-stat-label {
  font-size: 11px;
  color: var(--text-tertiary, #8B949E);
  margin-top: 6px;
}

/* Filters */
.edu-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.edu-filters::-webkit-scrollbar {
  display: none;
}

.edu-filter {
  flex-shrink: 0;
  padding: 8px 18px;
  background: rgba(200, 170, 110, 0.08);
  border: 1px solid rgba(200, 170, 110, 0.15);
  border-radius: 20px;
  color: #9ca3af;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.edu-filter.active {
  background: linear-gradient(135deg, #C8AA6E, #A08050);
  border-color: transparent;
  color: #0a0a0f;
  font-weight: 600;
}

/* Courses Header */
.edu-courses-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-left: 12px;
  border-left: 3px solid #C8AA6E;
}

.edu-courses-title {
  font-size: 16px;
  font-weight: 600;
  color: #f8fafc;
}

.edu-courses-count {
  font-size: 12px;
  color: #6b7280;
}

/* Course List */
.edu-course-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.edu-course-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* 顶部银色装饰线 */
.edu-course-card::before {
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
.edu-course-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
  z-index: 2;
}

.edu-course-card:active {
  transform: scale(0.98);
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 3px rgba(0, 0, 0, 0.15);
}

.edu-course-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.edu-course-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200, 170, 110, 0.1);
  border-radius: 12px;
}

.edu-icon-emoji {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-brand, #C8AA6E);
  font-family: 'DIN Alternate', monospace;
  letter-spacing: 0.5px;
}

.edu-course-level {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.edu-course-level.beginner {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.edu-course-level.intermediate {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.edu-course-level.advanced {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.edu-course-done {
  padding: 2px 6px;
  background: rgba(34, 197, 94, 0.15);
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
  color: #22c55e;
}

.edu-course-main {
  flex: 1;
  min-width: 0;
}

.edu-course-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.edu-course-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
  line-height: 1.3;
}

.edu-lock-icon {
  width: 16px;
  height: 16px;
  color: var(--text-tertiary, #848E9C);
  flex-shrink: 0;
}

.edu-course-desc {
  font-size: 12px;
  color: var(--text-secondary, #8B949E);
  line-height: 1.5;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.edu-course-meta {
  display: flex;
  gap: 14px;
}

.edu-meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-tertiary, #848E9C);
}

.edu-meta-item svg {
  width: 12px;
  height: 12px;
}

.edu-course-btn {
  flex-shrink: 0;
  padding: 10px 20px;
  background: linear-gradient(135deg, #C8AA6E, #A08050);
  border: none;
  border-radius: 8px;
  color: #0a0a0f;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  align-self: center;
  transition: all 0.2s;
}

.edu-course-btn.unlock {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: #f8fafc;
}

.edu-course-btn:active {
  transform: scale(0.95);
}

/* FAB */
.fab {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #C8AA6E, #A08050);
  border: none;
  border-radius: 16px;
  color: #0a0a0f;
  box-shadow: 
    0 6px 24px rgba(200, 170, 110, 0.5),
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  cursor: pointer;
  z-index: 90;
  transition: all 0.2s;
}

.fab:active {
  transform: scale(0.9);
  box-shadow: 
    0 3px 12px rgba(200, 170, 110, 0.4),
    0 1px 4px rgba(0, 0, 0, 0.2);
}

.fab svg {
  width: 26px;
  height: 26px;
}

/* Modal Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Course Modal - Premium Design */
.course-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  padding: env(safe-area-inset-top) 0 0;
}

.course-modal {
  width: 100%;
  max-height: 90vh;
  background: linear-gradient(180deg, #151A20 0%, #0D1117 50%, #080B0F 100%);
  border-radius: 28px 28px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 
    0 -8px 32px rgba(0, 0, 0, 0.5),
    0 -2px 16px rgba(200, 170, 110, 0.08),
    inset 0 1px 0 rgba(200, 170, 110, 0.15);
  border-top: 1px solid rgba(200, 170, 110, 0.2);
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.course-modal-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 28px 20px 20px;
  background: linear-gradient(180deg, rgba(200, 170, 110, 0.06) 0%, transparent 100%);
  border-bottom: 1px solid rgba(200, 170, 110, 0.12);
  position: relative;
}

.course-modal-header::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  background: linear-gradient(90deg, transparent, rgba(200, 170, 110, 0.4), transparent);
  border-radius: 2px;
}

.course-modal-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.15), rgba(200, 170, 110, 0.05));
  border: 2px solid rgba(200, 170, 110, 0.25);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-brand, #C8AA6E);
  flex-shrink: 0;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  font-family: 'DIN Alternate', monospace;
  letter-spacing: 0.5px;
}

.course-modal-info {
  flex: 1;
  min-width: 0;
}

.course-modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 8px;
  line-height: 1.3;
}

.course-modal-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #9ca3af;
}

.course-modal-level {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.course-modal-level.beginner {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.course-modal-level.intermediate {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.course-modal-level.advanced {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.course-modal-close {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  cursor: pointer;
  flex-shrink: 0;
}

.course-modal-close svg {
  width: 20px;
  height: 20px;
}

.course-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.2));
}

.course-modal-desc {
  font-size: 14px;
  line-height: 1.8;
  color: #A0A8B0;
  margin-bottom: 28px;
  padding: 16px;
  background: rgba(200, 170, 110, 0.04);
  border-radius: 12px;
  border-left: 3px solid rgba(200, 170, 110, 0.4);
}

.lessons-title {
  font-size: 16px;
  font-weight: 600;
  color: #EAECEF;
  margin-bottom: 18px;
  padding-left: 14px;
  border-left: 3px solid #C8AA6E;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lessons-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(200, 170, 110, 0.3), transparent);
  margin-left: 12px;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 16px;
  background: linear-gradient(135deg, rgba(30, 38, 47, 0.8), rgba(24, 31, 40, 0.6));
  border: 1px solid rgba(200, 170, 110, 0.1);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.lesson-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.08), transparent);
  opacity: 0;
  transition: opacity 0.25s;
}

.lesson-item:active::before {
  opacity: 1;
}

.lesson-item:active {
  transform: scale(0.98);
  border-color: rgba(200, 170, 110, 0.25);
}

.lesson-item.completed {
  border-color: rgba(34, 197, 94, 0.25);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(24, 31, 40, 0.6));
}

.lesson-item.locked {
  opacity: 0.45;
  cursor: not-allowed;
}

.lesson-num {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.2), rgba(200, 170, 110, 0.08));
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #C8AA6E;
  flex-shrink: 0;
  font-family: 'DIN Alternate', monospace;
}

.lesson-item.completed .lesson-num {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.08));
  border-color: rgba(34, 197, 94, 0.25);
  color: #22c55e;
}

.lesson-content {
  flex: 1;
  min-width: 0;
}

.lesson-title {
  font-size: 15px;
  font-weight: 600;
  color: #EAECEF;
  margin-bottom: 5px;
  line-height: 1.4;
}

.lesson-duration {
  font-size: 12px;
  color: #6B7785;
  font-family: 'DIN Alternate', monospace;
}

.lesson-status {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.lesson-status svg {
  width: 18px;
  height: 18px;
}

.icon-done {
  color: #22c55e;
}

.icon-lock {
  color: #4B5563;
}

.icon-play {
  color: #C8AA6E;
}

.course-modal-footer {
  padding: 18px 20px;
  padding-bottom: calc(18px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(15, 20, 25, 0.95), #0D1117);
  border-top: 1px solid rgba(200, 170, 110, 0.12);
}

.course-start-btn {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  border: none;
  border-radius: 14px;
  color: #0a0a0f;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 
    0 4px 16px rgba(200, 170, 110, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  letter-spacing: 0.5px;
}

.course-start-btn:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(200, 170, 110, 0.2);
}

/* Lesson Modal - Premium Reading Experience */
.lesson-modal-overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(180deg, #0D1117 0%, #080B0F 100%);
  z-index: 1001;
  display: flex;
  flex-direction: column;
}

.lesson-modal {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.lesson-modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  padding-top: calc(14px + env(safe-area-inset-top));
  background: linear-gradient(180deg, rgba(21, 26, 32, 0.98), rgba(13, 17, 23, 0.95));
  border-bottom: 1px solid rgba(200, 170, 110, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.lesson-back-btn {
  width: 42px;
  height: 42px;
  background: rgba(200, 170, 110, 0.08);
  border: 1px solid rgba(200, 170, 110, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C8AA6E;
  cursor: pointer;
  transition: all 0.2s;
}

.lesson-back-btn:active {
  background: rgba(200, 170, 110, 0.15);
  transform: scale(0.95);
}

.lesson-back-btn svg {
  width: 22px;
  height: 22px;
}

.lesson-modal-title {
  flex: 1;
  font-size: 17px;
  font-weight: 700;
  color: #EAECEF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.3px;
}

.lesson-modal-num {
  font-size: 13px;
  color: #C8AA6E;
  flex-shrink: 0;
  padding: 6px 12px;
  background: rgba(200, 170, 110, 0.1);
  border-radius: 20px;
  font-weight: 600;
  font-family: 'DIN Alternate', monospace;
}

.lesson-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
  background: linear-gradient(180deg, transparent, rgba(200, 170, 110, 0.02));
}

.lesson-article {
  font-size: 15px;
  line-height: 1.9;
  color: #D1D5DB;
}

/* 主标题卡片 */
.lesson-article h2 {
  font-size: 20px;
  font-weight: 700;
  color: #EAECEF;
  margin: 0 0 24px;
  padding: 20px 18px;
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.12), rgba(200, 170, 110, 0.04));
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 16px;
  position: relative;
  line-height: 1.4;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.lesson-article h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background: linear-gradient(180deg, #C8AA6E, rgba(200, 170, 110, 0.3));
  border-radius: 0 4px 4px 0;
}

/* 小节标题 - 编号卡片风格 */
.lesson-article h3 {
  font-size: 17px;
  font-weight: 700;
  color: #EAECEF;
  margin: 28px 0 16px;
  padding: 16px 18px 16px 20px;
  background: linear-gradient(135deg, rgba(30, 38, 47, 0.9), rgba(24, 31, 40, 0.7));
  border: 1px solid rgba(200, 170, 110, 0.15);
  border-left: 4px solid #C8AA6E;
  border-radius: 12px;
  line-height: 1.4;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  position: relative;
}

/* 段落样式 */
.lesson-article p {
  margin: 0 0 16px;
  color: #A8B0B8;
  padding: 0 4px;
  text-align: justify;
}

/* 列表容器 - 卡片包裹 */
.lesson-article ul,
.lesson-article ol {
  margin: 0 0 24px;
  padding: 16px 16px 16px 36px;
  background: linear-gradient(135deg, rgba(21, 26, 32, 0.6), rgba(13, 17, 23, 0.4));
  border: 1px solid rgba(200, 170, 110, 0.08);
  border-radius: 12px;
  list-style: none;
}

/* 列表项 - 独立卡片感 */
.lesson-article li {
  margin-bottom: 12px;
  color: #B8BCC4;
  position: relative;
  padding: 12px 14px 12px 28px;
  background: rgba(200, 170, 110, 0.03);
  border-radius: 8px;
  border-left: 2px solid rgba(200, 170, 110, 0.3);
  transition: all 0.2s ease;
}

.lesson-article li:last-child {
  margin-bottom: 0;
}

/* 列表项前的装饰点 */
.lesson-article li::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: linear-gradient(135deg, #C8AA6E, #A08050);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(200, 170, 110, 0.4);
}

/* 重点文字 */
.lesson-article strong {
  color: #C8AA6E;
  font-weight: 600;
  padding: 2px 6px;
  background: rgba(200, 170, 110, 0.12);
  border-radius: 4px;
}

/* 表格样式 */
.lesson-article table {
  width: 100%;
  border-collapse: collapse;
  margin: 24px 0;
  font-size: 13px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(200, 170, 110, 0.15);
}

.lesson-article td {
  padding: 14px 12px;
  border: 1px solid rgba(200, 170, 110, 0.1);
  color: #B8BCC4;
  background: rgba(21, 26, 32, 0.5);
}

.lesson-article tr:first-child td {
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.18), rgba(200, 170, 110, 0.08));
  font-weight: 700;
  color: #C8AA6E;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 12px;
}

/* 代码块 */
.lesson-article code {
  background: rgba(200, 170, 110, 0.12);
  color: #C8AA6E;
  padding: 3px 8px;
  border-radius: 4px;
  font-family: 'DIN Alternate', monospace;
  font-size: 13px;
}

.lesson-article pre {
  background: linear-gradient(135deg, rgba(21, 26, 32, 0.9), rgba(13, 17, 23, 0.9));
  border: 1px solid rgba(200, 170, 110, 0.12);
  border-radius: 12px;
  padding: 18px;
  overflow-x: auto;
  margin: 20px 0;
}

.lesson-article pre code {
  background: none;
  padding: 0;
}

/* 引用块 */
.lesson-article blockquote {
  margin: 24px 0;
  padding: 20px 20px 20px 24px;
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.1), rgba(200, 170, 110, 0.03));
  border-left: 4px solid #C8AA6E;
  border-radius: 0 14px 14px 0;
  font-style: italic;
  color: #A0A8B0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.lesson-modal-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  padding-bottom: calc(14px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(21, 26, 32, 0.98), rgba(13, 17, 23, 0.98));
  border-top: 1px solid rgba(200, 170, 110, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.lesson-nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 18px;
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.1), rgba(200, 170, 110, 0.05));
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 10px;
  color: #C8AA6E;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lesson-nav-btn:active {
  transform: scale(0.96);
  background: rgba(200, 170, 110, 0.15);
}

.lesson-nav-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.lesson-nav-btn svg {
  width: 16px;
  height: 16px;
}

.lesson-complete-btn {
  flex: 1;
  padding: 14px 20px;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  border: none;
  border-radius: 10px;
  color: #0a0a0f;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 
    0 4px 12px rgba(200, 170, 110, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  letter-spacing: 0.5px;
}

.lesson-complete-btn:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(200, 170, 110, 0.2);
}
</style>
