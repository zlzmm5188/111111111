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
    // AGX 后台 - 管理员专用
    return Promise.resolve({
      code: 0,
      data: {
        user: {
          id: 1,
          username: 'admin',
          nickname: '管理员',
          avatar: '/logo.png'
        },
        roles: ['superAdmin'],
        codes: [],
        routers: [
          // 首页
          {
            name: 'dashboard',
            path: '/dashboard',
            meta: { title: '首页', icon: 'icon-dashboard', type: 'M' },
            component: 'agx/dashboard'
          },
          // KYC审核
          {
            name: 'kycList',
            path: '/kyc',
            meta: { title: 'KYC审核', icon: 'icon-id-card', type: 'M' },
            component: 'agx/kyc'
          },
          // 提现审核
          {
            name: 'withdrawList',
            path: '/withdraw',
            meta: { title: '提现审核', icon: 'icon-wallet', type: 'M' },
            component: 'agx/withdraw'
          },
          // 充值记录
          {
            name: 'rechargeList',
            path: '/recharge',
            meta: { title: '充值记录', icon: 'icon-download', type: 'M' },
            component: 'agx/recharge'
          },
          // 资产流水
          {
            name: 'assetLogs',
            path: '/asset-logs',
            meta: { title: '资产流水', icon: 'icon-file-text', type: 'M' },
            component: 'agx/assetLogs'
          },
          // 产品管理
          {
            name: 'productMgmt',
            path: '/product',
            meta: { title: '产品管理', icon: 'icon-appstore', type: 'M' },
            children: [
              { name: 'newCoin', path: '/product/presale', meta: { title: 'AGX发售', type: 'M' }, component: 'agx/newCoin' },
              { name: 'poolMgmt', path: '/product/pool', meta: { title: '矿机产品', type: 'M' }, component: 'agx/pool' },
              { name: 'agxConfig', path: '/agx/config', meta: { title: 'AGX配置', type: 'M' }, component: 'agx/config' },
            ]
          },
          // 用户查询
          {
            name: 'userList',
            path: '/users',
            meta: { title: '用户查询', icon: 'icon-user', type: 'M' },
            component: 'agx/users'
          },
          // 公告管理
          {
            name: 'noticeList',
            path: '/notice',
            meta: { title: '公告管理', icon: 'icon-notification', type: 'M' },
            component: 'agx/notice'
          },
        ]
      }
    })
  }
}
