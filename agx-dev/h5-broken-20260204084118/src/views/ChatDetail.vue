<template>
  <PageLayout :show-back="true" :title="chatUser?.nickname || '聊天'">
    <div class="chat-container">
      <!-- 消息列表 -->
      <div class="messages-container" ref="messagesContainer">
        <div 
          v-for="message in messages" 
          :key="message.id"
          :class="['message-item', { 'self-message': message.senderId === currentUserId }]"
        >
          <div class="message-avatar">
            <img 
              :src="message.senderId === currentUserId ? currentUserAvatar : chatUser?.avatar" 
              alt="头像"
              class="avatar"
            >
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <span class="message-text">{{ message.content }}</span>
              <span class="message-time">{{ formatTime(message.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-container">
        <div class="input-box">
          <input
            v-model="inputMessage"
            type="text"
            placeholder="输入消息..."
            class="message-input"
            @keyup.enter="sendMessage"
          >
          <button 
            class="send-btn" 
            :disabled="!canSendMessage"
            @click="sendMessage"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageLayout from '../components/layout/PageLayout.vue'
import { api } from '../utils/api'
import { alert } from '../utils/alert'
import { 
  initSocket, 
  disconnectSocket, 
  sendPrivateMessage, 
  sendTypingStatus,
  markMessageRead,
  onNewMessage, 
  onMessageSent, 
  onMessageError,
  onUserTyping,
  offEvent,
  socketConnected 
} from '../utils/socket'

const route = useRoute()
const chatUserId = ref(parseInt(route.params.userId))
const conversationId = ref(null)
const messages = ref([])
const inputMessage = ref('')
const messagesContainer = ref(null)
const currentUserId = ref(1) // 从用户信息获取
const chatUser = ref(null)
const isTyping = ref(false)
const typingTimeout = ref(null)
const currentUserAvatar = ref(null)

// 检查是否可以发送消息
const canSendMessage = computed(() => {
  return inputMessage.value.trim().length > 0
})

// 格式化时间
const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 加载聊天用户信息
const loadChatUser = async () => {
  // 实际应用中应该通过API获取用户信息
  chatUser.value = { id: chatUserId.value, nickname: '好友', avatar: null }
}

// 加载消息历史
const loadMessages = async () => {
  try {
    const response = await api.social.getMessages(chatUserId.value, { limit: 50 })
    if (response.success) {
      messages.value = response.data.list || []
      // 滚动到底部
      await nextTick()
      scrollToBottom()
      
      // 标记消息已读
      if (conversationId.value) {
        markMessageRead(conversationId.value)
      }
    }
  } catch (error) {
    console.error('加载消息失败:', error)
  }
}

// 初始化 WebSocket
const initWebSocket = () => {
  if (currentUserId.value) {
    initSocket(currentUserId.value)
    
    // 监听新消息
    onNewMessage((data) => {
      if (data.senderId === chatUserId.value || data.receiverId === chatUserId.value) {
        messages.value.push(data)
        nextTick(() => scrollToBottom())
        // 标记已读
        if (conversationId.value) {
          markMessageRead(conversationId.value)
        }
      }
    })
    
    // 监听消息发送成功
    onMessageSent((data) => {
      // 消息发送成功
    })
    
    // 监听消息发送失败
    onMessageError((data) => {
      alert(data.message || '消息发送失败')
    })
    
    // 监听输入状态
    onUserTyping((data) => {
      if (data.userId === chatUserId.value) {
        isTyping.value = data.isTyping
        if (isTyping.value) {
          if (typingTimeout.value) clearTimeout(typingTimeout.value)
          typingTimeout.value = setTimeout(() => {
            isTyping.value = false
          }, 3000)
        }
      }
    })
  }
}

// 发送消息
const sendMessage = async () => {
  if (!canSendMessage.value) return

  const content = inputMessage.value.trim()
  if (!content) return

  // 优先使用 WebSocket 发送
  if (socketConnected.value) {
    const sent = sendPrivateMessage(chatUserId.value, content, conversationId.value)
    if (sent) {
      // 添加到消息列表
      const newMessage = {
        id: Date.now(),
        senderId: currentUserId.value,
        receiverId: chatUserId.value,
        content: content,
        createdAt: new Date().toISOString()
      }
      messages.value.push(newMessage)
      inputMessage.value = ''
      await nextTick()
      scrollToBottom()
      return
    }
  }

  // 回退到 HTTP API
  try {
    const response = await api.social.sendMessage({
      receiverId: chatUserId.value,
      content: content
    })

    if (response.success) {
      const newMessage = {
        id: Date.now(),
        senderId: currentUserId.value,
        receiverId: chatUserId.value,
        content: content,
        createdAt: new Date().toISOString()
      }
      messages.value.push(newMessage)
      inputMessage.value = ''
      await nextTick()
      scrollToBottom()
    } else {
      alert(response.message || '发送失败')
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    alert('发送失败，请重试')
  }
}

// 输入时发送输入状态
const handleInput = () => {
  if (socketConnected.value && inputMessage.value.length > 0) {
    sendTypingStatus(chatUserId.value, true)
  }
}

// 滚动到底部
const scrollToBottom = () => {
  const container = messagesContainer.value
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

onMounted(async () => {
  await loadChatUser()
  await loadMessages()
  initWebSocket()
})

onUnmounted(() => {
  // 清理事件监听
  offEvent('new_message')
  offEvent('message_sent')
  offEvent('message_error')
  offEvent('user_typing')
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
})
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-base, #0B0E11);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.message-item.self-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-surface, #2B3139);
}

.message-content {
  display: flex;
  flex-direction: column;
}

.message-bubble {
  max-width: 70%;
  background: var(--bg-elevated, #181A20);
  border-radius: 12px;
  padding: 8px 12px;
  position: relative;
}

.self-message .message-bubble {
  background: var(--color-brand-yellow, #C8AA6E);
  color: #000;
}

.message-text {
  display: block;
  margin-bottom: 4px;
  word-wrap: break-word;
}

.message-time {
  font-size: 10px;
  color: #848E9C;
  text-align: right;
}

.self-message .message-time {
  color: rgba(0, 0, 0, 0.6);
}

.input-container {
  padding: 12px 16px;
  border-top: 1px solid var(--border-primary, #2B3139);
  background: var(--bg-base, #0B0E11);
}

.input-box {
  display: flex;
  gap: 8px;
  align-items: center;
}

.message-input {
  flex: 1;
  padding: 10px 12px;
  background: var(--bg-elevated, #181A20);
  border: 1px solid var(--border-primary, #2B3139);
  border-radius: 20px;
  color: #EAECEF;
  font-size: 14px;
  outline: none;
}

.message-input:focus {
  border-color: #C8AA6E;
}

.send-btn {
  padding: 10px 16px;
  background: var(--color-brand-yellow, #C8AA6E);
  color: #000;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.send-btn:disabled {
  background: var(--bg-surface, #2B3139);
  color: #848E9C;
  cursor: not-allowed;
}

/* 消息列表滚动条样式 */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: var(--bg-surface, #2B3139);
  border-radius: 3px;
}
</style>