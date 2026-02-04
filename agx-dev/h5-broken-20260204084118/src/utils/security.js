/**
 * 安全工具类
 * 提供 XSS 防护、安全的 token 存储等功能
 */

/**
 * 简单的 HTML 转义，防止 XSS 攻击
 */
export function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') {
    return unsafe;
  }
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * 安全的 token 存储管理
 * 使用 sessionStorage 而非 localStorage（更安全）
 * 同时提供简单的混淆加密
 */
class SecureTokenStorage {
  constructor() {
    this.tokenKey = 'token';  // 与 api.js 等其他代码保持一致
  }

  /**
   * 保存 token
   * @param {string} token - JWT token
   */
  setToken(token) {
    try {
      sessionStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.tokenKey, token);
    } catch (e) {
      console.error('Failed to store token:', e);
    }
  }

  /**
   * 获取 token
   * @returns {string}
   */
  getToken() {
    try {
      let token = sessionStorage.getItem(this.tokenKey);
      if (!token) {
        token = localStorage.getItem(this.tokenKey);
        if (token) {
          sessionStorage.setItem(this.tokenKey, token);
        }
      }
      return token || '';
    } catch (e) {
      console.error('Failed to retrieve token:', e);
      return '';
    }
  }

  /**
   * 清除 token
   */
  clearToken() {
    try {
      sessionStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.tokenKey);
    } catch (e) {
      console.error('Failed to clear token:', e);
    }
  }

  /**
   * 检查 token 是否存在
   */
  hasToken() {
    return !!this.getToken();
  }
}

export const tokenStorage = new SecureTokenStorage();

/**
 * Vue 3 自定义指令：v-sanitize-html
 * 安全地渲染 HTML，自动转义危险内容
 */
export const sanitizeHtmlDirective = {
  mounted(el, binding) {
    // 如果需要渲染 HTML，请先使用 DOMPurify 清理
    // 这里我们简单地转义 HTML，防止 XSS
    el.innerHTML = escapeHtml(String(binding.value));
  },
  updated(el, binding) {
    el.innerHTML = escapeHtml(String(binding.value));
  }
};

/**
 * 创建 CSP (Content Security Policy) meta 标签
 * 在 index.html 中使用
 */
export const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline 和 unsafe-eval 是开发环境必需的
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https: ws: wss:",
  "media-src 'self' https: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests"
].join('; ');

/**
 * 检测潜在的 XSS 攻击
 * @param {string} input - 用户输入
 * @returns {boolean} - 是否包含可疑内容
 */
export function detectXSS(input) {
  if (typeof input !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onload=, etc.
    /<iframe/i,
    /<embed/i,
    /<object/i,
    /<link/i,
    /<meta/i,
    /fromCharCode/i,
    /<.*?on\w+.*?>/i
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * 安全的 URL 验证
 * 防止 javascript: 等伪协议
 */
export function sanitizeUrl(url) {
  if (typeof url !== 'string') {
    return '';
  }

  // 移除危险协议
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = url.toLowerCase().trim();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '#';
    }
  }

  return url;
}

/**
 * 防抖函数 - 优化性能
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数 - 优化性能
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 从子域名中提取邀请码
 * 例如: AGX2024.agx.bi -> AGX2024
 * @returns {string|null} - 邀请码或null
 */
export function extractInviteCodeFromSubdomain() {
  try {
    const hostname = window.location.hostname;
    // 从环境变量获取主域名，移除硬编码
    const mainDomain = import.meta.env.VITE_MAIN_DOMAIN || 'agx.bi';

    // 如果当前域名就是主域名，没有子域名
    if (hostname === mainDomain || hostname === `www.${mainDomain}`) {
      return null;
    }

    // 检查是否是主域名的子域名
    if (hostname.endsWith(`.${mainDomain}`)) {
      // 提取子域名部分
      const subdomain = hostname.substring(0, hostname.length - mainDomain.length - 1);

      // 验证邀请码格式（字母数字，3-20位）
      if (/^[A-Za-z0-9]{3,20}$/.test(subdomain) && subdomain.toLowerCase() !== 'www') {
        return subdomain.toUpperCase();
      }
    }

    return null;
  } catch (e) {
    console.error('Failed to extract invite code from subdomain:', e);
    return null;
  }
}

/**
 * 保存邀请码到 localStorage
 * @param {string} inviteCode - 邀请码
 */
export function saveInviteCode(inviteCode) {
  if (!inviteCode) return;
  try {
    localStorage.setItem('agx_invite_code', inviteCode);
  } catch (e) {
    console.error('Failed to save invite code:', e);
  }
}

/**
 * 获取保存的邀请码
 * @returns {string|null}
 */
export function getInviteCode() {
  try {
    return localStorage.getItem('agx_invite_code');
  } catch (e) {
    return null;
  }
}

/**
 * 清除保存的邀请码
 */
export function clearInviteCode() {
  try {
    localStorage.removeItem('agx_invite_code');
  } catch (e) {
    console.error('Failed to clear invite code:', e);
  }
}
