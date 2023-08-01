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
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column('text')
  description: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty()
  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  @JoinColumn({ name: 'category_id' })
  @Exclude()
  category: Category;
}
