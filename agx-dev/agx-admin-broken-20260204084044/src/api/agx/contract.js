import { request } from '@/utils/request.js'

/**
 * 合约管理 API
 */
export default {
  /**
   * 获取秒合约配置列表
   */
  getContractList(params = {}) {
    return request({
      url: '/api/admin/contract/list',
      method: 'get',
      params
    })
  },

  /**
   * 创建秒合约配置
   */
  createContract(data) {
    return request({
      url: '/api/admin/contract',
      method: 'post',
      data
    })
  },

  /**
   * 更新秒合约配置
   */
  updateContract(id, data) {
    return request({
      url: `/api/admin/contract/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除秒合约配置
   */
  deleteContract(id) {
    return request({
      url: `/api/admin/contract/${id}`,
      method: 'delete'
    })
  },

  /**
   * 合约订单列表
   */
  getContractOrderList(params = {}) {
    return request({
      url: '/api/admin/order/list',
      method: 'get',
      params
    })
  },

  /**
   * 手动结算合约订单
   */
  settleContractOrder(id, data) {
    return request({
      url: `/api/admin/order/${id}/settle`,
      method: 'put',
      data
    })
  }
}
