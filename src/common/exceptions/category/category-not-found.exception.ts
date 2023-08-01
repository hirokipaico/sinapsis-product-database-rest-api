import { NotFoundException } from '@nestjs/common';

export class CategoryNotFoundException extends NotFoundException {
  constructor(categoryName: string) {
    super(`Category with name '${categoryName}' not found.`);
  }
}
