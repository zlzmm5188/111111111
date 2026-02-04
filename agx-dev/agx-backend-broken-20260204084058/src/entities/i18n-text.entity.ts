import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 多语言文本配置表
 * 存储前端多语言文案
 */
@Entity('agx_i18n_text')
export class I18nText {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true, comment: '文案Key' })
  @Index('idx_key')
  key: string;

  @Column({ type: 'varchar', length: 50, comment: '所属分类: common/trade/asset/user/tips/agreement' })
  @Index('idx_category')
  category: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '备注说明' })
  remark: string;

  @Column({ type: 'text', nullable: true, name: 'zh_cn', comment: '简体中文' })
  zhCN: string;

  @Column({ type: 'text', nullable: true, name: 'zh_tw', comment: '繁体中文' })
  zhTW: string;

  @Column({ type: 'text', nullable: true, comment: 'English' })
  en: string;

  @Column({ type: 'text', nullable: true, comment: '日本語' })
  ja: string;

  @Column({ type: 'text', nullable: true, comment: '한국어' })
  ko: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
