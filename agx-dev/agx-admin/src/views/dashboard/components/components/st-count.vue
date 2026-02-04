<!--
 - MineAdmin is committed to providing solutions for quickly building web applications
 - Please view the LICENSE file that was distributed with this source code,
 - For the full copyright and license information.
 - Thank you very much for using MineAdmin.
 -
 - @Author X.Mo<root@imoi.cn>
 - @Link   https://gitee.com/xmo/mineadmin-vue
-->
<template>
  <div class="w-full mx-auto">
    <div class="block lg:grid lg:grid-cols-4 lg:gap-2">
      <!-- 用户统计 -->
      <a-card
        style="height: 120px;"
        class="rounded-sm mt-3 lg:col-span-2"
        :body-style="{ padding: 0, height: '120px' }"
        :bordered="false"
        hoverable
      >
        <div class="flex justify-between h-full">
          <div class="en-title-large bg-blue-600">NU</div>
          <div class="w-full ml-4 flex justify-between items-center">
            <div class="text-lg font-medium">用户统计</div>
            <a-space size="large" class="mr-4">
              <div class="text-right">
                <div class="text-gray-500 text-xs">总数</div>
                <div class="stat-number">{{ formatNumber(stats.totalUsers) }}</div>
              </div>
              <div class="text-right">
                <div class="text-gray-500 text-xs">今日新增</div>
                <div class="stat-number stat-success"><icon-caret-up /> {{ formatNumber(stats.todayUsers) }}</div>
              </div>
              <div class="text-right">
                <div class="text-gray-500 text-xs">本周</div>
                <div class="stat-number stat-medium">{{ formatNumber(stats.weekUsers) }}</div>
              </div>
            </a-space>
          </div>
        </div>
      </a-card>
      <!-- 充值统计 -->
      <a-card
        style="height: 65px;"
        class="rounded-sm mt-3 lg:ml-2"
        :body-style="{ padding: 0, height: '65px' }"
        :bordered="false"
        hoverable
      >
        <div class="flex justify-between h-full">
          <div class="en-title bg-green-600">RC</div>
          <div class="w-full ml-3.5 flex justify-between items-center">
            充值统计
            <a-space size="large" class="mr-3">
              <div class="text-right">
                <div class="text-xs text-gray-500">总额</div>
                <div class="stat-number stat-small">{{ formatNumber(stats.totalRecharge) }}</div>
              </div>
              <div class="text-right">
                <div class="text-xs text-gray-500">今日</div>
                <div class="stat-number stat-small stat-success">{{ formatNumber(stats.todayRecharge) }}</div>
              </div>
            </a-space>
          </div>
        </div>
      </a-card>
      <!-- 提现统计 -->
      <a-card
        style="height: 65px;"
        class="rounded-sm mt-3 lg:ml-2"
        :body-style="{ padding: 0, height: '65px' }"
        :bordered="false"
        hoverable
      >
        <div class="flex justify-between h-full">
          <div class="en-title bg-red-600">WD</div>
          <div class="w-full ml-3.5 flex justify-between items-center">
            提现统计
            <a-space size="large" class="mr-3">
              <div class="text-right">
                <div class="text-xs text-gray-500">总额</div>
                <div class="stat-number stat-small">{{ formatNumber(stats.totalWithdraw) }}</div>
              </div>
              <div class="text-right">
                <div class="text-xs text-gray-500">待审</div>
                <div class="stat-number stat-small stat-warning">{{ formatNumber(stats.pendingWithdraw) }}</div>
              </div>
            </a-space>
          </div>
        </div>
      </a-card>
      <!-- 合约统计 -->
      <a-card
        style="height: 65px;"
        class="rounded-sm mt-3 lg:ml-2"
        :body-style="{ padding: 0, height: '65px' }"
        :bordered="false"
        hoverable
      >
        <div class="flex justify-between h-full">
          <div class="en-title bg-purple-600">CT</div>
          <div class="w-full ml-3.5 flex justify-between items-center">
            合约订单
            <a-space size="large" class="mr-3">
              <div class="text-right">
                <div class="text-xs text-gray-500">总数</div>
                <div class="stat-number stat-small">{{ formatNumber(stats.totalOrders) }}</div>
              </div>
              <div class="text-right">
                <div class="text-xs text-gray-500">今日</div>
                <div class="stat-number stat-small">{{ formatNumber(stats.todayOrders) }}</div>
              </div>
            </a-space>
          </div>
        </div>
      </a-card>
      <!-- 平台资产 -->
      <a-card
        style="height: 65px;"
        class="rounded-sm mt-3 lg:ml-2"
        :body-style="{ padding: 0, height: '65px' }"
        :bordered="false"
        hoverable
      >
        <div class="flex justify-between h-full">
          <div class="en-title bg-pink-600">AS</div>
          <div class="w-full ml-3.5 flex justify-between items-center">
            平台资产
            <a-space size="large" class="mr-3">
              <div class="text-right">
                <div class="text-xs text-gray-500">总资产</div>
                <div class="stat-number stat-medium">{{ formatNumber(stats.totalAssets) }}</div>
              </div>
            </a-space>
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import agxApi from '@/api/agx'
import { formatNumber } from '@/utils/format'

const stats = ref({
  totalUsers: 0,
  todayUsers: 0,
  weekUsers: 0,
  totalRecharge: '0',
  todayRecharge: '0',
  totalWithdraw: '0',
  pendingWithdraw: 0,
  totalOrders: 0,
  todayOrders: 0,
  totalAssets: '0'
})

onMounted(async () => {
  try {
    const res = await agxApi.getDashboardStats()
    if (res.code === 0 && res.data) {
      stats.value = { ...stats.value, ...res.data }
    }
  } catch (e) {
    console.error('Failed to load dashboard stats', e)
  }
})
</script>

<style scoped>
.en-title {
  width: 75px; color: #fff; text-align: center;
  line-height: 65px; font-weight: bold; font-size: 1.3em;
  border-radius: 2px 0 0 2px;
}
.en-title-large {
  width: 100px; color: #fff; text-align: center;
  line-height: 120px; font-weight: bold; font-size: 1.8em;
  border-radius: 2px 0 0 2px;
}

/* 数字样式 */
.stat-number {
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  font-size: 24px;
  line-height: 1.2;
  color: #1d2129;
}

.stat-number.stat-medium {
  font-size: 18px;
}

.stat-number.stat-small {
  font-size: 16px;
  font-weight: 500;
}

.stat-number.stat-success {
  color: #00b42a;
}

.stat-number.stat-warning {
  color: #ff7d00;
}

.stat-number.stat-danger {
  color: #f53f3f;
}
</style>