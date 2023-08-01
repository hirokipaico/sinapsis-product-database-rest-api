import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import xss from 'xss';

@Injectable()
export class XssValidationPipe implements PipeTransform {
  transform(value: any): any {
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
