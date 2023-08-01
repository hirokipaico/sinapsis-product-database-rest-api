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

  /**
   * Retrieves all categories from the database.
   * @returns {Promise<Category[]>} A promise that resolves to an array of categories.
   * @throws {Error} If an error occurs during the operation, throws the error.
   */
  async findAll(): Promise<Category[]> {
    try {
      return this.categoryRepository.find();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Creates a new category.
   * @param {CategoryDto} categoryDto - The DTO object containing category data.
   * @returns {Promise<Category>} A promise that resolves to the newly created category.
   * @throws {Error} If the category already exists or an error occurs during the operation, throws the error.
   */
  async create(categoryDto: CategoryDto): Promise<Category> {
    try {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: categoryDto.name },
      });

      if (existingCategory) {
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

  /**
   * Retrieves a category by its name.
   * @param {string} name - The name of the category to retrieve.
   * @returns {Promise<Category>} A promise that resolves to the retrieved category.
   * @throws {Error} If the category is not found or an error occurs during the operation, throws the error.
   */
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

  /**
   * Updates an existing category.
   * @param {string} categoryName - The name of the category to update.
   * @param {CategoryDto} categoryDto - The DTO object containing the updated category data.
   * @returns {Promise<Category>} A promise that resolves to the updated category.
   * @throws {Error} If the category data is invalid, the category is not found,
   *                or an error occurs during the operation, throws the error.
   */
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

  /**
   * Deletes a category by its name.
   * @param {string} categoryName - The name of the category to delete.
   * @returns {Promise<Category>} A promise that resolves to the deleted category.
   * @throws {Error} If the category is not found or an error occurs during the operation, throws the error.
   */
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
