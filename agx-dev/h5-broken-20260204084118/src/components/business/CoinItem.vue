<template>
  <div class="coin-item" :class="{ clickable: clickable }" @click="handleClick">
    <!-- 左侧：图标+名称 -->
    <div class="coin-left">
      <img :src="icon" class="coin-icon" :alt="symbol" @error="onImageError">
      <div class="coin-info">
        <span class="coin-symbol">{{ symbol }}</span>
        <span class="coin-name" v-if="name">{{ name }}</span>
      </div>
    </div>

    <!-- 中间：价格（可选） -->
    <div class="coin-center" v-if="showPrice">
      <span class="coin-price">{{ prefix }}{{ formattedPrice }}</span>
      <span class="coin-volume" v-if="volume">Vol {{ formattedVolume }}</span>
    </div>

    <!-- 右侧：涨跌幅 -->
    <div class="coin-right">
      <span class="coin-change" :class="changeClass">
        {{ changePrefix }}{{ formattedChange }}%
      </span>
    </div>

    <!-- 箭头（可选） -->
    <svg v-if="showArrow" class="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 18l6-6-6-6"/>
    </svg>
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
  volume: { type: [Number, String], default: '' },
  decimals: { type: Number, default: 2 },
  prefix: { type: String, default: '$' },
  showPrice: { type: Boolean, default: true },
  showArrow: { type: Boolean, default: false },
  clickable: { type: Boolean, default: true }
})

const emit = defineEmits(['click'])

const formattedPrice = computed(() => {
  const num = parseFloat(props.price) || 0
  return num.toLocaleString('en-US', {
    minimumFractionDigits: props.decimals,
    maximumFractionDigits: props.decimals
  })
})

const formattedChange = computed(() => {
  const num = parseFloat(props.change) || 0
  return num.toFixed(2)
})

const formattedVolume = computed(() => {
  const num = parseFloat(props.volume) || 0
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
  return num.toString()
})

const changePrefix = computed(() => {
  const num = parseFloat(props.change) || 0
  return num >= 0 ? '+' : ''
})

const changeClass = computed(() => {
  const num = parseFloat(props.change) || 0
  return num >= 0 ? 'up' : 'down'
})

const handleClick = () => {
  if (props.clickable) {
    emit('click', { symbol: props.symbol, price: props.price, change: props.change })
  }
}

const onImageError = (e) => {
  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="18" fill="%231E2329"/><text x="20" y="25" text-anchor="middle" fill="%23848E9C" font-size="12">' + props.symbol.charAt(0) + '</text></svg>'
}
</script>

<style scoped>
.coin-item {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.coin-item.clickable {
  cursor: pointer;
}

.coin-item.clickable:active {
  background: rgba(255, 255, 255, 0.02);
}

.coin-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.coin-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1E2329;
  object-fit: cover;
  flex-shrink: 0;
}

.coin-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.coin-symbol {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.coin-name {
  font-size: 11px;
  color: var(--text-tertiary, #5E6673);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.coin-center {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex: 1;
  padding: 0 12px;
}

.coin-price {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
  font-family: 'SF Mono', monospace;
}

.coin-volume {
  font-size: 11px;
  color: var(--text-tertiary, #5E6673);
}

.coin-right {
  min-width: 80px;
  text-align: right;
}

.coin-change {
  display: inline-block;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'SF Mono', monospace;
  border-radius: 6px;
}

.coin-change.up {
  color: #0ECB81;
  background: rgba(14, 203, 129, 0.1);
}

.coin-change.down {
  color: #F6465D;
  background: rgba(246, 70, 93, 0.1);
}

.arrow-icon {
  margin-left: 8px;
  color: var(--text-tertiary, #5E6673);
  flex-shrink: 0;
}
</style>
