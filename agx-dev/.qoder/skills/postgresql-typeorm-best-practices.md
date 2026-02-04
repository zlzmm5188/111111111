# PostgreSQL + TypeORM 最佳实践技能

## 描述
PostgreSQL 数据库设计和 TypeORM 使用的最佳实践，包括实体设计、查询优化、事务处理等。

## 实体设计最佳实践

### 1. 基础实体模板
```typescript
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index 
} from 'typeorm';

@Entity('agx_user')
@Index(['email']) // 常用查询字段添加索引
@Index(['username'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 255, select: false }) // 默认查询不返回密码
  password: string;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'banned'], default: 'active' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 2. 关联关系设计
```typescript
// 一对多关系
@Entity('agx_user')
export class User {
  @OneToMany(() => Order, order => order.user)
  orders: Order[];
}

@Entity('agx_order')
export class Order {
  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;
}

// 多对多关系
@Entity('agx_user')
export class User {
  @ManyToMany(() => Role)
  @JoinTable({
    name: 'agx_user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles: Role[];
}
```

### 3. 金额字段处理
```typescript
// ✅ 推荐：使用 decimal 类型存储金额
@Entity('agx_wallet')
export class Wallet {
  @Column({ 
    type: 'decimal', 
    precision: 20, // 总位数
    scale: 8,      // 小数位数
    default: 0 
  })
  balance: string; // 使用 string 避免精度丢失

  // 在 service 层使用 decimal.js 或 big.js 处理计算
}

// ❌ 避免：使用 float 或 double 存储金额（精度问题）
```

## 查询优化

### 1. 避免 N+1 问题
```typescript
// ❌ 错误：N+1 查询
async getUsersWithOrders() {
  const users = await this.userRepository.find();
  for (const user of users) {
    user.orders = await this.orderRepository.find({ 
      where: { userId: user.id } 
    });
  }
  return users;
}

// ✅ 正确：使用 relations
async getUsersWithOrders() {
  return this.userRepository.find({
    relations: ['orders']
  });
}

// ✅ 更好：使用 QueryBuilder + leftJoinAndSelect
async getUsersWithOrders() {
  return this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.orders', 'order')
    .where('user.status = :status', { status: 'active' })
    .getMany();
}
```

### 2. 选择必要字段
```typescript
// ✅ 推荐：只查询需要的字段
async getUserList() {
  return this.userRepository.find({
    select: ['id', 'username', 'email', 'status'], // 不查询 password
    where: { status: 'active' }
  });
}

// ✅ 使用 QueryBuilder
async getUserList() {
  return this.userRepository
    .createQueryBuilder('user')
    .select(['user.id', 'user.username', 'user.email'])
    .where('user.status = :status', { status: 'active' })
    .getMany();
}
```

### 3. 分页查询
```typescript
// ✅ 推荐：使用 skip 和 take
async getUsersPaginated(page: number, pageSize: number) {
  const [data, total] = await this.userRepository.findAndCount({
    skip: (page - 1) * pageSize,
    take: pageSize,
    order: { createdAt: 'DESC' }
  });

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}
```

### 4. 复杂查询
```typescript
// ✅ 推荐：使用 QueryBuilder 处理复杂查询
async searchUsers(keyword: string, filters: any) {
  const qb = this.userRepository.createQueryBuilder('user');

  if (keyword) {
    qb.andWhere('(user.username LIKE :keyword OR user.email LIKE :keyword)', {
      keyword: `%${keyword}%`
    });
  }

  if (filters.status) {
    qb.andWhere('user.status = :status', { status: filters.status });
  }

  if (filters.startDate) {
    qb.andWhere('user.createdAt >= :startDate', { startDate: filters.startDate });
  }

  return qb
    .orderBy('user.createdAt', 'DESC')
    .skip(filters.skip)
    .take(filters.take)
    .getManyAndCount();
}
```

## 事务处理

### 1. 基本事务
```typescript
// ✅ 推荐：使用 QueryRunner
async transferMoney(fromUserId: number, toUserId: number, amount: string) {
  const queryRunner = this.dataSource.createQueryRunner();
  
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    // 扣款
    await queryRunner.manager
      .createQueryBuilder()
      .update(Wallet)
      .set({ balance: () => `balance - ${amount}` })
      .where('user_id = :userId', { userId: fromUserId })
      .andWhere('balance >= :amount', { amount })
      .execute();

    // 加款
    await queryRunner.manager
      .createQueryBuilder()
      .update(Wallet)
      .set({ balance: () => `balance + ${amount}` })
      .where('user_id = :userId', { userId: toUserId })
      .execute();

    // 记录交易
    await queryRunner.manager.save(Transaction, {
      fromUserId,
      toUserId,
      amount,
      type: 'transfer'
    });

    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw new BadRequestException('转账失败：' + err.message);
  } finally {
    await queryRunner.release();
  }
}
```

### 2. 装饰器事务
```typescript
// ✅ 使用 @Transaction 装饰器
import { Transaction, TransactionManager, EntityManager } from 'typeorm';

@Transaction()
async createOrder(
  orderData: CreateOrderDto,
  @TransactionManager() manager: EntityManager
) {
  // 创建订单
  const order = await manager.save(Order, orderData);

  // 扣减库存
  await manager.decrement(
    Product, 
    { id: orderData.productId }, 
    'stock', 
    orderData.quantity
  );

  // 扣减余额
  await manager.decrement(
    Wallet,
    { userId: orderData.userId },
    'balance',
    orderData.amount
  );

  return order;
}
```

## 索引优化

### 1. 单列索引
```typescript
@Entity('agx_user')
export class User {
  // ✅ 常用查询字段添加索引
  @Index()
  @Column()
  email: string;

  @Index()
  @Column()
  username: string;

  @Index()
  @Column()
  status: string;
}
```

### 2. 复合索引
```typescript
@Entity('agx_order')
@Index(['userId', 'status']) // 复合索引
@Index(['createdAt', 'status']) // 按时间和状态查询
export class Order {
  @Column()
  userId: number;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### 3. 唯一索引
```typescript
@Entity('agx_user')
export class User {
  @Column({ unique: true }) // 自动创建唯一索引
  email: string;

  // 或者使用装饰器
  @Index({ unique: true })
  @Column()
  username: string;
}
```

## 数据库迁移

### 1. 创建迁移
```bash
# 根据实体变化自动生成迁移
npm run typeorm migration:generate -- -n UpdateUserTable

# 手动创建迁移
npm run typeorm migration:create -- -n AddUserStatus
```

### 2. 迁移文件示例
```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserStatus1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'agx_user',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['active', 'inactive', 'banned'],
        default: "'active'"
      })
    );

    // 添加索引
    await queryRunner.createIndex(
      'agx_user',
      new TableIndex({
        name: 'IDX_USER_STATUS',
        columnNames: ['status']
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('agx_user', 'IDX_USER_STATUS');
    await queryRunner.dropColumn('agx_user', 'status');
  }
}
```

### 3. 执行迁移
```bash
# 运行迁移
npm run typeorm migration:run

# 回滚迁移
npm run typeorm migration:revert
```

## 性能优化建议

### 1. 批量操作
```typescript
// ✅ 推荐：使用批量插入
async batchCreateUsers(users: CreateUserDto[]) {
  return this.userRepository
    .createQueryBuilder()
    .insert()
    .into(User)
    .values(users)
    .execute();
}

// ✅ 推荐：使用批量更新
async batchUpdateStatus(userIds: number[], status: string) {
  return this.userRepository
    .createQueryBuilder()
    .update(User)
    .set({ status })
    .where('id IN (:...ids)', { ids: userIds })
    .execute();
}
```

### 2. 查询缓存
```typescript
// ✅ 使用 TypeORM 查询缓存
async getPopularProducts() {
  return this.productRepository
    .createQueryBuilder('product')
    .where('product.status = :status', { status: 'active' })
    .orderBy('product.sales', 'DESC')
    .cache(60000) // 缓存 60 秒
    .getMany();
}
```

### 3. 软删除
```typescript
@Entity('agx_user')
export class User {
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}

// 使用软删除
await this.userRepository.softDelete(userId);

// 查询时自动排除软删除的记录
await this.userRepository.find();

// 包含软删除的记录
await this.userRepository.find({ withDeleted: true });

// 恢复软删除的记录
await this.userRepository.restore(userId);
```

## 常见陷阱和解决方案

### 1. 金额计算精度问题
```typescript
import Decimal from 'decimal.js';

// ✅ 推荐：使用 Decimal.js
async calculateBalance(userId: number) {
  const wallet = await this.walletRepository.findOne({ 
    where: { userId } 
  });

  // 使用 Decimal 进行计算
  const balance = new Decimal(wallet.balance);
  const fee = new Decimal('0.001');
  const result = balance.minus(fee);

  return result.toString(); // 返回字符串
}
```

### 2. 并发更新问题
```typescript
// ✅ 使用乐观锁
@Entity('agx_wallet')
export class Wallet {
  @VersionColumn()
  version: number;

  @Column({ type: 'decimal' })
  balance: string;
}

// 更新时 TypeORM 会自动检查版本号
// 如果版本号不匹配会抛出异常
```

### 3. 时区问题
```typescript
// ✅ 推荐：统一使用 UTC
@CreateDateColumn({ 
  type: 'timestamp with time zone',
  default: () => 'CURRENT_TIMESTAMP'
})
createdAt: Date;

// 在 data-source.ts 中配置
timezone: 'Z' // 使用 UTC
```

## SQL 注入防护

```typescript
// ❌ 危险：字符串拼接
async findByUsername(username: string) {
  return this.userRepository.query(
    `SELECT * FROM agx_user WHERE username = '${username}'` // SQL 注入风险！
  );
}

// ✅ 正确：使用参数化查询
async findByUsername(username: string) {
  return this.userRepository.query(
    'SELECT * FROM agx_user WHERE username = $1',
    [username]
  );
}

// ✅ 更好：使用 QueryBuilder
async findByUsername(username: string) {
  return this.userRepository
    .createQueryBuilder('user')
    .where('user.username = :username', { username })
    .getOne();
}
```

## 检查清单
- [ ] 实体字段类型选择正确
- [ ] 金额使用 decimal 类型
- [ ] 常用查询字段添加索引
- [ ] 关联关系配置正确
- [ ] 避免 N+1 查询
- [ ] 关键操作使用事务
- [ ] 使用参数化查询防止 SQL 注入
- [ ] 密码字段设置 select: false
- [ ] 时间字段使用 timestamp with time zone
- [ ] 软删除使用 DeleteDateColumn
- [ ] 并发更新使用乐观锁
- [ ] 批量操作使用批量方法

