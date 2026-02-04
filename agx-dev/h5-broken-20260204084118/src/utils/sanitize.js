/**
 * 简单的HTML净化工具
 * 用于防止XSS攻击，只允许安全的HTML标签和属性
 */

// 允许的标签白名单
const ALLOWED_TAGS = ['br', 'p', 'strong', 'b', 'em', 'i', 'u', 'span', 'div']

// 允许的属性白名单
const ALLOWED_ATTRS = ['class']

/**
 * 净化HTML字符串，移除不安全的标签和属性
 * @param {string} html - 需要净化的HTML字符串
 * @returns {string} - 净化后的HTML字符串
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') {
    return ''
  }

  // 移除 <script> 标签及其内容
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // 移除 style 和 on* 事件属性
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/\s+style\s*=/gi, '')

  // 只保留允许的标签
  const tagRegex = /<\/?(\w+)(?:\s[^>]*)?\/?>/g
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    const closing = match.startsWith('</')
    const selfClosing = match.endsWith('/>')

    // 如果标签不在白名单中，移除标签但保留内容
    if (!ALLOWED_TAGS.includes(tagName.toLowerCase())) {
      return ''
    }

    // 如果是允许的标签，保留标签但移除不允许的属性
    if (closing) {
      return `</${tagName}>`
    }

    // 提取属性
    const attrRegex = /(\w+)\s*=\s*["']([^"']*)["']/g
    const allowedAttrs = []
    let attrMatch

    while ((attrMatch = attrRegex.exec(match)) !== null) {
      const attrName = attrMatch[1].toLowerCase()
      if (ALLOWED_ATTRS.includes(attrName)) {
        allowedAttrs.push(`${attrName}="${attrMatch[2]}"`)
      }
    }

    const attrs = allowedAttrs.length > 0 ? ' ' + allowedAttrs.join(' ') : ''
    return selfClosing ? `<${tagName}${attrs} />` : `<${tagName}${attrs}>`
  })

  return sanitized
}

/**
 * 将文本中的换行符转换为<br>标签
 * @param {string} text - 文本内容
 * @returns {string} - HTML字符串
 */
export function textToHtml(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }
  return text.replace(/\n/g, '<br>')
}
