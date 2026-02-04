-- 升达主权会员体系 (Ascenda Sovereign Membership Program)
-- 执行时间: 2026-01-27

-- ============================================================
-- 1. 扩展会员等级表字段
-- ============================================================

-- 进阶奖励金
ALTER TABLE agx_member_level ADD COLUMN IF NOT EXISTS upgrade_bonus DECIMAL(20,2) DEFAULT 0;

-- 矿机利率加成
ALTER TABLE agx_member_level ADD COLUMN IF NOT EXISTS pool_rate_bonus DECIMAL(5,4) DEFAULT 0;

-- 免费提现周期(天), 0=无免费, 7=每周一次, 3=每3天一次, 2=每2天一次
ALTER TABLE agx_member_level ADD COLUMN IF NOT EXISTS free_withdraw_days INT DEFAULT 0;

-- 提现优先 (1=优先处理)
ALTER TABLE agx_member_level ADD COLUMN IF NOT EXISTS withdraw_priority SMALLINT DEFAULT 0;

-- 合约交易权限 (1=开启)
ALTER TABLE agx_member_level ADD COLUMN IF NOT EXISTS contract_enabled SMALLINT DEFAULT 0;

-- 新币抢先交易权限 (1=开启)
ALTER TABLE agx_member_level ADD COLUMN IF NOT EXISTS new_coin_priority SMALLINT DEFAULT 0;

-- VIP专属客服 (1=享有)
ALTER TABLE agx_member_level ADD COLUMN IF NOT EXISTS vip_support SMALLINT DEFAULT 0;

-- 工单优先级 (1=优先)
ALTER TABLE agx_member_level ADD COLUMN IF NOT EXISTS ticket_priority SMALLINT DEFAULT 0;

-- 终生提现免手续费 (1=免费)
ALTER TABLE agx_member_level ADD COLUMN IF NOT EXISTS withdraw_fee_free SMALLINT DEFAULT 0;

-- ============================================================
-- 2. 创建升级奖励发放记录表
-- ============================================================

CREATE TABLE IF NOT EXISTS agx_level_bonus_log (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  from_level INT NOT NULL DEFAULT 0,
  to_level INT NOT NULL,
  bonus_amount DECIMAL(20,2) NOT NULL,
  remark VARCHAR(200),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_level_bonus_log_user ON agx_level_bonus_log(user_id);
CREATE INDEX IF NOT EXISTS idx_level_bonus_log_created ON agx_level_bonus_log(created_at);

COMMENT ON TABLE agx_level_bonus_log IS '会员升级奖励发放记录';
COMMENT ON COLUMN agx_level_bonus_log.from_level IS '原等级';
COMMENT ON COLUMN agx_level_bonus_log.to_level IS '新等级';
COMMENT ON COLUMN agx_level_bonus_log.bonus_amount IS '奖励金额(USDT)';

-- ============================================================
-- 3. 更新等级配置为升达主权会员体系
-- ============================================================

-- 先清空旧数据
DELETE FROM agx_member_level;

-- 插入升达主权会员5级体系
INSERT INTO agx_member_level (
  level, name, name_en, icon, color, 
  min_recharge, upgrade_bonus, pool_rate_bonus,
  free_withdraw_days, withdraw_priority, contract_enabled,
  new_coin_priority, vip_support, ticket_priority, withdraw_fee_free,
  fee_discount, income_bonus, benefits, status
) VALUES 
-- 1. Access（准入会员）
(1, '准入会员', 'Access', '🛡️', '#8B9DC3', 
 200, 200, 0.0002,
 0, 0, 0,
 0, 0, 0, 0,
 1.00, 0, '进阶奖励金200U、矿机板块加利率0.02%', 1),

-- 2. Prime（优选会员）
(2, '优选会员', 'Prime', '⭐', '#4A90D9',
 600, 600, 0.0006,
 7, 0, 1,
 0, 0, 0, 0,
 0.98, 0.02, '进阶奖励金600U、合约权限、每周免费提现一次、矿机利率+0.06%', 1),

-- 3. Capital（资本合伙人）
(3, '资本合伙人', 'Capital', '💎', '#D4AF37',
 1500, 1500, 0.0010,
 3, 1, 1,
 0, 0, 0, 0,
 0.95, 0.05, '进阶奖励金1500U、每3天免费提现一次、提现优先到账、矿机利率+0.1%', 1),

-- 4. Executive（执行官合伙人）
(4, '执行官合伙人', 'Executive', '👑', '#9B59B6',
 5000, 5000, 0.0016,
 2, 1, 1,
 1, 0, 0, 0,
 0.90, 0.08, '进阶奖励金5000U、新币抢先交易、最大额度交易、每2天免费提现一次、提现优先、矿机利率+0.16%', 1),

-- 5. Sovereign（主权合伙人）
(5, '主权合伙人', 'Sovereign', '🏆', '#C9A962',
 10000, 10000, 0.0022,
 0, 1, 1,
 1, 1, 1, 1,
 0.80, 0.12, '进阶奖励金10000U、VIP专属客服、工单优先、重大异常1V1对接、终生提现免手续费、矿机利率+0.22%', 1);

-- ============================================================
-- 4. 添加用户最后免费提现时间字段
-- ============================================================

ALTER TABLE agx_user ADD COLUMN IF NOT EXISTS last_free_withdraw_at TIMESTAMP;

COMMENT ON COLUMN agx_user.last_free_withdraw_at IS '最后一次免费提现时间';

SELECT '升达主权会员体系迁移完成' as result;
