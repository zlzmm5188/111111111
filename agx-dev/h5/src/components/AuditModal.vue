<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click="close">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>AGX 智能合约审计报告</h2>
            <button class="close-btn" @click="close">&times;</button>
          </div>
          <div class="modal-content">
            <div class="audit-section">
              <h3>Smart Contract Audit</h3>
              <h4>智能合约安全审计</h4>
              <p><strong>审计目标：</strong>验证 AGX 核心合约在设计与实现层面不存在高风险安全漏洞</p>
              
              <h4>审计范围：</h4>
              <ul>
                <li>AGX 主合约（Token / Certificate 合约）</li>
                <li>发行与销毁逻辑合约</li>
                <li>锁仓、释放、认购相关合约</li>
                <li>管理员 / 多签 / 权限控制模块</li>
              </ul>

              <h4>重点检查项：</h4>
              <ul>
                <li>重入攻击防护</li>
                <li>整数溢出/下溢</li>
                <li>权限越权防护</li>
                <li>逻辑绕过与状态不一致</li>
                <li>合约升级与代理模式安全</li>
              </ul>
            </div>

            <div class="audit-section">
              <h3>On-Chain Asset Audit</h3>
              <h4>链上资产审计</h4>
              <p><strong>审计目标：</strong>确保 AGX 的发行量、流通量、锁仓量、销毁量在链上完全可查、可算、可验证</p>
              
              <h4>审计内容：</h4>
              <ul>
                <li>AGX 总量模型与上限规则</li>
                <li>实际已发行数量与合约状态核对</li>
                <li>锁仓地址、锁仓规则与释放逻辑</li>
                <li>销毁机制真实性验证</li>
                <li>链上数据与官方披露数据一致性</li>
              </ul>

              <h4>输出结果：</h4>
              <ul>
                <li>当前总发行量</li>
                <li>当前流通量</li>
                <li>锁仓量与解锁计划</li>
                <li>可验证的链上资产证明路径</li>
              </ul>
            </div>

            <div class="audit-section">
              <h3>Issuance & Allocation Review</h3>
              <h4>发行与分配机制审计</h4>
              <p><strong>审计目标：</strong>确认 AGX 的发行与分配逻辑符合既定规则</p>
              
              <h4>审计重点：</h4>
              <ul>
                <li>首发阶段发行规则</li>
                <li>后续增发或释放合约约束</li>
                <li>"人工后台改数"风险评估</li>
                <li>管理权限边界与审计记录</li>
              </ul>
            </div>

            <div class="audit-section">
              <h3>Privilege & Governance Audit</h3>
              <h4>权限与治理安全审计</h4>
              <p><strong>审计目标：</strong>防止"单点失控"，确保关键操作具备可追溯性与风险隔离能力</p>
              
              <h4>审计内容：</h4>
              <ul>
                <li>管理员权限范围界定</li>
                <li>多签或权限分级设计</li>
                <li>关键操作链上可追溯</li>
                <li>紧急暂停与恢复机制</li>
                <li>权限变更留痕与审计</li>
              </ul>
            </div>

            <div class="audit-section">
              <h3>系统一致性与合规性检查</h3>
              <p><strong>审计目标：</strong>确保技术实现与项目披露内容保持一致</p>
              
              <h4>核查项：</h4>
              <ul>
                <li>合约逻辑与白皮书一致性</li>
                <li>资产模型与宣传口径一致性</li>
                <li>风险提示与技术实现匹配</li>
              </ul>
            </div>

            <div class="audit-result">
              <h3>审计结论与风险评级</h3>
              <p>审计机构将基于上述内容给出：</p>
              <ul>
                <li>安全风险等级评估</li>
                <li>已修复问题说明（如有）</li>
                <li>未发现重大风险的确认</li>
                <li>可公开披露的审计摘要</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: #1a1d24;
  border: 1px solid #C8AA6E;
  border-radius: 20px;
  max-width: 600px;
  max-height: 80vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(201, 169, 98, 0.2);
  background: rgba(201, 169, 98, 0.05);
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #C8AA6E;
}

.close-btn {
  background: none;
  border: none;
  color: #8B949E;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  color: #C8AA6E;
  transform: rotate(90deg);
}

.modal-content {
  padding: 20px;
  overflow-y: auto;
}

.audit-section {
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(22, 27, 34, 0.5);
  border-radius: 12px;
}

.audit-section:last-child {
  margin-bottom: 0;
}

.audit-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #C8AA6E;
}

.audit-section h4 {
  margin: 12px 0 8px 0;
  font-size: 14px;
  color: #E6EDF3;
}

.audit-section p {
  margin: 8px 0;
  font-size: 13px;
  color: #8B949E;
  line-height: 1.6;
}

.audit-section ul {
  margin: 8px 0;
  padding-left: 20px;
}

.audit-section li {
  margin: 4px 0;
  font-size: 13px;
  color: #8B949E;
  line-height: 1.6;
}

.audit-result {
  padding: 20px;
  background: rgba(201, 169, 98, 0.1);
  border: 1px solid rgba(201, 169, 98, 0.3);
  border-radius: 12px;
}

.audit-result h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #C8AA6E;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

.modal-enter-to .modal-container,
.modal-leave-from .modal-container {
  transform: scale(1);
}
</style>
