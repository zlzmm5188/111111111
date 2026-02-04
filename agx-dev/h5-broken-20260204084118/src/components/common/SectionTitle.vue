<template>
  <div class="section-title">
    <div class="title-left">
      <span class="title-icon" v-if="icon">{{ icon }}</span>
      <span class="title-text">{{ title }}</span>
      <span class="title-badge" v-if="badge" :class="badgeType">{{ badge }}</span>
    </div>
    <div class="title-right" v-if="showMore || $slots.right">
      <slot name="right">
        <button class="more-btn" @click="$emit('more')">
          <span>{{ moreText }}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  badge: { type: String, default: '' },
  badgeType: { type: String, default: 'default' }, // default, hot, new
  showMore: { type: Boolean, default: false },
  moreText: { type: String, default: '更多' }
})

defineEmits(['more'])
</script>

<style scoped>
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.title-icon {
  font-size: 16px;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

.title-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(240, 185, 11, 0.1);
  color: #C8AA6E;
}

.title-badge.hot {
  background: rgba(246, 70, 93, 0.1);
  color: #F6465D;
}

.title-badge.new {
  background: rgba(14, 203, 129, 0.1);
  color: #0ECB81;
}

.title-right {
  display: flex;
  align-items: center;
}

.more-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  background: transparent;
  border: none;
  font-size: 12px;
  color: var(--text-secondary, #848E9C);
  cursor: pointer;
}

.more-btn:active {
  opacity: 0.7;
}

.more-btn svg {
  color: var(--text-tertiary, #5E6673);
}
</style>
