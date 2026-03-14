import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

import { AppConfigService } from '#src/config/app-config.service.js';

@Injectable()
export class PasswordService {
  constructor(private appConfigService: AppConfigService) {}

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.appConfigService.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public makeRandomKey(): string {
    const length = 24;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  public makeRandomPassword(): string {
    const length = 8;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%&-';
    const allCharacters = uppercase + lowercase + numbers + special;

    // Ensure at least one character from each category
    let password = '';
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += special.charAt(Math.floor(Math.random() * special.length));

    // Fill remaining characters randomly
    const remainingLength = length - 4;
    for (let i = 0; i < remainingLength; i++) {
      password += allCharacters.charAt(Math.floor(Math.random() * allCharacters.length));
    }

    // Shuffle the password to avoid predictable patterns
    const passwordArray = password.split('');
    for (let i = passwordArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const charI = passwordArray[i];
      const charJ = passwordArray[j];
      if (charI !== undefined && charJ !== undefined) {
        passwordArray[i] = charJ;
        passwordArray[j] = charI;
      }
    }

    return passwordArray.join('');
  }

  public encriptPassword(password: string): string {
    return bcrypt.hashSync(password, this.appConfigService.saltRounds);
  }
}
