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
import { ValidationPipe } from '@nestjs/common/pipes';
import { ExceptionResponseDto } from 'src/common/dtos/exception-response.dto';
import { FailedValidationException } from 'src/common/exceptions/auth/failed-validation.exception';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { ProductAlreadyExistsException } from 'src/common/exceptions/product/product-already-exists.exception';
import { CategoryNotFoundException } from 'src/common/exceptions/category/category-not-found.exception';
import { Public } from 'src/common/constants/auth';
import { ProductIdNotFoundException } from 'src/common/exceptions/product/product-id-not-found.exception';
import { Response } from 'express';
import { NotFoundError } from 'rxjs';
import { ResponseDto } from 'src/common/dtos/response.dto';

@ApiTags('products')
@UseGuards(AuthGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Public()
  @ApiResponse({
    status: 200,
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
    status: HttpStatus.NO_CONTENT,
    description: 'Products for the specified category were not found. Custom',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category was not found.',
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

  @Post()
  @UsePipes(ValidationPipe)
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
    description: 'Category with name 1 not found.',
    type: ExceptionResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    type: ExceptionResponseDto,
  })
  @ApiBody({ type: ProductDto, description: 'Product data' })
  async create(@Body() productDto: ProductDto): Promise<Product> {
    try {
      return await this.productService.create(productDto);
    } catch (error) {
      if (error instanceof FailedValidationException) {
        throw new HttpException(
          { message: error.message, code: error.constructor.name },
          HttpStatus.BAD_REQUEST,
        );
      } else if (error instanceof ProductAlreadyExistsException) {
        throw new HttpException(
          { message: error.message, code: error.constructor.name },
          HttpStatus.CONFLICT,
        );
      } else if (error instanceof CategoryNotFoundException) {
        throw new HttpException(
          { message: error.message, code: error.constructor.name },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          { message: 'Internal server error', code: 'InternalServerError' },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Put('id/:id')
  @ApiResponse({
    status: 200,
    description: 'Product with ID 1 has been successfully updated.',
    type: ResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Invalid request body because of failed ProductDTO validation.',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Invalid request body because of failed ProductDTO validation.',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product with ID 1 was not found.',
    type: ExceptionResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    type: ExceptionResponseDto,
  })
  @UsePipes(ValidationPipe)
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: ProductDto, description: 'Product data' })
  async update(
    @Param('id') id: number,
    @Body() productDto: ProductDto,
    @Res() response: Response,
  ): Promise<Response> {
    try {
      this.productService.update(id, productDto);
      return response.status(200).json({
        statusCode: 200,
        message: `Product with ID ${id} has been successfully updated.`,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof NotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          'Internal server error.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Delete('id/:id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product with ID 1 has been successfully deleted.',
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
    @Param('id') id: number,
    @Res() response: Response,
  ): Promise<Response> {
    try {
      this.productService.delete(id);
      return response.status(200).json({
        statusCode: 200,
        message: `Product with ID ${id} has been successfully deleted.`,
      });
    } catch (error) {
      if (error instanceof FailedValidationException) {
      } else if (error instanceof ProductIdNotFoundException) {
        throw new HttpException(
          { message: error.message, code: error.constructor.name },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          { message: 'Internal server error', code: 'InternalServerError' },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
