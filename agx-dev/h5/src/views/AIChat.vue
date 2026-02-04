<template>
  <div class="ai-chat-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-grid"></div>
      <div class="bg-lines">
        <div class="line line-1"></div>
        <div class="line line-2"></div>
        <div class="line line-3"></div>
      </div>
    </div>

    <!-- ============ 入口页面 ============ -->
    <div class="landing-page" v-if="showLanding">
      <!-- 返回按钮 -->
      <button class="back-btn landing-back" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Logo 动画 -->
      <div class="landing-logo" :class="{ 'animate-in': animateStep >= 1 }">
        <div class="logo-outer-ring"></div>
        <div class="logo-middle-ring"></div>
        <div class="logo-inner">
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="18" stroke="#C8AA6E" stroke-width="1.5" stroke-dasharray="4 3"/>
            <circle cx="24" cy="24" r="12" stroke="#C8AA6E" stroke-width="1" opacity="0.6"/>
            <circle cx="24" cy="24" r="6" fill="#C8AA6E"/>
            <circle cx="24" cy="24" r="3" fill="#0D1117"/>
          </svg>
        </div>
      </div>

      <!-- 标题 -->
      <div class="landing-title" :class="{ 'animate-in': animateStep >= 2 }">
        <span class="title-agx">AGX</span>
        <span class="title-ai">AI</span>
      </div>

      <!-- 副标题 -->
      <p class="landing-subtitle" :class="{ 'animate-in': animateStep >= 2 }">
        智能金融助手 | Smart Finance Assistant
      </p>

      <!-- 功能卡片 -->
      <div class="feature-cards">
        <div class="feature-card purple" :class="{ 'animate-in': animateStep >= 3 }">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 3v18h18M7 14l4-4 4 4 5-5"/>
            </svg>
          </div>
          <div class="feature-text">
            <h3>智能行情分析</h3>
            <p>实时市场洞察</p>
          </div>
        </div>

        <div class="feature-card gold" :class="{ 'animate-in': animateStep >= 4 }">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polygon points="12,2 15,9 22,9 17,14 19,22 12,18 5,22 7,14 2,9 9,9"/>
            </svg>
          </div>
          <div class="feature-text">
            <h3>投资建议</h3>
            <p>个性化策略推荐</p>
          </div>
        </div>

        <div class="feature-card purple" :class="{ 'animate-in': animateStep >= 5 }">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="feature-text">
            <h3>7×24 客服</h3>
            <p>全天候智能响应</p>
          </div>
        </div>

        <div class="feature-card green" :class="{ 'animate-in': animateStep >= 6 }">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="feature-text">
            <h3>风险预警</h3>
            <p>智能安全防护</p>
          </div>
        </div>
      </div>

      <!-- 开启对话按钮 -->
      <button class="start-chat-btn" :class="{ 'animate-in': animateStep >= 7 }" @click="enterChat">
        <div class="btn-glow"></div>
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="4" fill="currentColor"/>
        </svg>
        <span>开启 AI 对话</span>
      </button>

      <!-- 底部文字 -->
      <p class="landing-footer" :class="{ 'animate-in': animateStep >= 7 }">
        Powered by Advanced AI Technology
      </p>
    </div>

    <!-- ============ 聊天页面 ============ -->
    <template v-if="!showLanding">
      <!-- 顶部导航 -->
      <header class="chat-header">
        <button class="back-btn" @click="goBackToLanding">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="header-info">
          <div class="ai-avatar platform-logo">
            <img src="/agx-coin.png" alt="AGX" />
          </div>
          <div class="header-text">
            <h1>小升 · AGX助手</h1>
            <span class="status">
              <span class="status-dot"></span>
              <span>AI 在线</span>
            </span>
          </div>
        </div>
        <div class="header-actions">
          <button class="action-btn" @click="clearChat" title="清空对话">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- 消息列表 -->
      <div class="messages-container" ref="messagesContainer">
        <div class="messages-list">
          <!-- 日期分隔 -->
          <div class="date-divider" v-if="messages.length > 0">
            <span>{{ formatDate(messages[0]?.timestamp || Date.now()) }}</span>
          </div>

          <!-- 欢迎消息 -->
          <div class="message ai-message welcome-msg" v-if="showWelcome">
            <div class="message-avatar platform-logo">
              <img src="/agx-coin.png" alt="AGX" />
            </div>
            <div class="message-content">
              <div class="message-bubble glass-effect">
                <div class="welcome-header">
                  <strong>Hey～ 我是小升！</strong>
                </div>
                <p v-if="userInfo.nickname" class="greeting">
                  {{ userInfo.nickname }}，{{ getGreeting() }}
                </p>
                <div class="user-status-card" v-if="userInfo.level !== undefined">
                  <div class="status-row">
                    <span class="status-icon">🏆</span>
                    <span>{{ getLevelName(userInfo.level) }}</span>
                  </div>
                  <div class="status-row" v-if="userInfo.totalAssets > 0">
                    <span class="status-icon">💰</span>
                    <span>总资产 ${{ formatNumber(userInfo.totalAssets) }}</span>
                  </div>
                </div>
                <p class="welcome-footer">有啥想聊的？理财、区块链、行情分析都行～</p>
              </div>
            </div>
          </div>

          <!-- 快捷问题 -->
          <div class="quick-section" v-if="messages.length === 0">
            <div class="quick-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>快速提问</span>
            </div>
            <div class="quick-questions">
              <button v-for="q in quickQuestions" :key="q.text" @click="sendQuickQuestion(q.text)" class="quick-btn">
                <span class="quick-icon">{{ q.icon }}</span>
                <span class="quick-text">{{ q.text }}</span>
              </button>
            </div>
          </div>

          <!-- 消息列表 -->
          <template v-for="(msg, i) in messages" :key="i">
            <div class="time-divider" v-if="shouldShowTime(i)">
              <span>{{ formatTime(msg.timestamp) }}</span>
            </div>
            
            <div :class="['message', msg.role === 'user' ? 'user-message' : 'ai-message', { 'animate-in': msg.isNew }]">
              <div class="message-content">
                <div :class="['message-bubble', msg.role === 'assistant' ? 'glass-effect' : '']">
                  <div v-html="formatMessage(msg.content)"></div>
                </div>
                <div class="message-meta">
                  <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
                  <span class="message-status" v-if="msg.role === 'user'">✓</span>
                </div>
              </div>
            </div>
          </template>

          <!-- 加载中 -->
          <div class="message ai-message" v-if="isLoading">
            <div class="message-content">
              <div class="message-bubble glass-effect typing-bubble">
                <div class="typing-indicator">
                  <span class="typing-text">小升正在思考</span>
                  <div class="typing-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bottom-spacer"></div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <div class="input-container">
          <div class="input-wrapper">
            <textarea
              ref="inputRef"
              v-model="inputText"
              placeholder="跟小升聊聊..."
              rows="1"
              @keydown.enter.exact.prevent="sendMessage"
              @input="autoResize"
            ></textarea>
          </div>
          <button class="send-btn" :disabled="!inputText.trim() || isLoading" @click="sendMessage">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, watch } from 'vue'
import { useUserStore } from '../stores/user'

const STORAGE_KEY = 'agx_ai_chat_history'
const MAX_HISTORY = 50

const userStore = useUserStore()
const messagesContainer = ref(null)
const inputRef = ref(null)
const inputText = ref('')
const messages = ref([])
const isLoading = ref(false)
const showWelcome = ref(true)

// 入口页面状态
const showLanding = ref(true)
const animateStep = ref(0)

// 用户信息
const userInfo = reactive({
  id: '',
  nickname: '',
  level: 0,
  totalAssets: 0,
  usdtBalance: 0,
  agxBalance: 0,
  holdings: [],
  kycStatus: 0
})

// 快捷问题
const quickQuestions = [
  { icon: '📊', text: '帮我分析下当前行情' },
  { icon: '💎', text: '有什么理财产品推荐？' },
  { icon: '🔗', text: '区块链到底是啥？' },
  { icon: '🏦', text: '美联储政策怎么影响币圈？' },
  { icon: '🚀', text: 'AGX 代币值得买吗？' },
  { icon: '🛡️', text: '怎么保护我的资产安全？' }
]

// 启动入口页面动画
const startLandingAnimation = () => {
  animateStep.value = 0
  const steps = [1, 2, 3, 4, 5, 6, 7]
  steps.forEach((step, index) => {
    setTimeout(() => {
      animateStep.value = step
    }, 200 + index * 150)
  })
}

// 进入聊天页面
const enterChat = () => {
  showLanding.value = false
  nextTick(() => {
    scrollToBottom()
  })
}

// 返回入口页面
const goBackToLanding = () => {
  showLanding.value = true
  animateStep.value = 7 // 直接显示所有元素，不重新动画
}

// 获取问候语
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 6) return '熬夜研究投资呢？注意休息哦～'
  if (hour < 9) return '早上好！今天也要元气满满～'
  if (hour < 12) return '上午好！准备看看今天的行情？'
  if (hour < 14) return '中午好！吃饭了没？'
  if (hour < 18) return '下午好！来聊聊你的投资计划？'
  if (hour < 22) return '晚上好！今天收益怎么样？'
  return '夜深了，还在关注市场呢～'
}

// 获取等级名称
const getLevelName = (level) => {
  const names = ['启蒙层', '准入层', '优选层', '资本层', '执行官层', '主权层']
  return `Lv.${level} ${names[level] || '会员'}`
}

// 格式化数字
const formatNumber = (num) => {
  if (!num) return '0.00'
  return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 格式化日期
const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) return '今天'
  if (date.toDateString() === yesterday.toDateString()) return '昨天'
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
}

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 是否显示时间分隔
const shouldShowTime = (index) => {
  if (index === 0) return false
  const current = messages.value[index]
  const prev = messages.value[index - 1]
  return (current.timestamp - prev.timestamp) > 5 * 60 * 1000
}

// 加载聊天历史
const loadChatHistory = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      if (data.messages?.length > 0) {
        messages.value = data.messages.slice(-MAX_HISTORY)
        showWelcome.value = false
      }
    }
  } catch (e) {
    console.log('加载历史失败:', e)
  }
}

// 保存聊天历史
const saveChatHistory = () => {
  try {
    const data = {
      messages: messages.value.slice(-MAX_HISTORY),
      userId: userInfo.id,
      updatedAt: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.log('保存历史失败:', e)
  }
}

// 监听消息变化，自动保存
watch(messages, () => {
  saveChatHistory()
}, { deep: true })

// 清空聊天
const clearChat = () => {
  messages.value = []
  showWelcome.value = true
  localStorage.removeItem(STORAGE_KEY)
}

// 加载用户信息
const loadUserInfo = async () => {
  try {
    if (userStore.isLoggedIn) {
      userInfo.id = userStore.userInfo?.id || ''
      userInfo.nickname = userStore.userInfo?.nickname || userStore.userInfo?.username || ''
      userInfo.level = userStore.userInfo?.level || 0
      userInfo.kycStatus = userStore.userInfo?.kycStatus || 0
    }
  } catch (e) {
    console.log('获取用户信息失败:', e)
  }
}

// 发送快捷问题
const sendQuickQuestion = (text) => {
  inputText.value = text
  sendMessage()
}

// 格式化消息内容 - 添加XSS防护
const formatMessage = (content) => {
  if (!content) return ''
  
  // 首先转义HTML特殊字符，防止XSS
  let formatted = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
  
  // 然后应用格式化（这些替换产生的HTML是安全的）
  formatted = formatted
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/(\d+)\.\s+(.+?)(?=<br>|$)/g, '<li class="ol-item">$2</li>')
    .replace(/[•\-]\s+(.+?)(?=<br>|$)/g, '<li class="ul-item">$1</li>')
  
  return formatted
}

// 后端API地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// 发送消息
const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  showWelcome.value = false
  
  messages.value.push({
    role: 'user',
    content: text,
    timestamp: Date.now(),
    isNew: true
  })

  inputText.value = ''
  if (inputRef.value) inputRef.value.style.height = 'auto'
  isLoading.value = true
  scrollToBottom()

  setTimeout(() => {
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg) lastMsg.isNew = false
  }, 500)

  try {
    const history = messages.value.slice(-12).map(m => ({
      role: m.role,
      content: m.content
    }))
    
    const token = localStorage.getItem('token')
    const apiUrl = token 
      ? `${API_BASE_URL}/ai/customer-service`
      : `${API_BASE_URL}/ai/customer-service/guest`

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        message: text,
        history: history.slice(0, -1)
      })
    })

    if (!response.ok) throw new Error(`API error: ${response.status}`)

    const data = await response.json()
    const aiResponse = data.data?.reply || data.reply || '哎呀，我走神了，能再说一遍吗？'

    messages.value.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: Date.now(),
      isNew: true
    })

    setTimeout(() => {
      const lastMsg = messages.value[messages.value.length - 1]
      if (lastMsg) lastMsg.isNew = false
    }, 500)

  } catch (error) {
    console.error('AI 请求失败:', error)
    messages.value.push({
      role: 'assistant',
      content: '抱歉，网络有点问题，请稍后再试～',
      timestamp: Date.now(),
      isNew: true
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

// 自动调整输入框高度
const autoResize = () => {
  const el = inputRef.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 100) + 'px'
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}

onMounted(() => {
  loadChatHistory()
  loadUserInfo()
  startLandingAnimation()
})
</script>

<style scoped>
.ai-chat-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(180deg, #0A0D12 0%, #0D1117 50%, #0F1419 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* ============ 背景装饰 ============ */
.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.25;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(200, 170, 110, 0.5) 0%, transparent 70%);
  top: -100px;
  right: -80px;
  animation: floatOrb 12s ease-in-out infinite;
}

.orb-2 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(155, 89, 182, 0.4) 0%, transparent 70%);
  bottom: 15%;
  left: -60px;
  animation: floatOrb 15s ease-in-out infinite reverse;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(200, 170, 110, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200, 170, 110, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.5;
}

.bg-lines {
  position: absolute;
  inset: 0;
}

.line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(200, 170, 110, 0.15), transparent);
  height: 1px;
}

.line-1 {
  top: 25%;
  left: 10%;
  width: 30%;
  animation: linePulse 4s ease-in-out infinite;
}

.line-2 {
  top: 45%;
  right: 5%;
  width: 25%;
  animation: linePulse 5s ease-in-out infinite 1s;
}

.line-3 {
  bottom: 30%;
  left: 20%;
  width: 20%;
  animation: linePulse 6s ease-in-out infinite 2s;
}

@keyframes floatOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, -20px) scale(1.05); }
}

@keyframes linePulse {
  0%, 100% { opacity: 0; transform: scaleX(0.5); }
  50% { opacity: 1; transform: scaleX(1); }
}

/* ============ 入口页面 ============ */
.landing-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px 40px;
  position: relative;
}

.landing-back {
  position: absolute;
  top: calc(16px + env(safe-area-inset-top, 0px));
  left: 16px;
}

/* Logo 动画 */
.landing-logo {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 32px;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.landing-logo.animate-in {
  opacity: 1;
  transform: scale(1);
}

.logo-outer-ring {
  position: absolute;
  inset: -8px;
  border: 1px solid rgba(200, 170, 110, 0.3);
  border-radius: 50%;
  animation: spinSlow 20s linear infinite;
}

.logo-outer-ring::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 50%;
  width: 4px;
  height: 4px;
  background: #C8AA6E;
  border-radius: 50%;
  transform: translateX(-50%);
}

.logo-middle-ring {
  position: absolute;
  inset: 8px;
  border: 1px dashed rgba(200, 170, 110, 0.4);
  border-radius: 50%;
  animation: spinSlow 15s linear infinite reverse;
}

.logo-inner {
  position: absolute;
  inset: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.1) 0%, rgba(200, 170, 110, 0.05) 100%);
  border-radius: 50%;
  border: 1px solid rgba(200, 170, 110, 0.3);
  animation: pulseLogo 3s ease-in-out infinite;
}

.logo-inner svg {
  width: 60px;
  height: 60px;
}

@keyframes spinSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulseLogo {
  0%, 100% { box-shadow: 0 0 20px rgba(200, 170, 110, 0.2); }
  50% { box-shadow: 0 0 40px rgba(200, 170, 110, 0.4); }
}

/* 标题 */
.landing-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease-out;
}

.landing-title.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.title-agx {
  font-size: 42px;
  font-weight: 700;
  color: #F0F2F5;
  letter-spacing: 2px;
}

.title-ai {
  font-size: 42px;
  font-weight: 700;
  color: #0D1117;
  background: linear-gradient(135deg, #C8AA6E 0%, #E8D5A3 50%, #C8AA6E 100%);
  padding: 4px 16px;
  border-radius: 8px;
  letter-spacing: 2px;
}

/* 副标题 */
.landing-subtitle {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 40px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease-out 0.1s;
}

.landing-subtitle.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* 功能卡片 */
.feature-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 340px;
  margin-bottom: 36px;
}

.feature-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(30, 35, 45, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.4s ease-out;
}

.feature-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.feature-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.feature-icon svg {
  width: 20px;
  height: 20px;
}

.feature-card.purple .feature-icon {
  background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%);
  color: white;
}

.feature-card.gold .feature-icon {
  background: linear-gradient(135deg, #C8AA6E 0%, #E8D5A3 100%);
  color: #0D1117;
}

.feature-card.green .feature-icon {
  background: linear-gradient(135deg, #059669 0%, #10B981 100%);
  color: white;
}

.feature-text h3 {
  font-size: 14px;
  font-weight: 600;
  color: #F0F2F5;
  margin: 0 0 4px;
}

.feature-text p {
  font-size: 12px;
  color: #6B7280;
  margin: 0;
}

/* 开启对话按钮 */
.start-chat-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: 260px;
  height: 52px;
  background: linear-gradient(135deg, rgba(30, 35, 45, 0.9) 0%, rgba(20, 25, 35, 0.9) 100%);
  border: 1px solid rgba(200, 170, 110, 0.3);
  border-radius: 26px;
  color: #C8AA6E;
  font-size: 16px;
  font-weight: 500;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.4s ease-out;
}

.start-chat-btn.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.start-chat-btn:active {
  transform: scale(0.98);
}

.btn-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(90deg, transparent, rgba(200, 170, 110, 0.3), transparent);
  animation: btnGlow 3s linear infinite;
}

@keyframes btnGlow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.btn-icon {
  width: 20px;
  height: 20px;
  position: relative;
  z-index: 1;
}

.start-chat-btn span {
  position: relative;
  z-index: 1;
}

/* 底部文字 */
.landing-footer {
  position: absolute;
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  font-size: 12px;
  color: #4B5563;
  opacity: 0;
  transition: opacity 0.4s ease-out;
}

.landing-footer.animate-in {
  opacity: 1;
}

/* ============ 聊天页面样式 ============ */
.back-btn, .action-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #8B95A5;
  transition: all 0.2s;
}

.back-btn:active, .action-btn:active {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(0.95);
}

.back-btn svg, .action-btn svg {
  width: 18px;
  height: 18px;
}

/* 顶部导航 */
.chat-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  max-width: 428px;
  margin: 0 auto;
  height: calc(60px + env(safe-area-inset-top, 0px));
  padding-top: env(safe-area-inset-top, 0px);
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 16px;
  padding-right: 16px;
  background: rgba(10, 13, 18, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(200, 170, 110, 0.1);
  z-index: 100;
}

.header-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  position: relative;
  width: 42px;
  height: 42px;
}

.ai-avatar.platform-logo {
  border-radius: 50%;
  overflow: hidden;
}

.ai-avatar.platform-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-ring {
  position: absolute;
  inset: -3px;
  border: 2px solid rgba(200, 170, 110, 0.3);
  border-radius: 50%;
  animation: ringPulse 3s ease-in-out infinite;
}

@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.avatar-core {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.15) 0%, rgba(200, 170, 110, 0.05) 100%);
  border-radius: 50%;
  border: 1px solid rgba(200, 170, 110, 0.25);
}

.avatar-core svg {
  width: 26px;
  height: 26px;
}

.header-text h1 {
  font-size: 16px;
  font-weight: 600;
  color: #F0F2F5;
  margin: 0 0 2px;
}

.status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #10B981;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #10B981;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.9); }
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* 消息容器 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: calc(60px + env(safe-area-inset-top, 0px) + 12px) 16px 140px;
  -webkit-overflow-scrolling: touch;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 100%;
}

/* 日期/时间分隔 */
.date-divider, .time-divider {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.date-divider span, .time-divider span {
  font-size: 11px;
  color: #5A6370;
  background: rgba(30, 38, 47, 0.6);
  padding: 4px 12px;
  border-radius: 10px;
}

/* 消息样式 */
.message {
  display: flex;
  gap: 10px;
  max-width: 88%;
  animation: none;
}

.message.animate-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-message {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.ai-message {
  align-self: flex-start;
}

.message-avatar {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.message-avatar.platform-logo {
  border-radius: 50%;
  overflow: hidden;
}

.message-avatar.platform-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-glow {
  position: absolute;
  inset: -4px;
  background: radial-gradient(circle, rgba(200, 170, 110, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0.6;
}

.avatar-glow.pulse {
  animation: glowPulse 1.5s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.2); }
}

.message-avatar svg {
  width: 28px;
  height: 28px;
  position: relative;
  z-index: 1;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.7;
  word-wrap: break-word;
}

.message-bubble.glass-effect {
  background: linear-gradient(145deg, rgba(30, 38, 47, 0.9) 0%, rgba(24, 31, 40, 0.85) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.ai-message .message-bubble {
  color: #E8EAED;
  border-top-left-radius: 4px;
}

.user-message .message-bubble {
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  color: #0D1117;
  border-top-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(200, 170, 110, 0.25);
}

.message-bubble :deep(strong) {
  color: #E8D5A3;
  font-weight: 600;
}

.user-message .message-bubble :deep(strong) {
  color: #0D1117;
}

.message-bubble :deep(code) {
  background: rgba(200, 170, 110, 0.15);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 13px;
}

.message-bubble :deep(.ol-item),
.message-bubble :deep(.ul-item) {
  display: block;
  padding-left: 16px;
  position: relative;
  margin: 4px 0;
}

.message-bubble :deep(.ol-item)::before {
  content: counter(list-counter) ".";
  counter-increment: list-counter;
  position: absolute;
  left: 0;
  color: #C8AA6E;
}

.message-bubble :deep(.ul-item)::before {
  content: "•";
  position: absolute;
  left: 4px;
  color: #C8AA6E;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 4px;
}

.message-time {
  font-size: 10px;
  color: #5A6370;
}

.message-status {
  font-size: 10px;
  color: #C8AA6E;
}

/* 欢迎消息 */
.welcome-msg .message-bubble {
  max-width: 280px;
}

.welcome-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.welcome-header strong {
  color: #F0F2F5;
  font-size: 15px;
}

.greeting {
  color: #9CA3AF;
  font-size: 13px;
  margin: 0 0 12px;
}

.user-status-card {
  background: rgba(200, 170, 110, 0.1);
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 12px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #D1D5DB;
}

.status-row + .status-row {
  margin-top: 6px;
}

.status-icon {
  font-size: 14px;
}

.welcome-footer {
  color: #9CA3AF;
  font-size: 13px;
  margin: 0;
}

/* 快捷问题 */
.quick-section {
  padding: 16px 0;
}

.quick-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6B7280;
  font-size: 13px;
  margin-bottom: 12px;
}

.quick-title svg {
  width: 16px;
  height: 16px;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(30, 38, 47, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  color: #D1D5DB;
  font-size: 13px;
  transition: all 0.2s;
}

.quick-btn:active {
  background: rgba(200, 170, 110, 0.15);
  border-color: rgba(200, 170, 110, 0.3);
  transform: scale(0.98);
}

.quick-icon {
  font-size: 14px;
}

/* 输入中动画 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.typing-text {
  font-size: 13px;
  color: #9CA3AF;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #C8AA6E;
  border-radius: 50%;
  animation: typingDot 1.4s ease-in-out infinite;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingDot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

.bottom-spacer {
  height: 20px;
}

/* 输入区域 */
.input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 428px;
  margin: 0 auto;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  background: rgba(10, 13, 18, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(200, 170, 110, 0.1);
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.input-wrapper {
  flex: 1;
  background: rgba(30, 38, 47, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 0 16px;
}

.input-wrapper textarea {
  width: 100%;
  padding: 12px 0;
  background: transparent;
  border: none;
  outline: none;
  color: #F0F2F5;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  max-height: 100px;
}

.input-wrapper textarea::placeholder {
  color: #5A6370;
}

.send-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08050 100%);
  border-radius: 50%;
  color: #0D1117;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:disabled {
  opacity: 0.4;
}

.send-btn:not(:disabled):active {
  transform: scale(0.95);
}

.send-btn svg {
  width: 20px;
  height: 20px;
}

.disclaimer {
  text-align: center;
  font-size: 11px;
  color: #5A6370;
  margin: 8px 0 0;
}
</style>
