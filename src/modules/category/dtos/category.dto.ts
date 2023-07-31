import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CategoryDto {
  @ApiProperty({
    example: 'Electronics',
    description: `Category's name.`,
  })
  @IsNotEmpty({
    message: 'Must not be empty',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: `Electronics items for the home.`,
    description: `Category's description.`,
  })
  @IsNotEmpty({
    message: 'Must not be empty',
  })
  @IsString()
  description: string;
}
