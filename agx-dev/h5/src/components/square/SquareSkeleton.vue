<template>
  <div class="skeleton-wrapper">
    <div v-for="i in count" :key="i" class="skeleton-post">
      <div class="skeleton-header">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-info">
          <div class="skeleton-name"></div>
          <div class="skeleton-time"></div>
        </div>
      </div>
      <div class="skeleton-content">
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
      </div>
      <div class="skeleton-actions">
        <div class="skeleton-btn"></div>
        <div class="skeleton-btn"></div>
        <div class="skeleton-btn"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ count: { type: Number, default: 3 } })
</script>

<style scoped>
.skeleton-wrapper { padding: 0 12px; }
.skeleton-post {
  background: linear-gradient(145deg, rgba(30, 38, 50, 0.95), rgba(22, 27, 34, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  animation: pulse 1.5s ease-in-out infinite;
}
.skeleton-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.skeleton-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(90deg, #1e2630 25%, #2d3540 50%, #1e2630 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.skeleton-info { flex: 1; }
.skeleton-name { width: 80px; height: 16px; border-radius: 4px; background: linear-gradient(90deg, #1e2630 25%, #2d3540 50%, #1e2630 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; margin-bottom: 8px; }
.skeleton-time { width: 60px; height: 12px; border-radius: 4px; background: linear-gradient(90deg, #1e2630 25%, #2d3540 50%, #1e2630 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.skeleton-content { margin-bottom: 12px; }
.skeleton-text { width: 100%; height: 14px; border-radius: 4px; background: linear-gradient(90deg, #1e2630 25%, #2d3540 50%, #1e2630 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; margin-bottom: 8px; }
.skeleton-text.short { width: 70%; }
.skeleton-actions { display: flex; gap: 16px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.06); }
.skeleton-btn { width: 40px; height: 20px; border-radius: 4px; background: linear-gradient(90deg, #1e2630 25%, #2d3540 50%, #1e2630 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
</style>
