<template>
  <header class="page-header-minimal">
    <div class="logo-section">
      <span class="logo-icon">AGX</span>
    </div>
    <div class="header-actions-minimal">
      <button class="header-btn-minimal" @click="refreshData">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
const emit = defineEmits(['refresh'])
defineEmits(['click', 'refreshData'])
</script>

<style scoped>
.page-header-minimal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(135deg, #161C24 0%, #1A1A1F 0%, #2A2C2C2 0%);
  padding: 8px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(10px);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #0a0c10;
}

.header-actions-minimal {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-btn-minimal {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 6px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.2s;
  color: #C8AA6E;
}

.header-btn-minimal:hover {
  background: rgba(200, 170, 110, 0.2);
  transform: scale(1.05);
}
</style>
