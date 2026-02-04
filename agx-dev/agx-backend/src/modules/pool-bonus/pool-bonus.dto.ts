import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
// ApiProperty import disabled

// ==================== 红包分红配置 DTO ====================
export class UpdateBonusConfigDto {
  // @ApiProperty({ description: '红包类型', required: false, enum: ['fixed', 'percent'] })
  @IsOptional()
  @IsString()
  @IsEnum(['fixed', 'percent'])
  redpacketType?: string;

  // @ApiProperty({ description: '红包固定金额', required: false })
  @IsOptional()
  @IsNumber()
  redpacketAmount?: number;

  // @ApiProperty({ description: '红包百分比', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  redpacketPercent?: number;

  // @ApiProperty({ description: '红包币种', required: false })
  @IsOptional()
  @IsString()
  redpacketCoin?: string;

  // @ApiProperty({ description: '分红类型', required: false, enum: ['fixed', 'percent'] })
  @IsOptional()
  @IsString()
  @IsEnum(['fixed', 'percent'])
  dividendType?: string;

  // @ApiProperty({ description: '分红固定金额', required: false })
  @IsOptional()
  @IsNumber()
  dividendAmount?: number;

  // @ApiProperty({ description: '分红百分比', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  dividendPercent?: number;

  // @ApiProperty({ description: '分红币种', required: false })
  @IsOptional()
  @IsString()
  dividendCoin?: string;
}

// ==================== 层级返利配置 DTO ====================
export class UpdateCommissionConfigDto {
  // @ApiProperty({ description: '一级返利百分比', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  level1Percent?: number;

  // @ApiProperty({ description: '二级返利百分比', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  level2Percent?: number;

  // @ApiProperty({ description: '三级返利百分比', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  level3Percent?: number;

  // @ApiProperty({ description: '最多返利几层', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxCommissionLevels?: number;
}

// ==================== 全局配置 DTO ====================
export class UpdateGlobalConfigDto {
  // @ApiProperty({ description: '全局双倍经验开关', required: false })
  @IsOptional()
  @IsNumber()
  doubleExpEnabled?: number;

  // @ApiProperty({ description: '双倍经验开始时间', required: false })
  @IsOptional()
  doubleExpStartTime?: Date;

  // @ApiProperty({ description: '双倍经验结束时间', required: false })
  @IsOptional()
  doubleExpEndTime?: Date;
}

// ==================== 复购补贴配置 DTO ====================
export class UpdateRepurchaseConfigDto {
  // @ApiProperty({ description: '全局开关', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;

  // @ApiProperty({ description: '固定补贴金额', required: false })
  @IsOptional()
  @IsNumber()
  fixedAmount?: number;

  // @ApiProperty({ description: '固定补贴币种', required: false })
  @IsOptional()
  @IsString()
  fixedCoin?: string;

  // @ApiProperty({ description: '是否启用百分比', required: false })
  @IsOptional()
  @IsNumber()
  percentEnabled?: number;

  // @ApiProperty({ description: '复购补贴百分比', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  repurchasePercent?: number;

  // @ApiProperty({ description: '至少持有过几个项目', required: false })
  @IsOptional()
  @IsNumber()
  minHoldingCount?: number;

  // @ApiProperty({ description: '是否需要有到期项目', required: false })
  @IsOptional()
  @IsNumber()
  requireExpired?: number;

  // @ApiProperty({ description: '排除注册几天内的新手', required: false })
  @IsOptional()
  @IsNumber()
  excludeNewbieDays?: number;
}
