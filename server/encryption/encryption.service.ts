import { Injectable } from "@nestjs/common";

import { hash, genSalt, compare } from 'bcryptjs'

import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class EncryptionService {

  constructor() { }

  async hash(plain: string): Promise<string> {
    const salt = await genSalt(Number(process.env.HASH_ROUNDS));
    return hash(plain, salt);
  }

  async compare(plain: string, encrypted: string): Promise<boolean> {
    return compare(plain, encrypted);
  }

}