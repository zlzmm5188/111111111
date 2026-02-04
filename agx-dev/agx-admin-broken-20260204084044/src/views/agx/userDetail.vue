<template>
  <div class="user-detail-page">
    <a-page-header title="用户详情" @back="$router.back()" class="page-header">
      <template #extra>
        <a-space :size="8">
          <a-button type="primary" size="small" @click="handleRecharge">充值</a-button>
          <a-button :type="userInfo.isInternal ? 'secondary' : 'outline'" size="small" @click="handleToggleInternal">
            <template #icon><icon-star-fill v-if="userInfo.isInternal" /><icon-star v-else /></template>
            {{ userInfo.isInternal ? '取消内部' : '设为内部' }}
          </a-button>
          <a-dropdown trigger="click">
            <a-button size="small">
              <template #icon><icon-settings /></template>
              账户管理
              <icon-down />
            </a-button>
            <template #content>
              <a-doption @click="openResetPassword">
                <template #icon><icon-lock /></template>
                重置登录密码
              </a-doption>
              <a-doption @click="openResetTradePassword">
                <template #icon><icon-safe /></template>
                重置支付密码
              </a-doption>
            </template>
          </a-dropdown>
          <a-button :status="userInfo.status === 1 ? 'danger' : 'success'" size="small" @click="handleToggleStatus">
            {{ userInfo.status === 1 ? '禁用账户' : '启用账户' }}
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <!-- 用户概览卡片 -->
    <div class="user-overview-card">
      <div class="user-avatar-section">
        <a-avatar :size="64" :style="{ backgroundColor: userInfo.avatar ? 'transparent' : '#3b82f6' }">
          <img v-if="userInfo.avatar" :src="userInfo.avatar" alt="avatar" style="width: 100%; height: 100%; object-fit: cover;" />
          <template v-else>{{ (userInfo.nickname || userInfo.username || 'U')[0].toUpperCase() }}</template>
        </a-avatar>
        <div class="user-basic">
          <h2 class="username">{{ userInfo.nickname || userInfo.username }}</h2>
          <div class="user-tags">
            <a-tag color="arcoblue" size="small">UID: {{ userInfo.uid }}</a-tag>
            <a-tag v-if="userInfo.isInternal" color="red" class="internal-badge">
              <template #icon><icon-star-fill /></template>
              内部
            </a-tag>
            <a-tag :color="userInfo.status === 1 ? 'green' : 'red'" size="small">
              {{ userInfo.status === 1 ? '正常' : '禁用' }}
            </a-tag>
            <a-tag v-if="kycInfo?.status === 1" color="green" size="small">已认证</a-tag>
            <a-tag v-else color="orange" size="small">未认证</a-tag>
            <a-tag v-if="userInfo.vipLevel" :color="getVipLevelColor(userInfo.vipLevel)" size="small">
              Lv.{{ userInfo.vipLevel }} {{ getVipLevelName(userInfo.vipLevel) }}
            </a-tag>
          </div>
        </div>
      </div>
      <div class="user-stats-grid">
        <div class="stat-item">
          <span class="stat-value">{{ formatAmount(totalAssets) }}</span>
          <span class="stat-label">USDT总资产</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ inviteCount }}</span>
          <span class="stat-label">邀请人数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ formatAmount(totalRecharge) }}</span>
          <span class="stat-label">累计充值</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ formatAmount(totalWithdraw) }}</span>
          <span class="stat-label">累计提现</span>
        </div>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="section-card">
      <div class="section-header">基本信息</div>
      <a-descriptions :column="3" bordered size="small" class="compact-descriptions">
        <a-descriptions-item label="用户ID">{{ userInfo.id }}</a-descriptions-item>
        <a-descriptions-item label="UID">{{ userInfo.uid }}</a-descriptions-item>
        <a-descriptions-item label="用户名">{{ userInfo.username }}</a-descriptions-item>
        <a-descriptions-item label="昵称">{{ userInfo.nickname || '-' }}</a-descriptions-item>
        <a-descriptions-item label="邀请码">{{ userInfo.inviteCode }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="userInfo.status === 1 ? 'green' : 'red'" size="small">{{ userInfo.status === 1 ? '正常' : '禁用' }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="上级邀请人">
          <div class="flex-row">
            <span v-if="userInfo.inviterId" class="link-text" @click="viewInviter">
              {{ userInfo.inviterName || userInfo.inviterId }}
            </span>
            <span v-else class="text-muted">-</span>
            <a-button type="text" size="mini" @click="openChangeInviter">
              <template #icon><icon-edit /></template>
              变更
            </a-button>
          </div>
        </a-descriptions-item>
        <a-descriptions-item label="VIP等级">
          <a-tag :color="getVipLevelColor(userInfo.vipLevel || 0)" size="small">
            Lv.{{ userInfo.vipLevel || 0 }} {{ getVipLevelName(userInfo.vipLevel || 0) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="团队人数">{{ userInfo.teamCount || 0 }} 人</a-descriptions-item>
        <a-descriptions-item label="TRON充值地址" :span="3">
          <div class="flex-row-wrap">
            <span v-if="!editingTronAddress" class="mono-text">
              {{ userInfo.tronAddress || '未绑定' }}
            </span>
            <a-input
              v-else
              v-model="tronAddressForm.address"
              placeholder="输入TRON地址（以T开头，34位）"
              :max-length="34"
              size="small"
              style="width: 300px"
            />
            <a-button v-if="!editingTronAddress" type="text" size="mini" @click="startEditTronAddress">
              <template #icon><icon-edit /></template>
              {{ userInfo.tronAddress ? '修改' : '绑定' }}
            </a-button>
            <a-space v-else :size="6">
              <a-button type="primary" size="mini" @click="saveTronAddress" :loading="savingTronAddress">保存</a-button>
              <a-button size="mini" @click="cancelEditTronAddress">取消</a-button>
            </a-space>
            <a-button v-if="userInfo.tronAddress && !editingTronAddress" type="text" size="mini" @click="copyTronAddress">
              <template #icon><icon-copy /></template>
            </a-button>
          </div>
          <div v-if="editingTronAddress" class="hint-text">
            提示：修改后，用户需从新地址转账充值才能自动入账
          </div>
        </a-descriptions-item>
        <a-descriptions-item label="最后登录">{{ userInfo.lastLoginAt || '-' }}</a-descriptions-item>
        <a-descriptions-item label="注册时间">{{ userInfo.createdAt }}</a-descriptions-item>
        <a-descriptions-item label="最后登录IP">{{ userInfo.lastLoginIp || '-' }}</a-descriptions-item>
        <a-descriptions-item label="管理员备注" :span="3">
          <div class="flex-row">
            <span v-if="!editingRemark" class="text-secondary">{{ userInfo.remark || '暂无备注' }}</span>
            <a-input v-else v-model="remarkForm.content" placeholder="输入备注信息" :max-length="500" size="small" style="width: 300px" />
            <a-button v-if="!editingRemark" type="text" size="mini" @click="startEditRemark">
              <template #icon><icon-edit /></template>
              编辑
            </a-button>
            <a-space v-else :size="6">
              <a-button type="primary" size="mini" @click="saveRemark">保存</a-button>
              <a-button size="mini" @click="cancelEditRemark">取消</a-button>
            </a-space>
          </div>
        </a-descriptions-item>
      </a-descriptions>
    </div>

    <!-- KYC认证信息 -->
    <div class="section-card">
      <div class="section-header">
        <span>KYC认证信息</span>
        <a-button type="text" size="mini" @click="openEditKyc">
          <template #icon><icon-edit /></template>
          编辑
        </a-button>
      </div>
      <template v-if="kycInfo">
        <a-descriptions :column="2" bordered size="small" class="compact-descriptions">
          <a-descriptions-item label="真实姓名">{{ kycInfo.realName || '-' }}</a-descriptions-item>
          <a-descriptions-item label="证件类型">
            <a-tag v-if="kycInfo.idType === 1" size="small">身份证</a-tag>
            <a-tag v-else-if="kycInfo.idType === 2" size="small">护照</a-tag>
            <a-tag v-else size="small">其他</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="证件号码">{{ kycInfo.idNumber || '-' }}</a-descriptions-item>
          <a-descriptions-item label="审核状态">
            <a-tag v-if="kycInfo.status === 0" color="orange" size="small">待审核</a-tag>
            <a-tag v-else-if="kycInfo.status === 1" color="green" size="small">已通过</a-tag>
            <a-tag v-else-if="kycInfo.status === 2" color="red" size="small">已拒绝</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="提交时间" :span="2">{{ kycInfo.createdAt || '-' }}</a-descriptions-item>
          <a-descriptions-item label="证件正面" :span="2" v-if="kycInfo.frontImage">
            <a-image :src="getProxyImageUrl(kycInfo.frontImage)" width="160" height="100" fit="cover" class="kyc-image" />
          </a-descriptions-item>
          <a-descriptions-item label="证件反面" :span="2" v-if="kycInfo.backImage">
            <a-image :src="getProxyImageUrl(kycInfo.backImage)" width="160" height="100" fit="cover" class="kyc-image" />
          </a-descriptions-item>
          <a-descriptions-item label="手持证件/自拍照" :span="2" v-if="kycInfo.holdImage">
            <a-image :src="getProxyImageUrl(kycInfo.holdImage)" width="160" height="100" fit="cover" class="kyc-image" />
          </a-descriptions-item>
        </a-descriptions>
      </template>
      <a-empty v-else description="暂无KYC信息，点击编辑按钮添加" />
    </div>

    <!-- 资产信息 -->
    <div class="section-card">
      <div class="section-header">资产信息</div>
      <a-table :data="assets" :pagination="false" size="small" class="compact-table">
        <template #columns>
          <a-table-column title="币种" data-index="coin" :width="80" />
          <a-table-column title="可用余额" data-index="balance" :width="150">
            <template #cell="{ record }">
              <span class="mono-text">{{ formatAmount(record.balance) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="冻结" data-index="frozen" :width="150">
            <template #cell="{ record }">
              <span class="mono-text">{{ formatAmount(record.frozen) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="100">
            <template #cell="{ record }">
              <a-button type="text" size="mini" @click="handleAdjust(record)">调整</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
      <!-- 积分信息 -->
      <div class="points-section">
        <div class="points-info">
          <span class="points-label">积分/经验值:</span>
          <span class="points-value">{{ formatAmount(userInfo.experiencePoints || 0) }}</span>
          <a-tag :color="getVipLevelColor(userInfo.vipLevel || 0)" size="small" class="ml-2">
            V{{ userInfo.vipLevel || 0 }} {{ getVipLevelName(userInfo.vipLevel || 0) }}
          </a-tag>
          <a-button type="text" size="mini" @click="handleAdjustPoints" class="ml-2">
            <template #icon><icon-edit /></template>
            调整积分
          </a-button>
        </div>
        <div class="points-hint">提示: 1U充值 = 1积分，积分决定VIP等级</div>
      </div>
    </div>

    <!-- 多标签页记录 -->
    <div class="section-card tabs-card">
      <a-tabs default-active-key="orders" size="small" class="compact-tabs">
        <a-tab-pane key="orders" title="合约订单">
          <a-table :data="orders" :pagination="orderPagination" size="small" @page-change="fetchOrders" class="compact-table">
            <template #columns>
              <a-table-column title="订单号" data-index="orderNo" :width="150" />
              <a-table-column title="交易对" data-index="symbol" :width="80" />
              <a-table-column title="方向" data-index="direction" :width="70">
                <template #cell="{ record }">
                  <a-tag :color="record.direction === 1 ? 'green' : 'red'" size="small">{{ record.direction === 1 ? '涨' : '跌' }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="金额" data-index="amount" :width="110">
                <template #cell="{ record }">
                  <span class="mono-text">{{ formatAmount(record.amount) }}</span>
                </template>
              </a-table-column>
              <a-table-column title="盈亏" data-index="profitLoss" :width="110">
                <template #cell="{ record }">
                  <span :class="parseFloat(record.profitLoss) >= 0 ? 'text-green' : 'text-red'" class="mono-text">
                    {{ record.profitLoss >= 0 ? '+' : '' }}{{ formatAmount(record.profitLoss) }}
                  </span>
                </template>
              </a-table-column>
              <a-table-column title="结果" data-index="result" :width="70">
                <template #cell="{ record }">
                  <a-tag v-if="record.result === 'win'" color="green" size="small">盈</a-tag>
                  <a-tag v-else-if="record.result === 'lose'" color="red" size="small">亏</a-tag>
                  <a-tag v-else color="orange" size="small">待</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="时间" data-index="createdAt" :width="150" />
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="recharge" title="充值记录">
          <a-table :data="recharges" :pagination="rechargePagination" size="small" @page-change="fetchRecharges" class="compact-table">
            <template #columns>
              <a-table-column title="订单号" data-index="orderNo" :width="150" />
              <a-table-column title="币种" data-index="coin" :width="70" />
              <a-table-column title="链" data-index="chain" :width="70" />
              <a-table-column title="金额" data-index="amount" :width="110">
                <template #cell="{ record }">
                  <span class="mono-text text-green">+{{ formatAmount(record.amount) }}</span>
                </template>
              </a-table-column>
              <a-table-column title="状态" data-index="status" :width="70">
                <template #cell="{ record }">
                  <a-tag :color="record.status === 1 ? 'green' : 'orange'" size="small">{{ record.status === 1 ? '成功' : '待确认' }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="时间" data-index="createdAt" :width="150" />
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="withdraw" title="提现记录">
          <a-table :data="withdraws" :pagination="withdrawPagination" size="small" @page-change="fetchWithdraws" class="compact-table">
            <template #columns>
              <a-table-column title="订单号" data-index="orderNo" :width="150" />
              <a-table-column title="币种" data-index="coin" :width="70" />
              <a-table-column title="金额" data-index="amount" :width="110">
                <template #cell="{ record }">
                  <span class="mono-text text-red">-{{ formatAmount(record.amount) }}</span>
                </template>
              </a-table-column>
              <a-table-column title="实际到账" data-index="actualAmount" :width="110">
                <template #cell="{ record }">
                  <span class="mono-text">{{ formatAmount(record.actualAmount) }}</span>
                </template>
              </a-table-column>
              <a-table-column title="状态" data-index="status" :width="70">
                <template #cell="{ record }">
                  <a-tag :color="record.status === 0 ? 'orange' : record.status === 1 ? 'green' : 'red'" size="small">
                    {{ record.status === 0 ? '待审核' : record.status === 1 ? '已通过' : '已拒绝' }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="时间" data-index="createdAt" :width="150" />
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="pool" title="矿池持仓">
          <a-table :data="poolHoldings" :pagination="false" size="small" class="compact-table">
            <template #columns>
              <a-table-column title="矿池产品" data-index="poolName" :width="130" />
              <a-table-column title="持仓金额" data-index="amount" :width="130">
                <template #cell="{ record }">
                  <span class="mono-text">{{ formatAmount(record.amount) }}</span>
                </template>
              </a-table-column>
              <a-table-column title="累计收益" data-index="totalEarning" :width="130">
                <template #cell="{ record }">
                  <span class="mono-text text-green">+{{ formatAmount(record.totalEarning) }}</span>
                </template>
              </a-table-column>
              <a-table-column title="到期时间" data-index="expireAt" :width="150" />
              <a-table-column title="状态" data-index="status" :width="70">
                <template #cell="{ record }">
                  <a-tag :color="record.status === 1 ? 'green' : 'gray'" size="small">{{ record.status === 1 ? '持仓中' : '已到期' }}</a-tag>
                </template>
              </a-table-column>
            </template>
          </a-table>
          <a-empty v-if="poolHoldings.length === 0" description="暂无矿池持仓" />
        </a-tab-pane>

        <a-tab-pane key="invite" title="邀请记录">
          <a-table :data="invites" :pagination="invitePagination" size="small" @page-change="fetchInvites" class="compact-table">
            <template #columns>
              <a-table-column title="用户ID" data-index="userId" :width="70" />
              <a-table-column title="用户名" data-index="username" :width="130" />
              <a-table-column title="等级" data-index="level" :width="70">
                <template #cell="{ record }">
                  <a-tag size="small">{{ record.level === 1 ? '直推' : record.level + '级' }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="注册时间" data-index="createdAt" :width="150" />
              <a-table-column title="操作" :width="70">
                <template #cell="{ record }">
                  <a-button type="text" size="mini" @click="viewUserDetail(record.userId)">查看</a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
          <a-empty v-if="invites.length === 0" description="暂无邀请记录" />
        </a-tab-pane>

        <a-tab-pane key="commission" title="返佣记录">
          <a-table :data="commissions" :pagination="commissionPagination" size="small" @page-change="fetchCommissions" class="compact-table">
            <template #columns>
              <a-table-column title="来源用户" data-index="fromUsername" :width="110" />
              <a-table-column title="返佣类型" data-index="type" :width="90">
                <template #cell="{ record }">
                  <a-tag size="small">{{ getCommissionType(record.type) }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="返佣金额" data-index="amount" :width="110">
                <template #cell="{ record }">
                  <span class="mono-text text-green">+{{ formatAmount(record.amount) }}</span>
                </template>
              </a-table-column>
              <a-table-column title="返佣等级" data-index="level" :width="70">
                <template #cell="{ record }">
                  <a-tag size="small">{{ record.level }}级</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="时间" data-index="createdAt" :width="150" />
            </template>
          </a-table>
          <a-empty v-if="commissions.length === 0" description="暂无返佣记录" />
        </a-tab-pane>

        <a-tab-pane key="login" title="登录日志">
          <a-table :data="loginLogs" :pagination="loginPagination" size="small" @page-change="fetchLoginLogs" class="compact-table">
            <template #columns>
              <a-table-column title="登录时间" data-index="createdAt" :width="150" />
              <a-table-column title="登录IP" data-index="ip" :width="120" />
              <a-table-column title="登录地点" data-index="location" :width="130" />
              <a-table-column title="设备" data-index="device" ellipsis />
              <a-table-column title="状态" data-index="status" :width="70">
                <template #cell="{ record }">
                  <a-tag :color="record.status === 1 ? 'green' : 'red'" size="small">{{ record.status === 1 ? '成功' : '失败' }}</a-tag>
                </template>
              </a-table-column>
            </template>
          </a-table>
          <a-empty v-if="loginLogs.length === 0" description="暂无登录日志" />
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 资产调整弹窗 -->
    <a-modal v-model:visible="adjustVisible" title="资产调整" @ok="submitAdjust" :ok-loading="adjustLoading" width="400px">
      <a-form :model="adjustForm" layout="vertical">
        <a-form-item label="币种">
          <a-input :value="adjustForm.coin" disabled size="small" />
        </a-form-item>
        <a-form-item label="操作类型" required>
          <a-radio-group v-model="adjustForm.type" size="small">
            <a-radio value="increase">增加</a-radio>
            <a-radio value="decrease">扣减</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="金额" required>
          <a-input-number v-model="adjustForm.amount" :min="0" :precision="8" style="width: 100%" placeholder="输入调整金额" size="small" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="adjustForm.remark" placeholder="请输入调整原因" size="small" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 积分调整弹窗 -->
    <a-modal v-model:visible="pointsVisible" title="调整积分/经验值" @ok="submitAdjustPoints" :ok-loading="pointsLoading" width="400px">
      <a-form :model="pointsForm" layout="vertical">
        <a-form-item label="当前积分">
          <a-input :value="formatAmount(userInfo.experiencePoints || 0)" disabled size="small" />
        </a-form-item>
        <a-form-item label="当前等级">
          <a-tag :color="getVipLevelColor(userInfo.vipLevel || 0)" size="small">
            V{{ userInfo.vipLevel || 0 }} {{ getVipLevelName(userInfo.vipLevel || 0) }}
          </a-tag>
        </a-form-item>
        <a-form-item label="操作类型" required>
          <a-radio-group v-model="pointsForm.type" size="small">
            <a-radio value="increase">增加</a-radio>
            <a-radio value="decrease">扣减</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="积分数量" required>
          <a-input-number v-model="pointsForm.amount" :min="0" :precision="2" style="width: 100%" placeholder="输入积分数量" size="small" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="pointsForm.remark" placeholder="请输入调整原因" size="small" />
        </a-form-item>
        <a-alert type="info" class="mt-2">
          等级规则: V0(0-999), V1(1000-4999), V2(5000-19999), V3(20000-49999), V4(50000-99999), V5(100000+)
        </a-alert>
      </a-form>
    </a-modal>

    <!-- 变更推荐人弹窗 -->
    <a-modal v-model:visible="inviterVisible" title="变更推荐人" @ok="submitChangeInviter" :ok-loading="inviterLoading" width="400px">
      <a-form :model="inviterForm" layout="vertical">
        <a-form-item label="当前推荐人">
          <a-input :value="userInfo.inviterName || userInfo.inviterId || '无'" disabled size="small" />
        </a-form-item>
        <a-form-item label="新推荐人 ID">
          <a-input-number v-model="inviterForm.inviterId" :min="0" style="width: 100%" placeholder="输入新推荐人的用户ID，留空则清除推荐人" size="small" />
        </a-form-item>
        <a-alert type="warning" class="mt-2">注意：变更推荐人会影响邀请关系和返佣结算，请谨慎操作</a-alert>
      </a-form>
    </a-modal>

    <!-- 重置登录密码弹窗 -->
    <a-modal v-model:visible="resetPwdVisible" title="重置登录密码" @ok="submitResetPassword" :ok-loading="resetPwdLoading" width="400px">
      <a-form :model="resetPwdForm" layout="vertical">
        <a-form-item label="用户">
          <a-input :value="userInfo.username || userInfo.nickname" disabled size="small" />
        </a-form-item>
        <a-form-item label="新密码" required>
          <a-input-password v-model="resetPwdForm.password" placeholder="输入新登录密码" allow-clear size="small" />
        </a-form-item>
        <a-form-item label="确认密码" required>
          <a-input-password v-model="resetPwdForm.confirmPassword" placeholder="再次输入新密码" allow-clear size="small" />
        </a-form-item>
        <a-alert type="warning" class="mt-2">注意：重置后用户需要使用新密码登录</a-alert>
      </a-form>
    </a-modal>

    <!-- 重置支付密码弹窗 -->
    <a-modal v-model:visible="resetTradePwdVisible" title="重置支付密码" @ok="submitResetTradePassword" :ok-loading="resetTradePwdLoading" width="400px">
      <a-form :model="resetTradePwdForm" layout="vertical">
        <a-form-item label="用户">
          <a-input :value="userInfo.username || userInfo.nickname" disabled size="small" />
        </a-form-item>
        <a-form-item label="新支付密码" required>
          <a-input-password v-model="resetTradePwdForm.password" placeholder="输入新支付密码（6位数字）" :max-length="6" allow-clear size="small" />
        </a-form-item>
        <a-form-item label="确认密码" required>
          <a-input-password v-model="resetTradePwdForm.confirmPassword" placeholder="再次输入新密码" :max-length="6" allow-clear size="small" />
        </a-form-item>
        <a-alert type="warning" class="mt-2">注意：重置后用户需要使用新支付密码进行交易</a-alert>
      </a-form>
    </a-modal>

    <!-- 编辑KYC信息弹窗 -->
    <a-modal v-model:visible="editKycVisible" title="编辑KYC信息" @ok="submitEditKyc" :ok-loading="editKycLoading" width="400px">
      <a-form :model="editKycForm" layout="vertical">
        <a-form-item label="真实姓名" required>
          <a-input v-model="editKycForm.realName" placeholder="输入真实姓名" allow-clear size="small" />
        </a-form-item>
        <a-form-item label="证件类型" required>
          <a-select v-model="editKycForm.idType" placeholder="选择证件类型" size="small">
            <a-option :value="1">身份证</a-option>
            <a-option :value="2">护照</a-option>
            <a-option :value="3">其他</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="证件号码" required>
          <a-input v-model="editKycForm.idNumber" placeholder="输入证件号码" allow-clear size="small" />
        </a-form-item>
        <a-alert type="info" class="mt-2">提示：保存后将自动通过KYC认证</a-alert>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import agxApi from '@/api/agx'
import { formatNumber } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const userId = route.params.id

const userInfo = ref({})
const kycInfo = ref(null)
const assets = ref([])
const orders = ref([])
const recharges = ref([])
const withdraws = ref([])
const poolHoldings = ref([])
const invites = ref([])
const commissions = ref([])
const loginLogs = ref([])

// 统计数据 - 直接使用后端返回的值
const totalAssets = ref('0.00')
const inviteCount = ref(0)
const totalRecharge = ref(0)
const totalWithdraw = ref(0)

// 分页
const orderPagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true })
const rechargePagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true })
const withdrawPagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true })
const invitePagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true })
const commissionPagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true })
const loginPagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true })

// 充值
const rechargeVisible = ref(false)
const rechargeForm = reactive({ coin: 'USDT', amount: 0, remark: '' })

// 资产调整
const adjustVisible = ref(false)
const adjustLoading = ref(false)
const adjustForm = reactive({ coin: 'USDT', type: 'increase', amount: 0, remark: '' })

// 积分调整
const pointsVisible = ref(false)
const pointsLoading = ref(false)
const pointsForm = reactive({ type: 'increase', amount: 0, remark: '' })

// 变更推荐人
const inviterVisible = ref(false)
const inviterLoading = ref(false)
const inviterForm = reactive({ inviterId: null })

// 重置登录密码
const resetPwdVisible = ref(false)
const resetPwdLoading = ref(false)
const resetPwdForm = reactive({ password: '', confirmPassword: '' })

// 重置支付密码
const resetTradePwdVisible = ref(false)
const resetTradePwdLoading = ref(false)
const resetTradePwdForm = reactive({ password: '', confirmPassword: '' })

// 编辑KYC信息
const editKycVisible = ref(false)
const editKycLoading = ref(false)
const editKycForm = reactive({ realName: '', idNumber: '', idType: 1 })

// 备注编辑
const editingRemark = ref(false)
const remarkForm = reactive({ content: '' })

// TRON地址编辑
const editingTronAddress = ref(false)
const savingTronAddress = ref(false)
const tronAddressForm = reactive({ address: '' })

// 格式化金额 - 使用全局格式化工具
const formatAmount = (val) => {
  return formatNumber(val)
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

// 获取返佣类型名称
const getCommissionType = (type) => {
  const types = {
    'recharge': '充值返佣',
    'trade': '交易返佣',
    'pool': '矿池返佣',
    'invite': '邀请奖励'
  }
  return types[type] || type
}

// VIP等级配置
const vipLevelConfig = {
  0: { name: '普通用户', color: '#8B949E' },
  1: { name: '准入会员', color: '#8B9DC3' },
  2: { name: '优选会员', color: '#4A90D9' },
  3: { name: '资本合伙人', color: '#D4AF37' },
  4: { name: '执行官合伙人', color: '#9B59B6' },
  5: { name: '主权合伙人', color: '#C9A962' }
}

// 获取VIP等级名称
const getVipLevelName = (level) => {
  return vipLevelConfig[level]?.name || `VIP${level}`
}

// 获取VIP等级颜色
const getVipLevelColor = (level) => {
  return vipLevelConfig[level]?.color || '#8B949E'
}

// 获取用户详情
const fetchData = async () => {
  try {
    const res = await agxApi.getUserDetail(userId)
    if (res.code === 0 && res.data) {
      userInfo.value = res.data.user || res.data
      kycInfo.value = res.data.kyc || null
      assets.value = res.data.assets || []
      // 直接使用后端返回的汇总值
      totalAssets.value = res.data.totalAssets || '0.00'
      inviteCount.value = res.data.inviteCount || userInfo.value.inviteCount || 0
      totalRecharge.value = res.data.totalRecharge || 0
      totalWithdraw.value = res.data.totalWithdraw || 0
      remarkForm.content = userInfo.value.remark || ''
    }
  } catch (e) {
    console.error(e)
    Message.error('加载失败')
  }
}

// 获取合约订单
const fetchOrders = async (page = 1) => {
  try {
    orderPagination.current = page
    const res = await agxApi.getContractOrderList({ userId, page, pageSize: orderPagination.pageSize })
    if (res.code === 0) {
      orders.value = res.data.list || []
      orderPagination.total = res.data.total || 0
    }
  } catch (e) {
    console.error(e)
  }
}

// 获取充值记录
const fetchRecharges = async (page = 1) => {
  try {
    rechargePagination.current = page
    const res = await agxApi.getRechargeList({ userId, page, pageSize: rechargePagination.pageSize })
    if (res.code === 0) {
      recharges.value = res.data.list || []
      rechargePagination.total = res.data.total || 0
    }
  } catch (e) {
    console.error(e)
  }
}

// 获取提现记录
const fetchWithdraws = async (page = 1) => {
  try {
    withdrawPagination.current = page
    const res = await agxApi.getWithdrawList({ userId, page, pageSize: withdrawPagination.pageSize })
    if (res.code === 0) {
      withdraws.value = res.data.list || []
      withdrawPagination.total = res.data.total || 0
    }
  } catch (e) {
    console.error(e)
  }
}

// 获取矿池持仓
const fetchPoolHoldings = async () => {
  try {
    const res = await agxApi.getPoolHoldingList({ userId, page: 1, pageSize: 100 })
    if (res.code === 0) {
      poolHoldings.value = res.data.list || []
    }
  } catch (e) {
    console.error(e)
  }
}

// 获取邀请记录
const fetchInvites = async (page = 1) => {
  try {
    invitePagination.current = page
    const res = await agxApi.getInviteUserList({ inviterId: userId, page, pageSize: invitePagination.pageSize })
    if (res.code === 0) {
      invites.value = res.data.list || []
      invitePagination.total = res.data.total || 0
    }
  } catch (e) {
    console.error(e)
  }
}

// 获取返佣记录
const fetchCommissions = async (page = 1) => {
  try {
    commissionPagination.current = page
    const res = await agxApi.getCommissionList({ userId, page, pageSize: commissionPagination.pageSize })
    if (res.code === 0) {
      commissions.value = res.data.list || []
      commissionPagination.total = res.data.total || 0
    }
  } catch (e) {
    console.error(e)
  }
}

// 获取登录日志
const fetchLoginLogs = async (page = 1) => {
  try {
    loginPagination.current = page
    const res = await agxApi.getLoginLogList({ userId, page, pageSize: loginPagination.pageSize })
    if (res.code === 0) {
      loginLogs.value = res.data.list || []
      loginPagination.total = res.data.total || 0
    }
  } catch (e) {
    console.error(e)
  }
}

// 查看上级邀请人
const viewInviter = () => {
  if (userInfo.value.inviterId) {
    router.push(`/agx/userDetail/${userInfo.value.inviterId}`)
  }
}

// 查看用户详情
const viewUserDetail = (id) => {
  router.push(`/agx/userDetail/${id}`)
}

const handleRecharge = () => {
  rechargeForm.coin = 'USDT'
  rechargeForm.amount = 0
  rechargeForm.remark = ''
  rechargeVisible.value = true
}

const submitRecharge = async () => {
  if (!rechargeForm.amount || rechargeForm.amount <= 0) {
    Message.warning('请输入有效金额')
    return
  }
  try {
    const res = await agxApi.manualRecharge({
      userId: parseInt(userId),
      coin: rechargeForm.coin,
      amount: String(rechargeForm.amount),
      remark: rechargeForm.remark
    })
    if (res.code === 0) {
      Message.success('充值成功')
      rechargeVisible.value = false
      fetchData()
      fetchRecharges()
    }
  } catch (e) {
    Message.error('充值失败')
  }
}

const handleToggleStatus = async () => {
  try {
    const newStatus = userInfo.value.status === 1 ? 0 : 1
    const res = await agxApi.updateUserStatus(userId, { status: newStatus })
    if (res.code === 0) {
      Message.success(newStatus === 1 ? '已启用' : '已禁用')
      userInfo.value.status = newStatus
    }
  } catch (e) {
    Message.error('操作失败')
  }
}

// 切换内部人员状态
const handleToggleInternal = async () => {
  try {
    const newInternal = !userInfo.value.isInternal
    const res = await agxApi.setUserInternal(userId, { isInternal: newInternal })
    if (res.code === 0) {
      Message.success(newInternal ? '已设为内部人员' : '已取消内部人员')
      userInfo.value.isInternal = newInternal
    } else {
      Message.error(res.msg || '操作失败')
    }
  } catch (e) {
    Message.error('操作失败')
  }
}

const handleAdjust = (record) => {
  adjustForm.coin = record.coin
  adjustForm.type = 'increase'
  adjustForm.amount = 0
  adjustForm.remark = ''
  adjustVisible.value = true
}

const submitAdjust = async () => {
  if (!adjustForm.amount || adjustForm.amount <= 0) {
    Message.warning('请输入有效金额')
    return
  }
  adjustLoading.value = true
  try {
    const res = await agxApi.adjustUserAsset(userId, {
      coin: adjustForm.coin,
      type: adjustForm.type,
      amount: String(adjustForm.amount),
      remark: adjustForm.remark
    })
    if (res.code === 0) {
      Message.success(adjustForm.type === 'increase' ? '资产已增加' : '资产已扣减')
      adjustVisible.value = false
      fetchData()
    } else {
      Message.error(res.msg || '操作失败')
    }
  } catch (e) {
    Message.error('操作失败')
  } finally {
    adjustLoading.value = false
  }
}

// 积分调整
const handleAdjustPoints = () => {
  pointsForm.type = 'increase'
  pointsForm.amount = 0
  pointsForm.remark = ''
  pointsVisible.value = true
}

const submitAdjustPoints = async () => {
  if (!pointsForm.amount || pointsForm.amount <= 0) {
    Message.warning('请输入有效积分数量')
    return
  }
  pointsLoading.value = true
  try {
    const res = await agxApi.adjustUserPoints(userId, {
      type: pointsForm.type,
      amount: String(pointsForm.amount),
      remark: pointsForm.remark
    })
    if (res.code === 0) {
      Message.success(pointsForm.type === 'increase' ? '积分已增加' : '积分已扣减')
      pointsVisible.value = false
      // 更新用户信息中的积分和等级
      userInfo.value.experiencePoints = res.pointsAfter || res.data?.pointsAfter
      userInfo.value.vipLevel = res.vipLevel || res.data?.vipLevel
      fetchData()
    } else {
      Message.error(res.msg || '操作失败')
    }
  } catch (e) {
    Message.error('操作失败')
  } finally {
    pointsLoading.value = false
  }
}

// 变更推荐人
const openChangeInviter = () => {
  inviterForm.inviterId = userInfo.value.inviterId || null
  inviterVisible.value = true
}

const submitChangeInviter = async () => {
  inviterLoading.value = true
  try {
    const res = await agxApi.changeUserInviter(userId, {
      inviterId: inviterForm.inviterId || null
    })
    if (res.code === 0) {
      Message.success('推荐人已变更')
      inviterVisible.value = false
      fetchData()
    } else {
      Message.error(res.msg || '操作失败')
    }
  } catch (e) {
    Message.error('操作失败')
  } finally {
    inviterLoading.value = false
  }
}

// 重置登录密码
const openResetPassword = () => {
  resetPwdForm.password = ''
  resetPwdForm.confirmPassword = ''
  resetPwdVisible.value = true
}

const submitResetPassword = async () => {
  if (!resetPwdForm.password) {
    Message.warning('请输入新密码')
    return
  }
  if (resetPwdForm.password.length < 6) {
    Message.warning('密码长度至少6位')
    return
  }
  if (resetPwdForm.password !== resetPwdForm.confirmPassword) {
    Message.warning('两次输入的密码不一致')
    return
  }
  resetPwdLoading.value = true
  try {
    const res = await agxApi.resetUserPassword(userId, { password: resetPwdForm.password })
    if (res.code === 0) {
      Message.success('登录密码已重置')
      resetPwdVisible.value = false
    } else {
      Message.error(res.msg || '操作失败')
    }
  } catch (e) {
    Message.error('操作失败')
  } finally {
    resetPwdLoading.value = false
  }
}

// 重置支付密码
const openResetTradePassword = () => {
  resetTradePwdForm.password = ''
  resetTradePwdForm.confirmPassword = ''
  resetTradePwdVisible.value = true
}

const submitResetTradePassword = async () => {
  if (!resetTradePwdForm.password) {
    Message.warning('请输入新支付密码')
    return
  }
  if (!/^\d{6}$/.test(resetTradePwdForm.password)) {
    Message.warning('支付密码必须是6位数字')
    return
  }
  if (resetTradePwdForm.password !== resetTradePwdForm.confirmPassword) {
    Message.warning('两次输入的密码不一致')
    return
  }
  resetTradePwdLoading.value = true
  try {
    const res = await agxApi.resetUserTradePassword(userId, { password: resetTradePwdForm.password })
    if (res.code === 0) {
      Message.success('支付密码已重置')
      resetTradePwdVisible.value = false
    } else {
      Message.error(res.msg || '操作失败')
    }
  } catch (e) {
    Message.error('操作失败')
  } finally {
    resetTradePwdLoading.value = false
  }
}

// 编辑KYC信息
const openEditKyc = () => {
  editKycForm.realName = kycInfo.value?.realName || ''
  editKycForm.idNumber = kycInfo.value?.idNumber || ''
  editKycForm.idType = kycInfo.value?.idType || 1
  editKycVisible.value = true
}

const submitEditKyc = async () => {
  if (!editKycForm.realName) {
    Message.warning('请输入真实姓名')
    return
  }
  if (!editKycForm.idNumber) {
    Message.warning('请输入证件号码')
    return
  }
  editKycLoading.value = true
  try {
    const res = await agxApi.updateUserKyc(userId, {
      realName: editKycForm.realName,
      idNumber: editKycForm.idNumber,
      idType: editKycForm.idType
    })
    if (res.code === 0) {
      Message.success('KYC信息已更新')
      editKycVisible.value = false
      fetchData()
    } else {
      Message.error(res.msg || '操作失败')
    }
  } catch (e) {
    Message.error('操作失败')
  } finally {
    editKycLoading.value = false
  }
}

// 备注编辑功能
const startEditRemark = () => {
  editingRemark.value = true
  remarkForm.content = userInfo.value.remark || ''
}

const cancelEditRemark = () => {
  editingRemark.value = false
  remarkForm.content = userInfo.value.remark || ''
}

const saveRemark = async () => {
  try {
    const res = await agxApi.updateUserRemark(userId, { remark: remarkForm.content })
    if (res.code === 0) {
      Message.success('备注已更新')
      userInfo.value.remark = remarkForm.content
      editingRemark.value = false
    }
  } catch (e) {
    Message.error('更新失败')
  }
}

// TRON地址编辑功能
const startEditTronAddress = () => {
  editingTronAddress.value = true
  tronAddressForm.address = userInfo.value.tronAddress || ''
}

const cancelEditTronAddress = () => {
  editingTronAddress.value = false
  tronAddressForm.address = userInfo.value.tronAddress || ''
}

const saveTronAddress = async () => {
  if (tronAddressForm.address && !/^T[a-zA-Z0-9]{33}$/.test(tronAddressForm.address)) {
    Message.warning('请输入有效的TRON地址（以T开头，34位）')
    return
  }

  savingTronAddress.value = true
  try {
    const res = await agxApi.updateUserTronAddress(userId, { tronAddress: tronAddressForm.address || null })
    if (res.code === 0) {
      Message.success('TRON地址已更新')
      userInfo.value.tronAddress = tronAddressForm.address
      editingTronAddress.value = false
    } else {
      Message.error(res.msg || '更新失败')
    }
  } catch (e) {
    Message.error('更新失败')
  } finally {
    savingTronAddress.value = false
  }
}

const copyTronAddress = async () => {
  if (!userInfo.value.tronAddress) return
  try {
    await navigator.clipboard.writeText(userInfo.value.tronAddress)
    Message.success('地址已复制')
  } catch (e) {
    Message.error('复制失败')
  }
}

onMounted(() => {
  fetchData()
  fetchOrders()
  fetchRecharges()
  fetchWithdraws()
  fetchPoolHoldings()
  fetchInvites()
  fetchCommissions()
  fetchLoginLogs()
})
</script>

<style lang="less" scoped>
.user-detail-page {
  padding: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', 'Roboto Mono', 'Menlo', 'Monaco', 'Consolas', monospace;
  --font-digits: 'SF Mono', 'Inter', 'Roboto Mono', 'Menlo', monospace;
  background: #f5f6f8;
  min-height: calc(100vh - 140px);
}

:deep(.page-header) {
  .arco-page-header-wrapper {
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 10px;
    margin-bottom: 12px;
    background: transparent;
  }

  .arco-page-header-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .arco-btn {
    font-size: 13px;
    font-weight: 500;
    border-radius: 6px;

    &.arco-btn-primary {
      background: #3b82f6;
      border-color: #3b82f6;

      &:hover {
        background: #2563eb;
        border-color: #2563eb;
      }
    }

    &:not(.arco-btn-primary) {
      background: #fff;
      border-color: #e5e7eb;
      color: #4b5563;

      &:hover {
        background: #f9fafb;
        border-color: #d1d5db;
        color: #1f2937;
      }
    }
  }
}

.user-overview-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 8px;
  margin-bottom: 12px;
  color: #fff;
}

.user-avatar-section {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-basic {
  .username {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 6px 0;
    color: #fff;
    letter-spacing: -0.01em;
  }

  .user-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
}

.user-stats-grid {
  display: flex;
  gap: 28px;
}

.stat-item {
  text-align: center;

  .stat-value {
    display: block;
    font-family: var(--font-digits);
    font-variant-numeric: tabular-nums;
    font-size: 20px;
    font-weight: 600;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .stat-label {
    font-size: 11px;
    opacity: 0.9;
    margin-top: 2px;
    font-weight: 500;
  }
}

.section-card {
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-header {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.points-section {
  margin-top: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.points-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.points-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.points-value {
  font-family: var(--font-digits);
  font-size: 18px;
  font-weight: 600;
  color: #3b82f6;
}

.points-hint {
  margin-top: 8px;
  font-size: 11px;
  color: #9ca3af;
}

.ml-2 {
  margin-left: 8px;
}

:deep(.compact-descriptions) {
  .arco-descriptions-table-container {
    font-size: 13px;
  }

  .arco-descriptions-label {
    background: #f9fafb;
    color: #6b7280;
    font-size: 12px;
    font-weight: 500;
    padding: 8px 10px;
  }

  .arco-descriptions-value {
    background: transparent;
    color: #1f2937;
    padding: 8px 10px;
  }

  .arco-descriptions-row {
    border-color: #f3f4f6;
  }

  .arco-tag {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
  }
}

.flex-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.flex-row-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.link-text {
  color: #3b82f6;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    text-decoration: underline;
  }
}

.mono-text {
  font-family: var(--font-digits);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  letter-spacing: -0.02em;
  font-size: 13px;
  color: #1f2937;
}

.hint-text {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
  width: 100%;
}

.text-secondary {
  color: #4b5563;
}

.text-muted {
  color: #9ca3af;
}

.kyc-image {
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

:deep(.compact-tabs) {
  .arco-tabs-nav {
    padding-bottom: 8px;
  }

  .arco-tabs-tab {
    font-size: 13px;
    padding: 6px 12px;
    margin-right: 4px;
    color: #6b7280;
    font-weight: 500;

    &.arco-tabs-tab-active {
      color: #3b82f6;
      font-weight: 600;
    }

    &:hover {
      color: #1f2937;
    }
  }

  .arco-tabs-ink {
    background: #3b82f6;
  }
}

:deep(.compact-table) {
  background: transparent;
  border-radius: 6px;
  overflow: hidden;

  .arco-table {
    background: transparent;
    color: #1f2937;
    font-size: 12px;
  }

  .arco-table-th,
  .arco-table-td {
    padding: 7px 10px;
    background: transparent;
    border-color: #f3f4f6;
  }

  .arco-table-th {
    font-weight: 600;
    color: #6b7280;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    background: #f9fafb;
  }

  .arco-table-tr {
    transition: background 0.15s ease;

    &:hover {
      background: #f9fafb;
    }

    &:not(:last-child) {
      border-bottom: 1px solid #f3f4f6;
    }
  }

  .arco-tag {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 500;
  }
}

.text-green {
  color: #22c55e;
}

.text-red {
  color: #ef4444;
}

.internal-badge {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  color: white !important;
  border: none;
  font-weight: 600;
  padding: 2px 8px;

  :deep(.arco-icon) {
    color: white !important;
  }
}

:deep(.arco-modal) {
  .arco-modal-header {
    border-bottom: 1px solid #e5e7eb;
    padding: 12px 16px;
  }

  .arco-modal-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
  }

  .arco-modal-body {
    padding: 16px;
    color: #4b5563;
  }

  .arco-modal-footer {
    border-top: 1px solid #e5e7eb;
    padding: 12px 16px;
  }

  .arco-form-item-label-col {
    .arco-form-item-label {
      font-size: 13px;
      color: #6b7280;
      font-weight: 500;
    }
  }
}

:deep(.arco-pagination) {
  .arco-pagination-item {
    background: #fff;
    border: 1px solid #e5e7eb;
    color: #4b5563;
    font-size: 12px;
    min-width: 28px;
    height: 28px;
    border-radius: 6px;

    &:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }

    &.arco-pagination-item-active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }
  }

  .arco-pagination-jump-input {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
  }
}

:deep(.arco-alert) {
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 6px;

  &.arco-alert-warning {
    background: #fef3c7;
    border-color: #fbbf24;
  }

  &.arco-alert-info {
    background: #dbeafe;
    border-color: #93c5fd;
  }

  .arco-alert-body {
    .arco-alert-title {
      font-size: 12px;
      font-weight: 500;
    }

    .arco-alert-content {
      font-size: 12px;
      color: #92400e;
    }
  }

  &.arco-alert-info .arco-alert-content {
    color: #1e40af;
  }
}

:deep(.arco-input-wrapper),
:deep(.arco-select-view),
:deep(.arco-input-number) {
  background: #fff;
  border: 1px solid #e5e7eb;

  .arco-input,
  .arco-select-view-value,
  .arco-input-number-input {
    color: #1f2937;
    background: transparent;
    font-size: 13px;
  }
}

:deep(.arco-empty) {
  .arco-empty-description {
    color: #9ca3af;
    font-size: 13px;
  }
}
</style>
