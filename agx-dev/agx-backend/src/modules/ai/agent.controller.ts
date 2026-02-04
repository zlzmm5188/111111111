import { Controller, Post, Get, Body, Param, Query, Logger } from '@nestjs/common';
import { AgentService, AgentTask } from './agent.service';

class CreateTaskDto {
  task: string;
  autoRun?: boolean;
}

@Controller('api/agent')
export class AgentController {
  private readonly logger = new Logger(AgentController.name);

  constructor(private readonly agentService: AgentService) {}

  /**
   * 创建并执行任务
   * 
   * @example
   * POST /api/agent/task
   * {
   *   "task": "在 h5/src/views 目录下创建一个新的 Test.vue 组件",
   *   "autoRun": true
   * }
   */
  @Post('task')
  async createTask(@Body() dto: CreateTaskDto): Promise<AgentTask> {
    const task = this.agentService.createTask(dto.task);
    
    if (dto.autoRun !== false) {
      // 异步执行，立即返回任务 ID
      this.agentService.executeTask(task.id).catch(err => {
        this.logger.error(`Task ${task.id} execution error:`, err);
      });
    }

    return task;
  }

  /**
   * 执行已创建的任务
   */
  @Post('task/:id/run')
  async runTask(@Param('id') taskId: string): Promise<AgentTask> {
    return this.agentService.executeTask(taskId);
  }

  /**
   * 获取任务状态
   */
  @Get('task/:id')
  getTask(@Param('id') taskId: string): AgentTask | { error: string } {
    const task = this.agentService.getTask(taskId);
    if (!task) {
      return { error: 'Task not found' };
    }
    return task;
  }

  /**
   * 获取所有任务
   */
  @Get('tasks')
  getAllTasks(@Query('limit') limit?: string): AgentTask[] {
    const tasks = this.agentService.getAllTasks();
    const limitNum = parseInt(limit || '20', 10);
    return tasks.slice(0, limitNum);
  }

  /**
   * 同步执行任务（等待完成后返回）
   */
  @Post('task/sync')
  async createAndRunTask(@Body() dto: CreateTaskDto): Promise<AgentTask> {
    const task = this.agentService.createTask(dto.task);
    return this.agentService.executeTask(task.id);
  }
}
