import { IsString, Length, IsOptional, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// ==================== 基础分页DTO ====================

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

// ==================== 管理员管理 ====================

export class AdminListDto extends PaginationDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  adminGroup?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;
}

export class CreateAdminDto {
  @IsString()
  @Length(4, 50)
  username: string;

  @IsString()
  @Length(6, 50)
  password: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  nickname?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  role?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(2)
  adminGroup?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number = 1;
}

export class UpdateAdminDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  nickname?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  role?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(2)
  adminGroup?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;
}

export class AssignUserDto {
  @IsNumber()
  userId: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  assignedAdminId?: number;
}

export class AdminLoginDto {
  @IsString()
  @Length(4, 50)
  username: string;

  @IsString()
  @Length(6, 50)
  password: string;

  @IsOptional()
  @IsString()
  captcha?: string;
}

export class CurrencyListDto extends PaginationDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;
}

export class CreateCurrencyDto {
  @IsString()
  @Length(1, 50)
  name: string;

  @IsString()
  @Length(1, 20)
  @Transform(({ value }) => value?.toUpperCase())
  symbol: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sort?: number = 0;
}

export class UpdateCurrencyDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  @Transform(({ value }) => value?.toUpperCase())
  symbol?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sort?: number;
}

// 用户管理
export class UserListDto extends PaginationDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  kycStatus?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  isInternal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  vipLevel?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  assignedAdminId?: number;
}

export class UpdateUserStatusDto {
  @IsNumber()
  @IsIn([0, 1])
  status: number;
}

// 矿池产品管理
export class PoolProductListDto extends PaginationDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;
}

export class CreatePoolProductDto {
  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  coinId: number;

  @IsString()
  @IsIn(['flexible', 'fixed'])
  type: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lockDays: number;

  @IsString()
  dailyRate: string;

  @IsString()
  minAmount: string;

  @IsOptional()
  @IsString()
  maxAmount?: string;

  @IsOptional()
  @IsString()
  totalQuota?: string;

  @IsOptional()
  @IsString()
  payCurrencies?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  incomeCoinId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  isHot?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number = 1;

  // 扩展字段
  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  robotRent?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  robotDays?: number;

  @IsOptional()
  @IsString()
  minRate?: string;

  @IsOptional()
  @IsString()
  maxRate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxInvestCount?: number;

  @IsOptional()
  @IsString()
  vipLevels?: string;

  @IsOptional()
  @IsString()
  shares?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  investDays?: number;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  progress?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  enableRedpacket?: number;

  @IsOptional()
  @IsString()
  redpacketPercent?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  enableDividend?: number;

  @IsOptional()
  @IsString()
  dividendPercent?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  enableDoubleExp?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  enableVipBonus?: number;

  @IsOptional()
  vipBonusRates?: any;
}

export class UpdatePoolProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  coinId?: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lockDays?: number;

  @IsOptional()
  @IsString()
  dailyRate?: string;

  @IsOptional()
  @IsString()
  minAmount?: string;

  @IsOptional()
  @IsString()
  maxAmount?: string;

  @IsOptional()
  @IsString()
  totalQuota?: string;

  @IsOptional()
  @IsString()
  payCurrencies?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  incomeCoinId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  isHot?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  robotRent?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  robotDays?: number;

  @IsOptional()
  @IsString()
  minRate?: string;

  @IsOptional()
  @IsString()
  maxRate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxInvestCount?: number;

  @IsOptional()
  @IsString()
  vipLevels?: string;

  @IsOptional()
  @IsString()
  shares?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  investDays?: number;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  progress?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  enableRedpacket?: number;

  @IsOptional()
  @IsString()
  redpacketPercent?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  enableDividend?: number;

  @IsOptional()
  @IsString()
  dividendPercent?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  enableDoubleExp?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  enableVipBonus?: number;

  @IsOptional()
  vipBonusRates?: object;
}

// 秒合约配置管理
export class ContractConfigListDto extends PaginationDto {
  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;
}

export class CreateContractConfigDto {
  @IsString()
  symbol: string;

  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  duration: number;

  @IsString()
  profitRate: string;

  @IsString()
  minAmount: string;

  @IsString()
  maxAmount: string;

  @IsOptional()
  @IsString()
  payCurrencies?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number = 1;
}

export class UpdateContractConfigDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  profitRate?: string;

  @IsOptional()
  @IsString()
  minAmount?: string;

  @IsOptional()
  @IsString()
  maxAmount?: string;

  @IsOptional()
  @IsString()
  payCurrencies?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;
}
