import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'User username', example: 'my_user' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: 'User password', example: 'my_secret_password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
