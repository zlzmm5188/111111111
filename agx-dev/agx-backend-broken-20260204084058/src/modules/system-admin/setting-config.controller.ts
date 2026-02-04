import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { SystemConfig, SystemConfigGroup } from '../../entities/system-config.entity';
import { AdminAuthGuard } from '../auth/admin-auth.guard';

@Controller('setting')
@UseGuards(AdminAuthGuard)
export class SettingConfigController {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepo: Repository<SystemConfig>,
    @InjectRepository(SystemConfigGroup)
    private readonly configGroupRepo: Repository<SystemConfigGroup>,
  ) {}

  // ========== 配置管理 ==========

  /**
   * 获取配置列表
   * GET /setting/config/index
   */
  @Get('config/index')
  async configIndex(@Query() query: any) {
    const { page = 1, pageSize = 10, groupCode, name, key } = query;
    const where: any = {};
    if (groupCode) where.groupCode = groupCode;
    if (name) where.name = Like(`%${name}%`);
    if (key) where.key = Like(`%${key}%`);

    const [list, total] = await this.configRepo.findAndCount({
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
   * 保存配置
   * POST /setting/config/save
   */
  @Post('config/save')
  async configSave(@Body() body: any) {
    const { groupCode, name, key, value, inputType, options, sort, remark } = body;
    
    const exists = await this.configRepo.findOne({ where: { key } });
    if (exists) {
      return { code: 400, success: false, message: '配置键已存在' };
    }

    const config = this.configRepo.create({
      groupCode,
      name,
      key,
      value,
      inputType: inputType ?? 'input',
      options,
      sort: sort ?? 0,
      remark,
    });
    await this.configRepo.save(config);

    return { code: 200, success: true, message: '创建成功', data: { id: config.id } };
  }

  /**
   * 更新配置
   * POST /setting/config/update
   */
  @Post('config/update')
  async configUpdate(@Body() body: any) {
    const { id, ...data } = body;
    const config = await this.configRepo.findOne({ where: { id } });
    if (!config) {
      return { code: 404, success: false, message: '配置不存在' };
    }

    Object.assign(config, data);
    await this.configRepo.save(config);
    return { code: 200, success: true, message: '更新成功' };
  }

  /**
   * 按keys批量更新配置
   * POST /setting/config/updateByKeys
   */
  @Post('config/updateByKeys')
  async configUpdateByKeys(@Body() body: any) {
    const { configs } = body; // { key1: value1, key2: value2 }
    
    for (const [key, value] of Object.entries(configs)) {
      await this.configRepo.update({ key }, { value: String(value) });
    }
    
    return { code: 200, success: true, message: '更新成功' };
  }

  /**
   * 删除配置
   * DELETE /setting/config/delete
   */
  @Delete('config/delete')
  async configDelete(@Body() body: any) {
    const { ids } = body;
    await this.configRepo.delete(ids);
    return { code: 200, success: true, message: '删除成功' };
  }

  // ========== 配置组管理 ==========

  /**
   * 获取配置组列表
   * GET /setting/configGroup/index
   */
  @Get('configGroup/index')
  async configGroupIndex(@Query() query: any) {
    const { page = 1, pageSize = 10, name } = query;
    const where: any = {};
    if (name) where.name = Like(`%${name}%`);

    const [list, total] = await this.configGroupRepo.findAndCount({
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
   * 保存配置组
   * POST /setting/configGroup/save
   */
  @Post('configGroup/save')
  async configGroupSave(@Body() body: any) {
    const { name, code, sort, remark } = body;
    
    const exists = await this.configGroupRepo.findOne({ where: { code } });
    if (exists) {
      return { code: 400, success: false, message: '分组编码已存在' };
    }

    const group = this.configGroupRepo.create({
      name,
      code,
      sort: sort ?? 0,
      remark,
    });
    await this.configGroupRepo.save(group);

    return { code: 200, success: true, message: '创建成功', data: { id: group.id } };
  }

  /**
   * 更新配置组
   * POST /setting/configGroup/update
   */
  @Post('configGroup/update')
  async configGroupUpdate(@Body() body: any) {
    const { id, ...data } = body;
    const group = await this.configGroupRepo.findOne({ where: { id } });
    if (!group) {
      return { code: 404, success: false, message: '配置组不存在' };
    }

    Object.assign(group, data);
    await this.configGroupRepo.save(group);
    return { code: 200, success: true, message: '更新成功' };
  }

  /**
   * 删除配置组
   * DELETE /setting/configGroup/delete
   */
  @Delete('configGroup/delete')
  async configGroupDelete(@Body() body: any) {
    const { ids } = body;
    await this.configGroupRepo.delete(ids);
    return { code: 200, success: true, message: '删除成功' };
  }
}
