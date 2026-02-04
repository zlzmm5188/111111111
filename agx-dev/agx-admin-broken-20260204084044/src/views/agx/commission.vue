<template>
  <div class="agx-page">
    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon total"><icon-gift /></div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.totalAmount) }}</div>
          <div class="stat-label">累计返佣 (USDT)</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon today"><icon-rise /></div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.todayAmount) }}</div>
          <div class="stat-label">今日返佣</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending"><icon-clock-circle /></div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.pendingAmount) }}</div>
          <div class="stat-label">待发放</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon count"><icon-file-text /></div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalCount }}</div>
          <div class="stat-label">返佣笔数</div>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="agx-search-bar">
      <a-input v-model="searchForm.keyword" placeholder="用户名 / UID" allow-clear style="width: 180px">
        <template #prefix><icon-search /></template>
      </a-input>
      <a-select v-model="searchForm.rewardType" placeholder="返佣类型" allow-clear style="width: 140px">
        <a-option value="signup">注册奖励</a-option>
        <a-option value="pool">矿机收益</a-option>
        <a-option value="ieo">预售返佣</a-option>
        <a-option value="holding">持币生金</a-option>
      </a-select>
      <a-select v-model="searchForm.level" placeholder="层级" allow-clear style="width: 100px">
        <a-option :value="1">一级</a-option>
        <a-option :value="2">二级</a-option>
      </a-select>
      <a-select v-model="searchForm.status" placeholder="状态" allow-clear style="width: 120px">
        <a-option :value="0">待发放</a-option>
        <a-option :value="1">已发放</a-option>
      </a-select>
      <a-range-picker v-model="searchForm.dateRange" style="width: 240px" />
      <a-button type="primary" @click="handleSearch">
        <template #icon><icon-search /></template>
        搜索
      </a-button>
      <a-button @click="handleReset">
        <template #icon><icon-refresh /></template>
        重置
      </a-button>
    </div>

    <!-- 数据表格 -->
    <div class="agx-card agx-table">
      <a-table 
        :data="tableData" 
        :loading="loading" 
        :pagination="pagination" 
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        row-key="id"
        :scroll="{ x: 1200 }"
      >
        <template #columns>
          <a-table-column title="ID" data-index="id" :width="70" />
          <a-table-column title="获佣用户" :width="140">
            <template #cell="{ record }">
              <div class="user-cell">
                <span class="username">{{ record.username || `用户${record.userId}` }}</span>
                <span class="uid">UID: {{ record.userUid || record.userId }}</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="来源用户" :width="140">
            <template #cell="{ record }">
              <div class="user-cell" v-if="record.invitedUsername">
                <span class="username">{{ record.invitedUsername }}</span>
                <span class="uid">UID: {{ record.invitedUserUid || record.invitedUserId }}</span>
              </div>
              <span v-else class="text-gray">-</span>
            </template>
          </a-table-column>
          <a-table-column title="返佣类型" :width="100">
            <template #cell="{ record }">
              <a-tag v-if="record.rewardType === 'signup'" color="purple">注册奖励</a-tag>
              <a-tag v-else-if="record.rewardType === 'pool'" color="blue">矿机收益</a-tag>
              <a-tag v-else-if="record.rewardType === 'ieo'" color="orange">预售返佣</a-tag>
              <a-tag v-else-if="record.rewardType === 'holding'" color="gold">持币生金</a-tag>
              <a-tag v-else color="gray">{{ record.rewardType || '其他' }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="层级" :width="80" align="center">
            <template #cell="{ record }">
              <a-tag v-if="record.level === 1" color="arcoblue">一级</a-tag>
              <a-tag v-else-if="record.level === 2" color="cyan">二级</a-tag>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="返佣金额" :width="130" align="right">
            <template #cell="{ record }">
              <span class="amount-value">+{{ formatNumber(record.amount) }}</span>
              <span class="coin-symbol">{{ record.coinSymbol || 'USDT' }}</span>
            </template>
          </a-table-column>
          <a-table-column title="比例" :width="80" align="center">
            <template #cell="{ record }">
              <span v-if="record.rate">{{ (parseFloat(record.rate) * 100).toFixed(1) }}%</span>
              <span v-else class="text-gray">-</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="90" align="center">
            <template #cell="{ record }">
              <span class="agx-status" :class="record.status === 1 ? 'success' : 'warning'">
                {{ record.status === 1 ? '已发放' : '待发放' }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="发放时间" :width="160">
            <template #cell="{ record }">
              {{ record.issuedAt || record.createdAt }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="100" fixed="right" align="center">
            <template #cell="{ record }">
              <a-button 
                v-if="record.status === 0" 
                type="primary" 
                size="small" 
                @click="handleIssue(record)"
              >
                发放
              </a-button>
              <a-button v-else type="text" size="small" @click="handleViewDetail(record)">
                详情
              </a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import agxApi from '@/api/agx'

const loading = ref(false)
const tableData = ref([])

const stats = reactive({
  totalAmount: '0',
  todayAmount: '0',
  pendingAmount: '0',
  totalCount: 0
})

const searchForm = reactive({ 
  keyword: '',
  rewardType: undefined,
  level: undefined,
  status: undefined,
  dateRange: []
})

const pagination = reactive({ 
  current: 1, 
  pageSize: 20, 
  total: 0, 
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

const formatNumber = (val) => {
  if (!val || val === '0') return '0.00'
  const num = parseFloat(val)
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
  return num.toFixed(2)
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      rewardType: searchForm.rewardType,
      level: searchForm.level,
      status: searchForm.status
    }
    
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }
    
    const res = await agxApi.getCommissionList(params)
    if (res.code === 0) {
      tableData.value = res.data?.list || []
      pagination.total = res.data?.total || 0
      
      // 更新统计
      if (res.data?.stats) {
        stats.totalAmount = res.data.stats.totalAmount || '0'
        stats.todayAmount = res.data.stats.todayAmount || '0'
        stats.pendingAmount = res.data.stats.pendingAmount || '0'
        stats.totalCount = res.data.stats.totalCount || pagination.total
      }
    }
  } catch (e) {
    console.error(e)
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
  searchForm.rewardType = undefined
  searchForm.level = undefined
  searchForm.status = undefined
  searchForm.dateRange = []
  pagination.current = 1
  fetchData()
}

const onPageChange = (page) => { 
  pagination.current = page
  fetchData() 
}

const onPageSizeChange = (size) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchData()
}

const handleIssue = (record) => {
  Modal.confirm({
    title: '确认发放',
    content: `确定发放 ${record.amount} ${record.coinSymbol || 'USDT'} 返佣给用户 ${record.username || record.userId}？`,
    onOk: async () => {
      try {
        // TODO: 调用发放接口
        Message.success('发放成功')
        fetchData()
      } catch (e) {
        Message.error('发放失败')
      }
    }
  })
}

const handleViewDetail = (record) => {
  Modal.info({
    title: '返佣详情',
    content: `
      获佣用户: ${record.username || record.userId}
      来源用户: ${record.invitedUsername || record.invitedUserId || '-'}
      返佣类型: ${record.rewardType}
      金额: ${record.amount} ${record.coinSymbol || 'USDT'}
      时间: ${record.issuedAt || record.createdAt}
    `
  })
}

onMounted(() => { 
  fetchData() 
})
</script>

<style lang="less" scoped>
.agx-page {
  .agx-page-header {
    margin-bottom: 20px;
    
    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--color-text-1);
      margin: 0 0 4px 0;
    }
    
    .page-desc {
      font-size: 13px;
      color: var(--color-text-3);
      margin: 0;
    }
  }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--color-bg-2);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  
  &.total { background: rgba(22, 93, 255, 0.1); color: #165DFF; }
  &.today { background: rgba(0, 180, 42, 0.1); color: #00B42A; }
  &.pending { background: rgba(255, 125, 0, 0.1); color: #FF7D00; }
  &.count { background: rgba(114, 46, 209, 0.1); color: #722ED1; }
}

.stat-content {
  .stat-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text-1);
  }
  .stat-label {
    font-size: 13px;
    color: var(--color-text-3);
  }
}

.user-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  .username {
    font-weight: 500;
    color: var(--color-text-1);
  }
  .uid {
    font-size: 11px;
    color: var(--color-text-3);
    font-family: 'SF Mono', Monaco, monospace;
  }
}

.amount-value {
  font-family: 'SF Mono', Monaco, monospace;
  font-weight: 600;
  color: #00B42A;
  margin-right: 4px;
}

.coin-symbol {
  font-size: 12px;
  color: var(--color-text-3);
}

.text-gray {
  color: var(--color-text-4);
}
</style>
