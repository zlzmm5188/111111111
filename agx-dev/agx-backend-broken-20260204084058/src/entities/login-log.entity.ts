import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 用户登录日志表
 */
@Entity('agx_login_log')
export class LoginLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, name: 'user_id', comment: '用户ID' })
  @Index('idx_user_id')
  userId: number;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', length: 45, name: 'login_ip', comment: 'IP地址' })
  loginIp: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'IP归属地' })
  location: string;

  @Column({ type: 'varchar', length: 20, name: 'device_type', default: 'unknown', comment: '设备类型: mobile/desktop/tablet' })
  deviceType: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'device_info', comment: '设备信息' })
  deviceInfo: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'login_type', comment: '登录类型' })
  loginType: string;

  @Column({ type: 'smallint', default: 1, comment: '登录状态: 1成功 0失败' })
  status: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
