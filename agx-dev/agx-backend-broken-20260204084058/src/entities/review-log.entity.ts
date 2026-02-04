import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 审核日志表
 */
@Entity('agx_review_log')
export class ReviewLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 20, name: 'review_type', comment: '审核类型: post-帖子审核, comment-评论审核, report-举报处理' })
  @Index('idx_review_type')
  reviewType: string;

  @Column({ type: 'bigint', unsigned: true, name: 'reviewer_id', comment: '审核人ID' })
  @Index('idx_reviewer_id')
  reviewerId: number;

  @Column({ type: 'varchar', length: 20, name: 'target_type', comment: '审核对象类型: post, comment, user' })
  targetType: string;

  @Column({ type: 'bigint', unsigned: true, name: 'target_id', comment: '审核对象ID' })
  @Index('idx_target_id')
  targetId: number;

  @Column({ type: 'varchar', length: 20, comment: '审核动作: approve-通过, reject-拒绝, delete-删除, modify-修改, ignore-忽略' })
  @Index('idx_action')
  action: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '审核说明/原因' })
  reason: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '备注信息' })
  remark: string;

  @Column({ type: 'text', nullable: true, name: 'extra_data', comment: '额外数据,JSON格式' })
  extraData: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  @Index('idx_created_at')
  createdAt: Date;
}
