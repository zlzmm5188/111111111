<template>
  <div class="login-logs-container">
    <a-card title="登录记录">
      <!-- 搜索栏 -->
      <a-row :gutter="16" class="mb-4">
        <a-col :span="6">
          <a-input v-model="searchForm.keyword" placeholder="用户ID/手机号/邮箱" allow-clear />
        </a-col>
        <a-col :span="4">
          <a-select v-model="searchForm.status" placeholder="登录状态" allow-clear style="width: 100%">
            <a-option value="success">成功</a-option>
            <a-option value="failed">失败</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-range-picker v-model="searchForm.dateRange" style="width: 100%" />
        </a-col>
        <a-col :span="4">
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-col>
      </a-row>

      <!-- 统计信息 -->
      <a-row :gutter="16" class="mb-4">
        <a-col :span="6">
          <a-statistic title="今日登录次数" :value="stats.todayCount" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="今日活跃用户" :value="stats.todayActiveUsers" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="登录失败次数" :value="stats.failedCount" class="danger-stat" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="异常登录预警" :value="stats.abnormalCount" class="warning-stat" />
        </a-col>
      </a-row>

      <!-- 记录表格 -->
      <a-table :columns="columns" :data="tableData" :pagination="pagination" :loading="loading">
        <template #status="{ record }">
          <a-tag :color="record.status === 'success' ? 'green' : 'red'">
            {{ record.status === 'success' ? '成功' : '失败' }}
          </a-tag>
        </template>
        <template #device="{ record }">
          <a-space>
            <icon-mobile v-if="record.deviceType === 'mobile'" />
            <icon-desktop v-else />
            <span>{{ record.device }}</span>
          </a-space>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
            <a-button type="text" size="small" status="danger" @click="handleMarkAbnormal(record)">标记异常</a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 详情弹窗 -->
    <a-modal v-model:visible="detailVisible" title="登录详情" width="600px" :footer="false">
      <a-descriptions :data="detailData" :column="2" bordered />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import request from '@/utils/request'

const loading = ref(false)
const detailVisible = ref(false)

const searchForm = reactive({
  keyword: '',
  status: '',
  dateRange: []
})

const stats = reactive({
  todayCount: 0,
  todayActiveUsers: 0,
  failedCount: 0,
  abnormalCount: 0
})

const columns = [
  { title: '用户ID', dataIndex: 'userId', width: 100 },
  { title: '用户名', dataIndex: 'username', width: 120 },
  { title: '登录时间', dataIndex: 'loginTime', width: 180 },
  { title: '登录状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: 'IP地址', dataIndex: 'ip', width: 140 },
  { title: '归属地', dataIndex: 'location', width: 120 },
  { title: '设备信息', dataIndex: 'device', slotName: 'device', width: 150 },
  { title: '失败原因', dataIndex: 'failReason', width: 150 },
  { title: '操作', slotName: 'action', width: 140, fixed: 'right' }
]

const tableData = ref([])
const detailData = ref([])

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: true,
  showPageSize: true
})

const fetchStats = async () => {
  try {
    const res = await request({
      url: '/api/admin/login-log/stats',
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
      url: '/api/admin/login-log/list',
      method: 'get',
      params: {
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword || undefined,
        status: searchForm.status || undefined,
        startDate: searchForm.dateRange?.[0] || undefined,
        endDate: searchForm.dateRange?.[1] || undefined
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

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

const handleViewDetail = (record) => {
  detailData.value = [
    { label: '用户ID', value: record.userId },
    { label: '用户名', value: record.username },
    { label: '登录时间', value: record.loginTime },
    { label: '登录状态', value: record.status === 'success' ? '成功' : '失败' },
    { label: 'IP地址', value: record.ip },
    { label: '归属地', value: record.location },
    { label: '设备类型', value: record.deviceType === 'mobile' ? '移动端' : '桌面端' },
    { label: '设备信息', value: record.device },
    { label: '失败原因', value: record.failReason || '-' },
  ]
  detailVisible.value = true
}

const handleMarkAbnormal = async (record) => {
  try {
    const res = await request({
      url: `/api/admin/login-log/${record.id}/abnormal`,
      method: 'post'
    })
    if (res.code === 0) {
      Message.success(`已将用户 ${record.username} 的登录标记为异常`)
      fetchStats()
    }
  } catch (error) {
    Message.error('操作失败')
  }
}

onMounted(() => {
  fetchStats()
  fetchData()
})
</script>

<style scoped>
.login-logs-container {
  padding: 16px;
}
.mb-4 {
  margin-bottom: 16px;
}
:deep(.danger-stat .arco-statistic-value) {
  color: #f53f3f;
}
:deep(.warning-stat .arco-statistic-value) {
  color: #ff7d00;
}
</style>
