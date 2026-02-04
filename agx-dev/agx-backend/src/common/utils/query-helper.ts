import { SelectQueryBuilder } from 'typeorm';

/**
 * 查询优化助手工具类
 * 用于避免 N+1 查询和优化数据库性能
 */
export class QueryHelper {
  /**
   * 批量加载关联数据，避免 N+1 查询
   *
   * @example
   * const users = await QueryHelper.batchLoadWithRelations(
   *   userRepository,
   *   userIds,
   *   ['profile', 'settings']
   * );
   */
  static async batchLoadWithRelations<T>(
    repository: any,
    ids: number[],
    relations: string[] = [],
  ): Promise<T[]> {
    if (!ids.length) return [];

    const queryBuilder = repository.createQueryBuilder('entity');

    // 添加关联查询
    relations.forEach(relation => {
      queryBuilder.leftJoinAndSelect(`entity.${relation}`, `${relation}`);
    });

    // 使用 WHERE IN 批量查询
    return queryBuilder
      .where('entity.id IN (:...ids)', { ids })
      .getMany();
  }

  /**
   * 创建优化的分页查询
   * 使用游标分页而非 OFFSET，提高大数据量查询性能
   */
  static createCursorPaginationQuery<T>(
    queryBuilder: SelectQueryBuilder<T>,
    cursor?: number,
    limit: number = 20,
    orderBy: string = 'id',
    order: 'ASC' | 'DESC' = 'DESC',
  ): SelectQueryBuilder<T> {
    // 添加排序
    queryBuilder.orderBy(`entity.${orderBy}`, order);

    // 添加游标条件
    if (cursor) {
      if (order === 'DESC') {
        queryBuilder.andWhere(`entity.${orderBy} < :cursor`, { cursor });
      } else {
        queryBuilder.andWhere(`entity.${orderBy} > :cursor`, { cursor });
      }
    }

    // 限制返回数量（多取1条用于判断是否有下一页）
    return queryBuilder.limit(limit + 1);
  }

  /**
   * 批量更新 - 优于循环单个更新
   */
  static async batchUpdate<T>(
    repository: any,
    items: Array<{ id: number } & Partial<T>>,
    batchSize: number = 100,
  ): Promise<void> {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      await repository
        .createQueryBuilder()
        .insert()
        .values(batch)
        .orUpdate(['updatedAt'], ['id'])
        .execute();
    }
  }

  /**
   * 只选择需要的字段，减少数据传输
   */
  static selectFields<T>(
    queryBuilder: SelectQueryBuilder<T>,
    fields: string[],
  ): SelectQueryBuilder<T> {
    return queryBuilder.select(
      fields.map(field => `entity.${field}`),
    );
  }

  /**
   * 使用 EXISTS 替代 IN 子查询，提高性能
   */
  static useExists<T>(
    queryBuilder: SelectQueryBuilder<T>,
    correlationName: string,
    subQueryFn: (qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>,
  ): SelectQueryBuilder<T> {
    const subQuery = subQueryFn(queryBuilder.subQuery());
    return queryBuilder.andWhere(`EXISTS ${subQuery.getQuery()}`);
  }

  /**
   * 避免使用 SELECT * (简化版本)
   */
  static avoidSelectAll<T>(
    queryBuilder: SelectQueryBuilder<T>,
    tableAlias: string = 'entity',
    fields?: string[],
  ): SelectQueryBuilder<T> {
    if (fields && fields.length > 0) {
      const columns = fields.map(field => `${tableAlias}.${field}`);
      return queryBuilder.select(columns);
    }
    return queryBuilder;
  }

  /**
   * 使用 UNION ALL 替代多个查询 (简化版本)
   */
  static async unionAllQueries<T>(
    queries: SelectQueryBuilder<T>[],
  ): Promise<T[]> {
    if (!queries.length) return [];
    // 简化实现：分别执行每个查询并合并结果
    const results = await Promise.all(queries.map(q => q.getRawMany()));
    return results.flat();
  }

  /**
   * 优化 COUNT 查询 - 使用近似计数
   */
  static async getApproximateCount(
    repository: any,
    tableName?: string,
  ): Promise<number> {
    const actualTableName = tableName || repository.metadata.tableName;
    const result = await repository.query(
      `SELECT reltuples::bigint AS estimate FROM pg_class WHERE relname = '${actualTableName}'`,
    );
    return result[0]?.estimate || 0;
  }

  /**
   * 批量删除 - 优于循环单个删除
   */
  static async batchDelete(
    repository: any,
    ids: number[],
    batchSize: number = 100,
  ): Promise<void> {
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      await repository.delete(batch);
    }
  }
}

/**
 * 查询性能监控装饰器
 */
export function LogQueryTime(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const start = Date.now();
    try {
      const result = await method.apply(this, args);
      const duration = Date.now() - start;

      // 记录慢查询（超过100ms）
      if (duration > 100) {
        console.warn(`Slow Query Detected: ${propertyName} took ${duration}ms`);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`Query Error (${duration}ms): ${propertyName}`, error);
      throw error;
    }
  };

  return descriptor;
}
