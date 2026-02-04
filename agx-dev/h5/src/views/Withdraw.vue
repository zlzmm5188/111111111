<template>
  <PageLayout :title="$t('withdraw.title')" :show-back="true">
    <template #navbar-right>
      <router-link to="/orders?type=withdraw" class="header-btn">
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
            <span class="coin-name">TRC20</span>
          </div>
        </div>
        <div class="coin-balance">
          <span class="balance-label">{{ $t('withdraw.available') }}</span>
          <span class="balance-value">{{ loading ? '...' : balance.available }}</span>
        </div>
      </div>

      <!-- 未绑定地址时的提示（已移除强制绑定要求） -->

      <!-- 提币表单 -->
      <template v-if="true">
        <!-- 提币地址 -->
        <div class="form-section">
          <div class="form-label">{{ $t('withdraw.withdrawAddress') }}</div>
          <!-- 已绑定地址显示 -->
          <div v-if="boundAddress" class="bound-address-display">
            <span class="address-text">{{ maskedAddress }}</span>
            <span class="bound-badge">已绑定</span>
          </div>
          <!-- 手动输入地址 -->
          <div v-else class="input-wrap">
            <input 
              type="text" 
              v-model="manualAddress" 
              placeholder="请输入TRC20提币地址"
              maxlength="50"
            >
          </div>
          <div class="address-tip" v-if="boundAddress">提币将自动转入您绑定的地址</div>
          <div class="address-tip" v-else>请输入正确的TRC20钱包地址</div>
        </div>

        <!-- 提币金额 -->
        <div class="form-section">
          <div class="label-row">
            <span class="form-label">{{ $t('withdraw.withdrawAmount') }}</span>
            <button class="max-btn" @click="setMax">{{ $t('withdraw.withdrawAll') }}</button>
          </div>
          <div class="input-wrap">
            <input 
              type="number" 
              v-model="amount" 
              :placeholder="$t('withdraw.inputAmount')"
              :min="withdrawConfig.minAmount"
              :max="balance.available"
              step="0.01"
            >
            <span class="input-suffix">{{ selectedCoin.symbol }}</span>
          </div>
          <div class="amount-hint" v-if="amount && parseFloat(amount) > 0">
            <span>{{ $t('withdraw.minMaxHint', { min: withdrawConfig.minAmount, max: withdrawConfig.maxAmount }) }}</span>
          </div>
        </div>

        <!-- 手续费信息 -->
        <div class="fee-card">
          <div class="fee-row">
            <span class="fee-label">{{ $t('withdraw.fee') }} ({{ withdrawConfig.feeRatePercent }})</span>
            <span class="fee-value">{{ displayFee }} USDT</span>
          </div>
          <div class="fee-row highlight">
            <span class="fee-label">{{ $t('withdraw.actualArrival') }}</span>
            <span class="fee-amount">{{ actualAmount }} {{ selectedCoin.symbol }}</span>
          </div>
        </div>

        <!-- 注意事项 -->
        <div class="notice-card">
          <div class="notice-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            注意事项
          </div>
          <ul class="notice-list">
            <li>提币将自动转入您绑定的TRC20地址</li>
            <li>如需修改提币地址，请在设置中更换绑定地址</li>
            <li>单笔最小提现: {{ withdrawConfig.minAmount }} USDT</li>
            <li>手续费: {{ withdrawConfig.feeRatePercent }}</li>
            <li>提现需要人工审核，预计1-24小时内到账</li>
          </ul>
        </div>
      </template>
    
      <!-- 提币记录 -->
      <div class="history-section">
        <div class="section-header">
          <span class="section-title">{{ $t('withdraw.withdrawHistory') }}</span>
          <router-link to="/orders?type=withdraw" class="view-all">{{ $t('withdraw.viewAll') }}</router-link>
        </div>
        <div v-if="historyLoading" class="empty-state">
          <div class="loading-spinner"></div>
        </div>
        <div v-else-if="withdrawHistory.length === 0" class="empty-state">
          <p>{{ $t('withdraw.noHistory') }}</p>
        </div>
        <div v-else class="history-list">
          <div v-for="item in withdrawHistory" :key="item.id" class="history-item">
            <div class="history-left">
              <div class="history-icon withdraw">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 21V9M7 14l5-5 5 5"/>
                </svg>
              </div>
              <div class="history-info">
                <div class="history-coin">{{ item.coin }}</div>
                <div class="history-time">{{ item.createdAt }}</div>
              </div>
            </div>
            <div class="history-right">
              <div class="history-amount">-{{ item.amount }}</div>
              <div class="history-status" :style="{ color: getStatusColor(item.status) }">
                {{ getStatusText(item.status) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="bottom-btn">
        <button 
          class="submit-btn" 
          @click="handleWithdraw"
          :disabled="submitLoading || !amount"
        >
          <span v-if="submitLoading" class="btn-loading"></span>
          {{ submitLoading ? $t('withdraw.submitting') : $t('withdraw.submit') }}
        </button>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { alert, showSuccess, showError } from '../utils/alert'
import PageLayout from '../components/layout/PageLayout.vue'
import { api } from '../utils/api'
import { withTradePassword, getTradePasswordStatus } from '../utils/tradePassword'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const submitLoading = ref(false)
const selectedNetwork = ref('TRC20')
const amount = ref('')
const balance = ref({
  available: '0',
  frozen: '0'
})
const withdrawHistory = ref([])
const historyLoading = ref(false)

// 绑定地址相关
const boundAddress = ref('')
const hasBoundAddress = ref(false)
const manualAddress = ref('')  // 手动输入的提现地址

const selectedCoin = ref({
  symbol: 'USDT',
  name: 'Tether'
})

// 脱敏后的地址
const maskedAddress = computed(() => {
  if (!boundAddress.value) return ''
  const addr = boundAddress.value
  if (addr.length <= 12) return addr
  return addr.slice(0, 6) + '****' + addr.slice(-6)
})

// 提现配置（从后端获取）
const withdrawConfig = ref({
  minAmount: 10,
  maxAmount: 10000,
  feeRate: 0.01,
  feeRatePercent: '1%',
})

// 获取提现配置
const getWithdrawConfig = async () => {
  try {
    const res = await api.account.getWithdrawConfig()
    if (res.success && res.data) {
      withdrawConfig.value = {
        minAmount: res.data.minAmount || 10,
        maxAmount: res.data.maxAmount || 10000,
        feeRate: res.data.feeRate || 0.01,
        feeRatePercent: res.data.feeRatePercent || '1%',
      }
    }
  } catch (error) {
    console.error('获取提现配置失败:', error)
  }
}

// 计算实际到账金额（使用后端配置的手续费率）
const actualAmount = computed(() => {
  const val = parseFloat(amount.value) || 0
  if (val <= 0) return '0.00'
  const fee = val * withdrawConfig.value.feeRate
  return Math.max(0, val - fee).toFixed(2)
})

// 计算手续费（展示用，使用后端配置）
const displayFee = computed(() => {
  const val = parseFloat(amount.value) || 0
  if (val <= 0) return '0.00'
  return (val * withdrawConfig.value.feeRate).toFixed(2)
})

// 获取用户余额和绑定地址
const getBalance = async () => {
  loading.value = true
  try {
    // 并行获取余额和用户信息
    const [balanceRes, profileRes] = await Promise.all([
      api.account.balance(),
      api.account.profile()
    ])
    
    // 处理余额（直接使用 balance，不再减 locked）
    if (balanceRes.success) {
      const assets = balanceRes.data.assets || balanceRes.data.list || []
      const usdtAsset = assets.find(a => (a.symbol || a.currency || a.coin) === 'USDT')
      if (usdtAsset) {
        balance.value = {
          available: parseFloat(usdtAsset.balance || usdtAsset.available || 0).toFixed(2),
          frozen: parseFloat(usdtAsset.locked || usdtAsset.frozen || 0).toFixed(2)
        }
      }
    }
    
    // 从 profile 获取绑定的提现地址
    if (profileRes.success && profileRes.data) {
      boundAddress.value = profileRes.data.tronAddress || ''
      hasBoundAddress.value = !!boundAddress.value
    }
  } catch (error) {
    console.error('获取信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取提现记录
const getWithdrawHistory = async () => {
  historyLoading.value = true
  try {
    const response = await api.account.getWithdrawHistory({
      coin: selectedCoin.value.symbol,
      page: 1,
      pageSize: 5
    })
    
    if (response.success) {
      withdrawHistory.value = response.data.list || []
      // 如果有提现历史记录，说明用户曾经绑定过地址
      if (withdrawHistory.value.length > 0) {
        hasBoundAddress.value = true
      }
    }
  } catch (error) {
    console.error('获取提现记录失败:', error)
  } finally {
    historyLoading.value = false
  }
}

// 设置最大金额
const setMax = () => {
  const available = parseFloat(balance.value.available)
  if (available <= 0) {
    alert('可用余额不足')
    return
  }
  amount.value = available.toFixed(2)
}

// 跳转绑定地址
const goBindAddress = () => {
  router.push('/settings')
}

// 验证提现金额
const validateAmount = (amt) => {
  const numAmount = parseFloat(amt)
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, message: '请输入有效的提现金额' }
  }
  
  if (numAmount < withdrawConfig.value.minAmount) {
    return { valid: false, message: `最小提现金额为 ${withdrawConfig.value.minAmount} USDT` }
  }
  
  if (numAmount > withdrawConfig.value.maxAmount) {
    return { valid: false, message: `最大提现金额为 ${withdrawConfig.value.maxAmount} USDT` }
  }
  
  const available = parseFloat(balance.value.available)
  if (numAmount > available) {
    return { valid: false, message: `可用余额不足，当前可用: ${balance.value.available} USDT` }
  }
  
  // 检查扣除手续费后是否还有余额
  const actual = numAmount - withdrawConfig.value.fee
  if (actual <= 0) {
    return { valid: false, message: '提现金额需大于手续费' }
  }
  
  return { valid: true }
}

// 提交提现申请
const handleWithdraw = async () => {
  if (submitLoading.value) return
  
  // 检查提现地址（支持绑定地址或手动输入）
  const withdrawAddress = boundAddress.value || manualAddress.value
  if (!withdrawAddress) {
    await alert('请输入提币地址')
    return
  }
  
  // 验证金额
  const amountValidation = validateAmount(amount.value)
  if (!amountValidation.valid) {
    await alert(amountValidation.message)
    return
  }
  
  try {
    // 检查是否设置了交易密码
    const status = await getTradePasswordStatus()
    if (!status.hasTradePassword) {
      await alert('请先设置交易密码')
      router.push('/settings')
      return
    }
    
    // 使用交易密码验证包装器执行提现
    const result = await withTradePassword(async (password) => {
      submitLoading.value = true
      
      const response = await api.account.withdraw({
        coin: selectedCoin.value.symbol,
        chain: 'TRC20',
        amount: amount.value,
        address: boundAddress.value || manualAddress.value,  // 使用绑定或手动输入地址
        tradePassword: password
      })
      
      if (response.success) {
        showSuccess(t('withdraw.withdrawSuccess') || '提现申请已提交，请等待审核')
        amount.value = ''
        await getBalance()
        await getWithdrawHistory()
        return true
      } else {
        throw new Error(response.message || t('withdraw.withdrawFailed') || '提现申请失败')
      }
    }, {
      title: t('withdraw.confirmWithdraw') || '确认提币',
      tip: `提现 ${amount.value} USDT 到 ${maskedAddress.value}`
    })
    
    if (result === null) {
      return
    }
  } catch (error) {
    if (error.message === '用户取消') return
    console.error('提现失败:', error)
    showError(error.message || t('withdraw.withdrawFailed') || '提现失败，请稍后重试')
  } finally {
    submitLoading.value = false
  }
}

// 格式化提现状态
const getStatusText = (status) => {
  const statusMap = {
    0: t('withdraw.statusPending'),
    1: t('withdraw.statusProcessing'),
    2: t('withdraw.statusCompleted'),
    3: t('withdraw.statusRejected'),
    4: t('withdraw.statusCancelled')
  }
  return statusMap[status] || t('common.noData')
}

// 格式化提现状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    0: 'var(--text-tertiary)',
    1: 'var(--color-brand)',
    2: 'var(--color-up)',
    3: 'var(--color-down)',
    4: 'var(--text-tertiary)'
  }
  return colorMap[status] || 'var(--text-tertiary)'
}

// 页面加载时获取数据
onMounted(async () => {
  await getWithdrawConfig()
  await getBalance()
  await getWithdrawHistory()
})
</script>

<style scoped>
/* ==================== Pro Max 3D 风格 ==================== */
.header-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C8AA6E;
  background: transparent;
  border: none;
  border-radius: 10px;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding: 16px;
  padding-bottom: calc(90px + env(safe-area-inset-bottom, 16px));
  background: #0D1117;
  min-height: calc(100vh - 56px);
}

.page-content::-webkit-scrollbar { display: none; }

/* 币种选择器 - 3D 立体卡片 */
.coin-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.coin-selector::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.1) 70%, transparent 100%);
}

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

.coin-balance {
  text-align: right;
}

.balance-label {
  display: block;
  font-size: 12px;
  color: #7A8494;
  margin-bottom: 4px;
}

.balance-value {
  font-size: 18px;
  font-weight: 700;
  color: #F0F2F5;
  font-family: 'SF Mono', Monaco, monospace;
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
  white-space: nowrap;
}

/* 绑定地址显示 - 3D */
.bound-address-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(14, 203, 129, 0.2);
  border-radius: 14px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.bound-address-display .address-text {
  font-size: 14px;
  font-family: 'SF Mono', Monaco, monospace;
  color: #E8EAED;
  letter-spacing: 0.5px;
}

.bound-badge {
  padding: 5px 10px;
  background: linear-gradient(135deg, rgba(14, 203, 129, 0.2) 0%, rgba(14, 203, 129, 0.1) 100%);
  border: 1px solid rgba(14, 203, 129, 0.3);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #0ECB81;
}

.address-tip {
  margin-top: 10px;
  font-size: 12px;
  color: #6B7684;
}

/* 表单区域 */
.form-section {
  margin-bottom: 20px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #8B95A5;
  margin-bottom: 12px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.max-btn {
  font-size: 14px;
  color: #C8AA6E;
  background: none;
  border: none;
  font-weight: 700;
  -webkit-tap-highlight-color: transparent;
}

/* 输入框 - 3D 凹陷效果 */
.input-wrap {
  display: flex;
  align-items: center;
  background: linear-gradient(145deg, #141A22 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 0 18px;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 -1px 0 rgba(255, 255, 255, 0.03);
  transition: all 0.2s;
}

.input-wrap:focus-within {
  border-color: rgba(200, 170, 110, 0.4);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 0 3px rgba(200, 170, 110, 0.1);
}

.input-wrap input {
  flex: 1;
  padding: 16px 0;
  background: transparent;
  border: none;
  color: #F0F2F5;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', monospace;
  font-size: 18px;
  font-weight: 600;
  outline: none;
}

.input-wrap input::placeholder {
  color: #4A5260;
  font-weight: 400;
  font-size: 14px;
}

.input-suffix {
  font-size: 15px;
  font-weight: 600;
  color: #7A8494;
}

.amount-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #6B7684;
}

/* 手续费卡片 - 3D */
.fee-card {
  padding: 20px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.fee-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.1) 70%, transparent 100%);
}

.fee-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}

.fee-label {
  font-size: 14px;
  color: #7A8494;
}

.fee-value {
  font-size: 14px;
  color: #A0A8B4;
  font-family: 'SF Mono', Monaco, monospace;
}

.fee-row.highlight {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin-top: 10px;
  padding-top: 18px;
}

.fee-amount {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, #F0D78C 0%, #C8AA6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'SF Mono', Monaco, monospace;
}

/* 注意事项 - 3D */
.notice-card {
  padding: 18px;
  background: linear-gradient(145deg, rgba(246, 70, 93, 0.08) 0%, rgba(246, 70, 93, 0.04) 100%);
  border: 1px solid rgba(246, 70, 93, 0.2);
  border-radius: 16px;
  margin-bottom: 24px;
}

.notice-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  color: #F6465D;
  margin-bottom: 14px;
}

.notice-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notice-list li {
  font-size: 13px;
  color: #E87C7C;
  padding: 7px 0;
  padding-left: 18px;
  position: relative;
  line-height: 1.5;
}

.notice-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  font-weight: bold;
  color: #F6465D;
}

/* 历史记录 - 3D */
.history-section {
  margin-bottom: 24px;
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
  font-weight: 600;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  border-radius: 12px;
  background: linear-gradient(145deg, #2A323C 0%, #1E252E 100%);
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.history-icon.withdraw {
  color: #F6465D;
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
  color: #F6465D;
  font-family: 'SF Mono', Monaco, monospace;
}

.history-status {
  font-size: 12px;
  margin-top: 4px;
}

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
  margin: 14px 0 0;
  font-size: 14px;
  color: #7A8494;
}

/* 底部按钮 */
.bottom-btn {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 428px;
  padding: 16px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(13, 17, 23, 0) 0%, #0D1117 20%);
}

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

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
  box-shadow: 
    0 3px 8px rgba(200, 170, 110, 0.25),
    inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

.submit-btn:disabled {
  opacity: 0.5;
  box-shadow: none;
}

.btn-loading {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(13, 17, 23, 0.3);
  border-top-color: #0D1117;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
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