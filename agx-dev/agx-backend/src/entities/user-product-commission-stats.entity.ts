import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 用户产品推广统计表
 * 按产品维度统计有效建仓人数和返佣
 */
@Entity('agx_user_product_commission_stats')
export class UserProductCommissionStats {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, name: 'user_id', comment: '推广人ID' })
  userId: number;

  @Column({ type: 'bigint', unsigned: true, name: 'product_id', comment: '产品ID' })
  productId: number;

  @Column({ type: 'int', name: 'valid_invites', default: 0, comment: '该产品有效建仓好友数' })
  validInvites: number;

  @Column({ type: 'int', name: 'current_tier', default: 1, comment: '当前档位' })
  currentTier: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, name: 'current_rate', default: '0.005', comment: '当前返佣比例' })
  currentRate: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'total_commission', default: '0', comment: '该产品累计返佣' })
  totalCommission: string;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
