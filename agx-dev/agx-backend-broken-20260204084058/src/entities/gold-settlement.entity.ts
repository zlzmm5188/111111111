import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 黄金结算记录
 * 记录所有黄金进出账（oz为单位）
 */
@Entity('agx_gold_settlement')
@Index('idx_gold_settlement_user', ['userId'])
@Index('idx_gold_settlement_source', ['sourceType', 'sourceId'])
@Index('idx_gold_settlement_date', ['settlementDate'])
export class GoldSettlement {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, name: 'user_id', comment: '用户ID' })
  userId: number;

  @Column({ type: 'varchar', length: 32, unique: true, name: 'settlement_no', comment: '结算单号' })
  settlementNo: string;

  @Column({ type: 'varchar', length: 20, name: 'source_type', comment: '来源类型: holding=持币生金, contract=秒合约, trade=交易' })
  sourceType: string;

  @Column({ type: 'bigint', unsigned: true, name: 'source_id', nullable: true, comment: '来源订单ID' })
  sourceId: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, name: 'oz_amount', comment: '结算黄金数量(oz)' })
  ozAmount: string;

  @Column({ type: 'decimal', precision: 20, scale: 6, name: 'oz_before', comment: '结算前余额(oz)' })
  ozBefore: string;

  @Column({ type: 'decimal', precision: 20, scale: 6, name: 'oz_after', comment: '结算后余额(oz)' })
  ozAfter: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'agx_amount', nullable: true, comment: '关联AGX数量' })
  agxAmount: string;

  @Column({ type: 'decimal', precision: 20, scale: 2, name: 'gold_price', nullable: true, comment: '当时金价(USD/oz)' })
  goldPrice: string;

  @Column({ type: 'decimal', precision: 20, scale: 2, name: 'usd_value', nullable: true, comment: 'USD价值' })
  usdValue: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '备注' })
  remark: string;

  @Column({ type: 'date', name: 'settlement_date', comment: '结算日期' })
  settlementDate: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
