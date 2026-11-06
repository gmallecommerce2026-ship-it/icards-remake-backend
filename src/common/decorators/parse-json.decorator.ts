import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';

/** Cho phép field là JSON string (multipart/form-data) HOẶC object thật (application/json). */
export const ParseJson = () =>
  Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    if (value === '') return undefined;
    try {
      return JSON.parse(value);
    } catch {
      throw new BadRequestException('Trường JSON không hợp lệ');
    }
  });
