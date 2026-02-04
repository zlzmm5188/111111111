<template>
  <div class="p-3">
    <!-- 新手任务奖励 -->
    <a-card class="mb-3" size="small">
      <template #title>
        <div class="flex items-center gap-2">
          <icon-gift class="text-blue-500" />
          <span>新手任务奖励</span>
          <a-tag color="blue" size="small">{{ totalAgxReward }} AGX + {{ totalUsdtReward }} USDT</a-tag>
        </div>
      </template>
      <template #extra>
        <a-button type="primary" size="small" @click="saveTaskRewards" :loading="savingTasks">保存</a-button>
      </template>
      <a-table :data="taskList" :pagination="false" :loading="loadingTasks" size="small">
        <template #columns>
          <a-table-column title="任务" :width="120" data-index="name" />
          <a-table-column title="描述" data-index="description" />
          <a-table-column title="AGX" :width="100">
            <template #cell="{ record }">
              <a-input-number v-model="record.agxReward" :min="0" size="mini" style="width:70px" />
            </template>
          </a-table-column>
          <a-table-column title="USDT" :width="100">
            <template #cell="{ record }">
              <a-input-number v-model="record.usdtReward" :min="0" size="mini" style="width:70px" />
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-switch v-model="record.enabled" :checked-value="1" :unchecked-value="0" size="small" />
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 返佣阶梯配置 -->
    <a-card class="mb-3" size="small">
      <template #title>
        <div class="flex items-center gap-2">
          <icon-user-group class="text-green-500" />
          <span>返佣阶梯</span>
          <a-tag color="gray" size="small">按产品独立计算</a-tag>
        </div>
      </template>
      <template #extra>
        <a-space size="small">
          <a-button size="small" @click="addCommissionTier"><icon-plus /></a-button>
          <a-button type="primary" size="small" @click="saveCommissionTiers" :loading="savingTiers">保存</a-button>
        </a-space>
      </template>
      <a-table :data="commissionTiers" :pagination="false" :loading="loadingTiers" size="small">
        <template #columns>
          <a-table-column title="档" :width="50" data-index="tierLevel" align="center" />
          <a-table-column title="人数" :width="100">
            <template #cell="{ record }">
              <a-input-number v-model="record.minInvites" :min="0" size="mini" style="width:60px">
                <template #prefix>≥</template>
              </a-input-number>
            </template>
          </a-table-column>
          <a-table-column title="比例" :width="90">
            <template #cell="{ record }">
              <a-input-number v-model="record.commissionRatePercent" :min="0" :max="100" size="mini" style="width:60px">
                <template #suffix>%</template>
              </a-input-number>
            </template>
          </a-table-column>
          <a-table-column title="说明">
            <template #cell="{ record }">
              <a-input v-model="record.description" size="mini" />
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="60">
            <template #cell="{ record }">
              <a-switch v-model="record.isEnabled" :checked-value="1" :unchecked-value="0" size="small" />
            </template>
          </a-table-column>
          <a-table-column title="" :width="40">
            <template #cell="{ rowIndex }">
              <a-popconfirm content="删除?" @ok="removeCommissionTier(rowIndex)">
                <a-button type="text" status="danger" size="mini"><icon-delete /></a-button>
              </a-popconfirm>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 双向奖励配置 -->
    <a-card class="mb-3" size="small">
      <template #title>
        <div class="flex items-center gap-2">
          <icon-swap class="text-orange-500" />
          <span>双向奖励</span>
          <a-tag color="orange" size="small">KYC后发放 | 邀请人{{ totalInviterBonus }}+被邀请人{{ totalInviteeBonus }}={{ totalInviterBonus + totalInviteeBonus }} AGX</a-tag>
        </div>
      </template>
      <template #extra>
        <a-button type="primary" size="small" @click="saveInviteBonus" :loading="savingBonus">保存</a-button>
      </template>
      <a-table :data="inviteBonusTiers" :pagination="false" :loading="loadingBonus" size="small">
        <template #columns>
          <a-table-column title="次序" :width="70" align="center">
            <template #cell="{ record }">
              <a-tag :color="record.inviteOrder <= 3 ? 'green' : record.inviteOrder <= 6 ? 'blue' : 'orange'" size="small">
                第{{ record.inviteOrder }}人
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="邀请人获得(AGX)" :width="130">
            <template #cell="{ record }">
              <a-input-number v-model="record.inviterBonus" :min="0" size="mini" style="width:80px" />
            </template>
          </a-table-column>
          <a-table-column title="被邀请人获得(AGX)" :width="140">
            <template #cell="{ record }">
              <a-input-number v-model="record.inviteeBonus" :min="0" size="mini" style="width:80px" />
            </template>
          </a-table-column>
          <a-table-column title="合计">
            <template #cell="{ record }">
              <span class="text-amber-600 font-medium">{{ (parseFloat(record.inviterBonus||0) + parseFloat(record.inviteeBonus||0)).toFixed(0) }} AGX</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="60">
            <template #cell="{ record }">
              <a-switch v-model="record.isEnabled" :checked-value="1" :unchecked-value="0" size="small" />
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 会员等级配置 -->
    <a-card size="small">
      <template #title>
        <div class="flex items-center gap-2">
          <icon-star class="text-yellow-500" />
          <span>会员等级</span>
          <a-tag color="gray" size="small">按累计充值金额</a-tag>
        </div>
      </template>
      <template #extra>
        <a-button type="primary" size="small" @click="saveMemberLevels" :loading="savingLevels">保存</a-button>
      </template>
      <a-table :data="memberLevels" :pagination="false" :loading="loadingLevels" size="small">
        <template #columns>
          <a-table-column title="等级" :width="130">
            <template #cell="{ record }">
              <div class="flex items-center gap-1">
                <span class="text-lg">{{ record.icon }}</span>
                <span :style="{ color: record.color }" class="font-medium">{{ record.name }}</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="充值(U)" :width="110">
            <template #cell="{ record }">
              <a-input-number v-model="record.minRecharge" :min="0" size="mini" style="width:80px">
                <template #prefix>≥</template>
              </a-input-number>
            </template>
          </a-table-column>
          <a-table-column title="手续费折扣" :width="100">
            <template #cell="{ record }">
              <a-input-number v-model="record.feeDiscount" :min="0" :max="100" size="mini" style="width:60px">
                <template #suffix>%</template>
              </a-input-number>
            </template>
          </a-table-column>
          <a-table-column title="收益加成" :width="100">
            <template #cell="{ record }">
              <a-input-number v-model="record.incomeBonus" :min="0" :max="50" size="mini" style="width:60px">
                <template #suffix>%</template>
              </a-input-number>
            </template>
          </a-table-column>
          <a-table-column title="图标" :width="60">
            <template #cell="{ record }">
              <a-input v-model="record.icon" size="mini" style="width:40px" />
            </template>
          </a-table-column>
          <a-table-column title="颜色" :width="90">
            <template #cell="{ record }">
              <a-input v-model="record.color" size="mini" style="width:70px">
                <template #prefix>
                  <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: record.color }"></div>
                </template>
              </a-input>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import request from '@/utils/request'

// 新手任务
const loadingTasks = ref(false)
const savingTasks = ref(false)
const taskList = ref([])

// 返佣阶梯
const loadingTiers = ref(false)
const savingTiers = ref(false)
const commissionTiers = ref([])

// 双向奖励
const loadingBonus = ref(false)
const savingBonus = ref(false)
const inviteBonusTiers = ref([])

// 会员等级
const loadingLevels = ref(false)
const savingLevels = ref(false)
const memberLevels = ref([])

// 计算新手任务奖励总额
const totalAgxReward = computed(() => taskList.value.filter(t => t.enabled === 1).reduce((sum, t) => sum + parseFloat(t.agxReward || 0), 0))
const totalUsdtReward = computed(() => taskList.value.filter(t => t.enabled === 1).reduce((sum, t) => sum + parseFloat(t.usdtReward || 0), 0))

// 计算双向奖励总额
const totalInviteeBonus = computed(() => inviteBonusTiers.value.filter(t => t.isEnabled === 1).reduce((sum, t) => sum + parseFloat(t.inviteeBonus || 0), 0))
const totalInviterBonus = computed(() => inviteBonusTiers.value.filter(t => t.isEnabled === 1).reduce((sum, t) => sum + parseFloat(t.inviterBonus || 0), 0))

// 获取新手任务配置
const fetchTaskRewards = async () => {
  loadingTasks.value = true
  try {
    const res = await request({ url: '/api/admin/task/rewards', method: 'get' })
    if (res.code === 0 && res.data?.length > 0) {
      taskList.value = res.data
    } else {
      taskList.value = getDefaultTasks()
    }
  } catch (e) {
    taskList.value = getDefaultTasks()
  } finally {
    loadingTasks.value = false
  }
}

// 保存新手任务配置
const saveTaskRewards = async () => {
  savingTasks.value = true
  try {
    const res = await request({ url: '/api/admin/task/rewards', method: 'put', data: { tasks: taskList.value } })
    if (res.code === 0) Message.success('新手任务保存成功')
    else Message.error(res.message || '保存失败')
  } catch (e) {
    Message.error('保存失败')
  } finally {
    savingTasks.value = false
  }
}

// 添加返佣档位
const addCommissionTier = () => {
  const maxLevel = commissionTiers.value.length > 0 ? Math.max(...commissionTiers.value.map(t => t.tierLevel)) : 0
  commissionTiers.value.push({ tierLevel: maxLevel + 1, minInvites: 0, commissionRatePercent: 0, isEnabled: 0, description: '新档位' })
}

// 删除返佣档位
const removeCommissionTier = (index) => {
  commissionTiers.value.splice(index, 1)
  commissionTiers.value.forEach((t, i) => { t.tierLevel = i + 1 })
}

// 获取返佣阶梯配置
const fetchCommissionTiers = async () => {
  loadingTiers.value = true
  try {
    const res = await request({ url: '/api/invite/commission-tiers', method: 'get' })
    if (res.code === 0 && res.data) {
      commissionTiers.value = res.data.map(t => ({ ...t, commissionRatePercent: parseFloat(t.commissionRate) * 100 }))
    } else {
      commissionTiers.value = getDefaultCommissionTiers()
    }
  } catch (e) {
    commissionTiers.value = getDefaultCommissionTiers()
  } finally {
    loadingTiers.value = false
  }
}

// 获取双向奖励配置
const fetchInviteBonusTiers = async () => {
  loadingBonus.value = true
  try {
    const res = await request({ url: '/api/invite/bonus-tiers', method: 'get' })
    if (res.code === 0 && res.data) {
      inviteBonusTiers.value = res.data.map(t => ({ ...t, inviteeBonus: parseFloat(t.inviteeBonus), inviterBonus: parseFloat(t.inviterBonus) }))
    } else {
      inviteBonusTiers.value = getDefaultInviteBonusTiers()
    }
  } catch (e) {
    inviteBonusTiers.value = getDefaultInviteBonusTiers()
  } finally {
    loadingBonus.value = false
  }
}

// 获取会员等级配置
const fetchMemberLevels = async () => {
  loadingLevels.value = true
  try {
    const res = await request({ url: '/api/invite/member-levels', method: 'get' })
    if (res.code === 0 && res.data?.length > 0) {
      memberLevels.value = res.data.map(l => ({ ...l, minRecharge: parseFloat(l.minRecharge) || 0, feeDiscount: parseFloat(l.feeDiscount) || 0, incomeBonus: parseFloat(l.incomeBonus) || 0 }))
    } else {
      memberLevels.value = getDefaultMemberLevels()
    }
  } catch (e) {
    memberLevels.value = getDefaultMemberLevels()
  } finally {
    loadingLevels.value = false
  }
}

// 保存返佣阶梯
const saveCommissionTiers = async () => {
  savingTiers.value = true
  try {
    const data = commissionTiers.value.map(t => ({ tierLevel: t.tierLevel, minInvites: t.minInvites, commissionRate: (t.commissionRatePercent / 100).toFixed(4), isEnabled: t.isEnabled, description: t.description }))
    const res = await request({ url: '/api/invite/commission-tiers', method: 'put', data: { tiers: data } })
    if (res.code === 0) Message.success('返佣阶梯保存成功')
    else Message.error(res.message || '保存失败')
  } catch (e) {
    Message.error('保存失败')
  } finally {
    savingTiers.value = false
  }
}

// 保存双向奖励
const saveInviteBonus = async () => {
  savingBonus.value = true
  try {
    const data = inviteBonusTiers.value.map(t => ({ inviteOrder: t.inviteOrder, inviteeBonus: String(t.inviteeBonus), inviterBonus: String(t.inviterBonus), isEnabled: t.isEnabled }))
    const res = await request({ url: '/api/invite/bonus-tiers', method: 'put', data: { tiers: data } })
    if (res.code === 0) Message.success('双向奖励保存成功')
    else Message.error(res.message || '保存失败')
  } catch (e) {
    Message.error('保存失败')
  } finally {
    savingBonus.value = false
  }
}

// 保存会员等级
const saveMemberLevels = async () => {
  savingLevels.value = true
  try {
    const data = memberLevels.value.map(l => ({ level: l.level, name: l.name, nameEn: l.nameEn, icon: l.icon, color: l.color, minRecharge: String(l.minRecharge), feeDiscount: String(l.feeDiscount), incomeBonus: String(l.incomeBonus) }))
    const res = await request({ url: '/api/invite/member-levels', method: 'put', data: { levels: data } })
    if (res.code === 0) Message.success('会员等级保存成功')
    else Message.error(res.message || '保存失败')
  } catch (e) {
    Message.error('保存失败')
  } finally {
    savingLevels.value = false
  }
}

// 默认新手任务数据
const getDefaultTasks = () => [
  { step: 1, taskKey: 'kyc', name: 'KYC认证', description: '完成实名认证', agxReward: 3, usdtReward: 5, enabled: 1 },
  { step: 2, taskKey: 'bindAddress', name: '绑定U地址', description: '绑定USDT提现地址', agxReward: 2, usdtReward: 4, enabled: 1 },
  { step: 3, taskKey: 'readWhitepaper', name: '了解平台', description: '阅读平台白皮书', agxReward: 2, usdtReward: 4, enabled: 1 },
  { step: 4, taskKey: 'shareInvite', name: '分享推广', description: '分享邀请链接', agxReward: 3, usdtReward: 5, enabled: 1 }
]

// 默认返佣阶梯数据
const getDefaultCommissionTiers = () => [
  { tierLevel: 1, minInvites: 1, commissionRatePercent: 3, isEnabled: 1, description: '1-3人 3%' },
  { tierLevel: 2, minInvites: 4, commissionRatePercent: 8, isEnabled: 1, description: '4-9人 8%' },
  { tierLevel: 3, minInvites: 10, commissionRatePercent: 12, isEnabled: 1, description: '10-15人 12%' },
  { tierLevel: 4, minInvites: 16, commissionRatePercent: 18, isEnabled: 1, description: '16-25人 18%' },
  { tierLevel: 5, minInvites: 26, commissionRatePercent: 30, isEnabled: 1, description: '26人+ 30%' }
]

// 默认双向奖励数据
const getDefaultInviteBonusTiers = () => [
  { inviteOrder: 1, inviteeBonus: 10, inviterBonus: 5, isEnabled: 1 },
  { inviteOrder: 2, inviteeBonus: 10, inviterBonus: 8, isEnabled: 1 },
  { inviteOrder: 3, inviteeBonus: 10, inviterBonus: 12, isEnabled: 1 },
  { inviteOrder: 4, inviteeBonus: 10, inviterBonus: 18, isEnabled: 1 },
  { inviteOrder: 5, inviteeBonus: 10, inviterBonus: 25, isEnabled: 1 },
  { inviteOrder: 6, inviteeBonus: 10, inviterBonus: 32, isEnabled: 1 },
  { inviteOrder: 7, inviteeBonus: 10, inviterBonus: 42, isEnabled: 1 },
  { inviteOrder: 8, inviteeBonus: 10, inviterBonus: 55, isEnabled: 1 },
  { inviteOrder: 9, inviteeBonus: 10, inviterBonus: 70, isEnabled: 1 },
  { inviteOrder: 10, inviteeBonus: 10, inviterBonus: 90, isEnabled: 1 }
]

// 默认会员等级数据
const getDefaultMemberLevels = () => [
  { level: 1, name: '普通会员', nameEn: 'Basic', icon: '🥉', color: '#848E9C', minRecharge: 0, feeDiscount: 0, incomeBonus: 0 },
  { level: 2, name: '银牌会员', nameEn: 'Silver', icon: '🥈', color: '#C0C0C0', minRecharge: 1000, feeDiscount: 5, incomeBonus: 2 },
  { level: 3, name: '金牌会员', nameEn: 'Gold', icon: '🥇', color: '#D4B872', minRecharge: 10000, feeDiscount: 10, incomeBonus: 5 },
  { level: 4, name: '钻石会员', nameEn: 'Diamond', icon: '💎', color: '#00D1FF', minRecharge: 50000, feeDiscount: 15, incomeBonus: 8 },
  { level: 5, name: '黑金会员', nameEn: 'Platinum', icon: '👑', color: '#1E1E1E', minRecharge: 200000, feeDiscount: 20, incomeBonus: 12 }
]

onMounted(() => {
  fetchTaskRewards()
  fetchCommissionTiers()
  fetchInviteBonusTiers()
  fetchMemberLevels()
})
</script>

<style scoped>
.p-3 { padding: 12px; }
.mb-3 { margin-bottom: 12px; }
</style>
