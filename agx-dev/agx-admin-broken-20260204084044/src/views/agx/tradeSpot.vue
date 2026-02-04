<template>
  <div class="trade-spot-container">
    <a-card title="现货交易配置">
      <!-- Tab切换 -->
      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="pairs" title="交易对管理" />
        <a-tab-pane key="fees" title="手续费配置" />
        <a-tab-pane key="limits" title="交易限制" />
        <a-tab-pane key="settings" title="全局设置" />
      </a-tabs>

      <!-- 交易对管理 -->
      <template v-if="activeTab === 'pairs'">
        <div class="mb-4">
          <a-row :gutter="16">
            <a-col :span="6">
              <a-input v-model="searchForm.keyword" placeholder="交易对名称" allow-clear />
            </a-col>
            <a-col :span="4">
              <a-select v-model="searchForm.status" placeholder="状态" allow-clear style="width: 100%">
                <a-option value="1">已开放</a-option>
                <a-option value="0">已关闭</a-option>
              </a-select>
            </a-col>
            <a-col :span="6">
              <a-space>
                <a-button type="primary" @click="handleSearch">搜索</a-button>
                <a-button type="primary" status="success" @click="handleAddPair">添加交易对</a-button>
              </a-space>
            </a-col>
          </a-row>
        </div>
        
        <a-table :columns="pairColumns" :data="pairData" :loading="loading">
          <template #status="{ record }">
            <a-switch v-model="record.status" :checked-value="1" :unchecked-value="0" @change="(val) => handlePairStatusChange(record, val)" />
          </template>
          <template #action="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleEditPair(record)">编辑</a-button>
              <a-popconfirm content="确定删除该交易对？" @ok="handleDeletePair(record)">
                <a-button type="text" size="small" status="danger">删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table>
      </template>

      <!-- 手续费配置 -->
      <template v-if="activeTab === 'fees'">
        <a-alert class="mb-4">手续费按用户等级区分，等级越高手续费越低</a-alert>
        <a-table :columns="feeColumns" :data="feeData">
          <template #makerFee="{ record }">
            <a-input-number v-model="record.makerFee" :precision="4" :min="0" :max="1" size="small" style="width: 100px" />
          </template>
          <template #takerFee="{ record }">
            <a-input-number v-model="record.takerFee" :precision="4" :min="0" :max="1" size="small" style="width: 100px" />
          </template>
        </a-table>
        <div class="mt-4">
          <a-button type="primary" @click="handleSaveFees">保存手续费配置</a-button>
        </div>
      </template>

      <!-- 交易限制 -->
      <template v-if="activeTab === 'limits'">
        <a-form :model="limitForm" layout="vertical">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="单笔最小交易额(USDT)">
                <a-input-number v-model="limitForm.minOrderAmount" :min="0" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="单笔最大交易额(USDT)">
                <a-input-number v-model="limitForm.maxOrderAmount" :min="0" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="24小时最大交易次数">
                <a-input-number v-model="limitForm.maxDailyOrders" :min="0" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="24小时最大交易额(USDT)">
                <a-input-number v-model="limitForm.maxDailyAmount" :min="0" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="新用户交易冷却期(小时)">
                <a-input-number v-model="limitForm.newUserCooldown" :min="0" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="未KYC用户限制">
                <a-switch v-model="limitForm.kycRequired" />
                <span class="ml-2">{{ limitForm.kycRequired ? '需要KYC才能交易' : '无需KYC' }}</span>
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item>
            <a-button type="primary" @click="handleSaveLimits">保存限制配置</a-button>
          </a-form-item>
        </a-form>
      </template>

      <!-- 全局设置 -->
      <template v-if="activeTab === 'settings'">
        <a-form :model="settingsForm" layout="vertical">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item label="现货交易开关">
                <a-switch v-model="settingsForm.spotEnabled" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="市价单开关">
                <a-switch v-model="settingsForm.marketOrderEnabled" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="限价单开关">
                <a-switch v-model="settingsForm.limitOrderEnabled" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="价格精度(小数位)">
                <a-input-number v-model="settingsForm.pricePrecision" :min="0" :max="18" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="数量精度(小数位)">
                <a-input-number v-model="settingsForm.amountPrecision" :min="0" :max="18" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="撮合模式">
                <a-radio-group v-model="settingsForm.matchMode">
                  <a-radio value="mock">模拟撮合(Mock)</a-radio>
                  <a-radio value="real">真实撮合</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="行情数据源">
                <a-select v-model="settingsForm.dataSource" style="width: 100%">
                  <a-option value="mock">Mock数据</a-option>
                  <a-option value="binance">Binance</a-option>
                  <a-option value="okx">OKX</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item>
            <a-button type="primary" @click="handleSaveSettings">保存全局设置</a-button>
          </a-form-item>
        </a-form>
      </template>
    </a-card>

    <!-- 添加/编辑交易对弹窗 -->
    <a-modal v-model:visible="pairModalVisible" :title="isEditPair ? '编辑交易对' : '添加交易对'" @ok="handleSubmitPair">
      <a-form :model="pairForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="基础货币" required>
              <a-select v-model="pairForm.baseCoin" placeholder="选择基础货币">
                <a-option value="BTC">BTC</a-option>
                <a-option value="ETH">ETH</a-option>
                <a-option value="USDT">USDT</a-option>
                <a-option value="AGX">AGX</a-option>
                <a-option value="BNB">BNB</a-option>
                <a-option value="SOL">SOL</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="计价货币" required>
              <a-select v-model="pairForm.quoteCoin" placeholder="选择计价货币">
                <a-option value="USDT">USDT</a-option>
                <a-option value="BTC">BTC</a-option>
                <a-option value="ETH">ETH</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="最小交易量">
              <a-input-number v-model="pairForm.minQty" :min="0" :precision="8" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="手续费率">
              <a-input-number v-model="pairForm.tradeFee" :min="0" :max="0.1" :precision="4" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="价格精度">
              <a-input-number v-model="pairForm.pricePrecision" :min="0" :max="18" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="数量精度">
              <a-input-number v-model="pairForm.qtyPrecision" :min="0" :max="18" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="排序权重">
              <a-input-number v-model="pairForm.sortOrder" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="开放状态">
              <a-switch v-model="pairForm.status" :checked-value="1" :unchecked-value="0" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import api from '@/api/agx/index.js'

const loading = ref(false)
const activeTab = ref('pairs')
const pairModalVisible = ref(false)
const isEditPair = ref(false)
const currentEditId = ref(null)

const searchForm = reactive({
  keyword: '',
  status: ''
})

const pairForm = reactive({
  symbol: '',
  baseCoin: '',
  quoteCoin: '',
  minQty: 0.0001,
  maxQty: 0,
  pricePrecision: 2,
  qtyPrecision: 4,
  tradeFee: 0.002,
  sortOrder: 0,
  status: 1
})

const limitForm = reactive({
  minOrderAmount: 10,
  maxOrderAmount: 100000,
  maxDailyOrders: 100,
  maxDailyAmount: 500000,
  newUserCooldown: 24,
  kycRequired: true
})

const settingsForm = reactive({
  spotEnabled: true,
  marketOrderEnabled: true,
  limitOrderEnabled: true,
  pricePrecision: 8,
  amountPrecision: 8,
  matchMode: 'mock',
  dataSource: 'mock'
})

const pairColumns = [
  { title: '交易对', dataIndex: 'symbol', width: 120 },
  { title: '基础货币', dataIndex: 'baseCoin', width: 100 },
  { title: '计价货币', dataIndex: 'quoteCoin', width: 100 },
  { title: '价格精度', dataIndex: 'pricePrecision', width: 100 },
  { title: '数量精度', dataIndex: 'qtyPrecision', width: 100 },
  { title: '最小交易量', dataIndex: 'minQty', width: 120 },
  { title: '手续费率', dataIndex: 'tradeFee', width: 100 },
  { title: '排序', dataIndex: 'sortOrder', width: 80 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '操作', slotName: 'action', width: 120, fixed: 'right' }
]

const feeColumns = [
  { title: '用户等级', dataIndex: 'level', width: 120 },
  { title: 'Maker手续费', dataIndex: 'makerFee', slotName: 'makerFee', width: 150 },
  { title: 'Taker手续费', dataIndex: 'takerFee', slotName: 'takerFee', width: 150 },
  { title: '说明', dataIndex: 'description', width: 200 }
]

const pairData = ref([])
const feeData = ref([
  { level: '普通用户', makerFee: 0.001, takerFee: 0.001, description: '基础手续费' },
  { level: '银牌会员', makerFee: 0.0009, takerFee: 0.0009, description: '9折优惠' },
  { level: '金牌会员', makerFee: 0.0008, takerFee: 0.0008, description: '8折优惠' },
  { level: '钻石会员', makerFee: 0.0006, takerFee: 0.0006, description: '6折优惠' },
  { level: '黑金会员', makerFee: 0.0004, takerFee: 0.0004, description: '4折优惠' },
])

const fetchTradingPairs = async () => {
  loading.value = true
  try {
    const res = await api.getTradingPairs({ status: searchForm.status || undefined })
    if (res.code === 0 && res.data) {
      pairData.value = res.data.list || []
    }
  } catch (error) {
    console.error('获取交易对失败:', error)
    Message.error('获取交易对失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  fetchTradingPairs()
}

const handleAddPair = () => {
  isEditPair.value = false
  currentEditId.value = null
  Object.assign(pairForm, {
    symbol: '',
    baseCoin: '',
    quoteCoin: '',
    minQty: 0.0001,
    maxQty: 0,
    pricePrecision: 2,
    qtyPrecision: 4,
    tradeFee: 0.002,
    sortOrder: 0,
    status: 1
  })
  pairModalVisible.value = true
}

const handleEditPair = (record) => {
  isEditPair.value = true
  currentEditId.value = record.id
  Object.assign(pairForm, {
    symbol: record.symbol,
    baseCoin: record.baseCoin,
    quoteCoin: record.quoteCoin,
    minQty: record.minQty,
    maxQty: record.maxQty,
    pricePrecision: record.pricePrecision,
    qtyPrecision: record.qtyPrecision,
    tradeFee: record.tradeFee,
    sortOrder: record.sortOrder,
    status: record.status
  })
  pairModalVisible.value = true
}

const handleSubmitPair = async () => {
  if (!pairForm.baseCoin || !pairForm.quoteCoin) {
    Message.warning('请填写完整信息')
    return
  }
  
  const submitData = {
    symbol: `${pairForm.baseCoin}/${pairForm.quoteCoin}`,
    baseCoin: pairForm.baseCoin,
    quoteCoin: pairForm.quoteCoin,
    minQty: pairForm.minQty,
    maxQty: pairForm.maxQty || null,
    pricePrecision: pairForm.pricePrecision,
    qtyPrecision: pairForm.qtyPrecision,
    tradeFee: pairForm.tradeFee,
    sortOrder: pairForm.sortOrder,
    status: pairForm.status
  }
  
  try {
    if (isEditPair.value) {
      await api.updateTradingPair(currentEditId.value, submitData)
      Message.success('更新成功')
    } else {
      await api.createTradingPair(submitData)
      Message.success('添加成功')
    }
    pairModalVisible.value = false
    fetchTradingPairs()
  } catch (error) {
    console.error('操作失败:', error)
    Message.error(error.message || '操作失败')
  }
}

const handleDeletePair = async (record) => {
  try {
    await api.deleteTradingPair(record.id)
    Message.success(`已删除 ${record.symbol}`)
    fetchTradingPairs()
  } catch (error) {
    Message.error(error.message || '删除失败')
  }
}

const handlePairStatusChange = async (record, val) => {
  try {
    await api.updateTradingPair(record.id, { status: val })
    Message.success(val ? '已开放交易' : '已关闭交易')
  } catch (error) {
    Message.error('状态更新失败')
    record.status = val ? 0 : 1 // 回滚状态
  }
}

const handleSaveFees = () => {
  Message.success('手续费配置已保存')
}

const handleSaveLimits = () => {
  Message.success('交易限制配置已保存')
}

const handleSaveSettings = () => {
  Message.success('全局设置已保存')
}

onMounted(() => {
  fetchTradingPairs()
})
</script>

<style scoped>
.trade-spot-container {
  padding: 16px;
}
.mb-4 {
  margin-bottom: 16px;
}
.mt-4 {
  margin-top: 16px;
}
.ml-2 {
  margin-left: 8px;
}
</style>
