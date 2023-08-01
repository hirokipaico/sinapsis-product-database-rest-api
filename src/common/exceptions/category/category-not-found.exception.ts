import { BadRequestException } from '@nestjs/common';

export class CategoryNotFoundException extends BadRequestException {
  constructor(categoryName: string) {
    super(`Category with name '${categoryName}' was not found.`);
  }
}
