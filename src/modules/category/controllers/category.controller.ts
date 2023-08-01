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
import { ApiTags, ApiBody, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { NotFoundError } from 'rxjs';
import { Public } from 'src/common/constants/auth';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @Public()
  async findAll(): Promise<Category[]> {
    try {
      return this.categoryService.findAll();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @UsePipes(ValidationPipe)
  @ApiBody({ type: CategoryDto, description: 'Category data' })
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

  @Get(':name')
  @Public()
  @ApiParam({ name: 'name', description: 'Category name' })
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

  @Put(':name')
  @UsePipes(new ValidationPipe())
  @ApiParam({
    name: 'name',
    description: 'Category name',
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

  @Delete(':name')
  @ApiParam({
    name: 'name',
    description: 'Category name',
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
