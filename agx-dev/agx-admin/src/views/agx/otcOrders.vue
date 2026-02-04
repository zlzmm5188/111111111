<template>
  <div class="otc-orders-container">
    <a-card title="OTC订单管理">
      <!-- 统计卡片 -->
      <a-row :gutter="16" class="mb-4">
        <a-col :span="4">
          <a-statistic title="今日订单数" :value="stats.todayCount" />
        </a-col>
        <a-col :span="4">
          <a-statistic title="今日成交额" :value="stats.todayAmount" :precision="2" suffix="USDT" />
        </a-col>
        <a-col :span="4">
          <a-statistic title="待处理订单" :value="stats.pendingCount" class="warning-stat" />
        </a-col>
        <a-col :span="4">
          <a-statistic title="申诉中" :value="stats.appealCount" class="danger-stat" />
        </a-col>
        <a-col :span="4">
          <a-statistic title="完成率" :value="stats.completeRate" suffix="%" />
        </a-col>
        <a-col :span="4">
          <a-statistic title="总成交额" :value="stats.totalAmount" :precision="2" suffix="USDT" />
        </a-col>
      </a-row>

      <!-- Tab切换 -->
      <a-tabs v-model:active-key="activeTab" class="mb-4">
        <a-tab-pane key="all" title="全部订单" />
        <a-tab-pane key="pending" title="待处理" />
        <a-tab-pane key="appeal" title="申诉订单" />
        <a-tab-pane key="completed" title="已完成" />
        <a-tab-pane key="cancelled" title="已取消" />
      </a-tabs>

      <!-- 搜索栏 -->
      <a-row :gutter="16" class="mb-4">
        <a-col :span="5">
          <a-input v-model="searchForm.orderId" placeholder="订单号" allow-clear />
        </a-col>
        <a-col :span="4">
          <a-input v-model="searchForm.userId" placeholder="用户ID" allow-clear />
        </a-col>
        <a-col :span="3">
          <a-select v-model="searchForm.type" placeholder="交易类型" allow-clear style="width: 100%">
            <a-option value="buy">买入</a-option>
            <a-option value="sell">卖出</a-option>
          </a-select>
        </a-col>
        <a-col :span="3">
          <a-select v-model="searchForm.currency" placeholder="币种" allow-clear style="width: 100%">
            <a-option value="USDT">USDT</a-option>
            <a-option value="BTC">BTC</a-option>
            <a-option value="ETH">ETH</a-option>
          </a-select>
        </a-col>
        <a-col :span="5">
          <a-range-picker v-model="searchForm.dateRange" style="width: 100%" />
        </a-col>
        <a-col :span="4">
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-col>
      </a-row>

      <!-- 订单表格 -->
      <a-table :columns="columns" :data="tableData" :pagination="pagination" :loading="loading">
        <template #type="{ record }">
          <a-tag :color="record.type === 'buy' ? 'green' : 'red'">
            {{ record.type === 'buy' ? '买入' : '卖出' }}
          </a-tag>
        </template>
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
            <a-button v-if="record.status === 'appeal'" type="text" size="small" status="warning" @click="handleAppeal(record)">处理申诉</a-button>
            <a-button v-if="record.status === 'pending'" type="text" size="small" status="success" @click="handleComplete(record)">确认完成</a-button>
            <a-button v-if="record.status === 'pending'" type="text" size="small" status="danger" @click="handleCancel(record)">取消订单</a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 详情弹窗 -->
    <a-modal v-model:visible="detailVisible" title="订单详情" width="700px" :footer="false">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="订单号">{{ currentOrder.orderId }}</a-descriptions-item>
        <a-descriptions-item label="交易类型">{{ currentOrder.type === 'buy' ? '买入' : '卖出' }}</a-descriptions-item>
        <a-descriptions-item label="买方用户">{{ currentOrder.buyerName }} (ID: {{ currentOrder.buyerId }})</a-descriptions-item>
        <a-descriptions-item label="卖方用户">{{ currentOrder.sellerName }} (ID: {{ currentOrder.sellerId }})</a-descriptions-item>
        <a-descriptions-item label="交易币种">{{ currentOrder.currency }}</a-descriptions-item>
        <a-descriptions-item label="交易数量">{{ currentOrder.amount }}</a-descriptions-item>
        <a-descriptions-item label="单价">{{ currentOrder.price }} CNY</a-descriptions-item>
        <a-descriptions-item label="总金额">{{ currentOrder.totalPrice }} CNY</a-descriptions-item>
        <a-descriptions-item label="支付方式">{{ currentOrder.payMethod }}</a-descriptions-item>
        <a-descriptions-item label="订单状态">{{ getStatusText(currentOrder.status) }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ currentOrder.createdAt }}</a-descriptions-item>
        <a-descriptions-item label="完成时间">{{ currentOrder.completedAt || '-' }}</a-descriptions-item>
      </a-descriptions>
      
      <a-divider v-if="currentOrder.status === 'appeal'">申诉信息</a-divider>
      <template v-if="currentOrder.status === 'appeal'">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="申诉方">{{ currentOrder.appealUser }}</a-descriptions-item>
          <a-descriptions-item label="申诉原因">{{ currentOrder.appealReason }}</a-descriptions-item>
          <a-descriptions-item label="申诉凭证">
            <a-image-preview-group>
              <a-space>
                <a-image v-for="img in currentOrder.appealImages" :key="img" :src="img" width="80" height="80" />
              </a-space>
            </a-image-preview-group>
          </a-descriptions-item>
        </a-descriptions>
      </template>
    </a-modal>

    <!-- 申诉处理弹窗 -->
    <a-modal v-model:visible="appealVisible" title="处理申诉" @ok="handleAppealSubmit">
      <a-form :model="appealForm" layout="vertical">
        <a-form-item label="处理结果" required>
          <a-radio-group v-model="appealForm.result">
            <a-radio value="buyer">判买方胜</a-radio>
            <a-radio value="seller">判卖方胜</a-radio>
            <a-radio value="cancel">取消订单（双方无责）</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="处理说明" required>
          <a-textarea v-model="appealForm.remark" placeholder="请输入处理说明" :max-length="500" show-word-limit />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import request from '@/utils/request'

const loading = ref(false)
const activeTab = ref('all')
const detailVisible = ref(false)
const appealVisible = ref(false)

const searchForm = reactive({
  orderId: '',
  userId: '',
  type: '',
  currency: '',
  dateRange: []
})

const appealForm = reactive({
  result: '',
  remark: ''
})

const stats = reactive({
  todayCount: 0,
  todayAmount: 0,
  pendingCount: 0,
  appealCount: 0,
  completeRate: 0,
  totalAmount: 0
})

const columns = [
  { title: '订单号', dataIndex: 'orderId', width: 180 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 80 },
  { title: '币种', dataIndex: 'currency', width: 80 },
  { title: '数量', dataIndex: 'amount', width: 120 },
  { title: '单价(CNY)', dataIndex: 'price', width: 100 },
  { title: '总额(CNY)', dataIndex: 'totalPrice', width: 120 },
  { title: '买方', dataIndex: 'buyerName', width: 100 },
  { title: '卖方', dataIndex: 'sellerName', width: 100 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '操作', slotName: 'action', width: 200, fixed: 'right' }
]

const tableData = ref([])
const currentOrder = ref({})

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: true,
  showPageSize: true
})

const getStatusColor = (status) => {
  const colors = { pending: 'orange', paid: 'blue', completed: 'green', cancelled: 'gray', appeal: 'red' }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = { pending: '待付款', paid: '已付款', completed: '已完成', cancelled: '已取消', appeal: '申诉中' }
  return texts[status] || status
}

const fetchStats = async () => {
  try {
    const res = await request({
      url: '/api/admin/otc/stats',
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
      url: '/api/admin/otc/orders',
      method: 'get',
      params: {
        page: pagination.current,
        pageSize: pagination.pageSize,
        status: activeTab.value !== 'all' ? activeTab.value : undefined,
        type: searchForm.type || undefined,
        currency: searchForm.currency || undefined,
        keyword: searchForm.orderId || searchForm.userId || undefined
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

watch(activeTab, () => {
  pagination.current = 1
  fetchData()
})

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleReset = () => {
  Object.assign(searchForm, { orderId: '', userId: '', type: '', currency: '', dateRange: [] })
  handleSearch()
}

const handleViewDetail = (record) => {
  currentOrder.value = record
  detailVisible.value = true
}

const handleAppeal = (record) => {
  currentOrder.value = record
  appealForm.result = ''
  appealForm.remark = ''
  appealVisible.value = true
}

const handleAppealSubmit = async () => {
  if (!appealForm.result || !appealForm.remark) {
    Message.warning('请填写完整信息')
    return
  }
  try {
    await request({
      url: `/api/admin/otc/${currentOrder.value.id}/appeal`,
      method: 'post',
      data: { result: appealForm.result, remark: appealForm.remark }
    })
    Message.success('申诉处理成功')
    appealVisible.value = false
    fetchData()
    fetchStats()
  } catch (error) {
    Message.error('操作失败')
  }
}

const handleComplete = async (record) => {
  try {
    await request({
      url: `/api/admin/otc/${record.id}/complete`,
      method: 'post'
    })
    Message.success(`订单 ${record.orderId} 已确认完成`)
    fetchData()
    fetchStats()
  } catch (error) {
    Message.error('操作失败')
  }
}

const handleCancel = async (record) => {
  try {
    await request({
      url: `/api/admin/otc/${record.id}/cancel`,
      method: 'post'
    })
    Message.success(`订单 ${record.orderId} 已取消`)
    fetchData()
    fetchStats()
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
.otc-orders-container {
  padding: 16px;
}
.mb-4 {
  margin-bottom: 16px;
}
:deep(.warning-stat .arco-statistic-value) {
  color: #ff7d00;
}
:deep(.danger-stat .arco-statistic-value) {
  color: #f53f3f;
}
</style>
