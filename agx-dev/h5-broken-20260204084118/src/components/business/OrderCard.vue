<template>
  <div class="order-card" :class="[status, type]" @click="handleClick">
    <!-- 订单头部 -->
    <div class="order-header">
      <div class="order-type">
        <span class="type-badge" :class="direction">{{ typeLabel }}</span>
        <span class="order-symbol">{{ symbol }}</span>
      </div>
      <span class="order-status" :class="status">{{ statusLabel }}</span>
    </div>
    
    <!-- 订单主体 -->
    <div class="order-body">
      <div class="order-info">
        <div class="info-row">
          <span class="info-label">价格</span>
          <span class="info-value">{{ prefix }}{{ formattedPrice }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">数量</span>
          <span class="info-value">{{ formattedAmount }}</span>
        </div>
        <div class="info-row" v-if="showTotal">
          <span class="info-label">总额</span>
          <span class="info-value highlight">{{ prefix }}{{ formattedTotal }}</span>
        </div>
      </div>
      
      <!-- 盈亏信息（合约订单） -->
      <div class="order-pnl" v-if="showPnl && pnl !== undefined">
        <span class="pnl-label">盈亏</span>
        <span class="pnl-value" :class="pnlClass">
          {{ pnlPrefix }}{{ prefix }}{{ formattedPnl }}
        </span>
      </div>
    </div>
    
    <!-- 订单底部 -->
    <div class="order-footer">
      <span class="order-time">{{ formattedTime }}</span>
      <div class="order-actions" v-if="showActions && status === 'pending'">
        <button class="action-btn cancel" @click.stop="handleCancel">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: { type: [String, Number], required: true },
  symbol: { type: String, required: true },
  type: { type: String, default: 'spot' }, // spot, contract, earn, gold
  direction: { type: String, default: 'buy' }, // buy, sell, long, short
  price: { type: [Number, String], default: 0 },
  amount: { type: [Number, String], default: 0 },
  total: { type: [Number, String], default: 0 },
  pnl: { type: [Number, String], default: undefined },
  status: { type: String, default: 'completed' }, // pending, completed, canceled, failed
  time: { type: [String, Number, Date], default: '' },
  prefix: { type: String, default: '$' },
  decimals: { type: Number, default: 2 },
  showTotal: { type: Boolean, default: true },
  showPnl: { type: Boolean, default: false },
  showActions: { type: Boolean, default: true }
})

const emit = defineEmits(['click', 'cancel'])

const typeLabels = {
  spot: { buy: '买入', sell: '卖出' },
  contract: { buy: '开多', sell: '开空', long: '开多', short: '开空' },
  earn: { buy: '申购', sell: '赎回' },
  gold: { buy: '买入', sell: '卖出' }
}

const statusLabels = {
  pending: '进行中',
  completed: '已完成',
  canceled: '已取消',
  failed: '失败'
}

const typeLabel = computed(() => {
  return typeLabels[props.type]?.[props.direction] || props.direction
})

const statusLabel = computed(() => statusLabels[props.status] || props.status)

const formatNumber = (num, decimals = 2) => {
  const n = parseFloat(num) || 0
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

const formattedPrice = computed(() => formatNumber(props.price, props.decimals))
const formattedAmount = computed(() => formatNumber(props.amount, 4))
const formattedTotal = computed(() => formatNumber(props.total || props.price * props.amount, props.decimals))

const pnlNum = computed(() => parseFloat(props.pnl) || 0)
const formattedPnl = computed(() => formatNumber(Math.abs(pnlNum.value), props.decimals))
const pnlPrefix = computed(() => pnlNum.value >= 0 ? '+' : '-')
const pnlClass = computed(() => pnlNum.value >= 0 ? 'up' : 'down')

const formattedTime = computed(() => {
  if (!props.time) return ''
  const date = new Date(props.time)
  const now = new Date()
  const diff = now - date
  
  // 今天内显示时间
  if (diff < 86400000 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  // 今年内显示月日
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }
  // 其他显示完整日期
  return date.toLocaleDateString('zh-CN')
})

const handleClick = () => {
  emit('click', { id: props.id, symbol: props.symbol })
}

const handleCancel = () => {
  emit('cancel', { id: props.id, symbol: props.symbol })
}
</script>

<style scoped>
.order-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: var(--card-padding-md);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
}

.order-card:active {
  background: var(--bg-hover);
}

/* 订单头部 */
.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.order-type {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.type-badge {
  padding: 2px 8px;
  font-size: var(--font-xs);
  font-weight: var(--fw-medium);
  border-radius: var(--radius-xs);
}

.type-badge.buy,
.type-badge.long {
  color: var(--color-up);
  background: var(--color-up-bg);
}

.type-badge.sell,
.type-badge.short {
  color: var(--color-down);
  background: var(--color-down-bg);
}

.order-symbol {
  font-size: var(--font-md);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
}

.order-status {
  font-size: var(--font-xs);
  padding: 2px 8px;
  border-radius: var(--radius-xs);
}

.order-status.pending {
  color: var(--color-warning);
  background: var(--color-warning-bg);
}

.order-status.completed {
  color: var(--color-up);
  background: var(--color-up-bg);
}

.order-status.canceled {
  color: var(--text-tertiary);
  background: var(--bg-input);
}

.order-status.failed {
  color: var(--color-down);
  background: var(--color-down-bg);
}

/* 订单主体 */
.order-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-lg);
}

.order-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: var(--font-sm);
  color: var(--text-tertiary);
}

.info-value {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

.info-value.highlight {
  color: var(--text-primary);
  font-weight: var(--fw-medium);
}

/* 盈亏 */
.order-pnl {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.pnl-label {
  font-size: var(--font-xs);
  color: var(--text-tertiary);
}

.pnl-value {
  font-size: var(--font-lg);
  font-weight: var(--fw-bold);
  font-family: var(--font-mono);
}

.pnl-value.up { color: var(--color-up); }
.pnl-value.down { color: var(--color-down); }

/* 订单底部 */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-color);
}

.order-time {
  font-size: var(--font-xs);
  color: var(--text-tertiary);
}

.order-actions {
  display: flex;
  gap: var(--space-sm);
}

.action-btn {
  padding: 4px 12px;
  font-size: var(--font-xs);
  font-weight: var(--fw-medium);
  border: none;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.action-btn:active {
  opacity: 0.7;
}

.action-btn.cancel {
  color: var(--text-secondary);
  background: var(--bg-input);
}
</style>
