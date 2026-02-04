import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 双向奖励配置表
 * 邀请好友注册双方都获得奖励
 */
@Entity('agx_invite_bonus_tier')
export class InviteBonusTier {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'int', unique: true, name: 'invite_order', comment: '第几个邀请 1-10' })
  inviteOrder: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'invitee_bonus', comment: '被邀请人获得（AGX币）' })
  inviteeBonus: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'inviter_bonus', comment: '邀请人获得（AGX币）' })
  inviterBonus: string;

  @Column({ type: 'smallint', name: 'is_enabled', default: 1, comment: '是否开放' })
  isEnabled: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
