import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import {
  AdminLoginDto,
  AdminListDto,
  CreateAdminDto,
  UpdateAdminDto,
  AssignUserDto,
} from './admin.dto';
import { AdminGuard } from '../auth/jwt-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { ResponseBuilder, BusinessException } from '../../common';

/**
 * 管理员管理 API v2
 * 基于 RESTful 最佳实践重构
 * 
 * 路由规范：
 * - POST   /api/v1/admins        - 创建管理员（超级管理员）
 * - GET    /api/v1/admins        - 获取管理员列表
 * - GET    /api/v1/admins/:id    - 获取管理员详情
 * - PUT    /api/v1/admins/:id    - 更新管理员信息（超级管理员）
 * - DELETE /api/v1/admins/:id    - 删除管理员（超级管理员）
 * - POST   /api/v1/admins/login  - 管理员登录（公开）
 * - POST   /api/v1/admins/:id/assign-user - 分配用户到管理员
 */
@Controller('api/v1/admins')
export class AdminV2Controller {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 管理员登录
   * POST /api/v1/admins/login
   * 
   * @public 无需认证
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: AdminLoginDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    const result = await this.adminService.login(dto, ip);
    
    return ResponseBuilder.success(result, '登录成功');
  }

  /**
   * 创建管理员
   * POST /api/v1/admins
   * 
   * @requires 超级管理员权限
   */
  @Post()
  @UseGuards(AdminGuard, SuperAdminGuard)
  async create(@Body() dto: CreateAdminDto, @Req() req: Request) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;

    // 创建管理员
    const result = await this.adminService.createAdmin(dto);

    // 记录操作日志
    await this.adminService.logAdminAction(
      adminId,
      '管理员管理',
      `创建管理员: ${dto.username}`,
      'Admin',
      result.id,
      ip,
    );

    return ResponseBuilder.success(result, '创建成功');
  }

  /**
   * 获取管理员列表（分页）
   * GET /api/v1/admins?page=1&pageSize=20&keyword=xxx
   * 
   * @requires 管理员权限
   */
  @Get()
  @UseGuards(AdminGuard)
  async list(@Query() dto: AdminListDto, @Req() req: Request) {
    const adminGroup = (req as any).user?.adminGroup ?? 0;
    
    const result = await this.adminService.getAdminList(dto, adminGroup);

    // 如果 service 返回的是 { items, total } 格式
    if (result && typeof result === 'object' && 'items' in result && 'total' in result) {
      const data = result as { items: any[]; total: number };
      return ResponseBuilder.paginated(
        data.items,
        data.total,
        dto.page || 1,
        dto.pageSize || 20,
      );
    }

    // 如果是旧格式 { code, data: { list, total } }
    if (result && typeof result === 'object' && 'data' in result) {
      const data = (result as any).data;
      if (data && 'list' in data && 'total' in data) {
        return ResponseBuilder.paginated(
          data.list,
          data.total,
          dto.page || 1,
          dto.pageSize || 20,
        );
      }
    }

    // 兜底：直接返回，让 TransformInterceptor 处理
    return result;
  }

  /**
   * 获取管理员详情
   * GET /api/v1/admins/:id
   * 
   * @requires 管理员权限
   */
  @Get(':id')
  @UseGuards(AdminGuard)
  async getById(@Param('id', ParseIntPipe) id: number) {
    const admin = await this.adminService.getAdminById(id);

    if (!admin) {
      throw BusinessException.adminNotFound();
    }

    return ResponseBuilder.success(admin);
  }

  /**
   * 更新管理员信息
   * PUT /api/v1/admins/:id
   * 
   * @requires 超级管理员权限
   */
  @Put(':id')
  @UseGuards(AdminGuard, SuperAdminGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminDto,
    @Req() req: Request,
  ) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;

    // 更新管理员
    const result = await this.adminService.updateAdmin(id, dto);

    // 记录操作日志
    await this.adminService.logAdminAction(
      adminId,
      '管理员管理',
      `更新管理员: ${id}`,
      'Admin',
      id,
      ip,
    );

    return ResponseBuilder.success(result, '更新成功');
  }

  /**
   * 删除管理员
   * DELETE /api/v1/admins/:id
   * 
   * @requires 超级管理员权限
   */
  @Delete(':id')
  @UseGuards(AdminGuard, SuperAdminGuard)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const adminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;

    // 删除管理员
    const result = await this.adminService.deleteAdmin(id);

    // 记录操作日志
    await this.adminService.logAdminAction(
      adminId,
      '管理员管理',
      `删除管理员: ${id}`,
      'Admin',
      id,
      ip,
    );

    return ResponseBuilder.success(result, '删除成功');
  }

  /**
   * 分配用户到管理员
   * POST /api/v1/admins/:id/assign-user
   * 
   * @requires 管理员权限
   */
  @Post(':id/assign-user')
  @UseGuards(AdminGuard)
  async assignUser(
    @Param('id', ParseIntPipe) adminId: number,
    @Body() dto: AssignUserDto,
    @Req() req: Request,
  ) {
    const currentAdminId = (req as any).user?.sub || (req as any).user?.uid;
    const ip = req.ip || req.socket.remoteAddress;

    await this.adminService.assignUserToAdmin(
      dto.userId,
      dto.assignedAdminId ?? null,
      currentAdminId,
      ip,
    );

    return ResponseBuilder.success(null, '分配成功');
  }
}
