# 🔧 H5 环境变量文件说明

## 文件用途对比

| 文件名 | 用途 | 何时加载 | 是否提交Git |
|-------|------|---------|------------|
| `.env` | 基础配置 | 总是加载 | ❌ 否 |
| `.env.development` | 开发环境 | `npm run dev` | ❌ 否 |
| `.env.production` | 生产环境 | `npm run build` | ❌ 否 |
| `.env.example` | 配置模板 | 不加载（仅参考）| ✅ 是 |

---

## 📋 当前配置对比

### .env（基础配置）
```bash
VITE_API_BASE_URL=/api
VITE_WS_BASE_URL=wss://agx.bi
VITE_MAIN_DOMAIN=agx.bi
VITE_APP_ENV=production
VITE_DEBUG=false
VITE_CNY_RATE=7.25
```

**用途**: 默认配置，会被环境特定文件覆盖

---

### .env.development（开发环境）
```bash
VITE_API_BASE_URL=/api
VITE_MAIN_DOMAIN=localhost:5173
VITE_INVITE_DOMAIN=localhost:5173
```

**用途**: 
- 本地开发时使用
- API代理到本地后端 (vite.config.js配置)
- 域名指向localhost

**实际效果** (npm run dev时):
```
最终配置 = .env + .env.development
结果:
  VITE_API_BASE_URL=/api               ✅ 来自.env.development
  VITE_WS_BASE_URL=wss://agx.bi        ✅ 来自.env（未被覆盖）
  VITE_MAIN_DOMAIN=localhost:5173      ✅ 来自.env.development
  VITE_APP_ENV=production              ✅ 来自.env（未被覆盖）
  VITE_DEBUG=false                     ✅ 来自.env
```

---

### .env.production（生产环境）- ✅ 已修复

**修复前**:
```bash
VITE_API_BASE_URL=https://api.bycxe.top/api  ❌ 旧域名
VITE_MAIN_DOMAIN=bycxe.top                   ❌ 旧域名
```

**修复后**:
```bash
VITE_API_BASE_URL=/api                       ✅ 正确
VITE_WS_BASE_URL=wss://agx.bi               ✅ 新增
VITE_MAIN_DOMAIN=agx.bi                      ✅ 已更正
VITE_APP_ENV=production                      ✅ 新增
VITE_DEBUG=false                             ✅ 新增
VITE_CNY_RATE=7.25                           ✅ 新增
```

**实际效果** (npm run build时):
```
最终配置 = .env + .env.production
结果:
  VITE_API_BASE_URL=/api          ✅ 来自.env.production
  VITE_WS_BASE_URL=wss://agx.bi   ✅ 来自.env.production
  VITE_MAIN_DOMAIN=agx.bi         ✅ 来自.env.production
  VITE_APP_ENV=production         ✅ 来自.env.production
  VITE_DEBUG=false                ✅ 来自.env.production
```

---

## 🎯 Vite环境变量加载规则

### 优先级（从高到低）

```
1. .env.[mode].local        (最高优先级，不提交Git)
2. .env.[mode]              (环境特定配置)
3. .env.local               (本地覆盖，不提交Git)
4. .env                     (基础配置)
```

### 示例

**开发模式** (`npm run dev`):
```
加载顺序:
  .env                    (基础)
  .env.local             (如果存在)
  .env.development       (开发特定)
  .env.development.local (如果存在，最高优先级)
```

**生产模式** (`npm run build`):
```
加载顺序:
  .env                    (基础)
  .env.local             (如果存在)
  .env.production        (生产特定)
  .env.production.local  (如果存在，最高优先级)
```

---

## ✅ 修复后的配置结构

### 推荐的文件结构

```
h5/
├── .env                      # ❌ 建议删除（由环境特定文件替代）
├── .env.development          # ✅ 开发环境配置
├── .env.production           # ✅ 生产环境配置（已修复）
├── .env.example              # ✅ 配置模板
└── .gitignore                # ✅ 已配置（排除.env*）
```

### 当前保留的配置

为了兼容性，暂时保留 `.env`，但建议：

**开发时**:
- Vite会优先使用 `.env.development`
- `.env` 作为后备

**构建时**:
- Vite会优先使用 `.env.production`
- `.env` 作为后备

---

## 🔍 主要区别总结

| 配置项 | .env | .env.dev | .env.prod | 说明 |
|-------|------|----------|-----------|------|
| VITE_API_BASE_URL | `/api` | `/api` | `/api` | ✅ 一致 |
| VITE_WS_BASE_URL | `wss://agx.bi` | - | `wss://agx.bi` | ✅ 已修复 |
| VITE_MAIN_DOMAIN | `agx.bi` | `localhost:5173` | `agx.bi` | ✅ 已修复 |
| VITE_APP_ENV | `production` | - | `production` | ✅ |
| VITE_DEBUG | `false` | - | `false` | ✅ |
| VITE_CNY_RATE | `7.25` | - | `7.25` | ✅ |

**关键修复**: `.env.production` 的域名从 `bycxe.top` 改为 `agx.bi` ✅

---

## 💡 使用建议

### 开发环境
```bash
npm run dev
# 会自动加载 .env.development
# 域名: localhost:5173
# API: 代理到本地后端
```

### 生产构建
```bash
npm run build
# 会自动加载 .env.production
# 域名: agx.bi
# API: /api（由nginx代理）
```

### 新开发者配置
```bash
cp .env.example .env.development
# 修改为本地配置
```

---

## ✅ 是否需要简化？

### 选项1: 保持现状（推荐）✅
- 保留所有4个文件
- 各司其职，清晰明确
- 符合Vite最佳实践

### 选项2: 简化为2个文件
- 删除 `.env`
- 只保留 `.env.development` 和 `.env.production`
- 更简洁，但失去默认配置

**建议**: 保持现状，各个文件都有用途

---

## 🎯 修复总结

✅ **已修复**: `.env.production` 域名错误  
✅ **已统一**: 所有配置使用 `agx.bi` 域名  
✅ **已完善**: 生产环境配置更完整  
✅ **已验证**: 配置文件一致性  

**现在配置完全正确，可以部署了！** 🚀
