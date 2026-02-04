import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 全局配置表（双倍经验开关等）
 */
@Entity('pool_global_config')
export class PoolGlobalConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'smallint', default: 0, comment: '全局双倍经验开关: 0关闭 1开启' })
  doubleExpEnabled: number;

  @Column({ type: 'timestamp', nullable: true, comment: '双倍经验开始时间' })
  doubleExpStartTime: Date;

  @Column({ type: 'timestamp', nullable: true, comment: '双倍经验结束时间' })
  doubleExpEndTime: Date;

  @Column({ type: 'smallint', default: 1, comment: '智能增益开关: 0关闭 1开启' })
  smartBoostEnabled: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
