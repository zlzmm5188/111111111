<template>
  <PageLayout :title="$t('deposit.title')" :show-back="true">
    <template #navbar-right>
      <router-link to="/orders?type=deposit" class="header-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
      </router-link>
    </template>

    <div class="page-content">
      <!-- 币种选择器 -->
      <div class="coin-selector">
        <div class="coin-info">
          <div class="coin-icon-wrap">
            <span class="usdt-icon">$</span>
          </div>
          <div class="coin-text">
            <span class="coin-symbol">{{ selectedCoin.symbol }}</span>
            <span class="coin-name">{{ selectedCoin.network }}</span>
          </div>
        </div>
        <span class="coin-tip">仅支持 USDT TRC20</span>
      </div>

      <!-- 未完成实名认证提示 -->
      <div class="bind-warning" v-if="kycStatus !== 2">
        <div class="warning-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="4" width="16" height="16" rx="2"/>
            <circle cx="12" cy="10" r="3"/>
            <path d="M7 17c0-2 2.5-3 5-3s5 1 5 3"/>
          </svg>
        </div>
        <div class="warning-content">
          <span class="warning-title">请先完成实名认证</span>
          <span class="warning-desc">为确保资金安全，充值前请先完成实名认证</span>
        </div>
        <button class="bind-btn" @click="router.push('/kyc')">去认证</button>
      </div>

      <!-- 未绑定地址提示 -->
      <div class="bind-warning" v-else-if="!hasBoundAddress">
        <div class="warning-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
        </div>
        <div class="warning-content">
          <span class="warning-title">请先绑定充值地址</span>
          <span class="warning-desc">为确保资金安全，充值前请先绑定您的TRON钱包地址</span>
        </div>
        <button class="bind-btn" @click="goBindAddress">去绑定</button>
      </div>

      <!-- 已认证且已绑定，显示充值表单 -->
      <template v-if="kycStatus === 2 && hasBoundAddress">
        <!-- 当前没有进行中的订单，显示输入表单 -->
        <div class="deposit-form" v-if="!currentOrder">
          <!-- 充值金额 -->
          <div class="form-section">
            <div class="form-label">
              <span>充值金额</span>
              <span class="unit">(USDT)</span>
            </div>
            <div class="amount-input-wrap">
              <input 
                type="number" 
                v-model="inputAmount" 
                placeholder="最小充值 10 USDT"
                class="amount-input"
              />
              <span class="amount-suffix">USDT</span>
            </div>
          </div>

          <!-- 您的充值地址 -->
          <div class="form-section">
            <div class="form-label">您的充值地址</div>
            <div class="address-display">
              <span class="address-text">{{ boundAddress }}</span>
            </div>
          </div>

          <!-- 平台收款地址 -->
          <div class="form-section">
            <div class="form-label">平台收款地址</div>
            <div class="address-wrap">
              <div class="address-box">
                <span class="address-text">{{ platformAddress }}</span>
              </div>
              <button class="copy-btn" @click="copyAddress(platformAddress)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 提示信息 -->
          <div class="tips-section">
            <div class="tip-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
              </svg>
              <span>请确保从绑定地址转账，否则无法自动入账</span>
            </div>
            <div class="tip-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
              </svg>
              <span>转账成功后系统将自动确认，无需其他操作</span>
            </div>
          </div>

          <button class="submit-btn" @click="createOrder" :disabled="!canSubmit || loading">
            <span v-if="loading" class="btn-loading"></span>
            {{ loading ? '提交中...' : '提交充值申请' }}
          </button>
        </div>

        <!-- 有进行中的订单，显示倒计时 -->
        <div class="order-status" v-else>
          <div class="status-header" :class="orderStatusClass">
            <div class="status-icon-wrap">
              <svg v-if="currentOrder.status === 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
              </svg>
              <svg v-else-if="currentOrder.status === 1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div class="status-text">{{ orderStatusText }}</div>
          </div>

          <!-- 倒计时 -->
          <div class="countdown" v-if="currentOrder.status === 0 && remainingTime > 0">
            <div class="countdown-label">剩余支付时间</div>
            <div class="countdown-value">{{ formatTime(remainingTime) }}</div>
            <div class="countdown-bar">
              <div class="countdown-progress" :style="{ width: (remainingTime / 600) * 100 + '%' }"></div>
            </div>
          </div>

          <!-- 订单详情 -->
          <div class="order-detail">
            <div class="detail-row">
              <span class="detail-label">订单号</span>
              <span class="detail-value mono">{{ currentOrder.orderNo }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">充值金额</span>
              <span class="detail-value highlight">{{ currentOrder.amount }} USDT</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">您的地址</span>
              <span class="detail-value mono small">{{ formatAddr(currentOrder.fromAddress) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">平台地址</span>
              <div class="detail-value-wrap">
                <span class="detail-value mono small">{{ formatAddr(currentOrder.toAddress) }}</span>
                <button class="mini-copy" @click="copyAddress(currentOrder.toAddress)">复制</button>
              </div>
            </div>
            <div class="detail-row" v-if="currentOrder.txHash">
              <span class="detail-label">交易哈希</span>
              <span class="detail-value mono small">{{ formatAddr(currentOrder.txHash) }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="order-actions">
            <button v-if="currentOrder.status === 0" class="action-btn primary" @click="copyAddress(currentOrder.toAddress)">
              复制平台地址去转账
            </button>
            <button v-if="currentOrder.status !== 0" class="action-btn" @click="createNewOrder">
              发起新的充值
            </button>
          </div>

          <!-- 提示 -->
          <div class="order-tips" v-if="currentOrder.status === 0">
            <div class="tip-item">请在倒计时结束前完成转账</div>
            <div class="tip-item">请确保从绑定地址转账，否则无法自动入账</div>
            <div class="tip-item">转账成功后系统将自动确认，无需其他操作</div>
          </div>
        </div>
      </template>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { alert } from '../utils/alert'
import PageLayout from '../components/layout/PageLayout.vue'
import { api } from '../utils/api'

const router = useRouter()

const loading = ref(false)
const inputAmount = ref('')
const quickAmounts = [50, 100, 500, 1000]

const selectedCoin = ref({
  symbol: 'USDT',
  name: 'Tether',
  network: 'TRC20',
  icon: 'https://assets.coingecko.com/coins/images/325/small/Tether.png'
})

const boundAddress = ref('')
const platformAddress = ref('')
const hasBoundAddress = ref(false)
const kycStatus = ref(0) // 0:未认证 1:审核中 2:已认证 3:已拒绝

const currentOrder = ref(null)
const remainingTime = ref(0)
const depositHistory = ref([])
const historyLoading = ref(false)

let countdownTimer = null
let pollTimer = null

// 是否可以提交
const canSubmit = computed(() => {
  const amount = parseFloat(inputAmount.value)
  return !isNaN(amount) && amount >= 10
})

// 订单状态样式
const orderStatusClass = computed(() => {
  if (!currentOrder.value) return ''
  return {
    0: 'pending',
    1: 'success',
    2: 'expired'
  }[currentOrder.value.status] || ''
})

// 订单状态文本
const orderStatusText = computed(() => {
  if (!currentOrder.value) return ''
  return {
    0: '等待转账确认',
    1: '充值成功',
    2: '订单已超时'
  }[currentOrder.value.status] || '未知状态'
})

// 格式化地址
const formatAddr = (addr) => {
  if (!addr) return '-'
  if (addr.length <= 16) return addr
  return addr.slice(0, 8) + '...' + addr.slice(-8)
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 获取充值地址信息
const getDepositInfo = async () => {
  try {
    const response = await api.account.getDepositAddress({
      coin: 'USDT',
      chain: 'TRC20'
    })
    
    if (response.success && response.data) {
      // 标准字段，与后端 account.service.ts:820-835 对齐
      platformAddress.value = response.data.address || ''
      boundAddress.value = response.data.boundAddress || ''
      // 多重判断：isBound 或者 boundAddress 有值
      hasBoundAddress.value = response.data.isBound === true || 
                               response.data.isBound === 1 || 
                               response.data.isBound === '1' ||
                               (response.data.boundAddress && response.data.boundAddress.length > 0)
      
      console.log('充值地址信息:', {
        address: platformAddress.value,
        boundAddress: boundAddress.value,
        isBound: response.data.isBound,
        hasBoundAddress: hasBoundAddress.value
      })
    }
  } catch (error) {
    console.error('获取充值信息失败:', error)
    hasBoundAddress.value = false
    platformAddress.value = ''
  }
}

// 创建充值订单
const createOrder = async () => {
  if (!canSubmit.value || loading.value) return
  
  loading.value = true
  try {
    const response = await api.account.createDepositOrder({
      coin: 'USDT',
      chain: 'TRC20',
      amount: inputAmount.value
    })
    
    if (response.success) {
      currentOrder.value = response.data
      remainingTime.value = response.data.remainingSeconds || 600
      startCountdown()
      startPolling()
      inputAmount.value = ''
      await alert(response.data.message || '订单创建成功，请在10分钟内完成转账')
    } else {
      await alert(response.message || '创建订单失败')
    }
  } catch (error) {
    await alert(error.message || '网络错误')
  } finally {
    loading.value = false
  }
}

// 发起新订单
const createNewOrder = () => {
  currentOrder.value = null
  remainingTime.value = 0
  stopCountdown()
  stopPolling()
}

// 开始倒计时
const startCountdown = () => {
  stopCountdown()
  countdownTimer = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      stopCountdown()
      // 刷新订单状态
      if (currentOrder.value) {
        checkOrderStatus()
      }
    }
  }, 1000)
}

// 停止倒计时
const stopCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

// 开始轮询订单状态
const startPolling = () => {
  stopPolling()
  pollTimer = setInterval(checkOrderStatus, 5000) // 每5秒查询一次
}

// 停止轮询
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// 查询订单状态
const checkOrderStatus = async () => {
  if (!currentOrder.value) return
  
  try {
    const response = await api.account.getDepositOrderStatus(currentOrder.value.orderNo)
    
    if (response.success) {
      currentOrder.value = response.data
      remainingTime.value = response.data.remainingSeconds || 0
      
      // 如果订单已完成或超时，停止轮询
      if (response.data.status !== 0) {
        stopCountdown()
        stopPolling()
        getDepositHistory() // 刷新历史记录
        
        if (response.data.status === 1) {
          await alert('充值成功！资金已到账')
        }
      }
    }
  } catch (error) {
    console.error('查询订单状态失败:', error)
  }
}

// 获取充值记录
const getDepositHistory = async () => {
  historyLoading.value = true
  try {
    const response = await api.account.getDepositHistory({
      coin: 'USDT',
      page: 1,
      pageSize: 10
    })
    
    if (response.success) {
      depositHistory.value = response.data.list || []
    }
  } catch (error) {
    console.error('获取充值记录失败:', error)
  } finally {
    historyLoading.value = false
  }
}

// 复制地址（兼容多种环境）
const copyAddress = async (addr) => {
  if (!addr) return
  try {
    // 优先使用 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(addr)
      await alert('已复制到剪贴板')
      return
    }
    // 备用方案：使用 textarea + execCommand
    const textarea = document.createElement('textarea')
    textarea.value = addr
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    if (success) {
      await alert('已复制到剪贴板')
    } else {
      await alert('复制失败，请手动复制')
    }
  } catch (error) {
    console.error('复制失败:', error)
    await alert('复制失败，请手动复制')
  }
}

// 跳转绑定地址
const goBindAddress = () => {
  router.push('/settings')
}

// 状态文本
const getStatusText = (status) => {
  return { 0: '待确认', 1: '已完成', 2: '已超时' }[status] || '未知'
}

onMounted(async () => {
  // 先获取KYC状态
  try {
    const kycRes = await api.account.getKycStatus()
    if (kycRes.success && kycRes.data) {
      kycStatus.value = kycRes.data.kycStatus || kycRes.data.status || 0
    }
  } catch (e) {
    console.error('获取KYC状态失败:', e)
  }
  
  await getDepositInfo()
  await getDepositHistory()
})

onUnmounted(() => {
  stopCountdown()
  stopPolling()
})
</script>

<style scoped>
/* ==================== Pro Max 3D 风格 ==================== */
.page-content {
  padding: 16px;
  padding-bottom: max(24px, env(safe-area-inset-bottom));
  background: #0D1117;
  min-height: calc(100vh - 56px);
}

/* 币种选择器 - 3D 立体卡片 */
.coin-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* 顶部高光线 */
.coin-selector::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.1) 70%, transparent 100%);
}

/* 底部金色装饰线 */
.coin-selector::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.3) 30%, rgba(200, 170, 110, 0.5) 50%, rgba(200, 170, 110, 0.3) 70%, transparent 100%);
}

.coin-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.coin-icon-wrap {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(145deg, #2A323C 0%, #1E252E 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 4px 10px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.usdt-icon {
  font-size: 20px;
  font-weight: 700;
  color: #26A17B;
  text-shadow: 0 0 10px rgba(38, 161, 123, 0.4);
}

.coin-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.coin-symbol {
  font-size: 17px;
  font-weight: 700;
  color: #F0F2F5;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.coin-name {
  font-size: 12px;
  color: #7A8494;
}

.coin-tip {
  font-size: 12px;
  font-weight: 600;
  color: #C8AA6E;
}

/* 绑定警告 - 3D 卡片 */
.bind-warning {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  background: linear-gradient(145deg, rgba(246, 70, 93, 0.12) 0%, rgba(246, 70, 93, 0.06) 100%);
  border: 1px solid rgba(246, 70, 93, 0.25);
  border-radius: 16px;
  margin-bottom: 16px;
  position: relative;
  box-shadow: 0 4px 12px rgba(246, 70, 93, 0.15);
}

.warning-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(246, 70, 93, 0.15);
  border-radius: 12px;
}

.warning-icon svg {
  color: #F6465D;
}

.warning-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.warning-title {
  font-size: 15px;
  font-weight: 700;
  color: #F6465D;
}

.warning-desc {
  font-size: 13px;
  color: #8B95A5;
}

.bind-btn {
  padding: 10px 18px;
  background: linear-gradient(135deg, #F6465D 0%, #D63850 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(246, 70, 93, 0.3);
  align-self: center;
}

/* 充值表单 - 3D 立体卡片 */
.deposit-form {
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  padding: 22px 20px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.4),
    0 2px 6px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.deposit-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 170, 110, 0.4) 20%, #C8AA6E 50%, rgba(200, 170, 110, 0.4) 80%, transparent 100%);
}

.form-section {
  margin-bottom: 22px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #8B95A5;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-label .unit {
  font-size: 12px;
  color: #6B7684;
}

/* 金额输入框 - 3D 凹陷效果 */
.amount-input-wrap {
  display: flex;
  align-items: center;
  background: linear-gradient(145deg, #141A22 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 0 18px;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 -1px 0 rgba(255, 255, 255, 0.03);
}

.amount-input {
  flex: 1;
  height: 54px;
  background: transparent;
  border: none;
  color: #F0F2F5;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', monospace;
  font-size: 22px;
  font-weight: 700;
}

.amount-input::placeholder {
  color: #4A5260;
  font-weight: 400;
  font-size: 14px;
}

.amount-suffix {
  font-size: 15px;
  font-weight: 600;
  color: #7A8494;
}

/* 快捷金额 - 3D 按钮组 */
.quick-amounts {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.quick-btn {
  flex: 1;
  padding: 12px;
  background: linear-gradient(145deg, #2A323C 0%, #232A34 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #A0A8B4;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.quick-btn.active {
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.2) 0%, rgba(200, 170, 110, 0.1) 100%);
  border-color: rgba(200, 170, 110, 0.4);
  color: #C8AA6E;
  box-shadow: 
    0 0 12px rgba(200, 170, 110, 0.2),
    inset 0 1px 0 rgba(200, 170, 110, 0.2);
}

/* 地址显示 */
.address-display {
  padding: 14px 16px;
  background: linear-gradient(145deg, #141A22 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.address-display .address-text {
  font-size: 13px;
  font-family: 'SF Mono', Monaco, monospace;
  color: #A0A8B4;
  word-break: break-all;
}

.address-wrap {
  display: flex;
  gap: 10px;
}

.address-box {
  flex: 1;
  padding: 14px 16px;
  background: linear-gradient(145deg, #141A22 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.address-box .address-text {
  font-size: 12px;
  font-family: 'SF Mono', Monaco, monospace;
  color: #A0A8B4;
  word-break: break-all;
}

.copy-btn {
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #2A323C 0%, #232A34 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #C8AA6E;
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

/* 提示区域 */
.tips-section {
  margin-top: 18px;
  padding: 14px 16px;
  background: rgba(200, 170, 110, 0.06);
  border: 1px solid rgba(200, 170, 110, 0.15);
  border-radius: 12px;
}

.tips-section .tip-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: #A08050;
  padding: 6px 0;
}

.tips-section .tip-item svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #C8AA6E;
}

/* 提交按钮 - 3D 金色渐变 */
.submit-btn {
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #D4B87A 0%, #C8AA6E 50%, #A08050 100%);
  border: none;
  border-radius: 16px;
  color: #0D1117;
  font-size: 17px;
  font-weight: 700;
  margin-top: 22px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 6px 16px rgba(200, 170, 110, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -2px 0 rgba(0, 0, 0, 0.1);
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 15%;
  right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
}

.submit-btn:disabled {
  opacity: 0.5;
}

.submit-btn:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 
    0 3px 8px rgba(200, 170, 110, 0.25),
    inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

.btn-loading {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(13, 17, 23, 0.3);
  border-top-color: #0D1117;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 订单状态卡片 - 3D */
.order-status {
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 20px 18px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.order-status::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.1) 70%, transparent 100%);
}

.status-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.status-icon-wrap {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(145deg, #2A323C 0%, #1E252E 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 3px 10px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.status-icon-wrap svg {
  width: 32px;
  height: 32px;
}

.status-header.pending .status-icon-wrap svg { color: #C8AA6E; }
.status-header.success .status-icon-wrap svg { color: #0ECB81; }
.status-header.expired .status-icon-wrap svg { color: #F6465D; }

.status-text {
  font-size: 17px;
  font-weight: 700;
  color: #F0F2F5;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 倒计时 - 3D */
.countdown {
  text-align: center;
  margin-bottom: 26px;
  padding: 20px;
  background: linear-gradient(145deg, #141A22 0%, #181F28 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.3);
}

.countdown-label {
  font-size: 13px;
  color: #7A8494;
  margin-bottom: 10px;
}

.countdown-value {
  font-size: 42px;
  font-weight: 800;
  font-family: 'SF Mono', Monaco, monospace;
  background: linear-gradient(135deg, #F0D78C 0%, #C8AA6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 14px;
}

.countdown-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.countdown-progress {
  height: 100%;
  background: linear-gradient(90deg, #A08050, #C8AA6E, #D4B87A);
  border-radius: 3px;
  transition: width 1s linear;
}

/* 订单详情 - 3D 凹陷 */
.order-detail {
  background: linear-gradient(145deg, #141A22 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 20px;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.3);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 13px;
  color: #7A8494;
  flex-shrink: 0;
}

.detail-value {
  font-size: 13px;
  color: #E8EAED;
  text-align: right;
  word-break: break-all;
}

.detail-value.mono {
  font-family: 'SF Mono', Monaco, monospace;
}

.detail-value.small {
  font-size: 11px;
}

.detail-value.highlight {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #C8AA6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.detail-value-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 70%;
}

.detail-value-wrap .detail-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-copy {
  padding: 4px 10px;
  background: linear-gradient(145deg, #2A323C 0%, #232A34 100%);
  border: 1px solid rgba(200, 170, 110, 0.4);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #C8AA6E;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.mini-copy:active {
  transform: scale(0.95);
  background: linear-gradient(145deg, #232A34 0%, #1E252E 100%);
}

/* 操作按钮组 */
.order-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.action-btn {
  flex: 1;
  height: 48px;
  background: linear-gradient(145deg, #2A323C 0%, #232A34 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #E8EAED;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
}

.action-btn:active {
  transform: scale(0.98);
}

.action-btn.primary {
  background: linear-gradient(135deg, #D4B87A 0%, #C8AA6E 50%, #A08050 100%);
  border: none;
  color: #0D1117;
  box-shadow: 
    0 4px 12px rgba(200, 170, 110, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.action-btn.primary:active {
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
}

/* 订单提示 */
.order-tips {
  margin-top: 14px;
  padding: 12px 14px;
  background: rgba(200, 170, 110, 0.08);
  border: 1px solid rgba(200, 170, 110, 0.15);
  border-radius: 10px;
}

.order-tips .tip-item {
  font-size: 12px;
  color: #A08050;
  padding: 4px 0;
  padding-left: 14px;
  position: relative;
}

.order-tips .tip-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #C8AA6E;
}

/* 历史记录区域 - 3D */
.history-section {
  margin-top: 26px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #E8EAED;
}

.view-all {
  font-size: 13px;
  color: #C8AA6E;
  text-decoration: none;
}

.history-list {
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 10px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
  border-radius: 12px;
  margin-bottom: 8px;
}

.history-item:last-child {
  margin-bottom: 0;
}

.history-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.history-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #2A323C 0%, #1E252E 100%);
  border-radius: 12px;
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.history-icon.deposit svg {
  color: #0ECB81;
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-coin {
  font-size: 15px;
  font-weight: 700;
  color: #F0F2F5;
}

.history-time {
  font-size: 12px;
  color: #6B7684;
}

.history-right {
  text-align: right;
}

.history-amount {
  font-size: 16px;
  font-weight: 700;
  color: #0ECB81;
  font-family: 'SF Mono', Monaco, monospace;
  text-shadow: 0 0 10px rgba(14, 203, 129, 0.3);
}

.history-status {
  font-size: 12px;
  margin-top: 4px;
}

.history-status.status-0 { color: #C8AA6E; }
.history-status.status-1 { color: #0ECB81; }
.history-status.status-2 { color: #F6465D; }

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.empty-state p {
  font-size: 14px;
  color: #7A8494;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(200, 170, 110, 0.2);
  border-top-color: #C8AA6E;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
