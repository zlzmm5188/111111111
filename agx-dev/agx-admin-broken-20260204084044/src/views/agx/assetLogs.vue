<template>
  <div class="asset-logs-page">
    <a-row class="mb-3">
      <a-col :span="24">
        <a-space :size="8">
          <a-input v-model="searchForm.userId" placeholder="用户ID" allow-clear style="width: 100px" size="small" />
          <a-select v-model="searchForm.type" placeholder="类型" allow-clear style="width: 130px" size="small">
            <a-option value="deposit">充值</a-option>
            <a-option value="recharge">充值(手动)</a-option>
            <a-option value="withdraw">提现</a-option>
            <a-option value="invite_bonus">邀请奖励</a-option>
            <a-option value="commission">返佣</a-option>
            <a-option value="pool_subscribe">矿池认购</a-option>
            <a-option value="pool_redeem">矿池赎回</a-option>
            <a-option value="pool_profit">矿池收益</a-option>
            <a-option value="contract_bet">合约下单</a-option>
            <a-option value="contract_win">合约盈利</a-option>
            <a-option value="contract_lose">合约亏损</a-option>
            <a-option value="admin_add">后台增加</a-option>
            <a-option value="admin_sub">后台扣除</a-option>
            <a-option value="admin_increase">后台增加(新)</a-option>
            <a-option value="admin_decrease">后台扣减(新)</a-option>
          </a-select>
          <a-select v-model="searchForm.coin" placeholder="币种" allow-clear style="width: 100px" size="small">
            <a-option value="USDT">USDT</a-option>
            <a-option value="BTC">BTC</a-option>
            <a-option value="ETH">ETH</a-option>
          </a-select>
          <a-button type="primary" size="small" @click="handleSearch">
            <template #icon><icon-search /></template>
            搜索
          </a-button>
          <a-button size="small" @click="handleReset">
            <template #icon><icon-refresh /></template>
            重置
          </a-button>
        </a-space>
      </a-col>
    </a-row>

    <a-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      @page-change="onPageChange"
      row-key="id"
      size="small"
      :bordered="false"
      class="compact-table"
    >
      <template #columns>
        <a-table-column title="ID" data-index="id" :width="70" />
        <a-table-column title="用户ID" data-index="userId" :width="70" />
        <a-table-column title="币种" data-index="coin" :width="60" />
        <a-table-column title="类型" data-index="type" :width="100">
          <template #cell="{ record }">
            <a-tag :color="getTypeColor(record.type)" size="small">{{ getTypeName(record.type) }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="变动金额" :width="110" align="right">
          <template #cell="{ record }">
            <span class="balance-amount" :class="parseFloat(record.amount) >= 0 ? 'amount-positive' : 'amount-negative'">
              {{ parseFloat(record.amount) >= 0 ? '+' : '' }}{{ formatNumber(record.amount) }}
            </span>
          </template>
        </a-table-column>
        <a-table-column title="变动前" :width="110" align="right">
          <template #cell="{ record }">
            <span class="balance-amount amount-before">{{ formatNumber(record.balanceBefore) }}</span>
          </template>
        </a-table-column>
        <a-table-column title="变动后" :width="110" align="right">
          <template #cell="{ record }">
            <span class="balance-amount amount-after">{{ formatNumber(record.balanceAfter) }}</span>
          </template>
        </a-table-column>
        <a-table-column title="备注" data-index="remark" :width="180" />
        <a-table-column title="时间" data-index="createdAt" :width="160" />
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import agxApi from '@/api/agx'
import { formatNumber } from '@/utils/format'

const loading = ref(false)
const tableData = ref([])

const searchForm = reactive({ userId: '', type: undefined, coin: undefined })
const pagination = reactive({ current: 1, pageSize: 20, total: 0, showTotal: true })

const typeMap = {
  deposit: '充值',
  withdraw: '提现',
  recharge: '充值',
  invite_bonus: '邀请奖励',
  commission: '返佣',
  pool_subscribe: '矿池认购',
  pool_redeem: '矿池赎回',
  pool_profit: '矿池收益',
  contract_bet: '合约下单',
  contract_win: '合约盈利',
  contract_lose: '合约亏损',
  admin_add: '后台增加',
  admin_sub: '后台扣除',
  admin_increase: '后台增加',
  admin_decrease: '后台扣减'
}

const getTypeName = (type) => typeMap[type] || type
const getTypeColor = (type) => {
  if (['deposit', 'recharge', 'pool_profit', 'contract_win', 'admin_add', 'admin_increase', 'invite_bonus', 'commission'].includes(type)) return 'green'
  if (['withdraw', 'contract_lose', 'admin_sub', 'admin_decrease'].includes(type)) return 'red'
  return 'blue'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await agxApi.getAssetLogs({
      page: pagination.current,
      pageSize: pagination.pageSize,
      userId: searchForm.userId || undefined,
      type: searchForm.type,
      coin: searchForm.coin
    })
    if (res.code === 0) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.current = 1; fetchData() }
const handleReset = () => {
  searchForm.userId = ''
  searchForm.type = undefined
  searchForm.coin = undefined
  pagination.current = 1
  fetchData()
}
const onPageChange = (page) => { pagination.current = page; fetchData() }

onMounted(() => { fetchData() })
</script>

<style lang="less" scoped>
.asset-logs-page {
  padding: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', 'Roboto Mono', 'Menlo', 'Monaco', 'Consolas', monospace;
  --font-digits: 'SF Mono', 'Inter', 'Roboto Mono', 'Menlo', monospace;
  background: #f5f6f8;
  min-height: calc(100vh - 140px);
}

.mb-3 {
  margin-bottom: 12px;
}

:deep(.arco-input-wrapper),
:deep(.arco-select) {
  background: #fff;
  border: 1px solid #e5e7eb;

  .arco-input,
  .arco-select-view {
    color: #1f2937;
    background: transparent;
    font-size: 13px;
  }

  &.arco-select-view-focus,
  .arco-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
}

:deep(.arco-btn) {
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;

  &.arco-btn-primary {
    background: #3b82f6;
    border-color: #3b82f6;

    &:hover {
      background: #2563eb;
      border-color: #2563eb;
    }
  }

  &:not(.arco-btn-primary) {
    background: #fff;
    border-color: #e5e7eb;
    color: #4b5563;

    &:hover {
      background: #f9fafb;
      border-color: #d1d5db;
      color: #1f2937;
    }
  }
}

:deep(.compact-table) {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .arco-table {
    background: transparent;
    color: #1f2937;
    font-size: 13px;
  }

  .arco-table-th,
  .arco-table-td {
    padding: 8px 10px;
    background: transparent;
    border-color: #f3f4f6;
  }

  .arco-table-th {
    font-weight: 600;
    color: #6b7280;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    background: #f9fafb;
  }

  .arco-table-tr {
    transition: background 0.15s ease;

    &:hover {
      background: #f9fafb;
    }

    &:not(:last-child) {
      border-bottom: 1px solid #f3f4f6;
    }
  }

  .arco-tag {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
  }
}

.balance-amount {
  font-family: var(--font-digits);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  letter-spacing: -0.02em;
  font-size: 13px;
}

.amount-positive {
  color: #22c55e;
}

.amount-negative {
  color: #ef4444;
}

.amount-before,
.amount-after {
  color: #6b7280;
}

:deep(.arco-pagination) {
  margin-top: 16px;

  .arco-pagination-item {
    background: #fff;
    border: 1px solid #e5e7eb;
    color: #4b5563;
    font-size: 13px;
    min-width: 32px;
    height: 32px;
    border-radius: 6px;

    &:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }

    &.arco-pagination-item-active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }
  }

  .arco-pagination-jump-input {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
  }
}
</style>
