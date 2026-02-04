<template>
  <div class="agx-page">
    <!-- 统计卡片 -->
    <div class="agx-data-panel">
      <div class="agx-stat-card gold">
        <div class="stat-icon">
          <icon-fire />
        </div>
        <div class="stat-content">
          <div class="stat-label">累计发放</div>
          <div class="stat-value">{{ formatGrams(stats.totalGrams) }}<span class="stat-suffix">克</span></div>
        </div>
      </div>
      <div class="agx-stat-card">
        <div class="stat-label">获得用户</div>
        <div class="stat-value">{{ stats.totalUsers }}</div>
        <div class="stat-desc">人</div>
      </div>
      <div class="agx-stat-card">
        <div class="stat-label">折合价值</div>
        <div class="stat-value">{{ formatNumber(stats.totalValue) }}<span class="stat-suffix">USDT</span></div>
      </div>
      <div class="agx-stat-card">
        <div class="stat-label">今日发放</div>
        <div class="stat-value income-value">+{{ formatGrams(stats.todayNew) }}<span class="stat-suffix">克</span></div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="agx-search-bar">
      <a-input 
        v-model="searchForm.keyword" 
        placeholder="用户名 / UID / 真实姓名" 
        allow-clear 
        style="width: 240px"
        @press-enter="handleSearch"
      >
        <template #prefix><icon-search /></template>
      </a-input>
      <a-select v-model="searchForm.userType" placeholder="用户类型" allow-clear style="width: 150px">
        <a-option value="">全部</a-option>
        <a-option value="internal">内部人员</a-option>
        <a-option value="normal">普通会员</a-option>
      </a-select>
      <a-select v-model="searchForm.sortBy" placeholder="排序方式" style="width: 150px">
        <a-option value="gold_desc">黄金量 高→低</a-option>
        <a-option value="gold_asc">黄金量 低→高</a-option>
        <a-option value="agx_desc">AGX量 高→低</a-option>
        <a-option value="time_desc">最新加入</a-option>
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
      <a-button @click="handleExport">
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
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        row-key="id"
        :scroll="{ x: 900 }"
      >
        <template #columns>
          <a-table-column title="用户" :width="200">
            <template #cell="{ record }">
              <div class="user-cell">
                <div class="user-info-row">
                  <span class="username">{{ record.username }}</span>
                  <a-tag v-if="record.isInternal" color="orange" size="small">内部</a-tag>
                </div>
                <span class="user-id">{{ record.uid }}</span>
                <span class="real-name" v-if="record.realName">{{ record.realName }}</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="持有AGX" :width="130" align="right">
            <template #cell="{ record }">
              <span class="agx-amount">{{ formatNumber(record.agxHolding) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="累计获得黄金" :width="150" align="right">
            <template #cell="{ record }">
              <span class="gold-amount">{{ formatGrams(record.holdingGrams) }} <span class="unit">克</span></span>
            </template>
          </a-table-column>
          <a-table-column title="折合价值" :width="130" align="right">
            <template #cell="{ record }">
              <span class="value-text">${{ formatNumber(record.holdingValue) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="今日收益" :width="130" align="right">
            <template #cell="{ record }">
              <span class="income-text">+{{ formatGrams(record.todayIncome) }} 克</span>
            </template>
          </a-table-column>
          <a-table-column title="开始时间" data-index="firstBuyAt" :width="160" />
          <a-table-column title="操作" :width="80" fixed="right" align="center">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="viewDetail(record)">
                <icon-eye /> 详情
              </a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <!-- 用户详情弹窗 -->
    <a-modal 
      v-model:visible="detailVisible" 
      title="持币生金详情" 
      :width="600"
      :footer="false"
      class="agx-modal"
    >
      <div class="detail-content" v-if="detailRecord">
        <div class="detail-header">
          <div class="user-avatar">
            <icon-user />
          </div>
          <div class="user-info">
            <div class="name">{{ detailRecord.username }}</div>
            <div class="uid">{{ detailRecord.uid }}</div>
          </div>
        </div>

        <div class="detail-stats">
          <div class="stat-item">
            <div class="label">持有AGX</div>
            <div class="value">{{ formatNumber(detailRecord.agxHolding) }}</div>
          </div>
          <div class="stat-item">
            <div class="label">累计黄金</div>
            <div class="value gold">{{ formatGrams(detailRecord.holdingGrams) }} 克</div>
          </div>
          <div class="stat-item">
            <div class="label">折合价值</div>
            <div class="value">${{ formatNumber(detailRecord.holdingValue) }}</div>
          </div>
          <div class="stat-item">
            <div class="label">今日收益</div>
            <div class="value up">+{{ formatGrams(detailRecord.todayIncome) }} 克</div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">黄金发放记录</div>
          <a-empty description="暂无记录" />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])
const detailVisible = ref(false)
const detailRecord = ref(null)

const searchForm = reactive({
  keyword: '',
  sortBy: 'gold_desc',
  userType: ''
})

const stats = reactive({
  totalUsers: 0,
  totalGrams: 0,
  totalValue: 0,
  todayNew: 0
})

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

const formatNumber = (num) => {
  return Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatGrams = (num) => {
  return Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/api/admin/holding/distributions',
      method: 'get',
      params: {
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword || undefined,
        userType: searchForm.userType || undefined
      }
    })
    if (res.code === 0 && res.data) {
      tableData.value = (res.data.list || []).map(item => ({
        id: item.id,
        username: item.user?.username || `用户${item.userId}`,
        uid: item.user?.uid || `U${item.userId}`,
        realName: item.user?.kyc?.realName || '',
        isInternal: item.user?.isInternal === 1,
        agxHolding: Number(item.holdingAgx || 0),
        holdingGrams: Number(item.distributedGram || 0),
        holdingValue: Number(item.estimatedValue || 0),
        todayIncome: Number(item.distributedGram || 0),
        firstBuyAt: item.distributionDate
      }))
      pagination.total = res.data.total || 0
      
      // 使用summary数据
      if (res.data.summary) {
        stats.totalUsers = res.data.summary.totalUsers
        stats.totalGrams = Number(res.data.summary.totalGram || 0)
        stats.totalValue = stats.totalGrams * 84.8
      }
      
      // 计算今日数据
      stats.todayNew = tableData.value.reduce((sum, item) => sum + item.todayIncome, 0)
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
  searchForm.sortBy = 'gold_desc'
  searchForm.userType = ''
  pagination.current = 1
  fetchData()
}

const handlePageChange = (page) => {
  pagination.current = page
  fetchData()
}

const handlePageSizeChange = (size) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchData()
}

const handleExport = async () => {
  try {
    loading.value = true
    const res = await request({
      url: '/api/admin/holding/export',
      method: 'get',
      params: {
        keyword: searchForm.keyword || undefined,
        userType: searchForm.userType || undefined
      }
    })
    
    if (res.code === 0 && res.data && res.data.records) {
      // 转换为CSV格式
      const records = res.data.records
      if (records.length === 0) {
        Message.warning('没有数据可导出')
        return
      }
      
      // CSV表头
      const headers = Object.keys(records[0])
      const csvContent = [
        headers.join(','),
        ...records.map(row => 
          headers.map(header => {
            const value = row[header]
            // 处理包含逗号的值，用引号包裹
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value
          }).join(',')
        )
      ].join('\n')
      
      // 添加BOM以支持中文
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `持币生金记录_${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      Message.success('导出成功')
    } else {
      Message.error(res.msg || '导出失败')
    }
  } catch (error) {
    console.error('Export error:', error)
    Message.error('导出失败')
  } finally {
    loading.value = false
  }
}

const viewDetail = (record) => {
  detailRecord.value = record
  detailVisible.value = true
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
      color: var(--agx-text-primary, #1D2129);
      margin: 0 0 4px 0;
    }
    
    .page-desc {
      font-size: 13px;
      color: var(--agx-text-tertiary, #86909C);
      margin: 0;
    }
  }
}

.flex-1 {
  flex: 1;
}

// 统计卡片
.agx-stat-card {
  &.gold {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      color: white;
    }
    
    .stat-content .stat-value {
      font-size: 24px;
    }
  }
}

.stat-desc {
  font-size: 12px;
  color: var(--agx-text-tertiary, #86909C);
  margin-top: 4px;
}

.income-value {
  color: var(--agx-success, #52C41A) !important;
}

// 用户单元格
.user-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .user-info-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .username {
    font-weight: 500;
    color: var(--agx-text-primary, #1D2129);
  }
  
  .user-id {
    font-size: 12px;
    color: var(--agx-text-tertiary, #86909C);
    font-family: 'SF Mono', Monaco, monospace;
  }
  
  .real-name {
    font-size: 12px;
    color: var(--agx-text-secondary, #4E5969);
    font-weight: 400;
    
    &::before {
      content: '🔒 ';
      opacity: 0.6;
    }
  }
}

.agx-amount {
  font-weight: 500;
  color: var(--agx-primary, #D4A84B);
}

// 金额样式
.gold-amount {
  font-weight: 600;
  color: #D4A84B;
  font-size: 14px;
  
  .unit {
    font-weight: 400;
    font-size: 12px;
    color: var(--agx-text-tertiary, #86909C);
  }
}

.value-text {
  color: var(--agx-text-primary, #1D2129);
}

.income-text {
  color: var(--agx-success, #52C41A);
  font-weight: 500;
}

// 详情弹窗
.detail-content {
  .detail-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--agx-border-light, #F2F3F5);
    
    .user-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--agx-bg-tertiary, #F2F3F5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: var(--agx-text-tertiary, #86909C);
    }
    
    .user-info {
      .name {
        font-size: 18px;
        font-weight: 600;
        color: var(--agx-text-primary, #1D2129);
      }
      
      .uid {
        font-size: 13px;
        color: var(--agx-text-tertiary, #86909C);
        font-family: 'SF Mono', Monaco, monospace;
      }
    }
  }
  
  .detail-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 20px 0;
    
    .stat-item {
      background: var(--agx-bg-secondary, #F7F8FA);
      border-radius: 8px;
      padding: 16px;
      
      .label {
        font-size: 12px;
        color: var(--agx-text-tertiary, #86909C);
        margin-bottom: 8px;
      }
      
      .value {
        font-size: 18px;
        font-weight: 600;
        color: var(--agx-text-primary, #1D2129);
        
        &.gold {
          color: #D4A84B;
        }
        
        &.up {
          color: var(--agx-success, #52C41A);
        }
      }
    }
  }
  
  .detail-section {
    padding-top: 20px;
    border-top: 1px solid var(--agx-border-light, #F2F3F5);
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--agx-text-primary, #1D2129);
      margin-bottom: 16px;
    }
  }
}
</style>
