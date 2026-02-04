<template>
  <div class="post-condition-container">
    <a-card title="发帖条件配置">
      <template #extra>
        <a-button type="primary" @click="saveConfig" :loading="saving">保存配置</a-button>
      </template>

      <a-spin :loading="loading">
        <a-form :model="config" layout="vertical">
          <!-- 总开关 -->
          <a-form-item label="启用发帖条件">
            <a-switch v-model="config.enabled" />
            <span class="ml-3 text-gray-500">关闭后，所有用户均可发帖</span>
          </a-form-item>

          <a-divider />

          <!-- KYC 要求 -->
          <a-form-item label="需要KYC认证">
            <a-switch v-model="config.requireKyc" :disabled="!config.enabled" />
            <span class="ml-3 text-gray-500">开启后，用户必须完成实名认证才能发帖</span>
          </a-form-item>

          <!-- 最低会员等级 -->
          <a-form-item label="最低会员等级">
            <a-select 
              v-model="config.minLevel" 
              :disabled="!config.enabled"
              style="width: 200px"
            >
              <a-option :value="0">Lv.0 启蒙层</a-option>
              <a-option :value="1">Lv.1 准入层</a-option>
              <a-option :value="2">Lv.2 优选层</a-option>
              <a-option :value="3">Lv.3 资本层</a-option>
              <a-option :value="4">Lv.4 执行官层</a-option>
              <a-option :value="5">Lv.5 主权层</a-option>
            </a-select>
            <span class="ml-3 text-gray-500">用户必须达到此等级才能发帖</span>
          </a-form-item>

          <!-- 注册天数要求 -->
          <a-form-item label="最少注册天数">
            <a-input-number 
              v-model="config.minRegisterDays" 
              :min="0" 
              :max="365"
              :disabled="!config.enabled"
              style="width: 200px"
            />
            <span class="ml-3 text-gray-500">0 表示不限制</span>
          </a-form-item>

          <!-- 充值金额要求 -->
          <a-form-item label="最低充值金额 (USDT)">
            <a-input-number 
              v-model="config.minRechargeAmount" 
              :min="0" 
              :precision="2"
              :disabled="!config.enabled"
              style="width: 200px"
            />
            <span class="ml-3 text-gray-500">0 表示不限制，历史总充值金额</span>
          </a-form-item>

          <!-- 持仓金额要求 -->
          <a-form-item label="最低持仓金额 (USDT)">
            <a-input-number 
              v-model="config.minHoldingAmount" 
              :min="0" 
              :precision="2"
              :disabled="!config.enabled"
              style="width: 200px"
            />
            <span class="ml-3 text-gray-500">0 表示不限制，当前账户总余额</span>
          </a-form-item>

          <!-- 粉丝数要求 -->
          <a-form-item label="最少粉丝数">
            <a-input-number 
              v-model="config.minFollowers" 
              :min="0"
              :disabled="!config.enabled"
              style="width: 200px"
            />
            <span class="ml-3 text-gray-500">0 表示不限制</span>
          </a-form-item>

          <!-- 每日发帖上限 -->
          <a-form-item label="每日发帖上限">
            <a-input-number 
              v-model="config.dailyPostLimit" 
              :min="0"
              :max="100"
              :disabled="!config.enabled"
              style="width: 200px"
            />
            <span class="ml-3 text-gray-500">0 表示不限制</span>
          </a-form-item>
        </a-form>
      </a-spin>

      <!-- 配置说明 -->
      <a-divider />
      <a-alert type="info" class="mb-4">
        <template #title>配置说明</template>
        <ul class="list-disc pl-4 text-sm">
          <li>启用发帖条件后，用户发帖前会检查是否满足所有设置的条件</li>
          <li>多个条件同时生效，用户必须满足所有非零条件才能发帖</li>
          <li>条件值设为 0 表示不检查该项条件</li>
          <li>修改配置后即时生效，无需重启服务</li>
        </ul>
      </a-alert>

      <!-- 当前配置预览 -->
      <a-card title="当前配置预览" :bordered="false">
        <a-descriptions :column="2" size="small">
          <a-descriptions-item label="状态">
            <a-tag :color="config.enabled ? 'green' : 'gray'">{{ config.enabled ? '已启用' : '已禁用' }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="需要KYC">
            <a-tag :color="config.requireKyc ? 'blue' : 'gray'">{{ config.requireKyc ? '是' : '否' }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="最少注册天数">{{ config.minRegisterDays || '不限' }}</a-descriptions-item>
          <a-descriptions-item label="最低充值金额">{{ config.minRechargeAmount ? `${config.minRechargeAmount} USDT` : '不限' }}</a-descriptions-item>
          <a-descriptions-item label="最低持仓金额">{{ config.minHoldingAmount ? `${config.minHoldingAmount} USDT` : '不限' }}</a-descriptions-item>
          <a-descriptions-item label="最少粉丝数">{{ config.minFollowers || '不限' }}</a-descriptions-item>
          <a-descriptions-item label="每日发帖上限">{{ config.dailyPostLimit || '不限' }}</a-descriptions-item>
        </a-descriptions>
      </a-card>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { request } from '@/utils/request.js'

const loading = ref(false)
const saving = ref(false)

const config = reactive({
  enabled: false,
  requireKyc: false,
  minLevel: 3,
  minRegisterDays: 0,
  minRechargeAmount: 0,
  minHoldingAmount: 0,
  minFollowers: 0,
  dailyPostLimit: 0,
  commentEnabled: true
})

const fetchConfig = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/api/square/post-condition',
      method: 'get'
    })
    if (res.code === 0 && res.data) {
      Object.assign(config, res.data)
    }
  } catch (error) {
    console.error('获取发帖条件配置失败:', error)
    Message.error('获取配置失败')
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  saving.value = true
  try {
    const res = await request({
      url: '/api/square/post-condition',
      method: 'put',
      data: { ...config }
    })
    if (res.code === 0) {
      Message.success('配置保存成功')
    } else {
      Message.error(res.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存发帖条件配置失败:', error)
    Message.error('保存配置失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>

<style scoped>
.post-condition-container {
  padding: 16px;
}
.ml-3 {
  margin-left: 12px;
}
.mb-4 {
  margin-bottom: 16px;
}
.text-gray-500 {
  color: #8c8c8c;
}
.text-sm {
  font-size: 13px;
}
.list-disc {
  list-style-type: disc;
}
.pl-4 {
  padding-left: 16px;
}
</style>
