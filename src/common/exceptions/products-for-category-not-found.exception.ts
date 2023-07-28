import { NotFoundException } from '@nestjs/common';
import { ExceptionResponse } from '../dtos/exception-response.dto';

export class ProductsForCategoryNotFoundExceptionResponse extends ExceptionResponse {
  constructor(categoryName: string) {
    super(
      NotFoundException.prototype.getStatus(),
      `Products for the category '${categoryName}' not found.`,
    );
  }
}
