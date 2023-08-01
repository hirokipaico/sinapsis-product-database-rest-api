import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductDto } from '../dtos/product.dto';
import { Category } from 'src/modules/category/entities/category.entity';
import { ProductsForCategoryNotFoundException } from 'src/common/exceptions/product/products-for-category-not-found.exception';
import { CategoryNotFoundException } from 'src/common/exceptions/category/category-not-found.exception';
import { ProductIdNotFoundException } from 'src/common/exceptions/product/product-id-not-found.exception';
import { ApiTags } from '@nestjs/swagger';
import { validate } from 'class-validator';
import { SkipThrottle } from '@nestjs/throttler';
import { ProductAlreadyExistsException } from 'src/common/exceptions/product/product-already-exists.exception';
import { FailedValidationException } from 'src/common/exceptions/auth/failed-validation.exception';
import { CategoryService } from 'src/modules/category/services/category.service';

@ApiTags('products')
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly categoryService: CategoryService,
  ) {}

  @SkipThrottle()
  async findAll(): Promise<Product[]> {
    try {
      const queryBuilder = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .select([
          'product.id',
          'product.name',
          'product.description',
          'product.price',
          'category.name',
        ]);

      return queryBuilder.getMany();
    } catch (error) {
      throw error;
    }
  }

  async findByCategory(categoryName: string): Promise<Product[]> {
    try {
      await this.categoryService.findByName(categoryName);

      const queryBuilder = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .where('category.name = :name', { name: categoryName })
        .select([
          'product.id',
          'product.name',
          'product.description',
          'product.price',
          'category.name',
        ]);

      const products = await queryBuilder.getMany();

      if (products.length === 0) {
        throw new ProductsForCategoryNotFoundException(categoryName);
      }

      return products;
    } catch (error) {
      throw error;
    }
  }

  async create(productDto: ProductDto): Promise<Product> {
    const errors = await validate(productDto);
    if (errors.length > 0) {
      throw new FailedValidationException(errors.toString());
    }

    const [category, existingProduct] = await Promise.all([
      this.categoryRepository.findOne({ where: { name: productDto.category } }),
      this.productRepository.findOne({ where: { name: productDto.name } }),
    ]);

    if (!category) {
      throw new CategoryNotFoundException(productDto.category);
    }

    if (existingProduct) {
      throw new ProductAlreadyExistsException(existingProduct.name);
    }

    const price = parseFloat(productDto.price.toFixed(2));

    const product = new Product();
    product.name = productDto.name;
    product.description = productDto.description;
    product.price = price;
    product.category = category;

    return this.productRepository.save(product);
  }

  async findById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: id },
      relations: ['category'],
    });
    if (!product) {
      throw new ProductIdNotFoundException(id);
    }
    return product;
  }

  async update(id: number, productDto: ProductDto): Promise<Product> {
    const errors = await validate(productDto);
    if (errors.length > 0) {
      throw new FailedValidationException(
        'Please check the request body to comply with productDto schema.',
      );
    }

    const existingProduct = await this.productRepository.findOne({
      relations: ['category'],
      where: { id: id },
    });
    if (!existingProduct) {
      throw new ProductIdNotFoundException(id);
    }

    existingProduct.name = productDto.name;
    existingProduct.description = productDto.description;
    existingProduct.price = productDto.price;

    if (existingProduct.category.name !== productDto.category) {
      const category = await this.categoryRepository.findOne({
        where: { name: productDto.category },
      });
      if (!category) {
        throw new CategoryNotFoundException(productDto.category);
      }
      existingProduct.category = category;
    }

    return this.productRepository.save(existingProduct);
  }

  async delete(id: number): Promise<Product> {
    try {
      const product = await this.findById(id);
      if (!product) {
        throw new ProductIdNotFoundException(id);
      }
      return this.productRepository.remove(product);
    } catch (error) {
      throw error;
    }
  }
}
