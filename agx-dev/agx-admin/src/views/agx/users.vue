<template>
  <div class="user-list-page">
    <a-row class="mb-3">
      <a-col :span="24">
        <a-space :size="8">
          <a-input v-model="searchForm.keyword" placeholder="搜索用户名或UID" allow-clear style="width: 140px" size="small">
            <template #prefix><icon-search /></template>
          </a-input>
          <a-select v-model="searchForm.status" placeholder="状态" allow-clear style="width: 90px" size="small">
            <a-option :value="1">正常</a-option>
            <a-option :value="0">禁用</a-option>
          </a-select>
          <a-select v-model="searchForm.kycStatus" placeholder="KYC" allow-clear style="width: 90px" size="small">
            <a-option :value="2">已认证</a-option>
            <a-option :value="0">未认证</a-option>
            <a-option :value="1">认证中</a-option>
          </a-select>
          <a-select v-model="searchForm.isInternal" placeholder="类型" allow-clear style="width: 90px" size="small">
            <a-option :value="1">内部</a-option>
            <a-option :value="0">普通</a-option>
          </a-select>
          <a-select v-model="searchForm.vipLevel" placeholder="VIP" allow-clear style="width: 90px" size="small">
            <a-option :value="1">VIP1</a-option>
            <a-option :value="2">VIP2</a-option>
            <a-option :value="3">VIP3</a-option>
            <a-option :value="4">VIP4</a-option>
            <a-option :value="5">VIP5</a-option>
          </a-select>
          <a-select v-model="searchForm.assignedAdminId" placeholder="管理员" allow-clear style="width: 110px" size="small">
            <a-option :value="0">未分配</a-option>
            <a-option v-for="admin in adminList" :key="admin.id" :value="admin.id">
              {{ admin.nickname || admin.username }}
            </a-option>
          </a-select>
          <a-button type="primary" size="small" @click="handleSearch">
            <template #icon><icon-search /></template>
            搜索
          </a-button>
          <a-button size="small" @click="handleReset">
            <template #icon><icon-refresh /></template>
            重置
          </a-button>
        </a-space>
      </a-col>
    </a-row>

    <a-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      @page-change="onPageChange"
      row-key="id"
      size="small"
      :bordered="false"
      class="compact-table"
    >
      <template #columns>
        <a-table-column title="ID" data-index="id" :width="80" align="center" />
        <a-table-column title="用户名" data-index="username" :width="120" :ellipsis="true" />
        <a-table-column title="类型" :width="80" align="center">
          <template #cell="{ record }">
            <a-tag :color="record.isInternal ? 'arcoblue' : 'gray'" size="small">
              {{ record.isInternal ? '内部' : '新用户' }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="VIP" :width="70" align="center">
          <template #cell="{ record }">
            <span :class="['vip-badge', 'vip-level-' + (record.vipLevel || 0)]">
              V{{ record.vipLevel || 0 }}
            </span>
          </template>
        </a-table-column>
        <a-table-column title="KYC" :width="80" align="center">
          <template #cell="{ record }">
            <a-tag v-if="record.kycStatus === 2" color="green" size="small">已认证</a-tag>
            <a-tag v-else-if="record.kycStatus === 1" color="orange" size="small">审核中</a-tag>
            <a-tag v-else color="red" size="small">未认证</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="USDT余额" :width="130" align="right">
          <template #cell="{ record }">
            <span class="balance-amount">{{ formatNumber(record.usdtBalance) }}</span>
          </template>
        </a-table-column>
        <a-table-column title="邀请人数" :width="90" align="center">
          <template #cell="{ record }">
            <span class="count-text">{{ record.inviteCount || 0 }}</span>
          </template>
        </a-table-column>
        <a-table-column title="状态" :width="80" align="center">
          <template #cell="{ record }">
            <a-tag :color="record.status === 1 ? 'green' : 'red'" size="small">
              {{ record.status === 1 ? '正常' : '禁用' }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="注册时间" :width="160">
          <template #cell="{ record }">
            <span class="time-text">{{ record.createdAt }}</span>
          </template>
        </a-table-column>
        <a-table-column title="操作" fixed="right" :width="80" align="center">
          <template #cell="{ record }">
            <a-button type="text" size="mini" @click="viewDetail(record.id)">
              <template #icon><icon-eye /></template>
              查看
            </a-button>
          </template>
        </a-table-column>
      </template>
    </a-table>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import agxApi from '@/api/agx'
import { formatNumber } from '@/utils/format'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])

const searchForm = reactive({
  keyword: undefined,
  status: undefined,
  kycStatus: undefined,
  isInternal: undefined,
  vipLevel: undefined,
  assignedAdminId: undefined
})
const adminList = ref([])
const pagination = reactive({ current: 1, pageSize: 20, total: 0, showTotal: true })

const fetchData = async () => {
  loading.value = true
  try {
    const res = await agxApi.getUserList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm
    })
    if (res.code === 0) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.current = 1; fetchData() }
const handleReset = () => {
  searchForm.keyword = undefined
  searchForm.status = undefined
  searchForm.kycStatus = undefined
  searchForm.isInternal = undefined
  searchForm.vipLevel = undefined
  searchForm.assignedAdminId = undefined
  pagination.current = 1
  fetchData()
}

const fetchAdminList = async () => {
  try {
    const res = await agxApi.getAdminList({ pageSize: 100 })
    if (res.code === 0) {
      adminList.value = res.data.list || []
    }
  } catch (error) {
    console.error('Failed to fetch admin list:', error)
  }
}
const onPageChange = (page) => { pagination.current = page; fetchData() }

const viewUser = (id) => router.push(`/agx/userDetail/${id}`)
const viewDetail = (id) => router.push(`/agx/userDetail/${id}`)

onMounted(() => {
  fetchAdminList()
  fetchData()
})
</script>

<style lang="less" scoped>
.user-list-page {
  padding: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', 'Roboto Mono', 'Menlo', 'Monaco', 'Consolas', monospace;
  --font-digits: 'SF Mono', 'Inter', 'Roboto Mono', 'Menlo', monospace;
  background: #f5f6f8;
  min-height: calc(100vh - 140px);
}

.mb-3 {
  margin-bottom: 12px;
}

:deep(.arco-input-wrapper),
:deep(.arco-select) {
  background: #fff;
  border: 1px solid #e5e7eb;

  .arco-input,
  .arco-select-view {
    color: #1f2937;
    background: transparent;
    font-size: 13px;
  }

  &.arco-select-view-focus,
  .arco-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
}

:deep(.arco-btn) {
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;

  &.arco-btn-primary {
    background: #3b82f6;
    border-color: #3b82f6;

    &:hover {
      background: #2563eb;
      border-color: #2563eb;
    }
  }

  &:not(.arco-btn-primary) {
    background: #fff;
    border-color: #e5e7eb;
    color: #4b5563;

    &:hover {
      background: #f9fafb;
      border-color: #d1d5db;
      color: #1f2937;
    }
  }
}

:deep(.compact-table) {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .arco-table {
    background: transparent;
    color: #1f2937;
    font-size: 13px;
  }

  .arco-table-th,
  .arco-table-td {
    padding: 8px 12px !important;
    background: transparent;
    border-color: #f3f4f6;
    line-height: 1.4;
    white-space: nowrap;
  }

  .arco-table-th {
    font-weight: 600;
    color: #6b7280;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    background: #f9fafb;
  }

  .arco-table-tr {
    transition: background 0.15s ease;

    &:hover {
      background: #f9fafb;
    }
  }

  .arco-table-tbody .arco-table-tr {
    height: 44px;
  }

  .arco-tag {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
    line-height: 1.4;
    white-space: nowrap;
  }
  
  .arco-table-cell {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.balance-amount {
  font-family: var(--font-digits);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  letter-spacing: -0.02em;
  font-size: 13px;
  color: #1f2937;
  white-space: nowrap;
}

.index-text {
  font-family: var(--font-digits);
  font-variant-numeric: tabular-nums;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.count-text {
  font-family: var(--font-digits);
  font-variant-numeric: tabular-nums;
  font-size: 13px;
  color: #3b82f6;
  font-weight: 600;
}

.uid-text {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  color: #374151;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.time-text {
  font-family: var(--font-mono);
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.vip-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  padding: 3px 8px;
  background: linear-gradient(135deg, #8B9DC3 0%, #6B7D9E 100%);
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

/* VIP等级颜色 */
.vip-level-0 { background: linear-gradient(135deg, #8B949E 0%, #6B7280 100%); }
.vip-level-1 { background: linear-gradient(135deg, #8B9DC3 0%, #6B7D9E 100%); }
.vip-level-2 { background: linear-gradient(135deg, #4A90D9 0%, #3A7BC8 100%); }
.vip-level-3 { background: linear-gradient(135deg, #D4AF37 0%, #B8962E 100%); }
.vip-level-4 { background: linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%); }
.vip-level-5 { background: linear-gradient(135deg, #C9A962 0%, #A08050 100%); }

.link-text {
  color: #3b82f6;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    text-decoration: underline;
  }
}

.text-muted {
  color: #9ca3af;
}

.admin-name {
  font-size: 13px;
  color: #3b82f6;
  font-weight: 500;
}

:deep(.arco-pagination) {
  margin-top: 16px;

  .arco-pagination-item {
    background: #fff;
    border: 1px solid #e5e7eb;
    color: #4b5563;
    font-size: 13px;
    min-width: 32px;
    height: 32px;
    border-radius: 6px;

    &:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }

    &.arco-pagination-item-active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }
  }

  .arco-pagination-jump-input {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
  }
}
</style>
