import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { AdminRole } from '../../entities/admin-role.entity';
import { SystemMenu } from '../../entities/system-menu.entity';
import { AdminAuthGuard } from '../auth/admin-auth.guard';

@Controller('system/role')
@UseGuards(AdminAuthGuard)
export class SystemRoleController {
  constructor(
    @InjectRepository(AdminRole)
    private readonly roleRepo: Repository<AdminRole>,
    @InjectRepository(SystemMenu)
    private readonly menuRepo: Repository<SystemMenu>,
  ) {}

  /**
   * 获取角色分页列表
   * GET /system/role/index
   */
  @Get('index')
  async index(@Query() query: any) {
    const { page = 1, pageSize = 10, name, status } = query;
    const where: any = {};
    if (name) where.name = Like(`%${name}%`);
    if (status !== undefined) where.status = status;

    const [list, total] = await this.roleRepo.findAndCount({
      where,
      order: { sort: 'ASC', id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      code: 200,
      success: true,
      data: {
        items: list,
        pageInfo: { total, currentPage: +page, pageSize: +pageSize },
      },
    };
  }

  /**
   * 获取角色列表（无分页）
   * GET /system/role/list
   */
  @Get('list')
  async list(@Query() query: any) {
    const where: any = { status: 1 };
    const list = await this.roleRepo.find({ where, order: { sort: 'ASC' } });
    return { code: 200, success: true, data: list };
  }

  /**
   * 通过角色获取菜单
   * GET /system/role/getMenuByRole/:id
   */
  @Get('getMenuByRole/:id')
  async getMenuByRole(@Param('id') id: number) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) {
      return { code: 404, success: false, message: '角色不存在' };
    }
    const menuIds = role.menuIds ? JSON.parse(role.menuIds) : [];
    return { code: 200, success: true, data: menuIds };
  }

  /**
   * 获取回收站角色
   * GET /system/role/recycle
   */
  @Get('recycle')
  async recycle(@Query() query: any) {
    const { page = 1, pageSize = 10 } = query;
    const [list, total] = await this.roleRepo.findAndCount({
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
   * 添加角色
   * POST /system/role/save
   */
  @Post('save')
  async save(@Body() body: any) {
    const { name, code, sort, status, remark } = body;
    
    const exists = await this.roleRepo.findOne({ where: { name } });
    if (exists) {
      return { code: 400, success: false, message: '角色名已存在' };
    }

    const role = this.roleRepo.create({
      name,
      code,
      sort: sort ?? 0,
      status: status ?? 1,
      remark,
    });
    await this.roleRepo.save(role);

    return { code: 200, success: true, message: '创建成功', data: { id: role.id } };
  }

  /**
   * 更新角色
   * PUT /system/role/update/:id
   */
  @Put('update/:id')
  async update(@Param('id') id: number, @Body() body: any) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) {
      return { code: 404, success: false, message: '角色不存在' };
    }

    const { name, code, sort, status, remark } = body;
    if (name !== undefined) role.name = name;
    if (code !== undefined) role.code = code;
    if (sort !== undefined) role.sort = sort;
    if (status !== undefined) role.status = status;
    if (remark !== undefined) role.remark = remark;

    await this.roleRepo.save(role);
    return { code: 200, success: true, message: '更新成功' };
  }

  /**
   * 删除角色（移到回收站）
   * DELETE /system/role/delete
   */
  @Delete('delete')
  async delete(@Body() body: any) {
    const { ids } = body;
    await this.roleRepo.update(ids, { status: -1 });
    return { code: 200, success: true, message: '删除成功' };
  }

  /**
   * 恢复角色
   * PUT /system/role/recovery
   */
  @Put('recovery')
  async recovery(@Body() body: any) {
    const { ids } = body;
    await this.roleRepo.update(ids, { status: 1 });
    return { code: 200, success: true, message: '恢复成功' };
  }

  /**
   * 真实删除
   * DELETE /system/role/realDelete
   */
  @Delete('realDelete')
  async realDelete(@Body() body: any) {
    const { ids } = body;
    await this.roleRepo.delete(ids);
    return { code: 200, success: true, message: '删除成功' };
  }

  /**
   * 更新菜单权限
   * PUT /system/role/menuPermission/:id
   */
  @Put('menuPermission/:id')
  async menuPermission(@Param('id') id: number, @Body() body: any) {
    const { menuIds } = body;
    await this.roleRepo.update(id, { menuIds: JSON.stringify(menuIds) });
    return { code: 200, success: true, message: '权限更新成功' };
  }

  /**
   * 更改角色状态
   * PUT /system/role/changeStatus
   */
  @Put('changeStatus')
  async changeStatus(@Body() body: any) {
    const { id, status } = body;
    await this.roleRepo.update(id, { status });
    return { code: 200, success: true, message: '状态更新成功' };
  }
}
