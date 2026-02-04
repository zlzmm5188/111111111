import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Admin } from './admin.entity';

@Entity('agx_admin_log')
export class AdminLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, name: 'admin_id' })
  adminId: number;

  @ManyToOne(() => Admin)
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;

  @Column({ type: 'varchar', length: 100, comment: '操作动作' })
  action: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'target_type', comment: '目标类型' })
  targetType: string;

  @Column({ type: 'bigint', nullable: true, name: 'target_id', comment: '目标ID' })
  targetId: number;

  @Column({ type: 'text', nullable: true, comment: '操作内容' })
  content: string;

  @Column({ type: 'varchar', length: 45, nullable: true, comment: 'IP地址' })
  ip: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'user_agent', comment: '用户代理' })
  userAgent: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
