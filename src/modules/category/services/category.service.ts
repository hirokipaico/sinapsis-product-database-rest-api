import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CategoryDto } from '../dtos/category.dto';
import { CategoryNotFoundExceptionResponse } from '../../../common/exceptions/category-not-found.exception';
import { CategoryAlreadyExistsExceptionResponse } from '../../../common/exceptions/category-already-exists.exception';
import { ApiTags } from '@nestjs/swagger';
import { validate } from 'class-validator';

@ApiTags('categories')
@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Retrieves all categories from the database.
   * @returns {Promise<Category[]>} A promise that resolves to an array of Category objects.
   */
  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  /**
   * Creates a new category in the database.
   * @param {CategoryDto} categoryDto - The category data to be saved.
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
   * Retrieves a category by name.
   * @param {string} name - The name of the category to be found.
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

  /**
   * Updates a category by name.
   * @param {string} categoryName - The name of the category to update.
   * @param {CategoryDto} categoryDto - The updated category data.
   * @returns {Promise<Category>} The updated category.
   * @throws {BadRequestException} If given request body didn't comply with DTO.
   * @throws {CategoryNotFoundException} If the specified product category does not exist in the database.
   */
  async update(
    categoryName: string,
    categoryDto: CategoryDto,
  ): Promise<Category> {
    const errors = await validate(categoryDto);
    if (errors.length > 0) {
      throw new BadRequestException(
        'Validation failed. Please check the request body to comply with categoryDto schema.',
      );
    }

    const existingCategory = await this.categoryRepository.findOne({
      where: { name: categoryName },
    });

    if (!existingCategory) {
      throw new CategoryNotFoundExceptionResponse(categoryName);
    }

    existingCategory.name = categoryDto.name;
    existingCategory.description = categoryDto.description;

    return this.categoryRepository.save(existingCategory);
  }

  /**
   * Deletes a category by name.
   * @param {string} categoryName - The name of the category to delete.
   * @returns {Promise<void>} A promise that resolves when the category is deleted.
   * @throws {CategoryNotFoundExceptionResponse} If the given category was not found in the database.
   */
  async delete(categoryName: string): Promise<Category> {
    const category = await this.findByName(categoryName);
    if (!category) {
      throw new CategoryNotFoundExceptionResponse(categoryName);
    }
    return this.categoryRepository.remove(category);
  }
}
