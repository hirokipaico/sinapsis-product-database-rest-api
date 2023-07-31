import { NotFoundException } from '@nestjs/common';
import { ExceptionResponse } from '../dtos/exception-response.dto';

export class UserNotFoundExceptionResponse extends ExceptionResponse {
  constructor() {
    super(
      NotFoundException.prototype.getStatus(),
      `User not found in database.`,
    );
  }
}
