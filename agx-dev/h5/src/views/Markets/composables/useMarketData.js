import { ref, computed, watch } from 'vue'
import api from '../../../utils/api'

export function useMarketData() {
  const loading = ref(false)
  const activeCategory = ref('stock')
  const futuresTab = ref('index')

  // Ticker数据
  const tickerList = ref([
    { symbol: '上证', change: 2.15, flag: 'https://flagcdn.com/w40/cn.png' },
    { symbol: 'EUR/USD', change: 0.12, flag: 'https://flagcdn.com/w40/eu.png' },
    { symbol: 'GBP/USD', change: -0.08, flag: 'https://flagcdn.com/w40/gb.png' },
    { symbol: 'USD/JPY', change: 0.25, flag: 'https://flagcdn.com/w40/jp.png' },
    { symbol: 'AUD/USD', change: 0.32, flag: 'https://flagcdn.com/w40/au.png' },
    { symbol: 'USD/CNH', change: -0.15, flag: 'https://flagcdn.com/w40/cn.png' },
    { symbol: 'USD/CHF', change: 0.05, flag: 'https://flagcdn.com/w40/ch.png' },
    { symbol: 'BTC', change: 1.82, flag: '/crypto/btc.png' },
    { symbol: '黄金', change: 0.85, flag: '/gold-bar.png' },
  ])

  // 股票数据
  const majorIndexes = ref([
    { name: '上证', code: '000001', price: '3,398', change: 2.15, flash: '' },
    { name: '深证', code: '399001', price: '10,896', change: 3.02, flash: '' },
    { name: '创业板', code: '399006', price: '2,156', change: 3.85, flash: '' },
  ])

  const hotStocks = ref([
    { name: '中国平安', code: '601318', price: '48.56', change: 6.88, flash: '' },
    { name: '中信证券', code: '600030', price: '25.80', change: 5.92, flash: '' },
    { name: '东方财富', code: '300059', price: '18.25', change: 5.45, flash: '' },
    { name: '北方稀土', code: '600111', price: '32.10', change: 4.85, flash: '' },
  ])

  const hotStocksCompact = ref([
    { name: '中国银行', code: '601988', price: '5.67', change: -1.05, color: '#C41230', logo: '/logos/stock/boc.svg', flash: '' },
    { name: '贵州茅台', code: '600519', price: '1568.00', change: 2.35, color: '#B8860B', logo: '/logos/stock/moutai.svg', flash: '' },
    { name: '宁德时代', code: '300750', price: '186.50', change: 9.98, color: '#00A650', logo: '/logos/stock/catl.svg', flash: '' },
    { name: '比亚迪', code: '002594', price: '265.30', change: 8.25, color: '#1E3A8A', logo: '/logos/stock/byd.svg', flash: '' },
    { name: '招商银行', code: '600036', price: '35.82', change: -0.56, color: '#E31937', logo: '/logos/stock/cmb.svg', flash: '' },
    { name: '平安银行', code: '000001', price: '12.45', change: 1.23, color: '#FF6600', logo: '/logos/stock/pingan.svg', flash: '' },
  ])

  // 期货数据
  const futuresData = ref({
    index: [
      { name: '沪深300', symbol: 'IF2501', price: '4,215', change: 2.35, open: '4,180', high: '4,256', low: '4,165', volume: '18.5万', color: '#E31937', flash: '', priceFlash: '' },
      { name: '上证50', symbol: 'IH2501', price: '2,856', change: 1.92, open: '2,820', high: '2,875', low: '2,810', volume: '12.3万', color: '#1E90FF', flash: '', priceFlash: '' },
      { name: '中证500', symbol: 'IC2501', price: '5,128', change: 2.78, open: '5,050', high: '5,168', low: '5,030', volume: '8.6万', color: '#32CD32', flash: '', priceFlash: '' },
      { name: '中证1000', symbol: 'IM2501', price: '5,856', change: 3.15, open: '5,750', high: '5,920', low: '5,720', volume: '6.2万', color: '#FF6B35', flash: '', priceFlash: '' },
    ],
    metal: [
      { name: '黄金', symbol: 'AU2506', price: '625.58', change: 0.85, color: '#FFD700', flash: '', priceFlash: '' },
      { name: '白银', symbol: 'AG2506', price: '7,856', change: 1.45, color: '#C0C0C0', flash: '', priceFlash: '' },
      { name: '铜', symbol: 'CU2503', price: '69,850', change: 0.65, color: '#B87333', flash: '', priceFlash: '' },
      { name: '铝', symbol: 'AL2503', price: '19,250', change: -0.35, color: '#848482', flash: '', priceFlash: '' },
    ],
    energy: [
      { name: '原油', symbol: 'SC2503', price: '568.5', change: -1.25, color: '#2C3E50', flash: '', priceFlash: '' },
      { name: '燃油', symbol: 'FU2505', price: '3,125', change: -0.85, color: '#34495E', flash: '', priceFlash: '' },
      { name: 'LPG', symbol: 'PG2503', price: '4,568', change: 0.55, color: '#7F8C8D', flash: '', priceFlash: '' },
      { name: '天然气', symbol: 'NG2503', price: '3.256', change: -2.15, color: '#3498DB', flash: '', priceFlash: '' },
    ],
    agri: [
      { name: '豆粕', symbol: 'M2505', price: '3,256', change: 1.25, color: '#8B4513', flash: '', priceFlash: '' },
      { name: '玉米', symbol: 'C2505', price: '2,456', change: 0.65, color: '#DAA520', flash: '', priceFlash: '' },
      { name: '白糖', symbol: 'SR2505', price: '6,125', change: -0.35, color: '#F5DEB3', flash: '', priceFlash: '' },
      { name: '棉花', symbol: 'CF2505', price: '15,680', change: 0.85, color: '#DEB887', flash: '', priceFlash: '' },
    ],
  })
  const currentFutures = computed(() => futuresData.value[futuresTab.value] || [])

  // 外汇数据
  const forexPairList = ref([
    { symbol: 'EURUSD', name: 'EUR/USD', code: 'EURUSD', price: '1.08756', change: 0.15, flag: 'https://flagcdn.com/w40/eu.png', flash: '' },
    { symbol: 'GBPUSD', name: 'GBP/USD', code: 'GBPUSD', price: '1.26532', change: 0.28, flag: 'https://flagcdn.com/w40/gb.png', flash: '' },
    { symbol: 'USDJPY', name: 'USD/JPY', code: 'USDJPY', price: '149.856', change: -0.18, flag: 'https://flagcdn.com/w40/jp.png', flash: '' },
    { symbol: 'XAUUSD', name: 'XAU/USD', code: 'XAUUSD', price: '2645.85', change: 0.92, flag: 'https://flagcdn.com/w40/un.png', flash: '' },
  ])

  const forexIndexList = ref([
    { name: '美元指数', code: 'DXY', flag: 'https://flagcdn.com/w40/us.png', value: '103.85', change: 0.15 },
    { name: '欧元指数', code: 'EXY', flag: 'https://flagcdn.com/w40/eu.png', value: '105.32', change: -0.12 },
    { name: '英镑指数', code: 'BXY', flag: 'https://flagcdn.com/w40/gb.png', value: '118.56', change: 0.08 },
    { name: '日元指数', code: 'JXY', flag: 'https://flagcdn.com/w40/jp.png', value: '82.15', change: -0.25 },
  ])

  const forexMatrixCols = [
    { code: 'EUR', flag: 'https://flagcdn.com/w40/eu.png' },
    { code: 'USD', flag: 'https://flagcdn.com/w40/us.png' },
    { code: 'GBP', flag: 'https://flagcdn.com/w40/gb.png' },
    { code: 'JPY', flag: 'https://flagcdn.com/w40/jp.png' },
    { code: 'CHF', flag: 'https://flagcdn.com/w40/ch.png' },
  ]
  const forexMatrixRows = [...forexMatrixCols]

  const forexPairData = ref({
    'EUR/USD': 0.13, 'EUR/GBP': 0.01, 'EUR/JPY': 0.21, 'EUR/CHF': 0.09,
    'USD/EUR': -0.12, 'USD/GBP': -0.13, 'USD/JPY': 0.08, 'USD/CHF': -0.04,
    'GBP/EUR': 0.01, 'GBP/USD': 0.14, 'GBP/JPY': 0.18, 'GBP/CHF': 0.05,
    'JPY/EUR': -0.21, 'JPY/USD': -0.08, 'JPY/GBP': -0.18, 'JPY/CHF': -0.12,
    'CHF/EUR': -0.09, 'CHF/USD': 0.04, 'CHF/GBP': -0.05, 'CHF/JPY': 0.12,
  })

  // 债券数据 - 真实数据 (2025年1月)
  const bondList = ref([
    { country: '美国', code: 'US', flag: 'https://flagcdn.com/w40/us.png', m3: '4.32', m6: '4.28', y1: '4.18', y2: '4.26', y5: '4.38', y10: '4.58', y30: '4.82', change10y: 5, rating: 'AA+', flash: '' },
    { country: '中国', code: 'CN', flag: 'https://flagcdn.com/w40/cn.png', m3: '1.45', m6: '1.52', y1: '1.48', y2: '1.52', y5: '1.68', y10: '1.68', y30: '1.92', change10y: -2, rating: 'A+', flash: '' },
    { country: '日本', code: 'JP', flag: 'https://flagcdn.com/w40/jp.png', m3: '0.35', m6: '0.48', y1: '0.62', y2: '0.68', y5: '0.82', y10: '1.18', y30: '2.28', change10y: 3, rating: 'A+', flash: '' },
    { country: '德国', code: 'DE', flag: 'https://flagcdn.com/w40/de.png', m3: '2.62', m6: '2.48', y1: '2.32', y2: '2.18', y5: '2.28', y10: '2.52', y30: '2.78', change10y: 2, rating: 'AAA', flash: '' },
    { country: '英国', code: 'GB', flag: 'https://flagcdn.com/w40/gb.png', m3: '4.42', m6: '4.38', y1: '4.28', y2: '4.32', y5: '4.38', y10: '4.62', y30: '5.18', change10y: 4, rating: 'AA', flash: '' },
    { country: '法国', code: 'FR', flag: 'https://flagcdn.com/w40/fr.png', m3: '2.72', m6: '2.68', y1: '2.58', y2: '2.62', y5: '2.82', y10: '3.28', y30: '3.68', change10y: 3, rating: 'AA', flash: '' },
    { country: '澳大利亚', code: 'AU', flag: 'https://flagcdn.com/w40/au.png', m3: '4.18', m6: '4.22', y1: '4.12', y2: '4.08', y5: '4.22', y10: '4.52', y30: '4.82', change10y: 7, rating: 'AAA', flash: '' },
    { country: '加拿大', code: 'CA', flag: 'https://flagcdn.com/w40/ca.png', m3: '3.18', m6: '3.12', y1: '2.98', y2: '2.92', y5: '3.02', y10: '3.28', y30: '3.42', change10y: 4, rating: 'AAA', flash: '' },
  ])

  // 加密货币数据
  const cryptoList = ref([
    { symbol: 'BTC', name: '比特币', price: '98,750', change: 2.15, marketCap: '1.93T', logo: '/crypto/btc.png', bg: '#F7931A', flash: '' },
    { symbol: 'ETH', name: '以太坊', price: '3,456', change: 1.82, marketCap: '415B', logo: '/crypto/eth.png', bg: '#627EEA', flash: '' },
    { symbol: 'BNB', name: '币安币', price: '712', change: 0.95, marketCap: '106B', logo: '/crypto/bnb.png', bg: '#F3BA2F', flash: '' },
    { symbol: 'SOL', name: '索拉纳', price: '198', change: 3.45, marketCap: '86B', logo: '/crypto/sol.png', bg: '#9945FF', flash: '' },
    { symbol: 'XRP', name: '瑞波币', price: '2.19', change: -1.23, marketCap: '125B', logo: '/crypto/xrp.png', bg: '#23292F', flash: '' },
    { symbol: 'DOGE', name: '狗狗币', price: '0.38', change: 5.67, marketCap: '56B', logo: '/crypto/doge.png', bg: '#C2A633', flash: '' },
  ])

  // 工具函数
  const formatPrice = (price) => {
    const p = parseFloat(price)
    if (p >= 10000) return p.toLocaleString('en-US', { maximumFractionDigits: 0 })
    if (p >= 100) return p.toFixed(2)
    if (p >= 1) return p.toFixed(4)
    return p.toFixed(6)
  }

  const formatVolume = (vol) => {
    const v = parseFloat(vol || 0)
    if (v >= 1e8) return (v / 1e8).toFixed(1) + '亿'
    if (v >= 1e4) return (v / 1e4).toFixed(1) + '万'
    return v.toFixed(0)
  }

  const fmtPct = (v) => v !== undefined ? (v >= 0 ? '+' : '') + Number(v).toFixed(2) + '%' : '--'

  // 数据加载
  const loadMarketData = async () => {
    loading.value = true
    try {
      // 加载加密货币
      const cryptoRes = await api.market.getTickers({ type: 'crypto', tab: 'all' })
      if (cryptoRes.success && cryptoRes.data?.list) {
        const oldPrices = Object.fromEntries(cryptoList.value.map(c => [c.symbol, c.price]))
        cryptoList.value = cryptoRes.data.list.map(item => {
          const symbol = item.symbol?.replace('USDT', '') || item.name
          const newPrice = formatPrice(item.lastPrice)
          const oldPrice = oldPrices[symbol]
          let flash = ''
          if (oldPrice && newPrice !== oldPrice) {
            flash = parseFloat(newPrice.replace(/,/g, '')) > parseFloat(oldPrice.replace(/,/g, '')) ? 'flash-up' : 'flash-down'
            setTimeout(() => {
              const idx = cryptoList.value.findIndex(c => c.symbol === symbol)
              if (idx >= 0) cryptoList.value[idx].flash = ''
            }, 800)
          }
          return {
            symbol,
            name: item.name || item.symbol?.replace('USDT', ''),
            price: newPrice,
            change: parseFloat(item.priceChangePercent || 0),
            marketCap: item.marketCap || '0',
            logo: `/crypto/${(item.symbol?.replace('USDT', '') || '').toLowerCase()}.png`,
            flash
          }
        })
      }

      // 加载外汇
      const forexRes = await api.market.getTickers({ type: 'forex', tab: 'all' })
      if (forexRes.success && forexRes.data?.list) {
        const oldPrices = Object.fromEntries(forexPairList.value.map(f => [f.symbol, f.price]))
        forexPairList.value = forexRes.data.list.map(item => {
          const symbol = item.symbol?.replace('/', '') || item.symbol
          const newPrice = parseFloat(item.lastPrice || 0).toFixed(5)
          const oldPrice = oldPrices[symbol]
          let flash = ''
          if (oldPrice && newPrice !== oldPrice) {
            flash = parseFloat(newPrice) > parseFloat(oldPrice) ? 'flash-up' : 'flash-down'
            setTimeout(() => {
              const idx = forexPairList.value.findIndex(f => f.symbol === symbol)
              if (idx >= 0) forexPairList.value[idx].flash = ''
            }, 800)
          }
          return {
            symbol,
            name: item.name || item.symbol,
            code: symbol,
            price: newPrice,
            change: parseFloat(item.priceChangePercent || 0),
            flag: item.flag || `https://flagcdn.com/w40/${(item.symbol?.split('/')[0] || '').toLowerCase() === 'eur' ? 'eu' : (item.symbol?.split('/')[0] || '').toLowerCase()}.png`,
            flash
          }
        })
      }

      // 加载股票/指数
      const stockRes = await api.market.getTickers({ type: 'stocks', tab: 'all' })
      if (stockRes.success && stockRes.data?.list) {
        const indexes = stockRes.data.list.filter(s => ['SH000001', 'SZ399001', 'SZ399006'].includes(s.symbol))
        if (indexes.length > 0) {
          const oldPrices = Object.fromEntries(majorIndexes.value.map(s => [s.code, s.price]))
          majorIndexes.value = indexes.map(item => {
            const newPrice = formatPrice(item.lastPrice)
            const oldPrice = oldPrices[item.symbol]
            let flash = ''
            if (oldPrice && newPrice !== oldPrice) {
              flash = parseFloat(newPrice.replace(/,/g, '')) > parseFloat(oldPrice.replace(/,/g, '')) ? 'flash-up' : 'flash-down'
              setTimeout(() => {
                const idx = majorIndexes.value.findIndex(s => s.code === item.symbol)
                if (idx >= 0) majorIndexes.value[idx].flash = ''
              }, 800)
            }
            return {
              name: item.name,
              code: item.symbol,
              price: newPrice,
              change: parseFloat(item.priceChangePercent || 0),
              flash
            }
          })
        }
      }
    } catch (e) {
      console.error('加载行情数据失败:', e)
    }
    loading.value = false
  }

  const loadFuturesData = async () => {
    try {
      const res = await api.market.getTickers({ type: 'futures', tab: futuresTab.value })
      if (res.success && res.data?.list?.length > 0) {
        futuresData.value[futuresTab.value] = res.data.list.map(item => ({
          name: item.name || item.symbol,
          symbol: item.symbol,
          price: formatPrice(item.lastPrice),
          change: parseFloat(item.priceChangePercent || 0),
          flash: '',
          priceFlash: ''
        }))
      }
    } catch (e) {
      console.log('使用本地期货数据')
    }
  }

  // 矩阵辅助函数
  const getMatrixValue = (row, col) => {
    if (row === col) return ''
    const key = `${row}/${col}`
    const val = forexPairData.value[key]
    if (val === undefined) return '--'
    return (val >= 0 ? '+' : '') + val.toFixed(2) + '%'
  }

  const getMatrixCellClass = (row, col) => {
    if (row === col) return 'fm-cell-empty'
    const key = `${row}/${col}`
    const val = forexPairData.value[key]
    if (val === undefined) return ''
    if (val >= 0.1) return 'fm-cell-up-3'
    if (val >= 0.05) return 'fm-cell-up-2'
    if (val >= 0) return 'fm-cell-up-1'
    if (val >= -0.05) return 'fm-cell-down-1'
    if (val >= -0.1) return 'fm-cell-down-2'
    return 'fm-cell-down-3'
  }

  return {
    loading,
    activeCategory,
    futuresTab,
    tickerList,
    majorIndexes,
    hotStocks,
    hotStocksCompact,
    futuresData,
    currentFutures,
    forexPairList,
    forexIndexList,
    forexMatrixCols,
    forexMatrixRows,
    forexPairData,
    bondList,
    cryptoList,
    formatPrice,
    formatVolume,
    fmtPct,
    loadMarketData,
    loadFuturesData,
    getMatrixValue,
    getMatrixCellClass,
  }
}
