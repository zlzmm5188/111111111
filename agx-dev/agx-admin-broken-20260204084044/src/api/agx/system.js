import { request } from '@/utils/request.js'

/**
 * 系统管理 API (配置/公告/日志/仪表盘)
 */
export default {
  /**
   * 仪表盘统计
   */
  getDashboardStats() {
    return request({
      url: '/api/admin/dashboard/stats',
      method: 'get'
    })
  },

  /**
   * 待审核列表
   */
  getPendingList() {
    return request({
      url: '/api/admin/dashboard/pending',
      method: 'get'
    })
  },

  /**
   * 系统配置列表
   */
  getConfigList(params = {}) {
    return request({
      url: '/api/admin/config/list',
      method: 'get',
      params
    })
  },

  /**
   * 更新系统配置
   */
  updateConfig(key, data) {
    return request({
      url: `/api/admin/config/${key}`,
      method: 'put',
      data
    })
  },

  /**
   * 批量更新配置
   */
  batchUpdateConfigs(data) {
    return request({
      url: '/api/admin/config/batch',
      method: 'post',
      data
    })
  },

  /**
   * 公告列表
   */
  getNoticeList(params = {}) {
    return request({
      url: '/api/admin/notice/list',
      method: 'get',
      params
    })
  },

  /**
   * 创建公告
   */
  createNotice(data) {
    return request({
      url: '/api/admin/notice',
      method: 'post',
      data
    })
  },

  /**
   * 更新公告
   */
  updateNotice(id, data) {
    return request({
      url: `/api/admin/notice/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除公告
   */
  deleteNotice(id) {
    return request({
      url: `/api/admin/notice/${id}`,
      method: 'delete'
    })
  },

  /**
   * 操作日志列表
   */
  getAdminLogList(params = {}) {
    return request({
      url: '/api/admin/log/list',
      method: 'get',
      params
    })
  },

  /**
   * 仪表盘图表数据
   */
  getDashboardCharts() {
    return request({
      url: '/api/admin/dashboard/charts',
      method: 'get'
    })
  },

  /**
   * 最近活动
   */
  getRecentActivities(params = {}) {
    return request({
      url: '/api/admin/dashboard/activities',
      method: 'get',
      params
    })
  },

  /**
   * 登录日志列表
   */
  getLoginLogList(params = {}) {
    return request({
      url: '/api/admin/login-log/list',
      method: 'get',
      params
    })
  }
}
