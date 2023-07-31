import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenResponseDto {
  @ApiProperty({
    description: 'Connection status',
    example: 'User logged in successfully.',
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}
