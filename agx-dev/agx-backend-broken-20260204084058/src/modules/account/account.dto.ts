import { IsString, Length, Matches, IsOptional, IsNumber, IsInt, Min } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(4, 20, { message: '用户名长度 4-20 位' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '用户名只能包含字母、数字、下划线' })
  username: string;

  @IsString()
  @Length(8, 20, { message: '密码长度 8-20 位' })
  password: string;

  @IsString()
  @Length(6, 6, { message: '邀请码必须是 6 位' })
  inviteCode: string;
}

export class LoginDto {
  @IsString()
  @Length(4, 50)
  username: string;

  @IsString()
  @Length(8, 20)
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @Length(8, 20, { message: '新密码长度 8-20 位' })
  newPassword: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  nickname?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  @Length(34, 34, { message: 'TRON地址必须是34位' })
  @Matches(/^T[a-zA-Z0-9]{33}$/, { message: '请输入有效的TRON地址（以T开头）' })
  tronAddress?: string;
}

export class SubmitKycDto {
  @IsString()
  @Length(2, 50)
  realName: string;

  @IsString()
  @Length(6, 50)
  idNumber: string;

  @IsInt()
  idType: number; // 1:身份证 2:护照

  @IsOptional()
  @IsString()
  frontImage?: string;

  @IsOptional()
  @IsString()
  backImage?: string;

  @IsOptional()
  @IsString()
  holdImage?: string;
}

export class WithdrawDto {
  @IsString()
  coin: string;

  @IsString()
  chain: string;

  @IsString()
  amount: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  payPassword?: string;
}

export class GetDepositAddressDto {
  @IsString()
  coin: string;

  @IsString()
  chain: string;
}

export class CreateDepositOrderDto {
  @IsString()
  coin: string;

  @IsString()
  chain: string;

  @IsString()
  amount: string;
}

// 设置交易密码
export class SetTradePasswordDto {
  @IsString()
  @Length(6, 6, { message: '交易密码必须是6位数字' })
  @Matches(/^\d{6}$/, { message: '交易密码必须是6位数字' })
  tradePassword: string;

  @IsOptional()
  @IsString()
  loginPassword?: string; // 首次设置需要验证登录密码
}

// 修改交易密码
export class ChangeTradePasswordDto {
  @IsString()
  @Length(6, 6, { message: '交易密码必须是6位数字' })
  oldTradePassword: string;

  @IsString()
  @Length(6, 6, { message: '交易密码必须是6位数字' })
  @Matches(/^\d{6}$/, { message: '交易密码必须是6位数字' })
  newTradePassword: string;
}

// 验证交易密码
export class VerifyTradePasswordDto {
  @IsString()
  @Length(6, 6, { message: '交易密码必须是6位数字' })
  tradePassword: string;
}
