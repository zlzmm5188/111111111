import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull } from 'typeorm';
import { SystemMenu } from '../../entities/system-menu.entity';
import { AdminAuthGuard } from '../auth/admin-auth.guard';

@Controller('system/menu')
@UseGuards(AdminAuthGuard)
export class SystemMenuController {
  constructor(
    @InjectRepository(SystemMenu)
    private readonly menuRepo: Repository<SystemMenu>,
  ) {}

  /**
   * 获取菜单树
   * GET /system/menu/index
   */
  @Get('index')
  async index(@Query() query: any) {
    const { status } = query;
    const where: any = {};
    if (status !== undefined) where.status = status;

    const list = await this.menuRepo.find({
      where,
      order: { sort: 'ASC', id: 'ASC' },
    });

    // 构建树形结构
    const tree = this.buildTree(list, 0);
    return { code: 200, success: true, data: tree };
  }

  /**
   * 获取菜单选择树
   * GET /system/menu/tree
   */
  @Get('tree')
  async tree(@Query() query: any) {
    const list = await this.menuRepo.find({
      where: { status: 1 },
      order: { sort: 'ASC', id: 'ASC' },
    });

    const tree = this.buildTree(list, 0);
    return { code: 200, success: true, data: tree };
  }

  /**
   * 获取回收站菜单
   * GET /system/menu/recycle
   */
  @Get('recycle')
  async recycle(@Query() query: any) {
    const list = await this.menuRepo.find({
      where: { status: -1 },
      order: { id: 'DESC' },
    });

    return { code: 200, success: true, data: list };
  }

  /**
   * 添加菜单
   * POST /system/menu/save
   */
  @Post('save')
  async save(@Body() body: any) {
    const { parentId, name, code, icon, route, component, permission, type, isShow, isCache, sort, remark } = body;

    const menu = this.menuRepo.create({
      parentId: parentId ?? 0,
      name,
      code,
      icon,
      route,
      component,
      permission,
      type: type ?? 1,
      isShow: isShow ?? 1,
      isCache: isCache ?? 0,
      sort: sort ?? 0,
      status: 1,
      remark,
    });
    await this.menuRepo.save(menu);

    return { code: 200, success: true, message: '创建成功', data: { id: menu.id } };
  }

  /**
   * 更新菜单
   * PUT /system/menu/update/:id
   */
  @Put('update/:id')
  async update(@Param('id') id: number, @Body() body: any) {
    const menu = await this.menuRepo.findOne({ where: { id } });
    if (!menu) {
      return { code: 404, success: false, message: '菜单不存在' };
    }

    Object.assign(menu, body);
    await this.menuRepo.save(menu);
    return { code: 200, success: true, message: '更新成功' };
  }

  /**
   * 删除菜单（移到回收站）
   * DELETE /system/menu/delete
   */
  @Delete('delete')
  async delete(@Body() body: any) {
    const { ids } = body;
    await this.menuRepo.update(ids, { status: -1 });
    return { code: 200, success: true, message: '删除成功' };
  }

  /**
   * 恢复菜单
   * PUT /system/menu/recovery
   */
  @Put('recovery')
  async recovery(@Body() body: any) {
    const { ids } = body;
    await this.menuRepo.update(ids, { status: 1 });
    return { code: 200, success: true, message: '恢复成功' };
  }

  /**
   * 真实删除
   * DELETE /system/menu/realDelete
   */
  @Delete('realDelete')
  async realDelete(@Body() body: any) {
    const { ids } = body;
    await this.menuRepo.delete(ids);
    return { code: 200, success: true, message: '删除成功' };
  }

  /**
   * 更改菜单状态
   * PUT /system/menu/changeStatus
   */
  @Put('changeStatus')
  async changeStatus(@Body() body: any) {
    const { id, status } = body;
    await this.menuRepo.update(id, { status });
    return { code: 200, success: true, message: '状态更新成功' };
  }

  // 构建树形结构
  private buildTree(list: SystemMenu[], parentId: number): any[] {
    return list
      .filter(item => item.parentId === parentId)
      .map(item => ({
        ...item,
        children: this.buildTree(list, item.id),
      }));
  }
}
