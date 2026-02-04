# AGX API 升级计划

## ✅ 已完成的基础设施

### 1. 统一响应格式
- ✅ 创建 `ApiResponse<T>` 接口
- ✅ 创建 `PaginatedResponse<T>` 接口
- ✅ 创建 `ResponseBuilder` 工具类
- ✅ 完善 `ApiErrorCode` 枚举（含所有业务错误码）
- ✅ 创建 `API_ERROR_MESSAGES` 映射表

### 2. 全局过滤器和拦截器
- ✅ 更新 `AllExceptionsFilter` - 统一错误处理
- ✅ 保持 `TransformInterceptor` - 自动包装响应
- ✅ 已在 `main.ts` 中启用

### 3. 权限守卫
- ✅ 创建 `SuperAdminGuard` - 超级管理员权限
- ✅ 兼容现有 `AdminGuard` - 普通管理员权限

### 4. 兼容性
- ✅ 保留 `ErrorCode` 类型别名用于旧代码
- ✅ 提供 `getErrorMessage()` 函数
- ✅ `BusinessException` 完全兼容新错误码

---

## 📋 API 重构指南

### 重构前的代码（旧方式）

```typescript
@Controller('api/admin')
export class AdminController {
  @Post('admin')
  @UseGuards(AdminGuard)
  async createAdmin(@Body() dto: any, @Req() req: Request) {
    // ❌ 手动权限检查
    const currentAdminGroup = (req as any).user?.adminGroup ?? 0;
    if (currentAdminGroup !== 0) {
      return { code: 1001, msg: '只有超级管理员可以创建管理员', data: null };
    }

    const result = await this.adminService.createAdmin(dto);

    // ❌ 手动构造响应
    return { code: 0, msg: '创建成功', data: result };
  }

  @Get('admin/list')
  @UseGuards(AdminGuard)
  async getAdminList(@Query() dto: any) {
    return this.adminService.getAdminList(dto);
  }
}
```

### 重构后的代码（新方式）

```typescript
import { ResponseBuilder, ApiErrorCode } from '@/common';
import { SuperAdminGuard } from '@/common/guards/super-admin.guard';

@Controller('api/v1/admins')  // ✅ RESTful 路由
export class AdminV2Controller {
  @Post()  // POST /api/v1/admins
  @UseGuards(AdminGuard, SuperAdminGuard)  // ✅ 使用守卫检查权限
  async create(@Body() dto: CreateAdminDto) {
    const result = await this.adminService.createAdmin(dto);
    
    // ✅ TransformInterceptor 会自动包装为标准响应
    // 也可以显式使用 ResponseBuilder
    return ResponseBuilder.success(result, '创建成功');
  }

  @Get()  // GET /api/v1/admins
  @UseGuards(AdminGuard)
  async list(@Query() dto: AdminListDto) {
    const { items, total } = await this.adminService.getAdminList(dto);
    
    // ✅ 使用分页响应构造器
    return ResponseBuilder.paginated(items, total, dto.page, dto.pageSize);
  }

  @Get(':id')  // GET /api/v1/admins/:id
  @UseGuards(AdminGuard)
  async getById(@Param('id', ParseIntPipe) id: number) {
    const admin = await this.adminService.findById(id);
    
    if (!admin) {
      // ✅ 抛出标准异常，AllExceptionsFilter 会处理
      throw BusinessException.adminNotFound();
    }
    
    return admin;  // ✅ 自动包装
  }

  @Put(':id')  // PUT /api/v1/admins/:id
  @UseGuards(AdminGuard, SuperAdminGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminDto
  ) {
    const result = await this.adminService.updateAdmin(id, dto);
    return ResponseBuilder.success(result, '更新成功');
  }

  @Delete(':id')  // DELETE /api/v1/admins/:id
  @UseGuards(AdminGuard, SuperAdminGuard)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.deleteAdmin(id);
    return ResponseBuilder.success(null, '删除成功');
  }
}
```

---

## 🔄 分步迁移策略

### 阶段 1：新旧并存（当前阶段）

1. **保留旧版本 API**
   - 保持 `api/admin/*` 路由不变
   - 现有前端继续使用旧 API

2. **创建新版本 API**
   - 新建 `api/v1/*` 路由
   - 应用新的设计规范
   - 新功能优先使用新 API

3. **示例目录结构**
   ```
   src/modules/admin/
   ├── admin.controller.ts          # 旧版本（保留）
   ├── admin-v2.controller.ts       # 新版本
   ├── admin.service.ts             # 共用服务层
   └── dto/
       ├── admin.dto.ts             # 旧 DTO
       └── admin-v2.dto.ts          # 新 DTO (含验证装饰器)
   ```

### 阶段 2：逐步迁移

1. **优先级顺序**
   - 核心业务：用户管理、财务管理
   - 管理功能：管理员管理、配置管理
   - 其他功能：数据统计、日志查询

2. **前端配合迁移**
   - 前端页面逐个切换到新 API
   - 使用环境变量控制 API 版本
   - 灰度发布验证

### 阶段 3：完全切换

1. 所有前端页面切换到新 API
2. 标记旧 API 为 `@deprecated`
3. 观察期后移除旧 API

---

## 📝 DTO 设计规范

### 旧方式（any 类型）
```typescript
async createAdmin(@Body() dto: any) {
  // ❌ 无类型检查
  // ❌ 无参数验证
}
```

### 新方式（强类型 + 验证）
```typescript
import { IsString, IsEmail, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEmail()
  email: string;

  @IsNumber()
  @Min(0)
  @Max(2)
  adminGroup: number;

  @IsString()
  @IsOptional()
  remark?: string;
}

export class AdminListDto {
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize?: number = 20;

  @IsString()
  @IsOptional()
  keyword?: string;
}
```

---

## 🛡️ 错误处理规范

### 旧方式
```typescript
if (!admin) {
  return { code: 1001, msg: '管理员不存在', data: null };
}

if (currentAdminGroup !== 0) {
  return { code: 1001, msg: '只有超级管理员可以操作', data: null };
}
```

### 新方式
```typescript
import { BusinessException } from '@/common';

// 业务异常（自动映射到标准错误码）
if (!admin) {
  throw BusinessException.adminNotFound();
}

// HTTP 异常
if (!isValidEmail(email)) {
  throw new BadRequestException('邮箱格式不正确');
}

// 权限异常（由 Guard 处理）
@UseGuards(SuperAdminGuard)  // 自动抛出 FORBIDDEN 异常
async sensitiveOperation() { }
```

---

## 🎯 下一步操作建议

### 立即可做的事

1. **创建 admin-v2.controller.ts**
   ```bash
   # 在 src/modules/admin/ 目录下
   ```

2. **测试新 API**
   - 使用 Postman/Thunder Client 测试
   - 验证响应格式
   - 验证错误处理

3. **更新一个前端页面作为示例**
   - 选择简单页面（如管理员列表）
   - 切换到新 API
   - 验证功能正常

### 长期计划

- [ ] 完成所有管理员相关 API 迁移
- [ ] 完成用户管理 API 迁移
- [ ] 完成财务管理 API 迁移
- [ ] 编写 API 文档（Swagger）
- [ ] 前端全量切换
- [ ] 移除旧版本 API

---

## 📚 相关文档

- [API-DESIGN-GUIDE.md](./API-DESIGN-GUIDE.md) - 完整的 API 设计指南
- [API-REFACTOR-EXAMPLE.md](./API-REFACTOR-EXAMPLE.md) - 详细的重构示例

---

## 🎉 总结

### 核心改进
1. ✅ **统一响应格式** - 前端解析更简单
2. ✅ **标准错误码** - 错误处理更规范
3. ✅ **类型安全** - 减少 bug
4. ✅ **自动验证** - 参数检查自动化
5. ✅ **权限守卫** - 权限控制更清晰
6. ✅ **RESTful** - 符合行业标准

### 兼容性保证
- ✅ 旧代码继续工作
- ✅ 新旧 API 并存
- ✅ 渐进式迁移
- ✅ 零风险升级

**现在所有基础设施已就绪，随时可以开始应用到实际代码中！** 🚀
