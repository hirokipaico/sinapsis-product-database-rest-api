import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { User } from '../entities/user.entity';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Returns an JWT-signed access token
   * @param loginDto The login credentials
   * @returns {accessToken} JWT-signed access token for authorization.
   * @throws {UnauthorizedException} If user is not validated or does not exist in the database.
   */
  @Post('login')
  @ApiBody({
    type: LoginDto,
    description: 'Login credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns accessToken',
  })
  async signIn(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
    return await this.authService.logInUser(loginDto);
  }

  /**
   * Registers a new user
   * @param registerDto The user registration data
   * @returns {Promise<void>}
   * @throws {ConflictException} If the username is already taken.
   */
  @Post('register')
  @ApiBody({
    type: RegisterDto,
    description: 'User registration data',
  })
  @ApiResponse({
    status: 201,
    description: 'Registers a new user',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid request body because of failed RegisterDto validation.',
    type: Error,
  })
  @ApiConflictResponse({
    description: 'Username is already taken.',
    type: Error,
  })
  async register(@Body() registerDto: RegisterDto): Promise<void> {
    await this.authService.registerUser(registerDto);
  }

  /**
   * Returns the user information if logged in.
   * @returns {User} The logged-in user's information.
   * @throws {UnauthorizedException} If the user is not authenticated.
   */
  @Get('me')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Returns the logged-in user information',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated.',
    type: Error,
  })
  getLoggedInUser(@Req() request): User {
    return request.user; // Since we assigned the payload to the request object in the AuthGuard, we can access it here.
  }
}
