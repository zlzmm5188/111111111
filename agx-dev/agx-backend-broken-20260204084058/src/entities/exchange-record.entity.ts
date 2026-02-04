import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * 用户兑换记录
 * 记录所有兑换操作，确保资金流向清晰可追溯
 */
@Entity('agx_exchange_record')
export class ExchangeRecord {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, name: 'user_id', comment: '用户ID' })
  @Index('idx_user_id')
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // ===== 兑换类型 =====
  @Column({ type: 'varchar', length: 20, name: 'exchange_type', comment: '兑换类型' })
  @Index('idx_exchange_type')
  exchangeType: string; // 'agx_to_gold' | 'usdt_to_agx' | 'gold_to_usdt' 等

  // ===== 兑换前 =====
  @Column({ type: 'bigint', unsigned: true, name: 'from_coin_id', comment: '来源币种ID' })
  fromCoinId: number;

  @Column({ type: 'varchar', length: 20, name: 'from_symbol', comment: '来源币种符号' })
  fromSymbol: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'from_amount', comment: '兑换数量' })
  fromAmount: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'from_balance_before', comment: '兑换前余额' })
  fromBalanceBefore: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'from_balance_after', comment: '兑换后余额' })
  fromBalanceAfter: string;

  // ===== 兑换后 =====
  @Column({ type: 'bigint', unsigned: true, name: 'to_coin_id', comment: '目标币种ID' })
  toCoinId: number;

  @Column({ type: 'varchar', length: 20, name: 'to_symbol', comment: '目标币种符号' })
  toSymbol: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'to_amount', comment: '获得数量' })
  toAmount: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'to_balance_before', comment: '接收前余额' })
  toBalanceBefore: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'to_balance_after', comment: '接收后余额' })
  toBalanceAfter: string;

  // ===== 汇率信息 =====
  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'exchange_rate', comment: '兑换汇率' })
  exchangeRate: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'fee_rate', comment: '手续费率' })
  feeRate: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'fee_amount', comment: '手续费数量' })
  feeAmount: string;

  // ===== 估值信息 =====
  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'usd_value', comment: 'USD估值(可选)' })
  usdValue: string;

  // ===== 快照 =====
  @Column({ type: 'json', nullable: true, comment: '数据快照(JSON)' })
  snapshot: any;

  // ===== 状态信息 =====
  @Column({ type: 'smallint', default: 0, comment: '状态: 0-处理中, 1-成功, 2-失败' })
  @Index('idx_status')
  status: number;

  @Column({ type: 'text', nullable: true, comment: '失败原因' })
  failReason: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '交易哈希' })
  txHash: string;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at', comment: '完成时间' })
  completedAt: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', comment: '创建时间' })
  @Index('idx_created_at')
  createdAt: Date;
}
