import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 前端菜单配置表
 * 存储H5/App端的菜单配置
 */
@Entity('agx_app_menu')
export class AppMenu {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '菜单名称' })
  title: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '图标(emoji或图标名)' })
  icon: string;

  @Column({ type: 'varchar', length: 200, comment: '跳转路径' })
  path: string;

  @Column({ type: 'varchar', length: 20, comment: '菜单位置: bottom/grid/sidebar/quick' })
  @Index('idx_position')
  position: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '分组名称(侧边栏用)' })
  groupName: string;

  @Column({ type: 'int', name: 'sort_order', default: 0, comment: '排序权重(越大越靠前)' })
  sortOrder: number;

  @Column({ type: 'smallint', default: 1, comment: '状态: 1=显示 0=隐藏' })
  status: number;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '权限要求JSON: ["login","kyc","vip"]' })
  permissions: string;

  @Column({ type: 'text', nullable: true, comment: '扩展配置JSON' })
  extra: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
