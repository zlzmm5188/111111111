/**
 * AGX 资金类App - 页面流转与状态流转设计
 * 
 * 设计原则：
 * 1. 余额字段只能通过程序计算或受控更新
 * 2. 所有金额变化必须有流水记录
 * 3. 后端以「状态流转图」为核心设计
 */

// ============================================
// 一、核心页面结构（页面级 vs 组件级）
// ============================================

export const PAGE_STRUCTURE = {
  // 一级页面（TabBar）
  tabPages: [
    { path: '/home', name: '首页', component: 'Home' },
    { path: '/markets', name: '行情', component: 'Markets' },
    { path: '/trade', name: '交易', component: 'Trade' },
    { path: '/square', name: '广场', component: 'Square' },
    { path: '/mine', name: '我的', component: 'Mine' }
  ],

  // 二级页面（从一级页面进入）
  subPages: {
    // 交易相关
    trade: [
      { path: '/ieo', name: 'AGX认购', from: ['home', 'trade'] },
      { path: '/contract', name: '秒合约', from: ['trade'] },
      { path: '/gold', name: '黄金兑换', from: ['trade'] },
      { path: '/earn', name: '理财', from: ['trade'] },
      { path: '/otc', name: 'OTC交易', from: ['trade'] }
    ],
    
    // 资产相关
    assets: [
      { path: '/assets', name: '资产详情', from: ['mine'] },
      { path: '/deposit', name: '充值', from: ['assets'] },
      { path: '/withdraw', name: '提现', from: ['assets'] },
      { path: '/orders', name: '订单记录', from: ['mine', 'assets'] }
    ],
    
    // 用户相关
    user: [
      { path: '/settings', name: '设置', from: ['mine'] },
      { path: '/security', name: '安全中心', from: ['settings'] },
      { path: '/kyc', name: '身份认证', from: ['mine', 'security'] },
      { path: '/invite', name: '邀请好友', from: ['mine'] }
    ]
  }
}

// ============================================
// 二、资金操作状态流转图
// ============================================

/**
 * 充值流程状态机
 * 
 * [发起充值] → PENDING
 *     ↓
 * [链上确认] → CONFIRMING (等待区块确认)
 *     ↓
 * [确认完成] → SUCCESS → 更新余额 + 记录流水
 *     ↓ (失败)
 * [超时/失败] → FAILED
 */
export const DEPOSIT_STATUS = {
  PENDING: 'pending',       // 等待转账
  CONFIRMING: 'confirming', // 链上确认中
  SUCCESS: 'success',       // 成功
  FAILED: 'failed',         // 失败
  EXPIRED: 'expired'        // 已过期
}

/**
 * 提现流程状态机
 * 
 * [发起提现] → PENDING → 冻结余额
 *     ↓
 * [风控审核] → REVIEWING
 *     ↓ (通过)
 * [打款处理] → PROCESSING
 *     ↓
 * [链上确认] → SUCCESS → 扣减余额 + 记录流水
 *     ↓ (拒绝)
 * [审核拒绝] → REJECTED → 解冻余额
 */
export const WITHDRAW_STATUS = {
  PENDING: 'pending',       // 待审核
  REVIEWING: 'reviewing',   // 审核中
  PROCESSING: 'processing', // 处理中
  SUCCESS: 'success',       // 成功
  REJECTED: 'rejected',     // 已拒绝
  CANCELLED: 'cancelled'    // 已取消
}

/**
 * IEO认购状态机
 * 
 * [发起认购] → PENDING → 冻结USDT
 *     ↓
 * [支付确认] → PAID
 *     ↓
 * [认购成功] → SUCCESS → 扣USDT + 发AGX + 记录流水
 *     ↓ (失败)
 * [认购失败] → FAILED → 解冻USDT
 */
export const IEO_ORDER_STATUS = {
  PENDING: 'pending',       // 待支付
  PAID: 'paid',             // 已支付
  SUCCESS: 'success',       // 认购成功
  FAILED: 'failed',         // 认购失败
  REFUNDED: 'refunded'      // 已退款
}

/**
 * 秒合约订单状态机
 * 
 * [下单] → OPEN → 冻结保证金
 *     ↓ (到期)
 * [结算] → 判断涨跌
 *     ↓ (盈利)
 * [盈利] → WIN → 退保证金 + 发收益 + 记录流水
 *     ↓ (亏损)
 * [亏损] → LOSE → 扣保证金 + 记录流水
 */
export const CONTRACT_STATUS = {
  OPEN: 'open',             // 持仓中
  WIN: 'win',               // 盈利
  LOSE: 'lose',             // 亏损
  DRAW: 'draw',             // 平局（退还）
  CANCELLED: 'cancelled'    // 已取消
}

// ============================================
// 三、流水类型定义（所有金额变化必须记录）
// ============================================

export const TRANSACTION_TYPES = {
  // 充提
  DEPOSIT: 'deposit',           // 充值
  WITHDRAW: 'withdraw',         // 提现
  WITHDRAW_FEE: 'withdraw_fee', // 提现手续费
  
  // 交易
  IEO_BUY: 'ieo_buy',           // IEO认购
  IEO_REFUND: 'ieo_refund',     // IEO退款
  CONTRACT_BET: 'contract_bet', // 合约下注
  CONTRACT_WIN: 'contract_win', // 合约盈利
  CONTRACT_LOSE: 'contract_lose', // 合约亏损
  
  // 理财
  EARN_DEPOSIT: 'earn_deposit',   // 理财存入
  EARN_WITHDRAW: 'earn_withdraw', // 理财赎回
  EARN_INTEREST: 'earn_interest', // 理财收益
  
  // 系统
  SYSTEM_REWARD: 'system_reward', // 系统奖励
  INVITE_REWARD: 'invite_reward', // 邀请奖励
  MANUAL_ADJUST: 'manual_adjust'  // 人工调整（需审计）
}

// ============================================
// 四、页面组件级划分
// ============================================

export const COMPONENT_STRUCTURE = {
  // 共享组件（跨页面复用）
  shared: [
    'PriceDisplay',   // 价格+涨跌显示
    'CoinItem',       // 币种列表项
    'SectionTitle',   // 区块标题
    'ActionButton',   // 操作按钮
    'Empty',          // 空状态
    'Loading',        // 加载状态
    'Skeleton',       // 骨架屏
    'TabBar',         // 底部导航
    'PageLayout'      // 页面布局
  ],
  
  // 业务组件（特定页面）
  business: {
    home: ['LaunchCard', 'TickerGrid', 'QuickActions', 'MarketList'],
    trade: ['SubscribeCard', 'StakingCard', 'ContractPanel'],
    assets: ['AssetCard', 'TransactionItem', 'BalanceDisplay'],
    square: ['PostCard', 'TopicTag', 'UserBadge']
  }
}

// ============================================
// 五、典型用户路径（核心转化漏斗）
// ============================================

export const USER_JOURNEYS = {
  // 新用户首次认购路径
  newUserIEO: [
    { step: 1, page: '/home', action: '看到AGX认购卡片' },
    { step: 2, page: '/register', action: '注册账号' },
    { step: 3, page: '/kyc', action: '完成身份认证' },
    { step: 4, page: '/deposit', action: '充值USDT' },
    { step: 5, page: '/ieo', action: '参与认购' },
    { step: 6, page: '/assets', action: '查看AGX余额' }
  ],
  
  // 秒合约交易路径
  contractTrade: [
    { step: 1, page: '/markets', action: '查看行情' },
    { step: 2, page: '/contract', action: '选择交易对' },
    { step: 3, page: '/contract', action: '选择时间/金额/方向' },
    { step: 4, page: '/contract', action: '确认下单' },
    { step: 5, page: '/contract', action: '等待结算' },
    { step: 6, page: '/orders', action: '查看订单结果' }
  ],
  
  // 理财存入路径
  earnDeposit: [
    { step: 1, page: '/trade', action: '进入AGX生态' },
    { step: 2, page: '/earn', action: '选择理财产品' },
    { step: 3, page: '/earn/detail', action: '查看收益规则' },
    { step: 4, page: '/earn/deposit', action: '输入存入金额' },
    { step: 5, page: '/earn', action: '确认存入' },
    { step: 6, page: '/assets', action: '查看理财资产' }
  ]
}

export default {
  PAGE_STRUCTURE,
  DEPOSIT_STATUS,
  WITHDRAW_STATUS,
  IEO_ORDER_STATUS,
  CONTRACT_STATUS,
  TRANSACTION_TYPES,
  COMPONENT_STRUCTURE,
  USER_JOURNEYS
}
