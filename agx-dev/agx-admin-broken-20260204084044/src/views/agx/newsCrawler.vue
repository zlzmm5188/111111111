<template>
  <div class="news-crawler-container p-4">
    <a-row :gutter="20">
      <!-- 采集状态卡片 -->
      <a-col :span="12">
        <a-card title="新闻自动采集">
          <template #extra>
            <a-tag :color="status.enabled ? 'green' : 'gray'">{{ status.enabled ? '运行中' : '已停止' }}</a-tag>
          </template>

          <a-spin :loading="loadingStatus">
            <a-descriptions :column="1" bordered size="small">
              <a-descriptions-item label="采集源">
                {{ status.sources?.join('、') || '金十数据、财联社' }}
              </a-descriptions-item>
              <a-descriptions-item label="已发布数量">
                <a-tag color="blue">{{ status.publishedCount || 0 }} 条</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="采集频率">
                每 30 分钟自动采集
              </a-descriptions-item>
            </a-descriptions>

            <div class="action-buttons mt-4">
              <a-space>
                <a-button type="primary" @click="triggerCrawl" :loading="crawling">
                  <template #icon><icon-sync /></template>
                  立即采集
                </a-button>
                <a-button @click="clearCache" :loading="clearing">
                  <template #icon><icon-delete /></template>
                  清空缓存
                </a-button>
                <a-button @click="loadStatus">
                  <template #icon><icon-refresh /></template>
                  刷新状态
                </a-button>
              </a-space>
            </div>

            <a-alert 
              v-if="crawlResult" 
              :type="crawlResult.success ? 'success' : 'error'" 
              class="mt-4"
              closable
              @close="crawlResult = null"
            >
              {{ crawlResult.message }}
            </a-alert>
          </a-spin>
        </a-card>
      </a-col>

      <!-- AI官方发帖卡片 -->
      <a-col :span="12">
        <a-card title="AI官方发帖">
          <template #extra>
            <a-tag color="orange">DeepSeek</a-tag>
          </template>

          <a-form :model="aiForm" layout="vertical">
            <a-form-item label="帖子类型">
              <a-select v-model="aiForm.type">
                <a-option value="market_analysis">市场分析</a-option>
                <a-option value="agx_update">AGX 动态</a-option>
                <a-option value="crypto_news">行业快讯</a-option>
                <a-option value="investment_tips">投资课堂</a-option>
                <a-option value="weekly_summary">周报</a-option>
                <a-option value="product_intro">产品介绍</a-option>
              </a-select>
            </a-form-item>

            <a-form-item label="自定义主题">
              <a-input v-model="aiForm.customTopic" placeholder="留空则由AI自动选择" allow-clear />
            </a-form-item>

            <a-form-item>
              <a-button type="primary" status="success" long @click="generateAIPost" :loading="generatingAI">
                <template #icon><icon-robot /></template>
                {{ generatingAI ? 'AI生成中...' : '生成并发布' }}
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>

    <!-- 使用说明 -->
    <a-card title="使用说明" class="mt-4">
      <a-timeline>
        <a-timeline-item>
          <template #dot><icon-thunderbolt style="color: #165DFF" /></template>
          <div class="font-medium">自动采集</div>
          <div class="text-gray-500 text-sm">系统每30分钟自动从金十数据、财联社抓取最新财经新闻，筛选后发布到广场</div>
        </a-timeline-item>
        <a-timeline-item>
          <template #dot><icon-check-circle style="color: #00B42A" /></template>
          <div class="font-medium">内容去重</div>
          <div class="text-gray-500 text-sm">已发布的新闻会在24小时内被记录，避免重复发布相同内容</div>
        </a-timeline-item>
        <a-timeline-item>
          <template #dot><icon-robot style="color: #FF7D00" /></template>
          <div class="font-medium">AI发帖</div>
          <div class="text-gray-500 text-sm">使用DeepSeek大模型生成专业的财经分析内容，以官方账号名义发布</div>
        </a-timeline-item>
        <a-timeline-item>
          <template #dot><icon-delete style="color: #86909C" /></template>
          <div class="font-medium">清空缓存</div>
          <div class="text-gray-500 text-sm">清空已发布记录后，下次采集可能会重新发布之前的新闻（用于测试）</div>
        </a-timeline-item>
      </a-timeline>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { request } from '@/utils/request.js'

const loadingStatus = ref(false)
const crawling = ref(false)
const clearing = ref(false)
const generatingAI = ref(false)
const crawlResult = ref(null)

const status = reactive({
  enabled: true,
  publishedCount: 0,
  sources: ['金十数据', '财联社']
})

const aiForm = reactive({
  type: 'market_analysis',
  customTopic: ''
})

const loadStatus = async () => {
  loadingStatus.value = true
  try {
    const res = await request({
      url: '/api/square/admin/news-crawler/status',
      method: 'get'
    })
    if (res.code === 0 && res.data) {
      Object.assign(status, res.data)
    }
  } catch (e) {
    console.error('加载状态失败:', e)
  } finally {
    loadingStatus.value = false
  }
}

const triggerCrawl = async () => {
  crawling.value = true
  crawlResult.value = null
  try {
    const res = await request({
      url: '/api/square/admin/news-crawler/crawl',
      method: 'post'
    })
    crawlResult.value = {
      success: res.code === 0,
      message: res.msg || (res.code === 0 ? `成功采集${res.data?.count || 0}条新闻` : '采集失败')
    }
    if (res.code === 0) {
      await loadStatus()
    }
  } catch (e) {
    crawlResult.value = { success: false, message: '采集失败: ' + e.message }
  } finally {
    crawling.value = false
  }
}

const clearCache = async () => {
  clearing.value = true
  try {
    const res = await request({
      url: '/api/square/admin/news-crawler/clear-cache',
      method: 'post'
    })
    if (res.code === 0) {
      Message.success('缓存已清空')
      await loadStatus()
    } else {
      Message.error(res.msg || '操作失败')
    }
  } catch (e) {
    Message.error('操作失败')
  } finally {
    clearing.value = false
  }
}

const generateAIPost = async () => {
  generatingAI.value = true
  try {
    const res = await request({
      url: '/api/square/admin/ai-post',
      method: 'post',
      data: {
        type: aiForm.type,
        customTopic: aiForm.customTopic || undefined
      }
    })
    if (res.code === 0) {
      Message.success('AI帖子发布成功')
      aiForm.customTopic = ''
    } else {
      Message.error(res.msg || 'AI发布失败')
    }
  } catch (e) {
    Message.error('发布失败: ' + e.message)
  } finally {
    generatingAI.value = false
  }
}

onMounted(() => {
  loadStatus()
})
</script>

<style scoped>
.news-crawler-container {
  background: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.action-buttons {
  display: flex;
}

.mt-4 {
  margin-top: 16px;
}

.p-4 {
  padding: 16px;
}

.font-medium {
  font-weight: 500;
}

.text-gray-500 {
  color: #86909c;
}

.text-sm {
  font-size: 13px;
}
</style>
