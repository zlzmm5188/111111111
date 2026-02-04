<template>
  <PageLayout :title="coinInfo.symbol" :show-back="false">
    <template #navbar-left>
      <button class="close-btn" @click="handleClose">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </template>
    <template #navbar-right>
      <button class="star-btn" :class="{ active: isFavorite }" @click="toggleFavorite">
        <svg viewBox="0 0 24 24" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>
    </template>

    <div class="page-content">
      <!-- 币种基本信息 -->
      <div class="coin-hero">
        <div class="coin-identity">
          <img :src="coinInfo.logo" :alt="coinInfo.name" class="coin-logo">
          <div class="coin-names">
            <h1 class="coin-name">{{ coinInfo.name }}</h1>
            <span class="coin-symbol">{{ coinInfo.symbol }}</span>
          </div>
          <div class="coin-badge" :class="coinInfo.type">{{ coinInfo.typeLabel }}</div>
        </div>
        <p class="coin-desc">{{ coinInfo.description }}</p>
      </div>

      <!-- 实时价格 -->
      <div class="price-card">
        <div class="price-main-row">
          <div class="price-left">
            <span class="current-price">{{ formatPrice(priceData.current) }}</span>
            <span class="price-unit">{{ priceData.quote }}</span>
          </div>
          <div class="price-change" :class="priceData.change24h >= 0 ? 'up' : 'down'">
            <span class="change-value">{{ priceData.change24h >= 0 ? '+' : '' }}{{ priceData.change24h.toFixed(2) }}%</span>
            <span class="change-label">24H</span>
          </div>
        </div>
        <div class="price-secondary">
          <span class="fiat-price">{{ formatFiat(priceData.current) }} CNY</span>
          <span class="update-time">{{ lastUpdateTime }}</span>
        </div>
      </div>

      <!-- 市场数据 -->
      <div class="market-data-card">
        <div class="data-grid">
          <div class="data-item">
            <span class="data-label">24H 最高</span>
            <span class="data-value high">{{ formatPrice(priceData.high24h) }}</span>
          </div>
          <div class="data-item">
            <span class="data-label">24H 最低</span>
            <span class="data-value low">{{ formatPrice(priceData.low24h) }}</span>
          </div>
          <div class="data-item">
            <span class="data-label">24H 成交量</span>
            <span class="data-value">{{ formatVolume(priceData.volume24h) }}</span>
          </div>
          <div class="data-item">
            <span class="data-label">市值</span>
            <span class="data-value">{{ formatMarketCap(priceData.marketCap) }}</span>
          </div>
          <div class="data-item">
            <span class="data-label">流通量</span>
            <span class="data-value">{{ formatSupply(priceData.circulatingSupply) }}</span>
          </div>
          <div class="data-item">
            <span class="data-label">总供应量</span>
            <span class="data-value">{{ formatSupply(priceData.totalSupply) }}</span>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <button class="action-btn primary" @click="goTrade">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
          </svg>
          <span>交易</span>
        </button>
        <button class="action-btn" @click="goEarn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
          <span>理财</span>
        </button>
        <button class="action-btn" @click="goChart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3v18h18"/>
            <path d="M18 9l-5 5-4-4-3 3"/>
          </svg>
          <span>K线</span>
        </button>
        <button class="action-btn" @click="share">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
          </svg>
          <span>分享</span>
        </button>
      </div>

      <!-- 简易价格图表 -->
      <div class="chart-section">
        <div class="section-header">
          <h3>价格走势</h3>
          <div class="chart-tabs">
            <button 
              v-for="tab in chartTabs" 
              :key="tab.value"
              class="chart-tab"
              :class="{ active: chartPeriod === tab.value }"
              @click="chartPeriod = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
        <div class="chart-placeholder">
          <div class="chart-line" :class="chartTrend">
            <svg viewBox="0 0 200 60" preserveAspectRatio="none">
              <path :d="chartPath" fill="none" stroke="currentColor" stroke-width="2"/>
              <path :d="chartAreaPath" fill="currentColor" opacity="0.1"/>
            </svg>
          </div>
          <div class="chart-info">
            <span class="chart-high">高: {{ formatPrice(chartData.high) }}</span>
            <span class="chart-low">低: {{ formatPrice(chartData.low) }}</span>
          </div>
        </div>
        <button class="view-chart-btn" @click="goChart">
          <span>查看完整K线图</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- 技术规格 -->
      <div class="specs-section">
        <div class="section-header">
          <h3>技术规格</h3>
        </div>
        <div class="specs-list">
          <div class="spec-item" v-for="spec in technicalSpecs" :key="spec.key">
            <span class="spec-label">{{ spec.label }}</span>
            <span class="spec-value">{{ spec.value }}</span>
          </div>
        </div>
      </div>

      <!-- AGX 黄金储备信息 (仅AGX显示) -->
      <div class="reserve-section" v-if="coinInfo.symbol === 'AGX'">
        <div class="section-header">
          <h3>黄金储备信息</h3>
          <span class="verified-badge">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
            <span>已验证</span>
          </span>
        </div>
        <div class="reserve-card">
          <div class="reserve-hero">
            <div class="reserve-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
              </svg>
            </div>
            <div class="reserve-value">
              <span class="reserve-amount">{{ reserveInfo.totalOz }}</span>
              <span class="reserve-unit">盎司黄金</span>
            </div>
          </div>
          <div class="reserve-details">
            <div class="reserve-row">
              <span class="reserve-label">抵押率</span>
              <span class="reserve-data">{{ reserveInfo.backingRatio }}%</span>
            </div>
            <div class="reserve-row">
              <span class="reserve-label">托管机构</span>
              <span class="reserve-data">{{ reserveInfo.custodian }}</span>
            </div>
            <div class="reserve-row">
              <span class="reserve-label">审计状态</span>
              <span class="reserve-data audit">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                {{ reserveInfo.auditStatus }}
              </span>
            </div>
            <div class="reserve-row">
              <span class="reserve-label">最近审计</span>
              <span class="reserve-data">{{ reserveInfo.lastAudit }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 交易对列表 -->
      <div class="pairs-section">
        <div class="section-header">
          <h3>交易对</h3>
        </div>
        <div class="pairs-list">
          <div 
            class="pair-item" 
            v-for="pair in tradingPairs" 
            :key="pair.symbol"
            @click="goTradePair(pair)"
          >
            <div class="pair-left">
              <span class="pair-name">{{ pair.base }}/{{ pair.quote }}</span>
              <span class="pair-exchange">{{ pair.exchange }}</span>
            </div>
            <div class="pair-right">
              <span class="pair-price">{{ formatPrice(pair.price) }}</span>
              <span class="pair-change" :class="pair.change >= 0 ? 'up' : 'down'">
                {{ pair.change >= 0 ? '+' : '' }}{{ pair.change.toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 相关新闻 -->
      <div class="news-section">
        <div class="section-header">
          <h3>新闻公告</h3>
          <router-link to="/notifications" class="more-link">更多</router-link>
        </div>
        <div class="news-list">
          <div class="news-item" v-for="news in newsList" :key="news.id" @click="openNews(news)">
            <div class="news-content">
              <h4 class="news-title">{{ news.title }}</h4>
              <p class="news-summary">{{ news.summary }}</p>
              <div class="news-meta">
                <span class="news-source">{{ news.source }}</span>
                <span class="news-time">{{ news.time }}</span>
              </div>
            </div>
            <div class="news-thumb" v-if="news.thumb">
              <img :src="news.thumb" :alt="news.title">
            </div>
          </div>
        </div>
      </div>

      <!-- 关于币种 -->
      <div class="about-section">
        <div class="section-header">
          <h3>关于 {{ coinInfo.symbol }}</h3>
        </div>
        <div class="about-content">
          <p>{{ coinInfo.aboutText }}</p>
          <div class="about-links" v-if="coinInfo.links">
            <a 
              v-for="link in coinInfo.links" 
              :key="link.type"
              :href="link.url" 
              target="_blank"
              class="about-link"
            >
              <span class="link-icon" v-html="sanitizeHtml(link.icon)"></span>
              <span>{{ link.label }}</span>
            </a>
          </div>
        </div>
      </div>

      <div class="bottom-space"></div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '../utils/api'
import { sanitizeHtml } from '../utils/sanitize'
import PageLayout from '../components/layout/PageLayout.vue'

const router = useRouter()
const route = useRoute()

// 币种基本信息
const coinInfo = reactive({
  symbol: 'AGX',
  name: 'AGX 升达金指币',
  logo: '/agx-new.png',
  type: 'gold-backed',
  typeLabel: '黄金支撑',
  description: 'AGX 是锚定黄金价值的数字黄金凭证。每个 AGX 代表储存在安全金库中的 0.1 克实物黄金。',
  aboutText: 'AGX 是全球首个基于现代区块链的黄金支撑数字代币。它结合了实物黄金的稳定性和数字资产的便捷性。每个 AGX 代币由持牌托管机构安全保管的 0.1 克真实、经审计的黄金支撑。',
  links: [
    { type: 'website', label: '官网', url: 'https://agx.bi', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' },
    { type: 'whitepaper', label: '白皮书', url: '/whitepaper', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
    { type: 'explorer', label: '浏览器', url: '#', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>' }
  ]
})

// 价格数据
const priceData = reactive({
  current: 0.065,
  quote: 'USDT',
  change24h: 2.5,
  high24h: 0.068,
  low24h: 0.062,
  volume24h: 2847563,
  marketCap: 168000000,
  circulatingSupply: 100000000,
  totalSupply: 500000000
})

// 收藏状态
const isFavorite = ref(false)

// 图表相关
const chartPeriod = ref('1D')
const chartTabs = [
  { label: '1H', value: '1H' },
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' }
]

const chartData = reactive({
  high: 1.72,
  low: 1.64,
  points: [20, 25, 22, 30, 28, 35, 32, 40, 38, 45, 42, 50, 48, 55, 52]
})

const chartTrend = computed(() => {
  const points = chartData.points
  if (points.length < 2) return ''
  return points[points.length - 1] > points[0] ? 'up' : 'down'
})

const chartPath = computed(() => {
  const points = chartData.points
  if (points.length < 2) return ''
  const width = 200
  const height = 60
  const step = width / (points.length - 1)
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  
  let path = `M 0 ${height - ((points[0] - min) / range) * height}`
  for (let i = 1; i < points.length; i++) {
    const x = i * step
    const y = height - ((points[i] - min) / range) * height
    path += ` L ${x} ${y}`
  }
  return path
})

const chartAreaPath = computed(() => {
  const points = chartData.points
  if (points.length < 2) return ''
  const width = 200
  const height = 60
  const step = width / (points.length - 1)
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  
  let path = `M 0 ${height}`
  for (let i = 0; i < points.length; i++) {
    const x = i * step
    const y = height - ((points[i] - min) / range) * height
    path += ` L ${x} ${y}`
  }
  path += ` L ${width} ${height} Z`
  return path
})

// 技术规格
const technicalSpecs = ref([
  { key: 'network', label: '网络', value: 'AGX Chain' },
  { key: 'consensus', label: '共识机制', value: 'DPoS' },
  { key: 'decimals', label: '精度', value: '8' },
  { key: 'block_time', label: '出块时间', value: '3 秒' },
  { key: 'contract', label: '合约地址', value: '0x1234...5678' },
  { key: 'launch', label: '上线时间', value: '2025年1月' }
])

// 黄金储备信息
const reserveInfo = reactive({
  totalOz: '10,000,000',
  backingRatio: 100,
  custodian: 'Brink\'s Global',
  auditStatus: '已审计',
  lastAudit: '2026年1月15日'
})

// 交易对
const tradingPairs = ref([
  { symbol: 'AGXUSDT', base: 'AGX', quote: 'USDT', price: 0.065, change: 2.5, exchange: 'Ascenda' },
  { symbol: 'AGXBTC', base: 'AGX', quote: 'BTC', price: 0.0000065, change: 2.2, exchange: 'Ascenda' },
  { symbol: 'AGXETH', base: 'AGX', quote: 'ETH', price: 0.000019, change: 2.8, exchange: 'Ascenda' }
])

// 新闻列表
const newsList = ref([
  {
    id: 1,
    title: 'AGX 完成第一季度黄金储备审计',
    summary: '第三方审计确认所有流通 AGX 代币由 100% 实物黄金储备支撑。',
    source: 'AGX 官方',
    time: '2小时前',
    thumb: null
  },
  {
    id: 2,
    title: '新理财池上线，年化收益高达 36%',
    summary: 'AGX 持有者现可享受增强收益机会。',
    source: 'AGX 博客',
    time: '5小时前',
    thumb: null
  },
  {
    id: 3,
    title: 'AGX 已上线多家主流交易所',
    summary: '多个一线数字货币交易所已开通交易对。',
    source: '新闻稿',
    time: '1天前',
    thumb: null
  }
])

const lastUpdateTime = computed(() => {
  const now = new Date()
  return `更新于 ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
})

// 格式化函数
const formatPrice = (price) => {
  if (price >= 1) return Number(price).toFixed(4)
  return Number(price).toFixed(8)
}

const formatFiat = (price) => {
  const cnyRate = parseFloat(import.meta.env.VITE_CNY_RATE) || 7.25
  return (price * cnyRate).toFixed(2)
}

const formatVolume = (vol) => {
  if (vol >= 1000000000) return (vol / 1000000000).toFixed(2) + 'B'
  if (vol >= 1000000) return (vol / 1000000).toFixed(2) + 'M'
  if (vol >= 1000) return (vol / 1000).toFixed(2) + 'K'
  return vol.toString()
}

const formatMarketCap = (cap) => {
  if (cap >= 1000000000) return '$' + (cap / 1000000000).toFixed(2) + 'B'
  if (cap >= 1000000) return '$' + (cap / 1000000).toFixed(2) + 'M'
  return '$' + cap.toLocaleString()
}

const formatSupply = (supply) => {
  if (supply >= 1000000000) return (supply / 1000000000).toFixed(2) + 'B'
  if (supply >= 1000000) return (supply / 1000000).toFixed(2) + 'M'
  return supply.toLocaleString()
}

// 操作函数
const handleClose = () => {
  router.back()
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
}

const goTrade = () => {
  router.push(`/trade?pair=${coinInfo.symbol}_USDT`)
}

const goEarn = () => {
  router.push('/earn')
}

const goChart = () => {
  router.push(`/kline?symbol=${coinInfo.symbol}USDT`)
}

const share = () => {
  if (navigator.share) {
    navigator.share({
      title: `${coinInfo.name} (${coinInfo.symbol})`,
      text: `Check out ${coinInfo.symbol} - Current price: $${priceData.current}`,
      url: window.location.href
    })
  }
}

const goTradePair = (pair) => {
  router.push(`/trade?pair=${pair.base}_${pair.quote}`)
}

const openNews = (news) => {
  // Navigate to news detail
  router.push(`/notifications?id=${news.id}`)
}

// 币种配置
const coinConfigs = {
  AGX: {
    name: 'AGX 升达金指币',
    logo: '/agx-new.png',
    type: 'gold-backed',
    typeLabel: '黄金支撑',
    description: 'AGX 是锚定黄金价值的数字黄金凭证。每个 AGX 代表储存在安全金库中的 0.1 克实物黄金。',
    aboutText: 'AGX 是全球首个基于现代区块链的黄金支撑数字代币。它结合了实物黄金的稳定性和数字资产的便捷性。',
    specs: [
      { key: 'network', label: '网络', value: 'AGX Chain' },
      { key: 'consensus', label: '共识机制', value: 'DPoS' },
      { key: 'decimals', label: '精度', value: '8' },
      { key: 'backing', label: '黄金支撑', value: '100%' },
      { key: 'contract', label: '合约地址', value: '0x1234...5678' },
      { key: 'launch', label: '上线时间', value: '2025年1月' }
    ]
  },
  USDT: {
    name: 'Tether 泰达币',
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    type: 'stablecoin',
    typeLabel: '稳定币',
    description: 'USDT 是全球最大的稳定币，与美元 1:1 锚定，广泛用于数字资产交易和价值存储。',
    aboutText: 'Tether (USDT) 是市值最大的稳定币，由 Tether Limited 发行。每个 USDT 代币由等值的美元储备支撑，是数字货币市场中最重要的交易媒介。',
    specs: [
      { key: 'network', label: '支持网络', value: 'TRC20 / ERC20' },
      { key: 'issuer', label: '发行方', value: 'Tether Limited' },
      { key: 'decimals', label: '精度', value: '6' },
      { key: 'peg', label: '锚定', value: '1 USD' },
      { key: 'type', label: '类型', value: '法币稳定币' },
      { key: 'audit', label: '审计', value: '定期审计' }
    ]
  },
  BTC: {
    name: 'Bitcoin 比特币',
    logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    type: 'crypto',
    typeLabel: '加密货币',
    description: 'BTC 是全球第一个去中心化数字货币，被称为数字黄金，是市值最大的加密货币。',
    aboutText: '比特币由中本聪于 2009 年创建，是世界上第一个成功的去中心化数字货币。它使用区块链技术确保交易安全和透明。',
    specs: [
      { key: 'network', label: '网络', value: 'Bitcoin' },
      { key: 'consensus', label: '共识机制', value: 'PoW' },
      { key: 'decimals', label: '精度', value: '8' },
      { key: 'supply', label: '最大供应', value: '2100万' },
      { key: 'halving', label: '减半周期', value: '4年' },
      { key: 'launch', label: '创建时间', value: '2009年1月' }
    ]
  },
  ETH: {
    name: 'Ethereum 以太坊',
    logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    type: 'crypto',
    typeLabel: '智能合约',
    description: 'ETH 是以太坊区块链的原生代币，用于支付交易费用和智能合约执行。',
    aboutText: '以太坊是一个开源的区块链平台，支持智能合约和去中心化应用（DApps）。ETH 是其原生代币。',
    specs: [
      { key: 'network', label: '网络', value: 'Ethereum' },
      { key: 'consensus', label: '共识机制', value: 'PoS' },
      { key: 'decimals', label: '精度', value: '18' },
      { key: 'type', label: '类型', value: '智能合约平台' },
      { key: 'eip', label: '标准', value: 'ERC-20' },
      { key: 'launch', label: '上线时间', value: '2015年7月' }
    ]
  }
}

// 数据加载
let priceTimer = null

const loadCoinData = async () => {
  const symbol = route.params.symbol?.toUpperCase() || 'AGX'
  
  // 加载币种配置
  const config = coinConfigs[symbol] || coinConfigs.AGX
  coinInfo.symbol = symbol
  coinInfo.name = config.name
  coinInfo.logo = config.logo
  coinInfo.type = config.type
  coinInfo.typeLabel = config.typeLabel
  coinInfo.description = config.description
  coinInfo.aboutText = config.aboutText
  technicalSpecs.value = config.specs || technicalSpecs.value
  
  // 根据币种更新交易对
  if (symbol !== 'AGX') {
    tradingPairs.value = [
      { symbol: `${symbol}USDT`, base: symbol, quote: 'USDT', price: 0, change: 0, exchange: 'Ascenda' }
    ]
  }
  
  try {
    if (symbol === 'AGX') {
      // AGX使用专用API
      const priceRes = await api.gold?.getAgx?.()
      if (priceRes?.success && priceRes.data) {
        priceData.current = priceRes.data.price || 0.065
        priceData.change24h = priceRes.data.change24h || 2.5
        priceData.high24h = priceRes.data.high24h || 0.068
        priceData.low24h = priceRes.data.low24h || 0.062
        priceData.volume24h = priceRes.data.volume24h || 2847563
        priceData.marketCap = priceRes.data.marketCap || 168000000
      }
    } else if (symbol === 'USDT') {
      // USDT 稳定币
      priceData.current = 1.00
      priceData.change24h = 0
      priceData.high24h = 1.001
      priceData.low24h = 0.999
      priceData.volume24h = 50000000000
      priceData.marketCap = 95000000000
      priceData.circulatingSupply = 95000000000
      priceData.totalSupply = 95000000000
    } else {
      // 其他币种从市场API获取
      const tickerSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`
      const res = await api.get(`/market/ticker/${tickerSymbol}`)
      if (res.code === 0 && res.data) {
        const ticker = res.data
        priceData.current = parseFloat(ticker.lastPrice || ticker.price || 0)
        priceData.change24h = parseFloat(ticker.priceChangePercent || 0)
        priceData.high24h = parseFloat(ticker.high24h || ticker.highPrice || priceData.current * 1.02)
        priceData.low24h = parseFloat(ticker.low24h || ticker.lowPrice || priceData.current * 0.98)
        priceData.volume24h = parseFloat(ticker.quoteVolume || ticker.volume || 0)
        priceData.marketCap = priceData.volume24h * 100
      }
    }
    
    // 更新交易对价格
    tradingPairs.value.forEach(pair => {
      if (pair.base === symbol && pair.quote === 'USDT') {
        pair.price = priceData.current
        pair.change = priceData.change24h
      }
    })
  } catch (e) {
    console.error('加载币种数据失败:', e)
  }
}

const updatePrice = async () => {
  const symbol = route.params.symbol || 'AGX'
  
  try {
    if (symbol === 'AGX') {
      const res = await api.gold?.getAgx?.()
      if (res?.success && res.data) {
        priceData.current = res.data.price || priceData.current
        priceData.change24h = res.data.change24h || priceData.change24h
      }
    } else {
      const tickerSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`
      const res = await api.get(`/market/ticker/${tickerSymbol}`)
      if (res.code === 0 && res.data) {
        const ticker = res.data
        priceData.current = parseFloat(ticker.lastPrice || ticker.price || priceData.current)
        priceData.change24h = parseFloat(ticker.priceChangePercent || priceData.change24h)
      }
    }
  } catch (e) {
    // Simulate price update
    const delta = (Math.random() - 0.5) * 0.02
    priceData.current = Math.max(priceData.current * 0.95, Math.min(priceData.current * 1.05, priceData.current + delta))
  }
}

onMounted(() => {
  loadCoinData()
  priceTimer = setInterval(updatePrice, 5000)
})

onUnmounted(() => {
  if (priceTimer) clearInterval(priceTimer)
})
</script>

<style scoped>
.coin-detail-page {
  width: 100%;
  max-width: 428px;
  min-height: 100vh;
  margin: 0 auto;
  background: var(--bg-base, #0B0E11);
}

/* Header */
.detail-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: var(--bg-base, #0B0E11);
  border-bottom: 1px solid var(--layer-surface-1, #1E2329);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn, .star-btn, .close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
}

.close-btn svg {
  width: 22px;
  height: 22px;
  color: var(--text-tertiary, #848E9C);
}

.back-btn svg, .star-btn svg {
  width: 20px;
  height: 20px;
  color: var(--text-tertiary, #848E9C);
}

.star-btn.active svg {
  color: var(--color-brand, #C8AA6E);
}

.header-title {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.coin-logo-sm {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.header-title span {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

/* Page Content */
.page-content {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Coin Hero */
.coin-hero {
  padding: 20px 16px;
  background: linear-gradient(180deg, rgba(200, 170, 110, 0.08) 0%, transparent 100%);
}

.coin-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.coin-logo {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(200, 170, 110, 0.3);
}

.coin-names {
  flex: 1;
}

.coin-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #EAECEF);
  margin: 0 0 2px;
}

.coin-symbol {
  font-size: 14px;
  color: var(--text-tertiary, #848E9C);
}

.coin-badge {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  text-transform: uppercase;
}

.coin-badge.gold-backed {
  background: rgba(200, 170, 110, 0.15);
  color: var(--color-brand, #C8AA6E);
}

.coin-desc {
  font-size: 13px;
  color: var(--text-tertiary, #848E9C);
  line-height: 1.5;
  margin: 0;
}

/* Price Card */
.price-card {
  margin: 0 16px 16px;
  padding: 16px;
  background: var(--bg-elevated, #14181C);
  border: 1px solid var(--layer-surface-1, #1E2329);
  border-radius: 12px;
}

.price-main-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.price-left {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.current-price {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary, #EAECEF);
  font-variant-numeric: tabular-nums;
}

.price-unit {
  font-size: 14px;
  color: var(--text-tertiary, #848E9C);
}

.price-change {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 6px 10px;
  border-radius: 6px;
}

.price-change.up {
  background: rgba(14, 203, 129, 0.12);
}

.price-change.down {
  background: rgba(246, 70, 93, 0.12);
}

.change-value {
  font-size: 16px;
  font-weight: 700;
}

.price-change.up .change-value { color: var(--color-up, #0ECB81); }
.price-change.down .change-value { color: var(--color-down, #F6465D); }

.change-label {
  font-size: 10px;
  color: var(--text-quaternary, #5E6673);
}

.price-secondary {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fiat-price {
  font-size: 14px;
  color: var(--text-tertiary, #848E9C);
}

.update-time {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
}

/* Market Data */
.market-data-card {
  margin: 0 16px 16px;
  padding: 16px;
  background: var(--bg-elevated, #14181C);
  border: 1px solid var(--layer-surface-1, #1E2329);
  border-radius: 12px;
}

.data-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.data-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-label {
  font-size: 12px;
  color: var(--text-quaternary, #5E6673);
}

.data-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
  font-variant-numeric: tabular-nums;
}

.data-value.high { color: var(--color-up, #0ECB81); }
.data-value.low { color: var(--color-down, #F6465D); }

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 10px;
  padding: 0 16px 16px;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: var(--bg-elevated, #14181C);
  border: 1px solid var(--layer-surface-1, #1E2329);
  border-radius: 10px;
  cursor: pointer;
  transition: all 150ms;
}

.action-btn:active {
  transform: scale(0.98);
  background: var(--layer-surface-1, #1E2329);
}

.action-btn svg {
  width: 22px;
  height: 22px;
  color: var(--text-tertiary, #848E9C);
}

.action-btn span {
  font-size: 12px;
  color: var(--text-secondary, #B7BDC6);
}

.action-btn.primary {
  background: rgba(200, 170, 110, 0.12);
  border-color: rgba(200, 170, 110, 0.3);
}

.action-btn.primary svg {
  color: var(--color-brand, #C8AA6E);
}

.action-btn.primary span {
  color: var(--color-brand, #C8AA6E);
}

/* Chart Section */
.chart-section {
  margin: 0 16px 16px;
  padding: 16px;
  background: var(--bg-elevated, #14181C);
  border: 1px solid var(--layer-surface-1, #1E2329);
  border-radius: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
  margin: 0;
}

.chart-tabs {
  display: flex;
  gap: 4px;
}

.chart-tab {
  padding: 4px 10px;
  background: transparent;
  border: none;
  font-size: 12px;
  color: var(--text-quaternary, #5E6673);
  cursor: pointer;
  border-radius: 4px;
}

.chart-tab.active {
  background: var(--layer-surface-1, #1E2329);
  color: var(--text-primary, #EAECEF);
}

.chart-placeholder {
  height: 100px;
  position: relative;
  margin-bottom: 12px;
}

.chart-line {
  width: 100%;
  height: 60px;
}

.chart-line svg {
  width: 100%;
  height: 100%;
}

.chart-line.up { color: var(--color-up, #0ECB81); }
.chart-line.down { color: var(--color-down, #F6465D); }

.chart-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.chart-high, .chart-low {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
}

.view-chart-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: var(--layer-surface-1, #1E2329);
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.view-chart-btn span {
  font-size: 13px;
  color: var(--text-secondary, #B7BDC6);
}

.view-chart-btn svg {
  width: 16px;
  height: 16px;
  color: var(--text-tertiary, #848E9C);
}

/* Specs Section */
.specs-section {
  margin: 0 16px 16px;
  padding: 16px;
  background: var(--bg-elevated, #14181C);
  border: 1px solid var(--layer-surface-1, #1E2329);
  border-radius: 12px;
}

.specs-list {
  display: flex;
  flex-direction: column;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--layer-surface-1, #1E2329);
}

.spec-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.spec-item:first-child {
  padding-top: 0;
}

.spec-label {
  font-size: 13px;
  color: var(--text-quaternary, #5E6673);
}

.spec-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #EAECEF);
  font-family: monospace;
}

/* Reserve Section */
.reserve-section {
  margin: 0 16px 16px;
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(14, 203, 129, 0.12);
  border-radius: 4px;
}

.verified-badge svg {
  width: 14px;
  height: 14px;
  color: var(--color-up, #0ECB81);
}

.verified-badge span {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-up, #0ECB81);
}

.reserve-card {
  padding: 16px;
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.1) 0%, rgba(200, 170, 110, 0.02) 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 12px;
}

.reserve-hero {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(200, 170, 110, 0.15);
  margin-bottom: 16px;
}

.reserve-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200, 170, 110, 0.15);
  border-radius: 12px;
}

.reserve-icon svg {
  width: 28px;
  height: 28px;
  color: var(--color-brand, #C8AA6E);
}

.reserve-value {
  display: flex;
  flex-direction: column;
}

.reserve-amount {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-brand, #C8AA6E);
}

.reserve-unit {
  font-size: 13px;
  color: var(--text-tertiary, #848E9C);
}

.reserve-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reserve-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reserve-label {
  font-size: 13px;
  color: var(--text-quaternary, #5E6673);
}

.reserve-data {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #EAECEF);
}

.reserve-data.audit {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-up, #0ECB81);
}

.reserve-data.audit svg {
  width: 14px;
  height: 14px;
}

/* Pairs Section */
.pairs-section {
  margin: 0 16px 16px;
}

.pairs-list {
  background: var(--bg-elevated, #14181C);
  border: 1px solid var(--layer-surface-1, #1E2329);
  border-radius: 12px;
  overflow: hidden;
}

.pair-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--layer-surface-1, #1E2329);
  cursor: pointer;
  transition: background 150ms;
}

.pair-item:last-child {
  border-bottom: none;
}

.pair-item:active {
  background: var(--layer-surface-1, #1E2329);
}

.pair-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pair-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.pair-exchange {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
}

.pair-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.pair-price {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #EAECEF);
  font-variant-numeric: tabular-nums;
}

.pair-change {
  font-size: 12px;
  font-weight: 500;
}

.pair-change.up { color: var(--color-up, #0ECB81); }
.pair-change.down { color: var(--color-down, #F6465D); }

/* News Section */
.news-section {
  margin: 0 16px 16px;
}

.more-link {
  font-size: 13px;
  color: var(--color-brand, #C8AA6E);
  text-decoration: none;
}

.news-list {
  background: var(--bg-elevated, #14181C);
  border: 1px solid var(--layer-surface-1, #1E2329);
  border-radius: 12px;
  overflow: hidden;
}

.news-item {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--layer-surface-1, #1E2329);
  cursor: pointer;
  transition: background 150ms;
}

.news-item:last-child {
  border-bottom: none;
}

.news-item:active {
  background: var(--layer-surface-1, #1E2329);
}

.news-content {
  flex: 1;
  min-width: 0;
}

.news-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
  margin: 0 0 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-summary {
  font-size: 12px;
  color: var(--text-quaternary, #5E6673);
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.news-meta {
  display: flex;
  gap: 12px;
}

.news-source, .news-time {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
}

.news-thumb {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.news-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* About Section */
.about-section {
  margin: 0 16px 16px;
  padding: 16px;
  background: var(--bg-elevated, #14181C);
  border: 1px solid var(--layer-surface-1, #1E2329);
  border-radius: 12px;
}

.about-content p {
  font-size: 13px;
  color: var(--text-tertiary, #848E9C);
  line-height: 1.6;
  margin: 0 0 16px;
}

.about-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.about-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--layer-surface-1, #1E2329);
  border-radius: 8px;
  text-decoration: none;
  transition: background 150ms;
}

.about-link:active {
  background: var(--layer-surface-2, #2B3139);
}

.link-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.link-icon :deep(svg) {
  width: 16px;
  height: 16px;
  color: var(--text-tertiary, #848E9C);
}

.about-link span {
  font-size: 12px;
  color: var(--text-secondary, #B7BDC6);
}

/* Bottom Space */
.bottom-space {
  height: calc(80px + env(safe-area-inset-bottom));
}
</style>
