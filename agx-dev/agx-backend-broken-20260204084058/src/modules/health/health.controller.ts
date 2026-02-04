import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * 健康检查接口
   * GET /health
   */
  @Get()
  async check() {
    return await this.healthService.getHealth();
  }

  /**
   * 系统信息接口
   * GET /health/info
   */
  @Get('info')
  async info() {
    return await this.healthService.getSystemInfo();
  }
}
