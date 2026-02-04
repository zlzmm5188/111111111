-- ============================================================
-- AGX 激励体系数据库迁移
-- 009_incentive_system.sql
-- 包含：返佣阶梯、双向奖励、会员等级
-- ============================================================

-- ============================================================
-- 1. 返佣阶梯配置表（9档位，按产品独立计算）
-- ============================================================
CREATE TABLE IF NOT EXISTS agx_commission_tier (
  id              BIGSERIAL PRIMARY KEY,
  tier_level      INT NOT NULL UNIQUE,                    -- 档位等级 1-9
  min_invites     INT NOT NULL,                           -- 最低建仓人数
  commission_rate DECIMAL(5,4) NOT NULL,                  -- 返佣比例
  is_enabled      SMALLINT NOT NULL DEFAULT 1,            -- 是否开放 1开放 0关闭
  description     VARCHAR(100),                           -- 档位说明
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE agx_commission_tier IS '返佣阶梯配置表';
COMMENT ON COLUMN agx_commission_tier.tier_level IS '档位等级 1-9';
COMMENT ON COLUMN agx_commission_tier.min_invites IS '最低建仓人数';
COMMENT ON COLUMN agx_commission_tier.commission_rate IS '返佣比例';
COMMENT ON COLUMN agx_commission_tier.is_enabled IS '是否开放 1开放 0关闭';

-- 初始化9档位返佣阶梯
INSERT INTO agx_commission_tier (tier_level, min_invites, commission_rate, is_enabled, description) VALUES
(1, 1, 0.005, 1, '1人建仓 - 0.5%'),
(2, 3, 0.015, 1, '3人建仓 - 1.5%'),
(3, 5, 0.03, 1, '5人建仓 - 3%'),
(4, 9, 0.06, 1, '9人建仓 - 6%'),
(5, 15, 0.09, 1, '15人建仓 - 9%'),
(6, 20, 0.12, 0, '20人建仓 - 12% (待开放)'),
(7, 28, 0.15, 0, '28人建仓 - 15% (待开放)'),
(8, 40, 0.20, 0, '40人建仓 - 20% (待开放)'),
(9, 60, 0.28, 0, '60人建仓 - 28% (待开放)')
ON CONFLICT (tier_level) DO UPDATE SET
  min_invites = EXCLUDED.min_invites,
  commission_rate = EXCLUDED.commission_rate,
  is_enabled = EXCLUDED.is_enabled,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================
-- 2. 双向奖励配置表（邀请注册奖励）
-- ============================================================
CREATE TABLE IF NOT EXISTS agx_invite_bonus_tier (
  id              BIGSERIAL PRIMARY KEY,
  invite_order    INT NOT NULL UNIQUE,                    -- 第几个邀请 1-10
  invitee_bonus   DECIMAL(20,8) NOT NULL,                 -- 被邀请人获得（AGX币）
  inviter_bonus   DECIMAL(20,8) NOT NULL,                 -- 邀请人获得（AGX币）
  is_enabled      SMALLINT NOT NULL DEFAULT 1,            -- 是否开放
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE agx_invite_bonus_tier IS '双向奖励配置表';
COMMENT ON COLUMN agx_invite_bonus_tier.invite_order IS '第几个邀请 1-10';
COMMENT ON COLUMN agx_invite_bonus_tier.invitee_bonus IS '被邀请人获得（AGX币）';
COMMENT ON COLUMN agx_invite_bonus_tier.inviter_bonus IS '邀请人获得（AGX币）';

-- 初始化10档双向奖励
INSERT INTO agx_invite_bonus_tier (invite_order, invitee_bonus, inviter_bonus, is_enabled) VALUES
(1, 10, 5, 1),
(2, 10, 8, 1),
(3, 10, 12, 1),
(4, 10, 18, 1),
(5, 10, 25, 1),
(6, 10, 32, 1),
(7, 10, 42, 1),
(8, 10, 55, 1),
(9, 10, 70, 1),
(10, 10, 90, 1)
ON CONFLICT (invite_order) DO UPDATE SET
  invitee_bonus = EXCLUDED.invitee_bonus,
  inviter_bonus = EXCLUDED.inviter_bonus,
  is_enabled = EXCLUDED.is_enabled,
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================
-- 3. 双向奖励发放记录表
-- ============================================================
CREATE TABLE IF NOT EXISTS agx_invite_bonus_record (
  id              BIGSERIAL PRIMARY KEY,
  inviter_id      BIGINT NOT NULL,                        -- 邀请人ID
  invitee_id      BIGINT NOT NULL,                        -- 被邀请人ID
  invite_order    INT NOT NULL,                           -- 第几个邀请
  inviter_bonus   DECIMAL(20,8) NOT NULL,                 -- 邀请人获得
  invitee_bonus   DECIMAL(20,8) NOT NULL,                 -- 被邀请人获得
  status          SMALLINT NOT NULL DEFAULT 1,            -- 状态 1已发放 0待发放
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_invite_bonus_inviter ON agx_invite_bonus_record(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invite_bonus_invitee ON agx_invite_bonus_record(invitee_id);
COMMENT ON TABLE agx_invite_bonus_record IS '双向奖励发放记录表';

-- ============================================================
-- 4. 会员等级配置表（按充值金额）
-- ============================================================
CREATE TABLE IF NOT EXISTS agx_member_level (
  id              BIGSERIAL PRIMARY KEY,
  level           INT NOT NULL UNIQUE,                    -- 等级 1-5
  name            VARCHAR(50) NOT NULL,                   -- 等级名称
  name_en         VARCHAR(50),                            -- 英文名称
  icon            VARCHAR(10),                            -- 图标emoji
  color           VARCHAR(20),                            -- 颜色
  min_recharge    DECIMAL(20,2) NOT NULL DEFAULT 0,       -- 最低累计充值（USDT）
  fee_discount    DECIMAL(5,4) NOT NULL DEFAULT 1.00,     -- 手续费折扣
  income_bonus    DECIMAL(5,4) NOT NULL DEFAULT 0,        -- 收益加成比例
  withdraw_limit  DECIMAL(20,2),                          -- 每日提现限额（NULL=无限制）
  benefits        TEXT,                                   -- 其他权益说明（JSON）
  status          SMALLINT NOT NULL DEFAULT 1,            -- 状态 1启用 0禁用
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE agx_member_level IS '会员等级配置表（按充值金额）';
COMMENT ON COLUMN agx_member_level.min_recharge IS '最低累计充值（USDT）';
COMMENT ON COLUMN agx_member_level.fee_discount IS '手续费折扣 1.00=无折扣';
COMMENT ON COLUMN agx_member_level.income_bonus IS '收益加成比例 0.05=5%';

-- 初始化5个会员等级
INSERT INTO agx_member_level (level, name, name_en, icon, color, min_recharge, fee_discount, income_bonus, withdraw_limit) VALUES
(1, '普通会员', 'Basic', '🥉', '#848E9C', 0, 1.00, 0.00, 5000),
(2, '银牌会员', 'Silver', '🥈', '#C0C0C0', 1000, 0.95, 0.02, 10000),
(3, '金牌会员', 'Gold', '🥇', '#D4B872', 10000, 0.90, 0.05, 50000),
(4, '钻石会员', 'Diamond', '💎', '#00D1FF', 50000, 0.85, 0.08, 100000),
(5, '黑金会员', 'Platinum', '👑', '#1E1E1E', 200000, 0.80, 0.12, NULL)
ON CONFLICT (level) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  min_recharge = EXCLUDED.min_recharge,
  fee_discount = EXCLUDED.fee_discount,
  income_bonus = EXCLUDED.income_bonus,
  withdraw_limit = EXCLUDED.withdraw_limit,
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================
-- 5. 用户产品推广统计表（按产品维度统计有效建仓人数）
-- ============================================================
CREATE TABLE IF NOT EXISTS agx_user_product_commission_stats (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL,                        -- 推广人ID
  product_id      BIGINT NOT NULL,                        -- 产品ID
  valid_invites   INT NOT NULL DEFAULT 0,                 -- 该产品有效建仓好友数
  current_tier    INT NOT NULL DEFAULT 1,                 -- 当前档位
  current_rate    DECIMAL(5,4) NOT NULL DEFAULT 0.005,    -- 当前返佣比例
  total_commission DECIMAL(20,8) NOT NULL DEFAULT 0,      -- 该产品累计返佣
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_product_commission_user ON agx_user_product_commission_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_product_commission_product ON agx_user_product_commission_stats(product_id);
COMMENT ON TABLE agx_user_product_commission_stats IS '用户产品推广统计表';

-- ============================================================
-- 6. 扩展用户表字段
-- ============================================================
DO $$
BEGIN
  -- 会员等级（按充值）
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agx_user' AND column_name='member_level') THEN
    ALTER TABLE agx_user ADD COLUMN member_level INT NOT NULL DEFAULT 1;
    COMMENT ON COLUMN agx_user.member_level IS '会员等级（按充值）1-5';
  END IF;

  -- 累计充值
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agx_user' AND column_name='total_recharge') THEN
    ALTER TABLE agx_user ADD COLUMN total_recharge DECIMAL(20,8) NOT NULL DEFAULT 0;
    COMMENT ON COLUMN agx_user.total_recharge IS '累计充值金额（USDT）';
  END IF;

  -- 双向奖励已使用次数
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agx_user' AND column_name='invite_bonus_count') THEN
    ALTER TABLE agx_user ADD COLUMN invite_bonus_count INT NOT NULL DEFAULT 0;
    COMMENT ON COLUMN agx_user.invite_bonus_count IS '双向奖励已使用次数';
  END IF;

  -- 双向奖励累计获得
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agx_user' AND column_name='invite_bonus_total') THEN
    ALTER TABLE agx_user ADD COLUMN invite_bonus_total DECIMAL(20,8) NOT NULL DEFAULT 0;
    COMMENT ON COLUMN agx_user.invite_bonus_total IS '双向奖励累计获得（AGX币）';
  END IF;
END $$;

-- ============================================================
-- 7. 返佣记录表增加产品维度字段
-- ============================================================
DO $$
BEGIN
  -- 产品ID
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agx_commission' AND column_name='product_id') THEN
    ALTER TABLE agx_commission ADD COLUMN product_id BIGINT;
    COMMENT ON COLUMN agx_commission.product_id IS '产品ID';
  END IF;

  -- 返佣时的有效建仓人数
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agx_commission' AND column_name='valid_invites') THEN
    ALTER TABLE agx_commission ADD COLUMN valid_invites INT;
    COMMENT ON COLUMN agx_commission.valid_invites IS '返佣时该产品有效建仓人数';
  END IF;

  -- 档位等级
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agx_commission' AND column_name='tier_level') THEN
    ALTER TABLE agx_commission ADD COLUMN tier_level INT;
    COMMENT ON COLUMN agx_commission.tier_level IS '返佣时的档位等级';
  END IF;
END $$;

-- 创建产品ID索引
CREATE INDEX IF NOT EXISTS idx_commission_product ON agx_commission(product_id);

-- ============================================================
-- 完成
-- ============================================================
SELECT 'Migration 009_incentive_system completed successfully!' as result;
