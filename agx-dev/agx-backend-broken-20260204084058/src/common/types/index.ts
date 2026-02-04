import { Request } from 'express';

/**
 * 认证用户信息接口
 */
export interface AuthUser {
  sub?: number;
  uid?: number;
  id?: number;
  username?: string;
  role?: string;
}

/**
 * 带认证用户的Request类型
 */
export interface RequestWithUser extends Request {
  user?: AuthUser;
}

/**
 * 分页查询DTO基础类型
 */
export interface PaginationQuery {
  page?: number | string;
  pageSize?: number | string;
  limit?: number | string;
}

/**
 * 用户列表查询DTO
 */
export interface UserListQuery extends PaginationQuery {
  keyword?: string;
  status?: number | string;
  level?: number | string;
}

/**
 * 订单列表查询DTO
 */
export interface OrderListQuery extends PaginationQuery {
  userId?: number | string;
  status?: number | string;
  startDate?: string;
  endDate?: string;
}

/**
 * 资产调整DTO
 */
export interface AdjustAssetDto {
  coinId?: number;
  amount: string;
  type: 'add' | 'sub';
  remark?: string;
}

/**
 * 状态更新DTO
 */
export interface UpdateStatusDto {
  status: number;
  remark?: string;
}

/**
 * 审核DTO
 */
export interface ReviewDto {
  status: number;
  remark?: string;
  reason?: string;
}

/**
 * 行情数据类型
 */
export interface TickerData {
  symbol: string;
  price: string;
  change24h: number;
  volume?: string;
  high24h?: string;
  low24h?: string;
}

/**
 * K线数据类型
 */
export type KlineData = [number, string, string, string, string, string];

/**
 * 价格数据类型
 */
export interface PriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  close: number;
  volume: number;
  timestamp: number;
}
