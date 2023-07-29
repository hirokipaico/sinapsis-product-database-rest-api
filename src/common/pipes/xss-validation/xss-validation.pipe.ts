import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import xss from 'xss';

@Injectable()
export class XssValidationPipe implements PipeTransform {
  transform(value: any): any {
    if (value && typeof value === 'string') {
      // Use the xss library to sanitize the input
      return xss(value);
    }
    throw new BadRequestException(
      'Invalid input. Please check your input and try again.',
    );
  }
}
