import {
  Controller,
  Body,
  Res,
  Req,
  Get,
  Post,
  HttpStatus,
  HttpException,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';
import { Request, Response } from 'express';
import { UsernameAlreadyExistsException } from 'src/common/exceptions/auth/username-already-exists.exception';
import { UserAlreadyLoggedException } from 'src/common/exceptions/auth/user-already-logged.exception';
import { ExceptionResponseDto } from 'src/common/dtos/exception-response.dto';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { Public } from 'src/common/constants/auth';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Logs in a user with the provided credentials.
   *
   * @param {LoginDto} loginDto - The login data transfer object.
   * @param {Request} request - The HTTP request object.
   * @param {Response} response - The HTTP response object.
   * @returns {Promise<Response>} A Promise that resolves to the HTTP response.
   */
  @Post('login')
  @Public()
  @ApiResponse({
    status: 201,
    description:
      'User successfully logged in. You can now access authenticated endpoints.',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials. Please try again.',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Username does not exists. Please register first.',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: 409,
    description:
      'Already logged in. You can already access authenticated endpoints.',
    type: ExceptionResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    type: ExceptionResponseDto,
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<Response> {
    try {
      if (request.cookies.access_token) {
        throw new UserAlreadyLoggedException();
      }

      const accessToken = await this.authService.login(loginDto);

      response.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
      return response.status(201).json({
        statusCode: 201,
        message:
          'User successfully logged in. You can now access authenticated endpoints.',
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      } else if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Registers a new user and logs them in.
   *
   * @param {RegisterDto} registerDto - The registration data transfer object.
   * @param {Response} response - The HTTP response object.
   * @returns {Promise<Response>} A Promise that resolves to the HTTP response.
   */
  @Post('signup')
  @Public()
  @ApiResponse({
    status: 201,
    description:
      'User registered and logged in successfully. You can now access authenticated endpoints.',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Username is already taken. Try another username.',
    type: ExceptionResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    type: ExceptionResponseDto,
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Res() response: Response,
  ): Promise<Response> {
    try {
      await this.authService.register(registerDto);

      const accessToken = await this.authService.login(registerDto);
      response.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
      return response.status(201).json({
        statusCode: 201,
        message:
          'User registered and logged in successfully. You can now access authenticated endpoints.',
      });
    } catch (error) {
      if (error instanceof UsernameAlreadyExistsException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Retrieves information about the currently logged-in user.
   *
   * @param {Request} request - The HTTP request object.
   * @returns {any} The logged-in user information.
   */
  @Get('me')
  @ApiResponse({
    status: 200,
    description: 'User information.',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication required. Please login first to access this endpoint.',
    type: ExceptionResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    type: ExceptionResponseDto,
  })
  getLoggedInUser(@Req() request: Request) {
    return request.user;
  }

  /**
   * Logs out the currently logged-in user.
   *
   * @param {Request} request - The HTTP request object.
   * @param {Response} response - The HTTP response object.
   * @returns {Response} The HTTP response indicating the logout status.
   */
  @Post('logout')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'There is no user logged in. Already logged out.',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 202,
    description:
      'User has been logged out. Please login again to access authenticated endpoints.',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication required. Please login first to access this endpoint.',
    type: ExceptionResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    type: ExceptionResponseDto,
  })
  logout(@Req() request: Request, @Res() response: Response): Response {
    if (!request.cookies.access_token) {
      return response.status(200).json({
        statusCode: 200,
        message: 'There is no user logged in. Already logged out.',
      });
    }
    this.authService.logout(response);
    request.user = null;
    console.log(`After logging out: request.user:`, request.user);
    return response.status(202).json({
      statusCode: 202,
      message:
        'User has been logged out. Please login again to access authenticated endpoints.',
    });
  }
}
