<template>
  <div class="agx-page">
    <!-- 统计卡片 -->
    <div class="agx-data-panel">
      <div class="agx-stat-card">
        <div class="stat-label">今日充值</div>
        <div class="stat-value">{{ stats.todayAmount }}<span class="stat-suffix">USDT</span></div>
        <div class="stat-trend up" v-if="stats.todayCount > 0">
          <icon-arrow-rise /> {{ stats.todayCount }} 笔
        </div>
      </div>
      <div class="agx-stat-card">
        <div class="stat-label">待确认</div>
        <div class="stat-value pending-value">{{ stats.pendingCount }}</div>
        <div class="stat-desc">笔充值待确认</div>
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
        <template #prefix><icon-user /></template>
      </a-input>
      <a-input 
        v-model="searchForm.realName" 
        placeholder="实名" 
        allow-clear 
        style="width: 150px"
      >
        <template #prefix><icon-idcard /></template>
      </a-input>
      <a-input 
        v-model="searchForm.keyword" 
        placeholder="订单号 / 交易哈希" 
        allow-clear 
        style="width: 180px"
      >
        <template #prefix><icon-search /></template>
      </a-input>
      <a-select v-model="searchForm.coin" placeholder="币种" allow-clear style="width: 120px">
        <a-option value="USDT">USDT</a-option>
        <a-option value="BTC">BTC</a-option>
        <a-option value="ETH">ETH</a-option>
      </a-select>
      <a-select v-model="searchForm.status" placeholder="状态" allow-clear style="width: 120px">
        <a-option :value="0">待确认</a-option>
        <a-option :value="1">已到账</a-option>
        <a-option :value="2">已失败</a-option>
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
      <a-button type="primary" status="success" @click="openManualRecharge">
        <template #icon><icon-plus /></template>
        手动充值
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
                  <span class="user-value user-link" @click="record.inviterId && goUserDetail(record.inviterId)">{{ record.inviterUsername || '-' }}</span>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="币种" data-index="coin" :width="80" align="center">
            <template #cell="{ record }">
              <span class="coin-tag">{{ record.coin }}</span>
            </template>
          </a-table-column>
          <a-table-column title="金额" :width="130" align="right">
            <template #cell="{ record }">
              <span class="amount amount-in">+{{ formatAmount(record.amount) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="网络" data-index="chain" :width="80" align="center" />
          <a-table-column title="交易哈希" :width="180">
            <template #cell="{ record }">
              <div class="tx-hash" v-if="record.txHash">
                <a-tooltip :content="record.txHash">
                  <span class="hash-text">{{ record.txHash?.slice(0, 10) }}...{{ record.txHash?.slice(-6) }}</span>
                </a-tooltip>
                <a-button type="text" size="mini" @click="copyHash(record.txHash)">
                  <icon-copy />
                </a-button>
              </div>
              <span v-else class="text-muted">手动充值</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="90" align="center">
            <template #cell="{ record }">
              <span class="agx-status" :class="getStatusClass(record.status)">
                {{ getStatusText(record.status) }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="时间" data-index="createdAt" :width="165" />
          <a-table-column title="操作" :width="150" align="center" fixed="right">
            <template #cell="{ record }">
              <a-space v-if="record.status === 0">
                <a-button 
                  type="primary" 
                  size="small" 
                  status="success"
                  @click="handleApprove(record)"
                >
                  通过
                </a-button>
                <a-button 
                  type="primary"
                  size="small" 
                  status="danger"
                  @click="handleReject(record)"
                >
                  拒绝
                </a-button>
              </a-space>
              <span v-else class="text-muted">已处理</span>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <!-- 手动充值弹窗 -->
    <a-modal 
      v-model:visible="manualVisible" 
      title="手动充值" 
      :width="480"
      @ok="submitManualRecharge"
      ok-text="确认充值"
      cancel-text="取消"
      class="agx-modal"
    >
      <a-form :model="manualForm" layout="vertical" class="agx-form">
        <a-form-item label="用户ID" required>
          <a-input-number 
            v-model="manualForm.userId" 
            :min="1" 
            style="width: 100%" 
            placeholder="请输入用户ID" 
          />
        </a-form-item>
        <a-form-item label="币种" required>
          <a-select v-model="manualForm.coin" placeholder="选择币种">
            <a-option value="USDT">USDT</a-option>
            <a-option value="BTC">BTC</a-option>
            <a-option value="ETH">ETH</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="充值金额" required>
          <a-input-number 
            v-model="manualForm.amount" 
            :min="0" 
            :precision="8" 
            style="width: 100%" 
            placeholder="请输入充值金额"
          >
            <template #suffix>{{ manualForm.coin }}</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea 
            v-model="manualForm.remark" 
            placeholder="请输入充值备注（可选）" 
            :max-length="200"
            show-word-limit
          />
        </a-form-item>
      </a-form>
      <div class="modal-tip">
        <icon-info-circle /> 手动充值将直接增加用户余额，请谨慎操作
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import agxApi from '@/api/agx'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const manualVisible = ref(false)

// 统计数据
const stats = reactive({
  todayAmount: '0.00',
  todayCount: 0,
  pendingCount: 0,
  monthAmount: '0.00',
  monthCount: 0
})

const searchForm = reactive({ 
  userId: '', 
  username: '',
  realName: '',
  keyword: '', 
  coin: undefined, 
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

const manualForm = reactive({ 
  userId: null, 
  coin: 'USDT', 
  amount: 0, 
  remark: '' 
})

// 格式化金额
const formatAmount = (amount) => {
  return parseFloat(amount || 0).toFixed(2)
}

// 状态文本
const getStatusText = (status) => {
  const map = { 0: '待确认', 1: '已到账', 2: '已失败' }
  return map[status] || '未知'
}

// 状态样式
const getStatusClass = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'default'
}

// 复制哈希
const copyHash = (hash) => {
  navigator.clipboard.writeText(hash)
  Message.success('已复制')
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await agxApi.getRechargeList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      userId: searchForm.userId || undefined,
      username: searchForm.username || undefined,
      realName: searchForm.realName || undefined,
      keyword: searchForm.keyword || undefined,
      coin: searchForm.coin,
      status: searchForm.status
    })
    if (res.code === 0) {
      tableData.value = res.data?.list || []
      pagination.total = res.data?.total || 0
    }
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const res = await agxApi.getRechargeStats()
    if (res.code === 0 && res.data) {
      stats.todayAmount = res.data.todayAmount || '0.00'
      stats.todayCount = res.data.todayCount || 0
      stats.pendingCount = res.data.pendingCount || 0
      stats.monthAmount = res.data.monthAmount || '0.00'
      stats.monthCount = res.data.monthCount || 0
    }
  } catch (e) {
    console.error('获取充值统计失败', e)
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
  searchForm.keyword = ''
  searchForm.coin = undefined
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

const openManualRecharge = () => {
  manualForm.userId = null
  manualForm.coin = 'USDT'
  manualForm.amount = 0
  manualForm.remark = ''
  manualVisible.value = true
}

const submitManualRecharge = async () => {
  if (!manualForm.userId) {
    Message.warning('请输入用户ID')
    return
  }
  if (!manualForm.amount || manualForm.amount <= 0) {
    Message.warning('请输入有效的充值金额')
    return
  }
  try {
    const res = await agxApi.manualRecharge(manualForm)
    if (res.code === 0) {
      Message.success('充值成功')
      manualVisible.value = false
      fetchData()
    }
  } catch (e) {
    Message.error('充值失败')
  }
}

// 审核通过
const handleApprove = async (record) => {
  try {
    const res = await agxApi.processRecharge(record.id, { status: 1, remark: '管理员手动通过' })
    if (res.code === 0) {
      Message.success('已通过充值')
      fetchData()
      fetchStats()
    }
  } catch (e) {
    Message.error('操作失败')
  }
}

// 审核拒绝
const handleReject = async (record) => {
  try {
    const res = await agxApi.processRecharge(record.id, { status: 2, remark: '管理员手动拒绝' })
    if (res.code === 0) {
      Message.success('已拒绝充值')
      fetchData()
      fetchStats()
    }
  } catch (e) {
    Message.error('操作失败')
  }
}

onMounted(() => { 
  fetchData()
  fetchStats()
})

const goUserDetail = (userId) => {
  if (userId) {
    router.push(`/agx/userDetail/${userId}`)
  }
}
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

// 统计卡片补充样式
.pending-value {
  color: var(--agx-warning, #FAAD14) !important;
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
  
  .user-subtext {
    color: var(--agx-text-tertiary, #86909C);
    font-size: 11px;
  }
}

// 币种标签
.coin-tag {
  display: inline-block;
  padding: 2px 8px;
  background: var(--agx-primary-bg, rgba(212, 168, 75, 0.08));
  color: var(--agx-primary, #D4A84B);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

// 金额样式
.amount-in {
  color: var(--agx-success, #52C41A);
  font-weight: 600;
  font-size: 14px;
  font-family: 'SF Mono', 'Roboto Mono', 'Menlo', monospace;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

// 交易哈希
.tx-hash {
  display: flex;
  align-items: center;
  gap: 4px;
  
  .hash-text {
    font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    font-size: 12px;
    color: var(--agx-info, #1890FF);
    cursor: pointer;
  }
}

.text-muted {
  color: var(--agx-text-disabled, #C9CDD4);
  font-size: 12px;
}

// 弹窗提示
.modal-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(250, 173, 20, 0.08);
  border-radius: 6px;
  color: var(--agx-warning, #FAAD14);
  font-size: 13px;
  margin-top: 8px;
}
</style>
