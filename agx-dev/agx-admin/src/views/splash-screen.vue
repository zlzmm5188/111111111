<!--
  AGX 启动图页面
  - 高端动画效果
  - 反爬虫检测
  - 设备指纹验证
  - 混淆保护核心逻辑
-->
<template>
  <div class="splash-screen">
    <!-- 粒子背景 -->
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>

    <!-- Logo 和文字 -->
    <div class="content-wrapper">
      <div class="logo-container">
        <div class="logo-ring" :class="{ 'active': animationStage >= 1 }">
          <div class="logo-inner">
            <img :src="`${$url}agx-logo.png`" alt="AGX" class="logo-image">
          </div>
        </div>
      </div>

      <div class="text-container">
        <h1 class="title" :class="{ 'visible': animationStage >= 2 }">
          <span class="title-letter" v-for="(letter, index) in 'AGX'.split('')" :key="index" :style="{ animationDelay: `${index * 0.1}s` }">
            {{ letter }}
          </span>
        </h1>
        <p class="subtitle" :class="{ 'visible': animationStage >= 3 }">Admin System</p>
        <div class="divider" :class="{ 'visible': animationStage >= 4 }"></div>
        <p class="tagline" :class="{ 'visible': animationStage >= 5 }">专业的数字资产管理平台</p>
      </div>

      <!-- 加载指示器 -->
      <div class="loading-indicator" :class="{ 'visible': animationStage >= 6 }">
        <div class="loading-bar">
          <div class="loading-progress" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="loading-text">{{ loadingText }}</p>
      </div>
    </div>

    <!-- 反爬虫提示（异常时显示） -->
    <div v-if="showSecurityAlert" class="security-alert">
      <div class="alert-content">
        <div class="alert-icon">⚠️</div>
        <h3>安全检测中</h3>
        <p>请稍候，正在验证您的设备...</p>
        <div class="alert-spinner"></div>
      </div>
    </div>
  </div>
</template>

<!-- 注意：此脚本部分的检测逻辑建议使用 JShaman 进行混淆 -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
// 根据环境选择使用混淆版本或原始版本
// 生产环境使用混淆版本（bot-detector-obfuscated.js）
// 开发环境使用原始版本（bot-detector.js）便于调试
const isDev = import.meta.env.DEV
const AGXBotDetector = (await import(
  isDev
    ? '@/utils/bot-detector.js'
    : '@/utils/bot-detector-obfuscated.js'
)).default

const router = useRouter()
const particleCanvas = ref(null)
const animationStage = ref(0)
const progress = ref(0)
const loadingText = ref('初始化中...')
const showSecurityAlert = ref(false)

let animationFrameId = null
let progressInterval = null
let particles = []

// 粒子动画类
class Particle {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.reset()
  }

  reset() {
    this.x = Math.random() * this.canvas.width
    this.y = Math.random() * this.canvas.height
    this.size = Math.random() * 2 + 0.5
    this.speedX = (Math.random() - 0.5) * 0.5
    this.speedY = (Math.random() - 0.5) * 0.5
    this.opacity = Math.random() * 0.5 + 0.2
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY

    if (this.x < 0 || this.x > this.canvas.width) this.speedX *= -1
    if (this.y < 0 || this.y > this.canvas.height) this.speedY *= -1
  }

  draw() {
    this.ctx.beginPath()
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    this.ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`
    this.ctx.fill()
  }
}

// 初始化粒子背景
const initParticles = () => {
  const canvas = particleCanvas.value
  if (!canvas) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  particles = []
  const particleCount = Math.floor((canvas.width * canvas.height) / 15000)

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(canvas))
  }

  const animate = () => {
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.forEach(particle => {
      particle.update()
      particle.draw()
    })

    // 绘制连线
    particles.forEach((p1, i) => {
      particles.slice(i + 1).forEach(p2 => {
        const dx = p1.x - p2.x
        const dy = p1.y - p2.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 120) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(212, 175, 55, ${0.15 * (1 - distance / 120)})`
          ctx.lineWidth = 0.5
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }
      })
    })

    animationFrameId = requestAnimationFrame(animate)
  }

  animate()
}

// 设备指纹检测 - 建议使用 JShaman 混淆
const detectBot = () => {
  const checks = {
    headless: false,
    automation: false,
    suspicious: false
  }

  // 1. 检测 Headless Chrome
  checks.headless = (
    navigator.webdriver === true ||
    window.navigator.plugins.length === 0 ||
    window.chrome?.runtime?.id !== undefined
  )

  // 2. 检测自动化工具特征
  checks.automation = (
    window.navigator.userAgent.includes('HeadlessChrome') ||
    window.navigator.userAgent.includes('phantom') ||
    window.navigator.userAgent.includes('selenium') ||
    window._phantom ||
    window.__phantom ||
    window.callPhantom ||
    window._Selenium_IDE_Recorder ||
    window.navigator.webdriver === true ||
    document.$cdc_
  )

  // 3. 检测可疑行为
  checks.suspicious = (
    window.outerWidth === 0 ||
    window.outerHeight === 0 ||
    navigator.languages === undefined ||
    navigator.language === undefined
  )

  return checks.headless || checks.automation || checks.suspicious
}

// 行为检测（鼠标/触摸）
let userInteractions = 0
const setupBehaviorDetection = () => {
  const events = ['mousedown', 'mousemove', 'touchstart', 'keydown']
  const handler = () => {
    userInteractions++
    if (userInteractions > 2) {
      events.forEach(event => window.removeEventListener(event, handler))
    }
  }
  events.forEach(event => window.addEventListener(event, handler, { once: true }))
}

// 主要检测流程 - 使用 AGXBotDetector 模块
const runSecurityCheck = async () => {
  // 使用混淆后的检测器
  const detector = new AGXBotDetector()
  detector.initEventListeners()

  // 执行完整检测
  const result = await detector.detect()

  if (result.passed) {
    // 检测通过
    return true
  } else {
    // 检测失败，显示安全警告
    showSecurityAlert.value = true
    console.log('Security check failed:', result.reason)
    return false
  }
}

// 动画流程控制
const startAnimation = async () => {
  // 设置行为检测
  setupBehaviorDetection()

  // 阶段1：Logo出现
  await new Promise(resolve => setTimeout(resolve, 300))
  animationStage.value = 1

  // 阶段2：标题出现
  await new Promise(resolve => setTimeout(resolve, 400))
  animationStage.value = 2

  // 阶段3：副标题
  await new Promise(resolve => setTimeout(resolve, 300))
  animationStage.value = 3

  // 阶段4：分割线
  await new Promise(resolve => setTimeout(resolve, 200))
  animationStage.value = 4

  // 阶段5：标语
  await new Promise(resolve => setTimeout(resolve, 300))
  animationStage.value = 5

  // 阶段6：加载器
  await new Promise(resolve => setTimeout(resolve, 400))
  animationStage.value = 6

  // 模拟加载进度
  const loadingMessages = [
    '初始化中...',
    '加载资源...',
    '安全检测...',
    '准备就绪'
  ]

  for (let i = 0; i <= 100; i += 2) {
    await new Promise(resolve => setTimeout(resolve, 30))
    progress.value = i
    loadingText.value = loadingMessages[Math.floor(i / 30)] || loadingMessages[3]
  }

  // 安全检测
  const passed = await runSecurityCheck()

  if (passed) {
    // 检测通过，跳转到登录页
    await new Promise(resolve => setTimeout(resolve, 500))
    router.replace({ path: '/login', query: { verified: 'true' } })
  } else {
    // 检测失败，停留在启动图（反爬虫）
    loadingText.value = '安全验证失败，请刷新重试'
  }
}

onMounted(() => {
  initParticles()
  startAnimation()

  window.addEventListener('resize', () => {
    if (particleCanvas.value) {
      particleCanvas.value.width = window.innerWidth
      particleCanvas.value.height = window.innerHeight
    }
  })
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 9999;
}

.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.content-wrapper {
  position: relative;
  z-index: 2;
  text-align: center;
}

.logo-container {
  margin-bottom: 40px;
}

.logo-ring {
  width: 150px;
  height: 150px;
  margin: 0 auto;
  border: 3px solid transparent;
  border-radius: 50%;
  position: relative;
  transition: all 0.8s ease;
}

.logo-ring::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  background: linear-gradient(45deg, #d4af37, #f4e4a6, #d4af37);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.8s ease;
}

.logo-ring.active {
  border-color: #d4af37;
  box-shadow: 0 0 30px rgba(212, 175, 55, 0.3),
              inset 0 0 20px rgba(212, 175, 55, 0.1);
}

.logo-ring.active::before {
  opacity: 1;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.logo-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(10, 10, 10, 0.9);
  overflow: hidden;
}

.logo-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.text-container {
  margin-bottom: 60px;
}

.title {
  font-size: 64px;
  font-weight: 700;
  margin: 0 0 20px;
  color: #d4af37;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
  display: inline-block;
}

.title.visible {
  opacity: 1;
  transform: translateY(0);
}

.title-letter {
  display: inline-block;
  animation: letterReveal 0.6s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes letterReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.subtitle {
  font-size: 24px;
  color: #888;
  margin: 0 0 30px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.subtitle.visible {
  opacity: 1;
  transform: translateY(0);
}

.divider {
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
  margin: 0 auto 30px;
  transition: width 0.8s ease;
}

.divider.visible {
  width: 200px;
}

.tagline {
  font-size: 16px;
  color: #666;
  margin: 0;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.tagline.visible {
  opacity: 1;
  transform: translateY(0);
}

.loading-indicator {
  width: 300px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.loading-indicator.visible {
  opacity: 1;
  transform: translateY(0);
}

.loading-bar {
  width: 100%;
  height: 3px;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 15px;
}

.loading-progress {
  height: 100%;
  background: linear-gradient(90deg, #d4af37, #f4e4a6);
  border-radius: 3px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
}

.loading-text {
  font-size: 14px;
  color: #888;
  margin: 0;
}

/* 安全警告提示 */
.security-alert {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.alert-content {
  text-align: center;
  color: #fff;
}

.alert-icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.alert-content h3 {
  font-size: 24px;
  margin: 0 0 10px;
  color: #d4af37;
}

.alert-content p {
  font-size: 16px;
  color: #888;
  margin: 0 0 30px;
}

.alert-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border: 3px solid rgba(212, 175, 55, 0.2);
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .title {
    font-size: 48px;
  }

  .subtitle {
    font-size: 18px;
  }

  .tagline {
    font-size: 14px;
  }

  .loading-indicator {
    width: 80%;
  }
}
</style>
