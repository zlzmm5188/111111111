import { request } from '@/utils/request.js'

/**
 * 广场管理 API (敏感词/帖子审核/私信)
 */
export default {
  /**
   * 获取敏感词列表
   */
  getSensitiveWords(params = {}) {
    return request({
      url: '/api/square/sensitive-words',
      method: 'get',
      params
    })
  },

  /**
   * 创建敏感词
   */
  createSensitiveWord(data) {
    return request({
      url: '/api/square/sensitive-words',
      method: 'post',
      data
    })
  },

  /**
   * 更新敏感词
   */
  updateSensitiveWord(id, data) {
    return request({
      url: `/api/square/sensitive-words/${id}`,
      method: 'post',
      data
    })
  },

  /**
   * 删除敏感词
   */
  deleteSensitiveWord(id) {
    return request({
      url: `/api/square/sensitive-words/${id}/delete`,
      method: 'post'
    })
  },

  /**
   * 获取待审核帖子列表
   */
  getPendingPosts(params = {}) {
    return request({
      url: '/api/square/pending-posts',
      method: 'get',
      params
    })
  },

  /**
   * 审核帖子
   */
  reviewPost(data) {
    return request({
      url: '/api/square/review',
      method: 'post',
      data
    })
  },

  /**
   * 获取审核历史
   */
  getReviewHistory(postId) {
    return request({
      url: `/api/square/review-history/${postId}`,
      method: 'get'
    })
  },

  /**
   * 批量审核帖子
   */
  batchReviewPosts(data) {
    return request({
      url: '/api/square/batch-review',
      method: 'post',
      data
    })
  },

  /**
   * 获取用户私信记录
   */
  getUserMessages(userId1, userId2, params = {}) {
    return request({
      url: `/api/square/messages/${userId1}/${userId2}`,
      method: 'get',
      params
    })
  },

  /**
   * 获取所有私信
   */
  getAllMessages(params = {}) {
    return request({
      url: '/api/square/all-messages',
      method: 'get',
      params
    })
  }
}
