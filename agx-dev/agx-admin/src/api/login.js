import { request } from '@/utils/request.js'

export default {

  /**
   * 获取验证码 (暂不需要)
   * @returns
   */
  getCaptch() {
    return Promise.resolve({ code: 0, data: { enabled: false } })
  },

  /**
   * 管理员登录
   * @param {object} params
   * @returns
   */
  login(params = {}) {
    return request({
      url: '/api/admin/login',
      method: 'post',
      data: params
    })
  },

  /**
   * 用户退出
   * @param {object} params
   * @returns
   */
  logout(params = {}) {
    return Promise.resolve({ code: 0, msg: 'ok' })
  },

  /**
   * 获取登录用户信息
   * @param {object} params
   * @returns
   */
  getInfo(params = {}) {
    // AGX 后台管理 - 完整功能菜单
    return Promise.resolve({
      code: 0,
      data: {
        user: {
          id: 1,
          username: 'admin',
          nickname: '超级管理员',
          avatar: '/logo.png'
        },
        roles: ['superAdmin'],
        codes: [],
        routers: [
          // ========== 仪表盘 ==========
          {
            name: 'dashboard',
            path: '/dashboard',
            meta: { title: '仪表盘', icon: 'icon-dashboard', type: 'M' },
            component: 'agx/dashboard'
          },
          
          // ========== 1. 用户管理 ==========
          {
            name: 'userMgmt',
            path: '/user',
            meta: { title: '用户管理', icon: 'icon-user-group', type: 'M' },
            children: [
              { name: 'userList', path: '/user/list', meta: { title: '用户列表', icon: 'icon-user', type: 'M' }, component: 'agx/users' },
              { name: 'kycList', path: '/user/kyc', meta: { title: 'KYC审核', icon: 'icon-id-card', type: 'M' }, component: 'agx/kyc' },
              { name: 'inviteChain', path: '/user/invite-chain', meta: { title: '邀请关系', icon: 'icon-relation', type: 'M' }, component: 'agx/inviteChain' },
              { name: 'loginLogs', path: '/user/login-logs', meta: { title: '登录日志', icon: 'icon-history', type: 'M' }, component: 'agx/loginLogs' },
              { name: 'blacklist', path: '/user/blacklist', meta: { title: '黑名单', icon: 'icon-stop', type: 'M' }, component: 'agx/blacklist' },
              { name: 'userLevels', path: '/user/levels', meta: { title: 'VIP等级管理', icon: 'icon-star', type: 'M' }, component: 'agx/userLevels' },
            ]
          },
          
          // ========== 2. 财务审核（核心！）==========
          {
            name: 'financeMgmt',
            path: '/finance',
            meta: { title: '财务管理', icon: 'icon-wallet', type: 'M' },
            children: [
              { name: 'rechargeList', path: '/finance/recharge', meta: { title: '充值记录', icon: 'icon-download', type: 'M' }, component: 'agx/recharge' },
              { name: 'withdrawList', path: '/finance/withdraw', meta: { title: '提现审核', icon: 'icon-upload', type: 'M' }, component: 'agx/withdraw' },
              { name: 'assetLogs', path: '/finance/logs', meta: { title: '资产流水', icon: 'icon-file-text', type: 'M' }, component: 'agx/assetLogs' },
            ]
          },
          
          // ========== 3. AGX业务（核心！）==========
          {
            name: 'agxBusiness',
            path: '/agx',
            meta: { title: 'AGX业务', icon: 'icon-gold', type: 'M' },
            children: [
              { name: 'newCoin', path: '/agx/presale', meta: { title: 'AGX预售管理', icon: 'icon-plus-circle', type: 'M' }, component: 'agx/newCoin' },
              { name: 'goldHolding', path: '/agx/holding', meta: { title: '持币生金记录', icon: 'icon-rise', type: 'M' }, component: 'agx/goldHolding' },
              { name: 'goldIncome', path: '/agx/gold-income', meta: { title: '黄金收益记录', icon: 'icon-money-collect', type: 'M' }, component: 'agx/goldIncome' },
              { name: 'goldConfig', path: '/agx/gold-config', meta: { title: '黄金产品配置', icon: 'icon-settings', type: 'M' }, component: 'agx/goldConfig' },
              { name: 'poolMgmt', path: '/agx/pool', meta: { title: '矿机产品', icon: 'icon-storage', type: 'M' }, component: 'agx/pool' },
              { name: 'poolOrders', path: '/agx/pool-orders', meta: { title: '矿机订单', icon: 'icon-unordered-list', type: 'M' }, component: 'agx/poolOrders' },
            ]
          },
          
          // ========== 4. 交易管理 ==========
          {
            name: 'tradeMgmt',
            path: '/trade',
            meta: { title: '交易管理', icon: 'icon-swap', type: 'M' },
            children: [
              { name: 'contractOrders', path: '/trade/contract', meta: { title: '合约订单', icon: 'icon-stock', type: 'M' }, component: 'agx/contractOrders' },
              { name: 'otcOrders', path: '/trade/otc', meta: { title: 'OTC订单', icon: 'icon-interaction', type: 'M' }, component: 'agx/otcOrders' },
              { name: 'tradeSpot', path: '/trade/spot', meta: { title: '现货交易', icon: 'icon-swap', type: 'M' }, component: 'agx/tradeSpot' },
              { name: 'tradeGold', path: '/trade/gold', meta: { title: '黄金交易', icon: 'icon-gold', type: 'M' }, component: 'agx/tradeGold' },
            ]
          },
          
          // ========== 5. 返佣管理（核心！）==========
          {
            name: 'commissionMgmt',
            path: '/commission',
            meta: { title: '返佣管理', icon: 'icon-gift', type: 'M' },
            children: [
              { name: 'commissionLogs', path: '/commission/logs', meta: { title: '返佣记录', icon: 'icon-file-text', type: 'M' }, component: 'agx/commission' },
              { name: 'commissionConfig', path: '/commission/config', meta: { title: '返佣比例配置', icon: 'icon-percentage', type: 'M' }, component: 'agx/commissionConfig' },
              { name: 'inviteRank', path: '/commission/rank', meta: { title: '邀请排行榜', icon: 'icon-trophy', type: 'M' }, component: 'agx/inviteRank' },
              { name: 'incentiveConfig', path: '/commission/incentive', meta: { title: '奖励配置', icon: 'icon-fire', type: 'M' }, component: 'agx/incentiveConfig' },
            ]
          },
          
          // ========== 6. 内容管理 ==========
          {
            name: 'contentMgmt',
            path: '/content',
            meta: { title: '内容管理', icon: 'icon-notification', type: 'M' },
            children: [
              { name: 'bannerMgmt', path: '/content/banner', meta: { title: 'Banner管理', icon: 'icon-image', type: 'M' }, component: 'agx/banners' },
              { name: 'textConfig', path: '/content/text', meta: { title: '文案配置', icon: 'icon-edit', type: 'M' }, component: 'agx/textConfig' },
            ]
          },
          
          // ========== 7. 社区管理 ==========
          {
            name: 'socialMgmt',
            path: '/social',
            meta: { title: '社区管理', icon: 'icon-message', type: 'M' },
            children: [
              { name: 'noticeList', path: '/social/notice', meta: { title: '公告管理', icon: 'icon-notification', type: 'M' }, component: 'agx/notice' },
              { name: 'userPost', path: '/social/user-post', meta: { title: '用户帖子', icon: 'icon-file-text', type: 'M' }, component: 'agx/userPost' },
              { name: 'officialPost', path: '/social/official-post', meta: { title: 'AI官方发帖', icon: 'icon-robot', type: 'M' }, component: 'agx/officialPost' },
              { name: 'newsCrawler', path: '/social/news-crawler', meta: { title: '新闻采集', icon: 'icon-sync', type: 'M' }, component: 'agx/newsCrawler' },
              { name: 'topics', path: '/social/topics', meta: { title: '话题管理', icon: 'icon-tag', type: 'M' }, component: 'agx/topics' },
              { name: 'postCondition', path: '/social/condition', meta: { title: '发帖条件', icon: 'icon-lock', type: 'M' }, component: 'agx/postCondition' },
              { name: 'socialManage', path: '/social/manage', meta: { title: '社区设置', icon: 'icon-settings', type: 'M' }, component: 'agx/socialManage' },
            ]
          },
          
          // ========== 8. 市场配置 ==========
          {
            name: 'marketMgmt',
            path: '/market',
            meta: { title: '市场配置', icon: 'icon-line-chart', type: 'M' },
            children: [
              { name: 'marketCrypto', path: '/market/crypto', meta: { title: '加密货币', icon: 'icon-bitcoin', type: 'M' }, component: 'agx/marketCrypto' },
              { name: 'marketMetal', path: '/market/metal', meta: { title: '贵金属', icon: 'icon-gold', type: 'M' }, component: 'agx/marketMetal' },
              { name: 'marketForex', path: '/market/forex', meta: { title: '外汇', icon: 'icon-swap', type: 'M' }, component: 'agx/marketForex' },
              { name: 'marketStock', path: '/market/stock', meta: { title: '股票指数', icon: 'icon-stock', type: 'M' }, component: 'agx/marketStock' },
            ]
          },
          
          // ========== 9. 系统设置 ==========
          {
            name: 'systemMgmt',
            path: '/system',
            meta: { title: '系统设置', icon: 'icon-settings', type: 'M' },
            children: [
              { name: 'sysParams', path: '/system/params', meta: { title: '系统参数', icon: 'icon-tool', type: 'M' }, component: 'agx/config' },
              { name: 'currencyMgmt', path: '/system/currency', meta: { title: '币种管理', icon: 'icon-bitcoin', type: 'M' }, component: 'agx/currency' },
              { name: 'chainMgmt', path: '/system/chain', meta: { title: '链配置', icon: 'icon-link', type: 'M' }, component: 'agx/coinChain' },
              { name: 'menuConfig', path: '/system/menu', meta: { title: '菜单配置', icon: 'icon-menu', type: 'M' }, component: 'agx/menuConfig' },
              { name: 'featureSwitch', path: '/system/feature', meta: { title: '功能开关', icon: 'icon-poweroff', type: 'M' }, component: 'agx/featureSwitch' },
              { name: 'permissionMatrix', path: '/system/permission', meta: { title: '权限管理', icon: 'icon-safe', type: 'M' }, component: 'agx/permissionMatrix' },
              { name: 'adminLogs', path: '/system/logs', meta: { title: '操作日志', icon: 'icon-file-text', type: 'M' }, component: 'agx/adminLogs' },
            ]
          },
        ]
      }
    })
  }
}
