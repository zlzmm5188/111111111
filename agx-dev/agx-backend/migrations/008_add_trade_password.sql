-- ================================================
-- 迁移 008: 添加交易密码功能
-- 日期: 2026-01-22
-- ================================================

-- 为 agx_user 表添加交易密码字段
ALTER TABLE agx_user
ADD COLUMN IF NOT EXISTS trade_password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS has_trade_password SMALLINT DEFAULT 0;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_trade_password ON agx_user(has_trade_password);

-- 添加注释
COMMENT ON COLUMN agx_user.trade_password_hash IS '交易密码哈希';
COMMENT ON COLUMN agx_user.has_trade_password IS '是否设置交易密码: 0否 1是';

-- ================================================
-- 说明:
-- 1. trade_password_hash: 存储交易密码的 bcrypt 哈希值
-- 2. has_trade_password: 快速检查用户是否设置了交易密码
-- 3. 交易密码用于: 申购、赎回、转账、提现等敏感操作
-- ================================================
