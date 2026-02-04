-- ==================== AGX Backend 性能优化索引 ====================
-- 执行前请备份数据库！

-- ==================== 用户表索引 ====================
-- 用户ID查询（已有主键，但确保有索引）
-- CREATE INDEX IF NOT EXISTS idx_user_id ON "user"(id);

-- 邀请码查询（注册时频繁使用）
CREATE INDEX IF NOT EXISTS idx_user_invite_code ON "user"("inviteCode");
CREATE INDEX IF NOT EXISTS idx_user_status ON "user"("status");

-- 用户UID查询
CREATE INDEX IF NOT EXISTS idx_user_uid ON "user"("uid");

-- ==================== 邀请关系表索引 ====================
-- 查询用户的邀请人
CREATE INDEX IF NOT EXISTS idx_user_invite_user_id ON user_invite("userId");
CREATE INDEX IF NOT EXISTS idx_user_invite_inviter_id ON user_invite("inviterId");

-- 按层级查询邀请关系
CREATE INDEX IF NOT EXISTS idx_user_invite_level ON user_invite("level");

-- 复合索引：查询某个用户的所有下级（按层级）
CREATE INDEX IF NOT EXISTS idx_user_invite_user_level ON user_invite("userId", "level");
CREATE INDEX IF NOT EXISTS idx_user_invite_inviter_level ON user_invite("inviterId", "level");

-- ==================== 账户/资产表索引 ====================
-- 用户资产查询
CREATE INDEX IF NOT EXISTS idx_account_user_id ON account("userId");

-- 交易对ID查询
CREATE INDEX IF NOT EXISTS idx_account_symbol ON account("symbol");

-- 复合索引：用户 + 交易对
CREATE INDEX IF NOT EXISTS idx_account_user_symbol ON account("userId", "symbol");

-- ==================== 订单表索引 ====================
-- 用户订单查询
CREATE INDEX IF NOT EXISTS idx_order_user_id ON "order"("userId");

-- 订单状态查询
CREATE INDEX IF NOT EXISTS idx_order_status ON "order"("status");

-- 订单类型查询
CREATE INDEX IF NOT EXISTS idx_order_type ON "order"("type");

-- 复合索引：用户 + 状态 + 创建时间（分页查询）
CREATE INDEX IF NOT EXISTS idx_order_user_status_time ON "order"("userId", "status", "createdAt" DESC);

-- 交易对 + 状态
CREATE INDEX IF NOT EXISTS idx_order_symbol_status ON "order"("symbol", "status");

-- ==================== 交易历史表索引 ====================
CREATE INDEX IF NOT EXISTS idx_trade_history_user_id ON trade_history("userId");
CREATE INDEX IF NOT EXISTS idx_trade_history_symbol ON trade_history("symbol");
CREATE INDEX IF NOT EXISTS idx_trade_history_type ON trade_history("type");
CREATE INDEX IF NOT EXISTS idx_trade_history_created_at ON trade_history("createdAt" DESC);

-- 复合索引：用户 + 交易对 + 时间
CREATE INDEX IF NOT EXISTS idx_trade_history_user_symbol_time ON trade_history("userId", "symbol", "createdAt" DESC);

-- ==================== 社交/好友表索引 ====================
-- 好友关系查询
CREATE INDEX IF NOT EXISTS idx_friend_user_id ON friend("userId");
CREATE INDEX IF NOT EXISTS idx_friend_friend_id ON friend("friendId");
CREATE INDEX IF NOT EXISTS idx_friend_status ON friend("status");

-- 复合索引：双向好友查询
CREATE INDEX IF NOT EXISTS idx_friend_user_friend ON friend("userId", "friendId");

-- ==================== 消息表索引 ====================
CREATE INDEX IF NOT EXISTS idx_message_from_id ON message("fromId");
CREATE INDEX IF NOT EXISTS idx_message_to_id ON message("toId");
CREATE INDEX IF NOT EXISTS idx_message_is_read ON message("isRead");
CREATE INDEX IF NOT EXISTS idx_message_created_at ON message("createdAt" DESC);

-- 复合索引：接收消息查询
CREATE INDEX IF NOT EXISTS idx_message_to_read_time ON message("toId", "isRead", "createdAt" DESC);

-- ==================== 广场/动态表索引 ====================
CREATE INDEX IF NOT EXISTS idx_square_user_id ON square("userId");
CREATE INDEX IF NOT EXISTS idx_square_status ON square("status");
CREATE INDEX IF NOT EXISTS idx_square_created_at ON square("createdAt" DESC);

-- 复合索引：状态筛选 + 时间排序
CREATE INDEX IF NOT EXISTS idx_square_status_time ON square("status", "createdAt" DESC);

-- ==================== 评论表索引 ====================
CREATE INDEX IF NOT EXISTS idx_comment_square_id ON comment("squareId");
CREATE INDEX IF NOT EXISTS idx_comment_user_id ON comment("userId");
CREATE INDEX IF NOT EXISTS idx_comment_created_at ON comment("createdAt" DESC);

-- ==================== 任务/成就表索引 ====================
CREATE INDEX IF NOT EXISTS idx_user_task_user_id ON user_task("userId");
CREATE INDEX IF NOT EXISTS idx_user_task_task_id ON user_task("taskId");
CREATE INDEX IF NOT EXISTS idx_user_task_status ON user_task("status");

-- 复合索引：用户任务查询
CREATE INDEX IF NOT EXISTS idx_user_task_user_status ON user_task("userId", "status");

-- ==================== 合约表索引 ====================
CREATE INDEX IF NOT EXISTS idx_contract_user_id ON contract("userId");
CREATE INDEX IF NOT EXISTS idx_contract_symbol ON contract("symbol");
CREATE INDEX IF NOT EXISTS idx_contract_status ON contract("status");
CREATE INDEX IF NOT EXISTS idx_contract_type ON contract("type");

-- 复合索引：用户活跃合约
CREATE INDEX IF NOT EXISTS idx_contract_user_status ON contract("userId", "status");

-- ==================== 存款/提现表索引 ====================
CREATE INDEX IF NOT EXISTS idx_deposit_user_id ON deposit("userId");
CREATE INDEX IF NOT EXISTS idx_deposit_status ON deposit("status");
CREATE INDEX IF NOT EXISTS idx_deposit_created_at ON deposit("createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_withdraw_user_id ON withdraw("userId");
CREATE INDEX IF NOT EXISTS idx_withdraw_status ON withdraw("status");
CREATE INDEX IF NOT EXISTS idx_withdraw_created_at ON withdraw("createdAt" DESC);

-- ==================== 系统配置表索引 ====================
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config("key");

-- ==================== 日志表索引 ====================
CREATE INDEX IF NOT EXISTS idx_log_user_id ON log("userId");
CREATE INDEX IF NOT EXISTS idx_log_created_at ON log("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_log_action ON log("action");

-- ==================== 查询优化提示 ====================
-- 1. 定期执行 VACUUM ANALYZE 更新统计信息
-- 2. 监控慢查询日志
-- 3. 使用 EXPLAIN ANALYZE 分析查询计划
-- 4. 考虑对大表进行分区
