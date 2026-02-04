-- 会员等级系统迁移脚本
-- 执行时间: 2026-01-25

-- 1. 创建会员等级配置表
CREATE TABLE IF NOT EXISTS agx_member_level (
  id SERIAL PRIMARY KEY,
  level INT NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  name_en VARCHAR(50) NOT NULL,
  icon VARCHAR(10),
  color VARCHAR(20),
  min_recharge DECIMAL(20, 2) DEFAULT 0,
  rebate_rate DECIMAL(5, 4) DEFAULT 0,
  fee_discount DECIMAL(5, 4) DEFAULT 1,
  benefits TEXT,
  is_enabled SMALLINT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 添加用户累计充值字段
ALTER TABLE agx_user ADD COLUMN IF NOT EXISTS total_recharge DECIMAL(20, 2) DEFAULT 0;

-- 3. 插入默认等级配置
INSERT INTO agx_member_level (level, name, name_en, icon, color, min_recharge, rebate_rate, fee_discount, benefits, is_enabled, sort_order)
VALUES 
  (1, '普通会员', 'Basic', '🥉', '#848E9C', 0, 0, 1, '基础交易权限', 1, 1),
  (2, '银牌会员', 'Silver', '🥈', '#C0C0C0', 100, 0.01, 0.95, '1%购买返利，手续费95折', 1, 2),
  (3, '金牌会员', 'Gold', '🥇', '#D4AF37', 500, 0.02, 0.90, '2%购买返利，手续费9折', 1, 3),
  (4, '钻石会员', 'Diamond', '💎', '#00D1FF', 2000, 0.03, 0.85, '3%购买返利，手续费85折', 1, 4),
  (5, '黑金会员', 'Platinum', '👑', '#C9A962', 10000, 0.05, 0.80, '5%购买返利，手续费8折，专属客服', 1, 5)
ON CONFLICT (level) DO NOTHING;

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_member_level_level ON agx_member_level(level);
CREATE INDEX IF NOT EXISTS idx_user_total_recharge ON agx_user(total_recharge);

-- 5. 根据现有充值记录计算用户累计充值金额
UPDATE agx_user u SET total_recharge = COALESCE(
  (SELECT SUM(amount) FROM agx_recharge r WHERE r.user_id = u.id AND r.status = 1),
  0
);

-- 6. 根据累计充值更新用户等级
UPDATE agx_user SET level = 
  CASE 
    WHEN total_recharge >= 10000 THEN 5
    WHEN total_recharge >= 2000 THEN 4
    WHEN total_recharge >= 500 THEN 3
    WHEN total_recharge >= 100 THEN 2
    ELSE 1
  END;

SELECT '迁移完成: 会员等级系统已配置' as result;
