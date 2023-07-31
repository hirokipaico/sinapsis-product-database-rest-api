import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Finds a user by their unique ID.
   * @param {number} id - The ID of the user to find.
   * @returns {Promise<User>} A promise that resolves to the found User object.
   */
  async findOneById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: id },
    });
    return user;
  }

  /**
   * Finds a user by their username.
   * @param {string} username - The username of the user to find.
   * @returns {Promise<User>} A promise that resolves to the found User object.
   * @throws {NotFoundException} If no user is found with the specified username.
   */
  async findOneByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  /**
   * Creates a new user with the provided data.
   * @param {Partial<User>} data - The data of the user to be created.
   * @returns {Promise<User>} A promise that resolves to the created User object.
   * @throws {Error} If the provided data is incomplete or missing required fields.
   */
  async createUser(data: Partial<User>): Promise<User> {
    if (!data.username || !data.password) {
      throw new BadRequestException(
        'Username and password are required to create a new user.',
      );
    }

    const user = this.usersRepository.create(data);
    return await this.usersRepository.save(user);
  }

  /**
   * Deletes a user with the specified ID.
   * @param {number} id - The ID of the user to be deleted.
   * @returns {Promise<void>} A promise that resolves when the user is deleted.
   * @throws {NotFoundException} If no user is found with the specified ID.
   */
  async deleteUser(id: number): Promise<void> {
    const user = await this.findOneById(id);
    await this.usersRepository.remove(user);
  }
}
