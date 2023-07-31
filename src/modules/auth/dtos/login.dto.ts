import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'User username', example: 'sinapsis_user' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: 'User password', example: 'sinapsis_password' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
