import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

/**
 * 合约订单结算 WebSocket 网关
 * 负责实时推送订单结算结果给用户
 */
@WebSocketGateway({
  namespace: '/contract',
  cors: {
    origin: (origin, callback) => {
      // 允许所有来源（实际认证在连接时验证）
      callback(null, true);
    },
    credentials: true,
  },
})
export class ContractGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ContractGateway.name);
  private userSockets = new Map<number, Set<string>>(); // userId -> Set<socketId>

  /**
   * 客户端连接
   */
  handleConnection(client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    
    if (userId) {
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);
      
      this.logger.log(`用户 ${userId} 连接到合约网关 (socket: ${client.id})`);
      client.emit('connected', { message: '已连接到合约结算服务', userId });
    } else {
      this.logger.warn(`未授权的连接尝试: ${client.id}`);
      client.emit('error', { message: '需要认证' });
      client.disconnect();
    }
  }

  /**
   * 客户端断开连接
   */
  handleDisconnect(client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(client.id);
      
      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }
      
      this.logger.log(`用户 ${userId} 断开合约网关连接 (socket: ${client.id})`);
    }
  }

  /**
   * 从 socket 中提取用户ID
   * 客户端应在连接时通过 auth.userId 或 query.userId 传递
   */
  private getUserIdFromSocket(client: Socket): number | null {
    // 优先从 auth 中获取（需要 JWT 认证中间件）
    const authUserId = (client.handshake as any).auth?.userId;
    if (authUserId) {
      return parseInt(authUserId, 10);
    }

    // 备选：从 query 参数获取
    const queryUserId = client.handshake.query?.userId as string;
    if (queryUserId) {
      return parseInt(queryUserId, 10);
    }

    return null;
  }

  /**
   * 监听订单结算事件并推送给用户
   */
  @OnEvent('contract.settled')
  handleContractSettled(payload: {
    orderId: number;
    orderNo: string;
    userId: number;
    symbol: string;
    direction: number;
    amount: string;
    openPrice: string;
    closePrice: string;
    profitLoss: string;
    result: number;
    resultText: string;
    ozEarned: string;
    settledAt: string;
  }) {
    const { userId } = payload;
    
    // 向该用户的所有连接推送结算消息
    if (this.userSockets.has(userId)) {
      const socketIds = this.userSockets.get(userId);
      
      socketIds.forEach(socketId => {
        this.server.to(socketId).emit('order.settled', {
          type: 'settlement',
          data: {
            orderId: payload.orderId,
            orderNo: payload.orderNo,
            symbol: payload.symbol,
            direction: payload.direction,
            directionText: payload.direction === 1 ? '看涨' : '看跌',
            amount: payload.amount,
            openPrice: payload.openPrice,
            closePrice: payload.closePrice,
            profitLoss: payload.profitLoss,
            result: payload.result,
            resultText: payload.resultText,
            ozEarned: payload.ozEarned,
            settledAt: payload.settledAt,
            message: `订单 ${payload.orderNo} ${payload.resultText}${payload.result === 1 ? payload.profitLoss : ''} AGX`,
          },
        });
      });

      this.logger.log(`已向用户 ${userId} 推送订单 ${payload.orderNo} 结算结果`);
    } else {
      this.logger.debug(`用户 ${userId} 未连接，跳过推送`);
    }
  }

  /**
   * 广播价格更新（可选功能）
   */
  broadcastPriceUpdate(symbol: string, price: string) {
    this.server.emit('price.update', {
      symbol,
      price,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 向特定用户推送自定义消息
   */
  sendMessageToUser(userId: number, event: string, data: any) {
    if (this.userSockets.has(userId)) {
      const socketIds = this.userSockets.get(userId);
      socketIds.forEach(socketId => {
        this.server.to(socketId).emit(event, data);
      });
      return true;
    }
    return false;
  }

  /**
   * 获取在线用户数
   */
  getOnlineUserCount(): number {
    return this.userSockets.size;
  }

  /**
   * 获取在线连接数
   */
  getConnectionCount(): number {
    let count = 0;
    this.userSockets.forEach(sockets => {
      count += sockets.size;
    });
    return count;
  }
}
