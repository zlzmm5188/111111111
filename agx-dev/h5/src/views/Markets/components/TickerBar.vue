<template>
  <div class="ticker-bar">
    <div class="ticker-track">
      <div class="ticker-content" v-for="n in 2" :key="n">
        <div class="ticker-item" v-for="(item, i) in tickerList" :key="n+'-'+i">
          <img v-if="item.flag" :src="item.flag" class="t-flag">
          <span v-else class="t-icon">{{ item.icon }}</span>
          <span class="t-name">{{ item.symbol }}</span>
          <span class="t-change" :class="item.change >= 0 ? 'up' : 'down'">{{ fmtPct(item.change) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tickerList: { type: Array, required: true },
  fmtPct: { type: Function, required: true }
})
</script>

<style scoped>
.ticker-bar { 
  position: fixed; 
  top: 0; 
  left: 50%; 
  transform: translateX(-50%); 
  width: 100%; 
  max-width: 428px; 
  z-index: 100; 
  background: linear-gradient(180deg, rgba(22, 27, 34, 0.98) 0%, rgba(18, 22, 28, 0.98) 100%);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  overflow: hidden; 
  border-bottom: 1px solid rgba(200, 170, 110, 0.12); 
  height: 52px;
  padding-top: env(safe-area-inset-top, 0px);
}

/* 顶部金色渐变线 */
.ticker-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 10%, rgba(200, 170, 110, 0.3) 50%, transparent 90%);
}

.ticker-track { 
  display: flex; 
  width: fit-content;
  animation: scroll 45s linear infinite; 
}

.ticker-content { 
  display: flex; 
  flex-shrink: 0;
}

@keyframes scroll { 
  0% { transform: translateX(0); } 
  100% { transform: translateX(-50%); } 
}

.ticker-item { 
  display: inline-flex; 
  align-items: center; 
  gap: 10px; 
  padding: 14px 20px; 
  white-space: nowrap; 
  flex-shrink: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.ticker-item:last-child {
  border-right: none;
}

.t-flag { 
  width: 26px; 
  height: 18px; 
  border-radius: 3px; 
  object-fit: cover;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.t-icon { 
  font-size: 20px; 
}

.t-name { 
  font-size: 15px; 
  font-weight: 700; 
  color: #E6EDF3;
  letter-spacing: -0.2px;
}

.t-change { 
  font-size: 13px; 
  font-weight: 700; 
  padding: 5px 10px; 
  border-radius: 8px; 
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: center;
  gap: 3px;
}

.t-change.up { 
  color: #0ECB81; 
  background: rgba(14, 203, 129, 0.12);
  border: 1px solid rgba(14, 203, 129, 0.2);
}

.t-change.down { 
  color: #F6465D; 
  background: rgba(246, 70, 93, 0.12);
  border: 1px solid rgba(246, 70, 93, 0.2);
}
</style>
