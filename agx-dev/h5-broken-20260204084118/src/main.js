import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './styles/variables.css'
import './styles/tokens.css'
import './styles/main.css'


// 创建应用
const app = createApp(App)
const pinia = createPinia()

// 使用插件
app.use(pinia)
app.use(router)
app.use(i18n)

// 挂载
app.mount('#app')

// 简单的Token同步（避免复杂逻辑）
try {
  const syncToken = () => {
    const sessionToken = sessionStorage.getItem('token')
    const localToken = localStorage.getItem('token')
    if (sessionToken && sessionToken !== localToken) {
      localStorage.setItem('token', sessionToken)
    }
  }
  
  syncToken()
  setInterval(syncToken, 10000)
} catch (e) {
  console.warn('Token同步失败:', e)
}
