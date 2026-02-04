import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 持币生金配置
 * 定义不同持仓等级的黄金生成率
 */
@Entity('agx_holding_config')
export class HoldingConfig {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, name: 'level_name', comment: '等级名称' })
  levelName: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'min_agx', comment: '最低AGX持仓' })
  minAgx: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'max_agx', nullable: true, comment: '最高AGX持仓(NULL=无上限)' })
  maxAgx: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, name: 'daily_oz_rate', comment: '每日oz生成率(每AGX)' })
  dailyOzRate: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '等级说明' })
  description: string;

  @Column({ type: 'smallint', default: 1, comment: '状态: 0禁用 1启用' })
  status: number;

  @Column({ type: 'int', name: 'sort_order', default: 0, comment: '排序' })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}