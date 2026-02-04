# 项目清理和代码整理技能

## 描述
帮助识别和清理项目中的垃圾文件、临时文件、重复代码和不规范的文件组织。

## 适用场景
- 项目目录混乱，文件组织不规范
- 存在大量临时文件、调试文件
- 需要重构代码结构
- 准备提交代码前的清理

## 执行流程

### 1. 扫描垃圾文件
检查以下类型的文件：
- 命令行输出保存成的文件（如 `ole.log*`, `ync*`, `s psql*`）
- 临时调试文件（`*.tmp`, `*.bak`, `*.old`）
- 编辑器临时文件（`.swp`, `.swo`, `*~`）
- 系统文件（`.DS_Store`, `Thumbs.db`）
- 未使用的备份文件（`*.backup`, `*_backup`）

### 2. 识别需要移动的文件
- 检查根目录的脚本文件，建议移动到 `scripts/` 目录
- 检查 SQL 文件，建议移动到 `migrations/` 或 `sql/` 目录
- 检查配置文件是否放置在正确位置

### 3. 更新 .gitignore
确保 `.gitignore` 包含以下规则：
```
# 临时文件模式
ole.log*
s psql*
t bcrypt*
ync*
e r*
*.tmp
*.bak
*.old
*_temp
*.orig
```

### 4. 检查重复和冗余
- 查找重复的依赖包（package.json vs yarn.lock）
- 识别未使用的导入
- 检查死代码

### 5. 生成清理报告
提供以下信息：
- 找到的垃圾文件数量和类型
- 建议移动的文件列表
- 建议删除的文件列表
- .gitignore 更新建议

## 最佳实践
1. **始终备份**：删除前确认文件不重要
2. **渐进式清理**：分批处理，逐步验证
3. **更新文档**：清理后更新项目文档
4. **提交 git**：每次清理后单独提交

## 安全检查
❌ **绝不删除**：
- `.env` 文件（即使在 gitignore 中）
- `node_modules/` 目录
- `dist/` 或 `build/` 目录
- 数据库文件或迁移文件
- 上传的用户文件

✅ **安全删除**：
- 确认是临时命令输出的文件
- 编辑器自动生成的临时文件
- 明确标记为临时或备份的文件

## 相关命令

### 查找垃圾文件
```bash
# 查找临时文件
find . -type f \( -name "*.tmp" -o -name "*.bak" -o -name "*~" \)

# 查找可疑命名的文件
find . -type f -name "*ole.log*" -o -name "*psql*"

# 查找大文件
find . -type f -size +10M
```

### 清理命令
```bash
# 清理 node_modules
rm -rf node_modules && npm install

# 清理构建产物
rm -rf dist build

# 清理临时文件（谨慎使用）
find . -type f -name "*.tmp" -delete
```
