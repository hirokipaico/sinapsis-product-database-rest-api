import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('Entering AuthGuard... checking request...');
    const request = context.switchToHttp().getRequest();
    console.log('Extracting token from header...');
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      console.log('There was no token in header...');
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

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request['user'].split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
