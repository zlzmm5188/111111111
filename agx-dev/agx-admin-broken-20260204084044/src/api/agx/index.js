/**
 * AGX Admin API 模块聚合入口
 * 
 * 拆分为以下子模块:
 * - user: 用户管理 (用户/KYC)
 * - currency: 币种管理 (币种/链)
 * - pool: 矿池管理
 * - contract: 合约管理
 * - finance: 财务管理 (充值/提现/资产)
 * - system: 系统管理 (配置/公告/日志/仪表盘)
 * - invite: 邀请管理 (邀请/返佣)
 * - trade: 交易管理 (交易对/IEO)
 * - square: 广场管理 (敏感词/帖子审核/私信)
 */

import userApi from './user.js'
import currencyApi from './currency.js'
import poolApi from './pool.js'
import contractApi from './contract.js'
import financeApi from './finance.js'
import systemApi from './system.js'
import inviteApi from './invite.js'
import tradeApi from './trade.js'
import squareApi from './square.js'
import socialApi from './social.js'

// 导出子模块供按需导入
export { userApi, currencyApi, poolApi, contractApi, financeApi, systemApi, inviteApi, tradeApi, squareApi, socialApi }

// 聚合导出保持向后兼容
export default {
  // ============ 用户管理 ============
  getUserList: userApi.getUserList,
  updateUserStatus: userApi.updateUserStatus,
  getUserAssets: userApi.getUserAssets,
  adjustUserAsset: userApi.adjustUserAsset,
  getKycList: userApi.getKycList,
  reviewKyc: userApi.reviewKyc,
  getUserDetail: userApi.getUserDetail,
  updateUserRemark: userApi.updateUserRemark,
  updateUserTronAddress: userApi.updateUserTronAddress,
  setUserInternal: userApi.setUserInternal,
  changeUserInviter: userApi.changeUserInviter,
  resetUserPassword: userApi.resetUserPassword,
  resetUserTradePassword: userApi.resetUserTradePassword,
  updateUserKyc: userApi.updateUserKyc,
  assignUserToAdmin: userApi.assignUserToAdmin,

  // ============ 管理员管理 ============
  getAdminList: userApi.getAdminList,
  createAdmin: userApi.createAdmin,
  updateAdmin: userApi.updateAdmin,
  deleteAdmin: userApi.deleteAdmin,

  // ============ 币种管理 ============
  getCurrencyList: currencyApi.getCurrencyList,
  createCurrency: currencyApi.createCurrency,
  updateCurrency: currencyApi.updateCurrency,
  deleteCurrency: currencyApi.deleteCurrency,
  getCoinChainList: currencyApi.getCoinChainList,
  createCoinChain: currencyApi.createCoinChain,
  updateCoinChain: currencyApi.updateCoinChain,
  deleteCoinChain: currencyApi.deleteCoinChain,

  // ============ 矿池管理 ============
  getPoolList: poolApi.getPoolList,
  createPool: poolApi.createPool,
  updatePool: poolApi.updatePool,
  deletePool: poolApi.deletePool,
  getPoolHoldingList: poolApi.getPoolHoldingList,
  exportPoolHoldings: poolApi.exportPoolHoldings,
  getPoolStats: poolApi.getPoolStats,

  // ============ 合约管理 ============
  getContractList: contractApi.getContractList,
  createContract: contractApi.createContract,
  updateContract: contractApi.updateContract,
  deleteContract: contractApi.deleteContract,
  getContractOrderList: contractApi.getContractOrderList,
  settleContractOrder: contractApi.settleContractOrder,

  // ============ 财务管理 ============
  getRechargeStats: financeApi.getRechargeStats,
  getRechargeList: financeApi.getRechargeList,
  manualRecharge: financeApi.manualRecharge,
  processRecharge: financeApi.processRecharge,
  getWithdrawList: financeApi.getWithdrawList,
  reviewWithdraw: financeApi.reviewWithdraw,
  getAssetLogs: financeApi.getAssetLogs,

  // ============ 系统管理 ============
  getDashboardStats: systemApi.getDashboardStats,
  getDashboardCharts: systemApi.getDashboardCharts,
  getRecentActivities: systemApi.getRecentActivities,
  getPendingList: systemApi.getPendingList,
  getConfigList: systemApi.getConfigList,
  updateConfig: systemApi.updateConfig,
  batchUpdateConfigs: systemApi.batchUpdateConfigs,
  getNoticeList: systemApi.getNoticeList,
  createNotice: systemApi.createNotice,
  updateNotice: systemApi.updateNotice,
  deleteNotice: systemApi.deleteNotice,
  getAdminLogList: systemApi.getAdminLogList,
  getLoginLogList: systemApi.getLoginLogList,

  // ============ 邀请管理 ============
  getInviteList: inviteApi.getInviteList,
  getInviteTreeData: inviteApi.getInviteTreeData,
  getInviteTreeStats: inviteApi.getInviteTreeStats,
  searchInviteUser: inviteApi.searchInviteUser,
  exportInviteUsers: inviteApi.exportInviteUsers,
  getInviteUserList: inviteApi.getInviteUserList,
  getInviteUserListDetail: inviteApi.getInviteUserListDetail,
  getCommissionList: inviteApi.getCommissionList,

  // ============ 交易管理 ============
  getTradingPairs: tradeApi.getTradingPairs,
  createTradingPair: tradeApi.createTradingPair,
  updateTradingPair: tradeApi.updateTradingPair,
  deleteTradingPair: tradeApi.deleteTradingPair,
  getCoinIssues: tradeApi.getCoinIssues,
  getCoinIssueDetail: tradeApi.getCoinIssueDetail,
  createCoinIssue: tradeApi.createCoinIssue,
  updateCoinIssue: tradeApi.updateCoinIssue,
  deleteCoinIssue: tradeApi.deleteCoinIssue,
  getCoinIssueStats: tradeApi.getCoinIssueStats,

  // ============ 广场管理 ============
  getSensitiveWords: squareApi.getSensitiveWords,
  createSensitiveWord: squareApi.createSensitiveWord,
  updateSensitiveWord: squareApi.updateSensitiveWord,
  deleteSensitiveWord: squareApi.deleteSensitiveWord,
  getPendingPosts: squareApi.getPendingPosts,
  reviewPost: squareApi.reviewPost,
  getReviewHistory: squareApi.getReviewHistory,
  batchReviewPosts: squareApi.batchReviewPosts,
  getUserMessages: squareApi.getUserMessages,
  getAllMessages: squareApi.getAllMessages,

  // ============ 社交管理 ============
  getFriendRelations: socialApi.getFriendRelations,
  removeFriend: socialApi.removeFriend,
  setUserSocialStatus: socialApi.setUserSocialStatus,
  muteUser: socialApi.muteUser,
  setUserCanBeFriended: socialApi.setUserCanBeFriended,
  setUserCanChat: socialApi.setUserCanChat,
  getUsersWithSocialStatus: socialApi.getUsersWithSocialStatus
}
