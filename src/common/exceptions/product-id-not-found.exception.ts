import { NotFoundException } from '@nestjs/common';
import { ExceptionResponse } from '../dtos/exception-response.dto';

export class ProductIdNotFoundExceptionResponse extends ExceptionResponse {
  constructor(productId: number) {
    super(
      NotFoundException.prototype.getStatus(),
      `Product with ID '${productId}' not found.`,
    );
  }
}
