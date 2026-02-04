import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from '../../../entities/wallet.entity';
import { AssetLog } from '../../../entities/asset-log.entity';
import { DecimalCalculatorService } from '../../../common/services/decimal-calculator.service';

/**
 * 统一的资产管理服务
 *
 * 负责所有涉及资产变动的操作，确保：
 * 1. 所有操作在事务中执行
 * 2. 余额变动自动记录流水
 * 3. 余额不足自动抛错
 * 4. 精度计算统一使用 Decimal
 *
 * @usage
 * ```typescript
 * // 增加余额
 * await this.assetService.addBalance(userId, coinId, '100.5', 'recharge', '充值');
 *
 * // 扣减余额
 * await this.assetService.deductBalance(userId, coinId, '50.25', 'withdraw', '提现');
 *
 * // 冻结余额
 * await this.assetService.freezeBalance(userId, coinId, '100', 'contract', '合约下单');
 *
 * // 转账
 * await this.assetService.transfer(fromUserId, toUserId, coinId, '10', 'transfer', '转账');
 * ```
 */
@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    @InjectRepository(AssetLog)
    private assetLogRepo: Repository<AssetLog>,
    private decimalCalculator: DecimalCalculatorService,
    private dataSource: DataSource,
  ) {}

  /**
   * 增加用户余额
   *
   * @param userId 用户ID
   * @param coinId 币种ID
   * @param amount 增加金额（字符串格式）
   * @param type 流水类型
   * @param remark 备注
   * @param refNo 关联单号（可选）
   */
  async addBalance(
    userId: number,
    coinId: number,
    amount: string,
    type: string,
    remark?: string,
    refNo?: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1. 获取或创建钱包（使用悲观锁防止并发问题）
      let wallet = await manager.findOne(Wallet, {
        where: { userId, coinId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        wallet = manager.create(Wallet, {
          userId,
          coinId,
          balance: '0',
          frozen: '0',
        });
        await manager.save(wallet);
        // 重新获取以确保锁定
        wallet = await manager.findOne(Wallet, {
          where: { userId, coinId },
          lock: { mode: 'pessimistic_write' },
        });
      }

      // 2. 记录变动前余额
      const balanceBefore = wallet.balance;

      // 3. 计算变动后余额
      const balanceAfter = this.decimalCalculator.add(
        wallet.balance,
        amount,
      );

      // 4. 更新钱包余额
      wallet.balance = balanceAfter;
      await manager.save(wallet);

      // 5. 记录流水
      await this.createAssetLog(
        manager,
        userId,
        coinId,
        type,
        amount,
        balanceBefore,
        balanceAfter,
        remark,
        refNo,
      );
    });
  }

  /**
   * 扣减用户余额
   *
   * @param userId 用户ID
   * @param coinId 币种ID
   * @param amount 扣减金额（字符串格式）
   * @param type 流水类型
   * @param remark 备注
   * @param refNo 关联单号（可选）
   * @throws 余额不足时抛出 BadRequestException
   */
  async deductBalance(
    userId: number,
    coinId: number,
    amount: string,
    type: string,
    remark?: string,
    refNo?: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1. 获取钱包（使用悲观锁防止并发超扣）
      const wallet = await manager.findOne(Wallet, {
        where: { userId, coinId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new BadRequestException('钱包不存在');
      }

      // 2. 检查余额是否充足
      if (this.decimalCalculator.lessThan(wallet.balance, amount)) {
        throw new BadRequestException('余额不足');
      }

      // 3. 记录变动前余额
      const balanceBefore = wallet.balance;

      // 4. 计算变动后余额
      const balanceAfter = this.decimalCalculator.subtract(
        wallet.balance,
        amount,
      );

      // 5. 更新钱包余额
      wallet.balance = balanceAfter;
      await manager.save(wallet);

      // 6. 记录流水
      await this.createAssetLog(
        manager,
        userId,
        coinId,
        type,
        this.decimalCalculator.negate(amount), // 扣减记录为负数
        balanceBefore,
        balanceAfter,
        remark,
        refNo,
      );
    });
  }

  /**
   * 冻结用户余额（从可用余额转到冻结余额）
   *
   * @param userId 用户ID
   * @param coinId 币种ID
   * @param amount 冻结金额（字符串格式）
   * @param type 流水类型
   * @param remark 备注
   * @param refNo 关联单号（可选）
   * @throws 可用余额不足时抛出 BadRequestException
   */
  async freezeBalance(
    userId: number,
    coinId: number,
    amount: string,
    type: string,
    remark?: string,
    refNo?: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1. 获取钱包（使用悲观锁防止并发问题）
      const wallet = await manager.findOne(Wallet, {
        where: { userId, coinId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new BadRequestException('钱包不存在');
      }

      // 2. 检查可用余额是否充足
      if (this.decimalCalculator.lessThan(wallet.balance, amount)) {
        throw new BadRequestException('可用余额不足');
      }

      // 3. 记录变动前余额
      const balanceBefore = wallet.balance;

      // 4. 计算变动后余额
      const balanceAfter = this.decimalCalculator.subtract(
        wallet.balance,
        amount,
      );
      const frozenAfter = this.decimalCalculator.add(wallet.frozen, amount);

      // 5. 更新钱包
      wallet.balance = balanceAfter;
      wallet.frozen = frozenAfter;
      await manager.save(wallet);

      // 6. 记录流水（只记录可用余额的变动）
      await this.createAssetLog(
        manager,
        userId,
        coinId,
        type,
        this.decimalCalculator.negate(amount),
        balanceBefore,
        balanceAfter,
        remark,
        refNo,
      );
    });
  }

  /**
   * 解冻用户余额（从冻结余额转回可用余额）
   *
   * @param userId 用户ID
   * @param coinId 币种ID
   * @param amount 解冻金额（字符串格式）
   * @param type 流水类型
   * @param remark 备注
   * @param refNo 关联单号（可选）
   * @throws 冻结余额不足时抛出 BadRequestException
   */
  async unfreezeBalance(
    userId: number,
    coinId: number,
    amount: string,
    type: string,
    remark?: string,
    refNo?: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1. 获取钱包（使用悲观锁防止并发问题）
      const wallet = await manager.findOne(Wallet, {
        where: { userId, coinId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new BadRequestException('钱包不存在');
      }

      // 2. 检查冻结余额是否充足
      if (this.decimalCalculator.lessThan(wallet.frozen, amount)) {
        throw new BadRequestException('冻结余额不足');
      }

      // 3. 记录变动前余额
      const balanceBefore = wallet.balance;

      // 4. 计算变动后余额
      const balanceAfter = this.decimalCalculator.add(wallet.balance, amount);
      const frozenAfter = this.decimalCalculator.subtract(wallet.frozen, amount);

      // 5. 更新钱包
      wallet.balance = balanceAfter;
      wallet.frozen = frozenAfter;
      await manager.save(wallet);

      // 6. 记录流水（只记录可用余额的变动）
      await this.createAssetLog(
        manager,
        userId,
        coinId,
        type,
        amount,
        balanceBefore,
        balanceAfter,
        remark,
        refNo,
      );
    });
  }

  /**
   * 用户间转账
   *
   * @param fromUserId 转出用户ID
   * @param toUserId 转入用户ID
   * @param coinId 币种ID
   * @param amount 转账金额（字符串格式）
   * @param type 流水类型
   * @param remark 备注
   * @param refNo 关联单号（可选）
   * @throws 转出用户余额不足时抛出 BadRequestException
   */
  async transfer(
    fromUserId: number,
    toUserId: number,
    coinId: number,
    amount: string,
    type: string,
    remark?: string,
    refNo?: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1. 获取转出用户钱包（加锁）
      const fromWallet = await manager.findOne(Wallet, {
        where: { userId: fromUserId, coinId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!fromWallet) {
        throw new BadRequestException('转出钱包不存在');
      }

      // 2. 检查余额是否充足
      if (this.decimalCalculator.lessThan(fromWallet.balance, amount)) {
        throw new BadRequestException('余额不足');
      }

      // 3. 获取或创建转入用户钱包（加锁）
      let toWallet = await manager.findOne(Wallet, {
        where: { userId: toUserId, coinId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!toWallet) {
        toWallet = manager.create(Wallet, {
          userId: toUserId,
          coinId,
          balance: '0',
          frozen: '0',
        });
        await manager.save(toWallet);
      }

      // 4. 执行转账
      const fromBalanceBefore = fromWallet.balance;
      const fromBalanceAfter = this.decimalCalculator.subtract(fromWallet.balance, amount);
      fromWallet.balance = fromBalanceAfter;

      const toBalanceBefore = toWallet.balance;
      const toBalanceAfter = this.decimalCalculator.add(toWallet.balance, amount);
      toWallet.balance = toBalanceAfter;

      await manager.save([fromWallet, toWallet]);

      // 5. 记录流水
      await this.createAssetLog(manager, fromUserId, coinId, type, this.decimalCalculator.negate(amount), fromBalanceBefore, fromBalanceAfter, remark, refNo);
      await this.createAssetLog(manager, toUserId, coinId, type, amount, toBalanceBefore, toBalanceAfter, remark, refNo);
    });
  }

  /**
   * 获取用户余额
   *
   * @param userId 用户ID
   * @param coinId 币种ID
   * @returns 钱包信息（不存在时返回 null）
   */
  async getBalance(
    userId: number,
    coinId: number,
  ): Promise<Wallet | null> {
    return await this.walletRepo.findOne({
      where: { userId, coinId },
    });
  }

  /**
   * 获取用户所有币种余额
   *
   * @param userId 用户ID
   * @returns 钱包列表
   */
  async getAllBalances(userId: number): Promise<Wallet[]> {
    return await this.walletRepo.find({
      where: { userId },
      relations: ['coin'],
    });
  }

  /**
   * 检查余额是否充足
   *
   * @param userId 用户ID
   * @param coinId 币种ID
   * @param amount 需要的金额（字符串格式）
   * @returns 是否充足
   */
  async hasEnoughBalance(
    userId: number,
    coinId: number,
    amount: string,
  ): Promise<boolean> {
    const wallet = await this.getBalance(userId, coinId);
    if (!wallet) {
      return false;
    }
    return this.decimalCalculator.greaterThanOrEqual(wallet.balance, amount);
  }

  /**
   * 创建资产流水记录（内部方法）
   *
   * @param manager 事务管理器
   * @param userId 用户ID
   * @param coinId 币种ID
   * @param type 流水类型
   * @param amount 变动金额
   * @param balanceBefore 变动前余额
   * @param balanceAfter 变动后余额
   * @param remark 备注
   * @param refNo 关联单号
   */
  private async createAssetLog(
    manager: any,
    userId: number,
    coinId: number,
    type: string,
    amount: string,
    balanceBefore: string,
    balanceAfter: string,
    remark?: string,
    refNo?: string,
  ): Promise<void> {
    // 获取币种符号
    const coin = await manager.findOne('Coin', { where: { id: coinId } });
    const coinSymbol = coin ? coin.symbol : 'UNKNOWN';

    const assetLog = manager.create(AssetLog, {
      userId,
      coin: coinSymbol,
      type,
      amount: this.decimalCalculator.toFixed(amount),
      balanceBefore,
      balanceAfter,
      refNo,
      remark,
    });

    await manager.save(assetLog);
  }
}
