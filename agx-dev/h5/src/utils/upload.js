/**
 * 图片上传工具函数
 * 支持图片压缩、预览、上传进度显示
 */
import { alert } from './alert'

/**
 * 压缩图片
 * 支持HEIC转换和EXIF方向修正
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const { maxWidth = 1920, maxHeight = 1920, quality = 0.8 } = options
    
    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        let width = img.width
        let height = img.height
        
        // 计算压缩后的尺寸
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // 填充白色背景（避免透明背景转JPEG时变黑）
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)
        
        ctx.drawImage(img, 0, 0, width, height)
        
        // 强制输出为JPEG格式，确保兼容性
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // 生成新文件名
              const newName = file.name.replace(/\.[^.]+$/, '.jpg')
              resolve(new File([blob], newName, { type: 'image/jpeg' }))
            } else {
              reject(new Error('图片压缩失败'))
            }
          },
          'image/jpeg',
          quality
        )
      }
      
      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
  })
}

/**
 * 验证图片文件
 * 支持移动端常见格式
 */
export const validateImage = (file, options = {}) => {
  const { maxSize = 5 * 1024 * 1024 } = options
  // 支持更多移动端格式，包括HEIC
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'image/heic', 'image/heif', 'image/bmp'
  ]
  
  // 检查文件类型 - 也检查文件扩展名作为备选
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()
  const ext = fileName.split('.').pop()
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp']
  
  const isValidType = allowedTypes.includes(fileType) || 
                      fileType.startsWith('image/') ||
                      validExtensions.includes(ext)
  
  if (!isValidType) {
    return {
      valid: false,
      message: '只支持 JPG、PNG、GIF、WEBP、HEIC 格式的图片'
    }
  }
  
  // 检查文件大小
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      message: `图片大小不能超过 ${maxSizeMB}MB`
    }
  }
  
  return {
    valid: true,
    message: ''
  }
}

/**
 * 生成图片预览URL
 */
export const getImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = (e) => {
      resolve(e.target.result)
    }
    
    reader.onerror = () => {
      reject(new Error('预览生成失败'))
    }
  })
}

/**
 * 上传单个图片
 */
export const uploadImage = async (file, options = {}) => {
  const {
    type = 'others',
    compress = true,
    compressOptions = {},
    onProgress = null,
    validateOptions = {}
  } = options
  
  // 验证文件
  const validation = validateImage(file, validateOptions)
  if (!validation.valid) {
    await alert(validation.message)
    throw new Error(validation.message)
  }
  
  // 压缩图片
  let uploadFile = file
  if (compress) {
    try {
      uploadFile = await compressImage(file, compressOptions)
    } catch (error) {
      console.error('图片压缩失败:', error)
      // 压缩失败时使用原图
      uploadFile = file
    }
  }
  
  // 创建FormData
  const formData = new FormData()
  formData.append('file', uploadFile)
  formData.append('type', type)
  
  // 获取token
  const token = localStorage.getItem('token')
  
  // 上传文件
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    // 监听上传进度
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          onProgress(percent)
        }
      })
    }
    
    // 监听上传完成
    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const response = JSON.parse(xhr.responseText)
          if (response.code === 0) {
            // 处理双层包装的情况
            let data = response.data
            if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
              data = data.data  // 解包嵌套
            }
            resolve(data)
          } else {
            reject(new Error(response.msg || '上传失败'))
          }
        } catch (error) {
          reject(new Error('响应解析失败'))
        }
      } else {
        reject(new Error('上传失败'))
      }
    })
    
    // 监听上传错误
    xhr.addEventListener('error', () => {
      reject(new Error('网络错误'))
    })
    
    // 监听上传取消
    xhr.addEventListener('abort', () => {
      reject(new Error('上传已取消'))
    })
    
    // 发送请求
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
    xhr.open('POST', `${baseURL}/upload/single`)
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }
    xhr.send(formData)
  })
}

/**
 * 上传多个图片
 */
export const uploadImages = async (files, options = {}) => {
  const {
    type = 'others',
    compress = true,
    compressOptions = {},
    onProgress = null,
    validateOptions = {}
  } = options
  
  // 验证所有文件
  for (const file of files) {
    const validation = validateImage(file, validateOptions)
    if (!validation.valid) {
      await alert(validation.message)
      throw new Error(validation.message)
    }
  }
  
  // 压缩所有图片
  let uploadFiles = files
  if (compress) {
    try {
      uploadFiles = await Promise.all(
        files.map(file => compressImage(file, compressOptions).catch(() => file))
      )
    } catch (error) {
      console.error('图片压缩失败:', error)
      uploadFiles = files
    }
  }
  
  // 创建FormData
  const formData = new FormData()
  uploadFiles.forEach(file => {
    formData.append('files', file)
  })
  formData.append('type', type)
  
  // 获取token
  const token = localStorage.getItem('token')
  
  // 上传文件
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    // 监听上传进度
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          onProgress(percent)
        }
      })
    }
    
    // 监听上传完成
    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const response = JSON.parse(xhr.responseText)
          if (response.code === 0) {
            // 处理双层包装的情况
            let data = response.data
            if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
              data = data.data  // 解包嵌套
            }
            resolve(data)
          } else {
            reject(new Error(response.msg || '上传失败'))
          }
        } catch (error) {
          reject(new Error('响应解析失败'))
        }
      } else {
        reject(new Error('上传失败'))
      }
    })
    
    // 监听上传错误
    xhr.addEventListener('error', () => {
      reject(new Error('网络错误'))
    })
    
    // 监听上传取消
    xhr.addEventListener('abort', () => {
      reject(new Error('上传已取消'))
    })
    
    // 发送请求
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
    xhr.open('POST', `${baseURL}/upload/multiple`)
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }
    xhr.send(formData)
  })
}

/**
 * 上传KYC证件照片
 */
export const uploadKycImages = async (files, onProgress = null) => {
  if (!files || files.length === 0) {
    await alert('请选择要上传的文件')
    throw new Error('没有选择文件')
  }
  
  // 验证文件数量
  if (files.length < 3) {
    await alert('请上传所有证件照片(正面、背面、手持)')
    throw new Error('文件数量不足')
  }
  
  // 验证每个文件
  for (const file of files) {
    const validation = validateImage(file, { maxSize: 5 * 1024 * 1024 })
    if (!validation.valid) {
      await alert(validation.message)
      throw new Error(validation.message)
    }
  }
  
  // 创建FormData
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  
  // 获取token
  const token = localStorage.getItem('token')
  
  // 上传文件
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    // 监听上传进度
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          onProgress(percent)
        }
      })
    }
    
    // 监听上传完成
    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const response = JSON.parse(xhr.responseText)
          if (response.code === 0) {
            // 处理双层包装的情况
            let data = response.data
            if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
              data = data.data  // 解包嵌套
            }
            resolve(data)
          } else {
            reject(new Error(response.msg || '上传失败'))
          }
        } catch (error) {
          reject(new Error('响应解析失败'))
        }
      } else {
        reject(new Error('上传失败'))
      }
    })
    
    // 监听上传错误
    xhr.addEventListener('error', () => {
      reject(new Error('网络错误'))
    })
    
    // 发送请求
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
    xhr.open('POST', `${baseURL}/upload/kyc`)
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }
    xhr.send(formData)
  })
}

/**
 * 上传头像
 */
export const uploadAvatar = async (file, onProgress = null) => {
  const validation = validateImage(file, { maxSize: 2 * 1024 * 1024 })
  if (!validation.valid) {
    await alert(validation.message)
    throw new Error(validation.message)
  }
  
  // 压缩头像
  let uploadFile = file
  try {
    uploadFile = await compressImage(file, { maxWidth: 512, maxHeight: 512, quality: 0.9 })
  } catch (error) {
    console.error('头像压缩失败:', error)
    uploadFile = file
  }
  
  // 创建FormData
  const formData = new FormData()
  formData.append('file', uploadFile)
  
  // 获取token
  const token = localStorage.getItem('token')
  
  // 上传文件
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    // 监听上传进度
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          onProgress(percent)
        }
      })
    }
    
    // 监听上传完成
    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const response = JSON.parse(xhr.responseText)
          if (response.code === 0) {
            // 处理双层包装的情况
            let data = response.data
            if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
              data = data.data  // 解包嵌套
            }
            resolve(data)
          } else {
            reject(new Error(response.msg || '上传失败'))
          }
        } catch (error) {
          reject(new Error('响应解析失败'))
        }
      } else {
        reject(new Error('上传失败'))
      }
    })
    
    // 监听上传错误
    xhr.addEventListener('error', () => {
      reject(new Error('网络错误'))
    })
    
    // 发送请求
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
    xhr.open('POST', `${baseURL}/upload/avatar`)
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }
    xhr.send(formData)
  })
}

/**
 * 上传帖子图片
 */
export const uploadPostImages = async (files, onProgress = null) => {
  if (!files || files.length === 0) {
    await alert('请选择要上传的图片')
    throw new Error('没有选择文件')
  }
  
  if (files.length > 9) {
    await alert('最多只能上传9张图片')
    throw new Error('文件数量超限')
  }
  
  // 验证每个文件
  for (const file of files) {
    const validation = validateImage(file)
    if (!validation.valid) {
      await alert(validation.message)
      throw new Error(validation.message)
    }
  }
  
  // 压缩所有图片
  let uploadFiles = files
  try {
    uploadFiles = await Promise.all(
      files.map(file => compressImage(file, { maxWidth: 1080, maxHeight: 1080 }).catch(() => file))
    )
  } catch (error) {
    console.error('图片压缩失败:', error)
    uploadFiles = files
  }
  
  // 创建FormData
  const formData = new FormData()
  uploadFiles.forEach(file => {
    formData.append('files', file)
  })
  
  // 获取token
  const token = localStorage.getItem('token')
  
  // 上传文件
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    // 监听上传进度
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          onProgress(percent)
        }
      })
    }
    
    // 监听上传完成
    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const response = JSON.parse(xhr.responseText)
          if (response.code === 0) {
            // 处理双层包装的情况
            let data = response.data
            if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
              data = data.data  // 解包嵌套
            }
            resolve(data)
          } else {
            reject(new Error(response.msg || '上传失败'))
          }
        } catch (error) {
          reject(new Error('响应解析失败'))
        }
      } else {
        reject(new Error('上传失败'))
      }
    })
    
    // 监听上传错误
    xhr.addEventListener('error', () => {
      reject(new Error('网络错误'))
    })
    
    // 发送请求
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
    xhr.open('POST', `${baseURL}/upload/post`)
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }
    xhr.send(formData)
  })
}
