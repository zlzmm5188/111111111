<template>
  <div class="p-4">
    <a-card title="黄金收益记录" :bordered="false">
      <template #extra>
        <a-space>
          <a-range-picker v-model="searchForm.dateRange" style="width: 240px" />
          <a-input-search v-model="searchForm.keyword" placeholder="用户名/UID" @search="handleSearch" style="width: 180px" />
          <a-select v-model="searchForm.type" placeholder="收益类型" style="width: 140px" allow-clear>
            <a-option value="daily">每日收益</a-option>
            <a-option value="trade">交易收益</a-option>
            <a-option value="bonus">活动奖励</a-option>
          </a-select>
        </a-space>
      </template>

      <!-- 统计 -->
      <a-row :gutter="16" class="mb-4">
        <a-col :span="6">
          <a-statistic title="今日发放" :value="stats.todayTotal" :precision="2">
            <template #suffix>USDT</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本周发放" :value="stats.weekTotal" :precision="2">
            <template #suffix>USDT</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月发放" :value="stats.monthTotal" :precision="2">
            <template #suffix>USDT</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="累计发放" :value="stats.allTotal" :precision="2">
            <template #suffix>USDT</template>
          </a-statistic>
        </a-col>
      </a-row>

      <a-table :data="tableData" :loading="loading" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="用户" :width="140">
            <template #cell="{ record }">
              <div>
                <div class="font-medium">{{ record.username }}</div>
                <div class="text-gray-400 text-xs">{{ record.uid }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="收益类型" data-index="incomeType" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getTypeColor(record.incomeType)">{{ getTypeName(record.incomeType) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="收益金额(USDT)" :width="140">
            <template #cell="{ record }">
              <span class="text-green-500 font-medium">+{{ formatNumber(record.amount) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="持仓克数" data-index="holdingGrams" :width="120">
            <template #cell="{ record }">
              {{ record.holdingGrams }} 克
            </template>
          </a-table-column>
          <a-table-column title="收益率" :width="100">
            <template #cell="{ record }">
              <span class="text-blue-500">{{ record.rate }}%</span>
            </template>
          </a-table-column>
          <a-table-column title="金价(当时)" data-index="goldPrice" :width="120">
            <template #cell="{ record }">
              ${{ formatNumber(record.goldPrice) }}
            </template>
          </a-table-column>
          <a-table-column title="发放时间" data-index="createdAt" :width="160" />
          <a-table-column title="备注" data-index="remark" :width="150" ellipsis />
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])

const searchForm = reactive({
  keyword: '',
  type: '',
  dateRange: []
})

const stats = reactive({
  todayTotal: 0,
  weekTotal: 0,
  monthTotal: 0,
  allTotal: 0
})

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

const formatNumber = (num) => {
  return Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getTypeColor = (type) => {
  const colors = { daily: 'green', trade: 'blue', bonus: 'orange', income: 'green', pool_income: 'green' }
  return colors[type] || 'gray'
}

const getTypeName = (type) => {
  const names = { daily: '每日收益', trade: '交易收益', bonus: '活动奖励', income: '收益', pool_income: '矿池收益' }
  return names[type] || type
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/api/admin/asset/logs',
      method: 'get',
      params: {
        page: pagination.current,
        pageSize: pagination.pageSize,
        type: searchForm.type || 'income,pool_income',
        keyword: searchForm.keyword || undefined,
        startDate: searchForm.dateRange?.[0] || undefined,
        endDate: searchForm.dateRange?.[1] || undefined
      }
    })
    if (res.code === 0 && res.data) {
      tableData.value = (res.data.list || []).map(item => ({
        id: item.id,
        username: item.username,
        uid: `U${item.userId || item.id}`,
        incomeType: item.type || 'daily',
        amount: Math.abs(Number(item.amount || 0)),
        holdingGrams: 0,
        rate: 0.05,
        goldPrice: 2650.00,
        createdAt: item.createdAt,
        remark: item.remark || '-'
      }))
      pagination.total = res.data.total || 0
      
      // 计算统计
      stats.allTotal = tableData.value.reduce((sum, item) => sum + item.amount, 0)
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

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.text-green-500 { color: #52c41a; }
.text-blue-500 { color: #1890ff; }
</style>
