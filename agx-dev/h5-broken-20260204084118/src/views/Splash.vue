<template>
  <div class="splash-screen">
    <!-- 主内容 -->
    <div class="main-content">
      <!-- Logo -->
      <div class="logo-wrapper" :class="{ show: step >= 1 }">
        <img src="/agx-new.png" alt="Ascenda" class="logo">
      </div>

      <!-- 品牌名 -->
      <div class="brand" :class="{ show: step >= 2 }">
        <h1 class="brand-name">Ascenda Digital Capital</h1>
        <p class="brand-sub">GROUP LIMITED</p>
        <p class="brand-cn">（升达数字资本集团）</p>
      </div>

      <!-- 加载指示器 -->
      <div class="loader" :class="{ show: step >= 3 }">
        <div class="loader-bar">
          <div class="loader-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="loader-text">{{ statusText }}</p>
      </div>
    </div>

    <!-- 底部 -->
    <div class="footer" :class="{ show: step >= 3 }">
      <p class="slogan">全球领先的数字资产金融服务集团</p>
      <p class="slogan-sub">构建安全、合规、高效的数字经济基础设施</p>
      <p class="copyright">© 2024 Ascenda Digital Capital</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const step = ref(0)
const progress = ref(0)
const statusText = ref('')

onMounted(() => {
  // 分步显示
  setTimeout(() => { step.value = 1 }, 200)   // Logo
  setTimeout(() => { step.value = 2 }, 1800)  // 品牌名（等Logo动画完成）
  setTimeout(() => { step.value = 3 }, 2400)  // 加载条
  
  // 平滑进度条
  setTimeout(() => {
    statusText.value = '初始化...'
    
    const duration = 2500  // 总时长
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / duration, 1)
      
      // 缓动函数：先快后慢
      const eased = 1 - Math.pow(1 - t, 3)
      progress.value = Math.round(eased * 100)
      
      // 更新状态文字
      if (progress.value < 30) {
        statusText.value = '初始化...'
      } else if (progress.value < 60) {
        statusText.value = '加载资源...'
      } else if (progress.value < 90) {
        statusText.value = '连接服务...'
      } else {
        statusText.value = '准备就绪'
      }
      
      if (t < 1) {
        requestAnimationFrame(animate)
      } else {
        setTimeout(() => {
          const token = localStorage.getItem('token')
          router.replace(token ? '/home' : '/login')
        }, 300)
      }
    }
    
    requestAnimationFrame(animate)
  }, 2600)
})
</script>

<style scoped>
.splash-screen {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #0B0E11;
}

/* 主内容 */
.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -40px;
}

/* Logo */
.logo-wrapper {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  opacity: 0;
  transform: scale(0.3);
  transition: all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.logo-wrapper.show {
  opacity: 1;
  transform: scale(1);
  animation: logoPulse 2.5s ease-in-out 1.5s infinite;
}

@keyframes logoPulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 8px rgba(200, 170, 110, 0.3));
  }
  50% {
    transform: scale(1.05);
    filter: drop-shadow(0 0 20px rgba(200, 170, 110, 0.6));
  }
}

.logo {
  width: 100%;
  height: 100%;
  border-radius: 20px;
}

/* 品牌 */
.brand {
  text-align: center;
  margin-bottom: 48px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.5s ease-out;
}

.brand.show {
  opacity: 1;
  transform: translateY(0);
}

.brand-name {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 0 0 4px;
  background: linear-gradient(
    90deg,
    #A08A5B 0%,
    #C8AA6E 20%,
    #E8D5A3 40%,
    #C8AA6E 60%,
    #A08A5B 80%,
    #C8AA6E 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: waveGold 3s ease-in-out infinite;
}

.brand-sub {
  font-size: 11px;
  font-weight: 500;
  color: rgba(200, 170, 110, 0.7);
  letter-spacing: 3px;
  margin: 0 0 8px;
  text-transform: uppercase;
}

.brand-cn {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  letter-spacing: 2px;
}

@keyframes waveGold {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.brand-tagline {
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 2px;
  margin: 0;
  text-transform: uppercase;
}

/* 加载器 */
.loader {
  width: 200px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.loader.show {
  opacity: 1;
}

.loader-bar {
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1px;
  overflow: hidden;
  margin-bottom: 12px;
}

.loader-fill {
  height: 100%;
  background: #C8AA6E;
  border-radius: 1px;
  transition: width 0.4s ease;
}

.loader-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  margin: 0;
}

/* 底部 */
.footer {
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  text-align: center;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.footer.show {
  opacity: 1;
}

.slogan {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0 0 4px;
  letter-spacing: 1px;
}

.slogan-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.25);
  margin: 0 0 12px;
  letter-spacing: 0.5px;
}

.copyright {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.2);
  margin: 0;
}
</style>
