<template>
  <div class="quick-icon-wrapper" :class="iconClass">
    <!-- 简洁图标设计 -->
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <!-- AGX IEO - 简单星形 -->
      <path v-if="name === 'ieo'" d="M24 12L26 20H34L28 25L30 34L24 29L18 34L20 25L14 20H22L24 12Z" fill="currentColor"/>
      
      <!-- 现货 Trade - 简单箭头 -->
      <path v-else-if="name === 'trade'" d="M12 36V20H28" stroke-width="2.5"/>
      <path v-else-if="name === 'trade'" d="M22 14L30 20L22 26" stroke-width="2.5"/>
      
      <!-- 合约 Contract - 简单折线 -->
      <path v-else-if="name === 'contract'" d="M12 34L20 24L30 28L38 16" stroke-width="2.5"/>
      <path v-else-if="name === 'contract'" d="M32 16H38V22" stroke-width="2.5"/>
      
      <!-- 黄金 Gold - 简单圆形 -->
      <circle v-else-if="name === 'gold'" cx="24" cy="24" r="14" stroke-width="2.5"/>
      <path v-else-if="name === 'gold'" d="M18 24C18 19.58 21.58 16 26 16" stroke-width="2"/>
      
      <!-- 矿机 Earn - 简单硬币 -->
      <circle v-else-if="name === 'earn'" cx="24" cy="24" r="14" stroke-width="2.5"/>
      <path v-else-if="name === 'earn'" d="M18 22H30" stroke-width="2"/>
      <path v-else-if="name === 'earn'" d="M18 26H30" stroke-width="2"/>
      
      <!-- 质押 Mining - 简单菱形 -->
      <path v-else-if="name === 'mining'" d="M24 12L36 24L24 36L12 24L24 12Z" stroke-width="2.5"/>
      <circle v-else-if="name === 'mining'" cx="24" cy="24" r="6" fill="currentColor"/>
      
      <!-- 充币 Deposit - 向下箭头 -->
      <circle v-else-if="name === 'deposit'" cx="24" cy="24" r="14" stroke-width="2.5"/>
      <path v-else-if="name === 'deposit'" d="M24 16V30" stroke-width="2.5"/>
      <path v-else-if="name === 'deposit'" d="M18 24L24 30L30 24" stroke-width="2.5"/>
      
      <!-- 提币 Withdraw - 向上箭头 -->
      <circle v-else-if="name === 'withdraw'" cx="24" cy="24" r="14" stroke-width="2.5"/>
      <path v-else-if="name === 'withdraw'" d="M24 32V18" stroke-width="2.5"/>
      <path v-else-if="name === 'withdraw'" d="M18 24L24 18L30 24" stroke-width="2.5"/>
      
      <!-- 默认图标 -->
      <circle v-else cx="24" cy="24" r="14"/>
    </svg>
  </div>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  iconClass: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.quick-icon-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-icon-wrapper svg {
  width: 32px;
  height: 32px;
  color: #C8AA6E !important;
}

.quick-icon-wrapper svg,
.quick-icon-wrapper svg * {
  stroke: #C8AA6E !important;
  fill: none !important;
}

.quick-icon-wrapper svg[fill="currentColor"] {
  fill: #C8AA6E !important;
}
</style>
