<template>
  <div class="task-card" :class="taskClass">
    <div class="task-status-indicator">
      <div class="status-dot" :class="statusClass">
        <svg v-if="task.status >= 2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        <span v-else class="status-num">{{ index + 1 }}</span>
      </div>
      <div v-if="!isLast" class="status-line" :class="{ active: task.status >= 2 }"></div>
    </div>

    <div class="task-main">
      <div class="task-header">
        <div class="task-info">
          <span class="task-icon" :class="iconClass">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <component :is="'path'" v-for="(d, i) in iconPaths" :key="i" :d="d" />
            </svg>
          </span>
          <span class="task-name">{{ task.name }}</span>
          <span class="task-status-badge" :class="statusClass">{{ statusText }}</span>
        </div>
      </div>

      <p class="task-desc">{{ task.description }}</p>

      <div class="task-rewards">
        <div class="reward-tag agx">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="9"/>
            <path d="M9 12h6M12 9v6"/>
          </svg>
          +{{ task.agxReward }} AGX
        </div>
        <div class="reward-tag usdt">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="9"/>
            <path d="M8 12h8M12 8v8"/>
          </svg>
          +{{ task.usdtReward }} USDT
        </div>
      </div>

      <!-- 白皮书阅读区（仅任务3显示） -->
      <slot name="extra"></slot>

      <div class="task-action">
        <button v-if="task.status === 0" class="action-btn go-btn" @click="$emit('go', task)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          {{ task.taskKey === 'readWhitepaper' ? '开始任务' : '去完成' }}
        </button>
        <button
          v-else-if="task.status === 1"
          class="action-btn claim-btn"
          :disabled="claiming"
          @click="$emit('claim', task.taskKey)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          {{ claiming ? '领取中...' : '领取奖励' }}
        </button>
        <div v-else class="action-done">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          已完成
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: { type: Object, required: true },
  index: { type: Number, required: true },
  isLast: { type: Boolean, default: false },
  claiming: { type: Boolean, default: false }
})

defineEmits(['go', 'claim'])

const taskClass = computed(() => {
  if (props.task.status >= 2) return 'task-completed'
  if (props.task.status === 1) return 'task-claimable'
  return 'task-pending'
})

const statusClass = computed(() => {
  if (props.task.status >= 2) return 'done'
  if (props.task.status === 1) return 'claimable'
  return 'pending'
})

const statusText = computed(() => {
  if (props.task.status >= 2) return '已完成'
  if (props.task.status === 1) return '待领取'
  return '进行中'
})

// 根据任务类型返回对应图标路径
const iconClass = computed(() => {
  const map = {
    completeKyc: 'kyc-icon',
    bindAddress: 'wallet-icon',
    readWhitepaper: 'book-icon',
    shareInvite: 'share-icon'
  }
  return map[props.task.taskKey] || ''
})

const iconPaths = computed(() => {
  const icons = {
    completeKyc: ['M4 4h16v16H4z', 'M9 10a2 2 0 104 0 2 2 0 00-4 0', 'M7 16c0-2 2-3 5-3s5 1 5 3'],
    bindAddress: ['M3 6h18v12H3z', 'M3 10h18', 'M16 14h.01'],
    readWhitepaper: ['M4 19.5A2.5 2.5 0 016.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z', 'M9 7h6M9 11h6M9 15h4'],
    shareInvite: ['M18 8a3 3 0 100-6 3 3 0 000 6z', 'M6 15a3 3 0 100-6 3 3 0 000 6z', 'M18 22a3 3 0 100-6 3 3 0 000 6z', 'M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98']
  }
  return icons[props.task.taskKey] || ['M12 2l10 10-10 10L2 12z']
})
</script>

<style scoped>
.task-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.task-card.task-claimable {
  border-color: rgba(212, 175, 55, 0.4);
  background: rgba(212, 175, 55, 0.08);
}

.task-card.task-completed {
  opacity: 0.7;
}

.task-status-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.status-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.status-dot.pending {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.status-dot.claimable {
  background: rgba(212, 175, 55, 0.2);
  border-color: var(--color-brand, #C8AA6E);
}

.status-dot.done {
  background: rgba(14, 203, 129, 0.2);
  border-color: var(--color-up, #0ECB81);
}

.status-dot svg {
  width: 16px;
  height: 16px;
  color: var(--color-up, #0ECB81);
}

.status-num {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-tertiary, #848E9C);
}

.status-dot.claimable .status-num {
  color: var(--color-brand, #C8AA6E);
}

.status-line {
  width: 2px;
  flex: 1;
  min-height: 60px;
  background: rgba(255, 255, 255, 0.1);
  margin-top: 8px;
  border-radius: 1px;
}

.status-line.active {
  background: var(--color-up, #0ECB81);
}

.task-main {
  flex: 1;
  min-width: 0;
}

.task-header {
  margin-bottom: 8px;
}

.task-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.task-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  flex-shrink: 0;
}

.task-icon svg {
  width: 18px;
  height: 18px;
  color: var(--color-brand, #C8AA6E);
}

.task-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary, #EAECEF);
}

.task-status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 10px;
}

.task-status-badge.pending {
  color: var(--text-tertiary, #848E9C);
  background: rgba(255, 255, 255, 0.1);
}

.task-status-badge.claimable {
  color: var(--color-brand, #C8AA6E);
  background: rgba(212, 175, 55, 0.15);
}

.task-status-badge.done {
  color: var(--color-up, #0ECB81);
  background: rgba(14, 203, 129, 0.15);
}

.task-desc {
  font-size: 13px;
  color: var(--text-tertiary, #848E9C);
  margin-bottom: 12px;
  line-height: 1.5;
}

.task-rewards {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.reward-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
}

.reward-tag svg {
  width: 16px;
  height: 16px;
}

.reward-tag.agx {
  color: var(--color-brand, #C8AA6E);
  background: rgba(212, 175, 55, 0.15);
}

.reward-tag.agx svg {
  color: var(--color-brand, #C8AA6E);
}

.reward-tag.usdt {
  color: var(--color-up, #0ECB81);
  background: rgba(14, 203, 129, 0.15);
}

.reward-tag.usdt svg {
  color: var(--color-up, #0ECB81);
}

.task-action {
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.go-btn {
  background: transparent;
  border: 1px solid rgba(200, 170, 110, 0.4);
  color: var(--color-brand, #C8AA6E);
}

.go-btn:active {
  background: rgba(200, 170, 110, 0.1);
}

.claim-btn {
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), #C8AA6E);
  color: #000;
}

.claim-btn:disabled {
  opacity: 0.6;
}

.claim-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.action-done {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-up, #0ECB81);
}

.action-done svg {
  width: 18px;
  height: 18px;
}
</style>
