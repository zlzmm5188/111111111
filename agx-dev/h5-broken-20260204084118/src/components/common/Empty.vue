<template>
  <div class="empty-state">
    <div class="empty-icon">
      <slot name="icon">
        <svg v-if="type === 'data'" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
        <svg v-else-if="type === 'search'" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <svg v-else-if="type === 'network'" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M8.56 2.75a9 9 0 1 0 6.89 0"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <span v-else class="emoji-icon">{{ emoji }}</span>
      </slot>
    </div>
    <p class="empty-text">{{ text }}</p>
    <p class="empty-desc" v-if="description">{{ description }}</p>
    <div class="empty-action" v-if="actionText">
      <button class="action-btn" @click="$emit('action')">{{ actionText }}</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: '暂无数据' },
  description: { type: String, default: '' },
  type: { type: String, default: 'data' }, // data, search, network, custom
  emoji: { type: String, default: '📭' },
  actionText: { type: String, default: '' }
})

defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
  color: var(--text-tertiary, #5E6673);
}

.emoji-icon {
  font-size: 48px;
  display: block;
}

.empty-text {
  font-size: 15px;
  color: var(--text-secondary, #848E9C);
  margin: 0 0 6px 0;
}

.empty-desc {
  font-size: 13px;
  color: var(--text-tertiary, #5E6673);
  margin: 0 0 16px 0;
  max-width: 240px;
}

.empty-action {
  margin-top: 8px;
}

.action-btn {
  padding: 10px 24px;
  background: rgba(240, 185, 11, 0.1);
  border: 1px solid rgba(240, 185, 11, 0.3);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #C8AA6E;
  cursor: pointer;
}

.action-btn:active {
  background: rgba(240, 185, 11, 0.2);
}
</style>
