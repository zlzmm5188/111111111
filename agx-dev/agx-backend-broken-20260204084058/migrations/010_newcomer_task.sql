-- AGX 新手任务系统
-- 创建时间: 2026-01-23

-- 1. 新手任务配置表
CREATE TABLE IF NOT EXISTS agx_newcomer_task (
    id SERIAL PRIMARY KEY,
    task_key VARCHAR(32) UNIQUE NOT NULL,
    step INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    name_en VARCHAR(50),
    description VARCHAR(200),
    description_en VARCHAR(200),
    agx_reward DECIMAL(20,8) NOT NULL DEFAULT 0,
    usdt_reward DECIMAL(20,8) NOT NULL DEFAULT 0,
    icon VARCHAR(50),
    jump_url VARCHAR(100),
    is_enabled SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. 用户任务完成记录表
CREATE TABLE IF NOT EXISTS agx_user_task (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    task_key VARCHAR(32) NOT NULL,
    status SMALLINT NOT NULL DEFAULT 0,
    completed_at TIMESTAMP,
    claimed_at TIMESTAMP,
    agx_reward DECIMAL(20,8) DEFAULT 0,
    usdt_reward DECIMAL(20,8) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_task UNIQUE(user_id, task_key)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_task_user_id ON agx_user_task(user_id);
CREATE INDEX IF NOT EXISTS idx_user_task_status ON agx_user_task(status);

-- 插入默认任务配置
INSERT INTO agx_newcomer_task (task_key, step, name, name_en, description, description_en, agx_reward, usdt_reward, icon, jump_url, is_enabled)
VALUES 
    ('kyc', 1, 'KYC认证', 'KYC Verification', '完成实名认证', 'Complete identity verification', 3.00000000, 5.00000000, 'verified', '/kyc', 1),
    ('bindAddress', 2, '绑定U地址', 'Bind USDT Address', '绑定USDT提现地址', 'Bind USDT withdrawal address', 2.00000000, 4.00000000, 'wallet', '/settings', 1),
    ('readWhitepaper', 3, '了解平台机制', 'Learn Platform', '阅读平台白皮书和AGX白皮书', 'Read platform and AGX whitepaper', 2.00000000, 4.00000000, 'book', '/whitepaper', 1),
    ('shareInvite', 4, '分享推广', 'Share & Promote', '分享邀请链接或海报', 'Share invitation link or poster', 3.00000000, 5.00000000, 'share', '/invite', 1)
ON CONFLICT (task_key) DO NOTHING;

COMMENT ON TABLE agx_newcomer_task IS '新手任务配置表';
COMMENT ON COLUMN agx_newcomer_task.task_key IS '任务标识: kyc, bindAddress, readWhitepaper, shareInvite';
COMMENT ON COLUMN agx_newcomer_task.step IS '步骤序号';
COMMENT ON COLUMN agx_newcomer_task.status IS '状态: 0待完成 1已完成 2已领取';

COMMENT ON TABLE agx_user_task IS '用户任务完成记录表';
COMMENT ON COLUMN agx_user_task.status IS '状态: 0待完成 1已完成待领取 2已领取';
