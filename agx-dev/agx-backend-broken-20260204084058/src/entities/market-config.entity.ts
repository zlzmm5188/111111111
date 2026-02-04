import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 行情配置表
 * 存储各类资产行情的管理配置
 */
@Entity('agx_market_config')
export class MarketConfig {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 32, unique: true, comment: '资产代码' })
  @Index('idx_symbol')
  symbol: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '资产名称' })
  name: string;

  @Column({ type: 'varchar', length: 20, name: 'asset_type', comment: '资产类型: crypto/forex/stock/metal/fund' })
  @Index('idx_asset_type')
  assetType: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'data_source', default: 'mock', comment: '数据源: mock/reuters/bloomberg/api' })
  dataSource: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true, name: 'mock_price', comment: 'Mock基准价格' })
  mockPrice: string;

  @Column({ type: 'smallint', name: 'is_visible', default: 1, comment: '是否前端可见' })
  isVisible: number;

  @Column({ type: 'int', name: 'sort_order', default: 0, comment: '排序权重' })
  sortOrder: number;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: '图标emoji' })
  icon: string;

  @Column({ type: 'text', nullable: true, comment: '扩展配置JSON' })
  extra: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
