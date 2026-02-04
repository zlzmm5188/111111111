<template>
  <div class="page-layout" :class="{ 'page-layout--dark': darkNavbar }">
    <!-- 导航标题栏 -->
    <div class="navbar" v-if="showNavbar" :class="{ 'navbar--transparent': transparentNavbar }">
      <div class="navbar-inner">
        <div class="navbar-left" @click="handleBack" v-if="showBack">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span v-if="backText">{{ backText }}</span>
        </div>
        <div class="navbar-left" v-else-if="$slots['navbar-left']">
          <slot name="navbar-left"></slot>
        </div>
        <div class="navbar-left" v-else></div>
        
        <div class="navbar-title">
          <slot name="title">{{ title }}</slot>
        </div>
        
        <div class="navbar-right">
          <slot name="navbar-right"></slot>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div class="page-loading" v-if="loading">
      <div class="loading-spinner"></div>
      <span class="loading-text">{{ loadingText }}</span>
    </div>

    <!-- 主内容区域 -->
    <div 
      class="page-main" 
      :class="{ 
        'has-navbar': showNavbar, 
        'has-tabbar': showTabbar,
        'has-footer': $slots.footer,
        'page-main--scrollable': scrollable,
        'page-main--padded': padded
      }"
      v-show="!loading"
    >
      <!-- 下拉刷新提示 -->
      <div class="pull-refresh" v-if="pullRefresh && refreshing">
        <div class="pull-refresh-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        </div>
        <span>{{ refreshText }}</span>
      </div>
      
      <slot></slot>
      
      <!-- 空状态插槽 -->
      <div class="page-empty" v-if="$slots.empty && isEmpty">
        <slot name="empty"></slot>
      </div>
    </div>

    <!-- 底部操作栏（可选） -->
    <div class="page-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
    
    <!-- 浮动按钮插槽 -->
    <div class="page-fab" v-if="$slots.fab">
      <slot name="fab"></slot>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onMounted } from 'vue'

const router = useRouter()
const route = useRoute()

// 记录是否有前一个页面（用于判断是否可以返回）
const canGoBack = ref(false)

onMounted(() => {
  // 检查是否有历史记录可以返回
  // 通过检查performance navigation type或者监听popstate来判断
  canGoBack.value = window.history.state?.back !== null
})

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showNavbar: {
    type: Boolean,
    default: true
  },
  showBack: {
    type: Boolean,
    default: true
  },
  backText: {
    type: String,
    default: ''
  },
  showTabbar: {
    type: Boolean,
    default: false
  },
  // 新增属性
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: '加载中...'
  },
  transparentNavbar: {
    type: Boolean,
    default: false
  },
  darkNavbar: {
    type: Boolean,
    default: false
  },
  scrollable: {
    type: Boolean,
    default: true
  },
  padded: {
    type: Boolean,
    default: false
  },
  pullRefresh: {
    type: Boolean,
    default: false
  },
  refreshing: {
    type: Boolean,
    default: false
  },
  refreshText: {
    type: String,
    default: '刷新中...'
  },
  isEmpty: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['back', 'refresh'])

const handleBack = () => {
  emit('back')
  // 检查Vue Router历史状态，如果有back路由则返回，否则跳转首页
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push('/')
  }
}

// 暴露给父组件的方法
defineExpose({
  scrollToTop: () => {
    const main = document.querySelector('.page-main')
    if (main) {
      main.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
})
</script>

<style scoped>
.page-layout {
  width: 100%;
  max-width: var(--page-max-width, 428px);
  min-height: 100vh;
  margin: 0 auto;
  background: var(--bg-page, #0B0E11);
  overflow-x: hidden;
  position: relative;
  transition: background 0.3s ease;
}

.page-layout--dark {
  background: var(--bg-primary, #0B0E11);
}

/* 导航栏 - Pro Max 3D 风格（与个人中心同步） */
.navbar {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--page-max-width, 428px);
  z-index: 100;
  background: linear-gradient(180deg, #1C242E 0%, #161C24 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  padding-top: env(safe-area-inset-top, 0px);
  /* 硬件加速，避免闪烁 */
  will-change: transform;
}

/* 底部金色装饰线 */
.navbar-inner {
  position: relative;
}

.navbar-inner::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(200, 170, 110, 0.5) 15%, 
    rgba(220, 190, 120, 0.9) 50%, 
    rgba(200, 170, 110, 0.5) 85%, 
    transparent 100%);
}

.navbar--transparent {
  background: transparent;
  border-bottom: none;
  backdrop-filter: none;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 12px;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 60px;
  color: var(--text-primary, #EAECEF);
  cursor: pointer;
  font-size: 14px;
  padding: 8px;
  border-radius: 10px;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.navbar-left:active {
  background: var(--bg-active, rgba(212, 175, 55, 0.15));
}

.navbar-left svg {
  flex-shrink: 0;
  color: var(--text-primary, #EAECEF);
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  /* 金色渐变文字 */
  background: linear-gradient(135deg, #F0D78C 0%, #C8AA6E 50%, #A68B4B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 12px;
  letter-spacing: 0.5px;
}

.navbar-right {
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

/* 加载状态 */
.page-loading {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--page-max-width, 428px);
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: var(--bg-page, #0B0E11);
  z-index: 200;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
  border-top-color: var(--color-brand, #C8AA6E);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: var(--text-tertiary, #848E9C);
}

/* 主内容区域 */
.page-main {
  width: 100%;
  min-height: 100vh;
  padding-bottom: 24px;
}

.page-main--scrollable {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.page-main--padded {
  padding-left: 16px;
  padding-right: 16px;
}

/* 有导航栏时，预留导航栏空间 */
.page-main.has-navbar {
  padding-top: calc(56px + env(safe-area-inset-top, 0px));
}

/* 有TabBar时，预留TabBar空间 */
.page-main.has-tabbar {
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}

/* 有底部操作栏时 */
.page-main.has-footer {
  padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px));
}

/* 下拉刷新 */
.pull-refresh {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 0;
  color: var(--text-tertiary, #848E9C);
  font-size: 14px;
}

.pull-refresh-icon {
  animation: spin 1s linear infinite;
}

.pull-refresh-icon svg {
  color: var(--color-brand, #C8AA6E);
}

/* 空状态 */
.page-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  min-height: 300px;
}

/* 底部操作栏 */
.page-footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--page-max-width, 428px);
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  background: var(--navbar-bg, rgba(11, 14, 17, 0.95));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
  z-index: 90;
  transition: background 0.3s ease;
}

/* 浮动按钮 */
.page-fab {
  position: fixed;
  right: calc(50% - var(--page-max-width, 428px) / 2 + 16px);
  bottom: calc(80px + env(safe-area-inset-bottom, 0px) + 16px);
  z-index: 90;
}

@media (max-width: 428px) {
  .page-fab {
    right: 16px;
  }
}
</style>
