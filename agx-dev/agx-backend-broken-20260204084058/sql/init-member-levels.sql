-- ================================================
-- AGX 会员等级初始化脚本
-- 经验值规则：1U = 1点经验值
-- ================================================

TRUNCATE TABLE agx_member_level;

INSERT INTO agx_member_level (
  level,
  name,
  name_en,
  icon,
  color,
  min_points,
  max_points,
  upgrade_bonus,
  pool_rate_bonus,
  free_withdraw_days,
  withdraw_priority,
  contract_enabled,
  new_coin_priority,
  max_trade_enabled,
  vip_support,
  ticket_priority,
  one_to_one_service,
  withdraw_fee_free,
  benefits,
  is_enabled,
  sort_order
) VALUES

-- 1. Access（准入层）6000点 = 6000U
(
  1,
  '准入会员',
  'Access',
  '🛡️',
  '#8B9DC3',
  0,
  6000,
  200.00,
  0.0002,  -- 0.02%
  0,       -- 无免费提现
  0,
  0,       -- 无合约权限
  0,
  0,
  0,
  0,
  0,
  0,
  '{"rewards": ["进阶奖励200U"], "poolBonus": "矿机利率+0.02%"]}',
  1,
  1
),

-- 2. Prime（优选层）20000点 = 20000U
(
  2,
  '优选会员',
  'Prime',
  '⭐',
  '#4A90D9',
  6000,
  20000,
  600.00,
  0.0006,  -- 0.06%
  7,       -- 每周免费提现1次
  0,
  1,       -- 开启合约权限
  0,
  0,
  0,
  0,
  0,
  0,
  '{"rewards": ["进阶奖励600U", "开启合约权限", "每周免费提现1次"], "poolBonus": "矿机利率+0.06%"}',
  1,
  2
),

-- 3. Capital（资本层）80000点 = 80000U
(
  3,
  '资本合伙人',
  'Capital',
  '💎',
  '#D4AF37',
  20000,
  80000,
  1500.00,
  0.0010,  -- 0.10%
  3,       -- 每3天免费提现1次
  1,       -- 提现优先到账
  1,       -- 合约权限
  0,
  0,
  0,
  0,
  0,
  0,
  '{"rewards": ["进阶奖励1500U", "每3天免费提现1次", "提现优先到账"], "poolBonus": "矿机利率+0.10%", "note": "从民众跨越到资本的艰辛过程，资源差异巨大"}',
  1,
  3
),

-- 4. Executive（执行官层）500000点 = 500000U
(
  4,
  '执行官合伙人',
  'Executive',
  '👑',
  '#9B59B6',
  80000,
  500000,
  5000.00,
  0.0016,  -- 0.16%
  2,       -- 每2天免费提现1次
  1,       -- 提现优先到账
  1,       -- 合约权限
  1,       -- 新币抢先交易
  1,       -- 最大交易额度
  0,
  0,
  0,
  0,
  '{"rewards": ["进阶奖励5000U", "新币抢先交易", "最大交易额度", "每2天免费提现1次", "提现优先到账"], "poolBonus": "矿机利率+0.16%", "note": "凤毛麟角，能有几个就不错"}',
  1,
  4
),

-- 5. Sovereign（主权层）3000000点 = 3000000U
(
  5,
  '主权合伙人',
  'Sovereign',
  '🏆',
  '#C9A962',
  500000,
  NULL,    -- 无上限
  10000.00,
  0.0022,  -- 0.22%
  0,       -- 终生免手续费，不需要免费提现周期
  1,       -- 提现优先到账
  1,       -- 合约权限
  1,       -- 新币抢先交易
  1,       -- 最大交易额度
  1,       -- VIP专属客服
  1,       -- 工单优先级
  1,       -- 1V1专属服务
  1,       -- 终生免提现手续费
  '{"rewards": ["进阶奖励10000U", "VIP专属客服", "提现优先到账", "工单优先级", "重大异常1V1对接", "终生提现手续费全免"], "poolBonus": "矿机利率+0.22%", "note": "顶级上限，万一真的有还是要给客户发挥空间"}',
  1,
  5
);

-- 验证数据
SELECT
  level AS '等级',
  name AS '名称',
  name_en AS '英文名',
  icon AS '图标',
  CONCAT(min_points, ' - ', COALESCE(max_points, '∞')) AS '经验值范围',
  CONCAT(upgrade_bonus, 'U') AS '进阶奖励',
  CONCAT(pool_rate_bonus * 100, '%') AS '矿机加利率',
  CASE free_withdraw_days
    WHEN 0 THEN '无'
    WHEN 7 THEN '每周1次'
    WHEN 3 THEN '每3天1次'
    WHEN 2 THEN '每2天1次'
    ELSE '终生免费'
  END AS '免费提现',
  CASE contract_enabled WHEN 1 THEN '✓' ELSE '✗' END AS '合约',
  CASE new_coin_priority WHEN 1 THEN '✓' ELSE '✗' END AS '新币抢先',
  CASE max_trade_enabled WHEN 1 THEN '✓' ELSE '✗' END AS '最大额度',
  CASE vip_support WHEN 1 THEN '✓' ELSE '✗' END AS 'VIP客服',
  CASE withdraw_fee_free WHEN 1 THEN '✓' ELSE '✗' END AS '免手续费'
FROM agx_member_level
ORDER BY level;
