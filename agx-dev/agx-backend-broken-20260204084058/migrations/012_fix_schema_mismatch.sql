-- 修复数据库表结构与实体定义不一致的问题
-- 执行: psql -h 127.0.0.1 -U agx -d agx -f migrations/012_fix_schema_mismatch.sql

-- =========================================
-- 1. 修复 agx_risk_alert 表
-- =========================================
-- 数据库当前字段: id, user_id, alert_type, severity, description, status, handled_by, handled_at, created_at
-- 实体期望字段: id, user_id, username, risk_type, level, description, status, process_note, created_at, updated_at

-- 添加缺失的字段
ALTER TABLE agx_risk_alert ADD COLUMN IF NOT EXISTS username VARCHAR(50);
ALTER TABLE agx_risk_alert ADD COLUMN IF NOT EXISTS risk_type VARCHAR(50);
ALTER TABLE agx_risk_alert ADD COLUMN IF NOT EXISTS level VARCHAR(10) DEFAULT '中';
ALTER TABLE agx_risk_alert ADD COLUMN IF NOT EXISTS process_note VARCHAR(500);
ALTER TABLE agx_risk_alert ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 迁移旧数据到新字段
UPDATE agx_risk_alert SET risk_type = alert_type WHERE risk_type IS NULL AND alert_type IS NOT NULL;
UPDATE agx_risk_alert SET level = severity WHERE level = '中' AND severity IS NOT NULL;

-- 为 username 字段填充数据（从 user 表获取）
UPDATE agx_risk_alert r 
SET username = (SELECT u.username FROM agx_user u WHERE u.id = r.user_id)
WHERE r.username IS NULL;

-- =========================================
-- 2. 验证 agx_login_log 表结构
-- =========================================
-- 数据库有: id, user_id, username, login_ip, device, location, status, created_at, login_type, device_type, device_info, updated_at
-- 确保字段存在
ALTER TABLE agx_login_log ADD COLUMN IF NOT EXISTS username VARCHAR(50);
ALTER TABLE agx_login_log ADD COLUMN IF NOT EXISTS device_type VARCHAR(50) DEFAULT 'unknown';
ALTER TABLE agx_login_log ADD COLUMN IF NOT EXISTS device_info VARCHAR(255);
ALTER TABLE agx_login_log ADD COLUMN IF NOT EXISTS login_type VARCHAR(20);

-- =========================================
-- 3. 确保 invite 相关表结构完整
-- =========================================
-- agx_invite_bonus_tier 表
CREATE TABLE IF NOT EXISTS agx_invite_bonus_tier (
    id SERIAL PRIMARY KEY,
    invite_order INT NOT NULL UNIQUE,
    invitee_bonus DECIMAL(20,8) DEFAULT 10,
    inviter_bonus DECIMAL(20,8) DEFAULT 5,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认的双向奖励配置（1-10人）
INSERT INTO agx_invite_bonus_tier (invite_order, invitee_bonus, inviter_bonus)
SELECT generate_series, 10, 5 FROM generate_series(1, 10)
ON CONFLICT (invite_order) DO NOTHING;

-- agx_invite_bonus_record 表
CREATE TABLE IF NOT EXISTS agx_invite_bonus_record (
    id BIGSERIAL PRIMARY KEY,
    inviter_id BIGINT NOT NULL,
    invitee_id BIGINT NOT NULL,
    invite_order INT NOT NULL,
    inviter_bonus DECIMAL(20,8) DEFAULT 0,
    invitee_bonus DECIMAL(20,8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- agx_commission_tier 表
CREATE TABLE IF NOT EXISTS agx_commission_tier (
    id SERIAL PRIMARY KEY,
    tier_level INT NOT NULL UNIQUE,
    min_invites INT NOT NULL DEFAULT 0,
    commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.03,
    is_enabled BOOLEAN DEFAULT true,
    description VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认的返佣阶梯配置
INSERT INTO agx_commission_tier (tier_level, min_invites, commission_rate, description) VALUES
(1, 1, 0.03, '1-3人: 3%'),
(2, 4, 0.08, '4-9人: 8%'),
(3, 10, 0.12, '10-15人: 12%'),
(4, 16, 0.18, '16-25人: 18%'),
(5, 26, 0.30, '26+人: 30%')
ON CONFLICT (tier_level) DO NOTHING;

-- =========================================
-- 4. 创建索引优化查询
-- =========================================
CREATE INDEX IF NOT EXISTS idx_risk_alert_status ON agx_risk_alert(status);
CREATE INDEX IF NOT EXISTS idx_risk_alert_created ON agx_risk_alert(created_at);
CREATE INDEX IF NOT EXISTS idx_invite_bonus_record_inviter ON agx_invite_bonus_record(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invite_bonus_record_invitee ON agx_invite_bonus_record(invitee_id);

-- 完成
SELECT 'Schema migration 012 completed' AS status;
