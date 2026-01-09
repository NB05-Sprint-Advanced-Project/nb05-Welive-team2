import bcrypt from 'bcrypt';
import { IHashManager } from '../../application/ports/managers/i-bcrypt-hash-manager';

export const createBcryptHashManager = (): IHashManager => {
  const saltRounds = 10;

  const hash = (plainString: string): Promise<string> => {
    return bcrypt.hash(plainString, saltRounds);
  };

  const compare = (plainString: string, hashedString: string): Promise<boolean> => {
    return bcrypt.compare(plainString, hashedString);
  };

  return {
    hash,
    compare,
  };
};
