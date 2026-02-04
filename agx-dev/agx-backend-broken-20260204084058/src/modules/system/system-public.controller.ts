import { Controller, Get, Query } from '@nestjs/common';
import { SystemService } from './system.service';

/**
 * 系统公开接口 (无需登录)
 * 提供功能开关、公告等给前台H5使用
 */
@Controller('api/system')
export class SystemPublicController {
  constructor(private readonly systemService: SystemService) {}

  /**
   * 获取功能开关列表
   * 前台用于判断哪些功能可用
   */
  @Get('toggles')
  async getToggles(@Query('module') module?: string) {
    return this.systemService.getToggles(module);
  }

  /**
   * 获取系统配置 (公开部分)
   * 不返回敏感配置
   */
  @Get('configs')
  async getConfigs(@Query('group') group?: string) {
    return this.systemService.getPublicConfigs(group);
  }

  /**
   * 获取平台基础信息
   */
  @Get('platform-info')
  async getPlatformInfo() {
    return this.systemService.getPlatformInfo();
  }

  /**
   * 获取公告列表
   */
  @Get('announcements')
  async getAnnouncements() {
    return this.systemService.getAnnouncements();
  }
}
