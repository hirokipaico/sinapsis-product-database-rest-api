import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const customOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    oauth2RedirectUrl: '/api/docs/oauth2-redirect',
  },
};

export const swaggerDocumentConfig = new DocumentBuilder()
  .setTitle('Sinapsis Product Database API')
  .setDescription(
    'API for searching and filtering products from a MySQL database.',
  )
  .setVersion('1.0')
  .addTag('products', 'Endpoints for managing products')
  .addTag('categories', 'Endpoints for managing categories')
  .addCookieAuth('access_token')
  .build();
