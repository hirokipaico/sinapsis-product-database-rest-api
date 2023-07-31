import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { corsOptions } from './common/constants';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerDocumentConfig, customOptions } from './config/swagger.config';
import { LoggingInterceptor } from './logging/logging.interceptor';
import * as passport from 'passport';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalInterceptors(new LoggingInterceptor());

  app.use(
    session({
      secret: configService.get<string>('PASSPORT_SECRET'),
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(helmet());
  app.enableCors(corsOptions);

  app.setGlobalPrefix('api');

  const document = SwaggerModule.createDocument(app, swaggerDocumentConfig);
  SwaggerModule.setup('api', app, document, customOptions);

  const port = configService.get<number>('port');
  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}/api/`);
}

bootstrap();
