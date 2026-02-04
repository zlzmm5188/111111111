import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';
import { HedraService, VIDEO_SCRIPTS } from './hedra.service';

@ApiTags('Hedra视频生成')
@Controller('hedra')
export class HedraController {
  constructor(private readonly hedraService: HedraService) {}

  @Get('scripts')
  @ApiOperation({ summary: '获取所有视频脚本' })
  getScripts() {
    return {
      success: true,
      data: VIDEO_SCRIPTS
    };
  }

  @Get('scripts/:member')
  @ApiOperation({ summary: '获取指定成员脚本' })
  getMemberScript(@Param('member') member: string) {
    const script = VIDEO_SCRIPTS[member];
    if (!script) {
      return { success: false, message: 'Member not found' };
    }
    return { success: true, data: script };
  }

  @Post('generate')
  @ApiOperation({ summary: '生成单个成员视频' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        member: { type: 'string', example: 'founder' },
        language: { type: 'string', example: 'zh', enum: ['zh', 'en'] }
      }
    }
  })
  async generateVideo(
    @Body('member') member: string,
    @Body('language') language: 'zh' | 'en' = 'zh'
  ) {
    try {
      const result = await this.hedraService.generateFullVideo(member, language);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('generate-all')
  @ApiOperation({ summary: '批量生成所有成员视频' })
  @ApiQuery({ name: 'language', required: false, enum: ['zh', 'en'] })
  async generateAllVideos(@Query('language') language: 'zh' | 'en' = 'zh') {
    try {
      const results = await this.hedraService.generateAllVideos(language);
      return { success: true, data: results };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Get('status/:jobId')
  @ApiOperation({ summary: '获取视频生成状态' })
  async getVideoStatus(@Param('jobId') jobId: string) {
    try {
      const result = await this.hedraService.getVideoStatus(jobId);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Get('assets')
  @ApiOperation({ summary: '获取Hedra公开资产' })
  async getAssets() {
    try {
      const result = await this.hedraService.getPublicAssets();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
