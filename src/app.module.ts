import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { enviromentVariablesConfig } from 'config/configuration';
import { environmentVariablesValidationSchema } from 'config/validation';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeOrmConfig from './config/typeorm.config';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ProductModule,
    CategoryModule,
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`,
      isGlobal: true,
      load: [enviromentVariablesConfig],
      validationSchema: environmentVariablesValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService) => await typeOrmConfig(configService),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
})
export class AppModule {}
