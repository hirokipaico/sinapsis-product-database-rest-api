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
  HttpException,
  HttpStatus,
  Res,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { ProductDto } from '../dtos/product.dto';
import { Product } from '../entities/product.entity';
import {
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { ParseIntPipe, ValidationPipe } from '@nestjs/common/pipes';
import { ExceptionResponseDto } from 'src/common/dtos/exception-response.dto';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { Public } from 'src/common/constants/auth';
import { Response } from 'express';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { ProductIdNotFoundException } from 'src/common/exceptions/product/product-id-not-found.exception';

@ApiTags('products')
@UseGuards(AuthGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Retrieves all products from the database.
   * @returns {Promise<Product[]>} A promise that resolves to an array of products.
   * @throws {HttpException} If an error occurs during the operation, returns an HTTP 500 error.
   */
  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all products',
    type: ProductDto,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    type: ExceptionResponseDto,
  })
  async findAll(): Promise<Product[]> {
    try {
      return this.productService.findAll();
    } catch (error) {
      throw new HttpException(
        'Internal server error.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves all products belonging to a specific category.
   * @param {string} category - The name of the category.
   * @returns {Promise<Product[]>} A promise that resolves to an array of products.
   * @throws {HttpException} If the category is not found or no products found in the category,
   *                          returns an appropriate HTTP error.
   */
  @Get(':category')
  @Public()
  @ApiParam({ name: 'category', description: 'Product category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all products from a specified category',
    type: ProductDto,
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Category not found',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No products found in category',
    type: ExceptionResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    type: ExceptionResponseDto,
  })
  async findByCategory(
    @Param('category') category: string,
  ): Promise<Product[]> {
    try {
      return this.productService.findByCategory(category);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          'Internal server error.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Retrieves a product by its ID.
   * @param {number} id - The ID of the product to retrieve.
   * @returns {Promise<Product>} A promise that resolves to the retrieved product.
   * @throws {HttpException} If the product ID is invalid or the product is not found,
   *                          returns an appropriate HTTP error.
   */
  @Get('id/:id')
  @Public()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return product by ID',
    type: ProductDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product with ID not found',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid product ID. Please enter a valid product ID.',
    type: ExceptionResponseDto,
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async findById(@Param('id', ParseIntPipe) productId: number) {
    try {
      return await this.productService.findById(productId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error instanceof BadRequestException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          'Internal server error.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Creates a new product.
   * @param {ProductDto} productDto - The DTO object containing product data.
   * @returns {Promise<Product>} A promise that resolves to the newly created product.
   * @throws {HttpException} If the product data is invalid, the category is not found,
   *                          the product already exists, or an error occurs during the operation,
   *                          returns an appropriate HTTP error.
   */
  @Post()
  @UsePipes(new ValidationPipe())
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Creates a new product',
    type: ProductDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Product already exists in the database.',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Failed validation. Please check the request body to comply with productDto schema.',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category with the specified name not found.',
    type: ExceptionResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    type: ExceptionResponseDto,
  })
  @ApiBody({ type: ProductDto, description: 'Product data' })
  async create(@Body() productDto: ProductDto): Promise<Product> {
    try {
      return this.productService.create(productDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Updates an existing product.
   * @param {string} id - The ID of the product to update.
   * @param {ProductDto} productDto - The DTO object containing the updated product data.
   * @param {Response} response - Express response object for sending the HTTP response.
   * @returns {Promise<Response>} A promise that resolves to the HTTP response.
   * @throws {HttpException} If the product data is invalid, the product is not found,
   *                          the category is not found, or an error occurs during the operation,
   *                          returns an appropriate HTTP error.
   */
  @Put('id/:id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product with the specified ID has been successfully updated.',
    type: ResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Invalid request body because of failed ProductDTO validation.',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product with the specified ID not found.',
    type: ExceptionResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    type: ExceptionResponseDto,
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: ProductDto, description: 'Product data' })
  async update(
    @Param('id') id: string,
    @Body() productDto: ProductDto,
    @Res() response: Response,
  ): Promise<Response> {
    try {
      const productId = parseInt(id, 10);
      await this.productService.update(productId, productDto);
      return response.status(200).json({
        statusCode: 200,
        message: `Product with ID ${id} has been successfully updated.`,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof ProductIdNotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          'Internal server error.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Deletes a product by its ID.
   * @param {string} id - The ID of the product to delete.
   * @param {Response} response - Express response object for sending the HTTP response.
   * @returns {Promise<Response>} A promise that resolves to the HTTP response.
   * @throws {HttpException} If the product is not found or an error occurs during the operation,
   *                          returns an appropriate HTTP error.
   */
  @Delete('id/:id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product with the specified ID has been successfully deleted.',
    type: ResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product with the specified ID not found.',
    type: ExceptionResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    type: ExceptionResponseDto,
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async delete(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<Response> {
    try {
      const productId = parseInt(id, 10);
      this.productService.delete(productId);
      return response.status(200).json({
        statusCode: 200,
        message: `Product with ID ${id} has been successfully deleted.`,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          { message: 'Internal server error', code: 'InternalServerError' },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
