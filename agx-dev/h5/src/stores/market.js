import { defineStore } from 'pinia'
import api from '../utils/api'

export const useMarketStore = defineStore('market', {
  state: () => ({
    // 各板块数据
    cryptoList: [],
    forexList: [],
    fundList: [],
    bondList: [],
    
    // 热门币种（首页展示）
    hotCoins: [],
    
    // 黄金价格
    goldPrice: {
      price: 0,
      change: 0,
      high: 0,
      low: 0,
      updatedAt: null
    },
    
    // AGX价格
    agxPrice: {
      price: 1.68,
      change: 0,
      marketCap: 0,
      volume24h: 0
    },
    
    // 加载状态
    loading: false,
    lastFetchTime: null,
    
    // 缓存时间（毫秒）
    cacheTime: 30000 // 30秒
  }),

  getters: {
    // 获取指定板块数据
    getListByCategory: (state) => (category) => {
      const map = {
        crypto: state.cryptoList,
        forex: state.forexList,
        fund: state.fundList,
        bond: state.bondList
      }
      return map[category] || []
    },
    
    // 获取滚动条数据（热门8个）
    tickerData: (state) => {
      const data = []
      if (state.cryptoList.length) {
        data.push(...state.cryptoList.slice(0, 4).map(c => ({
          symbol: c.symbol,
          price: c.price,
          change: c.change,
          decimals: c.decimals || 2
        })))
      }
      if (state.forexList.length) {
        data.push(...state.forexList.slice(0, 2).map(f => ({
          symbol: f.symbol,
          price: f.price,
          change: f.change,
          decimals: f.decimals || 4
        })))
      }
      return data
    },
    
    // 是否需要刷新
    needRefresh: (state) => {
      if (!state.lastFetchTime) return true
      return Date.now() - state.lastFetchTime > state.cacheTime
    }
  },

  actions: {
    // 初始化所有行情数据
    async initMarketData() {
      if (!this.needRefresh && this.cryptoList.length > 0) {
        return // 使用缓存
      }
      
      this.loading = true
      try {
        await Promise.all([
          this.fetchCryptoList(),
          this.fetchGoldPrice()
        ])
        this.lastFetchTime = Date.now()
      } catch (e) {
        console.error('行情数据加载失败:', e)
      } finally {
        this.loading = false
      }
    },
    
    // 获取加密货币列表
    async fetchCryptoList() {
      try {
        const res = await api.market?.getTickers?.('crypto', 'all')
        if (res?.success && res.data?.list) {
          this.cryptoList = res.data.list.map(item => ({
            symbol: item.symbol?.replace('USDT', '') || item.symbol,
            name: item.name || item.symbol,
            price: parseFloat(item.price || 0),
            change: parseFloat(item.change24h || 0),
            volume: parseFloat(item.volume || 0),
            icon: item.icon || `https://assets.coingecko.com/coins/images/1/small/bitcoin.png`,
            decimals: this.getDecimals(item.price)
          }))
          
          // 更新热门币种
          this.hotCoins = this.cryptoList.slice(0, 5)
        }
      } catch (e) {
        // 使用默认数据
        this.setDefaultCryptoData()
      }
    },
    
    // 获取黄金价格
    async fetchGoldPrice() {
      try {
        const res = await api.gold?.getPrices?.()
        if (res?.success && res.data) {
          const gold = res.data.gold || res.data
          this.goldPrice = {
            price: parseFloat(gold.price || 2045),
            change: parseFloat(gold.change24h || 0),
            high: parseFloat(gold.high24h || 0),
            low: parseFloat(gold.low24h || 0),
            updatedAt: new Date()
          }
        }
      } catch (e) {
        this.goldPrice.price = 2045.30
        this.goldPrice.change = 0.35
      }
    },
    
    // 更新AGX价格
    updateAgxPrice(data) {
      this.agxPrice = { ...this.agxPrice, ...data }
    },
    
    // 根据价格计算小数位
    getDecimals(price) {
      const p = parseFloat(price)
      if (p >= 1000) return 2
      if (p >= 1) return 2
      if (p >= 0.01) return 4
      return 6
    },
    
    // 设置默认加密货币数据（API失败时使用）
    setDefaultCryptoData() {
      this.cryptoList = [
        { symbol: 'BTC', name: '比特币', price: 98750.32, change: 2.15, decimals: 2, icon: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
        { symbol: 'ETH', name: '以太坊', price: 3456.78, change: 1.82, decimals: 2, icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
        { symbol: 'BNB', name: '币安币', price: 712.45, change: 0.95, decimals: 2, icon: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
        { symbol: 'SOL', name: '索拉纳', price: 198.34, change: 3.45, decimals: 2, icon: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
        { symbol: 'XRP', name: '瑞波币', price: 2.1856, change: -1.23, decimals: 4, icon: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png' }
      ]
      this.hotCoins = this.cryptoList.slice(0, 5)
    },
    
    // 清除缓存强制刷新
    invalidateCache() {
      this.lastFetchTime = null
    }
  }
})
