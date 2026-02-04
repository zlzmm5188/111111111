<template>
  <div class="trade-page">
    <!-- 顶部导航 -->
    <header class="trade-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      
      <button class="pair-selector" @click="showPairPicker = true">
        <span class="pair-name">{{ base }}/<span class="quote-usdt">USDT</span></span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      
      <div class="header-actions">
        <button class="icon-btn" @click="toggleFavorite">
          <svg width="18" height="18" viewBox="0 0 24 24" :fill="isFavorite ? '#C8AA6E' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- 价格信息 + 24H统计 同一行 -->
    <div class="price-stats-row">
      <div class="price-section">
        <span class="current-price" :class="[trend, { flash: priceFlash }]">{{ formatPrice(price) }}</span>
        <span class="change-badge" :class="trend">{{ change >= 0 ? '+' : '' }}{{ change.toFixed(2) }}%</span>
      </div>
      <div class="stats-section">
        <div class="stat-item">
          <span class="stat-label">24H高</span>
          <span class="stat-value high" :class="{ 'flash-up': highFlash }">{{ formatPrice(high) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">24H低</span>
          <span class="stat-value low" :class="{ 'flash-down': lowFlash }">{{ formatPrice(low) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">24H量</span>
          <span class="stat-value">{{ formatVolume(vol) }}</span>
        </div>
      </div>
    </div>

    <!-- K线图 -->
    <div class="mini-chart" @click="goToKline">
      <div class="chart-container" ref="chartEl"></div>
    </div>

    <!-- Tab切换 -->
    <div class="tab-bar">
      <button :class="['tab-btn', { active: activeTab === 'orderbook' }]" @click="activeTab = 'orderbook'">
        订单簿
      </button>
      <button :class="['tab-btn', { active: activeTab === 'trades' }]" @click="activeTab = 'trades'">
        最新成交
      </button>
    </div>

    <!-- 订单簿 - 左右并排：左卖(红) 右买(绿) -->
    <div class="orderbook" v-show="activeTab === 'orderbook'">
      <div class="ob-header">
        <div class="ob-h-col">
          <span>价格</span>
          <span>数量</span>
        </div>
        <div class="ob-h-col">
          <span>价格</span>
          <span>数量</span>
        </div>
      </div>
      
      <div class="ob-body">
        <!-- 左边卖盘 (红) -->
        <div class="ob-col asks">
          <div v-for="(ask, i) in asks" :key="'a'+i" class="ob-row" :class="{ 'pulse-ask': ask.flash }" :style="{ animationDelay: ask.delay + 'ms' }" @click="fillPrice(ask.price)">
            <div class="ob-bar ask" :style="{ width: ask.depth + '%' }"></div>
            <span class="ob-price ask">{{ formatPrice(ask.price) }}</span>
            <span class="ob-qty">{{ ask.qty.toFixed(4) }}</span>
          </div>
        </div>
        
        <!-- 右边买盘 (绿) -->
        <div class="ob-col bids">
          <div v-for="(bid, i) in bids" :key="'b'+i" class="ob-row" :class="{ 'pulse-bid': bid.flash }" :style="{ animationDelay: bid.delay + 'ms' }" @click="fillPrice(bid.price)">
            <div class="ob-bar bid" :style="{ width: bid.depth + '%' }"></div>
            <span class="ob-price bid">{{ formatPrice(bid.price) }}</span>
            <span class="ob-qty">{{ bid.qty.toFixed(4) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 最新成交 -->
    <div class="recent-trades" v-show="activeTab === 'trades'">
      <div class="trades-header">
        <span>价格(USDT)</span>
        <span>数量({{ base }})</span>
        <span>时间</span>
      </div>
      <div class="trades-list">
        <div v-for="(trade, i) in recentTrades" :key="i" class="trade-row">
          <span class="trade-price" :class="trade.side">{{ formatPrice(trade.price) }}</span>
          <span class="trade-qty">{{ trade.qty.toFixed(4) }}</span>
          <span class="trade-time">{{ trade.time }}</span>
        </div>
      </div>
    </div>

    <!-- 底部买卖按钮 -->
    <div class="bottom-actions">
      <!-- 仅AGX可交易，其他币种显示行情展示 -->
      <template v-if="base === 'AGX'">
        <button class="action-btn buy" @click="openOrder('buy')">
          买入
        </button>
        <button class="action-btn sell" @click="openOrder('sell')">
          卖出
        </button>
      </template>
      <template v-else>
        <div class="view-only-notice">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
          <span>{{ base }} 暂仅支持行情查看</span>
        </div>
      </template>
    </div>

    <!-- 下单面板 -->
    <Teleport to="body">
      <Transition name="sheet">
        <div v-if="showOrderPanel" class="order-overlay" @click="showOrderPanel = false">
          <div class="order-sheet" @click.stop>
            <div class="sheet-handle"></div>
            
            <!-- 面板头部 -->
            <div class="sheet-header">
              <span class="sheet-title">{{ orderSide === 'buy' ? '买入' : '卖出' }} {{ base }}</span>
              <button class="close-btn" @click="showOrderPanel = false">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- 订单类型 -->
            <div class="order-type-tabs">
              <button :class="['type-btn', { active: orderType === 'limit' }]" @click="orderType = 'limit'">
                限价
              </button>
              <button :class="['type-btn', { active: orderType === 'market' }]" @click="orderType = 'market'">
                市价
              </button>
            </div>

            <!-- 价格输入 -->
            <div class="input-group" v-if="orderType === 'limit'">
              <label>价格</label>
              <div class="input-row">
                <button class="adjust-btn" @click="adjustPrice(-1)">-</button>
                <input type="number" v-model="orderPrice" placeholder="输入价格" />
                <button class="adjust-btn" @click="adjustPrice(1)">+</button>
              </div>
              <span class="input-suffix">USDT</span>
            </div>

            <div class="market-price-hint" v-else>
              <span>以市场最优价格成交</span>
            </div>

            <!-- 数量输入 -->
            <div class="input-group">
              <label>数量</label>
              <div class="input-row">
                <button class="adjust-btn" @click="adjustQty(-0.1)">-</button>
                <input type="number" v-model="orderQty" placeholder="输入数量" />
                <button class="adjust-btn" @click="adjustQty(0.1)">+</button>
              </div>
              <span class="input-suffix">{{ base }}</span>
            </div>

            <!-- 快捷比例 -->
            <div class="quick-percents">
              <button v-for="p in [25, 50, 75, 100]" :key="p" 
                :class="['percent-btn', { active: selectedPercent === p }]"
                @click="setPercent(p)">
                {{ p }}%
              </button>
            </div>

            <!-- 可用余额 -->
            <div class="balance-info">
              <span class="balance-label">可用</span>
              <span class="balance-value">
                {{ orderSide === 'buy' ? '1,234.56 USDT' : '0.5234 ' + base }}
              </span>
            </div>

            <!-- 预估 -->
            <div class="estimate-info">
              <span class="estimate-label">{{ orderSide === 'buy' ? '预计买入' : '预计得到' }}</span>
              <span class="estimate-value">
                {{ orderSide === 'buy' 
                  ? (orderQty || 0).toFixed(4) + ' ' + base 
                  : ((orderQty || 0) * (orderPrice || price)).toFixed(2) + ' USDT' 
                }}
              </span>
            </div>

            <!-- 确认按钮 -->
            <button :class="['confirm-btn', orderSide]" @click="submitOrder">
              {{ orderSide === 'buy' ? '买入' : '卖出' }} {{ base }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 交易对选择器 -->
    <Teleport to="body">
      <Transition name="sheet">
        <div v-if="showPairPicker" class="order-overlay" @click="showPairPicker = false">
          <div class="pair-sheet" @click.stop>
            <div class="sheet-handle"></div>
            <div class="picker-header">
              <input v-model="searchQuery" type="text" class="search-input" placeholder="搜索交易对" />
            </div>
            <div class="pair-list">
              <div v-for="p in filteredPairs" :key="p.symbol"
                :class="['pair-item', { active: pair === p.symbol }]"
                @click="selectPair(p)">
                <span class="pair-symbol">{{ p.symbol }}</span>
                <div class="pair-data">
                  <span class="pair-price">{{ formatPrice(p.price) }}</span>
                  <span class="pair-change" :class="p.change >= 0 ? 'up' : 'down'">
                    {{ p.change >= 0 ? '+' : '' }}{{ p.change.toFixed(2) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { alert } from '../utils/alert'

const route = useRoute()
const router = useRouter()

// 交易对
const pair = ref((route.query.pair || 'BTC_USDT').replace('_', '/'))
const base = computed(() => pair.value.split('/')[0])

// 价格数据
const price = ref(0)
const change = ref(0)
const high = ref(0)
const low = ref(0)
const vol = ref(0)
const trend = computed(() => change.value >= 0 ? 'up' : 'down')

// 闪烁动画
const priceFlash = ref(false)
const highFlash = ref(false)
const lowFlash = ref(false)
const bidFlash = ref(false)
const askFlash = ref(false)

// 买卖价格标签
const bidPrice = ref(0)
const askPrice = ref(0)
const depthCount = ref(0)

// UI状态
const activeTab = ref('orderbook')
const isFavorite = ref(false)
const showPairPicker = ref(false)
const showOrderPanel = ref(false)
const searchQuery = ref('')
const chartEl = ref(null)
const interval = ref('1')

// K线周期选项
const intervals = [
  { label: '1分', value: '1' },
  { label: '5分', value: '5' },
  { label: '15分', value: '15' },
  { label: '1时', value: '60' },
  { label: '4时', value: '240' },
  { label: '1日', value: 'D' }
]

// 订单簿
const asks = ref([])
const bids = ref([])

// 最新成交
const recentTrades = ref([])

// 下单表单
const orderSide = ref('buy')
const orderType = ref('limit')
const orderPrice = ref('')
const orderQty = ref('')
const selectedPercent = ref(0)

// 交易对列表
const pairs = ref([
  { symbol: 'BTC/USDT', price: 95000, change: 1.2 },
  { symbol: 'ETH/USDT', price: 3200, change: -0.8 },
  { symbol: 'BNB/USDT', price: 690, change: -1.22 },
  { symbol: 'SOL/USDT', price: 180, change: 2.3 },
  { symbol: 'LTC/USDT', price: 68, change: 1.07 },
  { symbol: 'XRP/USDT', price: 0.52, change: 0.8 },
  { symbol: 'DOGE/USDT', price: 0.08, change: -0.5 },
  { symbol: 'AGX/USDT', price: 0.065, change: 2.5 }
])

const filteredPairs = computed(() => {
  if (!searchQuery.value) return pairs.value
  const q = searchQuery.value.toLowerCase()
  return pairs.value.filter(p => p.symbol.toLowerCase().includes(q))
})

// 格式化
const formatPrice = (p) => {
  if (!p) return '0.00'
  const n = +p
  if (n >= 1000) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (n >= 1) return n.toFixed(2)
  if (n >= 0.01) return n.toFixed(4)
  return n.toFixed(6)
}

const formatVolume = (v) => {
  if (!v) return '0'
  const n = +v
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toFixed(0)
}

// 初始化K线（TradingView 基准线图表）
let chartScriptLoaded = false
const initMiniChart = () => {
  if (!chartEl.value) return
  chartEl.value.innerHTML = ''
  
  const symbolMap = {
    BTC: 'BINANCE:BTCUSDT',
    ETH: 'BINANCE:ETHUSDT',
    BNB: 'BINANCE:BNBUSDT',
    SOL: 'BINANCE:SOLUSDT',
    LTC: 'BINANCE:LTCUSDT',
    XRP: 'BINANCE:XRPUSDT',
    DOGE: 'BINANCE:DOGEUSDT',
    AGX: 'BINANCE:BTCUSDT'
  }
  const symbol = symbolMap[base.value] || `BINANCE:${base.value}USDT`
  
  // 创建TradingView Widget容器
  const container = document.createElement('div')
  container.className = 'tradingview-widget-container'
  container.style.cssText = 'width:100%;height:100%'
  
  const widgetContainer = document.createElement('div')
  widgetContainer.className = 'tradingview-widget-container__widget'
  widgetContainer.style.cssText = 'width:100%;height:100%'
  container.appendChild(widgetContainer)
  
  chartEl.value.appendChild(container)
  
  // 加载TradingView脚本 - 避免重复加载
  if (!chartScriptLoaded) {
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.onload = () => {
      chartScriptLoaded = true
      console.log('TradingView script loaded')
    }
    script.onerror = (err) => {
      console.error('Failed to load TradingView script:', err)
    }
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: '1',
      timezone: 'Asia/Shanghai',
      theme: 'dark',
      style: '10',
      locale: 'zh_CN',
      allow_symbol_change: false,
      calendar: false,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_side_toolbar: true,
      save_image: false,
      studies: [],
      support_host: 'https://www.tradingview.com'
    })
    
    container.appendChild(script)
  }
}

// 获取初始价格
const fetchData = async () => {
  const b = base.value
  
  if (b === 'AGX') {
    price.value = 0.065
    change.value = 2.5
    high.value = 0.068
    low.value = 0.062
    vol.value = 125000
  } else {
    try {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${b}USDT`)
      const data = await res.json()
      if (data.lastPrice) {
        price.value = +data.lastPrice
        change.value = +data.priceChangePercent
        high.value = +data.highPrice
        low.value = +data.lowPrice
        vol.value = +data.quoteVolume
      }
    } catch (e) {
      console.error('获取行情失败', e)
    }
  }
}

// WebSocket 实时数据
let ws = null
let depthWs = null
let lastTickerUpdate = 0
let lastDepthUpdate = 0
const TICKER_THROTTLE = 2000 // 价格更新节流：2秒（从1秒优化）
const DEPTH_THROTTLE = 2000  // 深度更新节流：2秒
const flashTimeouts = [] // 保存所有闪烁动画的 timeout ID

// 清理所有 WebSocket 连接和定时器
const cleanupWebSockets = () => {
  if (ws) {
    ws.close()
    ws = null
  }
  if (depthWs) {
    depthWs.close()
    depthWs = null
  }
  // 清理所有闪烁动画的定时器
  flashTimeouts.forEach(id => clearTimeout(id))
  flashTimeouts.length = 0
}

const connectWebSocket = () => {
  const b = base.value.toLowerCase()
  if (b === 'agx') {
    cleanupWebSockets()
    return
  }
  
  // 清理旧连接
  cleanupWebSockets()
  
  // 行情 WebSocket
  try {
    ws = new WebSocket(`wss://stream.binance.com:9443/ws/${b}usdt@ticker`)
    
    ws.onopen = () => {
      console.log(`WebSocket ticker connected: ${b}usdt`)
    }
    
    ws.onmessage = (event) => {
      // 节流：1秒更新一次
      const now = Date.now()
      if (now - lastTickerUpdate < TICKER_THROTTLE) return
      lastTickerUpdate = now
      
      const data = JSON.parse(event.data)
      if (data.c) {
        const oldPrice = price.value
        const newPrice = +data.c
        
        // 价格变化闪烁
        if (oldPrice !== newPrice) {
          priceFlash.value = true
          const id = setTimeout(() => { priceFlash.value = false }, 300)
          flashTimeouts.push(id)
        }
        
        // 更新高低闪烁
        if (+data.h > high.value && high.value > 0) {
          highFlash.value = true
          const id = setTimeout(() => { highFlash.value = false }, 300)
          flashTimeouts.push(id)
        }
        if (+data.l < low.value && low.value > 0) {
          lowFlash.value = true
          const id = setTimeout(() => { lowFlash.value = false }, 300)
          flashTimeouts.push(id)
        }
        
        price.value = newPrice
        change.value = +data.P
        high.value = +data.h
        low.value = +data.l
        vol.value = +data.q
      }
    }
    
    ws.onerror = (err) => {
      console.error('WebSocket ticker error:', err)
    }
    
    ws.onclose = () => {
      console.log(`WebSocket ticker closed: ${b}usdt`)
    }
  } catch (err) {
    console.error('Failed to create ticker WebSocket:', err)
  }
  
  // 深度 WebSocket (1秒更新一次，减少闪烁频率)
  try {
    depthWs = new WebSocket(`wss://stream.binance.com:9443/ws/${b}usdt@depth10@1000ms`)
    
    depthWs.onopen = () => {
      console.log(`WebSocket depth connected: ${b}usdt`)
    }
    
    depthWs.onmessage = (event) => {
      // 节流：2秒更新一次，减少重渲染
      const now = Date.now()
      if (now - lastDepthUpdate < DEPTH_THROTTLE) return
      lastDepthUpdate = now
      
      const data = JSON.parse(event.data)
      if (data.bids && data.asks) {
        const maxBidQty = Math.max(...data.bids.map(b => +b[1]))
        const maxAskQty = Math.max(...data.asks.map(a => +a[1]))
        const maxQty = Math.max(maxBidQty, maxAskQty)
        
        // 保存旧数据用于比较
        const oldBids = bids.value.map(b => b.qty)
        const oldAsks = asks.value.map(a => a.qty)
        
        // 优化：移除逐行延迟动画，只保留变化闪烁
        bids.value = data.bids.slice(0, 6).map((b, i) => {
          const qty = +b[1]
          // 只有变化超过3%才闪烁（提高阈值，减少动画）
          const changed = oldBids[i] !== undefined && Math.abs(qty - oldBids[i]) / oldBids[i] > 0.03
          return {
            price: +b[0],
            qty: qty,
            depth: (qty / maxQty) * 100,
            flash: changed
          }
        })
        
        asks.value = data.asks.slice(0, 6).map((a, i) => {
          const qty = +a[1]
          // 只有变化超过3%才闪烁
          const changed = oldAsks[i] !== undefined && Math.abs(qty - oldAsks[i]) / oldAsks[i] > 0.03
          return {
            price: +a[0],
            qty: qty,
            depth: (qty / maxQty) * 100,
            flash: changed
          }
        })
        
        // 清除闪烁状态
        const id = setTimeout(() => {
          bids.value = bids.value.map(b => ({ ...b, flash: false }))
          asks.value = asks.value.map(a => ({ ...a, flash: false }))
        }, 350)
        flashTimeouts.push(id)
        
        // 更新右侧价格标签
        if (data.bids[0]) {
          const newBid = +data.bids[0][0]
          if (bidPrice.value !== newBid && bidPrice.value > 0) {
            bidFlash.value = true
            const id = setTimeout(() => { bidFlash.value = false }, 200)
            flashTimeouts.push(id)
          }
          bidPrice.value = newBid
          depthCount.value = Math.round(+data.bids[0][1])
        }
        if (data.asks[0]) {
          const newAsk = +data.asks[0][0]
          if (askPrice.value !== newAsk && askPrice.value > 0) {
            askFlash.value = true
            const id = setTimeout(() => { askFlash.value = false }, 200)
            flashTimeouts.push(id)
          }
          askPrice.value = newAsk
        }
      }
    }
    
    depthWs.onerror = (err) => {
      console.error('WebSocket depth error:', err)
    }
    
    depthWs.onclose = () => {
      console.log(`WebSocket depth closed: ${b}usdt`)
    }
  } catch (err) {
    console.error('Failed to create depth WebSocket:', err)
  }
}

// 生成最新成交（实时模拟）
let tradesTimer = null
const generateTrades = () => {
  const p = price.value || 100
  const trades = []
  const now = new Date()
  
  for (let i = 0; i < 15; i++) {
    const time = new Date(now - i * 1500)
    trades.push({
      price: p * (1 + (Math.random() - 0.5) * 0.001),
      qty: Math.random() * 2 + 0.1,
      side: Math.random() > 0.5 ? 'up' : 'down',
      time: `${time.getHours().toString().padStart(2,'0')}:${time.getMinutes().toString().padStart(2,'0')}:${time.getSeconds().toString().padStart(2,'0')}`
    })
  }
  
  recentTrades.value = trades
}

const startTradesTimer = () => {
  if (tradesTimer) return
  tradesTimer = setInterval(generateTrades, 2000)
}

const stopTradesTimer = () => {
  if (tradesTimer) {
    clearInterval(tradesTimer)
    tradesTimer = null
  }
}

// 操作
const goToKline = () => {
  router.push(`/kline?symbol=${base.value}USDT`)
}

const changeInterval = (val) => {
  interval.value = val
  initMiniChart()
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
}

const selectPair = (p) => {
  pair.value = p.symbol
  showPairPicker.value = false
  orderPrice.value = ''
  fetchData().catch(err => {
    console.error('Failed to fetch data:', err)
  })
  connectWebSocket()
  initMiniChart()
}

const fillPrice = (p) => {
  orderPrice.value = p
}

const adjustPrice = (delta) => {
  const p = parseFloat(orderPrice.value) || price.value
  const step = p >= 1000 ? 1 : p >= 1 ? 0.01 : 0.0001
  orderPrice.value = Math.max(0, p + delta * step).toFixed(p >= 1 ? 2 : 4)
}

const adjustQty = (delta) => {
  const q = parseFloat(orderQty.value) || 0
  orderQty.value = Math.max(0, q + delta).toFixed(4)
}

const setPercent = (p) => {
  selectedPercent.value = p
  // 模拟计算
  const balance = orderSide.value === 'buy' ? 1234.56 : 0.5234
  if (orderSide.value === 'buy') {
    const amount = balance * p / 100
    const qty = amount / (orderPrice.value || price.value)
    orderQty.value = qty.toFixed(4)
  } else {
    orderQty.value = (balance * p / 100).toFixed(4)
  }
}

const submitOrder = () => {
  if (!orderQty.value || parseFloat(orderQty.value) <= 0) {
    alert.show('请输入数量')
    return
  }
  if (orderType.value === 'limit' && (!orderPrice.value || parseFloat(orderPrice.value) <= 0)) {
    alert.show('请输入价格')
    return
  }
  
  alert.show(`${orderSide.value === 'buy' ? '买入' : '卖出'}订单已提交`)
  showOrderPanel.value = false
  orderQty.value = ''
  selectedPercent.value = 0
}

// 监听路由
watch(() => route.query.pair, (newPair) => {
  if (newPair) {
    pair.value = newPair.replace('_', '/')
    fetchData().catch(err => {
      console.error('Failed to fetch data:', err)
    })
    connectWebSocket()
    initMiniChart()
  }
})

onMounted(() => {
  fetchData().catch(err => {
    console.error('Failed to fetch data:', err)
  })
  connectWebSocket()
  setTimeout(initMiniChart, 100)
  startTradesTimer()
})

onUnmounted(() => {
  stopTradesTimer()
  cleanupWebSockets()
})
</script>

<style scoped>
/* ========== 设计系统: 专业交易界面 ========== */
/* 配色: 深邃黑 #0D1117 | 卡片 #161B22 | 绿 #00C076 | 红 #F6465D | 金 #C8AA6E */

.trade-page {
  width: 100%;
  max-width: 428px;
  margin: 0 auto;
  min-height: 100vh;
  background: #0D1117;
  color: #E6EDF3;
  padding-bottom: calc(100px + env(safe-area-inset-bottom));
}

/* ========== 顶部导航 ========== */
.trade-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: linear-gradient(180deg, #0D1117 0%, rgba(13,17,23,0.98) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.back-btn, .icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  color: #8B949E;
  transition: all 0.2s ease;
}

.back-btn:active, .icon-btn:active {
  background: rgba(255,255,255,0.08);
  transform: scale(0.95);
}

.pair-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
}

.pair-name {
  font-size: 18px;
  font-weight: 700;
  color: #F0F6FC;
  letter-spacing: -0.3px;
}

.quote-usdt {
  color: #C8AA6E;
  font-weight: 600;
}

.pair-selector svg { 
  color: #6E7681;
  transition: transform 0.2s ease;
}

.pair-selector:active svg {
  transform: rotate(180deg);
}

.header-actions { margin-left: auto; }

/* ========== 价格统计区域 ========== */
.price-stats-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: linear-gradient(180deg, rgba(22,27,34,0.8) 0%, rgba(13,17,23,0.4) 100%);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.price-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.current-price {
  font-size: 26px;
  font-weight: 700;
  font-family: 'DIN Alternate', 'Helvetica Neue', 'Arial', sans-serif;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5px;
  line-height: 1.1;
}

.change-badge {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
  padding: 4px 8px;
  border-radius: 6px;
  width: fit-content;
}

.change-badge.up { 
  background: rgba(0, 192, 118, 0.12); 
  color: #00C076;
}
.change-badge.down { 
  background: rgba(246, 70, 93, 0.12); 
  color: #F6465D;
}

.up { color: #00C076; }
.down { color: #F6465D; }

.stats-section {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
}

.stat-label {
  font-size: 10px;
  color: #6E7681;
  font-weight: 500;
}

.stat-value {
  font-size: 12px;
  font-weight: 600;
  font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
  font-variant-numeric: tabular-nums;
  color: #E6EDF3;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.stat-value.high { color: #00C076; }
.stat-value.low { color: #F6465D; }

/* ========== K线图区域 ========== */
.mini-chart {
  position: relative;
  height: 260px;
  margin: 12px 16px;
  border-radius: 16px;
  overflow: hidden;
  background: #161B22;
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 4px 24px rgba(0,0,0,0.3);
}

.chart-container {
  width: 100%;
  height: 100%;
}

.chart-container :deep(.tradingview-widget-container),
.chart-container :deep(.tradingview-widget-container__widget),
.chart-container :deep(iframe) {
  width: 100% !important;
  height: 100% !important;
}

/* ========== Tab切换栏 ========== */
.tab-bar {
  display: flex;
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 12px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #6E7681;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.tab-btn.active {
  color: #F0F6FC;
  background: rgba(200,170,110,0.08);
  border-color: rgba(200,170,110,0.2);
}

.tab-btn:active {
  transform: scale(0.98);
}

/* ========== 订单簿 ========== */
.orderbook {
  padding: 0 16px;
  padding-bottom: 120px;
}

.ob-header {
  display: flex;
  padding: 8px 0;
  font-size: 10px;
  font-weight: 500;
  color: #6E7681;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ob-h-col {
  flex: 1;
  display: flex;
  justify-content: space-between;
  padding: 0 8px;
}

.ob-body {
  display: flex;
  gap: 8px;
}

.ob-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ob-row {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  font-size: 11px;
  font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s ease;
}

.ob-row:active {
  background: rgba(255,255,255,0.06);
}

.ob-row.pulse-bid {
  animation: pulseBid 0.4s ease-out forwards;
}

.ob-row.pulse-ask {
  animation: pulseAsk 0.4s ease-out forwards;
}

@keyframes pulseBid {
  0% { background: transparent; }
  30% { background: rgba(0, 192, 118, 0.15); }
  100% { background: transparent; }
}

@keyframes pulseAsk {
  0% { background: transparent; }
  30% { background: rgba(246, 70, 93, 0.15); }
  100% { background: transparent; }
}

.ob-bar {
  position: absolute;
  top: 2px;
  bottom: 2px;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.ob-col.asks .ob-bar { right: 2px; }
.ob-col.bids .ob-bar { left: 2px; }

.ob-bar.ask { 
  background: linear-gradient(90deg, transparent 0%, rgba(246, 70, 93, 0.15) 100%);
}
.ob-bar.bid { 
  background: linear-gradient(270deg, transparent 0%, rgba(0, 192, 118, 0.15) 100%);
}

.ob-price, .ob-qty {
  position: relative;
  z-index: 1;
}

.ob-price { font-weight: 600; }
.ob-price.ask { color: #F6465D; }
.ob-price.bid { color: #00C076; }
.ob-qty { color: #8B949E; }

/* ========== 最新成交 ========== */
.recent-trades {
  padding: 0 16px;
  padding-bottom: 120px;
}

.trades-header {
  display: flex;
  justify-content: space-between;
  padding: 8px 10px;
  font-size: 11px;
  font-weight: 500;
  color: #6E7681;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.trades-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 300px;
  overflow-y: auto;
}

.trades-list::-webkit-scrollbar { width: 4px; }
.trades-list::-webkit-scrollbar-track { background: transparent; }
.trades-list::-webkit-scrollbar-thumb { 
  background: rgba(255,255,255,0.1); 
  border-radius: 2px;
}

.trade-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 10px;
  font-size: 11px;
  font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
  font-variant-numeric: tabular-nums;
  border-radius: 6px;
  transition: background 0.15s ease;
}

.trade-row:hover {
  background: rgba(255,255,255,0.02);
}

.trade-price { font-weight: 600; }
.trade-price.up { color: #00C076; }
.trade-price.down { color: #F6465D; }
.trade-qty { color: #E6EDF3; }
.trade-time { color: #6E7681; }

/* ========== 底部买卖按钮 ========== */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 428px;
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: #0D1117;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.view-only-notice {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: #21262D;
  border: 1px solid #30363D;
  border-radius: 14px;
  color: #8B949E;
  font-size: 14px;
}
.view-only-notice svg { width: 18px; height: 18px; flex-shrink: 0; }

.action-btn {
  flex: 1;
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.action-btn:active::before {
  opacity: 1;
}

.action-btn:active {
  transform: scale(0.98);
}

.action-btn.buy {
  background: linear-gradient(180deg, #00C076 0%, #00A868 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(0, 192, 118, 0.25);
}

.action-btn.sell {
  background: linear-gradient(180deg, #F6465D 0%, #E03E54 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(246, 70, 93, 0.25);
}

/* ========== 下单面板 ========== */
.order-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.order-sheet, .pair-sheet {
  width: 100%;
  max-height: 85vh;
  background: linear-gradient(180deg, #1C2128 0%, #161B22 100%);
  border-radius: 24px 24px 0 0;
  padding: 16px 24px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  overflow-y: auto;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.sheet-handle {
  width: 40px;
  height: 4px;
  background: rgba(255,255,255,0.15);
  border-radius: 2px;
  margin: 0 auto 20px;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.sheet-title {
  font-size: 20px;
  font-weight: 700;
  color: #F0F6FC;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  color: #8B949E;
  transition: all 0.2s ease;
}

.close-btn:active {
  background: rgba(255,255,255,0.08);
}

/* 订单类型Tab */
.order-type-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding: 4px;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
}

.type-btn {
  flex: 1;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #6E7681;
  background: transparent;
  border: none;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.type-btn.active {
  color: #F0F6FC;
  background: rgba(200,170,110,0.15);
}

/* 输入组 */
.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #8B949E;
  margin-bottom: 10px;
}

.input-row {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.input-row:focus-within {
  border-color: rgba(200,170,110,0.4);
}

.input-row input {
  flex: 1;
  padding: 14px;
  font-size: 18px;
  font-weight: 600;
  font-family: -apple-system, 'SF Mono', monospace;
  color: #F0F6FC;
  background: transparent;
  border: none;
  text-align: center;
  outline: none;
}

.input-row input::placeholder { color: #484F58; }

.adjust-btn {
  width: 48px;
  height: 48px;
  font-size: 20px;
  font-weight: 600;
  color: #8B949E;
  background: rgba(255,255,255,0.04);
  border: none;
  transition: all 0.15s ease;
}

.adjust-btn:active {
  background: rgba(255,255,255,0.08);
  color: #F0F6FC;
}

.input-suffix {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #6E7681;
  margin-top: 6px;
}

.market-price-hint {
  padding: 20px;
  text-align: center;
  font-size: 14px;
  color: #8B949E;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 14px;
  margin-bottom: 20px;
}

/* 快捷比例 */
.quick-percents {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.percent-btn {
  flex: 1;
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #6E7681;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.percent-btn.active {
  color: #C8AA6E;
  background: rgba(200,170,110,0.1);
  border-color: rgba(200,170,110,0.3);
}

.percent-btn:active {
  transform: scale(0.96);
}

/* 余额和预估 */
.balance-info, .estimate-info {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 14px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.balance-label, .estimate-label { color: #6E7681; }
.balance-value, .estimate-value { 
  color: #F0F6FC; 
  font-weight: 600;
  font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
}

/* 确认按钮 */
.confirm-btn {
  width: 100%;
  padding: 18px;
  margin-top: 20px;
  font-size: 17px;
  font-weight: 700;
  border: none;
  border-radius: 14px;
  color: #fff;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.confirm-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 50%);
}

.confirm-btn:active {
  transform: scale(0.98);
}

.confirm-btn.buy { 
  background: linear-gradient(180deg, #00C076 0%, #00A868 100%);
  box-shadow: 0 4px 20px rgba(0, 192, 118, 0.3);
}

.confirm-btn.sell { 
  background: linear-gradient(180deg, #F6465D 0%, #E03E54 100%);
  box-shadow: 0 4px 20px rgba(246, 70, 93, 0.3);
}

/* ========== 交易对选择器 ========== */
.picker-header {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 14px 18px;
  font-size: 15px;
  color: #F0F6FC;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: rgba(200,170,110,0.4);
}

.search-input::placeholder { color: #484F58; }

.pair-list {
  max-height: 50vh;
  overflow-y: auto;
}

.pair-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pair-item:active, .pair-item.active {
  background: rgba(200,170,110,0.08);
}

.pair-symbol {
  font-size: 16px;
  font-weight: 600;
  color: #F0F6FC;
}

.pair-data {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pair-price {
  font-size: 14px;
  font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
  font-variant-numeric: tabular-nums;
  color: #E6EDF3;
}

.pair-change {
  font-size: 13px;
  font-weight: 600;
  min-width: 65px;
  text-align: right;
  padding: 4px 8px;
  border-radius: 6px;
}

.pair-change.up {
  color: #00C076;
  background: rgba(0, 192, 118, 0.1);
}

.pair-change.down {
  color: #F6465D;
  background: rgba(246, 70, 93, 0.1);
}

/* ========== 动画 ========== */
.sheet-enter-active, .sheet-leave-active {
  transition: opacity 0.3s ease;
}

.sheet-enter-active .order-sheet, 
.sheet-enter-active .pair-sheet,
.sheet-leave-active .order-sheet,
.sheet-leave-active .pair-sheet {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.sheet-enter-from, .sheet-leave-to { opacity: 0; }

.sheet-enter-from .order-sheet, 
.sheet-enter-from .pair-sheet,
.sheet-leave-to .order-sheet,
.sheet-leave-to .pair-sheet {
  transform: translateY(100%);
}

/* 价格闪烁动画 */
@keyframes priceFlash {
  0% { transform: scale(1); }
  40% { transform: scale(1.05); filter: brightness(1.2); }
  100% { transform: scale(1); }
}

@keyframes flashUp {
  0% { background: transparent; }
  40% { background: rgba(0, 192, 118, 0.25); }
  100% { background: transparent; }
}

@keyframes flashDown {
  0% { background: transparent; }
  40% { background: rgba(246, 70, 93, 0.25); }
  100% { background: transparent; }
}

.current-price.flash {
  animation: priceFlash 0.35s ease-out;
}

.stat-value.flash-up {
  animation: flashUp 0.35s ease-out;
}

.stat-value.flash-down {
  animation: flashDown 0.35s ease-out;
}

/* 价格过渡 */
.current-price {
  transition: color 0.2s ease;
}

.stat-value {
  transition: background 0.2s ease, color 0.2s ease;
}

/* ========== K线周期选择（保留备用） ========== */
.interval-bar {
  display: flex;
  gap: 4px;
  padding: 8px 16px;
  background: #0D1117;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.interval-bar::-webkit-scrollbar { display: none; }

.interval-btn {
  flex-shrink: 0;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #6E7681;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.interval-btn.active {
  color: #C8AA6E;
  background: rgba(200,170,110,0.1);
  border-color: rgba(200,170,110,0.2);
}

/* ========== K线图右侧价格标签 ========== */
.chart-price-tags {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 10;
}

.price-tag {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
  border-radius: 4px 0 0 4px;
  min-width: 56px;
  text-align: center;
  transition: transform 0.15s ease;
}

.price-tag.bid {
  background: #00C076;
  color: #fff;
}

.price-tag.ask {
  background: #F6465D;
  color: #fff;
}

.price-tag.flash {
  transform: scale(1.05);
}

.depth-tag {
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 500;
  font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
  background: rgba(0, 192, 118, 0.85);
  color: #fff;
  border-radius: 4px 0 0 4px;
  text-align: center;
}

/* ========== 价差区域 ========== */
.ob-spread {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 0;
  margin-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.04);
}

.spread-price {
  font-size: 18px;
  font-weight: 700;
  font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
  font-variant-numeric: tabular-nums;
}

.spread-arrow.up { color: #00C076; }
.spread-arrow.down { color: #F6465D; }

/* ==================== Light 主题 ==================== */
:root[data-theme="light"] .trade-page {
  background: #F5F7FA;
}

:root[data-theme="light"] .ticker-bar {
  background: #FFFFFF;
  border-bottom-color: #E5E7EB;
}

:root[data-theme="light"] .pair-btn span {
  color: #1A1D21;
}

:root[data-theme="light"] .stat-label {
  color: #6B7280;
}

:root[data-theme="light"] .stat-value {
  color: #1A1D21;
}

:root[data-theme="light"] .mini-chart {
  background: #FFFFFF;
  border-color: #E5E7EB;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

:root[data-theme="light"] .tab-bar .tab-btn {
  color: #6B7280;
  background: #F3F4F6;
  border-color: #E5E7EB;
}

:root[data-theme="light"] .tab-bar .tab-btn.active {
  color: #1A1D21;
  background: #FFFFFF;
  border-color: #C8AA6E;
}

:root[data-theme="light"] .orderbook-section {
  background: #FFFFFF;
  border-color: #E5E7EB;
}

:root[data-theme="light"] .ob-header {
  color: #6B7280;
}

:root[data-theme="light"] .ob-price {
  color: #1A1D21;
}

:root[data-theme="light"] .ob-amount,
:root[data-theme="light"] .ob-total {
  color: #4A5056;
}

:root[data-theme="light"] .ob-spread {
  border-top-color: #E5E7EB;
}

:root[data-theme="light"] .spread-price {
  color: #1A1D21;
}

:root[data-theme="light"] .trade-form {
  background: #FFFFFF;
  border-color: #E5E7EB;
}

:root[data-theme="light"] .form-label {
  color: #4A5056;
}

:root[data-theme="light"] .form-input input {
  background: #F5F7FA;
  border-color: #E5E7EB;
  color: #1A1D21;
}

:root[data-theme="light"] .form-input input:focus {
  border-color: #C8AA6E;
  background: #FFFFFF;
}

:root[data-theme="light"] .percent-btn {
  background: #F3F4F6;
  border-color: #E5E7EB;
  color: #4A5056;
}

:root[data-theme="light"] .percent-btn.active {
  background: rgba(200,170,110,0.1);
  border-color: #C8AA6E;
  color: #A08A5B;
}

:root[data-theme="light"] .search-input {
  background: #F5F7FA;
  border-color: #E5E7EB;
  color: #1A1D21;
}

:root[data-theme="light"] .search-input::placeholder {
  color: #9CA3AF;
}

:root[data-theme="light"] .pair-symbol {
  color: #1A1D21;
}

:root[data-theme="light"] .pair-price {
  color: #4A5056;
}

:root[data-theme="light"] .pair-item:active,
:root[data-theme="light"] .pair-item.active {
  background: rgba(200,170,110,0.08);
}

:root[data-theme="light"] .interval-btn {
  color: #6B7280;
  background: #F3F4F6;
  border-color: #E5E7EB;
}

:root[data-theme="light"] .interval-btn.active {
  color: #A08A5B;
  background: rgba(200,170,110,0.1);
  border-color: rgba(200,170,110,0.3);
}
</style>
