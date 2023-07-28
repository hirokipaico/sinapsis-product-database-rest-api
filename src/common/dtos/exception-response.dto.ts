import { ApiProperty } from '@nestjs/swagger';

export class ExceptionResponse {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  constructor(statusCode: number, message: string) {
    this.statusCode = statusCode;
    this.message = message;
  }
}
