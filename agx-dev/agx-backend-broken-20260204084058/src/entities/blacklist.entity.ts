import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 用户黑名单表
 */
@Entity('agx_blacklist')
export class Blacklist {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 20, comment: '拉黑类型: login=禁止登录, trade=禁止交易, withdraw=禁止提币, all=全部禁止' })
  type: string;

  @Column({ type: 'varchar', length: 200, comment: '拉黑值（IP地址或用户名等）' })
  value: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '拉黑原因' })
  reason: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true, name: 'operator_id', comment: '操作人ID' })
  operatorId: number;

  @Column({ type: 'timestamp', nullable: true, name: 'expire_at', comment: '过期时间，null表示永久' })
  expireAt: Date;

  @Column({ type: 'smallint', default: 1, comment: '状态: 0禁用 1启用' })
  status: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}

/**
 * 风控预警表
 */
@Entity('agx_risk_alert')
export class RiskAlert {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, name: 'user_id', comment: '用户ID' })
  @Index('idx_user_id')
  userId: number;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', length: 50, name: 'risk_type', comment: '风险类型' })
  riskType: string;

  @Column({ type: 'varchar', length: 10, default: '中', comment: '风险等级: 高/中/低' })
  level: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '风险描述' })
  description: string;

  @Column({ type: 'varchar', length: 20, default: 'pending', comment: '处理状态: pending=待处理, processed=已处理, ignored=已忽略' })
  status: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'process_note', comment: '处理备注' })
  processNote: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
