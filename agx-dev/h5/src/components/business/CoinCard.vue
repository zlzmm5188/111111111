<template>
  <div class="coin-card" :class="[size, { 'coin-card--active': active }]" @click="handleClick">
    <!-- 卡片头部 -->
    <div class="card-header">
      <img :src="icon" class="coin-icon" :alt="symbol" @error="onImageError">
      <div class="coin-badge" v-if="badge">{{ badge }}</div>
    </div>
    
    <!-- 币种信息 -->
    <div class="card-body">
      <div class="coin-symbol">{{ symbol }}</div>
      <div class="coin-name" v-if="name">{{ name }}</div>
    </div>
    
    <!-- 价格信息 -->
    <div class="card-price">
      <span class="price-value">{{ prefix }}{{ formattedPrice }}</span>
      <span class="price-change" :class="changeClass">
        {{ changePrefix }}{{ formattedChange }}%
      </span>
    </div>
    
    <!-- 附加信息（可选） -->
    <div class="card-extra" v-if="showVolume || showMarketCap">
      <div class="extra-item" v-if="showVolume">
        <span class="extra-label">24H量</span>
        <span class="extra-value">{{ formattedVolume }}</span>
      </div>
      <div class="extra-item" v-if="showMarketCap">
        <span class="extra-label">市值</span>
        <span class="extra-value">{{ formattedMarketCap }}</span>
      </div>
    </div>
    
    <!-- 迷你图表（可选） -->
    <div class="card-chart" v-if="showChart && chartData.length">
      <svg class="mini-chart" viewBox="0 0 100 30" preserveAspectRatio="none">
        <polyline
          :points="chartPoints"
          fill="none"
          :stroke="changeNum >= 0 ? 'var(--color-up)' : 'var(--color-down)'"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  symbol: { type: String, required: true },
  name: { type: String, default: '' },
  icon: { type: String, default: '' },
  price: { type: [Number, String], default: 0 },
  change: { type: [Number, String], default: 0 },
  volume: { type: [Number, String], default: 0 },
  marketCap: { type: [Number, String], default: 0 },
  decimals: { type: Number, default: 2 },
  prefix: { type: String, default: '$' },
  size: { type: String, default: 'md' }, // sm, md, lg
  badge: { type: String, default: '' },
  active: { type: Boolean, default: false },
  showVolume: { type: Boolean, default: false },
  showMarketCap: { type: Boolean, default: false },
  showChart: { type: Boolean, default: false },
  chartData: { type: Array, default: () => [] }
})

const emit = defineEmits(['click'])

const changeNum = computed(() => parseFloat(props.change) || 0)

const formattedPrice = computed(() => {
  const num = parseFloat(props.price) || 0
  if (num >= 1000) {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return num.toLocaleString('en-US', {
    minimumFractionDigits: props.decimals,
    maximumFractionDigits: props.decimals
  })
})

const formattedChange = computed(() => Math.abs(changeNum.value).toFixed(2))

const changePrefix = computed(() => changeNum.value >= 0 ? '+' : '-')

const changeClass = computed(() => changeNum.value >= 0 ? 'up' : 'down')

const formatLargeNumber = (num) => {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T'
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
  return num.toString()
}

const formattedVolume = computed(() => formatLargeNumber(parseFloat(props.volume) || 0))
const formattedMarketCap = computed(() => formatLargeNumber(parseFloat(props.marketCap) || 0))

const chartPoints = computed(() => {
  if (!props.chartData.length) return ''
  const max = Math.max(...props.chartData)
  const min = Math.min(...props.chartData)
  const range = max - min || 1
  return props.chartData.map((val, i) => {
    const x = (i / (props.chartData.length - 1)) * 100
    const y = 30 - ((val - min) / range) * 28
    return `${x},${y}`
  }).join(' ')
})

const handleClick = () => {
  emit('click', { symbol: props.symbol, price: props.price, change: props.change })
}

const onImageError = (e) => {
  e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="18" fill="%231E2329"/><text x="20" y="25" text-anchor="middle" fill="%23848E9C" font-size="12">${props.symbol.charAt(0)}</text></svg>`
}
</script>

<style scoped>
.coin-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: var(--card-padding-md);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.coin-card:active {
  transform: scale(0.98);
  background: var(--bg-hover);
}

.coin-card--active {
  border: 1px solid var(--color-brand);
  box-shadow: var(--shadow-glow-brand);
}

/* 尺寸变体 */
.coin-card.sm {
  padding: var(--card-padding-sm);
  min-width: 120px;
}

.coin-card.md {
  padding: var(--card-padding-md);
  min-width: 150px;
}

.coin-card.lg {
  padding: var(--card-padding-lg);
  min-width: 180px;
}

/* 头部 */
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.coin-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-secondary);
  object-fit: cover;
}

.coin-card.sm .coin-icon {
  width: 28px;
  height: 28px;
}

.coin-card.lg .coin-icon {
  width: 44px;
  height: 44px;
}

.coin-badge {
  padding: 2px 6px;
  font-size: var(--font-xs);
  font-weight: var(--fw-medium);
  color: var(--color-brand);
  background: var(--color-brand-bg);
  border-radius: var(--radius-xs);
}

/* 主体 */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.coin-symbol {
  font-size: var(--font-lg);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
}

.coin-card.sm .coin-symbol {
  font-size: var(--font-md);
}

.coin-name {
  font-size: var(--font-xs);
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 价格 */
.card-price {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-value {
  font-size: var(--font-lg);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  font-family: var(--font-mono);
}

.coin-card.sm .price-value {
  font-size: var(--font-md);
}

.price-change {
  font-size: var(--font-sm);
  font-weight: var(--fw-medium);
  font-family: var(--font-mono);
}

.price-change.up { color: var(--color-up); }
.price-change.down { color: var(--color-down); }

/* 附加信息 */
.card-extra {
  display: flex;
  justify-content: space-between;
  padding-top: var(--space-sm);
  border-top: 1px solid var(--border-color);
  margin-top: var(--space-xs);
}

.extra-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.extra-label {
  font-size: var(--font-xs);
  color: var(--text-tertiary);
}

.extra-value {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

/* 迷你图表 */
.card-chart {
  margin-top: var(--space-sm);
  height: 30px;
}

.mini-chart {
  width: 100%;
  height: 100%;
}
</style>
