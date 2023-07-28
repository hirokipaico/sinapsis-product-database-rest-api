import { BadRequestException } from '@nestjs/common';
import { ExceptionResponse } from '../dtos/exception-response.dto';

export class FailedValidationExceptionResponse extends ExceptionResponse {
  constructor(message: string) {
    super(BadRequestException.prototype.getStatus(), message);
  }
}
