import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Category {
  @ApiProperty({
    example: `1`,
    description: 'Unique identifier of the category',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Electronics',
    description: "Category's Name",
  })
  @Column({
    unique: true,
  })
  name: string;

  @ApiProperty({
    example: 'Electronics items for the home.',
    description: `Category's description.`,
  })
  @Column('text')
  description: string;

  @ApiProperty({
    type: () => [Product],
    isArray: true,
    description: 'Product list in category.',
    example: [
      {
        id: 234567890,
        name: 'Samsung TV LED QLED Series UA43TU7',
        description: 'Big LED TV perfect for living rooms.',
        price: 199.99,
      },
    ],
  })
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
