<template>
  <div class="p-4">
    <a-card title="邀请记录" :bordered="false">
      <template #extra>
        <a-space>
          <a-input-search v-model="searchKeyword" placeholder="搜索用户" @search="handleSearch" style="width: 200px" />
        </a-space>
      </template>

      <!-- 统计卡片 -->
      <a-row :gutter="16" class="mb-4">
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <div class="stat-label">总邀请用户</div>
            <div class="stat-value">{{ stats.totalInvites }}</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <div class="stat-label">今日邀请</div>
            <div class="stat-value">{{ stats.todayInvites }}</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <div class="stat-label">总返佣金额</div>
            <div class="stat-value text-green">{{ formatNumber(stats.totalCommission) }}</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <div class="stat-label">有效推广员</div>
            <div class="stat-value">{{ stats.activePromoters }}</div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 邀请记录表格 -->
      <a-table :data="tableData" :loading="loading" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="用户" :width="200">
            <template #cell="{ record }">
              <div class="flex items-center gap-2">
                <a-avatar :size="36">{{ (record.username || '').charAt(0) }}</a-avatar>
                <div>
                  <div class="font-medium user-link" @click="goUserDetail(record)">{{ record.username }}</div>
                  <div class="text-gray-400 text-xs">ID: {{ record.userId }}</div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="等级" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getLevelColor(record.level)">{{ getLevelName(record.level) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="邀请人数" :width="120">
            <template #cell="{ record }">
              <span class="invite-count">{{ record.inviteCount }}</span> 人
            </template>
          </a-table-column>
          <a-table-column title="一级邀请" :width="100">
            <template #cell="{ record }">
              {{ record.directCount }} 人
            </template>
          </a-table-column>
          <a-table-column title="二级邀请" :width="100">
            <template #cell="{ record }">
              {{ record.indirectCount }} 人
            </template>
          </a-table-column>
          <a-table-column title="获得返佣" :width="140">
            <template #cell="{ record }">
              <span class="text-green">{{ formatNumber(record.totalCommission) }} USDT</span>
            </template>
          </a-table-column>
          <a-table-column title="注册时间" data-index="createdAt" :width="160" />
          <a-table-column title="操作" :width="100">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="viewInviteDetail(record)">查看详情</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 邀请详情弹窗 -->
    <a-modal v-model:visible="detailVisible" title="邀请详情" :width="700" :footer="false">
      <div v-if="detailData.user" class="detail-header">
        <div class="user-info">
          <a-avatar :size="48">{{ (detailData.user.username || '').charAt(0) }}</a-avatar>
          <div>
            <div class="font-medium text-lg">{{ detailData.user.username }}</div>
            <div class="text-gray-400">累计邀请 {{ detailData.user.inviteCount }} 人 · 返佣 {{ formatNumber(detailData.user.totalCommission) }} USDT</div>
          </div>
        </div>
      </div>
      
      <a-divider>邀请的用户</a-divider>
      <a-table :data="detailData.invites" :pagination="false" size="small" v-if="detailData.invites.length > 0">
        <template #columns>
          <a-table-column title="用户" :width="150">
            <template #cell="{ record }">
              <span class="user-link" @click="goUserDetail(record)">{{ record.username }}</span>
            </template>
          </a-table-column>
          <a-table-column title="层级" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.level === 1 ? 'blue' : 'gray'" size="small">{{ record.level === 1 ? '一级' : '二级' }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'orange'" size="small">{{ record.status === 1 ? '已激活' : '未激活' }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="产生返佣" :width="120">
            <template #cell="{ record }">
              <span class="text-green">{{ formatNumber(record.commission) }} USDT</span>
            </template>
          </a-table-column>
          <a-table-column title="注册时间" data-index="createdAt" />
        </template>
      </a-table>
      <a-empty v-else description="暂无邀请记录" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import request from '@/utils/request'

const router = useRouter()
const loading = ref(false)
const searchKeyword = ref('')
const tableData = ref([])
const detailVisible = ref(false)

const stats = reactive({
  totalInvites: 0,
  todayInvites: 0,
  totalCommission: '0.00',
  activePromoters: 0
})

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

const detailData = reactive({
  user: null,
  invites: []
})

const formatNumber = (num) => {
  return Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getLevelColor = (level) => {
  const colors = { 1: 'gray', 2: '#C0C0C0', 3: '#FFD700', 4: '#00CED1', 5: '#1a1a2e' }
  return colors[level] || 'gray'
}

const getLevelName = (level) => {
  const names = { 1: '准入会员', 2: '优选会员', 3: '资本合伙人', 4: '执行官合伙人', 5: '主权合伙人' }
  return names[level] || '准入会员'
}

const fetchStats = async () => {
  try {
    const res = await request({
      url: '/api/admin/invite/stats',
      method: 'get'
    })
    if (res.code === 0 && res.data) {
      Object.assign(stats, res.data)
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/api/admin/invite/records',
      method: 'get',
      params: {
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: searchKeyword.value || undefined
      }
    })
    if (res.code === 0 && res.data) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handlePageChange = (page) => {
  pagination.current = page
  fetchData()
}

const viewInviteDetail = async (record) => {
  try {
    const res = await request({
      url: `/api/admin/invite/user/${record.userId}`,
      method: 'get'
    })
    if (res.code === 0 && res.data) {
      detailData.user = res.data.user
      detailData.invites = res.data.invites || []
      detailVisible.value = true
    }
  } catch (error) {
    Message.error('获取邀请详情失败')
  }
}

const goUserDetail = (record) => {
  const userId = record.userId || record.id
  if (userId) {
    router.push(`/agx/userDetail/${userId}`)
  }
}

onMounted(() => {
  fetchStats()
  fetchData()
})
</script>

<style scoped>
.stat-card {
  text-align: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
}
.stat-label {
  font-size: 12px;
  color: #86909c;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}
.text-green {
  color: #52c41a;
}
.invite-count {
  font-weight: 600;
  color: #1890ff;
  font-size: 16px;
}
.user-link {
  cursor: pointer;
  color: #1890ff;
}
.user-link:hover {
  text-decoration: underline;
}
.detail-header {
  margin-bottom: 16px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
