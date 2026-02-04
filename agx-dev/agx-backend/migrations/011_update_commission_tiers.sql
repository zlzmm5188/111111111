-- AGX 返佣阶梯更新（5档位）
-- 创建时间: 2026-01-25
-- 说明: 将9档位返佣规则更新为5档位

-- 清空现有返佣阶梯配置
DELETE FROM agx_commission_tier;

-- 插入新的5档位配置
INSERT INTO agx_commission_tier (tier_level, min_invites, commission_rate, is_enabled, description) VALUES
(1, 1, 0.03, 1, '1-3人建仓 - 3%'),
(2, 4, 0.08, 1, '4-9人建仓 - 8%'),
(3, 10, 0.12, 1, '10-15人建仓 - 12%'),
(4, 16, 0.18, 1, '16-25人建仓 - 18%'),
(5, 26, 0.30, 1, '26人以上 - 30%');

-- 更新说明
COMMENT ON TABLE agx_commission_tier IS '返佣阶梯配置表（5档位）';

SELECT '返佣阶梯已更新为5档位规则' as result;
