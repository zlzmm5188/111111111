<template>
  <div class="loading-state" :class="[size, { fullscreen, overlay }]">
    <div class="loading-content">
      <!-- 骨架屏模式 -->
      <template v-if="skeleton">
        <div class="skeleton-wrapper">
          <slot name="skeleton">
            <div class="skeleton-default">
              <div class="skeleton-avatar"></div>
              <div class="skeleton-lines">
                <div class="skeleton-line skeleton-line--long"></div>
                <div class="skeleton-line skeleton-line--short"></div>
              </div>
            </div>
          </slot>
        </div>
      </template>
      
      <!-- 普通加载模式 -->
      <template v-else>
        <div class="spinner" :class="type">
          <template v-if="type === 'dots'">
            <span></span><span></span><span></span>
          </template>
        </div>
        <p class="loading-text" v-if="text">{{ text }}</p>
      </template>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm, md, lg
  type: { type: String, default: 'spin' }, // spin, dots, pulse
  fullscreen: { type: Boolean, default: false },
  overlay: { type: Boolean, default: false },
  skeleton: { type: Boolean, default: false }
})
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl) var(--space-xl);
}

.loading-state.fullscreen {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: var(--bg-primary);
}

.loading-state.overlay {
  position: absolute;
  inset: 0;
  background: var(--modal-backdrop);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

/* Spinner */
.spinner {
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner.spin {
  border: 2px solid rgba(201, 169, 98, 0.2);
  border-top-color: var(--color-brand);
}

/* 尺寸 */
.loading-state.sm .spinner {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.loading-state.md .spinner {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

.loading-state.lg .spinner {
  width: 48px;
  height: 48px;
  border-width: 4px;
}

/* Dots类型 */
.spinner.dots {
  width: auto;
  height: auto;
  border: none;
  display: flex;
  gap: 6px;
  animation: none;
}

.spinner.dots span {
  width: 8px;
  height: 8px;
  background: var(--color-brand);
  border-radius: 50%;
  animation: dots-bounce 1.4s ease-in-out infinite both;
}

.spinner.dots span:nth-child(1) { animation-delay: -0.32s; }
.spinner.dots span:nth-child(2) { animation-delay: -0.16s; }
.spinner.dots span:nth-child(3) { animation-delay: 0s; }

@keyframes dots-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Pulse类型 */
.spinner.pulse {
  border: none;
  background: var(--color-brand);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1); opacity: 1; }
}

.loading-text {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin: 0;
}

/* 骨架屏样式 */
.skeleton-wrapper {
  width: 100%;
}

.skeleton-default {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--bg-card);
  border-radius: var(--radius-md);
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gradient-skeleton);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.skeleton-line {
  height: 14px;
  border-radius: var(--radius-xs);
  background: var(--gradient-skeleton);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-line--long { width: 100%; }
.skeleton-line--short { width: 60%; }

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
