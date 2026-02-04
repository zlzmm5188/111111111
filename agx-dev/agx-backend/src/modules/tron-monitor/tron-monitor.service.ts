import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Wallet, AssetLog, User, Coin, Recharge, Kyc } from '../../entities';
import { TelegramNotifyService } from '../notify/notify.service';
import { MemberLevelService } from '../account/member-level.service';

/**
 * TRON (TRC20) 充值监听服务
 * 按充值订单查询，订单有效期10分钟
 * 
 * TronGrid API 限制：
 * - 免费 Key: 约 15 QPS
 * - 本服务每10秒查询一次，每个订单最多查60次
 * - 3个 Key 轮询，实际消耗远低于限制
 */
@Injectable()
export class TronMonitorService {
  private readonly logger = new Logger(TronMonitorService.name);

  // TRON 配置
  private readonly apiKeys: string[];
  private readonly walletAddress: string;
  private readonly usdtContract: string = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // USDT TRC20
  private readonly apiUrl = 'https://api.trongrid.io';

  // API Key 轮换索引
  private currentKeyIndex = 0;

  // 订单查询间隔（毫秒）
  private readonly QUERY_INTERVAL = 10000; // 10秒
  // 订单有效期（毫秒）
  private readonly ORDER_EXPIRE_TIME = 10 * 60 * 1000; // 10分钟

  constructor(
    private configService: ConfigService,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(AssetLog)
    private assetLogRepository: Repository<AssetLog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Recharge)
    private rechargeRepository: Repository<Recharge>,
    @InjectRepository(Kyc)
    private kycRepository: Repository<Kyc>,
    private telegramNotify: TelegramNotifyService,
    private memberLevelService: MemberLevelService,
  ) {
    // 解析多个 API Keys（逗号分隔）
    const keysStr = this.configService.get<string>('TRONGRID_API_KEYS') ||
                    this.configService.get<string>('TRONGRID_API_KEY') || '';
    this.apiKeys = keysStr.split(',').map(k => k.trim()).filter(k => k.length > 0);
    this.walletAddress = this.configService.get<string>('TRON_USDT_ADDRESS') || '';

    if (!this.apiKeys.length || !this.walletAddress) {
      this.logger.warn('TRON 监听未配置');
    } else {
      this.logger.log(`TRON 监听已启动，已加载 ${this.apiKeys.length} 个 API Key，查询间隔 ${this.QUERY_INTERVAL / 1000}秒`);
    }
  }

  /**
   * 定时任务：每10秒检查待确认的充值订单
   */
  @Cron('*/10 * * * * *')
  async checkPendingOrders() {
    try {
      if (!this.apiKeys.length || !this.walletAddress) {
        return;
      }

      // 获取所有待确认的订单（10分钟内创建的）
      const expireThreshold = new Date(Date.now() - this.ORDER_EXPIRE_TIME);
      
      const pendingOrders = await this.rechargeRepository.find({
        where: {
          status: 0, // 待确认
          createdAt: MoreThan(expireThreshold),
        },
        order: { createdAt: 'ASC' },
      });

      if (pendingOrders.length === 0) {
        return;
      }

      this.logger.debug(`检查 ${pendingOrders.length} 个待确认充值订单...`);

      // 逐个检查订单
      for (const order of pendingOrders) {
        await this.checkOrderTransaction(order);
        // 每个订单之间间隔500ms，避免请求过快
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // 检查并标记过期订单
      await this.markExpiredOrders();

    } catch (error) {
      this.logger.error('检查充值订单失败:', error.message);
    }
  }

  /**
   * 检查单个订单的链上交易
   */
  private async checkOrderTransaction(order: Recharge) {
    try {
      const fromAddress = order.fromAddress;
      const expectedAmount = parseFloat(order.amount);

      if (!fromAddress) {
        this.logger.warn(`订单 ${order.orderNo} 无来源地址，跳过`);
        return;
      }

      // 查询该来源地址向平台地址的转账
      const transactions = await this.getTransactionsFromAddress(fromAddress);

      if (!transactions || transactions.length === 0) {
        return;
      }

      // 查找匹配的交易
      for (const tx of transactions) {
        // 检查是否是转入平台地址的交易
        if (tx.to !== this.walletAddress) {
          continue;
        }

        // 检查交易时间是否在订单创建之后
        const txTime = new Date(tx.block_timestamp);
        if (txTime < order.createdAt) {
          continue;
        }

        // 检查金额（允许0.001的误差，防止浮点精度问题）
        const txAmount = parseFloat(tx.value) / 1e6;
        if (Math.abs(txAmount - expectedAmount) > 0.001) {
          continue;
        }

        // 检查交易是否已被其他订单使用
        const existingOrder = await this.rechargeRepository.findOne({
          where: { txHash: tx.transaction_id },
        });
        if (existingOrder) {
          continue;
        }

        // 找到匹配交易，处理入账
        this.logger.log(`订单 ${order.orderNo} 找到匹配交易: ${tx.transaction_id}`);
        await this.processDeposit(order, tx);
        return;
      }
    } catch (error) {
      this.logger.error(`检查订单 ${order.orderNo} 失败:`, error.message);
    }
  }

  /**
   * 获取指定地址发出的 USDT 交易
   */
  private async getTransactionsFromAddress(fromAddress: string): Promise<any[]> {
    try {
      // 查询从该地址发出的 TRC20 交易
      const url = `/v1/accounts/${this.walletAddress}/transactions/trc20?only_to=true&limit=50&contract_address=${this.usdtContract}`;
      
      const response = await this.tronQuery(url);
      
      if (!response.data) {
        return [];
      }

      // 过滤出来自指定地址的交易
      return response.data.filter(tx => tx.from === fromAddress);
    } catch (error) {
      this.logger.error('获取交易记录失败:', error.message);
      return [];
    }
  }

  /**
   * 处理充值入账
   */
  private async processDeposit(order: Recharge, tx: any) {
    const queryRunner = this.walletRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const amount = parseFloat(tx.value) / 1e6;
      const txId = tx.transaction_id;

      // 1. 获取用户
      const user = await queryRunner.manager.findOne(User, {
        where: { id: order.userId }
      });

      if (!user) {
        this.logger.error(`订单 ${order.orderNo} 用户不存在`);
        await queryRunner.rollbackTransaction();
        return;
      }

      // 2. 获取 USDT 钱包
      const coin = await queryRunner.manager.findOne(Coin, {
        where: { symbol: 'USDT', status: 1 }
      });

      if (!coin) {
        this.logger.error('USDT 币种未配置');
        await queryRunner.rollbackTransaction();
        return;
      }

      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: user.id, coinId: coin.id }
      });

      if (!wallet) {
        this.logger.error(`用户 ${user.id} 的 USDT 钱包不存在`);
        await queryRunner.rollbackTransaction();
        return;
      }

      // 3. 入账
      const currentBalance = parseFloat(wallet.balance || '0');
      const newBalance = currentBalance + amount;
      wallet.balance = newBalance.toFixed(8);
      await queryRunner.manager.save(Wallet, wallet);

      // 4. 更新订单状态
      order.status = 1; // 已完成
      order.txHash = txId;
      order.confirmations = 20;
      await queryRunner.manager.save(Recharge, order);

      // 5. 记录资产流水
      const assetLog = queryRunner.manager.create(AssetLog, {
        userId: user.id,
        coin: 'USDT',
        type: 'deposit',
        amount: amount.toFixed(6),
        balanceBefore: currentBalance.toFixed(8),
        balanceAfter: newBalance.toFixed(8),
        refNo: txId,
        remark: `TRC20充值 订单:${order.orderNo}`,
      });
      await queryRunner.manager.save(AssetLog, assetLog);

      await queryRunner.commitTransaction();

      this.logger.log(`✅ 充值入账成功: 订单 ${order.orderNo}, 用户 ${user.username}, 金额 ${amount} USDT`);

      // 6. 更新用户会员等级
      try {
        const levelResult = await this.memberLevelService.updateUserLevel(user.id, amount.toFixed(2));
        if (levelResult.newLevel > levelResult.oldLevel) {
          this.logger.log(`🎉 用户 ${user.username} 等级提升: ${levelResult.oldLevel} -> ${levelResult.newLevel}`);
        }
      } catch (levelErr) {
        this.logger.error(`更新用户等级失败: ${levelErr.message}`);
      }

      // 7. 发送通知
      // 获取 KYC 真实姓名
      const kyc = await this.kycRepository.findOne({
        where: { userId: user.id, status: 1 }
      });

      // 获取推荐人用户名
      let inviterName = undefined;
      if (user.inviterId) {
        const inviter = await this.userRepository.findOne({
          where: { id: user.inviterId },
          select: ['username']
        });
        inviterName = inviter?.username;
      }

      await this.telegramNotify.notifyDepositSuccess({
        userId: user.id,
        username: user.username,
        amount: amount.toFixed(2),
        txid: txId,
        isInternal: user.isInternal,
        realName: kyc?.realName,
        inviterName: inviterName,
      }).catch(err => {
        this.logger.error(`Telegram 通知失败: ${err.message}`);
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`处理充值失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 标记过期订单
   */
  private async markExpiredOrders() {
    try {
      const expireThreshold = new Date(Date.now() - this.ORDER_EXPIRE_TIME);
      
      const result = await this.rechargeRepository.update(
        {
          status: 0,
          createdAt: LessThan(expireThreshold),
        },
        {
          status: 2, // 已超时
        }
      );

      if (result.affected > 0) {
        this.logger.log(`已标记 ${result.affected} 个超时充值订单`);
      }
    } catch (error) {
      this.logger.error('标记过期订单失败:', error.message);
    }
  }

  /**
   * TRON API 查询（支持 API Key 轮换）
   */
  private async tronQuery(endpoint: string): Promise<any> {
    const url = `${this.apiUrl}${endpoint}`;

    // 轮换尝试所有 API Keys
    for (let attempt = 0; attempt < this.apiKeys.length; attempt++) {
      const apiKey = this.apiKeys[this.currentKeyIndex];

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'TRON-PRO-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
        });

        // 检查是否为速率限制错误
        if (response.status === 429) {
          this.logger.warn(`API Key ${this.currentKeyIndex + 1} 达到速率限制，切换到下一个...`);
          this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        if (!response.ok) {
          throw new Error(`TRON API 错误: ${response.status}`);
        }

        // 成功后切换到下一个 Key（负载均衡）
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;

        return await response.json();

      } catch (error) {
        if (attempt === this.apiKeys.length - 1) {
          throw error;
        }
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
      }
    }

    throw new Error('所有 API Keys 都不可用');
  }
}
