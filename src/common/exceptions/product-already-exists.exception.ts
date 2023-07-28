import { ConflictException } from '@nestjs/common';
import { ExceptionResponse } from '../dtos/exception-response.dto';

export class ProductAlreadyExistsExceptionResponse extends ExceptionResponse {
  constructor(productName: string) {
    super(
      ConflictException.prototype.getStatus(),
      `Product named ${productName} with these characteristics already exists in the database.`,
    );
  }
}
