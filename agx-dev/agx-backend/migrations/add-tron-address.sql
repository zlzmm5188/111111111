-- 添加用户 TRON 充值地址字段
ALTER TABLE agx_user ADD COLUMN tron_address VARCHAR(50);
CREATE INDEX idx_tron_address ON agx_user(tron_address);

-- 添加注释
COMMENT ON COLUMN agx_user.tron_address IS '用户TRON充值地址（TRC20）';
