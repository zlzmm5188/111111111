import { request } from '@/utils/request.js'

/**
 * 币种管理 API
 */
export default {
  /**
   * 获取币种列表
   */
  getCurrencyList(params = {}) {
    return request({
      url: '/api/admin/currency/list',
      method: 'get',
      params
    })
  },

  /**
   * 创建币种
   */
  createCurrency(data) {
    return request({
      url: '/api/admin/currency',
      method: 'post',
      data
    })
  },

  /**
   * 更新币种
   */
  updateCurrency(id, data) {
    return request({
      url: `/api/admin/currency/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除币种
   */
  deleteCurrency(id) {
    return request({
      url: `/api/admin/currency/${id}`,
      method: 'delete'
    })
  },

  /**
   * 获取币种链列表
   */
  getCoinChainList(coinId) {
    return request({
      url: '/api/admin/chain/list',
      method: 'get',
      params: { coinId }
    })
  },

  /**
   * 创建币种链
   */
  createCoinChain(data) {
    return request({
      url: '/api/admin/chain',
      method: 'post',
      data
    })
  },

  /**
   * 更新币种链
   */
  updateCoinChain(id, data) {
    return request({
      url: `/api/admin/chain/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除币种链
   */
  deleteCoinChain(id) {
    return request({
      url: `/api/admin/chain/${id}`,
      method: 'delete'
    })
  }
}
