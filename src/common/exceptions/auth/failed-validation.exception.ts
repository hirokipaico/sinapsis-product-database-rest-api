import { BadRequestException } from '@nestjs/common';

export class FailedValidationException extends BadRequestException {
  constructor(message: string) {
    super(`Validation failed: ${message}`);
  }
}
