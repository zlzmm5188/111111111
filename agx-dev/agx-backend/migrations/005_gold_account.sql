-- 黄金账户与持仓相关表
-- 执行: PGPASSWORD=AGX2025Pass psql -h 127.0.0.1 -U agx -d agx -f migrations/005_gold_account.sql

-- 黄金账户表
CREATE TABLE IF NOT EXISTS agx_gold_account (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    gold_balance DECIMAL(30,8) DEFAULT 0 NOT NULL,
    gold_frozen DECIMAL(30,8) DEFAULT 0 NOT NULL,
    usdt_balance DECIMAL(30,8) DEFAULT 0 NOT NULL,
    usdt_frozen DECIMAL(30,8) DEFAULT 0 NOT NULL,
    total_deposit DECIMAL(30,8) DEFAULT 0 NOT NULL,
    total_withdraw DECIMAL(30,8) DEFAULT 0 NOT NULL,
    total_income DECIMAL(30,8) DEFAULT 0 NOT NULL,
    yesterday_income DECIMAL(30,8) DEFAULT 0 NOT NULL,
    holding_count INT DEFAULT 0 NOT NULL,
    holding_amount DECIMAL(30,8) DEFAULT 0 NOT NULL,
    status SMALLINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gold_account_user ON agx_gold_account(user_id);

COMMENT ON TABLE agx_gold_account IS '黄金账户';
COMMENT ON COLUMN agx_gold_account.gold_balance IS '黄金余额（克）';
COMMENT ON COLUMN agx_gold_account.gold_frozen IS '冻结黄金（克）';
COMMENT ON COLUMN agx_gold_account.usdt_balance IS 'USDT余额';
COMMENT ON COLUMN agx_gold_account.usdt_frozen IS '冻结USDT';
COMMENT ON COLUMN agx_gold_account.total_deposit IS '累计存入(USDT)';
COMMENT ON COLUMN agx_gold_account.total_withdraw IS '累计取出(USDT)';
COMMENT ON COLUMN agx_gold_account.total_income IS '累计收益(USDT)';
COMMENT ON COLUMN agx_gold_account.yesterday_income IS '昨日收益(USDT)';
COMMENT ON COLUMN agx_gold_account.holding_count IS '当前持仓产品数';
COMMENT ON COLUMN agx_gold_account.holding_amount IS '当前持仓金额(USDT)';
COMMENT ON COLUMN agx_gold_account.status IS '账户状态: 0冻结 1正常';

-- 黄金持仓记录表
CREATE TABLE IF NOT EXISTS agx_gold_holding (
    id BIGSERIAL PRIMARY KEY,
    order_no VARCHAR(32) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_type VARCHAR(20) NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    amount DECIMAL(30,8) NOT NULL,
    apy DECIMAL(10,4) NOT NULL,
    period_days INT DEFAULT 0 NOT NULL,
    total_income DECIMAL(30,8) DEFAULT 0 NOT NULL,
    yesterday_income DECIMAL(30,8) DEFAULT 0 NOT NULL,
    income_days INT DEFAULT 0 NOT NULL,
    start_at TIMESTAMP,
    end_at TIMESTAMP,
    redeemed_at TIMESTAMP,
    status SMALLINT DEFAULT 2 NOT NULL,
    auto_renew SMALLINT DEFAULT 0 NOT NULL,
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gold_holding_user ON agx_gold_holding(user_id);
CREATE INDEX IF NOT EXISTS idx_gold_holding_status ON agx_gold_holding(status);
CREATE INDEX IF NOT EXISTS idx_gold_holding_product ON agx_gold_holding(product_id);

COMMENT ON TABLE agx_gold_holding IS '黄金持仓记录（持币生金）';
COMMENT ON COLUMN agx_gold_holding.order_no IS '订单号';
COMMENT ON COLUMN agx_gold_holding.product_type IS '产品类型: finance=理财';
COMMENT ON COLUMN agx_gold_holding.amount IS '申购金额(USDT)';
COMMENT ON COLUMN agx_gold_holding.apy IS '年化收益率';
COMMENT ON COLUMN agx_gold_holding.period_days IS '锁定天数，0为活期';
COMMENT ON COLUMN agx_gold_holding.total_income IS '累计收益';
COMMENT ON COLUMN agx_gold_holding.yesterday_income IS '昨日收益';
COMMENT ON COLUMN agx_gold_holding.income_days IS '计息天数';
COMMENT ON COLUMN agx_gold_holding.start_at IS '开始计息时间';
COMMENT ON COLUMN agx_gold_holding.end_at IS '到期时间';
COMMENT ON COLUMN agx_gold_holding.redeemed_at IS '赎回时间';
COMMENT ON COLUMN agx_gold_holding.status IS '状态: 0已赎回 1持仓中 2待计息 3到期待赎回';
COMMENT ON COLUMN agx_gold_holding.auto_renew IS '是否自动续期: 0否 1是';

-- 黄金产品表（如不存在则创建）
CREATE TABLE IF NOT EXISTS agx_gold_product (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    product_type VARCHAR(20) NOT NULL,
    icon VARCHAR(500),
    description TEXT,
    min_amount DECIMAL(20,8) DEFAULT 0.01,
    max_amount DECIMAL(20,8) DEFAULT 10000,
    fee_rate DECIMAL(10,4) DEFAULT 0.001,
    contract_periods VARCHAR(255),
    contract_profit_rate DECIMAL(10,4) DEFAULT 0.85,
    contract_amounts VARCHAR(255),
    finance_period_days INT DEFAULT 0,
    finance_apy DECIMAL(10,4) DEFAULT 0,
    finance_min_amount DECIMAL(20,8) DEFAULT 100,
    finance_total_amount DECIMAL(20,8) DEFAULT 0,
    finance_sold_amount DECIMAL(20,8) DEFAULT 0,
    agx_price DECIMAL(20,8) DEFAULT 0.10,
    agx_total_supply DECIMAL(20,8) DEFAULT 100000000,
    agx_sold DECIMAL(20,8) DEFAULT 0,
    agx_gold_backing INT DEFAULT 100,
    agx_start_time TIMESTAMP,
    agx_end_time TIMESTAMP,
    rules TEXT,
    risk_warning TEXT,
    is_hot SMALLINT DEFAULT 0,
    is_recommend SMALLINT DEFAULT 0,
    tag VARCHAR(50),
    sort_order INT DEFAULT 0,
    status SMALLINT DEFAULT 1,
    extra TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gold_product_code ON agx_gold_product(code);
CREATE INDEX IF NOT EXISTS idx_gold_product_type ON agx_gold_product(product_type);

-- 插入默认理财产品
INSERT INTO agx_gold_product (code, name, name_en, product_type, description, finance_period_days, finance_apy, finance_min_amount, finance_total_amount, is_hot, is_recommend, tag, sort_order, status) VALUES
('GOLD_FLEX', '黄金活期宝', 'Gold Flexible', 'finance', '灵活存取，每日计息，随存随取', 0, 0.0365, 100, 10000000, 1, 1, '推荐', 1, 1),
('GOLD_7D', '黄金7天宝', 'Gold 7-Day', 'finance', '7天定期，较高收益，到期自动到账', 7, 0.0520, 500, 5000000, 0, 1, NULL, 2, 1),
('GOLD_30D', '黄金30天宝', 'Gold 30-Day', 'finance', '30天定期，高收益，稳定增值', 30, 0.0680, 1000, 8000000, 0, 0, NULL, 3, 1),
('GOLD_90D', '黄金90天宝', 'Gold 90-Day', 'finance', '90天定期，超高收益，长期稳健', 90, 0.0880, 2000, 5000000, 1, 1, '高收益', 4, 1)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    finance_apy = EXCLUDED.finance_apy,
    updated_at = CURRENT_TIMESTAMP;

SELECT '黄金账户与持仓表创建完成' as result;
