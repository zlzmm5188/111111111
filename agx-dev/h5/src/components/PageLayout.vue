<template>
  <div class="page-layout">
    <!-- Navbar -->
    <div class="navbar" v-if="!hideNavbar">
      <div class="navbar-content">
        <div class="navbar-left">
          <slot name="navbar-left">
            <button class="back-btn" v-if="showBack" @click="handleBack">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
            </button>
          </slot>
        </div>
        <h1 class="navbar-title">{{ title }}</h1>
        <div class="navbar-right">
          <slot name="navbar-right"></slot>
        </div>
      </div>
    </div>

    <!-- Page Content -->
    <div class="page-content" :class="{ 'no-navbar': hideNavbar }">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: true
  },
  hideNavbar: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

const handleBack = () => {
  router.back()
}
</script>

<style scoped>
.page-layout {
  width: 100%;
  max-width: 428px;
  min-height: 100vh;
  margin: 0 auto;
  background: linear-gradient(180deg, #0B0E11 0%, #0F1215 50%, #0B0E11 100%);
}

/* Navbar - 币安/欧易级高端毛玻璃效果 */
.navbar {
  height: 56px;
  background: rgba(11, 14, 17, 0.92);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid rgba(212, 175, 55, 0.12);
  position: sticky;
  top: 0;
  z-index: 100;
  padding-top: env(safe-area-inset-top, 0px);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 16px;
  position: relative;
}

.navbar-left {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
}

.navbar-left .back-btn {
  position: relative;
  left: auto;
  top: auto;
  transform: none;
}

.back-btn {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #EAECEF;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.back-btn:active {
  background: rgba(212, 175, 55, 0.15);
  transform: translateY(-50%) scale(0.95);
}

.back-btn svg {
  width: 22px;
  height: 22px;
}

.navbar-title {
  font-size: 18px;
  font-weight: 700;
  color: #EAECEF;
  letter-spacing: -0.3px;
}

.navbar-right {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Page Content */
.page-content {
  min-height: calc(100vh - 56px);
  padding-bottom: env(safe-area-inset-bottom);
}

.page-content.no-navbar {
  min-height: 100vh;
}
</style>
