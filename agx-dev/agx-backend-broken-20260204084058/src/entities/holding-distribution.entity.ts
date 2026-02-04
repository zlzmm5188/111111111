import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * 持币生金自动发放记录
 * 记录每次自动发放的详细信息，确保数据严谨可追溯
 */
@Entity('agx_holding_distribution')
export class HoldingDistribution {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, name: 'user_id', comment: '用户ID' })
  @Index('idx_user_id')
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date', name: 'distribution_date', comment: '发放日期' })
  @Index('idx_distribution_date')
  distributionDate: Date;

  // ===== 持仓信息快照 =====
  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'holding_agx', comment: '持仓AGX数量' })
  holdingAgx: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, name: 'holding_oz', comment: '持仓黄金(oz)' })
  holdingOz: string;

  @Column({ type: 'varchar', length: 50, name: 'holding_level', comment: '持仓等级' })
  holdingLevel: string;

  // ===== 发放的黄金 =====
  @Column({ type: 'decimal', precision: 20, scale: 6, name: 'distributed_oz', comment: '发放黄金(oz)' })
  distributedOz: string;

  @Column({ type: 'decimal', precision: 20, scale: 6, name: 'distributed_gram', comment: '发放黄金(克)' })
  distributedGram: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, name: 'distribution_rate', comment: '发放费率' })
  distributionRate: string;

  // ===== 估值信息 =====
  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'agx_price', comment: 'AGX价格(USDT)' })
  agxPrice: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'gold_price_oz', comment: '黄金价格(USDT/oz)' })
  goldPriceOz: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'estimated_value', comment: '发放价值(USDT)' })
  estimatedValue: string;

  // ===== 计算信息 =====
  @Column({ type: 'text', nullable: true, comment: '计算公式(JSON)' })
  calculationFormula: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '批次号' })
  batchNo: string;

  // ===== 状态信息 =====
  @Column({ type: 'smallint', default: 0, comment: '状态: 0-待发放, 1-已发放, 2-发放失败' })
  @Index('idx_status')
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', comment: '记录创建时间' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'issued_at', comment: '实际发放时间' })
  issuedAt: Date;
}
