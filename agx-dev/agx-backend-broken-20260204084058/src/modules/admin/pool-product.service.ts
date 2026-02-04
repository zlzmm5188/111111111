import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PoolProduct, Coin } from '../../entities';
import { OperationLogService } from '../../common/services/operation-log.service';

/**
 * 矿池产品管理服务
 * 金融级别严谨性要求
 */
@Injectable()
export class PoolProductService {
  private readonly logger = new Logger(PoolProductService.name);

  constructor(
    @InjectRepository(PoolProduct)
    private readonly poolProductRepo: Repository<PoolProduct>,
    @InjectRepository(Coin)
    private readonly coinRepo: Repository<Coin>,
    private readonly operationLog: OperationLogService,
  ) {}

  /**
   * 创建矿池产品
   */
  async createProduct(
    data: {
      name: string;
      coinId?: number;
      type?: 'flexible' | 'fixed';
      lockDays?: number;
      dailyRate?: string;
      minAmount: string;
      maxAmount?: string;
      totalQuota?: string;
      incomeCoinId?: number;
      payCurrencies?: string;
      sortOrder?: number;
      // 新增字段
      image?: string;
      region?: string;
      robotRent?: string;
      robotDays?: number;
      minRate?: string;
      maxRate?: string;
      maxInvestCount?: number;
      vipLevels?: string;
      shares?: string;
      investDays?: number;
      startTime?: Date;
      endTime?: Date;
      progress?: string;
      enableRedpacket?: number;
      enableDividend?: number;
      enableDoubleExp?: number;
      enableVipBonus?: number;
      vipBonusRates?: string;
      isHot?: number;
      status?: number;
    },
    admin: { id: number; username: string },
    ip?: string,
  ) {
    // 验证数据
    this.validateProductData(data);

    // 检查币种（如果指定）
    if (data.coinId) {
      const coin = await this.coinRepo.findOne({ where: { id: data.coinId } });
      if (!coin) {
        throw new Error('投入币种不存在');
      }
    }

    if (data.incomeCoinId) {
      const incomeCoin = await this.coinRepo.findOne({ where: { id: data.incomeCoinId } });
      if (!incomeCoin) {
        throw new Error('收益币种不存在');
      }
    }

    // 处理 vipBonusRates JSON
    let vipBonusRates = null;
    if (data.vipBonusRates) {
      try {
        vipBonusRates = typeof data.vipBonusRates === 'string' 
          ? JSON.parse(data.vipBonusRates) 
          : data.vipBonusRates;
      } catch (e) {
        vipBonusRates = {};
      }
    }

    // 创建产品
    const product = this.poolProductRepo.create({
      ...data,
      coinId: data.coinId || 1, // 默认AGX
      type: data.type || 'fixed',
      dailyRate: data.dailyRate || '0',
      soldAmount: '0',
      isHot: data.isHot || 0,
      status: data.status ?? 1,
      vipBonusRates,
    });

    const saved = await this.poolProductRepo.save(product);

    // 记录审计日志
    await this.operationLog.logSuccess({
      adminId: admin.id,
      adminUsername: admin.username,
      module: 'pool_product',
      action: 'create',
      targetType: 'PoolProduct',
      targetId: saved.id,
      newData: saved,
      ip,
    });

    this.logger.log(`矿池产品创建成功: ${data.name}`);
    return saved;
  }

  /**
   * 更新矿池产品
   */
  async updateProduct(
    id: number,
    data: Partial<PoolProduct> & { vipBonusRates?: any },
    admin: { id: number; username: string },
    ip?: string,
  ) {
    const existing = await this.poolProductRepo.findOne({ where: { id } });
    if (!existing) {
      throw new Error('产品不存在');
    }

    // 已有持仓的产品不允许修改关键参数
    if (parseFloat(existing.soldAmount) > 0) {
      const protectedFields = ['coinId', 'type', 'lockDays', 'dailyRate', 'incomeCoinId'];
      const changedProtectedFields = protectedFields.filter(f => data[f] !== undefined && data[f] !== existing[f]);
      if (changedProtectedFields.length > 0) {
        throw new Error('产品已有持仓，不允许修改关键参数');
      }
    }

    // 处理 vipBonusRates JSON
    if (data.vipBonusRates) {
      try {
        data.vipBonusRates = typeof data.vipBonusRates === 'string' 
          ? JSON.parse(data.vipBonusRates) 
          : data.vipBonusRates;
      } catch (e) {
        data.vipBonusRates = {};
      }
    }

    // 记录变更
    const changes: any = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== existing[key]) {
        changes[key] = { old: existing[key], new: data[key] };
      }
    });

    const updated = await this.poolProductRepo.save({
      ...existing,
      ...data,
    });

    // 记录审计日志
    await this.operationLog.logSuccess({
      adminId: admin.id,
      adminUsername: admin.username,
      module: 'pool_product',
      action: 'update',
      targetType: 'PoolProduct',
      targetId: id,
      oldData: existing,
      newData: updated,
      changes,
      ip,
    });

    this.logger.log(`矿池产品更新成功: ID=${id}`);
    return updated;
  }

  /**
   * 删除矿池产品（无持仓的才能删除）
   */
  async deleteProduct(
    id: number,
    admin: { id: number; username: string },
    ip?: string,
  ) {
    const existing = await this.poolProductRepo.findOne({ where: { id } });
    if (!existing) {
      throw new Error('产品不存在');
    }

    if (parseFloat(existing.soldAmount) > 0) {
      throw new Error('产品已有持仓，不能删除');
    }

    await this.poolProductRepo.remove(existing);

    // 记录审计日志
    await this.operationLog.logSuccess({
      adminId: admin.id,
      adminUsername: admin.username,
      module: 'pool_product',
      action: 'delete',
      targetType: 'PoolProduct',
      targetId: id,
      oldData: existing,
      ip,
    });

    this.logger.log(`矿池产品删除成功: ID=${id}`);
    return { success: true };
  }

  /**
   * 获取产品列表
   */
  async getList(filters: {
    status?: number;
    coinId?: number;
    type?: string;
    page?: number;
    pageSize?: number;
  }) {
    const query = this.poolProductRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.coin', 'coin')
      .leftJoinAndSelect('product.incomeCoin', 'incomeCoin');

    if (filters.status !== undefined) {
      query.andWhere('product.status = :status', { status: filters.status });
    }
    if (filters.coinId) {
      query.andWhere('product.coinId = :coinId', { coinId: filters.coinId });
    }
    if (filters.type) {
      query.andWhere('product.type = :type', { type: filters.type });
    }

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;

    query
      .orderBy('product.sortOrder', 'ASC')
      .addOrderBy('product.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取产品详情
   */
  async getDetail(id: number) {
    const product = await this.poolProductRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.coin', 'coin')
      .leftJoinAndSelect('product.incomeCoin', 'incomeCoin')
      .where('product.id = :id', { id })
      .getOne();

    if (!product) {
      throw new Error('产品不存在');
    }
    return product;
  }

  /**
   * 验证产品数据
   */
  private validateProductData(data: any) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('产品名称不能为空');
    }

    if (parseFloat(data.minAmount) <= 0) {
      throw new Error('最低申购金额必须大于0');
    }

    if (data.maxAmount && parseFloat(data.maxAmount) < parseFloat(data.minAmount)) {
      throw new Error('最高申购不能小于最低申购');
    }

    if (data.totalQuota && parseFloat(data.totalQuota) <= 0) {
      throw new Error('总额度必须大于0');
    }
  }

  /**
   * 获取矿池产品统计数据
   */
  async getStats() {
    // 获取在售产品数量
    const activeCount = await this.poolProductRepo.count({
      where: { status: 1 }
    });

    // 获取总销售额
    const totalSoldResult = await this.poolProductRepo
      .createQueryBuilder('product')
      .select('SUM(CAST(product.soldAmount AS DECIMAL(36,8)))', 'total')
      .getRawOne();
    const totalSold = totalSoldResult?.total || '0.00';

    // 今日收益 - 需要从PoolIncome表统计，暂时返回0
    const todayIncome = '0.00';

    // 持仓用户数 - 需要从PoolHolding表统计，暂时返回0
    const holdingUsers = 0;

    return {
      activeCount,
      totalSold: parseFloat(totalSold).toFixed(2),
      todayIncome,
      holdingUsers
    };
  }
}
