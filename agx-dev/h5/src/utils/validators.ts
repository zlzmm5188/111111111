/**
 * 表单验证工具函数
 * 用于全局表单验证
 */

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否为有效邮箱
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email.trim())
}

/**
 * 验证手机号格式 (支持中国大陆手机号)
 * @param phone 手机号
 * @returns 是否为有效手机号
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false
  }
  // 中国大陆手机号: 1开头，第二位为3-9，共11位
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone.trim())
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns 验证结果对象
 */
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: '密码不能为空' }
  }

  const trimmedPassword = password.trim()

  if (trimmedPassword.length < 8) {
    return { valid: false, message: '密码至少需要8位' }
  }

  if (trimmedPassword.length > 32) {
    return { valid: false, message: '密码不能超过32位' }
  }

  // 检查是否包含字母
  const hasLetter = /[a-zA-Z]/.test(trimmedPassword)
  // 检查是否包含数字
  const hasNumber = /\d/.test(trimmedPassword)

  if (!hasLetter || !hasNumber) {
    return { valid: false, message: '密码必须包含字母和数字' }
  }

  return { valid: true, message: '密码格式正确' }
}

/**
 * 验证密码强度（增强版，禁止弱密码，必须包含大小写字母+数字）
 * @param password 密码
 * @returns 验证结果对象
 */
export function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: '密码不能为空' }
  }

  const trimmedPassword = password.trim()

  if (trimmedPassword.length < 8) {
    return { valid: false, message: '密码至少需要8位' }
  }

  if (trimmedPassword.length > 20) {
    return { valid: false, message: '密码不能超过20位' }
  }

  // 检查是否包含大写字母
  const hasUpperCase = /[A-Z]/.test(trimmedPassword)
  // 检查是否包含小写字母
  const hasLowerCase = /[a-z]/.test(trimmedPassword)
  // 检查是否包含数字
  const hasNumber = /\d/.test(trimmedPassword)

  // 必须同时包含大写字母、小写字母和数字
  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return { valid: false, message: '密码必须同时包含大写字母、小写字母和数字' }
  }

  // 禁止纯数字
  if (/^\d+$/.test(trimmedPassword)) {
    return { valid: false, message: '密码不能是纯数字' }
  }

  // 禁止纯字母
  if (/^[a-zA-Z]+$/.test(trimmedPassword)) {
    return { valid: false, message: '密码不能是纯字母' }
  }

  // 常见弱密码列表
  const weakPasswords = [
    'password', 'Password', 'PASSWORD', 'password1', 'Password1', 'PASSWORD1',
    '12345678', '123456789', '1234567890',
    'qwerty123', 'Qwerty123', 'QWERTY123',
    'abc12345', 'Abc12345', 'ABC12345',
    '11111111', '00000000', '88888888',
    'admin123', 'Admin123', 'ADMIN123',
    'root1234', 'Root1234', 'ROOT1234',
    'test1234', 'Test1234', 'TEST1234',
    'iloveyou', 'ILoveYou', 'ILOVEYOU',
    'sunshine', 'Sunshine', 'SUNSHINE',
    'princess', 'Princess', 'PRINCESS',
    'aa123456', 'Aa123456', 'AA123456',
    'a1234567', 'A1234567', 'A12345678',
  ]

  if (weakPasswords.includes(trimmedPassword)) {
    return { valid: false, message: '密码过于简单，请换一个更安全的密码' }
  }

  // 检查连续字符（如123456、abcdef）
  const hasSequential = checkSequentialChars(trimmedPassword, 5)
  if (hasSequential) {
    return { valid: false, message: '密码不能包含连续的字符序列' }
  }

  // 检查重复字符（如aaaaaa、111111）
  const hasRepeating = /(.)\1{4,}/.test(trimmedPassword)
  if (hasRepeating) {
    return { valid: false, message: '密码不能包含过多重复字符' }
  }

  return { valid: true, message: '密码强度符合要求' }
}

/**
 * 检查是否包含连续字符序列
 */
function checkSequentialChars(str: string, minLength: number): boolean {
  const lower = str.toLowerCase()
  
  // 检查数字连续
  const digits = '0123456789'
  const digitsReverse = '9876543210'
  
  // 检查字母连续
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  const lettersReverse = 'zyxwvutsrqponmlkjihgfedcba'
  
  // 检查键盘行连续
  const keyboard = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
  
  for (let i = 0; i <= lower.length - minLength; i++) {
    const sub = lower.substring(i, i + minLength)
    
    if (digits.includes(sub) || digitsReverse.includes(sub)) {
      return true
    }
    
    if (letters.includes(sub) || lettersReverse.includes(sub)) {
      return true
    }
    
    for (const row of keyboard) {
      if (row.includes(sub)) {
        return true
      }
    }
  }
  
  return false
}

/**
 * 验证金额
 * @param amount 金额
 * @param min 最小值
 * @param max 最大值
 * @returns 验证结果对象
 */
export function validateAmount(
  amount: number,
  min?: number,
  max?: number
): { valid: boolean; message: string } {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { valid: false, message: '请输入有效的金额' }
  }

  if (amount < 0) {
    return { valid: false, message: '金额不能为负数' }
  }

  if (amount === 0) {
    return { valid: false, message: '金额必须大于0' }
  }

  if (min !== undefined && amount < min) {
    return { valid: false, message: `金额不能低于 ${min}` }
  }

  if (max !== undefined && amount > max) {
    return { valid: false, message: `金额不能超过 ${max}` }
  }

  // 检查小数位数（最多8位）
  const decimalPart = amount.toString().split('.')[1]
  if (decimalPart && decimalPart.length > 8) {
    return { valid: false, message: '金额最多支持8位小数' }
  }

  return { valid: true, message: '金额格式正确' }
}

/**
 * 验证区块链地址
 * @param address 地址
 * @param chain 链类型
 * @returns 是否为有效地址
 */
export function validateAddress(address: string, chain: string): boolean {
  if (!address || typeof address !== 'string') {
    return false
  }

  const trimmedAddress = address.trim()

  switch (chain.toLowerCase()) {
    case 'btc':
    case 'bitcoin':
      // BTC地址: 以1、3或bc1开头，长度26-62
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,61}$|^bc1[a-z0-9]{39,87}$/i.test(trimmedAddress)

    case 'eth':
    case 'ethereum':
    case 'bsc':
    case 'polygon':
    case 'arbitrum':
      // EVM地址: 0x开头，后跟40个十六进制字符
      return /^0x[a-fA-F0-9]{40}$/.test(trimmedAddress)

    case 'trx':
    case 'tron':
      // TRON地址: T开头，长度34
      return /^T[a-km-zA-HJ-NP-Z1-9]{33}$/.test(trimmedAddress)

    case 'sol':
    case 'solana':
      // Solana地址: base58编码，长度32-44
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmedAddress)

    case 'usdt':
    case 'usdc':
      // 稳定币可能在多条链上，检查是否是EVM或TRON地址
      const isEVM = /^0x[a-fA-F0-9]{40}$/.test(trimmedAddress)
      const isTRON = /^T[a-km-zA-HJ-NP-Z1-9]{33}$/.test(trimmedAddress)
      return isEVM || isTRON

    default:
      // 默认情况: 至少26个字符，只包含字母数字
      return /^[a-zA-Z0-9]{26,}$/.test(trimmedAddress)
  }
}

/**
 * 验证必填项
 * @param value 值
 * @returns 是否有效
 */
export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) {
    return false
  }

  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  if (typeof value === 'number') {
    return !isNaN(value)
  }

  if (Array.isArray(value)) {
    return value.length > 0
  }

  if (typeof value === 'object') {
    return Object.keys(value).length > 0
  }

  return Boolean(value)
}

/**
 * 验证用户名格式（字母数字混合，8位以上）
 * @param username 用户名
 * @returns 验证结果对象
 */
export function validateUsername(username: string): { valid: boolean; message: string } {
  if (!username || typeof username !== 'string') {
    return { valid: false, message: '用户名不能为空' }
  }

  const trimmedUsername = username.trim()

  // 长度验证：8位或以上
  if (trimmedUsername.length < 8) {
    return { valid: false, message: '用户名至少需要8个字符' }
  }

  if (trimmedUsername.length > 20) {
    return { valid: false, message: '用户名不能超过20个字符' }
  }

  // 只允许字母和数字
  if (!/^[a-zA-Z0-9]+$/.test(trimmedUsername)) {
    return { valid: false, message: '用户名只能包含字母和数字' }
  }

  // 必须同时包含字母和数字（混合）
  const hasLetter = /[a-zA-Z]/.test(trimmedUsername)
  const hasNumber = /\d/.test(trimmedUsername)

  if (!hasLetter || !hasNumber) {
    return { valid: false, message: '用户名必须同时包含字母和数字' }
  }

  return { valid: true, message: '用户名格式正确' }
}

/**
 * 验证身份证号
 * @param idNumber 身份证号
 * @returns 验证结果对象
 */
export function validateIdCard(idNumber: string): { valid: boolean; message: string } {
  if (!idNumber || typeof idNumber !== 'string') {
    return { valid: false, message: '身份证号不能为空' }
  }

  const trimmedId = idNumber.trim()

  // 18位身份证号码正则
  const idRegex = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/

  if (!idRegex.test(trimmedId)) {
    return { valid: false, message: '身份证号格式不正确' }
  }

  // 验证校验码
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(trimmedId[i]) * weights[i]
  }
  
  const checkCode = checkCodes[sum % 11]
  const lastChar = trimmedId[17].toUpperCase()

  if (lastChar !== checkCode) {
    return { valid: false, message: '身份证号校验失败' }
  }

  return { valid: true, message: '身份证号格式正确' }
}

/**
 * 验证护照号
 * @param passportNumber 护照号
 * @returns 验证结果对象
 */
export function validatePassport(passportNumber: string): { valid: boolean; message: string } {
  if (!passportNumber || typeof passportNumber !== 'string') {
    return { valid: false, message: '护照号不能为空' }
  }

  const trimmedPassport = passportNumber.trim()

  // 中国护照: E或G开头 + 8位数字
  // 国际护照: 6-9位字母数字组合
  const passportRegex = /^[EGeg]\d{8}$|^[a-zA-Z0-9]{6,9}$/

  if (!passportRegex.test(trimmedPassport)) {
    return { valid: false, message: '护照号格式不正确' }
  }

  return { valid: true, message: '护照号格式正确' }
}

/**
 * 验证验证码
 * @param code 验证码
 * @param length 验证码长度
 * @returns 验证结果对象
 */
export function validateCode(code: string, length: number = 6): { valid: boolean; message: string } {
  if (!code || typeof code !== 'string') {
    return { valid: false, message: '验证码不能为空' }
  }

  const trimmedCode = code.trim()

  if (trimmedCode.length !== length) {
    return { valid: false, message: `验证码必须是${length}位` }
  }

  if (!/^\d+$/.test(trimmedCode)) {
    return { valid: false, message: '验证码只能包含数字' }
  }

  return { valid: true, message: '验证码格式正确' }
}
