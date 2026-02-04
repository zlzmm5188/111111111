import { request } from '@/utils/request.js'

/**
 * 用户管理 API
 */
export default {
  /**
   * 获取用户列表
   */
  getUserList(params = {}) {
    return request({
      url: '/api/admin/user/list',
      method: 'get',
      params
    })
  },

  /**
   * 更新用户状态
   */
  updateUserStatus(id, data) {
    return request({
      url: `/api/admin/user/${id}/status`,
      method: 'put',
      data
    })
  },

  /**
   * 获取用户资产
   */
  getUserAssets(id) {
    return request({
      url: `/api/admin/user/${id}/assets`,
      method: 'get'
    })
  },

  /**
   * 调整用户资产
   */
  adjustUserAsset(id, data) {
    return request({
      url: `/api/admin/user/${id}/adjust-funds`,
      method: 'post',
      data
    })
  },

  /**
   * 调整用户积分
   */
  adjustUserPoints(id, data) {
    return request({
      url: `/api/admin/user/${id}/adjust-points`,
      method: 'post',
      data
    })
  },

  /**
   * KYC列表
   */
  getKycList(params = {}) {
    return request({
      url: '/api/admin/kyc/list',
      method: 'get',
      params
    })
  },

  /**
   * KYC审核
   */
  reviewKyc(id, data) {
    return request({
      url: `/api/admin/kyc/${id}/review`,
      method: 'put',
      data
    })
  },

  /**
   * 获取用户详情（含KYC信息）
   */
  getUserDetail(id) {
    return request({
      url: `/api/admin/user/${id}`,
      method: 'get'
    })
  },

  /**
   * 更新用户备注
   */
  updateUserRemark(id, data) {
    return request({
      url: `/api/admin/user/${id}/remark`,
      method: 'put',
      data
    })
  },

  /**
   * 更新用户TRON充值地址
   */
  updateUserTronAddress(id, data) {
    return request({
      url: `/api/admin/user/${id}/tron-address`,
      method: 'put',
      data
    })
  },

  /**
   * 设置内部用户
   */
  setUserInternal(id, data) {
    return request({
      url: `/api/admin/user/${id}/internal`,
      method: 'put',
      data
    })
  },

  /**
   * 变更推荐人
   */
  changeUserInviter(id, data) {
    return request({
      url: `/api/admin/user/${id}/inviter`,
      method: 'put',
      data
    })
  },

  /**
   * 重置用户登录密码
   */
  resetUserPassword(id, data) {
    return request({
      url: `/api/admin/user/${id}/reset-password`,
      method: 'put',
      data
    })
  },

  /**
   * 重置用户支付密码
   */
  resetUserTradePassword(id, data) {
    return request({
      url: `/api/admin/user/${id}/reset-trade-password`,
      method: 'put',
      data
    })
  },

  /**
   * 更新用户KYC信息
   */
  updateUserKyc(id, data) {
    return request({
      url: `/api/admin/user/${id}/kyc`,
      method: 'put',
      data
    })
  },

  /**
   * 分配用户给管理员
   */
  assignUserToAdmin(userId, data) {
    return request({
      url: `/api/admin/user/${userId}/assign`,
      method: 'post',
      data
    })
  },

  // ==================== 管理员管理 ====================

  /**
   * 获取管理员列表
   */
  getAdminList(params = {}) {
    return request({
      url: '/api/admin/admin/list',
      method: 'get',
      params
    })
  },

  /**
   * 创建管理员
   */
  createAdmin(data) {
    return request({
      url: '/api/admin/admin',
      method: 'post',
      data
    })
  },

  /**
   * 更新管理员
   */
  updateAdmin(id, data) {
    return request({
      url: `/api/admin/admin/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除管理员
   */
  deleteAdmin(id) {
    return request({
      url: `/api/admin/admin/${id}`,
      method: 'delete'
    })
  }
}
