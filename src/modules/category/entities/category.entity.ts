import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Product } from 'src/modules/product/entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Category {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({
    unique: true,
  })
  name: string;

  @ApiProperty()
  @Column('text')
  description: string;

  @ApiProperty({ type: () => Product, isArray: true })
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
