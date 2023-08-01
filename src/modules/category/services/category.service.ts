import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CategoryDto } from '../dtos/category.dto';
import { CategoryNotFoundException } from '../../../common/exceptions/category/category-not-found.exception';
import { CategoryAlreadyExistsException } from '../../../common/exceptions/category/category-already-exists.exception';
import { ApiTags } from '@nestjs/swagger';
import { validate } from 'class-validator';
import { FailedValidationException } from 'src/common/exceptions/auth/failed-validation.exception';

@ApiTags('categories')
@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    try {
      return this.categoryRepository.find();
    } catch (error) {
      throw error;
    }
  }

  async create(categoryDto: CategoryDto): Promise<Category> {
    try {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: categoryDto.name },
      });

      if (existingCategory) {
        console.log('Exist category. Throwing CategoryAlreadyExistsException');
        throw new CategoryAlreadyExistsException(categoryDto.name);
      }

      const newCategory = new Category();
      newCategory.name = categoryDto.name;
      newCategory.description = categoryDto.description;
      return this.categoryRepository.save(newCategory);
    } catch (error) {
      throw error;
    }
  }

  async findByName(name: string): Promise<Category> {
    try {
      const category = await this.categoryRepository.findOne({
        where: { name: name },
      });
      if (!category) {
        throw new CategoryNotFoundException(name);
      }
      return category;
    } catch (error) {
      throw error;
    }
  }

  async update(
    categoryName: string,
    categoryDto: CategoryDto,
  ): Promise<Category> {
    try {
      const errors = await validate(categoryDto);
      if (errors.length > 0) {
        throw new FailedValidationException(
          'Please check the request body to comply with categoryDto schema.',
        );
      }

      const existingCategory = await this.categoryRepository.findOne({
        where: { name: categoryName },
      });

      if (!existingCategory) {
        throw new CategoryNotFoundException(categoryName);
      }

      existingCategory.name = categoryDto.name;
      existingCategory.description = categoryDto.description;

      return this.categoryRepository.save(existingCategory);
    } catch (error) {
      throw error;
    }
  }

  async delete(categoryName: string): Promise<Category> {
    try {
      const category = await this.findByName(categoryName);
      if (!category) {
        throw new CategoryNotFoundException(categoryName);
      }
      return this.categoryRepository.remove(category);
    } catch (error) {
      throw error;
    }
  }
}
