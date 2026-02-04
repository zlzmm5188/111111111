<template>
  <PageLayout title="OTC交易" :showBack="true">
    <div class="otc-page">
      <!-- 汇率卡片 -->
      <div class="rate-card">
        <div class="rate-header">
          <span class="rate-title">USDT/CNY 实时汇率</span>
          <span class="rate-update" @click="refreshRate">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </span>
        </div>
        <div class="rate-body">
          <div class="rate-item">
            <span class="rate-label">买入价</span>
            <span class="rate-value buy">¥ {{ rateData.buyRate }}</span>
          </div>
          <div class="rate-divider"></div>
          <div class="rate-item">
            <span class="rate-label">卖出价</span>
            <span class="rate-value sell">¥ {{ rateData.sellRate }}</span>
          </div>
        </div>
      </div>

      <!-- 交易类型Tab -->
      <div class="trade-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: tradeType === 'buy', buy: tradeType === 'buy' }" 
          @click="switchType('buy')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
          购买 USDT
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: tradeType === 'sell', sell: tradeType === 'sell' }" 
          @click="switchType('sell')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
          出售 USDT
        </button>
      </div>

      <!-- 商家列表 -->
      <div class="merchant-section">
        <div class="section-header">
          <span class="section-title">{{ tradeType === 'buy' ? '出售商家' : '收购商家' }}</span>
          <span class="section-count">{{ advertisements.length }} 个商家在线</span>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="skeleton-card" v-for="i in 3" :key="i">
            <div class="skeleton-header">
              <div class="skeleton-avatar"></div>
              <div class="skeleton-info">
                <div class="skeleton-line w60"></div>
                <div class="skeleton-line w40"></div>
              </div>
            </div>
            <div class="skeleton-body">
              <div class="skeleton-line w80"></div>
              <div class="skeleton-line w50"></div>
            </div>
          </div>
        </div>

        <!-- 商家卡片 -->
        <div v-else class="merchant-list">
          <div 
            class="merchant-card" 
            v-for="ad in advertisements" 
            :key="ad.id"
            @click="openTradeModal(ad)"
          >
            <div class="merchant-header">
              <div class="merchant-info">
                <div class="merchant-avatar">
                  <span>{{ ad.merchant.charAt(0) }}</span>
                  <span class="online-dot" v-if="ad.verified"></span>
                </div>
                <div class="merchant-detail">
                  <div class="merchant-name">
                    {{ ad.merchant }}
                    <svg v-if="ad.verified" class="verified-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div class="merchant-stats">
                    <span>{{ ad.orders }} 单</span>
                    <span class="sep">|</span>
                    <span>{{ ad.completionRate }}% 完成率</span>
                  </div>
                </div>
              </div>
              <div class="merchant-price">
                <span class="price-value">¥ {{ ad.price }}</span>
                <span class="price-label">单价</span>
              </div>
            </div>

            <div class="merchant-body">
              <div class="info-row">
                <div class="info-item">
                  <span class="info-label">限额</span>
                  <span class="info-value">¥{{ ad.minAmount.toLocaleString() }} - ¥{{ ad.maxAmount.toLocaleString() }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">剩余</span>
                  <span class="info-value">{{ ad.available }}</span>
                </div>
              </div>
            </div>

            <div class="merchant-footer">
              <div class="payment-tags">
                <span class="payment-tag" v-for="method in ad.payments" :key="method">
                  {{ method }}
                </span>
              </div>
              <button class="trade-btn" :class="tradeType">
                {{ tradeType === 'buy' ? '购买' : '出售' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && advertisements.length === 0" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 15s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
          </svg>
          <p>暂无商家在线</p>
        </div>
      </div>

      <!-- 我的订单入口 -->
      <div class="my-orders-entry" @click="goToOrders">
        <div class="entry-left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <path d="M9 12h6M9 16h6"/>
          </svg>
          <span>我的OTC订单</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>

      <!-- 交易弹窗 -->
      <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
        <div class="trade-modal">
          <div class="modal-header">
            <span>{{ tradeType === 'buy' ? '购买' : '出售' }} USDT</span>
            <button class="close-btn" @click="closeModal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="modal-body" v-if="selectedAd">
            <div class="modal-merchant">
              <div class="merchant-avatar modal-avatar">
                <span>{{ selectedAd.merchant.charAt(0) }}</span>
              </div>
              <div class="modal-merchant-info">
                <div class="modal-merchant-name">{{ selectedAd.merchant }}</div>
                <div class="modal-merchant-stats">{{ selectedAd.orders }} 单 | {{ selectedAd.completionRate }}%</div>
              </div>
              <div class="modal-price">¥ {{ selectedAd.price }}</div>
            </div>

            <div class="input-group">
              <label>{{ tradeType === 'buy' ? '支付金额' : '出售数量' }}</label>
              <div class="input-wrapper">
                <input 
                  type="number" 
                  v-model="tradeAmount" 
                  :placeholder="`${selectedAd.minAmount} - ${selectedAd.maxAmount}`"
                  @input="calcResult"
                >
                <span class="input-suffix">{{ tradeType === 'buy' ? 'CNY' : 'USDT' }}</span>
              </div>
              <div class="input-hint">
                限额: ¥{{ selectedAd.minAmount.toLocaleString() }} - ¥{{ selectedAd.maxAmount.toLocaleString() }}
              </div>
            </div>

            <div class="calc-result">
              <span class="result-label">{{ tradeType === 'buy' ? '预计获得' : '预计收到' }}</span>
              <span class="result-value">
                {{ calcResultValue }} {{ tradeType === 'buy' ? 'USDT' : 'CNY' }}
              </span>
            </div>

            <div class="payment-select">
              <label>支付方式</label>
              <div class="payment-options">
                <button 
                  v-for="method in selectedAd.payments" 
                  :key="method"
                  class="payment-option"
                  :class="{ active: selectedPayment === method }"
                  @click="selectedPayment = method"
                >
                  {{ method }}
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="cancel-btn" @click="closeModal">取消</button>
            <button 
              class="confirm-btn" 
              :class="tradeType"
              :disabled="!canSubmit"
              @click="submitOrder"
            >
              确认{{ tradeType === 'buy' ? '购买' : '出售' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageLayout from '../components/layout/PageLayout.vue'
import api from '../utils/api'
import { alert, showSuccess, showError } from '../utils/alert'
import { withTradePassword, getTradePasswordStatus } from '../utils/tradePassword'

const router = useRouter()

const tradeType = ref('buy')
const loading = ref(true)
const rateData = ref({ buyRate: '7.25', sellRate: '7.23' })
const advertisements = ref([])
const showModal = ref(false)
const selectedAd = ref(null)
const tradeAmount = ref('')
const selectedPayment = ref('')

// 计算结果
const calcResultValue = computed(() => {
  if (!tradeAmount.value || !selectedAd.value) return '0.00'
  const amount = parseFloat(tradeAmount.value)
  if (isNaN(amount)) return '0.00'
  
  if (tradeType.value === 'buy') {
    return (amount / selectedAd.value.price).toFixed(2)
  } else {
    return (amount * selectedAd.value.price).toFixed(2)
  }
})

// 是否可提交
const canSubmit = computed(() => {
  if (!tradeAmount.value || !selectedAd.value || !selectedPayment.value) return false
  const amount = parseFloat(tradeAmount.value)
  if (isNaN(amount)) return false
  
  if (tradeType.value === 'buy') {
    return amount >= selectedAd.value.minAmount && amount <= selectedAd.value.maxAmount
  } else {
    const cnyAmount = amount * selectedAd.value.price
    return cnyAmount >= selectedAd.value.minAmount && cnyAmount <= selectedAd.value.maxAmount
  }
})

// 获取汇率
const fetchRate = async () => {
  try {
    const res = await api.get('/otc/rate')
    if (res.success && res.data) {
      rateData.value = res.data
    }
  } catch (e) {
    console.error('获取汇率失败:', e)
  }
}

// 刷新汇率
const refreshRate = () => {
  fetchRate()
  fetchAdvertisements()
}

// 获取广告列表
const fetchAdvertisements = async () => {
  loading.value = true
  try {
    const res = await api.get('/otc/advertisements', { 
      params: { type: tradeType.value, page: 1, limit: 20 } 
    })
    if (res.success && res.data) {
      advertisements.value = res.data.list || []
    }
  } catch (e) {
    console.error('获取广告失败:', e)
  } finally {
    loading.value = false
  }
}

// 切换交易类型
const switchType = (type) => {
  tradeType.value = type
  fetchAdvertisements()
}

// 打开交易弹窗
const openTradeModal = async (ad) => {
  selectedAd.value = ad
  showModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
  selectedAd.value = null
}

// 计算结果
const calcResult = () => {
  // 触发computed重新计算
}

// 提交订单
const submitOrder = async () => {
  if (!canSubmit.value) return
  
  try {
    // 检查是否设置了交易密码
    const status = await getTradePasswordStatus()
    if (!status.hasTradePassword) {
      await alert('请先设置交易密码')
      router.push('/settings')
      return
    }
    
    // 使用交易密码验证包装器执行订单
    const result = await withTradePassword(async (password) => {
      const res = await api.post('/otc/order', {
        type: tradeType.value,
        advertisementId: selectedAd.value.id,
        amount: parseFloat(tradeAmount.value),
        payMethod: selectedPayment.value,
        tradePassword: password  // 传递交易密码
      })
      
      if (res.success) {
        showSuccess('订单创建成功')
        closeModal()
        router.push('/otc/orders')
        return true
      } else {
        throw new Error(res.message || '创建订单失败')
      }
    }, {
      title: tradeType.value === 'buy' ? '确认购买' : '确认出售',
      tip: `${tradeType.value === 'buy' ? '购买' : '出售'} ${tradeAmount.value} ${tradeType.value === 'buy' ? 'CNY' : 'USDT'}，${tradeType.value === 'buy' ? '预计获得' : '预计收到'} ${calcResultValue.value} ${tradeType.value === 'buy' ? 'USDT' : 'CNY'}`
    })
    
    if (result === null) {
      // 用户取消
      return
    }
  } catch (e) {
    if (e.message === '用户取消') return
    if (e.message?.includes('登录') || e.code === 401) {
      await alert('请先登录')
      router.push('/login')
    } else {
      showError(e.message || '创建订单失败')
    }
  }
}

// 跳转订单页
const goToOrders = () => {
  router.push('/otc/orders')
}

onMounted(() => {
  fetchRate()
  fetchAdvertisements()
})
</script>

<style scoped>
.otc-page {
  min-height: calc(100vh - 56px);
  padding: 16px;
  padding-bottom: 100px;
  background: transparent;
}

/* 汇率卡片 */
.rate-card {
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.15) 0%, rgba(200, 170, 110, 0.05) 100%);
  border: 1px solid rgba(200, 170, 110, 0.3);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.rate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.rate-title {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.rate-update {
  color: var(--color-brand);
  cursor: pointer;
  padding: 4px;
}

.rate-body {
  display: flex;
  align-items: center;
  gap: 16px;
}

.rate-item {
  flex: 1;
  text-align: center;
}

.rate-label {
  display: block;
  font-size: 11px;
  color: var(--text-tertiary);
  margin-bottom: 4px;
}

.rate-value {
  font-size: 22px;
  font-weight: 700;
  font-family: 'SF Mono', monospace;
}

.rate-value.buy { color: var(--color-up, #10B981); }
.rate-value.sell { color: var(--color-down, #EF4444); }

.rate-divider {
  width: 1px;
  height: 40px;
  background: rgba(200, 170, 110, 0.3);
}

/* 交易Tab */
.trade-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 48px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-tertiary);
  transition: all 0.3s ease;
}

.tab-btn.active.buy {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
  color: var(--color-up);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.tab-btn.active.sell {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
  color: var(--color-down);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* 商家区块 */
.merchant-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-count {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* 商家卡片 */
.merchant-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.merchant-card {
  background: linear-gradient(145deg, rgba(30, 38, 50, 0.9) 0%, rgba(22, 27, 34, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
  transition: all 0.2s ease;
}

.merchant-card:active {
  transform: scale(0.98);
  border-color: rgba(200, 170, 110, 0.3);
}

.merchant-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.merchant-info {
  display: flex;
  gap: 12px;
}

.merchant-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-brand) 0%, #A08A5B 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  position: relative;
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background: var(--color-up);
  border: 2px solid var(--bg-primary);
  border-radius: 50%;
}

.merchant-name {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.verified-icon {
  color: var(--color-brand);
}

.merchant-stats {
  font-size: 12px;
  color: var(--text-tertiary);
}

.merchant-stats .sep {
  margin: 0 6px;
  opacity: 0.5;
}

.merchant-price {
  text-align: right;
}

.price-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-up);
  font-family: 'SF Mono', monospace;
}

.price-label {
  font-size: 11px;
  color: var(--text-tertiary);
}

.merchant-body {
  margin-bottom: 14px;
}

.info-row {
  display: flex;
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 11px;
  color: var(--text-tertiary);
}

.info-value {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.merchant-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.payment-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.payment-tag {
  font-size: 11px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  color: var(--text-tertiary);
}

.trade-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.trade-btn.buy {
  background: linear-gradient(135deg, var(--color-up) 0%, #059669 100%);
  color: #fff;
}

.trade-btn.sell {
  background: linear-gradient(135deg, var(--color-down) 0%, #DC2626 100%);
  color: #fff;
}

/* 我的订单入口 */
.my-orders-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  margin-top: 16px;
}

.entry-left {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.entry-left svg {
  color: var(--color-brand);
}

/* 骨架屏 */
.loading-state {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 16px;
}

.skeleton-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.skeleton-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-info {
  flex: 1;
}

.skeleton-line {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-bottom: 8px;
}

.skeleton-line.w80 { width: 80%; }
.skeleton-line.w60 { width: 60%; }
.skeleton-line.w50 { width: 50%; }
.skeleton-line.w40 { width: 40%; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-tertiary);
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 14px;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.trade-modal {
  width: 100%;
  max-width: 428px;
  background: var(--bg-elevated);
  border-radius: 20px 20px 0 0;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  padding: 4px;
}

.modal-merchant {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  margin-bottom: 20px;
}

.modal-avatar {
  width: 40px;
  height: 40px;
  font-size: 16px;
}

.modal-merchant-info {
  flex: 1;
}

.modal-merchant-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-merchant-stats {
  font-size: 12px;
  color: var(--text-tertiary);
}

.modal-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-up);
  font-family: 'SF Mono', monospace;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.input-wrapper input {
  flex: 1;
  background: none;
  border: none;
  padding: 14px 16px;
  font-size: 16px;
  color: var(--text-primary);
  outline: none;
}

.input-wrapper input::placeholder {
  color: var(--text-tertiary);
}

.input-suffix {
  padding: 0 16px;
  font-size: 14px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.input-hint {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 6px;
}

.calc-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: rgba(200, 170, 110, 0.1);
  border-radius: 10px;
  margin-bottom: 16px;
}

.result-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.result-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-brand);
  font-family: 'SF Mono', monospace;
}

.payment-select {
  margin-bottom: 20px;
}

.payment-select label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.payment-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.payment-option {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.payment-option.active {
  background: rgba(200, 170, 110, 0.15);
  border-color: var(--color-brand);
  color: var(--color-brand);
}

.modal-footer {
  display: flex;
  gap: 12px;
}

.cancel-btn {
  flex: 1;
  padding: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
}

.confirm-btn {
  flex: 2;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  transition: all 0.2s ease;
}

.confirm-btn.buy {
  background: linear-gradient(135deg, var(--color-up) 0%, #059669 100%);
}

.confirm-btn.sell {
  background: linear-gradient(135deg, var(--color-down) 0%, #DC2626 100%);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
