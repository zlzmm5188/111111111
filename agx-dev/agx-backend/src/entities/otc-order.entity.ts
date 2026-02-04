import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * OTC订单表
 */
@Entity('agx_otc_order')
export class OtcOrder {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 32, unique: true, name: 'order_no', comment: '订单号' })
  @Index('idx_order_no', { unique: true })
  orderNo: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '订单类型: buy/sell' })
  type: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true, name: 'ad_id', comment: '广告ID' })
  adId: number;

  @Column({ type: 'bigint', unsigned: true, name: 'buyer_id', comment: '买方用户ID' })
  @Index('idx_buyer_id')
  buyerId: number;

  @Column({ type: 'bigint', unsigned: true, name: 'seller_id', comment: '卖方用户ID' })
  @Index('idx_seller_id')
  sellerId: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true, name: 'coin_id', comment: '币种ID' })
  coinId: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, comment: '单价' })
  price: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, comment: '交易数量' })
  amount: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'total_price', nullable: true, comment: '总价' })
  totalPrice: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'total_amount', nullable: true, comment: '总金额' })
  totalAmount: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'payment_method', comment: '支付方式' })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 20, default: 'pending', comment: '订单状态' })
  @Index('idx_status')
  status: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'appeal_result', comment: '申诉结果' })
  appealResult: string;

  @Column({ type: 'text', nullable: true, name: 'appeal_remark', comment: '申诉备注' })
  appealRemark: string;

  @Column({ type: 'timestamp', nullable: true, name: 'pay_at', comment: '付款时间' })
  payAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'paid_at', comment: '已付款时间' })
  paidAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'release_at', comment: '放币时间' })
  releaseAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'released_at', comment: '已放币时间' })
  releasedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at', comment: '完成时间' })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'cancel_at', comment: '取消时间' })
  cancelAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'cancelled_at', comment: '已取消时间' })
  cancelledAt: Date;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'cancel_reason', comment: '取消原因' })
  cancelReason: string;

  @Column({ type: 'timestamp', nullable: true, name: 'expire_at', comment: '过期时间' })
  expireAt: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
