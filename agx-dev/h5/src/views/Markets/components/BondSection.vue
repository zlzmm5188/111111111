<template>
  <div class="content-area">
    <!-- 2列债券卡片 -->
    <div class="grid-3">
      <div class="sq-card" :class="item.flash" v-for="item in bondList" :key="item.country" @click="$emit('openDetail', item)">
        <div class="sq-left sq-with-icon">
          <img :src="item.flag" class="sq-flag-single">
          <div>
            <div class="sq-name">{{ item.country }}</div>
            <div class="sq-sub-text">{{ item.rating }}</div>
          </div>
        </div>
        <div class="sq-right">
          <div class="sq-price" :class="item.flash">{{ item.y10 }}%</div>
          <div class="sq-chg" :class="[item.change10y >= 0 ? 'up' : 'down', item.flash]">{{ item.change10y >= 0 ? '+' : '' }}{{ item.change10y }}bp</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  bondList: { type: Array, required: true }
})
defineEmits(['openDetail'])
</script>

<style scoped>
.content-area { padding: 16px; }

.grid-3 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.sq-card { padding: 14px 12px; background: linear-gradient(145deg, rgba(30,38,50,0.95), rgba(22,27,34,0.9)); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; cursor: pointer; display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 10px; transition: all 0.2s; }
.sq-card:active { background: rgba(22,27,34,0.9); transform: scale(0.98); }
.sq-left { flex: 1; min-width: 0; }
.sq-left.sq-with-icon { display: flex; align-items: center; gap: 10px; }
.sq-left.sq-with-icon > div { min-width: 0; overflow: hidden; flex: 1; }
.sq-flag-single { width: 32px; height: 22px; border-radius: 3px; object-fit: cover; }
.sq-name { font-size: 14px; font-weight: 600; color: #E6EDF3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.sq-sub-text { font-size: 10px; color: rgba(255,215,0,0.8); margin-top: 2px; font-weight: 500; }
.sq-right { text-align: right; flex-shrink: 0; }
.sq-price { font-size: 16px; font-weight: 700; color: #fff; font-family: 'Inter', sans-serif; text-align: right; }
.sq-chg { font-size: 11px; font-weight: 700; padding: 3px 6px; border-radius: 4px; text-align: right; }
.sq-chg.up { color: #0ECB81; background: rgba(14,203,129,0.15); }
.sq-chg.down { color: #F6465D; background: rgba(246,70,93,0.15); }

/* 闪烁效果 */
.sq-card.flash-up { border-color: rgba(14,203,129,0.5); box-shadow: 0 0 12px rgba(14,203,129,0.3); }
.sq-card.flash-down { border-color: rgba(246,70,93,0.5); box-shadow: 0 0 12px rgba(246,70,93,0.3); }
.sq-price.flash-up { color: #0ECB81; text-shadow: 0 0 8px rgba(14,203,129,0.6); }
.sq-price.flash-down { color: #F6465D; text-shadow: 0 0 8px rgba(246,70,93,0.6); }
</style>
