import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ContractOrder } from '../../entities';
import { ContractService } from './contract.service';

/**
 * 合约订单自动结算服务
 * 使用定时任务检查到期订单并自动结算
 */
@Injectable()
export class ContractSettlementService {
  private readonly logger = new Logger(ContractSettlementService.name);

  constructor(
    @InjectRepository(ContractOrder)
    private readonly orderRepo: Repository<ContractOrder>,
    private readonly contractService: ContractService,
  ) {}

  /**
   * 每10秒检查一次到期订单
   * 处理所有需要结算的订单
   */
  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkExpiredOrders() {
    try {
      const now = new Date();
      
      // 查找所有未结算且已到期的订单
      // status = 0: 进行中
      // openAt + duration <= now: 已到期
      const expiredOrders = await this.orderRepo
        .createQueryBuilder('order')
        .where('order.status = :status', { status: 0 })
        .andWhere("order.openAt + (order.duration || ' seconds')::interval <= :now", { now })
        .orderBy('order.openAt', 'ASC')
        .limit(100) // 每次最多处理100个订单，避免一次性处理太多
        .getMany();

      if (expiredOrders.length > 0) {
        this.logger.log(`发现 ${expiredOrders.length} 个到期订单，开始结算...`);

        // 并发处理所有到期订单
        const settlePromises = expiredOrders.map(order => 
          this.settleOrderSafely(order.id)
        );

        const results = await Promise.allSettled(settlePromises);

        // 统计结算结果
        const succeeded = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        this.logger.log(`订单结算完成: 成功 ${succeeded}, 失败 ${failed}`);
      }
    } catch (error) {
      this.logger.error('检查到期订单失败:', error);
    }
  }

  /**
   * 安全地结算单个订单
   * 捕获异常避免影响其他订单
   */
  private async settleOrderSafely(orderId: number): Promise<void> {
    try {
      await this.contractService.settleOrder(orderId);
      this.logger.debug(`订单 ${orderId} 结算成功`);
    } catch (error) {
      this.logger.error(`订单 ${orderId} 结算失败:`, error.message);
      
      // 标记订单为异常状态，避免重复处理
      try {
        await this.orderRepo.update(orderId, {
          status: 2, // 2: 异常状态
          closeAt: new Date(),
        });
      } catch (updateError) {
        this.logger.error(`更新订单 ${orderId} 状态失败:`, updateError.message);
      }
    }
  }

  /**
   * 手动触发结算检查（用于测试或紧急处理）
   */
  async manualCheckExpiredOrders(): Promise<{ processed: number; succeeded: number; failed: number }> {
    this.logger.log('手动触发到期订单检查');
    
    const now = new Date();
    const expiredOrders = await this.orderRepo
      .createQueryBuilder('order')
      .where('order.status = :status', { status: 0 })
      .andWhere("order.openAt + (order.duration || ' seconds')::interval <= :now", { now })
      .orderBy('order.openAt', 'ASC')
      .getMany();

    const results = await Promise.allSettled(
      expiredOrders.map(order => this.settleOrderSafely(order.id))
    );

    return {
      processed: expiredOrders.length,
      succeeded: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
    };
  }

  /**
   * 每小时清理一次超时未结算的订单（兜底机制）
   * 处理那些因为系统故障等原因未能及时结算的订单
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupStaleOrders() {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // 查找1小时前就该结算但还未结算的订单
      const staleOrders = await this.orderRepo
        .createQueryBuilder('order')
        .where('order.status = :status', { status: 0 })
        .andWhere("order.openAt + (order.duration || ' seconds')::interval <= :cutoff", { cutoff: oneHourAgo })
        .getMany();

      if (staleOrders.length > 0) {
        this.logger.warn(`发现 ${staleOrders.length} 个超时未结算订单，开始处理...`);

        const results = await Promise.allSettled(
          staleOrders.map(order => this.settleOrderSafely(order.id))
        );

        const succeeded = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        this.logger.warn(`超时订单处理完成: 成功 ${succeeded}, 失败 ${failed}`);
      }
    } catch (error) {
      this.logger.error('清理超时订单失败:', error);
    }
  }
}
