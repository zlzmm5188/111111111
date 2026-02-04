<template>
  <button 
    class="action-button" 
    :class="[type, size, { block, loading, disabled: disabled || loading }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span class="btn-loading" v-if="loading">
      <span class="spinner"></span>
    </span>
    <slot v-else>
      <span class="btn-icon" v-if="icon">{{ icon }}</span>
      <span class="btn-text">{{ text }}</span>
    </slot>
  </button>
</template>

<script setup>
defineProps({
  text: { type: String, default: '' },
  icon: { type: String, default: '' },
  type: { type: String, default: 'primary' }, // primary, secondary, success, danger, ghost
  size: { type: String, default: 'md' }, // sm, md, lg
  block: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

defineEmits(['click'])
</script>

<style scoped>
.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

/* 尺寸 */
.action-button.sm {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
  border-radius: 6px;
}

.action-button.md {
  height: 44px;
  padding: 0 20px;
  font-size: 15px;
}

.action-button.lg {
  height: 52px;
  padding: 0 24px;
  font-size: 16px;
  border-radius: 12px;
}

/* 块级 */
.action-button.block {
  display: flex;
  width: 100%;
}

/* 类型 */
.action-button.primary {
  background: linear-gradient(135deg, #C8AA6E 0%, #D4A00A 100%);
  color: #0B0E11;
}

.action-button.primary:active {
  background: #D4A00A;
  transform: scale(0.98);
}

.action-button.secondary {
  background: rgba(240, 185, 11, 0.1);
  color: #C8AA6E;
  border: 1px solid rgba(240, 185, 11, 0.3);
}

.action-button.secondary:active {
  background: rgba(240, 185, 11, 0.2);
}

.action-button.success {
  background: #0ECB81;
  color: white;
}

.action-button.success:active {
  background: #0BB374;
  transform: scale(0.98);
}

.action-button.danger {
  background: #F6465D;
  color: white;
}

.action-button.danger:active {
  background: #D93B4F;
  transform: scale(0.98);
}

.action-button.ghost {
  background: transparent;
  color: var(--text-secondary, #848E9C);
}

.action-button.ghost:active {
  background: rgba(255, 255, 255, 0.05);
}

/* 禁用状态 */
.action-button.disabled,
.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Loading */
.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.action-button.primary .spinner {
  border: 2px solid rgba(11, 14, 17, 0.3);
  border-top-color: #0B0E11;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-icon {
  font-size: 1.1em;
}
</style>
