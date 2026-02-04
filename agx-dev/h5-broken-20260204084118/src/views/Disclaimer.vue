<template>
  <div class="legal-page">
    <header class="header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <span class="header-title">免责声明</span>
      <span class="header-date">更新于 2024.01</span>
    </header>
    <div class="content">
      <div class="warning-box">
        <h3>重要提示</h3>
        <p>数字资产投资具有高度风险，请在充分了解相关风险后谨慎决策。</p>
      </div>

      <section>
        <h2>1. 投资风险</h2>
        <p>1.1 数字资产价格可能在短期内大幅波动，您可能损失部分或全部投资。</p>
        <p>1.2 数字资产交易可能不适合所有投资者，请根据您的财务状况、投资经验和风险承受能力做出决定。</p>
        <p>1.3 过往表现不代表未来收益，任何预测或展望不构成投资保证。</p>
      </section>

      <section>
        <h2>2. 市场风险</h2>
        <p>2.1 数字资产市场可能受监管政策变化影响。</p>
        <p>2.2 市场流动性可能不足，导致无法及时买入或卖出。</p>
        <p>2.3 技术故障、网络攻击等可能影响交易执行。</p>
      </section>

      <section>
        <h2>3. 平台责任限制</h2>
        <p>3.1 本平台仅提供交易撮合服务，不对任何投资决策或交易结果承担责任。</p>
        <p>3.2 本平台提供的市场信息、分析报告仅供参考，不构成投资建议。</p>
        <p>3.3 因不可抗力（包括但不限于自然灾害、战争、政府行为）导致的损失，本平台不承担责任。</p>
      </section>

      <section>
        <h2>4. 合规义务</h2>
        <p>4.1 用户有责任遵守其所在司法管辖区的法律法规。</p>
        <p>4.2 部分国家或地区可能禁止或限制数字资产交易，用户应自行确认合规性。</p>
        <p>4.3 用户应如实申报数字资产相关收益并履行纳税义务。</p>
      </section>

      <section>
        <h2>5. AGX代币说明</h2>
        <p>5.1 AGX代币是本平台发行的功能型代币，不构成证券或投资合同。</p>
        <p>5.2 AGX代币价值可能波动，持有者应做好价值归零的准备。</p>
        <p>5.3 矿池收益、持币生金等功能的收益率可能变化，不保证固定收益。</p>
      </section>

      <section>
        <h2>6. 第三方服务</h2>
        <p>本平台可能包含第三方服务的链接或集成。本平台不对第三方服务的可用性、准确性或安全性承担责任。</p>
      </section>

      <section>
        <h2>7. 争议解决</h2>
        <p>对本免责声明的解释和执行，以及因本免责声明产生的争议，均适用相关法律。任何争议应首先通过友好协商解决。</p>
      </section>

      <div class="accept-box">
        <p>使用本平台服务即表示您已阅读、理解并接受本免责声明的全部内容。</p>
      </div>

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
  background: #0B0E11;
  color: #EAECEF;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 12px;
  padding-top: env(safe-area-inset-top);
  background: rgba(11, 14, 17, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.back-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #848E9C;
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #EAECEF;
}

.header-date {
  font-size: 10px;
  color: #5E6673;
}

.content {
  padding: 16px;
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}

.warning-box {
  background: rgba(246, 70, 93, 0.1);
  border: 1px solid rgba(246, 70, 93, 0.3);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 20px;
}

.warning-box h3 {
  font-size: 13px;
  font-weight: 600;
  color: #F6465D;
  margin: 0 0 6px;
}

.warning-box p {
  font-size: 12px;
  color: #F6465D;
  margin: 0;
  line-height: 1.5;
}

section {
  margin-bottom: 24px;
}

h2 {
  font-size: 14px;
  font-weight: 600;
  color: #C8AA6E;
  margin: 0 0 10px;
}

p {
  font-size: 12px;
  color: #848E9C;
  line-height: 1.7;
  margin: 0 0 8px;
}

.accept-box {
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  padding: 14px;
  margin: 24px 0;
}

.accept-box p {
  font-size: 12px;
  color: #C8AA6E;
  margin: 0;
  text-align: center;
}

.footer {
  text-align: center;
  padding: 20px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.footer p {
  font-size: 10px;
  color: #5E6673;
}
</style>
