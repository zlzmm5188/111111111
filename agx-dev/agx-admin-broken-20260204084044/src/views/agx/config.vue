<template>
  <div class="ma-content-block p-4">
    <a-tabs default-active-key="basic">
      <!-- 基础配置 -->
      <a-tab-pane key="basic" title="基础配置">
        <a-card :bordered="false">
          <a-form :model="basicConfig" layout="vertical">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="平台名称">
                  <a-input v-model="basicConfig.platform_name" @blur="saveConfig('platform_name', basicConfig.platform_name)" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="客服链接">
                  <a-input v-model="basicConfig.customer_service_url" @blur="saveConfig('customer_service_url', basicConfig.customer_service_url)" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="官网地址">
                  <a-input v-model="basicConfig.website_url" @blur="saveConfig('website_url', basicConfig.website_url)" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-card>
      </a-tab-pane>

      <!-- 提现配置 -->
      <a-tab-pane key="withdraw" title="提现配置">
        <a-card :bordered="false">
          <a-form :model="withdrawConfig" layout="vertical">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="最小提现金额(USDT)">
                  <a-input-number v-model="withdrawConfig.withdraw_min_amount" :min="0" @blur="saveConfig('withdraw_min_amount', withdrawConfig.withdraw_min_amount)" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="提现手续费率(%)">
                  <a-input-number v-model="withdrawConfig.withdraw_fee_rate" :min="0" :max="100" :precision="2" @blur="saveConfig('withdraw_fee_rate', withdrawConfig.withdraw_fee_rate)" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="每日提现限额">
                  <a-input-number v-model="withdrawConfig.withdraw_daily_limit" :min="0" @blur="saveConfig('withdraw_daily_limit', withdrawConfig.withdraw_daily_limit)" style="width: 100%" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-card>
      </a-tab-pane>

      <!-- 合约配置 -->
      <a-tab-pane key="contract" title="合约配置">
        <a-card :bordered="false">
          <a-form :model="contractConfig" layout="vertical">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="默认用户胜率(%)">
                  <a-input-number v-model="contractConfig.default_win_rate" :min="0" :max="100" @blur="saveConfig('default_win_rate', contractConfig.default_win_rate)" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="最小下单金额">
                  <a-input-number v-model="contractConfig.contract_min_amount" :min="0" @blur="saveConfig('contract_min_amount', contractConfig.contract_min_amount)" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="最大下单金额">
                  <a-input-number v-model="contractConfig.contract_max_amount" :min="0" @blur="saveConfig('contract_max_amount', contractConfig.contract_max_amount)" style="width: 100%" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-card>
      </a-tab-pane>

      <!-- 邀请配置 -->
      <a-tab-pane key="invite" title="邀请配置">
        <a-card :bordered="false">
          <a-form :model="inviteConfig" layout="vertical">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="一级返佣比例(%)">
                  <a-input-number v-model="inviteConfig.invite_level1_rate" :min="0" :max="100" :precision="2" @blur="saveConfig('invite_level1_rate', inviteConfig.invite_level1_rate)" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="二级返佣比例(%)">
                  <a-input-number v-model="inviteConfig.invite_level2_rate" :min="0" :max="100" :precision="2" @blur="saveConfig('invite_level2_rate', inviteConfig.invite_level2_rate)" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="三级返佣比例(%)">
                  <a-input-number v-model="inviteConfig.invite_level3_rate" :min="0" :max="100" :precision="2" @blur="saveConfig('invite_level3_rate', inviteConfig.invite_level3_rate)" style="width: 100%" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-card>
      </a-tab-pane>

      <!-- AGX配置 -->
      <a-tab-pane key="agx" title="AGX配置">
        <a-card :bordered="false">
          <a-form :model="agxConfig" layout="vertical">
            <!-- 倒计时配置（最重要，放最前面） -->
            <div class="config-section">
              <div class="section-header">
                <span class="section-icon">⏰</span>
                <span class="section-title">认购倒计时</span>
              </div>
              <a-row :gutter="16" align="center">
                <a-col :span="6">
                  <a-form-item label="倒计时开关">
                    <a-switch 
                      v-model="agxConfig.countdown_enabled" 
                      @change="handleCountdownSwitch"
                      checked-text="开启" 
                      unchecked-text="关闭"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="10" v-if="agxConfig.countdown_enabled">
                  <a-form-item label="倒计时结束时间">
                    <a-date-picker 
                      v-model="agxConfig.countdown_end_time" 
                      show-time 
                      format="YYYY-MM-DD HH:mm:ss"
                      style="width: 100%" 
                      placeholder="选择倒计时结束时间"
                      @change="saveCountdownTime"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="8" v-if="agxConfig.countdown_enabled && agxConfig.countdown_end_time">
                  <div class="countdown-preview">
                    <div class="preview-label">倒计时预览</div>
                    <div class="preview-value">{{ countdownPreview }}</div>
                  </div>
                </a-col>
              </a-row>
              <div class="config-tip" v-if="!agxConfig.countdown_enabled">
                💡 关闭后，用户可直接购买AGX，无需等待
              </div>
              <div class="config-tip success" v-else>
                ✅ 倒计时进行中，用户需等待倒计时结束后才能购买
              </div>
            </div>

            <a-divider />

            <!-- 认购设置 -->
            <div class="config-section">
              <div class="section-header">
                <span class="section-icon">💰</span>
                <span class="section-title">认购设置</span>
              </div>
              <a-row :gutter="16">
                <a-col :span="8">
                  <a-form-item label="认购价格(USDT)">
                    <a-input-number 
                      v-model="agxConfig.agx_subscription_price" 
                      :min="0" 
                      :precision="4"
                      :step="0.0001"
                      @blur="saveConfig('agx_subscription_price', agxConfig.agx_subscription_price)" 
                      style="width: 100%" 
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="最小认购(USDT)">
                    <a-input-number 
                      v-model="agxConfig.agx_min_subscription" 
                      :min="0" 
                      @blur="saveConfig('agx_min_subscription', agxConfig.agx_min_subscription)" 
                      style="width: 100%" 
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="最大认购(USDT)">
                    <a-input-number 
                      v-model="agxConfig.agx_max_subscription" 
                      :min="0" 
                      @blur="saveConfig('agx_max_subscription', agxConfig.agx_max_subscription)" 
                      style="width: 100%" 
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="16">
                <a-col :span="8">
                  <a-form-item label="认购功能">
                    <a-switch 
                      v-model="agxConfig.agx_subscription_enabled" 
                      @change="saveConfig('agx_subscription_enabled', agxConfig.agx_subscription_enabled ? '1' : '0')"
                      checked-text="开启" 
                      unchecked-text="关闭"
                    />
                    <template #extra>
                      <span class="form-tip">关闭后前端隐藏认购入口</span>
                    </template>
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
          </a-form>
        </a-card>
      </a-tab-pane>

    </a-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import agxApi from '@/api/agx'

const loading = ref(false)
const formVisible = ref(false)
const tableData = ref([])
const searchForm = reactive({ group: undefined })
const form = reactive({ key: '', value: '', configGroup: 'basic', description: '' })

// 分组配置
const basicConfig = reactive({ platform_name: 'AGX', customer_service_url: '', website_url: '' })
const withdrawConfig = reactive({ withdraw_min_amount: 10, withdraw_fee_rate: 1, withdraw_daily_limit: 10000 })
const contractConfig = reactive({ default_win_rate: 50, contract_min_amount: 10, contract_max_amount: 10000 })
const inviteConfig = reactive({ invite_level1_rate: 10, invite_level2_rate: 5, invite_level3_rate: 2 })
const agxConfig = reactive({ 
  agx_subscription_price: 0.065, 
  agx_min_subscription: 100, 
  agx_max_subscription: 100000,
  agx_subscription_enabled: true,
  countdown_enabled: false,
  countdown_end_time: null
})

// 倒计时预览
let countdownTimer = null
const countdownPreview = ref('--天 --:--:--')

const updateCountdownPreview = () => {
  if (!agxConfig.countdown_enabled || !agxConfig.countdown_end_time) {
    countdownPreview.value = '--天 --:--:--'
    return
  }
  const endTime = new Date(agxConfig.countdown_end_time).getTime()
  const now = Date.now()
  const diff = endTime - now
  
  if (diff <= 0) {
    countdownPreview.value = '已结束'
    return
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const secs = Math.floor((diff % (1000 * 60)) / 1000)
  
  countdownPreview.value = `${days}天 ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// 倒计时开关处理
const handleCountdownSwitch = async (val) => {
  try {
    await agxApi.updateConfig('countdown_enabled', { value: val ? '1' : '0' })
    Message.success(val ? '倒计时已开启' : '倒计时已关闭，用户可直接购买')
    if (val) {
      startCountdownTimer()
    } else {
      stopCountdownTimer()
    }
  } catch (e) {
    Message.error('保存失败')
  }
}

// 保存倒计时时间
const saveCountdownTime = async (val) => {
  if (!val) return
  try {
    const timeStr = typeof val === 'string' ? val : new Date(val).toISOString()
    await agxApi.updateConfig('countdown_end_time', { value: timeStr })
    Message.success('倒计时时间已保存')
    updateCountdownPreview()
  } catch (e) {
    Message.error('保存失败')
  }
}

const startCountdownTimer = () => {
  stopCountdownTimer()
  updateCountdownPreview()
  countdownTimer = setInterval(updateCountdownPreview, 1000)
}

const stopCountdownTimer = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

const groupMap = { basic: '基础配置', withdraw: '提现配置', pool: '矿池配置', contract: '合约配置', invite: '邀请配置', agx: 'AGX配置' }
const getGroupName = (group) => groupMap[group] || group

const fetchData = async () => {
  loading.value = true
  try {
    const res = await agxApi.getConfigList({ group: searchForm.group })
    if (res.code === 0) {
      tableData.value = res.data.list || res.data || []
      // 填充分组配置
      tableData.value.forEach(c => {
        if (basicConfig[c.key] !== undefined) basicConfig[c.key] = c.value
        if (withdrawConfig[c.key] !== undefined) withdrawConfig[c.key] = parseFloat(c.value) || c.value
        if (contractConfig[c.key] !== undefined) contractConfig[c.key] = parseFloat(c.value) || c.value
        if (inviteConfig[c.key] !== undefined) inviteConfig[c.key] = parseFloat(c.value) || c.value
        if (c.key === 'agx_subscription_price') agxConfig.agx_subscription_price = parseFloat(c.value) || 0.065
        if (c.key === 'agx_min_subscription') agxConfig.agx_min_subscription = parseFloat(c.value) || 100
        if (c.key === 'agx_max_subscription') agxConfig.agx_max_subscription = parseFloat(c.value) || 100000
        if (c.key === 'agx_subscription_enabled') agxConfig.agx_subscription_enabled = c.value === '1' || c.value === 'true'
        // 倒计时配置
        if (c.key === 'countdown_enabled') agxConfig.countdown_enabled = false // 强制关闭倒计时
        if (c.key === 'countdown_end_time') agxConfig.countdown_end_time = c.value || null
      })
      // 启动倒计时预览
      if (agxConfig.countdown_enabled) {
        startCountdownTimer()
      }
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => fetchData()
const handleReset = () => { searchForm.group = undefined; fetchData() }

const handleAdd = () => {
  form.key = ''
  form.value = ''
  form.configGroup = 'basic'
  form.description = ''
  formVisible.value = true
}

const handleSubmit = async () => {
  if (!form.key || !form.value) {
    Message.warning('请填写配置键和配置值')
    return
  }
  try {
    const res = await agxApi.updateConfig(form.key, {
      value: form.value,
      configGroup: form.configGroup,
      description: form.description
    })
    if (res.code === 0) {
      Message.success('保存成功')
      formVisible.value = false
      fetchData()
    }
  } catch (e) {
    Message.error('保存失败')
  }
}

const handleUpdate = async (record) => {
  try {
    await agxApi.updateConfig(record.key, { value: record.value })
    Message.success('已更新')
  } catch (e) {
    Message.error('更新失败')
  }
}

const saveConfig = async (key, value) => {
  try {
    await agxApi.updateConfig(key, { value: String(value) })
    Message.success('已保存')
  } catch (e) {
    console.error('保存配置失败:', e)
    Message.error('保存失败')
  }
}

onMounted(() => fetchData())
onUnmounted(() => stopCountdownTimer())
</script>

<style scoped>
.form-tip {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.config-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e6eb;
}

.section-icon {
  font-size: 18px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
}

.config-tip {
  padding: 10px 14px;
  background: #f7f8fa;
  border-radius: 6px;
  font-size: 13px;
  color: #86909c;
  margin-top: 8px;
}

.config-tip.success {
  background: #e8ffea;
  color: #00b42a;
}

.countdown-preview {
  padding: 12px 16px;
  background: linear-gradient(135deg, #d4a84b 0%, #b8923f 100%);
  border-radius: 8px;
  text-align: center;
}

.preview-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
}

.preview-value {
  font-size: 18px;
  font-weight: 600;
  color: white;
  font-family: 'SF Mono', Monaco, monospace;
}
</style>
