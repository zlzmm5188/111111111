import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { PoolProduct } from './pool-product.entity';

/**
 * 层级返利配置表
 */
@Entity('pool_commission_config')
export class PoolCommissionConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', unsigned: true, name: 'product_id' })
  @Index()
  productId: number;

  @ManyToOne(() => PoolProduct)
  @JoinColumn({ name: 'product_id' })
  product: PoolProduct;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0, comment: '一级返利百分比(下级收益的%)' })
  level1Percent: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0, comment: '二级返利百分比' })
  level2Percent: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0, comment: '三级返利百分比' })
  level3Percent: number;

  @Column({ type: 'int', default: 3, comment: '最多返利几层' })
  maxCommissionLevels: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
