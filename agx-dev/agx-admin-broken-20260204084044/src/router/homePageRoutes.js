const homePageRoutes = [
  {
    name: 'dashboard',
    path: '/dashboard',
    meta: {
      title: '仪表盘',
      icon: 'icon-dashboard',
      type: 'M',
      affix: true
    },
    component: () => import('@/views/dashboard/index.vue'),
  }, {
    name: 'userCenter',
    path: '/usercenter',
    meta: {
      title: '个人信息',
      icon: 'icon-user',
      type: 'M',
    },
    component: () => import('@/views/userCenter/index.vue'),
  }, {
    name: 'message',
    path: '/message',
    meta: {
      title: '消息中心',
      icon: 'icon-message',
      type: 'M',
    },
    component: () => import('@/views/userCenter/message.vue'),
  }, {
    name: 'store',
    path: '/store',
    component: () => import('@/views/appStore/index.vue'),
    meta: { title: '应用市场', hidden: true }
  },
  // KYC审核
  {
    name: 'agxKyc',
    path: '/kyc',
    component: () => import('@/views/agx/kyc.vue'),
    meta: { title: 'KYC审核', hidden: true }
  },
  // 提现审核
  {
    name: 'agxWithdraw',
    path: '/withdraw',
    component: () => import('@/views/agx/withdraw.vue'),
    meta: { title: '提现审核', hidden: true }
  },
  // 充值记录
  {
    name: 'agxRecharge',
    path: '/recharge',
    component: () => import('@/views/agx/recharge.vue'),
    meta: { title: '充值记录', hidden: true }
  },
  // 资产流水
  {
    name: 'agxAssetLogs',
    path: '/asset-logs',
    component: () => import('@/views/agx/assetLogs.vue'),
    meta: { title: '资产流水', hidden: true }
  },
  // 用户查询
  {
    name: 'agxUsers',
    path: '/users',
    component: () => import('@/views/agx/users.vue'),
    meta: { title: '用户查询', hidden: true }
  },
  // 公告管理
  {
    name: 'agxNotice',
    path: '/notice',
    component: () => import('@/views/agx/notice.vue'),
    meta: { title: '公告管理', hidden: true }
  },
  // AGX预售
  {
    name: 'agxNewCoin',
    path: '/product/presale',
    component: () => import('@/views/agx/newCoin.vue'),
    meta: { title: 'AGX预售', hidden: true }
  },
  // 矿机产品
  {
    name: 'agxPool',
    path: '/product/pool',
    component: () => import('@/views/agx/pool.vue'),
    meta: { title: '矿机产品', hidden: true }
  },
  // AGX 用户详情
  {
    name: 'agxUserDetail',
    path: '/agx/userDetail/:id',
    component: () => import('@/views/agx/userDetail.vue'),
    meta: { title: '用户详情', hidden: true }
  },
  // AGX配置
  {
    name: 'agxConfig',
    path: '/agx/config',
    component: () => import('@/views/agx/config.vue'),
    meta: { title: 'AGX配置', hidden: true }
  },
]

export const homePage = {
  name: 'home',
  path: '/home',
  meta: { title: '首页', icon: 'icon-home', hidden: false, type: 'M' }
}

export default homePageRoutes