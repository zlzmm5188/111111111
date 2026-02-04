import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

// 字典类型
@Entity('agx_system_dict_type')
export class SystemDictType {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '字典名称' })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '字典编码' })
  @Index('idx_code', { unique: true })
  code: string;

  @Column({ type: 'smallint', default: 1, comment: '状态: 1-正常, 0-禁用' })
  status: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}

// 字典数据
@Entity('agx_system_dict_data')
export class SystemDictData {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, name: 'type_code', comment: '字典类型编码' })
  @Index('idx_type_code')
  typeCode: string;

  @Column({ type: 'varchar', length: 100, comment: '字典标签' })
  label: string;

  @Column({ type: 'varchar', length: 100, comment: '字典值' })
  value: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ type: 'smallint', default: 1, comment: '状态: 1-正常, 0-禁用' })
  status: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
