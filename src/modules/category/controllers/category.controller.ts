import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { CategoryDto } from '../dtos/category.dto';
import { Category } from '../entities/category.entity';
import {
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { ExceptionResponse } from 'src/common/dtos/exception-response.dto';
import { FailedValidationExceptionResponse } from 'src/common/exceptions/failed-validation.exception';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returns all categories',
    type: Category,
    isArray: true,
  })
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Creates a new category',
    type: Category,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid request body because of failed CategoryDTO validation.',
    type: FailedValidationExceptionResponse,
  })
  @ApiConflictResponse({
    description: 'Category already exists in database.',
    type: ExceptionResponse,
  })
  @ApiBody({ type: CategoryDto, description: 'Category data' })
  async create(@Body() categoryDto: CategoryDto): Promise<Category> {
    return this.categoryService.create(categoryDto);
  }

  @Get(':name')
  @ApiParam({ name: 'name', description: 'Category name' })
  @ApiResponse({
    status: 200,
    description: 'Get category by name',
    type: Category,
  })
  @ApiNotFoundResponse({
    description: 'Category with the specified name was not found.',
    type: ExceptionResponse,
  })
  async findByName(@Param('name') categoryName: string): Promise<Category> {
    return this.categoryService.findByName(categoryName);
  }
}
