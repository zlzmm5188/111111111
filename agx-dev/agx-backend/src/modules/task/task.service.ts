import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NewcomerTask, UserTask, User, Wallet } from '../../entities';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(NewcomerTask)
    private readonly taskRepo: Repository<NewcomerTask>,
    @InjectRepository(UserTask)
    private readonly userTaskRepo: Repository<UserTask>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 获取任务列表（含用户完成状态）
   */
  async getTaskList(userId: number) {
    // 获取所有启用的任务
    const tasks = await this.taskRepo.find({
      where: { isEnabled: 1 },
      order: { step: 'ASC' },
    });

    // 获取用户信息
    const user = await this.userRepo.findOne({ where: { id: userId } });

    // 获取用户任务记录
    const userTasks = await this.userTaskRepo.find({
      where: { userId },
    });
    const userTaskMap = new Map(userTasks.map(ut => [ut.taskKey, ut]));

    // 组装返回数据
    const result = tasks.map(task => {
      const userTask = userTaskMap.get(task.taskKey);
      let status = userTask?.status || 0;

      // 自动检测任务完成状态
      if (status === 0) {
        if (task.taskKey === 'kyc' && user?.kycStatus === 2) {
          status = 1; // 已完成待领取
        } else if (task.taskKey === 'bindAddress' && user?.tronAddress) {
          status = 1; // 已完成待领取
        }
      }

      return {
        taskKey: task.taskKey,
        step: task.step,
        name: task.name,
        nameEn: task.nameEn,
        description: task.description,
        descriptionEn: task.descriptionEn,
        agxReward: task.agxReward,
        usdtReward: task.usdtReward,
        icon: task.icon,
        jumpUrl: task.jumpUrl,
        status, // 0待完成 1已完成待领取 2已领取
        completedAt: userTask?.completedAt,
        claimedAt: userTask?.claimedAt,
      };
    });

    // 计算统计
    const totalAgx = tasks.reduce((sum, t) => sum + parseFloat(t.agxReward || '0'), 0);
    const totalUsdt = tasks.reduce((sum, t) => sum + parseFloat(t.usdtReward || '0'), 0);
    const completedCount = result.filter(t => t.status >= 1).length;
    const claimedCount = result.filter(t => t.status === 2).length;

    return {
      tasks: result,
      summary: {
        totalAgx,
        totalUsdt,
        totalTasks: tasks.length,
        completedCount,
        claimedCount,
        progress: tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0,
      },
    };
  }

  /**
   * 完成任务（手动触发型任务）
   */
  async completeTask(userId: number, taskKey: string) {
    // 检查任务是否存在
    const task = await this.taskRepo.findOne({ where: { taskKey, isEnabled: 1 } });
    if (!task) {
      throw new BadRequestException('任务不存在');
    }

    // 检查用户是否已完成
    let userTask = await this.userTaskRepo.findOne({ where: { userId, taskKey } });
    if (userTask && userTask.status >= 1) {
      throw new BadRequestException('任务已完成');
    }

    // 只有手动触发型任务可以通过此接口完成
    if (!['readWhitepaper', 'shareInvite'].includes(taskKey)) {
      throw new BadRequestException('该任务需要自动检测完成');
    }

    // 创建或更新用户任务记录
    if (!userTask) {
      userTask = this.userTaskRepo.create({
        userId,
        taskKey,
        status: 1,
        completedAt: new Date(),
        agxReward: task.agxReward,
        usdtReward: task.usdtReward,
      });
    } else {
      userTask.status = 1;
      userTask.completedAt = new Date();
      userTask.agxReward = task.agxReward;
      userTask.usdtReward = task.usdtReward;
    }

    await this.userTaskRepo.save(userTask);

    return { success: true, message: '任务完成' };
  }

  /**
   * 领取单个任务奖励
   */
  async claimReward(userId: number, taskKey: string) {
    // 检查任务是否存在
    const task = await this.taskRepo.findOne({ where: { taskKey, isEnabled: 1 } });
    if (!task) {
      throw new BadRequestException('任务不存在');
    }

    // 检查用户任务状态
    let userTask = await this.userTaskRepo.findOne({ where: { userId, taskKey } });
    
    // 如果没有记录，检查自动任务是否已完成
    if (!userTask) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      let autoCompleted = false;
      
      if (taskKey === 'kyc' && user?.kycStatus === 2) {
        autoCompleted = true;
      } else if (taskKey === 'bindAddress' && user?.tronAddress) {
        autoCompleted = true;
      }

      if (autoCompleted) {
        userTask = this.userTaskRepo.create({
          userId,
          taskKey,
          status: 1,
          completedAt: new Date(),
          agxReward: task.agxReward,
          usdtReward: task.usdtReward,
        });
        await this.userTaskRepo.save(userTask);
      } else {
        throw new BadRequestException('任务尚未完成');
      }
    }

    if (userTask.status === 0) {
      throw new BadRequestException('任务尚未完成');
    }

    if (userTask.status === 2) {
      throw new BadRequestException('奖励已领取');
    }

    // 使用事务发放奖励
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // AGX coinId = 1, USDT coinId = 2
    const AGX_COIN_ID = 1;
    const USDT_COIN_ID = 2;

    try {
      // 发放AGX奖励
      const agxAmount = parseFloat(task.agxReward || '0');
      if (agxAmount > 0) {
        // 检查钱包是否存在
        const agxWallet = await queryRunner.manager.findOne(Wallet, {
          where: { userId, coinId: AGX_COIN_ID },
        });
        if (agxWallet) {
          // 更新余额
          await queryRunner.manager.increment(
            Wallet,
            { userId, coinId: AGX_COIN_ID },
            'balance',
            agxAmount,
          );
        } else {
          // 创建钱包
          await queryRunner.manager.insert(Wallet, {
            userId,
            coinId: AGX_COIN_ID,
            balance: agxAmount.toString(),
            frozen: '0',
          });
        }
      }

      // 发放USDT奖励
      const usdtAmount = parseFloat(task.usdtReward || '0');
      if (usdtAmount > 0) {
        // 检查钱包是否存在
        const usdtWallet = await queryRunner.manager.findOne(Wallet, {
          where: { userId, coinId: USDT_COIN_ID },
        });
        if (usdtWallet) {
          // 更新余额
          await queryRunner.manager.increment(
            Wallet,
            { userId, coinId: USDT_COIN_ID },
            'balance',
            usdtAmount,
          );
        } else {
          // 创建钱包
          await queryRunner.manager.insert(Wallet, {
            userId,
            coinId: USDT_COIN_ID,
            balance: usdtAmount.toString(),
            frozen: '0',
          });
        }
      }

      // 更新任务状态为已领取
      await queryRunner.manager.update(UserTask, { id: userTask.id }, {
        status: 2,
        claimedAt: new Date(),
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    return {
      success: true,
      message: '领取成功',
      reward: {
        agx: task.agxReward,
        usdt: task.usdtReward,
      },
    };
  }

  /**
   * 一键领取所有已完成任务的奖励
   */
  async claimAllRewards(userId: number) {
    const { tasks } = await this.getTaskList(userId);
    
    // 筛选出已完成但未领取的任务
    const pendingTasks = tasks.filter(t => t.status === 1);
    
    if (pendingTasks.length === 0) {
      throw new BadRequestException('没有可领取的奖励');
    }

    let totalAgx = 0;
    let totalUsdt = 0;
    const claimedTasks: string[] = [];

    for (const task of pendingTasks) {
      try {
        await this.claimReward(userId, task.taskKey);
        totalAgx += parseFloat(task.agxReward || '0');
        totalUsdt += parseFloat(task.usdtReward || '0');
        claimedTasks.push(task.taskKey);
      } catch (error) {
        // 忽略单个任务领取失败
        console.error(`领取任务${task.taskKey}失败:`, error.message);
      }
    }

    return {
      success: true,
      message: `成功领取${claimedTasks.length}个任务奖励`,
      reward: {
        agx: totalAgx.toFixed(8),
        usdt: totalUsdt.toFixed(8),
      },
      claimedTasks,
    };
  }

  /**
   * 后台获取任务配置列表
   */
  async getAdminTaskList() {
    return this.taskRepo.find({ order: { step: 'ASC' } });
  }

  /**
   * 后台更新任务配置
   */
  async updateAdminTasks(tasks: any[]) {
    for (const task of tasks) {
      if (task.taskKey) {
        await this.taskRepo.update({ taskKey: task.taskKey }, {
          agxReward: task.agxReward,
          usdtReward: task.usdtReward,
          isEnabled: task.isEnabled !== undefined ? task.isEnabled : task.enabled,
        });
      }
    }
    return { success: true };
  }
}
