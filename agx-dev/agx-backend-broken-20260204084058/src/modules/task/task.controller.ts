import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { JwtAuthGuard, AdminGuard } from '../auth/jwt-auth.guard';

@Controller('api')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * 获取新手任务列表
   */
  @Get('task/list')
  @UseGuards(JwtAuthGuard)
  async getTaskList(@Request() req) {
    const data = await this.taskService.getTaskList(req.user.id);
    return { code: 0, data };
  }

  /**
   * 完成任务（手动触发型）
   */
  @Post('task/complete/:taskKey')
  @UseGuards(JwtAuthGuard)
  async completeTask(@Request() req, @Param('taskKey') taskKey: string) {
    const data = await this.taskService.completeTask(req.user.id, taskKey);
    return { code: 0, data };
  }

  /**
   * 领取单个任务奖励
   */
  @Post('task/claim/:taskKey')
  @UseGuards(JwtAuthGuard)
  async claimReward(@Request() req, @Param('taskKey') taskKey: string) {
    const data = await this.taskService.claimReward(req.user.id, taskKey);
    return { code: 0, data };
  }

  /**
   * 一键领取所有奖励
   */
  @Post('task/claim-all')
  @UseGuards(JwtAuthGuard)
  async claimAllRewards(@Request() req) {
    const data = await this.taskService.claimAllRewards(req.user.id);
    return { code: 0, data };
  }

  // ===== 后台管理接口 =====

  /**
   * 后台获取任务配置
   */
  @Get('admin/task/rewards')
  @UseGuards(AdminGuard)
  async getAdminTaskList() {
    const tasks = await this.taskService.getAdminTaskList();
    // 转换为后台需要的格式
    const data = tasks.map(t => ({
      step: t.step,
      taskKey: t.taskKey,
      name: t.name,
      description: t.description,
      agxReward: parseFloat(t.agxReward || '0'),
      usdtReward: parseFloat(t.usdtReward || '0'),
      enabled: t.isEnabled,
    }));
    return { code: 0, data };
  }

  /**
   * 后台更新任务配置
   */
  @Put('admin/task/rewards')
  @UseGuards(AdminGuard)
  async updateAdminTasks(@Body() body: { tasks: any[] }) {
    await this.taskService.updateAdminTasks(body.tasks);
    return { code: 0, message: '保存成功' };
  }
}
