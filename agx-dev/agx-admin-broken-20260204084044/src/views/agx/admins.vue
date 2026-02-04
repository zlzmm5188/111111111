<template>
  <div class="admin-list-page">
    <a-row class="mb-3">
      <a-col :span="24">
        <a-space :size="8">
          <a-input v-model="searchForm.keyword" placeholder="搜索用户名" allow-clear style="width: 140px" size="small">
            <template #prefix><icon-search /></template>
          </a-input>
          <a-select v-model="searchForm.adminGroup" placeholder="分组" allow-clear style="width: 100px" size="small">
            <a-option :value="0">超级管理员</a-option>
            <a-option :value="1">A组</a-option>
            <a-option :value="2">B组</a-option>
          </a-select>
          <a-select v-model="searchForm.status" placeholder="状态" allow-clear style="width: 90px" size="small">
            <a-option :value="1">正常</a-option>
            <a-option :value="0">禁用</a-option>
          </a-select>
          <a-button type="primary" size="small" @click="handleSearch">
            <template #icon><icon-search /></template>
            搜索
          </a-button>
          <a-button size="small" @click="handleReset">
            <template #icon><icon-refresh /></template>
            重置
          </a-button>
          <a-button type="primary" size="small" @click="openCreateModal" v-if="isSuperAdmin">
            <template #icon><icon-plus /></template>
            新增管理员
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
        <a-table-column title="ID" data-index="id" :width="60" />
        <a-table-column title="用户名" data-index="username" :width="130" />
        <a-table-column title="昵称" data-index="nickname" :width="120" :ellipsis="true" />
        <a-table-column title="分组" data-index="adminGroup" :width="90">
          <template #cell="{ record }">
            <a-tag v-if="record.adminGroup === 0" color="arcoblue" size="small">超级管理员</a-tag>
            <a-tag v-else-if="record.adminGroup === 1" color="orangered" size="small">A组</a-tag>
            <a-tag v-else-if="record.adminGroup === 2" color="green" size="small">B组</a-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </a-table-column>
        <a-table-column title="角色" data-index="role" :width="100" />
        <a-table-column title="状态" data-index="status" :width="70">
          <template #cell="{ record }">
            <a-tag :color="record.status === 1 ? 'green' : 'red'" size="small">
              {{ record.status === 1 ? '正常' : '禁用' }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="最后登录" data-index="lastLoginAt" :width="155" />
        <a-table-column title="创建时间" data-index="createdAt" :width="155" />
        <a-table-column title="操作" fixed="right" :width="160" v-if="isSuperAdmin">
          <template #cell="{ record }">
            <a-space :size="4">
              <a-button type="text" size="mini" @click="openEditModal(record)">
                编辑
              </a-button>
              <a-button type="text" size="mini" status="danger" @click="handleDelete(record)">
                删除
              </a-button>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>

    <!-- 新增/编辑管理员对话框 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      width="500px"
      @ok="handleModalOk"
      @cancel="modalVisible = false"
      :confirm-loading="modalLoading"
    >
      <a-form :model="modalForm" layout="vertical">
        <a-form-item label="用户名" required>
          <a-input
            v-model="modalForm.username"
            placeholder="请输入用户名"
            :disabled="isEdit"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="昵称">
          <a-input v-model="modalForm.nickname" placeholder="请输入昵称" allow-clear />
        </a-form-item>
        <a-form-item label="密码" :required="!isEdit">
          <a-input-password
            v-model="modalForm.password"
            placeholder="请输入密码（6-50位）"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="角色">
          <a-input v-model="modalForm.role" placeholder="请输入角色" allow-clear />
        </a-form-item>
        <a-form-item label="管理员分组">
          <a-select v-model="modalForm.adminGroup" placeholder="请选择分组" allow-clear>
            <a-option :value="0">超级管理员</a-option>
            <a-option :value="1">A组</a-option>
            <a-option :value="2">B组</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model="modalForm.status">
            <a-radio :value="1">正常</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Modal, Message } from '@arco-design/web-vue'
import agxApi from '@/api/agx'

const loading = ref(false)
const tableData = ref([])

const searchForm = reactive({
  keyword: undefined,
  adminGroup: undefined,
  status: undefined
})

const pagination = reactive({ current: 1, pageSize: 20, total: 0, showTotal: true })

// 当前管理员信息
const currentAdmin = ref(null)

// 检查是否是超级管理员
const isSuperAdmin = computed(() => {
  return currentAdmin.value?.adminGroup === 0
})

// 对话框相关
const modalVisible = ref(false)
const modalLoading = ref(false)
const isEdit = ref(false)
const modalTitle = computed(() => isEdit.value ? '编辑管理员' : '新增管理员')
const modalForm = reactive({
  id: undefined,
  username: '',
  nickname: '',
  password: '',
  role: '',
  adminGroup: 0,
  status: 1
})

// 获取当前管理员信息
const fetchCurrentAdmin = async () => {
  try {
    // 优先从 localStorage.adminInfo 获取
    const adminInfo = localStorage.getItem('adminInfo')
    if (adminInfo) {
      currentAdmin.value = JSON.parse(adminInfo)
      return
    }
    // 如果没有adminInfo，从JWT token解析
    const tokenStr = localStorage.getItem('admin_token')
    if (tokenStr) {
      const token = JSON.parse(tokenStr)
      const payload = token.split('.')[1]
      const decoded = JSON.parse(atob(payload))
      currentAdmin.value = {
        id: decoded.sub || decoded.uid,
        username: decoded.username,
        adminGroup: decoded.adminGroup ?? 0
      }
    }
  } catch (e) {
    console.error('获取管理员信息失败:', e)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await agxApi.getAdminList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm
    })
    if (res.code === 0) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    } else {
      Message.error(res.msg || '获取管理员列表失败')
    }
  } catch (error) {
    Message.error('获取管理员列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.current = 1; fetchData() }
const handleReset = () => {
  searchForm.keyword = undefined
  searchForm.adminGroup = undefined
  searchForm.status = undefined
  pagination.current = 1
  fetchData()
}
const onPageChange = (page) => { pagination.current = page; fetchData() }

const openCreateModal = () => {
  isEdit.value = false
  Object.assign(modalForm, {
    id: undefined,
    username: '',
    nickname: '',
    password: '',
    role: 'admin',
    adminGroup: 0,
    status: 1
  })
  modalVisible.value = true
}

const openEditModal = (record) => {
  isEdit.value = true
  Object.assign(modalForm, {
    id: record.id,
    username: record.username,
    nickname: record.nickname || '',
    password: '', // 编辑时不修改密码
    role: record.role || '',
    adminGroup: record.adminGroup ?? 0,
    status: record.status
  })
  modalVisible.value = true
}

const handleModalOk = async () => {
  // 验证
  if (!modalForm.username || modalForm.username.length < 4) {
    Message.warning('请输入用户名（4-50位）')
    return
  }
  if (!isEdit.value && (!modalForm.password || modalForm.password.length < 6)) {
    Message.warning('请输入密码（6-50位）')
    return
  }

  modalLoading.value = true
  try {
    let res
    if (isEdit.value) {
      res = await agxApi.updateAdmin(modalForm.id, {
        nickname: modalForm.nickname,
        role: modalForm.role,
        adminGroup: modalForm.adminGroup,
        status: modalForm.status,
        password: modalForm.password || undefined
      })
    } else {
      res = await agxApi.createAdmin({
        username: modalForm.username,
        password: modalForm.password,
        nickname: modalForm.nickname,
        role: modalForm.role,
        adminGroup: modalForm.adminGroup,
        status: modalForm.status
      })
    }

    if (res.code === 0) {
      Message.success(isEdit.value ? '更新成功' : '创建成功')
      modalVisible.value = false
      fetchData()
    } else {
      Message.error(res.msg || '操作失败')
    }
  } catch (error) {
    Message.error('操作失败')
  } finally {
    modalLoading.value = false
  }
}

const handleDelete = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除管理员 "${record.username}" 吗？`,
    onOk: async () => {
      try {
        const res = await agxApi.deleteAdmin(record.id)
        if (res.code === 0) {
          Message.success('删除成功')
          fetchData()
        } else {
          Message.error(res.msg || '删除失败')
        }
      } catch (error) {
        Message.error('删除失败')
      }
    }
  })
}

onMounted(() => {
  fetchCurrentAdmin()
  fetchData()
})
</script>

<style lang="less" scoped>
.admin-list-page {
  padding: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
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
    padding: 8px 12px;
    background: transparent;
    border-color: #f3f4f6;
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

    &:not(:last-child) {
      border-bottom: 1px solid #f3f4f6;
    }
  }

  .arco-tag {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
  }
}

.text-muted {
  color: #9ca3af;
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

:deep(.arco-modal) {
  .arco-modal-header {
    border-bottom: 1px solid #f3f4f6;
  }

  .arco-modal-body {
    padding: 20px;
  }

  .arco-modal-footer {
    border-top: 1px solid #f3f4f6;
  }
}
</style>
