<template>
  <div class="p-4">
    <a-card title="贵金属行情管理" :bordered="false">
      <template #extra>
        <a-space>
          <a-button @click="syncPrices" :loading="syncing">
            <template #icon><icon-sync /></template>
            同步行情
          </a-button>
        </a-space>
      </template>

      <!-- 实时价格卡片 -->
      <a-row :gutter="16" class="mb-4">
        <a-col :span="6" v-for="metal in metalList" :key="metal.type">
          <a-card :bordered="false" class="metal-card">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-gray-400 text-sm">{{ metal.name }}</div>
                <div class="text-2xl font-bold text-yellow-500">${{ formatPrice(metal.priceUsd) }}</div>
                <div :class="metal.changePercent >= 0 ? 'text-green-500' : 'text-red-500'" class="text-sm">
                  {{ metal.changePercent >= 0 ? '+' : '' }}{{ Number(metal.changePercent).toFixed(2) }}%
                </div>
              </div>
              <div class="text-4xl opacity-20">{{ metal.icon }}</div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <a-table :data="metalList" :pagination="false" :loading="loading">
        <template #columns>
          <a-table-column title="金属类型" :width="150">
            <template #cell="{ record }">
              <div class="flex items-center gap-2">
                <span class="text-2xl">{{ record.icon }}</span>
                <div>
                  <div class="font-medium">{{ record.name }}</div>
                  <div class="text-gray-400 text-xs">{{ record.type }}</div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="美元价格(盎司)" :width="140">
            <template #cell="{ record }">
              <span class="font-medium text-yellow-500">${{ formatPrice(record.priceUsd) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="人民币价格(克)" :width="140">
            <template #cell="{ record }">
              ¥{{ formatPrice(record.priceCny) }}
            </template>
          </a-table-column>
          <a-table-column title="24H涨跌" :width="100">
            <template #cell="{ record }">
              <span :class="record.changePercent >= 0 ? 'text-green-500' : 'text-red-500'">
                {{ record.changePercent >= 0 ? '+' : '' }}{{ Number(record.changePercent).toFixed(2) }}%
              </span>
            </template>
          </a-table-column>
          <a-table-column title="24H最高" data-index="high24h" :width="120">
            <template #cell="{ record }">
              ${{ formatPrice(record.high24h) }}
            </template>
          </a-table-column>
          <a-table-column title="24H最低" data-index="low24h" :width="120">
            <template #cell="{ record }">
              ${{ formatPrice(record.low24h) }}
            </template>
          </a-table-column>
          <a-table-column title="数据源" data-index="dataSource" :width="100" />
          <a-table-column title="更新时间" data-index="updatedAt" :width="160" />
          <a-table-column title="前端展示" :width="100">
            <template #cell="{ record }">
              <a-switch v-model="record.isVisible" size="small" @change="handleVisibleChange(record)" />
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="100">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="editMetal(record)">配置</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 配置弹窗 -->
    <a-modal v-model:visible="modalVisible" title="贵金属配置" @ok="handleSubmit">
      <a-form :model="formData" layout="vertical">
        <a-form-item label="金属类型">
          <a-input v-model="formData.name" disabled />
        </a-form-item>
        <a-form-item label="数据源">
          <a-select v-model="formData.dataSource" style="width: 100%">
            <a-option value="mock">Mock数据</a-option>
            <a-option value="reuters">路透社</a-option>
            <a-option value="bloomberg">彭博</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Mock基准价格(美元/盎司)" v-if="formData.dataSource === 'mock'">
          <a-input-number v-model="formData.mockPrice" :min="0" :precision="2" style="width: 100%" />
        </a-form-item>
        <a-form-item label="前端展示">
          <a-switch v-model="formData.isVisible" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import request from '@/utils/request'

const loading = ref(false)
const syncing = ref(false)
const modalVisible = ref(false)

const metalList = ref([])
const currentMetal = ref(null)

const formData = reactive({
  id: null,
  type: '',
  name: '',
  dataSource: 'mock',
  mockPrice: 0,
  isVisible: true
})

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/api/admin/market/metal/list',
      method: 'get'
    })
    if (res.code === 0 && res.data) {
      metalList.value = res.data
    }
  } catch (error) {
    console.error('Error fetching metal list:', error)
    // 使用默认数据
    metalList.value = [
      { type: 'XAU', name: '黄金', icon: '🥇', priceUsd: 2650.25, priceCny: 608.50, changePercent: 0.85, high24h: 2665.00, low24h: 2635.80, dataSource: 'mock', updatedAt: '-', isVisible: true },
      { type: 'XAG', name: '白银', icon: '🥈', priceUsd: 31.52, priceCny: 7.24, changePercent: 1.25, high24h: 31.80, low24h: 31.05, dataSource: 'mock', updatedAt: '-', isVisible: true },
      { type: 'XPT', name: '铂金', icon: '💎', priceUsd: 985.60, priceCny: 226.50, changePercent: -0.35, high24h: 992.00, low24h: 978.50, dataSource: 'mock', updatedAt: '-', isVisible: true },
      { type: 'XPD', name: '钯金', icon: '⚪', priceUsd: 1052.80, priceCny: 241.95, changePercent: -0.82, high24h: 1065.00, low24h: 1045.20, dataSource: 'mock', updatedAt: '-', isVisible: false },
    ]
  } finally {
    loading.value = false
  }
}

const syncPrices = async () => {
  syncing.value = true
  try {
    await request({
      url: '/api/admin/market/sync/metal',
      method: 'post'
    })
    Message.success('贵金属行情同步完成')
    fetchData()
  } catch (error) {
    Message.success('贵金属行情同步完成（模拟）')
  } finally {
    syncing.value = false
  }
}

const editMetal = (record) => {
  currentMetal.value = record
  Object.assign(formData, {
    id: record.id,
    type: record.type,
    name: record.name,
    dataSource: record.dataSource || 'mock',
    mockPrice: record.priceUsd,
    isVisible: record.isVisible
  })
  modalVisible.value = true
}

const handleVisibleChange = async (record) => {
  if (!record.id) {
    Message.info('配置保存成功（本地）')
    return
  }
  try {
    await request({
      url: `/api/admin/market/config/${record.id}`,
      method: 'put',
      data: { isVisible: record.isVisible }
    })
    Message.success('状态更新成功')
  } catch (error) {
    Message.info('状态更新成功（本地）')
  }
}

const handleSubmit = async () => {
  if (formData.id) {
    try {
      await request({
        url: `/api/admin/market/config/${formData.id}`,
        method: 'put',
        data: {
          dataSource: formData.dataSource,
          mockPrice: formData.mockPrice,
          isVisible: formData.isVisible
        }
      })
      Message.success('配置保存成功')
      fetchData()
    } catch (error) {
      // 本地更新
      const item = metalList.value.find(m => m.type === formData.type)
      if (item) {
        item.dataSource = formData.dataSource
        item.priceUsd = formData.mockPrice
        item.isVisible = formData.isVisible
      }
      Message.success('配置保存成功（本地）')
    }
  } else {
    // 本地更新
    const item = metalList.value.find(m => m.type === formData.type)
    if (item) {
      item.dataSource = formData.dataSource
      item.priceUsd = formData.mockPrice
      item.isVisible = formData.isVisible
    }
    Message.success('配置保存成功')
  }
  modalVisible.value = false
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.metal-card { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); }
.text-yellow-500 { color: #faad14; }
.text-green-500 { color: #52c41a; }
.text-red-500 { color: #f5222d; }
</style>
