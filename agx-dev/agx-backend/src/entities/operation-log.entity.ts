import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 操作审计日志表
 */
@Entity('agx_operation_log')
export class OperationLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, name: 'admin_id', comment: '操作管理员ID' })
  @Index('idx_admin_id')
  adminId: number;

  @Column({ type: 'varchar', length: 50, name: 'admin_username', comment: '管理员用户名' })
  adminUsername: string;

  @Column({ type: 'varchar', length: 50, comment: '操作模块' })
  @Index('idx_module')
  module: string;

  @Column({ type: 'varchar', length: 50, comment: '操作动作' })
  action: string;

  @Column({ type: 'varchar', length: 50, name: 'target_type', comment: '目标类型' })
  targetType: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true, name: 'target_id', comment: '目标ID' })
  targetId: number;

  @Column({ type: 'text', nullable: true, name: 'old_data', comment: '修改前数据(JSON)' })
  oldData: string;

  @Column({ type: 'text', nullable: true, name: 'new_data', comment: '修改后数据(JSON)' })
  newData: string;

  @Column({ type: 'text', nullable: true, comment: '变更内容(JSON)' })
  changes: string;

  @Column({ type: 'varchar', length: 50, default: '0.0.0.0', comment: 'IP地址' })
  ip: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'user_agent', comment: '浏览器信息' })
  userAgent: string;

  @Column({ type: 'varchar', length: 20, default: 'production', comment: '环境' })
  environment: string;

  @Column({ type: 'smallint', default: 1, comment: '状态: 0失败 1成功' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '错误信息' })
  error: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  @Index('idx_created_at')
  createdAt: Date;
}
