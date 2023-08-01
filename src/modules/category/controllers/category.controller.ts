import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Put,
  ValidationPipe,
  UsePipes,
  HttpException,
  HttpStatus,
  Res,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { CategoryDto } from '../dtos/category.dto';
import { Category } from '../entities/category.entity';
import {
  ApiTags,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { NotFoundError } from 'rxjs';
import { Public } from 'src/common/constants/auth';
import { ExceptionResponseDto } from 'src/common/dtos/exception-response.dto';
import { ResponseDto } from 'src/common/dtos/response.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Retrieves all categories from the database.
   * @returns {Promise<Category[]>} A promise that resolves to an array of categories.
   * @throws {HttpException} If an error occurs during the operation, returns an HTTP 500 error.
   */
  @Get()
  @Public()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all categories',
    type: CategoryDto,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    type: ExceptionResponseDto,
  })
  async findAll(): Promise<Category[]> {
    try {
      return this.categoryService.findAll();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Creates a new category.
   * @param {CategoryDto} categoryDto - The DTO object containing category data.
   * @returns {Promise<Category>} A promise that resolves to the newly created category.
   * @throws {HttpException} If the category data is invalid, the category already exists,
   *                          or an error occurs during the operation, returns an appropriate HTTP error.
   */
  @Post()
  @UsePipes(ValidationPipe)
  @ApiBody({ type: CategoryDto, description: 'Category data' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Creates a new category',
    type: CategoryDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category already exists in the database.',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Failed validation. Please check the request body to comply with categoryDto schema.',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category with name not found.',
    type: ExceptionResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    type: ExceptionResponseDto,
  })
  async create(@Body() categoryDto: CategoryDto): Promise<Category> {
    try {
      return this.categoryService.create(categoryDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
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
   * Retrieves a category by its name.
   * @param {string} categoryName - The name of the category to retrieve.
   * @returns {Promise<Category>} A promise that resolves to the retrieved category.
   * @throws {HttpException} If the category is not found or an error occurs during the operation,
   *                          returns an appropriate HTTP error.
   */
  @Get(':name')
  @Public()
  @ApiParam({ name: 'name', description: 'Category name' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return a category by its name',
    type: CategoryDto,
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
  async findByName(@Param('name') categoryName: string): Promise<Category> {
    try {
      return this.categoryService.findByName(categoryName);
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
   * Updates an existing category.
   * @param {string} categoryName - The name of the category to update.
   * @param {CategoryDto} categoryDto - The DTO object containing the updated category data.
   * @returns {Promise<Category>} A promise that resolves to the updated category.
   * @throws {HttpException} If the category data is invalid, the category is not found,
   *                          or an error occurs during the operation, returns an appropriate HTTP error.
   */
  @Put(':name')
  @UsePipes(new ValidationPipe())
  @ApiParam({
    name: 'name',
    description: 'Category name',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Updates an existing category',
    type: CategoryDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Failed validation. Please check the request body to comply with categoryDto schema.',
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
  async update(
    @Param('name') categoryName: string,
    @Body() categoryDto: CategoryDto,
  ): Promise<Category> {
    try {
      return this.categoryService.update(categoryName, categoryDto);
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

  /**
   * Deletes a category by its name.
   * @param {string} categoryName - The name of the category to delete.
   * @param {Response} response - Express response object for sending the HTTP response.
   * @returns {Promise<Response>} A promise that resolves to the HTTP response.
   * @throws {HttpException} If the category is not found or an error occurs during the operation,
   *                          returns an appropriate HTTP error.
   */
  @Delete(':name')
  @ApiParam({
    name: 'name',
    description: 'Category name',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Deletes a category by its name',
    type: ResponseDto,
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
  async delete(
    @Param('name') categoryName: string,
    @Res() response: Response,
  ): Promise<Response> {
    try {
      this.categoryService.delete(categoryName);
      return response.status(202).json({
        statusCode: 202,
        message: `Category '${categoryName}' has been deleted from database.`,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          'Internal server error.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
