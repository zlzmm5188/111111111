# JShaman 代码混淆使用指南

## 一、使用 VIP 码混淆反爬虫检测模块

### 1.1 访问 JShaman

网址：https://www.jshaman.com

### 1.2 混淆步骤

1. 打开 JShaman 网站
2. 选择 VIP 登录
3. 输入 VIP 码：`1766-7809-6567-6363`
4. 复制 `/root/agx-dev/agx-admin/src/utils/bot-detector.js` 的全部代码
5. 粘贴到 JShaman 代码输入框
6. 配置混淆参数（参考下方配置）
7. 点击"保护"按钮
8. 下载或复制混淆后的代码
9. 替换原 `bot-detector.js` 文件内容

### 1.3 推荐混淆配置

```json
{
  "compact": true,
  "renameGlobalFunctionVariable": true,
  "controlFlowFlattening": true,
  "deadCodeInjection": true,
  "stringArray": true,
  "stringArrayEncoding": true,
  "disableConsoleOutput": true,
  "debugProtection": true,
  "domainLock": [],
  "reservedNames": ["AGXBotDetector"]
}
```

### 1.4 配置说明

| 选项 | 值 | 说明 |
|------|-----|------|
| compact | true | 压缩代码，减小文件体积 |
| renameGlobalFunctionVariable | true | 混淆全局变量和函数名 |
| controlFlowFlattening | true | 平展控制流，增加阅读难度 |
| deadCodeInjection | true | 植入僵尸代码，干扰逆向分析 |
| stringArray | true | 字符串阵列化，隐藏字符串字面量 |
| stringArrayEncoding | true | 字符串加密（使用 RC4 或 Base64） |
| disableConsoleOutput | true | 禁用 console 输出，防止调试 |
| debugProtection | true | 反浏览器调试 |
| domainLock | [] | 域名锁定（可选，限制在特定域名运行） |
| reservedNames | ["AGXBotDetector"] | 保留类名，确保外部调用正常 |

---

## 二、API 调用方式（自动化混淆）

### 2.1 HTTP API 调用

```bash
curl -X POST http://www.jshaman.com:800/submit_js_code/ \
  -H "Content-Type: application/json" \
  -d '{
    "js_code": "class AGXBotDetector { ... }",
    "vip_code": "1766-7809-6567-6363",
    "config": {
      "compact": true,
      "renameGlobalFunctionVariable": true,
      "controlFlowFlattening": true,
      "deadCodeInjection": true,
      "stringArray": true,
      "stringArrayEncoding": true,
      "disableConsoleOutput": true,
      "debugProtection": true
    }
  }'
```

### 2.2 响应示例

```json
{
  "status": 0,
  "message": "保护成功。",
  "content": "混淆后的代码..."
}
```

---

## 三、混淆前代码示例（原始代码）

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

  async detect() {
    const basicCheck = this.basicEnvironmentCheck()
    if (!basicCheck.passed) {
      return { passed: false, reason: basicCheck.reason }
    }
    this.verified = true
    return { passed: true, reason: 'verified' }
  }
}
```

---

## 四、混淆后代码示例

```javascript
var _0x4f2e=['detect','webdriver','passed','reason','basicEnvironmentCheck'];(function(_0x1a2b3c,_0x4d5e6f){var _0x7g8h9i=function(_0x10jklm){while(--_0x10jklm){_0x1a2b3c['push'](_0x1a2b3c['shift']());}};_0x7g8h9i(++_0x4d5e6f);}(_0x4f2e,0x123));var _0xmnopqr=function(_0xstuvwx,_0x2yzabc){_0xstuvwx=_0xstuvwx-0x0;var _0x3defghi=_0x4f2e[_0xstuvwx];return _0x3defghi;};class AGXBotDetector{constructor(){this[_0xmnopqr('0x0')]=![];this['fingerprint']=null;}[_0xmnopqr('0x1')](){if(navigator[_0xmnopqr('0x2')]===![]){return{'passed':![],'reason':'webdriver-detected'};}return{'passed':![]};}async['detect'](){const _0x456789=this['basicEnvironmentCheck']();if(!_0x456789[_0xmnopqr('0x3')]){return{'passed':![],'reason':_0x456789[_0xmnopqr('0x4')]};}this[_0xmnopqr('0x0')]=!![];return{'passed':!![],'reason':'verified'};}}
```

---

## 五、在启动图中使用混淆后的模块

### 5.1 引入混淆后的模块

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// 引入混淆后的反爬虫检测模块
import AGXBotDetector from '@/utils/bot-detector.js'

const router = useRouter()
const showSecurityAlert = ref(false)

// 使用混淆后的检测器
const runSecurityCheck = async () => {
  const detector = new AGXBotDetector()
  detector.initEventListeners()

  const result = await detector.detect()

  if (result.passed) {
    // 检测通过，跳转登录
    router.replace({ path: '/login', query: { verified: 'true' } })
  } else {
    // 检测失败，卡在启动图
    showSecurityAlert.value = true
  }
}

onMounted(() => {
  runSecurityCheck()
})
</script>
```

### 5.2 完整流程

```
用户访问 → 启动图页面 → 反爬虫检测
                              ↓
                        检测通过 → 登录页面
                              ↓
                        检测失败 → 永久停留在启动图
```

---

## 六、测试反爬虫效果

### 6.1 正常用户测试

1. 使用正常浏览器访问
2. 移动鼠标、点击屏幕
3. 应该能在 3-5 秒后进入登录页

### 6.2 爬虫测试

1. 使用 curl 或 wget 请求：
```bash
curl -I http://your-domain.com
```
   → 应该一直停留在启动图

2. 使用 Puppeteer/Playwright：
```javascript
const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.goto('http://your-domain.com')
// 应该被检测为 webdriver，卡在启动图
```

3. 使用 Headless Chrome：
```bash
google-chrome --headless --disable-gpu --dump-dom http://your-domain.com
```
   → 应该被检测为 headless，卡在启动图

---

## 七、注意事项

### 7.1 混淆后无法调试

混淆后的代码难以阅读和调试，建议：
- 在开发环境使用原始未混淆代码
- 仅在生产环境使用混淆后的代码
- 使用环境变量控制是否加载混淆版本

### 7.2 性能影响

混淆会增加一定的性能开销：
- 代码体积：增加 50%-100%
- 解析时间：增加 10%-30%
- 建议使用 HTTP/2 或 CDN 加速

### 7.3 更新维护

每次修改 `bot-detector.js` 后：
1. 重新生成混淆代码
2. 替换生产环境文件
3. 测试验证功能正常
4. 记录混淆版本号

---

## 八、自动化脚本（可选）

### 8.1 Node.js 自动混淆脚本

```javascript
// scripts/obfuscate-bot-detector.js
const fs = require('fs')
const https = require('https')

const sourceCode = fs.readFileSync('./src/utils/bot-detector.js', 'utf8')

const postData = JSON.stringify({
  js_code: sourceCode,
  vip_code: '1766-7809-6567-6363',
  config: {
    compact: true,
    renameGlobalFunctionVariable: true,
    controlFlowFlattening: true,
    deadCodeInjection: true,
    stringArray: true,
    stringArrayEncoding: true,
    disableConsoleOutput: true,
    debugProtection: true
  }
})

const options = {
  hostname: 'www.jshaman.com',
  port: 800,
  path: '/submit_js_code/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}

const req = https.request(options, (res) => {
  let data = ''
  res.on('data', (chunk) => { data += chunk })
  res.on('end', () => {
    const result = JSON.parse(data)
    if (result.status === 0) {
      fs.writeFileSync('./src/utils/bot-detector.obfuscated.js', result.content)
      console.log('混淆成功！')
    } else {
      console.error('混淆失败：', result.message)
    }
  })
})

req.on('error', (e) => {
  console.error('请求失败：', e)
})

req.write(postData)
req.end()
```

### 8.2 package.json 脚本

```json
{
  "scripts": {
    "obfuscate": "node scripts/obfuscate-bot-detector.js",
    "build:prod": "npm run obfuscate && vite build"
  }
}
```

使用方式：
```bash
npm run build:prod
```

---

## 九、故障排除

### 9.1 混淆后代码无法运行

**可能原因：**
- `reservedNames` 配置错误，类名被混淆
- 混淆等级过高，破坏了代码逻辑

**解决方案：**
- 在 `reservedNames` 中添加需要保留的类名和方法名
- 降低 `controlFlowFlattening` 或 `deadCodeInjection` 等级

### 9.2 JShaman API 调用失败

**可能原因：**
- VIP 码过期或无效
- 网络连接问题
- 代码过大，超出限制

**解决方案：**
- 检查 VIP 码是否有效
- 使用网站手动混淆
- 分块混淆大文件

---

## 十、总结

| 项目 | 说明 |
|------|------|
| VIP 码 | 1766-7809-6567-6363 |
| 需要混淆的文件 | `/src/utils/bot-detector.js` |
| 混淆方式 | JShaman 网站或 API |
| 推荐配置 | compact + controlFlowFlattening + stringArrayEncoding |
| 测试重点 | 确保正常用户可通过，爬虫被拦截 |

混淆后的反爬虫模块可以有效地防止自动化工具访问，同时保持正常用户的体验。
