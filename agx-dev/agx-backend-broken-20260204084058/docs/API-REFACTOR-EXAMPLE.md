# API 重构示例：管理员控制器

对比展示优化前后的 API 设计

## 重构前 vs 重构后

### 1. 路由设计优化

#### ❌ 重构前

```typescript
@Controller('api/admin')
export class AdminController {
  // 路径不一致
  @Get('admin/list')          // /api/admin/admin/list (重复)
  @Post('admin')              // /api/admin/admin
  @Put('admin/:id')          // /api/admin/admin/:id
  
  // 缺少版本控制
  // 缺少统一前缀
}
```

#### ✅ 重构后

```typescript
@ApiTags('管理员管理')
@Controller('api/v1/admins')  // 使用复数、添加版本
export class AdminController {
  @Get()                       // /api/v1/admins
  @Post()                      // /api/v1/admins
  @Patch(':id')               // /api/v1/admins/:id
  
  // 统一、清晰、RESTful
}
```

---

### 2. 响应格式统一

#### ❌ 重构前

```typescript
@Post('admin')
async createAdmin(@Body() dto: any) {
  // 直接返回不同格式
  if (error) {
    return { code: 1001, msg: '错误', data: null };
  }
  return { code: 0, msg: '成功', data: result };
}
```

#### ✅ 重构后

```typescript
@Post()
async createAdmin(@Body() dto: CreateAdminDto) {
  const admin = await this.adminService.createAdmin(dto);
  
  // 使用响应构造器
  return ResponseBuilder.success(admin, '创建管理员成功');
}

// 响应自动统一格式：
// {
//   code: 0,
//   message: '创建管理员成功',
//   data: { id: 1, username: 'admin' },
//   timestamp: 1709280000000
// }
```

---

### 3. 分页响应优化

#### ❌ 重构前

```typescript
@Get('admin/list')
async getAdminList(@Query() dto: any) {
  const { list, total } = await this.service.getList(dto);
  
  return {
    code: 0,
    data: { list, total }  // 字段名不统一
  };
}
```

#### ✅ 重构后

```typescript
@Get()
@ApiOperation({ summary: '获取管理员列表' })
async getAdmins(@Query() query: AdminListDto) {
  const { items, total } = await this.service.getAdmins(query);
  
  return ResponseBuilder.paginated(
    items,
    total,
    query.page,
    query.pageSize,
  );
}

// 标准分页响应：
// {
//   code: 0,
//   message: '操作成功',
//   data: {
//     items: [...],
//     total: 100,
//     page: 1,
//     pageSize: 20,
//     totalPages: 5,
//     hasNext: true,
//     hasPrev: false
//   }
// }
```

---

### 4. 错误处理改进

#### ❌ 重构前

```typescript
@Post('admin')
async createAdmin(@Body() dto: any) {
  const currentAdminGroup = (req as any).user?.adminGroup ?? 0;
  
  if (currentAdminGroup !== 0) {
    // 手动构造错误响应
    return { code: 1001, msg: '只有超级管理员可以创建', data: null };
  }
  
  // 业务逻辑...
}
```

#### ✅ 重构后

```typescript
@Post()
@UseGuards(AdminGuard, SuperAdminGuard)  // 使用守卫
async createAdmin(@Body() dto: CreateAdminDto) {
  // 权限检查由守卫处理
  // 业务逻辑专注于核心功能
  const admin = await this.adminService.createAdmin(dto);
  
  return ResponseBuilder.success(admin, '创建成功');
}

// SuperAdminGuard 中统一处理权限
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const adminGroup = request.user?.adminGroup ?? 0;
    
    if (adminGroup !== 0) {
      throw new HttpException(
        API_ERROR_MESSAGES[ApiErrorCode.ADMIN_NO_PERMISSION],
        HttpStatus.FORBIDDEN,
      );
    }
    
    return true;
  }
}
```

---

### 5. DTO 验证完善

#### ❌ 重构前

```typescript
@Post('admin')
async createAdmin(@Body() dto: any) {  // any 类型，无验证
  // 手动验证
  if (!dto.username) {
    return { code: 1001, msg: '用户名不能为空', data: null };
  }
  // ...
}
```

#### ✅ 重构后

```typescript
export class CreateAdminDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @Length(4, 50)
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @Length(6, 50)
  password: string;

  @ApiProperty({ description: '昵称', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  nickname?: string;

  @ApiProperty({ description: '管理员组', enum: [0, 1, 2] })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  adminGroup?: number;
}

@Post()
async createAdmin(@Body() dto: CreateAdminDto) {
  // DTO 自动验证，无需手动检查
  const admin = await this.adminService.createAdmin(dto);
  return ResponseBuilder.success(admin);
}
```

---

### 6. HTTP 方法语义化

#### ❌ 重构前

```typescript
@Put('admin/:id')  // PUT 用于完整替换
async updateAdmin(@Param('id') id: number, @Body() dto: any) {
  // 实际是部分更新
  const result = await this.service.updateAdmin(id, dto);
}
```

#### ✅ 重构后

```typescript
// 部分更新使用 PATCH
@Patch(':id')
@ApiOperation({ summary: '更新管理员信息' })
async updateAdmin(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateAdminDto,
) {
  const admin = await this.adminService.updateAdmin(id, dto);
  return ResponseBuilder.success(admin, '更新成功');
}

// 完整替换使用 PUT (如需要)
@Put(':id')
@ApiOperation({ summary: '替换管理员信息' })
async replaceAdmin(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: ReplaceAdminDto,  // 包含所有必填字段
) {
  const admin = await this.adminService.replaceAdmin(id, dto);
  return ResponseBuilder.success(admin, '替换成功');
}
```

---

### 7. API 文档完善

#### ❌ 重构前

```typescript
@Post('admin')
async createAdmin(@Body() dto: any) {
  // 无文档注释
}
```

#### ✅ 重构后

```typescript
@Post()
@ApiOperation({
  summary: '创建管理员',
  description: '仅超级管理员可操作',
})
@ApiResponse({
  status: 201,
  description: '创建成功',
  type: AdminEntity,
})
@ApiResponse({
  status: 403,
  description: '权限不足',
})
@ApiResponse({
  status: 409,
  description: '管理员已存在',
})
async createAdmin(@Body() dto: CreateAdminDto) {
  const admin = await this.adminService.createAdmin(dto);
  return ResponseBuilder.success(admin, '创建成功');
}
```

---

## 完整示例对比

### 重构前（admin.controller.ts 片段）

```typescript
@Controller('api/admin')
export class AdminController {
  @Get('admin/list')
  @UseGuards(AdminGuard)
  async getAdminList(@Query() dto: any, @Req() req: Request) {
    const adminGroup = (req as any).user?.adminGroup ?? 0;
    return this.adminService.getAdminList(dto, adminGroup);
  }

  @Post('admin')
  @UseGuards(AdminGuard)
  async createAdmin(@Body() dto: any, @Req() req: Request) {
    const currentAdminGroup = (req as any).user?.adminGroup ?? 0;
    if (currentAdminGroup !== 0) {
      return { code: 1001, msg: '只有超级管理员可以创建', data: null };
    }
    
    const result = await this.adminService.createAdmin(dto);
    return { code: 0, msg: '创建成功', data: result };
  }
}
```

### 重构后（admin.controller.v2.ts）

```typescript
@ApiTags('管理员管理')
@Controller('api/v1/admins')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取管理员列表' })
  @ApiResponse({ status: 200, description: '成功' })
  async getAdmins(@Query() query: AdminListDto) {
    const { items, total } = await this.adminService.getAdmins(query);
    
    return ResponseBuilder.paginated(
      items,
      total,
      query.page,
      query.pageSize,
    );
  }

  @Post()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: '创建管理员' })
  @ApiResponse({ status: 201, type: AdminEntity })
  @ApiResponse({ status: 403, description: '权限不足' })
  async createAdmin(
    @Body() dto: CreateAdminDto,
    @Req() req: Request,
  ) {
    const admin = await this.adminService.createAdmin(dto);
    
    // 记录审计日志
    this.logger.log(`管理员创建成功: ${admin.username}`, {
      operatorId: req.user.id,
      ip: req.ip,
    });
    
    return ResponseBuilder.success(admin, '创建成功');
  }

  @Get(':id')
  @ApiOperation({ summary: '获取管理员详情' })
  @ApiResponse({ status: 200, type: AdminEntity })
  @ApiResponse({ status: 404, description: '管理员不存在' })
  async getAdmin(@Param('id', ParseIntPipe) id: number) {
    const admin = await this.adminService.getAdmin(id);
    
    if (!admin) {
      throw new NotFoundException('管理员不存在');
    }
    
    return ResponseBuilder.success(admin);
  }

  @Patch(':id')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: '更新管理员' })
  async updateAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminDto,
  ) {
    const admin = await this.adminService.updateAdmin(id, dto);
    return ResponseBuilder.success(admin, '更新成功');
  }

  @Delete(':id')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: '删除管理员' })
  @ApiResponse({ status: 204 })
  async deleteAdmin(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.deleteAdmin(id);
    return ResponseBuilder.success(null, '删除成功');
  }
}
```

---

## 迁移步骤

### 第一阶段：准备工作
1. ✅ 创建统一响应 DTO
2. ✅ 创建全局异常过滤器
3. ✅ 创建响应转换拦截器
4. ✅ 编写 API 设计指南

### 第二阶段：逐步迁移
1. 选择一个模块作为试点（如管理员模块）
2. 创建 v2 版本的 Controller
3. 并行运行新旧版本
4. 前端逐步切换到新版本
5. 废弃旧版本 API

### 第三阶段：全面推广
1. 所有模块按新规范重构
2. 统一错误码和消息
3. 完善 Swagger 文档
4. 编写自动化测试

---

## 收益总结

### 1. 可维护性提升
- 统一的代码风格
- 清晰的职责划分
- 易于理解和修改

### 2. 开发效率提升
- 自动的参数验证
- 统一的响应处理
- 减少重复代码

### 3. 用户体验提升
- 一致的 API 行为
- 清晰的错误提示
- 完善的 API 文档

### 4. 可扩展性提升
- 版本控制机制
- 灵活的中间件
- 标准的扩展点
