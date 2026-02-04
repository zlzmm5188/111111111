<template>
  <div class="square-header">
    <!-- 顶部品牌栏 - 与Mine页面统一风格 -->
    <div class="header-brand">
      <img src="/company-logo.png" alt="AGX" class="brand-logo">
      <span class="brand-name">
        <span v-for="(char, i) in brandText" :key="i" class="wave-char" :style="{ animationDelay: `${i * 0.08}s` }">{{ char }}</span>
      </span>
    </div>
    
    <!-- Tab导航 -->
    <div class="tab-nav">
      <div class="tab-track">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key }]"
          @click="$emit('update:activeTab', tab.key)"
        >
          <span class="tab-label">{{ tab.name }}</span>
        </button>
        <div class="tab-indicator" :style="indicatorStyle"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeTab: {
    type: String,
    default: 'news'
  },
  tabs: {
    type: Array,
    default: () => [
      { key: 'news', name: '新闻' },
      { key: 'posts', name: '动态' }
    ]
  }
})

defineEmits(['update:activeTab'])

// 品牌名称波浪动画
const brandText = '社区广场'

const tabIndex = computed(() => {
  return props.tabs.findIndex(t => t.key === props.activeTab)
})

const indicatorStyle = computed(() => ({
  transform: `translateX(${tabIndex.value * 100}%)`,
  width: `${100 / props.tabs.length}%`
}))
</script>

<style scoped>
.square-header {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 428px;
  z-index: 100;
  background: linear-gradient(180deg, #1C242E 0%, #161C24 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: env(safe-area-inset-top, 0px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  will-change: transform;
  transform: translateX(-50%) translateZ(0);
}

/* 金色底部装饰线 */
.square-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.4) 30%, #C8AA6E 50%, rgba(200, 170, 110, 0.4) 70%, transparent 100%);
  pointer-events: none;
}

/* 品牌栏 */
.header-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 56px;
  padding: 0 16px;
}

.brand-logo {
  width: 34px;
  height: 34px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.brand-name {
  display: flex;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  overflow: hidden;
}

.wave-char {
  display: inline-block;
  background: linear-gradient(
    180deg, 
    #F5E6C4 0%,
    #C8AA6E 50%, 
    #A08A5B 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  opacity: 0;
  transform: translateX(-10px) scale(0.8);
  animation: charFlow 0.5s ease-out forwards, charFloat 3s ease-in-out infinite;
}

@keyframes charFlow {
  0% { 
    opacity: 0;
    transform: translateX(-10px) scale(0.8);
  }
  100% { 
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes charFloat {
  0%, 100% { 
    transform: translateY(0);
  }
  50% { 
    transform: translateY(-2px);
  }
}

/* Tab导航 */
.tab-nav {
  position: relative;
  padding: 0 16px 12px;
}

.tab-track {
  position: relative;
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(200, 170, 110, 0.08);
  border-radius: 12px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
  position: relative;
  z-index: 1;
}

.tab-icon {
  font-size: 14px;
  transition: transform 0.3s ease;
}

.tab-btn.active {
  color: #0D1117;
  font-weight: 600;
}

.tab-btn.active .tab-icon {
  transform: scale(1.1);
}

.tab-btn:not(.active):active {
  background: rgba(255, 255, 255, 0.05);
}

.tab-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  height: calc(100% - 8px);
  background: linear-gradient(135deg, #C8AA6E 0%, #E8D5A3 50%, #C8AA6E 100%);
  border-radius: 8px;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(200, 170, 110, 0.3);
}
</style>
