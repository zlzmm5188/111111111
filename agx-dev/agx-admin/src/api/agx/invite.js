import { request } from '@/utils/request.js'

/**
 * 邀请管理 API (邀请/返佣)
 */
export default {
  /**
   * 获取邀请列表
   */
  getInviteList(params = {}) {
    return request({
      url: '/api/admin/invite/list',
      method: 'get',
      params
    })
  },

  /**
   * 获取邀请关系树形数据
   */
  getInviteTreeData(params = {}) {
    return request({
      url: '/api/invite/tree/data',
      method: 'get',
      params
    })
  },

  /**
   * 获取邀请关系统计
   */
  getInviteTreeStats(userId) {
    return request({
      url: '/api/invite/tree/stats',
      method: 'get',
      params: { userId }
    })
  },

  /**
   * 搜索邀请关系用户（包含所有下级）
   */
  searchInviteUser(keyword) {
    return request({
      url: '/api/invite/tree/search',
      method: 'get',
      params: { keyword }
    })
  },

  /**
   * 导出邀请关系用户数据
   */
  exportInviteUsers(keyword) {
    return request({
      url: '/api/invite/tree/export',
      method: 'get',
      params: { keyword }
    })
  },

  
  /**
   * 获取邀请关系用户列表（增强版 - 含余额等详细信息）
   */
  getInviteUserListDetail(params = {}) {
    return request({
      url: '/api/invite/tree/users-detail',
      method: 'get',
      params
    })
  },

  /**
   * 获取邀请关系用户列表
   */
  getInviteUserList(params = {}) {
    return request({
      url: '/api/invite/tree/users',
      method: 'get',
      params
    })
  },

  /**
   * 返佣列表
   */
  getCommissionList(params = {}) {
    return request({
      url: '/api/admin/commission/list',
      method: 'get',
      params
    })
  }
}
