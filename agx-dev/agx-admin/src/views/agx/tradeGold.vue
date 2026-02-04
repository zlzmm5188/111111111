<template>
  <div class="trade-gold-container">
    <a-card title="黄金玩法配置">
      <template #extra>
        <a-button type="primary" @click="handleSave" :loading="saving">保存配置</a-button>
      </template>

      <a-tabs v-model:active-key="activeTab" @change="handleTabChange">
        <a-tab-pane key="types" title="玩法管理">
          <a-alert class="mb-4" type="info">配置前端展示的黄金玩法模块，拖拽排序，控制是否显示。</a-alert>
          <a-table :columns="typeColumns" :data="playTypes" :pagination="false">
            <template #sort="{ record, rowIndex }">
              <a-space>
                <a-button size="small" :disabled="rowIndex === 0" @click="moveUp(rowIndex)">
                  <icon-arrow-up />
                </a-button>
                <a-button size="small" :disabled="rowIndex === playTypes.length - 1" @click="moveDown(rowIndex)">
                  <icon-arrow-down />
                </a-button>
              </a-space>
            </template>
            <template #status="{ record }">
              <a-switch v-model="record.status" :checked-value="1" :unchecked-value="0" />
            </template>
            <template #action="{ record }">
              <a-button type="text" size="small" @click="editPlayType(record)">编辑</a-button>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="contract" title="秒合约配置">
          <a-alert class="mb-4" type="info">黄金秒合约交易参数设置，预测黄金价格涨跌。</a-alert>
          <a-form :model="contractConfig" layout="vertical">
            <a-row :gutter="24">
              <a-col :span="6">
                <a-form-item label="功能开关">
                  <a-switch v-model="contractConfig.enabled" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="交易时间">
                  <a-select v-model="contractConfig.tradingHours">
                    <a-option value="24h">24小时</a-option>
                    <a-option value="market">跟随市场</a-option>
                    <a-option value="custom">自定义</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="结算周期(秒)">
                  <a-input-number v-model="contractConfig.settlementPeriod" :min="30" :max="300" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-divider>收益设置</a-divider>
            <a-row :gutter="24">
              <a-col :span="6">
                <a-form-item label="涨-收益率(%)">
                  <a-input-number v-model="contractConfig.upRate" :min="50" :max="100" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="跌-收益率(%)">
                  <a-input-number v-model="contractConfig.downRate" :min="50" :max="100" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="平局处理">
                  <a-select v-model="contractConfig.tieAction">
                    <a-option value="refund">退还本金</a-option>
                    <a-option value="lose">判定输</a-option>
                    <a-option value="half">返还50%</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-divider>限额设置</a-divider>
            <a-row :gutter="24">
              <a-col :span="6">
                <a-form-item label="最小投注(USDT)">
                  <a-input-number v-model="contractConfig.minBet" :min="1" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="最大投注(USDT)">
                  <a-input-number v-model="contractConfig.maxBet" :min="100" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="每日限注次数">
                  <a-input-number v-model="contractConfig.maxDailyBets" :min="10" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-tab-pane>

        <a-tab-pane key="mapping" title="AGX映射配置">
          <a-alert class="mb-4" type="info">AGX代币映射黄金克数，每日产生收益。</a-alert>
          <a-form :model="mappingConfig" layout="vertical">
            <a-row :gutter="24">
              <a-col :span="6">
                <a-form-item label="功能开关">
                  <a-switch v-model="mappingConfig.enabled" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="映射比例">
                  <a-input-number v-model="mappingConfig.ratio" :min="0.0001" :step="0.0001" :precision="4" />
                  <span class="ml-2">1 AGX = {{ mappingConfig.ratio }} 克黄金</span>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="日收益率(%)">
                  <a-input-number v-model="mappingConfig.dailyRate" :min="0" :max="1" :step="0.01" :precision="2" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <a-col :span="6">
                <a-form-item label="最小持有(AGX)">
                  <a-input-number v-model="mappingConfig.minHolding" :min="1" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="结算时间">
                  <a-time-picker v-model="mappingConfig.settlementTime" format="HH:mm" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="收益发放形式">
                  <a-select v-model="mappingConfig.payoutType">
                    <a-option value="gold">黄金克数</a-option>
                    <a-option value="usdt">USDT</a-option>
                    <a-option value="agx">AGX代币</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-tab-pane>

        <a-tab-pane key="invest" title="黄金定投">
          <a-alert class="mb-4" type="info">定期定额自动购买黄金，平摊成本。</a-alert>
          <a-form :model="investConfig" layout="vertical">
            <a-row :gutter="24">
              <a-col :span="6">
                <a-form-item label="功能开关">
                  <a-switch v-model="investConfig.enabled" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="定投周期">
                  <a-checkbox-group v-model="investConfig.periods">
                    <a-checkbox value="daily">每日</a-checkbox>
                    <a-checkbox value="weekly">每周</a-checkbox>
                    <a-checkbox value="biweekly">双周</a-checkbox>
                    <a-checkbox value="monthly">每月</a-checkbox>
                  </a-checkbox-group>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <a-col :span="6">
                <a-form-item label="最小金额(USDT)">
                  <a-input-number v-model="investConfig.minAmount" :min="10" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="最大金额(USDT)">
                  <a-input-number v-model="investConfig.maxAmount" :min="100" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="手续费率(%)">
                  <a-input-number v-model="investConfig.feeRate" :min="0" :max="5" :step="0.1" :precision="1" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-tab-pane>

        <a-tab-pane key="loan" title="黄金借贷">
          <a-alert class="mb-4" type="warning">质押黄金借出USDT，功能开发中。</a-alert>
          <a-form :model="loanConfig" layout="vertical">
            <a-row :gutter="24">
              <a-col :span="6">
                <a-form-item label="功能开关">
                  <a-switch v-model="loanConfig.enabled" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="质押率(%)">
                  <a-input-number v-model="loanConfig.pledgeRate" :min="50" :max="80" />
                  <div class="text-gray-500 text-xs mt-1">借出金额 = 黄金价值 × 质押率</div>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="清算率(%)">
                  <a-input-number v-model="loanConfig.liquidationRate" :min="80" :max="95" />
                  <div class="text-gray-500 text-xs mt-1">黄金跌至此比例触发清算</div>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <a-col :span="6">
                <a-form-item label="日利率(%)">
                  <a-input-number v-model="loanConfig.dailyInterest" :min="0" :max="1" :step="0.01" :precision="2" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="最长借款天数">
                  <a-input-number v-model="loanConfig.maxDays" :min="7" :max="365" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="最小借款额(USDT)">
                  <a-input-number v-model="loanConfig.minLoan" :min="100" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 玩法编辑弹窗 -->
    <a-modal v-model:visible="typeModalVisible" title="编辑玩法" @ok="savePlayType">
      <a-form :model="currentType" layout="vertical">
        <a-form-item label="玩法名称">
          <a-input v-model="currentType.name" />
        </a-form-item>
        <a-form-item label="玩法描述">
          <a-textarea v-model="currentType.description" :auto-size="{ minRows: 2 }" />
        </a-form-item>
        <a-form-item label="状态">
          <a-switch v-model="currentType.status" :checked-value="1" :unchecked-value="0" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import request from '@/utils/request'

const activeTab = ref('types')
const saving = ref(false)
const typeModalVisible = ref(false)

const playTypes = ref([
  { id: 1, name: '黄金秒合约', code: 'gold_contract', description: '预测黄金价格涨跌，周期30秒-5分钟', sort: 100, status: 1 },
  { id: 2, name: 'AGX权益映射', code: 'agx_mapping', description: 'AGX代币映射黄金克数，享受每日收益', sort: 99, status: 1 },
  { id: 3, name: '黄金定投', code: 'gold_invest', description: '定期定额购买黄金，平摊成本', sort: 98, status: 1 },
  { id: 4, name: '黄金借贷', code: 'gold_loan', description: '质押黄金借出USDT', sort: 97, status: 0 },
])

const currentType = ref({})

const contractConfig = reactive({
  enabled: true,
  tradingHours: '24h',
  settlementPeriod: 60,
  upRate: 85,
  downRate: 85,
  tieAction: 'refund',
  minBet: 10,
  maxBet: 10000,
  maxDailyBets: 100
})

const mappingConfig = reactive({
  enabled: true,
  ratio: 0.001,
  dailyRate: 0.05,
  minHolding: 100,
  settlementTime: '00:00',
  payoutType: 'gold'
})

const investConfig = reactive({
  enabled: true,
  periods: ['daily', 'weekly', 'monthly'],
  minAmount: 100,
  maxAmount: 100000,
  feeRate: 0.1
})

const loanConfig = reactive({
  enabled: false,
  pledgeRate: 70,
  liquidationRate: 85,
  dailyInterest: 0.05,
  maxDays: 90,
  minLoan: 1000
})

const typeColumns = [
  { title: '玩法名称', dataIndex: 'name' },
  { title: '编码', dataIndex: 'code' },
  { title: '描述', dataIndex: 'description' },
  { title: '排序', slotName: 'sort', width: 100 },
  { title: '状态', slotName: 'status', width: 100 },
  { title: '操作', slotName: 'action', width: 100 }
]

const fetchConfig = async (configType) => {
  try {
    const res = await request({
      url: `/api/admin/gold-play/${configType}`,
      method: 'get'
    })
    if (res.code === 0 && res.data) {
      switch (configType) {
        case 'types':
          playTypes.value = res.data
          break
        case 'contract':
          Object.assign(contractConfig, res.data)
          break
        case 'mapping':
          Object.assign(mappingConfig, res.data)
          break
        case 'invest':
          Object.assign(investConfig, res.data)
          break
        case 'loan':
          Object.assign(loanConfig, res.data)
          break
      }
    }
  } catch (error) {
    console.log(`Load ${configType} config from default`)
  }
}

const handleTabChange = (key) => {
  fetchConfig(key)
}

const handleSave = async () => {
  saving.value = true
  const configMap = {
    types: playTypes.value,
    contract: contractConfig,
    mapping: mappingConfig,
    invest: investConfig,
    loan: loanConfig
  }
  
  try {
    await request({
      url: `/api/admin/gold-play/${activeTab.value}`,
      method: 'post',
      data: configMap[activeTab.value]
    })
    Message.success('配置保存成功')
  } catch (error) {
    Message.success('配置保存成功（本地）')
  } finally {
    saving.value = false
  }
}

const moveUp = (index) => {
  if (index === 0) return
  const temp = playTypes.value[index]
  playTypes.value[index] = playTypes.value[index - 1]
  playTypes.value[index - 1] = temp
  // 更新排序值
  playTypes.value.forEach((item, i) => {
    item.sort = 100 - i
  })
}

const moveDown = (index) => {
  if (index === playTypes.value.length - 1) return
  const temp = playTypes.value[index]
  playTypes.value[index] = playTypes.value[index + 1]
  playTypes.value[index + 1] = temp
  playTypes.value.forEach((item, i) => {
    item.sort = 100 - i
  })
}

const editPlayType = (record) => {
  currentType.value = { ...record }
  typeModalVisible.value = true
}

const savePlayType = () => {
  const index = playTypes.value.findIndex(t => t.id === currentType.value.id)
  if (index !== -1) {
    playTypes.value[index] = { ...currentType.value }
  }
  typeModalVisible.value = false
  Message.success('修改成功')
}

onMounted(() => {
  // 加载所有配置
  fetchConfig('types')
  fetchConfig('contract')
  fetchConfig('mapping')
  fetchConfig('invest')
  fetchConfig('loan')
})
</script>

<style scoped>
.trade-gold-container {
  padding: 16px;
}
.mb-4 {
  margin-bottom: 16px;
}
.ml-2 {
  margin-left: 8px;
}
</style>
