<template>
  <div class="legal-page">
    <header class="header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <span class="header-title">用户协议</span>
      <span class="header-date">更新于 2024.01</span>
    </header>
    <div class="content">
      <section>
        <h2>1. 服务条款</h2>
        <p>欢迎使用Ascenda平台（以下简称"本平台"）。在使用本平台提供的各项服务之前，请您仔细阅读并充分理解本用户协议的全部内容。</p>
        <p>一旦您注册、登录、使用或以任何方式访问本平台，即表示您已阅读、理解并同意接受本协议的所有条款。</p>
      </section>
      <section>
        <h2>2. 账户注册</h2>
        <p>2.1 用户须年满18周岁，具有完全民事行为能力。</p>
        <p>2.2 用户注册时须提供真实、准确、完整的个人信息。</p>
        <p>2.3 用户有责任妥善保管账户信息和密码安全。</p>
        <p>2.4 一经发现违规行为，本平台有权冻结或终止账户。</p>
      </section>
      <section>
        <h2>3. 服务内容</h2>
        <p>本平台提供以下服务：</p>
        <ul>
          <li>数字资产交易服务</li>
          <li>AGX代币申购与交易</li>
          <li>$t(ecosystem.poolAndRewards)</li>
          <li>黄金资产管理</li>
          <li>合约交易服务</li>
        </ul>
      </section>
      <section>
        <h2>4. 用户行为规范</h2>
        <p>用户在使用本平台服务时，承诺不会：</p>
        <ul>
          <li>违反任何适用法律法规</li>
          <li>侵犯他人合法权益</li>
          <li>进行洗钱、欺诈等非法活动</li>
          <li>干扰平台正常运营</li>
          <li>发布虚假或误导性信息</li>
        </ul>
      </section>
      <section>
        <h2>5. 风险提示</h2>
        <p>5.1 数字资产投资具有高度风险，价格可能大幅波动。</p>
        <p>5.2 用户应根据自身财务状况和风险承受能力谨慎投资。</p>
        <p>5.3 本平台不对任何投资损失承担责任。</p>
      </section>
      <section>
        <h2>6. 知识产权</h2>
        <p>本平台的所有内容、商标、技术和软件均为Ascenda及其许可方所有，受知识产权法律保护。</p>
      </section>
      <section>
        <h2>7. 协议修改</h2>
        <p>本平台有权随时修改本协议。修改后的协议一经公布即生效。继续使用本平台服务即表示接受修改后的协议。</p>
      </section>
      <section>
        <h2>8. 争议解决</h2>
        <p>因本协议引起的争议，双方应友好协商解决。协商不成的，任何一方均可向有管辖权的法院提起诉讼。</p>
      </section>
      <div class="footer">
        <p>© 2024 Ascenda. All rights reserved.</p>
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
