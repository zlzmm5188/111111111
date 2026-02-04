<template>
  <div class="agx-page">
    <!-- 统计卡片 -->
    <div class="agx-data-panel">
      <div class="agx-stat-card pending" @click="filterByStatus(0)">
        <div class="stat-icon">
          <icon-clock-circle />
        </div>
        <div class="stat-content">
          <div class="stat-label">待审核</div>
          <div class="stat-value">{{ stats.pendingCount }}</div>
        </div>
      </div>
      <div class="agx-stat-card success" @click="filterByStatus(1)">
        <div class="stat-icon">
          <icon-check-circle />
        </div>
        <div class="stat-content">
          <div class="stat-label">已通过</div>
          <div class="stat-value">{{ stats.approvedCount }}</div>
        </div>
      </div>
      <div class="agx-stat-card danger" @click="filterByStatus(2)">
        <div class="stat-icon">
          <icon-close-circle />
        </div>
        <div class="stat-content">
          <div class="stat-label">已拒绝</div>
          <div class="stat-value">{{ stats.rejectedCount }}</div>
        </div>
      </div>
      <div class="agx-stat-card">
        <div class="stat-label">今日提交</div>
        <div class="stat-value">{{ stats.todayCount }}</div>
        <div class="stat-desc">认证申请</div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="agx-search-bar">
      <a-input 
        v-model="searchForm.keyword" 
        placeholder="用户名 / 真实姓名 / 证件号" 
        allow-clear 
        style="width: 240px"
      >
        <template #prefix><icon-search /></template>
      </a-input>
      <a-select v-model="searchForm.idType" placeholder="证件类型" allow-clear style="width: 130px">
        <a-option :value="1">身份证</a-option>
        <a-option :value="2">护照</a-option>
        <a-option :value="3">驾照</a-option>
      </a-select>
      <a-select v-model="searchForm.status" placeholder="审核状态" allow-clear style="width: 130px">
        <a-option :value="0">待审核</a-option>
        <a-option :value="1">已通过</a-option>
        <a-option :value="2">已拒绝</a-option>
      </a-select>
      <a-button type="primary" @click="handleSearch">
        <template #icon><icon-search /></template>
        搜索
      </a-button>
      <a-button @click="handleReset">
        <template #icon><icon-refresh /></template>
        重置
      </a-button>
    </div>

    <!-- 数据表格 -->
    <div class="agx-card agx-table">
      <a-table 
        :data="tableData" 
        :loading="loading" 
        :pagination="pagination" 
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        row-key="id"
        :scroll="{ x: 1100 }"
      >
        <template #columns>
          <a-table-column title="用户" :width="150">
            <template #cell="{ record }">
              <div class="user-cell">
                <span class="username">{{ record.username || '-' }}</span>
                <span class="user-id">ID: {{ record.userId }}</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="真实姓名" data-index="realName" :width="120" />
          <a-table-column title="证件类型" :width="100" align="center">
            <template #cell="{ record }">
              <span class="id-type-tag">{{ getIdTypeText(record.idType) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="证件号码" :width="160">
            <template #cell="{ record }">
              <span class="id-number">{{ maskIdNumber(record.idNumber) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100" align="center">
            <template #cell="{ record }">
              <span class="agx-status" :class="getStatusClass(record.status)">
                {{ getStatusText(record.status) }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="提交时间" data-index="createdAt" :width="170" />
          <a-table-column title="操作" :width="180" fixed="right" align="center">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">
                  <icon-eye /> 查看
                </a-button>
                <template v-if="record.status === 0">
                  <a-button type="text" status="success" size="small" @click="handleApprove(record)">
                    <icon-check /> 通过
                  </a-button>
                  <a-button type="text" status="danger" size="small" @click="openRejectModal(record)">
                    <icon-close /> 拒绝
                  </a-button>
                </template>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <!-- KYC详情弹窗 -->
    <a-modal 
      v-model:visible="viewVisible" 
      title="KYC 认证详情" 
      :footer="false" 
      :width="680"
      class="agx-modal"
    >
      <div class="kyc-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <div class="section-title">基本信息</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">用户名</span>
              <span class="value">{{ currentRecord.username }}</span>
            </div>
            <div class="info-item">
              <span class="label">真实姓名</span>
              <span class="value">{{ currentRecord.realName }}</span>
            </div>
            <div class="info-item">
              <span class="label">证件类型</span>
              <span class="value">{{ getIdTypeText(currentRecord.idType) }}</span>
            </div>
            <div class="info-item">
              <span class="label">证件号码</span>
              <span class="value mono">{{ currentRecord.idNumber }}</span>
            </div>
            <div class="info-item">
              <span class="label">提交时间</span>
              <span class="value">{{ currentRecord.createdAt }}</span>
            </div>
            <div class="info-item">
              <span class="label">审核状态</span>
              <span class="value">
                <span class="agx-status" :class="getStatusClass(currentRecord.status)">
                  {{ getStatusText(currentRecord.status) }}
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- 证件照片 -->
        <div class="detail-section">
          <div class="section-title">证件照片</div>
          <div class="image-grid">
            <div class="image-item">
              <div class="image-label">正面照</div>
              <a-image 
                :src="getProxyImageUrl(currentRecord.frontImage)" 
                :preview-props="{ actionsLayout: ['zoomIn', 'zoomOut', 'rotateRight', 'originalSize'] }"
                fit="contain"
                class="kyc-image"
              />
            </div>
            <div class="image-item" v-if="currentRecord.backImage">
              <div class="image-label">反面照</div>
              <a-image 
                :src="getProxyImageUrl(currentRecord.backImage)" 
                :preview-props="{ actionsLayout: ['zoomIn', 'zoomOut', 'rotateRight', 'originalSize'] }"
                fit="contain"
                class="kyc-image"
              />
            </div>
            <div class="image-item" v-if="currentRecord.holdImage">
              <div class="image-label">手持证件/自拍照</div>
              <a-image 
                :src="getProxyImageUrl(currentRecord.holdImage)" 
                :preview-props="{ actionsLayout: ['zoomIn', 'zoomOut', 'rotateRight', 'originalSize'] }"
                fit="contain"
                class="kyc-image"
              />
            </div>
          </div>
        </div>

        <!-- 待审核操作按钮 -->
        <div class="detail-actions" v-if="currentRecord.status === 0">
          <a-button type="primary" status="success" size="large" @click="handleApproveFromDetail">
            <icon-check /> 通过认证
          </a-button>
          <a-button type="outline" status="danger" size="large" @click="handleRejectFromDetail">
            <icon-close /> 拒绝认证
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- 拒绝原因弹窗 -->
    <a-modal 
      v-model:visible="rejectVisible" 
      title="拒绝认证" 
      :width="480"
      @ok="handleReject"
      ok-text="确认拒绝"
      cancel-text="取消"
      class="agx-modal"
    >
      <div class="reject-user-info">
        <span class="label">用户：</span>
        <span class="value">{{ rejectRecord?.username }} - {{ rejectRecord?.realName }}</span>
      </div>
      <a-form layout="vertical" class="agx-form">
        <a-form-item label="拒绝原因" required>
          <a-select v-model="rejectReason" placeholder="选择拒绝原因">
            <a-option value="证件照片不清晰">证件照片不清晰</a-option>
            <a-option value="证件信息不匹配">证件信息不匹配</a-option>
            <a-option value="证件已过期">证件已过期</a-option>
            <a-option value="疑似伪造证件">疑似伪造证件</a-option>
            <a-option value="其他原因">其他原因</a-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="rejectReason === '其他原因'" label="补充说明" required>
          <a-textarea 
            v-model="rejectReasonExtra" 
            placeholder="请输入具体拒绝原因" 
            :max-length="200"
            show-word-limit
            :auto-size="{ minRows: 2, maxRows: 4 }"
          />
        </a-form-item>
      </a-form>
      <div class="modal-tip warning">
        <icon-exclamation-circle /> 拒绝后用户需要重新提交认证资料
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import agxApi from '@/api/agx'

const loading = ref(false)
const viewVisible = ref(false)
const currentRecord = ref({})
const tableData = ref([])

// 统计数据
const stats = reactive({
  pendingCount: 0,
  approvedCount: 0,
  rejectedCount: 0,
  todayCount: 0
})

const searchForm = reactive({ 
  keyword: '',
  idType: undefined,
  status: undefined 
})

const pagination = reactive({ 
  current: 1, 
  pageSize: 20, 
  total: 0, 
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

const rejectVisible = ref(false)
const rejectReason = ref('')
const rejectReasonExtra = ref('')
const rejectRecord = ref(null)

// 证件类型文本
const getIdTypeText = (type) => {
  const map = { 1: '身份证', 2: '护照', 3: '驾照' }
  return map[type] || '其他'
}

// 状态文本
const getStatusText = (status) => {
  const map = { 0: '待审核', 1: '已通过', 2: '已拒绝' }
  return map[status] || '未知'
}

// 获取图片代理URL
const getProxyImageUrl = (url) => {
  if (!url) return '/not-image.png'
  // 如果是签名URL或包含R2存储URL，使用代理
  if (url.includes('r2.cloudflarestorage.com') || url.includes('X-Amz-Signature')) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
    return `${baseUrl}/api/upload/proxy?key=${encodeURIComponent(url)}`
  }
  return url
}

// 状态样式
const getStatusClass = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'default'
}

// 隐藏证件号中间部分
const maskIdNumber = (idNumber) => {
  if (!idNumber || idNumber.length < 8) return idNumber
  const start = idNumber.slice(0, 4)
  const end = idNumber.slice(-4)
  return `${start}****${end}`
}

// 按状态筛选
const filterByStatus = (status) => {
  searchForm.status = status
  pagination.current = 1
  fetchData()
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await agxApi.getKycList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      idType: searchForm.idType,
      status: searchForm.status
    })
    if (res.code === 0) {
      tableData.value = res.data?.list || []
      pagination.total = res.data?.total || 0
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { 
  pagination.current = 1
  fetchData() 
}

const handleReset = () => { 
  searchForm.keyword = ''
  searchForm.idType = undefined
  searchForm.status = undefined
  pagination.current = 1
  fetchData() 
}

const onPageChange = (page) => { 
  pagination.current = page
  fetchData() 
}

const onPageSizeChange = (size) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchData()
}

const handleView = (record) => {
  currentRecord.value = record
  viewVisible.value = true
}

const handleApprove = (record) => {
  Modal.confirm({
    title: '确认通过',
    content: `确定通过 ${record.realName} 的身份认证吗？`,
    okText: '确认通过',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await agxApi.reviewKyc(record.id, { status: 1 })
        if (res.code === 0) {
          Message.success('认证已通过')
          fetchData()
        }
      } catch (e) {
        Message.error('操作失败')
      }
    }
  })
}

const handleApproveFromDetail = () => {
  handleApprove(currentRecord.value)
  viewVisible.value = false
}

const handleRejectFromDetail = () => {
  openRejectModal(currentRecord.value)
  viewVisible.value = false
}

const openRejectModal = (record) => {
  rejectRecord.value = record
  rejectReason.value = ''
  rejectReasonExtra.value = ''
  rejectVisible.value = true
}

const handleReject = async () => {
  if (!rejectReason.value) {
    Message.warning('请选择拒绝原因')
    return
  }
  if (rejectReason.value === '其他原因' && !rejectReasonExtra.value.trim()) {
    Message.warning('请输入具体拒绝原因')
    return
  }
  const reason = rejectReason.value === '其他原因' ? rejectReasonExtra.value : rejectReason.value
  try {
    const res = await agxApi.reviewKyc(rejectRecord.value.id, { status: 2, remark: reason })
    if (res.code === 0) {
      Message.success('已拒绝认证')
      rejectVisible.value = false
      fetchData()
    }
  } catch (e) {
    Message.error('操作失败')
  }
}

onMounted(() => { 
  fetchData() 
})
</script>

<style lang="less" scoped>
.agx-page {
  .agx-page-header {
    margin-bottom: 20px;
    
    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--agx-text-primary, #1D2129);
      margin: 0 0 4px 0;
    }
    
    .page-desc {
      font-size: 13px;
      color: var(--agx-text-tertiary, #86909C);
      margin: 0;
    }
  }
}

// 统计卡片扩展样式
.agx-stat-card {
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--agx-shadow-md, 0 2px 8px rgba(0, 0, 0, 0.08));
  }
  
  &.pending, &.success, &.danger {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    
    .stat-content {
      .stat-value {
        font-size: 24px;
      }
    }
  }
  
  &.pending .stat-icon {
    background: rgba(250, 173, 20, 0.1);
    color: var(--agx-warning, #FAAD14);
  }
  
  &.success .stat-icon {
    background: rgba(82, 196, 26, 0.1);
    color: var(--agx-success, #52C41A);
  }
  
  &.danger .stat-icon {
    background: rgba(245, 34, 45, 0.1);
    color: var(--agx-danger, #F5222D);
  }
}

.stat-desc {
  font-size: 12px;
  color: var(--agx-text-tertiary, #86909C);
  margin-top: 4px;
}

// 用户单元格
.user-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  .username {
    font-weight: 500;
    color: var(--agx-text-primary, #1D2129);
  }
  
  .user-id {
    font-size: 12px;
    color: var(--agx-text-tertiary, #86909C);
  }
}

// 证件类型标签
.id-type-tag {
  display: inline-block;
  padding: 2px 8px;
  background: var(--agx-bg-tertiary, #F2F3F5);
  color: var(--agx-text-secondary, #4E5969);
  border-radius: 4px;
  font-size: 12px;
}

// 证件号码
.id-number {
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  font-size: 13px;
  color: var(--agx-text-secondary, #4E5969);
}

// KYC详情样式
.kyc-detail {
  .detail-section {
    margin-bottom: 24px;
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--agx-text-primary, #1D2129);
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--agx-border-light, #F2F3F5);
    }
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px;
      background: var(--agx-bg-secondary, #F7F8FA);
      border-radius: 6px;
      
      .label {
        font-size: 12px;
        color: var(--agx-text-tertiary, #86909C);
      }
      
      .value {
        font-size: 14px;
        color: var(--agx-text-primary, #1D2129);
        
        &.mono {
          font-family: 'SF Mono', Monaco, 'Courier New', monospace;
        }
      }
    }
  }
  
  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    
    .image-item {
      .image-label {
        font-size: 13px;
        color: var(--agx-text-secondary, #4E5969);
        margin-bottom: 8px;
        text-align: center;
      }
      
      .kyc-image {
        width: 100%;
        height: 140px;
        border-radius: 8px;
        border: 1px solid var(--agx-border, #E5E6EB);
        overflow: hidden;
      }
    }
  }
  
  .detail-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding-top: 24px;
    border-top: 1px solid var(--agx-border-light, #F2F3F5);
  }
}

// 拒绝用户信息
.reject-user-info {
  padding: 12px 16px;
  background: var(--agx-bg-secondary, #F7F8FA);
  border-radius: 6px;
  margin-bottom: 16px;
  
  .label {
    color: var(--agx-text-tertiary, #86909C);
    font-size: 13px;
  }
  
  .value {
    color: var(--agx-text-primary, #1D2129);
    font-weight: 500;
  }
}

// 弹窗提示
.modal-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-top: 8px;
  
  &.warning {
    background: rgba(250, 173, 20, 0.08);
    color: var(--agx-warning, #FAAD14);
  }
}
</style>
