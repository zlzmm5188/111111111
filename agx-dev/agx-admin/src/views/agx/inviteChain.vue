<template>
  <div class="p-4">
    <a-card title="邀请关系链" :bordered="false">
      <template #extra>
        <a-space>
          <a-input-search v-model="searchKeyword" placeholder="搜索用户名/UID" @search="handleSearch" style="width: 200px" />
          <a-button type="primary" @click="fetchData">刷新</a-button>
          <a-button @click="expandAll">全部展开</a-button>
          <a-button @click="collapseAll">全部收起</a-button>
          <a-button type="primary" status="success" @click="handleExport" :loading="exportLoading">导出下级数据</a-button>
        </a-space>
      </template>

      <a-row :gutter="16" class="mb-4">
        <a-col :span="4"><a-statistic title="总用户数" :value="stats.totalUsers" /></a-col>
        <a-col :span="4"><a-statistic title="总充值" :value="stats.totalRecharge" :precision="2" prefix="$" /></a-col>
        <a-col :span="4"><a-statistic title="总提款" :value="stats.totalWithdraw" :precision="2" prefix="$" /></a-col>
        <a-col :span="4"><a-statistic title="内部线业绩" :value="stats.internalPerformance" :precision="2" prefix="$" /></a-col>
        <a-col :span="4"><a-statistic title="一级邀请" :value="stats.level1Total" /></a-col>
        <a-col :span="4"><a-statistic title="二级邀请" :value="stats.level2Total" /></a-col>
      </a-row>

      <div class="tree-wrapper">
        <div class="org-tree" v-if="treeData">
          <tree-node :node="treeData" :level="0" :index="0" :expanded-keys="expandedKeys" :top-recharge-uid="topRechargeUid" @toggle="toggleNode" />
        </div>
      </div>

      <a-divider>用户列表</a-divider>
      <a-table :data="tableData" :loading="loading" :pagination="pagination" @page-change="handlePageChange" size="small" :scroll="{x: 1600}">
        <template #columns>
          <a-table-column title="用户" :width="140">
            <template #cell="{ record }">
              <div class="flex items-center gap-1">
                <span v-if="record.uid === topRechargeUid" class="trophy">🏆</span>
                <div>
                  <div class="font-medium">{{ record.username }}</div>
                  <div class="text-xs uid-text">{{ record.uid }}</div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="昵称" :width="120">
            <template #cell="{ record }">{{ record.nickname || '-' }}</template>
          </a-table-column>
          <a-table-column title="VIP等级" :width="120">
            <template #cell="{ record }">{{ getLevelName(record.level) }}</template>
          </a-table-column>
          <a-table-column title="USDT余额" :width="100">
            <template #cell="{ record }"><span class="balance-text">{{ record.usdtBalance || '0' }}</span></template>
          </a-table-column>
          <a-table-column title="AGX余额" :width="100">
            <template #cell="{ record }"><span class="balance-text">{{ record.agxBalance || '0' }}</span></template>
          </a-table-column>
          <a-table-column title="累计充值" :width="100">
            <template #cell="{ record }"><span class="recharge-text">${{ record.totalRecharge || 0 }}</span></template>
          </a-table-column>
          <a-table-column title="累计提现" :width="100">
            <template #cell="{ record }"><span class="withdraw-text">${{ record.totalWithdraw || 0 }}</span></template>
          </a-table-column>
          <a-table-column title="当前矿机持仓" :width="120">
            <template #cell="{ record }"><span class="holding-text">${{ record.currentHolding || 0 }}</span></template>
          </a-table-column>
          <a-table-column title="累计矿机建仓" :width="120">
            <template #cell="{ record }"><span class="holding-text">${{ record.totalHolding || 0 }}</span></template>
          </a-table-column>
          <a-table-column title="推荐人" :width="140">
            <template #cell="{ record }">
              <template v-if="record.inviter">
                <div>{{ record.inviter.nickname || record.inviter.username }}</div>
                <div class="text-xs uid-text">{{ record.inviter.username }}</div>
              </template>
              <span v-else class="uid-text">-</span>
            </template>
          </a-table-column>
          <a-table-column title="直推" data-index="directCount" :width="60" />
          <a-table-column title="团队" data-index="teamCount" :width="60" />
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineComponent, h, computed } from 'vue'
import api from '@/api/agx/index.js'
import { Message } from '@arco-design/web-vue'

const expandedKeys = ref(new Set(['ROOT']))

const toggleNode = (uid) => {
  if (expandedKeys.value.has(uid)) {
    expandedKeys.value.delete(uid)
  } else {
    expandedKeys.value.add(uid)
  }
  expandedKeys.value = new Set(expandedKeys.value)
}

const expandAll = () => {
  const keys = new Set()
  const collect = (node) => {
    if (node.uid) keys.add(node.uid)
    if (node.children) node.children.forEach(collect)
  }
  if (treeData.value) collect(treeData.value)
  expandedKeys.value = keys
}

const collapseAll = () => {
  expandedKeys.value = new Set(['ROOT'])
}

const TreeNode = defineComponent({
  name: 'TreeNode',
  props: ['node', 'level', 'index', 'expandedKeys', 'topRechargeUid'],
  emits: ['toggle'],
  setup(props, { emit }) {
    return () => {
      if (!props.node) return null
      const hasChildren = props.node.children && props.node.children.length > 0
      const isExpanded = props.expandedKeys.has(props.node.uid)
      const lvClass = ['root', 'lv1', 'lv2', 'lv3', 'lv4'][props.level] || 'lv4'
      const isInternal = props.level === 1 && props.index === 1
      const isTopRecharge = props.node.uid === props.topRechargeUid
      
      return h('div', { class: ['tree-item', { internal: isInternal }] }, [
        h('div', { 
          class: ['node-box', lvClass, { expandable: hasChildren, expanded: isExpanded, internal: isInternal }],
          onClick: () => hasChildren && emit('toggle', props.node.uid)
        }, [
          isTopRecharge ? h('span', { class: 'trophy-badge' }, '🏆') : null,
          isInternal ? h('span', { class: 'internal-badge' }, '内部') : null,
          h('div', { class: 'node-main' }, [
            hasChildren ? h('span', { class: 'expand-icon' }, isExpanded ? '▼' : '▶') : h('span', { class: 'expand-icon dot' }, '●'),
            h('span', { class: 'node-name' }, props.node.username || props.node.nickname),
            h('span', { class: 'node-uid' }, props.node.uid),
          ]),
          h('div', { class: 'node-finance' }, [
            h('span', { class: 'recharge' }, ['充:', h('b', `$${props.node.recharge || 0}`)]),
            h('span', { class: 'withdraw' }, ['提:', h('b', `$${props.node.withdraw || 0}`)]),
          ]),
          h('div', { class: 'node-stats' }, [
            h('span', null, `直推:${props.node.directCount || 0}`),
            h('span', null, `团队:${props.node.teamCount || 0}`)
          ]),
          hasChildren ? h('span', { class: 'children-count' }, `${props.node.children.length}人`) : null
        ]),
        isExpanded && hasChildren ? h('div', { class: ['tree-children', { 'internal-line': isInternal }] }, 
          props.node.children.map((child, idx) => 
            h(TreeNode, { 
              node: child, 
              level: props.level + 1,
              index: idx,
              expandedKeys: props.expandedKeys,
              topRechargeUid: props.topRechargeUid,
              key: child.uid || idx,
              onToggle: (uid) => emit('toggle', uid)
            })
          )
        ) : null
      ])
    }
  }
})

const loading = ref(false)
const exportLoading = ref(false)
const tableData = ref([])
const searchKeyword = ref('')
const treeData = ref(null)
const stats = reactive({ totalUsers: 0, totalRecharge: 0, totalWithdraw: 0, internalPerformance: 0, level1Total: 0, level2Total: 0 })
const pagination = reactive({ current: 1, pageSize: 15, total: 0 })

const topRechargeUid = computed(() => {
  let max = 0, uid = ''
  const find = (node) => {
    if (node.recharge > max) { max = node.recharge; uid = node.uid }
    if (node.children) node.children.forEach(find)
  }
  if (treeData.value) find(treeData.value)
  return uid
})

const getLevelName = (level) => {
  const levelMap = {
    1: 'V1-普通会员',
    2: 'V2-银牌会员',
    3: 'V3-金牌会员',
    4: 'V4-钻石会员',
    5: 'V5-黑金会员',
  }
  return levelMap[level] || 'V1-普通会员'
}

const fetchData = async () => {
  loading.value = true
  try {
    // 获取树形数据
    const treeRes = await api.getInviteTreeData({ maxDepth: 5 })
    if (treeRes.code === 0 && treeRes.data) {
      treeData.value = treeRes.data
    }
    
    // 获取统计数据
    const statsRes = await api.getInviteTreeStats()
    if (statsRes.code === 0 && statsRes.data) {
      Object.assign(stats, statsRes.data)
    }
    
    // 获取用户列表
    const userRes = await api.getInviteUserListDetail({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value || undefined
    })
    if (userRes.code === 0 && userRes.data) {
      tableData.value = userRes.data.list || []
      pagination.total = userRes.data.total || 0
    }
  } catch (error) {
    console.error('获取邀请关系数据失败:', error)
    Message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  if (!searchKeyword.value) {
    Message.warning('请输入搜索关键词')
    return
  }
  
  loading.value = true
  try {
    const res = await api.searchInviteUser(searchKeyword.value)
    if (res.code === 0 && res.data) {
      // 更新表格数据为所有下级
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
      pagination.current = 1
      
      if (res.data.list && res.data.list.length > 0) {
        Message.success(`找到 ${res.data.total} 个下级用户`)
      } else {
        Message.info('未找到匹配的用户或该用户没有下级')
      }
    }
  } catch (error) {
    console.error('搜索失败:', error)
    Message.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const handleExport = async () => {
  if (!searchKeyword.value) {
    Message.warning('请先搜索用户后再导出')
    return
  }

  exportLoading.value = true
  try {
    const res = await api.exportInviteUsers(searchKeyword.value)
    if (res.code === 0 && res.data) {
      // 将数据转换为 CSV
      const data = res.data
      if (data.length === 0) {
        Message.warning('没有数据可导出')
        return
      }

      // CSV 头部
      const headers = Object.keys(data[0])
      let csvContent = '\uFEFF' + headers.join(',') + '\n' // 添加 BOM 以支持中文

      // CSV 数据行
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] || ''
          // 如果包含逗号或引号，需要用引号包裹
          if (String(value).includes(',') || String(value).includes('"')) {
            return `"${String(value).replace(/"/g, '""')}"`
          }
          return value
        })
        csvContent += values.join(',') + '\n'
      })

      // 创建下载链接
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `邀请关系下级数据_${searchKeyword.value}_${Date.now()}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      Message.success(`已导出 ${data.length} 条数据`)
    } else {
      Message.error(res.msg || '导出失败')
    }
  } catch (error) {
    console.error('导出失败:', error)
    Message.error('导出失败')
  } finally {
    exportLoading.value = false
  }
}

const handlePageChange = (p) => { pagination.current = p; fetchData() }
onMounted(() => fetchData())
</script>

<style scoped>
.uid-text { color: #888; }
.recharge-text { color: #52c41a; font-weight: 500; }
.withdraw-text { color: #f5222d; font-weight: 500; }
.balance-text { color: #1890ff; font-weight: 500; }
.holding-text { color: #722ed1; font-weight: 500; }
.trophy { font-size: 12px; }
.tree-wrapper { padding: 12px; background: var(--color-bg-2); border-radius: 6px; margin-bottom: 12px; max-height: 550px; overflow: auto; }
.org-tree { font-size: 11px; }

.tree-item { margin-left: 0; }
.tree-item.internal > .node-box { position: relative; }
.tree-children { margin-left: 16px; border-left: 1px solid #3b82f6; padding-left: 0; }
.tree-children.internal-line { border-left-color: #f59e0b; }
.tree-children .tree-item { position: relative; }
.tree-children .tree-item::before { content: ''; position: absolute; left: -1px; top: 14px; width: 14px; height: 1px; background: #3b82f6; }
.tree-children.internal-line .tree-item::before { background: #f59e0b; }

.node-box {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 3px 0 3px 14px;
  padding: 5px 8px;
  border-radius: 4px;
  border: 1px solid #3b82f6;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: #fff;
  cursor: default;
  transition: all 0.2s;
  position: relative;
  font-size: 10px;
}
.node-box.expandable { cursor: pointer; }
.node-box.expandable:hover { border-color: #60a5fa; box-shadow: 0 0 6px rgba(59,130,246,0.3); }
.node-box.internal { border-color: #f59e0b; background: linear-gradient(135deg, #78350f 0%, #b45309 100%); }

.trophy-badge { position: absolute; top: -8px; left: 50%; transform: translateX(-50%); font-size: 12px; }
.internal-badge { position: absolute; top: -6px; right: 6px; font-size: 8px; background: #f59e0b; color: #000; padding: 0px 4px; border-radius: 6px; font-weight: 600; }

.node-main { display: flex; align-items: center; gap: 4px; }
.expand-icon { font-size: 8px; color: #60a5fa; width: 10px; }
.expand-icon.dot { color: #64748b; }
.node-name { font-weight: 600; font-size: 10px; }
.node-uid { font-size: 8px; color: #94a3b8; }

.node-finance { display: flex; gap: 6px; font-size: 9px; border-left: 1px solid #475569; padding-left: 6px; }
.node-finance .recharge { color: #4ade80; }
.node-finance .withdraw { color: #f87171; }
.node-finance b { margin-left: 1px; }

.node-stats { display: flex; gap: 5px; font-size: 8px; color: #94a3b8; border-left: 1px solid #475569; padding-left: 6px; }
.children-count { font-size: 8px; color: #60a5fa; background: rgba(59,130,246,0.2); padding: 1px 4px; border-radius: 6px; }

.node-box.root { background: linear-gradient(135deg, #7c2d12 0%, #dc2626 100%); border-color: #ef4444; }
.node-box.lv1 { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); border-color: #3b82f6; }
.node-box.lv2 { background: linear-gradient(135deg, #14532d 0%, #16a34a 100%); border-color: #22c55e; }
.node-box.lv3 { background: linear-gradient(135deg, #581c87 0%, #9333ea 100%); border-color: #a855f7; }
.node-box.lv4 { background: linear-gradient(135deg, #7e22ce 0%, #c084fc 100%); border-color: #d8b4fe; }
</style>
