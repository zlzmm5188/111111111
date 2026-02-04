import { request } from '@/utils/request.js'

/**
 * 矿池管理 API
 */
export default {
  /**
   * 获取矿池产品列表
   */
  getPoolList(params = {}) {
    return request({
      url: '/api/admin/pool-product',
      method: 'get',
      params
    })
  },

  /**
   * 创建矿池产品
   */
  createPool(data) {
    return request({
      url: '/api/admin/pool-product',
      method: 'post',
      data
    })
  },

  /**
   * 更新矿池产品
   */
  updatePool(id, data) {
    return request({
      url: `/api/admin/pool-product/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除矿池产品
   */
  deletePool(id) {
    return request({
      url: `/api/admin/pool-product/${id}`,
      method: 'delete'
    })
  },

  /**
   * 矿池持仓列表
   */
  getPoolHoldingList(params = {}) {
    return request({
      url: '/api/admin/pool-holding',
      method: 'get',
      params
    })
  },

  /**
   * 导出矿池持仓数据
   */
  exportPoolHoldings(params = {}) {
    return request({
      url: '/api/admin/pool-holding/export',
      method: 'get',
      params
    })
  },

  /**
   * 矿池产品统计
   */
  getPoolStats() {
    return request({
      url: '/api/admin/pool-product/stats',
      method: 'get'
    })
  }
}
