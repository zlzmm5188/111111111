-- 修复关键的数据库列缺失问题
-- 执行日期: 2026-01-28

-- =========================================
-- 1. 修复 agx_gold_account 表（缺失盎司字段）
-- =========================================
ALTER TABLE agx_gold_account
ADD COLUMN IF NOT EXISTS oz_balance DECIMAL(20,6) DEFAULT 0;

ALTER TABLE agx_gold_account
ADD COLUMN IF NOT EXISTS oz_frozen DECIMAL(20,6) DEFAULT 0;

ALTER TABLE agx_gold_account
ADD COLUMN IF NOT EXISTS oz_total_earned DECIMAL(20,6) DEFAULT 0;

ALTER TABLE agx_gold_account
ADD COLUMN IF NOT EXISTS oz_from_holding DECIMAL(20,6) DEFAULT 0;

ALTER TABLE agx_gold_account
ADD COLUMN IF NOT EXISTS oz_from_contract DECIMAL(20,6) DEFAULT 0;

ALTER TABLE agx_gold_account
ADD COLUMN IF NOT EXISTS last_settlement_date DATE;

-- =========================================
-- 2. 修复 agx_spot_order 表（缺失订单字段）
-- =========================================
ALTER TABLE agx_spot_order
ADD COLUMN IF NOT EXISTS order_no VARCHAR(32) UNIQUE;

-- 为现有订单生成 order_no（使用 ID 填充）
UPDATE agx_spot_order SET order_no = 'SPOT' || LPAD(id::text, 10, '0') WHERE order_no IS NULL;

ALTER TABLE agx_spot_order
ALTER COLUMN order_no SET NOT NULL;

ALTER TABLE agx_spot_order
ADD COLUMN IF NOT EXISTS executed_qty DECIMAL(20,8) DEFAULT 0;

ALTER TABLE agx_spot_order
ADD COLUMN IF NOT EXISTS avg_price DECIMAL(20,8);

ALTER TABLE agx_spot_order
ADD COLUMN IF NOT EXISTS fee DECIMAL(20,8) DEFAULT 0;

ALTER TABLE agx_spot_order
ADD COLUMN IF NOT EXISTS fee_coin VARCHAR(10);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_spot_order_order_no ON agx_spot_order(order_no);

-- =========================================
-- 3. 修复 agx_contract_order 表（可能缺失 order_no）
-- =========================================
-- 检查并添加 order_no 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agx_contract_order'
        AND column_name = 'order_no'
    ) THEN
        ALTER TABLE agx_contract_order ADD COLUMN order_no VARCHAR(32) UNIQUE;
        UPDATE agx_contract_order SET order_no = 'CT' || LPAD(id::text, 10, '0') WHERE order_no IS NULL;
        ALTER TABLE agx_contract_order ALTER COLUMN order_no SET NOT NULL;
        CREATE INDEX idx_contract_order_order_no ON agx_contract_order(order_no);
    END IF;
END $$;

-- =========================================
-- 4. 为 agx_otc_order 添加 order_no（如果缺失）
-- =========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agx_otc_order'
        AND column_name = 'order_no'
    ) THEN
        ALTER TABLE agx_otc_order ADD COLUMN order_no VARCHAR(32) UNIQUE;
        UPDATE agx_otc_order SET order_no = 'OTC' || LPAD(id::text, 10, '0') WHERE order_no IS NULL;
        ALTER TABLE agx_otc_order ALTER COLUMN order_no SET NOT NULL;
        CREATE INDEX idx_otc_order_order_no ON agx_otc_order(order_no);
    END IF;
END $$;

-- 完成
SELECT 'Critical columns migration completed successfully!' AS status;
