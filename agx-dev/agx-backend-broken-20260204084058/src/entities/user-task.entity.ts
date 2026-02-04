import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

/**
 * 用户任务完成记录表
 */
@Entity('agx_user_task')
@Index('idx_user_task_user_id', ['userId'])
@Index('idx_user_task_status', ['status'])
export class UserTask {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'user_id', comment: '用户ID' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 32, name: 'task_key', comment: '任务标识' })
  taskKey: string;

  @Column({ type: 'smallint', default: 0, comment: '状态: 0待完成 1已完成待领取 2已领取' })
  status: number;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at', comment: '完成时间' })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'claimed_at', comment: '领取时间' })
  claimedAt: Date;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'agx_reward', default: '0', comment: 'AGX奖励金额' })
  agxReward: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'usdt_reward', default: '0', comment: 'USDT奖励金额' })
  usdtReward: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
