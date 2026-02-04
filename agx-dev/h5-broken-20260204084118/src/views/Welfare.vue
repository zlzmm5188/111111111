<template>
  <PageLayout :title="$t('welfare.title') || '矿机福利'" :show-back="true">
    <div class="welfare-page">
      <!-- 福利概览 -->
      <div class="overview-card">
        <div class="overview-item">
          <span class="overview-value">{{ formatNum(stats.totalDividend) }}</span>
          <span class="overview-label">累计分红</span>
        </div>
        <div class="overview-divider"></div>
        <div class="overview-item">
          <span class="overview-value">{{ stats.redpacketCount }}</span>
          <span class="overview-label">已领红包</span>
        </div>
        <div class="overview-divider"></div>
        <div class="overview-item">
          <span class="overview-value">{{ formatNum(stats.totalRebate) }}</span>
          <span class="overview-label">返利收益</span>
        </div>
      </div>

      <!-- Tab切换 -->
      <div class="tab-bar">
        <button v-for="t in tabs" :key="t.key" class="tab-btn" :class="{ active: activeTab === t.key }" @click="activeTab = t.key">
          {{ t.label }}
        </button>
      </div>

      <!-- 浮动分红 -->
      <div v-if="activeTab === 'dividend'" class="tab-content">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
        </div>
        <template v-else-if="dividendList.length">
          <div v-for="item in dividendList" :key="item.id" class="welfare-card dividend">
            <div class="card-header">
              <span class="card-title">{{ item.productName }}</span>
              <span class="card-badge" :class="item.status">{{ item.statusText }}</span>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">分红金额</span>
                <span class="info-value highlight">+{{ item.amount }} USDT</span>
              </div>
              <div class="info-row">
                <span class="info-label">分红日期</span>
                <span class="info-value">{{ item.date }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">持仓数量</span>
                <span class="info-value">{{ item.holdingAmount }} AGX</span>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
          </svg>
          <p>暂无分红记录</p>
          <span class="empty-tip">购买矿机产品即可获得浮动分红</span>
        </div>
      </div>

      <!-- 红包 -->
      <div v-if="activeTab === 'redpacket'" class="tab-content">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
        </div>
        <template v-else>
          <!-- 可领取红包 -->
          <div v-if="availableRedpackets.length" class="redpacket-section">
            <h4 class="section-subtitle">可领取</h4>
            <div v-for="rp in availableRedpackets" :key="rp.id" class="redpacket-card available" @click="claimRedpacket(rp)">
              <div class="rp-left">
                <span class="rp-amount">{{ rp.amount }}</span>
                <span class="rp-unit">USDT</span>
              </div>
              <div class="rp-right">
                <span class="rp-title">{{ rp.title }}</span>
                <span class="rp-expire">{{ rp.expireText }}</span>
              </div>
              <button class="claim-btn">领取</button>
            </div>
          </div>
          <!-- 已领取红包 -->
          <div v-if="claimedRedpackets.length" class="redpacket-section">
            <h4 class="section-subtitle">已领取</h4>
            <div v-for="rp in claimedRedpackets" :key="rp.id" class="redpacket-card claimed">
              <div class="rp-left">
                <span class="rp-amount">{{ rp.amount }}</span>
                <span class="rp-unit">USDT</span>
              </div>
              <div class="rp-right">
                <span class="rp-title">{{ rp.title }}</span>
                <span class="rp-date">{{ rp.claimedAt }}</span>
              </div>
            </div>
          </div>
          <div v-if="!availableRedpackets.length && !claimedRedpackets.length" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8V3M8 3h8"/>
            </svg>
            <p>暂无红包</p>
            <span class="empty-tip">参与活动可获得红包奖励</span>
          </div>
        </template>
      </div>

      <!-- 返利 -->
      <div v-if="activeTab === 'rebate'" class="tab-content">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
        </div>
        <template v-else-if="rebateList.length">
          <div v-for="item in rebateList" :key="item.id" class="welfare-card rebate">
            <div class="card-header">
              <span class="card-title">{{ item.source }}</span>
              <span class="card-time">{{ item.date }}</span>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">返利金额</span>
                <span class="info-value highlight">+{{ item.amount }} USDT</span>
              </div>
              <div class="info-row">
                <span class="info-label">来源用户</span>
                <span class="info-value">{{ item.fromUser }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">返利层级</span>
                <span class="info-value">{{ item.level }}级</span>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <p>暂无返利记录</p>
          <span class="empty-tip">邀请好友购买矿机可获得返利</span>
        </div>
      </div>

      <!-- 双倍积分 -->
      <div v-if="activeTab === 'points'" class="tab-content">
        <div class="points-card">
          <div class="points-header">
            <span class="points-balance">{{ stats.points }}</span>
            <span class="points-label">当前积分</span>
          </div>
          <div class="points-multiplier" v-if="stats.multiplierActive">
            <span class="multiplier-badge">2X</span>
            <span class="multiplier-text">双倍积分进行中</span>
            <span class="multiplier-expire">剩余 {{ stats.multiplierExpire }}</span>
          </div>
        </div>
        <div v-if="pointsHistory.length" class="points-history">
          <h4 class="section-subtitle">积分明细</h4>
          <div v-for="item in pointsHistory" :key="item.id" class="points-item">
            <div class="points-info">
              <span class="points-desc">{{ item.description }}</span>
              <span class="points-time">{{ item.date }}</span>
            </div>
            <span class="points-change" :class="item.amount > 0 ? 'plus' : 'minus'">
              {{ item.amount > 0 ? '+' : '' }}{{ item.amount }}
            </span>
          </div>
        </div>
      </div>

      <!-- 杠杆福利 -->
      <div v-if="activeTab === 'leverage'" class="tab-content">
        <div class="leverage-info">
          <div class="leverage-card">
            <h4>杠杆福利</h4>
            <p>持有矿机产品可享受合约交易杠杆提升</p>
            <div class="leverage-tiers">
              <div class="tier-item">
                <span class="tier-amount">持仓 ≥ 1000 AGX</span>
                <span class="tier-benefit">杠杆 +5x</span>
              </div>
              <div class="tier-item">
                <span class="tier-amount">持仓 ≥ 5000 AGX</span>
                <span class="tier-benefit">杠杆 +10x</span>
              </div>
              <div class="tier-item">
                <span class="tier-amount">持仓 ≥ 10000 AGX</span>
                <span class="tier-benefit">杠杆 +20x</span>
              </div>
            </div>
            <div class="current-benefit" v-if="stats.leverageBonus">
              <span>您当前额外杠杆: </span>
              <span class="benefit-value">+{{ stats.leverageBonus }}x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageLayout from '../components/layout/PageLayout.vue'
import { apiWelfare } from '../utils/api'
import { showSuccess, showError } from '../utils/alert'

const { t } = useI18n()
const router = useRouter()

const loading = ref(true)
const activeTab = ref('dividend')

const tabs = [
  { key: 'dividend', label: '浮动分红' },
  { key: 'redpacket', label: '红包' },
  { key: 'rebate', label: '返利' },
  { key: 'points', label: '双倍积分' },
  { key: 'leverage', label: '杠杆福利' }
]

// 统计数据
const stats = ref({
  totalDividend: 0,
  redpacketCount: 0,
  totalRebate: 0,
  points: 0,
  multiplierActive: false,
  multiplierExpire: '',
  leverageBonus: 0
})

// 列表数据
const dividendList = ref([])
const availableRedpackets = ref([])
const claimedRedpackets = ref([])
const rebateList = ref([])
const pointsHistory = ref([])

const formatNum = (n) => {
  if (!n) return '0.00'
  return parseFloat(n).toFixed(2)
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const [statsRes, dividendRes, redpacketRes, rebateRes, pointsRes] = await Promise.all([
      apiWelfare.getStats(),
      apiWelfare.getDividends(),
      apiWelfare.getRedpackets(),
      apiWelfare.getRebates(),
      apiWelfare.getPointsHistory()
    ])

    if (statsRes.success) stats.value = { ...stats.value, ...statsRes.data }
    if (dividendRes.success) dividendList.value = dividendRes.data || []
    if (redpacketRes.success) {
      availableRedpackets.value = (redpacketRes.data || []).filter(r => !r.claimed)
      claimedRedpackets.value = (redpacketRes.data || []).filter(r => r.claimed)
    }
    if (rebateRes.success) rebateList.value = rebateRes.data || []
    if (pointsRes.success) pointsHistory.value = pointsRes.data || []
  } catch (e) {
    console.error('加载福利数据失败:', e)
  } finally {
    loading.value = false
  }
}

// 领取红包
const claimRedpacket = async (rp) => {
  try {
    const res = await apiWelfare.claimRedpacket(rp.id)
    if (res.success) {
      showSuccess(`领取成功: +${rp.amount} USDT`)
      loadData()
    } else {
      showError(res.message || '领取失败')
    }
  } catch (e) {
    showError('领取失败')
  }
}

onMounted(loadData)
</script>

<style scoped>
.welfare-page { padding: 16px; padding-bottom: 100px; }

.overview-card {
  display: flex;
  align-items: center;
  background: linear-gradient(145deg, rgba(200,170,110,0.15), rgba(200,170,110,0.05));
  border: 1px solid rgba(200,170,110,0.2);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}
.overview-item { flex: 1; text-align: center; }
.overview-value { display: block; font-size: 20px; font-weight: 700; color: #C8AA6E; }
.overview-label { font-size: 12px; color: #8B949E; margin-top: 4px; }
.overview-divider { width: 1px; height: 40px; background: rgba(200,170,110,0.2); }

.tab-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.tab-btn {
  flex-shrink: 0;
  padding: 10px 16px;
  background: rgba(48,54,61,0.3);
  border: 1px solid rgba(48,54,61,0.5);
  border-radius: 20px;
  font-size: 13px;
  color: #8B949E;
  white-space: nowrap;
}
.tab-btn.active {
  background: linear-gradient(135deg, #C8AA6E, #A08050);
  border-color: transparent;
  color: #0D1117;
  font-weight: 600;
}

.tab-content { min-height: 300px; }

.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px;
}
.loading-spinner {
  width: 32px; height: 32px;
  border: 3px solid rgba(200,170,110,0.2);
  border-top-color: #C8AA6E;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.welfare-card {
  background: rgba(30,38,50,0.6);
  border: 1px solid rgba(48,54,61,0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.card-title { font-size: 15px; font-weight: 600; color: #E6EDF3; }
.card-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}
.card-badge.completed { background: rgba(35,134,54,0.2); color: #3FB950; }
.card-badge.pending { background: rgba(200,170,110,0.2); color: #C8AA6E; }
.card-time { font-size: 12px; color: #6E7681; }

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(48,54,61,0.2);
}
.info-row:last-child { border-bottom: none; }
.info-label { font-size: 13px; color: #8B949E; }
.info-value { font-size: 13px; color: #E6EDF3; }
.info-value.highlight { color: #3FB950; font-weight: 600; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}
.empty-state svg { width: 64px; height: 64px; color: #21262D; margin-bottom: 16px; }
.empty-state p { font-size: 15px; color: #8B949E; margin: 0 0 8px; }
.empty-tip { font-size: 12px; color: #6E7681; }

.section-subtitle {
  font-size: 13px; color: #8B949E;
  margin: 0 0 12px; padding-bottom: 8px;
  border-bottom: 1px solid rgba(48,54,61,0.3);
}

.redpacket-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, rgba(220,38,38,0.1), rgba(220,38,38,0.05));
  border: 1px solid rgba(220,38,38,0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
}
.redpacket-card.claimed {
  background: rgba(48,54,61,0.3);
  border-color: rgba(48,54,61,0.5);
  opacity: 0.7;
}
.rp-left { text-align: center; min-width: 70px; }
.rp-amount { font-size: 24px; font-weight: 700; color: #DC2626; }
.redpacket-card.claimed .rp-amount { color: #8B949E; }
.rp-unit { display: block; font-size: 11px; color: #8B949E; }
.rp-right { flex: 1; }
.rp-title { display: block; font-size: 14px; font-weight: 600; color: #E6EDF3; }
.rp-expire, .rp-date { font-size: 12px; color: #6E7681; }
.claim-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #DC2626, #B91C1C);
  border: none;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.points-card {
  background: linear-gradient(145deg, rgba(200,170,110,0.15), rgba(200,170,110,0.05));
  border: 1px solid rgba(200,170,110,0.2);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  margin-bottom: 20px;
}
.points-balance { font-size: 36px; font-weight: 700; color: #C8AA6E; }
.points-label { display: block; font-size: 13px; color: #8B949E; margin-top: 4px; }
.points-multiplier {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(200,170,110,0.2);
}
.multiplier-badge {
  padding: 4px 10px;
  background: linear-gradient(135deg, #C8AA6E, #A08050);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #0D1117;
}
.multiplier-text { font-size: 13px; color: #E6EDF3; }
.multiplier-expire { font-size: 12px; color: #8B949E; }

.points-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(48,54,61,0.2);
}
.points-desc { font-size: 13px; color: #E6EDF3; }
.points-time { font-size: 11px; color: #6E7681; display: block; margin-top: 2px; }
.points-change { font-size: 15px; font-weight: 600; }
.points-change.plus { color: #3FB950; }
.points-change.minus { color: #F85149; }

.leverage-card {
  background: rgba(30,38,50,0.6);
  border: 1px solid rgba(48,54,61,0.3);
  border-radius: 16px;
  padding: 20px;
}
.leverage-card h4 { font-size: 16px; color: #E6EDF3; margin: 0 0 8px; }
.leverage-card p { font-size: 13px; color: #8B949E; margin: 0 0 16px; }
.leverage-tiers { display: flex; flex-direction: column; gap: 10px; }
.tier-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: rgba(48,54,61,0.3);
  border-radius: 8px;
}
.tier-amount { font-size: 13px; color: #8B949E; }
.tier-benefit { font-size: 14px; font-weight: 600; color: #C8AA6E; }
.current-benefit {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(48,54,61,0.3);
  text-align: center;
  font-size: 14px;
  color: #8B949E;
}
.benefit-value { color: #3FB950; font-weight: 700; font-size: 18px; }
</style>
