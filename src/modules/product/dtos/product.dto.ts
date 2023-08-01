import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class ProductDto {
  @ApiProperty({
    example: 'T-shirt',
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
    type: Number,
    example: 129.49,
    description: 'Price of product (in PEN)',
  })
  @IsNotEmpty({
    message: 'Must not be empty',
  })
  @IsNumber({}, { message: 'Price must be a valid number.' })
  @Min(0, { message: 'Price cannot be negative.' })
  price: number;
}
