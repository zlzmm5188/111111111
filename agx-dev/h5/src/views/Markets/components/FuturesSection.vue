<template>
  <div class="content-area">
    <div class="sub-tabs">
      <button v-for="t in futuresTabs" :key="t.key" :class="{ active: futuresTab === t.key }" @click="$emit('update:futuresTab', t.key)">{{ t.name }}</button>
    </div>
    <!-- 期货两列卡片 -->
    <div class="grid-3">
      <div class="sq-card" :class="item.flash" v-for="item in currentFutures" :key="item.symbol" @click="$emit('openDetail', item)">
        <div class="sq-left">
          <div class="sq-name">{{ item.name }}</div>
          <div class="sq-code">{{ item.symbol }}</div>
        </div>
        <div class="sq-right">
          <div class="sq-price" :class="item.priceFlash">{{ item.price }}</div>
          <div class="sq-chg" :class="item.change >= 0 ? 'up' : 'down'">{{ fmtPct(item.change) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  futuresTab: { type: String, required: true },
  currentFutures: { type: Array, required: true },
  fmtPct: { type: Function, required: true }
})
defineEmits(['update:futuresTab', 'openDetail'])

const futuresTabs = [
  { key: 'index', name: '指数' },
  { key: 'metal', name: '贵金属' },
  { key: 'energy', name: '能源' },
  { key: 'agri', name: '农产品' },
]
</script>

<style scoped>
.content-area { padding: 16px; }

.sub-tabs { display: flex; gap: 10px; margin-bottom: 16px; overflow-x: auto; }
.sub-tabs button { padding: 10px 16px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; font-size: 14px; font-weight: 600; color: #8B949E; white-space: nowrap; }
.sub-tabs button.active { background: rgba(200,170,110,0.2); border-color: #C8AA6E; color: #C8AA6E; }

.grid-3 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.sq-card { padding: 14px 12px; background: linear-gradient(145deg, rgba(30,38,50,0.95), rgba(22,27,34,0.9)); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; cursor: pointer; display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 10px; transition: all 0.2s; }
.sq-card:active { background: rgba(22,27,34,0.9); transform: scale(0.98); }
.sq-left { flex: 1; min-width: 0; }
.sq-name { font-size: 14px; font-weight: 600; color: #E6EDF3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.sq-code { font-size: 10px; color: #6B7280; margin-top: 2px; }
.sq-right { text-align: right; flex-shrink: 0; }
.sq-price { font-size: 16px; font-weight: 700; color: #fff; font-family: 'Inter', sans-serif; text-align: right; }
.sq-chg { font-size: 11px; font-weight: 700; padding: 3px 6px; border-radius: 4px; text-align: right; }
.sq-chg.up { color: #0ECB81; background: rgba(14,203,129,0.15); }
.sq-chg.down { color: #F6465D; background: rgba(246,70,93,0.15); }
</style>
