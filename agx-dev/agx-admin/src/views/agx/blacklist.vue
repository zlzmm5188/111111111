<template>
  <div class="blacklist-container">
    <a-card title="黑名单 / 风控管理">
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          <template #icon><icon-plus /></template>
          添加黑名单
        </a-button>
      </template>

      <!-- Tab切换 -->
      <a-tabs v-model:active-key="activeTab" class="mb-4">
        <a-tab-pane key="blacklist" title="黑名单用户" />
        <a-tab-pane key="risk" title="风控预警" />
        <a-tab-pane key="rules" title="风控规则" />
      </a-tabs>

      <!-- 黑名单用户列表 -->
      <template v-if="activeTab === 'blacklist'">
        <a-row :gutter="16" class="mb-4">
          <a-col :span="6">
            <a-input v-model="searchForm.keyword" placeholder="用户ID/手机号" allow-clear />
          </a-col>
          <a-col :span="4">
            <a-select v-model="searchForm.type" placeholder="拉黑类型" allow-clear style="width: 100%">
              <a-option value="login">禁止登录</a-option>
              <a-option value="trade">禁止交易</a-option>
              <a-option value="withdraw">禁止提币</a-option>
              <a-option value="all">全部禁止</a-option>
            </a-select>
          </a-col>
          <a-col :span="4">
            <a-button type="primary" @click="handleSearch">搜索</a-button>
          </a-col>
        </a-row>

        <a-table :columns="blacklistColumns" :data="blacklistData" :loading="loading">
          <template #type="{ record }">
            <a-tag :color="getTypeColor(record.type)">{{ getTypeText(record.type) }}</a-tag>
          </template>
          <template #status="{ record }">
            <a-switch v-model="record.status" @change="(val) => handleStatusChange(record, val)" />
          </template>
          <template #action="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm content="确定移出黑名单？" @ok="handleRemove(record)">
                <a-button type="text" size="small" status="danger">移出</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table>
      </template>

      <!-- 风控预警 -->
      <template v-if="activeTab === 'risk'">
        <a-table :columns="riskColumns" :data="riskData" :loading="loading">
          <template #level="{ record }">
            <a-tag :color="getLevelColor(record.level)">{{ record.level }}</a-tag>
          </template>
          <template #action="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleViewRisk(record)">查看详情</a-button>
              <a-button type="text" size="small" status="warning" @click="handleAddToBlacklist(record)">加入黑名单</a-button>
              <a-button type="text" size="small" @click="handleIgnoreRisk(record)">忽略</a-button>
            </a-space>
          </template>
        </a-table>
      </template>

      <!-- 风控规则 -->
      <template v-if="activeTab === 'rules'">
        <a-list :data="riskRules">
          <template #item="{ item }">
            <a-list-item>
              <a-list-item-meta :title="item.name" :description="item.description" />
              <template #actions>
                <a-switch v-model="item.enabled" />
              </template>
            </a-list-item>
          </template>
        </a-list>
      </template>
    </a-card>

    <!-- 添加/编辑黑名单弹窗 -->
    <a-modal v-model:visible="modalVisible" :title="isEdit ? '编辑黑名单' : '添加黑名单'" @ok="handleSubmit">
      <a-form :model="formData" layout="vertical">
        <a-form-item label="用户ID" required>
          <a-input v-model="formData.userId" placeholder="请输入用户ID" :disabled="isEdit" />
        </a-form-item>
        <a-form-item label="拉黑类型" required>
          <a-checkbox-group v-model="formData.types">
            <a-checkbox value="login">禁止登录</a-checkbox>
            <a-checkbox value="trade">禁止交易</a-checkbox>
            <a-checkbox value="withdraw">禁止提币</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="拉黑原因" required>
          <a-textarea v-model="formData.reason" placeholder="请输入拉黑原因" :max-length="200" show-word-limit />
        </a-form-item>
        <a-form-item label="过期时间">
          <a-date-picker v-model="formData.expireTime" placeholder="留空表示永久" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import request from '@/utils/request'

const loading = ref(false)
const activeTab = ref('blacklist')
const modalVisible = ref(false)
const isEdit = ref(false)
const editingId = ref(null)

const searchForm = reactive({
  keyword: '',
  type: ''
})

const formData = reactive({
  userId: '',
  types: [],
  reason: '',
  expireTime: ''
})

const blacklistColumns = [
  { title: '用户ID', dataIndex: 'userId', width: 100 },
  { title: '用户名', dataIndex: 'username', width: 120 },
  { title: '拉黑类型', dataIndex: 'type', slotName: 'type', width: 120 },
  { title: '拉黑原因', dataIndex: 'reason', width: 200 },
  { title: '操作人', dataIndex: 'operator', width: 100 },
  { title: '拉黑时间', dataIndex: 'createdAt', width: 180 },
  { title: '过期时间', dataIndex: 'expireTime', width: 180 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 80 },
  { title: '操作', slotName: 'action', width: 140, fixed: 'right' }
]

const riskColumns = [
  { title: '用户ID', dataIndex: 'userId', width: 100 },
  { title: '用户名', dataIndex: 'username', width: 120 },
  { title: '风险类型', dataIndex: 'riskType', width: 150 },
  { title: '风险等级', dataIndex: 'level', slotName: 'level', width: 100 },
  { title: '风险描述', dataIndex: 'description', width: 250 },
  { title: '触发时间', dataIndex: 'triggerTime', width: 180 },
  { title: '操作', slotName: 'action', width: 200, fixed: 'right' }
]

const blacklistData = ref([])
const riskData = ref([])
const riskRules = ref([
  { id: 1, name: '异常登录检测', description: '短时间内从多个不同地区IP登录时触发预警', enabled: true },
  { id: 2, name: '大额提币预警', description: '24小时内累计提币金额超过设定阈值时触发', enabled: true },
  { id: 3, name: '频繁交易检测', description: '短时间内交易次数异常时触发预警', enabled: true },
  { id: 4, name: '新设备登录', description: '使用新设备登录时发送通知', enabled: false },
  { id: 5, name: 'KYC未完成大额操作', description: 'KYC未完成用户进行大额操作时触发', enabled: true },
])

const getTypeColor = (type) => {
  const colors = { login: 'red', trade: 'orange', withdraw: 'purple', all: 'gray' }
  return colors[type] || 'gray'
}

const getTypeText = (type) => {
  const texts = { login: '禁止登录', trade: '禁止交易', withdraw: '禁止提币', all: '全部禁止' }
  return texts[type] || type
}

const getLevelColor = (level) => {
  const colors = { '高': 'red', '中': 'orange', '低': 'blue' }
  return colors[level] || 'gray'
}

const fetchBlacklist = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/api/admin/blacklist/list',
      method: 'get',
      params: {
        keyword: searchForm.keyword || undefined,
        type: searchForm.type || undefined
      }
    })
    if (res.code === 0 && res.data) {
      blacklistData.value = res.data.list || []
    }
  } catch (error) {
    console.error('Error fetching blacklist:', error)
  } finally {
    loading.value = false
  }
}

const fetchRiskAlerts = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/api/admin/risk-alert/list',
      method: 'get',
      params: { status: 'pending' }
    })
    if (res.code === 0 && res.data) {
      riskData.value = res.data.list || []
    }
  } catch (error) {
    console.error('Error fetching risk alerts:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (activeTab.value === 'blacklist') {
    fetchBlacklist()
  } else if (activeTab.value === 'risk') {
    fetchRiskAlerts()
  }
}

watch(activeTab, (newVal) => {
  if (newVal === 'blacklist') {
    fetchBlacklist()
  } else if (newVal === 'risk') {
    fetchRiskAlerts()
  }
})

const handleAdd = () => {
  isEdit.value = false
  editingId.value = null
  Object.assign(formData, { userId: '', types: [], reason: '', expireTime: '' })
  modalVisible.value = true
}

const handleEdit = (record) => {
  isEdit.value = true
  editingId.value = record.id
  Object.assign(formData, {
    userId: String(record.userId),
    types: [record.type],
    reason: record.reason,
    expireTime: record.expireTime !== '-' ? record.expireTime : ''
  })
  modalVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await request({
        url: `/api/admin/blacklist/${editingId.value}`,
        method: 'put',
        data: {
          type: formData.types[0] || 'all',
          reason: formData.reason,
          expireTime: formData.expireTime || null
        }
      })
      Message.success('更新成功')
    } else {
      await request({
        url: '/api/admin/blacklist',
        method: 'post',
        data: {
          userId: Number(formData.userId),
          type: formData.types[0] || 'all',
          reason: formData.reason,
          expireTime: formData.expireTime || null
        }
      })
      Message.success('添加成功')
    }
    modalVisible.value = false
    fetchBlacklist()
  } catch (error) {
    Message.error('操作失败')
  }
}

const handleRemove = async (record) => {
  try {
    await request({
      url: `/api/admin/blacklist/${record.id}`,
      method: 'delete'
    })
    Message.success(`已将用户 ${record.username} 移出黑名单`)
    fetchBlacklist()
  } catch (error) {
    Message.error('操作失败')
  }
}

const handleStatusChange = async (record, val) => {
  try {
    await request({
      url: `/api/admin/blacklist/${record.id}`,
      method: 'put',
      data: { status: val ? 1 : 0 }
    })
    Message.success(val ? '已启用' : '已禁用')
  } catch (error) {
    Message.error('操作失败')
    record.status = !val
  }
}

const handleViewRisk = (record) => {
  Message.info(`查看用户 ${record.username} 的风险详情`)
}

const handleAddToBlacklist = (record) => {
  formData.userId = String(record.userId)
  formData.types = []
  formData.reason = record.description
  formData.expireTime = ''
  isEdit.value = false
  editingId.value = null
  modalVisible.value = true
}

const handleIgnoreRisk = async (record) => {
  try {
    await request({
      url: `/api/admin/risk-alert/${record.id}/process`,
      method: 'post',
      data: { status: 'ignored' }
    })
    Message.success('已忽略该风险预警')
    fetchRiskAlerts()
  } catch (error) {
    Message.error('操作失败')
  }
}

onMounted(() => {
  fetchBlacklist()
})
</script>

<style scoped>
.blacklist-container {
  padding: 16px;
}
.mb-4 {
  margin-bottom: 16px;
}
</style>
