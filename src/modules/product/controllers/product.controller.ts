import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { ProductDto } from '../dtos/product.dto';
import { Product } from '../entities/product.entity';
import {
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common/pipes';
import { ExceptionResponse } from 'src/common/dtos/exception-response.dto';
import { FailedValidationExceptionResponse } from 'src/common/exceptions/failed-validation.exception';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Get all products.
   * @returns {Promise<Product[]>} A promise that resolves to an array of Product objects.
   */
  @UseGuards(AuthGuard)
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returns all products',
    type: Product,
    isArray: true,
  })
  async findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  /**
   * Get products by category name.
   * @param {string} category - The name of the category to filter products by.
   * @returns {Promise<Product[]>} A promise that resolves to an array of Product objects that belong to the specified category.
   */
  @Get(':category')
  @ApiParam({ name: 'category', description: 'Product category' })
  @ApiResponse({
    status: 200,
    description: 'Return all products from a specified category',
    type: Product,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Products for the specified category were not found.',
    type: ExceptionResponse,
  })
  async findByCategory(
    @Param('category') category: string,
  ): Promise<Product[]> {
    return this.productService.findByCategory(category);
  }

  /**
   * Get a product by ID.
   * @param {number} id - The ID of the product to be found.
   * @returns {Promise<Product>} A promise that resolves to the found Product object.
   */
  @Get('id/:id')
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a specific product',
    type: Product,
  })
  @ApiNotFoundResponse({
    description: 'Product with the specified ID not found.',
    type: ExceptionResponse,
  })
  async findById(@Param('id') id: number): Promise<Product> {
    return this.productService.findById(id);
  }

  /**
   * Create a new product.
   * @param {ProductDto} productDto - The product data to be saved.
   * @returns {Promise<Product>} A promise that resolves to the created Product object.
   * @throws {FailedValidationExceptionResponse} If the request body fails ProductDTO validation.
   * @throws {ExceptionResponse} If the product already exists in the database.
   */
  @Post()
  @ApiResponse({
    status: 201,
    description: 'Creates a new product',
    type: Product,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid request body because of failed ProductDTO validation.',
    type: FailedValidationExceptionResponse,
  })
  @ApiConflictResponse({
    description: 'Product already exists in the database.',
    type: ExceptionResponse,
  })
  @ApiBody({ type: ProductDto, description: 'Product data' })
  async create(@Body() productDto: ProductDto): Promise<Product> {
    return this.productService.create(productDto);
  }

  /**
   * Update a product by ID.
   * @param {number} id - The ID of the product to update.
   * @param {ProductDto} productDto - The updated product data.
   * @returns {Promise<Product>} The updated product.
   * @throws {ExceptionResponse} If the product with the given ID is not found in the database.
   * @throws {FailedValidationExceptionResponse} If given request body doesn't comply with DTO.
   * @throws {ExceptionResponse} If the specified product category does not exist in the database.
   */
  @Put('id/:id')
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Updates an existing product',
    type: Product,
  })
  @UsePipes(new ValidationPipe())
  @ApiBody({ type: ProductDto, description: 'Product data' })
  @ApiNotFoundResponse({
    description: 'Product with the specified ID not found.',
    type: ExceptionResponse,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid request body because of failed ProductDTO validation.',
    type: FailedValidationExceptionResponse,
  })
  async update(
    @Param('id') id: number,
    @Body() productDto: ProductDto,
  ): Promise<Product> {
    return this.productService.update(id, productDto);
  }

  /**
   * Delete a product by ID.
   * @param {number} id - The ID of the product to delete.
   * @returns {Promise<void>} A promise that resolves when the product is deleted.
   * @throws {ExceptionResponse} If the product with the given ID is not found.
   */
  @Delete('id/:id')
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Deletes a product',
    type: Product,
  })
  @ApiNotFoundResponse({
    description: 'Product with the specified ID not found.',
    type: ExceptionResponse,
  })
  async delete(@Param('id') id: number): Promise<Product> {
    return this.productService.delete(id);
  }
}
