import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from './response.dto';

/**
 * Exception response for Swagger Documentation. It not an error object.
 * @var statusCode The response's status code to show in documentation.
 * @var message The response's message to show in documentation.
 */
export class ExceptionResponseDto implements ResponseDto {
  @ApiProperty({
    description: 'HTTP-Exception status',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'HTTP-Exception description',
    example: 'Error description',
  })
  message: string;

  constructor(statusCode: number, message: string) {
    this.statusCode = statusCode;
    this.message = message;
  }
}
