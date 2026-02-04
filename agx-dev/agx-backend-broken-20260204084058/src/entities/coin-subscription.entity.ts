import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CoinIssue } from './coin-issue.entity';

/**
 * 新币申购记录表
 */
@Entity('agx_coin_subscription')
export class CoinSubscription {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', comment: '用户ID' })
  userId: number;

  @Column({ name: 'issue_id', type: 'bigint', comment: '发行ID' })
  issueId: number;

  @ManyToOne(() => CoinIssue)
  @JoinColumn({ name: 'issue_id' })
  issue: CoinIssue;

  @Column({ name: 'buy_amount', type: 'decimal', precision: 20, scale: 8, comment: '申购数量' })
  buyAmount: number;

  @Column({ name: 'pay_amount', type: 'decimal', precision: 20, scale: 8, comment: '支付金额' })
  payAmount: number;

  @Column({ name: 'win_amount', type: 'decimal', precision: 20, scale: 8, default: 0, comment: '中签数量' })
  winAmount: number;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 20, scale: 8, default: 0, comment: '退款金额' })
  refundAmount: number;

  /**
   * 状态定义:
   * 0 - 待支付 (PENDING)
   * 1 - 已冻结/待开奖 (FROZEN)
   * 2 - 已中签待发币 (WON)
   * 3 - 未中签待退款 (LOST)
   * 4 - 已发币完成 (DISTRIBUTED)
   * 5 - 已退款完成 (REFUNDED)
   * 6 - 已取消 (CANCELLED)
   */
  @Column({ type: 'smallint', default: 1, comment: '状态: 0-待支付, 1-待开奖, 2-已中签, 3-未中签, 4-已发币, 5-已退款, 6-已取消' })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
