<template>
  <header class="page-header-simple">
    <div class="logo-section">
      <span class="logo-icon">AGX</span>
      <span class="site-name">社区广场</span>
    </div>
    <div class="header-actions-simple">
      <button class="header-btn-simple" @click="refreshData">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6"/>
        </svg>
      </button>
      <button class="header-btn-simple" @click="goSearch">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
const emit = defineEmits(['refresh', 'goSearch'])
defineEmits(['click'])
</script>

<style scoped>
.page-header-simple {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(135deg, #1A1A1F 0%, #2A2C2C2 0%, #161C24 0%, #0F0F0F 0%);
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  border-radius: 7px;
  color: #0a0c10;
}

.site-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-left: 8px;
}

.header-actions-simple {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn-simple {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 6px;
  padding: 6px 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.header-btn-simple:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.05);
}
</style>
