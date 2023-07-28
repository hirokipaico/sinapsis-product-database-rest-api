import { ConflictException } from '@nestjs/common';
import { ExceptionResponse } from '../dtos/exception-response.dto';

export class CategoryAlreadyExistsExceptionResponse extends ExceptionResponse {
  constructor(categoryName: string) {
    super(
      ConflictException.prototype.getStatus(),
      `Category named ${categoryName} already exists in the database.`,
    );
  }
}
