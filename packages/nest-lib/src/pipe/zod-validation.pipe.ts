import { Injectable, PipeTransform } from '@nestjs/common';
import { ApiZodValidationError } from '@repo/shared';
import { ZodError, type ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodType<T>) {}

  public transform(value: unknown): T {
    try {
      const result = this.schema.parse(value);
      return result;
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        throw new ApiZodValidationError(error);
      }
      throw error;
    }
  }
}
