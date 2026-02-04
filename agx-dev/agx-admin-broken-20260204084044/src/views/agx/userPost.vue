<template>
  <div class="p-4">
    <a-card title="用户内容管理" :bordered="false">
      <template #extra>
        <a-space>
          <a-radio-group v-model="searchForm.tab" type="button">
            <a-radio value="all">全部</a-radio>
            <a-radio value="pending">待审核</a-radio>
            <a-radio value="reported">被举报</a-radio>
          </a-radio-group>
        </a-space>
      </template>

      <!-- 搜索 -->
      <a-row :gutter="16" class="mb-4">
        <a-col :span="5">
          <a-input-search v-model="searchForm.keyword" placeholder="搜索内容/用户" @search="handleSearch" />
        </a-col>
        <a-col :span="4">
          <a-select v-model="searchForm.status" placeholder="状态" allow-clear style="width: 100%">
            <a-option :value="1">正常</a-option>
            <a-option :value="0">待审核</a-option>
            <a-option :value="2">已删除</a-option>
            <a-option :value="3">已屏蔽</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-range-picker v-model="searchForm.dateRange" style="width: 100%" />
        </a-col>
      </a-row>

      <a-table :data="tableData" :loading="loading" :pagination="pagination" @page-change="handlePageChange" :row-selection="rowSelection">
        <template #columns>
          <a-table-column title="用户" :width="140">
            <template #cell="{ record }">
              <div class="flex items-center gap-2">
                <a-avatar :size="32">{{ record.username.charAt(0) }}</a-avatar>
                <div>
                  <div class="font-medium">{{ record.username }}</div>
                  <div class="text-gray-400 text-xs">{{ record.uid }}</div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="内容" :width="280">
            <template #cell="{ record }">
              <div>
                <div class="line-clamp-2">{{ record.content }}</div>
                <div class="text-gray-400 text-xs mt-1" v-if="record.images && record.images.length">
                  [{{ record.images.length }}张图片]
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="数据" :width="120">
            <template #cell="{ record }">
              <div class="text-xs">
                <span>点赞 {{ record.likeCount }}</span>
                <span class="mx-1">·</span>
                <span>评论 {{ record.commentCount }}</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="90">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
              <div v-if="record.reportCount > 0" class="text-red-500 text-xs mt-1">
                {{ record.reportCount }}次举报
              </div>
            </template>
          </a-table-column>
          <a-table-column title="发布时间" data-index="createdAt" :width="150" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="viewDetail(record)">查看</a-button>
                <a-button v-if="record.status === 0" type="text" size="small" status="success" @click="approvePost(record)">通过</a-button>
                <a-button v-if="record.status === 1" type="text" size="small" status="warning" @click="featurePost(record)">推荐</a-button>
                <a-dropdown>
                  <a-button type="text" size="small">更多</a-button>
                  <template #content>
                    <a-doption @click="blockPost(record)">屏蔽</a-doption>
                    <a-doption @click="warnUser(record)">警告用户</a-doption>
                    <a-doption status="danger" @click="deletePost(record)">删除</a-doption>
                  </template>
                </a-dropdown>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <!-- 批量操作 -->
      <div v-if="selectedKeys.length > 0" class="mt-4 p-3 bg-gray-100 rounded flex items-center gap-4">
        <span>已选择 {{ selectedKeys.length }} 项</span>
        <a-button size="small" @click="batchApprove">批量通过</a-button>
        <a-button size="small" status="warning" @click="batchBlock">批量屏蔽</a-button>
        <a-button size="small" status="danger" @click="batchDelete">批量删除</a-button>
      </div>
    </a-card>

    <!-- 详情弹窗 -->
    <a-modal v-model:visible="detailVisible" title="内容详情" width="600px" :footer="false">
      <div v-if="currentPost">
        <div class="flex items-center gap-3 mb-4">
          <a-avatar :size="48">{{ currentPost.username.charAt(0) }}</a-avatar>
          <div>
            <div class="font-medium">{{ currentPost.username }}</div>
            <div class="text-gray-400 text-sm">{{ currentPost.createdAt }}</div>
          </div>
        </div>
        <div class="mb-4">{{ currentPost.content }}</div>
        <div v-if="currentPost.images && currentPost.images.length" class="mb-4">
          <a-image-preview-group>
            <a-space>
              <a-image v-for="(img, i) in currentPost.images" :key="i" :src="img" width="100" height="100" fit="cover" />
            </a-space>
          </a-image-preview-group>
        </div>
        <a-divider />
        <div class="flex justify-between">
          <span>点赞: {{ currentPost.likeCount }} · 评论: {{ currentPost.commentCount }} · 分享: {{ currentPost.shareCount || 0 }}</span>
          <a-space>
            <a-button v-if="currentPost.status === 0" type="primary" size="small" @click="approvePost(currentPost); detailVisible = false">通过</a-button>
            <a-button size="small" status="warning" @click="blockPost(currentPost); detailVisible = false">屏蔽</a-button>
            <a-button size="small" status="danger" @click="deletePost(currentPost); detailVisible = false">删除</a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { request } from '@/utils/request.js'

const loading = ref(false)
const tableData = ref([])
const detailVisible = ref(false)
const currentPost = ref(null)
const selectedKeys = ref([])

const searchForm = reactive({
  tab: 'all',
  keyword: '',
  status: null,
  dateRange: []
})

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false,
  onChange: (keys) => { selectedKeys.value = keys }
})

const getStatusColor = (status) => {
  const colors = { '-1': 'red', 0: 'orange', 1: 'green' }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = { '-1': '已下架', 0: '待审核', 1: '正常' }
  return texts[status] || '未知'
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      status: searchForm.status !== null ? searchForm.status : undefined,
      isOfficial: 0,  // 只查询普通用户帖子
    }
    
    // 根据 tab 设置筛选条件
    if (searchForm.tab === 'pending') {
      params.status = 0  // 待审核
    }
    
    // 时间范围
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }
    
    // 过滤 undefined 参数
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key])
    
    const res = await request({
      url: '/api/square/admin/posts',
      method: 'get',
      params
    })
    if (res.code === 0 && res.data) {
      tableData.value = res.data.list.map(item => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : [],
        username: item.author?.nickname || `用户${item.userId}`,
        uid: `U${item.userId}`,
        reportCount: 0  // 待后端实现举报统计
      }))
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    Message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 监听 tab 变化
watch(() => searchForm.tab, () => {
  pagination.current = 1
  fetchData()
})

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handlePageChange = (page) => {
  pagination.current = page
  fetchData()
}

const viewDetail = (record) => {
  currentPost.value = record
  detailVisible.value = true
}

const approvePost = async (record) => {
  try {
    const res = await request({
      url: `/api/square/admin/post/${record.id}/restore`,
      method: 'post'
    })
    if (res.code === 0) {
      record.status = 1
      Message.success('已通过')
    } else {
      Message.error(res.msg || '操作失败')
    }
  } catch (e) {
    Message.error('操作失败')
  }
}

const featurePost = async (record) => {
  try {
    const res = await request({
      url: `/api/square/admin/post/${record.id}/hot`,
      method: 'post',
      data: { isHot: true }
    })
    if (res.code === 0) {
      record.isHot = 1
      Message.success('已推荐')
    } else {
      Message.error(res.msg || '操作失败')
    }
  } catch (e) {
    Message.error('操作失败')
  }
}

const blockPost = (record) => {
  Modal.confirm({
    title: '确认屏蔽',
    content: '屏蔽后内容将不再展示，确定吗？',
    onOk: async () => {
      try {
        const res = await request({
          url: `/api/square/admin/post/${record.id}/offline`,
          method: 'post',
          data: { reason: '管理员屏蔽' }
        })
        if (res.code === 0) {
          record.status = -1
          Message.success('已屏蔽')
        } else {
          Message.error(res.msg || '操作失败')
        }
      } catch (e) {
        Message.error('操作失败')
      }
    }
  })
}

const warnUser = (record) => {
  Message.info('警告用户功能开发中')
}

const deletePost = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: '删除后无法恢复，确定吗？',
    onOk: async () => {
      try {
        const res = await request({
          url: `/api/square/admin/post/${record.id}`,
          method: 'delete'
        })
        if (res.code === 0) {
          Message.success('已删除')
          fetchData()
        } else {
          Message.error(res.msg || '删除失败')
        }
      } catch (e) {
        Message.error('删除失败')
      }
    }
  })
}

const batchApprove = async () => {
  if (selectedKeys.value.length === 0) return
  try {
    const res = await request({
      url: '/api/square/admin/posts/batch',
      method: 'post',
      data: { postIds: selectedKeys.value, action: 'restore' }
    })
    if (res.code === 0) {
      Message.success(`已批量通过 ${res.data.success} 条内容`)
      selectedKeys.value = []
      fetchData()
    }
  } catch (e) {
    Message.error('批量操作失败')
  }
}

const batchBlock = async () => {
  if (selectedKeys.value.length === 0) return
  try {
    const res = await request({
      url: '/api/square/admin/posts/batch',
      method: 'post',
      data: { postIds: selectedKeys.value, action: 'offline' }
    })
    if (res.code === 0) {
      Message.success(`已批量屏蔽 ${res.data.success} 条内容`)
      selectedKeys.value = []
      fetchData()
    }
  } catch (e) {
    Message.error('批量操作失败')
  }
}

const batchDelete = () => {
  if (selectedKeys.value.length === 0) return
  Modal.confirm({
    title: '批量删除',
    content: `确定要删除选中的 ${selectedKeys.value.length} 条内容吗？`,
    onOk: async () => {
      try {
        const res = await request({
          url: '/api/square/admin/posts/batch',
          method: 'post',
          data: { postIds: selectedKeys.value, action: 'delete' }
        })
        if (res.code === 0) {
          Message.success(`已批量删除 ${res.data.success} 条内容`)
          selectedKeys.value = []
          fetchData()
        }
      } catch (e) {
        Message.error('批量操作失败')
      }
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.text-red-500 { color: #f5222d; }
</style>
