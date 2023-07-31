import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from 'src/modules/auth/entities/user.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { Product } from 'src/modules/product/entities/product.entity';

const entitiesPath = join(
  __dirname,
  '..',
  'modules',
  '**',
  'entities',
  '*.entity.ts',
);

console.log(entitiesPath);

const typeOrmConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  const dbHost = configService.get<string>('DB_HOST');
  const dbPort = configService.get<number>('DB_PORT');
  const dbUsername = configService.get<string>('DB_USERNAME');
  const dbPassword = configService.get<string>('DB_PASSWORD');
  const dbName = configService.get<string>('DB_NAME');

  return {
    type: 'mysql',
    host: dbHost,
    port: dbPort,
    username: dbUsername,
    password: dbPassword,
    database: dbName,
    entities: [User, Category, Product],
    synchronize: true,
  };
};

export default typeOrmConfig;
