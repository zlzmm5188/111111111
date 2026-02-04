<template>
  <div class="search-page">
    <!-- 搜索头部 -->
    <header class="search-header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <div class="search-input-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          ref="inputRef"
          v-model="keyword"
          type="text"
          :placeholder="$t('search.placeholder')"
          class="search-input"
          @keyup.enter="doSearch"
        />
        <button v-if="keyword" class="clear-btn" @click="keyword = ''">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
          </svg>
        </button>
      </div>
      <button class="search-btn" @click="doSearch">{{ $t('search.search') }}</button>
    </header>

    <div class="search-content">
      <!-- 搜索历史 -->
      <section v-if="!keyword && !hasSearched" class="history-section">
        <div class="section-header">
          <h3>{{ $t('search.history') }}</h3>
          <button v-if="history.length" class="clear-history" @click="clearHistory">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
        <div v-if="history.length" class="history-tags">
          <span v-for="h in history" :key="h" class="history-tag" @click="keyword = h; doSearch()">
            {{ h }}
          </span>
        </div>
        <div v-else class="empty-history">{{ $t('search.noHistory') }}</div>
      </section>

      <!-- 热门搜索 -->
      <section v-if="!keyword && !hasSearched" class="hot-section">
        <div class="section-header">
          <h3>{{ $t('search.hotSearch') }}</h3>
        </div>
        <div class="hot-list">
          <div v-for="(item, idx) in hotKeywords" :key="item" class="hot-item" @click="keyword = item; doSearch()">
            <span class="hot-rank" :class="{ top: idx < 3 }">{{ idx + 1 }}</span>
            <span class="hot-text">{{ item }}</span>
          </div>
        </div>
      </section>

      <!-- 搜索结果 -->
      <section v-if="hasSearched" class="results-section">
        <!-- Tab切换 -->
        <div class="result-tabs">
          <button 
            v-for="t in resultTabs" 
            :key="t.key"
            class="tab-btn"
            :class="{ active: resultTab === t.key }"
            @click="resultTab = t.key"
          >{{ t.label }}</button>
        </div>

        <!-- 加载中 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>{{ $t('search.searching') }}</p>
        </div>

        <!-- 用户结果 -->
        <div v-else-if="resultTab === 'user'" class="user-results">
          <div v-if="userResults.length" class="user-list">
            <div v-for="u in userResults" :key="u.id" class="user-card" @click="goUser(u.id)">
              <div class="user-avatar">
                <img v-if="u.avatar" :src="u.avatar" alt="">
                <span v-else>{{ u.nickname?.charAt(0) || 'U' }}</span>
              </div>
              <div class="user-info">
                <div class="user-name">{{ u.nickname }}</div>
                <div class="user-bio">{{ u.bio || $t('search.noBio') }}</div>
              </div>
              <button class="follow-btn" :class="{ following: u.isFollowing }" @click.stop="toggleFollow(u)">
                {{ u.isFollowing ? $t('search.following') : $t('search.follow') }}
              </button>
            </div>
          </div>
          <div v-else class="empty-result">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <p>{{ $t('search.noUserResult') }}</p>
          </div>
        </div>

        <!-- 帖子结果 -->
        <div v-else-if="resultTab === 'post'" class="post-results">
          <div v-if="postResults.length" class="post-list">
            <div v-for="p in postResults" :key="p.id" class="post-card" @click="goPost(p.id)">
              <div class="post-author">
                <img v-if="p.avatar" :src="p.avatar" class="author-avatar" alt="">
                <span v-else class="author-avatar placeholder">{{ p.author?.charAt(0) }}</span>
                <span class="author-name">{{ p.author }}</span>
                <span class="post-time">{{ p.time }}</span>
              </div>
              <p class="post-content">{{ p.content }}</p>
              <div v-if="p.images?.length" class="post-images">
                <img v-for="(img, i) in p.images.slice(0,3)" :key="i" :src="img" alt="">
              </div>
            </div>
          </div>
          <div v-else class="empty-result">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <p>{{ $t('search.noPostResult') }}</p>
          </div>
        </div>

        <!-- 话题结果 -->
        <div v-else-if="resultTab === 'topic'" class="topic-results">
          <div v-if="topicResults.length" class="topic-list">
            <div v-for="t in topicResults" :key="t.id" class="topic-card" @click="goTopic(t.id, t.name)">
              <span class="topic-name">#{{ t.name }}</span>
              <span class="topic-count">{{ t.postCount }}{{ $t('search.posts') }}</span>
            </div>
          </div>
          <div v-else class="empty-result">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <p>{{ $t('search.noTopicResult') }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '../utils/api'

const { t } = useI18n()
const router = useRouter()

const inputRef = ref(null)
const keyword = ref('')
const loading = ref(false)
const hasSearched = ref(false)
const resultTab = ref('user')

const history = ref([])
const hotKeywords = ref(['AGX', '持币生金', '黄金', '合约', '新手教程'])

const userResults = ref([])
const postResults = ref([])
const topicResults = ref([])

const resultTabs = [
  { key: 'user', label: '用户' },
  { key: 'post', label: '动态' },
  { key: 'topic', label: '话题' }
]

// 加载搜索历史
const loadHistory = () => {
  try {
    const saved = localStorage.getItem('agx-search-history')
    if (saved) history.value = JSON.parse(saved)
  } catch (e) {}
}

// 保存搜索历史
const saveHistory = (kw) => {
  if (!kw.trim()) return
  const list = history.value.filter(h => h !== kw)
  list.unshift(kw)
  history.value = list.slice(0, 10)
  localStorage.setItem('agx-search-history', JSON.stringify(history.value))
}

// 清空历史
const clearHistory = () => {
  history.value = []
  localStorage.removeItem('agx-search-history')
}

// 执行搜索
const doSearch = async () => {
  const kw = keyword.value.trim()
  if (!kw) return
  
  saveHistory(kw)
  hasSearched.value = true
  loading.value = true
  
  try {
    const res = await api.square.search({ keyword: kw })
    if (res.success && res.data) {
      userResults.value = res.data.users || []
      postResults.value = res.data.posts || []
      topicResults.value = res.data.topics || []
    }
  } catch (e) {
    console.error('搜索失败:', e)
  } finally {
    loading.value = false
  }
}

const goUser = (id) => router.push(`/user/${id}`)
const goPost = (id) => router.push(`/post/${id}`)
const goTopic = (id, name) => router.push(`/topic/${id}?name=${encodeURIComponent(name)}`)

const toggleFollow = async (user) => {
  user.isFollowing = !user.isFollowing
}

onMounted(() => {
  loadHistory()
  nextTick(() => inputRef.value?.focus())
})
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: #0D1117;
}

.search-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: rgba(13, 17, 23, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(48, 54, 61, 0.3);
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #8B949E;
}

.back-btn svg { width: 20px; height: 20px; }

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: rgba(48, 54, 61, 0.3);
  border: 1px solid rgba(48, 54, 61, 0.5);
  border-radius: 20px;
  height: 40px;
}

.search-icon { width: 18px; height: 18px; color: #6E7681; flex-shrink: 0; }

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 14px;
  color: #E6EDF3;
}

.search-input::placeholder { color: #6E7681; }

.clear-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #6E7681;
}

.clear-btn svg { width: 16px; height: 16px; }

.search-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #C8AA6E, #A08050);
  border: none;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #0D1117;
}

.search-content { padding: 16px; }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: #E6EDF3;
}

.clear-history {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #6E7681;
}

.clear-history svg { width: 18px; height: 18px; }

.history-section, .hot-section { margin-bottom: 24px; }

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag {
  padding: 8px 14px;
  background: rgba(48, 54, 61, 0.3);
  border: 1px solid rgba(48, 54, 61, 0.5);
  border-radius: 16px;
  font-size: 13px;
  color: #8B949E;
}

.empty-history {
  font-size: 13px;
  color: #6E7681;
  text-align: center;
  padding: 20px;
}

.hot-list { display: flex; flex-direction: column; gap: 12px; }

.hot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.hot-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #6E7681;
  background: rgba(48, 54, 61, 0.3);
}

.hot-rank.top { background: linear-gradient(135deg, #C8AA6E, #A08050); color: #0D1117; }

.hot-text { font-size: 14px; color: #E6EDF3; }

/* 结果Tab */
.result-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(48, 54, 61, 0.3);
}

.tab-btn {
  padding: 8px 16px;
  background: rgba(48, 54, 61, 0.3);
  border: none;
  border-radius: 16px;
  font-size: 13px;
  color: #8B949E;
}

.tab-btn.active {
  background: linear-gradient(135deg, #C8AA6E, #A08050);
  color: #0D1117;
  font-weight: 600;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(200, 170, 110, 0.2);
  border-top-color: #C8AA6E;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-state p { font-size: 13px; color: #6E7681; }

/* 用户结果 */
.user-list { display: flex; flex-direction: column; gap: 12px; }

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(30, 38, 50, 0.6);
  border: 1px solid rgba(48, 54, 61, 0.3);
  border-radius: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #C8AA6E, #A08050);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #0D1117;
}

.user-avatar img { width: 100%; height: 100%; object-fit: cover; }

.user-info { flex: 1; min-width: 0; }

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #E6EDF3;
  margin-bottom: 4px;
}

.user-bio {
  font-size: 12px;
  color: #6E7681;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.follow-btn {
  padding: 8px 16px;
  background: rgba(200, 170, 110, 0.15);
  border: 1px solid #C8AA6E;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  color: #C8AA6E;
}

.follow-btn.following {
  background: rgba(48, 54, 61, 0.3);
  border-color: #6E7681;
  color: #8B949E;
}

/* 帖子结果 */
.post-list { display: flex; flex-direction: column; gap: 12px; }

.post-card {
  padding: 14px;
  background: rgba(30, 38, 50, 0.6);
  border: 1px solid rgba(48, 54, 61, 0.3);
  border-radius: 12px;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.author-avatar.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #C8AA6E, #A08050);
  font-size: 12px;
  font-weight: 700;
  color: #0D1117;
}

.author-name { font-size: 13px; font-weight: 600; color: #E6EDF3; }
.post-time { font-size: 11px; color: #6E7681; margin-left: auto; }

.post-content {
  font-size: 14px;
  line-height: 1.5;
  color: #C9D1D9;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-images {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}

.post-images img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

/* 话题结果 */
.topic-list { display: flex; flex-direction: column; gap: 8px; }

.topic-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: rgba(30, 38, 50, 0.6);
  border: 1px solid rgba(48, 54, 61, 0.3);
  border-radius: 12px;
}

.topic-name { font-size: 15px; font-weight: 600; color: #C8AA6E; }
.topic-count { font-size: 12px; color: #6E7681; }

/* 空结果 */
.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-result svg { width: 48px; height: 48px; color: #21262D; margin-bottom: 16px; }
.empty-result p { font-size: 14px; color: #6E7681; }
</style>
