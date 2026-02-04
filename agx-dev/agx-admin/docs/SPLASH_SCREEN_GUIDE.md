# AGX 启动图 + 反爬虫检测使用指南

## ✅ 已完成的功能

### 1. 高端动态启动图
- ✅ 粒子背景动画（动态连线）
- ✅ Logo 旋转光圈
- ✅ 文字逐字显示
- ✅ 渐进式加载条
- ✅ 金色主题（AGX 品牌色）

### 2. 反爬虫检测（已使用 JShaman 混淆）
- ✅ Headless Chrome 检测
- ✅ WebDriver 检测
- ✅ 自动化工具特征检测
- ✅ 设备指纹生成（Canvas + WebGL）
- ✅ 用户行为检测（鼠标、触摸、键盘）
- ✅ 时间一致性检测

### 3. 代码混淆
- ✅ 使用 JShaman VIP 混淆
- ✅ 代码从 9.95 KB → 370.99 KB
- ✅ 完全不可读的混淆代码

---

## 📁 文件结构

```
agx-admin/
├── src/
│   ├── views/
│   │   └── splash-screen.vue              # 启动图组件
│   └── utils/
│       ├── bot-detector.js                 # 原始反爬虫检测（开发环境）
│       └── bot-detector-obfuscated.js      # 混淆后的检测（生产环境）
├── scripts/
│   └── obfuscate.cjs                       # JShaman 混淆脚本
└── docs/
    ├── JSHAMAN_OBFUSCATION_GUIDE.md        # JShaman 使用指南
    └── SPLASH_SCREEN_GUIDE.md              # 本文档
```

---

## 🚀 使用方式

### 开发环境（未混淆）

```bash
npm run dev
```

- 使用原始的 `bot-detector.js`
- 便于调试和开发
- 可以查看控制台日志

### 生产环境（已混淆）

```bash
# 方式一：完整构建（混淆 + 打包）
npm run build:prod

# 方式二：单独混淆
npm run obfuscate
```

- 使用混淆后的 `bot-detector-obfuscated.js`
- 代码完全不可读
- 具有反调试功能

---

## 🔄 更新混淆代码

当修改了 `bot-detector.js` 后，需要重新混淆：

### 方式一：使用脚本（推荐）

```bash
npm run obfuscate
```

### 方式二：手动操作

1. 访问 https://www.jshaman.com
2. VIP 登录，输入：`1766-7809-6567-6363`
3. 复制 `src/utils/bot-detector.js` 全部代码
4. 使用推荐配置混淆
5. 保存混淆后的代码到 `src/utils/bot-detector-obfuscated.js`

---

## ⚙️ 混淆配置

推荐配置（已在脚本中配置）：

```javascript
{
  compact: true,                          // 压缩代码
  renameGlobalFunctionVariable: true,    // 混淆变量名
  controlFlowFlattening: true,           // 平展控制流
  deadCodeInjection: true,               // 植入僵尸代码
  stringArray: true,                     // 字符串阵列化
  stringArrayEncoding: true,             // 字符串加密
  disableConsoleOutput: true,            // 禁用 console
  debugProtection: true,                 // 反调试
  domainLock: [],                        // 域名锁定（可选）
  reservedNames: ['AGXBotDetector']      // 保留类名
}
```

---

## 🧪 测试验证

### 正常用户测试

```bash
npm run dev
```

访问 `http://localhost:5173`，应该能看到：
1. ✅ 启动图动画（3-5秒）
2. ✅ 自动跳转到登录页

### 爬虫测试

```bash
# 使用 curl 测试
curl -I http://localhost:5173

# 应该被重定向到启动图，且无法进入登录页
```

---

## 🔍 工作流程

```
用户访问网站
    ↓
检查 sessionStorage 是否已验证
    ↓
  [否] → 显示启动图页面
    ↓
  执行反爬虫检测
    ↓
  ┌─────────────────┐
  │                 │
[通过]          [失败]
  │                 │
  ↓                 ↓
跳转登录页      永久停留在启动图
标记已验证       显示"安全检测中"
  │
  ↓
下次访问直接通过
```

---

## 📝 关键代码片段

### 启动图组件引用

```vue
<script setup>
// 根据环境自动选择版本
const isDev = import.meta.env.DEV
const AGXBotDetector = (await import(
  isDev
    ? '@/utils/bot-detector.js'
    : '@/utils/bot-detector-obfuscated.js'
)).default

const detector = new AGXBotDetector()
const result = await detector.detect()

if (result.passed) {
  router.push({ path: '/login', query: { verified: 'true' } })
} else {
  showSecurityAlert.value = true
}
</script>
```

### 路由守卫

```javascript
router.beforeEach(async (to, from, next) => {
  // 检查是否已完成启动页验证
  if (to.name !== 'splash' && !hasSplashVerified()) {
    if (to.query.verified === 'true') {
      sessionStorage.setItem('agx_splash_verified', 'true')
      next({ path: to.path, query: { ...to.query, verified: undefined } })
    } else {
      next({ name: 'splash' })
    }
    return
  }
  next()
})
```

---

## 🛡️ 反爬虫检测项目

| 检测项 | 说明 | 状态 |
|--------|------|------|
| WebDriver | 检测 `navigator.webdriver` | ✅ |
| Headless Chrome | 检测 headless 模式 | ✅ |
| 插件检测 | 检测浏览器插件数量 | ✅ |
| User-Agent | 检测爬虫 UA | ✅ |
| 全局对象 | 检测自动化工具特征 | ✅ |
| 用户交互 | 检测鼠标/触摸事件 | ✅ |
| 设备指纹 | Canvas + WebGL | ✅ |
| 时间一致性 | Date vs performance.now | ✅ |

---

## 📊 混淆效果对比

### 原始代码 (bot-detector.js)
```javascript
class AGXBotDetector {
  constructor() {
    this.verified = false
    this.fingerprint = null
  }

  basicEnvironmentCheck() {
    if (navigator.webdriver === true) {
      return { passed: false, reason: 'webdriver-detected' }
    }
    return { passed: true }
  }
}
```

### 混淆后代码 (bot-detector-obfuscated.js)
```javascript
(function(_0x1be8a7,_0x1f1a33){
  function _0x58c054(_0x5e803f,_0xb02539,_0x3f264c,_0x175138,_0x57202f){
    return _0x49e4(_0x5e803f-0x14c,_0xb02539);
  }
  // ... 370KB 的混淆代码
}
```

---

## ⚠️ 注意事项

1. **开发环境**：使用未混淆版本，便于调试
2. **生产环境**：必须使用混淆版本
3. **更新检测逻辑**：修改后重新混淆
4. **VIP 码有效期**：注意 VIP 码有效期，及时续费
5. **混淆影响**：混淆后代码体积增加 30+ 倍

---

## 🔗 相关文档

- [JShaman 使用指南](./JSHAMAN_OBFUSCATION_GUIDE.md)
- [JShaman 官网](https://www.jshaman.com)

---

## 💡 常见问题

### Q1: 混淆后代码无法运行？
A: 检查 `reservedNames` 配置，确保类名未被混淆

### Q2: 如何测试反爬虫效果？
A: 使用 curl、Puppeteer、Headless Chrome 等工具测试

### Q3: 混淆失败怎么办？
A: 检查网络连接、VIP 码有效性、代码大小限制

### Q4: 开发环境能用混淆版本吗？
A: 可以，但不推荐，调试困难

---

**创建时间**: 2026-01-24
**VIP 码**: 1766-7809-6567-6363
**版本**: 1.0.0
