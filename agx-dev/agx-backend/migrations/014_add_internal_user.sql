-- ============================================================
-- 添加内部用户标记字段
-- 内部用户的充值/提现不计入总账统计
-- 内部用户自动通过KYC认证
-- ============================================================

-- 添加 is_internal 字段到用户表
ALTER TABLE agx_user ADD COLUMN IF NOT EXISTS is_internal SMALLINT NOT NULL DEFAULT 0;

-- 添加注释
COMMENT ON COLUMN agx_user.is_internal IS '是否内部用户: 0否 1是，内部用户充提不计入总账';

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_internal ON agx_user(is_internal);
