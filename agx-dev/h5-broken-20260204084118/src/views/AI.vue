<template>
  <div class="ai-page">
    <!-- 头部 -->
    <div class="header">
      <button class="back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="title">
        <div class="avatar">
          <img src="/agx-new.png" alt="AGX">
        </div>
        <div class="info">
          <span class="name">AI 助手</span>
          <span class="status">{{ loading ? '思考中...' : '在线' }}</span>
        </div>
      </div>
      <button class="service-btn" @click="contactService">
        <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
          <path d="M12 2C6.48 2 2 6.48 2 12v6c0 1.1.9 2 2 2h2v-8H4v-2c0-4.42 3.58-8 8-8s8 3.58 8 8v2h-2v8h2c1.1 0 2-.9 2-2v-6c0-5.52-4.48-10-10-10z" fill="currentColor"/>
          <circle cx="9" cy="13" r="1" fill="currentColor"/>
          <circle cx="15" cy="13" r="1" fill="currentColor"/>
        </svg>
        <span>人工客服</span>
      </button>
    </div>

    <!-- 消息区 -->
    <div class="body" ref="bodyRef">
      <!-- 欢迎消息 -->
      <div class="msg-row ai">
        <div class="msg-avatar">
          <img src="/agx-new.png" alt="AGX">
        </div>
        <div class="msg-bubble">
          <p class="hi">👋 您好，<strong>{{ userAssets.userName }}</strong>！我是您的专属 <strong>AI客服</strong></p>
          <p>我可以帮您：</p>
          <div class="helps">
            <span v-for="h in helps" :key="h">{{ h }}</span>
          </div>
          <p class="ask">请问有什么可以帮您？</p>
        </div>
      </div>
      
      <!-- 对话消息 -->
      <div v-for="(msg, idx) in messages" :key="idx" :class="['msg-row', msg.role]">
        <div class="msg-avatar" v-if="msg.role === 'ai'">
          <img src="/agx-new.png" alt="AGX">
        </div>
        <div class="msg-avatar user-avatar" v-if="msg.role === 'user'">
          <img :src="userAvatar" alt="User">
        </div>
        <div class="msg-bubble">
          <div class="msg-content" v-html="formatMessage(msg.content)"></div>
        </div>
      </div>
      
      <!-- 加载中 -->
      <div v-if="loading" class="msg-row ai">
        <div class="msg-avatar">
          <img src="/agx-new.png" alt="AGX">
        </div>
        <div class="msg-bubble loading">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="footer">
      <div class="input-wrap">
        <input v-model="text" placeholder="输入问题..." @keyup.enter="send" :disabled="loading"/>
        <button :class="{ on: text.trim() && !loading }" @click="send" :disabled="loading">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 客服分配弹窗 -->
    <div class="service-modal" v-if="showServiceModal" @click.self="closeServiceModal">
      <div class="service-card">
        <!-- 加载中 -->
        <div v-if="serviceLoading" class="service-loading">
          <div class="loading-spinner"></div>
          <p>AI正在为您匹配专属客服...</p>
        </div>
        
        <!-- 分配结果 -->
        <div v-else-if="assignedService" class="service-result">
          <div class="service-header">
            <span class="check-icon">✓</span>
            <span>客服已分配</span>
          </div>
          
          <div class="service-info">
            <div class="service-avatar">
              <img :src="assignedService.avatar || '/agx-new.png'" :alt="assignedService.name">
              <span class="online-dot" v-if="assignedService.status === 'online'"></span>
            </div>
            <div class="service-detail">
              <div class="service-name">{{ assignedService.name }}</div>
              <div class="service-status">
                <span class="status-dot"></span>
                {{ assignedService.status === 'online' ? '在线' : '离线' }}
                <span class="wait-time">· {{ assignedService.waitTime }}</span>
              </div>
            </div>
          </div>
          
          <div class="assign-reason">{{ assignedService.assignReason }}</div>
          
          <div class="contact-type">
            <span class="type-label">联系方式：</span>
            <span class="type-value">
              {{ assignedService.contactType === 'telegram' ? 'Telegram' : 
                 assignedService.contactType === 'whatsapp' ? 'WhatsApp' :
                 assignedService.contactType === 'wechat' ? '微信' : '邮箱' }}
            </span>
          </div>
          
          <div class="service-actions">
            <button class="btn-cancel" @click="closeServiceModal">稍后联系</button>
            <button class="btn-connect" @click="connectToService">立即联系</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const text = ref('')
const loading = ref(false)
const messages = ref([])
const bodyRef = ref(null)
const helps = ['💰 资产查询', '📅 产品到期', '📊 行情分析', '💡 业务咨询']

// 用户头像 - 从用户store获取
const userStore = useUserStore()
const defaultAvatar = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#30363D"/><circle cx="20" cy="15" r="7" fill="#8B949E"/><path d="M6 35c0-8 6-12 14-12s14 4 14 12" fill="#8B949E"/></svg>')
const userAvatar = computed(() => userStore.userInfo.avatar || defaultAvatar)

// ============ 用户资产数据（后端接口预留）============
// TODO: 替换为真实后端接口
// const fetchUserAssets = async () => await api.get('/user/assets')
// const fetchUserProducts = async () => await api.get('/user/products')

// 人工客服状态
const serviceLoading = ref(false)

// 模拟用户资产数据（演示用，实际需从后端获取）
const userAssets = computed(() => ({
  // 基本信息
  userId: userStore.userInfo.id || 'U10086',
  userName: userStore.userInfo.nickname || userStore.userInfo.username || '尊贵用户',
  vipLevel: userStore.userInfo.vipLevel || 'VIP2',
  phone: userStore.userInfo.phone || '138****8888',
  // 推荐人信息（用于分配客服）
  referrerId: userStore.userInfo.referrerId || userStore.userInfo.inviteCode || '',
  referrerName: userStore.userInfo.referrerName || '',
  
  // 资产概览
  totalAssets: '125,680.00',      // 总资产(USDT)
  availableBalance: '45,230.50',  // 可用余额(USDT)
  frozenBalance: '5,000.00',      // 冻结金额(USDT)
  agxHolding: '1,156.88',         // AGX持仓数量
  agxValue: '75,449.50',          // AGX持仓价值(USDT)
  
  // 持仓产品
  products: [
    {
      name: 'AGX黄金矿机-高级版',
      type: '矿机租赁',
      amount: '10,000 USDT',
      dailyReturn: '0.8%',
      startDate: '2025-01-15',
      endDate: '2025-07-15',
      daysRemaining: 162,
      totalEarned: '1,520.00 USDT'
    },
    {
      name: 'IEO认购-AGX二期',
      type: 'IEO认购',
      amount: '5,000 USDT',
      expectedReturn: '预计收益 25%',
      startDate: '2025-01-20',
      endDate: '2025-04-20',
      daysRemaining: 76,
      status: '锁仓中'
    },
    {
      name: '黄金期权合约',
      type: '合约交易',
      amount: '2,000 USDT',
      leverage: '10x',
      direction: '做多',
      entryPrice: '2,635.00',
      currentPnL: '+328.50 USDT'
    }
  ],
  
  // 最近交易
  recentTransactions: [
    { type: '买入AGX', amount: '+500 AGX', time: '2025-02-02 14:30' },
    { type: '矿机收益', amount: '+80 USDT', time: '2025-02-02 00:00' },
    { type: '充值', amount: '+2,000 USDT', time: '2025-02-01 10:15' }
  ]
}))

// 构建包含用户信息的系统提示词
const buildSystemPrompt = () => {
  const user = userAssets.value
  const productsInfo = user.products.map((p, i) => 
    `  ${i+1}. ${p.name}（${p.type}）
     - 投入金额：${p.amount}
     - ${p.endDate ? `到期时间：${p.endDate}（剩余${p.daysRemaining}天）` : ''}
     - ${p.dailyReturn ? `日收益率：${p.dailyReturn}` : ''}${p.currentPnL ? `当前盈亏：${p.currentPnL}` : ''}`
  ).join('\n')
  
  return `你是AGX的AI智能客服，正在为已登录用户提供专属服务。

【当前用户信息】
- 用户ID：${user.userId}
- 用户昵称：${user.userName}
- VIP等级：${user.vipLevel}
- 手机号：${user.phone}

【用户资产概览】
- 总资产价值：${user.totalAssets} USDT
- 可用余额：${user.availableBalance} USDT
- 冻结金额：${user.frozenBalance} USDT
- AGX持仓：${user.agxHolding} AGX（价值 ${user.agxValue} USDT）

【用户持有产品】
${productsInfo}

============ AGX品牌介绍 ============

【什么是AGX】
AGX — Ascenda Gold Index（升达金指币）
全球首个采用“美联储黄金储备指数绑定机制”的数字资产。

AGX 是当前少数直接采用 Federal Reserve Gold Inventory（美联储官方黄金持仓）作为价值基础的链上黄金指数资产。

【核心机制】
AGX 不是由美联储发行，而是：
• 以美联储黄金储备作为基础价值锬（Base Gold Indicator）
• 以美联储公布的黄金价格、储备规模和季度报告作为链上指数的唯一数据源

【数据来源】
AGX 使用的官方数据包括：
• FT900 报表黄金储备数据
• 美联储官方披露黄金库存（Official Gold Holdings）
• 美国财政部黄金会计表（Gold Certificates Account）
• 伦敦金现货价格（LBMA Gold Price）

所有数据通过区块链 Oracle 金融预言机实时同步，形成可验证、无篡改的黄金价值曲线。

简单说：AGX = 美联储黄金价值指数的数字化映射

【GIB 黄金指数绑定系统】
AGX 不采用传统的“1 AGX = 1 克黄金”模式，而是使用业内首创的：
GIB — Gold Index Binding（黄金指数绑定系统）

计算因子包括：
1. 美联储黄金持仓变动
2. LBMA 金价（伦敦基准价）
3. 美元实际利率（Real Yield）
4. 全球央行黄金购买趋势
5. 美国 CPI 通胀变化率（Inflation Impact）

最终形成链上的 AGX-PX（Price Index）价格指数。

一句话解释：AGX 不是死的黄金，它是“跟着美联储黄金政策动的黄金指数资产”。

【三大技术亮点】
① 可验证的储备指数
   所有美联储黄金相关数据均通过 Oracle 链上记录，可随时查证

② 跨境秒级交易
   AGX 可以在全球钱包中 1 秒完成价值转移，传统黄金市场无法做到

③ 可作为 DeFi 抵押的黄金指数资产
   黄金第一次可以参与链上理财、借贷、杠杆与资产组合

【市场背景】
全球正在加速进入“去美元化（De-Dollarization）”进程：
• 各国央行加速购买黄金以降低美元储备比例
• 黄金重要性提升
• 黄金数字化成为趋势
• 跨境黄金价值结算需求激增

AGX 提供了一种全新的路径：用链上方式共享美联储黄金价值，而不需要持有实体黄金。

【官方声明】
AGX 不是美联储发行的数字货币，但其定价和指数机制完全建立在美联储公开披露的黄金储备体系之上。
AGX 的使命是让全球用户以数字方式共享这一价值锬。

【发行机构】
Ascenda Digital Capital Group（升达数字资本集团）
- 总部位于新加坡
- MAS（新加坡金融管理局）监管
- 专注于数字黄金资产基础设施建设
- 已服务超过50万全球用户

【品牌理念】
- 品牌名称：AGX（Ascenda Gold Index / 升达金指币）
- 品牌使命：“让黄金储值更简单，让数字资产更稳健”
- 品牌色彩：金色（#C8AA6E）象征尊贵、信任、稳健

【核心价值】
1. 安全性 - 银行级加密技术，冷热钱包分离存储
2. 透明度 - 所有交易链上可查，实时审计
3. 低门槛 - 最低0.001 AGX起购，无资金限制
4. 高收益 - 多元化理财产品，稳健增值

【平台优势】
- 黄金背书：每个AGX代币由等值实物黄金支撑，存储于新加坡金库
- 24/7交易：全天候不间断交易，即时买卖
- 多币种支持：支持USDT/USDC/BTC/ETH等主流资产
- 极速到账：充值实时到账，提现24小时内处理
- VIP体系：5个VIP等级，享受手续费折扣、专属客服等特权

【核心业务详解】

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
① AGX申购（IEO认购）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【是什么】
AGX新币首发认购，以优惠价格提前买入AGX代币，锁仓到期后可获得额外收益。

【怎么玩】
1. 进入「AGX申购」页面
2. 查看当期认购信息：发行总量、已售出、剩余额度、参与人数
3. 输入认购数量（单位：USDT）
4. 点击「立即申购」完成购买

【关键规则】
- 认购价格：约 0.048 USDT/AGX（低于市场价）
- 锁仓期限：购买后锁仓，到期自动释放到账户
- 最低认购：100 USDT 起
- 预期收益：历史平均 20%-50%

【举个例子】
用户花 1000 USDT 认购 → 获得约 20,833 AGX → 锁仓90天 → 到期时若AGX涨到 0.06 USDT → 可卖出获得 1,250 USDT（收益25%）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
② 矿机租赁（黄金矿池）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【是什么】
租用平台算力矿机，每天自动产生AGX收益，类似「存钱生息」，稳定被动收入。

【怎么玩】
1. 进入「矿池」页面
2. 浏览不同等级矿机产品（入门版/基础版/进阶版/高级版）
3. 选择合适的矿机，输入投入金额
4. 确认购买，开始每日自动产币

【产品类型】
- 入门版：1000-5000 USDT，日化 0.5%，周期30天
- 基础版：5000-20000 USDT，日化 0.65%，周期60天
- 进阶版：20000-50000 USDT，日化 0.8%，周期90天
- 高级版：50000+ USDT，日化 1.0%，周期180天

【收益说明】
- 每日0点自动结算收益
- 收益以AGX形式发放到账户
- 到期后本金自动释放

【举个例子】
投入 10,000 USDT 购买高级版矿机 → 日化1.0% → 每天产出 100 USDT 等值AGX → 180天总收益 18,000 USDT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
③ 黄金期权合约（秒合约）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【是什么】
基于国际黄金价格(XAU/USD)的短期预测交易，判断未来一段时间黄金是涨还是跌。

【怎么玩】
1. 进入「合约」页面，查看实时黄金行情
2. 选择投资期限：30秒/60秒/120秒/5分钟
3. 选择方向：看涨（买涨）或 看跌（买跌）
4. 输入投资金额，点击确认下单
5. 等待到期结算

【收益规则】
- 预测正确：获得投资金额 × 收益率（约85%）
- 预测错误：损失投入本金

【期限选择】
- 30秒合约：快速刺激，适合短线判断
- 60秒合约：最受欢迎，节奏适中
- 120秒合约：有更多观察时间
- 5分钟合约：适合趋势判断

【举个例子】
投入 100 USDT 买涨 60秒 → 60秒后黄金价格上涨 → 预测正确 → 获得 185 USDT（本金100 + 收益85）

【风险提示】
合约交易风险较高，建议新手先用小金额熟悉规则，切勿重仓。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
④ 跟单交易
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【是什么】
跟随平台认证的专业交易员操作，交易员买你就买，交易员卖你就卖，省心省力赚收益。

【怎么玩】
1. 进入「跟单」页面
2. 浏览交易员列表，查看每位交易员的：
   - 累计收益率
   - 胜率
   - 跟随人数
   - 近期战绩
3. 选择心仪的交易员，设置跟单金额
4. 点击「一键跟单」，系统自动跟随操作

【核心数据】
- 全网跟单总额：实时显示平台跟单资金规模
- 跟单用户数：参与跟单的用户数量
- 活跃交易员：当前在线操盘的交易员数量

【跟单设置】
- 单笔跟单金额：每次跟随交易的金额
- 最大持仓：同时跟随的最大仓位
- 止盈止损：可设置自动平仓条件

【举个例子】
设置跟单金额 500 USDT 跟随「金牌交易员A」→ 交易员开多单 → 系统自动帮你开 500 USDT 多单 → 交易员平仓获利 → 你也同步获利

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⑤ OTC场外交易
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【是什么】
用人民币(CNY)直接买卖USDT的通道，类似「数字货币兑换店」。

【怎么玩】

买入USDT：
1. 进入「OTC」页面，选择「买入」
2. 查看当前汇率（如 1 USDT = 7.28 CNY）
3. 输入要购买的USDT数量
4. 选择商家（查看商家成交量、好评率）
5. 确认订单，按商家提供的收款方式付款
6. 付款后点击「已付款」，等待商家放币

卖出USDT：
1. 选择「卖出」，输入要卖出的USDT数量
2. 选择商家
3. 确认订单，等待买家付款
4. 收到付款后，系统自动放币给买家

【商家信息】
- 成交单数：历史成交订单数量
- 成交率：订单完成率
- 平均放币时间：通常5-15分钟

【支付方式】
- 银行卡转账
- 支付宝
- 微信支付

【安全保障】
OTC交易由平台担保，USDT先冻结在平台，确认收款后才放币，保障双方权益。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⑥ 币币交易（现货交易）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【是什么】
用USDT购买AGX或其他数字货币，或把持有的币卖出换成USDT，类似股票买卖。

【怎么玩】
1. 进入「交易」页面
2. 选择交易对（如 AGX/USDT）
3. 查看行情：
   - K线图：价格走势
   - 盘口：买卖挂单情况
   - 最新成交：实时交易记录
4. 选择买入或卖出
5. 输入价格和数量（或选择市价单）
6. 确认下单

【订单类型】
- 限价单：指定价格买卖，到价成交
- 市价单：按当前市场价立即成交

【交易对说明】
AGX/USDT 表示用 USDT 买卖 AGX
- 买入：花 USDT 买 AGX
- 卖出：把 AGX 卖掉换成 USDT

【举个例子】
当前 AGX 价格 0.065 USDT，你有 1000 USDT：
- 市价买入 → 获得约 15,384 个 AGX
- 等 AGX 涨到 0.08 USDT 时卖出 → 获得 1,230 USDT → 赚了 230 USDT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【业务对比一览】
| 业务 | 风险等级 | 操作难度 | 适合人群 |
|------|---------|---------|----------|
| AGX申购 | 低 | 简单 | 稳健型，想获得优惠价 |
| 矿机租赁 | 低 | 简单 | 喜欢被动收入，长期持有 |
| 黄金期权 | 高 | 中等 | 有经验，喜欢短线刺激 |
| 跟单交易 | 中 | 简单 | 新手，想跟专业人士 |
| OTC交易 | 低 | 简单 | 需要法币出入金 |
| 币币交易 | 中 | 中等 | 有交易经验，想自主操作 |

【新手推荐路径】
1. 先通过 OTC 买入 USDT（入金）
2. 参与 AGX申购 或 矿机租赁（稳健起步）
3. 熟悉后尝试 跟单交易（跟随高手）
4. 有经验后尝试 币币交易 或 合约（自主交易）

【安全保障】
- SSL加密传输
- 双重身份验证（2FA）
- 冷钱包存储98%资产
- 风控系统24小时监控
- 与知名保险公司合作资产保障

【常见问题】
- 充值支持：USDT(TRC20/ERC20)、银行卡、信用卡
- 提现时间：申请后24小时内到账
- 最低充值：10 USDT
- 最低提现：50 USDT
- 手续费：充值免费，提现1-2 USDT
- 客服时间：7x24小时在线

【联系方式】
- 官网：www.agx.bi
- 客服邮箱：support@agx.bi
- Telegram官方群：@AGX_Official

============ 回答规范 ============

1. 称呼用户为「${user.userName}」，体现个性化服务
2. 当用户询问资产、余额、持仓时，直接告知上述真实数据
3. 当用户询问产品到期时间，告知具体日期和剩余天数
4. 当用户询问公司/品牌/平台时，根据上述品牌介绍回答
5. 用简洁专业的语言回答，保持友好亲切的语气
6. 涉及投资建议时提醒风险：“投资有风险，请根据您的风险承受能力谨慎决策”
7. 复杂问题或账户异常建议联系人工客服`
}

// DeepSeek API配置 - 通过后端代理调用，避免前端暴露密钥
import api from '@/utils/api'

// 格式化消息（处理 markdown 样式）- 添加XSS防护
import { sanitizeHtml } from '@/utils/sanitize'

const formatMessage = (content) => {
  if (!content) return ''
  
  // 首先转义HTML特殊字符，防止XSS
  let formatted = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
  
  // 处理加粗标题 **内容** -> 高亮样式
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<span class="highlight-title">$1</span>')
  // 处理数字列表 1. 2. 3. - 包裹整行
  formatted = formatted.replace(/^(\d+\.\s)(.*)$/gm, '<div class="list-item"><span class="list-number">$1</span><span>$2</span></div>')
  // 处理 - 列表项 - 包裹整行
  formatted = formatted.replace(/^-\s(.*)$/gm, '<div class="list-item"><span class="list-bullet">•</span><span>$1</span></div>')
  // 値处理包裹后的换行
  formatted = formatted.replace(/<\/div>\n/g, '</div>')
  // 处理换行
  formatted = formatted.replace(/\n/g, '<br>')
  
  return formatted
}

// ============ 人工客服分配逻辑 ============
// 根据用户的推荐链分配客服（向上追溯到根推广码）
// 例如：张三的推广码 -> 张三的所有下线（不管几层）都进入同一个客服
const contactService = async () => {
  if (serviceLoading.value) return
  serviceLoading.value = true
  
  try {
    const user = userAssets.value
    
    // 调用后端接口：根据用户ID追溯推荐链，找到对应的客服链接
    // 后端逻辑：
    // 1. 查找用户的直接推荐人
    // 2. 如果推荐人不在配置表中，继续向上查找推荐人的推荐人
    // 3. 一直追溯到找到配置表中的"根推广码"
    // 4. 返回该根推广码对应的客服链接
    const response = await api.support?.getServiceLink?.({
      userId: user.userId
    }) || { success: false }
    
    let serviceUrl = ''
    
    if (response.success && response.data?.url) {
      // 后台返回对应的客服链接
      serviceUrl = response.data.url
    } else {
      // 后端未配置时，跳转默认客服
      serviceUrl = 'https://t.me/AGX_Service'
    }
    
    // 直接跳转到客服链接
    if (serviceUrl) {
      window.open(serviceUrl, '_blank')
    }
    
    // 记录日志
    api.support?.logAssignment?.({
      userId: user.userId,
      serviceUrl: serviceUrl,
      assignTime: new Date().toISOString()
    }).catch(() => {})
    
  } catch (error) {
    console.error('[客服分配] 请求失败:', error)
    // 降级：跳转默认客服
    window.open('https://t.me/AGX_Service', '_blank')
  } finally {
    serviceLoading.value = false
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (bodyRef.value) {
      bodyRef.value.scrollTop = bodyRef.value.scrollHeight
    }
  })
}

// 发送消息
const send = async () => {
  const userText = text.value.trim()
  if (!userText || loading.value) return
  
  // 添加用户消息
  messages.value.push({ role: 'user', content: userText })
  text.value = ''
  loading.value = true
  scrollToBottom()
  
  try {
    // 构建对话历史
    const chatHistory = messages.value.map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content
    }))
    
    // 通过后端API调用，避免前端暴露密钥
    const response = await api.ai.customerServiceChat({
      message: userText,
      history: chatHistory,
      context: buildSystemPrompt()
    })
    
    if (!response.success) {
      throw new Error('API请求失败')
    }
    
    const aiReply = response.data?.reply || '抱歉，我暂时无法回答这个问题。'
    
    // 添加AI回复
    messages.value.push({ role: 'ai', content: aiReply })
  } catch (error) {
    console.error('AI请求失败:', error)
    messages.value.push({ 
      role: 'ai', 
      content: '抱歉，网络连接出现问题，请稍后再试。如有紧急问题，请联系在线客服。' 
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

const goBack = () => { router.back() }
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.ai-page {
  height: 100vh;
  height: 100dvh; /* 动态视口高度，解决移动端地址栏问题 */
  display: flex;
  flex-direction: column;
  background: #0D1117;
  color: #E6EDF3;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: #161B22;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  border: none;
  border-radius: 10px;
  color: #8B949E;
  cursor: pointer;
}

.title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 12px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 14px;
  font-weight: 500;
}

.status {
  font-size: 10px;
  color: #8B949E;
}

.tag {
  padding: 4px 10px;
  background: rgba(200,170,110,0.1);
  border-radius: 8px;
  font-size: 10px;
  color: #C8AA6E;
}

.service-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  margin-left: 8px;
  background: rgba(200,170,110,0.12);
  border: 1px solid rgba(200,170,110,0.25);
  border-radius: 6px;
  color: #C8AA6E;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.service-btn:active {
  background: rgba(200,170,110,0.2);
  transform: scale(0.97);
}

.service-btn svg {
  opacity: 0.85;
}

.body {
  flex: 1;
  padding: 16px;
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.msg-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.msg-row.user {
  align-items: flex-end;
}

.msg-row.user .msg-avatar {
  align-self: flex-end;
}

.msg-row.user .msg-bubble {
  background: linear-gradient(135deg, rgba(200,170,110,0.2) 0%, rgba(200,170,110,0.1) 100%);
  border: 1px solid rgba(200,170,110,0.3);
}

.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.msg-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.msg-bubble {
  padding: 12px 14px;
  background: #161B22;
  border-radius: 12px;
  max-width: calc(100% - 44px);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.msg-bubble.loading {
  display: flex;
  gap: 4px;
  padding: 16px 20px;
}

.msg-bubble.loading .dot {
  width: 8px;
  height: 8px;
  background: #C8AA6E;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.msg-bubble.loading .dot:nth-child(1) { animation-delay: -0.32s; }
.msg-bubble.loading .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.msg-bubble p {
  margin: 0 0 8px;
  font-size: 14px;
  color: #8B949E;
}

.msg-content {
  font-size: 14px;
  line-height: 1.85;
  color: #C9D1D9;
  word-break: break-word;
  letter-spacing: 0.3px;
}

/* AI 回复样式美化 */
.msg-content :deep(.highlight-title) {
  display: inline-block;
  color: #C8AA6E;
  font-weight: 600;
  margin: 8px 0 4px;
  padding: 2px 8px;
  background: rgba(200,170,110,0.1);
  border-radius: 4px;
  border-left: 2px solid #C8AA6E;
}

.msg-content :deep(.list-number) {
  display: inline-block;
  min-width: 20px;
  color: #C8AA6E;
  font-weight: 600;
}

.msg-content :deep(.list-bullet) {
  display: inline-block;
  color: #C8AA6E;
  margin-right: 4px;
}

/* 列表行样式 */
.msg-content :deep(.list-item) {
  display: flex;
  align-items: flex-start;
  padding: 6px 0;
  padding-left: 4px;
  margin: 2px 0;
  border-radius: 6px;
  transition: background 0.2s;
}

.msg-content :deep(.list-item:hover) {
  background: rgba(200,170,110,0.05);
}

/* 段落间距 */
.msg-content :deep(br + br) {
  display: block;
  content: '';
  margin-top: 12px;
}

.msg-row.user .msg-content {
  color: #E6EDF3;
}

.msg-row.ai .msg-bubble {
  background: linear-gradient(135deg, #1C2128 0%, #161B22 100%);
  border: 1px solid #30363D;
  box-shadow: 0 2px 12px rgba(0,0,0,0.25);
  padding: 14px 16px;
}

.user-avatar img {
  border: 2px solid rgba(200,170,110,0.4);
}

.hi { color: #E6EDF3 !important; }
.hi strong { color: #C8AA6E; }

.helps {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0;
}

.helps span {
  padding: 6px 10px;
  background: rgba(200,170,110,0.08);
  border-radius: 6px;
  font-size: 12px;
  color: #C8AA6E;
}

.ask {
  font-size: 13px !important;
  color: #6E7681 !important;
}

.footer {
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
  background: #161B22;
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 4px 4px 12px;
  background: #1E262F;
  border-radius: 20px;
}

.input-wrap input {
  flex: 1;
  min-width: 0;
  padding: 10px 0;
  background: none;
  border: none;
  color: #E6EDF3;
  font-size: 16px; /* 防止iOS自动缩放 */
  outline: none;
  -webkit-appearance: none;
}

.input-wrap input::placeholder { color: #6E7681; }

.input-wrap button {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200,170,110,0.1);
  border: none;
  border-radius: 50%;
  color: #6E7681;
  cursor: pointer;
}

.input-wrap button.on {
  background: rgba(200,170,110,0.2);
  color: #C8AA6E;
}

/* 客服分配弹窗 */
.service-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.service-card {
  width: 100%;
  max-width: 340px;
  background: linear-gradient(135deg, #1C2128 0%, #161B22 100%);
  border-radius: 16px;
  border: 1px solid #30363D;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.service-loading {
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(200,170,110,0.2);
  border-top-color: #C8AA6E;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.service-loading p {
  color: #8B949E;
  font-size: 14px;
}

.service-result {
  padding: 24px 20px;
}

.service-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.check-icon {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #C8AA6E 0%, #9A7B4F 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
}

.service-header span:last-child {
  color: #E6EDF3;
  font-size: 16px;
  font-weight: 600;
}

.service-info {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: rgba(200,170,110,0.08);
  border-radius: 12px;
  margin-bottom: 16px;
}

.service-avatar {
  position: relative;
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}

.service-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(200,170,110,0.3);
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #22C55E;
  border-radius: 50%;
  border: 2px solid #161B22;
}

.service-detail {
  flex: 1;
}

.service-name {
  font-size: 16px;
  font-weight: 600;
  color: #E6EDF3;
  margin-bottom: 4px;
}

.service-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8B949E;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #22C55E;
  border-radius: 50%;
}

.wait-time {
  color: #6E7681;
}

.assign-reason {
  text-align: center;
  font-size: 13px;
  color: #C8AA6E;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(200,170,110,0.1);
  border-radius: 8px;
}

.contact-type {
  text-align: center;
  font-size: 13px;
  color: #8B949E;
  margin-bottom: 20px;
}

.type-label {
  color: #6E7681;
}

.type-value {
  color: #E6EDF3;
  font-weight: 500;
}

.service-actions {
  display: flex;
  gap: 12px;
}

.service-actions button {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: rgba(255,255,255,0.05);
  border: 1px solid #30363D;
  color: #8B949E;
}

.btn-cancel:active {
  background: rgba(255,255,255,0.1);
}

.btn-connect {
  background: linear-gradient(135deg, #C8AA6E 0%, #9A7B4F 100%);
  border: none;
  color: #fff;
}

.btn-connect:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 移动端响应式优化 */
@media screen and (max-width: 375px) {
  .header {
    padding: 10px 12px;
    padding-top: calc(10px + env(safe-area-inset-top));
  }
  
  .service-btn span {
    display: none;
  }
  
  .service-btn {
    padding: 8px;
    min-width: 36px;
    justify-content: center;
  }
  
  .helps {
    gap: 4px;
  }
  
  .helps span {
    padding: 5px 8px;
    font-size: 11px;
  }
  
  .body {
    padding: 12px;
  }
  
  .msg-bubble {
    padding: 10px 12px;
  }
  
  .msg-content {
    font-size: 13px;
  }
}

/* 横屏模式 */
@media screen and (orientation: landscape) and (max-height: 500px) {
  .header {
    padding: 8px 16px;
  }
  
  .body {
    padding: 10px 16px;
  }
  
  .msg-row {
    margin-bottom: 10px;
  }
  
  .footer {
    padding: 8px 16px;
  }
}

/* 大屏幕居中 */
@media screen and (min-width: 768px) {
  .ai-page {
    max-width: 500px;
    margin: 0 auto;
    border-left: 1px solid #30363D;
    border-right: 1px solid #30363D;
  }
}
</style>
