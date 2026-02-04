-- 后台配置模块表迁移
-- 执行时间: 2026-01-06

-- ========== 1. 行情配置表 ==========
CREATE TABLE IF NOT EXISTS agx_market_config (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    asset_type VARCHAR(20) NOT NULL DEFAULT 'crypto',
    data_source VARCHAR(50) DEFAULT 'mock',
    is_visible SMALLINT DEFAULT 1,
    sort_order INT DEFAULT 0,
    spread DECIMAL(10, 4) DEFAULT 0,
    min_qty DECIMAL(20, 8) DEFAULT 0.0001,
    max_qty DECIMAL(20, 8) DEFAULT 10000,
    price_precision SMALLINT DEFAULT 2,
    qty_precision SMALLINT DEFAULT 4,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_market_config_type ON agx_market_config(asset_type);
CREATE INDEX IF NOT EXISTS idx_market_config_visible ON agx_market_config(is_visible);

COMMENT ON TABLE agx_market_config IS '行情配置表';
COMMENT ON COLUMN agx_market_config.symbol IS '交易对符号';
COMMENT ON COLUMN agx_market_config.asset_type IS '资产类型: crypto/forex/stock/metal';
COMMENT ON COLUMN agx_market_config.data_source IS '数据源: mock/binance/okx等';
COMMENT ON COLUMN agx_market_config.spread IS '点差';

-- ========== 2. 前端菜单配置表 ==========
CREATE TABLE IF NOT EXISTS agx_app_menu (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    icon VARCHAR(100),
    path VARCHAR(200) NOT NULL,
    position VARCHAR(20) NOT NULL DEFAULT 'bottom',
    sort_order INT DEFAULT 0,
    badge_type VARCHAR(20),
    badge_value VARCHAR(50),
    visible_roles TEXT,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_app_menu_position ON agx_app_menu(position);
CREATE INDEX IF NOT EXISTS idx_app_menu_status ON agx_app_menu(status);

COMMENT ON TABLE agx_app_menu IS '前端菜单配置表';
COMMENT ON COLUMN agx_app_menu.position IS '菜单位置: bottom/grid/sidebar/quick';
COMMENT ON COLUMN agx_app_menu.badge_type IS '角标类型: dot/number/text';

-- ========== 3. 多语言文案表 ==========
CREATE TABLE IF NOT EXISTS agx_i18n_text (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL DEFAULT 'common',
    remark VARCHAR(200),
    zh_cn TEXT,
    zh_tw TEXT,
    en TEXT,
    ja TEXT,
    ko TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_i18n_text_category ON agx_i18n_text(category);
CREATE INDEX IF NOT EXISTS idx_i18n_text_key ON agx_i18n_text(key);

COMMENT ON TABLE agx_i18n_text IS '多语言文案表';
COMMENT ON COLUMN agx_i18n_text.key IS '文案Key，如 trade.buy.button';
COMMENT ON COLUMN agx_i18n_text.category IS '分类: common/trade/asset/user/tips/agreement';

-- ========== 4. Banner表（如果不存在） ==========
CREATE TABLE IF NOT EXISTS agx_banner (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500),
    link_type VARCHAR(20) DEFAULT 'none',
    position VARCHAR(20) DEFAULT 'home',
    sort_order INT DEFAULT 0,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== 5. 黑名单表（如果不存在） ==========
CREATE TABLE IF NOT EXISTS agx_blacklist (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    value VARCHAR(200) NOT NULL,
    reason VARCHAR(500),
    operator_id BIGINT,
    expire_at TIMESTAMP,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blacklist_type ON agx_blacklist(type);
CREATE INDEX IF NOT EXISTS idx_blacklist_value ON agx_blacklist(value);

-- ========== 6. OTC订单表（如果不存在） ==========
CREATE TABLE IF NOT EXISTS agx_otc_order (
    id BIGSERIAL PRIMARY KEY,
    order_no VARCHAR(32) NOT NULL UNIQUE,
    ad_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    coin VARCHAR(20) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 4) NOT NULL,
    total_amount DECIMAL(20, 4) NOT NULL,
    pay_method VARCHAR(50),
    status SMALLINT DEFAULT 0,
    pay_time TIMESTAMP,
    release_time TIMESTAMP,
    cancel_time TIMESTAMP,
    appeal_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otc_order_buyer ON agx_otc_order(buyer_id);
CREATE INDEX IF NOT EXISTS idx_otc_order_seller ON agx_otc_order(seller_id);
CREATE INDEX IF NOT EXISTS idx_otc_order_status ON agx_otc_order(status);

COMMENT ON TABLE agx_otc_order IS 'OTC交易订单表';

-- 完成
SELECT 'Migration 004_admin_config completed' as status;
