import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Banner广告表
 */
@Entity('agx_banner')
export class Banner {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Banner标题' })
  title: string;

  @Column({ type: 'varchar', length: 500, name: 'image_url', comment: '图片URL' })
  imageUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'link_url', comment: '跳转链接' })
  linkUrl: string;

  @Column({ type: 'varchar', length: 20, default: 'home', comment: '位置: home=首页, activity=活动, popup=弹窗' })
  position: string;

  @Column({ type: 'int', name: 'sort_order', default: 0, comment: '排序值，越大越靠前' })
  sortOrder: number;

  @Column({ type: 'timestamp', nullable: true, name: 'start_time', comment: '开始展示时间' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'end_time', comment: '结束展示时间' })
  endTime: Date;

  @Column({ type: 'smallint', default: 1, comment: '状态: 0禁用 1启用' })
  status: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
