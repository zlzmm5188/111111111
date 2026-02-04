# 后台管理系统开发技能

## 描述
专门针对 AGX 项目后台管理系统的开发技能，包括管理员功能、权限控制、前后端对接等。

## 系统架构

### 后端结构 (agx-backend)
```
src/modules/admin/
├── admin.controller.ts      # 管理员主控制器
├── admin.service.ts         # 管理员业务逻辑
├── admin.dto.ts            # 数据传输对象
├── admin.module.ts         # 管理员模块
├── admin-v2.controller.ts  # 新版控制器
├── holding-management.controller.ts  # 持仓管理
├── exchange.controller.ts   # 兑换管理
├── financial-product.controller.ts  # 金融产品
├── *.service.ts            # 各种业务服务
└── index.ts                # 模块导出
```

### 前端结构 (agx-admin)
```
src/
├── views/
│   ├── agx/
│   │   ├── adminLogs.vue     # 管理员日志
│   │   └── admins.vue        # 管理员管理
│   ├── setting/              # 系统设置
│   └── dashboard/            # 仪表盘
├── api/
│   ├── system/               # 系统API
│   └── setting/              # 设置API
└── components/               # 公共组件
```

## 核心功能模块

### 1. 管理员认证
```typescript
// 后端: admin.controller.ts
@Post('login')
async login(@Body() dto: AdminLoginDto, @Req() req: Request) {
  const ip = req.ip || req.socket.remoteAddress;
  return this.adminService.login(dto, ip);
}

// 前端: 登录页面 (login.vue)
const handleLogin = async () => {
  try {
    const res = await adminLogin(loginForm);
    localStorage.setItem('admin_token', res.token);
    router.push('/dashboard');
  } catch (error) {
    ElMessage.error(error.message);
  }
};
```

### 2. 权限控制
```typescript
// 后端守卫
@UseGuards(AdminGuard)
@Controller('api/admin')
export class AdminController {}

// JWT 策略
@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('ADMIN_JWT_SECRET'),
    });
  }
}
```

### 3. 用户管理
```typescript
// 后端 API
@Get('users')
@UseGuards(AdminGuard)
async getUserList(@Query() dto: UserListDto) {
  return this.adminService.getUserList(dto);
}

@Put('users/:id/status')
@UseGuards(AdminGuard)
async updateUserStatus(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateUserStatusDto
) {
  return this.adminService.updateUserStatus(id, dto);
}

// 前端调用
const fetchUsers = async (params) => {
  const res = await adminApi.getUserList(params);
  userList.value = res.data;
  total.value = res.total;
};
```

### 4. 货币管理
```typescript
// DTO 定义
export class CreateCurrencyDto {
  @IsString()
  @Length(1, 20)
  symbol: string;

  @IsString()
  @Length(1, 50)
  name: string;

  @IsNumber()
  @Min(0)
  decimal: number;
}

// 控制器方法
@Post('currencies')
@UseGuards(AdminGuard)
async createCurrency(@Body() dto: CreateCurrencyDto) {
  return this.adminService.createCurrency(dto);
}
```

### 5. 持仓管理
```typescript
// 持仓查询
@Get('holdings')
@UseGuards(AdminGuard)
async getHoldings(@Query() dto: HoldingListDto) {
  return this.holdingManagementService.getList(dto);
}

// 持仓调整
@Post('holdings/adjust')
@UseGuards(AdminGuard)
async adjustHolding(@Body() dto: AdjustHoldingDto) {
  return this.holdingManagementService.adjust(dto);
}
```

## 前后端对接规范

### 1. API 接口约定
```javascript
// 前端 API 封装 (src/api/admin.js)
import request from '@/utils/request';

export const adminApi = {
  // 登录
  login: (data) => request.post('/api/admin/login', data),
  
  // 用户管理
  getUserList: (params) => request.get('/api/admin/users', { params }),
  updateUserStatus: (id, data) => request.put(`/api/admin/users/${id}/status`, data),
  
  // 货币管理
  getCurrencyList: (params) => request.get('/api/admin/currencies', { params }),
  createCurrency: (data) => request.post('/api/admin/currencies', data),
  
  // 持仓管理
  getHoldingList: (params) => request.get('/api/admin/holdings', { params }),
  adjustHolding: (data) => request.post('/api/admin/holdings/adjust', data)
};
```

### 2. 响应格式统一
```typescript
// 后端统一响应格式
export interface ApiResponse<T = any> {
  code: number;        // 0 表示成功
  message: string;     // 响应消息
  data: T;            // 数据
  timestamp: string;   // 时间戳
}

// 示例
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [...],
    "total": 100
  },
  "timestamp": "2026-02-04T04:00:00Z"
}
```

### 3. 错误处理
```javascript
// 前端拦截器 (src/utils/request.js)
import axios from 'axios';
import { ElMessage } from 'element-plus';

const service = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 10000
});

// 响应拦截器
service.interceptors.response.use(
  response => {
    const { code, message, data } = response.data;
    if (code === 0) {
      return data;
    } else {
      ElMessage.error(message || '请求失败');
      return Promise.reject(new Error(message));
    }
  },
  error => {
    if (error.response?.status === 401) {
      // 跳转到登录页
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    ElMessage.error(error.message || '网络错误');
    return Promise.reject(error);
  }
);
```

### 4. 分页规范
```typescript
// 后端分页 DTO
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

// 返回格式
{
  "code": 0,
  "data": {
    "list": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

## 权限管理系统

### 1. 角色定义
```sql
-- 管理员角色表
CREATE TABLE agx_admin_role (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB,  -- 权限列表
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 管理员用户表
CREATE TABLE agx_admin_user (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role_id INTEGER REFERENCES agx_admin_role(id),
  status SMALLINT DEFAULT 1,  -- 1:启用 0:禁用
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 权限装饰器
```typescript
// 自定义权限装饰器
export const RequirePermission = (...permissions: string[]) => 
  SetMetadata('permissions', permissions);

// 在控制器中使用
@Get('sensitive-data')
@RequirePermission('data:view')
@UseGuards(AdminGuard, PermissionGuard)
async getSensitiveData() {
  // 只有拥有 'data:view' 权限的管理员可以访问
}
```

### 3. 菜单权限
```javascript
// 前端菜单配置
const adminMenus = [
  {
    name: 'dashboard',
    title: '仪表盘',
    icon: 'House',
    permissions: ['dashboard:view']
  },
  {
    name: 'userManagement',
    title: '用户管理',
    icon: 'User',
    permissions: ['user:list', 'user:edit']
  }
];

// 根据权限过滤菜单
const filterMenusByPermissions = (menus, userPermissions) => {
  return menus.filter(menu => {
    if (!menu.permissions) return true;
    return menu.permissions.some(p => userPermissions.includes(p));
  });
};
```

## 日志和审计

### 1. 操作日志
```typescript
// 操作日志服务
@Injectable()
export class AdminLogService {
  async logOperation(adminId: number, action: string, resource: string, details?: any) {
    await this.logRepository.save({
      adminId,
      action,
      resource,
      details: JSON.stringify(details),
      ip: this.getCurrentIp(),
      userAgent: this.getCurrentUserAgent()
    });
  }
}

// 在控制器中使用
@Post('users')
@UseGuards(AdminGuard)
async createUser(@Body() dto: CreateUserDto, @Req() req) {
  const result = await this.adminService.createUser(dto);
  // 记录操作日志
  await this.logService.logOperation(
    req.user.id, 
    'create', 
    'user', 
    { username: dto.username }
  );
  return result;
}
```

### 2. 登录日志
```typescript
// 登录成功后记录
async login(dto: AdminLoginDto, ip: string) {
  const admin = await this.validateAdmin(dto);
  
  // 记录登录日志
  await this.logService.logOperation(
    admin.id,
    'login',
    'system',
    { ip, userAgent: '', success: true }
  );
  
  return this.generateToken(admin);
}
```

## 安全最佳实践

### 1. 密码安全
```typescript
// 密码加密存储
async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12); // 使用较高成本因子
}

// 密码验证
async validatePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### 2. 防暴力破解
```typescript
// 登录失败次数限制
@Injectable()
export class LoginAttemptService {
  private readonly attempts = new Map<string, { count: number; lastAttempt: Date }>();
  
  async recordFailedAttempt(ip: string) {
    const attempt = this.attempts.get(ip) || { count: 0, lastAttempt: new Date() };
    attempt.count++;
    attempt.lastAttempt = new Date();
    this.attempts.set(ip, attempt);
    
    // 5次失败后锁定15分钟
    if (attempt.count >= 5) {
      setTimeout(() => this.attempts.delete(ip), 15 * 60 * 1000);
    }
  }
  
  isLocked(ip: string): boolean {
    const attempt = this.attempts.get(ip);
    return attempt?.count >= 5;
  }
}
```

### 3. CSRF 防护
```typescript
// 后端启用 CSRF 保护
app.use(csurf());

// 前端获取 CSRF token
const getCsrfToken = () => {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
};

// 请求时携带 token
axios.defaults.headers.common['X-CSRF-TOKEN'] = getCsrfToken();
```

## 性能优化

### 1. 缓存策略
```typescript
// 管理员信息缓存
@Injectable()
export class AdminCacheService {
  private readonly cache = new Map<string, { data: any; expire: number }>();
  
  get(key: string) {
    const item = this.cache.get(key);
    if (item && item.expire > Date.now()) {
      return item.data;
    }
    this.cache.delete(key);
    return null;
  }
  
  set(key: string, data: any, ttl: number = 300000) { // 5分钟默认
    this.cache.set(key, {
      data,
      expire: Date.now() + ttl
    });
  }
}
```

### 2. 数据库优化
```typescript
// 索引优化
@Entity('agx_admin_log')
@Index(['admin_id', 'created_at'])  // 复合索引
@Index(['action', 'resource'])      // 查询索引
export class AdminLog {
  // 字段定义
}

// 查询优化
async getLogs(dto: LogQueryDto) {
  const qb = this.logRepository.createQueryBuilder('log')
    .select(['log.id', 'log.action', 'log.resource', 'log.created_at'])
    .where('log.admin_id = :adminId', { adminId: dto.adminId })
    .orderBy('log.created_at', 'DESC')
    .skip((dto.page - 1) * dto.pageSize)
    .take(dto.pageSize);
    
  const [list, total] = await qb.getManyAndCount();
  return { list, total };
}
```

## 部署和监控

### 1. 环境配置
```bash
# .env.production
ADMIN_JWT_SECRET=your-super-secret-key-here
ADMIN_PASSWORD_SALT=another-random-salt
ADMIN_LOGIN_ATTEMPT_LIMIT=5
ADMIN_LOGIN_LOCKOUT_MINUTES=15

# 数据库连接
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=agx_admin
```

### 2. 监控告警
```typescript
// 关键操作监控
@Post('withdraw')
async processWithdrawal(@Body() dto: WithdrawDto, @Req() req) {
  try {
    const result = await this.withdrawService.process(dto);
    
    // 发送监控事件
    await this.monitoringService.sendEvent({
      type: 'ADMIN_WITHDRAWAL',
      level: 'INFO',
      data: {
        adminId: req.user.id,
        amount: dto.amount,
        userId: dto.userId
      }
    });
    
    return result;
  } catch (error) {
    await this.monitoringService.sendEvent({
      type: 'ADMIN_WITHDRAWAL_ERROR',
      level: 'ERROR',
      data: {
        adminId: req.user.id,
        error: error.message
      }
    });
    throw error;
  }
}
```

## 开发流程建议

### 1. 新功能开发步骤
1. **需求分析** - 明确功能需求和权限要求
2. **数据库设计** - 创建必要的表和索引
3. **后端开发** - 实现 Controller -> Service -> Repository
4. **前端开发** - 实现页面和 API 调用
5. **权限配置** - 设置角色和权限
6. **测试验证** - 功能测试和安全测试
7. **日志记录** - 添加操作日志
8. **部署上线** - 灰度发布

### 2. 代码审查要点
- [ ] API 接口是否符合 RESTful 规范
- [ ] 权限控制是否完善
- [ ] 输入验证是否充分
- [ ] 错误处理是否友好
- [ ] 日志记录是否完整
- [ ] 性能优化是否考虑
- [ ] 安全防护是否到位
