import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('agx_system_menu')
export class SystemMenu {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, default: 0, name: 'parent_id', comment: '父菜单ID' })
  @Index('idx_parent_id')
  parentId: number;

  @Column({ type: 'varchar', length: 50, comment: '菜单名称' })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '菜单编码' })
  code: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '菜单图标' })
  icon: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '路由地址' })
  route: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '组件路径' })
  component: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '权限标识' })
  permission: string;

  @Column({ type: 'smallint', default: 1, comment: '类型: 1-菜单, 2-按钮, 3-外链' })
  type: number;

  @Column({ type: 'smallint', default: 1, comment: '是否显示: 1-是, 0-否' })
  isShow: number;

  @Column({ type: 'smallint', default: 0, comment: '是否缓存: 1-是, 0-否' })
  isCache: number;

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
