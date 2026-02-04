/**
 * H5 统一格式化工具
 * 与 Admin 后台保持一致的格式化逻辑
 */

/**
 * 移除数字末尾多余的0
 * @param {string} str - 数字字符串
 * @returns {string}
 */
function removeTrailingZeros(str) {
  if (!str.includes('.')) return str
  return str.replace(/\.?0+$/, '')
}

/**
 * 格式化数字 - 统一格式化函数
 * @param {number|string} val - 数字值
 * @param {number} maxDecimals - 最大小数位数，默认2位
 * @param {boolean} useShortForm - 是否使用简化格式（K/M），默认false
 * @returns {string} 格式化后的字符串
 *
 * @example
 * formatNumber(0)              => "0"
 * formatNumber(5.00)           => "5"
 * formatNumber(3.10)           => "3.1"
 * formatNumber(3.15)           => "3.15"
 * formatNumber(1500)           => "1,500"（千分位）
 * formatNumber(1500, 2, true)  => "1.5K"（简化格式）
 */
export function formatNumber(val, maxDecimals = 2, useShortForm = false) {
  if (val === null || val === undefined || val === '') return '0'

  const num = parseFloat(val)
  if (isNaN(num)) return '0'
  if (num === 0) return '0'

  // 简化格式 (K/M)
  if (useShortForm) {
    if (num >= 1000000) {
      const millions = num / 1000000
      return removeTrailingZeros(millions.toFixed(maxDecimals)) + 'M'
    }
    if (num >= 1000) {
      const thousands = num / 1000
      return removeTrailingZeros(thousands.toFixed(maxDecimals)) + 'K'
    }
  }

  // 默认：显示完整数字，去掉多余的0
  return removeTrailingZeros(num.toFixed(maxDecimals))
}

/**
 * 格式化金额 - 带千分位
 * @param {number|string} val - 金额
 * @param {number} decimals - 小数位数，默认2位
 * @returns {string}
 *
 * @example
 * formatAmount(1234.5)    => "1,234.50"
 * formatAmount(1000000)   => "1,000,000.00"
 */
export function formatAmount(val, decimals = 2) {
  if (val === null || val === undefined || val === '') return '0.00'

  const num = parseFloat(val)
  if (isNaN(num)) return '0.00'

  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * 格式化资产金额 - 智能小数位
 * 小额显示更多小数位，大额显示较少
 * @param {number|string} val - 金额
 * @returns {string}
 *
 * @example
 * formatAsset(0.00001234)  => "0.000012"
 * formatAsset(0.5)         => "0.5000"
 * formatAsset(123.45)      => "123.45"
 * formatAsset(12345)       => "12,345"
 */
export function formatAsset(val) {
  if (val === null || val === undefined || val === '') return '0'

  const num = parseFloat(val)
  if (isNaN(num) || num === 0) return '0'

  // 极小数用科学计数法
  if (num > 0 && num < 0.0001) {
    return num.toExponential(2)
  }
  // 小于1显示6位小数
  if (num < 1) {
    return removeTrailingZeros(num.toFixed(6))
  }
  // 小于1000显示4位小数
  if (num < 1000) {
    return removeTrailingZeros(num.toFixed(4))
  }
  // 大于1000显示千分位，2位小数
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

/**
 * 格式化百分比
 * @param {number|string} val - 百分比值（已是百分比形式，如 5.25 表示 5.25%）
 * @param {number} decimals - 小数位数，默认2位
 * @returns {string}
 */
export function formatPercent(val, decimals = 2) {
  if (val === null || val === undefined || val === '') return '0%'

  const num = parseFloat(val)
  if (isNaN(num)) return '0%'

  const sign = num >= 0 ? '+' : ''
  return sign + removeTrailingZeros(num.toFixed(decimals)) + '%'
}

/**
 * 格式化日期时间
 * @param {string|Date} date - 日期
 * @param {string} format - 格式，默认 'YYYY-MM-DD HH:mm'
 * @returns {string}
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm') {
  if (!date) return '-'

  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

export default {
  formatNumber,
  formatAmount,
  formatAsset,
  formatPercent,
  formatDate
}
