import { NotFoundException } from '@nestjs/common';

export class ProductIdNotFoundException extends NotFoundException {
  constructor(productId: number) {
    super(`Product with ID '${productId}' was not found.`);
  }
}
