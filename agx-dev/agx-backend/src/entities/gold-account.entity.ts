import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 黄金账户
 * 用户存入币种进行"持币生金"，获取黄金收益
 */
@Entity('agx_gold_account')
@Index('idx_gold_account_user', ['userId'], { unique: true })
export class GoldAccount {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, name: 'user_id', comment: '用户ID' })
  userId: number;

  // ===== 账户余额（克） =====
  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'gold_balance', default: '0', comment: '黄金余额（克）' })
  goldBalance: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'gold_frozen', default: '0', comment: '冻结黄金（克）' })
  goldFrozen: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'usdt_balance', default: '0', comment: 'USDT余额' })
  usdtBalance: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'usdt_frozen', default: '0', comment: '冻结USDT' })
  usdtFrozen: string;

  // ===== 黄金账户（盎司oz） - 核心字段 =====
  @Column({ type: 'decimal', precision: 20, scale: 6, name: 'oz_balance', default: '0', comment: '黄金账户余额(oz)' })
  ozBalance: string;

  @Column({ type: 'decimal', precision: 20, scale: 6, name: 'oz_frozen', default: '0', comment: '冻结黄金(oz)' })
  ozFrozen: string;

  @Column({ type: 'decimal', precision: 20, scale: 6, name: 'oz_total_earned', default: '0', comment: '累计获得黄金(oz)' })
  ozTotalEarned: string;

  @Column({ type: 'decimal', precision: 20, scale: 6, name: 'oz_from_holding', default: '0', comment: '持币生金获得(oz)' })
  ozFromHolding: string;

  @Column({ type: 'decimal', precision: 20, scale: 6, name: 'oz_from_contract', default: '0', comment: '秒合约获得(oz)' })
  ozFromContract: string;

  @Column({ type: 'date', name: 'last_settlement_date', nullable: true, comment: '最后结算日期' })
  lastSettlementDate: string;

  // ===== 累计数据 =====
  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'total_deposit', default: '0', comment: '累计存入(USDT)' })
  totalDeposit: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'total_withdraw', default: '0', comment: '累计取出(USDT)' })
  totalWithdraw: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'total_income', default: '0', comment: '累计收益(USDT)' })
  totalIncome: string;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'yesterday_income', default: '0', comment: '昨日收益(USDT)' })
  yesterdayIncome: string;

  // ===== 当前持仓 =====
  @Column({ type: 'int', name: 'holding_count', default: 0, comment: '当前持仓产品数' })
  holdingCount: number;

  @Column({ type: 'decimal', precision: 30, scale: 8, name: 'holding_amount', default: '0', comment: '当前持仓金额(USDT)' })
  holdingAmount: string;

  @Column({ type: 'smallint', default: 1, comment: '账户状态: 0冻结 1正常' })
  status: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
