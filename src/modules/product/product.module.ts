import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { CategoryModule } from '../category/category.module';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CategoryService } from '../category/services/category.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CategoryModule,
    PassportModule,
  ],
  controllers: [ProductController],
  providers: [
    CategoryService,
    ProductService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class ProductModule {}
