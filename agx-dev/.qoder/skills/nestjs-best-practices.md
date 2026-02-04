# NestJS 最佳实践技能

## 描述
NestJS 后端开发的最佳实践指南，包括模块设计、依赖注入、错误处理、性能优化等。

## 核心原则

### 1. 模块化设计
```typescript
// ✅ 推荐：功能模块清晰分离
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService], // 只导出需要的服务
})
export class UserModule {}

// ❌ 避免：所有功能堆在一个模块
```

### 2. 依赖注入最佳实践
```typescript
// ✅ 推荐：使用构造函数注入
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) {}
}

// ❌ 避免：直接 new 实例
```

### 3. DTO 验证
```typescript
// ✅ 推荐：使用 class-validator
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

// Controller 中启用验证
@Post()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
async create(@Body() dto: CreateUserDto) {}
```

### 4. 异常处理
```typescript
// ✅ 推荐：使用 NestJS 内置异常
import { NotFoundException, BadRequestException } from '@nestjs/common';

async findOne(id: number) {
  const user = await this.userRepository.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException(`User #${id} not found`);
  }
  return user;
}

// ❌ 避免：抛出普通 Error
throw new Error('User not found');
```

### 5. 全局异常过滤器
```typescript
// exceptions/http-exception.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    this.logger.error({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 6. 拦截器使用
```typescript
// ✅ 推荐：使用拦截器统一响应格式
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        code: 0,
        data,
        message: 'Success',
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

### 7. 环境变量管理
```typescript
// ✅ 推荐：使用 @nestjs/config
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().default(5432),
      }),
    }),
  ],
})
export class AppModule {}

// 使用配置
constructor(private configService: ConfigService) {
  const dbHost = this.configService.get<string>('DATABASE_HOST');
}
```

### 8. 数据库事务
```typescript
// ✅ 推荐：使用事务确保数据一致性
async transferMoney(fromId: number, toId: number, amount: number) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await queryRunner.manager.decrement(Wallet, { userId: fromId }, 'balance', amount);
    await queryRunner.manager.increment(Wallet, { userId: toId }, 'balance', amount);
    
    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
```

### 9. 日志记录
```typescript
// ✅ 推荐：使用统一的日志服务
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  async create(dto: CreateUserDto) {
    this.logger.log(`Creating user with email: ${dto.email}`);
    try {
      const user = await this.userRepository.save(dto);
      this.logger.log(`User created successfully: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### 10. API 版本控制
```typescript
// ✅ 推荐：支持 API 版本
// main.ts
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});

// controller
@Controller({ path: 'users', version: '1' })
export class UserV1Controller {}

@Controller({ path: 'users', version: '2' })
export class UserV2Controller {}
```

## 性能优化

### 1. 数据库查询优化
```typescript
// ✅ 推荐：使用 select 指定字段
await this.userRepository.find({
  select: ['id', 'username', 'email'], // 只查询需要的字段
  where: { status: 'active' },
  relations: ['profile'], // 需要时才加载关联
});

// ✅ 推荐：使用索引
@Entity()
export class User {
  @Index()
  @Column()
  email: string;

  @Index()
  @Column()
  username: string;
}
```

### 2. 缓存策略
```typescript
// ✅ 推荐：使用 cache-manager
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UserService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async findOne(id: number): Promise<User> {
    const cacheKey = `user:${id}`;
    const cached = await this.cacheManager.get<User>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const user = await this.userRepository.findOne({ where: { id } });
    await this.cacheManager.set(cacheKey, user, 3600); // 缓存 1 小时
    return user;
  }
}
```

### 3. 并发处理
```typescript
// ✅ 推荐：使用 Promise.all 并行处理
async getDashboardData(userId: number) {
  const [user, wallet, orders] = await Promise.all([
    this.userService.findOne(userId),
    this.walletService.getBalance(userId),
    this.orderService.getRecentOrders(userId),
  ]);

  return { user, wallet, orders };
}
```

## 安全最佳实践

### 1. 密码加密
```typescript
// ✅ 推荐：使用 bcrypt
import * as bcrypt from 'bcryptjs';

async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### 2. JWT 认证
```typescript
// ✅ 推荐：使用守卫保护路由
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  @Get()
  getProfile(@Request() req) {
    return req.user;
  }
}
```

### 3. 限流
```typescript
// ✅ 推荐：使用 @nestjs/throttler
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10, // 每分钟最多 10 个请求
    }),
  ],
})
export class AppModule {}

// 应用到路由
@UseGuards(ThrottlerGuard)
@Post('login')
async login(@Body() dto: LoginDto) {}
```

## 测试最佳实践

### 1. 单元测试
```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should find a user by id', async () => {
    const mockUser = { id: 1, username: 'test' };
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as User);

    const result = await service.findOne(1);
    expect(result).toEqual(mockUser);
  });
});
```

## 项目结构建议
```
src/
├── common/              # 通用模块
│   ├── decorators/      # 自定义装饰器
│   ├── filters/         # 异常过滤器
│   ├── guards/          # 守卫
│   ├── interceptors/    # 拦截器
│   └── pipes/           # 管道
├── config/              # 配置文件
├── entities/            # 数据库实体
├── modules/             # 业务模块
│   ├── user/
│   │   ├── dto/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.module.ts
│   │   └── user.repository.ts
│   └── ...
├── app.module.ts
└── main.ts
```

## 检查清单
- [ ] 所有 DTO 都有验证装饰器
- [ ] 使用了全局异常过滤器
- [ ] 数据库查询使用了事务
- [ ] 敏感操作有日志记录
- [ ] API 端点有认证守卫
- [ ] 配置文件使用环境变量
- [ ] 关键查询使用了缓存
- [ ] 编写了单元测试
