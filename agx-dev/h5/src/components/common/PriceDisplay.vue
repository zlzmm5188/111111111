<template>
  <div class="price-display" :class="[size, layout]">
    <span class="price" :style="{ fontSize: priceFontSize }">
      {{ prefix }}{{ formattedPrice }}
    </span>
    <span 
      class="change" 
      :class="changeClass"
      :style="{ fontSize: changeFontSize }"
      v-if="showChange"
    >
      {{ changePrefix }}{{ formattedChange }}{{ suffix }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 价格
  price: { type: [Number, String], default: 0 },
  // 涨跌幅
  change: { type: [Number, String], default: 0 },
  // 小数位数
  decimals: { type: Number, default: 2 },
  // 涨跌小数位
  changeDecimals: { type: Number, default: 2 },
  // 价格前缀
  prefix: { type: String, default: '$' },
  // 涨跌后缀
  suffix: { type: String, default: '%' },
  // 是否显示涨跌
  showChange: { type: Boolean, default: true },
  // 尺寸: sm, md, lg
  size: { type: String, default: 'md' },
  // 布局: horizontal, vertical
  layout: { type: String, default: 'horizontal' }
})

const formattedPrice = computed(() => {
  const num = parseFloat(props.price) || 0
  return num.toLocaleString('en-US', {
    minimumFractionDigits: props.decimals,
    maximumFractionDigits: props.decimals
  })
})

const formattedChange = computed(() => {
  const num = parseFloat(props.change) || 0
  return num.toFixed(props.changeDecimals)
})

const changePrefix = computed(() => {
  const num = parseFloat(props.change) || 0
  return num >= 0 ? '+' : ''
})

const changeClass = computed(() => {
  const num = parseFloat(props.change) || 0
  return num >= 0 ? 'up' : 'down'
})

const priceFontSize = computed(() => {
  const sizes = { sm: '13px', md: '15px', lg: '20px' }
  return sizes[props.size]
})

const changeFontSize = computed(() => {
  const sizes = { sm: '11px', md: '13px', lg: '15px' }
  return sizes[props.size]
})
</script>

<style scoped>
.price-display {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price-display.vertical {
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.price {
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
  font-family: 'SF Mono', monospace;
}

.change {
  font-weight: 600;
  font-family: 'SF Mono', monospace;
  padding: 2px 6px;
  border-radius: 4px;
}

.change.up {
  color: #0ECB81;
  background: rgba(14, 203, 129, 0.1);
}

.change.down {
  color: #F6465D;
  background: rgba(246, 70, 93, 0.1);
}

/* 尺寸变体 */
.price-display.sm .change {
  padding: 1px 4px;
}

.price-display.lg .change {
  padding: 4px 10px;
  border-radius: 6px;
}
</style>
