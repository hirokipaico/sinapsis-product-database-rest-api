import { NotFoundException } from '@nestjs/common';
import { ExceptionResponse } from '../dtos/exception-response.dto';

export class CategoryNotFoundExceptionResponse extends ExceptionResponse {
  constructor(categoryName: string) {
    super(
      NotFoundException.prototype.getStatus(),
      `Category with name '${categoryName}' not found.`,
    );
  }
}
