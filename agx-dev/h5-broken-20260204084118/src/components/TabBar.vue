<template>
  <nav class="oriole-tabbar">
    <div class="oriole-tabbar__inner">
      <router-link
        v-for="item in tabs"
        :key="item.path"
        :to="item.path"
        class="oriole-tab-item"
        :class="{ active: isActive(item.path), 'tab-center': item.id === 'trade' }"
      >
        <div class="oriole-tab-item__icon">
          <!-- 首页 -->
          <svg v-if="item.id === 'home'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
            <path d="M9 22V12h6v10"/>
          </svg>

          <!-- 行情 -->
          <svg v-else-if="item.id === 'markets'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3v18h18"/>
            <path d="M7 16l4-4 4 4 5-6"/>
          </svg>

          <!-- AGX -->
          <img v-else-if="item.id === 'trade'" src="/company-logo.png" alt="AGX" :class="{ 'tab-logo-lg': item.id === 'trade' }">

          <!-- 广场 -->
          <svg v-else-if="item.id === 'square'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>

          <!-- 我的 -->
          <svg v-else-if="item.id === 'mine'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="7" r="4"/>
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          </svg>
        </div>
        <span v-if="item.id !== 'trade'" class="oriole-tab-item__label">{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { id: 'home', path: '/home', label: '首页' },
  { id: 'markets', path: '/markets', label: '行情' },
  { id: 'trade', path: '/agx', label: 'AGX' },
  { id: 'square', path: '/square', label: '广场' },
  { id: 'mine', path: '/mine', label: '我的' }
]

const isActive = (path) => {
  return route.path === path || (path === '/home' && route.path === '/')
}
</script>

<style scoped>
/* 底部导航栏整体 */
.oriole-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 428px;
  margin: 0 auto;
  height: calc(64px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  /* Pro Max 3D 风格背景 - 增强质感 */
  background: linear-gradient(180deg, #1A222B 0%, #0D1117 100%);
  border-top: 1px solid rgba(200, 170, 110, 0.15);
  z-index: 300;
  /* 顶部金色装饰线 - 增强 */
  box-shadow: inset 0 2px 0 rgba(200, 170, 110, 0.25);
  /* 移动端优化 */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* 内容容器 */
.oriole-tabbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 64px;
  width: 100%;
  padding: 0 12px;
}

/* Tab 项 */
.oriole-tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px; /* 图标与文字间距增加 */
  color: var(--text-tertiary, #848E9C);
  text-decoration: none;
  transition: all 180ms ease;
  padding: 8px 0; /* 上下padding增加，更舒适 */
  position: relative;
  cursor: pointer;
  /* 触摸优化 */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  /* GPU 加速 */
  transform: translateZ(0);
  will-change: transform;
}

/* 点击反馈 - 更柔和 */
.oriole-tab-item:active {
  transform: scale(0.96);
  opacity: 0.9;
}

/* 激活状态 */
.oriole-tab-item.active {
  color: var(--color-brand, #C8AA6E);
}

/* 激活状态底部横线 - 更大气 */
.oriole-tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 28px; /* 从20px增加到28px */
  height: 3px; /* 从2px增加到3px */
  background: var(--color-brand, #C8AA6E);
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(201, 169, 98, 0.4); /* 发光效果 */
}

/* 图标容器 */
.oriole-tab-item__icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 非中心tab的小图标 - 更精致 */
.oriole-tab-item:not(.tab-center) .oriole-tab-item__icon {
  width: 32px;
  height: 32px;
}

.oriole-tab-item:not(.tab-center) .oriole-tab-item__icon svg {
  width: 32px;
  height: 32px;
  stroke-width: 2;
}

/* 图标 */
.oriole-tab-item__icon svg {
  width: 36px;
  height: 36px;
  stroke-width: 2; /* 从2.5减少到2，线条更精致 */
  transition: all 180ms ease;
}

/* 激活状态图标动画 - 增强 */
.oriole-tab-item.active .oriole-tab-item__icon svg {
  transform: translateY(-2px) scale(1.08); /* 略微放大 */
  stroke-width: 2.2;
  filter: drop-shadow(0 2px 4px rgba(201, 169, 98, 0.3)); /* 金色阴影 */
}

/* 非中心tab的激活状态 - 小图标微调 */
.oriole-tab-item:not(.tab-center).active .oriole-tab-item__icon svg {
  transform: translateY(-1px) scale(1.05); /* 小图标放大幅度小一点 */
  stroke-width: 2.2;
  filter: drop-shadow(0 1px 3px rgba(201, 169, 98, 0.25)); /* 阴影弱一点 */
}

/* 点击时图标效果 */
.oriole-tab-item:active .oriole-tab-item__icon svg {
  transform: scale(0.92);
}

/* 标签文字 */
.oriole-tab-item__label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 180ms ease;
}

/* 激活状态文字 - 增强效果 */
.oriole-tab-item.active .oriole-tab-item__label {
  font-weight: 700; /* 更粗 */
  text-shadow: 0 1px 2px rgba(201, 169, 98, 0.2);
}

/* AGX logo图片 */
.tab-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
  transition: all 180ms ease;
}

.oriole-tab-item.active .tab-logo {
  transform: translateY(-2px) scale(1.08); /* 与图标同步 */
  filter: drop-shadow(0 2px 4px rgba(201, 169, 98, 0.3)); /* 金色阴影 */
}

.oriole-tab-item:active .tab-logo {
  transform: scale(0.92);
}


/* ==================== 中间AGX特殊样式 ==================== */

/* 中间tab的容器 - 让logo更突出 */
.oriole-tab-item.tab-center {
  padding: 4px 0; /* 上下padding更小，logo居中 */
}

.oriole-tab-item.tab-center .oriole-tab-item__icon {
  width: 44px;  /* 更大 */
  height: 44px;
  background: linear-gradient(135deg, rgba(201, 169, 98, 0.15), rgba(201, 169, 98, 0.05)); /* 淡金色背景 */
  border-radius: 50%; /* 圆形背景 */
  box-shadow: 0 4px 12px rgba(201, 169, 98, 0.2); /* 金色阴影 */
  transition: all 180ms ease;
}

/* 激活状态的中间tab */
.oriole-tab-item.tab-center.active .oriole-tab-item__icon {
  background: linear-gradient(135deg, rgba(201, 169, 98, 0.25), rgba(201, 169, 98, 0.1));
  box-shadow: 0 6px 16px rgba(201, 169, 98, 0.4), 0 0 20px rgba(201, 169, 98, 0.2); /* 发光效果 */
  transform: translateY(-4px) scale(1.1); /* 上移+放大 */
}

/* 点击效果 */
.oriole-tab-item.tab-center:active .oriole-tab-item__icon {
  transform: translateY(-2px) scale(1.05);
}

/* 大logo样式 */
.tab-logo-lg {
  width: 36px;
  height: 36px;
  object-fit: contain;
  transition: all 180ms ease;
}

.oriole-tab-item.tab-center.active .tab-logo-lg {
  transform: scale(1.12); /* 激活时略微放大 */
}

.oriole-tab-item.tab-center:active .tab-logo-lg {
  transform: scale(1.05);
}

/* 移除中间tab的底部横线 */
.oriole-tab-item.tab-center.active::after {
  display: none;
}

</style>