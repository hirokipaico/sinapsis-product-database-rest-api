import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductDto } from '../dtos/product.dto';
import { Category } from 'src/modules/category/entities/category.entity';
import { ProductsForCategoryNotFoundExceptionResponse } from 'src/common/exceptions/products-for-category-not-found.exception';
import { CategoryNotFoundExceptionResponse } from 'src/common/exceptions/category-not-found.exception';
import { ProductIdNotFoundExceptionResponse } from 'src/common/exceptions/product-id-not-found.exception';
import { ApiTags } from '@nestjs/swagger';
import { validate } from 'class-validator';
import { SkipThrottle } from '@nestjs/throttler';
import { ProductAlreadyExistsExceptionResponse } from 'src/common/exceptions/product-already-exists.exception';
import { FailedValidationExceptionResponse } from 'src/common/exceptions/failed-validation.exception';

@ApiTags('products')
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Get all products from the database.
   * @returns {Promise<Product[]>} A promise that resolves to an array of Product objects.
   */
  @SkipThrottle()
  async findAll(): Promise<Product[]> {
    return this.productRepository.find({ relations: ['category'] });
  }

  /**
   * Find products by category name.
   * @param {string} categoryName The name of the category to filter products by.
   * @returns {Promise<Product[]>} A promise that resolves to an array of Product objects that belong to the specified category.
   * @throws {CategoryNotFoundException} If the category with the specified name does not exist in the database.
   * @throws {ProductsForCategoryNotFoundException} If there are no products with the specified category in the database.
   */
  async findByCategory(categoryName: string): Promise<Product[]> {
    const category = await this.categoryRepository.findOne({
      where: { name: categoryName },
    });
    if (!category) {
      throw new CategoryNotFoundExceptionResponse(categoryName);
    }

    const products = await this.productRepository.find({
      where: { category },
      relations: ['category'],
    });

    if (products.length === 0) {
      throw new ProductsForCategoryNotFoundExceptionResponse(categoryName);
    }

    return products;
  }

  /**
   * Create a new product in the database.
   * @param {ProductDto} productDto The product data to be saved.
   * @returns {Promise<Product>} A promise that resolves to the created Product object.
   * @throws {CategoryNotFoundException} If the category with the specified name does not exist in the database.
   */
  async create(productDto: ProductDto): Promise<Product> {
    const errors = await validate(productDto);
    if (errors.length > 0) {
      throw new FailedValidationExceptionResponse(errors.toString());
    }

    const [category, existingProduct] = await Promise.all([
      this.categoryRepository.findOne({ where: { name: productDto.category } }),
      this.productRepository.findOne({ where: { name: productDto.name } }),
    ]);

    if (!category) {
      throw new CategoryNotFoundExceptionResponse(productDto.category);
    }

    if (existingProduct) {
      throw new ProductAlreadyExistsExceptionResponse(existingProduct.name);
    }

    const price = parseFloat(productDto.price.toFixed(2));

    const product = new Product();
    product.name = productDto.name;
    product.description = productDto.description;
    product.price = price;
    product.category = category;

    return this.productRepository.save(product);
  }

  /**
   * Find a product by its ID.
   * @param {number} id The ID of the product to be found.
   * @returns {Promise<Product>} A promise that resolves to the found Product object.
   * @throws {ProductIdNotFoundException} If the product with the specified ID does not exist in the database.
   */
  async findById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: id },
      relations: ['category'],
    });
    if (!product) {
      throw new ProductIdNotFoundExceptionResponse(id);
    }
    return product;
  }

  /**
   * Update a product by its ID.
   *
   * @param {number} id - The ID of the product to update.
   * @param {ProductDto} productDto - The DTO containing the updated product data.
   * @throws {ProductIdNotFoundException} If the product with the given ID is not found in database.
   * @throws {BadRequestException} If given request body doesn't comply with DTO.
   * @throws {CategoryNotFoundException} If the specified product category does not exist in the database.
   * @returns {Promise<Product>} The updated product.
   */
  async update(id: number, productDto: ProductDto): Promise<Product> {
    const existingProduct = await this.productRepository.findOne({
      relations: ['category'],
      where: { id: id },
    });
    if (!existingProduct) {
      throw new ProductIdNotFoundExceptionResponse(id);
    }

    const errors = await validate(productDto);
    if (errors.length > 0) {
      throw new BadRequestException(
        'Validation failed. Please check the request body to comply with productDto schema.',
      );
    }

    existingProduct.name = productDto.name;
    existingProduct.description = productDto.description;
    existingProduct.price = productDto.price;

    // Check if the category in the DTO is different from the existing category
    if (existingProduct.category.name !== productDto.category) {
      const category = await this.categoryRepository.findOne({
        where: { name: productDto.category },
      });
      if (!category) {
        throw new CategoryNotFoundExceptionResponse(productDto.category);
      }
      existingProduct.category = category;
    }

    return this.productRepository.save(existingProduct);
  }

  /**
   * Delete a product by its ID.
   *
   * @param {number} id - The ID of the product to delete.
   * @throws {ProductIdNotFoundException} If the product with the given ID is not found.
   * @returns {Promise<Product>} The deleted product.
   */
  async delete(id: number): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new ProductIdNotFoundExceptionResponse(id);
    }
    return this.productRepository.remove(product);
  }
}
