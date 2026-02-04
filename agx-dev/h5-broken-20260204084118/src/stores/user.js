import { defineStore } from 'pinia'
import { api } from '../utils/api'
import { tokenStorage } from '../utils/security'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: tokenStorage.getToken(),
    userInfo: {
      id: '',
      username: '',
      avatar: '',
      email: '',
      phone: '',
      vipLevel: 0,
      kycStatus: 0,
      securityLevel: 0,
      inviteCode: '',
      level: 1
    },
    isLoggedIn: tokenStorage.hasToken()
  }),

  getters: {
    getToken: (state) => state.token,
    getUserInfo: (state) => ({ ...state.userInfo, isLoggedIn: state.isLoggedIn }),
    isAuthenticated: (state) => !!state.token && state.isLoggedIn
  },

  actions: {
    setToken(token) {
      this.token = token
      this.isLoggedIn = !!token
      tokenStorage.setToken(token)
    },

    setUserInfo(userInfo) {
      this.userInfo = { ...this.userInfo, ...userInfo }
    },

    // 登录成功后调用
    async login(data) {
      try {
        const res = await api.account.login(data)
        if (res.success && res.data) {
          this.setToken(res.data.token)
          if (res.data.user) {
            this.setUserInfo(res.data.user)
          }
          return { success: true, data: res.data }
        }
        return { success: false, message: res.message || '登录失败' }
      } catch (e) {
        return { success: false, message: e.message || '登录失败' }
      }
    },

    // 获取用户资料
    async fetchProfile() {
      if (!this.token) return null
      try {
        const res = await api.account.profile()
        if (res.success && res.data) {
          this.setUserInfo(res.data)
          return res.data
        }
      } catch (e) {
        console.error('Failed to fetch profile:', e)
      }
      return null
    },

    // 初始化 - 检查token并获取用户信息
    async init() {
      if (this.token) {
        this.isLoggedIn = true
        await this.fetchProfile()
      }
    },

    logout() {
      this.token = ''
      this.isLoggedIn = false
      this.userInfo = {
        id: '',
        username: '',
        avatar: '',
        email: '',
        phone: '',
        vipLevel: 0,
        kycStatus: 0,
        securityLevel: 0,
        inviteCode: '',
        level: 1
      }
      tokenStorage.clearToken()
    }
  }
})
