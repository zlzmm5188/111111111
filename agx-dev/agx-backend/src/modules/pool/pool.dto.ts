import { IsNumber, IsPositive, Min, IsNotEmpty, Length } from 'class-validator';

export class SubscribePoolDto {
  @IsNumber()
  @IsPositive()
  productId: number;

  @IsNumber()
  @IsPositive()
  @Min(0.00000001)
  amount: number;

  @IsNotEmpty({ message: '交易密码不能为空' })
  @Length(6, 20, { message: '交易密码长度为6-20位' })
  tradePassword: string;
}

export class RedeemPoolDto {
  @IsNumber()
  @IsPositive()
  holdingId: number;

  @IsNotEmpty({ message: '交易密码不能为空' })
  @Length(6, 20, { message: '交易密码长度为6-20位' })
  tradePassword: string;
}
