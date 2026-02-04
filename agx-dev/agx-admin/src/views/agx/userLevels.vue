<template>
  <div class="p-4">
    <a-card title="VIP等级管理" :bordered="false">
      <template #extra>
        <a-input-search v-model="searchKeyword" placeholder="搜索用户" @search="handleSearch" style="width: 200px" />
      </template>

      <!-- 等级分布统计（V0-V5共6个等级） -->
      <a-row :gutter="16" class="mb-4">
        <a-col :span="4" v-for="level in levelStats" :key="level.level">
          <a-card :bordered="false" size="small">
            <div class="text-center">
              <span class="text-2xl">{{ level.icon }}</span>
              <div class="font-medium">{{ level.name }}</div>
              <div class="text-xl font-bold">{{ level.count }}</div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <a-table :data="tableData" :loading="loading" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="用户" :width="160">
            <template #cell="{ record }">
              <div class="flex items-center gap-2">
                <a-avatar :size="36">{{ (record.username || record.nickname || '').charAt(0) }}</a-avatar>
                <div>
                  <div class="font-medium user-link" @click="goUserDetail(record)">{{ record.username || record.nickname }}</div>
                  <div class="text-gray-400 text-xs">ID: {{ record.id }}</div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="当前等级" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getLevelColor(record.level)">
                {{ getLevelIcon(record.level) }} {{ getLevelName(record.level) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="邀请人数" data-index="inviteCount" :width="100" />
          <a-table-column title="累计充值" :width="140">
            <template #cell="{ record }">
              {{ formatNumber(record.totalRecharge) }} USDT
            </template>
          </a-table-column>
          <a-table-column title="累计返佣" :width="140">
            <template #cell="{ record }">
              <span class="text-green-500">{{ formatNumber(record.totalCommission) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="升级时间" data-index="levelUpAt" :width="160" />
          <a-table-column title="操作" :width="150">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="adjustLevel(record)">调整等级</a-button>
                <a-button type="text" size="small" status="success" @click="viewDetail(record)">升级记录</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 调整等级弹窗 -->
    <a-modal v-model:visible="adjustVisible" title="调整用户等级" @ok="handleAdjust">
      <a-form :model="adjustForm" layout="vertical">
        <a-form-item label="用户">
          <a-input :model-value="adjustForm.username" disabled />
        </a-form-item>
        <a-form-item label="当前等级">
          <a-tag :color="getLevelColor(adjustForm.currentLevel)">
            {{ getLevelIcon(adjustForm.currentLevel) }} {{ getLevelName(adjustForm.currentLevel) }}
          </a-tag>
        </a-form-item>
        <a-form-item label="调整为">
          <a-select v-model="adjustForm.newLevel" style="width: 100%">
            <a-option v-for="l in [0, 1, 2, 3, 4, 5]" :key="l" :value="l">
              {{ getLevelIcon(l) }} {{ getLevelName(l) }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="调整原因">
          <a-textarea v-model="adjustForm.reason" placeholder="请输入调整原因" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 升级记录详情弹窗 -->
    <a-modal v-model:visible="detailVisible" title="升级记录详情" :width="720" :footer="false">
      <div v-if="detailData.user" class="detail-header">
        <div class="user-info">
          <a-avatar :size="48">{{ (detailData.user.username || '').charAt(0) }}</a-avatar>
          <div>
            <div class="font-medium text-lg">{{ detailData.user.username }}</div>
            <a-tag :color="getLevelColor(detailData.user.level)">{{ detailData.user.levelName }}</a-tag>
          </div>
        </div>
      </div>
      
      <a-divider>升级奖励记录</a-divider>
      <a-table :data="detailData.logs" :pagination="false" size="small" v-if="detailData.logs.length > 0">
        <template #columns>
          <a-table-column title="原等级" :width="120">
            <template #cell="{ record }">
              <a-tag size="small">{{ record.fromLevelName }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="新等级" :width="120">
            <template #cell="{ record }">
              <a-tag size="small" color="green">{{ record.toLevelName }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="奖励金额" :width="120">
            <template #cell="{ record }">
              <span class="text-green-500">+{{ record.bonusAmount }} USDT</span>
            </template>
          </a-table-column>
          <a-table-column title="时间" data-index="createdAt" :width="160" />
          <a-table-column title="备注" data-index="remark" />
        </template>
      </a-table>
      <a-empty v-else description="暂无升级记录" />

      <a-divider>充值记录</a-divider>
      <a-table :data="detailData.recharges" :pagination="false" size="small" v-if="detailData.recharges.length > 0">
        <template #columns>
          <a-table-column title="金额" :width="150">
            <template #cell="{ record }">
              <span class="text-green-500">+{{ record.amount }} {{ record.coin }}</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'orange'">{{ record.status === 1 ? '已到账' : '待确认' }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="时间" data-index="createdAt" />
        </template>
      </a-table>
      <a-empty v-else description="暂无充值记录" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import request from '@/utils/request'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const searchKeyword = ref('')
const adjustVisible = ref(false)
const detailVisible = ref(false)

const levelStats = ref([])

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

const adjustForm = reactive({
  userId: null,
  username: '',
  currentLevel: 0,
  newLevel: 0,
  reason: ''
})

const detailData = reactive({
  user: null,
  logs: [],
  recharges: []
})

const formatNumber = (num) => {
  return Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getLevelColor = (level) => {
  const colors = { 0: '#6B7280', 1: '#8B9DC3', 2: '#C0C0C0', 3: '#FFD700', 4: '#00CED1', 5: '#FF4500' }
  return colors[level] || 'gray'
}

const getLevelName = (level) => {
  const found = levelStats.value.find(l => l.level === level)
  return found?.name || (level === 0 ? '启蒙会员' : '普通会员')
}

const getLevelIcon = (level) => {
  const found = levelStats.value.find(l => l.level === level)
  return found?.icon || (level === 0 ? '👤' : '👤')
}

const fetchStats = async () => {
  try {
    const res = await request({
      url: '/api/admin/level/stats',
      method: 'get'
    })
    if (res.code === 0 && res.data) {
      levelStats.value = res.data
    }
  } catch (error) {
    console.error('Error fetching level stats:', error)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/api/admin/level/users',
      method: 'get',
      params: {
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: searchKeyword.value || undefined
      }
    })
    if (res.code === 0 && res.data) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('Error fetching users:', error)
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

const adjustLevel = (record) => {
  adjustForm.userId = record.id
  adjustForm.username = record.username || record.nickname
  adjustForm.currentLevel = record.level
  adjustForm.newLevel = record.level
  adjustForm.reason = ''
  adjustVisible.value = true
}

const handleAdjust = async () => {
  if (!adjustForm.reason) {
    Message.warning('请输入调整原因')
    return
  }
  try {
    const res = await request({
      url: `/api/admin/level/adjust/${adjustForm.userId}`,
      method: 'post',
      data: {
        newLevel: adjustForm.newLevel,
        reason: adjustForm.reason
      }
    })
    if (res.code === 0) {
      Message.success('等级调整成功')
      adjustVisible.value = false
      fetchData()
      fetchStats()
    } else {
      Message.error(res.message || '调整失败')
    }
  } catch (error) {
    Message.error('调整失败')
  }
}

const viewDetail = async (record) => {
  try {
    const res = await request({
      url: `/api/admin/level/upgrade-logs/${record.id}`,
      method: 'get'
    })
    if (res.code === 0 && res.data) {
      detailData.user = res.data.user
      detailData.logs = res.data.logs || []
      detailData.recharges = res.data.recharges || []
      detailVisible.value = true
    }
  } catch (error) {
    Message.error('获取升级记录失败')
  }
}

const goUserDetail = (record) => {
  router.push(`/agx/userDetail/${record.id}`)
}

onMounted(() => {
  fetchStats()
  fetchData()
})
</script>

<style scoped>
.text-green-500 { color: #52c41a; }
.user-link {
  cursor: pointer;
  color: #1890ff;
}
.user-link:hover {
  text-decoration: underline;
}
.detail-header {
  margin-bottom: 16px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
