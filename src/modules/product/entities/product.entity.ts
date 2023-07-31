import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Category } from 'src/modules/category/entities/category.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Product {
  @ApiProperty({
    example: 234567890,
    description: 'Product ID',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Samsung TV LED QLED',
    description: 'Product name',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'Big LED TV perfect for living rooms.',
    description: 'Product description.',
  })
  @Column('text')
  description: string;

  @ApiProperty({
    example: '2499.90',
    description: 'Product price (in PEN)',
  })
  @Column()
  price: number;

  @ApiProperty({
    example: {
      id: 1,
      name: 'Electronics',
    },
    description: 'Product category',
  })
  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  @Exclude()
  category: Category;
}
