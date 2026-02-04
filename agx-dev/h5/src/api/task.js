import { api } from '../utils/api'

/**
 * 获取新手任务列表
 */
export function getTaskList() {
  return api.get('/task/list')
}

/**
 * 完成任务（手动触发型）
 */
export function completeTask(taskKey) {
  return api.post(`/task/complete/${taskKey}`)
}

/**
 * 领取单个任务奖励
 */
export function claimReward(taskKey) {
  return api.post(`/task/claim/${taskKey}`)
}

/**
 * 一键领取所有奖励
 */
export function claimAllRewards() {
  return api.post('/task/claim-all')
}
