<template>
  <div class="p-4">
    <a-card title="数字货币行情管理" :bordered="false">
      <template #extra>
        <a-space>
          <a-button @click="syncPrices" :loading="syncing">
            <template #icon><icon-sync /></template>
            同步行情
          </a-button>
          <a-button type="primary" @click="showCreateModal">
            <template #icon><icon-plus /></template>
            添加币种
          </a-button>
        </a-space>
      </template>

      <a-row :gutter="16" class="mb-4">
        <a-col :span="6">
          <a-input-search v-model="searchForm.keyword" placeholder="搜索币种" @search="handleSearch" />
        </a-col>
        <a-col :span="4">
          <a-select v-model="searchForm.category" placeholder="分类" allow-clear style="width: 100%">
            <a-option value="main">主流币</a-option>
            <a-option value="alt">山寨币</a-option>
            <a-option value="defi">DeFi</a-option>
            <a-option value="meme">Meme</a-option>
            <a-option value="nft">NFT</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select v-model="searchForm.status" placeholder="状态" allow-clear style="width: 100%">
            <a-option :value="1">已上线</a-option>
            <a-option :value="0">已下线</a-option>
          </a-select>
        </a-col>
      </a-row>

      <a-table :data="tableData" :loading="loading" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="币种" :width="180">
            <template #cell="{ record }">
              <div class="flex items-center gap-2">
                <a-avatar :size="32" :style="{ backgroundColor: getRandomColor(record.symbol) }">
                  {{ record.symbol.substring(0, 2) }}
                </a-avatar>
                <div>
                  <div class="font-medium">{{ record.symbol }}</div>
                  <div class="text-gray-400 text-xs">{{ record.name }}</div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="当前价格" :width="120">
            <template #cell="{ record }">
              <span class="font-medium">${{ formatPrice(record.price) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="24H涨跌" :width="100">
            <template #cell="{ record }">
              <span :class="record.changePercent >= 0 ? 'text-green-500' : 'text-red-500'">
                {{ record.changePercent >= 0 ? '+' : '' }}{{ record.changePercent.toFixed(2) }}%
              </span>
            </template>
          </a-table-column>
          <a-table-column title="24H成交额" :width="120">
            <template #cell="{ record }">
              ${{ formatVolume(record.volumeUsd) }}
            </template>
          </a-table-column>
          <a-table-column title="分类" :width="80">
            <template #cell="{ record }">
              <a-tag size="small">{{ getCategoryName(record.category) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="前端展示" :width="100">
            <template #cell="{ record }">
              <a-switch v-model="record.isVisible" :checked-value="1" :unchecked-value="0" size="small" @change="updateVisible(record)" />
            </template>
          </a-table-column>
          <a-table-column title="热门" :width="80">
            <template #cell="{ record }">
              <a-switch v-model="record.isHot" :checked-value="1" :unchecked-value="0" size="small" @change="updateHot(record)" />
            </template>
          </a-table-column>
          <a-table-column title="可交易" :width="80">
            <template #cell="{ record }">
              <a-switch v-model="record.isTradable" :checked-value="1" :unchecked-value="0" size="small" @change="updateTradable(record)" />
            </template>
          </a-table-column>
          <a-table-column title="排序" data-index="sortOrder" :width="70" />
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="editAsset(record)">编辑</a-button>
                <a-button type="text" size="small" status="danger" @click="deleteAsset(record)">删除</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 编辑弹窗 -->
    <a-modal v-model:visible="modalVisible" :title="isEdit ? '编辑币种' : '添加币种'" @ok="handleSubmit">
      <a-form :model="formData" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="交易对" required>
              <a-input v-model="formData.symbol" placeholder="如: BTC/USDT" :disabled="isEdit" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="名称" required>
              <a-input v-model="formData.name" placeholder="如: 比特币" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="分类">
              <a-select v-model="formData.category" style="width: 100%">
                <a-option value="main">主流币</a-option>
                <a-option value="alt">山寨币</a-option>
                <a-option value="defi">DeFi</a-option>
                <a-option value="meme">Meme</a-option>
                <a-option value="nft">NFT</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序">
              <a-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="前端展示">
              <a-switch v-model="formData.isVisible" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="热门">
              <a-switch v-model="formData.isHot" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="可交易">
              <a-switch v-model="formData.isTradable" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import request from '@/utils/request'

const loading = ref(false)
const syncing = ref(false)
const tableData = ref([])
const modalVisible = ref(false)
const isEdit = ref(false)

const searchForm = reactive({
  keyword: '',
  category: null,
  status: null
})

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

const formData = reactive({
  id: null,
  symbol: '',
  name: '',
  category: 'main',
  sortOrder: 0,
  isVisible: true,
  isHot: false,
  isTradable: true
})

const formatPrice = (price) => {
  const p = Number(price || 0)
  if (p >= 1000) return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (p >= 1) return p.toFixed(4)
  return p.toFixed(6)
}

const formatVolume = (vol) => {
  const v = Number(vol || 0)
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B'
  if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M'
  if (v >= 1e3) return (v / 1e3).toFixed(2) + 'K'
  return v.toFixed(2)
}

const getRandomColor = (str) => {
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2']
  let hash = 0
  for (let i = 0; i < (str || '').length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

const getCategoryName = (cat) => {
  const names = { main: '主流', alt: '山寨', defi: 'DeFi', meme: 'Meme', nft: 'NFT' }
  return names[cat] || cat || '主流'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/api/admin/trade/pairs',
      method: 'get',
      params: {
        page: pagination.current,
        pageSize: pagination.pageSize,
        status: searchForm.status
      }
    })
    if (res.code === 0 && res.data) {
      tableData.value = (res.data.list || []).map(item => ({
        id: item.id,
        symbol: item.symbol,
        name: item.baseName || item.symbol?.split('/')?.[0] || '',
        price: Number(item.lastPrice || 0),
        changePercent: Number(item.change24h || 0),
        volumeUsd: Number(item.volume24h || 0),
        category: item.category || 'main',
        sortOrder: item.sortOrder || 0,
        isVisible: item.status === 1 ? 1 : 0,
        isHot: item.isHot || 0,
        isTradable: item.status === 1 ? 1 : 0
      }))
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handlePageChange = (page) => {
  pagination.current = page
  fetchData()
}

const syncPrices = async () => {
  syncing.value = true
  try {
    await request({
      url: '/api/market/sync',
      method: 'post'
    })
    Message.success('行情同步完成')
    fetchData()
  } catch (error) {
    Message.warning('行情同步中')
  } finally {
    syncing.value = false
  }
}

const showCreateModal = () => {
  isEdit.value = false
  Object.assign(formData, { id: null, symbol: '', name: '', category: 'main', sortOrder: 0, isVisible: true, isHot: false, isTradable: true })
  modalVisible.value = true
}

const editAsset = (record) => {
  isEdit.value = true
  Object.assign(formData, {
    id: record.id,
    symbol: record.symbol,
    name: record.name,
    category: record.category || 'main',
    sortOrder: record.sortOrder || 0,
    isVisible: record.isVisible === 1,
    isHot: record.isHot === 1,
    isTradable: record.isTradable === 1
  })
  modalVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.symbol || !formData.name) {
    Message.warning('请填写完整信息')
    return
  }
  try {
    if (isEdit.value) {
      await request({
        url: `/api/admin/trade/pair/${formData.id}`,
        method: 'put',
        data: {
          baseName: formData.name,
          sortOrder: formData.sortOrder,
          status: formData.isTradable ? 1 : 0
        }
      })
      Message.success('修改成功')
    } else {
      await request({
        url: '/api/admin/trade/pair',
        method: 'post',
        data: {
          symbol: formData.symbol,
          baseName: formData.name,
          quoteName: 'USDT',
          sortOrder: formData.sortOrder,
          status: formData.isTradable ? 1 : 0
        }
      })
      Message.success('添加成功')
    }
    modalVisible.value = false
    fetchData()
  } catch (error) {
    Message.error('操作失败')
  }
}

const updateVisible = async (record) => {
  try {
    await request({
      url: `/api/admin/trade/pair/${record.id}`,
      method: 'put',
      data: { status: record.isVisible ? 1 : 0 }
    })
    Message.success(record.isVisible ? '已显示' : '已隐藏')
  } catch (error) {
    Message.error('操作失败')
  }
}

const updateHot = async (record) => {
  Message.success(record.isHot ? '已设为热门' : '已取消热门')
}

const updateTradable = async (record) => {
  try {
    await request({
      url: `/api/admin/trade/pair/${record.id}`,
      method: 'put',
      data: { status: record.isTradable ? 1 : 0 }
    })
    Message.success(record.isTradable ? '已开启交易' : '已关闭交易')
  } catch (error) {
    Message.error('操作失败')
  }
}

const deleteAsset = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除 ${record.symbol} 吗？`,
    onOk: async () => {
      try {
        await request({
          url: `/api/admin/trade/pair/${record.id}`,
          method: 'delete'
        })
        Message.success('已删除')
        fetchData()
      } catch (error) {
        Message.error('删除失败')
      }
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.text-green-500 { color: #52c41a; }
.text-red-500 { color: #f5222d; }
</style>
