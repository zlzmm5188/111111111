<template>
  <div class="markets-page">
    <!-- 顶部滚动条 -->
    <TickerBar :tickerList="tickerList" :fmtPct="fmtPct" />

    <div class="page-body">
      <!-- 固定Tab栏 -->
      <div class="tabs-bar">
        <button v-for="cat in categories" :key="cat.key" :class="{ active: activeCategory === cat.key }" @click="activeCategory = cat.key">
          <span class="tab-name">{{ cat.name }}</span>
        </button>
      </div>

      <!-- 股票 -->
      <StockSection 
        v-if="activeCategory === 'stock'"
        :majorIndexes="majorIndexes"
        :hotStocksCompact="hotStocksCompact"
        :hotStocks="hotStocks"
        :fmtPct="fmtPct"
        @openDetail="openStockDetail"
      />

      <!-- 期货 -->
      <FuturesSection 
        v-if="activeCategory === 'futures'"
        :futuresTab="futuresTab"
        :currentFutures="currentFutures"
        :fmtPct="fmtPct"
        @update:futuresTab="futuresTab = $event"
        @openDetail="openFuturesDetail"
      />

      <!-- 外汇 -->
      <ForexSection 
        v-if="activeCategory === 'forex'"
        :forexPairList="forexPairList"
        :forexIndexList="forexIndexList"
        :forexMatrixCols="forexMatrixCols"
        :forexMatrixRows="forexMatrixRows"
        :getMatrixValue="getMatrixValue"
        :getMatrixCellClass="getMatrixCellClass"
        :fmtPct="fmtPct"
        @openDetail="openForexDetail"
        @openPair="openForexPair"
      />

      <!-- 债券 -->
      <BondSection 
        v-if="activeCategory === 'bond'"
        :bondList="bondList"
        @openDetail="openBondDetail"
      />

      <!-- 币圈 -->
      <CryptoSection 
        v-if="activeCategory === 'crypto'"
        :cryptoList="cryptoList"
        :fmtPct="fmtPct"
        @openDetail="openCryptoDetail"
      />

      <div class="bottom-space"></div>
    </div>

    <!-- 股票详情弹窗 -->
    <transition name="modal">
      <div class="modal-mask" v-if="showStockDetail" @click="showStockDetail = false">
        <div class="stock-sheet" @click.stop>
          <div class="sheet-bar"></div>
          <div class="sheet-close" @click="showStockDetail = false">×</div>
          <div class="stock-head-card">
            <div class="shc-top">
              <div class="shc-left">
                <div class="shc-logo-fallback" :style="{background: stockDetail.color || '#C8AA6E'}">{{ stockDetail.name?.charAt(0) }}</div>
                <div class="shc-info">
                  <h3>{{ stockDetail.name }}</h3>
                  <div class="shc-tags">
                    <span class="shc-tag">{{ stockDetail.code }}</span>
                    <span class="shc-tag">沪深A股</span>
                  </div>
                </div>
              </div>
              <div class="shc-status" :class="stockDetail.change >= 0 ? 'up' : 'down'">
                <span class="status-dot"></span>
                交易中
              </div>
            </div>
            <div class="shc-price-area">
              <div class="shc-main-price">
                <span class="shc-currency">¥</span>
                <span class="shc-price" :class="stockDetail.change >= 0 ? 'up' : 'down'">{{ stockDetail.price }}</span>
                <span class="shc-arrow" :class="stockDetail.change >= 0 ? 'up' : 'down'">{{ stockDetail.change >= 0 ? '▲' : '▼' }}</span>
              </div>
              <div class="shc-sub-info">
                <div class="shc-change-item" :class="stockDetail.change >= 0 ? 'up' : 'down'">
                  <span class="label">涨跌幅</span>
                  <span class="value">{{ fmtPct(stockDetail.change) }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 迷你K线图 -->
          <div class="stock-chart-section">
            <div class="chart-header">
              <span class="chart-title">分时走势</span>
              <div class="chart-tabs">
                <span class="chart-tab">分时</span>
                <span class="chart-tab active">日K</span>
                <span class="chart-tab">周K</span>
              </div>
            </div>
            <svg class="stock-mini-chart" :viewBox="'0 0 100 60'" preserveAspectRatio="none">
              <defs>
                <linearGradient :id="'stockGrad-' + stockDetail.code" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" :style="{stopColor: stockDetail.change >= 0 ? '#0ECB81' : '#F6465D', stopOpacity: 0.3}"/>
                  <stop offset="100%" :style="{stopColor: stockDetail.change >= 0 ? '#0ECB81' : '#F6465D', stopOpacity: 0}"/>
                </linearGradient>
              </defs>
              <path :d="stockChartPath + ' L100,60 L0,60 Z'" :fill="'url(#stockGrad-' + stockDetail.code + ')'"/>
              <path :d="stockChartPath" fill="none" :stroke="stockDetail.change >= 0 ? '#0ECB81' : '#F6465D'" stroke-width="1.5"/>
            </svg>
          </div>
          <div class="section-title">行情数据</div>
          <div class="stock-data-grid">
            <div class="sdg-item"><span class="sdg-label">今开</span><span class="sdg-value">{{ stockDetail.open }}</span></div>
            <div class="sdg-item"><span class="sdg-label">昨收</span><span class="sdg-value">{{ stockDetail.preClose }}</span></div>
            <div class="sdg-item"><span class="sdg-label">最高</span><span class="sdg-value up">{{ stockDetail.high }}</span></div>
            <div class="sdg-item"><span class="sdg-label">最低</span><span class="sdg-value down">{{ stockDetail.low }}</span></div>
            <div class="sdg-item"><span class="sdg-label">成交量</span><span class="sdg-value">{{ stockDetail.volume }}</span></div>
            <div class="sdg-item"><span class="sdg-label">成交额</span><span class="sdg-value">{{ stockDetail.amount }}</span></div>
            <div class="sdg-item"><span class="sdg-label">换手率</span><span class="sdg-value">{{ stockDetail.turnover }}</span></div>
            <div class="sdg-item"><span class="sdg-label">振幅</span><span class="sdg-value">{{ stockDetail.amplitude }}</span></div>
          </div>
          <div class="section-title">估值数据</div>
          <div class="stock-data-grid">
            <div class="sdg-item"><span class="sdg-label">市盈率</span><span class="sdg-value">{{ stockDetail.pe }}</span></div>
            <div class="sdg-item"><span class="sdg-label">市净率</span><span class="sdg-value">{{ stockDetail.pb }}</span></div>
            <div class="sdg-item"><span class="sdg-label">总市值</span><span class="sdg-value">{{ stockDetail.marketCap }}</span></div>
            <div class="sdg-item"><span class="sdg-label">流通市值</span><span class="sdg-value">{{ stockDetail.floatCap }}</span></div>
            <div class="sdg-item"><span class="sdg-label">每股收益</span><span class="sdg-value">{{ stockDetail.eps }}</span></div>
            <div class="sdg-item"><span class="sdg-label">股息率</span><span class="sdg-value">{{ stockDetail.dividend }}</span></div>
            <div class="sdg-item"><span class="sdg-label">52周最高</span><span class="sdg-value up">{{ stockDetail.week52High }}</span></div>
            <div class="sdg-item"><span class="sdg-label">52周最低</span><span class="sdg-value down">{{ stockDetail.week52Low }}</span></div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
defineOptions({ name: 'Markets' })

import { ref, computed, watch, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketData } from './composables/useMarketData'
import TickerBar from './components/TickerBar.vue'
import StockSection from './components/StockSection.vue'
import FuturesSection from './components/FuturesSection.vue'
import ForexSection from './components/ForexSection.vue'
import BondSection from './components/BondSection.vue'
import CryptoSection from './components/CryptoSection.vue'

const router = useRouter()

const {
  activeCategory, futuresTab, tickerList,
  majorIndexes, hotStocks, hotStocksCompact,
  currentFutures, forexPairList, forexIndexList,
  forexMatrixCols, forexMatrixRows,
  bondList, cryptoList,
  fmtPct, loadMarketData, loadFuturesData,
  getMatrixValue, getMatrixCellClass, forexPairData
} = useMarketData()

const categories = [
  { key: 'stock', name: '股票' },
  { key: 'futures', name: '期货' },
  { key: 'forex', name: '外汇' },
  { key: 'bond', name: '债券' },
  { key: 'crypto', name: '虚拟币' },
]

// 股票详情弹窗
const showStockDetail = ref(false)
const stockDetail = ref({})

// 股票迷你图表路径
const stockChartPath = computed(() => {
  const isUp = (stockDetail.value.change || 0) >= 0
  const points = []
  const baseY = 30
  for (let i = 0; i <= 20; i++) {
    const x = (i / 20) * 100
    const trend = isUp ? -i * 0.8 : i * 0.8
    const noise = Math.sin(i * 1.2) * 8 + Math.sin(i * 0.3) * 5
    const y = baseY + trend + noise
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${Math.max(5, Math.min(55, y)).toFixed(1)}`)
  }
  return points.join(' ')
})

const openStockDetail = (item) => {
  const basePrice = parseFloat(String(item.price).replace(/,/g, '')) || 180
  const preClose = basePrice / (1 + item.change / 100)
  stockDetail.value = {
    ...item,
    open: (basePrice * (1 - item.change/100 + Math.random()*0.02)).toFixed(2),
    preClose: preClose.toFixed(2),
    high: (basePrice * (1 + Math.random()*0.03)).toFixed(2),
    low: (basePrice * (1 - Math.random()*0.03)).toFixed(2),
    volume: (Math.random() * 500 + 50).toFixed(0) + '万',
    amount: (Math.random() * 50 + 5).toFixed(2) + '亿',
    turnover: (Math.random() * 3 + 0.5).toFixed(2) + '%',
    amplitude: (Math.random() * 5 + 1).toFixed(2) + '%',
    pe: (Math.random() * 40 + 10).toFixed(2),
    pb: (Math.random() * 5 + 1).toFixed(2),
    marketCap: (Math.random() * 5000 + 500).toFixed(0) + '亿',
    floatCap: (Math.random() * 4000 + 400).toFixed(0) + '亿',
    eps: (Math.random() * 3 + 0.5).toFixed(2),
    dividend: (Math.random() * 3 + 0.5).toFixed(2) + '%',
    week52High: (basePrice * (1.2 + Math.random() * 0.3)).toFixed(2),
    week52Low: (basePrice * (0.6 + Math.random() * 0.2)).toFixed(2),
  }
  showStockDetail.value = true
}

// 期货详情 - DOM创建
const openFuturesDetail = (item) => {
  const basePrice = parseFloat(String(item.price).replace(/,/g, '')) || 1000
  const preClose = basePrice / (1 + item.change / 100)
  const changeAmount = (basePrice - preClose).toFixed(2)
  const isUp = item.change >= 0
  const exchange = {'IF':'中金所','IH':'中金所','IC':'中金所','IM':'中金所','AU':'上期所','AG':'上期所','CU':'上期所','AL':'上期所','SC':'上期能源','FU':'上期能源','M':'大商所','C':'大商所','SR':'郑商所','CF':'郑商所'}[item.symbol?.match(/^[A-Z]+/)?.[0]] || '上期所'
  const deliveryDate = (() => { const m = item.symbol?.match(/\d{4}$/); return m ? `20${m[0].slice(0,2)}-${m[0].slice(2)}-15` : '2025-03-15' })()
  const volume = (Math.random() * 5 + 0.5).toFixed(1) + '万'
  const openInterest = (Math.random() * 50 + 10).toFixed(1) + '万'
  
  // 生成迷你图表路径
  const chartPath = (() => {
    const points = []
    for (let i = 0; i <= 20; i++) {
      const x = (i / 20) * 100
      const trend = isUp ? -i * 1.5 : i * 1.5
      const noise = Math.sin(i * 1.5) * 10 + Math.sin(i * 0.4) * 6
      const y = 40 + trend + noise
      points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${Math.max(8, Math.min(72, y)).toFixed(1)}`)
    }
    return points.join(' ')
  })()
  const chartColor = isUp ? '#0ECB81' : '#F6465D'
  
  const modal = document.createElement('div')
  modal.id = 'futures-detail-modal'
  modal.innerHTML = `
    <style>
      #futures-detail-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: flex-end; justify-content: center; z-index: 999999; }
      .fut-sheet { width: 100%; max-width: 428px; max-height: 85vh; overflow-y: auto; background: linear-gradient(180deg, #1E2530 0%, #151A23 100%); border-radius: 20px 20px 0 0; padding: 16px 16px calc(20px + env(safe-area-inset-bottom, 0px)); }
      .fut-bar { width: 40px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin: 0 auto 12px; }
      .fut-close { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #6B7280; cursor: pointer; }
      .fut-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; position: relative; }
      .fut-left { display: flex; align-items: center; gap: 12px; }
      .fut-badge { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: #fff; background: ${item.color || '#5F9EA0'}; }
      .fut-name { font-size: 18px; font-weight: 700; color: #E6EDF3; }
      .fut-tags { font-size: 12px; color: #6B7280; margin-top: 4px; }
      .fut-right { text-align: right; }
      .fut-price { font-size: 26px; font-weight: 800; color: ${isUp ? '#0ECB81' : '#F6465D'}; }
      .fut-chg { font-size: 13px; color: ${isUp ? '#0ECB81' : '#F6465D'}; margin-top: 2px; }
      .fut-chart { background: rgba(30,38,50,0.5); border-radius: 12px; padding: 10px; margin-bottom: 12px; }
      .fut-chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
      .fut-chart-title { font-size: 11px; color: #6B7280; }
      .fut-chart-svg { width: 100%; height: 60px; }
      .fut-section-title { font-size: 12px; font-weight: 600; color: #8B949E; margin: 12px 0 8px; }
      .fut-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
      .fut-item { background: rgba(30,38,50,0.7); border-radius: 10px; padding: 10px 6px; text-align: center; }
      .fut-label { display: block; font-size: 11px; color: #6B7280; margin-bottom: 4px; }
      .fut-val { font-size: 13px; font-weight: 700; color: #E6EDF3; }
      .fut-val.up { color: #0ECB81; }
      .fut-val.down { color: #F6465D; }
    </style>
    <div class="fut-sheet" onclick="event.stopPropagation()">
      <div class="fut-bar"></div>
      <div class="fut-header">
        <div class="fut-left">
          <div class="fut-badge">${item.name?.charAt(0) || 'F'}</div>
          <div>
            <div class="fut-name">${item.name}</div>
            <div class="fut-tags">${item.symbol} · ${exchange}</div>
          </div>
        </div>
        <div class="fut-right">
          <div class="fut-price">${item.price}</div>
          <div class="fut-chg">${isUp ? '+' : ''}${item.change.toFixed(2)}% / ${isUp ? '+' : ''}${changeAmount}</div>
        </div>
      </div>
      <div class="fut-chart">
        <div class="fut-chart-header"><span class="fut-chart-title">日内走势</span></div>
        <svg class="fut-chart-svg" viewBox="0 0 100 80" preserveAspectRatio="none">
          <defs><linearGradient id="futGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:${chartColor};stop-opacity:0.25"/><stop offset="100%" style="stop-color:${chartColor};stop-opacity:0"/></linearGradient></defs>
          <path d="${chartPath} L100,80 L0,80 Z" fill="url(#futGrad)"/>
          <path d="${chartPath}" fill="none" stroke="${chartColor}" stroke-width="1.5"/>
        </svg>
      </div>
      <div class="fut-section-title">行情数据</div>
      <div class="fut-grid">
        <div class="fut-item"><span class="fut-label">今开</span><span class="fut-val">${item.open || item.price}</span></div>
        <div class="fut-item"><span class="fut-label">昨收</span><span class="fut-val">${preClose.toFixed(2)}</span></div>
        <div class="fut-item"><span class="fut-label">最高</span><span class="fut-val up">${item.high || (basePrice * 1.02).toFixed(2)}</span></div>
        <div class="fut-item"><span class="fut-label">最低</span><span class="fut-val down">${item.low || (basePrice * 0.98).toFixed(2)}</span></div>
        <div class="fut-item"><span class="fut-label">成交量</span><span class="fut-val">${volume}</span></div>
        <div class="fut-item"><span class="fut-label">持仓量</span><span class="fut-val">${openInterest}</span></div>
        <div class="fut-item"><span class="fut-label">涨停</span><span class="fut-val up">${(basePrice * 1.1).toFixed(2)}</span></div>
        <div class="fut-item"><span class="fut-label">跌停</span><span class="fut-val down">${(basePrice * 0.9).toFixed(2)}</span></div>
      </div>
      <div class="fut-section-title">合约信息</div>
      <div class="fut-grid">
        <div class="fut-item"><span class="fut-label">结算价</span><span class="fut-val">${item.price}</span></div>
        <div class="fut-item"><span class="fut-label">交割日</span><span class="fut-val">${deliveryDate}</span></div>
        <div class="fut-item"><span class="fut-label">交易所</span><span class="fut-val">${exchange}</span></div>
        <div class="fut-item"><span class="fut-label">交易单位</span><span class="fut-val">手</span></div>
      </div>
    </div>
  `
  modal.onclick = () => modal.remove()
  document.body.appendChild(modal)
}

// 外汇详情 - DOM创建
const openForexDetail = (item) => {
  const price = parseFloat(item.price || '1.0000')
  const change = item.change || 0
  const isUp = change >= 0
  const prevClose = (price / (1 + change / 100)).toFixed(5)
  const dayHigh = (price * (1 + Math.random() * 0.005)).toFixed(5)
  const dayLow = (price * (1 - Math.random() * 0.005)).toFixed(5)
  const spread = (Math.random() * 2 + 0.5).toFixed(1)
  const volume24h = (Math.random() * 50 + 10).toFixed(1) + 'B'
  
  const modal = document.createElement('div')
  modal.id = 'forex-detail-modal'
  modal.innerHTML = `
    <style>
      #forex-detail-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: flex-end; justify-content: center; z-index: 999999; }
      .fx-sheet { width: 100%; max-width: 428px; max-height: 85vh; overflow-y: auto; background: linear-gradient(180deg, #1a2035 0%, #0f1520 100%); border-radius: 24px 24px 0 0; padding: 16px 16px calc(20px + env(safe-area-inset-bottom, 0px)); }
      .fx-bar { width: 40px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin: 0 auto 12px; }
      .fx-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .fx-name { font-size: 22px; font-weight: 800; color: #fff; }
      .fx-sub { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 4px; }
      .fx-price { font-size: 28px; font-weight: 800; color: ${isUp ? '#0ECB81' : '#F6465D'}; }
      .fx-chg { font-size: 14px; font-weight: 600; color: ${isUp ? '#0ECB81' : '#F6465D'}; margin-top: 4px; }
      .fx-section-title { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin: 16px 0 8px; }
      .fx-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
      .fx-item { background: rgba(30,40,55,0.6); border-radius: 10px; padding: 10px 6px; text-align: center; }
      .fx-label { display: block; font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 4px; }
      .fx-val { font-size: 13px; font-weight: 700; color: #fff; }
      .fx-val.up { color: #0ECB81; }
      .fx-val.down { color: #F6465D; }
    </style>
    <div class="fx-sheet" onclick="event.stopPropagation()">
      <div class="fx-bar"></div>
      <div class="fx-header">
        <div>
          <div class="fx-name">${item.name}</div>
          <div class="fx-sub">外汇</div>
        </div>
        <div style="text-align:right;">
          <div class="fx-price">${price.toFixed(5)}</div>
          <div class="fx-chg">${isUp ? '+' : ''}${change.toFixed(2)}%</div>
        </div>
      </div>
      <div class="fx-section-title">行情数据</div>
      <div class="fx-grid">
        <div class="fx-item"><div class="fx-label">今开</div><div class="fx-val">${prevClose}</div></div>
        <div class="fx-item"><div class="fx-label">昨收</div><div class="fx-val">${prevClose}</div></div>
        <div class="fx-item"><div class="fx-label">最高</div><div class="fx-val up">${dayHigh}</div></div>
        <div class="fx-item"><div class="fx-label">最低</div><div class="fx-val down">${dayLow}</div></div>
        <div class="fx-item"><div class="fx-label">点差</div><div class="fx-val">${spread} pips</div></div>
        <div class="fx-item"><div class="fx-label">24H量</div><div class="fx-val">${volume24h}</div></div>
        <div class="fx-item"><div class="fx-label">周涨跌</div><div class="fx-val ${change >= 0 ? 'up' : 'down'}">${(change * 1.2).toFixed(2)}%</div></div>
        <div class="fx-item"><div class="fx-label">月涨跌</div><div class="fx-val ${change >= 0 ? 'up' : 'down'}">${(change * 3.5).toFixed(2)}%</div></div>
      </div>
      <div class="fx-section-title">52周区间</div>
      <div class="fx-grid">
        <div class="fx-item"><div class="fx-label">52周最高</div><div class="fx-val up">${(price * 1.08).toFixed(5)}</div></div>
        <div class="fx-item"><div class="fx-label">52周最低</div><div class="fx-val down">${(price * 0.92).toFixed(5)}</div></div>
        <div class="fx-item"><div class="fx-label">年涨跌</div><div class="fx-val ${change >= 0 ? 'up' : 'down'}">${(change * 8).toFixed(2)}%</div></div>
        <div class="fx-item"><div class="fx-label">波动率</div><div class="fx-val">${(Math.random() * 5 + 8).toFixed(1)}%</div></div>
      </div>
    </div>
  `
  modal.onclick = () => modal.remove()
  document.body.appendChild(modal)
}

const openForexPair = (row, col) => {
  if (row === col) return
  const pair = `${row}/${col}`
  const change = forexPairData.value[pair] || 0
  openForexDetail({ symbol: pair, name: pair, price: '1.0000', change })
}

// 债券详情 - DOM创建
const openBondDetail = (item) => {
  const isUp = (item.change10y || 0) >= 0
  const y10 = parseFloat(item.y10) || 0
  const y2 = parseFloat(item.y2) || 0
  const y30 = parseFloat(item.y30) || 0
  const m3 = parseFloat(item.m3) || 0
  
  const modal = document.createElement('div')
  modal.id = 'bond-detail-modal'
  modal.innerHTML = `
    <style>
      #bond-detail-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); display: flex; align-items: flex-end; justify-content: center; z-index: 999999; }
      .bd-sheet { width: 100%; max-width: 420px; max-height: 85vh; overflow-y: auto; background: linear-gradient(180deg, #1e2235 0%, #151822 100%); border-radius: 20px 20px 0 0; padding: 16px 16px calc(20px + env(safe-area-inset-bottom, 0px)); }
      .bd-bar { width: 40px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin: 0 auto 12px; }
      .bd-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
      .bd-left { display: flex; align-items: center; gap: 10px; }
      .bd-flag { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.12); }
      .bd-country { font-size: 18px; font-weight: 700; color: #fff; }
      .bd-rating { font-size: 11px; padding: 2px 8px; border-radius: 10px; background: rgba(255,215,0,0.15); color: #FFD700; font-weight: 600; margin-left: 8px; }
      .bd-right { text-align: right; }
      .bd-yield { font-size: 28px; font-weight: 700; color: #fff; }
      .bd-change { font-size: 13px; font-weight: 600; padding: 4px 10px; border-radius: 6px; background: ${isUp ? 'rgba(14,203,129,0.12)' : 'rgba(246,70,93,0.12)'}; color: ${isUp ? '#0ECB81' : '#F6465D'}; }
      .bd-section-title { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin: 16px 0 8px; }
      .bd-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
      .bd-item { background: rgba(255,255,255,0.04); border-radius: 8px; padding: 10px 6px; text-align: center; }
      .bd-label { display: block; font-size: 10px; color: rgba(255,255,255,0.4); margin-bottom: 3px; }
      .bd-val { font-size: 13px; font-weight: 700; color: #fff; }
      .bd-val.up { color: #0ECB81; }
      .bd-val.down { color: #F6465D; }
      .bd-yields-row { display: flex; gap: 8px; }
      .bd-yield-card { flex: 1; background: rgba(255,255,255,0.04); border-radius: 8px; padding: 10px 6px; text-align: center; }
      .bd-yield-term { font-size: 10px; color: rgba(255,255,255,0.4); margin-bottom: 3px; }
      .bd-yield-val { font-size: 14px; font-weight: 700; color: #fff; }
    </style>
    <div class="bd-sheet" onclick="event.stopPropagation()">
      <div class="bd-bar"></div>
      <div class="bd-header">
        <div class="bd-left">
          <img class="bd-flag" src="${item.flag}" alt="${item.country}">
          <span class="bd-country">${item.country}国债</span>
          <span class="bd-rating">${item.rating || 'AA'}</span>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div>
          <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:4px;">10年期收益率</div>
          <div class="bd-yield">${item.y10}%</div>
        </div>
        <div class="bd-change">${isUp ? '+' : ''}${item.change10y} bp</div>
      </div>
      <div class="bd-section-title">收益率曲线</div>
      <div class="bd-yields-row">
        <div class="bd-yield-card"><div class="bd-yield-term">3M</div><div class="bd-yield-val">${item.m3}%</div></div>
        <div class="bd-yield-card"><div class="bd-yield-term">1Y</div><div class="bd-yield-val">${item.y1}%</div></div>
        <div class="bd-yield-card"><div class="bd-yield-term">2Y</div><div class="bd-yield-val">${item.y2}%</div></div>
        <div class="bd-yield-card"><div class="bd-yield-term">5Y</div><div class="bd-yield-val">${item.y5}%</div></div>
        <div class="bd-yield-card"><div class="bd-yield-term">10Y</div><div class="bd-yield-val">${item.y10}%</div></div>
        <div class="bd-yield-card"><div class="bd-yield-term">30Y</div><div class="bd-yield-val">${item.y30}%</div></div>
      </div>
      <div class="bd-section-title">期限利差</div>
      <div class="bd-grid">
        <div class="bd-item"><div class="bd-label">2Y-10Y</div><div class="bd-val ${(y10 - y2) >= 0 ? 'up' : 'down'}">${(y10 - y2).toFixed(2)}%</div></div>
        <div class="bd-item"><div class="bd-label">3M-10Y</div><div class="bd-val ${(y10 - m3) >= 0 ? 'up' : 'down'}">${(y10 - m3).toFixed(2)}%</div></div>
        <div class="bd-item"><div class="bd-label">10Y-30Y</div><div class="bd-val ${(y30 - y10) >= 0 ? 'up' : 'down'}">${(y30 - y10).toFixed(2)}%</div></div>
        <div class="bd-item"><div class="bd-label">曲线斜率</div><div class="bd-val">${((y30 - m3) / 7).toFixed(2)}</div></div>
      </div>
      <div class="bd-section-title">债券指标</div>
      <div class="bd-grid">
        <div class="bd-item"><div class="bd-label">久期</div><div class="bd-val">8.5年</div></div>
        <div class="bd-item"><div class="bd-label">凸性</div><div class="bd-val">0.85</div></div>
        <div class="bd-item"><div class="bd-label">实际收益</div><div class="bd-val">${(y10 - 2.5).toFixed(2)}%</div></div>
        <div class="bd-item"><div class="bd-label">通胀预期</div><div class="bd-val">2.50%</div></div>
      </div>
      <div class="bd-section-title">市场信息</div>
      <div class="bd-grid">
        <div class="bd-item"><div class="bd-label">发行主体</div><div class="bd-val">${item.country}财政部</div></div>
        <div class="bd-item"><div class="bd-label">币种</div><div class="bd-val">${{'美国':'USD','中国':'CNY','日本':'JPY','德国':'EUR'}[item.country] || 'USD'}</div></div>
        <div class="bd-item"><div class="bd-label">信用评级</div><div class="bd-val" style="color:#FFD700;">${item.rating || 'AA'}</div></div>
        <div class="bd-item"><div class="bd-label">展望</div><div class="bd-val">稳定</div></div>
      </div>
    </div>
  `
  modal.onclick = () => modal.remove()
  document.body.appendChild(modal)
}

// 加密货币详情 - DOM创建
const openCryptoDetail = (item) => {
  const isUp = item.change >= 0
  const priceNum = parseFloat(String(item.price).replace(/,/g, '')) || 0
  const changeAmt = (priceNum * item.change / 100).toFixed(priceNum >= 1 ? 2 : 6)
  
  // 生成迷你K线数据点
  const generateChartPath = () => {
    const points = []
    const baseY = 50
    const amplitude = isUp ? -25 : 25
    for (let i = 0; i <= 24; i++) {
      const x = (i / 24) * 100
      const noise = (Math.random() - 0.5) * 20
      const trend = isUp ? -i * 1.2 : i * 1.2
      const y = baseY + trend + noise + Math.sin(i * 0.5) * 8
      points.push(`${i === 0 ? 'M' : 'L'}${x},${Math.max(10, Math.min(90, y))}`)
    }
    return points.join(' ')
  }
  const chartPath = generateChartPath()
  const chartColor = isUp ? '#0ECB81' : '#F6465D'
  
  const modal = document.createElement('div')
  modal.id = 'crypto-detail-modal'
  modal.innerHTML = `
    <style>
      #crypto-detail-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: flex-end; justify-content: center; z-index: 999999; }
      .cd-sheet { width: 100%; max-width: 428px; max-height: 85vh; overflow-y: auto; background: linear-gradient(180deg, #1a1e2e 0%, #12151f 100%); border-radius: 24px 24px 0 0; padding: 16px 16px calc(20px + env(safe-area-inset-bottom, 0px)); }
      .cd-bar { width: 40px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin: 0 auto 12px; }
      .cd-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
      .cd-logo { width: 48px; height: 48px; border-radius: 50%; background: #1a1a2e; }
      .cd-symbol { font-size: 20px; font-weight: 800; color: #fff; }
      .cd-name { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 2px; }
      .cd-rank { font-size: 10px; padding: 2px 6px; border-radius: 4px; background: rgba(200,170,110,0.2); color: #C8AA6E; font-weight: 600; margin-left: 8px; }
      .cd-chart-section { background: rgba(255,255,255,0.03); border-radius: 16px; padding: 12px; margin-bottom: 16px; }
      .cd-chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
      .cd-chart-title { font-size: 12px; color: rgba(255,255,255,0.5); }
      .cd-chart-tabs { display: flex; gap: 8px; }
      .cd-chart-tab { font-size: 10px; padding: 4px 8px; border-radius: 4px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); cursor: pointer; }
      .cd-chart-tab.active { background: rgba(200,170,110,0.2); color: #C8AA6E; }
      .cd-chart { width: 100%; height: 80px; }
      .cd-price-section { padding: 12px 0 16px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 16px; }
      .cd-price { font-size: 36px; font-weight: 800; color: #fff; }
      .cd-price-row { display: flex; align-items: center; gap: 12px; margin-top: 6px; }
      .cd-change-amt { font-size: 15px; font-weight: 600; color: ${isUp ? '#0ECB81' : '#F6465D'}; }
      .cd-change-pct { font-size: 14px; font-weight: 700; padding: 4px 10px; border-radius: 6px; background: ${isUp ? 'rgba(14,203,129,0.15)' : 'rgba(246,70,93,0.15)'}; color: ${isUp ? '#0ECB81' : '#F6465D'}; }
      .cd-section-title { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin: 0 0 10px; }
      .cd-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }
      .cd-item { background: rgba(255,255,255,0.04); border-radius: 12px; padding: 12px; }
      .cd-label { font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 4px; }
      .cd-val { font-size: 16px; font-weight: 700; color: #fff; }
      .cd-val.up { color: #0ECB81; }
      .cd-val.down { color: #F6465D; }
      .cd-sub { font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 2px; }
    </style>
    <div class="cd-sheet" onclick="event.stopPropagation()">
      <div class="cd-bar"></div>
      <div class="cd-header">
        <img class="cd-logo" src="${item.logo}" alt="${item.symbol}">
        <div>
          <div style="display:flex;align-items:center;">
            <span class="cd-symbol">${item.symbol}</span>
            <span class="cd-rank">#${['BTC','ETH','BNB','SOL','XRP','DOGE'].indexOf(item.symbol) + 1}</span>
          </div>
          <div class="cd-name">${item.name}</div>
        </div>
      </div>
      <div class="cd-price-section">
        <div class="cd-price">$${item.price}</div>
        <div class="cd-price-row">
          <span class="cd-change-amt">${isUp ? '+' : ''}$${changeAmt}</span>
          <span class="cd-change-pct">${isUp ? '+' : ''}${item.change.toFixed(2)}%</span>
          <span style="font-size:11px;color:rgba(255,255,255,0.4);">24h</span>
        </div>
      </div>
      <div class="cd-chart-section">
        <div class="cd-chart-header">
          <span class="cd-chart-title">价格走势</span>
          <div class="cd-chart-tabs">
            <span class="cd-chart-tab">1H</span>
            <span class="cd-chart-tab active">24H</span>
            <span class="cd-chart-tab">7D</span>
            <span class="cd-chart-tab">30D</span>
          </div>
        </div>
        <svg class="cd-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:${chartColor};stop-opacity:0.3"/>
              <stop offset="100%" style="stop-color:${chartColor};stop-opacity:0"/>
            </linearGradient>
          </defs>
          <path d="${chartPath} L100,100 L0,100 Z" fill="url(#chartGrad)"/>
          <path d="${chartPath}" fill="none" stroke="${chartColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="cd-section-title">市场数据</div>
      <div class="cd-grid">
        <div class="cd-item"><div class="cd-label">市值</div><div class="cd-val">$${item.marketCap}</div></div>
        <div class="cd-item"><div class="cd-label">24h成交额</div><div class="cd-val">$${(Math.random() * 10 + 1).toFixed(2)}B</div></div>
        <div class="cd-item"><div class="cd-label">24h最高</div><div class="cd-val up">$${(priceNum * 1.03).toFixed(priceNum >= 1 ? 2 : 6)}</div></div>
        <div class="cd-item"><div class="cd-label">24h最低</div><div class="cd-val down">$${(priceNum * 0.97).toFixed(priceNum >= 1 ? 2 : 6)}</div></div>
      </div>
      <div class="cd-section-title">价格变动</div>
      <div class="cd-grid">
        <div class="cd-item"><div class="cd-label">7日涨跌</div><div class="cd-val ${item.change * 2.5 >= 0 ? 'up' : 'down'}">${item.change * 2.5 >= 0 ? '+' : ''}${(item.change * 2.5).toFixed(2)}%</div></div>
        <div class="cd-item"><div class="cd-label">30日涨跌</div><div class="cd-val ${item.change * 5 >= 0 ? 'up' : 'down'}">${item.change * 5 >= 0 ? '+' : ''}${(item.change * 5).toFixed(2)}%</div></div>
        <div class="cd-item"><div class="cd-label">90日涨跌</div><div class="cd-val ${item.change * 12 >= 0 ? 'up' : 'down'}">${item.change * 12 >= 0 ? '+' : ''}${(item.change * 12).toFixed(2)}%</div></div>
        <div class="cd-item"><div class="cd-label">年涨跌</div><div class="cd-val ${item.change * 25 >= 0 ? 'up' : 'down'}">${item.change * 25 >= 0 ? '+' : ''}${(item.change * 25).toFixed(2)}%</div></div>
      </div>
      <div class="cd-section-title">供应数据</div>
      <div class="cd-grid">
        <div class="cd-item"><div class="cd-label">流通量</div><div class="cd-val">${(Math.random() * 100 + 10).toFixed(1)}M</div><div class="cd-sub">占总量 ${(Math.random() * 30 + 50).toFixed(0)}%</div></div>
        <div class="cd-item"><div class="cd-label">总供应量</div><div class="cd-val">${item.symbol === 'BTC' ? '21M' : (Math.random() * 500 + 100).toFixed(0) + 'M'}</div></div>
        <div class="cd-item"><div class="cd-label">历史最高</div><div class="cd-val">$${(priceNum * 1.5).toFixed(priceNum >= 1 ? 2 : 6)}</div><div class="cd-sub">距今 ${(Math.random() * 300 + 30).toFixed(0)} 天</div></div>
        <div class="cd-item"><div class="cd-label">历史最低</div><div class="cd-val">$${(priceNum * 0.01).toFixed(priceNum >= 1 ? 2 : 6)}</div><div class="cd-sub">距今 ${(Math.random() * 1000 + 500).toFixed(0)} 天</div></div>
      </div>
    </div>
  `
  modal.onclick = () => modal.remove()
  document.body.appendChild(modal)
}

// 数据加载
let dataTimer = null
const startTimer = () => {
  if (dataTimer) return
  dataTimer = setInterval(() => loadMarketData(), 60000)
}
const stopTimer = () => {
  if (dataTimer) { clearInterval(dataTimer); dataTimer = null }
}

onMounted(() => {
  loadMarketData()
  loadFuturesData()
  startTimer()
})
onActivated(() => startTimer())
onDeactivated(() => stopTimer())
onUnmounted(() => stopTimer())

watch(futuresTab, () => loadFuturesData())
</script>

<style scoped>
.markets-page { 
  width: 100%; 
  max-width: 428px; 
  min-height: 100vh; 
  margin: 0 auto; 
  background: linear-gradient(180deg, var(--bg-darker, #0a0c10) 0%, var(--bg-base, #0D1117) 50%, var(--bg-darker, #0a0c10) 100%); 
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
  position: relative;
  overflow-x: hidden;
}

/* 背景光效 */
.markets-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  max-width: 428px;
  margin: 0 auto;
  background: radial-gradient(ellipse 100% 100% at 50% -20%, rgba(200, 170, 110, 0.06) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.page-body { 
  padding-top: 52px; 
  position: relative;
  z-index: 1;
}

/* 固定Tab - 高端毛玻璃效果 */
.tabs-bar { 
  display: flex; 
  position: sticky; 
  top: 52px; 
  background: rgba(13, 17, 23, 0.92);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  z-index: 50; 
  border-bottom: 1px solid rgba(200, 170, 110, 0.12);
  padding: 0 4px;
}

.tabs-bar button { 
  flex: 1; 
  padding: 16px 0 14px; 
  background: transparent; 
  border: none; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 4px; 
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  -webkit-tap-highlight-color: transparent;
}

.tabs-bar button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-brand, #C8AA6E), var(--color-gold, #C8AA6E));
  border-radius: 1px;
  transition: width 0.25s ease;
}

.tabs-bar button.active::after {
  width: 24px;
}

.tabs-bar button.active { 
  background: linear-gradient(180deg, rgba(200, 170, 110, 0.08) 0%, transparent 100%);
}

.tabs-bar button:active {
  background: rgba(200, 170, 110, 0.1);
}

.tab-name { 
  font-size: 14px; 
  font-weight: 600; 
  color: #6B7280;
  transition: color 0.2s;
}

.tabs-bar button.active .tab-name { 
  color: #C8AA6E;
  font-weight: 700;
}

.bottom-space { height: calc(100px + env(safe-area-inset-bottom)); }

/* Modal - 高端弹窗效果 */
.modal-mask { 
  position: fixed; 
  inset: 0; 
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex; 
  align-items: flex-end; 
  justify-content: center; 
  z-index: 500; 
}

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .stock-sheet { animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.modal-leave-active .stock-sheet { animation: slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1); }

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes slideDown {
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
}

/* 股票详情弹窗 */
.stock-sheet { 
  position: relative; 
  width: 100%; 
  max-width: 428px; 
  max-height: 90vh;
  overflow-y: auto;
  background: linear-gradient(180deg, var(--bg-elevated, #1E2530) 0%, var(--bg-dark, #151A23) 50%, var(--bg-darker, #12161D) 100%); 
  border-radius: 28px 28px 0 0; 
  padding: 12px 16px calc(24px + env(safe-area-inset-bottom)); 
  box-shadow: 0 -10px 60px rgba(0, 0, 0, 0.6);
}

/* 弹窗顶部金色装饰线 */
.stock-sheet::before {
  content: '';
  position: absolute;
  top: 0;
  left: 40px;
  right: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200, 170, 110, 0.4), transparent);
}

.sheet-bar { 
  width: 44px; 
  height: 5px; 
  background: rgba(255, 255, 255, 0.3); 
  border-radius: 3px; 
  margin: 0 auto 20px; 
}

.sheet-close { 
  position: absolute; 
  top: 14px; 
  right: 16px; 
  width: 32px; 
  height: 32px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 22px; 
  color: #6B7280; 
  cursor: pointer; 
  border-radius: 50%; 
  background: rgba(255, 255, 255, 0.08); 
  z-index: 10;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.sheet-close:active {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(0.95);
}

.stock-head-card { 
  background: linear-gradient(165deg, rgba(50, 60, 75, 0.6) 0%, rgba(35, 42, 52, 0.6) 100%); 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  border-radius: 20px; 
  padding: 20px; 
  margin-bottom: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.section-title { 
  font-size: 13px; 
  font-weight: 700; 
  color: #8B949E; 
  margin: 12px 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 股票迷你图表 */
.stock-chart-section { background: rgba(30,38,50,0.5); border-radius: 12px; padding: 12px; margin-bottom: 12px; }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.chart-title { font-size: 12px; color: #8B949E; }
.chart-tabs { display: flex; gap: 6px; }
.chart-tab { font-size: 10px; padding: 4px 8px; border-radius: 4px; background: rgba(255,255,255,0.06); color: #6B7280; cursor: pointer; }
.chart-tab.active { background: rgba(200,170,110,0.2); color: #C8AA6E; }
.stock-mini-chart { width: 100%; height: 60px; }
.shc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.shc-left { display: flex; align-items: center; gap: 12px; }
.shc-logo-fallback { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #fff; }
.shc-info h3 { font-size: 17px; font-weight: 700; color: #E6EDF3; margin: 0 0 6px; }
.shc-tags { display: flex; gap: 6px; }
.shc-tag { font-size: 10px; color: #8B949E; background: rgba(255,255,255,0.08); padding: 3px 6px; border-radius: 4px; }
.shc-status { font-size: 11px; font-weight: 600; padding: 6px 10px; border-radius: 16px; display: flex; align-items: center; gap: 5px; }
.shc-status .status-dot { width: 5px; height: 5px; border-radius: 50%; animation: pulse 1.5s infinite; }
.shc-status.up { background: rgba(14,203,129,0.15); color: #0ECB81; }
.shc-status.up .status-dot { background: #0ECB81; }
.shc-status.down { background: rgba(246,70,93,0.15); color: #F6465D; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

.shc-price-area { margin-bottom: 14px; }
.shc-main-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 10px; }
.shc-currency { font-size: 16px; font-weight: 500; color: #8B949E; }
.shc-price { font-size: 32px; font-weight: 800; font-family: 'Inter', sans-serif; letter-spacing: -1px; }
.shc-price.up { color: #0ECB81; }
.shc-price.down { color: #F6465D; }
.shc-arrow { font-size: 14px; margin-left: 6px; }
.shc-arrow.up { color: #0ECB81; }
.shc-arrow.down { color: #F6465D; }
.shc-sub-info { display: flex; gap: 20px; }
.shc-change-item { display: flex; flex-direction: column; gap: 2px; }
.shc-change-item .label { font-size: 11px; color: #6B7280; }
.shc-change-item .value { font-size: 15px; font-weight: 700; font-family: 'Inter', sans-serif; }
.shc-change-item.up .value { color: #0ECB81; }
.shc-change-item.down .value { color: #F6465D; }

.stock-data-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px; }
.sdg-item { background: rgba(30,38,50,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 10px 6px; text-align: center; }
.sdg-label { display: block; font-size: 10px; color: #6B7280; margin-bottom: 4px; }
.sdg-value { font-size: 13px; font-weight: 700; color: #E6EDF3; font-family: 'Inter', sans-serif; }
.sdg-value.up { color: #0ECB81; }
.sdg-value.down { color: #F6465D; }
</style>
