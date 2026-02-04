import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { PoolProduct } from './pool-product.entity';

/**
 * 产品增值配置表（红包、分红）
 */
@Entity('pool_bonus_config')
export class PoolBonusConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', unsigned: true, name: 'product_id' })
  @Index()
  productId: number;

  @ManyToOne(() => PoolProduct)
  @JoinColumn({ name: 'product_id' })
  product: PoolProduct;

  // 红包配置
  @Column({ type: 'varchar', length: 20, default: 'fixed', comment: '红包类型: fixed-固定金额 percent-百分比' })
  redpacketType: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0, comment: '红包固定金额' })
  redpacketAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0, comment: '红包百分比(0-100)' })
  redpacketPercent: number;

  @Column({ type: 'varchar', length: 20, default: 'USDT', comment: '红包币种' })
  redpacketCoin: string;

  // 合约分红配置
  @Column({ type: 'varchar', length: 20, default: 'percent', comment: '分红类型: percent-百分比 fixed-固定金额' })
  dividendType: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0, comment: '分红固定金额' })
  dividendAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0, comment: '分红百分比(0-100)' })
  dividendPercent: number;

  @Column({ type: 'varchar', length: 20, default: 'USDT', comment: '分红币种' })
  dividendCoin: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
