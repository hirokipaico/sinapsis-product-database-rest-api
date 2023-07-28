import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDecimal } from 'class-validator';

export class ProductDto {
  @ApiProperty()
  @IsNotEmpty({
    message: 'Must not be empty.',
  })
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDecimal(
    {
      force_decimal: true,
      decimal_digits: '2,',
      locale: 'es-ES',
    },
    {
      message: 'Must be a valid currency amount with 2 digits after the point.',
    },
  )
  price: number;
}
