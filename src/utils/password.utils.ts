import { genSalt, hash, compare } from 'bcrypt';

export class PasswordUtils {
  static async hashPassword(password: string): Promise<string> {
    const salt = await genSalt();
    return hash(password, salt);
  }

  static async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return compare(plainPassword, hashedPassword);
  }
}
