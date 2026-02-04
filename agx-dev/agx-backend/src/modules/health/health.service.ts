import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * 健康检查
   */
  async getHealth() {
    const health: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'unknown',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env: process.env.NODE_ENV || 'development',
    };

    try {
      // 检查数据库连接
      await this.dataSource.query('SELECT 1');
      health.database = 'connected';
    } catch (error: any) {
      health.database = 'disconnected';
      health.status = 'error';
      health.error = error.message;
    }

    return health;
  }

  /**
   * 获取系统信息
   */
  async getSystemInfo() {
    const [dbStats] = await this.dataSource.query(`
      SELECT
        schemaname,
        COUNT(*) as table_count
      FROM pg_tables
      WHERE schemaname = 'public'
      GROUP BY schemaname
    `);

    const [userCount] = await this.dataSource.query(`
      SELECT COUNT(*) as count FROM agx_user
    `);

    const [orderCount] = await this.dataSource.query(`
      SELECT COUNT(*) as count FROM agx_contract_order
    `);

    const [poolStats] = await this.dataSource.query(`
      SELECT
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE status = 1) as active_products
      FROM agx_pool_product
    `);

    const memoryUsage = process.memoryUsage();
    const usedMemory = memoryUsage.heapUsed / 1024 / 1024;

    return {
      database: {
        tables: dbStats,
        users: parseInt(userCount.count),
        orders: parseInt(orderCount.count),
        poolProducts: poolStats,
      },
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memory: memoryUsage,
        cpuUsage: process.cpuUsage(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 每小时记录系统指标
   */
  @Cron(CronExpression.EVERY_HOUR)
  async logSystemMetrics() {
    const metrics = await this.getSystemInfo();

    console.log(`[System Metrics] ${new Date().toISOString()}`);
    console.log(`  Users: ${metrics.database.users}`);
    console.log(`  Orders: ${metrics.database.orders}`);
    console.log(`  Memory: ${((metrics.server.memory.heapUsed || 0) / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Uptime: ${(metrics.server.uptime / 3600).toFixed(2)} hours`);
  }
}
