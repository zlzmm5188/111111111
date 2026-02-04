-- AGX 数据库清理脚本
-- 用于清理与代码不匹配的多余表
-- 
-- 注意: 执行前请确认这些表确实不再使用！
-- 执行方式: psql -U agx -d agx -f migrations/cleanup_unused_tables.sql

-- ================================================
-- 以下表在代码中没有对应实体，可能是历史遗留
-- 建议: 先备份再删除
-- ================================================

-- 1. agx_deposit - 可能与 agx_recharge 重复
-- DROP TABLE IF EXISTS public.agx_deposit;

-- 2. agx_wallet_log - 可能与 agx_asset_log 重复  
-- DROP TABLE IF EXISTS public.agx_wallet_log;

-- 3. agx_system_daily_stats - 系统日统计（无实体）
-- DROP TABLE IF EXISTS public.agx_system_daily_stats;

-- 4. pool_commission_log - 矿池返佣日志（无实体）
-- DROP TABLE IF EXISTS public.pool_commission_log;

-- 5. pool_repurchase_log - 复购日志（无实体）
-- DROP TABLE IF EXISTS public.pool_repurchase_log;

-- 6. user_exp_log - 用户经验日志（无实体）
-- DROP TABLE IF EXISTS public.user_exp_log;

-- ================================================
-- 如果确认要删除，取消上面的注释并执行
-- 或者执行以下命令批量删除:
-- ================================================

-- 批量删除（危险操作，请确认后再执行）
/*
BEGIN;

-- 备份表名到临时表（可选）
CREATE TABLE IF NOT EXISTS _cleanup_backup_info (
    table_name VARCHAR(100),
    row_count BIGINT,
    cleaned_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO _cleanup_backup_info (table_name, row_count)
SELECT 'agx_deposit', COUNT(*) FROM agx_deposit WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agx_deposit');

-- 执行删除
DROP TABLE IF EXISTS public.agx_deposit CASCADE;
DROP TABLE IF EXISTS public.agx_wallet_log CASCADE;
DROP TABLE IF EXISTS public.agx_system_daily_stats CASCADE;
DROP TABLE IF EXISTS public.pool_commission_log CASCADE;
DROP TABLE IF EXISTS public.pool_repurchase_log CASCADE;
DROP TABLE IF EXISTS public.user_exp_log CASCADE;

COMMIT;
*/

-- ================================================
-- 查看当前多余表的数据量（安全查询）
-- ================================================
DO $$
DECLARE
    tbl TEXT;
    cnt BIGINT;
BEGIN
    RAISE NOTICE '=== 多余表数据量统计 ===';
    
    FOR tbl IN SELECT unnest(ARRAY['agx_deposit', 'agx_wallet_log', 'agx_system_daily_stats', 'pool_commission_log', 'pool_repurchase_log', 'user_exp_log'])
    LOOP
        BEGIN
            EXECUTE format('SELECT COUNT(*) FROM %I', tbl) INTO cnt;
            RAISE NOTICE '% : % 条记录', tbl, cnt;
        EXCEPTION WHEN undefined_table THEN
            RAISE NOTICE '% : 表不存在', tbl;
        END;
    END LOOP;
    
    RAISE NOTICE '========================';
END $$;
