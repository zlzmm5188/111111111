<template>
  <PageLayout title="订单记录" :show-back="true">
    <template #navbar-right>
      <button class="filter-btn" @click="showFilter = !showFilter">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 6h16M6 12h12M8 18h8"/>
        </svg>
      </button>
    </template>

    <div class="page-content">
      <!-- Tab导航 -->
      <div class="tab-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >{{ tab.label }}</button>
      </div>

      <!-- 状态筛选（交易类型） -->
      <div class="status-bar" v-if="['all', 'spot', 'contract', 'ieo', 'pool'].includes(activeTab)">
        <button 
          v-for="s in tradeStatuses" 
          :key="s.key"
          :class="{ active: activeStatus === s.key }"
          @click="switchStatus(s.key)"
        >{{ s.label }}</button>
      </div>

      <!-- 状态筛选（充提类型） -->
      <div class="status-bar" v-if="['deposit', 'withdraw'].includes(activeTab)">
        <button 
          v-for="s in fundStatuses" 
          :key="s.key"
          :class="{ active: activeStatus === s.key }"
          @click="switchStatus(s.key)"
        >{{ s.label }}</button>
      </div>

      <!-- 加载状态 -->
      <div class="loading-state" v-if="loading">
        <div class="loading-spinner"></div>
        <span>{{ $t('common.loading') || '加载中...' }}</span>
      </div>

      <!-- 订单列表 -->
      <div class="order-list" v-else-if="orders.length > 0">
        <div v-for="order in orders" :key="order.id || order.orderNo" class="order-card">
          <div class="card-header">
            <div class="order-info">
              <span :class="['type-badge', order.type]">{{ order.typeLabel }}</span>
              <span class="order-pair">{{ order.pair || order.symbol }}</span>
            </div>
            <span :class="['status-text', order.statusClass]">{{ order.statusLabel }}</span>
          </div>
          
          <div class="card-body">
            <!-- 交易类型 -->
            <template v-if="['spot', 'contract', 'ieo', 'pool'].includes(order.type)">
              <div class="info-row" v-if="order.sideLabel">
                <span class="label">方向</span>
                <span :class="['value', order.sideClass]">{{ order.sideLabel }}</span>
              </div>
              <div class="info-row">
                <span class="label">价格</span>
                <span class="value">{{ order.price || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">数量</span>
                <span class="value">{{ order.amount }}</span>
              </div>
              <div class="info-row" v-if="order.total">
                <span class="label">成交额</span>
                <span class="value highlight">{{ order.total }} USDT</span>
              </div>
              <div class="info-row" v-if="order.profitLoss !== undefined">
                <span class="label">盈亏</span>
                <span :class="['value', order.profitLoss >= 0 ? 'profit' : 'loss']">
                  {{ order.profitLoss >= 0 ? '+' : '' }}{{ order.profitLoss }} USDT
                </span>
              </div>
            </template>
            
            <!-- 黄金收益类型 -->
            <template v-else-if="order.type === 'gold'">
              <div class="info-row">
                <span class="label">黄金收益</span>
                <span class="value profit">+{{ order.amount }} oz</span>
              </div>
              <div class="info-row" v-if="order.agxBalance">
                <span class="label">持有AGX</span>
                <span class="value">{{ order.agxBalance }}</span>
              </div>
              <div class="info-row" v-if="order.goldPrice">
                <span class="label">金价</span>
                <span class="value">${{ order.goldPrice }}/oz</span>
              </div>
            </template>
            
            <!-- 充值/提币类型 -->
            <template v-else>
              <div class="info-row">
                <span class="label">金额</span>
                <span :class="['value', order.type === 'deposit' ? 'profit' : 'loss']">
                  {{ order.type === 'deposit' ? '+' : '-' }}{{ formatAmount(order.amount) }} {{ order.coin }}
                </span>
              </div>
              <div class="info-row" v-if="order.address">
                <span class="label">{{ order.type === 'deposit' ? '来源地址' : '提币地址' }}</span>
                <span class="value mono small">{{ formatAddr(order.address) }}</span>
              </div>
              <div class="info-row" v-if="order.network">
                <span class="label">网络</span>
                <span class="value">{{ order.network }}</span>
              </div>
              <div class="info-row" v-if="order.txHash">
                <span class="label">交易哈希</span>
                <span class="value mono small">{{ formatAddr(order.txHash) }}</span>
              </div>
              <div class="info-row" v-if="order.fee">
                <span class="label">手续费</span>
                <span class="value">{{ formatAmount(order.fee) }} {{ order.coin }}</span>
              </div>
            </template>
          </div>

          <div class="card-footer">
            <span class="time">{{ order.time }}</span>
            <button v-if="order.canCancel" class="cancel-btn" @click="cancelOrder(order)">
              取消订单
            </button>
          </div>
        </div>

        <!-- 加载更多 -->
        <div class="load-more" v-if="hasMore" @click="loadMore">
          <span>{{ loadingMore ? $t('common.loading') : $t('common.loadMore') || '加载更多' }}</span>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else>
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <p>{{ getEmptyText() }}</p>
        <span>{{ getEmptySubText() }}</span>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { alert } from '../utils/alert'
import { api } from '../utils/api'
import PageLayout from '../components/layout/PageLayout.vue'

const route = useRoute()
const { t } = useI18n()

const activeTab = ref('all')
const activeStatus = ref('all')
const showFilter = ref(false)
const loading = ref(true)
const loadingMore = ref(false)
const orders = ref([])
const page = ref(1)
const hasMore = ref(false)

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'spot', label: '现货' },
  { key: 'contract', label: '合约' },
  { key: 'ieo', label: 'AGX' },
  { key: 'pool', label: '矿机' },
  { key: 'gold', label: '黄金' },
  { key: 'deposit', label: '充值' },
  { key: 'withdraw', label: '提币' }
]

// URL参数映射到tab
const typeMapping = {
  all: 'all',
  spot: 'spot',
  contract: 'contract',
  ieo: 'ieo',
  pool: 'pool',
  staking: 'pool',
  earn: 'gold',
  gold: 'gold',
  finance: 'pool',
  deposit: 'deposit',
  withdraw: 'withdraw'
}

// 交易类型状态
const tradeStatuses = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' }
]

// 充提类型状态
const fundStatuses = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待确认' },
  { key: 'completed', label: '已完成' },
  { key: 'failed', label: '已失败' }
]

// 状态映射
const statusMap = {
  0: { text: '待成交', class: 'pending' },
  1: { text: '部分成交', class: 'pending' },
  2: { text: '已完成', class: 'completed' },
  3: { text: '已取消', class: 'cancelled' },
}

const switchTab = (key) => {
  activeTab.value = key
  activeStatus.value = 'all'
  page.value = 1
  fetchOrders()
}

const switchStatus = (key) => {
  activeStatus.value = key
  page.value = 1
  fetchOrders()
}

const getStatusParam = () => {
  const statusParams = {
    all: undefined,
    pending: 0,
    completed: 2,
    cancelled: 3,
    failed: 3
  }
  return statusParams[activeStatus.value]
}

// 格式化地址
const formatAddr = (addr) => {
  if (!addr) return '-'
  if (addr.length <= 16) return addr
  return addr.slice(0, 8) + '...' + addr.slice(-8)
}

// 空状态文案
const getEmptyText = () => {
  const texts = {
    all: '暂无订单记录',
    spot: '暂无现货订单',
    contract: '暂无合约订单',
    ieo: '暂无AGX申购',
    pool: '暂无矿机订单',
    gold: '暂无黄金收益',
    deposit: '暂无充值记录',
    withdraw: '暂无提币记录'
  }
  return texts[activeTab.value] || '暂无记录'
}

const getEmptySubText = () => {
  const texts = {
    all: '完成交易后订单将在这里显示',
    spot: '去交易市场进行现货交易',
    contract: '去合约交易开始交易',
    ieo: '去AGX申购页面参与',
    pool: '去矿机产品页面申购',
    gold: '持有AGX每日自动获得黄金收益',
    deposit: '去充值页面充入资产',
    withdraw: '去提币页面提取资产'
  }
  return texts[activeTab.value] || ''
}

// 获取订单
const fetchOrders = async () => {
  loading.value = true
  orders.value = []
  
  try {
    const tabType = activeTab.value
    const status = getStatusParam()
    
    // 黄金收益记录 - 单独标签页
    if (tabType === 'gold') {
      await fetchGoldSettlements()
      return
    }
    
    // 充值记录 - 单独标签页
    if (tabType === 'deposit') {
      await fetchDepositHistory(status)
      return
    }
    
    // 提币记录 - 单独标签页
    if (tabType === 'withdraw') {
      await fetchWithdrawHistory(status)
      return
    }
    
    // 交易订单
    if (tabType === 'all' || tabType === 'spot') {
      const res = await api.trade.getUserOrders({ status, page: page.value, pageSize: 20 })
      if (res.success && res.data?.list) {
        const spotOrders = res.data.list.map(o => ({
          id: o.orderNo,
          orderNo: o.orderNo,
          type: 'spot',
          typeLabel: '现货',
          pair: o.symbol,
          symbol: o.symbol,
          side: o.side,
          sideClass: o.side === 'buy' ? 'buy' : 'sell',
          sideLabel: o.side === 'buy' ? '买入' : '卖出',
          price: o.price ? formatNum(o.price) : o.type === 'market' ? '市价' : '-',
          amount: `${o.quantity} ${o.symbol?.split('/')[0] || ''}`,
          total: o.avgPrice ? formatNum(o.avgPrice * o.executedQty) : null,
          status: o.status,
          statusClass: statusMap[o.status]?.class || 'pending',
          statusLabel: o.statusText || statusMap[o.status]?.text || '未知',
          time: o.createdAt,
          canCancel: o.status === 0
        }))
        
        if (tabType === 'all') {
          orders.value.push(...spotOrders)
        } else {
          orders.value = spotOrders
        }
        hasMore.value = res.data.list.length >= 20
      }
    }
    
    if (tabType === 'all' || tabType === 'contract') {
      try {
        const res = await api.contract.getOrders(status)
        if (res.success && res.data?.list) {
          const contractOrders = res.data.list.map(o => ({
            id: o.id,
            orderNo: o.orderNo,
            type: 'contract',
            typeLabel: '合约',
            pair: o.symbol,
            symbol: o.symbol,
            side: o.direction === 1 ? 'buy' : 'sell',
            sideClass: o.direction === 1 ? 'buy' : 'sell',
            sideLabel: o.directionText,
            price: formatNum(o.openPrice),
            amount: `${o.amount} USDT`,
            profitLoss: o.profitLoss,
            status: o.status,
            statusClass: o.status === 2 ? 'completed' : 'pending',
            statusLabel: o.resultText || '进行中',
            time: o.openAt,
            canCancel: false
          }))
          orders.value.push(...contractOrders)
        }
      } catch (e) {
        console.error('合约订单加载失败:', e)
      }
    }
    
    if (tabType === 'all' || tabType === 'ieo') {
      try {
        const res = await api.trade.getMyIeoSubscriptions()
        if (res.success && res.data?.list) {
          const ieoOrders = res.data.list.map(o => {
            const statusMap = {
              0: { class: 'pending', label: '待支付' },
              1: { class: 'pending', label: '待开奖' },
              2: { class: 'pending', label: '已中签' },
              3: { class: 'failed', label: '未中签' },
              4: { class: 'completed', label: '已发币' },
              5: { class: 'completed', label: '已退款' },
              6: { class: 'failed', label: '已取消' },
            }
            const statusInfo = statusMap[o.status] || { class: 'pending', label: '未知' }
            
            return {
              id: o.id,
              type: 'ieo',
              typeLabel: 'AGX',
              pair: o.coinName || o.symbol,
              symbol: o.symbol,
              sideClass: 'buy',
              sideLabel: '申购',
              price: o.price ? formatNum(o.price) : '-',
              amount: `${o.quantity} ${o.symbol || ''}`,
              total: o.amount ? formatNum(o.amount) : null,
              status: o.status,
              statusClass: statusInfo.class,
              statusLabel: statusInfo.label,
              time: o.createdAt,
              canCancel: false
            }
          })
          orders.value.push(...ieoOrders)
        }
      } catch (e) {
        console.error('IEO订单加载失败:', e)
      }
    }
    
    if (tabType === 'all' || tabType === 'pool') {
      try {
        const res = await api.account.getAssetLogs({ 
          page: page.value, 
          pageSize: 20,
          type: 'pool_in' 
        })
        if (res.success && res.data?.list) {
          const poolOrders = res.data.list.map(o => {
            const statusMap = {
              'pool_in': { class: 'completed', label: '已申购' },
              'pool_out': { class: 'completed', label: '已赎回' },
            }
            const statusInfo = statusMap[o.type] || { class: 'pending', label: '未知' }
            
            return {
              id: o.id,
              type: 'pool',
              typeLabel: '矿机',
              pair: o.coin || 'AGX',
              sideClass: 'buy',
              sideLabel: o.type === 'pool_out' ? '赎回' : '申购',
              price: '-',
              amount: o.amount,
              total: Math.abs(parseFloat(o.amount)),
              status: o.type,
              statusClass: statusInfo.class,
              statusLabel: statusInfo.label,
              time: o.createdAt,
              canCancel: false
            }
          })
          orders.value.push(...poolOrders)
        }
      } catch (e) {
        console.error('矿机订单加载失败:', e)
      }
    }
    // "全部"标签页也需要加载充值记录
    if (tabType === 'all') {
      try {
        const res = await api.account.getDepositHistory({
          page: 1,
          pageSize: 20,
          status: status
        })
        if (res.success && res.data?.list) {
          const depositOrders = res.data.list.map(o => {
            const statusMap = {
              0: { class: 'pending', label: '待确认' },
              1: { class: 'completed', label: '已完成' },
              2: { class: 'failed', label: '已超时' },
              3: { class: 'failed', label: '已失败' }
            }
            const statusInfo = statusMap[o.status] || { class: 'pending', label: '未知' }
            return {
              id: o.id || o.orderNo,
              orderNo: o.orderNo,
              type: 'deposit',
              typeLabel: '充值',
              pair: o.coin || 'USDT',
              coin: o.coin || 'USDT',
              amount: o.amount,
              address: o.fromAddress,
              network: o.chain || o.network,
              txHash: o.txHash,
              status: o.status,
              statusClass: statusInfo.class,
              statusLabel: statusInfo.label,
              time: o.createdAt,
              canCancel: false
            }
          })
          orders.value.push(...depositOrders)
        }
      } catch (e) {
        console.error('充值记录加载失败:', e)
      }
    }
    
    // "全部"标签页也需要加载提币记录
    if (tabType === 'all') {
      try {
        const res = await api.account.getWithdrawHistory({
          page: 1,
          pageSize: 20,
          status: status
        })
        if (res.success && res.data?.list) {
          const withdrawOrders = res.data.list.map(o => {
            const statusMap = {
              0: { class: 'pending', label: '待审核' },
              1: { class: 'pending', label: '处理中' },
              2: { class: 'completed', label: '已完成' },
              3: { class: 'failed', label: '已拒绝' },
              4: { class: 'failed', label: '已取消' }
            }
            const statusInfo = statusMap[o.status] || { class: 'pending', label: '未知' }
            return {
              id: o.id || o.orderNo,
              orderNo: o.orderNo,
              type: 'withdraw',
              typeLabel: '提币',
              pair: o.coin || 'USDT',
              coin: o.coin || 'USDT',
              amount: o.amount,
              address: o.toAddress || o.address,
              network: o.chain || o.network,
              txHash: o.txHash,
              fee: o.fee,
              status: o.status,
              statusClass: statusInfo.class,
              statusLabel: statusInfo.label,
              time: o.createdAt,
              canCancel: o.status === 0
            }
          })
          orders.value.push(...withdrawOrders)
        }
      } catch (e) {
        console.error('提币记录加载失败:', e)
      }
    }
    
    // 按时间排序
    orders.value.sort((a, b) => new Date(b.time) - new Date(a.time))
    
  } catch (e) {
    console.error('获取订单失败:', e)
  } finally {
    loading.value = false
  }
}

// 获取黄金收益记录
const fetchGoldSettlements = async () => {
  try {
    const res = await api.gold.getSettlements({
      page: page.value,
      pageSize: 20
    })
    
    if (res.success && res.data?.list) {
      orders.value = res.data.list.map(o => ({
        id: o.id,
        type: 'gold',
        typeLabel: '黄金收益',
        coin: 'GOLD',
        amount: o.goldAmount || o.amount,
        agxBalance: o.agxBalance,
        goldPrice: o.goldPrice,
        status: 'completed',
        statusClass: 'completed',
        statusLabel: '已发放',
        time: o.settleDate || o.createdAt,
        remark: o.remark || `持有 ${formatNum(o.agxBalance)} AGX`
      }))
      hasMore.value = res.data.list.length >= 20
    }
  } catch (e) {
    console.error('获取黄金收益记录失败:', e)
  } finally {
    loading.value = false
  }
}

// 获取充值记录
const fetchDepositHistory = async (status) => {
  try {
    const res = await api.account.getDepositHistory({
      page: page.value,
      pageSize: 20,
      status: status
    })
    
    if (res.success && res.data?.list) {
      orders.value = res.data.list.map(o => {
        const statusMap = {
          0: { class: 'pending', label: '待确认' },
          1: { class: 'completed', label: '已完成' },
          2: { class: 'failed', label: '已超时' },
          3: { class: 'failed', label: '已失败' }
        }
        const statusInfo = statusMap[o.status] || { class: 'pending', label: '未知' }
        
        return {
          id: o.id || o.orderNo,
          orderNo: o.orderNo,
          type: 'deposit',
          typeLabel: '充值',
          pair: o.coin || 'USDT',
          coin: o.coin || 'USDT',
          amount: o.amount,
          address: o.fromAddress,
          network: o.chain || o.network,
          txHash: o.txHash,
          status: o.status,
          statusClass: statusInfo.class,
          statusLabel: statusInfo.label,
          time: o.createdAt,
          canCancel: false
        }
      })
      hasMore.value = res.data.list.length >= 20
    }
  } catch (e) {
    console.error('获取充值记录失败:', e)
  } finally {
    loading.value = false
  }
}

// 获取提币记录
const fetchWithdrawHistory = async (status) => {
  try {
    const res = await api.account.getWithdrawHistory({
      page: page.value,
      pageSize: 20,
      status: status
    })
    
    if (res.success && res.data?.list) {
      orders.value = res.data.list.map(o => {
        const statusMap = {
          0: { class: 'pending', label: '待审核' },
          1: { class: 'pending', label: '处理中' },
          2: { class: 'completed', label: '已完成' },
          3: { class: 'failed', label: '已拒绝' },
          4: { class: 'failed', label: '已取消' }
        }
        const statusInfo = statusMap[o.status] || { class: 'pending', label: '未知' }
        
        return {
          id: o.id || o.orderNo,
          orderNo: o.orderNo,
          type: 'withdraw',
          typeLabel: '提币',
          pair: o.coin || 'USDT',
          coin: o.coin || 'USDT',
          amount: o.amount,
          address: o.toAddress || o.address,
          network: o.chain || o.network,
          txHash: o.txHash,
          fee: o.fee,
          status: o.status,
          statusClass: statusInfo.class,
          statusLabel: statusInfo.label,
          time: o.createdAt,
          canCancel: o.status === 0
        }
      })
      hasMore.value = res.data.list.length >= 20
    }
  } catch (e) {
    console.error('获取提币记录失败:', e)
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loadingMore.value) return
  loadingMore.value = true
  page.value++
  
  try {
    if (activeTab.value === 'deposit') {
      await fetchDepositHistory(getStatusParam())
    } else if (activeTab.value === 'withdraw') {
      await fetchWithdrawHistory(getStatusParam())
    } else {
      await fetchOrders()
    }
  } finally {
    loadingMore.value = false
  }
}

const cancelOrder = async (order) => {
  try {
    let res
    if (order.type === 'spot') {
      res = await api.trade.cancelOrder(order.orderNo)
    } else if (order.type === 'withdraw') {
      // 如果有取消提币的API
      await alert('暂不支持取消提币')
      return
    }
    
    if (res?.success) {
      await alert('订单已取消')
      fetchOrders()
    } else {
      await alert(res?.message || '取消失败')
    }
  } catch (e) {
    await alert('取消订单失败')
  }
}

const formatNum = (num) => {
  if (!num && num !== 0) return '-'
  return parseFloat(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化金额 - 移除尾随0
const formatAmount = (num) => {
  if (!num && num !== 0) return '0'
  const n = parseFloat(num)
  if (isNaN(n)) return '0'
  // 先保留8位小数，然后移除尾随0
  const fixed = n.toFixed(8)
  return fixed.replace(/\.?0+$/, '') || '0'
}

onMounted(() => {
  const urlType = route.query.type
  if (urlType && typeMapping[urlType]) {
    activeTab.value = typeMapping[urlType]
  }
  fetchOrders()
})
</script>

<style scoped>
.filter-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary, #848E9C);
  background: rgba(255, 255, 255, 0.04);
  border: none;
  border-radius: 10px;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.2s;
}

.filter-btn:active {
  background: rgba(255, 255, 255, 0.08);
}

.page-content {
  min-height: calc(100vh - 44px);
  background: var(--bg-base, #0B0E11);
  padding-bottom: max(24px, env(safe-area-inset-bottom));
  will-change: transform;
  transform: translateZ(0);
}

/* Tab导航 - 3D风格 */
.tab-nav {
  display: flex;
  padding: 0 12px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  gap: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.tab-nav button {
  flex: 1;
  padding: 14px 0;
  background: transparent;
  border: none;
  font-size: 13px;
  color: var(--text-tertiary, #848E9C);
  position: relative;
  transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.tab-nav button.active {
  color: var(--color-brand, #C8AA6E);
  font-weight: 600;
}

.tab-nav button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: linear-gradient(90deg, #C8AA6E, #A08050);
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(200, 170, 110, 0.5);
}

/* 状态筛选 - 3D胶囊按钮 */
.status-bar {
  display: flex;
  gap: 10px;
  padding: 14px 16px;
  background: var(--bg-base, #0B0E11);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.status-bar::-webkit-scrollbar { display: none; }

.status-bar button {
  padding: 10px 18px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  font-size: 12px;
  color: var(--text-tertiary, #848E9C);
  white-space: nowrap;
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.status-bar button.active {
  background: linear-gradient(145deg, #252D38 0%, #1E262F 100%);
  border-color: rgba(200, 170, 110, 0.4);
  color: var(--color-brand, #C8AA6E);
  box-shadow: 
    0 4px 12px rgba(200, 170, 110, 0.2),
    inset 0 1px 0 rgba(200, 170, 110, 0.2);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  color: var(--text-tertiary, #848E9C);
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(200, 170, 110, 0.2);
  border-top-color: var(--color-brand, #C8AA6E);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 订单列表 */
.order-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 订单卡片 - 紧凑版 */
.order-card {
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  position: relative;
  overflow: hidden;
}

/* 卡片顶部装饰线 */
.order-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 12px;
  right: 12px;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(200, 170, 110, 0.3) 30%, 
    rgba(200, 170, 110, 0.4) 50%, 
    rgba(200, 170, 110, 0.3) 70%, 
    transparent 100%);
}

.order-card:active {
  background: linear-gradient(145deg, #1A222A 0%, #151C24 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.order-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 类型标签 - 紧凑 */
.type-badge {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
}

.type-badge.spot { background: linear-gradient(145deg, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.1) 100%); color: #60A5FA; }
.type-badge.contract { background: linear-gradient(145deg, rgba(200, 170, 110, 0.2) 0%, rgba(200, 170, 110, 0.1) 100%); color: var(--color-brand, #C8AA6E); }
.type-badge.ieo { background: linear-gradient(145deg, rgba(168,85,247,0.2) 0%, rgba(168,85,247,0.1) 100%); color: #A855F7; }
.type-badge.pool { background: linear-gradient(145deg, rgba(14, 203, 129, 0.2) 0%, rgba(14, 203, 129, 0.1) 100%); color: var(--color-up, #0ECB81); }
.type-badge.gold { background: linear-gradient(145deg, rgba(255, 215, 0, 0.2) 0%, rgba(200, 170, 110, 0.15) 100%); color: #FFD700; }
.type-badge.deposit { background: linear-gradient(145deg, rgba(14, 203, 129, 0.2) 0%, rgba(14, 203, 129, 0.1) 100%); color: var(--color-up, #0ECB81); }
.type-badge.withdraw { background: linear-gradient(145deg, rgba(246, 70, 93, 0.2) 0%, rgba(246, 70, 93, 0.1) 100%); color: var(--color-down, #F6465D); }

.order-pair {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #EAECEF);
}

/* 状态标签 - 紧凑 */
.status-text {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 4px;
}

.status-text.pending { color: var(--color-brand, #C8AA6E); background: linear-gradient(145deg, rgba(200, 170, 110, 0.15) 0%, rgba(200, 170, 110, 0.08) 100%); }
.status-text.completed { color: var(--color-up, #0ECB81); background: linear-gradient(145deg, rgba(14, 203, 129, 0.15) 0%, rgba(14, 203, 129, 0.08) 100%); }
.status-text.cancelled { color: var(--text-tertiary, #848E9C); background: linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%); }
.status-text.failed { color: var(--color-down, #F6465D); background: linear-gradient(145deg, rgba(246, 70, 93, 0.15) 0%, rgba(246, 70, 93, 0.08) 100%); }

.card-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 10px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-row .label {
  font-size: 10px;
  color: var(--text-quaternary, #5E6673);
}

.info-row .value {
  font-size: 13px;
  color: var(--text-primary, #EAECEF);
  font-family: var(--font-mono, 'DIN Alternate', monospace);
}

.info-row .value.buy { color: var(--color-up, #0ECB81); }
.info-row .value.sell { color: var(--color-down, #F6465D); }
.info-row .value.mono { font-family: var(--font-mono, monospace); }
.info-row .value.small { font-size: 12px; }
.info-row .value.highlight { color: var(--color-brand, #C8AA6E); font-weight: 600; }
.info-row .value.profit { color: var(--color-up, #0ECB81); }
.info-row .value.loss { color: var(--color-down, #F6465D); }

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.time {
  font-size: 11px;
  color: var(--text-quaternary, #5E6673);
}

/* 取消按钮 - 紧凑 */
.cancel-btn {
  padding: 6px 14px;
  background: linear-gradient(145deg, rgba(246, 70, 93, 0.15) 0%, rgba(246, 70, 93, 0.08) 100%);
  border: 1px solid rgba(246, 70, 93, 0.25);
  border-radius: 14px;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-down, #F6465D);
  -webkit-tap-highlight-color: transparent;
}

.cancel-btn:active {
  opacity: 0.8;
}

/* 加载更多 - 3D按钮 */
.load-more {
  text-align: center;
  padding: 14px 24px;
  margin: 0 16px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 12px;
  color: var(--color-brand, #C8AA6E);
  font-size: 13px;
  font-weight: 500;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(200, 170, 110, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.load-more:active {
  transform: scale(0.98);
}

/* 空状态 - 3D卡片 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 16px;
  padding: 60px 20px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.empty-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
  border-radius: 50%;
  margin-bottom: 20px;
  color: var(--text-quaternary, #5E6673);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.empty-state p {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary, #848E9C);
}

.empty-state span {
  font-size: 13px;
  color: var(--text-quaternary, #5E6673);
}
</style>
