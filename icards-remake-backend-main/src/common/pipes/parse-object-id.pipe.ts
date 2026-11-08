import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import { isObjectId } from '../utils/object-id.js';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isObjectId(value)) throw new BadRequestException('ID không hợp lệ');
    return value;
  }
}
