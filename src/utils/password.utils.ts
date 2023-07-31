import * as bcrypt from 'bcrypt';

export class PasswordUtils {
  /**
   * Generates a hash for the provided password.
   * @param {string} password - The plain password to hash.
   * @returns {Promise<string>} A promise that resolves to the hashed password.
   */
  static async hashPassword(password: string): Promise<string> {
    // Use bcrypt to generate a salt and hash the password with the salt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  /**
   * Validates if the provided password matches the hashed password.
   * @param {string} password - The plain password to be validated.
   * @param {string} hashedPassword - The hashed password stored in the database.
   * @returns {Promise<boolean>} Returns true if the password is valid, otherwise false.
   */
  static async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    // Use bcrypt to compare the plain password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    return isPasswordValid;
  }
}
