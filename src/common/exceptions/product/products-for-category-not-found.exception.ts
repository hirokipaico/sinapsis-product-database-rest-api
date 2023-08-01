import { NotFoundException } from '@nestjs/common';

export class ProductsForCategoryNotFoundException extends NotFoundException {
  constructor(categoryName: string) {
    super(`No products in '${categoryName}' category.`);
  }
}
