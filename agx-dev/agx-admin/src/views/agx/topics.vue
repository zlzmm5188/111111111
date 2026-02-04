<template>
  <div class="p-4">
    <a-card title="话题管理" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="showCreateModal">
          <template #icon><icon-plus /></template>
          新增话题
        </a-button>
      </template>

      <a-table :data="tableData" :loading="loading" :pagination="false">
        <template #columns>
          <a-table-column title="话题" :width="200">
            <template #cell="{ record }">
              <div class="flex items-center gap-2">
                <span class="text-lg">{{ record.icon || '#' }}</span>
                <span class="font-medium">{{ record.tag }}</span>
                <a-tag v-if="record.isHot" color="red" size="small">热门</a-tag>
                <a-tag v-if="record.isOfficial" color="blue" size="small">官方</a-tag>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="描述" data-index="description" :width="250" ellipsis />
          <a-table-column title="帖子数" data-index="postCount" :width="100" />
          <a-table-column title="浏览量" data-index="viewCount" :width="100" />
          <a-table-column title="排序" data-index="sortOrder" :width="80" />
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-switch v-model="record.status" :checked-value="1" :unchecked-value="0" size="small" @change="updateStatus(record)" />
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="editTopic(record)">编辑</a-button>
                <a-button type="text" size="small" status="danger" @click="deleteTopic(record)">删除</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="modalVisible" :title="isEdit ? '编辑话题' : '新增话题'" @ok="handleSubmit">
      <a-form :model="formData" layout="vertical">
        <a-form-item label="话题名称" required>
          <a-input v-model="formData.tag" placeholder="请输入话题名称" :max-length="50" />
        </a-form-item>
        <a-form-item label="图标(emoji)">
          <a-input v-model="formData.icon" placeholder="请输入emoji图标" :max-length="10" style="width: 100px" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model="formData.description" placeholder="请输入话题描述" :max-length="200" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="排序">
              <a-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="热门">
              <a-switch v-model="formData.isHot" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="官方">
              <a-switch v-model="formData.isOfficial" />
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
import { request } from '@/utils/request.js'

const loading = ref(false)
const tableData = ref([])
const modalVisible = ref(false)
const isEdit = ref(false)

const formData = reactive({
  id: null,
  tag: '',
  icon: '',
  description: '',
  sortOrder: 0,
  isHot: false
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/api/square/admin/topics',
      method: 'get',
      params: { pageSize: 100 }
    })
    if (res.code === 0 && res.data) {
      tableData.value = res.data.list.map(item => ({
        ...item,
        name: item.tag,
        isHot: item.isHot === 1,
        isOfficial: false
      }))
    }
  } catch (error) {
    console.error('获取话题列表失败:', error)
    Message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const showCreateModal = () => {
  isEdit.value = false
  Object.assign(formData, { id: null, tag: '', icon: '', description: '', sortOrder: 0, isHot: false })
  modalVisible.value = true
}

const editTopic = (record) => {
  isEdit.value = true
  Object.assign(formData, {
    id: record.id,
    tag: record.tag,
    icon: record.icon || '',
    description: record.description || '',
    sortOrder: record.sortOrder || 0,
    isHot: record.isHot
  })
  modalVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.tag) {
    Message.warning('请输入话题名称')
    return
  }
  
  try {
    const url = isEdit.value ? `/api/square/admin/topic/${formData.id}` : '/api/square/admin/topic'
    const method = isEdit.value ? 'put' : 'post'
    
    const res = await request({
      url,
      method,
      data: {
        tag: formData.tag,
        icon: formData.icon || null,
        description: formData.description || null,
        sortOrder: formData.sortOrder,
        isHot: formData.isHot ? 1 : 0
      }
    })
    
    if (res.code === 0) {
      Message.success(isEdit.value ? '修改成功' : '新增成功')
      modalVisible.value = false
      fetchData()
    } else {
      Message.error(res.msg || '操作失败')
    }
  } catch (e) {
    Message.error('操作失败')
  }
}

const toggleHot = async (record) => {
  try {
    const newValue = !record.isHot
    const res = await request({
      url: `/api/square/admin/topic/${record.id}/hot`,
      method: 'post',
      data: { isHot: newValue }
    })
    if (res.code === 0) {
      record.isHot = newValue
      Message.success(newValue ? '已设为热门' : '已取消热门')
    } else {
      Message.error(res.msg || '操作失败')
    }
  } catch (e) {
    Message.error('操作失败')
  }
}

const updateStatus = async (record) => {
  try {
    const res = await request({
      url: `/api/square/admin/topic/${record.id}/status`,
      method: 'post',
      data: { status: record.status }
    })
    if (res.code === 0) {
      Message.success(record.status ? '已启用' : '已禁用')
    } else {
      Message.error(res.msg || '操作失败')
      record.status = record.status ? 0 : 1  // 回滚
    }
  } catch (e) {
    Message.error('操作失败')
    record.status = record.status ? 0 : 1  // 回滚
  }
}

const deleteTopic = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除话题「${record.tag}」吗？`,
    onOk: async () => {
      try {
        const res = await request({
          url: `/api/square/admin/topic/${record.id}`,
          method: 'delete'
        })
        if (res.code === 0) {
          Message.success('删除成功')
          fetchData()
        } else {
          Message.error(res.msg || '删除失败')
        }
      } catch (e) {
        Message.error('删除失败')
      }
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>
