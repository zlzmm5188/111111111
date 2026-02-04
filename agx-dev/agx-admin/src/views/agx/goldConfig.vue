<template>
  <div class="p-4">
    <a-card title="黄金规则配置" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="handleSave" :loading="saving">
          <template #icon><icon-save /></template>
          保存配置
        </a-button>
      </template>

      <a-tabs default-active-key="basic">
        <!-- 基础配置 -->
        <a-tab-pane key="basic" title="基础配置">
          <a-form :model="basicConfig" layout="vertical" class="max-w-2xl">
            <a-form-item label="黄金单位">
              <a-input v-model="basicConfig.unit" disabled />
              <template #help>系统固定为"克"</template>
            </a-form-item>
            <a-form-item label="最小卖出量(克)">
              <a-input-number v-model="basicConfig.minSell" :min="0.0001" :precision="4" style="width: 200px" />
            </a-form-item>
            <a-form-item label="最大卖出量(克)">
              <a-input-number v-model="basicConfig.maxSell" :min="0" :precision="4" style="width: 200px" />
              <template #help>0表示不限制</template>
            </a-form-item>
            <a-form-item label="卖出手续费(%)">
              <a-input-number v-model="basicConfig.sellFee" :min="0" :max="100" :precision="2" style="width: 200px" />
            </a-form-item>
            <a-form-item label="价格精度(小数位)">
              <a-input-number v-model="basicConfig.priceDecimals" :min="0" :max="8" style="width: 200px" />
            </a-form-item>
            <a-form-item label="卖出功能">
              <a-switch v-model="basicConfig.sellEnabled" />
              <span class="ml-2">{{ basicConfig.sellEnabled ? '已开启' : '已关闭' }}</span>
            </a-form-item>
          </a-form>
        </a-tab-pane>

        <!-- 收益配置 -->
        <a-tab-pane key="income" title="收益配置">
          <a-form :model="incomeConfig" layout="vertical" class="max-w-2xl">
            <a-form-item label="每日收益开关">
              <a-switch v-model="incomeConfig.dailyEnabled" />
              <span class="ml-2">{{ incomeConfig.dailyEnabled ? '已开启' : '已关闭' }}</span>
            </a-form-item>
            <a-form-item label="每日收益率(%)" v-if="incomeConfig.dailyEnabled">
              <a-input-number v-model="incomeConfig.dailyRate" :min="0" :max="10" :precision="4" style="width: 200px" />
              <template #help>每日发放收益 = 持仓克数 × 当日金价 × 收益率</template>
            </a-form-item>
            <a-form-item label="收益结算时间" v-if="incomeConfig.dailyEnabled">
              <a-time-picker v-model="incomeConfig.settleTime" format="HH:mm" style="width: 200px" />
            </a-form-item>
            <a-form-item label="最低持仓要求(克)">
              <a-input-number v-model="incomeConfig.minHolding" :min="0" :precision="4" style="width: 200px" />
              <template #help>持仓低于此值不发放收益</template>
            </a-form-item>
          </a-form>
        </a-tab-pane>

        <!-- 玩法配置 -->
        <a-tab-pane key="gameplay" title="玩法类型">
          <a-alert type="info" class="mb-4">
            配置黄金相关的玩法类型，如秒合约、权益映射等
          </a-alert>
          <a-table :data="gameplayList" :pagination="false">
            <template #columns>
              <a-table-column title="玩法名称" data-index="name" :width="150" />
              <a-table-column title="玩法类型" data-index="type" :width="120">
                <template #cell="{ record }">
                  <a-tag>{{ record.type }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="说明" data-index="description" />
              <a-table-column title="状态" :width="100">
                <template #cell="{ record }">
                  <a-switch v-model="record.enabled" size="small" />
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="100">
                <template #cell="{ record }">
                  <a-button type="text" size="small" @click="editGameplay(record)">编辑</a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- 价格来源 -->
        <a-tab-pane key="price" title="价格来源">
          <a-form :model="priceConfig" layout="vertical" class="max-w-2xl">
            <a-form-item label="价格数据源">
              <a-select v-model="priceConfig.source" style="width: 300px">
                <a-option value="mock">Mock数据(开发测试)</a-option>
                <a-option value="reuters">路透社(Reuters)</a-option>
                <a-option value="bloomberg">彭博(Bloomberg)</a-option>
                <a-option value="goldprice">GoldPrice.org</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="更新频率(秒)">
              <a-input-number v-model="priceConfig.updateInterval" :min="1" :max="3600" style="width: 200px" />
            </a-form-item>
            <a-form-item label="Mock基准价格(美元/盎司)" v-if="priceConfig.source === 'mock'">
              <a-input-number v-model="priceConfig.mockPrice" :min="0" :precision="2" style="width: 200px" />
            </a-form-item>
            <a-form-item label="Mock波动范围(%)" v-if="priceConfig.source === 'mock'">
              <a-input-number v-model="priceConfig.mockRange" :min="0" :max="10" :precision="2" style="width: 200px" />
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import request from '@/utils/request'

const saving = ref(false)
const loading = ref(false)

const basicConfig = reactive({
  unit: '克',
  minSell: 0.1,
  maxSell: 10000,
  sellFee: 0.1,
  priceDecimals: 2,
  sellEnabled: true
})

const incomeConfig = reactive({
  dailyEnabled: true,
  dailyRate: 0.05,
  settleTime: '00:00',
  minHolding: 1
})

const priceConfig = reactive({
  source: 'mock',
  updateInterval: 60,
  mockPrice: 2650,
  mockRange: 0.5
})

const gameplayList = ref([
  { id: 1, name: '黄金秒合约', type: 'contract', description: '基于黄金价格的秒合约交易', enabled: true },
  { id: 2, name: 'AGX权益映射', type: 'mapping', description: 'AGX代币与黄金价值映射', enabled: true },
  { id: 3, name: '黄金定投', type: 'dca', description: '定期自动购买黄金', enabled: false },
  { id: 4, name: '黄金借贷', type: 'lending', description: '以黄金作为抵押借贷', enabled: false },
])

const fetchConfig = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/api/admin/config/list',
      method: 'get',
      params: { group: 'gold' }
    })
    if (res.code === 0 && res.data?.list) {
      res.data.list.forEach(item => {
        const key = item.key.replace('gold_', '')
        if (key === 'min_sell') basicConfig.minSell = Number(item.value)
        else if (key === 'max_sell') basicConfig.maxSell = Number(item.value)
        else if (key === 'sell_fee') basicConfig.sellFee = Number(item.value)
        else if (key === 'price_decimals') basicConfig.priceDecimals = Number(item.value)
        else if (key === 'sell_enabled') basicConfig.sellEnabled = item.value === '1' || item.value === 'true'
        else if (key === 'daily_enabled') incomeConfig.dailyEnabled = item.value === '1' || item.value === 'true'
        else if (key === 'daily_rate') incomeConfig.dailyRate = Number(item.value)
        else if (key === 'settle_time') incomeConfig.settleTime = item.value
        else if (key === 'min_holding') incomeConfig.minHolding = Number(item.value)
        else if (key === 'price_source') priceConfig.source = item.value
        else if (key === 'update_interval') priceConfig.updateInterval = Number(item.value)
        else if (key === 'mock_price') priceConfig.mockPrice = Number(item.value)
        else if (key === 'mock_range') priceConfig.mockRange = Number(item.value)
      })
    }
  } catch (error) {
    console.error('Error fetching config:', error)
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    const configs = [
      { key: 'gold_min_sell', value: String(basicConfig.minSell), group: 'gold' },
      { key: 'gold_max_sell', value: String(basicConfig.maxSell), group: 'gold' },
      { key: 'gold_sell_fee', value: String(basicConfig.sellFee), group: 'gold' },
      { key: 'gold_price_decimals', value: String(basicConfig.priceDecimals), group: 'gold' },
      { key: 'gold_sell_enabled', value: basicConfig.sellEnabled ? '1' : '0', group: 'gold' },
      { key: 'gold_daily_enabled', value: incomeConfig.dailyEnabled ? '1' : '0', group: 'gold' },
      { key: 'gold_daily_rate', value: String(incomeConfig.dailyRate), group: 'gold' },
      { key: 'gold_settle_time', value: incomeConfig.settleTime, group: 'gold' },
      { key: 'gold_min_holding', value: String(incomeConfig.minHolding), group: 'gold' },
      { key: 'gold_price_source', value: priceConfig.source, group: 'gold' },
      { key: 'gold_update_interval', value: String(priceConfig.updateInterval), group: 'gold' },
      { key: 'gold_mock_price', value: String(priceConfig.mockPrice), group: 'gold' },
      { key: 'gold_mock_range', value: String(priceConfig.mockRange), group: 'gold' },
    ]
    await request({
      url: '/api/admin/config/batch',
      method: 'post',
      data: { configs }
    })
    Message.success('配置保存成功')
  } catch (error) {
    Message.error('保存失败')
  } finally {
    saving.value = false
  }
}

const editGameplay = (record) => {
  Message.info(`编辑玩法: ${record.name}`)
}

onMounted(() => {
  fetchConfig()
})
</script>

<style scoped>
.max-w-2xl { max-width: 42rem; }
</style>
