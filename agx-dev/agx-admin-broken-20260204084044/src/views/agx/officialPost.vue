<template>
  <div class="p-4">
    <a-card title="官方内容发布" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="showCreateModal">
          <template #icon><icon-plus /></template>
          发布内容
        </a-button>
      </template>

      <!-- 搜索筛选 -->
      <a-row :gutter="16" class="mb-4">
        <a-col :span="6">
          <a-input-search v-model="searchForm.keyword" placeholder="搜索标题/内容" @search="handleSearch" />
        </a-col>
        <a-col :span="4">
          <a-select v-model="searchForm.status" placeholder="状态" allow-clear style="width: 100%">
            <a-option :value="1">已发布</a-option>
            <a-option :value="0">草稿</a-option>
            <a-option :value="2">已下架</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select v-model="searchForm.topicId" placeholder="话题" allow-clear style="width: 100%">
            <a-option v-for="t in topicList" :key="t.id" :value="t.id">{{ t.name }}</a-option>
          </a-select>
        </a-col>
      </a-row>

      <a-table :data="tableData" :loading="loading" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="内容" :width="300">
            <template #cell="{ record }">
              <div class="flex items-start gap-2">
                <a-image v-if="record.images && record.images.length" :src="record.images[0]" width="60" height="60" fit="cover" />
                <div>
                  <div class="font-medium line-clamp-2">{{ record.content }}</div>
                  <div class="text-gray-400 text-xs mt-1">
                    <a-tag v-if="record.isTop === 1" color="red" size="small">置顶</a-tag>
                    <a-tag v-if="record.isHot === 1" color="orange" size="small">热门</a-tag>
                    <a-tag v-if="record.isOfficial === 1" color="blue" size="small">官方</a-tag>
                    <a-tag v-if="record.topic" size="small">#{{ record.topic }}</a-tag>
                  </div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="权重" data-index="weight" :width="80" />
          <a-table-column title="数据" :width="140">
            <template #cell="{ record }">
              <div class="text-xs text-gray-400">
                <div>浏览 {{ record.viewCount }}</div>
                <div>点赞 {{ record.likeCount }} · 评论 {{ record.commentCount }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="发布时间" data-index="createdAt" :width="160" />
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="editPost(record)">编辑</a-button>
                <a-button type="text" size="small" :status="record.isTop === 1 ? 'warning' : 'normal'" @click="toggleTop(record)">
                  {{ record.isTop === 1 ? '取消置顶' : '置顶' }}
                </a-button>
                <a-dropdown>
                  <a-button type="text" size="small">更多</a-button>
                  <template #content>
                    <a-doption @click="toggleHot(record)">{{ record.isHot === 1 ? '取消热门' : '设为热门' }}</a-doption>
                    <a-doption @click="toggleOfficial(record)">{{ record.isOfficial === 1 ? '取消官方' : '设为官方' }}</a-doption>
                    <a-doption @click="setWeight(record)">设置权重</a-doption>
                    <a-doption v-if="record.status === 1" @click="offlinePost(record)">下架</a-doption>
                    <a-doption v-if="record.status !== 1" @click="restorePost(record)">恢复</a-doption>
                    <a-doption status="danger" @click="deletePost(record)">删除</a-doption>
                  </template>
                </a-dropdown>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 发布/编辑弹窗 -->
    <a-modal v-model:visible="modalVisible" :title="isEdit ? '编辑内容' : '发布内容'" width="700px" @ok="handleSubmit">
      <a-form :model="formData" layout="vertical">
        <a-form-item label="内容" required>
          <a-textarea v-model="formData.content" :max-length="1000" show-word-limit :auto-size="{ minRows: 4, maxRows: 8 }" placeholder="请输入内容" />
        </a-form-item>
        <a-form-item label="图片">
          <a-upload list-type="picture-card" :limit="9" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="话题">
              <a-select v-model="formData.topicId" placeholder="选择话题" allow-clear>
                <a-option v-for="t in topicList" :key="t.id" :value="t.id">{{ t.name }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="权重">
              <a-input-number v-model="formData.weight" :min="0" :max="9999" style="width: 100%" />
              <template #help>权重越高，排序越靠前</template>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="置顶">
              <a-switch v-model="formData.isTop" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="精华">
              <a-switch v-model="formData.isFeatured" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="立即发布">
              <a-switch v-model="formData.publishNow" />
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

const searchForm = reactive({
  keyword: '',
  status: null,
  isTop: null,
  isHot: null,
  isOfficial: 1  // 默认筛选官方帖子
})

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

const formData = reactive({
  id: null,
  content: '',
  images: [],
  topic: null,
  weight: 0,
  isTop: false,
  isHot: false,
  isOfficial: true,
  publishNow: true
})

const topicList = ref([])

const getStatusColor = (status) => {
  const colors = { '-1': 'red', 0: 'orange', 1: 'green' }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = { '-1': '已下架', 0: '待审核', 1: '已发布' }
  return texts[status] || '未知'
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      status: searchForm.status !== null ? searchForm.status : undefined,
      isTop: searchForm.isTop !== null ? searchForm.isTop : undefined,
      isHot: searchForm.isHot !== null ? searchForm.isHot : undefined,
      isOfficial: searchForm.isOfficial !== null ? searchForm.isOfficial : undefined,
    }
    // 过滤 undefined 参数
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key])
    
    const res = await request({
      url: '/api/square/admin/posts',
      method: 'get',
      params
    })
    if (res.code === 0 && res.data) {
      tableData.value = res.data.list.map(item => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : []
      }))
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    Message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const fetchTopics = async () => {
  try {
    const res = await request({
      url: '/api/square/topics',
      method: 'get',
      params: { limit: 50 }
    })
    if (res.code === 0 && res.data && res.data.list) {
      topicList.value = res.data.list.map(t => ({ id: t.id, name: t.tag }))
    }
  } catch (e) {
    console.error('获取话题失败:', e)
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

const showCreateModal = () => {
  isEdit.value = false
  Object.assign(formData, { id: null, content: '', images: [], topic: null, weight: 0, isTop: false, isHot: false, isOfficial: true, publishNow: true })
  modalVisible.value = true
}

const editPost = (record) => {
  isEdit.value = true
  Object.assign(formData, {
    ...record,
    isTop: record.isTop === 1,
    isHot: record.isHot === 1,
    isOfficial: record.isOfficial === 1
  })
  modalVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.content) {
    Message.warning('请输入内容')
    return
  }
  
  // TODO: 实现创建/编辑帖子API
  Message.success(isEdit.value ? '修改成功' : '发布成功')
  modalVisible.value = false
  fetchData()
}

const toggleTop = async (record) => {
  try {
    const newValue = record.isTop !== 1
    const res = await request({
      url: `/api/square/admin/post/${record.id}/top`,
      method: 'post',
      data: { isTop: newValue }
    })
    if (res.code === 0) {
      record.isTop = newValue ? 1 : 0
      Message.success(newValue ? '已置顶' : '已取消置顶')
    } else {
      Message.error(res.msg || '操作失败')
    }
  } catch (e) {
    Message.error('操作失败')
  }
}

const toggleHot = async (record) => {
  try {
    const newValue = record.isHot !== 1
    const res = await request({
      url: `/api/square/admin/post/${record.id}/hot`,
      method: 'post',
      data: { isHot: newValue }
    })
    if (res.code === 0) {
      record.isHot = newValue ? 1 : 0
      Message.success(newValue ? '已设为热门' : '已取消热门')
    } else {
      Message.error(res.msg || '操作失败')
    }
  } catch (e) {
    Message.error('操作失败')
  }
}

const toggleOfficial = async (record) => {
  try {
    const newValue = record.isOfficial !== 1
    const res = await request({
      url: `/api/square/admin/post/${record.id}/official`,
      method: 'post',
      data: { isOfficial: newValue }
    })
    if (res.code === 0) {
      record.isOfficial = newValue ? 1 : 0
      Message.success(newValue ? '已设为官方' : '已取消官方')
    } else {
      Message.error(res.msg || '操作失败')
    }
  } catch (e) {
    Message.error('操作失败')
  }
}

const setWeight = (record) => {
  Modal.confirm({
    title: '设置权重',
    content: () => {
      return h('div', [
        h('p', '当前权重: ' + record.weight),
        h('a-input-number', {
          modelValue: record.weight,
          'onUpdate:modelValue': (val) => { record._newWeight = val },
          min: 0,
          max: 9999
        })
      ])
    },
    onOk: async () => {
      if (record._newWeight !== undefined) {
        try {
          const res = await request({
            url: `/api/square/admin/post/${record.id}/weight`,
            method: 'post',
            data: { weight: record._newWeight }
          })
          if (res.code === 0) {
            record.weight = record._newWeight
            Message.success('设置成功')
          }
        } catch (e) {
          Message.error('设置失败')
        }
      }
    }
  })
}

const offlinePost = (record) => {
  Modal.confirm({
    title: '确认下架',
    content: '确定要下架这条内容吗？',
    onOk: async () => {
      try {
        const res = await request({
          url: `/api/square/admin/post/${record.id}/offline`,
          method: 'post',
          data: { reason: '管理员下架' }
        })
        if (res.code === 0) {
          record.status = -1
          Message.success('已下架')
        } else {
          Message.error(res.msg || '操作失败')
        }
      } catch (e) {
        Message.error('操作失败')
      }
    }
  })
}

const restorePost = async (record) => {
  try {
    const res = await request({
      url: `/api/square/admin/post/${record.id}/restore`,
      method: 'post'
    })
    if (res.code === 0) {
      record.status = 1
      Message.success('已恢复')
    } else {
      Message.error(res.msg || '操作失败')
    }
  } catch (e) {
    Message.error('操作失败')
  }
}

const deletePost = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除吗？',
    onOk: async () => {
      try {
        const res = await request({
          url: `/api/square/admin/post/${record.id}`,
          method: 'delete'
        })
        if (res.code === 0) {
          Message.success('已删除')
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
  fetchTopics()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
