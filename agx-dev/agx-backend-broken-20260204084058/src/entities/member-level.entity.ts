import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 会员等级配置表
 * 等级由累计充值金额决定
 */
@Entity('agx_member_level')
export class MemberLevel {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'int', unique: true, comment: '等级序号: 1-5' })
  @Index('idx_level', { unique: true })
  level: number;

  // ===== 基本信息 =====

  @Column({ type: 'varchar', length: 50, comment: '等级中文名' })
  name: string;

  @Column({ type: 'varchar', length: 50, name: 'name_en', comment: '等级英文名' })
  nameEn: string;

  @Column({ type: 'varchar', length: 50, comment: '等级图标/emoji' })
  icon: string;

  @Column({ type: 'varchar', length: 20, comment: '等级颜色(HEX)' })
  color: string;

  // ===== 充值要求 =====

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'min_recharge', default: '0', comment: '最低充值金额要求' })
  minRecharge: string;

  // ===== 等级权益 =====

  @Column({ type: 'decimal', precision: 5, scale: 4, name: 'fee_discount', default: '1', comment: '手续费折扣(1=无折扣, 0.9=9折)' })
  feeDiscount: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, name: 'income_bonus', default: '0', comment: '收益加成比例' })
  incomeBonus: string;

  @Column({ type: 'bigint', name: 'withdraw_limit', nullable: true, comment: '提现限额' })
  withdrawLimit: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, name: 'rebate_rate', default: '0', comment: '返佣比例' })
  rebateRate: string;

  @Column({ type: 'decimal', precision: 20, scale: 2, name: 'upgrade_bonus', default: '0', comment: '进阶奖励金(USDT)' })
  upgradeBonus: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, name: 'pool_rate_bonus', default: '0', comment: '矿机利率加成' })
  poolRateBonus: string;

  @Column({ type: 'int', name: 'free_withdraw_days', default: 0, comment: '免费提现周期(天)' })
  freeWithdrawDays: number;

  @Column({ type: 'smallint', name: 'withdraw_priority', default: 0, comment: '提现优先处理(1=优先)' })
  withdrawPriority: number;

  @Column({ type: 'smallint', name: 'contract_enabled', default: 0, comment: '合约交易权限(1=开启)' })
  contractEnabled: number;

  @Column({ type: 'smallint', name: 'new_coin_priority', default: 0, comment: '新币抢先交易权(1=开启)' })
  newCoinPriority: number;

  @Column({ type: 'smallint', name: 'vip_support', default: 0, comment: 'VIP专属客服(1=享有)' })
  vipSupport: number;

  @Column({ type: 'smallint', name: 'ticket_priority', default: 0, comment: '工单优先级(1=优先)' })
  ticketPriority: number;

  @Column({ type: 'smallint', name: 'withdraw_fee_free', default: 0, comment: '提现免手续费(1=免费)' })
  withdrawFeeFree: number;

  // ===== 其他字段 =====

  @Column({ type: 'text', nullable: true, comment: '等级权益描述（JSON格式）' })
  benefits: string;

  @Column({ type: 'smallint', name: 'is_enabled', default: 1, comment: '是否启用: 0否 1是' })
  isEnabled: number;

  @Column({ type: 'int', name: 'sort_order', default: 0, comment: '排序' })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
