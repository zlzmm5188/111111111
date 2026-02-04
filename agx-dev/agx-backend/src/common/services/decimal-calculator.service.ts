import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';

/**
 * 统一的精度计算服务
 *
 * 用于所有涉及金额计算的场景，确保精度一致
 *
 * @usage
 * ```typescript
 * // 加法
 * const sum = await this.decimalCalculator.add('10.5', '20.3'); // '30.8'
 *
 * // 减法
 * const diff = await this.decimalCalculator.subtract('20.3', '10.5'); // '9.8'
 *
 * // 乘法
 * const product = await this.decimalCalculator.multiply('100', '0.12'); // '12.00'
 *
 * // 除法
 * const quotient = await this.decimalCalculator.divide('100', '3'); // '33.33333333'
 *
 * // 比较
 * const cmp = await this.decimalCalculator.compare('10.5', '20.3'); // -1 (小于)
 * ```
 */
@Injectable()
export class DecimalCalculatorService {
  /**
   * 加法运算
   * @param a 被加数（字符串格式）
   * @param b 加数（字符串格式）
   * @returns 和（字符串格式，保留8位小数）
   */
  add(a: string, b: string): string {
    const decimalA = new Decimal(a || '0');
    const decimalB = new Decimal(b || '0');
    return decimalA.plus(decimalB).toFixed(8);
  }

  /**
   * 减法运算
   * @param a 被减数（字符串格式）
   * @param b 减数（字符串格式）
   * @returns 差（字符串格式，保留8位小数）
   */
  subtract(a: string, b: string): string {
    const decimalA = new Decimal(a || '0');
    const decimalB = new Decimal(b || '0');
    return decimalA.minus(decimalB).toFixed(8);
  }

  /**
   * 乘法运算
   * @param a 被乘数（字符串格式）
   * @param b 乘数（字符串格式或数字）
   * @returns 积（字符串格式，保留8位小数）
   */
  multiply(a: string, b: string | number): string {
    const decimalA = new Decimal(a || '0');
    const decimalB = new Decimal(b || 0);
    return decimalA.mul(decimalB).toFixed(8);
  }

  /**
   * 除法运算
   * @param a 被除数（字符串格式）
   * @param b 除数（字符串格式或数字）
   * @returns 商（字符串格式，保留8位小数）
   * @throws 如果除数为0，抛出错误
   */
  divide(a: string, b: string | number): string {
    const decimalA = new Decimal(a || '0');
    const decimalB = new Decimal(b || 0);

    if (decimalB.isZero()) {
      throw new Error('Division by zero');
    }

    return decimalA.div(decimalB).toFixed(8);
  }

  /**
   * 比较两个数字
   * @param a 数字A（字符串格式）
   * @param b 数字B（字符串格式）
   * @returns 比较结果：-1（a < b），0（a == b），1（a > b）
   */
  compare(a: string, b: string): number {
    const decimalA = new Decimal(a || '0');
    const decimalB = new Decimal(b || '0');
    return decimalA.comparedTo(decimalB);
  }

  /**
   * 判断是否大于
   * @param a 数字A（字符串格式）
   * @param b 数字B（字符串格式）
   * @returns a > b ?
   */
  greaterThan(a: string, b: string): boolean {
    return this.compare(a, b) > 0;
  }

  /**
   * 判断是否小于
   * @param a 数字A（字符串格式）
   * @param b 数字B（字符串格式）
   * @returns a < b ?
   */
  lessThan(a: string, b: string): boolean {
    return this.compare(a, b) < 0;
  }

  /**
   * 判断是否等于
   * @param a 数字A（字符串格式）
   * @param b 数字B（字符串格式）
   * @returns a == b ?
   */
  equals(a: string, b: string): boolean {
    return this.compare(a, b) === 0;
  }

  /**
   * 判断是否大于或等于
   * @param a 数字A（字符串格式）
   * @param b 数字B（字符串格式）
   * @returns a >= b ?
   */
  greaterThanOrEqual(a: string, b: string): boolean {
    return this.compare(a, b) >= 0;
  }

  /**
   * 判断是否小于或等于
   * @param a 数字A（字符串格式）
   * @param b 数字B（字符串格式）
   * @returns a <= b ?
   */
  lessThanOrEqual(a: string, b: string): boolean {
    return this.compare(a, b) <= 0;
  }

  /**
   * 格式化为指定小数位数
   * @param value 数字（字符串格式）
   * @param decimalPlaces 小数位数（默认8位）
   * @returns 格式化后的字符串
   */
  toFixed(value: string, decimalPlaces: number = 8): string {
    const decimal = new Decimal(value || '0');
    return decimal.toFixed(decimalPlaces);
  }

  /**
   * 判断是否为0
   * @param value 数字（字符串格式）
   * @returns 是否为0
   */
  isZero(value: string): boolean {
    const decimal = new Decimal(value || '0');
    return decimal.isZero();
  }

  /**
   * 判断是否为负数
   * @param value 数字（字符串格式）
   * @returns 是否为负数
   */
  isNegative(value: string): boolean {
    const decimal = new Decimal(value || '0');
    return decimal.isNegative();
  }

  /**
   * 判断是否为正数
   * @param value 数字（字符串格式）
   * @returns 是否为正数
   */
  isPositive(value: string): boolean {
    const decimal = new Decimal(value || '0');
    return decimal.isPositive();
  }

  /**
   * 取负数
   * @param value 数字（字符串格式）
   * @returns 负数值（字符串格式）
   */
  negate(value: string): string {
    const decimal = new Decimal(value || '0');
    return decimal.negated().toFixed(8);
  }

  /**
   * 计算百分比
   * @param value 数字（字符串格式）
   * @param percent 百分比（如 12 表示 12%）
   * @returns 百分比结果（字符串格式）
   */
  percent(value: string, percent: number): string {
    const decimal = new Decimal(value || '0');
    const rate = new Decimal(percent).div(100);
    return decimal.mul(rate).toFixed(8);
  }

  /**
   * 计算返佣金额
   * @param amount 交易金额（字符串格式）
   * @param rate 返佣比例（如 0.12 表示 12%）
   * @returns 返佣金额（字符串格式）
   */
  calculateCommission(amount: string, rate: string | number): string {
    return this.multiply(amount, rate);
  }

  /**
   * 批量求和
   * @param values 数字数组（字符串格式）
   * @returns 总和（字符串格式）
   */
  sum(values: string[]): string {
    return values.reduce((sum, value) => this.add(sum, value), '0');
  }

  /**
   * 计算平均值
   * @param values 数字数组（字符串格式）
   * @returns 平均值（字符串格式）
   */
  average(values: string[]): string {
    if (values.length === 0) {
      return '0';
    }
    const sum = this.sum(values);
    return this.divide(sum, values.length);
  }
}
