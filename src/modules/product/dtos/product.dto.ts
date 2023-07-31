import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDecimal } from 'class-validator';

export class ProductDto {
  @ApiProperty({
    example: 'Modern T-shirt',
    description: 'Product name',
  })
  @IsNotEmpty({
    message: 'Must not be empty',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Short sleeve t-shirt in black color and white stripes for women.',
    description: 'Product description',
  })
  @IsNotEmpty({
    message: 'Must not be empty',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 'Clothing',
    description: 'Product category',
  })
  @IsNotEmpty({
    message: 'Must not be empty',
  })
  @IsString()
  category: string;

  @ApiProperty({
    type: 'IsDecimal',
    format: 'binary',
    example: 129.9,
    description: 'Price of product (in PEN)',
  })
  @IsNotEmpty({
    message: 'Must not be empty',
  })
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
