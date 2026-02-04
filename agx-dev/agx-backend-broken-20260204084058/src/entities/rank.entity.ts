import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 排行榜缓存表
 * 缓存各类排行榜数据，定时更新
 */
@Entity('agx_rank')
export class Rank {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, name: 'type', comment: '排行榜类型: profit=收益榜, volume=交易量榜, invite=邀请榜' })
  @Index('idx_type')
  rankType: string;

  @Column({ type: 'varchar', length: 20, name: 'period', comment: '时间范围: day=日榜, week=周榜, month=月榜, all=总榜' })
  @Index('idx_period')
  timeRange: string;

  @Column({ type: 'bigint', unsigned: true, name: 'user_id', comment: '用户ID' })
  @Index('idx_user_id')
  userId: number;

  @Column({ type: 'int', name: 'rank_num', comment: '排名' })
  @Index('idx_rank_num')
  position: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'amount', comment: '数值（收益/交易量/邀请数）' })
  value: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
