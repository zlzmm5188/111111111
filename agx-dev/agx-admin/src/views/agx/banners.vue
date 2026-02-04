<template>
  <div class="p-4">
    <a-card title="Banner管理" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="showCreateModal">
          <template #icon><icon-plus /></template>
          新增Banner
        </a-button>
      </template>

      <!-- 分类tab -->
      <a-tabs v-model:active-key="activeTab" @change="handleTabChange">
        <a-tab-pane key="home" title="首页Banner" />
        <a-tab-pane key="activity" title="活动Banner" />
        <a-tab-pane key="popup" title="弹窗广告" />
      </a-tabs>

      <a-table :data="tableData" :loading="loading" :pagination="false" class="mt-4">
        <template #columns>
          <a-table-column title="预览" :width="150">
            <template #cell="{ record }">
              <a-image :src="record.imageUrl" width="120" height="60" fit="cover" />
            </template>
          </a-table-column>
          <a-table-column title="标题" data-index="title" :width="180" />
          <a-table-column title="跳转链接" data-index="linkUrl" :width="200" ellipsis />
          <a-table-column title="展示时间" :width="200">
            <template #cell="{ record }">
              <div class="text-xs">
                <div>{{ record.startAt || '不限' }}</div>
                <div>至 {{ record.endAt || '不限' }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="排序" data-index="sortOrder" :width="80" />
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-switch v-model="record.status" :checked-value="1" :unchecked-value="0" size="small" @change="toggleStatus(record)" />
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="120">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="editBanner(record)">编辑</a-button>
                <a-button type="text" size="small" status="danger" @click="deleteBanner(record)">删除</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="modalVisible" :title="isEdit ? '编辑Banner' : '新增Banner'" width="600px" @ok="handleSubmit">
      <a-form :model="formData" layout="vertical">
        <a-form-item label="Banner图片" required>
          <a-upload list-type="picture-card" :limit="1" />
          <template #help>建议尺寸: 750x320像素</template>
        </a-form-item>
        <a-form-item label="标题">
          <a-input v-model="formData.title" placeholder="Banner标题(可选)" />
        </a-form-item>
        <a-form-item label="跳转链接">
          <a-input v-model="formData.linkUrl" placeholder="点击跳转的链接地址" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开始时间">
              <a-date-picker v-model="formData.startAt" show-time style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="结束时间">
              <a-date-picker v-model="formData.endAt" show-time style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="排序">
              <a-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="位置">
              <a-select v-model="formData.position" style="width: 100%">
                <a-option value="home">首页Banner</a-option>
                <a-option value="activity">活动Banner</a-option>
                <a-option value="popup">弹窗广告</a-option>
              </a-select>
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
const tableData = ref([])
const modalVisible = ref(false)
const isEdit = ref(false)
const activeTab = ref('home')

const formData = reactive({
  id: null,
  imageUrl: '',
  title: '',
  linkUrl: '',
  startAt: null,
  endAt: null,
  sortOrder: 0,
  position: 'home',
  status: 1
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/api/admin/banner/list',
      method: 'get',
      params: { position: activeTab.value }
    })
    if (res.code === 0 && res.data) {
      tableData.value = res.data.list || []
    }
  } catch (error) {
    console.error('Error fetching banners:', error)
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  fetchData()
}

const showCreateModal = () => {
  isEdit.value = false
  Object.assign(formData, { id: null, imageUrl: '', title: '', linkUrl: '', startAt: null, endAt: null, sortOrder: 0, position: activeTab.value, status: 1 })
  modalVisible.value = true
}

const editBanner = (record) => {
  isEdit.value = true
  Object.assign(formData, record)
  modalVisible.value = true
}

const handleSubmit = async () => {
  try {
    const url = isEdit.value ? `/api/admin/banner/${formData.id}` : '/api/admin/banner'
    const method = isEdit.value ? 'put' : 'post'
    const res = await request({
      url,
      method,
      data: {
        title: formData.title,
        imageUrl: formData.imageUrl,
        linkUrl: formData.linkUrl,
        position: formData.position,
        sortOrder: formData.sortOrder,
        startAt: formData.startAt,
        endAt: formData.endAt,
        status: formData.status
      }
    })
    if (res.code === 0) {
      Message.success(isEdit.value ? '修改成功' : '新增成功')
      modalVisible.value = false
      fetchData()
    } else {
      Message.error(res.message || '操作失败')
    }
  } catch (error) {
    Message.error('操作失败')
  }
}

const deleteBanner = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这个Banner吗？',
    onOk: async () => {
      try {
        const res = await request({
          url: `/api/admin/banner/${record.id}`,
          method: 'delete'
        })
        if (res.code === 0) {
          Message.success('已删除')
          fetchData()
        } else {
          Message.error(res.message || '删除失败')
        }
      } catch (error) {
        Message.error('删除失败')
      }
    }
  })
}

const toggleStatus = async (record) => {
  try {
    const res = await request({
      url: `/api/admin/banner/${record.id}`,
      method: 'put',
      data: { status: record.status }
    })
    if (res.code === 0) {
      Message.success('状态已更新')
    } else {
      record.status = record.status === 1 ? 0 : 1
      Message.error(res.message || '更新失败')
    }
  } catch (error) {
    record.status = record.status === 1 ? 0 : 1
    Message.error('更新失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>
