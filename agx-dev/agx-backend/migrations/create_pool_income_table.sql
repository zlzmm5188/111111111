-- 创建矿池收益记录表 (PostgreSQL)
CREATE TABLE IF NOT EXISTS agx_pool_income (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  holding_id BIGINT NOT NULL,
  amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
  daily_rate DECIMAL(10, 6) NOT NULL,
  income_date DATE NOT NULL,
  remark VARCHAR(200) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_pool_income_user_id ON agx_pool_income(user_id);
CREATE INDEX IF NOT EXISTS idx_pool_income_holding_id ON agx_pool_income(holding_id);
CREATE INDEX IF NOT EXISTS idx_pool_income_income_date ON agx_pool_income(income_date);
CREATE UNIQUE INDEX IF NOT EXISTS uk_pool_income_holding_date ON agx_pool_income(holding_id, income_date);

-- 添加外键约束
ALTER TABLE agx_pool_income 
  DROP CONSTRAINT IF EXISTS fk_pool_income_user,
  ADD CONSTRAINT fk_pool_income_user FOREIGN KEY (user_id) REFERENCES agx_user(id) ON DELETE CASCADE;

ALTER TABLE agx_pool_income 
  DROP CONSTRAINT IF EXISTS fk_pool_income_holding,
  ADD CONSTRAINT fk_pool_income_holding FOREIGN KEY (holding_id) REFERENCES agx_pool_holding(id) ON DELETE CASCADE;

-- 添加表注释
COMMENT ON TABLE agx_pool_income IS '矿池收益记录表';
COMMENT ON COLUMN agx_pool_income.amount IS '收益金额';
COMMENT ON COLUMN agx_pool_income.daily_rate IS '日收益率';
COMMENT ON COLUMN agx_pool_income.income_date IS '收益日期';
COMMENT ON COLUMN agx_pool_income.remark IS '备注';

-- 添加一些测试数据的矿池产品（如果不存在）
INSERT INTO agx_pool_product (name, coin_id, type, lock_days, daily_rate, min_amount, max_amount, total_quota, sold_amount, is_hot, sort_order, status)
SELECT 'AGX灵活矿池', 1, 'flexible', 0, 0.001, 100, NULL, NULL, 0, 0, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM agx_pool_product WHERE name = 'AGX灵活矿池');

INSERT INTO agx_pool_product (name, coin_id, type, lock_days, daily_rate, min_amount, max_amount, total_quota, sold_amount, is_hot, sort_order, status)
SELECT 'AGX 7天定期', 1, 'fixed', 7, 0.00123, 100, NULL, NULL, 0, 0, 2, 1
WHERE NOT EXISTS (SELECT 1 FROM agx_pool_product WHERE name = 'AGX 7天定期');

INSERT INTO agx_pool_product (name, coin_id, type, lock_days, daily_rate, min_amount, max_amount, total_quota, sold_amount, is_hot, sort_order, status)
SELECT 'AGX 30天定期', 1, 'fixed', 30, 0.00178, 500, NULL, NULL, 0, 1, 3, 1
WHERE NOT EXISTS (SELECT 1 FROM agx_pool_product WHERE name = 'AGX 30天定期');

INSERT INTO agx_pool_product (name, coin_id, type, lock_days, daily_rate, min_amount, max_amount, total_quota, sold_amount, is_hot, sort_order, status)
SELECT 'AGX 90天定期', 1, 'fixed', 90, 0.00233, 1000, NULL, NULL, 0, 0, 4, 1
WHERE NOT EXISTS (SELECT 1 FROM agx_pool_product WHERE name = 'AGX 90天定期');

INSERT INTO agx_pool_product (name, coin_id, type, lock_days, daily_rate, min_amount, max_amount, total_quota, sold_amount, is_hot, sort_order, status)
SELECT 'AGX 180天定期', 1, 'fixed', 180, 0.00329, 5000, NULL, NULL, 0, 0, 5, 1
WHERE NOT EXISTS (SELECT 1 FROM agx_pool_product WHERE name = 'AGX 180天定期');
