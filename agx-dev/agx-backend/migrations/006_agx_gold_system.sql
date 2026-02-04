-- AGX核心系统数据库迁移
-- 核心理念: AGX是金票(工具), 黄金账户是最终结果(oz记账)

-- ==============================================
-- 1. 扩展黄金账户表 - 添加盎司字段
-- ==============================================
ALTER TABLE agx_gold_account 
ADD COLUMN IF NOT EXISTS oz_balance DECIMAL(20,6) DEFAULT 0.000000 COMMENT '黄金账户余额(盎司oz)',
ADD COLUMN IF NOT EXISTS oz_frozen DECIMAL(20,6) DEFAULT 0.000000 COMMENT '冻结黄金(盎司oz)',
ADD COLUMN IF NOT EXISTS oz_total_earned DECIMAL(20,6) DEFAULT 0.000000 COMMENT '累计获得黄金(盎司oz)',
ADD COLUMN IF NOT EXISTS oz_from_holding DECIMAL(20,6) DEFAULT 0.000000 COMMENT '持币生金获得(盎司oz)',
ADD COLUMN IF NOT EXISTS oz_from_contract DECIMAL(20,6) DEFAULT 0.000000 COMMENT '秒合约获得(盎司oz)',
ADD COLUMN IF NOT EXISTS last_settlement_date DATE DEFAULT NULL COMMENT '最后结算日期';

-- ==============================================
-- 2. AGX每日最低持仓快照表
-- ==============================================
CREATE TABLE IF NOT EXISTS agx_daily_snapshot (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    snapshot_date DATE NOT NULL COMMENT '快照日期',
    min_balance DECIMAL(30,8) DEFAULT '0' COMMENT '当日AGX最低持仓',
    avg_balance DECIMAL(30,8) DEFAULT '0' COMMENT '当日AGX平均持仓',
    start_balance DECIMAL(30,8) DEFAULT '0' COMMENT '当日起始余额',
    end_balance DECIMAL(30,8) DEFAULT '0' COMMENT '当日结束余额',
    is_qualified TINYINT DEFAULT 0 COMMENT '是否达标: 0否 1是',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_date (user_id, snapshot_date),
    INDEX idx_date (snapshot_date),
    INDEX idx_qualified (is_qualified, snapshot_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AGX每日持仓快照';

-- ==============================================
-- 3. 黄金结算记录表 (所有黄金进出记录)
-- ==============================================
CREATE TABLE IF NOT EXISTS agx_gold_settlement (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    settlement_no VARCHAR(32) UNIQUE NOT NULL COMMENT '结算单号',
    source_type VARCHAR(20) NOT NULL COMMENT '来源类型: holding=持币生金, contract=秒合约, trade=交易',
    source_id BIGINT UNSIGNED DEFAULT NULL COMMENT '来源订单ID',
    oz_amount DECIMAL(20,6) NOT NULL COMMENT '结算黄金数量(oz)',
    oz_before DECIMAL(20,6) NOT NULL COMMENT '结算前余额(oz)',
    oz_after DECIMAL(20,6) NOT NULL COMMENT '结算后余额(oz)',
    agx_amount DECIMAL(30,8) DEFAULT NULL COMMENT '关联AGX数量',
    gold_price DECIMAL(20,2) DEFAULT NULL COMMENT '当时金价(USD/oz)',
    usd_value DECIMAL(20,2) DEFAULT NULL COMMENT 'USD价值',
    remark VARCHAR(255) DEFAULT NULL COMMENT '备注',
    settlement_date DATE NOT NULL COMMENT '结算日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_source (source_type, source_id),
    INDEX idx_date (settlement_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='黄金结算记录';

-- ==============================================
-- 4. 持币生金配置表
-- ==============================================
CREATE TABLE IF NOT EXISTS agx_holding_config (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    level_name VARCHAR(50) NOT NULL COMMENT '等级名称',
    min_agx DECIMAL(30,8) NOT NULL COMMENT '最低AGX持仓',
    max_agx DECIMAL(30,8) DEFAULT NULL COMMENT '最高AGX持仓(NULL=无上限)',
    daily_oz_rate DECIMAL(10,8) NOT NULL COMMENT '每日oz生成率(每AGX)',
    description VARCHAR(255) DEFAULT NULL COMMENT '等级说明',
    status TINYINT DEFAULT 1 COMMENT '状态: 0禁用 1启用',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='持币生金配置';

-- 插入默认持币生金配置
INSERT INTO agx_holding_config (level_name, min_agx, max_agx, daily_oz_rate, description, sort_order) VALUES
('入门持仓', '100', '999.99999999', '0.00000010', '持有100-999 AGX，每日生成微量黄金', 1),
('基础持仓', '1000', '9999.99999999', '0.00000015', '持有1000-9999 AGX，每日生成基础黄金', 2),
('进阶持仓', '10000', '49999.99999999', '0.00000020', '持有10000-49999 AGX，每日生成进阶黄金', 3),
('高级持仓', '50000', '99999.99999999', '0.00000025', '持有50000-99999 AGX，每日生成高级黄金', 4),
('尊享持仓', '100000', NULL, '0.00000030', '持有100000+ AGX，每日生成尊享黄金', 5)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ==============================================
-- 5. 扩展秒合约订单表 - 添加黄金结算字段
-- ==============================================
ALTER TABLE agx_contract_order
ADD COLUMN IF NOT EXISTS gold_settlement_id BIGINT UNSIGNED DEFAULT NULL COMMENT '黄金结算记录ID',
ADD COLUMN IF NOT EXISTS oz_earned DECIMAL(20,6) DEFAULT 0.000000 COMMENT '获得黄金(oz)',
ADD COLUMN IF NOT EXISTS settlement_status TINYINT DEFAULT 0 COMMENT '黄金结算状态: 0未结算 1已结算';

-- ==============================================
-- 6. 秒合约配置表增强
-- ==============================================
ALTER TABLE agx_contract_config
ADD COLUMN IF NOT EXISTS oz_profit_rate DECIMAL(10,6) DEFAULT 0.000010 COMMENT '盈利时oz转化率(每AGX)',
ADD COLUMN IF NOT EXISTS use_agx TINYINT DEFAULT 1 COMMENT '是否使用AGX: 0否 1是';

-- 更新现有合约配置
UPDATE agx_contract_config SET use_agx = 1, oz_profit_rate = 0.000010 WHERE use_agx IS NULL OR use_agx = 0;

-- ==============================================
-- 7. 用户等级权益表
-- ==============================================
CREATE TABLE IF NOT EXISTS agx_user_level (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE COMMENT '用户ID',
    current_level INT DEFAULT 1 COMMENT '当前等级',
    level_name VARCHAR(50) DEFAULT '普通会员' COMMENT '等级名称',
    total_agx_held DECIMAL(30,8) DEFAULT '0' COMMENT '累计持有AGX',
    total_oz_earned DECIMAL(20,6) DEFAULT '0' COMMENT '累计获得oz',
    holding_days INT DEFAULT 0 COMMENT '持币天数',
    is_holding_active TINYINT DEFAULT 0 COMMENT '持币生金状态: 0未达标 1进行中',
    last_holding_date DATE DEFAULT NULL COMMENT '最后持币生金日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_level (current_level),
    INDEX idx_active (is_holding_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户等级权益';

-- ==============================================
-- 8. 系统配置更新
-- ==============================================
INSERT INTO agx_config (`key`, `value`, `name`, `group`, remark) VALUES
('agx_holding_min', '100', 'AGX持币生金最低持仓', 'gold', '持币生金所需最低AGX数量'),
('oz_to_usd_rate', '2650', '黄金价格(USD/oz)', 'gold', '1盎司黄金对应USD价格'),
('contract_oz_enabled', '1', '秒合约黄金结算', 'contract', '秒合约盈利是否结算黄金'),
('daily_settlement_time', '00:00:00', '每日结算时间', 'system', '每日结算执行时间')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ==============================================
-- 创建索引优化查询
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_gold_account_oz ON agx_gold_account(oz_balance);
CREATE INDEX IF NOT EXISTS idx_settlement_user_date ON agx_gold_settlement(user_id, settlement_date);
