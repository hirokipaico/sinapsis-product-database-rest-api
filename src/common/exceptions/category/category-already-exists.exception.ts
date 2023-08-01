import { ConflictException } from '@nestjs/common';

export class CategoryAlreadyExistsException extends ConflictException {
  constructor(categoryName: string) {
    super(`Category with name '${categoryName}' already exists.`);
  }
}
