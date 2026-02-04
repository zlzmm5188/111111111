<template>
  <div class="whitepaper-page">
    <!-- 水印层 -->
    <div class="watermark-layer">
      <div class="watermark-row" v-for="row in 12" :key="row">
        <span class="watermark-text" v-for="col in 6" :key="col">Ascenda Capital</span>
      </div>
    </div>

    <!-- 头部 -->
    <header class="header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      
      <!-- 语言切换 -->
      <div class="lang-switch">
        <button 
          :class="['lang-btn', { active: lang === 'zh' }]" 
          @click="lang = 'zh'"
        >中文</button>
        <button 
          :class="['lang-btn', { active: lang === 'en' }]" 
          @click="lang = 'en'"
        >EN</button>
      </div>
      
      <button class="action-btn" @click="shareDoc">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
      </button>
    </header>

    <div class="content">
      <!-- 封面 -->
      <section class="cover">
        <div class="cover-pattern"></div>
        <div class="cover-inner">
          <div class="cover-badge">CORPORATE WHITEPAPER</div>
          <div class="cover-logo">
            <img src="/company-logo.png" alt="Ascenda Logo">
          </div>
          <h1>Ascenda Digital Capital</h1>
          <p class="cover-sub">GROUP LIMITED</p>
          <div class="cover-divider"></div>
          <p class="cover-tagline" v-if="lang === 'zh'">
            全球领先的数字资产金融服务集团<br>
            构建安全、合规、高效的数字经济基础设施
          </p>
          <p class="cover-tagline" v-else>
            Global Leading Digital Asset Financial Services Group<br>
            Building Secure, Compliant & Efficient Digital Economy Infrastructure
          </p>
          <div class="cover-info">
            <span>Version 1.0</span>
            <span>January 2026</span>
            <span>Cayman Islands</span>
          </div>
        </div>
      </section>

      <!-- 目录 -->
      <section class="section toc">
        <div class="section-badge">TABLE OF CONTENTS</div>
        <h2 v-if="lang === 'zh'">目录</h2>
        <h2 v-else>Contents</h2>
        <div class="toc-list">
          <div class="toc-item" v-for="(item, i) in (lang === 'zh' ? tocZh : tocEn)" :key="i" @click="scrollToChapter('chapter-' + String(i + 1).padStart(2, '0'))">
            <span class="toc-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="toc-title">{{ item.name }}</span>
            <span class="toc-arrow">›</span>
          </div>
        </div>
      </section>

      <!-- 01 公司概述 -->
      <section id="chapter-01" class="section">
        <div class="chapter-head">
          <span class="chapter-num">01</span>
          <div>
            <div class="section-badge">CHAPTER 01</div>
            <h2 v-if="lang === 'zh'">公司概述</h2>
            <h2 v-else>Company Overview</h2>
          </div>
        </div>
        
        <div class="text-block" v-if="lang === 'zh'">
          <p><strong>Ascenda Digital Capital Group</strong>（升达数字资本集团）是一家注册于<strong>开曼群岛</strong>的全球化数字资产金融服务集团。</p>
          <p>集团成立于2024年，总部位于开曼群岛，并在香港、新加坡、迪拜设有运营中心。我们致力于为全球机构及高净值客户提供安全、合规、高效的数字资产配置与管理服务。</p>
          <p>作为行业领先的数字资产服务提供商，集团已取得美国MSB、加拿大FINTRAC、英国FCA、澳大利亚AUSTRAC等多国金融监管牌照，业务覆盖全球180余个国家和地区。</p>
        </div>
        <div class="text-block" v-else>
          <p><strong>Ascenda Digital Capital Group</strong> is a global digital asset financial services group incorporated in the <strong>Cayman Islands</strong>.</p>
          <p>Founded in 2024, headquartered in Cayman Islands with operational centers in Hong Kong, Singapore, and Dubai. We are committed to providing secure, compliant, and efficient digital asset allocation and management services to global institutions and high-net-worth individuals.</p>
          <p>As an industry-leading digital asset service provider, the Group has obtained financial regulatory licenses including U.S. MSB, Canadian FINTRAC, UK FCA, and Australian AUSTRAC, with business coverage in over 180 countries and regions worldwide.</p>
        </div>

        <div class="info-table">
          <div class="info-row">
            <span v-if="lang === 'zh'">公司全称</span>
            <span v-else>Legal Name</span>
            <span>Ascenda Digital Capital Group</span>
          </div>
          <div class="info-row">
            <span v-if="lang === 'zh'">注册地</span>
            <span v-else>Jurisdiction</span>
            <span>Cayman Islands</span>
          </div>
          <div class="info-row">
            <span v-if="lang === 'zh'">成立时间</span>
            <span v-else>Established</span>
            <span>2024</span>
          </div>
          <div class="info-row">
            <span v-if="lang === 'zh'">公司类型</span>
            <span v-else>Company Type</span>
            <span>Exempt Limited Company</span>
          </div>
        </div>
      </section>

      <!-- 02 愿景与使命 -->
      <section id="chapter-02" class="section alt">
        <div class="chapter-head">
          <span class="chapter-num">02</span>
          <div>
            <div class="section-badge">CHAPTER 02</div>
            <h2 v-if="lang === 'zh'">愿景与使命</h2>
            <h2 v-else>Vision & Mission</h2>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">愿景</h3>
        <h3 v-else>Vision</h3>
        <div class="text-block">
          <p v-if="lang === 'zh'">成为全球最值得信赖的数字资产金融服务基础设施提供商，推动数字经济与传统金融的深度融合。</p>
          <p v-else>To become the world's most trusted digital asset financial services infrastructure provider, driving deep integration between digital economy and traditional finance.</p>
        </div>

        <h3 v-if="lang === 'zh'">使命</h3>
        <h3 v-else>Mission</h3>
        <div class="text-block">
          <p v-if="lang === 'zh'">通过技术创新与合规运营，为全球用户提供安全、透明、高效的数字资产服务，让每个人都能平等参与数字经济红利。</p>
          <p v-else>Through technological innovation and compliant operations, provide secure, transparent, and efficient digital asset services to global users, enabling everyone to equally participate in the digital economy dividend.</p>
        </div>

        <h3 v-if="lang === 'zh'">核心价值观</h3>
        <h3 v-else>Core Values</h3>
        <div class="highlights-grid">
          <div class="highlight-box">
            <div class="hl-num">01</div>
            <strong v-if="lang === 'zh'">安全优先</strong>
            <strong v-else>Security First</strong>
            <span v-if="lang === 'zh'">用户资产安全是我们的第一要务</span>
            <span v-else>User asset security is our top priority</span>
          </div>
          <div class="highlight-box">
            <div class="hl-num">02</div>
            <strong v-if="lang === 'zh'">合规运营</strong>
            <strong v-else>Compliance</strong>
            <span v-if="lang === 'zh'">严格遵守全球监管法规要求</span>
            <span v-else>Strict compliance with global regulations</span>
          </div>
          <div class="highlight-box">
            <div class="hl-num">03</div>
            <strong v-if="lang === 'zh'">用户至上</strong>
            <strong v-else>User-Centric</strong>
            <span v-if="lang === 'zh'">以用户需求为中心持续创新</span>
            <span v-else>Continuous innovation centered on user needs</span>
          </div>
          <div class="highlight-box">
            <div class="hl-num">04</div>
            <strong v-if="lang === 'zh'">持续创新</strong>
            <strong v-else>Innovation</strong>
            <span v-if="lang === 'zh'">拥抱技术变革引领行业发展</span>
            <span v-else>Embrace technological change, lead industry</span>
          </div>
        </div>
      </section>

      <!-- 03 组织架构 -->
      <section id="chapter-03" class="section">
        <div class="chapter-head">
          <span class="chapter-num">03</span>
          <div>
            <div class="section-badge">CHAPTER 03</div>
            <h2 v-if="lang === 'zh'">组织架构</h2>
            <h2 v-else>Corporate Structure</h2>
          </div>
        </div>

        <div class="text-block" v-if="lang === 'zh'">
          <p>集团采用控股公司架构，母公司注册于开曼群岛，享有税务优惠及灵活的公司治理环境。下设三大区域子公司，分别负责亚太运营、技术研发、中东合规业务。</p>
        </div>
        <div class="text-block" v-else>
          <p>The Group adopts a holding company structure with the parent company registered in the Cayman Islands, enjoying tax advantages and flexible corporate governance. Three regional subsidiaries handle Asia-Pacific operations, technology R&D, and Middle East compliance respectively.</p>
        </div>

        <div class="org-table">
          <div class="org-row main">
            <span class="org-name">Ascenda Digital Capital Group</span>
            <span class="org-desc">Cayman Islands · Holding Company</span>
          </div>
          <div class="org-divider"></div>
          <div class="org-row">
            <span class="org-name">Ascenda HK Ltd</span>
            <span class="org-desc" v-if="lang === 'zh'">香港运营中心</span>
            <span class="org-desc" v-else>Hong Kong Operations</span>
          </div>
          <div class="org-row">
            <span class="org-name">Ascenda SG Pte</span>
            <span class="org-desc" v-if="lang === 'zh'">新加坡技术中心</span>
            <span class="org-desc" v-else>Singapore Technology</span>
          </div>
          <div class="org-row">
            <span class="org-name">Ascenda DMCC</span>
            <span class="org-desc" v-if="lang === 'zh'">迪拜合规中心</span>
            <span class="org-desc" v-else>Dubai Compliance</span>
          </div>
        </div>
      </section>

      <!-- 04 管理团队 -->
      <section id="chapter-04" class="section alt">
        <div class="chapter-head">
          <span class="chapter-num">04</span>
          <div>
            <div class="section-badge">CHAPTER 04</div>
            <h2 v-if="lang === 'zh'">管理团队</h2>
            <h2 v-else>Leadership Team</h2>
          </div>
        </div>

        <div class="team-list">
          <div class="team-item">
            <div class="team-role">CEO</div>
            <div class="team-name">David Chen</div>
            <div class="team-title" v-if="lang === 'zh'">首席执行官</div>
            <div class="team-title" v-else>Chief Executive Officer</div>
            <div class="team-bio" v-if="lang === 'zh'">前高盛亚太区数字资产主管，15年金融科技经验</div>
            <div class="team-bio" v-else>Former Goldman Sachs APAC Digital Assets Head, 15 years fintech experience</div>
          </div>
          <div class="team-item">
            <div class="team-role">COO</div>
            <div class="team-name">Sarah Wang</div>
            <div class="team-title" v-if="lang === 'zh'">首席运营官</div>
            <div class="team-title" v-else>Chief Operating Officer</div>
            <div class="team-bio" v-if="lang === 'zh'">前币安合规副总裁，哈佛法学院JD</div>
            <div class="team-bio" v-else>Former Binance VP Compliance, Harvard Law JD</div>
          </div>
          <div class="team-item">
            <div class="team-role">CTO</div>
            <div class="team-name">Michael Liu</div>
            <div class="team-title" v-if="lang === 'zh'">首席技术官</div>
            <div class="team-title" v-else>Chief Technology Officer</div>
            <div class="team-bio" v-if="lang === 'zh'">前谷歌区块链架构师，MIT计算机博士</div>
            <div class="team-bio" v-else>Former Google Blockchain Architect, MIT CS PhD</div>
          </div>
          <div class="team-item">
            <div class="team-role">CFO</div>
            <div class="team-name">James Zhou</div>
            <div class="team-title" v-if="lang === 'zh'">首席财务官</div>
            <div class="team-title" v-else>Chief Financial Officer</div>
            <div class="team-bio" v-if="lang === 'zh'">前摩根士丹利投行部董事，CFA/CPA</div>
            <div class="team-bio" v-else>Former Morgan Stanley IBD Director, CFA/CPA</div>
          </div>
        </div>
      </section>

      <!-- 05 董事会 -->
      <section id="chapter-05" class="section">
        <div class="chapter-head">
          <span class="chapter-num">05</span>
          <div>
            <div class="section-badge">CHAPTER 05</div>
            <h2 v-if="lang === 'zh'">董事会成员</h2>
            <h2 v-else>Board of Directors</h2>
          </div>
        </div>

        <div class="info-table">
          <div class="info-row">
            <span v-if="lang === 'zh'">董事长</span>
            <span v-else>Chairman</span>
            <span>Richard Li</span>
          </div>
          <div class="info-row">
            <span v-if="lang === 'zh'">执行董事</span>
            <span v-else>Executive Director</span>
            <span>David Chen</span>
          </div>
          <div class="info-row">
            <span v-if="lang === 'zh'">独立董事</span>
            <span v-else>Independent Director</span>
            <span>Prof. Elizabeth Wong</span>
          </div>
          <div class="info-row">
            <span v-if="lang === 'zh'">独立董事</span>
            <span v-else>Independent Director</span>
            <span>Andrew Smith</span>
          </div>
        </div>

        <div class="text-block" v-if="lang === 'zh'">
          <p>董事会由四名成员组成，其中包括两名独立董事，确保公司治理的独立性与专业性。董事会下设审计委员会、薪酬委员会、风险管理委员会。</p>
        </div>
        <div class="text-block" v-else>
          <p>The Board comprises four members, including two independent directors, ensuring governance independence and professionalism. The Board has established Audit Committee, Remuneration Committee, and Risk Management Committee.</p>
        </div>
      </section>

      <!-- 06 核心业务 -->
      <section id="chapter-06" class="section alt">
        <div class="chapter-head">
          <span class="chapter-num">06</span>
          <div>
            <div class="section-badge">CHAPTER 06</div>
            <h2 v-if="lang === 'zh'">核心业务</h2>
            <h2 v-else>Core Business</h2>
          </div>
        </div>

        <div class="feature-cards">
          <div class="feature-card">
            <div class="fc-header">
              <span class="fc-label">A</span>
              <strong v-if="lang === 'zh'">数字资产交易</strong>
              <strong v-else>Digital Asset Trading</strong>
            </div>
            <p v-if="lang === 'zh'">提供现货、合约、OTC等多元化交易服务，日均交易量超50亿美元</p>
            <p v-else>Spot, futures, OTC trading services with daily volume exceeding $5B</p>
          </div>
          <div class="feature-card">
            <div class="fc-header">
              <span class="fc-label">B</span>
              <strong v-if="lang === 'zh'">财富管理</strong>
              <strong v-else>Wealth Management</strong>
            </div>
            <p v-if="lang === 'zh'">持币生息、流动性挖矿、定期矿机，年化收益最高可达15%</p>
            <p v-else>Staking, liquidity mining, fixed deposits with up to 15% APY</p>
          </div>
          <div class="feature-card">
            <div class="fc-header">
              <span class="fc-label">C</span>
              <strong v-if="lang === 'zh'">AGX生态</strong>
              <strong v-else>AGX Ecosystem</strong>
            </div>
            <p v-if="lang === 'zh'">基于GIB机制的黄金锚定代币，提供抗通胀数字资产配置方案</p>
            <p v-else>GIB-based gold-anchored token for inflation-resistant digital asset allocation</p>
          </div>
          <div class="feature-card">
            <div class="fc-header">
              <span class="fc-label">D</span>
              <strong v-if="lang === 'zh'">机构服务</strong>
              <strong v-else>Institutional Services</strong>
            </div>
            <p v-if="lang === 'zh'">为对冲基金、家族办公室提供托管、清算、API对接服务</p>
            <p v-else>Custody, clearing, API integration for hedge funds and family offices</p>
          </div>
        </div>
      </section>

      <!-- 07 业务数据 -->
      <section id="chapter-07" class="section">
        <div class="chapter-head">
          <span class="chapter-num">07</span>
          <div>
            <div class="section-badge">CHAPTER 07</div>
            <h2 v-if="lang === 'zh'">业务数据</h2>
            <h2 v-else>Business Metrics</h2>
          </div>
        </div>

        <div class="data-grid">
          <div class="data-card">
            <span class="data-value">$50B<small>+</small></span>
            <span class="data-label" v-if="lang === 'zh'">日均交易量</span>
            <span class="data-label" v-else>Daily Volume</span>
          </div>
          <div class="data-card">
            <span class="data-value">2M<small>+</small></span>
            <span class="data-label" v-if="lang === 'zh'">注册用户</span>
            <span class="data-label" v-else>Users</span>
          </div>
          <div class="data-card">
            <span class="data-value">180<small>+</small></span>
            <span class="data-label" v-if="lang === 'zh'">覆盖国家</span>
            <span class="data-label" v-else>Countries</span>
          </div>
          <div class="data-card">
            <span class="data-value">$10B<small>+</small></span>
            <span class="data-label" v-if="lang === 'zh'">资产托管</span>
            <span class="data-label" v-else>AUM</span>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">季度增长趋势</h3>
        <h3 v-else>Quarterly Growth</h3>
        <div class="chart-area">
          <div class="chart-bar-group">
            <div class="chart-bar" style="--h: 60%"></div>
            <span>Q1</span>
          </div>
          <div class="chart-bar-group">
            <div class="chart-bar" style="--h: 75%"></div>
            <span>Q2</span>
          </div>
          <div class="chart-bar-group">
            <div class="chart-bar" style="--h: 85%"></div>
            <span>Q3</span>
          </div>
          <div class="chart-bar-group">
            <div class="chart-bar" style="--h: 100%"></div>
            <span>Q4</span>
          </div>
        </div>
      </section>

      <!-- 08 合规牌照 -->
      <section id="chapter-08" class="section alt">
        <div class="chapter-head">
          <span class="chapter-num">08</span>
          <div>
            <div class="section-badge">CHAPTER 08</div>
            <h2 v-if="lang === 'zh'">合规牌照</h2>
            <h2 v-else>Regulatory Licenses</h2>
          </div>
        </div>

        <div class="license-table">
          <div class="license-row">
            <span class="license-region">United States</span>
            <span class="license-name">MSB - Money Services Business</span>
            <span class="license-issuer">FinCEN</span>
          </div>
          <div class="license-row">
            <span class="license-region">Canada</span>
            <span class="license-name">MSB - Money Services Business</span>
            <span class="license-issuer">FINTRAC</span>
          </div>
          <div class="license-row">
            <span class="license-region">United Kingdom</span>
            <span class="license-name">EMI - Electronic Money Institution</span>
            <span class="license-issuer">FCA</span>
          </div>
          <div class="license-row">
            <span class="license-region">Australia</span>
            <span class="license-name">DCE - Digital Currency Exchange</span>
            <span class="license-issuer">AUSTRAC</span>
          </div>
        </div>

        <div class="text-block" v-if="lang === 'zh'">
          <p>集团始终坚持合规优先的经营理念，在全球主要金融市场取得监管牌照，确保业务运营符合当地法律法规要求。</p>
        </div>
        <div class="text-block" v-else>
          <p>The Group adheres to a compliance-first approach, obtaining regulatory licenses in major global financial markets to ensure operations comply with local laws and regulations.</p>
        </div>
      </section>

      <!-- 09 安全架构 -->
      <section id="chapter-09" class="section">
        <div class="chapter-head">
          <span class="chapter-num">09</span>
          <div>
            <div class="section-badge">CHAPTER 09</div>
            <h2 v-if="lang === 'zh'">安全架构</h2>
            <h2 v-else>Security Architecture</h2>
          </div>
        </div>

        <div class="security-list">
          <div class="security-item">
            <div class="sec-label">A</div>
            <strong v-if="lang === 'zh'">资产安全</strong>
            <strong v-else>Asset Security</strong>
            <span v-if="lang === 'zh'">95%冷钱包存储，多签机制，HSM硬件加密</span>
            <span v-else>95% cold wallet storage, multi-sig, HSM encryption</span>
          </div>
          <div class="security-item">
            <div class="sec-label">B</div>
            <strong v-if="lang === 'zh'">账户安全</strong>
            <strong v-else>Account Security</strong>
            <span v-if="lang === 'zh'">双因素认证，生物识别，异常登录预警</span>
            <span v-else>2FA, biometric auth, anomaly detection</span>
          </div>
          <div class="security-item">
            <div class="sec-label">C</div>
            <strong v-if="lang === 'zh'">系统安全</strong>
            <strong v-else>System Security</strong>
            <span v-if="lang === 'zh'">分布式架构，DDoS防护，渗透测试</span>
            <span v-else>Distributed architecture, DDoS protection, penetration testing</span>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">安全审计</h3>
        <h3 v-else>Security Audits</h3>
        <div class="audit-list">
          <div class="audit-item">
            <strong>CertiK</strong>
            <span v-if="lang === 'zh'">智能合约审计</span>
            <span v-else>Smart Contract Audit</span>
          </div>
          <div class="audit-item">
            <strong>SlowMist</strong>
            <span v-if="lang === 'zh'">安全审计</span>
            <span v-else>Security Audit</span>
          </div>
          <div class="audit-item">
            <strong>Hacken</strong>
            <span v-if="lang === 'zh'">渗透测试</span>
            <span v-else>Penetration Test</span>
          </div>
        </div>
      </section>

      <!-- 10 技术架构 -->
      <section id="chapter-10" class="section alt">
        <div class="chapter-head">
          <span class="chapter-num">10</span>
          <div>
            <div class="section-badge">CHAPTER 10</div>
            <h2 v-if="lang === 'zh'">技术架构</h2>
            <h2 v-else>Technical Architecture</h2>
          </div>
        </div>

        <div class="tech-stack">
          <div class="stack-row">
            <span class="stack-label" v-if="lang === 'zh'">应用层</span>
            <span class="stack-label" v-else>Application</span>
            <span class="stack-value">Web App · Mobile App · API Gateway</span>
          </div>
          <div class="stack-row">
            <span class="stack-label" v-if="lang === 'zh'">服务层</span>
            <span class="stack-label" v-else>Services</span>
            <span class="stack-value">Trading Engine · Risk Control · Settlement</span>
          </div>
          <div class="stack-row">
            <span class="stack-label" v-if="lang === 'zh'">数据层</span>
            <span class="stack-label" v-else>Data</span>
            <span class="stack-value">PostgreSQL · Redis · Kafka</span>
          </div>
          <div class="stack-row">
            <span class="stack-label" v-if="lang === 'zh'">区块链层</span>
            <span class="stack-label" v-else>Blockchain</span>
            <span class="stack-value">Ethereum · BSC · Solana</span>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">性能指标</h3>
        <h3 v-else>Performance</h3>
        <div class="perf-grid">
          <div class="perf-item">
            <span class="perf-value">99.99%</span>
            <span class="perf-label" v-if="lang === 'zh'">系统可用性</span>
            <span class="perf-label" v-else>Uptime SLA</span>
          </div>
          <div class="perf-item">
            <span class="perf-value">&lt;10ms</span>
            <span class="perf-label" v-if="lang === 'zh'">撮合延迟</span>
            <span class="perf-label" v-else>Latency</span>
          </div>
          <div class="perf-item">
            <span class="perf-value">1M+</span>
            <span class="perf-label" v-if="lang === 'zh'">TPS处理</span>
            <span class="perf-label" v-else>TPS</span>
          </div>
        </div>
      </section>

      <!-- 11 风险管理 -->
      <section id="chapter-11" class="section">
        <div class="chapter-head">
          <span class="chapter-num">11</span>
          <div>
            <div class="section-badge">CHAPTER 11</div>
            <h2 v-if="lang === 'zh'">风险管理</h2>
            <h2 v-else>Risk Management</h2>
          </div>
        </div>

        <div class="risk-list">
          <div class="risk-item">
            <div class="risk-num">01</div>
            <div class="risk-content">
              <strong v-if="lang === 'zh'">市场风险</strong>
              <strong v-else>Market Risk</strong>
              <p v-if="lang === 'zh'">实时监控市场波动，动态调整保证金比例，设置价格熔断机制</p>
              <p v-else>Real-time market monitoring, dynamic margin adjustment, circuit breaker mechanism</p>
            </div>
          </div>
          <div class="risk-item">
            <div class="risk-num">02</div>
            <div class="risk-content">
              <strong v-if="lang === 'zh'">信用风险</strong>
              <strong v-else>Credit Risk</strong>
              <p v-if="lang === 'zh'">严格KYC/AML审核，用户信用评级体系，超额抵押机制</p>
              <p v-else>Strict KYC/AML review, user credit rating system, over-collateralization</p>
            </div>
          </div>
          <div class="risk-item">
            <div class="risk-num">03</div>
            <div class="risk-content">
              <strong v-if="lang === 'zh'">操作风险</strong>
              <strong v-else>Operational Risk</strong>
              <p v-if="lang === 'zh'">多重审批流程，权限分离，操作日志追踪</p>
              <p v-else>Multi-level approval, segregation of duties, audit trail</p>
            </div>
          </div>
          <div class="risk-item">
            <div class="risk-num">04</div>
            <div class="risk-content">
              <strong v-if="lang === 'zh'">流动性风险</strong>
              <strong v-else>Liquidity Risk</strong>
              <p v-if="lang === 'zh'">充足储备金，做市商合作，跨交易所流动性聚合</p>
              <p v-else>Adequate reserves, market maker partnerships, cross-exchange liquidity</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 12 合规体系 -->
      <section id="chapter-12" class="section alt">
        <div class="chapter-head">
          <span class="chapter-num">12</span>
          <div>
            <div class="section-badge">CHAPTER 12</div>
            <h2 v-if="lang === 'zh'">合规体系</h2>
            <h2 v-else>Compliance Framework</h2>
          </div>
        </div>

        <div class="compliance-grid">
          <div class="compliance-item">
            <strong>KYC</strong>
            <span v-if="lang === 'zh'">身份验证 · 地址证明 · 资金来源</span>
            <span v-else>Identity · Address · Source of Funds</span>
          </div>
          <div class="compliance-item">
            <strong>AML</strong>
            <span v-if="lang === 'zh'">交易监控 · 可疑报告 · 制裁筛查</span>
            <span v-else>Transaction Monitoring · SAR · Sanctions</span>
          </div>
          <div class="compliance-item">
            <strong>CFT</strong>
            <span v-if="lang === 'zh'">资金追踪 · 风险评估 · 合规培训</span>
            <span v-else>Fund Tracing · Risk Assessment · Training</span>
          </div>
          <div class="compliance-item">
            <strong>GDPR</strong>
            <span v-if="lang === 'zh'">数据保护 · 隐私合规 · 用户权利</span>
            <span v-else>Data Protection · Privacy · User Rights</span>
          </div>
        </div>

        <div class="text-block" v-if="lang === 'zh'">
          <p>集团建立了完善的合规管理体系，设有独立的合规部门，配备专业合规人员超过50人。定期进行内部合规审计，并聘请外部律所进行合规评估。</p>
        </div>
        <div class="text-block" v-else>
          <p>The Group has established a comprehensive compliance management system with an independent compliance department staffed by over 50 professionals. Regular internal audits are conducted, and external law firms are engaged for compliance assessments.</p>
        </div>
      </section>

      <!-- 13 社会责任 -->
      <section id="chapter-13" class="section">
        <div class="chapter-head">
          <span class="chapter-num">13</span>
          <div>
            <div class="section-badge">CHAPTER 13</div>
            <h2 v-if="lang === 'zh'">社会责任</h2>
            <h2 v-else>Corporate Responsibility</h2>
          </div>
        </div>

        <div class="csr-list">
          <div class="csr-item">
            <div class="csr-num">01</div>
            <div class="csr-content">
              <strong v-if="lang === 'zh'">绿色运营</strong>
              <strong v-else>Green Operations</strong>
              <span v-if="lang === 'zh'">数据中心使用100%可再生能源，碳中和承诺</span>
              <span v-else>100% renewable energy data centers, carbon neutrality commitment</span>
            </div>
          </div>
          <div class="csr-item">
            <div class="csr-num">02</div>
            <div class="csr-content">
              <strong v-if="lang === 'zh'">教育普及</strong>
              <strong v-else>Education</strong>
              <span v-if="lang === 'zh'">区块链教育公益项目，已培训10万+学员</span>
              <span v-else>Blockchain education program, 100K+ students trained</span>
            </div>
          </div>
          <div class="csr-item">
            <div class="csr-num">03</div>
            <div class="csr-content">
              <strong v-if="lang === 'zh'">公益捐赠</strong>
              <strong v-else>Philanthropy</strong>
              <span v-if="lang === 'zh'">每年捐赠利润1%用于慈善事业</span>
              <span v-else>1% of annual profit donated to charity</span>
            </div>
          </div>
          <div class="csr-item">
            <div class="csr-num">04</div>
            <div class="csr-content">
              <strong v-if="lang === 'zh'">行业研究</strong>
              <strong v-else>Research</strong>
              <span v-if="lang === 'zh'">发布季度行业研究报告，推动行业健康发展</span>
              <span v-else>Quarterly industry reports for healthy sector growth</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 14 战略合作 -->
      <section id="chapter-14" class="section alt">
        <div class="chapter-head">
          <span class="chapter-num">14</span>
          <div>
            <div class="section-badge">CHAPTER 14</div>
            <h2 v-if="lang === 'zh'">战略合作</h2>
            <h2 v-else>Strategic Partners</h2>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">技术合作</h3>
        <h3 v-else>Technology</h3>
        <div class="partner-list">
          <div class="partner-item">AWS</div>
          <div class="partner-item">Google Cloud</div>
          <div class="partner-item">Chainlink</div>
        </div>

        <h3 v-if="lang === 'zh'">审计合作</h3>
        <h3 v-else>Audit</h3>
        <div class="partner-list">
          <div class="partner-item">CertiK</div>
          <div class="partner-item">SlowMist</div>
          <div class="partner-item">Hacken</div>
        </div>

        <h3 v-if="lang === 'zh'">法律合作</h3>
        <h3 v-else>Legal</h3>
        <div class="partner-list">
          <div class="partner-item">King & Wood</div>
          <div class="partner-item">Clifford Chance</div>
        </div>
      </section>

      <!-- 15 发展里程碑 -->
      <section id="chapter-15" class="section">
        <div class="chapter-head">
          <span class="chapter-num">15</span>
          <div>
            <div class="section-badge">CHAPTER 15</div>
            <h2 v-if="lang === 'zh'">发展里程碑</h2>
            <h2 v-else>Milestones</h2>
          </div>
        </div>

        <div class="timeline">
          <div class="timeline-item done">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <span class="timeline-date">2024 Q1</span>
              <strong v-if="lang === 'zh'">公司成立</strong>
              <strong v-else>Company Founded</strong>
              <p v-if="lang === 'zh'">开曼群岛注册，完成种子轮融资</p>
              <p v-else>Cayman Islands incorporation, seed funding</p>
            </div>
          </div>
          <div class="timeline-item done">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <span class="timeline-date">2024 Q2</span>
              <strong v-if="lang === 'zh'">平台上线</strong>
              <strong v-else>Platform Launch</strong>
              <p v-if="lang === 'zh'">交易平台正式上线，获得美国MSB牌照</p>
              <p v-else>Trading platform launch, US MSB license obtained</p>
            </div>
          </div>
          <div class="timeline-item done">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <span class="timeline-date">2024 Q4</span>
              <strong v-if="lang === 'zh'">全球扩张</strong>
              <strong v-else>Global Expansion</strong>
              <p v-if="lang === 'zh'">取得加拿大、澳大利亚牌照，用户突破100万</p>
              <p v-else>Canadian, Australian licenses, 1M users milestone</p>
            </div>
          </div>
          <div class="timeline-item current">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <span class="timeline-date">2025 Q2</span>
              <strong v-if="lang === 'zh'">AGX发布</strong>
              <strong v-else>AGX Launch</strong>
              <p v-if="lang === 'zh'">AGX黄金锚定代币正式发布</p>
              <p v-else>AGX gold-anchored token officially launched</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <span class="timeline-date">2025 Q4</span>
              <strong v-if="lang === 'zh'">英国牌照</strong>
              <strong v-else>UK FCA License</strong>
              <p v-if="lang === 'zh'">获得英国FCA电子货币机构牌照</p>
              <p v-else>UK FCA EMI license obtained</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 16 未来规划 -->
      <section id="chapter-16" class="section alt">
        <div class="chapter-head">
          <span class="chapter-num">16</span>
          <div>
            <div class="section-badge">CHAPTER 16</div>
            <h2 v-if="lang === 'zh'">未来规划</h2>
            <h2 v-else>Future Roadmap</h2>
          </div>
        </div>

        <div class="roadmap-list">
          <div class="roadmap-item">
            <div class="rm-year">2026</div>
            <ul v-if="lang === 'zh'">
              <li>日本FSA牌照申请</li>
              <li>机构托管服务升级</li>
              <li>AGX生态扩展</li>
            </ul>
            <ul v-else>
              <li>Japan FSA license application</li>
              <li>Institutional custody upgrade</li>
              <li>AGX ecosystem expansion</li>
            </ul>
          </div>
          <div class="roadmap-item">
            <div class="rm-year">2027</div>
            <ul v-if="lang === 'zh'">
              <li>欧盟MiCA合规</li>
              <li>用户突破1000万</li>
              <li>IPO筹备</li>
            </ul>
            <ul v-else>
              <li>EU MiCA compliance</li>
              <li>10M users milestone</li>
              <li>IPO preparation</li>
            </ul>
          </div>
          <div class="roadmap-item">
            <div class="rm-year">2028</div>
            <ul v-if="lang === 'zh'">
              <li>全球前十交易平台</li>
              <li>传统金融机构合作</li>
              <li>上市</li>
            </ul>
            <ul v-else>
              <li>Top 10 global exchange</li>
              <li>TradFi partnerships</li>
              <li>Public listing</li>
            </ul>
          </div>
        </div>
      </section>


      <!-- 18 免责声明 -->
      <section id="chapter-18" class="section alt">
        <div class="chapter-head">
          <span class="chapter-num">18</span>
          <div>
            <div class="section-badge">DISCLAIMER</div>
            <h2 v-if="lang === 'zh'">免责声明</h2>
            <h2 v-else>Legal Disclaimer</h2>
          </div>
        </div>

        <div class="text-block" v-if="lang === 'zh'">
          <p>本白皮书仅供信息参考之用，不构成任何投资建议、要约或承诺。</p>
          <p>本文件中包含的信息可能会随时更新，恕不另行通知。Ascenda Digital Capital Group 不对本文件中信息的准确性、完整性或及时性作任何明示或暗示的保证。</p>
          <p>数字资产投资存在重大风险，包括但不限于市场波动风险、监管风险、技术风险等。投资者应根据自身风险承受能力谨慎决策。</p>
          <p>本白皮书不针对任何禁止此类信息传播的司法管辖区的居民。在进行任何投资决策之前，请咨询您的法律、税务和财务顾问。</p>
        </div>
        <div class="text-block" v-else>
          <p>This whitepaper is for informational purposes only and does not constitute investment advice, an offer, or a commitment.</p>
          <p>Information contained herein may be updated at any time without notice. Ascenda Digital Capital Group makes no express or implied warranty as to the accuracy, completeness, or timeliness of the information.</p>
          <p>Digital asset investments carry significant risks including but not limited to market volatility, regulatory risks, and technical risks. Investors should make prudent decisions based on their own risk tolerance.</p>
          <p>This whitepaper is not intended for residents of any jurisdiction where such distribution is prohibited. Please consult your legal, tax, and financial advisors before making any investment decisions.</p>
        </div>

        <div class="copyright">
          <p>© 2026 Ascenda Digital Capital Group. All rights reserved.</p>
        </div>
      </section>

      <!-- 底部 -->
      <footer class="doc-footer">
        <div class="footer-line"></div>
        <span class="footer-text">Ascenda Digital Capital · Corporate Whitepaper v1.0 · January 2026</span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const lang = ref('zh')

const tocZh = [
  { name: '公司概述' },
  { name: '愿景与使命' },
  { name: '组织架构' },
  { name: '管理团队' },
  { name: '董事会成员' },
  { name: '核心业务' },
  { name: '业务数据' },
  { name: '合规牌照' },
  { name: '安全架构' },
  { name: '技术架构' },
  { name: '风险管理' },
  { name: '合规体系' },
  { name: '社会责任' },
  { name: '战略合作' },
  { name: '发展里程碑' },
  { name: '未来规划' },
  { name: '免责声明' }
]

const tocEn = [
  { name: 'Company Overview' },
  { name: 'Vision & Mission' },
  { name: 'Corporate Structure' },
  { name: 'Leadership Team' },
  { name: 'Board of Directors' },
  { name: 'Core Business' },
  { name: 'Business Metrics' },
  { name: 'Regulatory Licenses' },
  { name: 'Security Architecture' },
  { name: 'Technical Architecture' },
  { name: 'Risk Management' },
  { name: 'Compliance Framework' },
  { name: 'Corporate Responsibility' },
  { name: 'Strategic Partners' },
  { name: 'Milestones' },
  { name: 'Future Roadmap' },
  { name: 'Legal Disclaimer' }
]

const scrollToChapter = (chapterId) => {
  const el = document.getElementById(chapterId)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const shareDoc = () => {
  if (navigator.share) {
    navigator.share({
      title: 'Ascenda Digital Capital - Corporate Whitepaper',
      text: '升达数字资本集团白皮书',
      url: window.location.href
    })
  }
}
</script>

<style scoped>
.whitepaper-page {
  min-height: 100vh;
  background: var(--bg-card, #FFFFFF);
  color: var(--text-heading, #1a1a1a);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* 水印层 */
.watermark-layer {
  position: fixed;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  width: 200%;
  height: 200%;
  pointer-events: none;
  z-index: 0;
  transform: rotate(-25deg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.watermark-row {
  display: flex;
  white-space: nowrap;
  margin: 45px 0;
}

.watermark-text {
  font-size: 14px;
  font-weight: 600;
  color: rgba(139, 115, 85, 0.06);
  letter-spacing: 3px;
  padding: 0 60px;
  user-select: none;
}

/* 内容层 */
.content {
  position: relative;
  z-index: 2;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  height: 52px;
  padding: 0 16px;
  padding-top: env(safe-area-inset-top);
  background: rgba(255,255,255,0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color, #e5e5e5);
}

.back-btn, .action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-brand, #D4AF6E);
}

.back-btn svg, .action-btn svg { width: 20px; height: 20px; }

/* 语言切换 */
.lang-switch {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 4px;
  background: var(--bg-warm, #f0ebe3);
  padding: 3px;
  border-radius: 8px;
}

.lang-btn {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-brand-dark, #8B7355);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-btn.active {
  color: var(--text-heading, #1a1a1a);
  background: var(--bg-card, #fff);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Cover */
.cover {
  position: relative;
  z-index: 3;
  padding: 60px 24px 48px;
  background: linear-gradient(180deg, var(--bg-cover, #f9f7f4) 0%, var(--bg-card, #FFFFFF) 100%);
  text-align: center;
  overflow: hidden;
  border-bottom: 1px solid var(--border-color, #e5e5e5);
}

.cover-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(139,115,85,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139,115,85,0.04) 1px, transparent 1px);
  background-size: 32px 32px;
}

.cover-inner { position: relative; z-index: 1; }

.cover-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--color-brand, #D4AF6E);
  letter-spacing: 3px;
  border: 1.5px solid var(--color-brand, #D4AF6E);
  padding: 8px 24px;
  border-radius: 2px;
  margin-bottom: 32px;
}

.cover-logo {
  width: 100px;
  height: 100px;
  margin: 0 auto 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 8px 24px rgba(139,115,85,0.3));
}

.cover h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-heading, #1a1a1a);
  margin: 0;
  letter-spacing: 2px;
}

.cover-sub {
  font-size: 13px;
  color: var(--color-brand, #D4AF6E);
  letter-spacing: 6px;
  margin: 8px 0 0;
  font-weight: 500;
}

.cover-divider {
  width: 48px;
  height: 2px;
  background: var(--color-brand, #D4AF6E);
  margin: 32px auto;
}

.cover-tagline {
  font-size: 15px;
  color: var(--text-body, #444);
  line-height: 1.9;
  margin: 0;
  font-weight: 400;
}

.cover-info {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 32px;
  font-size: 11px;
  color: var(--text-muted, #888);
  letter-spacing: 1px;
}

/* Section base */
.section {
  padding: 36px 24px;
  background: var(--bg-card, #FFFFFF);
  border-bottom: 1px solid var(--border-color, #e5e5e5);
}

.section.alt {
  background: var(--bg-secondary, #f8f9fa);
}

.section.toc {
  background: var(--bg-secondary, #f8f9fa);
}

.section-badge {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-brand, #D4AF6E);
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}

.section h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-heading, #1a1a1a);
  margin: 0 0 20px;
  letter-spacing: 0.5px;
}

.section h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-brand, #D4AF6E);
  margin: 28px 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(139,115,85,0.15);
}

.chapter-head {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(212,175,110,0.08) 0%, rgba(212,175,110,0.02) 100%);
  border-radius: 12px;
  border-left: 3px solid rgba(212,175,110,0.4);
}

.chapter-num {
  font-size: 36px;
  font-weight: 800;
  color: var(--color-brand, #D4AF6E);
  line-height: 1;
  opacity: 0.3;
}

.text-block {
  margin-bottom: 20px;
}

.text-block p {
  font-size: 15px;
  color: var(--text-body, #333);
  line-height: 1.85;
  margin: 0 0 14px;
  letter-spacing: 0.2px;
  font-weight: 500;
}

.text-block strong { color: var(--color-brand, #D4AF6E); font-weight: 600; }

.text-block ul {
  margin: 12px 0;
  padding-left: 20px;
}

.text-block li {
  font-size: 15px;
  color: var(--text-body, #333);
  line-height: 1.8;
  margin-bottom: 10px;
  font-weight: 500;
}

/* TOC */
.toc-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.toc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toc-item:active {
  background: var(--bg-hover, #f5f5f5);
  transform: scale(0.98);
}

.toc-num {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-on-brand, #fff);
  background: var(--color-brand, #D4AF6E);
  border-radius: 6px;
  flex-shrink: 0;
}

.toc-title {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-heading, #1a1a1a);
}

.toc-arrow {
  font-size: 14px;
  color: var(--text-disabled, #999);
  font-weight: 300;
}

/* Info table */
.info-table {
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 10px;
  overflow: hidden;
  margin: 16px 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color, #e5e5e5);
  font-size: 13px;
}

.info-row:last-child { border-bottom: none; }
.info-row span:first-child { color: var(--text-caption, #666); }
.info-row span:last-child { color: var(--text-body, #333); font-weight: 600; }

/* Highlights */
.highlights-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.highlight-box {
  padding: 20px 16px;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 4px;
  border-left: 3px solid var(--color-brand, #D4AF6E);
}

.hl-num {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-brand, #D4AF6E);
  font-family: Georgia, serif;
  margin-bottom: 10px;
  opacity: 0.7;
}

.highlight-box strong {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-heading, #1a1a1a);
  margin-bottom: 6px;
}

.highlight-box span {
  font-size: 12px;
  color: var(--text-caption, #666);
  line-height: 1.5;
  font-weight: 500;
}

/* Org table */
.org-table {
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 10px;
  overflow: hidden;
  margin: 16px 0;
}

.org-row {
  display: flex;
  flex-direction: column;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color, #e5e5e5);
}

.org-row:last-child { border-bottom: none; }

.org-row.main {
  background: linear-gradient(135deg, rgba(212,175,110,0.1), rgba(212,175,110,0.02));
}

.org-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-heading, #1a1a1a);
}

.org-desc {
  font-size: 12px;
  color: var(--text-caption, #666);
  margin-top: 2px;
}

.org-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-brand, #D4AF6E), transparent);
  margin: 0 16px;
}

/* Team list */
.team-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.team-item {
  padding: 16px;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 10px;
}

.team-role {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-brand, #D4AF6E);
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.team-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-heading, #1a1a1a);
}

.team-title {
  font-size: 13px;
  color: var(--text-caption, #666);
  margin-top: 2px;
}

.team-bio {
  font-size: 12px;
  color: var(--text-muted, #888);
  margin-top: 8px;
  line-height: 1.5;
}

/* Feature cards */
.feature-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 16px 0;
}

.feature-card {
  padding: 18px 16px;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 4px;
}

.fc-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.fc-label {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-brand, #D4AF6E);
  border: 1.5px solid var(--color-brand, #D4AF6E);
  border-radius: 4px;
  font-family: Georgia, serif;
}

.fc-header strong {
  font-size: 14px;
  color: var(--text-heading, #1a1a1a);
}

.feature-card p {
  font-size: 13px;
  color: var(--text-secondary, #555);
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
}

/* Data grid */
.data-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 16px 0;
}

.data-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  background: rgba(201,169,110,0.1);
  border-radius: 10px;
}

.data-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-brand, #D4AF6E);
}

.data-value small { font-size: 11px; font-weight: 500; }

.data-label {
  font-size: 10px;
  color: var(--text-caption, #666);
  margin-top: 4px;
}

/* Chart */
.chart-area {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 24px;
  height: 140px;
  padding: 16px;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 10px;
  margin: 16px 0;
}

.chart-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.chart-bar {
  width: 40px;
  height: var(--h);
  background: linear-gradient(180deg, var(--color-brand, #D4AF6E), rgba(212,175,110,0.4));
  border-radius: 4px 4px 0 0;
}

.chart-bar-group span {
  font-size: 11px;
  color: var(--text-caption, #666);
  font-weight: 600;
}

/* License table */
.license-table {
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 10px;
  overflow: hidden;
  margin: 16px 0;
}

.license-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr auto;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color, #e5e5e5);
  align-items: center;
}

.license-row:last-child { border-bottom: none; }

.license-region {
  font-size: 12px;
  color: var(--text-caption, #666);
}

.license-name {
  font-size: 12px;
  color: var(--text-heading, #1a1a1a);
  font-weight: 500;
}

.license-issuer {
  font-size: 11px;
  color: var(--color-brand, #D4AF6E);
  font-weight: 600;
}

/* Security list */
.security-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
}

.security-item {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 14px 16px;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 10px;
  align-items: center;
}

.sec-label {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-on-brand, #fff);
  background: var(--color-brand, #D4AF6E);
  border-radius: 6px;
}

.security-item strong {
  font-size: 14px;
  color: var(--text-heading, #1a1a1a);
}

.security-item span {
  flex: 1 1 100%;
  font-size: 12px;
  color: var(--text-caption, #666);
  padding-left: 38px;
}

/* Audit list */
.audit-list {
  display: flex;
  gap: 12px;
  margin: 16px 0;
}

.audit-item {
  flex: 1;
  padding: 14px;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 10px;
  text-align: center;
}

.audit-item strong {
  display: block;
  font-size: 13px;
  color: var(--color-brand, #D4AF6E);
  margin-bottom: 4px;
}

.audit-item span {
  font-size: 11px;
  color: var(--text-caption, #666);
}

/* Tech stack */
.tech-stack {
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 10px;
  overflow: hidden;
  margin: 16px 0;
}

.stack-row {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color, #e5e5e5);
}

.stack-row:last-child { border-bottom: none; }

.stack-label {
  width: 80px;
  font-size: 12px;
  color: var(--color-brand, #D4AF6E);
  font-weight: 600;
}

.stack-value {
  flex: 1;
  font-size: 12px;
  color: var(--text-body, #333);
}

/* Perf grid */
.perf-grid {
  display: flex;
  gap: 12px;
  margin: 16px 0;
}

.perf-item {
  flex: 1;
  padding: 16px;
  background: rgba(201,169,110,0.1);
  border-radius: 10px;
  text-align: center;
}

.perf-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-brand, #D4AF6E);
}

.perf-label {
  font-size: 11px;
  color: var(--text-caption, #666);
  margin-top: 4px;
}

/* Risk list */
.risk-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.risk-item {
  display: flex;
  gap: 14px;
  padding: 16px;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 10px;
}

.risk-num {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-on-brand, #fff);
  background: var(--color-brand, #D4AF6E);
  border-radius: 8px;
  flex-shrink: 0;
}

.risk-content strong {
  display: block;
  font-size: 14px;
  color: var(--text-heading, #1a1a1a);
  margin-bottom: 4px;
}

.risk-content p {
  font-size: 12px;
  color: var(--text-caption, #666);
  margin: 0;
  line-height: 1.5;
}

/* Compliance grid */
.compliance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 16px 0;
}

.compliance-item {
  padding: 16px;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 10px;
  text-align: center;
}

.compliance-item strong {
  display: block;
  font-size: 18px;
  color: var(--color-brand, #D4AF6E);
  margin-bottom: 6px;
}

.compliance-item span {
  font-size: 11px;
  color: var(--text-caption, #666);
  line-height: 1.6;
}

/* CSR list */
.csr-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.csr-item {
  display: flex;
  gap: 14px;
  padding: 16px;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 10px;
}

.csr-num {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-brand, #D4AF6E);
  border: 1.5px solid var(--color-brand, #D4AF6E);
  border-radius: 8px;
  flex-shrink: 0;
}

.csr-content strong {
  display: block;
  font-size: 14px;
  color: var(--text-heading, #1a1a1a);
  margin-bottom: 4px;
}

.csr-content span {
  font-size: 12px;
  color: var(--text-caption, #666);
  line-height: 1.5;
}

/* Partner list */
.partner-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0 20px;
}

.partner-item {
  padding: 10px 16px;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-body, #333);
}

/* Timeline */
.timeline {
  position: relative;
  padding-left: 24px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, var(--color-brand, #D4AF6E), rgba(212,175,110,0.2));
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;
}

.timeline-marker {
  position: absolute;
  left: -22px;
  top: 4px;
  width: 10px;
  height: 10px;
  background: var(--color-brand, #D4AF6E);
  border-radius: 50%;
}

.timeline-item.done .timeline-marker {
  background: var(--color-brand, #D4AF6E);
}

.timeline-item.current .timeline-marker {
  background: var(--bg-card, #fff);
  border: 2px solid var(--color-brand, #D4AF6E);
  box-shadow: 0 0 0 4px rgba(212,175,110,0.2);
}

.timeline-item:not(.done):not(.current) .timeline-marker {
  background: var(--border-color, #e5e5e5);
}

.timeline-date {
  font-size: 11px;
  color: var(--color-brand, #D4AF6E);
  font-weight: 600;
  margin-bottom: 4px;
}

.timeline-content strong {
  display: block;
  font-size: 14px;
  color: var(--text-heading, #1a1a1a);
  margin-bottom: 4px;
}

.timeline-content p {
  font-size: 12px;
  color: var(--text-caption, #666);
  margin: 0;
}

/* Roadmap list */
.roadmap-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.roadmap-item {
  padding: 20px;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 10px;
}

.rm-year {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-brand, #D4AF6E);
  margin-bottom: 12px;
}

.roadmap-item ul {
  margin: 0;
  padding-left: 20px;
}

.roadmap-item li {
  font-size: 13px;
  color: var(--text-body, #333);
  margin-bottom: 8px;
  line-height: 1.5;
}

/* Contact list */
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  padding: 14px 16px;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 10px;
}

.contact-item strong {
  display: block;
  font-size: 12px;
  color: var(--color-brand, #D4AF6E);
  margin-bottom: 4px;
}

.contact-item span {
  font-size: 13px;
  color: var(--text-body, #333);
  line-height: 1.5;
}

/* Copyright */
.copyright {
  margin-top: 24px;
  text-align: center;
}

.copyright p {
  font-size: 12px;
  color: var(--text-muted, #888);
  margin: 0;
}

/* Footer */
.doc-footer {
  padding: 24px;
  text-align: center;
}

.footer-line {
  width: 48px;
  height: 2px;
  background: var(--color-brand, #D4AF6E);
  margin: 0 auto 16px;
}

.footer-text {
  font-size: 11px;
  color: var(--text-muted, #888);
  letter-spacing: 1px;
}
</style>
