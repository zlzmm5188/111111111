import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 复购补贴配置表
 */
@Entity('pool_repurchase_config')
export class PoolRepurchaseConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'smallint', default: 1, comment: '全局开关: 0关闭 1开启' })
  status: number;

  // 固定金额补贴
  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0, comment: '固定补贴金额' })
  fixedAmount: number;

  @Column({ type: 'varchar', length: 20, default: 'USDT', comment: '固定补贴币种' })
  fixedCoin: string;

  // 百分比补贴
  @Column({ type: 'smallint', default: 0, comment: '是否启用百分比: 0关闭 1开启' })
  percentEnabled: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0, comment: '复购补贴百分比(0-100)' })
  repurchasePercent: number;

  // 条件限制
  @Column({ type: 'int', default: 1, comment: '至少持有过几个项目' })
  minHoldingCount: number;

  @Column({ type: 'smallint', default: 1, comment: '是否需要有到期项目: 0否 1是' })
  requireExpired: number;

  @Column({ type: 'int', default: 7, comment: '排除注册几天内的新手(0为不排除)' })
  excludeNewbieDays: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
