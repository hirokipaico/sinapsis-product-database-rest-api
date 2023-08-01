// auth.service.ts
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './user.service';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';
import { User } from '../entities/user.entity';
import { PasswordUtils } from 'src/utils/password.utils';
import { ConfigService } from '@nestjs/config';
import { UsernameAlreadyExistsException } from 'src/common/exceptions/auth/username-already-exists.exception';
import { jwtModuleOptions } from 'src/config/jwt.config';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generates a JWT token for the authenticated user.
   * @param {User} user - The user object to generate the token for.
   * @returns {Promise<string>} A Promise that resolves to the JWT token.
   */
  async generateJwtToken(user: User): Promise<string> {
    const payload = { username: user.username, sub: user.id };
    const jwtOptions = jwtModuleOptions(this.configService);
    return this.jwtService.signAsync(payload, {
      secret: jwtOptions.secret,
      expiresIn: jwtOptions.signOptions.expiresIn,
    });
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersService.findOneByUsername(username);
      if (user && PasswordUtils.validatePassword(password, user.password)) {
        return user;
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validates the user's credentials and logs them in.
   * @param {LoginDto} loginDto - The login data (username and password).
   * @returns {Promise<string>} A Promise that resolves to the JWT token.
   * @throws {NotFoundException} If the user with the provided username doesn't exist.
   * @throws {UnauthorizedException} If the provided credentials are invalid.
   */
  async login(loginDto: LoginDto): Promise<string> {
    try {
      const user = await this.validateUser(
        loginDto.username,
        loginDto.password,
      );
      console.log('login service: finished validating...', user);
      if (!user) {
        throw new NotFoundException(
          'This user does not exists. Please register first.',
        );
      }
      return this.generateJwtToken(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new UnauthorizedException(
          'Invalid credentials. Please try again.',
        );
      }
    }
  }

  /**
   * Registers a new user.
   * @param {RegisterDto} registerDto - The registration data (username and password).
   * @throws {UsernameAlreadyExistsException} If the provided username is already taken.
   */
  async register(registerDto: RegisterDto): Promise<void> {
    try {
      const { username, password } = registerDto;
      const existingUser = await this.usersService.findOneByUsername(username);
      if (existingUser) {
        throw new UsernameAlreadyExistsException(username);
      }

      const hashedPassword = await PasswordUtils.hashPassword(password);
      await this.usersService.createUser({
        username,
        password: hashedPassword,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logs out the user by clearing the access_token cookie.
   * @param {Response} response - The Express response object.
   */
  logout(response: Response) {
    return response.clearCookie('access_token');
  }
}
