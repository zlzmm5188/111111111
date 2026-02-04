import { defineStore } from 'pinia'
import api from '@/utils/api'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 主题模式
    theme: localStorage.getItem('theme') || 'dark',
    
    // 语言
    locale: localStorage.getItem('locale') || 'zh-CN',
    
    // 网络状态
    isOnline: navigator.onLine,
    
    // 全局加载
    globalLoading: false,
    
    // Toast队列
    toasts: [],
    
    // 系统公告
    announcements: [],
    unreadAnnouncements: 0,
    
    // 版本信息
    version: '2.0.0',
    
    // 功能开关 - 从后台加载
    features: {
      // 交易模块
      spot: true,       // 现货交易
      contract: true,   // 秒合约
      gold: true,       // 黄金交易
      otc: true,        // OTC交易
      // 资产模块
      deposit: true,    // 充值
      withdraw: true,   // 提现
      transfer: true,   // 划转
      pool: true,       // 矿池理财
      // 社交模块
      allow_post: true,      // 发帖
      allow_comment: true,   // 评论
      allow_like: true,      // 点赞
      allow_add_friend: true,// 加好友
      allow_chat: true,      // 私聊
      follow: true,          // 关注
      // 用户模块
      register: true,  // 新用户注册
      kyc: true,       // KYC认证
      invite: true,    // 邀请功能
      rank: true,      // 排行榜
      // 行情模块
      crypto: true,    // 加密货币行情
      forex: false,    // 外汇行情
      stock: false,    // 股票行情
      metal: true,     // 贵金属行情
      // 其他功能
      notice: true,    // 公告弹窗
      banner: true,    // 轮播Banner
      chat: true,      // 在线客服
      feedback: true   // 意见反馈
    },
    
    // 平台配置
    platformConfig: {
      platformName: 'AGX',
      customerServiceUrl: '',
      websiteUrl: ''
    },
    
    // 初始化状态
    initialized: false
  }),

  getters: {
    isDarkMode: (state) => state.theme === 'dark',
    
    isFeatureEnabled: (state) => (feature) => {
      return state.features[feature] ?? false
    }
  },

  actions: {
    // 初始化应用
    async initApp() {
      if (this.initialized) return
      
      // 监听网络状态
      window.addEventListener('online', () => { this.isOnline = true })
      window.addEventListener('offline', () => { this.isOnline = false })
      
      // 加载系统配置
      await this.loadSystemConfig()
      
      this.initialized = true
    },
    
    // 加载系统配置
    async loadSystemConfig() {
      try {
        // 并行获取功能开关和公告
        const [togglesRes, announcementsRes] = await Promise.allSettled([
          api.system.getToggles(),
          api.system.getAnnouncements()
        ])
        
        // 更新功能开关
        if (togglesRes.status === 'fulfilled' && togglesRes.value?.success) {
          const toggleMap = {}
          const list = togglesRes.value.data?.list || togglesRes.value.data || []
          list.forEach(t => { toggleMap[t.key] = t.enabled === 1 })
          
          // 合并到features
          Object.keys(this.features).forEach(key => {
            if (toggleMap[key] !== undefined) {
              this.features[key] = toggleMap[key]
            }
          })
        }
        
        // 更新公告
        if (announcementsRes.status === 'fulfilled' && announcementsRes.value?.success) {
          this.announcements = announcementsRes.value.data?.list || announcementsRes.value.data || []
          this.unreadAnnouncements = this.announcements.filter(a => !a.read).length
        }
      } catch (e) {
        console.error('系统配置加载失败:', e)
      }
    },
    
    // 切换主题
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', this.theme)
      document.documentElement.setAttribute('data-theme', this.theme)
    },
    
    // 设置语言
    setLocale(locale) {
      this.locale = locale
      localStorage.setItem('locale', locale)
    },
    
    // 显示Toast
    showToast(message, type = 'info', duration = 2000) {
      const id = Date.now()
      this.toasts.push({ id, message, type })
      
      setTimeout(() => {
        this.removeToast(id)
      }, duration)
    },
    
    // 移除Toast
    removeToast(id) {
      const index = this.toasts.findIndex(t => t.id === id)
      if (index > -1) {
        this.toasts.splice(index, 1)
      }
    },
    
    // 设置全局加载
    setGlobalLoading(loading) {
      this.globalLoading = loading
    },
    
    // 标记公告已读
    markAnnouncementRead(id) {
      const announcement = this.announcements.find(a => a.id === id)
      if (announcement && !announcement.read) {
        announcement.read = true
        this.unreadAnnouncements = Math.max(0, this.unreadAnnouncements - 1)
      }
    }
  }
})
