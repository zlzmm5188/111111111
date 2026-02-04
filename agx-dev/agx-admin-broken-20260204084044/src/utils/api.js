/**
 * 统一 API 导出
 */
import agxApi from '@/api/agx/index.js'

export const api = {
  admin: agxApi,
  square: {
    getSensitiveWords: agxApi.getSensitiveWords,
    createSensitiveWord: agxApi.createSensitiveWord,
    updateSensitiveWord: agxApi.updateSensitiveWord,
    deleteSensitiveWord: agxApi.deleteSensitiveWord,
    getPendingPosts: agxApi.getPendingPosts,
    reviewPost: agxApi.reviewPost,
    getReviewHistory: agxApi.getReviewHistory,
    batchReviewPosts: agxApi.batchReviewPosts,
    getUserMessages: agxApi.getUserMessages,
    getAllMessages: agxApi.getAllMessages
  }
}

export default api
