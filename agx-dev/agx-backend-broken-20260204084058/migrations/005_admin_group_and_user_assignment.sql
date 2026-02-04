-- 添加管理员分组字段
ALTER TABLE "agx_admin" ADD COLUMN "admin_group" INT NULL;

-- 添加字段注释
COMMENT ON COLUMN "agx_admin"."admin_group" IS '管理员分组：0=超级管理员，1=A组，2=B组';

-- 添加用户分配管理员字段
ALTER TABLE "agx_user" ADD COLUMN "assigned_admin_id" BIGINT NULL;

-- 添加字段注释
COMMENT ON COLUMN "agx_user"."assigned_admin_id" IS '分配的管理员ID';

-- 添加索引
CREATE INDEX "idx_assigned_admin_id" ON "agx_user" ("assigned_admin_id");
