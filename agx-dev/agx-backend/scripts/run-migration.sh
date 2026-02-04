#!/bin/bash

# ============================================================
# AGX 数据库迁移执行脚本
# 用途：执行数据库迁移脚本
# ============================================================

set -e  # 遇到错误立即退出

# 数据库配置
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-agx}"
DB_USER="${DB_USER:-agx}"
DB_PASS="${DB_PASS:-AGX2025Pass}"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   AGX 数据库迁移工具${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# 检查参数
if [ -z "$1" ]; then
    echo -e "${YELLOW}用法: $0 <迁移文件路径>${NC}"
    echo -e "${YELLOW}示例: $0 migrations/007_pool_currency_enhancement.sql${NC}"
    echo ""
    echo -e "${YELLOW}可用的迁移文件:${NC}"
    ls -1 migrations/*.sql 2>/dev/null || echo "未找到迁移文件"
    exit 1
fi

MIGRATION_FILE="$1"

# 检查文件是否存在
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}错误: 迁移文件不存在: $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}数据库信息:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# 确认执行
read -p "确认执行迁移? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "已取消"
    exit 0
fi

echo ""
echo -e "${GREEN}开始执行迁移: $MIGRATION_FILE${NC}"
echo ""

# 执行迁移
export PGPASSWORD="$DB_PASS"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   迁移执行成功！${NC}"
    echo -e "${GREEN}========================================${NC}"
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}   迁移执行失败！${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
fi
