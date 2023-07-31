import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const jwtModuleOptions = (
  configService: ConfigService,
): JwtModuleOptions => {
  const secretKey = configService.get<string>('JWT_SECRET');
  const expiresIn = configService.get<string>('JWT_EXPIRATION_TIME');

  return {
    global: true,
    secret: secretKey,
    signOptions: {
      expiresIn: expiresIn,
    },
  };
};
