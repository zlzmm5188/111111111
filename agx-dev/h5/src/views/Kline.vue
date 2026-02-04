<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const symbol = ref(route.query.symbol || 'BTCUSDT')
const exchange = ref(route.query.exchange || 'BINANCE')
const loading = ref(true)
const isFavorite = ref(false)
const showIndicators = ref(false)
const activeTimeframe = ref('15')
const activeIndicators = ref(['MA'])
const priceDirection = ref('')

const chartContainer = ref(null)
let widgetScript = null

// 价格数据
const currentPrice = ref('99,870.88')
const changePercent = ref(2.41)

const timeframes = [
  { label: '分时', value: '1' },
  { label: '15分', value: '15' },
  { label: '1时', value: '60' },
  { label: '4时', value: '240' },
  { label: '日K', value: 'D' },
  { label: '周K', value: 'W' }
]

const indicators = [
  { label: 'MA', value: 'MA' },
  { label: 'EMA', value: 'EMA' },
  { label: 'BOLL', value: 'BB' },
  { label: 'MACD', value: 'MACD' },
  { label: 'RSI', value: 'RSI' },
  { label: 'VOL', value: 'VOL' }
]

const displaySymbol = computed(() => {
  const s = symbol.value.toUpperCase()
  if (s.includes('USDT')) return s.replace('USDT', '/USDT')
  if (s.includes('USD') && !s.includes('/')) return s.replace('USD', '/USD')
  if (s.includes('/')) return s
  return s
})

const getTradingViewSymbol = () => {
  const s = symbol.value.toUpperCase()
  const ex = exchange.value.toUpperCase()
  
  if (['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'DOT', 'MATIC', 'LTC'].some(c => s.includes(c))) {
    return `BINANCE:${s.includes('USDT') ? s : s + 'USDT'}`
  }
  if (['EURUSD', 'GBPUSD', 'USDJPY', 'USDCNY', 'USDCNH'].includes(s.replace('/', ''))) {
    return `FX:${s.replace('/', '')}`
  }
  if (['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'META', 'AMZN'].includes(s)) {
    return `NASDAQ:${s}`
  }
  if (s === 'GOLD' || s === 'XAUUSD') return 'TVC:GOLD'
  if (s === 'SILVER' || s === 'XAGUSD') return 'TVC:SILVER'
  
  return `${ex}:${s}`
}

const initTradingViewWidget = () => {
  if (!chartContainer.value) return
  
  const container = chartContainer.value.querySelector('.tradingview-widget-container__widget')
  if (container) container.innerHTML = ''
  
  if (widgetScript && widgetScript.parentNode) {
    widgetScript.parentNode.removeChild(widgetScript)
  }

  const tvSymbol = getTradingViewSymbol()
  
  widgetScript = document.createElement('script')
  widgetScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
  widgetScript.type = 'text/javascript'
  widgetScript.async = true
  widgetScript.innerHTML = JSON.stringify({
    "autosize": true,
    "symbol": tvSymbol,
    "interval": activeTimeframe.value,
    "timezone": "Asia/Shanghai",
    "theme": "dark",
    "style": "1",
    "locale": "zh_CN",
    "enable_publishing": false,
    "hide_top_toolbar": false,
    "hide_legend": false,
    "hide_side_toolbar": false,
    "allow_symbol_change": false,
    "save_image": false,
    "calendar": false,
    "hide_volume": false,
    "backgroundColor": "rgba(24, 26, 32, 1)",
    "gridColor": "rgba(255, 255, 255, 0.04)",
    "support_host": "https://www.tradingview.com",
    "studies": activeIndicators.value.map(ind => `STD;${ind}`)
  })

  chartContainer.value.appendChild(widgetScript)
  
  setTimeout(() => {
    loading.value = false
  }, 1500)
}

const changeTimeframe = (tf) => {
  activeTimeframe.value = tf
  loading.value = true
  initTradingViewWidget()
}

const toggleIndicator = (ind) => {
  const index = activeIndicators.value.indexOf(ind)
  if (index === -1) {
    activeIndicators.value.push(ind)
  } else {
    activeIndicators.value.splice(index, 1)
  }
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
}

// 模拟价格更新
let priceTimer = null

onMounted(() => {
  initTradingViewWidget()
})

onUnmounted(() => {
  if (priceTimer) clearInterval(priceTimer)
})
</script>
