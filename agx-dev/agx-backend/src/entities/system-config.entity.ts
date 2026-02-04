import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

// 配置组
@Entity('agx_system_config_group')
export class SystemConfigGroup {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '分组名称' })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '分组编码' })
  @Index('idx_code', { unique: true })
  code: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}

// 配置项
@Entity('agx_system_config')
export class SystemConfig {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, name: 'group_code', comment: '分组编码' })
  @Index('idx_group_code')
  groupCode: string;

  @Column({ type: 'varchar', length: 100, comment: '配置名称' })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true, comment: '配置键' })
  @Index('idx_key', { unique: true })
  key: string;

  @Column({ type: 'text', nullable: true, comment: '配置值' })
  value: string;

  @Column({ type: 'varchar', length: 50, default: 'input', comment: '输入组件类型' })
  inputType: string;

  @Column({ type: 'text', nullable: true, comment: '配置选项，JSON格式' })
  options: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
