<template>
  <div class="empty-state">
    <div class="empty-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 15s1.5-2 4-2 4 2 4 2"/>
      </svg>
    </div>
    <p class="empty-title">{{ title }}</p>
    <p v-if="hint" class="empty-hint">{{ hint }}</p>
    <button v-if="action" class="btn-primary" @click="(action)">{{ action }}</button>
  </div>
</template>

<script setup>
defineProps({ title: { type: String, default: 暂无内容 }, hint: { type: String, default:  }, action: { type: String, default:  } })
defineEmits([action])
</script>

<style scoped>
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; text-align: center; }
.empty-icon { width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; background: rgba(200, 170, 110, 0.1); border-radius: 50%; }
.empty-icon svg { width: 32px; height: 32px; color: #C8AA6E; }
.empty-title { font-size: 15px; font-weight: 500; color: #8B949E; margin: 0 0 8px; }
.empty-hint { font-size: 13px; color: #484F58; margin: 0 0 24px; }
.btn-primary { padding: 12px 28px; font-size: 14px; font-weight: 600; color: #0a0c10; background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%); border: none; border-radius: 20px; cursor: pointer; }
</style>
