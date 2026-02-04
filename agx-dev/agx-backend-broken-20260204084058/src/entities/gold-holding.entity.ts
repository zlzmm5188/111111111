import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GoldProduct } from './gold-product.entity';

/**
 * 黄金持仓记录
 * 用户持币生金的申购记录
 */
@Entity('agx_gold_holding')
@Index('idx_gold_holding_user', ['userId'])
@Index('idx_gold_holding_status', ['status'])
export class GoldHolding {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 32, unique: true, name: 'order_no', comment: '订单号' })
  orderNo: string;

  @Column({ type: 'bigint', unsigned: true, name: 'user_id' })
  userId: number;

  @Column({ type: 'bigint', unsigned: true, name: 'product_id', comment: '产品ID' })
  productId: number;

  @ManyToOne(() => GoldProduct)
  @JoinColumn({ name: 'product_id' })
  product: GoldProduct;

  @Column({ type: 'varchar', length: 20, name: 'product_type', comment: '产品类型: finance=理财' })
  productType: string;

  @Column({ type: 'varchar', length: 100, name: 'product_name', comment: '产品名称' })
  productName: string;

  // ===== 申购信息 =====
  @Column({ type: 'decimal', precision: 30, scale: 8, comment: '申购金额(USDT)' })
  amount: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, name: 'apy', comment: '年化收益率' })
  apy: string;

  @Column({ type: 'int', name: 'period_days', default: 0, comment: '锁定天数，0为活期' })
  periodDays: number;

  // ===== 收益相关 =====
  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'total_income', default: '0', comment: '累计收益' })
  totalIncome: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'yesterday_income', default: '0', comment: '昨日收益' })
  yesterdayIncome: string;

  @Column({ type: 'int', name: 'income_days', default: 0, comment: '计息天数' })
  incomeDays: number;

  // ===== 时间节点 =====
  @Column({ type: 'timestamp', name: 'start_at', nullable: true, comment: '开始计息时间' })
  startAt: Date;

  @Column({ type: 'timestamp', name: 'end_at', nullable: true, comment: '到期时间' })
  endAt: Date;

  @Column({ type: 'timestamp', name: 'redeemed_at', nullable: true, comment: '赎回时间' })
  redeemedAt: Date;

  // ===== 状态 =====
  /**
   * 状态：
   * 0 - 已赎回
   * 1 - 持仓中
   * 2 - 待计息（T+1生效）
   * 3 - 已到期待赎回
   */
  @Column({ type: 'smallint', default: 2, comment: '状态: 0已赎回 1持仓中 2待计息 3到期待赎回' })
  status: number;

  @Column({ type: 'smallint', name: 'auto_renew', default: 0, comment: '是否自动续期: 0否 1是' })
  autoRenew: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
