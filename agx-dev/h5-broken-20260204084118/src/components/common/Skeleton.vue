<template>
  <div class="skeleton-wrapper">
    <!-- 预设：币种列表项 -->
    <template v-if="type === 'coin-list'">
      <div class="skeleton-coin-item" v-for="i in count" :key="i">
        <div class="skeleton skeleton-avatar"></div>
        <div class="skeleton-info">
          <div class="skeleton skeleton-text short"></div>
          <div class="skeleton skeleton-text" style="width: 40%"></div>
        </div>
        <div class="skeleton skeleton-button"></div>
      </div>
    </template>

    <!-- 预设：卡片 -->
    <template v-else-if="type === 'card'">
      <div class="skeleton-card" v-for="i in count" :key="i">
        <div class="skeleton skeleton-text medium"></div>
        <div class="skeleton skeleton-text short"></div>
        <div class="skeleton skeleton-text"></div>
      </div>
    </template>

    <!-- 预设：资产卡片 -->
    <template v-else-if="type === 'asset'">
      <div class="skeleton-asset">
        <div class="skeleton skeleton-text" style="width: 30%"></div>
        <div class="skeleton" style="width: 60%; height: 32px; margin: 12px 0"></div>
        <div class="skeleton-row">
          <div class="skeleton skeleton-text" style="width: 25%"></div>
          <div class="skeleton skeleton-text" style="width: 25%"></div>
          <div class="skeleton skeleton-text" style="width: 25%"></div>
        </div>
      </div>
    </template>

    <!-- 预设：帖子列表 -->
    <template v-else-if="type === 'post'">
      <div class="skeleton-post" v-for="i in count" :key="i">
        <div class="skeleton-post-header">
          <div class="skeleton skeleton-avatar"></div>
          <div class="skeleton-info">
            <div class="skeleton skeleton-text" style="width: 100px"></div>
            <div class="skeleton skeleton-text" style="width: 60px; height: 10px"></div>
          </div>
        </div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text medium"></div>
        <div class="skeleton skeleton-text short"></div>
      </div>
    </template>

    <!-- 默认：行 -->
    <template v-else>
      <div class="skeleton skeleton-text" :style="{ width: width }" v-for="i in count" :key="i"></div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'default' }, // coin-list, card, asset, post, default
  count: { type: Number, default: 3 },
  width: { type: String, default: '100%' }
})
</script>

<style scoped>
.skeleton-wrapper {
  padding: 0;
}

/* 币种列表骨架 */
.skeleton-coin-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.skeleton-info {
  flex: 1;
}

/* 资产卡片骨架 */
.skeleton-asset {
  padding: 20px;
  background: #1E2329;
  border-radius: 16px;
}

.skeleton-row {
  display: flex;
  gap: 16px;
}

/* 帖子骨架 */
.skeleton-post {
  padding: 16px;
  background: #1E2329;
  border-radius: 12px;
  margin-bottom: 12px;
}

.skeleton-post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

/* 卡片骨架 */
.skeleton-card {
  padding: 16px;
  background: #1E2329;
  border-radius: 12px;
  margin-bottom: 12px;
}

/* 基础骨架样式（从animations.css引用） */
.skeleton {
  background: linear-gradient(
    90deg,
    #1E2329 0%,
    #2B3139 25%,
    #1E2329 50%,
    #2B3139 75%,
    #1E2329 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-text {
  height: 14px;
  margin-bottom: 8px;
}

.skeleton-text.short { width: 60%; }
.skeleton-text.medium { width: 80%; }

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-button {
  width: 80px;
  height: 32px;
  border-radius: 6px;
  flex-shrink: 0;
}

@keyframes skeleton-loading {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
