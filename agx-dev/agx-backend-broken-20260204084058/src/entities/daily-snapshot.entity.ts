import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * AGX每日持仓快照
 * 用于统计用户每日AGX最低持仓，作为持币生金计算依据
 */
@Entity('agx_daily_snapshot')
@Index('uk_snapshot_user_date', ['userId', 'snapshotDate'], { unique: true })
@Index('idx_snapshot_date', ['snapshotDate'])
@Index('idx_snapshot_qualified', ['isQualified', 'snapshotDate'])
export class DailySnapshot {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, name: 'user_id', comment: '用户ID' })
  userId: number;

  @Column({ type: 'date', name: 'snapshot_date', comment: '快照日期' })
  snapshotDate: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'min_balance', default: '0', comment: '当日AGX最低持仓' })
  minBalance: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'avg_balance', default: '0', comment: '当日AGX平均持仓' })
  avgBalance: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'start_balance', default: '0', comment: '当日起始余额' })
  startBalance: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'end_balance', default: '0', comment: '当日结束余额' })
  endBalance: string;

  @Column({ type: 'smallint', name: 'is_qualified', default: 0, comment: '是否达标: 0否 1是' })
  isQualified: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}