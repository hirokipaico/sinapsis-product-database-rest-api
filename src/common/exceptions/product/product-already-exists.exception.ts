import { ConflictException } from '@nestjs/common';

export class ProductAlreadyExistsException extends ConflictException {
  constructor(productName: string) {
    super(`Product '${productName}' already exists.`);
  }
}
