import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Username', example: 'sinapsis_user' })
  username: string;

  @ApiProperty({
    description: 'Password',
    example: 'sinapsis_password',
  })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ description: 'Username', example: 'sinapsis_new_user' })
  username: string;

  @ApiProperty({
    description: 'Password',
    example: 'sinapsis_new_password',
  })
  password: string;
}
