<template>
  <div class="agx-page">
    <!-- 核心数据 -->
    <div class="agx-data-panel">
      <div class="agx-stat-card highlight">
        <div class="stat-icon">
          <icon-coin />
        </div>
        <div class="stat-content">
          <div class="stat-label">当前价格</div>
          <div class="stat-value">$0.065</div>
        </div>
      </div>
      <div class="agx-stat-card">
        <div class="stat-label">已售出</div>
        <div class="stat-value">{{ formatNumber(stats.soldAmount) }}<span class="stat-suffix">AGX</span></div>
      </div>
      <div class="agx-stat-card">
        <div class="stat-label">募集金额</div>
        <div class="stat-value">{{ formatNumber(stats.raisedUsdt) }}<span class="stat-suffix">USDT</span></div>
      </div>
      <div class="agx-stat-card">
        <div class="stat-label">参与用户</div>
        <div class="stat-value">{{ stats.participants }}</div>
        <div class="stat-desc">人</div>
      </div>
    </div>

    <!-- 操作区 -->
    <div class="agx-search-bar">
      <a-select v-model="searchForm.status" placeholder="状态" style="width: 120px" allow-clear>
        <a-option :value="0">待开始</a-option>
        <a-option :value="1">进行中</a-option>
        <a-option :value="2">已结束</a-option>
      </a-select>
      <a-button type="primary" @click="fetchData">
        <template #icon><icon-refresh /></template>
        刷新
      </a-button>
      <div class="flex-1"></div>
      <a-button type="primary" @click="showCreateModal">
        <template #icon><icon-plus /></template>
        新建预售活动
      </a-button>
    </div>

    <!-- 预售列表 -->
    <div class="agx-card agx-table">
      <a-table 
        :data="tableData" 
        :loading="loading" 
        :pagination="false"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="预售信息" :width="220">
            <template #cell="{ record }">
              <div class="coin-info">
                <div class="coin-avatar">
                  {{ record.coinSymbol?.substring(0, 2) }}
                </div>
                <div class="coin-detail">
                  <div class="coin-name">{{ record.coinSymbol }}</div>
                  <div class="coin-full-name">{{ record.coinName }}</div>
                </div>
                <span class="new-badge" v-if="record.isNew">NEW</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="预售价格" :width="120" align="center">
            <template #cell="{ record }">
              <span class="price-value">${{ record.issuePrice }}</span>
            </template>
          </a-table-column>
          <a-table-column title="预售额度" :width="180">
            <template #cell="{ record }">
              <div class="quota-info">
                <div class="quota-progress">
                  <div 
                    class="progress-fill" 
                    :style="{ width: getProgress(record) + '%' }"
                  ></div>
                </div>
                <div class="quota-text">
                  {{ formatNumber(record.soldAmount || 0) }} / {{ formatNumber(record.issueAmount) }}
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="单人限额" :width="140">
            <template #cell="{ record }">
              <div class="limit-info">
                <span>{{ formatNumber(record.minBuyAmount) }}</span>
                <span class="limit-sep">~</span>
                <span>{{ formatNumber(record.maxBuyAmount) }}</span>
                <span class="limit-unit">USDT</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="时间" :width="180">
            <template #cell="{ record }">
              <div class="time-info">
                <div class="time-row">
                  <span class="time-label">开始:</span>
                  <span>{{ formatTime(record.startTime) }}</span>
                </div>
                <div class="time-row">
                  <span class="time-label">结束:</span>
                  <span>{{ formatTime(record.endTime) }}</span>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100" align="center">
            <template #cell="{ record }">
              <span class="agx-status" :class="getStatusClass(record.status)">
                {{ getStatusText(record.status) }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="140" fixed="right" align="center">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="editCoin(record)">
                  <icon-edit /> 编辑
                </a-button>
                <a-popconfirm 
                  content="确定删除该预售活动？" 
                  @ok="deleteCoin(record)"
                >
                  <a-button type="text" status="danger" size="small">
                    <icon-delete /> 删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <!-- 预售订单 -->
    <div class="agx-card" style="margin-top: 16px;">
      <div class="agx-card-title">
        最新认购订单
        <a-button type="text" size="small" @click="viewAllOrders">查看全部</a-button>
      </div>
      <a-table 
        :data="recentOrders" 
        :loading="ordersLoading" 
        :pagination="false"
        size="small"
      >
        <template #columns>
          <a-table-column title="用户" data-index="username" :width="120" />
          <a-table-column title="认购金额" :width="120">
            <template #cell="{ record }">
              <span class="amount-value">{{ formatNumber(record.amount) }} USDT</span>
            </template>
          </a-table-column>
          <a-table-column title="获得AGX" :width="140">
            <template #cell="{ record }">
              <span class="agx-value">{{ formatNumber(record.agxAmount) }} AGX</span>
            </template>
          </a-table-column>
          <a-table-column title="时间" data-index="createdAt" :width="160" />
        </template>
      </a-table>
    </div>

    <!-- 新建/编辑弹窗 -->
    <a-modal 
      v-model:visible="modalVisible" 
      :title="isEdit ? '编辑预售活动' : '新建预售活动'" 
      :width="640"
      @ok="handleSubmit"
      ok-text="保存"
      cancel-text="取消"
      class="agx-modal"
    >
      <a-form :model="formData" layout="vertical" class="agx-form">
        <div class="form-section">
          <div class="section-title">基本信息</div>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="代币符号" required>
                <a-input v-model="formData.coinSymbol" placeholder="如: AGX" :disabled="isEdit" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="代币名称" required>
                <a-input v-model="formData.coinName" placeholder="如: AGX Token" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="项目简介">
            <a-textarea 
              v-model="formData.description" 
              placeholder="输入项目介绍..."
              :max-length="500" 
              show-word-limit 
              :auto-size="{ minRows: 2, maxRows: 4 }"
            />
          </a-form-item>
        </div>

        <div class="form-section">
          <div class="section-title">预售设置</div>
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="预售价格(USDT)" required>
                <a-input-number 
                  v-model="formData.issuePrice" 
                  :min="0" 
                  :precision="6" 
                  :default-value="0.065"
                  style="width: 100%" 
                  placeholder="0.065"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="预售总量" required>
                <a-input-number 
                  v-model="formData.issueAmount" 
                  :min="0" 
                  style="width: 100%" 
                  placeholder="预售代币数量"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="总供应量">
                <a-input-number 
                  v-model="formData.totalSupply" 
                  :min="0" 
                  style="width: 100%" 
                  placeholder="代币总量"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="最小认购(USDT)" required>
                <a-input-number 
                  v-model="formData.minBuyAmount" 
                  :min="0" 
                  style="width: 100%" 
                  placeholder="100"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="最大认购(USDT)" required>
                <a-input-number 
                  v-model="formData.maxBuyAmount" 
                  :min="0" 
                  style="width: 100%" 
                  placeholder="10000"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <div class="form-section">
          <div class="section-title">时间设置</div>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="开始时间" required>
                <a-date-picker 
                  v-model="formData.startTime" 
                  show-time 
                  style="width: 100%" 
                  placeholder="选择开始时间"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="结束时间" required>
                <a-date-picker 
                  v-model="formData.endTime" 
                  show-time 
                  style="width: 100%" 
                  placeholder="选择结束时间"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="解锁时间">
                <a-date-picker 
                  v-model="formData.unlockTime" 
                  show-time 
                  style="width: 100%" 
                  placeholder="代币解锁时间"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="状态">
                <a-select v-model="formData.status">
                  <a-option :value="0">待开始</a-option>
                  <a-option :value="1">进行中</a-option>
                  <a-option :value="2">已结束</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import api from '@/api/agx/index.js'

const loading = ref(false)
const ordersLoading = ref(false)
const tableData = ref([])
const recentOrders = ref([])
const modalVisible = ref(false)
const isEdit = ref(false)

const stats = reactive({
  soldAmount: 0,
  raisedUsdt: 0,
  participants: 0
})

// 获取统计数据
const fetchStats = async () => {
  try {
    const res = await api.getCoinIssueStats()
    if (res.code === 0 && res.data) {
      stats.soldAmount = res.data.soldAmount || 0
      stats.raisedUsdt = res.data.raisedUsdt || 0
      stats.participants = res.data.participants || 0
    }
  } catch (e) {
    console.error('获取统计数据失败:', e)
  }
}

const searchForm = reactive({
  status: undefined
})

const formData = reactive({
  id: null,
  coinSymbol: 'AGX',
  coinName: 'AGX Token',
  startTime: null,
  endTime: null,
  unlockTime: null,
  issuePrice: 0.065,
  totalSupply: 100000000,
  issueAmount: 10000000,
  minBuyAmount: 100,
  maxBuyAmount: 10000,
  description: '',
  status: 1
})

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
  return parseFloat(num).toLocaleString()
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN', { 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const getProgress = (record) => {
  if (!record.issueAmount) return 0
  return Math.min(100, ((record.soldAmount || 0) / record.issueAmount) * 100)
}

const getStatusClass = (status) => {
  const map = { 0: 'default', 1: 'success', 2: 'info' }
  return map[status] || 'default'
}

const getStatusText = (status) => {
  const map = { 0: '待开始', 1: '进行中', 2: '已结束' }
  return map[status] || '未知'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await api.getCoinIssues()
    if (res.code === 0 && res.data) {
      tableData.value = res.data.list || []
    }
  } catch (error) {
    console.error('获取预售列表失败:', error)
  } finally {
    loading.value = false
  }
}

const showCreateModal = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: null,
    coinSymbol: 'AGX',
    coinName: 'AGX Token',
    startTime: null,
    endTime: null,
    unlockTime: null,
    issuePrice: 0.065,
    totalSupply: 100000000,
    issueAmount: 10000000,
    minBuyAmount: 100,
    maxBuyAmount: 10000,
    description: 'AGX是基于区块链的数字黄金生态代币，持有AGX可获得黄金奖励。',
    status: 1
  })
  modalVisible.value = true
}

const editCoin = (record) => {
  isEdit.value = true
  Object.assign(formData, {
    id: record.id,
    coinSymbol: record.coinSymbol,
    coinName: record.coinName,
    startTime: record.startTime,
    endTime: record.endTime,
    unlockTime: record.unlockTime,
    issuePrice: record.issuePrice,
    totalSupply: record.totalSupply,
    issueAmount: record.issueAmount,
    minBuyAmount: record.minBuyAmount,
    maxBuyAmount: record.maxBuyAmount,
    description: record.description || '',
    status: record.status
  })
  modalVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.coinSymbol || !formData.coinName) {
    Message.warning('请填写代币符号和名称')
    return
  }
  if (!formData.issuePrice || formData.issuePrice <= 0) {
    Message.warning('请设置有效的预售价格')
    return
  }
  if (!formData.startTime || !formData.endTime) {
    Message.warning('请设置开始时间和结束时间')
    return
  }
  
  // 辅助函数：将日期转换为ISO字符串
  const toISOString = (date) => {
    if (!date) return null
    if (typeof date === 'string') return date
    if (date instanceof Date) return date.toISOString()
    return new Date(date).toISOString()
  }
  
  try {
    const submitData = {
      coinSymbol: formData.coinSymbol,
      coinName: formData.coinName,
      startTime: toISOString(formData.startTime),
      endTime: toISOString(formData.endTime),
      lotteryTime: toISOString(formData.endTime),
      unlockTime: toISOString(formData.unlockTime) || toISOString(formData.endTime),
      issuePrice: formData.issuePrice,
      totalSupply: formData.totalSupply,
      issueAmount: formData.issueAmount,
      minBuyAmount: formData.minBuyAmount,
      maxBuyAmount: formData.maxBuyAmount,
      description: formData.description,
      status: formData.status
    }
    
    if (isEdit.value) {
      await api.updateCoinIssue(formData.id, submitData)
      Message.success('修改成功')
    } else {
      await api.createCoinIssue(submitData)
      Message.success('创建成功')
    }
    modalVisible.value = false
    fetchData()
  } catch (error) {
    console.error('操作失败:', error)
    Message.error('操作失败')
  }
}

const deleteCoin = async (record) => {
  try {
    await api.deleteCoinIssue(record.id)
    Message.success('已删除')
    fetchData()
  } catch (error) {
    Message.error('删除失败')
  }
}

const viewAllOrders = () => {
  Message.info('订单列表开发中')
}

onMounted(() => {
  fetchData()
  fetchStats()
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
  &.highlight {
    background: linear-gradient(135deg, var(--agx-primary, #D4A84B) 0%, #B8923F 100%);
    
    .stat-icon {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
    
    .stat-label, .stat-suffix {
      color: rgba(255, 255, 255, 0.8) !important;
    }
    
    .stat-value {
      color: white !important;
    }
  }
  
  .stat-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }
}

.stat-desc {
  font-size: 12px;
  color: var(--agx-text-tertiary, #86909C);
  margin-top: 4px;
}

// 代币信息
.coin-info {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .coin-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--agx-primary, #D4A84B) 0%, #B8923F 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
  }
  
  .coin-detail {
    .coin-name {
      font-weight: 600;
      color: var(--agx-text-primary, #1D2129);
    }
    
    .coin-full-name {
      font-size: 12px;
      color: var(--agx-text-tertiary, #86909C);
    }
  }
  
  .new-badge {
    font-size: 10px;
    padding: 2px 6px;
    background: linear-gradient(135deg, #52C41A 0%, #389E0D 100%);
    color: white;
    border-radius: 3px;
    font-weight: 600;
  }
}

// 价格
.price-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--agx-primary, #D4A84B);
}

// 额度进度
.quota-info {
  .quota-progress {
    height: 6px;
    background: var(--agx-bg-tertiary, #F2F3F5);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 4px;
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--agx-primary, #D4A84B) 0%, #E8C876 100%);
      border-radius: 3px;
    }
  }
  
  .quota-text {
    font-size: 12px;
    color: var(--agx-text-secondary, #4E5969);
  }
}

// 限额
.limit-info {
  font-size: 13px;
  color: var(--agx-text-secondary, #4E5969);
  
  .limit-sep {
    margin: 0 4px;
    color: var(--agx-text-disabled, #C9CDD4);
  }
  
  .limit-unit {
    margin-left: 4px;
    color: var(--agx-text-tertiary, #86909C);
  }
}

// 时间
.time-info {
  .time-row {
    font-size: 12px;
    line-height: 1.6;
    
    .time-label {
      color: var(--agx-text-tertiary, #86909C);
      margin-right: 4px;
    }
  }
}

// 订单金额
.amount-value {
  color: var(--agx-text-primary, #1D2129);
}

.agx-value {
  color: var(--agx-primary, #D4A84B);
  font-weight: 500;
}

// 表单分区
.form-section {
  margin-bottom: 20px;
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--agx-text-primary, #1D2129);
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--agx-border-light, #F2F3F5);
  }
}

// 卡片标题
.agx-card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
