-- ============================================================
-- 矿池币种增强迁移 - 支持投入币种和收益币种分离
-- 业务需求：用 AGX 购买矿池产品，收益以 USDT 发放
-- 执行: PGPASSWORD=AGX2025Pass psql -h 127.0.0.1 -U agx -d agx -f migrations/007_pool_currency_enhancement.sql
-- ============================================================

-- 1. 为 agx_pool_product 表增加缺失的字段
ALTER TABLE agx_pool_product
ADD COLUMN IF NOT EXISTS pay_currencies VARCHAR(50) DEFAULT 'USDT';

ALTER TABLE agx_pool_product
ADD COLUMN IF NOT EXISTS income_coin_id BIGINT;

-- 2. 为 agx_pool_product 表增加外键约束
ALTER TABLE agx_pool_product
ADD CONSTRAINT fk_pool_income_coin
FOREIGN KEY (income_coin_id) REFERENCES agx_coin(id)
ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3. 为 agx_pool_product 表增加注释
COMMENT ON COLUMN agx_pool_product.pay_currencies IS '支付币种选项: USDT,CNY 等，用于前端显示';

COMMENT ON COLUMN agx_pool_product.income_coin_id IS '收益币种ID，用于发放收益（可能与投入币种不同）';

-- 4. 为 agx_pool_income 表增加币种字段
ALTER TABLE agx_pool_income
ADD COLUMN IF NOT EXISTS coin_id BIGINT;

ALTER TABLE agx_pool_income
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10,6);

-- 5. 为 agx_pool_income 表增加外键约束
ALTER TABLE agx_pool_income
ADD CONSTRAINT fk_income_coin
FOREIGN KEY (coin_id) REFERENCES agx_coin(id)
ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6. 为 agx_pool_income 表增加注释
COMMENT ON COLUMN agx_pool_income.coin_id IS '收益币种ID，明确每笔收益的币种';

COMMENT ON COLUMN agx_pool_income.daily_rate IS '该笔收益使用的日收益率';

-- 7. 为新字段创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_pool_income_coin ON agx_pool_income(coin_id);

CREATE INDEX IF NOT EXISTS idx_pool_product_income_coin ON agx_pool_product(income_coin_id);

-- ============================================================
-- 数据迁移：更新现有数据
-- ============================================================

-- 8. 更新现有矿池产品的收益币种为 USDT（假设 USDT 的 coin_id 是 2）
-- 注意：执行前需要确认实际的 USDT coin_id
UPDATE agx_pool_product
SET income_coin_id = 2
WHERE income_coin_id IS NULL;

-- 9. 为现有收益记录补充币种信息
UPDATE agx_pool_income pi
SET coin_id = 2,
    daily_rate = pp.daily_rate
FROM agx_pool_product pp
WHERE pi.product_id = pp.id
  AND pi.coin_id IS NULL;

-- 10. 更新现有产品的 pay_currencies 字段
UPDATE agx_pool_product
SET pay_currencies = 'USDT'
WHERE pay_currencies IS NULL;

-- ============================================================
-- 数据验证查询（执行后可取消注释查看结果）
-- ============================================================

-- 查看产品配置
-- SELECT p.id, p.name, p.coin_id as input_coin, p.income_coin_id, p.pay_currencies, p.daily_rate
-- FROM agx_pool_product p;

-- 查看收益记录
-- SELECT i.id, i.user_id, i.holding_id, i.amount, i.coin_id, i.daily_rate, i.income_date
-- FROM agx_pool_income i
-- LIMIT 10;
