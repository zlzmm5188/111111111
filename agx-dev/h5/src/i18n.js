/**
 * AGX Ecosystem - i18n Configuration
 * Internationalization setup for multi-language support
 */

import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'
import ja from './locales/ja.js'
import ko from './locales/ko.js'
import th from './locales/th.js'
import vi from './locales/vi.js'

// Supported languages with flags
export const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
]

// Get initial locale from localStorage or browser
function getInitialLocale() {
  const saved = localStorage.getItem('agx-locale')
  if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
    return saved
  }

  // Detect from browser
  const browserLang = navigator.language || navigator.languages?.[0] || 'zh-CN'
  const matched = SUPPORTED_LANGUAGES.find(l =>
    browserLang.startsWith(l.code.split('-')[0])
  )
  return matched?.code || 'zh-CN'
}

// Create i18n instance
const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: getInitialLocale(),
  fallbackLocale: 'zh-CN',
  missingWarn: false, // 禁用缺失翻译警告
  fallbackWarn: false, // 禁用fallback警告
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
    'ja': ja,
    'ko': ko,
    'th': th,
    'vi': vi
  },
  globalInjection: true
})

// Set locale function
export function setLocale(localeCode) {
  if (!SUPPORTED_LANGUAGES.some(l => l.code === localeCode)) {
    console.warn(`Unsupported locale: ${localeCode}`)
    return
  }

  i18n.global.locale.value = localeCode
  localStorage.setItem('agx-locale', localeCode)
  document.documentElement.setAttribute('lang', localeCode)
}

// Get current locale
export function getCurrentLocale() {
  return i18n.global.locale.value
}

// Get current language info
export function getCurrentLanguageInfo() {
  const code = getCurrentLocale()
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0]
}

export default i18n
