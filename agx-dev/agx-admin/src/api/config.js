/**
 * AGX Admin API 配置
 * 用于控制 API 版本和功能开关
 */

export const API_CONFIG = {
  // API 版本配置
  versions: {
    // 管理员模块使用 v2 API
    admin: 'v2',  // 'v1' 或 'v2'
    
    // 其他模块暂时使用 v1
    user: 'v1',
    currency: 'v1',
    pool: 'v1',
    contract: 'v1',
    finance: 'v1',
    system: 'v1',
    invite: 'v1',
    trade: 'v1',
    square: 'v1',
    social: 'v1',
  },
  
  // 功能开关
  features: {
    // 启用新版本分页格式
    enableV2Pagination: true,
    
    // 启用统一响应格式
    enableUnifiedResponse: true,
    
    // 启用详细错误信息
    enableDetailedErrors: true,
  },
  
  // 响应格式适配
  responseAdapter: {
    // v2 分页响应格式
    v2: {
      itemsKey: 'items',      // 数据列表字段名
      totalKey: 'total',      // 总数字段名
      pageKey: 'page',        // 当前页字段名
      pageSizeKey: 'pageSize' // 每页大小字段名
    },
    // v1 分页响应格式（向后兼容）
    v1: {
      itemsKey: 'list',
      totalKey: 'total'
    }
  }
}

/**
 * 判断是否使用 v2 API
 * @param {string} module - 模块名称
 * @returns {boolean}
 */
export function useV2API(module) {
  return API_CONFIG.versions[module] === 'v2'
}

/**
 * 适配响应数据格式
 * @param {object} response - API 响应
 * @param {string} module - 模块名称
 * @returns {object} 适配后的响应
 */
export function adaptResponse(response, module = 'user') {
  if (!response || !response.data) return response

  const isV2 = useV2API(module)
  
  // 如果是 v2 响应且包含分页信息，转换为 v1 格式（保持向后兼容）
  if (isV2 && API_CONFIG.features.enableV2Pagination) {
    const { data } = response
    
    // 检查是否是分页响应（包含 items, total, page 等字段）
    if (data && typeof data === 'object' && 'items' in data && 'total' in data) {
      return {
        ...response,
        data: {
          list: data.items,  // items -> list
          total: data.total,
          page: data.page,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
          hasNext: data.hasNext,
          hasPrev: data.hasPrev
        }
      }
    }
  }
  
  return response
}

export default API_CONFIG
