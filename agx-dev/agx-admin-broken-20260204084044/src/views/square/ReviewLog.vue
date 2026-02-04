<template>
  <div class="review-log-page">
    <a-card class="page-card">
      <template #title>
        <div class="card-header">
          <h3>审核日志</h3>
          <a-button type="primary" @click="loadLogs">刷新</a-button>
        </div>
      </template>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <a-form :model="filterForm" layout="inline">
          <a-form-item label="审核类型">
            <a-select v-model="filterForm.reviewType" placeholder="全部" style="width: 150px;">
              <a-option :value="undefined">全部</a-option>
              <a-option value="post">帖子审核</a-option>
              <a-option value="comment">评论审核</a-option>
              <a-option value="report">举报处理</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="审核结果">
            <a-select v-model="filterForm.action" placeholder="全部" style="width: 150px;">
              <a-option :value="undefined">全部</a-option>
              <a-option value="approve">通过</a-option>
              <a-option value="reject">拒绝</a-option>
              <a-option value="delete">删除</a-option>
              <a-option value="modify">修改</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="审核人">
            <a-input v-model="filterForm.reviewerKeyword" placeholder="输入审核人昵称" style="width: 150px;" />
          </a-form-item>
          <a-form-item label="时间范围">
            <a-range-picker 
              v-model="filterForm.dateRange" 
              style="width: 300px;"
              :shortcuts="dateShortcuts"
            />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="resetFilter" style="margin-left: 10px;">重置</a-button>
          </a-form-item>
        </a-form>
      </div>

      <!-- 日志列表 -->
      <a-table 
        :columns="columns" 
        :data-source="logs" 
        :loading="loading" 
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'reviewType'">
            <a-tag>{{ getReviewTypeText(record.reviewType) }}</a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-tag :color="getActionColor(record.action)">
              {{ getActionText(record.action) }}
            </a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'targetInfo'">
            <div class="target-info">
              <div>类型: {{ record.targetType }}</div>
              <div>ID: {{ record.targetId }}</div>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'reason'">
            <div class="reason-text">
              {{ record.reason || '-' }}
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'operation'">
            <a-space>
              <a-button type="text" size="small" @click="viewLogDetail(record)">详情</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 日志详情弹窗 -->
    <a-modal 
      v-model:visible="detailModalVisible" 
      title="审核日志详情" 
      width="700px"
      :footer="null"
    >
      <div v-if="selectedLog" class="log-detail">
        <div class="detail-section">
          <h4>基本信息</h4>
          <div class="detail-row">
            <span class="label">日志ID:</span>
            <span class="value">{{ selectedLog.id }}</span>
          </div>
          <div class="detail-row">
            <span class="label">审核类型:</span>
            <span class="value">
              <a-tag>{{ getReviewTypeText(selectedLog.reviewType) }}</a-tag>
            </span>
          </div>
          <div class="detail-row">
            <span class="label">审核结果:</span>
            <span class="value">
              <a-tag :color="getActionColor(selectedLog.action)">
                {{ getActionText(selectedLog.action) }}
              </a-tag>
            </span>
          </div>
          <div class="detail-row">
            <span class="label">审核人:</span>
            <span class="value">
              {{ selectedLog.reviewer?.nickname || `用户${selectedLog.reviewerId}` }}
              (ID: {{ selectedLog.reviewerId }})
            </span>
          </div>
          <div class="detail-row">
            <span class="label">审核时间:</span>
            <span class="value">{{ formatDate(selectedLog.createdAt) }}</span>
          </div>
        </div>

        <a-divider />

        <div class="detail-section">
          <h4>审核对象</h4>
          <div class="detail-row">
            <span class="label">对象类型:</span>
            <span class="value">{{ selectedLog.targetType }}</span>
          </div>
          <div class="detail-row">
            <span class="label">对象ID:</span>
            <span class="value">{{ selectedLog.targetId }}</span>
          </div>
        </div>

        <a-divider />

        <div class="detail-section">
          <h4>审核说明</h4>
          <div class="detail-row">
            <div class="reason-content">{{ selectedLog.reason || '无' }}</div>
          </div>
        </div>

        <a-divider v-if="selectedLog.remark" />

        <div v-if="selectedLog.remark" class="detail-section">
          <h4>备注信息</h4>
          <div class="detail-row">
            <div class="remark-content">{{ selectedLog.remark }}</div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { api } from '@/utils/api';

// 状态变量
const loading = ref(false);
const logs = ref([]);
const detailModalVisible = ref(false);
const selectedLog = ref(null);

// 筛选表单
const filterForm = reactive({
  reviewType: undefined,
  action: undefined,
  reviewerKeyword: '',
  dateRange: []
});

// 日期快捷选项
const dateShortcuts = [
  {
    label: '今天',
    value: () => {
      const today = new Date();
      return [today, today];
    }
  },
  {
    label: '最近7天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return [start, end];
    }
  },
  {
    label: '最近30天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 29);
      return [start, end];
    }
  }
];

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
});

// 表格列配置
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80
  },
  {
    title: '审核类型',
    dataIndex: 'reviewType',
    width: 120
  },
  {
    title: '审核结果',
    dataIndex: 'action',
    width: 100
  },
  {
    title: '审核对象',
    dataIndex: 'targetInfo',
    width: 150
  },
  {
    title: '审核人',
    dataIndex: 'reviewerId',
    width: 120,
    customRender: ({ record }) => record.reviewer?.nickname || `用户${record.reviewerId}`
  },
  {
    title: '审核说明',
    dataIndex: 'reason',
    width: 200
  },
  {
    title: '审核时间',
    dataIndex: 'createdAt',
    width: 180,
    customRender: ({ record }) => new Date(record.createdAt).toLocaleString()
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 100,
    fixed: 'right'
  }
];

// 加载日志列表
const loadLogs = async (params = {}) => {
  loading.value = true;
  try {
    const requestParams = {
      page: params.page || pagination.value.current,
      pageSize: params.pageSize || pagination.value.pageSize,
      reviewType: filterForm.reviewType,
      action: filterForm.action,
      reviewerKeyword: filterForm.reviewerKeyword
    };

    // 添加日期范围
    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      requestParams.startDate = filterForm.dateRange[0].toISOString().split('T')[0];
      requestParams.endDate = filterForm.dateRange[1].toISOString().split('T')[0];
    }

    const response = await api.admin.getReviewLogs(requestParams);
    
    if (response.code === 0) {
      logs.value = response.data.list || [];
      pagination.value.total = response.data.total || 0;
      pagination.value.current = response.data.page || 1;
      pagination.value.pageSize = response.data.pageSize || 20;
    } else {
      Message.error(response.msg || '获取审核日志失败');
    }
  } catch (error) {
    console.error('获取审核日志失败:', error);
    Message.error('获取审核日志失败');
  } finally {
    loading.value = false;
  }
};

// 表格变化处理
const handleTableChange = (paginationInfo) => {
  loadLogs({
    page: paginationInfo.current,
    pageSize: paginationInfo.pageSize
  });
};

// 搜索
const handleSearch = () => {
  pagination.value.current = 1;
  loadLogs();
};

// 重置筛选
const resetFilter = () => {
  filterForm.reviewType = undefined;
  filterForm.action = undefined;
  filterForm.reviewerKeyword = '';
  filterForm.dateRange = [];
  pagination.value.current = 1;
  loadLogs();
};

// 查看日志详情
const viewLogDetail = (record) => {
  selectedLog.value = record;
  detailModalVisible.value = true;
};

// 审核类型文本
const getReviewTypeText = (type) => {
  const typeMap = {
    post: '帖子审核',
    comment: '评论审核',
    report: '举报处理'
  };
  return typeMap[type] || type;
};

// 审核结果文本
const getActionText = (action) => {
  const actionMap = {
    approve: '通过',
    reject: '拒绝',
    delete: '删除',
    modify: '修改',
    ignore: '忽略'
  };
  return actionMap[action] || action;
};

// 审核结果颜色
const getActionColor = (action) => {
  const colorMap = {
    approve: 'green',
    reject: 'red',
    delete: 'red',
    modify: 'orange',
    ignore: 'gray'
  };
  return colorMap[action] || 'default';
};

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

onMounted(() => {
  loadLogs();
});
</script>

<style scoped>
.review-log-page {
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

.target-info {
  font-size: 12px;
  line-height: 1.5;
}

.reason-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-detail .detail-section {
  margin-bottom: 10px;
}

.log-detail .detail-section h4 {
  margin-bottom: 10px;
  color: var(--color-text-2);
  font-weight: bold;
}

.log-detail .detail-row {
  display: flex;
  margin-bottom: 10px;
  align-items: flex-start;
}

.log-detail .label {
  width: 100px;
  font-weight: bold;
  color: var(--color-text-2);
  flex-shrink: 0;
}

.log-detail .value {
  flex: 1;
  color: var(--color-text-1);
}

.log-detail .reason-content,
.log-detail .remark-content {
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
  padding: 10px;
  background: var(--color-fill-2);
  border-radius: 4px;
}
</style>
