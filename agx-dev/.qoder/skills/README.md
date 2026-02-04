# 🎯 AI 编码助手技能使用指南

## 已安装的技能

### 1. 📋 项目清理技能 ([project-cleanup.md](file:///root/agx-dev/.qoder/skills/project-cleanup.md))
**适用场景：**
- 项目目录混乱，文件组织不规范
- 存在大量临时文件、调试文件
- 需要重构代码结构

**如何使用：**
```
"帮我检查项目中的垃圾文件"
"清理 backend 目录的临时文件"
"整理项目结构，把脚本移到正确位置"
```

---

### 2. 🔧 NestJS 最佳实践 ([nestjs-best-practices.md](file:///root/agx-dev/.qoder/skills/nestjs-best-practices.md))
**适用场景：**
- 开发或重构 NestJS 后端代码
- 需要优化数据库查询
- 实现事务处理
- 添加错误处理和日志

**如何使用：**
```
"帮我优化这个 service 的代码，遵循 NestJS 最佳实践"
"这个查询有 N+1 问题吗？如何优化？"
"添加全局异常过滤器"
"使用事务处理这个转账逻辑"
```

**核心要点：**
- ✅ 使用依赖注入
- ✅ DTO 验证
- ✅ 避免 N+1 查询
- ✅ 使用事务保证数据一致性
- ✅ 统一异常处理

---

### 3. 🎨 Vue 3 + Vite 最佳实践 ([vue3-vite-best-practices.md](file:///root/agx-dev/.qoder/skills/vue3-vite-best-practices.md))
**适用场景：**
- 开发管理后台（agx-admin）
- 开发 H5 移动端（h5）
- 组件设计和优化
- 状态管理

**如何使用：**
```
"帮我用 Composition API 重构这个组件"
"创建一个 composable 来管理用户状态"
"这个 H5 页面如何做移动端适配？"
"优化这个列表的渲染性能"
```

**核心要点：**
- ✅ 使用 `<script setup>` 语法
- ✅ 提取逻辑到 composables
- ✅ 使用 Pinia 管理状态
- ✅ API 请求统一封装
- ✅ 移动端适配（H5项目）

---

### 4. 🔍 代码审查 ([code-review.md](file:///root/agx-dev/.qoder/skills/code-review.md))
**适用场景：**
- 提交代码前的自查
- Code Review
- 发现潜在问题
- 提升代码质量

**如何使用：**
```
"审查这段代码，找出潜在问题"
"检查这个 API 的安全性"
"这个函数有性能问题吗？"
"生成代码审查报告"
```

**审查维度：**
- ✅ 功能正确性
- ✅ 代码质量
- ✅ 性能问题
- ✅ 安全性
- ✅ 可维护性

---

### 5. 🗄️ PostgreSQL + TypeORM 最佳实践 ([postgresql-typeorm-best-practices.md](file:///root/agx-dev/.qoder/skills/postgresql-typeorm-best-practices.md))
**适用场景：**
- 数据库实体设计
- 查询优化
- 事务处理
- 数据库迁移

**如何使用：**
```
"帮我设计钱包表的实体"
"优化这个数据库查询"
"添加事务处理这个转账逻辑"
"如何处理金额的精度问题？"
"创建数据库迁移文件"
```

**核心要点：**
- ✅ 金额使用 decimal 类型
- ✅ 添加必要的索引
- ✅ 避免 N+1 查询
- ✅ 关键操作使用事务
- ✅ 防止 SQL 注入

---

## 💡 使用技巧

### 场景 1：开发新功能
```
1. "我要开发一个用户钱包功能，帮我设计数据库表" 
   → 使用 PostgreSQL 技能

2. "创建 NestJS 的 wallet module"
   → 使用 NestJS 技能

3. "添加前端钱包页面"
   → 使用 Vue3 技能

4. "审查刚写的代码"
   → 使用代码审查技能
```

### 场景 2：优化现有代码
```
1. "检查项目中的性能问题"
   → 使用代码审查技能

2. "优化这个查询，有 N+1 问题"
   → 使用 NestJS/PostgreSQL 技能

3. "重构这个组件，使用 Composition API"
   → 使用 Vue3 技能
```

### 场景 3：清理和整理
```
1. "项目太乱了，帮我清理垃圾文件"
   → 使用项目清理技能

2. "整理代码结构，遵循最佳实践"
   → 使用对应框架的技能
```

---

## 🚀 快速命令参考

### 项目清理
```bash
# 查找垃圾文件
find . -type f \( -name "*.tmp" -o -name "*.bak" \)

# 查找大文件
find . -type f -size +10M
```

### 代码检查
```bash
# ESLint 检查
npm run lint

# TypeScript 类型检查
npm run type-check
```

### 数据库
```bash
# 生成迁移
npm run typeorm migration:generate -- -n MigrationName

# 运行迁移
npm run typeorm migration:run
```

---

## 📚 相关资源

### 官方文档
- [NestJS 官方文档](https://docs.nestjs.com)
- [Vue 3 官方文档](https://vuejs.org)
- [TypeORM 官方文档](https://typeorm.io)
- [Vite 官方文档](https://vitejs.dev)

### 最佳实践
- [Awesome NestJS](https://github.com/nestjs/awesome-nestjs)
- [Vue 3 Best Practices](https://github.com/vuejs/vue-next)
- [TypeScript Best Practices](https://github.com/typescript-cheatsheets/react)

---

## 🎓 技能更新日志

### 2026-02-04
- ✅ 创建项目清理技能
- ✅ 创建 NestJS 最佳实践技能
- ✅ 创建 Vue3 最佳实践技能
- ✅ 创建代码审查技能
- ✅ 创建 PostgreSQL + TypeORM 技能

---

## 💬 如何获得最佳帮助

### ✅ 好的提问方式
- "帮我优化这个 API，遵循 NestJS 最佳实践"
- "这段代码有什么问题？请审查"
- "如何实现事务转账？"

### ❌ 不推荐的提问方式
- "帮我写代码"（太宽泛）
- "这个怎么做？"（没有上下文）
- "为什么报错？"（没有提供错误信息）

### 提供充足的上下文
1. **说明你的目标**：想实现什么功能
2. **提供相关代码**：当前的实现或错误代码
3. **描述问题**：遇到了什么问题
4. **技术栈**：使用的框架和版本

---

## 🆘 常见问题

### Q: 如何让 AI 使用这些技能？
**A:** 只需要在对话中提到相关场景即可，AI 会自动参考对应的技能文档。

### Q: 技能文档会自动更新吗？
**A:** 目前是手动创建的，建议定期根据项目经验更新。

### Q: 可以添加自定义技能吗？
**A:** 可以！在 `.qoder/skills/` 目录创建新的 markdown 文件即可。

### Q: 技能之间如何配合使用？
**A:** 多个技能可以组合使用，比如用 PostgreSQL 技能设计表，用 NestJS 技能实现 API，用 Vue3 技能创建前端页面。

---

## 📞 下一步

现在您可以：
1. ✅ 使用这些技能帮助开发和优化代码
2. ✅ 清理项目中的混乱文件
3. ✅ 审查代码质量和安全性
4. ✅ 学习框架的最佳实践

**立即开始：** 告诉 AI 您需要什么帮助，它会自动使用相应的技能！
