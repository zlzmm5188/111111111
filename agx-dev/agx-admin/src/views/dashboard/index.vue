<!--
 - AGX Admin Dashboard
 - 后台管理仪表盘
-->
<template>
  <a-layout-content class="flex flex-col p-4 lg:p-6">
    <agx-dashboard />
  </a-layout-content>
</template>

<script setup>
import AgxDashboard from './components/agx-dashboard.vue'
</script>
<script>
export default { name: 'dashboard' }
</script>
