<template>
  <div class="agx-page">
    <!-- 统计卡片 -->
    <div class="agx-data-panel">
      <div class="agx-stat-card">
        <div class="stat-label">在售产品</div>
        <div class="stat-value">{{ stats.activeCount }}</div>
        <div class="stat-desc">个产品</div>
      </div>
      <div class="agx-stat-card">
        <div class="stat-label">总销售额</div>
        <div class="stat-value">{{ stats.totalSold }}<span class="stat-suffix">USDT</span></div>
      </div>
      <div class="agx-stat-card">
        <div class="stat-label">今日收益</div>
        <div class="stat-value income-value">{{ stats.todayIncome }}<span class="stat-suffix">USDT</span></div>
      </div>
      <div class="agx-stat-card">
        <div class="stat-label">持仓用户</div>
        <div class="stat-value">{{ stats.holdingUsers }}</div>
        <div class="stat-desc">人</div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="agx-search-bar">
      <a-input 
        v-model="searchForm.keyword" 
        placeholder="产品名称" 
        allow-clear 
        style="width: 180px"
      >
        <template #prefix><icon-search /></template>
      </a-input>
      <a-select v-model="searchForm.type" placeholder="产品类型" allow-clear style="width: 120px">
        <a-option value="flexible">活期</a-option>
        <a-option value="fixed">定期</a-option>
      </a-select>
      <a-select v-model="searchForm.status" placeholder="状态" allow-clear style="width: 120px">
        <a-option :value="1">启用中</a-option>
        <a-option :value="0">已禁用</a-option>
      </a-select>
      <a-button type="primary" @click="handleSearch">
        <template #icon><icon-search /></template>
        搜索
      </a-button>
      <a-button @click="handleReset">
        <template #icon><icon-refresh /></template>
        重置
      </a-button>
      <div class="flex-1"></div>
      <a-button type="primary" @click="handleAdd">
        <template #icon><icon-plus /></template>
        新增产品
      </a-button>
    </div>

    <!-- 数据表格 -->
    <div class="agx-card agx-table">
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        row-key="id"
        :scroll="{ x: 1400 }"
      >
        <template #columns>
          <a-table-column title="ID" data-index="id" :width="60" />
          <a-table-column title="产品信息" :width="200">
            <template #cell="{ record }">
              <div class="product-cell">
                <div class="product-name">
                  {{ record.name }}
                  <span class="hot-badge" v-if="record.isHot">HOT</span>
                </div>
                <div class="product-meta">
                  <span class="type-tag" :class="record.type">
                    {{ record.type === 'flexible' ? '活期' : '定期' }}
                  </span>
                  <span v-if="record.type === 'fixed'" class="lock-days">
                    {{ record.lockDays }}天
                  </span>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="投入/产出" :width="140" align="center">
            <template #cell="{ record }">
              <div class="coin-pair">
                <span class="coin-tag invest">AGX</span>
                <icon-arrow-right class="arrow-icon" />
                <span class="coin-tag income">USDT</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="日收益率" :width="100" align="center">
            <template #cell="{ record }">
              <span class="rate-value">{{ record.dailyRate }}%</span>
            </template>
          </a-table-column>
          <a-table-column title="投资限额" :width="150">
            <template #cell="{ record }">
              <div class="limit-cell">
                <div class="limit-row">
                  <span class="label">最小:</span>
                  <span class="value">{{ formatNumber(record.minAmount) }}</span>
                </div>
                <div class="limit-row" v-if="record.maxAmount">
                  <span class="label">最大:</span>
                  <span class="value">{{ formatNumber(record.maxAmount) }}</span>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="额度/已售" :width="180">
            <template #cell="{ record }">
              <div class="quota-cell">
                <div class="quota-bar">
                  <div 
                    class="quota-progress" 
                    :style="{ width: getQuotaPercent(record) + '%' }"
                  ></div>
                </div>
                <div class="quota-text">
                  {{ formatNumber(record.soldAmount || 0) }} / {{ record.totalQuota ? formatNumber(record.totalQuota) : '不限' }}
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="购买方式" :width="100" align="center">
            <template #cell="{ record }">
              <span class="pay-tag agx">AGX</span>
            </template>
          </a-table-column>
          <a-table-column title="排序" data-index="sortOrder" :width="70" align="center" />
          <a-table-column title="状态" :width="90" align="center">
            <template #cell="{ record }">
              <a-switch 
                :model-value="record.status === 1" 
                @change="(val) => handleToggleStatus(record, val)"
                size="small"
              />
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="140" fixed="right" align="center">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEdit(record)">
                  <icon-edit /> 编辑
                </a-button>
                <a-popconfirm 
                  content="确定删除该产品？删除后不可恢复" 
                  @ok="handleDelete(record)"
                  type="warning"
                >
                  <a-button type="text" status="danger" size="small">
                    <icon-delete /> 删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑项目' : '新增项目'"
      :width="720"
      @ok="handleSubmit"
      @cancel="modalVisible = false"
      ok-text="确认"
      cancel-text="取消"
      class="agx-modal pool-modal"
      :body-style="{ maxHeight: '70vh', overflowY: 'auto', padding: '16px 20px' }"
    >
      <a-form :model="form" layout="vertical" class="agx-form compact-form">
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="section-title">基本信息</div>
          <a-row :gutter="12">
            <a-col :span="12">
              <a-form-item label="项目名称" required>
                <a-input v-model="form.name" placeholder="如：AQE™智核2代" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="排序">
                <a-input-number v-model="form.sortOrder" :min="0" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="区域">
                <a-select v-model="form.region" placeholder="选择区域" allow-clear>
                  <a-option value="智能甄选">智能甄选</a-option>
                  <a-option value="高收益区">高收益区</a-option>
                  <a-option value="稳健区">稳健区</a-option>
                  <a-option value="新手区">新手区</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="12">
            <a-col :span="12">
              <a-form-item label="项目图片">
                <a-input v-model="form.image" placeholder="图片URL地址" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="机器人租金">
                <a-input-number v-model="form.robotRent" :min="0" :precision="2" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="机器人有效期(天)">
                <a-input-number v-model="form.robotDays" :min="1" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <!-- 收益设置 -->
        <div class="form-section">
          <div class="section-title">收益设置</div>
          <a-row :gutter="12">
            <a-col :span="8">
              <a-form-item label="最小收益比(%)">
                <a-input-number v-model="form.minRate" :min="0" :precision="2" :step="0.01" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="最大收益比(%)">
                <a-input-number v-model="form.maxRate" :min="0" :precision="2" :step="0.01" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="日收益率(%)">
                <a-input v-model="form.dailyRate" placeholder="如：0.5" />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <!-- 投资设置 -->
        <div class="form-section">
          <div class="section-title">投资设置</div>
          <a-row :gutter="12">
            <a-col :span="8">
              <a-form-item label="进度百分比(%)">
                <a-input-number v-model="form.progress" :min="0" :max="100" :precision="2" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="最小投资" required>
                <a-input-number v-model="form.minAmount" :min="0" :precision="2" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="最大投资">
                <a-input-number v-model="form.maxAmount" :min="0" :precision="2" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="12">
            <a-col :span="8">
              <a-form-item label="最大投资次数">
                <a-input-number v-model="form.maxInvestCount" :min="0" style="width: 100%" placeholder="0为不限" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="份数">
                <a-input-number v-model="form.shares" :min="0" :precision="2" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="投资周期">
                <a-input-group>
                  <a-input-number v-model="form.investDays" :min="0" style="width: 60%" />
                  <a-select v-model="form.cycleUnit" style="width: 40%">
                    <a-option value="day">天</a-option>
                    <a-option value="hour">小时</a-option>
                  </a-select>
                </a-input-group>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="12">
            <a-col :span="12">
              <a-form-item label="开始时间">
                <a-date-picker v-model="form.startTime" show-time style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="结束时间">
                <a-date-picker v-model="form.endTime" show-time style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <!-- 额外奖励设置 -->
        <div class="form-section">
          <div class="section-title">额外奖励设置</div>
          
          <!-- 奖励设置紧凑网格 -->
          <div class="bonus-compact-grid">
            <!-- 最低购买等级 -->
            <div class="bonus-card" :class="{ active: form.vipLevels && form.vipLevels[0] !== 'all' }">
              <div class="bonus-card-header">
                <span class="bonus-card-name">最低购买等级</span>
                <a-select v-model="form.vipLevels" size="small" style="width: 130px" :default-value="['all']">
                  <a-option :value="['all']">不限</a-option>
                  <a-option :value="['0']">V0 启蒙会员</a-option>
                  <a-option :value="['1']">V1 准入会员</a-option>
                  <a-option :value="['2']">V2 优选会员</a-option>
                  <a-option :value="['3']">V3 资本合伙人</a-option>
                  <a-option :value="['4']">V4 执行官</a-option>
                  <a-option :value="['5']">V5 主权合伙人</a-option>
                </a-select>
              </div>
              <div class="bonus-card-hint">选择后该等级及以上可购买，奖励按用户实际等级发放</div>
            </div>

            <!-- 红包奖励 -->
            <div class="bonus-card" :class="{ active: form.enableRedpacket }">
              <div class="bonus-card-header">
                <a-switch v-model="form.enableRedpacket" :checked-value="1" :unchecked-value="0" size="small" />
                <span class="bonus-card-name">红包奖励</span>
                <template v-if="form.enableRedpacket">
                  <a-radio-group v-model="form.redpacketType" size="mini">
                    <a-radio value="percent">%</a-radio>
                    <a-radio value="fixed">固定</a-radio>
                  </a-radio-group>
                  <a-input-number v-if="form.redpacketType === 'percent'" v-model="form.redpacketPercent" :min="0" :precision="2" size="small" style="width: 70px" />
                  <a-input-number v-else v-model="form.redpacketAmount" :min="0" :precision="2" size="small" style="width: 70px" />
                </template>
              </div>
              <div class="bonus-card-hint" v-if="form.enableRedpacket">买入产品后直接赠送到账户</div>
            </div>

            <!-- 合约分红 -->
            <div class="bonus-card" :class="{ active: form.enableDividend }">
              <div class="bonus-card-header">
                <a-switch v-model="form.enableDividend" :checked-value="1" :unchecked-value="0" size="small" />
                <span class="bonus-card-name">合约分红</span>
                <template v-if="form.enableDividend">
                  <a-input-number v-model="form.dividendPercent" :min="0" :precision="2" size="small" style="width: 70px" />
                  <span class="bonus-card-unit">%</span>
                </template>
              </div>
              <div class="bonus-card-hint" v-if="form.enableDividend">产品本金到期后，按购买金额百分比返利</div>
            </div>

            <!-- 经验倍数 -->
            <div class="bonus-card" :class="{ active: form.enableDoubleExp }">
              <div class="bonus-card-header">
                <a-switch v-model="form.enableDoubleExp" :checked-value="1" :unchecked-value="0" size="small" />
                <span class="bonus-card-name">经验倍数</span>
                <template v-if="form.enableDoubleExp">
                  <a-input-number v-model="form.doubleExpMultiplier" :min="1" :max="10" :precision="1" size="small" style="width: 70px" />
                  <span class="bonus-card-unit">倍</span>
                </template>
              </div>
              <div class="bonus-card-hint" v-if="form.enableDoubleExp">建仓金额按倍数计算经验值（1U = 1经验 × 倍数）</div>
            </div>

            <!-- 层级返利 -->
            <div class="bonus-card" :class="{ active: form.enableLevelCommission }">
              <div class="bonus-card-header">
                <a-switch v-model="form.enableLevelCommission" :checked-value="1" :unchecked-value="0" size="small" />
                <span class="bonus-card-name">层级返利</span>
                <template v-if="form.enableLevelCommission">
                  <a-input-number v-model="form.levelCommissionRate" :min="0" :max="50" :precision="2" size="small" style="width: 70px" />
                  <span class="bonus-card-unit">%</span>
                </template>
              </div>
              <div class="bonus-card-hint" v-if="form.enableLevelCommission">上级获得下级每日收益的百分比，直到项目到期</div>
            </div>

            <!-- 复购补贴 -->
            <div class="bonus-card" :class="{ active: form.enableRepurchase }">
              <div class="bonus-card-header">
                <a-switch v-model="form.enableRepurchase" :checked-value="1" :unchecked-value="0" size="small" />
                <span class="bonus-card-name">复购补贴</span>
                <template v-if="form.enableRepurchase">
                  <a-radio-group v-model="form.repurchaseType" size="mini">
                    <a-radio value="percent">%</a-radio>
                    <a-radio value="fixed">固定</a-radio>
                  </a-radio-group>
                  <a-input-number v-if="form.repurchaseType === 'percent'" v-model="form.repurchasePercent" :min="0" :precision="2" size="small" style="width: 70px" />
                  <a-input-number v-else v-model="form.repurchaseAmount" :min="0" :precision="2" size="small" style="width: 70px" />
                </template>
              </div>
              <div class="bonus-card-hint" v-if="form.enableRepurchase">仅限有项目到期的老用户享受，新手除外</div>
            </div>
          </div>
        </div>

        <!-- 其他设置 -->
        <div class="form-section">
          <div class="section-title">其他设置</div>
          <a-row :gutter="12">
            <a-col :span="6">
              <a-form-item label="热门标签">
                <a-switch v-model="form.isHot" :checked-value="1" :unchecked-value="0" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="上架状态">
                <a-switch v-model="form.status" :checked-value="1" :unchecked-value="0">
                  <template #checked>上架</template>
                  <template #unchecked>下架</template>
                </a-switch>
              </a-form-item>
            </a-col>
          </a-row>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import agxApi from '@/api/agx'

const loading = ref(false)
const tableData = ref([])
const modalVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)

// 统计数据
const stats = reactive({
  activeCount: 0,
  totalSold: '0.00',
  todayIncome: '0.00',
  holdingUsers: 0
})

// 获取统计数据
const fetchStats = async () => {
  try {
    const res = await agxApi.getPoolStats()
    if (res.code === 0 && res.data) {
      Object.assign(stats, res.data)
    }
  } catch (e) {
    console.error('获取统计数据失败:', e)
  }
}

const searchForm = reactive({
  keyword: '',
  type: undefined,
  status: undefined
})

const form = reactive({
  name: '',
  coinId: undefined,
  incomeCoinId: undefined,
  type: 'flexible',
  lockDays: 0,
  dailyRate: '',
  minAmount: '',
  maxAmount: '',
  totalQuota: '',
  payCurrencies: ['USDT'],
  isHot: 0,
  sortOrder: 0,
  status: 1,
  // 新增字段
  image: '',
  region: '',
  robotRent: 0,
  robotDays: 7,
  minRate: 0,
  maxRate: 0,
  maxInvestCount: 0,
  vipLevels: ['all'],
  shares: 0,
  investDays: 0,
  startTime: '',
  endTime: '',
  progress: 0,
  cycleUnit: 'day',
  // 红包设置
  enableRedpacket: 0,
  redpacketType: 'percent',
  redpacketPercent: 0,
  redpacketAmount: 0,
  // 分红设置
  enableDividend: 0,
  dividendPercent: 0,
  // 双倍经验
  enableDoubleExp: 0,
  doubleExpMultiplier: 2,
  // 层级返利
  enableLevelCommission: 0,
  levelCommissionRate: 0,
  // 复购补贴
  enableRepurchase: 0,
  repurchaseType: 'percent',
  repurchasePercent: 0,
  repurchaseAmount: 0,
  // VIP智能增益
  enableVipBonus: 0,
  vipBonusRates: { vip0: 0, vip1: 0, vip2: 0, vip3: 0, vip4: 0, vip5: 0 }
})

// 币种列表
const coinList = ref([])
const coinMap = ref({})

// 格式化数字
const formatNumber = (num) => {
  if (!num) return '0'
  return parseFloat(num).toLocaleString()
}

// 计算额度百分比
const getQuotaPercent = (record) => {
  if (!record.totalQuota) return 0
  const sold = parseFloat(record.soldAmount || 0)
  const total = parseFloat(record.totalQuota)
  return Math.min(100, (sold / total) * 100)
}

// 获取币种列表
const fetchCoins = async () => {
  try {
    const res = await agxApi.getCurrencyList()
    if (res.code === 0) {
      coinList.value = res.data?.list || res.data || []
      coinMap.value = {}
      coinList.value.forEach(coin => {
        coinMap.value[coin.id] = coin.symbol
      })
    }
  } catch (e) {
    console.error('获取币种列表失败:', e)
    coinList.value = [
      { id: 1, symbol: 'AGX' },
      { id: 2, symbol: 'USDT' }
    ]
    coinMap.value = { 1: 'AGX', 2: 'USDT' }
  }
}

const getCoinSymbol = (coinId) => {
  return coinMap.value[coinId] || `ID:${coinId}`
}

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await agxApi.getPoolList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      type: searchForm.type || undefined,
      status: searchForm.status
    })
    if (res.code === 0) {
      tableData.value = res.data?.list || res.list || []
      pagination.total = res.data?.total || res.total || 0
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.type = undefined
  searchForm.status = undefined
  pagination.current = 1
  fetchData()
}

const onPageChange = (page) => {
  pagination.current = page
  fetchData()
}

const onPageSizeChange = (size) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchData()
}

const resetForm = () => {
  Object.assign(form, {
    name: '',
    coinId: coinList.value[0]?.id || 1,
    incomeCoinId: undefined,
    type: 'flexible',
    lockDays: 0,
    dailyRate: '',
    minAmount: '',
    maxAmount: '',
    totalQuota: '',
    payCurrencies: ['USDT'],
    isHot: 0,
    sortOrder: 0,
    status: 1,
    // 新增字段
    image: '',
    region: '',
    robotRent: 0,
    robotDays: 7,
    minRate: 0,
    maxRate: 0,
    maxInvestCount: 0,
    vipLevels: ['all'],
    shares: 0,
    investDays: 0,
    startTime: '',
    endTime: '',
    progress: 0,
    cycleUnit: 'day',
    // 红包设置
    enableRedpacket: 0,
    redpacketType: 'percent',
    redpacketPercent: 0,
    redpacketAmount: 0,
    // 分红设置
    enableDividend: 0,
    dividendPercent: 0,
    // 双倍经验
    enableDoubleExp: 0,
    doubleExpMultiplier: 2,
    // 层级返利
    enableLevelCommission: 0,
    levelCommissionRate: 0,
    // 复购补贴
    enableRepurchase: 0,
    repurchaseType: 'percent',
    repurchasePercent: 0,
    repurchaseAmount: 0,
    // VIP智能增益
    enableVipBonus: 0,
    vipBonusRates: { vip0: 0, vip1: 0, vip2: 0, vip3: 0, vip4: 0, vip5: 0 }
  })
}

const handleAdd = () => {
  resetForm()
  isEdit.value = false
  editId.value = null
  modalVisible.value = true
}

const handleEdit = (record) => {
  // 解析vipBonusRates，可能是JSON字符串
  let vipRates = { vip0: 0, vip1: 0, vip2: 0, vip3: 0, vip4: 0, vip5: 0 }
  if (record.vipBonusRates) {
    if (typeof record.vipBonusRates === 'string') {
      try {
        vipRates = JSON.parse(record.vipBonusRates)
      } catch (e) {
        console.error('解析vipBonusRates失败', e)
      }
    } else {
      vipRates = record.vipBonusRates
    }
  }
  
  Object.assign(form, {
    name: record.name,
    coinId: record.coinId,
    incomeCoinId: record.incomeCoinId || undefined,
    type: record.type,
    lockDays: record.lockDays,
    dailyRate: record.dailyRate,
    minAmount: record.minAmount,
    maxAmount: record.maxAmount || '',
    totalQuota: record.totalQuota || '',
    payCurrencies: record.payCurrencies ? record.payCurrencies.split(',') : ['USDT'],
    isHot: record.isHot,
    sortOrder: record.sortOrder,
    status: record.status,
    // 新增字段
    image: record.image || '',
    region: record.region || '',
    robotRent: record.robotRent || 0,
    robotDays: record.robotDays || 7,
    minRate: record.minRate || 0,
    maxRate: record.maxRate || 0,
    maxInvestCount: record.maxInvestCount || 0,
    vipLevels: record.vipLevels ? record.vipLevels.split(',') : ['all'],
    shares: record.shares || 0,
    investDays: record.investDays || 0,
    startTime: record.startTime || '',
    endTime: record.endTime || '',
    progress: record.progress || 0,
    cycleUnit: record.cycleUnit || 'day',
    // 红包设置
    enableRedpacket: record.enableRedpacket || 0,
    redpacketType: record.redpacketType || 'percent',
    redpacketPercent: record.redpacketPercent || 0,
    redpacketAmount: record.redpacketAmount || 0,
    // 分红设置
    enableDividend: record.enableDividend || 0,
    dividendPercent: record.dividendPercent || 0,
    // 双倍经验
    enableDoubleExp: record.enableDoubleExp || 0,
    doubleExpMultiplier: record.doubleExpMultiplier || 2,
    // 层级返利
    enableLevelCommission: record.enableLevelCommission || 0,
    levelCommissionRate: record.levelCommissionRate || 0,
    // 复购补贴
    enableRepurchase: record.enableRepurchase || 0,
    repurchaseType: record.repurchaseType || 'percent',
    repurchasePercent: record.repurchasePercent || 0,
    repurchaseAmount: record.repurchaseAmount || 0,
    // VIP智能增益
    enableVipBonus: record.enableVipBonus || 0,
    vipBonusRates: vipRates
  })
  isEdit.value = true
  editId.value = record.id
  modalVisible.value = true
}

const handleSubmit = async () => {
  if (!form.name || !form.minAmount) {
    Message.warning('请填写完整信息')
    return
  }
  try {
    const submitData = {
      ...form,
      payCurrencies: form.payCurrencies.join(','),
      vipLevels: form.vipLevels.join(','),
      vipBonusRates: JSON.stringify(form.vipBonusRates)
    }
    let res
    if (isEdit.value) {
      res = await agxApi.updatePool(editId.value, submitData)
    } else {
      res = await agxApi.createPool(submitData)
    }
    if (res.code === 0) {
      Message.success(isEdit.value ? '更新成功' : '创建成功')
      modalVisible.value = false
      fetchData()
    }
  } catch (e) {
    console.error(e)
  }
}

const handleToggleStatus = async (record, status) => {
  try {
    const res = await agxApi.updatePool(record.id, { status: status ? 1 : 0 })
    if (res.code === 0) {
      Message.success(status ? '已上架' : '已下架')
      fetchData()
    }
  } catch (e) {
    Message.error('操作失败')
  }
}

const handleDelete = async (record) => {
  try {
    const res = await agxApi.deletePool(record.id)
    if (res.code === 0) {
      Message.success('删除成功')
      fetchData()
    }
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchCoins()
  fetchData()
  fetchStats()
})
</script>

<style lang="less" scoped>
.agx-page {
  .agx-page-header {
    margin-bottom: 20px;
    
    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--agx-text-primary, #1D2129);
      margin: 0 0 4px 0;
    }
    
    .page-desc {
      font-size: 13px;
      color: var(--agx-text-tertiary, #86909C);
      margin: 0;
    }
  }
}

.flex-1 {
  flex: 1;
}

// 统计卡片样式
.income-value {
  color: var(--agx-success, #52C41A) !important;
}

.stat-desc {
  font-size: 12px;
  color: var(--agx-text-tertiary, #86909C);
  margin-top: 4px;
}

// 产品单元格
.product-cell {
  .product-name {
    font-weight: 500;
    color: var(--agx-text-primary, #1D2129);
    display: flex;
    align-items: center;
    gap: 6px;
    
    .hot-badge {
      font-size: 10px;
      padding: 1px 4px;
      background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
      color: white;
      border-radius: 3px;
      font-weight: 600;
    }
  }
  
  .product-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    
    .type-tag {
      font-size: 11px;
      padding: 1px 6px;
      border-radius: 3px;
      
      &.flexible {
        background: rgba(24, 144, 255, 0.1);
        color: var(--agx-info, #1890FF);
      }
      
      &.fixed {
        background: rgba(114, 46, 209, 0.1);
        color: #722ED1;
      }
    }
    
    .lock-days {
      font-size: 12px;
      color: var(--agx-text-tertiary, #86909C);
    }
  }
}

// 币种对
.coin-pair {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  .coin-tag {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: 500;
    
    &.invest {
      background: var(--agx-primary-bg, rgba(212, 168, 75, 0.08));
      color: var(--agx-primary, #D4A84B);
    }
    
    &.income {
      background: rgba(82, 196, 26, 0.1);
      color: var(--agx-success, #52C41A);
    }
  }
  
  .arrow-icon {
    font-size: 12px;
    color: var(--agx-text-disabled, #C9CDD4);
  }
}

// 收益率
.rate-value {
  font-weight: 600;
  color: var(--agx-success, #52C41A);
  font-size: 14px;
}

// 限额单元格
.limit-cell {
  .limit-row {
    display: flex;
    gap: 4px;
    font-size: 12px;
    line-height: 1.6;
    
    .label {
      color: var(--agx-text-tertiary, #86909C);
    }
    
    .value {
      color: var(--agx-text-primary, #1D2129);
    }
  }
}

// 额度单元格
.quota-cell {
  .quota-bar {
    height: 6px;
    background: var(--agx-bg-tertiary, #F2F3F5);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 4px;
    
    .quota-progress {
      height: 100%;
      background: linear-gradient(90deg, var(--agx-primary, #D4A84B) 0%, var(--agx-primary-light, #E8C876) 100%);
      border-radius: 3px;
      transition: width 0.3s;
    }
  }
  
  .quota-text {
    font-size: 12px;
    color: var(--agx-text-secondary, #4E5969);
  }
}

// 支付标签
.pay-tag {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
  
  &.agx {
    background: var(--agx-primary-bg, rgba(212, 168, 75, 0.08));
    color: var(--agx-primary, #D4A84B);
  }
  
  &.usdt {
    background: rgba(82, 196, 26, 0.1);
    color: var(--agx-success, #52C41A);
  }
  
  &.cny {
    background: rgba(250, 173, 20, 0.1);
    color: var(--agx-warning, #FAAD14);
  }
}

// 表单分区（紧凑布局）
.form-section {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--agx-border-light, #F2F3F5);

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
  
  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--agx-text-primary, #1D2129);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
  }
  
  .form-hint {
    font-size: 12px;
    color: var(--agx-text-tertiary, #86909C);
    margin-bottom: 8px;
    margin-top: -4px;
  }

  :deep(.arco-form-item) {
    margin-bottom: 10px;
  }

  :deep(.arco-form-item-label) {
    font-size: 12px;
    margin-bottom: 4px;
  }
}

// 紧凑表单样式
.compact-form {
  :deep(.arco-input),
  :deep(.arco-input-number),
  :deep(.arco-select-view-single),
  :deep(.arco-picker) {
    height: 32px;
    font-size: 13px;
  }

  :deep(.arco-radio),
  :deep(.arco-checkbox) {
    font-size: 13px;
  }
}

// VIP选择器
.vip-level-selector {
  .arco-checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .arco-checkbox {
    margin-right: 0;
    padding: 6px 12px;
    border: 1px solid var(--agx-border, #E5E6EB);
    border-radius: 4px;
    transition: all 0.2s;
    
    &:hover {
      border-color: var(--agx-primary, #D4A84B);
    }
    
    &.arco-checkbox-checked {
      background: var(--agx-primary-bg, rgba(212, 168, 75, 0.08));
      border-color: var(--agx-primary, #D4A84B);
    }
  }
}

.vip-hint {
  font-size: 12px;
  color: var(--agx-text-tertiary, #86909C);
  margin-top: 8px;
}

.vip-bonus-hint {
  font-size: 12px;
  color: var(--agx-text-tertiary, #86909C);
  margin-bottom: 16px;
}

// 紧凑奖励卡片网格
.bonus-compact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.bonus-card {
  padding: 10px 12px;
  background: var(--agx-bg-secondary, #FAFAFA);
  border-radius: 6px;
  border: 1px solid var(--agx-border-light, #F2F3F5);
  transition: all 0.2s;
  
  &.active {
    background: var(--agx-primary-bg, rgba(212, 168, 75, 0.06));
    border-color: var(--agx-primary, #D4A84B);
  }
  
  .bonus-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    
    .bonus-card-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--agx-text-primary, #1D2129);
      min-width: 70px;
    }
    
    .bonus-card-unit {
      font-size: 12px;
      color: var(--agx-text-tertiary, #86909C);
    }
    
    :deep(.arco-radio-group) {
      display: flex;
      gap: 4px;
    }
    
    :deep(.arco-radio) {
      margin-right: 0;
      font-size: 11px;
      padding: 0 4px;
    }
  }
  
  .bonus-card-hint {
    font-size: 11px;
    color: var(--agx-text-tertiary, #86909C);
    margin-top: 6px;
    line-height: 1.4;
  }
}
</style>
