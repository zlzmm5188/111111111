<template>
  <div class="content-area">
    <!-- 货币指数 -->
    <div class="forex-index-row">
      <div class="fix-card" v-for="idx in forexIndexList" :key="idx.code">
        <div class="fix-left">
          <div class="fix-name">{{ idx.name }}</div>
          <div class="fix-code"><img :src="idx.flag" class="fix-flag" :alt="idx.code">{{ idx.code }}</div>
        </div>
        <div class="fix-right">
          <div class="fix-val">{{ idx.value }}</div>
          <div class="fix-chg" :class="idx.change >= 0 ? 'up' : 'down'">{{ fmtPct(idx.change) }}</div>
        </div>
      </div>
    </div>

    <!-- 货币对矩阵热力图 -->
    <div class="forex-matrix">
      <div class="fm-header">
        <div class="fm-corner"></div>
        <div class="fm-col-head" v-for="col in forexMatrixCols" :key="col.code">
          <img :src="col.flag" class="fm-flag" :title="col.code">
        </div>
      </div>
      <div class="fm-row" v-for="row in forexMatrixRows" :key="row.code">
        <div class="fm-row-head">
          <img :src="row.flag" class="fm-flag" :title="row.code">
        </div>
        <div class="fm-cell" v-for="col in forexMatrixCols" :key="col.code" 
             :class="getMatrixCellClass(row.code, col.code)"
             @click="$emit('openPair', row.code, col.code)">
          <span v-if="row.code !== col.code">{{ getMatrixValue(row.code, col.code) }}</span>
        </div>
      </div>
    </div>

    <!-- 兑换数据列表 -->
    <div class="forex-pair-list">
      <div class="fpl-item" v-for="item in forexPairList" :key="item.symbol" @click="$emit('openDetail', item)" :class="item.flash">
        <div class="fpl-left">
          <img :src="item.flag" class="fpl-flag">
          <div class="fpl-info">
            <div class="fpl-name">{{ item.name }}</div>
            <div class="fpl-code">{{ item.code }}</div>
          </div>
        </div>
        <div class="fpl-right">
          <span class="fpl-price" :class="item.flash">{{ item.price }}</span>
          <span class="fpl-chg" :class="[item.change >= 0 ? 'up' : 'down', item.flash]">{{ fmtPct(item.change) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  forexPairList: { type: Array, required: true },
  forexIndexList: { type: Array, required: true },
  forexMatrixCols: { type: Array, required: true },
  forexMatrixRows: { type: Array, required: true },
  getMatrixValue: { type: Function, required: true },
  getMatrixCellClass: { type: Function, required: true },
  fmtPct: { type: Function, required: true }
})
defineEmits(['openDetail', 'openPair'])
</script>

<style scoped>
.content-area { padding: 16px; }

/* 货币指数卡片 */
.forex-index-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 18px; }

.fix-card { 
  flex: 1; 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding: 14px 16px; 
  background: linear-gradient(165deg, rgba(35, 42, 54, 0.95) 0%, rgba(25, 30, 38, 0.95) 100%); 
  border: 1px solid rgba(255, 255, 255, 0.08); 
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  transition: all 0.25s ease;
  -webkit-tap-highlight-color: transparent;
}

.fix-card:active {
  transform: scale(0.98);
  border-color: rgba(200, 170, 110, 0.3);
}

.fix-name { font-size: 14px; font-weight: 700; color: #E6EDF3; margin-bottom: 5px; letter-spacing: -0.2px; }
.fix-code { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: #8B949E; }
.fix-flag { width: 18px; height: 13px; object-fit: cover; border-radius: 2px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); }
.fix-right { text-align: right; }
.fix-val { font-size: 17px; font-weight: 800; color: #E6EDF3; font-family: 'Inter', sans-serif; letter-spacing: -0.5px; }
.fix-chg { font-size: 13px; font-weight: 700; margin-top: 3px; }
.fix-chg.up { color: #0ECB81; }
.fix-chg.down { color: #F6465D; }

/* 外汇矩阵热力图 */
.forex-matrix { 
  background: linear-gradient(165deg, rgba(35, 42, 54, 0.95) 0%, rgba(25, 30, 38, 0.95) 100%); 
  border-radius: 18px; 
  border: 1px solid rgba(255, 255, 255, 0.08); 
  padding: 12px 10px; 
  overflow-x: auto; 
  margin-bottom: 18px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.fm-header { display: flex; }
.fm-corner { width: 50px; flex-shrink: 0; }

.fm-col-head { 
  flex: 1; 
  min-width: 56px; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  padding: 10px 2px; 
}

.fm-col-head img { 
  width: 34px; 
  height: 24px; 
  border-radius: 4px; 
  object-fit: cover;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.fm-row { display: flex; border-top: 1px solid rgba(255, 255, 255, 0.06); }

.fm-row-head { 
  width: 50px; 
  flex-shrink: 0; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 10px 4px; 
}

.fm-row-head img { 
  width: 34px; 
  height: 24px; 
  border-radius: 4px; 
  object-fit: cover;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.fm-flag { width: 34px; height: 24px; border-radius: 4px; object-fit: cover; }

.fm-cell { 
  flex: 1; 
  min-width: 56px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 14px 2px; 
  font-size: 12px; 
  font-weight: 700; 
  cursor: pointer; 
  transition: all 0.2s; 
  border-left: 1px solid rgba(255, 255, 255, 0.04);
  -webkit-tap-highlight-color: transparent;
}

.fm-cell:active { transform: scale(0.95); }
.fm-cell-empty { background: transparent; cursor: default; }
.fm-cell-up-1 { background: rgba(14, 203, 129, 0.15); color: #0ECB81; }
.fm-cell-up-2 { background: rgba(14, 203, 129, 0.35); color: #fff; }
.fm-cell-up-3 { background: linear-gradient(145deg, #0ECB81, #0AAF6E); color: #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,0.2); }
.fm-cell-down-1 { background: rgba(246, 70, 93, 0.15); color: #F6465D; }
.fm-cell-down-2 { background: rgba(246, 70, 93, 0.35); color: #fff; }
.fm-cell-down-3 { background: linear-gradient(145deg, #F6465D, #D4394E); color: #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,0.2); }

/* 兑换数据列表 */
.forex-pair-list { 
  background: linear-gradient(165deg, rgba(35, 42, 54, 0.95) 0%, rgba(25, 30, 38, 0.95) 100%); 
  border-radius: 18px; 
  border: 1px solid rgba(255, 255, 255, 0.08); 
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.fpl-item { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding: 14px 18px; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.06); 
  cursor: pointer; 
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.fpl-item:last-child { border-bottom: none; }
.fpl-item:active { background: linear-gradient(90deg, rgba(200, 170, 110, 0.08), transparent); }

.fpl-left { display: flex; align-items: center; gap: 14px; }

.fpl-flag { 
  width: 36px; 
  height: 26px; 
  border-radius: 5px; 
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.fpl-info { display: flex; flex-direction: column; gap: 3px; }
.fpl-name { font-size: 16px; font-weight: 700; color: #E6EDF3; letter-spacing: -0.2px; }
.fpl-code { font-size: 12px; color: #6B7280; font-weight: 500; }

.fpl-right { display: flex; align-items: center; gap: 14px; }

.fpl-price { 
  font-size: 17px; 
  font-weight: 800; 
  color: #E6EDF3; 
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.5px;
}

.fpl-chg { 
  font-size: 13px; 
  font-weight: 700; 
  padding: 5px 12px; 
  border-radius: 8px; 
  min-width: 68px; 
  text-align: center; 
}

.fpl-chg.up { color: #0ECB81; background: rgba(14, 203, 129, 0.12); border: 1px solid rgba(14, 203, 129, 0.2); }
.fpl-chg.down { color: #F6465D; background: rgba(246, 70, 93, 0.12); border: 1px solid rgba(246, 70, 93, 0.2); }

/* 闪烁效果 */
.fpl-item.flash-up { background: linear-gradient(90deg, rgba(14, 203, 129, 0.12), transparent); border-left: 3px solid var(--color-up, #0ECB81); }
.fpl-item.flash-down { background: linear-gradient(90deg, rgba(246, 70, 93, 0.12), transparent); border-left: 3px solid var(--color-down, #F6465D); }
.fpl-price.flash-up { color: #0ECB81; text-shadow: 0 0 14px rgba(14, 203, 129, 0.8); }
.fpl-price.flash-down { color: #F6465D; text-shadow: 0 0 14px rgba(246, 70, 93, 0.8); }
</style>
