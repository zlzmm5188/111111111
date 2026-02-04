import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 返佣阶梯配置表
 * 9档位，按产品独立计算建仓人数
 */
@Entity('agx_commission_tier')
export class CommissionTier {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'int', unique: true, name: 'tier_level', comment: '档位等级 1-9' })
  tierLevel: number;

  @Column({ type: 'int', name: 'min_invites', comment: '最低建仓人数' })
  minInvites: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, name: 'commission_rate', comment: '返佣比例' })
  commissionRate: string;

  @Column({ type: 'smallint', name: 'is_enabled', default: 1, comment: '是否开放 1开放 0关闭' })
  isEnabled: number;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '档位说明' })
  description: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
