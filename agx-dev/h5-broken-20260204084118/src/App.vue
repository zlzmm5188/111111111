<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
        <keep-alive :include="cacheViews">
          <component :is="Component" :key="$route.path" />
        </keep-alive>
    </router-view>
    
    <!-- 底部导航栏 -->
    <TabBar v-if="showTabBar" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import TabBar from '@/components/TabBar.vue'
import { extractInviteCodeFromSubdomain, saveInviteCode } from '@/utils/security'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
// 是否显示底部导航栏
const showTabBar = computed(() => {
  return route.meta?.showTabBar === true
})

// 需要缓存的页面名称（对应组件的 name 属性）
const cacheViews = computed(() => {
  // 只缓存最常用的页面，减少内存占用
  const cacheList = ['Home', 'Square', 'Mine']
  return cacheList
})

// 初始化主题（固定暗色主题）
onMounted(async () => {
  document.documentElement.setAttribute('data-theme', 'dark')

  // 初始化用户信息（如果有token）
  await userStore.init()

  // 检测子域名中的邀请码
  const inviteCode = extractInviteCodeFromSubdomain()
  if (inviteCode) {
    saveInviteCode(inviteCode)
    console.log('检测到邀请码:', inviteCode)

    // 如果当前在首页、启动页或注册页，重定向到邀请落地页
    if (route.path === '/' || route.path === '/home' || route.path === '/splash' || route.path === '/register' || route.path === '/login') {
      router.replace(`/i/${inviteCode}`)
    }
  }
})
</script>

<style>
/* Global Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* App Container - 全局移动端宽度限制 */
.app-container {
  width: 100%;
  max-width: 428px;
  min-height: 100vh;
  margin: 0 auto;
  position: relative;
  background: transparent;
}

/* Global Styles */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #181A20;
  color: var(--text-primary, #EAECEF);
  font-size: 14px;
  line-height: 1.5;
  transition: background 0.3s ease, color 0.3s ease;
}

/* Hide Scrollbar */
::-webkit-scrollbar {
  display: none;
}

* {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Link Reset */
a {
  color: inherit;
  text-decoration: none;
}

/* Button Reset */
button {
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

/* Input Reset */
input, textarea, select {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  outline: none;
}

/* Safe Area for Mobile */
@supports (padding: max(0px)) {
  body {
    padding-left: max(0px, env(safe-area-inset-left));
    padding-right: max(0px, env(safe-area-inset-right));
  }
}

/* 金融风格数字字体 - 全局统一 */
.num, .price, .amount, .rate, .percent,
[class*="price"], [class*="amount"], [class*="value"], [class*="rate"],
.stat-value, .earnings-value, .cd-num, .ticker-price, .gold-price,
.feature-value, .record-amount {
  font-family: 'DIN Alternate', 'SF Mono', 'Roboto Mono', 'Menlo', monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
}

/* 路由切换禁用过渡动画 - 移动端更流畅 */
.fade-enter-active,
.fade-leave-active {
  transition: none;
}

.fade-leave-active {
  position: static;
}

.splash-fade-enter-active,
.splash-fade-leave-active {
  transition: none;
}

.splash-fade-leave-active {
  position: static;
}
</style>
