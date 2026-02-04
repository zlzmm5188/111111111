/**
 * AGX 反爬虫检测模块
 *
 * ⚠️ 重要提示：
 * 此文件包含核心反爬虫逻辑，请使用 JShaman 进行混淆保护
 * VIP 码：1766-7809-6567-6363
 *
 * 使用方法：
 * 1. 访问 https://www.jshaman.com
 * 2. 复制本文件代码
 * 3. 使用 VIP 码混淆
 * 4. 将混淆后的代码替换原文件
 */

class AGXBotDetector {
  constructor() {
    this.verified = false
    this.checks = {}
    this.fingerprint = null
    this.startTime = Date.now()
  }

  /**
   * 主检测入口
   * @returns {Promise<{passed: boolean, reason: string}>}
   */
  async detect() {
    try {
      // 1. 基础环境检测
      const basicCheck = this.basicEnvironmentCheck()
      if (!basicCheck.passed) {
        return { passed: false, reason: basicCheck.reason }
      }

      // 2. 浏览器特征检测
      const browserCheck = this.browserFeaturesCheck()
      if (!browserCheck.passed) {
        return { passed: false, reason: browserCheck.reason }
      }

      // 3. 设备指纹生成
      this.fingerprint = this.generateFingerprint()

      // 4. 行为检测（延迟执行）
      await this.delay(2000)
      const behaviorCheck = this.behaviorCheck()
      if (!behaviorCheck.passed) {
        return { passed: false, reason: behaviorCheck.reason }
      }

      // 5. 时间一致性检测
      const timeCheck = this.timeConsistencyCheck()
      if (!timeCheck.passed) {
        return { passed: false, reason: timeCheck.reason }
      }

      // 6. WebGL 指纹检测
      const webglCheck = this.webglCheck()
      if (!webglCheck.passed) {
        return { passed: false, reason: webglCheck.reason }
      }

      this.verified = true
      return { passed: true, reason: 'verified' }

    } catch (error) {
      return { passed: false, reason: 'detection-failed' }
    }
  }

  /**
   * 基础环境检测
   */
  basicEnvironmentCheck() {
    // 检测 Headless Chrome
    if (navigator.webdriver === true) {
      return { passed: false, reason: 'webdriver-detected' }
    }

    // 检测常见的自动化工具 User-Agent
    const ua = navigator.userAgent.toLowerCase()
    const botPatterns = [
      'headlesschrome',
      'phantom',
      'selenium',
      'playwright',
      'puppeteer',
      'crawl',
      'spider',
      'bot',
      'slurp',
      'curl',
      'wget'
    ]

    for (const pattern of botPatterns) {
      if (ua.includes(pattern)) {
        return { passed: false, reason: 'bot-ua-detected' }
      }
    }

    // 检测可疑的全局对象
    const suspiciousGlobals = [
      '_phantom',
      '__phantom',
      'callPhantom',
      '_Selenium_IDE_Recorder',
      '__selenium_unwrapped',
      '__driver_evaluate',
      '__webdriver_evaluate',
      '__fxdriver_evaluate',
      '__driver_unwrapped',
      '__webdriver_unwrapped',
      '__fxdriver_unwrapped',
      '_WEBDRIVER_ELEM_CACHE',
      'ChromeDriverw',
      'driver-evaluate',
      'webdriver-evaluate',
      'selenium-evaluate',
      'webdriverCommand',
      'webdriver',
      '__webdriverFunc',
      '$cdc_',
      '$wdc_'
    ]

    for (const global of suspiciousGlobals) {
      if (window[global] !== undefined || document[global] !== undefined) {
        return { passed: false, reason: 'automation-detected' }
      }
    }

    return { passed: true }
  }

  /**
   * 浏览器特征检测
   */
  browserFeaturesCheck() {
    // 检测浏览器插件
    if (navigator.plugins.length === 0) {
      return { passed: false, reason: 'no-plugins' }
    }

    // 检测语言设置
    if (!navigator.languages || navigator.languages.length === 0) {
      return { passed: false, reason: 'no-languages' }
    }

    // 检测窗口尺寸
    if (window.outerWidth === 0 || window.outerHeight === 0) {
      return { passed: false, reason: 'invalid-window-size' }
    }

    // 检测 Chrome DevTools Protocol
    if (window.chrome?.runtime?.id !== undefined) {
      return { passed: false, reason: 'cdp-detected' }
    }

    // 检测 document 隐藏属性
    const docHidden = document.hidden || document.webkitHidden || document.mozHidden
    if (docHidden === undefined) {
      return { passed: false, reason: 'hidden-api-missing' }
    }

    return { passed: true }
  }

  /**
   * 生成设备指纹
   */
  generateFingerprint() {
    const components = []

    // Canvas 指纹
    components.push(this.getCanvasFingerprint())

    // 字体指纹
    components.push(this.getFontFingerprint())

    // WebGL 指纹
    components.push(this.getWebGLFingerprint())

    // 屏幕信息
    components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`)

    // 时区信息
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone)

    // 语言信息
    components.push(navigator.language)

    // 平台信息
    components.push(navigator.platform)

    // 生成哈希
    return this.simpleHash(components.join('|'))
  }

  /**
   * Canvas 指纹
   */
  getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const txt = 'AGX-Fingerprint-2024'

      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = '#f60'
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = '#069'
      ctx.fillText(txt, 2, 15)
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
      ctx.fillText(txt, 4, 17)

      return canvas.toDataURL().slice(-100)
    } catch (e) {
      return 'canvas-error'
    }
  }

  /**
   * 字体检测
   */
  getFontFingerprint() {
    try {
      const baseFonts = ['monospace', 'sans-serif', 'serif']
      const testString = 'mmmmmmmmmmlli'
      const testSize = '72px'
      const h = document.getElementsByTagName('body')[0]

      const span = document.createElement('span')
      span.style.fontSize = testSize
      span.innerHTML = testString
      span.style.position = 'absolute'
      span.style.left = '-9999px'

      const baseFontWidths = {}
      for (const baseFont of baseFonts) {
        span.style.fontFamily = baseFont
        h.appendChild(span)
        baseFontWidths[baseFont] = span.offsetWidth
        h.removeChild(span)
      }

      const testFonts = [
        'Arial', 'Arial Black', 'Arial Unicode MS',
        'Calibri', 'Cambria', 'Cambria Math',
        'Comic Sans MS', 'Consolas', 'Courier',
        'Courier New', 'Georgia', 'Helvetica',
        'Impact', 'Lucida Console', 'Lucida Sans Unicode',
        'Microsoft Sans Serif', 'Palatino Linotype',
        'Segoe UI', 'Tahoma', 'Times',
        'Times New Roman', 'Trebuchet MS', 'Verdana'
      ]

      const detectedFonts = []
      for (const font of testFonts) {
        span.style.fontFamily = `'${font}', ${baseFonts[0]}`
        h.appendChild(span)
        const width = span.offsetWidth
        h.removeChild(span)

        for (const baseFont of baseFonts) {
          if (baseFontWidths[baseFont] !== width) {
            detectedFonts.push(font)
            break
          }
        }
      }

      return detectedFonts.join(',')
    } catch (e) {
      return 'font-error'
    }
  }

  /**
   * WebGL 指纹
   */
  getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

      if (!gl) {
        return 'no-webgl'
      }

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        return `${vendor}|${renderer}`
      }

      return 'webgl-no-debug'
    } catch (e) {
      return 'webgl-error'
    }
  }

  /**
   * 行为检测
   */
  behaviorCheck() {
    // 检查是否有用户交互
    if (this.interactions < 2) {
      return { passed: false, reason: 'no-user-interaction' }
    }

    // 检查页面加载时间是否正常
    const loadTime = Date.now() - this.startTime
    if (loadTime < 1000) {
      return { passed: false, reason: 'load-too-fast' }
    }

    // 检查鼠标移动（桌面端）
    if (!this.isMobile() && this.mouseMoves < 1) {
      return { passed: false, reason: 'no-mouse-movement' }
    }

    return { passed: true }
  }

  /**
   * 时间一致性检测
   */
  timeConsistencyCheck() {
    const now = Date.now()
    const perfNow = performance.now()

    // 检查 Date 和 performance.now 的一致性
    const diff = Math.abs(now - perfNow - this.startTime)
    if (diff > 1000) {
      return { passed: false, reason: 'time-inconsistent' }
    }

    return { passed: true }
  }

  /**
   * WebGL 完整检测
   */
  webglCheck() {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

      if (!gl) {
        return { passed: true } // 某些环境不支持 WebGL，不作为硬性要求
      }

      // 检测参数是否正常
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
      if (typeof maxTextureSize !== 'number' || maxTextureSize < 1) {
        return { passed: false, reason: 'invalid-webgl' }
      }

      return { passed: true }
    } catch (e) {
      return { passed: true } // WebGL 异常不阻止访问
    }
  }

  /**
   * 简单哈希函数
   */
  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * 检测是否为移动设备
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 初始化事件监听
   */
  initEventListeners() {
    this.interactions = 0
    this.mouseMoves = 0

    const events = [
      'mousedown',
      'mousemove',
      'touchstart',
      'touchmove',
      'keydown',
      'scroll'
    ]

    const handler = (e) => {
      this.interactions++
      if (e.type === 'mousemove' || e.type === 'touchmove') {
        this.mouseMoves++
      }

      // 达到足够的交互后移除监听器
      if (this.interactions >= 5 && this.mouseMoves >= 2) {
        events.forEach(event => window.removeEventListener(event, handler))
      }
    }

    events.forEach(event => window.addEventListener(event, handler, { passive: true }))
  }

  /**
   * 导出检测状态
   */
  exportStatus() {
    return {
      verified: this.verified,
      fingerprint: this.fingerprint,
      checks: this.checks,
      timestamp: Date.now()
    }
  }
}

// 导出
export default AGXBotDetector
