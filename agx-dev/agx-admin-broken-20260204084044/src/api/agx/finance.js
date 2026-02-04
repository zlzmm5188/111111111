import { request } from '@/utils/request.js'

/**
 * 财务管理 API (充值/提现/资产)
 */
export default {
  /**
   * 充值统计
   */
  getRechargeStats() {
    return request({
      url: '/api/admin/recharge/stats',
      method: 'get'
    })
  },

  /**
   * 充值记录列表
   */
  getRechargeList(params = {}) {
    return request({
      url: '/api/admin/recharge/list',
      method: 'get',
      params
    })
  },

  /**
   * 手动充值
   */
  manualRecharge(data) {
    return request({
      url: '/api/admin/recharge/manual',
      method: 'post',
      data
    })
  },

  /**
   * 处理充值订单（手动审核）
   */
  processRecharge(id, data) {
    return request({
      url: `/api/admin/recharge/${id}/process`,
      method: 'put',
      data
    })
  },

  /**
   * 提现列表
   */
  getWithdrawList(params = {}) {
    return request({
      url: '/api/admin/withdraw/list',
      method: 'get',
      params
    })
  },

  /**
   * 提现审核
   */
  reviewWithdraw(id, data) {
    return request({
      url: `/api/admin/withdraw/${id}/review`,
      method: 'put',
      data
    })
  },

  /**
   * 资产流水列表
   */
  getAssetLogs(params = {}) {
    return request({
      url: '/api/admin/asset/logs',
      method: 'get',
      params
    })
  }
}
