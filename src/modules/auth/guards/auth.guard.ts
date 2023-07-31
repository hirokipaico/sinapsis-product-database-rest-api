import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('Entering AuthGuard... checking request...');
    const request = context.switchToHttp().getRequest<Request>();
    console.log('Extracting token from cookie...');
    const token = this.extractTokenFromCookie(request);
    if (!token) {
      console.log('There was no token in cookie...');
      return false; // Return false instead of throwing UnauthorizedException
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      // Assign the payload to the request object for access in route handlers
      console.log('Assigning payload to request.user...');
      request.user = payload;
      return true;
    } catch {
      console.log('Canceling because of error in payload verification...');
      return false;
    }
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.access_token;
  }
}
