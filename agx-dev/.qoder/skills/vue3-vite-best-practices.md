# Vue 3 + Vite 最佳实践技能

## 描述
Vue 3 (Composition API) + Vite 前端开发最佳实践，适用于管理后台和 H5 移动端应用。

## 核心原则

### 1. Composition API 风格
```vue
<script setup>
// ✅ 推荐：使用 <script setup> 语法糖
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)
const router = useRouter()

onMounted(() => {
  console.log('Component mounted')
})

function increment() {
  count.value++
}
</script>

<!-- ❌ 避免：Options API（除非维护旧代码） -->
```

### 2. 组合式函数 (Composables)
```javascript
// ✅ 推荐：提取可复用逻辑到 composables
// composables/useUser.js
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export function useUser() {
  const store = useStore()
  const loading = ref(false)

  const user = computed(() => store.state.user.userInfo)
  const isLoggedIn = computed(() => !!user.value)

  async function fetchUser() {
    loading.value = true
    try {
      await store.dispatch('user/getUserInfo')
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    isLoggedIn,
    loading,
    fetchUser
  }
}

// 在组件中使用
<script setup>
import { useUser } from '@/composables/useUser'

const { user, isLoggedIn, fetchUser } = useUser()
</script>
```

### 3. 响应式状态管理
```javascript
// ✅ 推荐：Pinia (Vue 3 官方推荐)
// stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // state
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('token'))

  // getters
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username)

  // actions
  async function login(credentials) {
    const { data } = await api.login(credentials)
    token.value = data.token
    userInfo.value = data.user
    localStorage.setItem('token', data.token)
  }

  function logout() {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    username,
    login,
    logout
  }
})
```

### 4. API 请求封装
```javascript
// ✅ 推荐：统一的 API 层
// api/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { code, data, message } = response.data
    if (code === 0) {
      return data
    } else {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message))
    }
  },
  error => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      window.location.href = '/login'
    }
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request

// api/modules/user.js
import request from '../request'

export const userApi = {
  login: (data) => request.post('/auth/login', data),
  getUserInfo: () => request.get('/user/info'),
  updateProfile: (data) => request.put('/user/profile', data)
}
```

### 5. 路由最佳实践
```javascript
// ✅ 推荐：路由懒加载 + 路由守卫
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true, title: '仪表盘' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  document.title = to.meta.title || '默认标题'

  // 检查认证
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

### 6. 环境变量配置
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=开发环境

# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_APP_TITLE=生产环境
```

```javascript
// 使用环境变量
const apiUrl = import.meta.env.VITE_API_BASE_URL
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD
```

### 7. 组件设计原则
```vue
<!-- ✅ 推荐：props 定义明确 -->
<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  items: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:count', 'submit'])

function handleSubmit() {
  emit('submit', { value: props.count })
}
</script>

<!-- ❌ 避免：没有类型定义的 props -->
```

### 8. 性能优化
```vue
<script setup>
import { ref, computed, watch, watchEffect } from 'vue'

// ✅ 推荐：使用 computed 缓存计算结果
const filteredList = computed(() => {
  return list.value.filter(item => item.status === 'active')
})

// ✅ 推荐：v-memo 优化列表渲染（Vue 3.2+）
</script>

<template>
  <div v-for="item in list" :key="item.id" v-memo="[item.id, item.status]">
    {{ item.name }}
  </div>
</template>

<!-- ✅ 推荐：懒加载组件 -->
<script setup>
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent(() =>
  import('@/components/HeavyComponent.vue')
)
</script>
```

### 9. TypeScript 集成
```typescript
// ✅ 推荐：使用 TypeScript
<script setup lang="ts">
interface User {
  id: number
  username: string
  email: string
}

interface Props {
  user: User
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: false
})

const emit = defineEmits<{
  (e: 'update', user: User): void
  (e: 'delete', id: number): void
}>()
</script>
```

### 10. 样式管理
```vue
<style scoped>
/* ✅ 推荐：使用 scoped 避免样式污染 */
.container {
  padding: 20px;
}

/* ✅ 推荐：使用 CSS 变量 */
:root {
  --primary-color: #409eff;
  --danger-color: #f56c6c;
}

.button {
  background-color: var(--primary-color);
}

/* ✅ 推荐：深度选择器 */
:deep(.el-input__inner) {
  border-color: var(--primary-color);
}
</style>
```

## H5 移动端特定优化

### 1. 移动端适配
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import postcsspxtoviewport from 'postcss-px-to-viewport'

export default defineConfig({
  plugins: [vue()],
  css: {
    postcss: {
      plugins: [
        postcsspxtoviewport({
          viewportWidth: 375, // 设计稿宽度
          unitPrecision: 5,
          viewportUnit: 'vw',
          selectorBlackList: ['ignore'], // 不转换的类名
          minPixelValue: 1,
          mediaQuery: false
        })
      ]
    }
  }
})
```

### 2. 触摸事件处理
```vue
<script setup>
import { ref } from 'vue'

const startX = ref(0)
const startY = ref(0)

function handleTouchStart(e) {
  startX.value = e.touches[0].clientX
  startY.value = e.touches[0].clientY
}

function handleTouchMove(e) {
  const deltaX = e.touches[0].clientX - startX.value
  const deltaY = e.touches[0].clientY - startY.value
  
  // 处理滑动逻辑
}
</script>

<template>
  <div 
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    滑动区域
  </div>
</template>
```

### 3. 下拉刷新和上拉加载
```vue
<script setup>
import { ref } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'

const list = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)

async function loadMore() {
  if (loading.value || finished.value) return
  
  loading.value = true
  try {
    const { data } = await api.getList({ page: page.value })
    list.value.push(...data)
    page.value++
    
    if (data.length < 20) {
      finished.value = true
    }
  } finally {
    loading.value = false
  }
}

// 使用 VueUse 的无限滚动
useInfiniteScroll(
  document,
  loadMore,
  { distance: 100 }
)
</script>
```

## 调试技巧

### 1. Vue DevTools
- 安装 Vue DevTools 浏览器扩展
- 查看组件树、状态、事件

### 2. 开发工具配置
```javascript
// vite.config.js
export default defineConfig({
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 3000,
    open: true, // 自动打开浏览器
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

## 检查清单
- [ ] 使用 Composition API 和 `<script setup>`
- [ ] 提取可复用逻辑到 composables
- [ ] 使用 Pinia 进行状态管理
- [ ] API 请求统一封装并处理错误
- [ ] 路由懒加载和守卫配置
- [ ] 组件 props 有明确类型定义
- [ ] 使用 computed 缓存计算属性
- [ ] 移动端做了适配（H5项目）
- [ ] 配置了代理解决跨域问题
- [ ] 样式使用 scoped 避免污染
