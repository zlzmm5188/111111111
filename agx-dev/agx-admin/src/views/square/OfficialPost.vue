<template>
  <div class="p-4">
    <!-- 页面标题 -->
    <div class="page-header mb-4">
      <h2 class="text-lg font-semibold">AI 官方发帖</h2>
      <p class="text-gray-500 text-sm mt-1">使用 DeepSeek AI 自动生成并发布官方内容到广场</p>
    </div>

    <!-- 发帖面板 -->
    <a-row :gutter="16">
      <a-col :span="12">
        <a-card title="生成新帖子" :bordered="false">
          <a-form :model="form" layout="vertical">
            <a-form-item label="帖子类型" required>
              <a-select v-model="form.type" placeholder="选择帖子类型">
                <a-option v-for="t in postTypes" :key="t.type" :value="t.type">
                  {{ t.name }} - {{ t.description }}
                </a-option>
              </a-select>
            </a-form-item>
            
            <a-form-item label="自定义主题 (可选)">
              <a-input v-model="form.customTopic" placeholder="输入特定主题让AI围绕这个话题创作" />
            </a-form-item>
            
            <a-form-item>
              <a-button type="primary" :loading="publishing" @click="handlePublish" long>
                <template #icon><icon-robot /></template>
                AI 生成并发布
              </a-button>
            </a-form-item>
          </a-form>

          <!-- 发布结果 -->
          <div v-if="publishResult" class="publish-result mt-4">
            <a-alert v-if="publishResult.success" type="success" title="发布成功">
              <template #content>
                帖子ID: {{ publishResult.postId }}
              </template>
            </a-alert>
            <a-alert v-else type="error" :title="publishResult.error" />
          </div>
        </a-card>

        <!-- 定时任务说明 -->
        <a-card title="定时发帖计划" :bordered="false" class="mt-4">
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="早间市场分析">
              <a-tag color="blue">每天 09:00</a-tag>
              <span class="text-gray-500 ml-2">自动发布市场简析</span>
            </a-descriptions-item>
            <a-descriptions-item label="投资小知识">
              <a-tag color="green">每天 15:00</a-tag>
              <span class="text-gray-500 ml-2">自动发布投资课堂</span>
            </a-descriptions-item>
            <a-descriptions-item label="AGX动态">
              <a-tag color="orange">每天 20:00</a-tag>
              <span class="text-gray-500 ml-2">自动发布平台动态</span>
            </a-descriptions-item>
          </a-descriptions>
          <div class="mt-3 text-gray-400 text-xs">
            * 定时任务由后端 Cron 自动执行，无需手动操作
          </div>
        </a-card>
      </a-col>

      <!-- 最近发布记录 -->
      <a-col :span="12">
        <a-card title="最近官方帖子" :bordered="false">
          <template #extra>
            <a-button type="text" size="small" @click="loadRecentPosts">
              <template #icon><icon-refresh /></template>
              刷新
            </a-button>
          </template>

          <a-spin :loading="loading">
            <div v-if="recentPosts.length === 0" class="text-center text-gray-400 py-8">
              暂无官方帖子
            </div>
            <div v-else class="post-list">
              <div v-for="post in recentPosts" :key="post.id" class="post-item">
                <div class="post-header">
                  <a-tag :color="getTopicColor(post.topic)">{{ post.topic }}</a-tag>
                  <span class="post-time">{{ formatTime(post.createdAt) }}</span>
                </div>
                <div class="post-content">{{ truncateText(post.content, 150) }}</div>
                <div class="post-footer">
                  <span class="post-stat">
                    <icon-heart /> {{ post.likeCount || 0 }}
                  </span>
                  <span class="post-stat">
                    <icon-message /> {{ post.commentCount || 0 }}
                  </span>
                  <span class="post-stat">
                    <icon-eye /> {{ post.viewCount || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </a-spin>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { request } from '@/utils/request'

const form = ref({
  type: 'market_analysis',
  customTopic: ''
})

const postTypes = ref([])
const recentPosts = ref([])
const loading = ref(false)
const publishing = ref(false)
const publishResult = ref(null)

// 加载帖子类型
const loadPostTypes = async () => {
  try {
    const res = await request({ url: '/api/admin/official-post/types', method: 'get' })
    if (res.code === 0) {
      postTypes.value = res.data
    }
  } catch (e) {
    console.error('加载帖子类型失败', e)
  }
}

// 加载最近帖子
const loadRecentPosts = async () => {
  loading.value = true
  try {
    const res = await request({ url: '/api/admin/official-post/recent', method: 'get', params: { limit: 10 } })
    if (res.code === 0) {
      recentPosts.value = res.data
    }
  } catch (e) {
    console.error('加载帖子失败', e)
  } finally {
    loading.value = false
  }
}

// 发布帖子
const handlePublish = async () => {
  if (!form.value.type) {
    Message.warning('请选择帖子类型')
    return
  }
  
  publishing.value = true
  publishResult.value = null
  
  try {
    const res = await request({
      url: '/api/admin/official-post/publish',
      method: 'post',
      data: {
        type: form.value.type,
        customTopic: form.value.customTopic || undefined
      }
    })
    
    if (res.code === 0) {
      publishResult.value = { success: true, postId: res.data?.id }
      Message.success('发布成功')
      form.value.customTopic = ''
      loadRecentPosts()
    } else {
      publishResult.value = { success: false, error: res.msg || '发布失败' }
      Message.error(res.msg || '发布失败')
    }
  } catch (e) {
    publishResult.value = { success: false, error: e.message || '网络错误' }
    Message.error('发布失败: ' + e.message)
  } finally {
    publishing.value = false
  }
}

// 格式化时间
const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 截断文本
const truncateText = (text, len) => {
  if (!text) return ''
  return text.length > len ? text.substring(0, len) + '...' : text
}

// 话题颜色
const getTopicColor = (topic) => {
  const colors = {
    '#市场分析': 'blue',
    '#AGX动态': 'orange',
    '#行业快讯': 'purple',
    '#投资课堂': 'green',
    '#周报': 'cyan',
    '#平台介绍': 'gold'
  }
  return colors[topic] || 'gray'
}

onMounted(() => {
  loadPostTypes()
  loadRecentPosts()
})
</script>

<style scoped>
.page-header {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
}

.post-list {
  max-height: 600px;
  overflow-y: auto;
}

.post-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-2);
}

.post-item:last-child {
  border-bottom: none;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.post-time {
  font-size: 12px;
  color: var(--color-text-3);
}

.post-content {
  font-size: 13px;
  color: var(--color-text-2);
  line-height: 1.6;
  margin-bottom: 8px;
}

.post-footer {
  display: flex;
  gap: 16px;
}

.post-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-3);
}

.publish-result {
  padding-top: 12px;
  border-top: 1px solid var(--color-border-2);
}
</style>
