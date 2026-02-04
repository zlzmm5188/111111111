<template>
  <div class="content-area">
    <!-- 大盘指数 -->
    <div class="index-row">
      <div class="index-card" :class="[idx.change >= 0 ? 'up' : 'down', idx.flash]" 
           v-for="idx in majorIndexes" :key="idx.code">
        <div class="idx-line idx-title-line">
          <span class="idx-name">{{ idx.name }}</span>
        </div>
        <div class="idx-line idx-price-line">
          <span class="idx-val" :class="idx.flash">{{ idx.price }}</span>
        </div>
        <div class="idx-line idx-change-line">
          <span class="idx-chg">{{ fmtPct(idx.change) }}</span>
        </div>
      </div>
    </div>
    
    <!-- 热门股票卡片 -->
    <div class="section-title">热门股票</div>
    <div class="stock-grid">
      <div class="stk-card" :class="item.flash" v-for="item in hotStocksCompact" :key="item.code" @click="$emit('openDetail', item)">
        <div class="stk-left">
          <img v-if="item.logo" :src="item.logo" class="stk-logo" @error="(e) => e.target.style.display='none'" loading="lazy">
          <div v-else class="stk-symbol" :style="{ background: item.color ? `linear-gradient(135deg, ${item.color}33, ${item.color}15)` : '' }">{{ item.code?.slice(-3) || item.name?.slice(0,2) }}</div>
        </div>
        <div class="stk-center">
          <div class="stk-name">{{ item.name }}</div>
          <div class="stk-price-row">
            <span class="stk-price">{{ item.price }}</span>
            <span class="stk-unit">{{ item.market === 'US' ? 'USD' : 'CNY' }}</span>
          </div>
        </div>
        <div class="stk-pct" :class="item.change >= 0 ? 'up' : 'down'">{{ fmtPct(item.change) }}</div>
      </div>
    </div>

    <!-- 涨幅榜 -->
    <div class="section-title">涨幅榜</div>
    <div class="rank-list">
      <div class="rank-item" :class="item.flash" v-for="(item, i) in hotStocks" :key="item.code" @click="$emit('openDetail', item)">
        <div class="rank-num" :class="i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''">{{ i + 1 }}</div>
        <div class="rank-info">
          <div class="rank-name">{{ item.name }}</div>
          <div class="rank-code">{{ item.code }}</div>
        </div>
        <div class="rank-data">
          <div class="rank-price">{{ item.price }}</div>
          <div class="rank-pct" :class="item.change >= 0 ? 'up' : 'down'">{{ fmtPct(item.change) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  majorIndexes: { type: Array, required: true },
  hotStocksCompact: { type: Array, required: true },
  hotStocks: { type: Array, required: true },
  fmtPct: { type: Function, required: true }
})
defineEmits(['openDetail'])
</script>

<style scoped>
.content-area { padding: 14px 14px 20px 14px; }

.section-title { 
  font-size: 17px; 
  font-weight: 800; 
  color: #E6EDF3; 
  margin: 24px 0 14px; 
  display: flex; 
  align-items: center; 
  gap: 10px;
  letter-spacing: -0.3px;
}

.section-title::before {
  content: '';
  width: 3px;
  height: 18px;
  background: linear-gradient(180deg, var(--color-brand, #C8AA6E), var(--color-gold, #C8AA6E));
  border-radius: 2px;
}

/* 大盘指数 - 高端卡片 */
.index-row { display: flex; gap: 10px; margin-bottom: 20px; }

.index-card { 
  flex: 1; 
  padding: 16px 14px; 
  border-radius: 18px; 
  background: linear-gradient(165deg, rgba(35, 42, 54, 0.95) 0%, rgba(25, 30, 38, 0.95) 100%); 
  backdrop-filter: blur(10px); 
  box-shadow: 0 6px 28px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06); 
  border: 1px solid rgba(255, 255, 255, 0.08); 
  display: flex; 
  flex-direction: column; 
  gap: 6px;
  transition: all 0.25s ease;
  -webkit-tap-highlight-color: transparent;
}

.index-card:active {
  transform: scale(0.98);
}

.index-card.flash-up { 
  border-color: rgba(14, 203, 129, 0.5); 
  box-shadow: 0 0 24px rgba(14, 203, 129, 0.35), inset 0 1px 0 rgba(14, 203, 129, 0.15); 
}

.index-card.flash-down { 
  border-color: rgba(246, 70, 93, 0.5); 
  box-shadow: 0 0 24px rgba(246, 70, 93, 0.35), inset 0 1px 0 rgba(246, 70, 93, 0.15); 
}

.idx-line { display: flex; width: 100%; }
.idx-title-line { margin-bottom: 4px; }
.idx-name { font-size: 12px; color: #8B949E; font-weight: 600; }
.idx-price-line { }

.idx-val { 
  font-size: 20px; 
  font-weight: 800; 
  color: #E6EDF3; 
  font-family: 'Inter', sans-serif; 
  font-variant-numeric: tabular-nums; 
  letter-spacing: -0.5px; 
  transition: color 0.2s, text-shadow 0.2s; 
}

.idx-val.flash-up { color: #0ECB81; text-shadow: 0 0 14px rgba(14, 203, 129, 0.8); }
.idx-val.flash-down { color: #F6465D; text-shadow: 0 0 14px rgba(246, 70, 93, 0.8); }
.idx-change-line { }

.idx-chg { 
  font-size: 14px; 
  font-weight: 700; 
  font-family: 'Inter', sans-serif; 
  font-variant-numeric: tabular-nums; 
}

.index-card.up .idx-chg { color: #0ECB81; }
.index-card.down .idx-chg { color: #F6465D; }

/* 股票卡片网格 */
.stock-grid { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 10px; 
  margin-bottom: 20px;
  overflow: hidden;
}

.stk-card { 
  display: flex; 
  align-items: center; 
  padding: 12px; 
  background: linear-gradient(165deg, rgba(38, 45, 56, 0.95) 0%, rgba(26, 32, 40, 0.95) 100%); 
  border: 1px solid rgba(255, 255, 255, 0.08); 
  border-radius: 14px; 
  cursor: pointer; 
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); 
  gap: 10px; 
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;
  min-width: 0;
}

.stk-card:active { 
  background: rgba(25, 30, 38, 0.95); 
  transform: scale(0.98);
  border-color: rgba(200, 170, 110, 0.3);
}

.stk-left { flex-shrink: 0; }

.stk-symbol { 
  width: 36px; 
  height: 36px; 
  border-radius: 8px; 
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.18), rgba(200, 170, 110, 0.08)); 
  border: 1px solid rgba(200, 170, 110, 0.25); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 10px; 
  font-weight: 800; 
  color: #C8AA6E;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.stk-logo { 
  width: 36px; 
  height: 36px; 
  border-radius: 8px; 
  object-fit: contain; 
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.stk-center { 
  flex: 1; 
  min-width: 0; 
  overflow: hidden; 
}

.stk-name { 
  font-size: 13px; 
  font-weight: 700; 
  color: #E6EDF3; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis;
  letter-spacing: -0.2px;
  max-width: 100%;
}

.stk-price-row { display: flex; align-items: baseline; gap: 2px; margin-top: 3px; }
.stk-price { font-size: 12px; font-weight: 600; color: #8B949E; font-family: 'Inter', sans-serif; }
.stk-unit { font-size: 9px; color: #6B7280; }

.stk-pct { 
  font-size: 11px; 
  font-weight: 700; 
  font-family: 'Inter', sans-serif; 
  flex-shrink: 0; 
  white-space: nowrap;
  padding: 3px 6px;
  border-radius: 5px;
  min-width: 52px;
  text-align: center;
}

.stk-pct.up { color: #0ECB81; background: rgba(14, 203, 129, 0.1); }
.stk-pct.down { color: #F6465D; background: rgba(246, 70, 93, 0.1); }

/* 涨幅榜 - 高级列表 */
.rank-list { 
  background: linear-gradient(165deg, rgba(35, 42, 54, 0.95) 0%, rgba(25, 30, 38, 0.95) 100%); 
  border-radius: 20px; 
  overflow: hidden; 
  border: 1px solid rgba(255, 255, 255, 0.08); 
  box-shadow: 0 6px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.rank-item { 
  display: flex; 
  align-items: center; 
  padding: 16px 18px; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.06); 
  cursor: pointer; 
  gap: 14px; 
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.rank-item:last-child { border-bottom: none; }
.rank-item:active { background: linear-gradient(90deg, rgba(200, 170, 110, 0.08), transparent); }

.rank-num { 
  width: 28px; 
  height: 28px; 
  border-radius: 8px; 
  background: rgba(255, 255, 255, 0.08); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 13px; 
  font-weight: 800; 
  color: #8B949E; 
  flex-shrink: 0; 
}

.rank-num.gold { 
  background: linear-gradient(145deg, var(--color-rank-gold, #FFD700), var(--color-brand-yellow, #C8AA6E)); 
  color: #000; 
  box-shadow: 0 3px 12px rgba(255, 215, 0, 0.45); 
}

.rank-num.silver { 
  background: linear-gradient(145deg, var(--color-rank-silver, #E8E8E8), var(--color-rank-silver-dark, #B8B8B8)); 
  color: #333; 
  box-shadow: 0 3px 12px rgba(192, 192, 192, 0.35); 
}

.rank-num.bronze { 
  background: linear-gradient(145deg, var(--color-rank-bronze, #CD7F32), var(--color-rank-bronze-dark, #8B5A2B)); 
  color: #fff; 
  box-shadow: 0 3px 12px rgba(205, 127, 50, 0.35); 
}

.rank-info { flex: 1; min-width: 0; }
.rank-name { font-size: 16px; font-weight: 700; color: #E6EDF3; letter-spacing: -0.2px; }
.rank-code { font-size: 12px; color: #6B7280; margin-top: 3px; font-weight: 500; }

.rank-data { text-align: right; flex-shrink: 0; }

.rank-price { 
  font-size: 16px; 
  font-weight: 700; 
  color: #E6EDF3; 
  font-family: 'Inter', sans-serif; 
  font-variant-numeric: tabular-nums; 
}

.rank-pct { 
  font-size: 14px; 
  font-weight: 700; 
  margin-top: 3px; 
  font-family: 'Inter', sans-serif; 
  font-variant-numeric: tabular-nums; 
}

.rank-pct.up { color: #0ECB81; }
.rank-pct.down { color: #F6465D; }
</style>
