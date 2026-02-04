import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PoolHolding } from './pool-holding.entity';
import { User } from './user.entity';

@Entity('agx_pool_income')
export class PoolIncome {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, name: 'user_id' })
  @Index('idx_user_id')
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'bigint', unsigned: true, name: 'holding_id' })
  @Index('idx_holding_id')
  holdingId: number;

  @ManyToOne(() => PoolHolding)
  @JoinColumn({ name: 'holding_id' })
  holding: PoolHolding;

  @Column({ type: 'bigint', unsigned: true, name: 'product_id', comment: '产品ID' })
  productId: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, comment: '收益金额' })
  amount: string;

  @Column({ type: 'bigint', unsigned: true, name: 'coin_id', nullable: true, comment: '收益币种ID' })
  @Index('idx_coin_id')
  coinId: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, name: 'daily_rate', comment: '日收益率' })
  dailyRate: string;

  @Column({ type: 'date', name: 'income_date', comment: '收益日期' })
  @Index('idx_income_date')
  incomeDate: Date;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
