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
import { User } from './user.entity';
import { Coin } from './coin.entity';

/**
 * OTC广告/挂单表
 */
@Entity('agx_otc_advertisement')
export class OtcAdvertisement {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, name: 'user_id', comment: '发布用户ID' })
  @Index('idx_user_id')
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 10, comment: '类型: buy-买入/sell-卖出' })
  @Index('idx_type')
  type: string;

  @Column({ type: 'bigint', unsigned: true, name: 'coin_id', comment: '交易币种ID' })
  coinId: number;

  @ManyToOne(() => Coin)
  @JoinColumn({ name: 'coin_id' })
  coin: Coin;

  @Column({ type: 'decimal', precision: 20, scale: 4, comment: '单价(CNY)' })
  price: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'total_amount', comment: '挂单总量' })
  totalAmount: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'available_amount', comment: '可用数量' })
  availableAmount: string;

  @Column({ type: 'decimal', precision: 20, scale: 2, name: 'min_limit', default: 100, comment: '最低交易金额(CNY)' })
  minLimit: string;

  @Column({ type: 'decimal', precision: 20, scale: 2, name: 'max_limit', default: 50000, comment: '最高交易金额(CNY)' })
  maxLimit: string;

  @Column({ type: 'varchar', length: 200, name: 'payment_methods', comment: '支持的支付方式，JSON数组' })
  paymentMethods: string;

  @Column({ type: 'text', nullable: true, comment: '交易备注/条款' })
  remark: string;

  @Column({ type: 'int', name: 'pay_time_limit', default: 15, comment: '付款时限(分钟)' })
  payTimeLimit: number;

  @Column({ type: 'smallint', default: 1, comment: '状态: 0-下架/1-上架/2-已完成' })
  @Index('idx_status')
  status: number;

  @Column({ type: 'int', name: 'completed_count', default: 0, comment: '成交笔数' })
  completedCount: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'completed_amount', default: 0, comment: '累计成交量' })
  completedAmount: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
