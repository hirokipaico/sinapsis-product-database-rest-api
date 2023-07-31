import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
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
import { Response } from 'express';

const EXPIRATION_TIME_IN_SECONDS = 3600;
const SECONDS_TO_MILISECONDS = 1000;

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
  async signIn(
    @Body() loginDto: LoginDto,
    @Res() response: Response,
  ): Promise<void> {
    const { access_token } = await this.authService.logInUser(loginDto);
    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    response.json({ message: 'User logged in successfully' });
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
  async register(
    @Body() registerDto: RegisterDto,
    @Res() response,
  ): Promise<void> {
    await this.authService.registerUser(registerDto);
    const { access_token } = await this.authService.logInUser(registerDto);

    // Set the HTTP-only cookie with the token
    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set 'secure' flag in production
      maxAge: EXPIRATION_TIME_IN_SECONDS * SECONDS_TO_MILISECONDS, // Set the expiration time in milliseconds
      sameSite: 'strict', // Set the cookie path to the auth endpoint
    });

    response.json({ message: 'User registered successfully' });
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
