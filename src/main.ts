import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { corsOptions } from './common/constants';
import { SwaggerModule } from '@nestjs/swagger';
import swaggerDocumentConfig from './config/swagger.config';
import { LoggingInterceptor } from './logging/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.useGlobalInterceptors(new LoggingInterceptor());

  app.use(helmet());
  app.enableCors(corsOptions);

  app.setGlobalPrefix('api');

  const document = SwaggerModule.createDocument(app, swaggerDocumentConfig);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('port');
  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}/api/`);
}

bootstrap();
