<template>
  <div class="whitepaper-page">
    <!-- 水印层 -->
    <div class="watermark-layer">
      <div class="watermark-row" v-for="row in 12" :key="row">
        <span class="watermark-text" v-for="col in 6" :key="col">Ascenda Research</span>
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

    <div class="content" ref="contentRef">
      <!-- 幻灯片介绍区域 -->
      <section class="slideshow-section animate-section" :class="{ visible: visibleSections.cover }">
        <div class="slideshow-canvas">
          <!-- 第一页: AGX概述 -->
          <div class="slide-page" v-show="slidePage === 1">
            <svg class="slide-svg" viewBox="0 0 400 420">
              <text x="200" y="35" class="slide-main-title" text-anchor="middle">AGX 升达金指币</text>
              <text x="200" y="55" class="slide-subtitle" text-anchor="middle">Gold-Backed Digital Asset</text>
              
              <g class="slide-group" :class="{ active: slideStep >= 1 }">
                <rect class="slide-box" x="50" y="80" width="300" height="50" rx="5" />
                <text x="200" y="110" class="slide-text" text-anchor="middle">"黄金背书的数字资产"</text>
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 2 }">
                <path class="slide-line" d="M80 160 L80 220 L160 220 L160 160 Z" />
                <path class="slide-line" d="M80 160 L120 130 L160 160" />
                <path class="slide-line" d="M95 175 L95 220 M120 175 L120 220 M145 175 L145 220" />
                <text x="120" y="245" class="slide-label" text-anchor="middle">美联储</text>
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 2 }">
                <path class="slide-arrow" d="M170 190 L210 190" marker-end="url(#arrow1)" />
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 3 }">
                <path class="slide-line gold-line" d="M230 170 L290 170 L300 190 L290 210 L230 210 L220 190 Z" />
                <path class="slide-line gold-line" d="M235 180 L285 180 M235 200 L285 200" />
                <text x="260" y="245" class="slide-label" text-anchor="middle">黄金储备</text>
                <text x="260" y="260" class="slide-label-sub" text-anchor="middle">8,133 吨</text>
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 3 }">
                <path class="slide-arrow" d="M310 190 L340 190" marker-end="url(#arrow1)" />
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 4 }">
                <circle class="slide-line token-line" cx="370" cy="190" r="25" />
                <text x="370" y="195" class="slide-token" text-anchor="middle">AGX</text>
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 5 }">
                <rect class="slide-box highlight-box" x="80" y="290" width="240" height="70" rx="8" />
                <text x="200" y="320" class="slide-big-num" text-anchor="middle">$ 5,891 亿</text>
                <text x="200" y="345" class="slide-label-sub" text-anchor="middle">美联储黄金储备总价值 · 全球第一</text>
              </g>
              
              <defs>
                <marker id="arrow1" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#D4AF6E" />
                </marker>
              </defs>
            </svg>
          </div>
          
          <!-- 第二页: GIB机制 -->
          <div class="slide-page" v-show="slidePage === 2">
            <svg class="slide-svg" viewBox="0 0 400 420">
              <text x="200" y="35" class="slide-main-title" text-anchor="middle">GIB 价值锚定机制</text>
              
              <g class="slide-group" :class="{ active: slideStep >= 6 }">
                <rect class="slide-box" x="60" y="60" width="280" height="60" rx="5" />
                <text x="200" y="95" class="slide-formula" text-anchor="middle">GIB = (R × P × W) / S</text>
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 7 }">
                <text x="80" y="155" class="slide-param"><tspan class="param-key">R</tspan> = 黄金储备量 (吨)</text>
                <text x="80" y="185" class="slide-param"><tspan class="param-key">P</tspan> = 黄金现货价 ($/oz)</text>
                <text x="80" y="215" class="slide-param"><tspan class="param-key">W</tspan> = 权重系数</text>
                <text x="80" y="245" class="slide-param"><tspan class="param-key">S</tspan> = AGX总供应量</text>
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 8 }">
                <text x="200" y="290" class="slide-section-title" text-anchor="middle">数据来源</text>
                <rect class="slide-source-box" x="40" y="305" width="100" height="50" rx="5" />
                <text x="90" y="335" class="slide-source" text-anchor="middle">Fed</text>
                <rect class="slide-source-box" x="150" y="305" width="100" height="50" rx="5" />
                <text x="200" y="335" class="slide-source" text-anchor="middle">LBMA</text>
                <rect class="slide-source-box" x="260" y="305" width="100" height="50" rx="5" />
                <text x="310" y="335" class="slide-source" text-anchor="middle">BLS</text>
                <text x="90" y="370" class="slide-label-sub" text-anchor="middle">储备数据</text>
                <text x="200" y="370" class="slide-label-sub" text-anchor="middle">金价数据</text>
                <text x="310" y="370" class="slide-label-sub" text-anchor="middle">CPI数据</text>
              </g>
            </svg>
          </div>
          
          <!-- 第三页: 技术架构 -->
          <div class="slide-page" v-show="slidePage === 3">
            <svg class="slide-svg" viewBox="0 0 400 420">
              <text x="200" y="35" class="slide-main-title" text-anchor="middle">技术架构</text>
              
              <g class="slide-group" :class="{ active: slideStep >= 9 }">
                <rect class="slide-arch-box" x="120" y="60" width="160" height="40" rx="5" />
                <text x="200" y="85" class="slide-arch-text" text-anchor="middle">数据源层</text>
                <path class="slide-arrow-down" d="M200 100 L200 125" marker-end="url(#arrow1)" />
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 10 }">
                <rect class="slide-arch-box oracle-box" x="120" y="130" width="160" height="40" rx="5" />
                <text x="200" y="155" class="slide-arch-text" text-anchor="middle">AGX Oracle 预言机</text>
                <path class="slide-arrow-down" d="M200 170 L200 195" marker-end="url(#arrow1)" />
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 11 }">
                <rect class="slide-arch-box contract-box" x="120" y="200" width="160" height="40" rx="5" />
                <text x="200" y="225" class="slide-arch-text" text-anchor="middle">GIB 智能合约</text>
                <path class="slide-arrow-down" d="M200 240 L200 265" marker-end="url(#arrow1)" />
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 11 }">
                <rect class="slide-arch-box token-box" x="120" y="270" width="160" height="40" rx="5" />
                <text x="200" y="295" class="slide-arch-text" text-anchor="middle">AGX Token</text>
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 12 }">
                <text x="60" y="345" class="slide-point">✓ TRON网络</text>
                <text x="60" y="370" class="slide-point">✓ 实时同步</text>
                <text x="220" y="345" class="slide-point">✓ 链上透明</text>
                <text x="220" y="370" class="slide-point">✓ 安全审计</text>
              </g>
            </svg>
          </div>
          
          <!-- 第四页: 投资价值 -->
          <div class="slide-page" v-show="slidePage === 4">
            <svg class="slide-svg" viewBox="0 0 400 420">
              <text x="200" y="35" class="slide-main-title" text-anchor="middle">投资价值</text>
              
              <g class="slide-group" :class="{ active: slideStep >= 13 }">
                <rect class="slide-value-box" x="40" y="70" width="150" height="80" rx="8" />
                <text x="115" y="100" class="slide-value-icon" text-anchor="middle">🎯</text>
                <text x="115" y="125" class="slide-value-title" text-anchor="middle">真实资产支撑</text>
                <text x="115" y="140" class="slide-value-desc" text-anchor="middle">非空气币</text>
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 13 }">
                <rect class="slide-value-box" x="210" y="70" width="150" height="80" rx="8" />
                <text x="285" y="100" class="slide-value-icon" text-anchor="middle">🛡️</text>
                <text x="285" y="125" class="slide-value-title" text-anchor="middle">抗通胀属性</text>
                <text x="285" y="140" class="slide-value-desc" text-anchor="middle">黄金保值</text>
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 14 }">
                <rect class="slide-value-box" x="40" y="170" width="150" height="80" rx="8" />
                <text x="115" y="200" class="slide-value-icon" text-anchor="middle">🔍</text>
                <text x="115" y="225" class="slide-value-title" text-anchor="middle">透明可验证</text>
                <text x="115" y="240" class="slide-value-desc" text-anchor="middle">链上公开</text>
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 14 }">
                <rect class="slide-value-box" x="210" y="170" width="150" height="80" rx="8" />
                <text x="285" y="200" class="slide-value-icon" text-anchor="middle">⚡</text>
                <text x="285" y="225" class="slide-value-title" text-anchor="middle">即时流通</text>
                <text x="285" y="240" class="slide-value-desc" text-anchor="middle">全球交易</text>
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 15 }">
                <rect class="slide-box highlight-box" x="80" y="270" width="240" height="55" rx="8" />
                <text x="200" y="295" class="slide-label" text-anchor="middle">历史增值空间</text>
                <text x="200" y="315" class="slide-label-sub" text-anchor="middle">对标黄金ETF 20年增长超600%</text>
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 16 }">
                <text x="80" y="355" class="slide-point">vs 比特币: 更稳定</text>
                <text x="80" y="375" class="slide-point">vs 稳定币: 有增值</text>
                <text x="220" y="355" class="slide-point">vs 黄金: 更便捷</text>
                <text x="220" y="375" class="slide-point">vs 股票: 更透明</text>
              </g>
            </svg>
          </div>
          
          <!-- 第五页: AGX生态 -->
          <div class="slide-page" v-show="slidePage === 5">
            <svg class="slide-svg" viewBox="0 0 400 420">
              <text x="200" y="35" class="slide-main-title" text-anchor="middle">AGX 生态系统</text>
              
              <g class="slide-group" :class="{ active: slideStep >= 17 }">
                <circle class="slide-line token-line" cx="200" cy="150" r="40" />
                <text x="200" y="155" class="slide-token" text-anchor="middle">AGX</text>
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 18 }">
                <rect class="slide-eco-box" x="30" y="90" width="80" height="40" rx="5" />
                <text x="70" y="115" class="slide-eco-text" text-anchor="middle">理财矿池</text>
                <path class="slide-arrow" d="M110 110 L155 130" marker-end="url(#arrow1)" />
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 18 }">
                <rect class="slide-eco-box" x="290" y="90" width="80" height="40" rx="5" />
                <text x="330" y="115" class="slide-eco-text" text-anchor="middle">OTC交易</text>
                <path class="slide-arrow" d="M290 110 L245 130" marker-end="url(#arrow1)" />
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 19 }">
                <rect class="slide-eco-box" x="30" y="170" width="80" height="40" rx="5" />
                <text x="70" y="195" class="slide-eco-text" text-anchor="middle">合约交易</text>
                <path class="slide-arrow" d="M110 185 L160 165" marker-end="url(#arrow1)" />
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 19 }">
                <rect class="slide-eco-box" x="290" y="170" width="80" height="40" rx="5" />
                <text x="330" y="195" class="slide-eco-text" text-anchor="middle">会员体系</text>
                <path class="slide-arrow" d="M290 185 L240 165" marker-end="url(#arrow1)" />
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 20 }">
                <text x="200" y="250" class="slide-section-title" text-anchor="middle">持币收益</text>
                <rect class="slide-source-box" x="50" y="265" width="90" height="50" rx="5" />
                <text x="95" y="295" class="slide-source" text-anchor="middle">活期</text>
                <text x="95" y="310" class="slide-label-sub" text-anchor="middle">年化3-5%</text>
                
                <rect class="slide-source-box" x="155" y="265" width="90" height="50" rx="5" />
                <text x="200" y="295" class="slide-source" text-anchor="middle">定期</text>
                <text x="200" y="310" class="slide-label-sub" text-anchor="middle">年化8-15%</text>
                
                <rect class="slide-source-box" x="260" y="265" width="90" height="50" rx="5" />
                <text x="305" y="295" class="slide-source" text-anchor="middle">推广</text>
                <text x="305" y="310" class="slide-label-sub" text-anchor="middle">额外奖励</text>
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 20 }">
                <text x="60" y="360" class="slide-point">✓ 多元收益渠道</text>
                <text x="60" y="385" class="slide-point">✓ 灵活期限选择</text>
                <text x="220" y="360" class="slide-point">✓ 复利增值</text>
                <text x="220" y="385" class="slide-point">✓ 随时可查</text>
              </g>
            </svg>
          </div>
          
          <!-- 第六页: 认购指南 -->
          <div class="slide-page" v-show="slidePage === 6">
            <svg class="slide-svg" viewBox="0 0 400 420">
              <text x="200" y="35" class="slide-main-title" text-anchor="middle">如何认购 AGX</text>
              
              <g class="slide-group" :class="{ active: slideStep >= 21 }">
                <circle class="slide-step-circle" cx="70" cy="90" r="25" />
                <text x="70" y="95" class="slide-step-num" text-anchor="middle">1</text>
                <text x="70" y="130" class="slide-label" text-anchor="middle">注册账户</text>
                <text x="70" y="145" class="slide-label-sub" text-anchor="middle">手机/邮箱</text>
                <path class="slide-arrow" d="M100 90 L140 90" marker-end="url(#arrow1)" />
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 21 }">
                <circle class="slide-step-circle" cx="200" cy="90" r="25" />
                <text x="200" y="95" class="slide-step-num" text-anchor="middle">2</text>
                <text x="200" y="130" class="slide-label" text-anchor="middle">实名认证</text>
                <text x="200" y="145" class="slide-label-sub" text-anchor="middle">KYC验证</text>
                <path class="slide-arrow" d="M230 90 L270 90" marker-end="url(#arrow1)" />
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 22 }">
                <circle class="slide-step-circle" cx="330" cy="90" r="25" />
                <text x="330" y="95" class="slide-step-num" text-anchor="middle">3</text>
                <text x="330" y="130" class="slide-label" text-anchor="middle">充值USDT</text>
                <text x="330" y="145" class="slide-label-sub" text-anchor="middle">TRC20网络</text>
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 22 }">
                <path class="slide-arrow-down" d="M330 155 L330 175 L70 175 L70 195" />
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 23 }">
                <circle class="slide-step-circle" cx="70" cy="220" r="25" />
                <text x="70" y="225" class="slide-step-num" text-anchor="middle">4</text>
                <text x="70" y="260" class="slide-label" text-anchor="middle">购买AGX</text>
                <text x="70" y="275" class="slide-label-sub" text-anchor="middle">选择数量</text>
                <path class="slide-arrow" d="M100 220 L140 220" marker-end="url(#arrow1)" />
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 23 }">
                <circle class="slide-step-circle highlight" cx="200" cy="220" r="25" />
                <text x="200" y="225" class="slide-step-num" text-anchor="middle">5</text>
                <text x="200" y="260" class="slide-label" text-anchor="middle">开始持有</text>
                <text x="200" y="275" class="slide-label-sub" text-anchor="middle">坐享收益</text>
              </g>
              
              <g class="slide-group" :class="{ active: slideStep >= 24 }">
                <rect class="slide-box highlight-box" x="80" y="300" width="240" height="70" rx="8" />
                <text x="200" y="325" class="slide-label" text-anchor="middle">首发价格</text>
                <text x="200" y="355" class="slide-price" text-anchor="middle">$0.065</text>
              </g>
            </svg>
          </div>
          
          <!-- 页码指示器 -->
          <div class="slide-indicators">
            <span v-for="p in 6" :key="p" :class="['slide-indicator', { active: slidePage === p }]" @click="goToSlidePage(p)"></span>
          </div>
          
          <!-- 控制按钮 -->
          <div class="slide-controls">
            <button class="slide-ctrl-btn" @click="prevSlidePage" :disabled="slidePage === 1">上一页</button>
            <span class="slide-page-num">{{ slidePage }} / 6</span>
            <button class="slide-ctrl-btn primary" @click="nextSlidePage">{{ slidePage === 6 ? '继续阅读' : '下一页' }}</button>
          </div>
        </div>
      </section>

      <!-- 封面 -->
      <section class="cover animate-section" :class="{ visible: visibleSections.cover }">
        <div class="cover-pattern"></div>
        <div class="cover-inner">
          <div class="cover-badge animate-item" style="--delay: 0.1s">WHITE PAPER</div>
          <img src="/agx-new.png" class="cover-logo animate-item" style="--delay: 0.2s" alt="AGX">
          <h1 class="animate-item" style="--delay: 0.3s">AGX</h1>
          <p class="cover-sub animate-item" style="--delay: 0.4s">Gold Index Token</p>
          <div class="cover-divider animate-item" style="--delay: 0.5s"></div>
          <p class="cover-tagline animate-item" style="--delay: 0.6s" v-if="lang === 'zh'">首款锚定美联储黄金储备的区块链数字金票<br>通过GIB指数实现黄金价值的链上映射</p>
          <p class="cover-tagline animate-item" style="--delay: 0.6s" v-else>The First Blockchain Digital Gold Note Anchored to<br>Federal Reserve Gold Reserves via GIB Index</p>
          <div class="cover-info animate-item" style="--delay: 0.7s">
            <span>Version 3.0</span>
            <span>January 2026</span>
            <span>Ascenda</span>
          </div>
        </div>
      </section>

      <!-- 执行摘要 -->
      <section class="section animate-section" :class="{ visible: visibleSections.summary }">
        <div class="section-badge">EXECUTIVE SUMMARY</div>
        <h2 v-if="lang === 'zh'">执行摘要</h2>
        <h2 v-else>Executive Summary</h2>
        <div class="text-block" v-if="lang === 'zh'">
          <p>AGX（升达金指币）是<strong>全球首个</strong>将美国联邦储备系统黄金储备价值通过<strong>GIB（Gold Index Binding）机制</strong>映射至区块链的数字资产。</p>
          <p>区别于传统稳定币的单一锚定模式，AGX创新性地采用<strong>五维宏观经济指标</strong>动态追踪黄金真实价值，为投资者提供透明、可验证、抗通胀的数字黄金敞口。</p>
          <p>在全球去美元化浪潮加速的背景下，AGX为机构和个人投资者提供了一种全新的数字黄金配置工具，兼具传统黄金的避险属性和区块链资产的流动性优势。</p>
        </div>
        <div class="text-block" v-else>
          <p>AGX (Ascenda Gold Index Token) is <strong>the world's first</strong> digital asset that maps the value of the U.S. Federal Reserve gold reserves to blockchain through the <strong>GIB (Gold Index Binding) mechanism</strong>.</p>
          <p>Unlike traditional stablecoins with single-anchor models, AGX innovatively employs <strong>five-dimensional macroeconomic indicators</strong> to dynamically track real gold value, providing investors with transparent, verifiable, and inflation-resistant digital gold exposure.</p>
          <p>Amid the accelerating global de-dollarization trend, AGX offers institutional and individual investors a new digital gold allocation tool that combines traditional gold's safe-haven properties with blockchain asset liquidity.</p>
        </div>
        <div class="highlights-grid">
          <div class="highlight-box">
            <div class="hl-num">01</div>
            <strong v-if="lang === 'zh'">储备锚定</strong>
            <strong v-else>Reserve Anchoring</strong>
            <span v-if="lang === 'zh'">美联储8,133.5吨黄金储备价值背书</span>
            <span v-else>Backed by 8,133.5 tons of Fed gold reserves</span>
          </div>
          <div class="highlight-box">
            <div class="hl-num">02</div>
            <strong v-if="lang === 'zh'">动态定价</strong>
            <strong v-else>Dynamic Pricing</strong>
            <span v-if="lang === 'zh'">GIB五维宏观指数实时追踪</span>
            <span v-else>Real-time GIB 5D macro index tracking</span>
          </div>
          <div class="highlight-box">
            <div class="hl-num">03</div>
            <strong v-if="lang === 'zh'">链上透明</strong>
            <strong v-else>On-chain Transparency</strong>
            <span v-if="lang === 'zh'">Merkle Proof可验证储备证明</span>
            <span v-else>Merkle Proof verifiable reserve proof</span>
          </div>
          <div class="highlight-box">
            <div class="hl-num">04</div>
            <strong v-if="lang === 'zh'">全球流通</strong>
            <strong v-else>Global Circulation</strong>
            <span v-if="lang === 'zh'">跨链部署，秒级跨境结算</span>
            <span v-else>Cross-chain deployment, instant settlement</span>
          </div>
        </div>
      </section>

      <!-- 目录 -->
      <section class="section toc animate-section" :class="{ visible: visibleSections.toc }">
        <div class="section-badge">TABLE OF CONTENTS</div>
        <h2 v-if="lang === 'zh'">目录</h2>
        <h2 v-else>Contents</h2>
        <div class="toc-list" v-if="lang === 'zh'">
          <div class="toc-item" @click="scrollToChapter('chapter-01')"><span class="toc-num">01</span><span class="toc-title">市场背景与机遇</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-02')"><span class="toc-num">02</span><span class="toc-title">AGX 产品概述</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-03')"><span class="toc-num">03</span><span class="toc-title">整体架构设计</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-04')"><span class="toc-num">04</span><span class="toc-title">GIB 指数机制</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-05')"><span class="toc-num">05</span><span class="toc-title">三层锚定架构</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-06')"><span class="toc-num">06</span><span class="toc-title">代币经济模型</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-07')"><span class="toc-num">07</span><span class="toc-title">黄金账户系统</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-08')"><span class="toc-num">08</span><span class="toc-title">代币分发与激励</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-09')"><span class="toc-num">09</span><span class="toc-title">生态应用场景</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-10')"><span class="toc-num">10</span><span class="toc-title">技术架构</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-11')"><span class="toc-num">11</span><span class="toc-title">安全与审计</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-12')"><span class="toc-num">12</span><span class="toc-title">合规与治理</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-13')"><span class="toc-num">13</span><span class="toc-title">发展路线图</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-14')"><span class="toc-num">14</span><span class="toc-title">团队与顾问</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-15')"><span class="toc-num">15</span><span class="toc-title">合作伙伴</span><span class="toc-arrow">›</span></div>
        </div>
        <div class="toc-list" v-else>
          <div class="toc-item" @click="scrollToChapter('chapter-01')"><span class="toc-num">01</span><span class="toc-title">Market Background</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-02')"><span class="toc-num">02</span><span class="toc-title">AGX Product Overview</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-03')"><span class="toc-num">03</span><span class="toc-title">Architecture Design</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-04')"><span class="toc-num">04</span><span class="toc-title">GIB Index Mechanism</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-05')"><span class="toc-num">05</span><span class="toc-title">Three-Layer Anchoring</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-06')"><span class="toc-num">06</span><span class="toc-title">Token Economics</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-07')"><span class="toc-num">07</span><span class="toc-title">Gold Account System</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-08')"><span class="toc-num">08</span><span class="toc-title">Token Distribution</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-09')"><span class="toc-num">09</span><span class="toc-title">Ecosystem Applications</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-10')"><span class="toc-num">10</span><span class="toc-title">Technical Architecture</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-11')"><span class="toc-num">11</span><span class="toc-title">Security & Audit</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-12')"><span class="toc-num">12</span><span class="toc-title">Compliance & Governance</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-13')"><span class="toc-num">13</span><span class="toc-title">Roadmap</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-14')"><span class="toc-num">14</span><span class="toc-title">Team & Advisors</span><span class="toc-arrow">›</span></div>
          <div class="toc-item" @click="scrollToChapter('chapter-15')"><span class="toc-num">15</span><span class="toc-title">Partners</span><span class="toc-arrow">›</span></div>
        </div>
      </section>

      <!-- 01 市场背景 -->
      <section id="chapter-01" class="section dark animate-section" :class="{ visible: visibleSections['chapter-01'] }">
        <div class="chapter-head">
          <span class="chapter-num">01</span>
          <div>
            <div class="section-badge light">CHAPTER 01</div>
            <h2 v-if="lang === 'zh'">市场背景与机遇</h2>
            <h2 v-else>Market Background & Opportunities</h2>
          </div>
        </div>
        
        <h3 v-if="lang === 'zh'">1.1 全球黄金市场现状</h3>
        <h3 v-else>1.1 Global Gold Market Overview</h3>
        <div class="text-block light" v-if="lang === 'zh'">
          <p>黄金作为人类历史上最古老的价值储存手段，在当今金融体系中仍扮演着不可替代的角色。根据世界黄金协会数据，全球黄金总存量约为201,296吨，其中：</p>
        </div>
        <div class="text-block light" v-else>
          <p>Gold, as humanity's oldest store of value, continues to play an irreplaceable role in today's financial system. According to World Gold Council data, global gold reserves total approximately 201,296 tons, distributed as follows:</p>
        </div>
        <div class="data-grid">
          <div class="data-card">
            <span class="data-value">47%</span>
            <span class="data-label" v-if="lang === 'zh'">珠宝首饰</span>
            <span class="data-label" v-else>Jewelry</span>
          </div>
          <div class="data-card">
            <span class="data-value">22%</span>
            <span class="data-label" v-if="lang === 'zh'">私人投资</span>
            <span class="data-label" v-else>Private Investment</span>
          </div>
          <div class="data-card">
            <span class="data-value">17%</span>
            <span class="data-label" v-if="lang === 'zh'">央行储备</span>
            <span class="data-label" v-else>Central Bank</span>
          </div>
          <div class="data-card">
            <span class="data-value">14%</span>
            <span class="data-label" v-if="lang === 'zh'">工业应用</span>
            <span class="data-label" v-else>Industrial</span>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">1.2 去美元化浪潮</h3>
        <h3 v-else>1.2 De-dollarization Wave</h3>
        <div class="text-block light" v-if="lang === 'zh'">
          <p>2023年以来，全球去美元化趋势显著加速。根据国际货币基金组织（IMF）数据，美元在全球外汇储备中的份额已从2000年的72%下降至2023年的58%。</p>
          <p>与此同时，全球央行持续增持黄金储备：</p>
        </div>
        <div class="text-block light" v-else>
          <p>Since 2023, the global de-dollarization trend has accelerated significantly. According to IMF data, the US dollar's share of global foreign exchange reserves has declined from 72% in 2000 to 58% in 2023.</p>
          <p>Meanwhile, central banks worldwide continue to increase their gold reserves:</p>
        </div>
        <div class="info-table">
          <div class="info-row">
            <span v-if="lang === 'zh'">2022年央行净购金</span>
            <span v-else>2022 Central Bank Net Purchases</span>
            <span class="highlight">1,136 tons</span>
          </div>
          <div class="info-row">
            <span v-if="lang === 'zh'">2023年央行净购金</span>
            <span v-else>2023 Central Bank Net Purchases</span>
            <span class="highlight">1,037 tons</span>
          </div>
          <div class="info-row">
            <span v-if="lang === 'zh'">中国央行黄金储备</span>
            <span v-else>China Central Bank Reserves</span>
            <span>2,235 tons</span>
          </div>
          <div class="info-row">
            <span v-if="lang === 'zh'">俄罗斯央行黄金储备</span>
            <span v-else>Russia Central Bank Reserves</span>
            <span>2,333 tons</span>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">1.3 数字黄金市场空白</h3>
        <h3 v-else>1.3 Digital Gold Market Gap</h3>
        <div class="text-block light" v-if="lang === 'zh'">
          <p>尽管黄金ETF和实物黄金投资已相当成熟，但数字黄金领域仍存在显著空白：</p>
        </div>
        <div class="text-block light" v-else>
          <p>While gold ETFs and physical gold investments are mature, the digital gold sector still has significant gaps:</p>
        </div>
        <div class="problem-list">
          <div class="problem-item">
            <span class="problem-icon">!</span>
            <div class="problem-text">
              <strong v-if="lang === 'zh'">流动性受限</strong>
              <strong v-else>Limited Liquidity</strong>
              <span v-if="lang === 'zh'">传统黄金T+2结算，跨境转移成本高昂</span>
              <span v-else>Traditional gold T+2 settlement, high cross-border transfer costs</span>
            </div>
          </div>
          <div class="problem-item">
            <span class="problem-icon">!</span>
            <div class="problem-text">
              <strong v-if="lang === 'zh'">门槛较高</strong>
              <strong v-else>High Barrier</strong>
              <span v-if="lang === 'zh'">实物黄金最小购买单位通常为1盎司</span>
              <span v-else>Minimum physical gold purchase usually 1 ounce</span>
            </div>
          </div>
          <div class="problem-item">
            <span class="problem-icon">!</span>
            <div class="problem-text">
              <strong v-if="lang === 'zh'">透明度不足</strong>
              <strong v-else>Lack of Transparency</strong>
              <span v-if="lang === 'zh'">现有黄金代币缺乏可验证的储备证明</span>
              <span v-else>Existing gold tokens lack verifiable reserve proof</span>
            </div>
          </div>
          <div class="problem-item">
            <span class="problem-icon">!</span>
            <div class="problem-text">
              <strong v-if="lang === 'zh'">DeFi不兼容</strong>
              <strong v-else>DeFi Incompatible</strong>
              <span v-if="lang === 'zh'">传统黄金无法参与链上金融生态</span>
              <span v-else>Traditional gold cannot participate in on-chain finance</span>
            </div>
          </div>
        </div>

        <div class="callout-box">
          <strong v-if="lang === 'zh'">AGX的机遇</strong>
          <strong v-else>AGX Opportunity</strong>
          <p v-if="lang === 'zh'">AGX正是为填补这一市场空白而生，通过GIB机制将美联储黄金储备价值映射到区块链，为全球投资者提供透明、高效、可编程的数字黄金敞口。</p>
          <p v-else>AGX is designed to fill this market gap, mapping Federal Reserve gold reserve value to blockchain through the GIB mechanism, providing global investors with transparent, efficient, and programmable digital gold exposure.</p>
        </div>
      </section>

      <!-- 02 产品概述 -->
      <section id="chapter-02" class="section animate-section" :class="{ visible: visibleSections['chapter-02'] }">
        <div class="chapter-head">
          <span class="chapter-num">02</span>
          <div>
            <div class="section-badge">CHAPTER 02</div>
            <h2 v-if="lang === 'zh'">AGX 产品概述</h2>
            <h2 v-else>AGX Product Overview</h2>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">2.1 什么是AGX</h3>
        <h3 v-else>2.1 What is AGX</h3>
        <div class="text-block" v-if="lang === 'zh'">
          <p>AGX（升达金指币）是一种创新型数字资产，其核心价值锚定于美联储黄金储备。通过独创的GIB（Gold Index Binding）机制，AGX实现了与实物黄金价值的动态绑定。</p>
        </div>
        <div class="text-block" v-else>
          <p>AGX (Ascenda Gold Index Token) is an innovative digital asset with its core value anchored to Federal Reserve gold reserves. Through the proprietary GIB (Gold Index Binding) mechanism, AGX achieves dynamic binding with physical gold value.</p>
        </div>

        <div class="feature-cards">
          <div class="feature-card">
            <div class="fc-header">
              <span class="fc-label">A</span>
              <strong v-if="lang === 'zh'">价值锚定</strong>
              <strong v-else>Value Anchoring</strong>
            </div>
            <p v-if="lang === 'zh'">AGX价值锚定美联储8,133.5吨黄金储备，通过GIB指数实现动态追踪</p>
            <p v-else>AGX value anchored to Fed's 8,133.5 tons gold reserves, tracked via GIB index</p>
          </div>
          <div class="feature-card">
            <div class="fc-header">
              <span class="fc-label">B</span>
              <strong v-if="lang === 'zh'">动态定价</strong>
              <strong v-else>Dynamic Pricing</strong>
            </div>
            <p v-if="lang === 'zh'">基于五大宏观经济指标的加权计算，反映真实黄金市场状况</p>
            <p v-else>Weighted calculation based on 5 macroeconomic indicators reflecting real gold market</p>
          </div>
          <div class="feature-card">
            <div class="fc-header">
              <span class="fc-label">C</span>
              <strong v-if="lang === 'zh'">生态激励</strong>
              <strong v-else>Ecosystem Incentives</strong>
            </div>
            <p v-if="lang === 'zh'">持有AGX可参与代币分发机制，获得生态建设激励</p>
            <p v-else>AGX holders can participate in token distribution and receive ecosystem rewards</p>
          </div>
          <div class="feature-card">
            <div class="fc-header">
              <span class="fc-label">D</span>
              <strong v-if="lang === 'zh'">全球流通</strong>
              <strong v-else>Global Circulation</strong>
            </div>
            <p v-if="lang === 'zh'">基于ERC-20标准，支持跨链部署，实现秒级跨境结算</p>
            <p v-else>Based on ERC-20, supports cross-chain deployment with instant settlement</p>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">2.2 核心参数</h3>
        <h3 v-else>2.2 Core Parameters</h3>
        <div class="params-table">
          <div class="param-row">
            <span class="param-key" v-if="lang === 'zh'">代币名称</span>
            <span class="param-key" v-else>Token Name</span>
            <span class="param-val">AGX Token</span>
          </div>
          <div class="param-row">
            <span class="param-key" v-if="lang === 'zh'">代币符号</span>
            <span class="param-key" v-else>Token Symbol</span>
            <span class="param-val">AGX</span>
          </div>
          <div class="param-row">
            <span class="param-key" v-if="lang === 'zh'">合约标准</span>
            <span class="param-key" v-else>Contract Standard</span>
            <span class="param-val">ERC-20 / BEP-20</span>
          </div>
          <div class="param-row">
            <span class="param-key" v-if="lang === 'zh'">总发行量</span>
            <span class="param-key" v-else>Total Supply</span>
            <span class="param-val">21,000,000 AGX</span>
          </div>
          <div class="param-row">
            <span class="param-key" v-if="lang === 'zh'">发行价格</span>
            <span class="param-key" v-else>Issue Price</span>
            <span class="param-val">1 AGX = 0.065 USDT</span>
          </div>
          <div class="param-row">
            <span class="param-key" v-if="lang === 'zh'">部署网络</span>
            <span class="param-key" v-else>Networks</span>
            <span class="param-val">Ethereum · BSC · Polygon</span>
          </div>
          <div class="param-row">
            <span class="param-key" v-if="lang === 'zh'">精度</span>
            <span class="param-key" v-else>Decimals</span>
            <span class="param-val">18</span>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">2.3 AGX vs 传统黄金投资</h3>
        <h3 v-else>2.3 AGX vs Traditional Gold</h3>
        <div class="compare-table">
          <div class="compare-header">
            <span></span>
            <span>AGX</span>
            <span v-if="lang === 'zh'">黄金ETF</span>
            <span v-else>Gold ETF</span>
            <span v-if="lang === 'zh'">实物黄金</span>
            <span v-else>Physical Gold</span>
          </div>
          <div class="compare-row">
            <span v-if="lang === 'zh'">结算时间</span>
            <span v-else>Settlement</span>
            <span class="good">&lt;3s</span>
            <span>T+2</span>
            <span>1-7d</span>
          </div>
          <div class="compare-row">
            <span v-if="lang === 'zh'">最小投资</span>
            <span v-else>Min Investment</span>
            <span class="good">$1</span>
            <span>$50+</span>
            <span>$2,000+</span>
          </div>
          <div class="compare-row">
            <span v-if="lang === 'zh'">交易时间</span>
            <span v-else>Trading Hours</span>
            <span class="good">24/7</span>
            <span v-if="lang === 'zh'">交易日</span>
            <span v-else>Trading Days</span>
            <span v-if="lang === 'zh'">营业时间</span>
            <span v-else>Business Hours</span>
          </div>
          <div class="compare-row">
            <span v-if="lang === 'zh'">跨境转移</span>
            <span v-else>Cross-border</span>
            <span class="good" v-if="lang === 'zh'">即时</span>
            <span class="good" v-else>Instant</span>
            <span v-if="lang === 'zh'">受限</span>
            <span v-else>Limited</span>
            <span v-if="lang === 'zh'">复杂</span>
            <span v-else>Complex</span>
          </div>
          <div class="compare-row">
            <span v-if="lang === 'zh'">DeFi兼容</span>
            <span v-else>DeFi Compatible</span>
            <span class="good">✓</span>
            <span>✗</span>
            <span>✗</span>
          </div>
          <div class="compare-row">
            <span v-if="lang === 'zh'">储备透明</span>
            <span v-else>Transparency</span>
            <span class="good" v-if="lang === 'zh'">链上可验证</span>
            <span class="good" v-else>On-chain Verifiable</span>
            <span v-if="lang === 'zh'">定期报告</span>
            <span v-else>Periodic Reports</span>
            <span v-if="lang === 'zh'">托管证明</span>
            <span v-else>Custody Proof</span>
          </div>
        </div>
      </section>

      <!-- 03 整体架构 -->
      <section id="chapter-03" class="section alt animate-section" :class="{ visible: visibleSections['chapter-03'] }">
        <div class="chapter-head">
          <span class="chapter-num">03</span>
          <div>
            <div class="section-badge">CHAPTER 03</div>
            <h2 v-if="lang === 'zh'">整体架构设计</h2>
            <h2 v-else>Architecture Design</h2>
          </div>
        </div>

        <div class="text-block" v-if="lang === 'zh'">
          <p>AGX采用三层架构设计，从数据源层到指数计算层再到资产发行层，构建了完整的黄金价值数字化映射体系。</p>
        </div>
        <div class="text-block" v-else>
          <p>AGX adopts a three-layer architecture design, from data source layer to index calculation layer to asset issuance layer, building a complete gold value digital mapping system.</p>
        </div>

        <div class="arch-diagram">
          <div class="arch-layer">
            <div class="layer-tag" v-if="lang === 'zh'">Layer 1 · 数据源层</div>
            <div class="layer-tag" v-else>Layer 1 · Data Source</div>
            <div class="arch-box green">
              <div class="ab-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg></div>
              <div class="ab-content">
                <strong v-if="lang === 'zh'">美联储黄金储备</strong>
                <strong v-else>Fed Gold Reserves</strong>
                <span v-if="lang === 'zh'">8,133.5 吨 · 估值 $4,800亿+</span>
                <span v-else>8,133.5 tons · Value $480B+</span>
              </div>
            </div>
            <div class="arch-sources">
              <span v-if="lang === 'zh'">FT900报表</span>
              <span v-else>FT900 Report</span>
              <span v-if="lang === 'zh'">H.4.1报表</span>
              <span v-else>H.4.1 Report</span>
              <span v-if="lang === 'zh'">LBMA金价</span>
              <span v-else>LBMA Price</span>
              <span v-if="lang === 'zh'">WGC数据</span>
              <span v-else>WGC Data</span>
            </div>
          </div>

          <div class="arch-connector">
            <div class="connector-line"></div>
            <span v-if="lang === 'zh'">数据采集 · 15min</span>
            <span v-else>Data Collection · 15min</span>
          </div>

          <div class="arch-layer">
            <div class="layer-tag" v-if="lang === 'zh'">Layer 2 · 指数计算层</div>
            <div class="layer-tag" v-else>Layer 2 · Index Calculation</div>
            <div class="arch-box blue">
              <div class="ab-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
              <div class="ab-content">
                <strong v-if="lang === 'zh'">GIB 黄金指数绑定系统</strong>
                <strong v-else>GIB Gold Index Binding System</strong>
                <span v-if="lang === 'zh'">五维宏观指标 · 加权计算 · 实时更新</span>
                <span v-else>5D Macro Indicators · Weighted · Real-time</span>
              </div>
            </div>
            <div class="arch-indicators">
              <div class="ind-item">
                <span v-if="lang === 'zh'">黄金持仓</span>
                <span v-else>Gold Holdings</span>
                <span>25%</span>
              </div>
              <div class="ind-item">
                <span v-if="lang === 'zh'">LBMA金价</span>
                <span v-else>LBMA Price</span>
                <span>30%</span>
              </div>
              <div class="ind-item">
                <span v-if="lang === 'zh'">实际利率</span>
                <span v-else>Real Rate</span>
                <span>20%</span>
              </div>
              <div class="ind-item">
                <span v-if="lang === 'zh'">央行购金</span>
                <span v-else>CB Buying</span>
                <span>15%</span>
              </div>
              <div class="ind-item">
                <span v-if="lang === 'zh'">CPI通胀</span>
                <span v-else>CPI Inflation</span>
                <span>10%</span>
              </div>
            </div>
          </div>

          <div class="arch-connector">
            <div class="connector-line"></div>
            <span v-if="lang === 'zh'">链上同步 · Oracle</span>
            <span v-else>On-chain Sync · Oracle</span>
          </div>

          <div class="arch-layer">
            <div class="layer-tag" v-if="lang === 'zh'">Layer 3 · 资产发行层</div>
            <div class="layer-tag" v-else>Layer 3 · Asset Issuance</div>
            <div class="arch-box gold">
              <div class="ab-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M15 9.5a3 3 0 0 0-3-2.5H9"/></svg></div>
              <div class="ab-content">
                <strong v-if="lang === 'zh'">AGX 数字金票</strong>
                <strong v-else>AGX Digital Gold Note</strong>
                <span v-if="lang === 'zh'">ERC-20标准 · 跨链部署 · 全球流通</span>
                <span v-else>ERC-20 · Cross-chain · Global Circulation</span>
              </div>
            </div>
            <div class="arch-networks">
              <span>Ethereum</span>
              <span>BSC</span>
              <span>Polygon</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 04 GIB机制 -->
      <section id="chapter-04" class="section dark animate-section" :class="{ visible: visibleSections['chapter-04'] }">
        <div class="chapter-head">
          <span class="chapter-num">04</span>
          <div>
            <div class="section-badge light">CHAPTER 04</div>
            <h2 v-if="lang === 'zh'">GIB 指数机制</h2>
            <h2 v-else>GIB Index Mechanism</h2>
          </div>
        </div>

        <div class="text-block light" v-if="lang === 'zh'">
          <p>GIB（Gold Index Binding）是AGX的核心创新机制，通过综合五大宏观经济指标的加权计算，实现AGX与实物黄金价值的动态绑定。</p>
        </div>
        <div class="text-block light" v-else>
          <p>GIB (Gold Index Binding) is AGX's core innovation mechanism, achieving dynamic binding between AGX and physical gold value through weighted calculation of five macroeconomic indicators.</p>
        </div>

        <div class="formula-display">
          <div class="formula-label">GIB INDEX FORMULA</div>
          <div class="formula-equation">
            <span class="formula-gib">GIB</span>
            <span class="formula-equals">=</span>
            <span class="formula-sigma">Σ</span>
            <div class="formula-fraction">
              <span class="frac-top">W<sub>i</sub> × I<sub>i</sub></span>
              <span class="frac-bar"></span>
              <span class="frac-bottom">N</span>
            </div>
          </div>
          <div class="formula-vars" v-if="lang === 'zh'">
            <span><strong>W<sub>i</sub></strong> = 指标权重</span>
            <span><strong>I<sub>i</sub></strong> = 标准化指标值</span>
            <span><strong>N</strong> = 归一化因子</span>
          </div>
          <div class="formula-vars" v-else>
            <span><strong>W<sub>i</sub></strong> = Indicator Weight</span>
            <span><strong>I<sub>i</sub></strong> = Normalized Value</span>
            <span><strong>N</strong> = Normalization Factor</span>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">4.1 五大宏观经济指标</h3>
        <h3 v-else>4.1 Five Macroeconomic Indicators</h3>

        <div class="indicator-cards">
          <div class="indicator-card">
            <div class="ic-header">
              <span class="ic-rank">1</span>
              <div class="ic-weight"><div class="weight-bar" style="--w:83%"></div><span>25%</span></div>
            </div>
            <strong v-if="lang === 'zh'">美联储黄金持仓量</strong>
            <strong v-else>Fed Gold Holdings</strong>
            <p v-if="lang === 'zh'">基于美联储资产负债表中的黄金存量数据。当前持仓约8,133.5吨，为全球最大官方黄金储备。</p>
            <p v-else>Based on gold inventory data from Fed balance sheet. Current holdings ~8,133.5 tons, the world's largest official gold reserve.</p>
            <div class="ic-meta">
              <span>Federal Reserve H.4.1</span>
              <span v-if="lang === 'zh'">周度更新</span>
              <span v-else>Weekly Update</span>
            </div>
          </div>

          <div class="indicator-card">
            <div class="ic-header">
              <span class="ic-rank">2</span>
              <div class="ic-weight"><div class="weight-bar" style="--w:100%"></div><span>30%</span></div>
            </div>
            <strong v-if="lang === 'zh'">LBMA黄金现货价格</strong>
            <strong v-else>LBMA Gold Spot Price</strong>
            <p v-if="lang === 'zh'">伦敦金银市场协会每日定盘价，全球黄金交易的核心参考价格，日均交易量超$300亿。</p>
            <p v-else>London Bullion Market Association daily fixing price, core reference for global gold trading, daily volume exceeds $30B.</p>
            <div class="ic-meta">
              <span>LBMA Gold Price PM</span>
              <span v-if="lang === 'zh'">日度更新</span>
              <span v-else>Daily Update</span>
            </div>
          </div>

          <div class="indicator-card">
            <div class="ic-header">
              <span class="ic-rank">3</span>
              <div class="ic-weight"><div class="weight-bar" style="--w:67%"></div><span>20%</span></div>
            </div>
            <strong v-if="lang === 'zh'">美国实际利率</strong>
            <strong v-else>US Real Interest Rate</strong>
            <p v-if="lang === 'zh'">10年期美债收益率减去核心PCE通胀率。实际利率与金价呈显著负相关，是预测金价的关键指标。</p>
            <p v-else>10-year Treasury yield minus core PCE inflation. Real rates are negatively correlated with gold prices, a key predictor.</p>
            <div class="ic-meta">
              <span>US Treasury + BEA</span>
              <span v-if="lang === 'zh'">月度更新</span>
              <span v-else>Monthly Update</span>
            </div>
          </div>

          <div class="indicator-card">
            <div class="ic-header">
              <span class="ic-rank">4</span>
              <div class="ic-weight"><div class="weight-bar" style="--w:50%"></div><span>15%</span></div>
            </div>
            <strong v-if="lang === 'zh'">全球央行购金趋势</strong>
            <strong v-else>Central Bank Gold Buying</strong>
            <p v-if="lang === 'zh'">追踪全球央行黄金净购买量。2023年净购金超1,000吨，连续第二年创历史新高。</p>
            <p v-else>Tracks global central bank net gold purchases. 2023 net purchases exceeded 1,000 tons, a record high for second year.</p>
            <div class="ic-meta">
              <span>World Gold Council</span>
              <span v-if="lang === 'zh'">季度更新</span>
              <span v-else>Quarterly Update</span>
            </div>
          </div>

          <div class="indicator-card">
            <div class="ic-header">
              <span class="ic-rank">5</span>
              <div class="ic-weight"><div class="weight-bar" style="--w:33%"></div><span>10%</span></div>
            </div>
            <strong v-if="lang === 'zh'">美国CPI通胀率</strong>
            <strong v-else>US CPI Inflation Rate</strong>
            <p v-if="lang === 'zh'">消费者物价指数同比变化率。黄金作为抗通胀资产，其价值与通胀预期密切相关。</p>
            <p v-else>Consumer Price Index year-over-year change. Gold as an inflation hedge, its value is closely tied to inflation expectations.</p>
            <div class="ic-meta">
              <span>Bureau of Labor Statistics</span>
              <span v-if="lang === 'zh'">月度更新</span>
              <span v-else>Monthly Update</span>
            </div>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">4.2 GIB机制优势</h3>
        <h3 v-else>4.2 GIB Mechanism Advantages</h3>
        <div class="advantages-list">
          <div class="adv-row">
            <div class="adv-icon">✓</div>
            <div class="adv-text">
              <strong v-if="lang === 'zh'">去中心化定价</strong>
              <strong v-else>Decentralized Pricing</strong>
              <span v-if="lang === 'zh'">基于公开宏观数据，无单一定价主体，避免人为操纵</span>
              <span v-else>Based on public macro data, no single pricing entity, prevents manipulation</span>
            </div>
          </div>
          <div class="adv-row">
            <div class="adv-icon">✓</div>
            <div class="adv-text">
              <strong v-if="lang === 'zh'">动态平衡</strong>
              <strong v-else>Dynamic Balance</strong>
              <span v-if="lang === 'zh'">多指标加权，平滑单一因素波动，更真实反映黄金价值</span>
              <span v-else>Multi-indicator weighting smooths single factor volatility, reflects true gold value</span>
            </div>
          </div>
          <div class="adv-row">
            <div class="adv-icon">✓</div>
            <div class="adv-text">
              <strong v-if="lang === 'zh'">透明可验证</strong>
              <strong v-else>Transparent & Verifiable</strong>
              <span v-if="lang === 'zh'">所有数据源公开，算法开源可审计，计算过程链上存证</span>
              <span v-else>All data sources public, algorithm open-source auditable, calculations on-chain</span>
            </div>
          </div>
          <div class="adv-row">
            <div class="adv-icon">✓</div>
            <div class="adv-text">
              <strong v-if="lang === 'zh'">抗操纵性</strong>
              <strong v-else>Manipulation Resistant</strong>
              <span v-if="lang === 'zh'">采用多时间窗口平滑机制，防止短期价格操纵</span>
              <span v-else>Uses multi-timeframe smoothing mechanism to prevent short-term manipulation</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 05 三层锚定 -->
      <section id="chapter-05" class="section animate-section" :class="{ visible: visibleSections['chapter-05'] }">
        <div class="chapter-head">
          <span class="chapter-num">05</span>
          <div>
            <div class="section-badge">CHAPTER 05</div>
            <h2 v-if="lang === 'zh'">三层锚定架构</h2>
            <h2 v-else>Three-Layer Anchoring</h2>
          </div>
        </div>

        <div class="text-block" v-if="lang === 'zh'">
          <p>AGX采用三层锚定架构，从储备证明、指数追踪到套利平衡，建立与实物黄金的可验证价值关联，确保代币价格始终锚定真实黄金价值。</p>
        </div>
        <div class="text-block" v-else>
          <p>AGX employs a three-layer anchoring architecture, from reserve proof to index tracking to arbitrage balance, establishing verifiable value linkage with physical gold.</p>
        </div>

        <div class="anchor-layers">
          <div class="anchor-box">
            <div class="anchor-header">
              <span class="anchor-tag">LAYER 1</span>
              <h4 v-if="lang === 'zh'">储备证明层</h4>
              <h4 v-else>Reserve Proof Layer</h4>
            </div>
            <p v-if="lang === 'zh'">通过第三方审计机构定期验证底层黄金储备，发布Proof of Reserves链上证明，确保每枚AGX都有对应的黄金价值支撑。</p>
            <p v-else>Regular verification of underlying gold reserves by third-party auditors, publishing Proof of Reserves on-chain to ensure every AGX is backed by gold value.</p>
            <div class="anchor-specs">
              <div class="spec-item">
                <em v-if="lang === 'zh'">审计机构</em>
                <em v-else>Auditors</em>
                <strong>CertiK · SlowMist</strong>
              </div>
              <div class="spec-item">
                <em v-if="lang === 'zh'">审计频率</em>
                <em v-else>Frequency</em>
                <strong v-if="lang === 'zh'">月度</strong>
                <strong v-else>Monthly</strong>
              </div>
              <div class="spec-item">
                <em v-if="lang === 'zh'">证明方式</em>
                <em v-else>Proof Method</em>
                <strong>Merkle Proof</strong>
              </div>
            </div>
          </div>

          <div class="layer-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
          </div>

          <div class="anchor-box">
            <div class="anchor-header">
              <span class="anchor-tag">LAYER 2</span>
              <h4 v-if="lang === 'zh'">指数追踪层</h4>
              <h4 v-else>Index Tracking Layer</h4>
            </div>
            <p v-if="lang === 'zh'">GIB指数实时追踪五大宏观指标，通过Chainlink预言机将指数值同步至智能合约，实现价格的自动调整。</p>
            <p v-else>GIB index tracks five macro indicators in real-time, syncing index values to smart contracts via Chainlink oracle for automatic price adjustment.</p>
            <div class="anchor-specs">
              <div class="spec-item">
                <em v-if="lang === 'zh'">预言机</em>
                <em v-else>Oracle</em>
                <strong>Chainlink</strong>
              </div>
              <div class="spec-item">
                <em v-if="lang === 'zh'">更新频率</em>
                <em v-else>Update</em>
                <strong>15min</strong>
              </div>
              <div class="spec-item">
                <em v-if="lang === 'zh'">节点数量</em>
                <em v-else>Nodes</em>
                <strong>21</strong>
              </div>
            </div>
          </div>

          <div class="layer-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
          </div>

          <div class="anchor-box">
            <div class="anchor-header">
              <span class="anchor-tag">LAYER 3</span>
              <h4 v-if="lang === 'zh'">套利平衡层</h4>
              <h4 v-else>Arbitrage Balance Layer</h4>
            </div>
            <p v-if="lang === 'zh'">当AGX市场价格偏离GIB指数时，套利机制自动触发，通过铸造/销毁机制将价格拉回锚定区间。</p>
            <p v-else>When AGX market price deviates from GIB index, arbitrage mechanism triggers automatically, pulling price back through mint/burn mechanism.</p>
            <div class="anchor-specs">
              <div class="spec-item">
                <em v-if="lang === 'zh'">偏离阈值</em>
                <em v-else>Threshold</em>
                <strong>±1.5%</strong>
              </div>
              <div class="spec-item">
                <em v-if="lang === 'zh'">响应时间</em>
                <em v-else>Response</em>
                <strong>&lt;5min</strong>
              </div>
              <div class="spec-item">
                <em v-if="lang === 'zh'">套利激励</em>
                <em v-else>Incentive</em>
                <strong>0.1%</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 06 代币经济 -->
      <section id="chapter-06" class="section alt animate-section" :class="{ visible: visibleSections['chapter-06'] }">
        <div class="chapter-head">
          <span class="chapter-num">06</span>
          <div>
            <div class="section-badge">CHAPTER 06</div>
            <h2 v-if="lang === 'zh'">代币经济模型</h2>
            <h2 v-else>Token Economics</h2>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">6.1 代币分配</h3>
        <h3 v-else>6.1 Token Distribution</h3>
        <div class="allocation-chart">
          <div class="alloc-item">
            <div class="alloc-bar" style="--h:40%"><span>40%</span></div>
            <span class="alloc-label">IEO公售</span>
          </div>
          <div class="alloc-item">
            <div class="alloc-bar" style="--h:25%"><span>25%</span></div>
            <span class="alloc-label">生态基金</span>
          </div>
          <div class="alloc-item">
            <div class="alloc-bar" style="--h:15%"><span>15%</span></div>
            <span class="alloc-label">团队顾问</span>
          </div>
          <div class="alloc-item">
            <div class="alloc-bar" style="--h:10%"><span>10%</span></div>
            <span class="alloc-label">流动性</span>
          </div>
          <div class="alloc-item">
            <div class="alloc-bar" style="--h:10%"><span>10%</span></div>
            <span class="alloc-label">社区激励</span>
          </div>
        </div>

        <h3>6.2 通缩机制</h3>
        <div class="text-block">
          <p>AGX采用多重通缩机制，确保代币价值的长期增长：</p>
        </div>
        <div class="deflation-list">
          <div class="deflation-item">
            <div class="df-label">01</div>
            <div class="df-content">
              <strong>交易销毁</strong>
              <span>每笔交易手续费的20%用于回购销毁</span>
            </div>
          </div>
          <div class="deflation-item">
            <div class="df-label">02</div>
            <div class="df-content">
              <strong>季度销毁</strong>
              <span>平台利润的5%用于季度定期销毁</span>
            </div>
          </div>
          <div class="deflation-item">
            <div class="df-label">03</div>
            <div class="df-content">
              <strong>生态销毁</strong>
              <span>特定生态活动消耗的AGX直接销毁</span>
            </div>
          </div>
        </div>

        <h3>6.3 解锁计划</h3>
        <div class="unlock-table">
          <div class="unlock-row header">
            <span>分配类别</span>
            <span>锁定期</span>
            <span>释放方式</span>
          </div>
          <div class="unlock-row">
            <span>IEO公售</span>
            <span>无锁定</span>
            <span>TGE全部释放</span>
          </div>
          <div class="unlock-row">
            <span>生态基金</span>
            <span>6个月</span>
            <span>24个月线性释放</span>
          </div>
          <div class="unlock-row">
            <span>团队顾问</span>
            <span>12个月</span>
            <span>36个月线性释放</span>
          </div>
          <div class="unlock-row">
            <span>流动性池</span>
            <span>无锁定</span>
            <span>TGE全部释放</span>
          </div>
          <div class="unlock-row">
            <span>社区激励</span>
            <span>无锁定</span>
            <span>按活动发放</span>
          </div>
        </div>
      </section>

      <!-- 07 黄金账户 -->
      <section id="chapter-07" class="section animate-section" :class="{ visible: visibleSections['chapter-07'] }">
        <div class="chapter-head">
          <span class="chapter-num">07</span>
          <div>
            <div class="section-badge">CHAPTER 07</div>
            <h2 v-if="lang === 'zh'">黄金账户系统</h2>
            <h2 v-else>Gold Account System</h2>
          </div>
        </div>

        <div class="text-block">
          <p>AGX提供创新的双账户体系，用户可同时管理数字AGX资产和黄金权益资产，实现数字资产与实物黄金的无缝衔接。</p>
        </div>

        <div class="dual-account">
          <div class="account-card digital">
            <div class="ac-badge">DIGITAL ACCOUNT</div>
            <h4>AGX 数字账户</h4>
            <ul>
              <li>持有AGX代币，追踪GIB指数变化</li>
              <li>参与代币分发与生态激励机制</li>
              <li>享受平台治理与手续费减免权益</li>
              <li>支持ERC-20标准跨链转账</li>
              <li>参与DeFi生态与流动性建设</li>
            </ul>
          </div>

          <div class="account-bridge">
            <div class="bridge-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16l-4-4m0 0l4-4m-4 4h18M17 8l4 4m0 0l-4 4"/></svg>
            </div>
            <span>互通</span>
          </div>

          <div class="account-card gold">
            <div class="ac-badge">GOLD ACCOUNT</div>
            <h4>黄金权益账户</h4>
            <ul>
              <li>持币自动产出黄金权益</li>
              <li>黄金权益锚定LBMA金价</li>
              <li>可兑换实物金条（100g起）</li>
              <li>全球主要城市支持提取</li>
              <li>支持黄金定投计划</li>
            </ul>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">7.1 黄金产出机制</h3>
        <h3 v-else>7.1 Gold Production Mechanism</h3>
        <div class="gold-params">
          <div class="gp-item">
            <span class="gp-value">0.05<small>oz</small></span>
            <span class="gp-label">每1000 AGX日产出</span>
          </div>
          <div class="gp-item">
            <span class="gp-value">T+0</span>
            <span class="gp-label">权益即时到账</span>
          </div>
          <div class="gp-item">
            <span class="gp-value">100<small>g</small></span>
            <span class="gp-label">最低兑换门槛</span>
          </div>
          <div class="gp-item">
            <span class="gp-value">0.3<small>%</small></span>
            <span class="gp-label">兑换手续费</span>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">7.2 实物黄金兑换</h3>
        <h3 v-else>7.2 Physical Gold Redemption</h3>
        <div class="text-block">
          <p>用户累积的黄金权益可随时申请兑换为实物金条，支持全球主要城市自提或邮寄。</p>
        </div>
        <div class="exchange-info">
          <div class="ex-row">
            <span>支持规格</span>
            <span>100g / 500g / 1kg 金条</span>
          </div>
          <div class="ex-row">
            <span>纯度标准</span>
            <span>99.99% (Au999.9)</span>
          </div>
          <div class="ex-row">
            <span>合作机构</span>
            <span>PAMP · Valcambi · 中国金币</span>
          </div>
          <div class="ex-row">
            <span>配送范围</span>
            <span>全球50+城市</span>
          </div>
        </div>
      </section>

      <!-- 08 代币分发机制 -->
      <section id="chapter-08" class="section dark animate-section" :class="{ visible: visibleSections['chapter-08'] }">
        <div class="chapter-head">
          <span class="chapter-num">08</span>
          <div>
            <div class="section-badge light">CHAPTER 08</div>
            <h2 v-if="lang === 'zh'">代币分发与激励机制</h2>
            <h2 v-else>Token Distribution & Incentives</h2>
          </div>
        </div>

        <div class="text-block light">
          <p>AGX生态系统采用代币释放机制，通过智能合约按既定规则将代币逐步分发至参与者账户。该机制旨在激励用户参与系统运行与生态建设。</p>
        </div>

        <h3 v-if="lang === 'zh'">8.1 代币释放机制</h3>
        <h3 v-else>8.1 Token Emission Mechanism</h3>
        <div class="text-block light">
          <p>代币释放是指AGX在系统运行过程中，按既定规则逐步分发至参与者账户的过程。该机制具有以下特点：</p>
          <ul>
            <li>释放规则由智能合约执行，链上透明可查</li>
            <li>释放数量与系统运行周期相关</li>
            <li>支持多种参与周期选择：7天、30天、90天、180天</li>
            <li>不同周期对应不同的代币释放参数</li>
          </ul>
        </div>

        <h3 v-if="lang === 'zh'">8.2 行为激励机制</h3>
        <h3 v-else>8.2 Behavior Incentive Mechanism</h3>
        <div class="text-block light">
          <p>AGX生态对用户参与系统的行为提供代币激励，包括但不限于：</p>
          <ul>
            <li><strong>持有行为</strong>：用户持有AGX参与生态建设</li>
            <li><strong>质押行为</strong>：用户将代币锁定于智能合约</li>
            <li><strong>流动性提供</strong>：用户为交易对提供流动性支持</li>
            <li><strong>生态贡献</strong>：用户参与社区治理与推广</li>
          </ul>
        </div>

        <h3 v-if="lang === 'zh'">8.3 分发规则说明</h3>
        <h3 v-else>8.3 Distribution Rules</h3>
        <div class="text-block light">
          <ul>
            <li>代币分发按系统周期自动执行</li>
            <li>分发记录链上可查，确保透明性</li>
            <li>参与用户可随时查看分发状态</li>
            <li>质押期满后代币自动解锁返还</li>
          </ul>
        </div>

        <div class="callout-box">
          <strong>机制说明</strong>
          <p>在本白皮书语境下，上述代币分发与激励机制应被理解为代币生成与分配规则，而非投资、收益或回报承诺。任何参与行为均需用户自行评估风险。</p>
        </div>
      </section>

      <!-- 09 生态应用 -->
      <section id="chapter-09" class="section animate-section" :class="{ visible: visibleSections['chapter-09'] }">
        <div class="chapter-head">
          <span class="chapter-num">09</span>
          <div>
            <div class="section-badge">CHAPTER 09</div>
            <h2 v-if="lang === 'zh'">生态应用场景</h2>
            <h2 v-else>Ecosystem Applications</h2>
          </div>
        </div>

        <div class="text-block">
          <p>AGX致力于构建完整的数字黄金金融生态，在去美元化浪潮中为全球用户提供多元化的黄金金融服务。</p>
        </div>

        <div class="use-cases">
          <div class="uc-card">
            <div class="uc-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/></svg>
            </div>
            <strong>跨境支付结算</strong>
            <p>利用区块链实现跨境秒级到账，规避传统SWIFT系统的高成本和时间延迟，手续费降低80%以上。</p>
            <div class="uc-stats">
              <span>&lt;3s 结算</span>
              <span>$0.01 手续费</span>
            </div>
          </div>

          <div class="uc-card">
            <div class="uc-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
            </div>
            <strong>DeFi抵押借贷</strong>
            <p>AGX可作为DeFi协议的优质抵押品，因其黄金锚定特性，抵押率可达80%，高于一般加密资产。</p>
            <div class="uc-stats">
              <span>80% 抵押率</span>
              <span>Aave · Compound</span>
            </div>
          </div>

          <div class="uc-card">
            <div class="uc-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <strong>机构资产配置</strong>
            <p>为机构投资者提供数字化黄金配置通道，支持大额OTC交易和托管服务，符合机构级合规要求。</p>
            <div class="uc-stats">
              <span>$1M+ OTC</span>
              <span>机构托管</span>
            </div>
          </div>

          <div class="uc-card">
            <div class="uc-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            </div>
            <strong>黄金零售通道</strong>
            <p>打通实物黄金兑换渠道，用户可将AGX或黄金权益兑换为实物金条，支持全球主要城市提取。</p>
            <div class="uc-stats">
              <span>50+ 城市</span>
              <span>Au999.9</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 10 技术架构 -->
      <section id="chapter-10" class="section alt animate-section" :class="{ visible: visibleSections['chapter-10'] }">
        <div class="chapter-head">
          <span class="chapter-num">10</span>
          <div>
            <div class="section-badge">CHAPTER 10</div>
            <h2 v-if="lang === 'zh'">技术架构</h2>
            <h2 v-else>Technical Architecture</h2>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">10.1 系统架构</h3>
        <h3 v-else>10.1 System Architecture</h3>
        <div class="tech-stack">
          <div class="stack-row">
            <span class="stack-label">前端</span>
            <span class="stack-value">Vue 3 + Vite + TypeScript</span>
          </div>
          <div class="stack-row">
            <span class="stack-label">后端</span>
            <span class="stack-value">NestJS + PostgreSQL + Redis</span>
          </div>
          <div class="stack-row">
            <span class="stack-label">撮合引擎</span>
            <span class="stack-value">Rust + WebSocket</span>
          </div>
          <div class="stack-row">
            <span class="stack-label">智能合约</span>
            <span class="stack-value">Solidity 0.8.x</span>
          </div>
          <div class="stack-row">
            <span class="stack-label">预言机</span>
            <span class="stack-value">Chainlink + 自建节点</span>
          </div>
          <div class="stack-row">
            <span class="stack-label">基础设施</span>
            <span class="stack-value">AWS + Google Cloud</span>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">10.2 性能指标</h3>
        <h3 v-else>10.2 Performance Metrics</h3>
        <div class="perf-grid">
          <div class="perf-item">
            <span class="perf-value">100K+</span>
            <span class="perf-label">TPS</span>
          </div>
          <div class="perf-item">
            <span class="perf-value">&lt;10ms</span>
            <span class="perf-label">延迟</span>
          </div>
          <div class="perf-item">
            <span class="perf-value">99.99%</span>
            <span class="perf-label">可用性</span>
          </div>
          <div class="perf-item">
            <span class="perf-value">5</span>
            <span class="perf-label">数据中心</span>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">10.3 核心技术亮点</h3>
        <h3 v-else>10.3 Core Technical Highlights</h3>
        <div class="tech-highlights">
          <div class="th-card">
            <span class="th-num">01</span>
            <strong>可验证储备指数</strong>
            <p>所有GIB指数计算过程上链存证，采用Merkle Tree结构存储，任何人可通过区块链浏览器验证指数来源和计算逻辑。</p>
          </div>
          <div class="th-card">
            <span class="th-num">02</span>
            <strong>跨境秒级交易</strong>
            <p>基于高性能Layer 2方案，实现AGX转账确认时间小于3秒，单笔手续费低于$0.01，突破传统黄金T+2结算限制。</p>
          </div>
          <div class="th-card">
            <span class="th-num">03</span>
            <strong>DeFi原生抵押品</strong>
            <p>AGX原生支持主流DeFi协议作为抵押资产，因其黄金锚定特性，抵押率、清算阈值均优于一般加密资产。</p>
          </div>
        </div>
      </section>

      <!-- 11 安全审计 -->
      <section id="chapter-11" class="section animate-section" :class="{ visible: visibleSections['chapter-11'] }">
        <div class="chapter-head">
          <span class="chapter-num">11</span>
          <div>
            <div class="section-badge">CHAPTER 11</div>
            <h2 v-if="lang === 'zh'">安全与审计</h2>
            <h2 v-else>Security & Audit</h2>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">11.1 资产安全</h3>
        <h3 v-else>11.1 Asset Security</h3>
        <div class="security-features">
          <div class="sf-item">
            <div class="sf-label">A</div>
            <strong>冷热钱包分离</strong>
            <span>95%资产存储于离线冷钱包</span>
          </div>
          <div class="sf-item">
            <div class="sf-label">B</div>
            <strong>多重签名</strong>
            <span>提币需多个私钥共同签名</span>
          </div>
          <div class="sf-item">
            <div class="sf-label">C</div>
            <strong>100%准备金</strong>
            <span>链上可验证的1:1准备金证明</span>
          </div>
          <div class="sf-item">
            <div class="sf-label">D</div>
            <strong>保险基金</strong>
            <span>设立风险准备金应对极端情况</span>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">11.2 安全审计</h3>
        <h3 v-else>11.2 Security Audit</h3>
        <div class="audit-list">
          <div class="audit-item">
            <strong>CertiK</strong>
            <span>智能合约审计</span>
            <span class="audit-date">2024.01</span>
          </div>
          <div class="audit-item">
            <strong>慢雾科技</strong>
            <span>系统安全审计</span>
            <span class="audit-date">2024.01</span>
          </div>
          <div class="audit-item">
            <strong>Hacken</strong>
            <span>渗透测试</span>
            <span class="audit-date">2023.12</span>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">11.3 监管牌照</h3>
        <h3 v-else>11.3 Regulatory Licenses</h3>
        <div class="audit-list">
          <div class="audit-item">
            <strong>美国 MSB</strong>
            <span>货币服务业务牌照</span>
            <span class="audit-date">FinCEN</span>
          </div>
          <div class="audit-item">
            <strong>加拿大 MSB</strong>
            <span>货币服务业务注册</span>
            <span class="audit-date">FINTRAC</span>
          </div>
          <div class="audit-item">
            <strong>澳大利亚 AUSTRAC</strong>
            <span>数字货币交易注册</span>
            <span class="audit-date">DCE</span>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">11.4 合规认证</h3>
        <h3 v-else>11.4 Compliance Certifications</h3>
        <div class="cert-badges">
          <div class="cert-badge">
            <strong>ISO 27001</strong>
            <span>信息安全管理</span>
          </div>
          <div class="cert-badge">
            <strong>SOC 2 Type II</strong>
            <span>服务组织控制</span>
          </div>
          <div class="cert-badge">
            <strong>GDPR</strong>
            <span>数据保护合规</span>
          </div>
        </div>
      </section>

      <!-- 12 合规治理 -->
      <section id="chapter-12" class="section dark animate-section" :class="{ visible: visibleSections['chapter-12'] }">
        <div class="chapter-head">
          <span class="chapter-num">12</span>
          <div>
            <div class="section-badge light">CHAPTER 12</div>
            <h2 v-if="lang === 'zh'">合规与治理</h2>
            <h2 v-else>Compliance & Governance</h2>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">12.1 合规框架</h3>
        <h3 v-else>12.1 Compliance Framework</h3>
        <div class="text-block light">
          <p>AGX严格遵守适用法律法规，建立了完善的合规体系：</p>
          <ul>
            <li>KYC/AML身份验证与反洗钱系统</li>
            <li>交易监控与可疑行为报告机制</li>
            <li>用户资产隔离存管</li>
            <li>定期合规审计与报告</li>
          </ul>
        </div>

        <h3 v-if="lang === 'zh'">12.2 治理机制</h3>
        <h3 v-else>12.2 Governance Mechanism</h3>
        <div class="text-block light">
          <p>AGX采用去中心化治理模式，持币用户可参与平台重大决策：</p>
        </div>
        <div class="governance-items">
          <div class="gov-item">
            <strong>提案权</strong>
            <span>持有10,000+ AGX可发起提案</span>
          </div>
          <div class="gov-item">
            <strong>投票权</strong>
            <span>1 AGX = 1 票</span>
          </div>
          <div class="gov-item">
            <strong>执行门槛</strong>
            <span>需超过50%参与者同意</span>
          </div>
        </div>
      </section>

      <!-- 13 路线图 -->
      <section id="chapter-13" class="section animate-section" :class="{ visible: visibleSections['chapter-13'] }">
        <div class="chapter-head">
          <span class="chapter-num">13</span>
          <div>
            <div class="section-badge">CHAPTER 13</div>
            <h2 v-if="lang === 'zh'">发展路线图</h2>
            <h2 v-else>Roadmap</h2>
          </div>
        </div>

        <div class="roadmap">
          <div class="rm-item done">
            <div class="rm-marker"></div>
            <div class="rm-content">
              <span class="rm-date">2023 Q4</span>
              <strong>Phase 1 · 平台上线</strong>
              <ul>
                <li>完成核心交易系统开发</li>
                <li>上线AGX IEO申购功能</li>
                <li>完成CertiK安全审计</li>
              </ul>
            </div>
          </div>

          <div class="rm-item done">
            <div class="rm-marker"></div>
            <div class="rm-content">
              <span class="rm-date">2024 Q1</span>
              <strong>Phase 2 · 生态扩展</strong>
              <ul>
                <li>$t(ecosystem.poolFeature)</li>
                <li>$t(ecosystem.earnFeature)</li>
                <li>用户突破100万</li>
              </ul>
            </div>
          </div>

          <div class="rm-item current">
            <div class="rm-marker"></div>
            <div class="rm-content">
              <span class="rm-date">2024 Q2</span>
              <strong>Phase 3 · 功能完善</strong>
              <ul>
                <li>上线秒合约交易</li>
                <li>上线OTC法币通道</li>
                <li>推出移动端APP</li>
              </ul>
            </div>
          </div>

          <div class="rm-item">
            <div class="rm-marker"></div>
            <div class="rm-content">
              <span class="rm-date">2024 Q3</span>
              <strong>Phase 4 · 全球化</strong>
              <ul>
                <li>拓展东南亚市场</li>
                <li>支持更多法币</li>
                <li>获取多国合规牌照</li>
              </ul>
            </div>
          </div>

          <div class="rm-item">
            <div class="rm-marker"></div>
            <div class="rm-content">
              <span class="rm-date">2024 Q4</span>
              <strong>Phase 5 · 生态繁荣</strong>
              <ul>
                <li>上线DeFi借贷功能</li>
                <li>推出AGX支付网络</li>
                <li>用户突破500万</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- 14 团队 -->
      <section id="chapter-14" class="section alt animate-section" :class="{ visible: visibleSections['chapter-14'] }">
        <div class="chapter-head">
          <span class="chapter-num">14</span>
          <div>
            <div class="section-badge">CHAPTER 14</div>
            <h2 v-if="lang === 'zh'">团队与顾问</h2>
            <h2 v-else>Team & Advisors</h2>
          </div>
        </div>

        <div class="text-block">
          <p>Ascenda团队由来自全球顶尖金融科技公司的资深专业人士组成，核心成员拥有平均15年以上的行业经验。</p>
        </div>

        <div class="team-stats">
          <div class="ts-item">
            <span class="ts-value">50+</span>
            <span class="ts-label">核心成员</span>
          </div>
          <div class="ts-item">
            <span class="ts-value">15年+</span>
            <span class="ts-label">平均经验</span>
          </div>
          <div class="ts-item">
            <span class="ts-value">10+</span>
            <span class="ts-label">国家背景</span>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">团队背景</h3>
        <h3 v-else>Team Background</h3>
        <div class="team-bg">
          <div class="tb-item">前高盛、摩根士丹利量化交易团队</div>
          <div class="tb-item">前Coinbase、Binance核心开发团队</div>
          <div class="tb-item">前Google、Meta安全工程团队</div>
          <div class="tb-item">MIT、Stanford、清华等顶尖学府</div>
        </div>
      </section>

      <!-- 15 合作伙伴 -->
      <section id="chapter-15" class="section animate-section" :class="{ visible: visibleSections['chapter-15'] }">
        <div class="chapter-head">
          <span class="chapter-num">15</span>
          <div>
            <div class="section-badge">CHAPTER 15</div>
            <h2 v-if="lang === 'zh'">合作伙伴</h2>
            <h2 v-else>Partners</h2>
          </div>
        </div>

        <h3 v-if="lang === 'zh'">技术合作</h3>
        <h3 v-else>Technology Partners</h3>
        <div class="partner-list">
          <div class="partner-item">Chainlink</div>
          <div class="partner-item">AWS</div>
          <div class="partner-item">Google Cloud</div>
          <div class="partner-item">Polygon</div>
        </div>

        <h3 v-if="lang === 'zh'">审计机构</h3>
        <h3 v-else>Audit Firms</h3>
        <div class="partner-list">
          <div class="partner-item">CertiK</div>
          <div class="partner-item">慢雾科技</div>
          <div class="partner-item">Hacken</div>
        </div>

        <h3 v-if="lang === 'zh'">黄金供应</h3>
        <h3 v-else>Gold Supply</h3>
        <div class="partner-list">
          <div class="partner-item">PAMP</div>
          <div class="partner-item">Valcambi</div>
          <div class="partner-item">中国金币</div>
        </div>
      </section>

      <!-- 底部 -->
      <footer class="doc-footer">
        <div class="footer-line"></div>
        <span class="footer-text">Ascenda · AGX White Paper v3.0 · January 2026</span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

// 语言状态
const lang = ref('zh')

// 幻灯片状态
const slidePage = ref(1)

// 每页显示所有步骤（静态展示）
const slideStep = computed(() => {
  const pageSteps = {
    1: 5,   // 第1页到第5步
    2: 8,   // 第2页到第8步
    3: 12,  // 第3页到第12步
    4: 16,  // 第4页到第16步
    5: 20,  // 第5页到第20步
    6: 24   // 第6页到第24步
  }
  return pageSteps[slidePage.value] || 24
})

// 幻灯片页面切换
const prevSlidePage = () => {
  if (slidePage.value > 1) {
    slidePage.value--
  }
}

const nextSlidePage = () => {
  if (slidePage.value < 6) {
    slidePage.value++
  } else {
    // 最后一页点击滚动到正文
    const summaryEl = document.querySelector('.section')
    if (summaryEl) {
      summaryEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

const goToSlidePage = (page) => {
  slidePage.value = page
}

const contentRef = ref(null)
const visibleSections = reactive({
  cover: false,
  stats: false,
  summary: false,
  toc: false,
  'chapter-01': false,
  'chapter-02': false,
  'chapter-03': false,
  'chapter-04': false,
  'chapter-05': false,
  'chapter-06': false,
  'chapter-07': false,
  'chapter-08': false,
  'chapter-09': false,
  'chapter-10': false,
  'chapter-11': false,
  'chapter-12': false,
  'chapter-13': false,
  'chapter-14': false,
  'chapter-15': false,
  'chapter-16': false
})

let observer = null

onMounted(() => {
  // 初始化入场动画
  setTimeout(() => { visibleSections.cover = true }, 100)
  setTimeout(() => { visibleSections.stats = true }, 300)
  setTimeout(() => { visibleSections.summary = true }, 500)
  setTimeout(() => { visibleSections.toc = true }, 700)

  // 设置Intersection Observer监听章节可见性
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id
        if (id && visibleSections.hasOwnProperty(id)) {
          visibleSections[id] = true
        }
      }
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })

  // 观察所有章节
  document.querySelectorAll('[id^="chapter-"]').forEach(el => {
    observer.observe(el)
  })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

// 目录跳转
const scrollToChapter = (chapterId) => {
  const el = document.getElementById(chapterId)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 分享
const shareDoc = () => {
  if (navigator.share) {
    navigator.share({
      title: 'AGX White Paper',
      text: 'AGX Gold Index Token - White Paper v3.0',
      url: window.location.href
    })
  }
}
</script>

<style scoped>
.whitepaper-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0A0A0A 0%, #0D0D0D 50%, #111111 100%);
  color: #E8E8E8;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* 水印层 - 斜向排布 */
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
  color: rgba(212, 175, 110, 0.04);
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

/* 入场动画 */
.animate-section {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.animate-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.animate-item {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  transition-delay: var(--delay, 0s);
}

.animate-section.visible .animate-item {
  opacity: 1;
  transform: translateY(0);
}

/* Header - Pro Max 深色玻璃风格 */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  height: 52px;
  padding: 0 16px;
  padding-top: env(safe-area-inset-top);
  background: linear-gradient(180deg, rgba(20, 20, 20, 0.98) 0%, rgba(15, 15, 15, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(212, 175, 110, 0.15);
}

/* 头部金色装饰线 */
.header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(212, 175, 110, 0.6) 20%, 
    rgba(240, 215, 140, 0.8) 50%, 
    rgba(212, 175, 110, 0.6) 80%, 
    transparent 100%);
}

.back-btn, .action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #D4AF6E;
}

.back-btn svg, .action-btn svg { width: 20px; height: 20px; }

.header-title {
  flex: 1;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, #F0D78C 0%, #C8AA6E 50%, #A68B4B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 语言切换 - 深色风格 */
.lang-switch {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 4px;
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid rgba(212, 175, 110, 0.2);
  padding: 3px;
  border-radius: 8px;
}

.lang-btn {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(212, 175, 110, 0.7);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-btn.active {
  color: #F0D78C;
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.2) 0%, rgba(212, 175, 110, 0.1) 100%);
  border: 1px solid rgba(212, 175, 110, 0.3);
  box-shadow: 0 2px 8px rgba(212, 175, 110, 0.15);
}

/* Cover - Pro Max 3D 封面 */
.cover {
  position: relative;
  z-index: 3;
  padding: 60px 24px 48px;
  background: linear-gradient(180deg, #0D0D0D 0%, #111111 50%, #0A0A0A 100%);
  text-align: center;
  overflow: hidden;
  border-bottom: 1px solid rgba(212, 175, 110, 0.2);
}

/* 封面底部金色装饰线 */
.cover::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(212, 175, 110, 0.5) 20%, 
    rgba(240, 215, 140, 0.7) 50%, 
    rgba(212, 175, 110, 0.5) 80%, 
    transparent 100%);
}

.cover-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(212, 175, 110, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212, 175, 110, 0.03) 1px, transparent 1px);
  background-size: 32px 32px;
}

.cover-inner { position: relative; z-index: 1; }

.cover-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #C8AA6E 50%, #A68B4B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 3px;
  border: 1.5px solid rgba(212, 175, 110, 0.5);
  padding: 8px 24px;
  border-radius: 2px;
  margin-bottom: 32px;
}

.cover-logo {
  display: block;
  width: 88px;
  height: 88px;
  border-radius: 22px;
  margin: 0 auto 28px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(212, 175, 110, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(212, 175, 110, 0.3);
}

.cover h1 {
  font-size: 48px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 30%, #C8AA6E 60%, #A68B4B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: 12px;
  text-shadow: 0 4px 20px rgba(212, 175, 110, 0.3);
}

.cover-sub {
  font-size: 13px;
  background: linear-gradient(135deg, #D4AF6E 0%, #C8AA6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 8px;
  margin: 12px 0 0;
  font-weight: 500;
}

.cover-divider {
  width: 48px;
  height: 2px;
  background: linear-gradient(90deg, rgba(212, 175, 110, 0.3), #D4AF6E, rgba(212, 175, 110, 0.3));
  margin: 32px auto;
  box-shadow: 0 0 10px rgba(212, 175, 110, 0.4);
}

.cover-tagline {
  font-size: 15px;
  color: rgba(232, 232, 232, 0.8);
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
  color: rgba(212, 175, 110, 0.6);
  letter-spacing: 1px;
}

/* Stats - Pro Max 深色风格 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: linear-gradient(145deg, #1A1A1A 0%, #141414 100%);
  border-bottom: 1px solid rgba(212, 175, 110, 0.15);
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 8px;
  border-right: 1px solid rgba(212, 175, 110, 0.1);
}

.stat-card:last-child { border-right: none; }

.stat-num {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-brand, #D4AF6E);
}

.stat-num small { font-size: 11px; font-weight: 500; }

.stat-label {
  font-size: 9px;
  color: rgba(232, 232, 232, 0.6);
  margin-top: 4px;
  text-align: center;
}

/* Section base - Pro Max 深色风格 */
.section {
  padding: 36px 24px;
  background: linear-gradient(180deg, #0D0D0D 0%, #0A0A0A 100%);
  border-bottom: 1px solid rgba(212, 175, 110, 0.12);
  position: relative;
}

/* section 底部装饰线 */
.section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(200, 200, 200, 0.15) 30%, 
    rgba(200, 200, 200, 0.25) 50%, 
    rgba(200, 200, 200, 0.15) 70%, 
    transparent 100%);
}

.section.dark {
  background: linear-gradient(180deg, #111111 0%, #0D0D0D 100%);
}

.section.alt {
  background: linear-gradient(180deg, #0F0F0F 0%, #0B0B0B 100%);
}

.section.toc {
  background: linear-gradient(180deg, #0E0E0E 0%, #0A0A0A 100%);
}

.section-badge {
  font-size: 10px;
  font-weight: 700;
  background: linear-gradient(135deg, #D4AF6E 0%, #A68B4B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}

.section-badge.light { 
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section h2 {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #C8AA6E 50%, #A68B4B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 20px;
  letter-spacing: 0.5px;
}

.section.dark h2 { 
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 50%, #C8AA6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section h3 {
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #D4AF6E 0%, #C8AA6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 28px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(212, 175, 110, 0.2);
}

.section.dark h3 { 
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.chapter-head {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.08) 0%, rgba(212, 175, 110, 0.02) 100%);
  border-radius: 12px;
  border-left: 3px solid rgba(212, 175, 110, 0.5);
  border: 1px solid rgba(212, 175, 110, 0.15);
}

.chapter-num {
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.4) 0%, rgba(212, 175, 110, 0.2) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.section.dark .chapter-num { 
  background: linear-gradient(135deg, rgba(240, 215, 140, 0.5) 0%, rgba(212, 175, 110, 0.3) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-block {
  margin-bottom: 20px;
}

.text-block p {
  font-size: 15px;
  color: rgba(232, 232, 232, 0.85);
  line-height: 1.85;
  margin: 0 0 14px;
  letter-spacing: 0.2px;
  font-weight: 500;
}

.text-block.light p { color: rgba(232, 232, 232, 0.85); }

.text-block strong { 
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600; 
}
.section.dark .text-block strong { 
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-block ul {
  margin: 12px 0;
  padding-left: 20px;
}

.text-block li {
  font-size: 15px;
  color: rgba(232, 232, 232, 0.8);
  line-height: 1.8;
  margin-bottom: 10px;
  font-weight: 500;
}

.section.dark .text-block li { color: rgba(232, 232, 232, 0.8); }

/* TOC - Pro Max 3D 卡片风格 */
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
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(20, 20, 20, 0.95) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.toc-item:active {
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.1) 0%, rgba(20, 20, 20, 0.95) 100%);
  transform: scale(0.98);
  border-color: rgba(212, 175, 110, 0.3);
}

.toc-num {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #0D0D0D;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 50%, #A68B4B 100%);
  border-radius: 6px;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(212, 175, 110, 0.3);
}

.toc-title {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: rgba(232, 232, 232, 0.9);
}

.toc-arrow {
  font-size: 14px;
  color: rgba(212, 175, 110, 0.5);
  font-weight: 300;
}

/* Highlights - Pro Max 3D 卡片 */
.highlights-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.highlight-box {
  padding: 20px 16px;
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.2);
  border-radius: 4px;
  border-left: 3px solid rgba(212, 175, 110, 0.6);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.hl-num {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(240, 215, 140, 0.6) 0%, rgba(212, 175, 110, 0.4) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Georgia', serif;
  margin-bottom: 10px;
}

.highlight-box strong {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: rgba(232, 232, 232, 0.95);
  margin-bottom: 6px;
}

.highlight-box span {
  font-size: 12px;
  color: rgba(180, 180, 180, 0.8);
  line-height: 1.5;
  font-weight: 500;
}

/* Data grid - Pro Max 风格 */
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
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.12) 0%, rgba(212, 175, 110, 0.05) 100%);
  border: 1px solid rgba(212, 175, 110, 0.2);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.data-value {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.data-label {
  font-size: 10px;
  color: rgba(180, 180, 180, 0.8);
  margin-top: 4px;
}

/* Info table - Pro Max 深色风格 */
.info-table {
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 10px;
  overflow: hidden;
  margin: 16px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(212, 175, 110, 0.1);
  font-size: 13px;
}

.info-row:last-child { border-bottom: none; }
.info-row span:first-child { color: rgba(180, 180, 180, 0.7); }
.info-row span:last-child { color: rgba(232, 232, 232, 0.9); font-weight: 600; }
.info-row .highlight { 
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600; 
}

/* Problem list - Pro Max 风格 */
.problem-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 16px 0;
}

.problem-item {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.08) 0%, rgba(212, 175, 110, 0.03) 100%);
  border: 1px solid rgba(212, 175, 110, 0.2);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.problem-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.3) 0%, rgba(212, 175, 110, 0.15) 100%);
  color: #F0D78C;
  font-size: 12px;
  font-weight: 700;
  border-radius: 6px;
  flex-shrink: 0;
}

.problem-text strong {
  display: block;
  font-size: 13px;
  color: rgba(232, 232, 232, 0.95);
  margin-bottom: 2px;
}

.problem-text span {
  font-size: 12px;
  color: rgba(180, 180, 180, 0.8);
}

/* Callout - Pro Max 3D 风格 */
.callout-box {
  padding: 18px;
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.1) 0%, rgba(212, 175, 110, 0.03) 100%);
  border-left: 4px solid rgba(212, 175, 110, 0.6);
  border: 1px solid rgba(212, 175, 110, 0.2);
  border-left-width: 4px;
  border-radius: 0 10px 10px 0;
  margin-top: 20px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.callout-box strong {
  display: block;
  font-size: 14px;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.callout-box p {
  font-size: 13px;
  color: rgba(200, 200, 200, 0.85);
  line-height: 1.7;
  margin: 0;
  font-weight: 500;
}

/* Feature cards - Pro Max 3D 风格 */
.feature-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 16px 0;
}

.feature-card {
  padding: 18px 16px;
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 4px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
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
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  border: 1.5px solid rgba(212, 175, 110, 0.5);
  border-radius: 4px;
  font-family: 'Georgia', serif;
}

.fc-header strong {
  font-size: 14px;
  color: rgba(232, 232, 232, 0.95);
}

.feature-card p {
  font-size: 13px;
  color: rgba(180, 180, 180, 0.8);
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
}

/* Params table - Pro Max 风格 */
.params-table {
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 10px;
  overflow: hidden;
  margin: 16px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.param-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(212, 175, 110, 0.1);
}

.param-row:last-child { border-bottom: none; }

.param-key {
  font-size: 13px;
  color: rgba(180, 180, 180, 0.7);
}

.param-val {
  font-size: 13px;
  color: rgba(232, 232, 232, 0.95);
  font-weight: 600;
}

/* Compare table - Pro Max 风格 */
.compare-table {
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 10px;
  overflow: hidden;
  margin: 16px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.compare-header, .compare-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 8px;
}

.compare-header {
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.15) 0%, rgba(212, 175, 110, 0.08) 100%);
  font-size: 11px;
  font-weight: 600;
}

.compare-header span:first-child { color: transparent; }
.compare-header span { 
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center; 
}

.compare-row {
  padding: 10px 14px;
  border-bottom: 1px solid rgba(212, 175, 110, 0.08);
  font-size: 11px;
}

.compare-row:last-child { border-bottom: none; }
.compare-row span:first-child { color: rgba(180, 180, 180, 0.7); }
.compare-row span { color: rgba(180, 180, 180, 0.8); text-align: center; }
.compare-row span.good { 
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600; 
}

/* Architecture - Pro Max 3D 风格 */
.arch-diagram {
  padding: 20px 16px;
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(12, 12, 12, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 12px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.arch-layer { margin-bottom: 8px; }

.layer-tag {
  font-size: 10px;
  font-weight: 600;
  color: rgba(180, 180, 180, 0.7);
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.arch-box {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
}

.arch-box.green {
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.12) 0%, rgba(212, 175, 110, 0.04) 100%);
  border: 1px solid rgba(212, 175, 110, 0.25);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.arch-box.blue {
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.12) 0%, rgba(212, 175, 110, 0.04) 100%);
  border: 1px solid rgba(212, 175, 110, 0.25);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.arch-box.gold {
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.18) 0%, rgba(212, 175, 110, 0.08) 100%);
  border: 1px solid rgba(212, 175, 110, 0.35);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(212, 175, 110, 0.1);
}

.ab-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(20, 20, 20, 0.95) 100%);
  border: 1px solid rgba(212, 175, 110, 0.2);
  border-radius: 12px;
  flex-shrink: 0;
}

.ab-icon svg { width: 24px; height: 24px; }

.arch-box.green .ab-icon svg { color: #D4AF6E; }
.arch-box.blue .ab-icon svg { color: #D4AF6E; }
.arch-box.gold .ab-icon svg { color: #F0D78C; }

.ab-content strong {
  display: block;
  font-size: 14px;
  color: rgba(232, 232, 232, 0.95);
}

.ab-content span {
  font-size: 11px;
  color: rgba(180, 180, 180, 0.7);
}

.arch-sources, .arch-networks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.arch-sources span, .arch-networks span {
  font-size: 10px;
  color: rgba(200, 200, 200, 0.7);
  background: rgba(212, 175, 110, 0.1);
  border: 1px solid rgba(212, 175, 110, 0.15);
  padding: 4px 10px;
  border-radius: 10px;
}

.arch-indicators {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  margin-top: 10px;
}

.ind-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  background: rgba(212, 175, 110, 0.08);
  border: 1px solid rgba(212, 175, 110, 0.12);
  border-radius: 8px;
}

.ind-item span:first-child {
  font-size: 9px;
  color: rgba(180, 180, 180, 0.7);
}

.ind-item span:last-child {
  font-size: 11px;
  font-weight: 600;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.arch-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
}

.connector-line {
  width: 2px;
  height: 20px;
  background: linear-gradient(180deg, rgba(212, 175, 110, 0.5), rgba(212, 175, 110, 0.2));
}

.arch-connector span {
  font-size: 10px;
  background: linear-gradient(135deg, #D4AF6E 0%, #A68B4B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-color: rgba(212, 175, 110, 0.1);
  padding: 4px 12px;
  border-radius: 10px;
  margin-top: 8px;
  border: 1px solid rgba(212, 175, 110, 0.2);
}

/* Formula - Pro Max 3D 风格 */
.formula-display {
  padding: 24px;
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(12, 12, 12, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.2);
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.formula-label {
  font-size: 9px;
  font-weight: 700;
  color: rgba(180, 180, 180, 0.6);
  letter-spacing: 1px;
  margin-bottom: 18px;
  text-align: center;
}

.formula-equation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.formula-gib {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 50%, #A68B4B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Times New Roman', serif;
  font-style: italic;
}

.formula-equals {
  font-size: 24px;
  color: rgba(180, 180, 180, 0.6);
}

.formula-sigma {
  font-size: 36px;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Times New Roman', serif;
}

.formula-fraction {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.frac-top, .frac-bottom {
  font-size: 14px;
  color: rgba(232, 232, 232, 0.85);
  font-family: 'Times New Roman', serif;
  font-style: italic;
}

.frac-bar {
  width: 100%;
  height: 1px;
  background: rgba(180, 180, 180, 0.5);
  margin: 4px 0;
}

.formula-vars {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 18px;
  flex-wrap: wrap;
}

.formula-vars span {
  font-size: 11px;
  color: rgba(180, 180, 180, 0.7);
}

.formula-vars strong { 
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Indicator cards - Pro Max 3D 风格 */
.indicator-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.indicator-card {
  padding: 16px;
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 12px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.ic-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.ic-rank {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 50%, #A68B4B 100%);
  color: #0D0D0D;
  font-size: 13px;
  font-weight: 700;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(212, 175, 110, 0.3);
}

.ic-weight {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.weight-bar {
  flex: 1;
  height: 4px;
  background: rgba(212, 175, 110, 0.15);
  border-radius: 2px;
  overflow: hidden;
}

.weight-bar::after {
  content: '';
  display: block;
  width: var(--w);
  height: 100%;
  background: linear-gradient(90deg, #D4AF6E, #F0D78C);
  box-shadow: 0 0 8px rgba(212, 175, 110, 0.4);
}

.ic-weight > span {
  font-size: 14px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  min-width: 40px;
  text-align: right;
}

.indicator-card > strong {
  display: block;
  font-size: 14px;
  color: rgba(232, 232, 232, 0.95);
  margin-bottom: 6px;
}

.indicator-card > p {
  font-size: 12px;
  color: rgba(180, 180, 180, 0.7);
  line-height: 1.6;
  margin: 0 0 10px;
  font-weight: 500;
}

.ic-meta {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid rgba(212, 175, 110, 0.1);
  font-size: 10px;
  color: rgba(180, 180, 180, 0.6);
}

/* Advantages - Pro Max 风格 */
.advantages-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.adv-row {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.adv-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.2) 0%, rgba(212, 175, 110, 0.1) 100%);
  color: #F0D78C;
  font-size: 12px;
  font-weight: 700;
  border-radius: 6px;
  flex-shrink: 0;
}

.adv-text strong {
  display: block;
  font-size: 13px;
  color: rgba(232, 232, 232, 0.95);
  margin-bottom: 2px;
}

.adv-text span {
  font-size: 12px;
  color: rgba(180, 180, 180, 0.7);
}

/* Anchor layers - Pro Max 3D 风格 */
.anchor-layers {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.anchor-box {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-left: 4px solid rgba(212, 175, 110, 0.5);
  border-radius: 0 12px 12px 0;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.anchor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.anchor-tag {
  font-size: 9px;
  font-weight: 700;
  color: #0D0D0D;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 50%, #A68B4B 100%);
  padding: 4px 10px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(212, 175, 110, 0.3);
}

.anchor-header h4 {
  font-size: 15px;
  font-weight: 600;
  color: rgba(232, 232, 232, 0.95);
  margin: 0;
}

.anchor-box > p {
  font-size: 13px;
  color: rgba(180, 180, 180, 0.8);
  line-height: 1.6;
  margin: 0 0 12px;
  font-weight: 500;
}

.anchor-specs {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.spec-item {
  display: flex;
  flex-direction: column;
}

.spec-item em {
  font-style: normal;
  font-size: 10px;
  color: rgba(180, 180, 180, 0.6);
}

.spec-item strong {
  font-size: 13px;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.layer-arrow {
  padding: 10px 0;
  color: #D4AF6E;
}

.layer-arrow svg {
  width: 20px;
  height: 20px;
  filter: drop-shadow(0 2px 4px rgba(212, 175, 110, 0.3));
}

/* Allocation - Pro Max 3D 风格 */
.allocation-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 180px;
  padding: 20px 10px 0;
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(12, 12, 12, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 12px;
  margin: 16px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.alloc-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.alloc-bar {
  width: 36px;
  height: calc(var(--h) * 3);
  background: linear-gradient(180deg, #F0D78C, #D4AF6E, #A68B4B);
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8px;
  box-shadow: 
    0 0 15px rgba(212, 175, 110, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.alloc-bar span {
  font-size: 11px;
  font-weight: 700;
  color: #0D0D0D;
}

.alloc-label {
  font-size: 10px;
  color: rgba(180, 180, 180, 0.7);
  margin-top: 10px;
  text-align: center;
}

/* Deflation - Pro Max 风格 */
.deflation-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 16px 0;
}

.deflation-item {
  display: flex;
  gap: 14px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.df-label {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  border: 2px solid rgba(212, 175, 110, 0.4);
  border-radius: 8px;
  flex-shrink: 0;
}

.df-content strong {
  display: block;
  font-size: 13px;
  color: rgba(232, 232, 232, 0.95);
  margin-bottom: 2px;
}

.df-content span {
  font-size: 12px;
  color: rgba(180, 180, 180, 0.7);
}

/* Unlock table - Pro Max 风格 */
.unlock-table {
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 10px;
  overflow: hidden;
  margin: 16px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.unlock-row {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(212, 175, 110, 0.08);
  font-size: 12px;
}

.unlock-row:last-child { border-bottom: none; }

.unlock-row.header {
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.15) 0%, rgba(212, 175, 110, 0.08) 100%);
  font-weight: 600;
  background-image: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.unlock-row:not(.header) span:first-child { color: rgba(232, 232, 232, 0.9); }
.unlock-row:not(.header) span { color: rgba(180, 180, 180, 0.7); }

/* Dual account - Pro Max 3D 风格 */
.dual-account {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
}

.account-card {
  width: 100%;
  padding: 18px;
  border-radius: 14px;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.05);
}

.account-card.digital {
  background: #FFFFFF;
  border: 1px solid rgba(200, 170, 110, 0.3);
}

.account-card.gold {
  background: #FFFFFF;
  border: 1px solid rgba(200, 170, 110, 0.4);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.05);
}

.ac-badge {
  font-size: 9px;
  font-weight: 700;
  color: rgba(120, 100, 70, 0.7);
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.account-card h4 {
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #C8AA6E 0%, #A68B4B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 12px;
}

.account-card ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.account-card li {
  font-size: 13px;
  color: rgba(50, 50, 50, 0.85);
  padding: 8px 0;
  border-bottom: 1px solid rgba(200, 170, 110, 0.15);
  display: flex;
  align-items: center;
  gap: 10px;
}

.account-card li:last-child { border-bottom: none; }

.account-card li::before {
  content: '•';
  color: #C8AA6E;
  font-weight: bold;
}

.account-bridge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bridge-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #D4AF6E;
}

.bridge-icon svg {
  width: 20px;
  height: 20px;
  filter: drop-shadow(0 2px 4px rgba(212, 175, 110, 0.3));
}

.account-bridge span {
  font-size: 10px;
  color: rgba(180, 180, 180, 0.6);
}

/* Gold params - Pro Max 风格 */
.gold-params {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 16px 0;
}

.gp-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px;
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.gp-value {
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 50%, #A68B4B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gp-value small { font-size: 13px; font-weight: 500; }

.gp-label {
  font-size: 11px;
  color: rgba(180, 180, 180, 0.7);
  margin-top: 4px;
}

/* Exchange info - Pro Max 风格 */
.exchange-info {
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 10px;
  overflow: hidden;
  margin: 16px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.ex-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(212, 175, 110, 0.08);
  font-size: 13px;
}

.ex-row:last-child { border-bottom: none; }
.ex-row span:first-child { color: rgba(180, 180, 180, 0.7); }
.ex-row span:last-child { color: rgba(232, 232, 232, 0.95); }

/* Pool cards - Pro Max 风格 */
.pool-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 16px 0;
}

.pool-card {
  padding: 18px;
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 14px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.pool-card.featured {
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.12) 0%, rgba(212, 175, 110, 0.04) 100%);
  border-color: rgba(212, 175, 110, 0.35);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(212, 175, 110, 0.1);
}

.pool-badge {
  font-size: 9px;
  font-weight: 700;
  color: rgba(180, 180, 180, 0.6);
  background: rgba(212, 175, 110, 0.1);
  padding: 3px 10px;
  border-radius: 10px;
  display: inline-block;
  margin-bottom: 10px;
}

.pool-card.featured .pool-badge {
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-color: rgba(212, 175, 110, 0.2);
}

.pool-period {
  font-size: 14px;
  color: rgba(180, 180, 180, 0.7);
  margin-bottom: 4px;
}

.pool-apy {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 50%, #A68B4B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pool-label {
  font-size: 10px;
  color: rgba(180, 180, 180, 0.6);
  display: block;
  margin-bottom: 10px;
}

.pool-min {
  font-size: 11px;
  color: rgba(180, 180, 180, 0.6);
  padding-top: 10px;
  border-top: 1px solid rgba(212, 175, 110, 0.1);
}

/* Yield - Pro Max 风格 */
.yield-formula {
  padding: 16px;
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.12) 0%, rgba(212, 175, 110, 0.05) 100%);
  border: 1px solid rgba(212, 175, 110, 0.2);
  border-radius: 10px;
  text-align: center;
  font-size: 13px;
  background-image: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 500;
  margin: 16px 0;
}

.yield-example {
  padding: 16px;
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 10px;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.yield-example > strong {
  display: block;
  font-size: 12px;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
}

.yield-example p {
  font-size: 13px;
  color: rgba(180, 180, 180, 0.8);
  margin: 0 0 6px;
}

.yield-example p strong { 
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Use cases - Pro Max 3D 风格 */
.use-cases {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 16px 0;
}

.uc-card {
  padding: 18px;
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 14px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.uc-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.15) 0%, rgba(212, 175, 110, 0.08) 100%);
  border: 1px solid rgba(212, 175, 110, 0.2);
  border-radius: 12px;
  margin-bottom: 12px;
  color: #D4AF6E;
}

.uc-icon svg { width: 20px; height: 20px; }

.uc-card > strong {
  display: block;
  font-size: 14px;
  color: rgba(232, 232, 232, 0.95);
  margin-bottom: 6px;
}

.uc-card > p {
  font-size: 12px;
  color: rgba(180, 180, 180, 0.7);
  line-height: 1.6;
  margin: 0 0 12px;
  font-weight: 500;
}

.uc-stats {
  display: flex;
  gap: 12px;
}

.uc-stats span {
  font-size: 10px;
  background: linear-gradient(135deg, #D4AF6E 0%, #A68B4B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-color: rgba(212, 175, 110, 0.1);
  border: 1px solid rgba(212, 175, 110, 0.15);
  padding: 4px 10px;
  border-radius: 10px;
}

/* Tech stack - Pro Max 风格 */
.tech-stack {
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 10px;
  overflow: hidden;
  margin: 16px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.stack-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(212, 175, 110, 0.08);
  font-size: 13px;
}

.stack-row:last-child { border-bottom: none; }
.stack-label { color: rgba(180, 180, 180, 0.7); }
.stack-value { color: rgba(232, 232, 232, 0.95); }

/* Performance - Pro Max 风格 */
.perf-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin: 16px 0;
}

.perf-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.1) 0%, rgba(212, 175, 110, 0.04) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.perf-value {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.perf-label {
  font-size: 10px;
  color: rgba(180, 180, 180, 0.7);
  margin-top: 4px;
}

/* Tech highlights - Pro Max 风格 */
.tech-highlights {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
}

.th-card {
  display: flex;
  gap: 14px;
  padding: 18px;
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.th-num {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, rgba(240, 215, 140, 0.5) 0%, rgba(212, 175, 110, 0.3) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.th-card strong {
  display: block;
  font-size: 14px;
  color: rgba(232, 232, 232, 0.95);
  margin-bottom: 6px;
}

.th-card p {
  font-size: 12px;
  color: rgba(180, 180, 180, 0.7);
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
}

/* Security - Pro Max 风格 */
.security-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 16px 0;
}

.sf-item {
  padding: 16px;
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.sf-label {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  font-size: 14px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  border: 2px solid rgba(212, 175, 110, 0.4);
  border-radius: 8px;
  font-family: 'Georgia', serif;
}

.sf-item strong {
  display: block;
  font-size: 13px;
  color: rgba(232, 232, 232, 0.95);
  margin-bottom: 4px;
}

.sf-item span {
  font-size: 11px;
  color: rgba(180, 180, 180, 0.7);
}

/* Audit - Pro Max 风格 */
.audit-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 16px 0;
}

.audit-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.audit-item strong {
  font-size: 14px;
  color: rgba(232, 232, 232, 0.95);
}

.audit-item span {
  font-size: 12px;
  color: rgba(180, 180, 180, 0.7);
}

.audit-date {
  font-size: 11px !important;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  background-color: rgba(212, 175, 110, 0.1);
  padding: 4px 10px;
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 110, 0.2);
}

/* Cert badges - Pro Max 风格 */
.cert-badges {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 16px 0;
}

.cert-badge {
  padding: 16px 10px;
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.1) 0%, rgba(212, 175, 110, 0.03) 100%);
  border: 1px solid rgba(212, 175, 110, 0.2);
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.cert-badge strong {
  display: block;
  font-size: 12px;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
  font-weight: 700;
}

.cert-badge span {
  font-size: 10px;
  color: rgba(180, 180, 180, 0.7);
}

/* Governance - Pro Max 风格 */
.governance-items {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 16px 0;
}

.gov-item {
  padding: 14px 10px;
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.gov-item strong {
  display: block;
  font-size: 12px;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}

.gov-item span {
  font-size: 10px;
  color: rgba(180, 180, 180, 0.7);
}

/* Roadmap - Pro Max 3D 风格 */
.roadmap {
  position: relative;
  padding-left: 28px;
}

.roadmap::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background: linear-gradient(180deg, rgba(212, 175, 110, 0.4) 0%, rgba(212, 175, 110, 0.1) 100%);
}

.rm-item {
  position: relative;
  padding-bottom: 20px;
}

.rm-item:last-child { padding-bottom: 0; }

.rm-marker {
  position: absolute;
  left: -28px;
  top: 6px;
  width: 20px;
  height: 20px;
  background: #0D0D0D;
  border: 2px solid rgba(212, 175, 110, 0.3);
  border-radius: 50%;
  z-index: 1;
}

.rm-item.done .rm-marker {
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 50%, #A68B4B 100%);
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(212, 175, 110, 0.4);
}

.rm-item.current .rm-marker {
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 50%, #A68B4B 100%);
  border-color: transparent;
  box-shadow: 
    0 0 0 4px rgba(212, 175, 110, 0.2),
    0 2px 8px rgba(212, 175, 110, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(212, 175, 110, 0.2), 0 2px 8px rgba(212, 175, 110, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(212, 175, 110, 0.1), 0 2px 12px rgba(212, 175, 110, 0.5); }
}

.rm-content {
  padding: 16px 18px;
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.rm-date {
  font-size: 10px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.rm-content > strong {
  display: block;
  font-size: 15px;
  color: rgba(232, 232, 232, 0.95);
  margin: 8px 0 10px;
}

.rm-content ul {
  margin: 0;
  padding-left: 16px;
}

.rm-content li {
  font-size: 12px;
  color: rgba(180, 180, 180, 0.7);
  margin-bottom: 4px;
}

/* Team - Pro Max 风格 */
.team-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 20px 0;
}

.ts-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px;
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.1) 0%, rgba(212, 175, 110, 0.04) 100%);
  border: 1px solid rgba(212, 175, 110, 0.2);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.ts-value {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 50%, #A68B4B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ts-label {
  font-size: 11px;
  color: rgba(180, 180, 180, 0.7);
  margin-top: 4px;
}

.team-bg {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0;
}

.tb-item {
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 8px;
  font-size: 13px;
  color: rgba(200, 200, 200, 0.85);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Partners - Pro Max 风格 */
.partner-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 16px 0;
}

.partner-item {
  padding: 14px 8px;
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 8px;
  font-size: 11px;
  color: rgba(200, 200, 200, 0.85);
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Risk - Pro Max 风格 */
.risk-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 16px 0;
}

.risk-item {
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(212, 175, 110, 0.08) 0%, rgba(212, 175, 110, 0.02) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.risk-item strong {
  display: block;
  font-size: 13px;
  color: rgba(232, 232, 232, 0.95);
  margin-bottom: 4px;
}

.risk-item span {
  font-size: 12px;
  color: rgba(180, 180, 180, 0.8);
}

.disclaimer-box {
  padding: 18px;
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(12, 12, 12, 0.98) 100%);
  border: 1px solid rgba(212, 175, 110, 0.15);
  border-radius: 10px;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.disclaimer-box p {
  font-size: 12px;
  color: rgba(180, 180, 180, 0.7);
  line-height: 1.7;
  margin: 0;
}

.disclaimer-box strong { 
  background: linear-gradient(135deg, #F0D78C 0%, #D4AF6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Footer - Pro Max 白色风格 */
.doc-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px 24px;
  background: linear-gradient(180deg, #FFFFFF 0%, #F8F8F8 100%);
  text-align: center;
  position: relative;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
}

/* footer 顶部金色装饰线 */
.doc-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(212, 175, 110, 0.6) 20%, 
    rgba(200, 170, 110, 1) 50%, 
    rgba(212, 175, 110, 0.6) 80%, 
    transparent 100%);
}

.footer-line {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, rgba(200, 170, 110, 0.4), #C8AA6E, rgba(200, 170, 110, 0.4));
  margin-bottom: 16px;
  box-shadow: 0 0 8px rgba(200, 170, 110, 0.3);
}

.footer-text {
  font-size: 11px;
  color: rgba(60, 60, 60, 0.7);
  letter-spacing: 1px;
  font-weight: 500;
}

/* ==================== 幻灯片介绍区域样式 ==================== */
.slideshow-section {
  padding: 20px;
  background: linear-gradient(180deg, #FFFEF8 0%, #FFF9E8 100%);
  border-bottom: 1px solid rgba(212, 175, 110, 0.3);
}

.slideshow-canvas {
  max-width: 400px;
  margin: 0 auto;
  padding: 10px;
}

.slide-svg {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05));
}

.slide-main-title {
  font-size: 22px;
  font-weight: 700;
  fill: #1a1a1a;
  font-family: 'Georgia', serif;
}

.slide-subtitle {
  font-size: 10px;
  fill: #666;
  letter-spacing: 1px;
  font-family: -apple-system, sans-serif;
}

.slide-line {
  fill: none;
  stroke: #333;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 500;
  stroke-dashoffset: 500;
}

.slide-group.active .slide-line {
  animation: slideDrawLine 0.6s ease-out forwards;
}

@keyframes slideDrawLine {
  to { stroke-dashoffset: 0; }
}

.gold-line { stroke: #B8860B; }

.token-line {
  stroke: #C8AA6E;
  stroke-width: 3;
}

.slide-arrow {
  fill: none;
  stroke: #333;
  stroke-width: 2;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
}

.slide-group.active .slide-arrow {
  animation: slideDrawLine 0.4s ease-out forwards;
}

.slide-label {
  font-size: 12px;
  font-weight: 600;
  fill: #1a1a1a;
  font-family: -apple-system, 'PingFang SC', sans-serif;
  opacity: 0;
}

.slide-group.active .slide-label {
  animation: slideFadeIn 0.4s ease-out 0.3s forwards;
}

.slide-label-sub {
  font-size: 9px;
  fill: #888;
  font-family: -apple-system, sans-serif;
  opacity: 0;
}

.slide-group.active .slide-label-sub {
  animation: slideFadeIn 0.4s ease-out 0.4s forwards;
}

@keyframes slideFadeIn {
  to { opacity: 1; }
}

.slide-token {
  font-size: 14px;
  font-weight: 700;
  fill: #C8AA6E;
  font-family: 'Georgia', serif;
  opacity: 0;
}

.slide-group.active .slide-token {
  animation: slideFadeIn 0.4s ease-out 0.3s forwards;
}

.slide-box {
  fill: none;
  stroke: #333;
  stroke-width: 1.5;
  stroke-dasharray: 700;
  stroke-dashoffset: 700;
}

.slide-group.active .slide-box {
  animation: slideDrawLine 0.8s ease-out forwards;
}

.slide-text {
  font-size: 14px;
  fill: #333;
  opacity: 0;
}

.slide-group.active .slide-text {
  animation: slideFadeIn 0.4s ease-out 0.3s forwards;
}

.highlight-box {
  fill: rgba(200, 170, 110, 0.1);
  stroke: #C8AA6E;
}

.slide-big-num {
  font-size: 24px;
  font-weight: 700;
  fill: #C8AA6E;
  font-family: -apple-system, monospace;
  opacity: 0;
}

.slide-group.active .slide-big-num {
  animation: slideFadeIn 0.4s ease-out 0.3s forwards;
}

.slide-formula {
  font-size: 14px;
  font-weight: 600;
  fill: #1a1a1a;
  font-family: 'Georgia', serif;
  opacity: 0;
}

.slide-group.active .slide-formula {
  animation: slideFadeIn 0.4s ease-out 0.5s forwards;
}

.slide-param {
  font-size: 12px;
  fill: #333;
  opacity: 0;
}

.slide-group.active .slide-param {
  animation: slideFadeIn 0.3s ease-out forwards;
}

.param-key {
  font-weight: 700;
  fill: #C8AA6E;
}

.slide-section-title {
  font-size: 14px;
  font-weight: 600;
  fill: #1a1a1a;
  opacity: 0;
}

.slide-group.active .slide-section-title {
  animation: slideFadeIn 0.3s ease-out forwards;
}

.slide-source-box {
  fill: rgba(200, 170, 110, 0.1);
  stroke: #C8AA6E;
  stroke-width: 1;
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
}

.slide-group.active .slide-source-box {
  animation: slideDrawLine 0.5s ease-out forwards;
}

.slide-source {
  font-size: 12px;
  font-weight: 600;
  fill: #333;
  opacity: 0;
}

.slide-group.active .slide-source {
  animation: slideFadeIn 0.4s ease-out 0.3s forwards;
}

.slide-arch-box {
  fill: rgba(100, 100, 100, 0.1);
  stroke: #666;
  stroke-width: 1.5;
  stroke-dasharray: 400;
  stroke-dashoffset: 400;
}

.slide-group.active .slide-arch-box {
  animation: slideDrawLine 0.5s ease-out forwards;
}

.oracle-box {
  fill: rgba(200, 170, 110, 0.15);
  stroke: #C8AA6E;
}

.contract-box {
  fill: rgba(16, 185, 129, 0.1);
  stroke: #10B981;
}

.token-box {
  fill: rgba(200, 170, 110, 0.2);
  stroke: #C8AA6E;
  stroke-width: 2;
}

.slide-arch-text {
  font-size: 11px;
  font-weight: 600;
  fill: #333;
  opacity: 0;
}

.slide-group.active .slide-arch-text {
  animation: slideFadeIn 0.4s ease-out 0.3s forwards;
}

.slide-arrow-down {
  fill: none;
  stroke: #666;
  stroke-width: 2;
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
}

.slide-group.active .slide-arrow-down {
  animation: slideDrawLine 0.3s ease-out 0.3s forwards;
}

.slide-point {
  font-size: 11px;
  fill: #333;
  font-family: -apple-system, 'PingFang SC', sans-serif;
  opacity: 0;
}

.slide-group.active .slide-point {
  animation: slideFadeIn 0.3s ease-out forwards;
}

.slide-value-box {
  fill: rgba(200, 170, 110, 0.08);
  stroke: #C8AA6E;
  stroke-width: 1;
  stroke-dasharray: 400;
  stroke-dashoffset: 400;
}

.slide-group.active .slide-value-box {
  animation: slideDrawLine 0.5s ease-out forwards;
}

.slide-value-icon {
  font-size: 20px;
  opacity: 0;
}

.slide-group.active .slide-value-icon {
  animation: slideFadeIn 0.3s ease-out 0.3s forwards;
}

.slide-value-title {
  font-size: 12px;
  font-weight: 600;
  fill: #1a1a1a;
  opacity: 0;
}

.slide-group.active .slide-value-title {
  animation: slideFadeIn 0.3s ease-out 0.4s forwards;
}

.slide-value-desc {
  font-size: 10px;
  fill: #666;
  opacity: 0;
}

.slide-group.active .slide-value-desc {
  animation: slideFadeIn 0.3s ease-out 0.5s forwards;
}

.slide-price {
  font-size: 28px;
  font-weight: 700;
  fill: #C8AA6E;
  font-family: -apple-system, monospace;
  opacity: 0;
}

.slide-group.active .slide-price {
  animation: slideFadeIn 0.4s ease-out 0.3s forwards;
}

.slide-eco-box {
  fill: rgba(200, 170, 110, 0.1);
  stroke: #C8AA6E;
  stroke-width: 1.5;
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
}

.slide-group.active .slide-eco-box {
  animation: slideDrawLine 0.5s ease-out forwards;
}

.slide-eco-text {
  font-size: 11px;
  font-weight: 600;
  fill: #333;
  opacity: 0;
}

.slide-group.active .slide-eco-text {
  animation: slideFadeIn 0.4s ease-out 0.3s forwards;
}

.slide-step-circle {
  fill: rgba(200, 170, 110, 0.15);
  stroke: #C8AA6E;
  stroke-width: 2;
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
}

.slide-group.active .slide-step-circle {
  animation: slideDrawLine 0.5s ease-out forwards;
}

.slide-step-circle.highlight {
  fill: rgba(200, 170, 110, 0.3);
  stroke-width: 3;
}

.slide-step-num {
  font-size: 16px;
  font-weight: 700;
  fill: #C8AA6E;
  opacity: 0;
}

.slide-group.active .slide-step-num {
  animation: slideFadeIn 0.3s ease-out 0.3s forwards;
}

/* 页码指示器 */
.slide-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.slide-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ddd;
  transition: all 0.3s;
  cursor: pointer;
}

.slide-indicator:hover {
  background: #bbb;
}

.slide-indicator.active {
  background: #C8AA6E;
  width: 20px;
  border-radius: 4px;
}

/* 控制按钮 */
.slide-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding: 0 10px;
}

.slide-ctrl-btn {
  padding: 10px 24px;
  background: transparent;
  border: 1px solid #333;
  border-radius: 20px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.slide-ctrl-btn:hover:not(:disabled) {
  background: #333;
  color: #fff;
}

.slide-ctrl-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.slide-ctrl-btn.primary {
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  border: none;
  color: #fff;
}

.slide-ctrl-btn.primary:hover {
  opacity: 0.9;
}

.slide-page-num {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}
</style>
