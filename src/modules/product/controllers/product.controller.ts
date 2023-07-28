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
import { AuthGuard } from 'src/auth/auth.guard';
import { ExceptionResponse } from 'src/common/dtos/exception-response.dto';
import { FailedValidationExceptionResponse } from 'src/common/exceptions/failed-validation.exception';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

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

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Creates a new product',
    type: Product,
  })
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard)
  @ApiBody({ type: ProductDto, description: 'Product data' })
  @ApiNotFoundResponse({
    description: 'Specified category does not exist in database.',
    type: ExceptionResponse,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid request body because of failed ProductDTO validation.',
    type: FailedValidationExceptionResponse,
  })
  @ApiConflictResponse({
    description: 'Product already exists in database.',
    type: ExceptionResponse,
  })
  async create(@Body() productDto: ProductDto): Promise<Product> {
    return this.productService.create(productDto);
  }

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
    description: 'Category with the specified name not found.',
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
