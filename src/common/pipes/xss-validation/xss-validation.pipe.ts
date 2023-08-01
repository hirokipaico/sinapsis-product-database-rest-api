import {
  PipeTransform,
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import xss from 'xss';

@Injectable()
export class XssValidationPipe implements PipeTransform {
  private readonly logger = new Logger(XssValidationPipe.name);

  transform(value: any): any {
    this.logger.debug('Input value:', value);

    if (value && typeof value === 'string') {
      // Use the xss library to sanitize the input
      const sanitizedValue = xss(value);
      console.log('Sanitized value:', sanitizedValue);
      return sanitizedValue;
    }

    throw new BadRequestException(
      'Invalid input. Please check your input and try again.',
    );
  }
}
