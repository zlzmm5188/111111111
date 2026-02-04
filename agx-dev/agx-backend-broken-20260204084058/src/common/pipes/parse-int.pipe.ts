import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    if (value === undefined || value === null) {
      return undefined;
    }
    
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException(`Validation failed: "${metadata.data}" must be a number`);
    }
    return val;
  }
}

/**
 * 默认值为 1 的管道
 */
@Injectable()
export class ParseIntDefaultPipe implements PipeTransform<string, number> {
  constructor(private defaultValue: number = 1) {}
  
  transform(value: string, metadata: ArgumentMetadata): number {
    if (value === undefined || value === null || value === '') {
      return this.defaultValue;
    }
    
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      return this.defaultValue;
    }
    return val;
  }
}
