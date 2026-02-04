<template>
  <div class="agx-dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">AGX 运营管理中心</h1>
        <p class="welcome-desc">欢迎回来，{{ userStore.user?.username || '管理员' }}</p>
      </div>
      <div class="welcome-time">{{ currentTime }}</div>
    </div>

    <!-- 今日核心数据 -->
    <div class="section-title">今日数据</div>
    <div class="agx-data-panel">
      <div class="agx-stat-card" v-for="stat in todayStats" :key="stat.key">
        <div class="stat-icon" :style="{ background: stat.bgColor }">
          <component :is="stat.icon" />
        </div>
        <div class="stat-info">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">
            {{ stat.value }}
            <span class="stat-suffix" v-if="stat.suffix">{{ stat.suffix }}</span>
          </div>
          <div class="stat-trend" v-if="stat.trend !== undefined">
            <span :class="stat.trend >= 0 ? 'trend-up' : 'trend-down'">
              <icon-arrow-rise v-if="stat.trend >= 0" />
              <icon-arrow-fall v-else />
              {{ Math.abs(stat.trend) }}%
            </span>
            <span class="trend-label">较昨日</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 总体数据概览 -->
    <div class="section-title">总体数据</div>
    <div class="agx-data-panel">
      <div class="agx-stat-card" v-for="stat in totalStats" :key="stat.key">
        <div class="stat-icon" :style="{ background: stat.bgColor }">
          <component :is="stat.icon" />
        </div>
        <div class="stat-info">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">
            {{ stat.value }}
            <span class="stat-suffix" v-if="stat.suffix">{{ stat.suffix }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷操作入口 -->
    <div class="agx-card">
      <div class="agx-card-title">快捷操作</div>
      <div class="agx-quick-entry">
        <div class="entry-item" v-for="entry in quickEntries" :key="entry.path" @click="navigateTo(entry.path)">
          <div class="entry-icon" :style="{ background: entry.bgColor, color: entry.color }">
            <component :is="entry.icon" />
          </div>
          <div class="entry-label">{{ entry.label }}</div>
        </div>
      </div>
    </div>

    <!-- 业务概览 -->
    <div class="dashboard-grid">
      <!-- 待处理事项 -->
      <div class="agx-card">
        <div class="agx-card-title">
          待处理事项
          <a-badge :count="pendingTotal" :max-count="99" :dot="false" style="margin-left: 8px;" />
        </div>
        <div class="pending-list">
          <div class="pending-item" v-for="item in pendingItems" :key="item.key" @click="navigateTo(item.path)">
            <div class="pending-info">
              <span class="pending-label">{{ item.label }}</span>
              <a-badge :count="item.count" :max-count="99" />
            </div>
            <icon-right />
          </div>
          <div class="agx-empty" v-if="pendingItems.length === 0">
            <icon-check-circle class="empty-icon" />
            <span class="empty-text">暂无待处理事项</span>
          </div>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="agx-card">
        <div class="agx-card-title">最近活动</div>
        <div class="activity-list">
          <div class="activity-item" v-for="(activity, index) in recentActivities" :key="index">
            <div class="activity-dot" :class="activity.type"></div>
            <div class="activity-content">
              <div class="activity-text">{{ activity.text }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
          </div>
          <div class="agx-empty" v-if="recentActivities.length === 0">
            <icon-history class="empty-icon" />
            <span class="empty-text">暂无最近活动</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据趋势图表 -->
    <div class="dashboard-grid">
      <div class="agx-card">
        <div class="agx-card-title">用户增长趋势（7日）</div>
        <div class="chart-container" ref="userChartRef"></div>
      </div>
      <div class="agx-card">
        <div class="agx-card-title">充提金额趋势（7日）</div>
        <div class="chart-container" ref="financeChartRef"></div>
      </div>
    </div>

    <!-- 资产分布 -->
    <div class="agx-card">
      <div class="agx-card-title">平台资产分布</div>
      <div class="asset-distribution">
        <div class="asset-item" v-for="asset in assetDistribution" :key="asset.coin">
          <div class="asset-info">
            <span class="asset-coin">{{ asset.coin }}</span>
            <span class="asset-amount">{{ formatNumber(asset.amount, 2) }}</span>
          </div>
          <div class="asset-bar">
            <div class="asset-bar-fill" :style="{ width: asset.percent + '%', background: asset.color }"></div>
          </div>
          <span class="asset-percent">{{ asset.percent.toFixed(1) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store'
import agxApi from '@/api/agx'
import * as echarts from 'echarts'
import { 
  IconUser, IconSwap, IconStar,
  IconRight, IconCheckCircle, IconHistory,
  IconUserGroup, IconSafe, IconSettings, IconFile,
  IconArrowRise, IconArrowFall,
  IconDownload, IconUpload, IconTrophy, IconStorage
} from '@arco-design/web-vue/es/icon'

// 用来替代不存在的图标
const IconMoney = IconDownload
const IconCoinPound = IconStar
const IconMoneyCollect = IconUpload
const IconGold = IconTrophy
const IconRise = IconArrowRise

const router = useRouter()
const userStore = useUserStore()

// 当前时间
const currentTime = ref('')
let timeInterval = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 今日数据
const todayStats = ref([
  { key: 'todayUsers', label: '今日新增用户', value: '0', icon: IconUser, bgColor: 'rgba(24, 144, 255, 0.1)', trend: 0 },
  { key: 'todayRecharge', label: '今日充值', value: '0', suffix: 'USDT', icon: IconDownload, bgColor: 'rgba(82, 196, 26, 0.1)', trend: 0 },
  { key: 'todayWithdraw', label: '今日提现', value: '0', suffix: 'USDT', icon: IconUpload, bgColor: 'rgba(245, 34, 45, 0.1)', trend: 0 },
  { key: 'todayTrade', label: '今日交易', value: '0', suffix: '笔', icon: IconSwap, bgColor: 'rgba(114, 46, 209, 0.1)', trend: 0 }
])

// 总体数据
const totalStats = ref([
  { key: 'users', label: '注册用户', value: '0', icon: IconUserGroup, bgColor: 'rgba(24, 144, 255, 0.1)' },
  { key: 'balance', label: '平台USDT', value: '0', suffix: 'USDT', icon: IconMoney, bgColor: 'rgba(82, 196, 26, 0.1)' },
  { key: 'agx', label: 'AGX发行量', value: '0', suffix: 'AGX', icon: IconCoinPound, bgColor: 'rgba(212, 168, 75, 0.1)' },
  { key: 'pool', label: '矿池持仓', value: '0', suffix: 'USDT', icon: IconRise, bgColor: 'rgba(114, 46, 209, 0.1)' }
])

// 快捷入口
const quickEntries = [
  { label: '用户管理', path: '/user/list', icon: IconUserGroup, bgColor: 'rgba(24, 144, 255, 0.1)', color: '#1890FF' },
  { label: 'KYC审核', path: '/user/kyc', icon: IconSafe, bgColor: 'rgba(250, 173, 20, 0.1)', color: '#FAAD14' },
  { label: '充值管理', path: '/finance/recharge', icon: IconMoney, bgColor: 'rgba(82, 196, 26, 0.1)', color: '#52C41A' },
  { label: '提现审核', path: '/finance/withdraw', icon: IconSwap, bgColor: 'rgba(245, 34, 45, 0.1)', color: '#F5222D' },
  { label: 'AGX预售', path: '/agx/presale', icon: IconCoinPound, bgColor: 'rgba(212, 168, 75, 0.1)', color: '#D4A84B' },
  { label: '矿机订单', path: '/agx/pool-orders', icon: IconTrophy, bgColor: 'rgba(114, 46, 209, 0.1)', color: '#722ED1' },
  { label: '系统配置', path: '/system/params', icon: IconSettings, bgColor: 'rgba(134, 144, 156, 0.1)', color: '#86909C' },
  { label: '操作日志', path: '/system/logs', icon: IconFile, bgColor: 'rgba(78, 89, 105, 0.1)', color: '#4E5969' }
]

// 待处理事项
const pendingItems = ref([])
const pendingTotal = computed(() => pendingItems.value.reduce((sum, item) => sum + item.count, 0))

// 最近活动
const recentActivities = ref([])

// 资产分布
const assetDistribution = ref([])

// 图表引用
const userChartRef = ref(null)
const financeChartRef = ref(null)
let userChart = null
let financeChart = null

// 获取统计数据
const fetchStats = async () => {
  try {
    const res = await agxApi.getDashboardStats()
    if (res.code === 0 && res.data) {
      const data = res.data
      // 今日数据
      todayStats.value[0].value = formatNumber(data.todayUsers || 0)
      todayStats.value[0].trend = data.todayUsersTrend || 0
      todayStats.value[1].value = formatNumber(data.todayRecharge || 0, 2)
      todayStats.value[1].trend = data.todayRechargeTrend || 0
      todayStats.value[2].value = formatNumber(data.todayWithdraw || 0, 2)
      todayStats.value[2].trend = data.todayWithdrawTrend || 0
      todayStats.value[3].value = formatNumber(data.todayOrders || 0)
      todayStats.value[3].trend = data.todayOrdersTrend || 0
      
      // 总体数据
      totalStats.value[0].value = formatNumber(data.totalUsers || 0)
      totalStats.value[1].value = formatNumber(data.totalUsdt || 0, 2)
      totalStats.value[2].value = formatNumber(data.totalAgx || 0, 2)
      totalStats.value[3].value = formatNumber(data.totalPool || 0, 2)
      
      // 资产分布
      if (data.assetDistribution) {
        const colors = ['#1890FF', '#D4A84B', '#52C41A', '#722ED1', '#F5222D']
        const total = data.assetDistribution.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0)
        assetDistribution.value = data.assetDistribution.map((item, index) => ({
          coin: item.coin,
          amount: parseFloat(item.amount || 0),
          percent: total > 0 ? (parseFloat(item.amount || 0) / total * 100) : 0,
          color: colors[index % colors.length]
        }))
      }
    }
  } catch (e) {
    console.error('获取统计数据失败', e)
  }
}

// 获取待处理事项
const fetchPending = async () => {
  try {
    const res = await agxApi.getPendingList()
    if (res.code === 0 && res.data) {
      const data = res.data
      const items = []
      if (data.pendingKyc > 0) items.push({ key: 'kyc', label: 'KYC待审核', count: data.pendingKyc, path: '/user/kyc' })
      if (data.pendingWithdraw > 0) items.push({ key: 'withdraw', label: '提现待处理', count: data.pendingWithdraw, path: '/finance/withdraw' })
      if (data.pendingRecharge > 0) items.push({ key: 'recharge', label: '充值待确认', count: data.pendingRecharge, path: '/finance/recharge' })
      pendingItems.value = items
    }
  } catch (e) {
    console.error('获取待处理事项失败', e)
  }
}

// 获取最近活动
const fetchRecentActivities = async () => {
  try {
    const res = await agxApi.getRecentActivities()
    if (res.code === 0 && res.data) {
      recentActivities.value = res.data.slice(0, 8).map(item => ({
        text: item.content,
        time: item.createdAt,
        type: item.type || 'info'
      }))
    }
  } catch (e) {
    console.error('获取最近活动失败', e)
  }
}

// 初始化图表
const initCharts = async () => {
  try {
    const res = await agxApi.getDashboardCharts()
    if (res.code === 0 && res.data) {
      await nextTick()
      initUserChart(res.data.userTrend || [])
      initFinanceChart(res.data.financeTrend || [])
    }
  } catch (e) {
    console.error('获取图表数据失败', e)
  }
}

// 用户增长图表
const initUserChart = (data) => {
  if (!userChartRef.value) return
  
  if (userChart) {
    userChart.dispose()
  }
  
  userChart = echarts.init(userChartRef.value)
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date),
      axisLine: { lineStyle: { color: '#E5E6EB' } },
      axisLabel: { color: '#86909C' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#F2F3F5' } },
      axisLabel: { color: '#86909C' }
    },
    series: [{
      name: '新增用户',
      type: 'line',
      smooth: true,
      data: data.map(item => item.count),
      itemStyle: { color: '#1890FF' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
          ]
        }
      }
    }]
  }
  userChart.setOption(option)
}

// 充提金额图表
const initFinanceChart = (data) => {
  if (!financeChartRef.value) return
  
  if (financeChart) {
    financeChart.dispose()
  }
  
  financeChart = echarts.init(financeChartRef.value)
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['充值', '提现'], top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date),
      axisLine: { lineStyle: { color: '#E5E6EB' } },
      axisLabel: { color: '#86909C' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#F2F3F5' } },
      axisLabel: { color: '#86909C' }
    },
    series: [
      {
        name: '充值',
        type: 'bar',
        data: data.map(item => item.recharge),
        itemStyle: { color: '#52C41A' }
      },
      {
        name: '提现',
        type: 'bar',
        data: data.map(item => item.withdraw),
        itemStyle: { color: '#F5222D' }
      }
    ]
  }
  financeChart.setOption(option)
}

// 格式化数字
const formatNumber = (num, decimals = 0) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return decimals > 0 ? parseFloat(num).toFixed(decimals) : num.toString()
}

// 页面跳转
const navigateTo = (path) => {
  router.push(path)
}

// 窗口大小变化时重绘图表
const handleResize = () => {
  userChart?.resize()
  financeChart?.resize()
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  fetchStats()
  fetchPending()
  fetchRecentActivities()
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  userChart?.dispose()
  financeChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="less" scoped>
.agx-dashboard {
  padding: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--agx-text-primary);
  margin-bottom: 16px;
  margin-top: 8px;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #D4A84B 0%, #E8C876 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  color: #fff;
  
  .welcome-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }
  
  .welcome-desc {
    font-size: 14px;
    opacity: 0.9;
    margin: 0;
  }
  
  .welcome-time {
    font-size: 14px;
    opacity: 0.85;
  }
}

.agx-data-panel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.agx-stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: var(--agx-bg-primary);
  border-radius: 8px;
  border: 1px solid var(--agx-border-light);
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: var(--agx-primary);
  }
  
  .stat-info {
    flex: 1;
  }
  
  .stat-label {
    font-size: 13px;
    color: var(--agx-text-tertiary);
    margin-bottom: 4px;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--agx-text-primary);
  }
  
  .stat-suffix {
    font-size: 12px;
    color: var(--agx-text-tertiary);
    margin-left: 4px;
  }
  
  .stat-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    margin-top: 4px;
    
    .trend-up {
      color: #52C41A;
      display: flex;
      align-items: center;
      gap: 2px;
    }
    
    .trend-down {
      color: #F5222D;
      display: flex;
      align-items: center;
      gap: 2px;
    }
    
    .trend-label {
      color: var(--agx-text-tertiary);
    }
  }
}

.agx-card {
  background: var(--agx-bg-primary);
  border-radius: 8px;
  border: 1px solid var(--agx-border-light);
  padding: 20px;
  margin-bottom: 16px;
}

.agx-card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--agx-text-primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.agx-quick-entry {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 16px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .entry-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: var(--agx-bg-secondary);
    }
    
    .entry-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      margin-bottom: 8px;
    }
    
    .entry-label {
      font-size: 13px;
      color: var(--agx-text-secondary);
    }
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}

.pending-list {
  .pending-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--agx-border-light);
    cursor: pointer;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      color: var(--agx-primary);
    }
    
    .pending-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .pending-label {
      font-size: 14px;
    }
  }
}

.activity-list {
  max-height: 280px;
  overflow-y: auto;
  
  .activity-item {
    display: flex;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--agx-border-light);
    
    &:last-child {
      border-bottom: none;
    }
    
    .activity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;
      
      &.success { background: var(--agx-success); }
      &.warning { background: var(--agx-warning); }
      &.danger { background: var(--agx-danger); }
      &.info { background: var(--agx-info); }
    }
    
    .activity-content {
      flex: 1;
    }
    
    .activity-text {
      font-size: 14px;
      color: var(--agx-text-primary);
      margin-bottom: 4px;
    }
    
    .activity-time {
      font-size: 12px;
      color: var(--agx-text-tertiary);
    }
  }
}

.chart-container {
  height: 250px;
}

.asset-distribution {
  .asset-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid var(--agx-border-light);
    
    &:last-child {
      border-bottom: none;
    }
    
    .asset-info {
      width: 120px;
      
      .asset-coin {
        font-weight: 600;
        color: var(--agx-text-primary);
      }
      
      .asset-amount {
        display: block;
        font-size: 12px;
        color: var(--agx-text-tertiary);
        margin-top: 2px;
      }
    }
    
    .asset-bar {
      flex: 1;
      height: 8px;
      background: var(--agx-bg-secondary);
      border-radius: 4px;
      overflow: hidden;
      
      .asset-bar-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s;
      }
    }
    
    .asset-percent {
      width: 60px;
      text-align: right;
      font-size: 14px;
      color: var(--agx-text-secondary);
    }
  }
}

.agx-empty {
  padding: 32px 0;
  text-align: center;
  
  .empty-icon {
    font-size: 40px;
    color: var(--agx-text-disabled);
  }
  
  .empty-text {
    display: block;
    margin-top: 8px;
    color: var(--agx-text-tertiary);
  }
}
</style>
