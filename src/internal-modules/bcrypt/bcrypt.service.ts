import { Injectable } from '@nestjs/common';
import { genSalt, hash, compare } from 'bcrypt';

@Injectable()
export class BcryptService {
  // =================================
  // HASH PASSWORD
  // =================================
  async hash(password: string): Promise<string> {
    return hash(password, await genSalt());
  }

  // =================================
  // COMPARE PASSWORDS
  // =================================
  async compare(firstVal: string, secondVal: string): Promise<boolean> {
    return await compare(firstVal, secondVal);
  }
}
