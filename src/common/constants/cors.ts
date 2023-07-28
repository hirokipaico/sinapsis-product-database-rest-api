import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsOptions: CorsOptions = {
  origin: true,
  methods: 'GET, PUT, POST, DELETE',
  credentials: true,
};
