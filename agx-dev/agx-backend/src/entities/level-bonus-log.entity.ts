import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 会员升级奖励发放记录表
 * 记录每次等级提升时发放的进阶奖励金
 */
@Entity('agx_level_bonus_log')
export class LevelBonusLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', name: 'user_id', comment: '用户ID' })
  @Index('idx_level_bonus_log_user')
  userId: number;

  @Column({ type: 'int', name: 'from_level', default: 0, comment: '原等级' })
  fromLevel: number;

  @Column({ type: 'int', name: 'to_level', comment: '新等级' })
  toLevel: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, name: 'bonus_amount', comment: '奖励金额(USDT)' })
  bonusAmount: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  @Index('idx_level_bonus_log_created')
  createdAt: Date;
}
