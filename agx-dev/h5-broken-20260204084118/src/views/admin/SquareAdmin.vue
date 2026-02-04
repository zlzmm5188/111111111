<template>
  <div class="admin-page">
    <!-- Header -->
    <header class="admin-header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1>广场管理</h1>
      <div class="header-spacer"></div>
    </header>

    <main class="admin-content">
      <!-- 发帖条件配置 -->
      <section class="admin-section">
        <div class="section-header">
          <h2>发帖条件配置</h2>
          <span class="status-badge" :class="{ active: postConfig.enabled }">
            {{ postConfig.enabled ? '已启用' : '未启用' }}
          </span>
        </div>

        <div class="config-form">
          <div class="form-item switch-item">
            <label>启用发帖限制</label>
            <label class="switch">
              <input type="checkbox" v-model="postConfig.enabled">
              <span class="slider"></span>
            </label>
          </div>

          <div class="form-item switch-item">
            <label>需要KYC认证</label>
            <label class="switch">
              <input type="checkbox" v-model="postConfig.requireKyc">
              <span class="slider"></span>
            </label>
          </div>

          <div class="form-item">
            <label>最低会员等级</label>
            <select v-model.number="postConfig.minLevel">
              <option :value="0">Lv.0 启蒙层</option>
              <option :value="1">Lv.1 准入层</option>
              <option :value="2">Lv.2 优选层</option>
              <option :value="3">Lv.3 资本层</option>
              <option :value="4">Lv.4 执行官层</option>
              <option :value="5">Lv.5 主权层</option>
            </select>
          </div>

          <div class="form-item">
            <label>最少注册天数</label>
            <input type="number" v-model.number="postConfig.minRegisterDays" min="0" placeholder="0表示不限制">
          </div>

          <div class="form-item">
            <label>最低持仓金额 (USDT)</label>
            <input type="number" v-model.number="postConfig.minHoldingAmount" min="0" placeholder="0表示不限制">
          </div>

          <div class="form-item">
            <label>最少粉丝数</label>
            <input type="number" v-model.number="postConfig.minFollowers" min="0" placeholder="0表示不限制">
          </div>

          <div class="form-item">
            <label>每日发帖上限</label>
            <input type="number" v-model.number="postConfig.dailyPostLimit" min="0" placeholder="0表示不限制">
          </div>

          <div class="form-item switch-item">
            <label>允许评论</label>
            <label class="switch">
              <input type="checkbox" v-model="postConfig.commentEnabled">
              <span class="slider"></span>
            </label>
          </div>

          <button class="save-btn" @click="savePostConfig" :disabled="savingPost">
            {{ savingPost ? '保存中...' : '保存配置' }}
          </button>
        </div>
      </section>

      <!-- 新闻采集管理 -->
      <section class="admin-section">
        <div class="section-header">
          <h2>新闻自动采集</h2>
          <span class="status-badge" :class="{ active: crawlerStatus.enabled }">
            {{ crawlerStatus.enabled ? '运行中' : '已停止' }}
          </span>
        </div>

        <div class="crawler-info">
          <div class="info-row">
            <span class="info-label">采集源</span>
            <span class="info-value">{{ crawlerStatus.sources?.join('、') || '金十数据、财联社' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">已发布数量</span>
            <span class="info-value">{{ crawlerStatus.publishedCount || 0 }} 条</span>
          </div>
          <div class="info-row">
            <span class="info-label">采集频率</span>
            <span class="info-value">每30分钟自动采集</span>
          </div>
        </div>

        <div class="action-buttons">
          <button class="action-btn primary" @click="triggerCrawl" :disabled="crawling">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            {{ crawling ? '采集中...' : '立即采集' }}
          </button>
          <button class="action-btn" @click="clearCache" :disabled="clearing">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
            {{ clearing ? '清理中...' : '清空缓存' }}
          </button>
        </div>

        <div v-if="crawlResult" class="crawl-result" :class="{ success: crawlResult.success }">
          {{ crawlResult.message }}
        </div>
      </section>

      <!-- AI官方发帖 -->
      <section class="admin-section">
        <div class="section-header">
          <h2>AI官方发帖</h2>
        </div>

        <div class="ai-post-form">
          <div class="form-item">
            <label>帖子类型</label>
            <select v-model="aiPostType">
              <option value="market_analysis">市场分析</option>
              <option value="agx_update">AGX 动态</option>
              <option value="crypto_news">行业快讯</option>
              <option value="investment_tips">投资课堂</option>
              <option value="weekly_summary">周报</option>
              <option value="product_intro">产品介绍</option>
            </select>
          </div>

          <div class="form-item">
            <label>自定义主题 (可选)</label>
            <input type="text" v-model="aiCustomTopic" placeholder="留空则由AI自动选择">
          </div>

          <button class="save-btn" @click="generateAIPost" :disabled="generatingAI">
            {{ generatingAI ? 'AI生成中...' : '生成并发布' }}
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiSquare } from '../../utils/api'
import { alert } from '../../utils/alert'

// 通用API请求函数
const adminFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token')
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  })
  return res.json()
}

// 发帖条件配置
const postConfig = ref({
  enabled: false,
  requireKyc: false,
  minLevel: 3,
  minRegisterDays: 0,
  minHoldingAmount: 0,
  minFollowers: 0,
  dailyPostLimit: 0,
  commentEnabled: true
})
const savingPost = ref(false)

// 新闻采集状态
const crawlerStatus = ref({
  enabled: true,
  publishedCount: 0,
  sources: ['金十数据', '财联社']
})
const crawling = ref(false)
const clearing = ref(false)
const crawlResult = ref(null)

// AI发帖
const aiPostType = ref('market_analysis')
const aiCustomTopic = ref('')
const generatingAI = ref(false)

// 加载发帖条件配置
const loadPostConfig = async () => {
  try {
    const result = await apiSquare.getPostConditionConfig()
    if (result.success && result.data) {
      postConfig.value = { ...postConfig.value, ...result.data }
    }
  } catch (e) {
    console.error('加载配置失败:', e)
  }
}

// 保存发帖条件配置
const savePostConfig = async () => {
  savingPost.value = true
  try {
    const result = await apiSquare.updatePostConditionConfig(postConfig.value)
    if (result.success) {
      await alert('配置保存成功')
    } else {
      await alert(result.message || '保存失败')
    }
  } catch (e) {
    await alert('保存失败: ' + e.message)
  } finally {
    savingPost.value = false
  }
}

// 加载采集状态
const loadCrawlerStatus = async () => {
  try {
    const data = await adminFetch('/api/square/admin/news-crawler/status')
    if (data.code === 0 && data.data) {
      crawlerStatus.value = data.data
    }
  } catch (e) {
    console.error('加载采集状态失败:', e)
  }
}

// 触发采集
const triggerCrawl = async () => {
  crawling.value = true
  crawlResult.value = null
  try {
    const data = await adminFetch('/api/square/admin/news-crawler/crawl', { method: 'POST' })
    crawlResult.value = {
      success: data.code === 0,
      message: data.msg || (data.code === 0 ? `成功采集${data.data?.count || 0}条新闻` : '采集失败')
    }
    if (data.code === 0) {
      await loadCrawlerStatus()
    }
  } catch (e) {
    crawlResult.value = { success: false, message: '采集失败: ' + e.message }
  } finally {
    crawling.value = false
  }
}

// 清空缓存
const clearCache = async () => {
  clearing.value = true
  try {
    const data = await adminFetch('/api/square/admin/news-crawler/clear-cache', { method: 'POST' })
    if (data.code === 0) {
      await alert('缓存已清空')
      await loadCrawlerStatus()
    } else {
      await alert('操作失败: ' + (data.msg || '未知错误'))
    }
  } catch (e) {
    await alert('操作失败: ' + e.message)
  } finally {
    clearing.value = false
  }
}

// 生成AI帖子
const generateAIPost = async () => {
  generatingAI.value = true
  try {
    const result = await apiSquare.generateAIPost({
      type: aiPostType.value,
      customTopic: aiCustomTopic.value || undefined
    })
    if (result.success) {
      await alert('AI帖子发布成功')
      aiCustomTopic.value = ''
    } else {
      await alert(result.message || 'AI发布失败')
    }
  } catch (e) {
    await alert('发布失败: ' + e.message)
  } finally {
    generatingAI.value = false
  }
}

onMounted(() => {
  loadPostConfig()
  loadCrawlerStatus()
})
</script>

<style scoped>
.admin-page {
  width: 100%;
  max-width: 428px;
  min-height: 100vh;
  margin: 0 auto;
  background: #0a0c10;
}

.admin-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  max-width: 428px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: linear-gradient(180deg, #1C242E 0%, #161C24 100%);
  border-bottom: 1px solid rgba(200, 170, 110, 0.1);
  z-index: 100;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #C8AA6E;
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.admin-header h1 {
  font-size: 17px;
  font-weight: 600;
  color: #E6EDF3;
  margin: 0;
}

.header-spacer {
  width: 36px;
}

.admin-content {
  padding-top: calc(60px + env(safe-area-inset-top));
  padding-bottom: calc(40px + env(safe-area-inset-bottom));
}

.admin-section {
  margin: 16px;
  background: linear-gradient(145deg, rgba(30, 38, 50, 0.95), rgba(22, 27, 34, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: #E6EDF3;
  margin: 0;
}

.status-badge {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(139, 148, 158, 0.2);
  color: #8B949E;
}

.status-badge.active {
  background: rgba(46, 160, 67, 0.2);
  color: #3FB950;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  color: #8B949E;
}

.form-item input,
.form-item select {
  height: 44px;
  padding: 0 14px;
  background: #0D1117;
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 10px;
  color: #E6EDF3;
  font-size: 15px;
  outline: none;
}

.form-item input:focus,
.form-item select:focus {
  border-color: #C8AA6E;
}

.form-item select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B949E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
}

.switch-item {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.switch {
  position: relative;
  width: 48px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #21262D;
  border-radius: 26px;
  transition: 0.3s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 2px;
  bottom: 2px;
  background: #8B949E;
  border-radius: 50%;
  transition: 0.3s;
}

input:checked + .slider {
  background: #C8AA6E;
}

input:checked + .slider:before {
  transform: translateX(22px);
  background: #0D1117;
}

.save-btn {
  height: 48px;
  margin-top: 8px;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #0D1117;
  cursor: pointer;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.crawler-info {
  background: rgba(13, 17, 23, 0.5);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #8B949E;
}

.info-value {
  font-size: 14px;
  color: #E6EDF3;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(200, 170, 110, 0.1);
  border: 1px solid rgba(200, 170, 110, 0.3);
  border-radius: 10px;
  font-size: 14px;
  color: #C8AA6E;
  cursor: pointer;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-btn.primary {
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  border: none;
  color: #0D1117;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.crawl-result {
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
  background: rgba(248, 81, 73, 0.1);
  color: #F85149;
}

.crawl-result.success {
  background: rgba(46, 160, 67, 0.1);
  color: #3FB950;
}

.ai-post-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
