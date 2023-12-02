import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

export const Trim = () => {
  return applyDecorators(
    Transform(({ value }) => {
      if (typeof value === 'string') {
        return value.trim();
      }

      return value;
    }),
  );
};
