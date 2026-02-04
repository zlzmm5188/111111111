/**
 * 激励体系配置 API
 * 对应后端: invite.controller.ts
 */
import { request } from '@/utils/request'

const baseUrl = '/api/invite'

/**
 * 获取返佣阶梯配置
 */
export function getCommissionTiers() {
  return request({
    url: `${baseUrl}/commission-tiers`,
    method: 'get'
  })
}

/**
 * 保存返佣阶梯配置
 */
export function saveCommissionTiers(data) {
  return request({
    url: `${baseUrl}/commission-tiers`,
    method: 'put',
    data
  })
}

/**
 * 获取双向奖励配置
 */
export function getInviteBonusTiers() {
  return request({
    url: `${baseUrl}/bonus-tiers`,
    method: 'get'
  })
}

/**
 * 保存双向奖励配置
 */
export function saveInviteBonusTiers(data) {
  return request({
    url: `${baseUrl}/bonus-tiers`,
    method: 'put',
    data
  })
}

/**
 * 获取会员等级配置
 */
export function getMemberLevels() {
  return request({
    url: `${baseUrl}/member-levels`,
    method: 'get'
  })
}

/**
 * 保存会员等级配置
 */
export function saveMemberLevels(data) {
  return request({
    url: `${baseUrl}/member-levels`,
    method: 'put',
    data
  })
}

export default {
  getCommissionTiers,
  saveCommissionTiers,
  getInviteBonusTiers,
  saveInviteBonusTiers,
  getMemberLevels,
  saveMemberLevels
}
