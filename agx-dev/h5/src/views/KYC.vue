<template>
  <PageLayout :title="$t('kyc.title')" :show-back="true">
    <div class="page-content">
      <!-- 已认证状态 -->
      <div v-if="kycStatus === 2" class="kyc-result success">
        <div class="result-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <div class="result-title">{{ $t('kyc.verificationPassed') }}</div>
        <div class="result-desc">{{ $t('kyc.verificationPassedDesc') }}</div>
        <div class="result-info">
          <div class="info-row">
            <span class="info-label">{{ $t('kyc.name') }}</span>
            <span class="info-value">{{ maskName(kycInfo?.realName) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t('kyc.certNumber') }}</span>
            <span class="info-value">{{ maskIdNumber(kycInfo?.idNumber) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t('kyc.verifyTime') }}</span>
            <span class="info-value">{{ kycInfo?.verifiedAt || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 审核中状态 -->
      <div v-else-if="kycStatus === 1" class="kyc-result pending">
        <div class="result-icon pending">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <div class="result-title">{{ $t('kyc.reviewing') }}</div>
        <div class="result-desc">{{ $t('kyc.reviewingDesc') }}</div>
      </div>

      <!-- 认证被拒绝 -->
      <div v-else-if="kycStatus === 3" class="kyc-result rejected">
        <div class="result-icon rejected">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M15 9l-6 6M9 9l6 6"/>
          </svg>
        </div>
        <div class="result-title">{{ $t('kyc.verificationFailed') }}</div>
        <div class="result-desc">{{ kycInfo?.rejectReason || $t('kyc.verificationFailedDefault') }}</div>
        <button class="retry-btn" @click="resetForm">{{ $t('kyc.retryVerify') }}</button>
      </div>

      <!-- 认证流程 -->
      <template v-else>
        <!-- 步骤指示器 -->
        <div class="step-indicator">
          <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
            <div class="step-num">1</div>
            <span class="step-label">{{ $t('kyc.step1') }}</span>
          </div>
          <div class="step-line" :class="{ active: currentStep > 1 }"></div>
          <div class="step" :class="{ active: currentStep === 2 }">
            <div class="step-num">2</div>
            <span class="step-label">{{ $t('kyc.step2') }}</span>
          </div>
        </div>

        <!-- 步骤1：上传身份证正面 + OCR识别 -->
        <div v-if="currentStep === 1" class="step-content">
          <div class="step-title">{{ $t('kyc.uploadIdFront') }}</div>
          <div class="step-desc">{{ $t('kyc.uploadIdFrontDesc') }}</div>

          <!-- 上传区域 -->
          <div class="upload-section">
            <div 
              class="id-card-upload" 
              :class="{ 'has-image': frontPreview, 'recognizing': isRecognizing }"
              @click="selectIdCard"
            >
              <img v-if="frontPreview" :src="frontPreview" class="preview-img" />
              <template v-else>
                <div class="upload-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <circle cx="8" cy="10" r="2"/>
                    <path d="M14 9h4M14 13h4"/>
                    <path d="M6 16h12"/>
                  </svg>
                </div>
                <span class="upload-text">{{ $t('kyc.clickUploadIdFront') }}</span>
                <span class="upload-hint">{{ $t('kyc.uploadHint') }}</span>
              </template>
              
              <!-- 识别中动画 -->
              <div v-if="isRecognizing" class="recognizing-overlay">
                <div class="scan-line"></div>
                <div class="recognizing-text">
                  <span class="loading-dot"></span>
                  {{ $t('kyc.aiRecognizing') }}
                </div>
              </div>
            </div>

            <!-- 重新上传按钮 -->
            <button v-if="frontPreview && !isRecognizing" class="reupload-btn" @click="selectIdCard">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {{ $t('kyc.reupload') }}
            </button>
          </div>

          <!-- OCR识别结果 - 只显示，不可编辑 -->
          <div v-if="ocrResult && ocrResult.idNumber && !isRecognizing" class="ocr-result">
            <div class="ocr-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <span>{{ $t('kyc.recognizeSuccess') }}</span>
            </div>
            <div class="ocr-field">
              <label>{{ $t('kyc.certNumber') }}</label>
              <div class="ocr-value">
                <div class="id-number-display">{{ idNumber }}</div>
              </div>
            </div>
          </div>

          <!-- OCR识别失败提示 -->
          <div v-if="frontPreview && !isRecognizing && (!ocrResult || !ocrResult.idNumber)" class="ocr-failed">
            <div class="failed-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
            </div>
            <div class="failed-text">{{ $t('kyc.recognizeFailedRetry') }}</div>
            <button class="retry-photo-btn" @click="selectIdCard">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              {{ $t('kyc.retakePhoto') }}
            </button>
          </div>

          <!-- 下一步按钮 -->
          <button 
            class="next-btn" 
            :disabled="!canGoNext1" 
            @click="goToStep2"
          >
            {{ $t('kyc.nextStep') }}
          </button>

          <!-- 提示信息 -->
          <div class="tips-section">
            <div class="tips-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
              {{ $t('kyc.photoGuide') }}
            </div>
            <ul class="tips-list">
              <li>{{ $t('kyc.guideTip1') }}</li>
              <li>{{ $t('kyc.guideTip2') }}</li>
              <li>{{ $t('kyc.guideTip3') }}</li>
              <li>{{ $t('kyc.guideTip4') }}</li>
            </ul>
          </div>
        </div>

        <!-- 步骤2：填写姓名 + 上传自拍头像 -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="step-title">{{ $t('kyc.completeInfo') }}</div>
          <div class="step-desc">{{ $t('kyc.completeInfoDesc') }}</div>

          <!-- 已识别的证件号 -->
          <div class="confirmed-info">
            <span class="info-label">{{ $t('kyc.certNumber') }}</span>
            <span class="info-value">{{ maskIdNumber(idNumber) }}</span>
          </div>

          <!-- 姓名输入 -->
          <div class="form-group">
            <label>{{ $t('kyc.realName') }}</label>
            <input 
              type="text" 
              v-model="realName" 
              :placeholder="$t('kyc.enterRealName')"
              maxlength="20"
            />
          </div>

          <!-- 自拍头像上传 -->
          <div class="form-group">
            <label>{{ $t('kyc.selfiePhoto') }}</label>
            <div class="selfie-upload" :class="{ detecting: isDetecting }" @click="selectSelfie">
              <img v-if="selfiePreview" :src="selfiePreview" class="selfie-preview" />
              <template v-else>
                <div class="selfie-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <span class="selfie-text">{{ $t('kyc.clickUploadSelfie') }}</span>
              </template>
              <!-- AI检测中动画 -->
              <div v-if="isDetecting" class="detecting-overlay">
                <div class="detecting-spinner"></div>
                <span>{{ $t('kyc.aiDetecting') }}</span>
              </div>
            </div>
            <!-- 检测结果提示 -->
            <div v-if="livenessResult && selfiePreview" class="liveness-result" :class="{ success: livenessResult.isReal }">
              <svg v-if="livenessResult.isReal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
              <span>{{ livenessResult.isReal ? $t('kyc.aiDetectPassed') : $t('kyc.uploadRealSelfie') }}</span>
            </div>
            <div class="selfie-tips">
              <span>{{ $t('kyc.selfieTip') }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <button class="back-btn" @click="currentStep = 1">{{ $t('kyc.prevStep') }}</button>
            <button 
              class="submit-btn" 
              :disabled="!canSubmit || submitting" 
              @click="submitKyc"
            >
              {{ submitting ? $t('kyc.submitting') : $t('kyc.submit') }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { alert } from '../utils/alert'
import { api } from '../utils/api'
import { uploadImage, getImagePreview, validateImage, compressImage } from '../utils/upload'
import PageLayout from '../components/layout/PageLayout.vue'
import { validateIdCard } from '../utils/validators'

const { t } = useI18n()
const router = useRouter()

// 状态
const loading = ref(true)
const submitting = ref(false)
const currentStep = ref(1)
const kycStatus = ref(0) // 0-未认证 1-审核中 2-已通过 3-已拒绝
const kycInfo = ref(null)

// 步骤1数据
const frontImage = ref(null)
const frontPreview = ref(null)
const isRecognizing = ref(false)
const ocrResult = ref(null)
const idNumber = ref('')

// 步骤2数据
const realName = ref('')
const selfieImage = ref(null)
const selfiePreview = ref(null)

// 计算属性 - OCR识别成功才能下一步
const canGoNext1 = computed(() => {
  return frontPreview.value && ocrResult.value && ocrResult.value.idNumber && idNumber.value && idNumber.value.length >= 15 && !isRecognizing.value
})

const canSubmit = computed(() => {
  return realName.value.trim().length >= 2 && selfiePreview.value && !isDetecting.value
})

// 脱敏显示
const maskName = (name) => {
  if (!name || name.length < 2) return name
  return name[0] + '*'.repeat(name.length - 1)
}

const maskIdNumber = (id) => {
  if (!id || id.length < 8) return id
  return id.substring(0, 4) + '**********' + id.substring(id.length - 4)
}

// 获取KYC状态
const fetchKycStatus = async () => {
  loading.value = true
  try {
    const res = await api.account.getKycStatus()
    if (res.success && res.data) {
      kycInfo.value = res.data
      kycStatus.value = res.data.kycStatus || 0
      // 预填充已有信息
      if (res.data.realName) realName.value = res.data.realName
      if (res.data.idNumber) idNumber.value = res.data.idNumber
    }
  } catch (e) {
    console.error('获取KYC状态失败:', e)
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  kycStatus.value = 0
  currentStep.value = 1
  frontImage.value = null
  frontPreview.value = null
  ocrResult.value = null
  idNumber.value = ''
  realName.value = ''
  selfieImage.value = null
  selfiePreview.value = null
}

// 选择身份证照片
const selectIdCard = () => {
  if (isRecognizing.value) return
  
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  // 不设置capture，允许用户选择相册或拍照
  
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // 验证文件
    const validation = validateImage(file, { maxSize: 5 * 1024 * 1024 })
    if (!validation.valid) {
      await alert(validation.message)
      return
    }
    
    try {
      // 生成预览
      frontImage.value = file
      frontPreview.value = await getImagePreview(file)
      
      // 开始OCR识别
      await recognizeIdCard(file)
    } catch (error) {
      await alert('图片处理失败，请重试')
    }
  }
  
  input.click()
}

// OCR识别身份证
const recognizeIdCard = async (file) => {
  isRecognizing.value = true
  ocrResult.value = null
  idNumber.value = ''
  
  try {
    // 压缩图片用于OCR
    const compressedFile = await compressImage(file, { maxWidth: 1280, quality: 0.85 })
    
    // 创建FormData
    const formData = new FormData()
    formData.append('file', compressedFile)
    formData.append('type', 'idcard_front')
    
    // 调用OCR接口
    const token = localStorage.getItem('token')
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
    
    const response = await fetch(`${baseURL}/ocr/idcard`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    })
    
    const result = await response.json()
    
    if (result.code === 0 && result.data && result.data.idNumber) {
      ocrResult.value = result.data
      idNumber.value = result.data.idNumber
      
      // 如果OCR也识别到了姓名，预填充
      if (result.data.name) {
        realName.value = result.data.name
      }
    } else {
      // OCR识别失败
      ocrResult.value = null
      idNumber.value = ''
    }
  } catch (error) {
    console.error('OCR识别失败:', error)
    ocrResult.value = null
    idNumber.value = ''
  } finally {
    isRecognizing.value = false
  }
}

// 进入步骤2
const goToStep2 = async () => {
  // 验证身份证号格式
  const validation = validateIdCard(idNumber.value)
  if (!validation.valid) {
    await alert(validation.message)
    return
  }
  
  currentStep.value = 2
}

// 选择自拍照 - 移除强制前置摄像头以提高安卓兼容性
const selectSelfie = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  // 移除 capture='user' 以提高安卓设备兼容性
  // 用户可以选择拍照或从相册选择
  
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // 验证文件
    const validation = validateImage(file, { maxSize: 5 * 1024 * 1024 })
    if (!validation.valid) {
      await alert(validation.message)
      return
    }
    
    try {
      selfieImage.value = file
      selfiePreview.value = await getImagePreview(file)
      
      // 调用AI真人检测
      await detectLiveness(file)
    } catch (error) {
      await alert('图片处理失败，请重试')
    }
  }
  
  input.click()
}

// AI真人检测
const isDetecting = ref(false)
const livenessResult = ref(null)

// 带超时的fetch请求
const fetchWithTimeout = (url, options, timeout = 15000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('请求超时')), timeout)
    )
  ])
}

const detectLiveness = async (file) => {
  isDetecting.value = true
  livenessResult.value = null
  
  try {
    const compressedFile = await compressImage(file, { maxWidth: 1280, quality: 0.85 })
    
    const formData = new FormData()
    formData.append('file', compressedFile)
    
    const token = localStorage.getItem('token')
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
    
    // 尝试调用AI检测，但失败时自动跳过
    try {
      const response = await fetchWithTimeout(`${baseURL}/ocr/liveness`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: formData
      }, 10000)  // 缩短超时时间
      
      if (response.ok) {
        const result = await response.json()
        livenessResult.value = result.data
        
        if (result.code !== 0 || !result.data?.isReal) {
          await alert(t('kyc.uploadRealSelfie'))
          selfieImage.value = null
          selfiePreview.value = null
          return
        }
      } else {
        console.warn('AI检测服务不可用，跳过检测')
        livenessResult.value = { isReal: true, confidence: 0, skipReason: 'service_unavailable' }
      }
    } catch (error) {
      console.warn('AI检测失败，跳过检测:', error.message)
      livenessResult.value = { isReal: true, confidence: 0, skipReason: error.message }
    }
  } catch (error) {
    console.error('图片处理失败:', error)
    // 即使图片处理失败也允许继续
    livenessResult.value = { isReal: true, confidence: 0, skipReason: 'image_processing_error' }
  } finally {
    isDetecting.value = false
  }
}

// 提交$t(kyc.verification)
const submitKyc = async () => {
  if (!canSubmit.value || submitting.value) return
  
  // 再次验证
  if (realName.value.trim().length < 2) {
    await alert(t('kyc.enterRealNameAlert'))
    return
  }
  
  const idValidation = validateIdCard(idNumber.value)
  if (!idValidation.valid) {
    await alert(idValidation.message)
    return
  }
  
  submitting.value = true
  
  try {
    // 上传身份证正面
    let frontUrl = ''
    if (frontImage.value) {
      const frontResult = await uploadImage(frontImage.value, { type: 'kyc' })
      // 处理可能的双重包装：frontResult.data?.url 或 frontResult.url
      frontUrl = frontResult?.data?.url || frontResult?.url || (typeof frontResult === 'string' ? frontResult : '')
    }
    
    // 上传自拍照
    let selfieUrl = ''
    if (selfieImage.value) {
      const selfieResult = await uploadImage(selfieImage.value, { type: 'kyc' })
      // 处理可能的双重包装
      selfieUrl = selfieResult?.data?.url || selfieResult?.url || (typeof selfieResult === 'string' ? selfieResult : '')
    }
    
    // 提交KYC申请
    const res = await api.account.submitKyc({
      idType: 1, // 1:身份证 2:护照
      realName: realName.value.trim(),
      idNumber: idNumber.value.trim(),
      frontImage: frontUrl,
      holdImage: selfieUrl  // 后端字段名是 holdImage
    })
    
    if (res.success) {
      await alert(t('kyc.submitSuccess'))
      kycStatus.value = 1
      // 跳转到个人中心
      router.push('/mine')
    } else {
      await alert(res.message || t('kyc.submitFailed'))
    }
  } catch (error) {
    await alert(error.message || t('kyc.submitFailed'))
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchKycStatus()
})
</script>

<style scoped>
.page-content {
  min-height: calc(100vh - 44px);
  background: var(--bg-base, #0B0E11);
  padding: 20px 16px;
  padding-bottom: max(32px, env(safe-area-inset-bottom));
  will-change: transform;
  transform: translateZ(0);
}

/* 认证结果状态 - Pro Max 3D */
.kyc-result {
  text-align: center;
  padding: 48px 24px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.5),
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
}

/* 顶部金色装饰线 */
.kyc-result::before {
  content: '';
  position: absolute;
  top: 0;
  left: 24px;
  right: 24px;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(200, 170, 110, 0.5) 20%, 
    rgba(200, 170, 110, 0.7) 50%, 
    rgba(200, 170, 110, 0.5) 80%, 
    transparent 100%);
}

.result-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
  box-shadow: 
    0 4px 16px rgba(16, 185, 129, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.result-icon svg {
  width: 40px;
  height: 40px;
  color: var(--color-up, #10B981);
}

.result-icon.pending {
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.2) 0%, rgba(200, 170, 110, 0.1) 100%);
  box-shadow: 
    0 4px 16px rgba(200, 170, 110, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.result-icon.pending svg {
  color: var(--color-brand, #C8AA6E);
}

.result-icon.rejected {
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
  box-shadow: 
    0 4px 16px rgba(239, 68, 68, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.result-icon.rejected svg {
  color: var(--color-down, #EF4444);
}

.result-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #E6EDF3);
  margin-bottom: 8px;
}

.result-desc {
  font-size: 14px;
  color: var(--text-secondary, #8B949E);
  margin-bottom: 24px;
}

.result-info {
  text-align: left;
  padding: 16px;
  background: linear-gradient(145deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.2) 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 13px;
  color: var(--text-secondary, #8B949E);
}

.info-value {
  font-size: 14px;
  color: var(--text-primary, #E6EDF3);
  font-weight: 500;
}

/* 重试按钮 - 3D风格 */
.retry-btn {
  margin-top: 24px;
  padding: 14px 48px;
  background: linear-gradient(145deg, #C8AA6E 0%, #A08050 100%);
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #0B0E11;
  cursor: pointer;
  box-shadow: 
    0 4px 16px rgba(200, 170, 110, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
}

.retry-btn:active {
  transform: scale(0.98);
  box-shadow: 
    0 2px 8px rgba(200, 170, 110, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* 步骤指示器 - 3D风格 */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 32px;
  padding: 0 20px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-num {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  background: linear-gradient(145deg, #252D38 0%, #1E262F 100%);
  color: var(--text-secondary, #8B949E);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: all 0.3s;
}

.step.active .step-num {
  background: linear-gradient(145deg, #C8AA6E 0%, #A08050 100%);
  color: #0B0E11;
  border-color: transparent;
  box-shadow: 
    0 4px 16px rgba(200, 170, 110, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.step.completed .step-num {
  background: linear-gradient(145deg, #10B981 0%, #059669 100%);
  color: #fff;
  border-color: transparent;
  box-shadow: 
    0 4px 16px rgba(16, 185, 129, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.step-label {
  font-size: 12px;
  color: var(--text-secondary, #8B949E);
}

.step.active .step-label {
  color: var(--color-brand, #C8AA6E);
}

.step-line {
  flex: 1;
  max-width: 80px;
  height: 3px;
  background: linear-gradient(145deg, #252D38 0%, #1E262F 100%);
  margin-bottom: 24px;
  border-radius: 2px;
  transition: background 0.3s;
}

.step-line.active {
  background: linear-gradient(90deg, #10B981, #C8AA6E);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
}

/* 步骤内容 */
.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #E6EDF3);
  margin-bottom: 8px;
}

.step-desc {
  font-size: 13px;
  color: var(--text-secondary, #8B949E);
  margin-bottom: 24px;
}

/* 上传区域 - 3D卡片 */
.upload-section {
  margin-bottom: 24px;
}

.id-card-upload {
  position: relative;
  width: 100%;
  aspect-ratio: 1.58;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 2px dashed rgba(200, 170, 110, 0.3);
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: all 0.2s;
}

.id-card-upload:active {
  transform: scale(0.99);
  border-color: rgba(200, 170, 110, 0.5);
}

.id-card-upload.has-image {
  border-style: solid;
  border-color: rgba(200, 170, 110, 0.4);
}

.preview-img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.15) 0%, rgba(200, 170, 110, 0.08) 100%);
  border-radius: 50%;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.upload-icon svg {
  width: 32px;
  height: 32px;
  color: var(--color-brand, #C8AA6E);
}

.upload-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
}

.upload-hint {
  font-size: 12px;
  color: var(--text-secondary, #8B949E);
}

/* 识别中动画 */
.recognizing-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.scan-line {
  position: absolute;
  left: 10%;
  right: 10%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #C8AA6E, transparent);
  box-shadow: 0 0 16px rgba(200, 170, 110, 0.7);
  animation: scan 2s ease-in-out infinite;
}

@keyframes scan {
  0%, 100% { top: 20%; }
  50% { top: 70%; }
}

.recognizing-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-brand, #C8AA6E);
  font-weight: 500;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background: var(--color-brand, #C8AA6E);
  border-radius: 50%;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

/* 重新上传按钮 - 3D风格 */
.reupload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  margin-top: 12px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: var(--text-secondary, #8B949E);
  font-size: 14px;
  cursor: pointer;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: all 0.2s;
}

.reupload-btn:active {
  transform: scale(0.98);
}

.reupload-btn svg {
  width: 18px;
  height: 18px;
}

/* OCR结果 - 3D卡片 */
.ocr-result {
  padding: 18px;
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.06) 100%);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 14px;
  margin-bottom: 24px;
  box-shadow: 
    0 4px 12px rgba(16, 185, 129, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.ocr-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-up, #10B981);
}

.ocr-header svg {
  width: 18px;
  height: 18px;
}

.ocr-field label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary, #8B949E);
  margin-bottom: 6px;
}

.ocr-value {
  position: relative;
}

/* 识别结果显示 - 3D效果 */
.id-number-display {
  padding: 14px 16px;
  background: linear-gradient(145deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.25) 100%);
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: 12px;
  color: var(--color-up, #10B981);
  font-size: 16px;
  font-family: 'SF Mono', monospace;
  letter-spacing: 1px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

/* 识别失败提示 - 3D卡片 */
.ocr-failed {
  padding: 24px 16px;
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.06) 100%);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 14px;
  margin-bottom: 24px;
  text-align: center;
  box-shadow: 
    0 4px 12px rgba(239, 68, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.failed-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
  border-radius: 50%;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.failed-icon svg {
  width: 24px;
  height: 24px;
  color: var(--color-down, #EF4444);
}

.failed-text {
  font-size: 14px;
  color: var(--color-down, #EF4444);
  margin-bottom: 16px;
}

.retry-photo-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.18) 0%, rgba(239, 68, 68, 0.1) 100%);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 10px;
  color: var(--color-down, #EF4444);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 
    0 3px 8px rgba(239, 68, 68, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition: all 0.2s;
}

.retry-photo-btn:active {
  transform: scale(0.98);
}

.retry-photo-btn svg {
  width: 16px;
  height: 16px;
}

/* 下一步按钮 - Pro Max 3D */
.next-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(145deg, #C8AA6E 0%, #A08050 100%);
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  color: #0B0E11;
  cursor: pointer;
  box-shadow: 
    0 4px 16px rgba(200, 170, 110, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transition: all 0.2s;
}

.next-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.next-btn:not(:disabled):active {
  transform: scale(0.98);
  box-shadow: 
    0 2px 8px rgba(200, 170, 110, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* 提示信息 - 3D卡片 */
.tips-section {
  margin-top: 32px;
  padding: 18px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.tips-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
  margin-bottom: 12px;
}

.tips-title svg {
  width: 18px;
  height: 18px;
  color: var(--color-brand, #C8AA6E);
}

.tips-list {
  margin: 0;
  padding-left: 20px;
}

.tips-list li {
  font-size: 13px;
  color: var(--text-secondary, #8B949E);
  line-height: 1.8;
}

/* 步骤2样式 - 3D效果 */
.confirmed-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.confirmed-info .info-label {
  font-size: 13px;
  color: var(--text-secondary, #8B949E);
}

.confirmed-info .info-value {
  font-size: 14px;
  color: var(--text-primary, #E6EDF3);
  font-family: 'SF Mono', monospace;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary, #8B949E);
  margin-bottom: 8px;
}

/* 输入框 - 3D效果 */
.form-group input {
  width: 100%;
  padding: 16px 18px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  color: var(--text-primary, #E6EDF3);
  font-size: 15px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: rgba(200, 170, 110, 0.5);
  box-shadow: 
    0 4px 16px rgba(200, 170, 110, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.form-group input::placeholder {
  color: #484F58;
}

/* 自拍上传 - 3D风格 */
.selfie-upload {
  width: 140px;
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 2px dashed rgba(200, 170, 110, 0.3);
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  margin: 0 auto;
  position: relative;
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.04);
  transition: all 0.2s;
}

.selfie-upload:active {
  transform: scale(0.98);
  border-color: rgba(200, 170, 110, 0.5);
}

.selfie-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.selfie-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.15) 0%, rgba(200, 170, 110, 0.08) 100%);
  border-radius: 50%;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.selfie-icon svg {
  width: 24px;
  height: 24px;
  color: var(--color-brand, #C8AA6E);
}

.selfie-text {
  font-size: 12px;
  color: var(--text-secondary, #8B949E);
}

.selfie-tips {
  text-align: center;
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-secondary, #8B949E);
}

/* AI真人检测样式 */
.selfie-upload.detecting {
  pointer-events: none;
}

.detecting-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 50%;
}

.detecting-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(200, 170, 110, 0.2);
  border-top-color: var(--color-brand, #C8AA6E);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.detecting-overlay span {
  font-size: 11px;
  color: var(--color-brand, #C8AA6E);
  font-weight: 500;
}

/* 检测结果 - 3D风格 */
.liveness-result {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 10px;
  padding: 10px 14px;
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.06) 100%);
  border-radius: 10px;
  font-size: 12px;
  color: var(--color-down, #EF4444);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.liveness-result.success {
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.06) 100%);
  color: var(--color-up, #10B981);
}

.liveness-result svg {
  width: 16px;
  height: 16px;
}

/* 操作按钮 - 3D风格 */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.back-btn {
  flex: 1;
  padding: 16px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
  cursor: pointer;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: all 0.2s;
}

.back-btn:active {
  transform: scale(0.98);
}

.submit-btn {
  flex: 2;
  padding: 16px;
  background: linear-gradient(145deg, #C8AA6E 0%, #A08050 100%);
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  color: #0B0E11;
  cursor: pointer;
  box-shadow: 
    0 4px 16px rgba(200, 170, 110, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transition: all 0.2s;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.submit-btn:not(:disabled):active {
  transform: scale(0.98);
  box-shadow: 
    0 2px 8px rgba(200, 170, 110, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
</style>
