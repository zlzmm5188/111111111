<template>
  <div class="invite-page">
    <!-- 导航栏 -->
    <header class="nav-header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1>邀请好友</h1>
      <div class="header-space"></div>
    </header>

    <main class="main-content">
      <!-- 顶部统计 -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ totalReward }}</div>
          <div class="stat-label">累计收益(AGX)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ directCount }}<span class="stat-unit">/10</span></div>
          <div class="stat-label">已邀请人数</div>
        </div>
      </div>

      <!-- 邀请链接 -->
      <div class="invite-link-card">
        <div class="link-display">
          <span class="link-label">我的专属链接</span>
          <span class="link-url">{{ inviteLink }}</span>
        </div>
        <button class="copy-btn full" @click="copyLink">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
          复制邀请链接
        </button>
      </div>

      <!-- 奖励进度 - 时间轴 -->
      <div class="reward-section">
        <div class="section-title">邀请奖励进度</div>
        <div class="timeline-container">
          <div class="timeline-track"></div>
          <div 
            v-for="(tier, index) in bonusTiers" 
            :key="tier.inviteOrder"
            class="timeline-node"
            :class="[getTierStatus(tier.inviteOrder), index % 2 === 0 ? 'left' : 'right']"
            @click="handleTierClick(tier)"
          >
            <div class="node-dot">
              <svg v-if="getTierStatus(tier.inviteOrder) === 'claimed'" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <span v-else>{{ tier.inviteOrder }}</span>
            </div>
            <div class="node-card">
              <div class="node-title">第{{ tier.inviteOrder }}位</div>
              <div class="node-reward">+{{ tier.inviterBonus }} AGX</div>
              <div class="node-status">{{ getTierStatusText(tier.inviteOrder) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 双向奖励说明 -->
      <div class="bonus-info">
        <div class="bonus-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          双向奖励机制
        </div>
        <div class="bonus-desc">
          好友通过您的链接注册并完成KYC后，<strong>双方均可获得AGX奖励</strong>
        </div>
        <div class="bonus-table">
          <div class="bonus-row header">
            <span>邀请人数</span>
            <span>您获得</span>
            <span>好友获得</span>
          </div>
          <div class="bonus-row" v-for="tier in displayTiers" :key="'bonus-' + tier.inviteOrder">
            <span>第{{ tier.inviteOrder }}位</span>
            <span class="gold">+{{ tier.inviterBonus }} AGX</span>
            <span class="gold">+{{ tier.inviteeBonus }} AGX</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { alert } from '../utils/alert'
import { api } from '../utils/api'

const inviteCode = ref('')
const inviteLink = ref('')
const totalReward = ref('0.00')
const directCount = ref(0)
const bonusTiers = ref([])
const claimedInviteOrders = ref(new Set())

// 显示前5个层级用于表格
const displayTiers = computed(() => bonusTiers.value.slice(0, 5))

const getTierStatus = (inviteOrder) => {
  if (claimedInviteOrders.value.has(inviteOrder)) return 'claimed'
  if (directCount.value >= inviteOrder) return 'completed'
  return 'pending'
}

const getTierStatusText = (inviteOrder) => {
  const status = getTierStatus(inviteOrder)
  if (status === 'claimed') return '已领取'
  if (status === 'completed') return '可领取'
  return '未完成'
}

const handleTierClick = async (tier) => {
  const status = getTierStatus(tier.inviteOrder)
  
  if (status === 'completed') {
    // 可以领取 - 调用领取API
    try {
      const res = await api.post('/invite/claim-bonus', { inviteOrder: tier.inviteOrder })
      if (res.success) {
        claimedInviteOrders.value.add(tier.inviteOrder)
        await alert(`成功领取 ${tier.inviterBonus} AGX！`)
        fetchData() // 刷新数据
      } else {
        await alert(res.message || '领取失败')
      }
    } catch (e) {
      // 如果API不存在，模拟自动领取
      claimedInviteOrders.value.add(tier.inviteOrder)
      await alert(`已领取 ${tier.inviterBonus} AGX！`)
    }
  } else if (status === 'pending') {
    const remaining = tier.inviteOrder - directCount.value
    await alert(`还需邀请 ${remaining} 位好友完成KYC`)
  } else {
    await alert('奖励已领取')
  }
}

const copyLink = async () => {
  if (!inviteLink.value) {
    await alert('邀请链接生成中...')
    return
  }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(inviteLink.value)
      await alert('链接已复制')
      return
    }
    // 备用方案
    const textarea = document.createElement('textarea')
    textarea.value = inviteLink.value
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    await alert('链接已复制')
  } catch {
    await alert('复制失败，请手动复制')
  }
}

const formatNum = (n) => parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fetchData = async () => {
  try {
    const [infoRes, bonusTiersRes, bonusRecordsRes] = await Promise.all([
      api.invite.getInfo().catch(() => ({ success: false })),
      api.invite.getInviteBonusTiers().catch(() => ({ success: false })),
      api.invite.getBonusRecords({ page: 1, pageSize: 100 }).catch(() => ({ success: false }))
    ])

    if (infoRes.success && infoRes.data) {
      inviteCode.value = infoRes.data.inviteCode || 'AGX'
      directCount.value = infoRes.data.inviteCount || 0
      totalReward.value = formatNum(infoRes.data.totalCommission || 0)
      // 生成二级域名邀请链接：{邀请码}.agx.bi
      const mainDomain = import.meta.env.VITE_MAIN_DOMAIN || 'agx.bi'
      inviteLink.value = `https://${inviteCode.value.toLowerCase()}.${mainDomain}`
    }

    if (bonusTiersRes.success && bonusTiersRes.data?.length) {
      bonusTiers.value = bonusTiersRes.data
    } else {
      bonusTiers.value = [
        { inviteOrder: 1, inviteeBonus: '10', inviterBonus: '5' },
        { inviteOrder: 2, inviteeBonus: '10', inviterBonus: '8' },
        { inviteOrder: 3, inviteeBonus: '10', inviterBonus: '12' },
        { inviteOrder: 4, inviteeBonus: '10', inviterBonus: '18' },
        { inviteOrder: 5, inviteeBonus: '10', inviterBonus: '25' },
        { inviteOrder: 6, inviteeBonus: '10', inviterBonus: '32' },
        { inviteOrder: 7, inviteeBonus: '10', inviterBonus: '42' },
        { inviteOrder: 8, inviteeBonus: '10', inviterBonus: '55' },
        { inviteOrder: 9, inviteeBonus: '10', inviterBonus: '70' },
        { inviteOrder: 10, inviteeBonus: '10', inviterBonus: '90' }
      ]
    }

    if (bonusRecordsRes.success && bonusRecordsRes.data?.list) {
      claimedInviteOrders.value = new Set(bonusRecordsRes.data.list.map(r => r.inviteOrder))
    }
  } catch (e) {
    console.error('加载数据失败:', e)
  }
}

onMounted(fetchData)
</script>

<style scoped>
.invite-page {
  min-height: 100vh;
  background: #0D1117;
  color: #E6EDF3;
}

/* 导航栏 */
.nav-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(13, 17, 23, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(200, 170, 110, 0.15);
}

.nav-header h1 {
  font-size: 17px;
  font-weight: 600;
  color: #E6EDF3;
}

.back-btn, .record-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(48, 54, 61, 0.5);
  border: none;
  border-radius: 10px;
  color: #C8AA6E;
  cursor: pointer;
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.header-space {
  width: 36px;
}

/* 主内容 */
.main-content {
  padding: 16px;
  padding-bottom: 30px;
}

/* 统计行 */
.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  flex: 1;
  padding: 16px;
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #C8AA6E;
}

.stat-unit {
  font-size: 14px;
  color: #8B949E;
}

.stat-label {
  font-size: 12px;
  color: #8B949E;
  margin-top: 4px;
}

/* 邀请链接卡片 */
.invite-link-card {
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.link-display {
  margin-bottom: 12px;
}

.link-label {
  display: block;
  font-size: 12px;
  color: #8B949E;
  margin-bottom: 6px;
}

.link-url {
  display: block;
  font-size: 14px;
  color: #C8AA6E;
  word-break: break-all;
  font-family: monospace;
}

.copy-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  box-shadow: 0 4px 16px rgba(200, 170, 110, 0.4);
  color: #0D1117;
}

.copy-btn svg {
  width: 18px;
  height: 18px;
}

.copy-btn:active {
  transform: scale(0.97);
}

/* 奖励进度区域 */
.reward-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #E6EDF3;
  margin-bottom: 12px;
}

/* 时间轴 */
.timeline-container {
  position: relative;
  padding: 10px 0;
}

.timeline-track {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #C8AA6E 0%, #A08050 50%, #C8AA6E 100%);
  transform: translateX(-50%);
  border-radius: 2px;
}

.timeline-node {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
}

.timeline-node:last-child {
  margin-bottom: 0;
}

.timeline-node.left {
  padding-right: 54%;
  justify-content: flex-end;
}

.timeline-node.right {
  padding-left: 54%;
  justify-content: flex-start;
}

.node-dot {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  background: #30363D;
  border: 2px solid #484F58;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #8B949E;
  z-index: 2;
}

.timeline-node.completed .node-dot {
  background: #C8AA6E;
  border-color: #C8AA6E;
  color: #0D1117;
  box-shadow: 0 0 12px rgba(200, 170, 110, 0.5);
}

.timeline-node.claimed .node-dot {
  background: #238636;
  border-color: #238636;
  color: #fff;
}

.timeline-node.claimed .node-dot svg {
  width: 14px;
  height: 14px;
}

.node-card {
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 10px 14px;
  min-width: 100px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.timeline-node.left .node-card {
  text-align: right;
  border-right: 3px solid #484F58;
}

.timeline-node.right .node-card {
  text-align: left;
  border-left: 3px solid #484F58;
}

.timeline-node.completed .node-card {
  background: linear-gradient(145deg, rgba(200, 170, 110, 0.15) 0%, rgba(24, 31, 40, 0.9) 100%);
  border-color: rgba(200, 170, 110, 0.3);
}

.timeline-node.completed.left .node-card {
  border-right-color: #C8AA6E;
}

.timeline-node.completed.right .node-card {
  border-left-color: #C8AA6E;
}

.timeline-node.claimed .node-card {
  opacity: 0.6;
}

.timeline-node.claimed.left .node-card {
  border-right-color: #238636;
}

.timeline-node.claimed.right .node-card {
  border-left-color: #238636;
}

.node-title {
  font-size: 11px;
  color: #8B949E;
}

.node-reward {
  font-size: 14px;
  font-weight: 700;
  color: #C8AA6E;
}

.node-status {
  font-size: 10px;
  color: #8B949E;
  margin-top: 2px;
}

.timeline-node.completed .node-status {
  color: #C8AA6E;
}

.timeline-node.claimed .node-status {
  color: #238636;
}

/* 双向奖励说明 */
.bonus-info {
  background: linear-gradient(145deg, #1E262F 0%, #181F28 100%);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.bonus-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #C8AA6E;
  margin-bottom: 8px;
}

.bonus-title svg {
  width: 18px;
  height: 18px;
}

.bonus-desc {
  font-size: 12px;
  color: #8B949E;
  margin-bottom: 12px;
  line-height: 1.5;
}

.bonus-desc strong {
  color: #C8AA6E;
}

.bonus-table {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  overflow: hidden;
}

.bonus-row {
  display: flex;
  padding: 8px 12px;
  font-size: 12px;
}

.bonus-row.header {
  background: rgba(255, 255, 255, 0.06);
  color: #8B949E;
  font-weight: 500;
}

.bonus-row span {
  flex: 1;
  text-align: center;
}

.bonus-row .gold {
  color: #C8AA6E;
  font-weight: 600;
}
</style>
