import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 举报表
 */
@Entity('agx_report')
export class Report {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, name: 'reporter_id', comment: '举报人ID' })
  @Index('idx_reporter_id')
  reporterId: number;

  @Column({ type: 'varchar', length: 20, name: 'target_type', comment: '举报对象类型: post-帖子, comment-评论, user-用户' })
  @Index('idx_target_type')
  targetType: string;

  @Column({ type: 'bigint', unsigned: true, name: 'target_id', comment: '举报对象ID' })
  @Index('idx_target_id')
  targetId: number;

  @Column({ type: 'varchar', length: 50, comment: '举报原因: spam-垃圾信息, abuse-辱骂攻击, porn-色情内容, illegal-违法违规, other-其他' })
  reason: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '举报说明' })
  description: string;

  @Column({ type: 'smallint', default: 0, comment: '处理状态: 0-待处理, 1-已处理, -1-已忽略' })
  @Index('idx_status')
  status: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true, name: 'handler_id', comment: '处理人ID' })
  handlerId: number;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '处理动作: accept-接受, ignore-忽略' })
  action: string;

  @Column({ type: 'text', nullable: true, comment: '处理措施,JSON格式存储' })
  measures: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '处理备注' })
  remark: string;

  @Column({ type: 'timestamp', nullable: true, name: 'handled_at', comment: '处理时间' })
  handledAt: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
