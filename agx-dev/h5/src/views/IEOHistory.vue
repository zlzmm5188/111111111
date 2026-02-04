<template>
  <PageLayout title="申购记录" :show-back="true">
    <div class="page-content">
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-label">参与次数</div>
          <div class="stat-value">{{ stats.total }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">中签次数</div>
          <div class="stat-value success">{{ stats.won }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">总投入</div>
          <div class="stat-value">{{ stats.totalPay }} USDT</div>
        </div>
      </div>

      <!-- 筛选标签 -->
      <div class="filter-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 记录列表 -->
      <div class="records-list">
        <div 
          v-for="record in filteredRecords" 
          :key="record.id"
          class="record-card"
        >
          <div class="record-header">
            <div class="record-coin">
              <img :src="record.logo || defaultLogo" alt="">
              <div class="coin-info">
                <h4>{{ record.coinSymbol }}</h4>
                <span>{{ record.coinName }}</span>
              </div>
            </div>
            <div class="record-status" :class="getStatusClass(record.status)">
              {{ getStatusText(record.status) }}
            </div>
          </div>

          <div class="record-info">
            <div class="info-row">
              <span class="label">申购数量</span>
              <span class="value">{{ record.buyAmount }} {{ record.coinSymbol }}</span>
            </div>
            <div class="info-row">
              <span class="label">支付金额</span>
              <span class="value">{{ record.payAmount }} USDT</span>
            </div>
            <div class="info-row" v-if="record.status === 2 || record.status === 4">
              <span class="label">中签数量</span>
              <span class="value success">{{ record.winAmount }} {{ record.coinSymbol }}</span>
            </div>
            <div class="info-row" v-if="record.status === 3 || record.status === 5">
              <span class="label">退款金额</span>
              <span class="value">{{ record.refundAmount || record.payAmount }} USDT</span>
            </div>
            <div class="info-row">
              <span class="label">申购时间</span>
              <span class="value time">{{ formatDate(record.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-if="filteredRecords.length === 0 && !loading">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#3a3f47" stroke-width="1">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          <p>暂无记录</p>
        </div>

        <!-- 加载状态 -->
        <div class="loading-state" v-if="loading">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PageLayout from '../components/layout/PageLayout.vue'
import { api } from '../utils/api'
import { alert } from '../utils/alert'

const defaultLogo = 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'

const records = ref([])
const loading = ref(false)
const activeTab = ref('all')

const tabs = [
  { label: '全部', value: 'all' },
  { label: '待开奖', value: 'pending' },
  { label: '已中签', value: 'won' },
  { label: '未中签', value: 'lost' },
  { label: '已完成', value: 'completed' }
]

// IEO状态: 0-待开奖, 1-已冻结待开奖, 2-已中签待发币, 3-未中签待退款, 4-已发币完成, 5-已退款完成
const statusMap = {
  0: { text: '待开奖', class: 'pending' },
  1: { text: '待开奖', class: 'pending' },
  2: { text: '已中签', class: 'won' },
  3: { text: '未中签', class: 'lost' },
  4: { text: '已发币', class: 'completed' },
  5: { text: '已退款', class: 'refunded' },
  6: { text: '已取消', class: 'cancelled' }
}

const stats = computed(() => {
  const total = records.value.length
  const won = records.value.filter(r => r.status === 2 || r.status === 4).length
  const totalPay = records.value.reduce((sum, r) => sum + parseFloat(r.payAmount || 0), 0).toFixed(2)
  return { total, won, totalPay }
})

const filteredRecords = computed(() => {
  if (activeTab.value === 'all') return records.value
  if (activeTab.value === 'pending') return records.value.filter(r => r.status === 0 || r.status === 1)
  if (activeTab.value === 'won') return records.value.filter(r => r.status === 2 || r.status === 4)
  if (activeTab.value === 'lost') return records.value.filter(r => r.status === 3 || r.status === 5)
  if (activeTab.value === 'completed') return records.value.filter(r => r.status === 4 || r.status === 5)
  return records.value
})

const loadRecords = async () => {
  loading.value = true
  try {
    const response = await api.trade.getMyIeoSubscriptions()
    if (response.success) {
      records.value = response.data.list || []
    } else {
      alert(response.message || '加载失败')
    }
  } catch (error) {
    console.error('加载申购记录失败:', error)
    alert(error.message || '加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const getStatusText = (status) => statusMap[status]?.text || '未知'
const getStatusClass = (status) => statusMap[status]?.class || ''

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${min}`
}

onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
.page-content {
  min-height: calc(100vh - 44px);
  background: linear-gradient(180deg, var(--bg-base, #0B0E11) 0%, var(--bg-base-deep, #0F172A) 100%);
  padding: 16px;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: rgba(24,26,32,0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 16px;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #5E6673;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #EAECEF;
}

.stat-value.success {
  color: #22C55E;
}

/* 筛选标签 */
.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding: 0 4px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tabs button {
  flex-shrink: 0;
  padding: 8px 16px;
  font-size: 13px;
  color: #848E9C;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-tabs button:hover {
  color: #EAECEF;
  background: rgba(255,255,255,0.05);
}

.filter-tabs button.active {
  color: #C8AA6E;
  background: rgba(200,170,110,0.12);
  border-color: rgba(200,170,110,0.25);
}

/* 记录列表 */
.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-card {
  background: rgba(24,26,32,0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 16px;
  transition: all 0.2s ease;
}

.record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.record-coin {
  display: flex;
  align-items: center;
  gap: 10px;
}

.record-coin img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.coin-info h4 {
  font-size: 15px;
  font-weight: 700;
  color: #EAECEF;
  margin: 0 0 2px 0;
}

.coin-info span {
  font-size: 11px;
  color: #5E6673;
}

.record-status {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 12px;
}

.record-status.pending {
  color: #C8AA6E;
  background: rgba(200,170,110,0.12);
}

.record-status.won {
  color: #22C55E;
  background: rgba(34,197,94,0.12);
}

.record-status.lost {
  color: #848E9C;
  background: rgba(132,142,156,0.1);
}

.record-status.completed {
  color: #3B82F6;
  background: rgba(59,130,246,0.12);
}

.record-status.refunded {
  color: #848E9C;
  background: rgba(132,142,156,0.1);
}

.record-status.cancelled {
  color: #EF4444;
  background: rgba(239,68,68,0.12);
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.info-row .label {
  color: #5E6673;
}

.info-row .value {
  color: #EAECEF;
  font-weight: 500;
}

.info-row .value.success {
  color: #22C55E;
}

.info-row .value.time {
  color: #848E9C;
  font-size: 12px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: #5E6673;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: #5E6673;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(200,170,110,0.2);
  border-top-color: #C8AA6E;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 14px;
  margin: 0;
}
</style>
