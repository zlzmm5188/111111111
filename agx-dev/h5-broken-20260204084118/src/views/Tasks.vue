<template>
  <PageLayout title="新手任务" :show-back="true">
    <div class="page-content">
      <!-- 顶部奖励总览 -->
      <section class="reward-card">
        <div class="reward-bg"></div>
        <div class="reward-content">
          <div class="reward-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 2z" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </div>
          <div class="reward-info">
            <h2>完成任务赚取奖励</h2>
            <p>完成以下新手任务，即可获得丰厚奖励</p>
          </div>
        </div>
        
        <!-- 进度条 -->
        <div class="progress-section">
          <div class="progress-label">
            <span>任务进度</span>
            <span class="progress-text">{{ summary.completedCount }}/{{ summary.totalTasks }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: summary.progress + '%' }"></div>
          </div>
        </div>

        <!-- 奖励金额 -->
        <div class="reward-amounts">
          <div class="amount-item">
            <div class="amount-icon agx">
              <img src="/agx-new.png" alt="AGX">
            </div>
            <div class="amount-info">
              <span class="amount-value">{{ formatReward(summary.totalAgx) }}</span>
              <span class="amount-label">AGX奖励</span>
            </div>
          </div>
          <div class="amount-divider"></div>
          <div class="amount-item">
            <div class="amount-icon usdt">
              <img src="https://cryptologos.cc/logos/tether-usdt-logo.png" alt="USDT">
            </div>
            <div class="amount-info">
              <span class="amount-value">{{ formatReward(summary.totalUsdt) }}</span>
              <span class="amount-label">USDT奖励</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 任务列表 -->
      <section class="tasks-section">
        <div class="section-header">
          <div class="header-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <h3>任务列表</h3>
          </div>
          <span class="task-count">共{{ summary.totalTasks }}个任务</span>
        </div>

        <div class="tasks-list">
          <div 
            v-for="(task, index) in displayTasks" 
            :key="task.taskKey" 
            class="task-item"
            :class="{ completed: task.status >= 2, claimable: task.status === 1 }"
          >
            <div class="task-index">{{ index + 1 }}</div>
            <div class="task-main">
              <div class="task-header">
                <h4>{{ task.name }}</h4>
                <div class="task-status" :class="getStatusClass(task.status)">
                  {{ getStatusText(task.status) }}
                </div>
              </div>
              <p class="task-desc">{{ task.description }}</p>
              <div class="task-rewards">
                <span class="reward-tag agx">+{{ formatReward(task.agxReward) }} AGX</span>
                <span class="reward-tag usdt">+{{ formatReward(task.usdtReward) }} USDT</span>
              </div>
              
              <!-- 白皮书子任务 -->
              <div v-if="task.taskKey === 'readWhitepaper'" class="whitepaper-list">
                <div
                  v-for="paper in whitepapers"
                  :key="paper.key"
                  class="paper-item"
                  :class="{ read: paper.read }"
                  @click="openWhitepaper(paper)"
                >
                  <div class="paper-icon">
                    <svg v-if="paper.read" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                    </svg>
                  </div>
                  <span class="paper-name">{{ paper.name }}</span>
                  <span class="paper-status">{{ paper.read ? '已读' : '去阅读' }}</span>
                </div>
              </div>
            </div>
            <button 
              class="task-action"
              :class="{ 
                'go-btn': task.status === 0, 
                'claim-btn': task.status === 1,
                'done-btn': task.status >= 2 
              }"
              :disabled="task.status >= 2 || claiming"
              @click="task.status === 1 ? handleClaim(task.taskKey) : handleGoTask(task)"
            >
              <template v-if="task.status === 0">去完成</template>
              <template v-else-if="task.status === 1">领取</template>
              <template v-else>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </template>
            </button>
          </div>
        </div>

        <!-- 一键领取 -->
        <button
          v-if="claimableTasks.length > 0"
          class="claim-all-btn"
          :disabled="claimingAll"
          @click="handleClaimAll"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
          </svg>
          {{ claimingAll ? '领取中...' : '一键领取全部奖励' }}
        </button>
      </section>

      <!-- 领取记录 -->
      <section class="history-section" v-if="claimedTasks.length > 0">
        <div class="section-header">
          <div class="header-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3>领取记录</h3>
          </div>
          <span class="task-count">共{{ claimedTasks.length }}条</span>
        </div>
        <div class="history-list">
          <div class="history-item" v-for="task in claimedTasks" :key="task.taskKey">
            <div class="history-info">
              <span class="history-name">{{ task.name }}</span>
              <span class="history-time">{{ formatClaimTime(task.claimedAt) }}</span>
            </div>
            <div class="history-rewards">
              <span class="reward-val agx">+{{ formatReward(task.agxReward) }} AGX</span>
              <span class="reward-val usdt">+{{ formatReward(task.usdtReward) }} USDT</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 温馨提示 -->
      <section class="tips-section">
        <div class="tips-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
          <span>温馨提示</span>
        </div>
        <ul class="tips-list">
          <li>完成任务后请及时领取奖励</li>
          <li>奖励将直接发放到您的账户余额</li>
          <li>如有问题请联系客服</li>
        </ul>
      </section>
    </div>

    <!-- 白皮书弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>{{ currentPaper?.name }}</h3>
              <button class="close-btn" @click="closeModal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="modal-body" ref="contentRef" @scroll="handleScroll">
              <div class="content-inner">
                <div class="content-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                    <path d="M9 7h6M9 11h6M9 15h4"/>
                  </svg>
                  <p>{{ currentPaper?.name }}</p>
                  <span>请滑动到底部完成阅读</span>
                </div>
                <div style="height: 1200px;"></div>
                <div class="content-end">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  <span>已阅读完成</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
              向下滑动完成阅读
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTaskList, claimReward, claimAllRewards, completeTask } from '@/api/task'
import { alert } from '@/utils/alert'
import PageLayout from '@/components/layout/PageLayout.vue'

const router = useRouter()

const claiming = ref(false)
const claimingAll = ref(false)
const tasks = ref([])
const showModal = ref(false)
const contentRef = ref(null)
const currentPaper = ref(null)

const whitepapers = ref([
  { key: 'platform', name: '平台白皮书', read: false, url: '/company-whitepaper' },
  { key: 'agx', name: 'AGX机制白皮书', read: false, url: '/whitepaper' }
])

// 从localStorage恢复白皮书阅读状态
const loadWhitepaperStatus = () => {
  try {
    const saved = localStorage.getItem('whitepaper_read_status')
    if (saved) {
      const status = JSON.parse(saved)
      whitepapers.value.forEach(p => {
        if (status[p.key]) p.read = true
      })
    }
  } catch (e) {
    console.error('恢复白皮书状态失败:', e)
  }
}

// 保存白皮书阅读状态到localStorage
const saveWhitepaperStatus = () => {
  const status = {}
  whitepapers.value.forEach(p => {
    status[p.key] = p.read
  })
  localStorage.setItem('whitepaper_read_status', JSON.stringify(status))
}

// 更新本地任务状态
const updateLocalTaskStatus = (taskKey, newStatus) => {
  // 更新tasks数组
  const task = tasks.value.find(t => t.taskKey === taskKey)
  if (task) {
    task.status = newStatus
  }
  // 同时更新defaultTasks以防API返回空
  const defaultTask = defaultTasks.value.find(t => t.taskKey === taskKey)
  if (defaultTask) {
    defaultTask.status = newStatus
  }
}

const defaultTasks = ref([
  { taskKey: 'completeKyc', name: '$t(kyc.verification)', description: '上传身份证信息$t(kyc.verification)，解锁全部功能', agxReward: 3, usdtReward: 5, status: 0, jumpUrl: '/kyc' },
  { taskKey: 'bindAddress', name: '绑定U地址', description: '绑定您的USDT充值地址，便于快速充值', agxReward: 2, usdtReward: 4, status: 0, jumpUrl: '/settings' },
  { taskKey: 'readWhitepaper', name: '阅读白皮书', description: '了解平台和AGX机制', agxReward: 2, usdtReward: 4, status: 0, jumpUrl: '/whitepaper' },
  { taskKey: 'shareInvite', name: '分享推广', description: '分享专属邀请码给好友，双方均可获得奖励', agxReward: 3, usdtReward: 5, status: 0, jumpUrl: '/invite' }
])

const displayTasks = computed(() => tasks.value.length > 0 ? tasks.value : defaultTasks.value)

const summary = computed(() => {
  const list = displayTasks.value
  const totalAgx = list.reduce((sum, t) => sum + (t.agxReward || 0), 0)
  const totalUsdt = list.reduce((sum, t) => sum + (t.usdtReward || 0), 0)
  const completedCount = list.filter(t => t.status >= 2).length
  const totalTasks = list.length
  const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0
  return { totalAgx, totalUsdt, totalTasks, completedCount, progress }
})

const claimableTasks = computed(() => tasks.value.filter(t => t.status === 1))

// 已领取的任务记录
const claimedTasks = computed(() => {
  return displayTasks.value
    .filter(t => t.status === 2 && t.claimedAt)
    .sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt))
})

// 格式化领取时间
const formatClaimTime = (time) => {
  if (!time) return ''
  const d = new Date(time)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${min}`
}

const getStatusClass = (status) => {
  if (status === 0) return 'pending'
  if (status === 1) return 'claimable'
  return 'completed'
}

// 格式化奖励数字，去掉多余的0
const formatReward = (num) => {
  if (!num) return '0'
  const n = Number(num)
  if (Number.isInteger(n)) return n.toString()
  // 最多保留2位小数，去掉尾部0
  return parseFloat(n.toFixed(2)).toString()
}

const getStatusText = (status) => {
  if (status === 0) return '未完成'
  if (status === 1) return '待领取'
  return '已完成'
}

const fetchTasks = async () => {
  try {
    const res = await getTaskList()
    if (res.code === 0 && res.data) {
      tasks.value = res.data.tasks || []
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
  }
}

const handleGoTask = async (task) => {
  if (task.taskKey === 'shareInvite') {
    try {
      await completeTask(task.taskKey)
      await fetchTasks()
    } catch (error) { /* 继续跳转 */ }
  }
  if (task.jumpUrl) router.push(task.jumpUrl)
}

const handleClaim = async (taskKey) => {
  if (claiming.value) return
  claiming.value = true
  try {
    const res = await claimReward(taskKey)
    if (res.code === 0) {
      alert('领取成功')
      await fetchTasks()
    } else {
      alert(res.message || '领取失败')
    }
  } catch (error) {
    alert('领取失败')
  } finally {
    claiming.value = false
  }
}

const handleClaimAll = async () => {
  if (claimingAll.value) return
  claimingAll.value = true
  try {
    const res = await claimAllRewards()
    if (res.code === 0) {
      const reward = res.data?.reward || {}
      alert(`领取成功 +${reward.agx} AGX +${reward.usdt} USDT`)
      await fetchTasks()
    } else {
      alert(res.message || '领取失败')
    }
  } catch (error) {
    alert('领取失败')
  } finally {
    claimingAll.value = false
  }
}

const openWhitepaper = async (paper) => {
  // 标记为已读
  if (!paper.read) {
    paper.read = true
    saveWhitepaperStatus()
    
    // 检查是否全部阅读完成
    const allRead = whitepapers.value.every(p => p.read)
    if (allRead) {
      updateLocalTaskStatus('readWhitepaper', 1)
      try {
        await completeTask('readWhitepaper')
        await fetchTasks()
      } catch (error) {
        console.error('完成任务失败:', error)
      }
    }
  }
  
  // 跳转到对应白皮书页面
  router.push(paper.url)
}

const closeModal = () => {
  showModal.value = false
  currentPaper.value = null
}

const handleScroll = async () => {
  if (!contentRef.value) return
  const el = contentRef.value
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
    const paper = whitepapers.value.find(p => p.key === currentPaper.value?.key)
    if (paper && !paper.read) {
      paper.read = true
      saveWhitepaperStatus() // 保存状态
      
      const allRead = whitepapers.value.every(p => p.read)
      if (allRead) {
        // 立即更新本地任务状态为待领取(1)
        updateLocalTaskStatus('readWhitepaper', 1)
        try {
          await completeTask('readWhitepaper')
          await fetchTasks()
        } catch (error) {
          console.error('完成任务失败:', error)
        }
      }
      setTimeout(() => {
        closeModal()
        alert(`《${currentPaper.value.name}》阅读完成`)
      }, 500)
    }
  }
}

onMounted(() => {
  loadWhitepaperStatus() // 恢复白皮书阅读状态
  // 如果所有白皮书都已读，更新本地任务状态
  if (whitepapers.value.every(p => p.read)) {
    updateLocalTaskStatus('readWhitepaper', 1)
  }
  fetchTasks()
})
</script>

<style scoped>
.page-content {
  padding: 16px;
  padding-bottom: 100px;
  background: #0D1117;
  min-height: calc(100vh - 56px);
}

/* ==================== 奖励总览卡片 ==================== */
.reward-card {
  position: relative;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid rgba(200, 170, 110, 0.2);
  overflow: hidden;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.reward-bg {
  position: absolute;
  top: -50%;
  right: -30%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(200, 170, 110, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.reward-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.reward-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(200, 170, 110, 0.4);
}

.reward-icon svg {
  width: 28px;
  height: 28px;
  color: #0D1117;
}

.reward-info h2 {
  font-size: 18px;
  font-weight: 700;
  color: #E6EDF3;
  margin-bottom: 4px;
}

.reward-info p {
  font-size: 13px;
  color: #8B949E;
}

/* 进度条 */
.progress-section {
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #8B949E;
}

.progress-text {
  color: #C8AA6E;
  font-weight: 600;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #C8AA6E, #E8D5A8);
  border-radius: 4px;
  transition: width 0.5s ease;
  box-shadow: 0 0 12px rgba(200, 170, 110, 0.5);
}

/* 奖励金额 */
.reward-amounts {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
  z-index: 1;
}

.amount-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.amount-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
}

.amount-icon img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.amount-value {
  display: block;
  font-size: 24px;
  font-weight: 800;
  color: #C8AA6E;
}

.amount-label {
  font-size: 12px;
  color: #8B949E;
}

.amount-divider {
  width: 1px;
  height: 48px;
  background: rgba(255, 255, 255, 0.08);
}

/* ==================== 任务列表 ==================== */
.tasks-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left svg {
  width: 20px;
  height: 20px;
  color: #C8AA6E;
}

.header-left h3 {
  font-size: 16px;
  font-weight: 600;
  color: #E6EDF3;
}

.task-count {
  font-size: 12px;
  color: #8B949E;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.task-item.completed {
  opacity: 0.7;
}

.task-item.claimable {
  border-color: rgba(200, 170, 110, 0.3);
  box-shadow: 0 4px 16px rgba(200, 170, 110, 0.15);
}

.task-index {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200, 170, 110, 0.15);
  color: #C8AA6E;
  font-size: 14px;
  font-weight: 700;
  border-radius: 8px;
  flex-shrink: 0;
}

.task-main {
  flex: 1;
  min-width: 0;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.task-header h4 {
  font-size: 15px;
  font-weight: 600;
  color: #E6EDF3;
}

.task-status {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.task-status.pending {
  background: rgba(139, 148, 158, 0.2);
  color: #8B949E;
}

.task-status.claimable {
  background: rgba(200, 170, 110, 0.2);
  color: #C8AA6E;
}

.task-status.completed {
  background: rgba(46, 160, 67, 0.2);
  color: #2EA043;
}

.task-desc {
  font-size: 12px;
  color: #8B949E;
  margin-bottom: 10px;
  line-height: 1.5;
}

.task-rewards {
  display: flex;
  gap: 8px;
}

.reward-tag {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
}

.reward-tag.agx {
  background: rgba(200, 170, 110, 0.15);
  color: #C8AA6E;
}

.reward-tag.usdt {
  background: rgba(38, 166, 154, 0.15);
  color: #26A69A;
}

.task-action {
  min-width: 64px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.task-action.go-btn {
  background: rgba(200, 170, 110, 0.15);
  color: #C8AA6E;
}

.task-action.go-btn:active {
  background: rgba(200, 170, 110, 0.25);
}

.task-action.claim-btn {
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  color: #0D1117;
  box-shadow: 0 4px 12px rgba(200, 170, 110, 0.3);
}

.task-action.claim-btn:active {
  transform: scale(0.95);
}

.task-action.done-btn {
  background: rgba(46, 160, 67, 0.15);
  color: #2EA043;
}

.task-action.done-btn svg {
  width: 18px;
  height: 18px;
}

/* 白皮书子任务 */
.whitepaper-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.paper-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.paper-item:active {
  background: rgba(255, 255, 255, 0.06);
}

.paper-item.read {
  opacity: 0.6;
}

.paper-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.paper-icon svg {
  width: 18px;
  height: 18px;
  color: #8B949E;
}

.paper-item.read .paper-icon svg {
  color: #2EA043;
}

.paper-name {
  flex: 1;
  font-size: 13px;
  color: #E6EDF3;
}

.paper-status {
  font-size: 12px;
  color: #C8AA6E;
}

.paper-item.read .paper-status {
  color: #2EA043;
}

/* 一键领取 */
.claim-all-btn {
  width: 100%;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  border: none;
  border-radius: 26px;
  font-size: 16px;
  font-weight: 700;
  color: #0D1117;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(200, 170, 110, 0.4);
  transition: all 0.2s;
}

.claim-all-btn:active {
  transform: scale(0.98);
}

.claim-all-btn:disabled {
  opacity: 0.6;
}

.claim-all-btn svg {
  width: 22px;
  height: 22px;
}

/* ==================== 领取记录 ==================== */
.history-section {
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.history-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.history-item:first-child {
  padding-top: 0;
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-name {
  font-size: 14px;
  font-weight: 500;
  color: #E6EDF3;
}

.history-time {
  font-size: 12px;
  color: #6B7280;
}

.history-rewards {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.reward-val {
  font-size: 13px;
  font-weight: 600;
}

.reward-val.agx {
  color: #C8AA6E;
}

.reward-val.usdt {
  color: #0ECB81;
}

/* ==================== 温馨提示 ==================== */
.tips-section {
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #8B949E;
  font-size: 14px;
}

.tips-header svg {
  width: 18px;
  height: 18px;
  color: #C8AA6E;
}

.tips-list {
  margin: 0;
  padding-left: 24px;
}

.tips-list li {
  font-size: 12px;
  color: #6E7681;
  line-height: 2;
}

/* ==================== 白皮书弹窗 ==================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 380px;
  max-height: 80vh;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(200, 170, 110, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.modal-header h3 {
  font-size: 17px;
  font-weight: 600;
  color: #E6EDF3;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.close-btn svg {
  width: 18px;
  height: 18px;
  color: #8B949E;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.content-inner {
  padding: 24px 20px;
}

.content-placeholder {
  text-align: center;
  padding: 40px 0;
}

.content-placeholder svg {
  width: 48px;
  height: 48px;
  color: #C8AA6E;
  margin-bottom: 16px;
}

.content-placeholder p {
  font-size: 16px;
  color: #E6EDF3;
  margin-bottom: 8px;
}

.content-placeholder span {
  font-size: 13px;
  color: #8B949E;
}

.content-end {
  text-align: center;
  padding: 30px 0;
  color: #2EA043;
}

.content-end svg {
  width: 40px;
  height: 40px;
  margin-bottom: 10px;
}

.content-end span {
  display: block;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 13px;
  color: #8B949E;
}

.modal-footer svg {
  width: 18px;
  height: 18px;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
}

/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
}
</style>
