import { DocumentBuilder } from '@nestjs/swagger';

const swaggerDocumentConfig = new DocumentBuilder()
  .setTitle('Sinapsis Product Database API')
  .setDescription(
    'API for searching and filtering products from a MySQL database.',
  )
  .setVersion('1.0')
  .addTag('products', 'Endpoints for managing products')
  .addTag('categories', 'Endpoints for managing categories')
  .build();

export default swaggerDocumentConfig;
