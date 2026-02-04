import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 新手任务配置表
 */
@Entity('agx_newcomer_task')
export class NewcomerTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 32, unique: true, name: 'task_key', comment: '任务标识' })
  taskKey: string;

  @Column({ type: 'int', comment: '步骤序号' })
  step: number;

  @Column({ type: 'varchar', length: 50, comment: '任务名称' })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'name_en', comment: '英文名称' })
  nameEn: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '任务描述' })
  description: string;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'description_en', comment: '英文描述' })
  descriptionEn: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'agx_reward', default: '0', comment: 'AGX奖励' })
  agxReward: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'usdt_reward', default: '0', comment: 'USDT奖励' })
  usdtReward: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '图标' })
  icon: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'jump_url', comment: '跳转链接' })
  jumpUrl: string;

  @Column({ type: 'smallint', name: 'is_enabled', default: 1, comment: '是否启用' })
  isEnabled: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
