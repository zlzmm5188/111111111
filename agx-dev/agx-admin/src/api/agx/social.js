import { request } from '@/utils/request.js'

/**
 * 社交管理 API (好友关系/私聊/用户社交状态)
 * 对应后端: /api/admin/social/*
 */
export default {
  /**
   * 获取好友关系列表
   */
  getFriendRelations(params = {}) {
    return request({
      url: '/api/admin/social/friends',
      method: 'get',
      params
    })
  },

  /**
   * 强制解除好友关系
   */
  removeFriend(data) {
    return request({
      url: '/api/admin/social/remove-friend',
      method: 'post',
      data
    })
  },

  /**
   * 设置用户社交状态
   * @param userId 用户ID
   * @param status 状态: 1正常 0禁言 -1社交封禁
   */
  setUserSocialStatus(userId, status) {
    return request({
      url: `/api/admin/social/user/${userId}/social-status`,
      method: 'post',
      data: { status }
    })
  },

  /**
   * 禁言用户
   * @param userId 用户ID
   * @param until 禁言截止时间 ISO格式
   */
  muteUser(userId, until) {
    return request({
      url: `/api/admin/social/user/${userId}/mute`,
      method: 'post',
      data: { until }
    })
  },

  /**
   * 设置用户是否可被加好友
   */
  setUserCanBeFriended(userId, canBeFriended) {
    return request({
      url: `/api/admin/social/user/${userId}/can-be-friended`,
      method: 'post',
      data: { canBeFriended }
    })
  },

  /**
   * 设置用户是否可私聊
   */
  setUserCanChat(userId, canChat) {
    return request({
      url: `/api/admin/social/user/${userId}/can-chat`,
      method: 'post',
      data: { canChat }
    })
  },

  /**
   * 获取用户列表（带社交字段）
   */
  getUsersWithSocialStatus(params = {}) {
    return request({
      url: '/api/admin/user/list',
      method: 'get',
      params: {
        ...params,
        includesSocialFields: true
      }
    })
  }
}
