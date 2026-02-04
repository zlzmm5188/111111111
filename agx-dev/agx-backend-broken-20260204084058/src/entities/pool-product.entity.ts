import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Coin } from './coin.entity';

@Entity('agx_pool_product')
export class PoolProduct {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '产品名称' })
  name: string;

  @Column({ type: 'bigint', unsigned: true, name: 'coin_id', comment: '投入币种' })
  coinId: number;

  @ManyToOne(() => Coin)
  @JoinColumn({ name: 'coin_id' })
  coin: Coin;

  @Column({ type: 'varchar', length: 20, comment: '类型：flexible(活期) / fixed(定期)' })
  @Index('idx_type')
  type: string;

  @Column({ type: 'int', name: 'lock_days', default: 0, comment: '锁定天数，0为活期' })
  lockDays: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, name: 'daily_rate', comment: '日收益率' })
  dailyRate: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'min_amount', comment: '最低申购' })
  minAmount: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'max_amount', nullable: true, comment: '最高申购' })
  maxAmount: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'total_quota', nullable: true, comment: '总额度' })
  totalQuota: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'sold_amount', default: 0, comment: '已售额度' })
  soldAmount: string;

  @Column({ type: 'smallint', name: 'is_hot', default: 0, comment: '是否热门' })
  isHot: number;

  @Column({ type: 'int', name: 'sort_order', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ type: 'bigint', unsigned: true, name: 'income_coin_id', nullable: true, comment: '收益币种ID' })
  incomeCoinId: number;

  @ManyToOne(() => Coin)
  @JoinColumn({ name: 'income_coin_id' })
  incomeCoin: Coin;

  @Column({ type: 'varchar', length: 50, name: 'pay_currencies', default: 'USDT', comment: '支付币种: USDT,CNY' })
  payCurrencies: string;

  @Column({ type: 'smallint', default: 1, comment: '状态：0下架 1上架' })
  @Index('idx_status')
  status: number;

  // 新增字段
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '项目图片' })
  image: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '区域' })
  region: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'robot_rent', default: 0, comment: '机器人租金' })
  robotRent: string;

  @Column({ type: 'int', name: 'robot_days', default: 7, comment: '机器人有效期(天)' })
  robotDays: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, name: 'min_rate', default: 0, comment: '最小收益比(%)' })
  minRate: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, name: 'max_rate', default: 0, comment: '最大收益比(%)' })
  maxRate: string;

  @Column({ type: 'int', name: 'max_invest_count', default: 0, comment: '最大投资次数，0为不限' })
  maxInvestCount: number;

  @Column({ type: 'varchar', length: 100, name: 'vip_levels', nullable: true, comment: 'VIP等级限制，逗号分隔' })
  vipLevels: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0, comment: '份数' })
  shares: string;

  @Column({ type: 'int', name: 'invest_days', default: 0, comment: '投资周期(天)' })
  investDays: number;

  @Column({ type: 'timestamp', name: 'start_time', nullable: true, comment: '开始时间' })
  startTime: Date;

  @Column({ type: 'timestamp', name: 'end_time', nullable: true, comment: '结束时间' })
  endTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0, comment: '进度百分比' })
  progress: string;

  @Column({ type: 'smallint', name: 'enable_redpacket', default: 0, comment: '开启红包' })
  enableRedpacket: number;

  @Column({ type: 'varchar', length: 20, name: 'redpacket_type', default: 'percent', comment: '红包类型: percent百分比 / fixed固定金额' })
  redpacketType: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, name: 'redpacket_percent', default: 0, comment: '红包百分比' })
  redpacketPercent: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'redpacket_amount', default: 0, comment: '红包固定金额' })
  redpacketAmount: string;

  @Column({ type: 'smallint', name: 'enable_dividend', default: 0, comment: '开启分红' })
  enableDividend: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, name: 'dividend_percent', default: 0, comment: '分红百分比' })
  dividendPercent: string;

  @Column({ type: 'smallint', name: 'enable_double_exp', default: 0, comment: '开启倍数经验' })
  enableDoubleExp: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'double_exp_multiplier', default: 2, comment: '经验倍数(如2=双倍)' })
  doubleExpMultiplier: string;

  @Column({ type: 'smallint', name: 'enable_level_commission', default: 0, comment: '开启层级返利' })
  enableLevelCommission: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, name: 'level_commission_rate', default: 0, comment: '层级返利比例(上级获得下级收益的百分比)' })
  levelCommissionRate: string;

  @Column({ type: 'smallint', name: 'enable_repurchase', default: 0, comment: '开启复购补贴' })
  enableRepurchase: number;

  @Column({ type: 'varchar', length: 20, name: 'repurchase_type', default: 'percent', comment: '复购补贴类型: percent百分比 / fixed固定金额' })
  repurchaseType: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, name: 'repurchase_percent', default: 0, comment: '复购补贴百分比' })
  repurchasePercent: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'repurchase_amount', default: 0, comment: '复购补贴固定金额' })
  repurchaseAmount: string;

  @Column({ type: 'smallint', name: 'enable_vip_bonus', default: 0, comment: '开启VIP加成' })
  enableVipBonus: number;

  @Column({ type: 'jsonb', name: 'vip_bonus_rates', nullable: true, comment: 'VIP加成比例' })
  vipBonusRates: object;

  @Column({ type: 'varchar', length: 10, name: 'cycle_unit', default: 'day', comment: '周期单位: day天 / hour小时' })
  cycleUnit: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
