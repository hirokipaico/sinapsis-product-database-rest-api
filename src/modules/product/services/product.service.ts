import { BadRequestException, Injectable } from '@nestjs/common';
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

  /**
   * Retrieves all products from the database.
   * @returns A promise that resolves to an array of products.
   * @throws {Error} If an error occurs during the operation.
   */
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

  /**
   * Retrieves all products belonging to a specific category.
   * @param {string} categoryName - The name of the category.
   * @returns A promise that resolves to an array of products.
   * @throws {Error} If the category is not found or an error occurs during the operation.
   */
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

  /**
   * Creates a new product.
   * @param {ProductDto} productDto - The DTO object containing product data.
   * @returns A promise that resolves to the newly created product.
   * @throws {Error} If the product data is invalid, the category is not found,
   *                 the product already exists, or an error occurs during the operation.
   */
  async create(productDto: ProductDto): Promise<Product> {
    try {
      const parsedPrice = parseFloat(productDto.price.toFixed(2));
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        throw new FailedValidationException(
          'Invalid price. Please provide a valid positive number.',
        );
      }

      const errors = await validate(productDto);
      if (errors.length > 0) {
        throw new FailedValidationException(errors.toString());
      }

      const [category, existingProduct] = await Promise.all([
        this.categoryRepository.findOne({
          where: { name: productDto.category },
        }),
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
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves a product by its ID.
   * @param {number} productId - The ID of the product to retrieve.
   * @returns A promise that resolves to the retrieved product.
   * @throws {Error} If the product ID is invalid, the product is not found,
   *                 or an error occurs during the operation.
   */
  async findById(productId: number): Promise<Product> {
    try {
      console.log(
        'findById service: productId type:',
        typeof productId,
        productId,
      );

      if (isNaN(productId) || productId <= 0) {
        throw new BadRequestException(
          'Invalid product ID. Please enter a valid product ID.',
        );
      }

      const product = await this.productRepository.findOne({
        where: { id: productId },
      });

      if (!product) {
        throw new ProductIdNotFoundException(productId);
      }

      return product;
    } catch (error) {
      console.log(
        'findById service: Error in findById service. Throwing error internal server...',
        error,
      );
      throw error;
    }
  }

  /**
   * Updates an existing product.
   * @param {number} id - The ID of the product to update.
   * @param {ProductDto} productDto - The DTO object containing the updated product data.
   * @returns A promise that resolves to the updated product.
   * @throws {Error} If the product data is invalid, the product is not found,
   *                 the category is not found, or an error occurs during the operation.
   */
  async update(id: number, productDto: ProductDto): Promise<Product> {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deletes a product by its ID.
   * @param {number} id - The ID of the product to delete.
   * @returns A promise that resolves to the deleted product.
   * @throws {Error} If the product is not found or an error occurs during the operation.
   */
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
