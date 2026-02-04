<template>
  <PageLayout title="发布动态" :show-back="false">
    <template #navbar-left>
      <button class="cancel-btn" @click="handleCancel">取消</button>
    </template>
    <template #navbar-right>
      <button class="post-btn" :class="{ active: canPost }" :disabled="!canPost" @click="submitPost">
        {{ isPosting ? '发布中...' : '发布' }}
      </button>
    </template>

    <!-- 内容区 -->
    <div class="scroll-content">
      <!-- 编辑器 -->
      <div class="editor-section">
        <textarea
          v-model="content"
          ref="textareaRef"
          placeholder="分享你的观点、交易心得..."
          class="content-textarea"
          maxlength="500"
          @input="autoResize"
        ></textarea>
        <div class="char-count" :class="{ warn: content.length > 450 }">
          {{ content.length }}/500
        </div>
      </div>

      <!-- 图片上传 -->
      <div class="image-section">
        <div class="image-grid">
          <div 
            v-for="(img, index) in images" 
            :key="`img-${index}-${img.slice(-20)}`" 
            class="image-item"
          >
            <img :src="img" alt="" class="image-preview" loading="lazy">
            <button class="remove-btn" @click="removeImage(index)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          
          <div 
            v-if="images.length < 9" 
            class="upload-btn" 
            @click="selectImage"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/></svg>
            <span>添加图片</span>
          </div>
        </div>
        <p class="image-tip">最多可添加9张图片</p>
        
        <!-- 上传进度 -->
        <div v-if="isUploadingImages" class="upload-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <span class="progress-text">上传中... {{ uploadProgress }}%</span>
        </div>
      </div>

      <!-- 话题选择 -->
      <div class="topic-section">
        <div class="section-title">添加话题</div>
        <div class="topic-input-wrap">
          <span class="hash">#</span>
          <input
            v-model="topic"
            placeholder="输入话题"
            class="topic-input"
            maxlength="20"
          >
        </div>
        <!-- 推荐话题 -->
        <div class="topic-suggestions">
          <span 
            v-for="t in suggestedTopics" 
            :key="t" 
            class="topic-tag"
            :class="{ active: topic === t }"
            @click="topic = t"
          >#{{ t }}</span>
        </div>
      </div>

      <!-- 发布选项 -->
      <div class="options-section">
        <div class="option-item">
          <span class="option-label">谁可以看</span>
          <div class="option-value" @click="showVisibilityPicker = true">
            {{ visibilityText }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
          </div>
        </div>
        <div class="option-item">
          <span class="option-label">关闭评论</span>
          <label class="switch">
            <input type="checkbox" v-model="disableComment">
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </div>

    <!-- 可见性选择弹窗 -->
    <div class="modal-mask" v-if="showVisibilityPicker" @click="showVisibilityPicker = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <span>谁可以看</span>
        </div>
        <div class="modal-body">
          <div 
            v-for="opt in visibilityOptions" 
            :key="opt.value"
            class="visibility-option"
            :class="{ active: visibility === opt.value }"
            @click="visibility = opt.value; showVisibilityPicker = false"
          >
            <span class="opt-icon">{{ opt.icon }}</span>
            <div class="opt-info">
              <span class="opt-label">{{ opt.label }}</span>
              <span class="opt-desc">{{ opt.desc }}</span>
            </div>
            <svg v-if="visibility === opt.value" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { uploadPostImages, getImagePreview } from '../utils/upload'
import { alert } from '../utils/alert'
import { api } from '../utils/api'
import PageLayout from '../components/layout/PageLayout.vue'

const router = useRouter()
const route = useRoute()

const textareaRef = ref(null)
const content = ref('')
const images = ref([])
const imageFiles = ref([])
const topic = ref('')
const visibility = ref('public')
const disableComment = ref(false)
const isPosting = ref(false)
const isUploadingImages = ref(false)
const uploadProgress = ref(0)
const showVisibilityPicker = ref(false)
const canPostByCondition = ref(true)  // 是否满足发帖条件
const conditionReason = ref('')       // 不满足条件的原因
const isCheckingCondition = ref(true) // 正在检查条件

const suggestedTopics = ['AGX认购', '持币生金', '秒合约技巧', '黄金行情', '新手教程']

const visibilityOptions = [
  { value: 'public', label: '公开', desc: '所有人可见', icon: 'globe' },
  { value: 'followers', label: '仅粉丝', desc: '只有关注你的人可见', icon: 'users' },
  { value: 'private', label: '仅自己', desc: '只有自己可见', icon: 'lock' }
]

const visibilityText = computed(() => {
  return visibilityOptions.find(o => o.value === visibility.value)?.label || '公开'
})

const canPost = computed(() => {
  return content.value.trim().length > 0 && !isPosting.value && !isUploadingImages.value && canPostByCondition.value
})

const autoResize = () => {
  const el = textareaRef.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = Math.max(120, el.scrollHeight) + 'px'
  }
}

const selectImage = () => {
  // 创建隐藏的文件输入
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = async (e) => {
    const files = Array.from(e.target.files)
    const remainingSlots = 9 - images.value.length
    
    if (files.length > remainingSlots) {
      await alert(`最多只能添加${9 - images.value.length}张图片`)
      return
    }
    
    // 生成预览
    for (const file of files) {
      try {
        const preview = await getImagePreview(file)
        images.value.push(preview)
        imageFiles.value.push(file)
      } catch (error) {
        console.error('图片预览失败:', error)
      }
    }
  }
  input.click()
}

const removeImage = (index) => {
  images.value.splice(index, 1)
  imageFiles.value.splice(index, 1)
}

const handleCancel = () => {
  if (content.value.trim() || images.value.length) {
    if (confirm('确定放弃编辑吗？')) {
      router.back()
    }
  } else {
    router.back()
  }
}

const submitPost = async () => {
  if (!canPost.value) return
  
  try {
    let imageUrls = []
    
    // 上传图片
    if (imageFiles.value.length > 0) {
      isUploadingImages.value = true
      uploadProgress.value = 0
      
      const uploadResult = await uploadPostImages(imageFiles.value, (progress) => {
        uploadProgress.value = progress
      })
      
      imageUrls = uploadResult.map(item => item.url)
      isUploadingImages.value = false
    }
    
    // 发布帖子
    isPosting.value = true

    // 调用API发布帖子
    const result = await api.square.createPost({
      content: content.value.trim(),
      images: imageUrls,
      topic: topic.value,
      visibility: visibility.value,
      disableComment: disableComment.value
    })

    if (!result.success) {
      throw new Error(result.message || '发布失败')
    }

    // 发布成功
    await alert('发布成功')
    router.back()
  } catch (error) {
    console.error('发布失败:', error)
    await alert(error.message || '发布失败，请重试')
  } finally {
    isPosting.value = false
    isUploadingImages.value = false
    uploadProgress.value = 0
  }
}

onMounted(async () => {
  // 从URL获取预设话题
  const presetTopic = route.query.topic
  if (presetTopic) {
    topic.value = presetTopic
  }

  // 检查发帖条件
  try {
    isCheckingCondition.value = true
    const result = await api.square.checkPostCondition()
    if (result.success && result.data) {
      canPostByCondition.value = result.data.canPost
      conditionReason.value = result.data.reason || ''
      
      // 如果不满足条件，提示用户
      if (!result.data.canPost) {
        await alert(result.data.reason || '您暂时无法发帖')
        router.back()
      }
    }
  } catch (e) {
    console.log('发帖条件检查失败，默认允许发帖')
  } finally {
    isCheckingCondition.value = false
  }
})
</script>

<style scoped>
.create-post-page {
  width: 100%;
  max-width: 428px;
  min-height: 100vh;
  margin: 0 auto;
  background: var(--bg-base, #0D1117);
}

/* 固定头部 */
.fixed-header {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 428px;
  z-index: 100;
  background: var(--bg-elevated, #161B22);
  border-bottom: 1px solid var(--border-primary, #21262D);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
}

.cancel-btn {
  background: transparent;
  border: none;
  font-size: 15px;
  color: var(--text-tertiary, #8B949E);
  padding: 8px 0;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
}

.post-btn {
  padding: 8px 20px;
  background: var(--bg-surface, #21262D);
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-quaternary, #484F58);
}

.post-btn.active {
  background: var(--color-brand, #C8AA6E);
  color: var(--bg-base, #0D1117);
}

.post-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 滚动内容 */
.scroll-content {
  padding-bottom: 40px;
}

/* 编辑器 */
.editor-section {
  padding: 16px;
  background: var(--bg-elevated, #161B22);
  border-bottom: 1px solid var(--border-primary, #21262D);
}

.content-textarea {
  width: 100%;
  min-height: 120px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--text-primary, #E6EDF3);
  font-size: 16px;
  line-height: 1.6;
  resize: none;
  outline: none;
}

.content-textarea::placeholder {
  color: var(--text-quaternary, #484F58);
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: var(--text-tertiary, #8B949E);
  margin-top: 8px;
}

.char-count.warn {
  color: var(--color-error, #F85149);
}

/* 图片上传 */
.image-section {
  padding: 16px;
  background: var(--bg-elevated, #161B22);
  border-bottom: 1px solid var(--border-primary, #21262D);
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-btn {
  aspect-ratio: 1;
  border: 2px dashed var(--border-primary, #21262D);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--text-tertiary, #8B949E);
  font-size: 12px;
  transition: all 0.2s;
}

.upload-btn:active {
  border-color: var(--color-brand, #C8AA6E);
  color: var(--color-brand, #C8AA6E);
}

.image-tip {
  font-size: 12px;
  color: var(--text-tertiary, #8B949E);
  margin: 10px 0 0 0;
}

/* 上传进度 */
.upload-progress {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar {
  height: 6px;
  background: var(--bg-base, #0D1117);
  border: 1px solid var(--border-primary, #21262D);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, var(--color-brand, #C8AA6E), var(--color-brand-dark, #A08050));
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: var(--text-tertiary, #8B949E);
  text-align: center;
}

/* 话题选择 */
.topic-section {
  padding: 16px;
  background: var(--bg-elevated, #161B22);
  border-bottom: 1px solid var(--border-primary, #21262D);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
  margin-bottom: 12px;
}

.topic-input-wrap {
  display: flex;
  align-items: center;
  background: var(--bg-base, #0D1117);
  border: 1px solid var(--border-primary, #21262D);
  border-radius: 10px;
  padding: 0 14px;
  margin-bottom: 12px;
}

.hash {
  font-size: 16px;
  color: var(--color-brand, #C8AA6E);
  margin-right: 4px;
}

.topic-input {
  flex: 1;
  height: 44px;
  background: transparent;
  border: none;
  color: var(--text-primary, #E6EDF3);
  font-size: 15px;
  outline: none;
}

.topic-input::placeholder {
  color: var(--text-quaternary, #484F58);
}

.topic-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.topic-tag {
  padding: 6px 14px;
  background: var(--bg-base, #0D1117);
  border: 1px solid var(--border-primary, #21262D);
  border-radius: 16px;
  font-size: 13px;
  color: var(--text-tertiary, #8B949E);
  transition: all 0.2s;
}

.topic-tag.active {
  background: rgba(200,170,110,0.15);
  border-color: var(--color-brand, #C8AA6E);
  color: var(--color-brand, #C8AA6E);
}

/* 发布选项 */
.options-section {
  padding: 8px 16px;
  background: var(--bg-elevated, #161B22);
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-primary, #21262D);
}

.option-item:last-child {
  border-bottom: none;
}

.option-label {
  font-size: 15px;
  color: var(--text-primary, #E6EDF3);
}

.option-value {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--text-tertiary, #8B949E);
}

/* 开关 */
.switch {
  position: relative;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-surface, #21262D);
  border-radius: 24px;
  transition: 0.3s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background: var(--text-tertiary, #8B949E);
  border-radius: 50%;
  transition: 0.3s;
}

input:checked + .slider {
  background: var(--color-brand, #C8AA6E);
}

input:checked + .slider:before {
  transform: translateX(20px);
  background: var(--bg-base, #0D1117);
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 428px;
  background: var(--bg-elevated, #161B22);
  border-radius: 16px 16px 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.modal-header {
  padding: 16px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #E6EDF3);
  border-bottom: 1px solid var(--border-primary, #21262D);
}

.modal-body {
  padding: 8px 0;
}

.visibility-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}

.visibility-option.active {
  background: rgba(200,170,110,0.1);
}

.opt-icon {
  font-size: 24px;
}

.opt-info {
  flex: 1;
}

.opt-label {
  display: block;
  font-size: 15px;
  color: var(--text-primary, #E6EDF3);
  margin-bottom: 2px;
}

.opt-desc {
  font-size: 12px;
  color: var(--text-tertiary, #8B949E);
}

.visibility-option svg {
  color: var(--color-brand, #C8AA6E);
}
</style>