import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * 双向奖励发放记录表
 */
@Entity('agx_invite_bonus_record')
export class InviteBonusRecord {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, name: 'inviter_id', comment: '邀请人ID' })
  inviterId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'inviter_id' })
  inviter: User;

  @Column({ type: 'bigint', unsigned: true, name: 'invitee_id', comment: '被邀请人ID' })
  inviteeId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'invitee_id' })
  invitee: User;

  @Column({ type: 'int', name: 'invite_order', comment: '第几个邀请' })
  inviteOrder: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'inviter_bonus', comment: '邀请人获得' })
  inviterBonus: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'invitee_bonus', comment: '被邀请人获得' })
  inviteeBonus: string;

  @Column({ type: 'smallint', default: 1, comment: '状态 1已发放 0待发放' })
  status: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
