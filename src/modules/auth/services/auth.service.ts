import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { UsersService } from './user.service';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { PasswordUtils } from 'src/utils/password.utils';
import { ConfigService } from '@nestjs/config';
import { jwtModuleOptions } from 'src/config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generates a JWT access token for the specified user.
   * @param {User} user - The user for whom the JWT token is generated.
   * @returns {Promise<{ access_token: string }>} A promise that resolves to an object containing the JWT access token.
   */
  async generateJwtToken(user: User): Promise<{ access_token: string }> {
    const payload = { username: user.username, sub: user.id };
    const jwtOptions = jwtModuleOptions(this.configService);
    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: jwtOptions.secret,
        expiresIn: jwtOptions.signOptions.expiresIn,
      }),
    };
  }

  /**
   * Validates user credentials and returns the user if valid.
   * @param {string} username - The username of the user to be validated.
   * @param {string} password - The password of the user to be validated.
   * @returns {Promise<User>} A promise that resolves to the validated User object.
   */
  async validateUser(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersService.findOneByUsername(username);
      if (user && PasswordUtils.validatePassword(password, user.password)) {
        return user;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generates and returns a JWT access token for the authenticated user.
   * @param {LoginDto} loginDto - The authenticated user's login data.
   * @returns {Promise<{ accessToken: string }>} A promise that resolves to an object containing the JWT access token.
   */
  async logInUser(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials. Please try again.');
    }
    return this.generateJwtToken(user);
  }

  /**
   * Registers a new user with the provided registration data.
   * @param {RegisterDto} registerDto - The user registration data.
   * @returns {Promise<void>}
   * @throws {ConflictException} If the username is already taken.
   */
  async registerUser(registerDto: RegisterDto): Promise<User> {
    const { username, password } = registerDto;
    const existingUser = await this.usersService.findOneByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username is already taken.');
    }

    const hashedPassword = await PasswordUtils.hashPassword(password);
    return await this.usersService.createUser({
      username,
      password: hashedPassword,
    });
  }
}
