import * as Joi from 'joi';

export const environmentVariablesValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production'),
  PORT: Joi.number().default(3000),
});
