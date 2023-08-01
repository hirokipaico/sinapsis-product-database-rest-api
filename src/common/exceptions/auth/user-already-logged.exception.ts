import { ConflictException } from '@nestjs/common';

export class UserAlreadyLoggedException extends ConflictException {
  constructor() {
    super(`Already logged in. You can already access authenticated endpoints.`);
  }
}
