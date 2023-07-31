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
  UseGuards,
} from '@nestjs/common';
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
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Get all categories.
   * @returns {Promise<Category[]>} A promise that resolves to an array of Category objects.
   */
  @UseGuards(AuthGuard)
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

  /**
   * Create a new category.
   * @param {CategoryDto} categoryDto - The category data to be saved.
   * @returns {Promise<Category>} A promise that resolves to the created Category object.
   * @throws {FailedValidationExceptionResponse} If the request body fails CategoryDTO validation.
   * @throws {ExceptionResponse} If the category already exists in the database.
   */
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
    description: 'Category already exists in the database.',
    type: ExceptionResponse,
  })
  @ApiBody({ type: CategoryDto, description: 'Category data' })
  async create(@Body() categoryDto: CategoryDto): Promise<Category> {
    return this.categoryService.create(categoryDto);
  }

  /**
   * Get a category by name.
   * @param {string} categoryName - The name of the category to be found.
   * @returns {Promise<Category>} A promise that resolves to the found Category object.
   * @throws {ExceptionResponse} If the category with the specified name was not found.
   */
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

  /**
   * Update a category by name.
   * @param {string} categoryName - The name of the category to update.
   * @param {CategoryDto} categoryDto - The updated category data.
   * @returns {Promise<Category>} The updated category.
   */
  @Put(':name')
  @UsePipes(new ValidationPipe())
  @ApiParam({
    name: 'name',
    description: 'Category name',
  })
  @ApiBody({
    required: true,
    type: CategoryDto,
    description: 'Category data',
  })
  @ApiResponse({
    status: 201,
    description: 'Update category in the database',
    type: Category,
  })
  @ApiNotFoundResponse({
    description: 'Category with the specified name not found.',
    type: ExceptionResponse,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid request body because of failed categoryDTO validation.',
    type: FailedValidationExceptionResponse,
  })
  async update(
    @Param('name') categoryName: string,
    @Body() categoryDto: CategoryDto,
  ): Promise<Category> {
    return this.categoryService.update(categoryName, categoryDto);
  }

  /**
   * Delete a category by name.
   * @param {string} categoryName - The name of the category to delete.
   * @returns {Promise<void>} A promise that resolves when the category is deleted.
   */
  @Delete(':name')
  @ApiParam({
    name: 'name',
    description: 'Category name',
  })
  @ApiResponse({
    status: 200,
    description: 'Deletes a category',
    type: Category,
  })
  @ApiNotFoundResponse({
    description: 'Category name not found in the database.',
    type: ExceptionResponse,
  })
  async delete(@Param('name') categoryName: string): Promise<Category> {
    return this.categoryService.delete(categoryName);
  }
}
