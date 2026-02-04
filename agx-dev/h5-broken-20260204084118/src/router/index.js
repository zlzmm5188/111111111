/**
 * AGX - 最完整路由配置
 * 包含所有页面，解决所有点击无反应问题
 */

import { createRouter, createWebHistory } from 'vue-router'
import { tokenStorage } from '@/utils/security'

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ===== 基础页面 =====
    {
      path: '/splash',
      name: 'Splash',
      component: () => import('@/views/Splash.vue'),
      meta: { title: 'AGX' }
    },
    {
      path: '/',
      redirect: '/splash'
    },
    {
      path: '/home',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
      meta: { title: 'AGX', showTabBar: true }
    },
    
    // ===== 认证页面 =====
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue'),
      meta: { title: '注册' }
    },
    {
      path: '/i/:code',
      name: 'InviteLanding',
      component: () => import('@/views/InviteLanding.vue'),
      meta: { title: '邀请注册' }
    },
    
    // ===== 主要功能页面 =====
    {
      path: '/square',
      name: 'Square',
      component: () => import('@/views/Square.vue'),
      meta: { title: '广场', showTabBar: true }
    },
    {
      path: '/team',
      name: 'Team',
      component: () => import('@/views/Team.vue'),
      meta: { title: '团队介绍' }
    },
    {
      path: '/mine',
      name: 'Mine',
      component: () => import('@/views/Mine.vue'),
      meta: { title: '我的', showTabBar: true }
    },
    {
      path: '/markets',
      name: 'Markets',
      component: () => import('@/views/Markets/index.vue'),
      meta: { title: '行情', showTabBar: true }
    },
    {
      path: '/agx',
      name: 'AGX',
      component: () => import('@/views/AGX.vue'),
      meta: { title: 'AGX', showTabBar: true }
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('@/views/About.vue'),
      meta: { title: '关于我们' }
    },
    {
      path: '/help',
      name: 'Help',
      component: () => import('@/views/Help.vue'),
      meta: { title: '帮助中心' }
    },
    
    // ===== 九宫格功能页面 =====
    {
      path: '/ieo',
      name: 'Ieo',
      component: () => import('@/views/Ieo.vue'),
      meta: { title: '新币上线' }
    },
    {
      path: '/trade',
      name: 'Trade',
      component: () => import('@/views/Trade.vue'),
      meta: { title: '现货交易' }
    },
    {
      path: '/contract',
      name: 'Contract',
      component: () => import('@/views/Contract.vue'),
      meta: { title: '合约交易' }
    },
    {
      path: '/gold',
      name: 'Gold',
      component: () => import('@/views/Gold.vue'),
      meta: { title: '黄金交易' }
    },
    {
      path: '/earn',
      name: 'Earn',
      component: () => import('@/views/Earn.vue'),
      meta: { title: '持币生金' }
    },
    {
      path: '/pool',
      name: 'Pool',
      component: () => import('@/views/Pool.vue'),
      meta: { title: '矿机理财' }
    },
    {
      path: '/copy-trade',
      name: 'CopyTrade',
      component: () => import('@/views/CopyTrade.vue'),
      meta: { title: '跟单交易' }
    },
    {
      path: '/otc',
      name: 'Otc',
      component: () => import('@/views/Otc.vue'),
      meta: { title: 'OTC交易' }
    },
    {
      path: '/ai',
      name: 'AI',
      component: () => import('@/views/AI.vue'),
      meta: { title: 'AI助手' }
    },
    
    // ===== 个人中心功能页面 =====
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/Settings.vue'),
      meta: { title: '设置' }
    },
    {
      path: '/deposit',
      name: 'Deposit',
      component: () => import('@/views/Deposit.vue'),
      meta: { title: '充值' }
    },
    {
      path: '/withdraw',
      name: 'Withdraw',
      component: () => import('@/views/Withdraw.vue'),
      meta: { title: '提现' }
    },
    {
      path: '/orders',
      name: 'Orders',
      component: () => import('@/views/Orders.vue'),
      meta: { title: '订单' }
    },
    {
      path: '/assets',
      name: 'Assets',
      component: () => import('@/views/Assets.vue'),
      meta: { title: '资产' }
    },
    {
      path: '/kyc',
      name: 'KYC',
      component: () => import('@/views/KYC.vue'),
      meta: { title: 'KYC认证' }
    },
    {
      path: '/tasks',
      name: 'Tasks',
      component: () => import('@/views/Tasks.vue'),
      meta: { title: '任务' }
    },
    {
      path: '/invite',
      name: 'Invite',
      component: () => import('@/views/Invite.vue'),
      meta: { title: '邀请' }
    },
    {
      path: '/membership',
      name: 'Membership',
      component: () => import('@/views/Membership.vue'),
      meta: { title: '会员' }
    },
    
    // ===== 动态路由页面 =====
    {
      path: '/coin/:symbol',
      name: 'CoinDetail',
      component: () => import('@/views/CoinDetail.vue'),
      meta: { title: '币种详情' }
    },
    {
      path: '/post/:id',
      name: 'PostDetail',
      component: () => import('@/views/PostDetail.vue'),
      meta: { title: '帖子详情' }
    },
    {
      path: '/user/:id',
      name: 'UserProfile',
      component: () => import('@/views/UserProfile.vue'),
      meta: { title: '用户资料' }
    },
    {
      path: '/topic/:id',
      name: 'Topic',
      component: () => import('@/views/Topic.vue'),
      meta: { title: '话题' }
    },
    {
      path: '/chat/:id',
      name: 'ChatDetail',
      component: () => import('@/views/ChatDetail.vue'),
      meta: { title: '聊天详情' }
    },
    
    // ===== 其他功能页面 =====
    {
      path: '/create-post',
      name: 'CreatePost',
      component: () => import('@/views/CreatePost.vue'),
      meta: { title: '发布动态' }
    },
    {
      path: '/chat',
      name: 'Chat',
      component: () => import('@/views/Chat.vue'),
      meta: { title: '聊天' }
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('@/views/Search.vue'),
      meta: { title: '搜索' }
    },
    {
      path: '/notifications',
      name: 'Notifications',
      component: () => import('@/views/Notifications.vue'),
      meta: { title: '通知' }
    },
    {
      path: '/ranking',
      name: 'Ranking',
      component: () => import('@/views/Ranking.vue'),
      meta: { title: '排行榜' }
    },
    {
      path: '/showcase',
      name: 'Showcase',
      component: () => import('@/views/Showcase.vue'),
      meta: { title: '展示' }
    },
    {
      path: '/kline',
      name: 'Kline',
      component: () => import('@/views/Kline.vue'),
      meta: { title: 'K线图' }
    },
    {
      path: '/agx-intro',
      name: 'AGXIntro',
      component: () => import('@/views/AGXIntro.vue'),
      meta: { title: 'AGX介绍' }
    },
    
    // ===== 文档页面 =====
    {
      path: '/audit',
      name: 'Audit',
      component: () => import('@/views/Audit.vue'),
      meta: { title: '审计报告' }
    },
    {
      path: '/whitepaper',
      name: 'Whitepaper',
      component: () => import('@/views/Whitepaper.vue'),
      meta: { title: '白皮书' }
    },
    {
      path: '/company-whitepaper',
      name: 'CompanyWhitepaper',
      component: () => import('@/views/CompanyWhitepaper.vue'),
      meta: { title: '公司白皮书' }
    },
    {
      path: '/agreement',
      name: 'Agreement',
      component: () => import('@/views/Agreement.vue'),
      meta: { title: '用户协议' }
    },
    {
      path: '/privacy',
      name: 'Privacy',
      component: () => import('@/views/Privacy.vue'),
      meta: { title: '隐私政策' }
    },
    {
      path: '/disclaimer',
      name: 'Disclaimer',
      component: () => import('@/views/Disclaimer.vue'),
      meta: { title: '免责声明' }
    },
    
    // ===== 404页面 =====
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/Home.vue')
    }
  ]
})

// 简单的路由守卫，只设置页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title + ' - AGX生态'
  }

  // 需要登录的页面（按路径前缀判断）
  const protectedPrefixes = [
    '/mine',
    '/invite',
    '/assets',
    '/tasks',
    '/settings',
    '/orders',
    '/withdraw',
    '/deposit',
    '/membership',
    '/kyc',
    '/notifications',
    '/chat',
    '/create-post',
  ]

  const isProtected = protectedPrefixes.some(prefix => to.path.startsWith(prefix))
  if (isProtected && !tokenStorage.hasToken()) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  const authOnlyPaths = ['/login', '/register']
  if (authOnlyPaths.includes(to.path) && tokenStorage.hasToken()) {
    if (!tokenStorage.hasToken()) {
      // allow
    } else {
      next({ path: '/mine' })
      return
    }
  }
  
  next()
})

export default router
