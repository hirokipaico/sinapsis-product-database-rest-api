import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CategoryDto } from '../dtos/category.dto';
import { CategoryNotFoundExceptionResponse } from '../../../common/exceptions/category-not-found.exception';
import { CategoryAlreadyExistsExceptionResponse } from '../../../common/exceptions/category-already-exists.exception';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('categories')
@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Get all categories from the database.
   * @returns {Promise<Category[]>} A promise that resolves to an array of Category objects.
   */
  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  /**
   * Create a new category in the database.
   * @param {CategoryDto} categoryDto The category data to be saved.
   * @returns {Promise<Category>} A promise that resolves to the created Category object.
   * @throws {CategoryAlreadyExistsException} If the category with the same name already exists in the database.
   */
  async create(categoryDto: CategoryDto): Promise<Category> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: categoryDto.name },
    });

    if (existingCategory) {
      throw new CategoryAlreadyExistsExceptionResponse(categoryDto.name);
    }

    const newCategory = new Category();
    newCategory.name = categoryDto.name;
    newCategory.description = categoryDto.description;
    return this.categoryRepository.save(newCategory);
  }

  /**
   * Find a category by its name.
   * @param {string} name The name of the category to be found.
   * @returns {Promise<Category>} A promise that resolves to the found Category object.
   * @throws {CategoryNotFoundException} If the category with the specified name does not exist in the database.
   */
  async findByName(name: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { name: name },
    });
    if (!category) {
      throw new CategoryNotFoundExceptionResponse(name);
    }
    return category;
  }
}
