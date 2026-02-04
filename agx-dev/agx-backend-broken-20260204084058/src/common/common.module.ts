import { Module, Global } from '@nestjs/common';
import { DecimalCalculatorService } from './services/decimal-calculator.service';

/**
 * 公共模块
 * 导出全局共享的服务
 */
@Global()
@Module({
  providers: [DecimalCalculatorService],
  exports: [DecimalCalculatorService],
})
export class CommonModule {}
