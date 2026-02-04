<template>
  <PageLayout :title="$t('settings.title')" :show-back="true">
    <div class="settings-page">
      <!-- 用户信息头部 -->
      <div class="user-header">
        <div class="user-card">
          <div class="avatar-section" @click="selectAvatar">
            <div class="avatar-container">
              <img v-if="userAvatar" :src="userAvatar" class="avatar-img" />
              <div v-else class="avatar-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
                </svg>
              </div>
              <div class="avatar-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a3 3 0 00-3 3v1H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-3V5a3 3 0 00-3-3zm0 2a1 1 0 011 1v1h-2V5a1 1 0 011-1zm0 8a3 3 0 110 6 3 3 0 010-6z"/>
                </svg>
              </div>
              <div v-if="isUploadingAvatar" class="avatar-loading">
                <div class="loading-spinner"></div>
              </div>
            </div>
          </div>
          <div class="user-info">
            <div class="nickname-row" @click="showNicknameModal = true">
              <span class="nickname">{{ userNickname || '点击设置昵称' }}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div class="uid-row">
              <span class="uid-label">UID:</span>
              <span class="uid-value">{{ userUid || '---' }}</span>
              <button class="copy-btn" @click="copyUid">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 账户安全 -->
      <div class="section">
        <div class="section-header">
          <div class="section-icon security">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span class="section-title">账户安全</span>
        </div>
        <div class="section-card">
          <div class="menu-item" @click="router.push('/kyc')">
            <div class="item-left">
              <span class="item-label">身份认证</span>
            </div>
            <div class="item-right">
              <span class="status-tag" :class="kycStatusClass">{{ kycStatusText }}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
          <div class="menu-item" @click="showPasswordModal = true">
            <div class="item-left">
              <span class="item-label">修改登录密码</span>
            </div>
            <div class="item-right">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
          <div class="menu-item" @click="handlePayPasswordClick">
            <div class="item-left">
              <span class="item-label">支付密码</span>
              <span class="item-desc" v-if="!hasPayPassword">用于交易、提现等资金操作</span>
            </div>
            <div class="item-right">
              <span class="status-tag" :class="hasPayPassword ? 'success' : 'warning'">
                {{ hasPayPassword ? '已设置' : '未设置' }}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 钱包管理 -->
      <div class="section">
        <div class="section-header">
          <div class="section-icon wallet">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12V7H5a2 2 0 010-4h14v4"/>
              <path d="M3 5v14a2 2 0 002 2h16v-5"/>
              <path d="M18 12a2 2 0 100 4h4v-4h-4z"/>
            </svg>
          </div>
          <span class="section-title">钱包管理</span>
        </div>
        <div class="section-card">
          <div class="menu-item" @click="showAddressModal = true">
            <div class="item-left">
              <div class="chain-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 19h20L12 2zm0 4l6 10H6l6-10z"/>
                </svg>
              </div>
              <div class="item-text">
                <span class="item-label">USDT (TRC20)</span>
                <span class="item-desc" v-if="!tronAddress">绑定充值地址</span>
                <span class="address-preview" v-else>{{ formatAddress(tronAddress) }}</span>
              </div>
            </div>
            <div class="item-right">
              <span class="status-tag" :class="tronAddress ? 'success' : 'warning'">
                {{ tronAddress ? '已绑定' : '未绑定' }}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
        </div>
        <div class="tip-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
          <span>充值时请从绑定地址转账，否则无法自动入账</span>
        </div>
      </div>

      <!-- 通用设置 -->
      <div class="section">
        <div class="section-header">
          <div class="section-icon general">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </div>
          <span class="section-title">通用设置</span>
        </div>
        <div class="section-card">
          <div class="menu-item" @click="showLanguagePicker = true">
            <div class="item-left">
              <span class="item-label">{{ $t('settings.language') }}</span>
            </div>
            <div class="item-right">
              <span class="item-value">{{ currentLanguageName }}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 关于与帮助 -->
      <div class="section">
        <div class="section-header">
          <div class="section-icon about">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
          </div>
          <span class="section-title">关于与帮助</span>
        </div>
        <div class="section-card">
          <div class="menu-item" @click="router.push('/help')">
            <div class="item-left">
              <span class="item-label">帮助中心</span>
            </div>
            <div class="item-right">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
          <div class="menu-item" @click="router.push('/about')">
            <div class="item-left">
              <span class="item-label">关于我们</span>
            </div>
            <div class="item-right">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
          <div class="menu-item" @click="router.push('/agreement')">
            <div class="item-left">
              <span class="item-label">用户协议</span>
            </div>
            <div class="item-right">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
          <div class="menu-item" @click="router.push('/privacy')">
            <div class="item-left">
              <span class="item-label">隐私政策</span>
            </div>
            <div class="item-right">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
          <div class="menu-item">
            <div class="item-left">
              <span class="item-label">当前版本</span>
            </div>
            <div class="item-right">
              <span class="item-value">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 退出登录 -->
      <div class="logout-section" v-if="isLoggedIn">
        <button class="logout-btn" @click="handleLogout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>退出登录</span>
        </button>
      </div>

      <!-- 底部间距 -->
      <div class="bottom-space"></div>

      <!-- ========== 弹窗组件 ========== -->

      <!-- 修改昵称弹窗 -->
      <div class="modal-overlay" v-if="showNicknameModal" @click="showNicknameModal = false">
        <div class="modal-sheet" @click.stop>
          <div class="sheet-header">
            <span class="sheet-title">修改昵称</span>
            <button class="sheet-close" @click="showNicknameModal = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="sheet-body">
            <div class="input-group">
              <input 
                type="text" 
                v-model="inputNickname" 
                :placeholder="userNickname || '请输入昵称'"
                class="text-input"
                maxlength="20"
              />
              <span class="char-count">{{ inputNickname.length }}/20</span>
            </div>
            <button class="primary-btn" :disabled="!inputNickname.trim() || isSavingNickname" @click="saveNickname">
              <span v-if="isSavingNickname" class="btn-spinner"></span>
              {{ isSavingNickname ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 语言选择弹窗 -->
      <div class="modal-overlay" v-if="showLanguagePicker" @click="showLanguagePicker = false">
        <div class="modal-sheet" @click.stop>
          <div class="sheet-header">
            <span class="sheet-title">{{ $t('settings.selectLanguage') }}</span>
            <button class="sheet-close" @click="showLanguagePicker = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="sheet-body options-list">
            <div 
              v-for="lang in supportedLanguages" 
              :key="lang.code" 
              class="option-item"
              :class="{ active: currentLocale === lang.code }"
              @click="changeLanguage(lang.code)"
            >
              <span class="option-label">{{ lang.name }}</span>
              <svg v-if="currentLocale === lang.code" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- TRON地址绑定弹窗 -->
      <div class="modal-overlay" v-if="showAddressModal" @click="showAddressModal = false">
        <div class="modal-sheet large" @click.stop>
          <div class="sheet-header">
            <span class="sheet-title">{{ tronAddress ? '查看地址' : '绑定充值地址' }}</span>
            <button class="sheet-close" @click="showAddressModal = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="sheet-body">
            <div class="form-field">
              <label class="field-label">USDT (TRC20) 地址</label>
              <div class="input-row">
                <input 
                  type="text" 
                  v-model="inputAddress" 
                  :placeholder="$t('settings.addressPlaceholder') || '请输入以T开头的TRON地址'"
                  class="text-input mono"
                  maxlength="34"
                  :disabled="!!tronAddress"
                />
                <button class="icon-btn" @click="pasteAddress" v-if="!tronAddress">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                </button>
              </div>
              <span class="field-error" v-if="inputAddress && !isValidAddress">
                请输入有效的TRON地址（以T开头，34位）
              </span>
            </div>
            <div class="notice-box" v-if="!tronAddress">
              <div class="notice-item warning">
                <svg width="4" height="4" viewBox="0 0 4 4" fill="currentColor"><circle cx="2" cy="2" r="2"/></svg>
                地址一旦绑定将无法修改，请谨慎填写
              </div>
              <div class="notice-item">
                <svg width="4" height="4" viewBox="0 0 4 4" fill="currentColor"><circle cx="2" cy="2" r="2"/></svg>
                请确保地址为您本人持有的钱包地址
              </div>
              <div class="notice-item">
                <svg width="4" height="4" viewBox="0 0 4 4" fill="currentColor"><circle cx="2" cy="2" r="2"/></svg>
                绑定后，充值时需从该地址转账
              </div>
            </div>
            <button 
              v-if="!tronAddress"
              class="primary-btn" 
              :disabled="!isValidAddress || isSubmitting"
              @click="bindAddress"
            >
              <span v-if="isSubmitting" class="btn-spinner"></span>
              {{ isSubmitting ? '绑定中...' : '确认绑定' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 修改登录密码弹窗 -->
      <div class="modal-overlay" v-if="showPasswordModal" @click="showPasswordModal = false">
        <div class="modal-sheet large" @click.stop>
          <div class="sheet-header">
            <span class="sheet-title">修改登录密码</span>
            <button class="sheet-close" @click="showPasswordModal = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="sheet-body">
            <div class="form-field">
              <label class="field-label">当前密码</label>
              <div class="input-row">
                <input 
                  :type="showOldPwd ? 'text' : 'password'" 
                  v-model="oldPassword" 
                  placeholder="请输入当前登录密码"
                  class="text-input"
                />
                <button class="icon-btn" @click="showOldPwd = !showOldPwd">
                  <svg v-if="showOldPwd" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-if="!showOldPwd" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="form-field">
              <label class="field-label">新密码</label>
              <div class="input-row">
                <input 
                  :type="showNewPwd ? 'text' : 'password'" 
                  v-model="newPassword" 
                  placeholder="请输入新密码（至少6位）"
                  class="text-input"
                />
                <button class="icon-btn" @click="showNewPwd = !showNewPwd">
                  <svg v-if="showNewPwd" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-if="!showOldPwd" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="form-field">
              <label class="field-label">确认新密码</label>
              <div class="input-row">
                <input 
                  :type="showConfirmPwd ? 'text' : 'password'" 
                  v-model="confirmPassword" 
                  placeholder="请再次输入新密码"
                  class="text-input"
                />
                <button class="icon-btn" @click="showConfirmPwd = !showConfirmPwd">
                  <svg v-if="showConfirmPwd" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-if="!showOldPwd" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="error-box" v-if="passwordError">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              {{ passwordError }}
            </div>
            <button 
              class="primary-btn" 
              :disabled="!canSubmitPassword || isChangingPassword"
              @click="changePassword"
            >
              <span v-if="isChangingPassword" class="btn-spinner"></span>
              {{ isChangingPassword ? '修改中...' : '确认修改' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 设置支付密码弹窗 -->
      <div class="modal-overlay" v-if="showPayPasswordModal" @click="showPayPasswordModal = false">
        <div class="modal-sheet large" @click.stop>
          <div class="sheet-header">
            <span class="sheet-title">{{ hasPayPassword ? '修改支付密码' : '设置支付密码' }}</span>
            <button class="sheet-close" @click="showPayPasswordModal = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="sheet-body">
            <div class="form-field" v-if="hasPayPassword">
              <label class="field-label">当前支付密码</label>
              <div class="pin-inputs">
                <input
                  v-for="(_, index) in 6"
                  :key="'old' + index"
                  :ref="el => oldPayInputRefs[index] = el"
                  type="password"
                  inputmode="numeric"
                  maxlength="1"
                  class="pin-input"
                  :class="{ filled: oldPayPassword[index] }"
                  :value="oldPayPassword[index]"
                  @input="handlePayInput('old', index, $event)"
                  @keydown="handlePayKeydown('old', index, $event)"
                />
              </div>
            </div>
            <div class="form-field" v-else>
              <label class="field-label">登录密码验证</label>
              <div class="input-row">
                <input 
                  :type="showLoginPwd ? 'text' : 'password'" 
                  v-model="loginPasswordForPay" 
                  placeholder="请输入登录密码"
                  class="text-input"
                />
                <button class="icon-btn" @click="showLoginPwd = !showLoginPwd">
                  <svg v-if="showLoginPwd" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-if="!showOldPwd" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="form-field">
              <label class="field-label">{{ hasPayPassword ? '新支付密码' : '支付密码' }}</label>
              <div class="pin-inputs">
                <input
                  v-for="(_, index) in 6"
                  :key="'new' + index"
                  :ref="el => newPayInputRefs[index] = el"
                  type="password"
                  inputmode="numeric"
                  maxlength="1"
                  class="pin-input"
                  :class="{ filled: newPayPassword[index] }"
                  :value="newPayPassword[index]"
                  @input="handlePayInput('new', index, $event)"
                  @keydown="handlePayKeydown('new', index, $event)"
                />
              </div>
              <span class="field-hint">请输入6位数字密码</span>
            </div>
            <div class="form-field">
              <label class="field-label">确认支付密码</label>
              <div class="pin-inputs">
                <input
                  v-for="(_, index) in 6"
                  :key="'confirm' + index"
                  :ref="el => confirmPayInputRefs[index] = el"
                  type="password"
                  inputmode="numeric"
                  maxlength="1"
                  class="pin-input"
                  :class="{ filled: confirmPayPassword[index] }"
                  :value="confirmPayPassword[index]"
                  @input="handlePayInput('confirm', index, $event)"
                  @keydown="handlePayKeydown('confirm', index, $event)"
                />
              </div>
            </div>
            <div class="error-box" v-if="payPasswordError">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              {{ payPasswordError }}
            </div>
            <button 
              class="primary-btn" 
              :disabled="!canSubmitPayPassword || isSettingPayPassword"
              @click="submitPayPassword"
            >
              <span v-if="isSettingPayPassword" class="btn-spinner"></span>
              {{ isSettingPayPassword ? '设置中...' : (hasPayPassword ? '确认修改' : '确认设置') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { alert } from '../utils/alert'
import { uploadAvatar } from '../utils/upload'
import PageLayout from '../components/layout/PageLayout.vue'
import { SUPPORTED_LANGUAGES, setLocale, getCurrentLocale } from '../i18n'
import { api } from '../utils/api'
import { useUserStore } from '../stores/user'

const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()

// 用户基本信息
const isLoggedIn = ref(false)
const userAvatar = ref('')
const userNickname = ref('')
const userUid = ref('')
const kycStatus = ref(0)
const isUploadingAvatar = ref(false)

// 昵称修改
const showNicknameModal = ref(false)
const inputNickname = ref('')
const isSavingNickname = ref(false)

// 语言选择
const showLanguagePicker = ref(false)

// TRON地址绑定
const showAddressModal = ref(false)
const tronAddress = ref('')
const inputAddress = ref('')
const isSubmitting = ref(false)

// 登录密码修改
const showPasswordModal = ref(false)
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showOldPwd = ref(false)
const showNewPwd = ref(false)
const showConfirmPwd = ref(false)
const isChangingPassword = ref(false)
const passwordError = ref('')

// 支付密码
const showPayPasswordModal = ref(false)
const hasPayPassword = ref(false)
const oldPayPassword = ref(['', '', '', '', '', ''])
const newPayPassword = ref(['', '', '', '', '', ''])
const confirmPayPassword = ref(['', '', '', '', '', ''])
const loginPasswordForPay = ref('')
const showLoginPwd = ref(false)
const oldPayInputRefs = ref([])
const newPayInputRefs = ref([])
const confirmPayInputRefs = ref([])
const isSettingPayPassword = ref(false)
const payPasswordError = ref('')

// KYC 状态显示
const kycStatusClass = computed(() => {
  const statusMap = { 0: 'warning', 1: 'pending', 2: 'success', 3: 'error' }
  return statusMap[kycStatus.value] || 'warning'
})
const kycStatusText = computed(() => {
  const textMap = { 0: '未认证', 1: '审核中', 2: '已认证', 3: '已拒绝' }
  return textMap[kycStatus.value] || '未认证'
})

// 验证TRON地址格式
const isValidAddress = computed(() => /^T[a-zA-Z0-9]{33}$/.test(inputAddress.value))

// 验证登录密码修改
const canSubmitPassword = computed(() => {
  return oldPassword.value.length >= 6 && 
         newPassword.value.length >= 6 && 
         confirmPassword.value === newPassword.value
})

// 验证支付密码设置
const canSubmitPayPassword = computed(() => {
  const newPwd = newPayPassword.value.join('')
  const confirmPwd = confirmPayPassword.value.join('')
  if (hasPayPassword.value) {
    const oldPwd = oldPayPassword.value.join('')
    return oldPwd.length === 6 && newPwd.length === 6 && newPwd === confirmPwd
  } else {
    return loginPasswordForPay.value.length >= 6 && newPwd.length === 6 && newPwd === confirmPwd
  }
})

// 语言相关
const supportedLanguages = SUPPORTED_LANGUAGES
const currentLocale = computed(() => getCurrentLocale())
const currentLanguageName = computed(() => {
  const lang = supportedLanguages.find(l => l.code === currentLocale.value)
  return lang?.name || '简体中文'
})

// 格式化地址显示
const formatAddress = (addr) => {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`
}

// 复制 UID
const copyUid = async () => {
  if (!userUid.value) return
  try {
    await navigator.clipboard.writeText(userUid.value)
    await alert('UID 已复制')
  } catch {
    await alert('复制失败')
  }
}

// 选择并上传头像
const selectAvatar = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  // 添加capture属性提高移动端兼容性
  input.setAttribute('capture', 'environment')
  
  input.onchange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      isUploadingAvatar.value = true
      // 1. 上传图片到服务器
      const result = await uploadAvatar(file)
      // 处理可能的双重包装
      const avatarUrl = result?.data?.url || result?.url || (typeof result === 'string' ? result : '')
      if (!avatarUrl) {
        throw new Error('上传返回数据异常')
      }
      
      // 2. 调用API保存头像到用户账户
      const updateRes = await api.account.updateProfile({ avatar: avatarUrl })
      // 兼容多种响应格式
      const isSuccess = updateRes.success || updateRes.code === 0
      
      if (isSuccess) {
        userAvatar.value = avatarUrl
        userStore.setUserInfo({ avatar: avatarUrl })
        await alert(t('settings.avatarUpdated'))
      } else {
        throw new Error(updateRes.message || updateRes.msg || '保存失败')
      }
    } catch (error) {
      console.error('头像上传失败:', error)
      await alert(error.message || t('settings.avatarFailed'))
    } finally {
      isUploadingAvatar.value = false
    }
  }
  
  // 延迟触发以提高移动端兼容性
  setTimeout(() => input.click(), 100)
}

// 保存昵称
const saveNickname = async () => {
  if (!inputNickname.value.trim() || isSavingNickname.value) return
  isSavingNickname.value = true
  try {
    const response = await api.account.updateProfile({ nickname: inputNickname.value.trim() })
    if (response.success) {
      userNickname.value = inputNickname.value.trim()
      userStore.setUserInfo({ nickname: userNickname.value })
      showNicknameModal.value = false
      await alert('昵称修改成功')
    } else {
      await alert(response.message || '修改失败')
    }
  } catch (error) {
    await alert(error.message || '修改失败')
  } finally {
    isSavingNickname.value = false
  }
}

// 切换语言
const changeLanguage = (code) => {
  setLocale(code)
  showLanguagePicker.value = false
}

// 粘贴地址
const pasteAddress = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputAddress.value = text.trim()
  } catch {
    await alert('粘贴失败，请手动输入')
  }
}

// 绑定地址
const bindAddress = async () => {
  if (!isValidAddress.value || isSubmitting.value) return
  isSubmitting.value = true
  try {
    const response = await api.account.updateProfile({ tronAddress: inputAddress.value })
    if (response.success) {
      tronAddress.value = inputAddress.value
      showAddressModal.value = false
      await alert('地址绑定成功')
    } else {
      await alert(response.message || '绑定失败')
    }
  } catch (error) {
    await alert(error.message || '绑定失败')
  } finally {
    isSubmitting.value = false
  }
}

// 修改登录密码
const changePassword = async () => {
  if (!canSubmitPassword.value || isChangingPassword.value) return
  passwordError.value = ''
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = '两次输入的密码不一致'
    return
  }
  isChangingPassword.value = true
  try {
    const response = await api.account.changePassword({
      oldPassword: oldPassword.value,
      newPassword: newPassword.value
    })
    if (response.success) {
      showPasswordModal.value = false
      oldPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
      await alert('密码修改成功')
    } else {
      passwordError.value = response.message || '密码修改失败'
    }
  } catch (error) {
    passwordError.value = error.message || '密码修改失败'
  } finally {
    isChangingPassword.value = false
  }
}

// 点击支付密码设置
const handlePayPasswordClick = async () => {
  try {
    const response = await api.get('/account/trade-password/status')
    if (response.success) {
      hasPayPassword.value = response.data?.hasTradePassword || false
    }
  } catch (e) {
    console.error('获取支付密码状态失败:', e)
  }
  oldPayPassword.value = ['', '', '', '', '', '']
  newPayPassword.value = ['', '', '', '', '', '']
  confirmPayPassword.value = ['', '', '', '', '', '']
  loginPasswordForPay.value = ''
  payPasswordError.value = ''
  showPayPasswordModal.value = true
}

// 处理支付密码输入
const handlePayInput = (type, index, event) => {
  const value = event.target.value.replace(/\D/g, '')
  const refs = type === 'old' ? oldPayInputRefs : (type === 'new' ? newPayInputRefs : confirmPayInputRefs)
  const password = type === 'old' ? oldPayPassword : (type === 'new' ? newPayPassword : confirmPayPassword)
  if (value) {
    password.value[index] = value.slice(-1)
    payPasswordError.value = ''
    if (index < 5) refs.value[index + 1]?.focus()
  } else {
    password.value[index] = ''
  }
}

// 处理支付密码键盘事件
const handlePayKeydown = (type, index, event) => {
  const refs = type === 'old' ? oldPayInputRefs : (type === 'new' ? newPayInputRefs : confirmPayInputRefs)
  const password = type === 'old' ? oldPayPassword : (type === 'new' ? newPayPassword : confirmPayPassword)
  if (event.key === 'Backspace') {
    if (!password.value[index] && index > 0) {
      password.value[index - 1] = ''
      refs.value[index - 1]?.focus()
    } else {
      password.value[index] = ''
    }
  } else if (event.key === 'ArrowLeft' && index > 0) {
    refs.value[index - 1]?.focus()
  } else if (event.key === 'ArrowRight' && index < 5) {
    refs.value[index + 1]?.focus()
  }
}

// 提交支付密码
const submitPayPassword = async () => {
  if (!canSubmitPayPassword.value || isSettingPayPassword.value) return
  payPasswordError.value = ''
  const newPwd = newPayPassword.value.join('')
  const confirmPwd = confirmPayPassword.value.join('')
  if (newPwd !== confirmPwd) {
    payPasswordError.value = '两次输入的密码不一致'
    return
  }
  isSettingPayPassword.value = true
  try {
    let response
    if (hasPayPassword.value) {
      const oldPwd = oldPayPassword.value.join('')
      response = await api.put('/account/trade-password', {
        oldTradePassword: oldPwd,
        newTradePassword: newPwd
      })
    } else {
      response = await api.post('/account/trade-password', {
        tradePassword: newPwd,
        loginPassword: loginPasswordForPay.value
      })
    }
    if (response.success) {
      showPayPasswordModal.value = false
      hasPayPassword.value = true
      await alert(hasPayPassword.value ? '支付密码修改成功' : '支付密码设置成功')
    } else {
      payPasswordError.value = response.message || '操作失败'
    }
  } catch (error) {
    payPasswordError.value = error.message || '操作失败'
  } finally {
    isSettingPayPassword.value = false
  }
}

// 退出登录
const handleLogout = async () => {
  userStore.logout()
  await alert(t('settings.loggedOut'))
  router.push('/login')
}

// 初始化
onMounted(async () => {
  isLoggedIn.value = !!localStorage.getItem('token')
  if (isLoggedIn.value) {
    try {
      const response = await api.account.profile()
      if (response.success && response.data) {
        userAvatar.value = response.data.avatar || ''
        userNickname.value = response.data.nickname || response.data.username || ''
        userUid.value = response.data.uid || ''
        tronAddress.value = response.data.tronAddress || ''
        inputAddress.value = response.data.tronAddress || ''
        kycStatus.value = response.data.kycStatus || 0
        inputNickname.value = userNickname.value
      }
    } catch (e) {
      console.error('加载用户信息失败:', e)
    }
    try {
      const pwdResponse = await api.get('/account/trade-password/status')
      if (pwdResponse.success) {
        hasPayPassword.value = pwdResponse.data?.hasTradePassword || false
      }
    } catch (e) {
      console.error('加载支付密码状态失败:', e)
    }
  }
})
</script>

<style scoped>
/* ==================== Settings Page - Premium Dark UI ==================== */
.settings-page {
  min-height: calc(100vh - 44px);
  background: #0D1117;
  padding-bottom: env(safe-area-inset-bottom);
}

/* ===== 用户头部卡片 ===== */
.user-header {
  padding: 20px 16px;
  background: linear-gradient(180deg, rgba(200, 170, 110, 0.08) 0%, transparent 100%);
}

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(145deg, #1A2028 0%, #151A20 100%);
  border: 1px solid rgba(200, 170, 110, 0.12);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.avatar-section { cursor: pointer; }

.avatar-container {
  position: relative;
  width: 68px;
  height: 68px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(200, 170, 110, 0.3);
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(145deg, #252D38 0%, #1E252E 100%);
  border: 3px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5A6270;
}

.avatar-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #C8AA6E 0%, #A08A5B 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0D1117;
  border: 2px solid #0D1117;
}

.avatar-loading {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(200, 170, 110, 0.3);
  border-top-color: #C8AA6E;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.user-info { flex: 1; min-width: 0; }

.nickname-row {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 8px;
}

.nickname {
  font-size: 18px;
  font-weight: 600;
  color: #F0F2F5;
}

.nickname-row svg { color: #6B7684; transition: color 0.2s; }
.nickname-row:active svg { color: #C8AA6E; }

.uid-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.uid-label { font-size: 13px; color: #6B7684; }
.uid-value { font-size: 13px; color: #9CA3AF; font-family: 'SF Mono', monospace; }

.copy-btn {
  padding: 4px;
  background: none;
  border: none;
  color: #6B7684;
  cursor: pointer;
  transition: color 0.2s;
}
.copy-btn:active { color: #C8AA6E; }

/* ===== 区块样式 ===== */
.section {
  padding: 0 16px;
  margin-bottom: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 4px;
}

.section-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-icon.security { background: rgba(14, 203, 129, 0.1); color: #0ECB81; }
.section-icon.wallet { background: rgba(200, 170, 110, 0.1); color: #C8AA6E; }
.section-icon.general { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
.section-icon.about { background: rgba(139, 92, 246, 0.1); color: #8B5CF6; }

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #9CA3AF;
  letter-spacing: 0.5px;
}

.section-card {
  background: linear-gradient(145deg, #1A2028 0%, #151A20 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* ===== 菜单项 ===== */
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: background 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.menu-item:last-child { border-bottom: none; }
.menu-item:active { background: rgba(200, 170, 110, 0.06); }

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.item-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chain-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(200, 170, 110, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C8AA6E;
}

.item-label { font-size: 15px; color: #F0F2F5; }
.item-desc { font-size: 12px; color: #6B7684; margin-top: 2px; }
.address-preview { font-size: 12px; color: #C8AA6E; font-family: 'SF Mono', monospace; }

.item-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-value { font-size: 14px; color: #6B7684; }
.item-right > svg { color: #4A5056; }

/* 状态标签 */
.status-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 10px;
}

.status-tag.success { background: rgba(14, 203, 129, 0.12); color: #0ECB81; }
.status-tag.warning { background: rgba(246, 70, 93, 0.12); color: #F6465D; }
.status-tag.pending { background: rgba(245, 166, 35, 0.12); color: #F5A623; }
.status-tag.error { background: rgba(246, 70, 93, 0.12); color: #F6465D; }

/* 提示框 */
.tip-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 10px;
  padding: 12px 14px;
  background: rgba(200, 170, 110, 0.06);
  border: 1px solid rgba(200, 170, 110, 0.1);
  border-radius: 12px;
  font-size: 12px;
  color: #9CA3AF;
  line-height: 1.5;
}

.tip-box svg { flex-shrink: 0; margin-top: 1px; color: #C8AA6E; }

/* ===== 退出登录 ===== */
.logout-section { padding: 24px 16px 0; }

.logout-btn {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(145deg, #1A2028 0%, #151A20 100%);
  border: 1px solid rgba(246, 70, 93, 0.2);
  border-radius: 14px;
  font-size: 15px;
  font-weight: 500;
  color: #F6465D;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:active {
  transform: scale(0.98);
  background: rgba(246, 70, 93, 0.1);
}

.bottom-space { height: 40px; }

/* ===== 弹窗 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal-sheet {
  width: 100%;
  max-width: 428px;
  background: linear-gradient(180deg, #1E262F 0%, #161B22 100%);
  border-radius: 24px 24px 0 0;
  border-top: 1px solid rgba(200, 170, 110, 0.15);
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
  max-height: 70vh;
  overflow-y: auto;
}

.modal-sheet.large { max-height: 85vh; }

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  position: sticky;
  top: 0;
  background: inherit;
  z-index: 1;
}

.sheet-title { font-size: 17px; font-weight: 600; color: #F0F2F5; }

.sheet-close {
  padding: 4px;
  background: none;
  border: none;
  color: #6B7684;
  cursor: pointer;
}
.sheet-close:active { color: #C8AA6E; }

.sheet-body { padding: 20px; }

/* 选项列表 */
.options-list { padding: 8px 0; }

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.15s;
}

.option-item:active { background: rgba(200, 170, 110, 0.08); }
.option-item.active { background: rgba(200, 170, 110, 0.1); }
.option-item.active svg { color: #C8AA6E; }

.option-label { font-size: 15px; color: #E6EDF3; }

/* 表单 */
.form-field { margin-bottom: 20px; }

.field-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #9CA3AF;
  margin-bottom: 10px;
}

.input-row {
  display: flex;
  gap: 10px;
}

.text-input {
  flex: 1;
  height: 48px;
  padding: 0 16px;
  background: linear-gradient(135deg, #0D1117 0%, #151A20 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #E6EDF3;
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
}

.text-input.mono { font-family: 'SF Mono', Monaco, monospace; font-size: 14px; }
.text-input:disabled { opacity: 0.6; cursor: not-allowed; }
.text-input::placeholder { color: #4A5056; }
.text-input:focus { border-color: #C8AA6E; box-shadow: 0 0 0 3px rgba(200, 170, 110, 0.12); }

.icon-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #161B22 0%, #1E262F 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #6B7684;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:active { border-color: #C8AA6E; color: #C8AA6E; }

.input-group {
  position: relative;
  margin-bottom: 16px;
}

.char-count {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #6B7684;
}

.field-error {
  display: block;
  font-size: 12px;
  color: #F6465D;
  margin-top: 8px;
}

.field-hint {
  display: block;
  font-size: 12px;
  color: #6B7684;
  margin-top: 8px;
  text-align: center;
}

/* 通知框 */
.notice-box {
  padding: 14px;
  background: rgba(200, 170, 110, 0.06);
  border: 1px solid rgba(200, 170, 110, 0.1);
  border-radius: 12px;
  margin-bottom: 20px;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #6B7684;
  padding: 5px 0;
}

.notice-item.warning { color: #F5A623; font-weight: 500; }
.notice-item svg { color: #C8AA6E; flex-shrink: 0; }
.notice-item.warning svg { color: #F5A623; }

/* 错误框 */
.error-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: rgba(246, 70, 93, 0.1);
  border: 1px solid rgba(246, 70, 93, 0.2);
  border-radius: 10px;
  font-size: 13px;
  color: #F6465D;
  margin-bottom: 16px;
}

/* 主按钮 */
.primary-btn {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #C8AA6E 0%, #E8D5A3 50%, #C8AA6E 100%);
  background-size: 200% 100%;
  border: none;
  border-radius: 14px;
  color: #0D1117;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  animation: none;
}

.primary-btn:not(:disabled):active {
  transform: scale(0.98);
  box-shadow: 0 0 20px rgba(200, 170, 110, 0.4);
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(13, 17, 23, 0.3);
  border-top-color: #0D1117;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* PIN 输入框 */
.pin-inputs {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.pin-input {
  width: 42px;
  height: 50px;
  background: linear-gradient(145deg, #0D1117 0%, #151A20 100%);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  color: #F0F2F5;
  outline: none;
  transition: all 0.2s;
  -webkit-text-security: disc;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.pin-input:focus {
  border-color: #C8AA6E;
  background: rgba(200, 170, 110, 0.08);
  box-shadow: 0 0 0 3px rgba(200, 170, 110, 0.12);
}

.pin-input.filled {
  border-color: rgba(200, 170, 110, 0.4);
  background: rgba(200, 170, 110, 0.08);
}
</style>