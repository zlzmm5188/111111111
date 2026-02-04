import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { SystemDictType, SystemDictData } from '../../entities/system-dict.entity';
import { AdminAuthGuard } from '../auth/admin-auth.guard';

@Controller('system')
@UseGuards(AdminAuthGuard)
export class SystemDictController {
  constructor(
    @InjectRepository(SystemDictType)
    private readonly dictTypeRepo: Repository<SystemDictType>,
    @InjectRepository(SystemDictData)
    private readonly dictDataRepo: Repository<SystemDictData>,
  ) {}

  // ========== 字典类型 ==========

  /**
   * 获取字典类型列表
   * GET /system/dictType/index
   */
  @Get('dictType/index')
  async dictTypeIndex(@Query() query: any) {
    const { page = 1, pageSize = 10, name, code, status } = query;
    const where: any = {};
    if (name) where.name = Like(`%${name}%`);
    if (code) where.code = Like(`%${code}%`);
    if (status !== undefined) where.status = status;

    const [list, total] = await this.dictTypeRepo.findAndCount({
      where,
      order: { id: 'DESC' },
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
   * 获取字典类型列表（无分页）
   * GET /system/dictType/list
   */
  @Get('dictType/list')
  async dictTypeList() {
    const list = await this.dictTypeRepo.find({
      where: { status: 1 },
      order: { id: 'DESC' },
    });
    return { code: 200, success: true, data: list };
  }

  /**
   * 添加字典类型
   * POST /system/dictType/save
   */
  @Post('dictType/save')
  async dictTypeSave(@Body() body: any) {
    const { name, code, status, remark } = body;
    
    const exists = await this.dictTypeRepo.findOne({ where: { code } });
    if (exists) {
      return { code: 400, success: false, message: '字典编码已存在' };
    }

    const dictType = this.dictTypeRepo.create({ name, code, status: status ?? 1, remark });
    await this.dictTypeRepo.save(dictType);

    return { code: 200, success: true, message: '创建成功', data: { id: dictType.id } };
  }

  /**
   * 更新字典类型
   * PUT /system/dictType/update/:id
   */
  @Put('dictType/update/:id')
  async dictTypeUpdate(@Param('id') id: number, @Body() body: any) {
    const dictType = await this.dictTypeRepo.findOne({ where: { id } });
    if (!dictType) {
      return { code: 404, success: false, message: '字典类型不存在' };
    }

    Object.assign(dictType, body);
    await this.dictTypeRepo.save(dictType);
    return { code: 200, success: true, message: '更新成功' };
  }

  /**
   * 删除字典类型
   * DELETE /system/dictType/delete
   */
  @Delete('dictType/delete')
  async dictTypeDelete(@Body() body: any) {
    const { ids } = body;
    await this.dictTypeRepo.delete(ids);
    return { code: 200, success: true, message: '删除成功' };
  }

  /**
   * 更改字典类型状态
   * PUT /system/dictType/changeStatus
   */
  @Put('dictType/changeStatus')
  async dictTypeChangeStatus(@Body() body: any) {
    const { id, status } = body;
    await this.dictTypeRepo.update(id, { status });
    return { code: 200, success: true, message: '状态更新成功' };
  }

  // ========== 字典数据 ==========

  /**
   * 快捷查询字典
   * GET /system/dataDict/list?code=xxx
   */
  @Get('dataDict/list')
  async dataDictList(@Query('code') code: string) {
    const list = await this.dictDataRepo.find({
      where: { typeCode: code, status: 1 },
      order: { sort: 'ASC' },
    });
    return { code: 200, success: true, data: list };
  }

  /**
   * 快捷查询多个字典
   * GET /system/dataDict/lists?codes=xxx,yyy
   */
  @Get('dataDict/lists')
  async dataDictLists(@Query('codes') codes: string) {
    const codeList = codes.split(',');
    const result: Record<string, any[]> = {};
    
    for (const code of codeList) {
      const list = await this.dictDataRepo.find({
        where: { typeCode: code, status: 1 },
        order: { sort: 'ASC' },
      });
      result[code] = list;
    }
    
    return { code: 200, success: true, data: result };
  }

  /**
   * 获取字典数据分页列表
   * GET /system/dataDict/index
   */
  @Get('dataDict/index')
  async dataDictIndex(@Query() query: any) {
    const { page = 1, pageSize = 10, typeCode, label, status } = query;
    const where: any = {};
    if (typeCode) where.typeCode = typeCode;
    if (label) where.label = Like(`%${label}%`);
    if (status !== undefined) where.status = status;

    const [list, total] = await this.dictDataRepo.findAndCount({
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
   * 添加字典数据
   * POST /system/dataDict/save
   */
  @Post('dataDict/save')
  async dataDictSave(@Body() body: any) {
    const { typeCode, label, value, sort, status, remark } = body;

    const dictData = this.dictDataRepo.create({
      typeCode,
      label,
      value,
      sort: sort ?? 0,
      status: status ?? 1,
      remark,
    });
    await this.dictDataRepo.save(dictData);

    return { code: 200, success: true, message: '创建成功', data: { id: dictData.id } };
  }

  /**
   * 更新字典数据
   * PUT /system/dataDict/update/:id
   */
  @Put('dataDict/update/:id')
  async dataDictUpdate(@Param('id') id: number, @Body() body: any) {
    const dictData = await this.dictDataRepo.findOne({ where: { id } });
    if (!dictData) {
      return { code: 404, success: false, message: '字典数据不存在' };
    }

    Object.assign(dictData, body);
    await this.dictDataRepo.save(dictData);
    return { code: 200, success: true, message: '更新成功' };
  }

  /**
   * 删除字典数据
   * DELETE /system/dataDict/delete
   */
  @Delete('dataDict/delete')
  async dataDictDelete(@Body() body: any) {
    const { ids } = body;
    await this.dictDataRepo.delete(ids);
    return { code: 200, success: true, message: '删除成功' };
  }

  /**
   * 更改字典数据状态
   * PUT /system/dataDict/changeStatus
   */
  @Put('dataDict/changeStatus')
  async dataDictChangeStatus(@Body() body: any) {
    const { id, status } = body;
    await this.dictDataRepo.update(id, { status });
    return { code: 200, success: true, message: '状态更新成功' };
  }
}
