/**
 * AGX Ecosystem - API Utilities
 * 与后端API完全对接
 */

import axios from 'axios'
import { ErrorCode, getErrorMessage, isAuthError } from './errorCode'
import { logger } from './logger'
import { tokenStorage } from './security'

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // 统一token获取：优先sessionStorage，其次localStorage
    let token = sessionStorage.getItem('token') || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // 确保两个存储一致
      if (sessionStorage.getItem('token') !== localStorage.getItem('token')) {
        sessionStorage.setItem('token', token)
        localStorage.setItem('token', token)
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const res = response.data
    // 统一响应格式: { code, msg, data }
    if (res.code === ErrorCode.SUCCESS || res.code === 0 || res.success) {
      // 处理后端双层嵌套的情况: { code, message, data: { code, msg, data: {...} } }
      let data = res.data
      if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
        // 解包嵌套的 data
        data = data.data
      }
      return { success: true, data, code: 0, message: res.msg || res.message || 'ok' }
    }
    // 业务错误: 返回错误信息但不reject
    const message = res.msg || getErrorMessage(res.code)
    // 认证错误: 只在明确的登录接口或主动访问时才跳转
    // 防止后台API失败时误退出登录
    const protectedPaths = ['/mine', '/invite', '/assets', '/tasks', '/settings']
    if (isAuthError(res.code) && protectedPaths.some(p => window.location.pathname.startsWith(p))) {
      // 在受保护页面，如果是认证错误，不立即退出，而是返回错误
      // 让页面自己处理
      logger.warn('[API] 认证错误，但保留登录状态:', res.code)
      return { success: false, code: res.code, message, data: null }
    }
    // 其他页面的认证错误才跳转
    if (isAuthError(res.code)) {
      tokenStorage.clearToken()
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.replace('/login')
      }
    }
    return { success: false, code: res.code, message, data: null }
  },
  (error) => {
    const status = error.response?.status
    const res = error.response?.data
    const code = res?.code || ErrorCode.SYSTEM_ERROR

    // 网络错误或服务未启动
    if (!error.response) {
      logger.warn('[API] 网络错误或服务未启动')
      // 不退出登录，只返回错误
      return Promise.reject({
        success: false,
        code: ErrorCode.SERVICE_UNAVAILABLE,
        message: '网络连接失败，请检查网络或稍后重试',
        status: 0
      })
    }

    const message = res?.msg || getErrorMessage(code, '网络请求失败')

    // 401 错误：清除 token 并跳转登录
    if (status === 401 || isAuthError(code)) {
      logger.warn('[API] 401错误，清除登录状态')
      // 清除所有 token（使用统一的 tokenStorage）
      tokenStorage.clearToken()
      // 跳转登录页（避免循环：只在非登录页跳转）
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.replace('/login')
      }
      return Promise.reject({ success: false, code, message: '请先登录', status })
    }

    return Promise.reject({ success: false, code, message, status })
  }
)

// ============ Account API ============
// 对应: account.controller.ts
export const apiAccount = {
  register: (data) => api.post('/account/register', data),
  login: (data) => api.post('/account/login', data),
  profile: () => api.get('/account/profile'),
  updateProfile: (data) => api.put('/account/profile', data),
  balance: () => api.get('/account/balance'),
  getAssetsOverview: () => api.get('/account/assets/overview'),
  changePassword: (data) => api.post('/account/password', data),
  // KYC
  submitKyc: (data) => api.post('/account/kyc', data),
  getKycStatus: () => api.get('/account/kyc'),
  // 充值
  getDepositAddress: (params) => api.get('/account/deposit/address', { params }),
  createDepositOrder: (data) => api.post('/account/deposit/order', data),
  getDepositOrderStatus: (orderNo) => api.get(`/account/deposit/order/${orderNo}`),
  getDepositHistory: (params) => api.get('/account/deposit/history', { params }),
  // 提现
  withdraw: (data) => api.post('/account/withdraw', data),
  getWithdrawConfig: () => api.get('/account/withdraw/config'),
  getWithdrawHistory: (params) => api.get('/account/withdraw/history', { params }),
  // 邀请
  getInvites: () => api.get('/account/invites'),
  getInviteStats: () => api.get('/account/invite/stats'),
  // 公告
  getNotices: () => api.get('/account/notices'),
  // 会员等级
  getMemberLevels: () => api.get('/account/member-levels'),
  getMyLevel: () => api.get('/account/my-level'),
}

// ============ Market API ============
// 对应: market.controller.ts
export const apiMarket = {
  getTickers: (params) => api.get('/market/tickers', { params }),
  ticker: (symbol) => api.get(`/market/ticker/${symbol}`),
  getKlines: (params) => api.get('/market/klines', { params }),
  getDepth: (params) => api.get('/market/depth', { params }),
  getTrades: (params) => api.get('/market/trades', { params }),
  getAssets: () => api.get('/market/assets')
}

// ============ Trade API ============
// 对应: trade.controller.ts
export const apiTrade = {
  getPairs: () => api.get('/trade/pairs'),
  getPairDetail: (symbol) => api.get(`/trade/pair/${symbol}`),
  placeOrder: (data) => api.post('/trade/order', data),
  cancelOrder: (orderNo) => api.post(`/trade/order/${orderNo}/cancel`),
  getOrderDetail: (orderNo) => api.get(`/trade/order/${orderNo}`),
  getUserOrders: (params) => api.get('/trade/orders', { params }),
  // IEO
  getIeoList: () => api.get('/trade/ieo/list'),
  getIeoDetail: (id) => api.get(`/trade/ieo/${id}`),
  subscribeIeo: (data) => api.post('/trade/ieo/subscribe', data),
  getMyIeoSubscriptions: () => api.get('/trade/ieo/my-subscriptions')
}

// ============ Contract API ============
// 对应: contract.controller.ts
export const apiContract = {
  getConfigs: () => api.get('/contract/configs'),
  placeOrder: (data) => api.post('/contract/order', data),
  getOrders: (params) => api.get('/contract/orders', { params })
}

// ============ Gold API ============
// 对应: gold.controller.ts
export const apiGold = {
  getPrices: () => api.get('/gold/prices'),
  getDetail: () => api.get('/gold/detail'),
  getKlines: (params) => api.get('/gold/klines', { params }),
  getCategories: () => api.get('/gold/categories'),
  getProducts: (type) => api.get('/gold/products', { params: { type } }),
  getProductDetail: (id) => api.get(`/gold/product/${id}`),
  getSpot: () => api.get('/gold/spot'),
  getContract: () => api.get('/gold/contract'),
  getFinance: () => api.get('/gold/finance'),
  getAgx: () => api.get('/gold/agx'),
  // 需登录
  getAccount: () => api.get('/gold/account'),
  getHoldings: (status) => api.get('/gold/holdings', { params: { status } }),
  subscribe: (data) => api.post('/gold/subscribe', data),
  redeem: (id) => api.post(`/gold/redeem/${id}`),
  getSettlements: (params) => api.get('/gold/settlements', { params }),
  getHoldingStatus: () => api.get('/gold/holding-status')
}

// ============ Pool API ============
// 对应: pool.controller.ts
export const apiPool = {
  getProducts: () => api.get('/pool/products'),
  getHoldings: () => api.get('/pool/holdings'),
  getAssetLogs: (params) => api.get('/account/asset/logs', { params }),
  getIncomes: (params) => api.get('/pool/incomes', { params }),
  subscribe: (data) => api.post('/pool/subscribe', data),
  redeem: (data) => api.post('/pool/redeem', data)
}

// ============ Contract Mining API ============
// 对应: contract-mining.controller.ts
export const apiContractMining = {
  getPool: () => api.get('/contract-mining/pool'),
  getMyStakes: () => api.get('/contract-mining/my-stakes'),
  stake: (data) => api.post('/contract-mining/stake', data),
  unstake: (id) => api.post('/contract-mining/unstake', { id }),
  claim: () => api.post('/contract-mining/claim')
}

// ============ Earn API ============
// 对应: earn.controller.ts
export const apiEarn = {
  getOverview: () => api.get('/earn/overview'),
  getRecords: (params) => api.get('/earn/records', { params }),
  claim: () => api.post('/earn/claim')
}

// ============ Invite API ============
// 对应: invite.controller.ts
export const apiInvite = {
  getInfo: () => api.get('/invite/info'),
  getRecords: (params) => api.get('/invite/records', { params }),
  getCommissions: (params) => api.get('/invite/commissions', { params }),
  getCommissionInfo: () => api.get('/invite/commission-info'),
  getLevels: () => api.get('/invite/levels'),
  getRank: (params) => api.get('/invite/rank', { params }),
  getMyRank: (params) => api.get('/invite/myrank', { params }),
  // 邀请树
  getTreeData: () => api.get('/invite/tree/data'),
  getTreeStats: () => api.get('/invite/tree/stats'),
  searchUsers: (params) => api.get('/invite/tree/search', { params }),
  getUsers: (params) => api.get('/invite/tree/users', { params }),
  // 激励体系配置
  getCommissionTiers: () => api.get('/invite/commission-tiers'),
  getInviteBonusTiers: () => api.get('/invite/bonus-tiers'),
  getMemberLevels: () => api.get('/invite/member-levels'),
  // 按产品返佣和双向奖励
  getCommissionByProduct: () => api.get('/invite/commission-by-product'),
  getBonusStats: () => api.get('/invite/bonus-stats'),
  getBonusRecords: (params) => api.get('/invite/bonus-records', { params }),
  // 邀请人信息（公开接口，用于落地页）
  getInviterByCode: (code) => api.get('/invite/inviter', { params: { code } })
}

// ============ Social API ============
// 对应: social.controller.ts - 路径是 /api/user/...
export const apiSocial = {
  // 关注功能
  follow: (targetId) => api.post(`/user/follow/${targetId}`),
  unfollow: (targetId) => api.post(`/user/unfollow/${targetId}`),
  getFollowing: (params) => api.get('/user/following', { params }),
  getFollowers: (params) => api.get('/user/followers', { params }),
  // 好友功能
  getFriends: (params) => api.get('/user/friends', { params }),
  sendFriendRequest: (data) => api.post('/user/friend-request', data),
  getFriendRequests: (params) => api.get('/user/friend-requests', { params }),
  handleFriendRequest: (requestId, accept) => api.post(`/user/friend-request/${requestId}/handle`, { accept }),
  // 私聊功能
  getConversations: (params) => api.get('/user/conversations', { params }),
  getMessages: (conversationId, params) => api.get(`/user/conversations/${conversationId}/messages`, { params }),
  sendMessage: (data) => api.post('/user/messages/send', data),
  markMessagesRead: (conversationId) => api.post(`/user/messages/read/${conversationId}`),
  getUnreadCount: () => api.get('/user/unread-count')
}

// ============ Square API ============
// 对应: square.controller.ts
export const apiSquare = {
  // 帖子
  getPosts: (params) => api.get('/square/posts', { params }),
  getPostDetail: (id) => api.get(`/square/post/${id}`),
  createPost: (data) => api.post('/square/post', data),
  // 互动
  toggleLike: (data) => api.post('/square/like', data),
  comment: (data) => api.post('/square/comment', data),
  getComments: (params) => api.get('/square/comments', { params }),
  follow: (data) => api.post('/square/follow', data),
  // 话题
  getTopics: (params) => api.get('/square/topics', { params }),
  // 举报
  report: (data) => api.post('/square/report', data),
  // 发帖条件检查
  checkPostCondition: () => api.get('/square/check-post-condition'),
  // 管理员AI发帖
  generateAIPost: (data) => api.post('/square/admin/ai-post', data),
  getAIPostTypes: () => api.get('/square/admin/ai-post-types'),
  getOfficialPosts: (limit = 10) => api.get('/square/admin/official-posts', { params: { limit } }),
  // 管理员配置
  getPostConditionConfig: () => api.get('/square/admin/post-condition-config'),
  updatePostConditionConfig: (data) => api.post('/square/admin/post-condition-config', data),
  getUserLevelInfo: (userId) => api.get(`/square/admin/user-level-info/${userId}`)
}

// ============ Upload API ============
// 对应: upload.controller.ts
export const apiUpload = {
  single: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  multiple: (files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  avatar: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  kyc: (files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return api.post('/upload/kyc', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  post: (files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return api.post('/upload/post', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// ============ AI API ============
export const apiAi = {
  chat: (data) => api.post('/ai/chat', data),
  getHistory: () => api.get('/ai/history'),
  customerServiceChat: (data) => api.post('/ai/customer-service', data)
}

// ============ 兼容旧代码的别名 ============
export const apiAgx = {
  getPrice: () => apiGold.getPrices(),
  getMarketStats: () => apiMarket.getTickers({ type: 'crypto', symbol: 'AGX' })
}

export const apiMining = {
  getMiningInfo: () => apiPool.getProducts(),
  getUserMining: () => apiPool.getHoldings(),
  stake: (data) => apiPool.subscribe(data),
  unstake: (data) => apiPool.redeem(data)
}

export const apiIeo = {
  getProjects: () => apiTrade.getIeoList(),
  getProjectDetail: (id) => apiTrade.getIeoDetail(id),
  subscribe: (data) => apiTrade.subscribeIeo(data)
}

export const apiAirdrop = {
  getList: () => api.get('/airdrop/list'),
  getEvents: () => api.get('/airdrop/events'),
  claim: (id) => api.post('/airdrop/claim', { id }),
  getHistory: () => api.get('/airdrop/history')
}

export const apiOtc = {
  getRate: () => api.get('/otc/rate'),
  getAdvertisements: (params) => api.get('/otc/advertisements', { params }),
  // 挂单管理
  createAdvertisement: (data) => api.post('/otc/advertisement', data),
  getMyAdvertisements: (params) => api.get('/otc/my-advertisements', { params }),
  cancelAdvertisement: (id) => api.delete(`/otc/advertisement/${id}`),
  updateAdvertisementPrice: (id, price) => api.put(`/otc/advertisement/${id}/price`, { price }),
  // 订单管理
  createOrder: (data) => api.post('/otc/order', data),
  getOrders: (params) => api.get('/otc/orders', { params }),
  getOrderDetail: (orderNo) => api.get(`/otc/order/${orderNo}`),
  confirmPaid: (orderNo) => api.post(`/otc/order/${orderNo}/paid`),
  confirmRelease: (orderNo) => api.post(`/otc/order/${orderNo}/release`),
  cancelOrder: (orderNo) => api.post(`/otc/order/${orderNo}/cancel`),
  getStats: () => api.get('/otc/stats'),
  getHistory: () => api.get('/otc/history')
}

// ============ System API ============
// 系统配置、功能开关
export const apiSystem = {
  // 获取功能开关
  getToggles: () => api.get('/system/toggles'),
  // 获取系统配置
  getConfigs: (group) => api.get('/system/configs', { params: { group } }),
  // 获取平台信息
  getPlatformInfo: () => api.get('/system/platform-info'),
  // 获取公告列表
  getAnnouncements: () => api.get('/system/announcements')
}

// 挂载到api实例上，方便使用
api.account = apiAccount
api.market = apiMarket
api.trade = apiTrade
api.contract = apiContract
api.gold = apiGold
api.pool = apiPool
api.contractMining = apiContractMining
api.earn = apiEarn
api.invite = apiInvite
api.social = apiSocial
api.square = apiSquare
api.upload = apiUpload
api.ai = apiAi
api.system = apiSystem

// 金融产品管理API
api.financialProduct = {
  coinIssue: {
    list: (params) => api.get('/admin/coin-issue', { params }),
    detail: (id) => api.get(`/admin/coin-issue/${id}`),
    create: (data) => api.post('/admin/coin-issue', data),
    update: (id, data) => api.put(`/admin/coin-issue/${id}`, data),
    delete: (id) => api.delete(`/admin/coin-issue/${id}`)
  },
  poolProduct: {
    list: (params) => api.get('/admin/pool-product', { params }),
    detail: (id) => api.get(`/admin/pool-product/${id}`),
    create: (data) => api.post('/admin/pool-product', data),
    update: (id, data) => api.put(`/admin/pool-product/${id}`, data),
    delete: (id) => api.delete(`/admin/pool-product/${id}`)
  },
  logs: (params) => api.get('/admin/operation-logs', { params })
}

// 持币生金管理API
api.holding = {
  // 配置管理
  getConfigs: () => api.get('/admin/holding/configs'),
  updateConfig: (id, data) => api.put(`/admin/holding/config/${id}`, data),

  // 发放管理
  manualDistribute: (targetDate) => api.post('/admin/holding/distribute', { targetDate }),
  getDistributions: (params) => api.get('/admin/holding/distributions', { params })
}

// 兑换记录API
api.exchange = {
  getRecords: (params) => api.get('/admin/exchange/records', { params }),
  getDetail: (id) => api.get(`/admin/exchange/record/${id}`),
  export: (params) => api.get('/admin/exchange/export', { params })
}

// 福利API - 优雅处理后端缺失
export const apiWelfare = {
  // 获取福利统计
  getStats: async () => {
    try {
      return await api.get('/welfare/stats')
    } catch (e) {
      return { success: true, data: { totalDividend: 0, redpacketCount: 0, totalRebate: 0, points: 0 } }
    }
  },
  // 获取分红记录
  getDividends: async (params) => {
    try {
      return await api.get('/welfare/dividends', { params })
    } catch (e) {
      return { success: true, data: [] }
    }
  },
  // 获取红包列表
  getRedpackets: async () => {
    try {
      return await api.get('/welfare/redpackets')
    } catch (e) {
      return { success: true, data: [] }
    }
  },
  // 领取红包
  claimRedpacket: async (id) => {
    try {
      return await api.post(`/welfare/redpacket/${id}/claim`)
    } catch (e) {
      return { success: false, message: '后端服务暂不可用' }
    }
  },
  // 获取返利记录
  getRebates: async (params) => {
    try {
      return await api.get('/welfare/rebates', { params })
    } catch (e) {
      return { success: true, data: [] }
    }
  },
  // 获取积分历史
  getPointsHistory: async (params) => {
    try {
      return await api.get('/welfare/points/history', { params })
    } catch (e) {
      return { success: true, data: [] }
    }
  }
}

export { api }
export default api
