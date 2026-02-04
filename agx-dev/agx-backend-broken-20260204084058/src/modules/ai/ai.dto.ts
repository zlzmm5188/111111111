import { IsString, IsOptional, IsArray, IsNumber, IsIn } from 'class-validator';

export class ChatDto {
  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsArray()
  @IsOptional()
  history?: Array<{ role: string; content: string }>;
}

export class CustomerServiceChatDto {
  @IsString()
  message: string;

  @IsArray()
  @IsOptional()
  history?: Array<{ role: string; content: string }>;
}

export class DevAssistDto {
  @IsString()
  prompt: string;

  @IsString()
  @IsOptional()
  @IsIn(['code', 'review', 'explain', 'debug', 'optimize', 'test', 'document', 'general'])
  task?: 'code' | 'review' | 'explain' | 'debug' | 'optimize' | 'test' | 'document' | 'general';

  @IsString()
  @IsOptional()
  context?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsNumber()
  @IsOptional()
  maxTokens?: number;

  @IsNumber()
  @IsOptional()
  temperature?: number;
}
