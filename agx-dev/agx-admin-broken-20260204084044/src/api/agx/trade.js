import { request } from '@/utils/request.js'

/**
 * 交易管理 API (交易对/新币发行)
 */
export default {
  /**
   * 获取交易对列表
   */
  getTradingPairs(params = {}) {
    return request({
      url: '/api/admin/trade/pairs',
      method: 'get',
      params
    })
  },

  /**
   * 创建交易对
   */
  createTradingPair(data) {
    return request({
      url: '/api/admin/trade/pair',
      method: 'post',
      data
    })
  },

  /**
   * 更新交易对
   */
  updateTradingPair(id, data) {
    return request({
      url: `/api/admin/trade/pair/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除交易对
   */
  deleteTradingPair(id) {
    return request({
      url: `/api/admin/trade/pair/${id}`,
      method: 'delete'
    })
  },

  // ============ AGX预售管理 ============

  /**
   * 获取预售列表
   */
  getCoinIssues(params = {}) {
    return request({
      url: '/api/admin/coin-issue',
      method: 'get',
      params
    })
  },

  /**
   * 获取预售详情
   */
  getCoinIssueDetail(id) {
    return request({
      url: `/api/admin/coin-issue/${id}`,
      method: 'get'
    })
  },

  /**
   * 创建预售
   */
  createCoinIssue(data) {
    return request({
      url: '/api/admin/coin-issue',
      method: 'post',
      data
    })
  },

  /**
   * 更新预售
   */
  updateCoinIssue(id, data) {
    return request({
      url: `/api/admin/coin-issue/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除预售
   */
  deleteCoinIssue(id) {
    return request({
      url: `/api/admin/coin-issue/${id}`,
      method: 'delete'
    })
  },

  /**
   * 预售统计
   */
  getCoinIssueStats() {
    return request({
      url: '/api/admin/coin-issue/stats',
      method: 'get'
    })
  }
}
