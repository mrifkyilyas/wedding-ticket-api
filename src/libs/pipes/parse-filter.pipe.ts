import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseFilterPipe implements PipeTransform<string, string[]> {
  transform(value: string, metadata: ArgumentMetadata): string[] {
    if (value === undefined || value === '') {
      return [];
    }
    if (typeof value !== 'string') {
      throw new BadRequestException('Validation failed (string is expected)');
    }
    const pattern = /^(?:[\w.-]+,)*(?:[\w.-]+)$/;
    if (!pattern.test(value)) {
      throw new BadRequestException('Validation failed (invalid pattern)');
    }
    return value.split(',');
  }
}
