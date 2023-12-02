import { BadRequestException, ValidationPipeOptions } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ValidationFailedException extends BadRequestException {
  constructor(errors: ValidationError[]) {
    super({
      message: 'Cannot process request due to validation errors',
      errors,
    });
  }
}

export const validationFailedExceptionFactory: ValidationPipeOptions['exceptionFactory'] = (
  errors,
) => {
  return new ValidationFailedException(
    errors.map((error) => ({
      property: error.property,
      value: error.value,
      messages: Object.values(error.constraints),
    })),
  );
};
