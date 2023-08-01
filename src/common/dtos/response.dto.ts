import { ApiProperty } from '@nestjs/swagger';

/**
 * Response for Swagger Documentation.
 * @var statusCode The response's status code to show in documentation.
 * @var message The response's message to show in documentation.
 */
export class ResponseDto {
  @ApiProperty({
    description: 'HTTP-Exception status',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'HTTP-Exception description',
    example: 'Response description',
  })
  message: string;

  constructor(statusCode: number, message: string) {
    this.statusCode = statusCode;
    this.message = message;
  }
}
