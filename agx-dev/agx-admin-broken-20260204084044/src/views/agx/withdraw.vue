<template>
  <div class="agx-page">
    <!-- 统计卡片 -->
    <div class="agx-data-panel">
      <div class="agx-stat-card pending">
        <div class="stat-icon">
          <icon-clock-circle />
        </div>
        <div class="stat-content">
          <div class="stat-label">待审核</div>
          <div class="stat-value">{{ stats.pendingCount }}</div>
        </div>
      </div>
      <div class="agx-stat-card approved">
        <div class="stat-icon">
          <icon-check-circle />
        </div>
        <div class="stat-content">
          <div class="stat-label">待打款</div>
          <div class="stat-value">{{ stats.approvedCount }}</div>
        </div>
      </div>
      <div class="agx-stat-card">
        <div class="stat-label">今日提现</div>
        <div class="stat-value">{{ stats.todayAmount }}<span class="stat-suffix">USDT</span></div>
        <div class="stat-desc">共 {{ stats.todayCount }} 笔</div>
      </div>
      <div class="agx-stat-card">
        <div class="stat-label">本月累计</div>
        <div class="stat-value">{{ stats.monthAmount }}<span class="stat-suffix">USDT</span></div>
        <div class="stat-desc">共 {{ stats.monthCount }} 笔</div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="agx-search-bar">
      <a-input 
        v-model="searchForm.userId" 
        placeholder="用户ID" 
        allow-clear 
        style="width: 120px"
      >
        <template #prefix><icon-user /></template>
      </a-input>
      <a-input 
        v-model="searchForm.username" 
        placeholder="用户名" 
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
        <template #prefix><icon-user /></template>
      </a-input>
      <a-input 
        v-model="searchForm.address" 
        placeholder="提现地址" 
        allow-clear 
        style="width: 180px"
      >
        <template #prefix><icon-location /></template>
      </a-input>
      <a-select v-model="searchForm.status" placeholder="状态" allow-clear style="width: 130px">
        <a-option :value="0">待审核</a-option>
        <a-option :value="1">已通过</a-option>
        <a-option :value="2">已拒绝</a-option>
        <a-option :value="3">已打款</a-option>
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
      <a-button @click="handleExport" :loading="exporting">
        <template #icon><icon-download /></template>
        导出
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
        :bordered="false"
        :scroll="{ x: 1200 }"
      >
        <template #columns>
          <a-table-column title="ID" data-index="id" :width="70" align="center" />
          <a-table-column title="用户信息" :width="200">
            <template #cell="{ record }">
              <div class="user-cell">
                <div class="user-row">
                  <span class="username user-link" @click="goUserDetail(record.userId)">{{ record.username || '-' }}</span>
                  <span class="user-id">ID: {{ record.userId }}</span>
                </div>
                <div class="user-row">
                  <span class="user-label">实名:</span>
                  <span class="user-value">{{ record.realName || '-' }}</span>
                </div>
                <div class="user-row">
                  <span class="user-label">推荐人:</span>
                  <span class="user-value">{{ record.inviterRealName || record.inviterUsername || '-' }}</span>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="币种" data-index="coin" :width="80" align="center">
            <template #cell="{ record }">
              <span class="coin-tag">{{ record.coin || 'USDT' }}</span>
            </template>
          </a-table-column>
          <a-table-column title="金额" :width="130" align="right">
            <template #cell="{ record }">
              <span class="amount amount-out">-{{ formatAmount(record.amount) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="手续费" :width="100" align="right">
            <template #cell="{ record }">
              <span class="amount fee-text">{{ formatAmount(record.fee) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="网络" data-index="chain" :width="80" align="center" />
          <a-table-column title="提现地址" :width="180">
            <template #cell="{ record }">
              <div class="address-cell" v-if="record.toAddress">
                <a-tooltip :content="record.toAddress">
                  <span class="address-text">
                    {{ record.toAddress?.slice(0, 8) }}...{{ record.toAddress?.slice(-8) }}
                  </span>
                </a-tooltip>
                <a-button type="text" size="mini" @click="copyAddress(record.toAddress)">
                  <icon-copy />
                </a-button>
              </div>
              <span v-else class="text-muted">-</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="90" align="center">
            <template #cell="{ record }">
              <span class="agx-status" :class="getStatusClass(record.status)">
                {{ getStatusText(record.status) }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="申请时间" data-index="createdAt" :width="165" />
          <a-table-column title="操作" :width="150" fixed="right" align="center">
            <template #cell="{ record }">
              <!-- 待审核状态 -->
              <a-space v-if="record.status === 0">
                <a-button type="primary" size="small" status="success" @click="handleApprove(record)">
                  通过
                </a-button>
                <a-button type="primary" size="small" status="danger" @click="openRejectModal(record)">
                  拒绝
                </a-button>
              </a-space>
              <!-- 已通过待打款 -->
              <a-space v-else-if="record.status === 1">
                <a-button type="primary" size="small" @click="handlePaid(record)">
                  确认打款
                </a-button>
              </a-space>
              <!-- 其他状态 -->
              <span v-else class="text-muted">已完成</span>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <!-- 拒绝原因弹窗 -->
    <a-modal 
      v-model:visible="rejectVisible" 
      title="拒绝提现" 
      :width="480"
      @ok="handleReject"
      ok-text="确认拒绝"
      cancel-text="取消"
      class="agx-modal"
    >
      <div class="reject-info">
        <div class="info-row">
          <span class="label">用户：</span>
          <span class="value">{{ rejectRecord?.username }} (ID: {{ rejectRecord?.userId }})</span>
        </div>
        <div class="info-row">
          <span class="label">金额：</span>
          <span class="value amount-out">-{{ formatAmount(rejectRecord?.amount) }} {{ rejectRecord?.coin || 'USDT' }}</span>
        </div>
      </div>
      <a-form layout="vertical" class="agx-form">
        <a-form-item label="拒绝原因" required>
          <a-textarea 
            v-model="rejectReason" 
            placeholder="请输入拒绝原因，用户将收到通知" 
            :max-length="200" 
            show-word-limit 
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
      </a-form>
      <div class="modal-tip warning">
        <icon-exclamation-circle /> 拒绝后提现金额将退回用户账户
      </div>
    </a-modal>

    <!-- 审核通过确认弹窗 -->
    <a-modal 
      v-model:visible="approveVisible" 
      title="审核通过" 
      :width="480"
      @ok="confirmApprove"
      ok-text="确认通过"
      cancel-text="取消"
      class="agx-modal"
    >
      <div class="approve-info">
        <div class="info-row">
          <span class="label">用户：</span>
          <span class="value">{{ approveRecord?.username }} (ID: {{ approveRecord?.userId }})</span>
        </div>
        <div class="info-row">
          <span class="label">提现金额：</span>
          <span class="value amount-out">-{{ formatAmount(approveRecord?.amount) }} {{ approveRecord?.coin || 'USDT' }}</span>
        </div>
        <div class="info-row">
          <span class="label">手续费：</span>
          <span class="value">{{ formatAmount(approveRecord?.fee) }} {{ approveRecord?.coin || 'USDT' }}</span>
        </div>
        <div class="info-row">
          <span class="label">实际到账：</span>
          <span class="value highlight">{{ formatAmount(approveRecord?.actualAmount) }} {{ approveRecord?.coin || 'USDT' }}</span>
        </div>
        <div class="info-row">
          <span class="label">提现地址：</span>
          <span class="value address">{{ approveRecord?.toAddress }}</span>
        </div>
      </div>
      <div class="modal-tip info">
        <icon-info-circle /> 通过后请尽快完成链上打款操作
      </div>
    </a-modal>

    <!-- 确认打款弹窗 -->
    <a-modal 
      v-model:visible="paidVisible" 
      title="确认打款" 
      :width="480"
      @ok="confirmPaid"
      ok-text="确认已打款"
      cancel-text="取消"
      class="agx-modal"
    >
      <div class="paid-info">
        <div class="info-row">
          <span class="label">用户：</span>
          <span class="value">{{ paidRecord?.username }} (ID: {{ paidRecord?.userId }})</span>
        </div>
        <div class="info-row">
          <span class="label">实际到账：</span>
          <span class="value highlight">{{ formatAmount(paidRecord?.actualAmount) }} {{ paidRecord?.coin || 'USDT' }}</span>
        </div>
        <div class="info-row">
          <span class="label">提现地址：</span>
          <span class="value address">{{ paidRecord?.toAddress }}</span>
        </div>
      </div>
      <a-form layout="vertical" class="agx-form">
        <a-form-item label="交易哈希（可选）">
          <a-input 
            v-model="paidTxHash" 
            placeholder="请输入链上交易哈希" 
          />
        </a-form-item>
      </a-form>
      <div class="modal-tip success">
        <icon-check-circle /> 确认后此笔提现将标记为已完成
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import agxApi from '@/api/agx'

const loading = ref(false)
const exporting = ref(false)
const tableData = ref([])

// 统计数据
const stats = reactive({
  pendingCount: 0,
  approvedCount: 0,
  todayAmount: '0.00',
  todayCount: 0,
  monthAmount: '0.00',
  monthCount: 0
})

const searchForm = reactive({ 
  userId: '', 
  username: '',
  realName: '',
  address: '',
  status: undefined 
})

const pagination = reactive({ 
  current: 1, 
  pageSize: 20, 
  total: 0, 
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 拒绝弹窗
const rejectVisible = ref(false)
const rejectReason = ref('')
const rejectRecord = ref(null)

// 审核通过弹窗
const approveVisible = ref(false)
const approveRecord = ref(null)

// 确认打款弹窗
const paidVisible = ref(false)
const paidRecord = ref(null)
const paidTxHash = ref('')

// 格式化金额
const formatAmount = (amount) => {
  return parseFloat(amount || 0).toFixed(2)
}

// 状态文本
const getStatusText = (status) => {
  const map = { 0: '待审核', 1: '待打款', 2: '已拒绝', 3: '已完成' }
  return map[status] || '未知'
}

// 状态样式
const getStatusClass = (status) => {
  const map = { 0: 'warning', 1: 'info', 2: 'danger', 3: 'success' }
  return map[status] || 'default'
}

// 复制地址
const copyAddress = (address) => {
  navigator.clipboard.writeText(address)
  Message.success('已复制')
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      status: searchForm.status
    }
    
    if (searchForm.userId) params.userId = searchForm.userId
    if (searchForm.username) params.username = searchForm.username
    if (searchForm.realName) params.realName = searchForm.realName
    if (searchForm.address) params.address = searchForm.address
    
    const res = await agxApi.getWithdrawList(params)
    if (res.code === 0) {
      tableData.value = res.data?.list || []
      pagination.total = res.data?.total || 0
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { 
  pagination.current = 1
  fetchData() 
}

const handleReset = () => { 
  searchForm.userId = ''
  searchForm.username = ''
  searchForm.realName = ''
  searchForm.address = ''
  searchForm.status = undefined
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

// 导出
const handleExport = async () => {
  exporting.value = true
  try {
    Message.info('导出功能开发中')
  } finally {
    exporting.value = false
  }
}

// 审核通过
const handleApprove = (record) => {
  approveRecord.value = record
  approveVisible.value = true
}

const confirmApprove = async () => {
  try {
    const res = await agxApi.reviewWithdraw(approveRecord.value.id, { status: 1 })
    if (res.code === 0) {
      Message.success('已通过审核')
      approveVisible.value = false
      fetchData()
    }
  } catch (e) {
    Message.error('操作失败')
  }
}

// 拒绝
const openRejectModal = (record) => {
  rejectRecord.value = record
  rejectReason.value = ''
  rejectVisible.value = true
}

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    Message.warning('请输入拒绝原因')
    return
  }
  try {
    const res = await agxApi.reviewWithdraw(rejectRecord.value.id, { 
      status: 2, 
      remark: rejectReason.value 
    })
    if (res.code === 0) {
      Message.success('已拒绝')
      rejectVisible.value = false
      fetchData()
    }
  } catch (e) {
    Message.error('操作失败')
  }
}

// 确认打款
const handlePaid = (record) => {
  paidRecord.value = record
  paidTxHash.value = ''
  paidVisible.value = true
}

const confirmPaid = async () => {
  try {
    const res = await agxApi.reviewWithdraw(paidRecord.value.id, { 
      status: 3,
      txHash: paidTxHash.value || undefined
    })
    if (res.code === 0) {
      Message.success('已确认打款')
      paidVisible.value = false
      fetchData()
    }
  } catch (e) {
    Message.error('操作失败')
  }
}


const goUserDetail = (userId) => {
  if (userId) {
    router.push(`/agx/userDetail/${userId}`)
  }
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

// 统计卡片扩展样式
.agx-stat-card {
  &.pending, &.approved {
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
    }
    
    .stat-content {
      .stat-value {
        font-size: 24px;
      }
    }
  }
  
  &.pending .stat-icon {
    background: rgba(250, 173, 20, 0.1);
    color: var(--agx-warning, #FAAD14);
  }
  
  &.approved .stat-icon {
    background: rgba(24, 144, 255, 0.1);
    color: var(--agx-info, #1890FF);
  }
}

.stat-desc {
  font-size: 12px;
  color: var(--agx-text-tertiary, #86909C);
  margin-top: 4px;
}

// 用户单元格
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
  
  .user-link {
    cursor: pointer;
    color: #1890ff !important;
    &:hover {
      text-decoration: underline;
    }
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

// 金额样式
.amount-out {
  color: var(--agx-danger, #F5222D);
  font-weight: 600;
  font-size: 14px;
  font-family: 'SF Mono', 'Roboto Mono', 'Menlo', monospace;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.fee-text {
  color: var(--agx-text-tertiary, #86909C);
  font-size: 13px;
  font-family: 'SF Mono', 'Roboto Mono', 'Menlo', monospace;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

// 地址单元格
.address-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  
  .address-text {
    font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    font-size: 12px;
    color: var(--agx-text-secondary, #4E5969);
  }
}

.text-muted {
  color: var(--agx-text-disabled, #C9CDD4);
  font-size: 12px;
}

// 弹窗信息样式
.reject-info, .approve-info, .paid-info {
  background: var(--agx-bg-secondary, #F7F8FA);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  
  .info-row {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--agx-border-light, #F2F3F5);
    
    &:last-child {
      border-bottom: none;
    }
    
    .label {
      width: 80px;
      color: var(--agx-text-tertiary, #86909C);
      font-size: 13px;
    }
    
    .value {
      flex: 1;
      color: var(--agx-text-primary, #1D2129);
      font-size: 14px;
      
      &.highlight {
        color: var(--agx-primary, #D4A84B);
        font-weight: 600;
      }
      
      &.address {
        font-family: 'SF Mono', Monaco, 'Courier New', monospace;
        font-size: 12px;
        word-break: break-all;
      }
    }
  }
}

// 弹窗提示
.modal-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-top: 8px;
  
  &.warning {
    background: rgba(250, 173, 20, 0.08);
    color: var(--agx-warning, #FAAD14);
  }
  
  &.info {
    background: rgba(24, 144, 255, 0.08);
    color: var(--agx-info, #1890FF);
  }
  
  &.success {
    background: rgba(82, 196, 26, 0.08);
    color: var(--agx-success, #52C41A);
  }
}
</style>
