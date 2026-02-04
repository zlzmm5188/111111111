-- AGX 激励体系表创建脚本
-- 创建时间: 2026-01-24

-- 1. 双向奖励配置表 (agx_invite_bonus_tier)
CREATE TABLE IF NOT EXISTS agx_invite_bonus_tier (
    id BIGSERIAL PRIMARY KEY,
    invite_order INT UNIQUE NOT NULL,
    invitee_bonus DECIMAL(20,8) NOT NULL DEFAULT '0',
    inviter_bonus DECIMAL(20,8) NOT NULL DEFAULT '0',
    is_enabled SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. 双向奖励记录表 (agx_invite_bonus_record)
CREATE TABLE IF NOT EXISTS agx_invite_bonus_record (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    invitee_id BIGINT NOT NULL,
    invite_order INT NOT NULL,
    invitee_bonus DECIMAL(20,8) NOT NULL DEFAULT '0',
    inviter_bonus DECIMAL(20,8) NOT NULL DEFAULT '0',
    status SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. 会员等级配置表 (agx_member_level)
CREATE TABLE IF NOT EXISTS agx_member_level (
    id BIGSERIAL PRIMARY KEY,
    level INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    name_en VARCHAR(50) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    min_recharge DECIMAL(20,8) NOT NULL DEFAULT '0',
    fee_discount DECIMAL(5,4) NOT NULL DEFAULT '1.0000',
    income_bonus DECIMAL(5,4) NOT NULL DEFAULT '0.0000',
    withdraw_limit BIGINT,
    benefits TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. 返佣阶梯配置表 (agx_commission_tier)
CREATE TABLE IF NOT EXISTS agx_commission_tier (
    id BIGSERIAL PRIMARY KEY,
    tier_level INT NOT NULL,
    min_invites INT NOT NULL,
    commission_rate DECIMAL(10,8) NOT NULL DEFAULT '0.00000000',
    is_enabled SMALLINT NOT NULL DEFAULT 1,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. 用户产品佣金统计表 (agx_user_product_commission_stats)
CREATE TABLE IF NOT EXISTS agx_user_product_commission_stats (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id VARCHAR(100),
    valid_invitee_count INT NOT NULL DEFAULT 0,
    total_commission DECIMAL(20,8) NOT NULL DEFAULT '0.00000000',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_invite_bonus_record_user ON agx_invite_bonus_record(user_id);
CREATE INDEX IF NOT EXISTS idx_invite_bonus_record_invitee ON agx_invite_bonus_record(invitee_id);
CREATE INDEX IF NOT EXISTS idx_user_product_commission_stats_user ON agx_user_product_commission_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_commission_tier_level ON agx_commission_tier(tier_level);
CREATE INDEX IF NOT EXISTS idx_member_level_level ON agx_member_level(level);

-- 插入默认数据

-- 1. 双向奖励配置（10次邀请，递进式奖励）
INSERT INTO agx_invite_bonus_tier (invite_order, invitee_bonus, inviter_bonus, is_enabled) VALUES
(1, '10', '5', 1),
(2, '10', '8', 1),
(3, '10', '12', 1),
(4, '10', '18', 1),
(5, '10', '25', 1),
(6, '10', '32', 1),
(7, '10', '42', 1),
(8, '10', '55', 1),
(9, '10', '70', 1),
(10, '10', '90', 1)
ON CONFLICT (invite_order) DO UPDATE SET
  invitee_bonus = EXCLUDED.invitee_bonus,
  inviter_bonus = EXCLUDED.inviter_bonus,
  is_enabled = EXCLUDED.is_enabled,
  updated_at = CURRENT_TIMESTAMP;

-- 2. 会员等级配置（5个等级）
INSERT INTO agx_member_level (level, name, name_en, icon, color, min_recharge, fee_discount, income_bonus, withdraw_limit, benefits) VALUES
(1, '普通会员', 'Basic', '🥉', '#848E9C', '0', '1.00', '0.0000', 5000, '基础功能'),
(2, '银牌会员', 'Silver', '🥈', '#C0C0C0', '1000', '0.95', '0.0200', 10000, '手续费折扣，收益加成2%'),
(3, '金牌会员', 'Gold', '🥇', '#D4B872', '10000', '0.90', '0.0500', 50000, '手续费折扣，收益加成5%'),
(4, '钻石会员', 'Diamond', '💎', '#00D1FF', '50000', '0.85', '0.0800', 100000, '手续费折扣，收益加成8%'),
(5, '黑金会员', 'Platinum', '👑', '#1E1E1E', '200000', '0.80', '0.1200', NULL, '手续费折扣，收益加成12%')
ON CONFLICT (level) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  min_recharge = EXCLUDED.min_recharge,
  fee_discount = EXCLUDED.fee_discount,
  income_bonus = EXCLUDED.income_bonus,
  withdraw_limit = EXCLUDED.withdraw_limit,
  benefits = EXCLUDED.benefits,
  updated_at = CURRENT_TIMESTAMP;

-- 3. 返佣阶梯配置（五档位）
INSERT INTO agx_commission_tier (tier_level, min_invites, commission_rate, is_enabled, description) VALUES
(1, 0, '0.03', 1, '0-3人'),
(2, 4, '0.08', 1, '4-9人'),
(3, 10, '0.12', 1, '10-15人'),
(4, 16, '0.18', 1, '16-25人'),
(5, 26, '0.30', 1, '26人以上')
ON CONFLICT (tier_level) DO UPDATE SET
  min_invites = EXCLUDED.min_invites,
  commission_rate = EXCLUDED.commission_rate,
  is_enabled = EXCLUDED.is_enabled,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- 验证插入结果
SELECT '✅ 表创建和初始化完成' AS status;
SELECT COUNT(*) as invite_bonus_tier_count FROM agx_invite_bonus_tier;
SELECT COUNT(*) as member_level_count FROM agx_member_level;
SELECT COUNT(*) as commission_tier_count FROM agx_commission_tier;
