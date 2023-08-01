import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  Logger,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { FailedValidationException } from 'src/common/exceptions/auth/failed-validation.exception';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  private readonly logger = new Logger(ValidationPipe.name);

  async transform(value: any, { metatype }: ArgumentMetadata): Promise<any> {
    this.logger.debug('Input value:', value);

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    console.log('Transformed object:', object);
    const errors = await validate(object);

    if (errors.length > 0) {
      console.log('Validation errors:', errors);
      throw new FailedValidationException(errors.toString());
    }

    return value;
  }

  private toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
