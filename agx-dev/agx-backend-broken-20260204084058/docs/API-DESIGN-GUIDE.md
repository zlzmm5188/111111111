# AGX 后台 API 设计指南

基于业界最佳实践和 RESTful 标准

## 📋 目录

- [设计原则](#设计原则)
- [路由规范](#路由规范)
- [响应格式](#响应格式)
- [错误处理](#错误处理)
- [分页规范](#分页规范)
- [版本控制](#版本控制)
- [认证授权](#认证授权)

---

## 设计原则

### 1. 资源导向 (Resource-Oriented)

✅ **正确示例:**
```
GET    /api/v1/users              # 获取用户列表
POST   /api/v1/users              # 创建用户
GET    /api/v1/users/:id          # 获取单个用户
PUT    /api/v1/users/:id          # 完整更新用户
PATCH  /api/v1/users/:id          # 部分更新用户
DELETE /api/v1/users/:id          # 删除用户
```

❌ **错误示例:**
```
POST   /api/getUsers
POST   /api/createUser
POST   /api/deleteUser/:id
```

### 2. HTTP 方法语义

| 方法 | 用途 | 幂等性 | 安全性 |
|------|------|--------|--------|
| GET | 获取资源 | ✓ | ✓ |
| POST | 创建资源 | ✗ | ✗ |
| PUT | 完整替换 | ✓ | ✗ |
| PATCH | 部分更新 | ✗ | ✗ |
| DELETE | 删除资源 | ✓ | ✗ |

### 3. 状态码规范

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 成功获取/更新资源 |
| 201 | Created | 成功创建资源 |
| 204 | No Content | 成功删除资源 |
| 400 | Bad Request | 参数错误 |
| 401 | Unauthorized | 未登录/Token 无效 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 429 | Too Many Requests | 请求频率超限 |
| 500 | Internal Error | 服务器错误 |

---

## 路由规范

### 资源命名

1. **使用复数名词**
   ```
   /users  (✓)
   /user   (✗)
   ```

2. **使用小写字母和连字符**
   ```
   /user-profiles  (✓)
   /userProfiles   (✗)
   /UserProfiles   (✗)
   ```

3. **嵌套资源关系**
   ```
   # 获取用户的订单
   GET /users/:userId/orders
   
   # 获取用户的特定订单
   GET /users/:userId/orders/:orderId
   
   # 深度不超过 3 层
   /users/:userId/orders/:orderId/items  (✓)
   /users/:userId/orders/:orderId/items/:itemId/details  (✗ 太深)
   ```

### 路由示例

```typescript
// 用户管理
@Controller('api/v1/users')
export class UserController {
  @Get()                    // GET /api/v1/users?page=1&pageSize=20
  getUsers(@Query() query: PaginationDto) {}

  @Post()                   // POST /api/v1/users
  createUser(@Body() dto: CreateUserDto) {}

  @Get(':id')               // GET /api/v1/users/123
  getUser(@Param('id') id: number) {}

  @Patch(':id')             // PATCH /api/v1/users/123
  updateUser(@Param('id') id: number, @Body() dto: UpdateUserDto) {}

  @Delete(':id')            // DELETE /api/v1/users/123
  deleteUser(@Param('id') id: number) {}

  // 嵌套资源
  @Get(':id/orders')        // GET /api/v1/users/123/orders
  getUserOrders(@Param('id') id: number) {}
}
```

---

## 响应格式

### 统一响应结构

```typescript
interface ApiResponse<T> {
  code: number;        // 业务状态码 (0=成功)
  message: string;     // 响应消息
  data: T;            // 响应数据
  timestamp: number;   // 时间戳
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "id": 123,
    "username": "张三",
    "email": "zhangsan@example.com"
  },
  "timestamp": 1709280000000
}
```

### 列表响应示例

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "items": [
      { "id": 1, "name": "用户1" },
      { "id": 2, "name": "用户2" }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": 1709280000000
}
```

---

## 错误处理

### 错误响应格式

```typescript
interface ErrorResponse {
  code: number;         // 错误码
  message: string;      // 错误消息
  details?: any;        // 详细信息 (开发环境)
  timestamp: number;    // 时间戳
  path: string;         // 请求路径
}
```

### 错误码设计

```typescript
enum ApiErrorCode {
  // 通用错误 (1000-1999)
  INVALID_PARAMS = 1001,
  UNAUTHORIZED = 1002,
  FORBIDDEN = 1003,
  NOT_FOUND = 1004,
  
  // 业务错误 (2000-2999)
  USER_NOT_FOUND = 2001,
  INSUFFICIENT_BALANCE = 2005,
  
  // 系统错误 (9000-9999)
  SYSTEM_ERROR = 9000,
  DATABASE_ERROR = 9001,
}
```

### 错误示例

```json
{
  "code": 2001,
  "message": "用户不存在",
  "data": null,
  "timestamp": 1709280000000,
  "path": "/api/v1/users/999"
}
```

---

## 分页规范

### 查询参数

```
GET /api/v1/users?page=1&pageSize=20&sort=createdAt:desc
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| page | 页码(从1开始) | 1 |
| pageSize | 每页数量 | 20 |
| sort | 排序字段:方向 | - |

### 响应格式

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 版本控制

### URL 版本控制 (推荐)

```
/api/v1/users
/api/v2/users
```

### Header 版本控制

```
Accept: application/vnd.agx.v1+json
```

### 版本管理策略

1. **向后兼容**: 新版本保持对旧版本的兼容
2. **废弃通知**: 提前通知 API 废弃计划
3. **文档维护**: 维护所有活跃版本的文档

---

## 认证授权

### JWT Token 认证

```typescript
// 请求头
Authorization: Bearer <token>

// 守卫使用
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Req() req: Request) {
  const userId = req.user.id;
  return this.userService.getProfile(userId);
}
```

### 权限控制

```typescript
// 角色守卫
@UseGuards(RolesGuard)
@Roles('admin', 'superadmin')
@Delete(':id')
deleteUser(@Param('id') id: number) {}

// 权限守卫
@UseGuards(PermissionsGuard)
@RequirePermissions('user:delete')
@Delete(':id')
deleteUser(@Param('id') id: number) {}
```

---

## 最佳实践

### 1. 使用 DTO 验证

```typescript
export class CreateUserDto {
  @IsString()
  @Length(4, 50)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 50)
  password: string;
}
```

### 2. 使用 Swagger 文档

```typescript
@ApiTags('用户管理')
@Controller('api/v1/users')
export class UserController {
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ status: 200, description: '成功' })
  @Get()
  getUsers() {}
}
```

### 3. 统一异常处理

```typescript
// 使用全局异常过滤器
@UseFilters(GlobalExceptionFilter)

// 业务异常
throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
```

### 4. 请求日志

```typescript
// 使用拦截器记录请求日志
@UseInterceptors(LoggingInterceptor)
```

---

## 参考资源

- [RESTful API 设计指南](https://restfulapi.net/)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [Google API Design Guide](https://cloud.google.com/apis/design)
