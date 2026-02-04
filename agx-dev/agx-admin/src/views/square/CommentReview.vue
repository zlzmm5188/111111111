<template>
  <div class="comment-review-page">
    <a-card class="page-card">
      <template #title>
        <div class="card-header">
          <h3>评论审核</h3>
          <a-space>
            <a-button type="primary" @click="loadPendingComments">刷新</a-button>
            <a-button 
              type="primary" 
              status="success"
              :disabled="selectedIds.length === 0"
              @click="batchApprove"
            >
              批量通过
            </a-button>
            <a-button 
              type="primary" 
              status="danger"
              :disabled="selectedIds.length === 0"
              @click="batchDelete"
            >
              批量删除
            </a-button>
          </a-space>
        </div>
      </template>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <a-form :model="filterForm" layout="inline">
          <a-form-item label="评论内容">
            <a-input v-model="filterForm.keyword" placeholder="搜索评论内容" style="width: 200px;" />
          </a-form-item>
          <a-form-item label="用户ID">
            <a-input-number v-model="filterForm.userId" placeholder="用户ID" style="width: 150px;" />
          </a-form-item>
          <a-form-item label="帖子ID">
            <a-input-number v-model="filterForm.postId" placeholder="帖子ID" style="width: 150px;" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="resetFilter" style="margin-left: 10px;">重置</a-button>
          </a-form-item>
        </a-form>
      </div>

      <!-- 待审核评论列表 -->
      <a-table 
        :columns="columns" 
        :data-source="pendingComments" 
        :loading="loading" 
        :pagination="pagination"
        :row-selection="rowSelection"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'content'">
            <div class="comment-content">
              <p>{{ record.content }}</p>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'postInfo'">
            <div class="post-info">
              <a-link @click="viewPost(record.postId)">查看帖子 #{{ record.postId }}</a-link>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-space>
              <a-button type="text" size="small" status="success" @click="approveComment(record)">通过</a-button>
              <a-button type="text" size="small" status="danger" @click="deleteComment(record)">删除</a-button>
              <a-button type="text" size="small" @click="viewCommentDetails(record)">详情</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 评论详情弹窗 -->
    <a-modal 
      v-model:visible="detailModalVisible" 
      title="评论详情" 
      width="700px"
      :footer="null"
    >
      <div v-if="selectedComment" class="comment-detail">
        <div class="detail-row">
          <span class="label">评论ID:</span>
          <span class="value">{{ selectedComment.id }}</span>
        </div>
        <div class="detail-row">
          <span class="label">用户:</span>
          <span class="value">
            {{ selectedComment.author?.nickname || `用户${selectedComment.userId}` }}
            (ID: {{ selectedComment.userId }})
          </span>
        </div>
        <div class="detail-row">
          <span class="label">帖子ID:</span>
          <span class="value">
            <a-link @click="viewPost(selectedComment.postId)">{{ selectedComment.postId }}</a-link>
          </span>
        </div>
        <div class="detail-row">
          <span class="label">内容:</span>
          <div class="value content-text">{{ selectedComment.content }}</div>
        </div>
        <div class="detail-row">
          <span class="label">点赞数:</span>
          <span class="value">{{ selectedComment.likeCount || 0 }}</span>
        </div>
        <div class="detail-row">
          <span class="label">创建时间:</span>
          <span class="value">{{ formatDate(selectedComment.createdAt) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">状态:</span>
          <span class="value">
            <a-tag :color="getStatusColor(selectedComment.status)">
              {{ getStatusText(selectedComment.status) }}
            </a-tag>
          </span>
        </div>
        <div class="detail-actions">
          <a-button type="primary" status="success" @click="approveComment(selectedComment)">通过</a-button>
          <a-button type="primary" status="danger" @click="deleteComment(selectedComment)">删除</a-button>
        </div>
      </div>
    </a-modal>

    <!-- 帖子详情弹窗 -->
    <a-modal 
      v-model:visible="postModalVisible" 
      title="帖子详情" 
      width="800px"
      :footer="null"
    >
      <div v-if="currentPost" class="post-detail">
        <div class="post-header">
          <div class="user-info">
            <span class="username">{{ currentPost.author?.nickname || '用户' }}</span>
            <span class="post-time">{{ formatDate(currentPost.createdAt) }}</span>
          </div>
        </div>
        <div class="post-content">
          <p>{{ currentPost.content }}</p>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { api } from '@/utils/api';

// 状态变量
const loading = ref(false);
const pendingComments = ref([]);
const selectedIds = ref([]);
const detailModalVisible = ref(false);
const postModalVisible = ref(false);
const selectedComment = ref(null);
const currentPost = ref(null);

// 筛选表单
const filterForm = reactive({
  keyword: '',
  userId: null,
  postId: null
});

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
});

// 表格行选择
const rowSelection = computed(() => ({
  type: 'checkbox',
  selectedRowKeys: selectedIds.value,
  onChange: (selectedRowKeys) => {
    selectedIds.value = selectedRowKeys;
  }
}));

// 表格列配置
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80
  },
  {
    title: '用户',
    dataIndex: 'userId',
    width: 120,
    customRender: ({ record }) => record.author?.nickname || `用户${record.userId}`
  },
  {
    title: '评论内容',
    dataIndex: 'content',
    width: 300
  },
  {
    title: '所属帖子',
    dataIndex: 'postInfo',
    width: 120
  },
  {
    title: '点赞数',
    dataIndex: 'likeCount',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 180,
    customRender: ({ record }) => new Date(record.createdAt).toLocaleString()
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 200,
    fixed: 'right'
  }
];

// 加载待审核评论
const loadPendingComments = async (params = {}) => {
  loading.value = true;
  try {
    const response = await api.admin.getPendingComments({
      page: params.page || pagination.value.current,
      pageSize: params.pageSize || pagination.value.pageSize,
      keyword: filterForm.keyword,
      userId: filterForm.userId,
      postId: filterForm.postId
    });
    
    if (response.code === 0) {
      pendingComments.value = response.data.list || [];
      pagination.value.total = response.data.total || 0;
      pagination.value.current = response.data.page || 1;
      pagination.value.pageSize = response.data.pageSize || 20;
    } else {
      Message.error(response.msg || '获取待审核评论失败');
    }
  } catch (error) {
    console.error('获取待审核评论失败:', error);
    Message.error('获取待审核评论失败');
  } finally {
    loading.value = false;
  }
};

// 表格变化处理
const handleTableChange = (paginationInfo) => {
  loadPendingComments({
    page: paginationInfo.current,
    pageSize: paginationInfo.pageSize
  });
};

// 搜索
const handleSearch = () => {
  pagination.value.current = 1;
  loadPendingComments();
};

// 重置筛选
const resetFilter = () => {
  filterForm.keyword = '';
  filterForm.userId = null;
  filterForm.postId = null;
  pagination.value.current = 1;
  loadPendingComments();
};

// 通过评论
const approveComment = async (record) => {
  if (!confirm(`确定要通过评论 "${record.content.substring(0, 20)}..." 吗？`)) {
    return;
  }

  try {
    const response = await api.admin.reviewComment({
      commentId: record.id,
      action: 'approve'
    });

    if (response.code === 0) {
      Message.success('审核通过');
      detailModalVisible.value = false;
      loadPendingComments();
    } else {
      Message.error(response.msg || '审核失败');
    }
  } catch (error) {
    console.error('审核失败:', error);
    Message.error('审核失败');
  }
};

// 删除评论
const deleteComment = async (record) => {
  if (!confirm(`确定要删除评论 "${record.content.substring(0, 20)}..." 吗？此操作不可恢复！`)) {
    return;
  }

  try {
    const response = await api.admin.reviewComment({
      commentId: record.id,
      action: 'delete'
    });

    if (response.code === 0) {
      Message.success('删除成功');
      detailModalVisible.value = false;
      loadPendingComments();
    } else {
      Message.error(response.msg || '删除失败');
    }
  } catch (error) {
    console.error('删除失败:', error);
    Message.error('删除失败');
  }
};

// 批量通过
const batchApprove = async () => {
  if (selectedIds.value.length === 0) {
    Message.warning('请选择要通过的评论');
    return;
  }

  if (!confirm(`确定要批量通过选中的 ${selectedIds.value.length} 条评论吗？`)) {
    return;
  }

  try {
    const response = await api.admin.batchReviewComments({
      commentIds: selectedIds.value,
      action: 'approve'
    });

    if (response.code === 0) {
      Message.success('批量审核通过');
      selectedIds.value = [];
      loadPendingComments();
    } else {
      Message.error(response.msg || '批量审核失败');
    }
  } catch (error) {
    console.error('批量审核失败:', error);
    Message.error('批量审核失败');
  }
};

// 批量删除
const batchDelete = async () => {
  if (selectedIds.value.length === 0) {
    Message.warning('请选择要删除的评论');
    return;
  }

  if (!confirm(`确定要批量删除选中的 ${selectedIds.value.length} 条评论吗？此操作不可恢复！`)) {
    return;
  }

  try {
    const response = await api.admin.batchReviewComments({
      commentIds: selectedIds.value,
      action: 'delete'
    });

    if (response.code === 0) {
      Message.success('批量删除成功');
      selectedIds.value = [];
      loadPendingComments();
    } else {
      Message.error(response.msg || '批量删除失败');
    }
  } catch (error) {
    console.error('批量删除失败:', error);
    Message.error('批量删除失败');
  }
};

// 查看评论详情
const viewCommentDetails = (record) => {
  selectedComment.value = record;
  detailModalVisible.value = true;
};

// 查看帖子
const viewPost = async (postId) => {
  try {
    const response = await api.admin.getPostDetail(postId);
    if (response.code === 0) {
      currentPost.value = response.data;
      postModalVisible.value = true;
    } else {
      Message.error(response.msg || '获取帖子详情失败');
    }
  } catch (error) {
    console.error('获取帖子详情失败:', error);
    Message.error('获取帖子详情失败');
  }
};

// 状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '正常',
    '-1': '已删除'
  };
  return statusMap[status] || '未知';
};

// 状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    0: 'orange',
    1: 'green',
    '-1': 'red'
  };
  return colorMap[status] || 'default';
};

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

onMounted(() => {
  loadPendingComments();
});
</script>

<style scoped>
.comment-review-page {
  padding: 20px;
  background: var(--color-bg-2);
  min-height: calc(100vh - 64px);
}

.page-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background: var(--color-fill-2);
  border-radius: 4px;
}

.comment-content {
  max-height: 80px;
  overflow: hidden;
  position: relative;
}

.comment-content p {
  margin: 0;
  line-height: 1.4;
  word-break: break-all;
}

.post-info {
  display: flex;
  align-items: center;
}

.comment-detail .detail-row {
  display: flex;
  margin-bottom: 15px;
  align-items: flex-start;
}

.comment-detail .label {
  width: 100px;
  font-weight: bold;
  color: var(--color-text-2);
  flex-shrink: 0;
}

.comment-detail .value {
  flex: 1;
  color: var(--color-text-1);
}

.comment-detail .content-text {
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
}

.comment-detail .detail-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 10px;
  justify-content: center;
}

.post-detail .post-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border);
}

.post-detail .user-info {
  display: flex;
  justify-content: space-between;
}

.post-detail .username {
  font-weight: bold;
}

.post-detail .post-time {
  color: var(--color-text-3);
  font-size: 12px;
}

.post-detail .post-content {
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
