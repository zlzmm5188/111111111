<template>
  <div class="transaction-item" @click="$emit('click', transaction)">
    <!-- 左侧：类型图标 + 信息 -->
    <div class="tx-left">
      <div class="tx-icon" :class="typeClass">
        <svg v-if="isIncome" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 3v12M7 10l5 5 5-5"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 21V9M7 14l5-5 5 5"/>
        </svg>
      </div>
      <div class="tx-info">
        <span class="tx-title">{{ typeText }}</span>
        <span class="tx-time">{{ formatTime(transaction.createdAt) }}</span>
      </div>
    </div>

    <!-- 右侧：金额 + 状态 -->
    <div class="tx-right">
      <span class="tx-amount" :class="{ income: isIncome }">
        {{ isIncome ? '+' : '-' }}{{ formatAmount(transaction.amount) }}
        <small>{{ transaction.currency }}</small>
      </span>
      <span class="tx-status" :class="statusClass">{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  transaction: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

// 流水类型配置
const TYPE_CONFIG = {
  deposit: { text: '充值', income: true },
  withdraw: { text: '提现', income: false },
  withdraw_fee: { text: '提现手续费', income: false },
  ieo_buy: { text: 'IEO认购', income: false },
  ieo_refund: { text: 'IEO退款', income: true },
  contract_bet: { text: '合约下注', income: false },
  contract_win: { text: '合约盈利', income: true },
  contract_lose: { text: '合约亏损', income: false },
  earn_deposit: { text: '矿机存入', income: false },
  earn_withdraw: { text: '矿机赎回', income: true },
  earn_interest: { text: '矿机收益', income: true },
  system_reward: { text: '系统奖励', income: true },
  invite_reward: { text: '邀请奖励', income: true },
  manual_adjust: { text: '人工调整', income: true }
}

// 状态配置
const STATUS_CONFIG = {
  pending: { text: '处理中', class: 'pending' },
  confirming: { text: '确认中', class: 'pending' },
  success: { text: '成功', class: 'success' },
  failed: { text: '失败', class: 'failed' },
  rejected: { text: '已拒绝', class: 'failed' },
  cancelled: { text: '已取消', class: 'cancelled' }
}

const typeConfig = computed(() => TYPE_CONFIG[props.transaction.type] || { text: '未知', income: false })
const typeText = computed(() => typeConfig.value.text)
const isIncome = computed(() => typeConfig.value.income)
const typeClass = computed(() => isIncome.value ? 'income' : 'expense')

const statusConfig = computed(() => STATUS_CONFIG[props.transaction.status] || { text: '未知', class: '' })
const statusText = computed(() => statusConfig.value.text)
const statusClass = computed(() => statusConfig.value.class)

const formatAmount = (amount) => {
  const num = parseFloat(amount) || 0
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.transaction-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.tx-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tx-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.tx-icon.income {
  background: rgba(14, 203, 129, 0.1);
  color: #0ECB81;
}

.tx-icon.expense {
  background: rgba(246, 70, 93, 0.1);
  color: #F6465D;
}

.tx-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tx-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #EAECEF);
}

.tx-time {
  font-size: 11px;
  color: var(--text-tertiary, #5E6673);
}

.tx-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.tx-amount {
  font-size: 14px;
  font-weight: 600;
  color: #F6465D;
  font-family: 'SF Mono', monospace;
}

.tx-amount.income {
  color: #0ECB81;
}

.tx-amount small {
  font-size: 11px;
  font-weight: 400;
  margin-left: 2px;
}

.tx-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}

.tx-status.success {
  color: #0ECB81;
  background: rgba(14, 203, 129, 0.1);
}

.tx-status.pending {
  color: #C8AA6E;
  background: rgba(240, 185, 11, 0.1);
}

.tx-status.failed {
  color: #F6465D;
  background: rgba(246, 70, 93, 0.1);
}

.tx-status.cancelled {
  color: #848E9C;
  background: rgba(132, 142, 156, 0.1);
}
</style>
