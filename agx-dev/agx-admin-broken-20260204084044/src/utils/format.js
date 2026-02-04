/**
 * 全局格式化工具
 * 统一处理数字、日期等格式化逻辑
 */

/**
 * 格式化数字 - 去掉多余的0，显示完整数字
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
 * formatNumber(1500)           => "1500"（完整数字）
 * formatNumber(1000000)        => "1000000"（完整数字）
 * formatNumber(1500, 2, true)  => "1.5K"（简化格式）
 * formatNumber(1000000, 2, true)=> "1M"（简化格式）
 */
export function formatNumber(val, maxDecimals = 2, useShortForm = false) {
  if (val === null || val === undefined || val === '') return '0'

  const num = parseFloat(val)
  if (isNaN(num)) return '0'
  if (num === 0) return '0'

  // 只有明确指定 useShortForm=true 时才使用 K/M 简化
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

  // 默认：不使用简化格式，显示完整数字，只去掉多余的0
  return removeTrailingZeros(num.toFixed(maxDecimals))
}

/**
 * 格式化数字 - 使用简化格式（K/M）
 * @param {number|string} val - 数字值
 * @param {number} maxDecimals - 最大小数位数，默认2位
 * @returns {string} 格式化后的字符串
 *
 * @example
 * formatNumberShort(1500)       => "1.5K"
 * formatNumberShort(1000000)    => "1M"
 * formatNumberShort(1234.56)    => "1234.56"
 */
export function formatNumberShort(val, maxDecimals = 2) {
  return formatNumber(val, maxDecimals, true)
}

/**
 * 去掉小数点后无意义的0
 * @param {string} numStr - 数字字符串
 * @returns {string} 处理后的字符串
 *
 * @example
 * removeTrailingZeros("5.00")   => "5"
 * removeTrailingZeros("3.10")   => "3.1"
 * removeTrailingZeros("3.15")   => "3.15"
 * removeTrailingZeros("0.00")   => "0"
 */
function removeTrailingZeros(numStr) {
  // 如果是整数（如 "5.00"），去掉小数点后的0
  if (numStr.indexOf('.') !== -1) {
    numStr = numStr.replace(/\.?0+$/, '')
  }
  return numStr
}

/**
 * 格式化金额 - 带货币符号
 * @param {number|string} val - 金额
 * @param {string} symbol - 货币符号，默认为空
 * @returns {string} 格式化后的金额
 *
 * @example
 * formatAmount(5.00, '₮')     => "₮5"
 * formatAmount(3.15, '$')     => "$3.15"
 * formatAmount(0, '￥')       => "￥0"
 */
export function formatAmount(val, symbol = '') {
  const formatted = formatNumber(val)
  return symbol ? `${symbol}${formatted}` : formatted
}

/**
 * 格式化百分比
 * @param {number|string} val - 数值
 * @param {number} decimals - 小数位数，默认2位
 * @returns {string} 格式化后的百分比
 *
 * @example
 * formatPercent(0.1567)      => "15.67%"
 * formatPercent(0.5)         => "50%"
 * formatPercent(0.12345, 3)  => "12.345%"
 */
export function formatPercent(val, decimals = 2) {
  if (val === null || val === undefined || val === '') return '0%'
  const num = parseFloat(val) * 100
  return removeTrailingZeros(num.toFixed(decimals)) + '%'
}

/**
 * 格式化日期时间
 * @param {string|Date} date - 日期
 * @param {string} format - 格式，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期
 *
 * @example
 * formatDateTime('2026-01-27T14:30:00')  => "2026-01-27 14:30"
 * formatDate('2026-01-27T14:30:00')       => "2026-01-27"
 */
export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '-'

  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`
  }

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 格式化日期（只显示年月日）
 */
export function formatDate(date) {
  return formatDateTime(date, 'YYYY-MM-DD')
}

/**
 * 格式化时间（只显示时分秒）
 */
export function formatTime(date) {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * 截断地址（用于区块链地址）
 * @param {string} addr - 地址
 * @param {number} startLen - 开始保留长度，默认6
 * @param {number} endLen - 结尾保留长度，默认4
 * @returns {string} 截断后的地址
 *
 * @example
 * formatAddress('TRC7ThQjxkZAr4cK...8H9x') => "TRC7Th...8H9x"
 */
export function formatAddress(addr, startLen = 6, endLen = 4) {
  if (!addr) return '-'
  if (addr.length <= startLen + endLen) return addr
  return addr.slice(0, startLen) + '...' + addr.slice(-endLen)
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 *
 * @example
 * formatFileSize(1024)         => "1KB"
 * formatFileSize(1048576)      => "1MB"
 * formatFileSize(1073741824)   => "1GB"
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return removeTrailingZeros((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 数字千分位格式化
 * @param {number|string} val - 数字
 * @returns {string} 格式化后的数字
 *
 * @example
 * formatThousands(1000000)  => "1,000,000"
 * formatThousands(1234.56)  => "1,234.56"
 */
export function formatThousands(val) {
  if (val === null || val === undefined) return '0'
  const num = parseFloat(val)
  if (isNaN(num)) return '0'
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
}
