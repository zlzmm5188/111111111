<template>
  <div class="legal-page">
    <header class="header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <span class="header-title">隐私政策</span>
      <span class="header-date">更新于 2024.01</span>
    </header>
    <div class="content">
      <section>
        <h2>1. 信息收集</h2>
        <p>为提供服务，我们可能收集以下信息：</p>
        <ul>
          <li><strong>身份信息</strong>：姓名、身份证号、联系方式</li>
          <li><strong>账户信息</strong>：用户名、密码、交易记录</li>
          <li><strong>设备信息</strong>：设备型号、操作系统、IP地址</li>
          <li><strong>使用数据</strong>：浏览记录、操作日志</li>
        </ul>
      </section>
      <section>
        <h2>2. 信息使用</h2>
        <p>收集的信息将用于：</p>
        <ul>
          <li>提供、维护和改进服务</li>
          <li>$t(kyc.verifyIdentity)</li>
          <li>防范欺诈和安全风险</li>
          <li>履行法律法规义务</li>
          <li>发送服务通知和营销信息（经同意）</li>
        </ul>
      </section>
      <section>
        <h2>3. 信息保护</h2>
        <p>我们采取多重措施保护您的信息安全：</p>
        <ul>
          <li>SSL/TLS加密传输</li>
          <li>数据加密存储</li>
          <li>严格的访问控制</li>
          <li>定期安全审计</li>
          <li>员工保密培训</li>
        </ul>
      </section>
      <section>
        <h2>4. 信息共享</h2>
        <p>我们不会出售您的个人信息。在以下情况下可能共享：</p>
        <ul>
          <li>获得您的明确同意</li>
          <li>法律法规要求</li>
          <li>与关联公司共享以提供服务</li>
          <li>与授权合作伙伴共享（受保密约束）</li>
        </ul>
      </section>
      <section>
        <h2>5. Cookie使用</h2>
        <p>我们使用Cookie和类似技术来：</p>
        <ul>
          <li>记住登录状态</li>
          <li>分析使用情况</li>
          <li>优化用户体验</li>
        </ul>
        <p>您可以通过浏览器设置管理Cookie偏好。</p>
      </section>
      <section>
        <h2>6. 用户权利</h2>
        <p>您对个人信息享有以下权利：</p>
        <ul>
          <li>访问和获取副本</li>
          <li>更正不准确信息</li>
          <li>删除个人信息</li>
          <li>限制或反对处理</li>
          <li>数据可携带</li>
        </ul>
      </section>
      <section>
        <h2>7. 数据保留</h2>
        <p>我们将在服务需要期间保留您的信息，并按法律要求保留必要期限。账户注销后，我们将在合理期限内删除或匿名化处理您的信息。</p>
      </section>
      <div class="footer">
        <p>© 2024 AGX. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  background: #FFFFFF;
  color: #1F2937;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  padding-top: env(safe-area-inset-top);
  background: #FFFFFF;
  border-bottom: 1px solid #E5E7EB;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #374151;
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.header-date {
  font-size: 11px;
  color: #9CA3AF;
}

.content {
  padding: 20px 16px;
  padding-bottom: calc(40px + env(safe-area-inset-bottom));
}

section {
  margin-bottom: 24px;
}

h2 {
  font-size: 15px;
  font-weight: 600;
  color: #B8860B;
  margin: 0 0 12px;
}

p {
  font-size: 13px;
  color: #4B5563;
  line-height: 1.8;
  margin: 0 0 10px;
}

ul {
  margin: 10px 0;
  padding-left: 20px;
}

li {
  font-size: 13px;
  color: #4B5563;
  line-height: 1.7;
  margin-bottom: 6px;
}

li strong {
  color: #111827;
}

.footer {
  text-align: center;
  padding: 24px 0;
  border-top: 1px solid #E5E7EB;
  margin-top: 20px;
}

.footer p {
  font-size: 11px;
  color: #9CA3AF;
}
</style>
