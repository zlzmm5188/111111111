<template>
  <div class="agx-page">
    <!-- 搜索区域 -->
    <div class="agx-search-bar">
      <a-input 
        v-model="searchForm.keyword" 
        placeholder="用户名/订单号" 
        allow-clear 
        style="width: 150px"
      >
        <template #prefix><icon-search /></template>
      </a-input>
      <a-input 
        v-model="searchForm.realName" 
        placeholder="实名" 
        allow-clear 
        style="width: 150px"
      >
        <template #prefix><icon-idcard /></template>
      </a-input>
      <a-select v-model="searchForm.status" placeholder="状态" allow-clear style="width: 120px">
        <a-option value="holding">持有中</a-option>
        <a-option value="redeemed">已赎回</a-option>
      </a-select>
      <a-select v-model="searchForm.isInternal" placeholder="会员类型" allow-clear style="width: 120px">
        <a-option :value="1">内部会员</a-option>
        <a-option :value="0">普通会员</a-option>
      </a-select>
      <a-button type="primary" @click="handleSearch">
        <template #icon><icon-search /></template>
        搜索
      </a-button>
      <a-button @click="handleReset">
        <template #icon><icon-refresh /></template>
        重置
      </a-button>
      <div class="flex-1"></div>
      <a-button type="primary" status="success" @click="handleExport" :loading="exporting">
        <template #icon><icon-download /></template>
        导出数据
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
          <a-table-column title="ID" data-index="id" :width="60" />
          <a-table-column title="用户信息" :width="200">
            <template #cell="{ record }">
              <div class="user-cell">
                <div class="user-row">
                  <span class="username">{{ record.username || '-' }}</span>
                  <span class="user-id">ID: {{ record.userId }}</span>
                </div>
                <div class="user-row">
                  <span class="user-label">实名:</span>
                  <span class="user-value">{{ record.realName || '未认证' }}</span>
                </div>
                <div class="user-row">
                  <a-tag v-if="record.isInternal" color="orange" size="small">内部会员</a-tag>
                  <a-tag v-else color="blue" size="small">普通会员</a-tag>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="产品名称" data-index="productName" :width="150" />
          <a-table-column title="币种" data-index="coin" :width="80" align="center">
            <template #cell="{ record }">
              <span class="coin-tag">{{ record.coin || 'USDT' }}</span>
            </template>
          </a-table-column>
          <a-table-column title="本金" :width="120">
            <template #cell="{ record }">
              <span class="amount-value">{{ formatNumber(record.principal) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="累计收益" :width="120">
            <template #cell="{ record }">
              <span class="profit-value">+{{ formatNumber(record.profit) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="日收益率" :width="100">
            <template #cell="{ record }">{{ formatRate(record.dailyRate) }}%</template>
          </a-table-column>
          <a-table-column title="状态" :width="100" align="center">
            <template #cell="{ record }">
              <span class="agx-status" :class="record.status === 'holding' ? 'info' : 'default'">
                {{ record.status === 'holding' ? '持有中' : '已赎回' }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="申购时间" data-index="createdAt" :width="160" />
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import agxApi from '@/api/agx'

const loading = ref(false)
const exporting = ref(false)
const tableData = ref([])

const searchForm = reactive({ 
  keyword: '', 
  realName: '',
  status: undefined,
  isInternal: undefined
})

const pagination = reactive({ 
  current: 1, 
  pageSize: 20, 
  total: 0, 
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 格式化数字，保留2位小数
const formatNumber = (num) => {
  if (!num && num !== 0) return '0.00'
  return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 格式化收益率，保留4位小数
const formatRate = (rate) => {
  if (!rate && rate !== 0) return '0.0000'
  return parseFloat(rate).toFixed(4)
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize
    }
    
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.realName) params.realName = searchForm.realName
    if (searchForm.status) {
      params.status = searchForm.status === 'holding' ? 1 : 0
    }
    if (searchForm.isInternal !== undefined) {
      params.isInternal = searchForm.isInternal
    }
    
    const res = await agxApi.getPoolHoldingList(params)
    if (res.code === 0) {
      tableData.value = res.data?.list || res.list || []
      pagination.total = res.data?.total || res.total || 0
    }
  } catch (e) {
    console.error(e)
    Message.error('获取数据失败')
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
  searchForm.realName = ''
  searchForm.status = undefined
  searchForm.isInternal = undefined
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

const handleExport = async () => {
  exporting.value = true
  try {
    const params = {
      keyword: searchForm.keyword || undefined,
      realName: searchForm.realName || undefined,
      status: searchForm.status ? (searchForm.status === 'holding' ? 1 : 0) : undefined,
      isInternal: searchForm.isInternal
    }
    
    const res = await agxApi.exportPoolHoldings(params)
    if (res.code === 0 && res.data) {
      const data = res.data
      if (data.length === 0) {
        Message.warning('没有数据可导出')
        return
      }

      // CSV 头部
      const headers = ['ID', '用户名', '实名', '会员类型', '产品名称', '币种', '本金', '累计收益', '日收益率', '状态', '申购时间']
      let csvContent = '\uFEFF' + headers.join(',') + '\n'

      // CSV 数据行
      data.forEach(row => {
        const values = [
          row.id,
          row.username,
          row.realName || '未认证',
          row.isInternal ? '内部会员' : '普通会员',
          row.productName,
          row.coin || 'USDT',
          row.principal,
          row.profit,
          row.dailyRate,
          row.status === 'holding' ? '持有中' : '已赎回',
          row.createdAt
        ]
        csvContent += values.map(v => {
          const str = String(v || '')
          return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
        }).join(',') + '\n'
      })

      // 创建下载链接
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `持币生金记录_${Date.now()}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      Message.success(`已导出 ${data.length} 条数据`)
    } else {
      Message.error(res.msg || '导出失败')
    }
  } catch (error) {
    console.error('导出失败:', error)
    Message.error('导出失败')
  } finally {
    exporting.value = false
  }
}

onMounted(() => { fetchData() })
</script>

<style lang="less" scoped>
.flex-1 {
  flex: 1;
}

.user-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .user-row {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
  }
  
  .username {
    font-weight: 500;
    color: var(--agx-text-primary, #1D2129);
    font-size: 13px;
  }
  
  .user-id {
    font-size: 11px;
    color: var(--agx-text-tertiary, #86909C);
  }
  
  .user-label {
    color: var(--agx-text-secondary, #4E5969);
    font-weight: 500;
  }
  
  .user-value {
    color: var(--agx-text-primary, #1D2129);
  }
}

.coin-tag {
  display: inline-block;
  padding: 2px 8px;
  background: var(--agx-primary-bg, rgba(212, 168, 75, 0.08));
  color: var(--agx-primary, #D4A84B);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.amount-value {
  font-weight: 600;
  color: var(--agx-text-primary, #1D2129);
}

.profit-value {
  color: var(--agx-success, #52C41A);
  font-weight: 600;
}
</style>
