<template>
  <div class="content-area">
    <!-- 币种列表 -->
    <div class="crypto-list">
      <div class="crypto-item" :class="item.flash" v-for="item in cryptoList" :key="item.symbol" @click="$emit('openDetail', item)">
        <div class="crypto-left">
          <div class="crypto-logo-wrapper">
            <img class="crypto-logo" :src="item.logo" :alt="item.symbol">
          </div>
          <div class="crypto-info">
            <div class="crypto-symbol">{{ item.symbol }}</div>
            <div class="crypto-name">{{ item.name }}</div>
          </div>
        </div>
        <div class="crypto-right">
          <div class="crypto-price" :class="item.flash">${{ item.price }}</div>
          <div class="crypto-change-badge" :class="[item.change >= 0 ? 'up' : 'down', item.flash]">
            <span class="change-arrow">{{ item.change >= 0 ? '▲' : '▼' }}</span>
            {{ fmtPct(item.change) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  cryptoList: { type: Array, required: true },
  fmtPct: { type: Function, required: true }
})
defineEmits(['openDetail'])
</script>

<style scoped>
.content-area { padding: 16px; }

.crypto-list { display: flex; flex-direction: column; gap: 10px; }

.crypto-item { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding: 16px 18px; 
  background: linear-gradient(165deg, rgba(30, 38, 48, 0.95) 0%, rgba(22, 28, 36, 0.95) 100%); 
  border-radius: 18px; 
  cursor: pointer; 
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); 
  border: 1px solid rgba(255, 255, 255, 0.06); 
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  -webkit-tap-highlight-color: transparent;
}

.crypto-item:active { 
  transform: scale(0.98); 
  border-color: rgba(200, 170, 110, 0.25);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 16px rgba(200, 170, 110, 0.1);
}

.crypto-left { display: flex; align-items: center; gap: 14px; flex: 1; }

.crypto-logo-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.crypto-logo { 
  width: 44px; 
  height: 44px; 
  border-radius: 50%; 
  object-fit: contain; 
  background: linear-gradient(145deg, var(--bg-surface, #252a35), var(--bg-elevated, #1a1e28)); 
  padding: 4px; 
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.1);
}

.crypto-info { display: flex; flex-direction: column; gap: 4px; }

.crypto-symbol { 
  font-size: 17px; 
  font-weight: 800; 
  color: #E6EDF3;
  letter-spacing: -0.3px;
}

.crypto-name { font-size: 12px; color: #6B7280; font-weight: 500; }

.crypto-right { text-align: right; min-width: 100px; }

.crypto-price { 
  font-size: 17px; 
  font-weight: 800; 
  color: #fff; 
  font-family: 'Inter', -apple-system, monospace;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.crypto-change-badge { 
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px; 
  font-weight: 700; 
  padding: 5px 10px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
}

.crypto-change-badge.up { 
  color: #0ECB81; 
  background: rgba(14, 203, 129, 0.12);
}

.crypto-change-badge.down { 
  color: #F6465D; 
  background: rgba(246, 70, 93, 0.12);
}

.change-arrow {
  font-size: 9px;
}

/* 闪烁效果 */
.crypto-item.flash-up { 
  background: linear-gradient(165deg, rgba(14, 203, 129, 0.18), rgba(14, 203, 129, 0.08)); 
  border-color: rgba(14, 203, 129, 0.5); 
  box-shadow: 0 0 20px rgba(14, 203, 129, 0.25); 
}

.crypto-item.flash-down { 
  background: linear-gradient(165deg, rgba(246, 70, 93, 0.18), rgba(246, 70, 93, 0.08)); 
  border-color: rgba(246, 70, 93, 0.5); 
  box-shadow: 0 0 20px rgba(246, 70, 93, 0.25); 
}

.crypto-price.flash-up { color: #0ECB81; text-shadow: 0 0 16px rgba(14, 203, 129, 0.8); }
.crypto-price.flash-down { color: #F6465D; text-shadow: 0 0 16px rgba(246, 70, 93, 0.8); }
</style>
