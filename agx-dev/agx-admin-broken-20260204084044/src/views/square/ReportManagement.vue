<template>
  <div class="report-management-page">
    <a-card class="page-card">
      <template #title>
        <div class="card-header">
          <h3>举报处理</h3>
          <a-button type="primary" @click="loadReports">刷新</a-button>
        </div>
      </template>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <a-form :model="filterForm" layout="inline">
          <a-form-item label="举报类型">
            <a-select v-model="filterForm.targetType" placeholder="全部" style="width: 150px;">
              <a-option :value="undefined">全部</a-option>
              <a-option value="post">帖子</a-option>
              <a-option value="comment">评论</a-option>
              <a-option value="user">用户</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="举报原因">
            <a-select v-model="filterForm.reason" placeholder="全部" style="width: 150px;">
              <a-option :value="undefined">全部</a-option>
              <a-option value="spam">垃圾信息</a-option>
              <a-option value="abuse">辱骂攻击</a-option>
              <a-option value="porn">色情内容</a-option>
              <a-option value="illegal">违法违规</a-option>
              <a-option value="other">其他</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="处理状态">
            <a-select v-model="filterForm.status" placeholder="全部" style="width: 150px;">
              <a-option :value="undefined">全部</a-option>
              <a-option :value="0">待处理</a-option>
              <a-option :value="1">已处理</a-option>
              <a-option :value="-1">已忽略</a-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="resetFilter" style="margin-left: 10px;">重置</a-button>
          </a-form-item>
        </a-form>
      </div>

      <!-- 举报列表 -->
      <a-table 
        :columns="columns" 
        :data-source="reports" 
        :loading="loading" 
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'targetType'">
            <a-tag>{{ getTargetTypeText(record.targetType) }}</a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'reason'">
            <a-tag :color="getReasonColor(record.reason)">
              {{ getReasonText(record.reason) }}
            </a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-space>
              <a-button 
                v-if="record.status === 0"
                type="text" 
                size="small" 
                @click="viewReportDetail(record)"
              >
                处理
              </a-button>
              <a-button type="text" size="small" @click="viewTarget(record)">查看内容</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 举报处理弹窗 -->
    <a-modal 
      v-model:visible="handleModalVisible" 
      title="处理举报" 
      @ok="submitHandle"
      :confirm-loading="submitting"
      width="700px"
    >
      <div v-if="selectedReport" class="report-detail">
        <div class="detail-row">
          <span class="label">举报类型:</span>
          <span class="value">{{ getTargetTypeText(selectedReport.targetType) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">举报原因:</span>
          <span class="value">
            <a-tag :color="getReasonColor(selectedReport.reason)">
              {{ getReasonText(selectedReport.reason) }}
            </a-tag>
          </span>
        </div>
        <div class="detail-row">
          <span class="label">举报说明:</span>
          <div class="value content-text">{{ selectedReport.description || '无' }}</div>
        </div>
        <div class="detail-row">
          <span class="label">举报人:</span>
          <span class="value">
            {{ selectedReport.reporter?.nickname || `用户${selectedReport.reporterId}` }}
            (ID: {{ selectedReport.reporterId }})
          </span>
        </div>
        <div class="detail-row">
          <span class="label">被举报对象:</span>
          <span class="value">{{ selectedReport.targetType }} #{{ selectedReport.targetId }}</span>
        </div>
        <div class="detail-row">
          <span class="label">举报时间:</span>
          <span class="value">{{ formatDate(selectedReport.createdAt) }}</span>
        </div>

        <a-divider />

        <a-form :model="handleForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
          <a-form-item label="处理结果" :required="true">
            <a-radio-group v-model="handleForm.action">
              <a-radio value="accept">接受举报并处理</a-radio>
              <a-radio value="ignore">忽略举报</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item v-if="handleForm.action === 'accept'" label="处理措施" :required="true">
            <a-checkbox-group v-model="handleForm.measures">
              <a-checkbox value="delete">删除内容</a-checkbox>
              <a-checkbox value="ban_user">封禁用户</a-checkbox>
              <a-checkbox value="warning">警告用户</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item v-if="handleForm.measures.includes('ban_user')" label="封禁天数">
            <a-input-number v-model="handleForm.banDays" :min="1" :max="365" placeholder="封禁天数" />
          </a-form-item>
          <a-form-item label="处理备注">
            <a-textarea 
              v-model="handleForm.remark" 
              placeholder="请输入处理备注"
              :auto-size="{ minRows: 3, maxRows: 6 }"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 内容查看弹窗 -->
    <a-modal 
      v-model:visible="contentModalVisible" 
      title="举报内容" 
      width="800px"
      :footer="null"
    >
      <div v-if="targetContent" class="target-content">
        <div v-if="selectedReport?.targetType === 'post'" class="post-content">
          <div class="content-header">
            <span class="author">{{ targetContent.author?.nickname || '用户' }}</span>
            <span class="time">{{ formatDate(targetContent.createdAt) }}</span>
          </div>
          <div class="content-body">
            <p>{{ targetContent.content }}</p>
            <div v-if="targetContent.images" class="images">
              <img 
                v-for="(image, index) in JSON.parse(targetContent.images)" 
                :key="index" 
                :src="image" 
                alt="图片"
              />
            </div>
          </div>
        </div>
        <div v-else-if="selectedReport?.targetType === 'comment'" class="comment-content">
          <div class="content-header">
            <span class="author">{{ targetContent.author?.nickname || '用户' }}</span>
            <span class="time">{{ formatDate(targetContent.createdAt) }}</span>
          </div>
          <div class="content-body">
            <p>{{ targetContent.content }}</p>
          </div>
        </div>
        <div v-else-if="selectedReport?.targetType === 'user'" class="user-content">
          <div class="user-info">
            <div class="info-row">
              <span class="label">用户ID:</span>
              <span class="value">{{ targetContent.id }}</span>
            </div>
            <div class="info-row">
              <span class="label">昵称:</span>
              <span class="value">{{ targetContent.nickname }}</span>
            </div>
            <div class="info-row">
              <span class="label">邮箱:</span>
              <span class="value">{{ targetContent.email }}</span>
            </div>
            <div class="info-row">
              <span class="label">注册时间:</span>
              <span class="value">{{ formatDate(targetContent.createdAt) }}</span>
            </div>
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
const submitting = ref(false);
const reports = ref([]);
const handleModalVisible = ref(false);
const contentModalVisible = ref(false);
const selectedReport = ref(null);
const targetContent = ref(null);

// 筛选表单
const filterForm = reactive({
  targetType: undefined,
  reason: undefined,
  status: undefined
});

// 处理表单
const handleForm = reactive({
  action: 'accept',
  measures: [],
  banDays: 7,
  remark: ''
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

// 表格列配置
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80
  },
  {
    title: '举报类型',
    dataIndex: 'targetType',
    width: 100
  },
  {
    title: '举报原因',
    dataIndex: 'reason',
    width: 120
  },
  {
    title: '被举报对象',
    dataIndex: 'targetId',
    width: 120,
    customRender: ({ record }) => `${record.targetType} #${record.targetId}`
  },
  {
    title: '举报人',
    dataIndex: 'reporterId',
    width: 120,
    customRender: ({ record }) => record.reporter?.nickname || `用户${record.reporterId}`
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100
  },
  {
    title: '举报时间',
    dataIndex: 'createdAt',
    width: 180,
    customRender: ({ record }) => new Date(record.createdAt).toLocaleString()
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 180,
    fixed: 'right'
  }
];

// 加载举报列表
const loadReports = async (params = {}) => {
  loading.value = true;
  try {
    const response = await api.admin.getReportList({
      page: params.page || pagination.value.current,
      pageSize: params.pageSize || pagination.value.pageSize,
      targetType: filterForm.targetType,
      reason: filterForm.reason,
      status: filterForm.status
    });
    
    if (response.code === 0) {
      reports.value = response.data.list || [];
      pagination.value.total = response.data.total || 0;
      pagination.value.current = response.data.page || 1;
      pagination.value.pageSize = response.data.pageSize || 20;
    } else {
      Message.error(response.msg || '获取举报列表失败');
    }
  } catch (error) {
    console.error('获取举报列表失败:', error);
    Message.error('获取举报列表失败');
  } finally {
    loading.value = false;
  }
};

// 表格变化处理
const handleTableChange = (paginationInfo) => {
  loadReports({
    page: paginationInfo.current,
    pageSize: paginationInfo.pageSize
  });
};

// 搜索
const handleSearch = () => {
  pagination.value.current = 1;
  loadReports();
};

// 重置筛选
const resetFilter = () => {
  filterForm.targetType = undefined;
  filterForm.reason = undefined;
  filterForm.status = undefined;
  pagination.value.current = 1;
  loadReports();
};

// 查看举报详情并处理
const viewReportDetail = (record) => {
  selectedReport.value = record;
  handleForm.action = 'accept';
  handleForm.measures = [];
  handleForm.banDays = 7;
  handleForm.remark = '';
  handleModalVisible.value = true;
};

// 提交处理
const submitHandle = async () => {
  if (!selectedReport.value) return;

  if (handleForm.action === 'accept' && handleForm.measures.length === 0) {
    Message.error('请选择处理措施');
    return;
  }

  submitting.value = true;
  try {
    const response = await api.admin.handleReport({
      reportId: selectedReport.value.id,
      action: handleForm.action,
      measures: handleForm.measures,
      banDays: handleForm.banDays,
      remark: handleForm.remark
    });

    if (response.code === 0) {
      Message.success('处理成功');
      handleModalVisible.value = false;
      loadReports();
    } else {
      Message.error(response.msg || '处理失败');
    }
  } catch (error) {
    console.error('处理失败:', error);
    Message.error('处理失败');
  } finally {
    submitting.value = false;
  }
};

// 查看被举报内容
const viewTarget = async (record) => {
  selectedReport.value = record;
  try {
    let response;
    if (record.targetType === 'post') {
      response = await api.admin.getPostDetail(record.targetId);
    } else if (record.targetType === 'comment') {
      response = await api.admin.getCommentDetail(record.targetId);
    } else if (record.targetType === 'user') {
      response = await api.admin.getUserDetail(record.targetId);
    }

    if (response && response.code === 0) {
      targetContent.value = response.data;
      contentModalVisible.value = true;
    } else {
      Message.error('获取内容失败');
    }
  } catch (error) {
    console.error('获取内容失败:', error);
    Message.error('获取内容失败');
  }
};

// 举报类型文本
const getTargetTypeText = (type) => {
  const typeMap = {
    post: '帖子',
    comment: '评论',
    user: '用户'
  };
  return typeMap[type] || type;
};

// 举报原因文本
const getReasonText = (reason) => {
  const reasonMap = {
    spam: '垃圾信息',
    abuse: '辱骂攻击',
    porn: '色情内容',
    illegal: '违法违规',
    other: '其他'
  };
  return reasonMap[reason] || reason;
};

// 举报原因颜色
const getReasonColor = (reason) => {
  const colorMap = {
    spam: 'orange',
    abuse: 'red',
    porn: 'purple',
    illegal: 'red',
    other: 'gray'
  };
  return colorMap[reason] || 'default';
};

// 状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待处理',
    1: '已处理',
    '-1': '已忽略'
  };
  return statusMap[status] || '未知';
};

// 状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    0: 'orange',
    1: 'green',
    '-1': 'gray'
  };
  return colorMap[status] || 'default';
};

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

onMounted(() => {
  loadReports();
});
</script>

<style scoped>
.report-management-page {
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

.report-detail .detail-row {
  display: flex;
  margin-bottom: 15px;
  align-items: flex-start;
}

.report-detail .label {
  width: 100px;
  font-weight: bold;
  color: var(--color-text-2);
  flex-shrink: 0;
}

.report-detail .value {
  flex: 1;
  color: var(--color-text-1);
}

.report-detail .content-text {
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
}

.target-content .content-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border);
}

.target-content .author {
  font-weight: bold;
}

.target-content .time {
  color: var(--color-text-3);
  font-size: 12px;
}

.target-content .content-body {
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.target-content .images {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.target-content .images img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
}

.user-info .info-row {
  display: flex;
  margin-bottom: 10px;
}

.user-info .label {
  width: 100px;
  font-weight: bold;
  color: var(--color-text-2);
}

.user-info .value {
  flex: 1;
  color: var(--color-text-1);
}
</style>
