import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Admin } from '../../entities/admin.entity';
import { AdminRole } from '../../entities/admin-role.entity';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import * as bcrypt from 'bcrypt';

@Controller('system/user')
@UseGuards(AdminAuthGuard)
export class SystemUserController {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    @InjectRepository(AdminRole)
    private readonly roleRepo: Repository<AdminRole>,
  ) {}

  /**
   * 获取用户列表
   * GET /system/user/index
   */
  @Get('index')
  async index(@Query() query: any) {
    const { page = 1, pageSize = 10, username, status } = query;
    const where: any = {};
    if (username) where.username = Like(`%${username}%`);
    if (status !== undefined) where.status = status;

    const [list, total] = await this.adminRepo.findAndCount({
      where,
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      code: 200,
      success: true,
      message: 'ok',
      data: {
        items: list.map(u => ({
          id: u.id,
          username: u.username,
          nickname: u.nickname,
          role: u.role,
          status: u.status,
          lastLoginAt: u.lastLoginAt,
          lastLoginIp: u.lastLoginIp,
          createdAt: u.createdAt,
        })),
        pageInfo: { total, currentPage: +page, pageSize: +pageSize },
      },
    };
  }

  /**
   * 获取回收站用户
   * GET /system/user/recycle
   */
  @Get('recycle')
  async recycle(@Query() query: any) {
    const { page = 1, pageSize = 10 } = query;
    const [list, total] = await this.adminRepo.findAndCount({
      where: { status: -1 },
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      code: 200,
      success: true,
      data: { items: list, pageInfo: { total, currentPage: +page, pageSize: +pageSize } },
    };
  }

  /**
   * 读取单个用户
   * GET /system/user/read/:id
   */
  @Get('read/:id')
  async read(@Param('id') id: number) {
    const user = await this.adminRepo.findOne({ where: { id } });
    if (!user) {
      return { code: 404, success: false, message: '用户不存在' };
    }
    return { code: 200, success: true, data: user };
  }

  /**
   * 添加用户
   * POST /system/user/save
   */
  @Post('save')
  async save(@Body() body: any) {
    const { username, password, nickname, role, status } = body;
    
    const exists = await this.adminRepo.findOne({ where: { username } });
    if (exists) {
      return { code: 400, success: false, message: '用户名已存在' };
    }

    const passwordHash = await bcrypt.hash(password || '123456', 10);
    const user = this.adminRepo.create({
      username,
      passwordHash,
      nickname,
      role: role || 'admin',
      status: status ?? 1,
    });
    await this.adminRepo.save(user);

    return { code: 200, success: true, message: '创建成功', data: { id: user.id } };
  }

  /**
   * 更新用户
   * PUT /system/user/update/:id
   */
  @Put('update/:id')
  async update(@Param('id') id: number, @Body() body: any) {
    const user = await this.adminRepo.findOne({ where: { id } });
    if (!user) {
      return { code: 404, success: false, message: '用户不存在' };
    }

    const { nickname, role, status, password } = body;
    if (nickname !== undefined) user.nickname = nickname;
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    await this.adminRepo.save(user);
    return { code: 200, success: true, message: '更新成功' };
  }

  /**
   * 删除用户（移到回收站）
   * DELETE /system/user/delete
   */
  @Delete('delete')
  async delete(@Body() body: any) {
    const { ids } = body;
    await this.adminRepo.update(ids, { status: -1 });
    return { code: 200, success: true, message: '删除成功' };
  }

  /**
   * 恢复用户
   * PUT /system/user/recovery
   */
  @Put('recovery')
  async recovery(@Body() body: any) {
    const { ids } = body;
    await this.adminRepo.update(ids, { status: 1 });
    return { code: 200, success: true, message: '恢复成功' };
  }

  /**
   * 真实删除
   * DELETE /system/user/realDelete
   */
  @Delete('realDelete')
  async realDelete(@Body() body: any) {
    const { ids } = body;
    await this.adminRepo.delete(ids);
    return { code: 200, success: true, message: '删除成功' };
  }

  /**
   * 更改用户状态
   * PUT /system/user/changeStatus
   */
  @Put('changeStatus')
  async changeStatus(@Body() body: any) {
    const { id, status } = body;
    await this.adminRepo.update(id, { status });
    return { code: 200, success: true, message: '状态更新成功' };
  }

  /**
   * 初始化用户密码
   * PUT /system/user/initUserPassword
   */
  @Put('initUserPassword')
  async initUserPassword(@Body() body: any) {
    const { id } = body;
    const passwordHash = await bcrypt.hash('123456', 10);
    await this.adminRepo.update(id, { passwordHash });
    return { code: 200, success: true, message: '密码已重置为123456' };
  }
}
