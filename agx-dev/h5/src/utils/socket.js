import { io } from 'socket.io-client'
import { ref } from 'vue'
import { logger } from './logger'

// WebSocket 连接状态
export const socketConnected = ref(false)
export const socketError = ref(null)

let socket = null

/**
 * 初始化 Socket.IO 连接
 * @param {number} userId - 当前用户ID
 * @returns {Socket} Socket.IO 客户端实例
 */
export const initSocket = (userId) => {
  if (socket && socket.connected) {
    return socket
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  
  socket = io(`${baseUrl}/chat`, {
    auth: {
      userId: userId
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  // 连接事件
  socket.on('connect', () => {
    logger.log('[Socket] 已连接', socket.id)
    socketConnected.value = true
    socketError.value = null
  })

  // 断开连接事件
  socket.on('disconnect', (reason) => {
    logger.log('[Socket] 断开连接:', reason)
    socketConnected.value = false
  })

  // 连接错误事件
  socket.on('connect_error', (error) => {
    logger.error('[Socket] 连接错误:', error)
    socketError.value = error.message
    socketConnected.value = false
  })

  return socket
}

/**
 * 获取 Socket 实例
 */
export const getSocket = () => socket

/**
 * 断开 Socket 连接
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    socketConnected.value = false
  }
}

/**
 * 发送私聊消息
 * @param {number} receiverId - 接收者ID
 * @param {string} content - 消息内容
 * @param {number} conversationId - 会话ID (可选)
 */
export const sendPrivateMessage = (receiverId, content, conversationId) => {
  if (!socket || !socket.connected) {
    logger.error('[Socket] 未连接，无法发送消息')
    return false
  }

  socket.emit('private_message', {
    receiverId,
    content,
    conversationId
  })
  return true
}

/**
 * 发送输入状态
 * @param {number} receiverId - 接收者ID
 * @param {boolean} isTyping - 是否正在输入
 */
export const sendTypingStatus = (receiverId, isTyping) => {
  if (!socket || !socket.connected) return

  socket.emit('typing', {
    receiverId,
    isTyping
  })
}

/**
 * 标记消息已读
 * @param {number} conversationId - 会话ID
 */
export const markMessageRead = (conversationId) => {
  if (!socket || !socket.connected) return

  socket.emit('read_message', {
    conversationId
  })
}

/**
 * 监听新消息
 * @param {Function} callback - 回调函数
 */
export const onNewMessage = (callback) => {
  if (!socket) return

  socket.on('new_message', callback)
}

/**
 * 监听消息发送成功
 * @param {Function} callback - 回调函数
 */
export const onMessageSent = (callback) => {
  if (!socket) return

  socket.on('message_sent', callback)
}

/**
 * 监听消息发送失败
 * @param {Function} callback - 回调函数
 */
export const onMessageError = (callback) => {
  if (!socket) return

  socket.on('message_error', callback)
}

/**
 * 监听用户输入状态
 * @param {Function} callback - 回调函数
 */
export const onUserTyping = (callback) => {
  if (!socket) return

  socket.on('user_typing', callback)
}

/**
 * 移除事件监听
 * @param {string} eventName - 事件名
 */
export const offEvent = (eventName) => {
  if (!socket) return

  socket.off(eventName)
}

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  sendPrivateMessage,
  sendTypingStatus,
  markMessageRead,
  onNewMessage,
  onMessageSent,
  onMessageError,
  onUserTyping,
  offEvent,
  socketConnected,
  socketError
}
