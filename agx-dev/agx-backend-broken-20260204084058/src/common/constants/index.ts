/**
 * AGX 系统常量配置
 * 统一管理硬编码值，便于维护
 */

// ===== 币种ID =====
export const COIN_IDS = {
  AGX: 1,
  USDT: 2,
} as const;

// ===== 返佣配置 =====
export const COMMISSION_CONFIG = {
  // 返佣档位 (有效好友数 -> 返佣比例)
  TIERS: [
    { min: 26, rate: 0.30 },  // 30%
    { min: 16, rate: 0.18 },  // 18%
    { min: 10, rate: 0.12 },  // 12%
    { min: 4, rate: 0.08 },   // 8%
    { min: 1, rate: 0.03 },   // 3%
  ],
  // 有效用户判定标准
  VALID_USER: {
    MIN_HOLDING_AMOUNT: 100,  // 最低建仓金额
    MIN_LOCK_DAYS: 7,         // 最低锁定天数
  },
} as const;

// ===== 会员等级 =====
export const MEMBER_LEVELS = {
  INITIATE: 0,      // 启蒙会员
  ACCESS: 1,        // 准入会员
  SELECT: 2,        // 优选会员
  CAPITAL: 3,       // 资本合伙人
  EXECUTIVE: 4,     // 执行官合伙人
  SOVEREIGN: 5,     // 主权合伙人
} as const;

// ===== 系统默认值 =====
export const DEFAULTS = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DECIMAL_PRECISION: 8,
} as const;

// ===== 资产流水类型 =====
export const ASSET_LOG_TYPES = {
  RECHARGE: 'recharge',
  WITHDRAW: 'withdraw',
  POOL_SUBSCRIBE: 'pool_subscribe',
  POOL_REDEEM: 'pool_redeem',
  POOL_INCOME: 'pool_income',
  CONTRACT_BET: 'contract_bet',
  CONTRACT_WIN: 'contract_win',
  CONTRACT_LOSE: 'contract_lose',
  COMMISSION: 'commission',
  UPGRADE_BONUS: 'upgrade_bonus',
  TASK_REWARD: 'task_reward',
} as const;

/**
 * 根据有效好友数获取返佣比例
 */
export function getCommissionRateByCount(count: number): number {
  for (const tier of COMMISSION_CONFIG.TIERS) {
    if (count >= tier.min) {
      return tier.rate;
    }
  }
  return 0;
}
