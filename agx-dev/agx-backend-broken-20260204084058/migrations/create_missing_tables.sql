-- AGX 缺失表创建脚本
-- 执行方式: psql -U agx -d agx -f migrations/create_missing_tables.sql

-- ================================================
-- 1. agx_exchange_record - 兑换记录表
-- ================================================
CREATE TABLE IF NOT EXISTS public.agx_exchange_record (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    exchange_type VARCHAR(20) NOT NULL,
    from_coin_id BIGINT NOT NULL,
    from_symbol VARCHAR(20) NOT NULL,
    from_amount DECIMAL(30, 8) NOT NULL,
    from_balance_before DECIMAL(30, 8) NOT NULL,
    from_balance_after DECIMAL(30, 8) NOT NULL,
    to_coin_id BIGINT NOT NULL,
    to_symbol VARCHAR(20) NOT NULL,
    to_amount DECIMAL(30, 8) NOT NULL,
    to_balance_before DECIMAL(30, 8) NOT NULL,
    to_balance_after DECIMAL(30, 8) NOT NULL,
    exchange_rate DECIMAL(20, 8) NOT NULL,
    fee_rate DECIMAL(20, 8) NOT NULL,
    fee_amount DECIMAL(30, 8) NOT NULL,
    usd_value DECIMAL(20, 8),
    snapshot JSONB,
    status SMALLINT DEFAULT 0,
    fail_reason TEXT,
    tx_hash VARCHAR(100),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exchange_record_user_id ON public.agx_exchange_record(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_record_exchange_type ON public.agx_exchange_record(exchange_type);
CREATE INDEX IF NOT EXISTS idx_exchange_record_status ON public.agx_exchange_record(status);
CREATE INDEX IF NOT EXISTS idx_exchange_record_created_at ON public.agx_exchange_record(created_at);

COMMENT ON TABLE public.agx_exchange_record IS '用户兑换记录表';

-- ================================================
-- 2. agx_holding_distribution - 持币生金发放记录表
-- ================================================
CREATE TABLE IF NOT EXISTS public.agx_holding_distribution (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    distribution_date DATE NOT NULL,
    holding_agx DECIMAL(30, 8) NOT NULL,
    holding_oz DECIMAL(10, 6) NOT NULL,
    holding_level VARCHAR(50) NOT NULL,
    distributed_oz DECIMAL(20, 6) NOT NULL,
    distributed_gram DECIMAL(20, 6) NOT NULL,
    distribution_rate DECIMAL(10, 8) NOT NULL,
    agx_price DECIMAL(20, 8) NOT NULL,
    gold_price_oz DECIMAL(20, 8) NOT NULL,
    estimated_value DECIMAL(20, 8) NOT NULL,
    calculation_formula TEXT,
    batch_no VARCHAR(100),
    status SMALLINT DEFAULT 0,
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    issued_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_holding_distribution_user_id ON public.agx_holding_distribution(user_id);
CREATE INDEX IF NOT EXISTS idx_holding_distribution_date ON public.agx_holding_distribution(distribution_date);
CREATE INDEX IF NOT EXISTS idx_holding_distribution_status ON public.agx_holding_distribution(status);

COMMENT ON TABLE public.agx_holding_distribution IS '持币生金自动发放记录表';

-- ================================================
-- 3. agx_system_menu - 系统菜单表
-- ================================================
CREATE TABLE IF NOT EXISTS public.agx_system_menu (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT DEFAULT 0,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50),
    icon VARCHAR(100),
    route VARCHAR(255),
    component VARCHAR(255),
    permission VARCHAR(255),
    type SMALLINT DEFAULT 1,
    is_show SMALLINT DEFAULT 1,
    is_cache SMALLINT DEFAULT 0,
    sort INT DEFAULT 0,
    status SMALLINT DEFAULT 1,
    remark VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_system_menu_parent_id ON public.agx_system_menu(parent_id);

COMMENT ON TABLE public.agx_system_menu IS '系统菜单表';

-- ================================================
-- 4. agx_system_config_group - 配置分组表
-- ================================================
CREATE TABLE IF NOT EXISTS public.agx_system_config_group (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    sort INT DEFAULT 0,
    remark VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_config_group_code ON public.agx_system_config_group(code);

COMMENT ON TABLE public.agx_system_config_group IS '系统配置分组表';

-- ================================================
-- 5. agx_system_config - 系统配置表
-- ================================================
CREATE TABLE IF NOT EXISTS public.agx_system_config (
    id BIGSERIAL PRIMARY KEY,
    group_code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    input_type VARCHAR(50) DEFAULT 'input',
    options TEXT,
    sort INT DEFAULT 0,
    remark VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_system_config_group_code ON public.agx_system_config(group_code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_system_config_key ON public.agx_system_config(key);

COMMENT ON TABLE public.agx_system_config IS '系统配置表';

-- ================================================
-- 6. agx_system_dict_type - 字典类型表
-- ================================================
CREATE TABLE IF NOT EXISTS public.agx_system_dict_type (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    status SMALLINT DEFAULT 1,
    remark VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_dict_type_code ON public.agx_system_dict_type(code);

COMMENT ON TABLE public.agx_system_dict_type IS '字典类型表';

-- ================================================
-- 7. agx_system_dict_data - 字典数据表
-- ================================================
CREATE TABLE IF NOT EXISTS public.agx_system_dict_data (
    id BIGSERIAL PRIMARY KEY,
    type_code VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    value VARCHAR(100) NOT NULL,
    sort INT DEFAULT 0,
    status SMALLINT DEFAULT 1,
    remark VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dict_data_type_code ON public.agx_system_dict_data(type_code);

COMMENT ON TABLE public.agx_system_dict_data IS '字典数据表';

-- ================================================
-- 8. agx_admin_role - 管理员角色表
-- ================================================
CREATE TABLE IF NOT EXISTS public.agx_admin_role (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(50),
    menu_ids TEXT,
    data_scope TEXT,
    sort INT DEFAULT 0,
    status SMALLINT DEFAULT 1,
    remark VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_role_name ON public.agx_admin_role(name);

COMMENT ON TABLE public.agx_admin_role IS '管理员角色表';

-- ================================================
-- 执行完毕提示
-- ================================================
DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'AGX 缺失表创建完成！';
    RAISE NOTICE '已创建以下8个表:';
    RAISE NOTICE '  1. agx_exchange_record';
    RAISE NOTICE '  2. agx_holding_distribution';
    RAISE NOTICE '  3. agx_system_menu';
    RAISE NOTICE '  4. agx_system_config_group';
    RAISE NOTICE '  5. agx_system_config';
    RAISE NOTICE '  6. agx_system_dict_type';
    RAISE NOTICE '  7. agx_system_dict_data';
    RAISE NOTICE '  8. agx_admin_role';
    RAISE NOTICE '================================================';
END $$;
