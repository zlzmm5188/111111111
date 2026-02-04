import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('agx_admin_role')
export class AdminRole {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '角色名称' })
  @Index('idx_role_name', { unique: true })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '角色编码' })
  code: string;

  @Column({ type: 'text', nullable: true, comment: '菜单权限ID列表，JSON' })
  menuIds: string;

  @Column({ type: 'text', nullable: true, comment: '数据权限，JSON' })
  dataScope: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ type: 'smallint', default: 1, comment: '状态: 1-正常, 0-禁用' })
  status: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
