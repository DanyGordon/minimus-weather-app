import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { EncryptionService } from '../../encryption/encryption.service';
import { UsersService } from '../../users/services/users.service';

import { SendUserDto } from '../../users/dto/send-user.dto';

@Injectable()
export class AuthenticationService {

  constructor (private JwtService: JwtService, private EncryptionService: EncryptionService, private UsersService: UsersService) { }

  async checkingJWT(token: string): Promise<{ uid?: string, status: boolean }> {
    try {
      return await this.JwtService.verifyAsync(token) ? { uid: (await this.JwtService.decode(token))['sub'], status: true } : { status: false };
    } catch (e) {
      return { status: false };
    }
  }

  async validateUser(email: string, password: string): Promise<SendUserDto | boolean> {
    try {
      const user = await this.UsersService.findUserByEmail(email);
      if (user) {
        return await this.EncryptionService.compare(password, user.password) ? { firstname: user.firstname, lastname: user.lastname, email: user.email, id: user.id } : false;
      }
    } catch(e) {
      return null;
    }
  }

  async login(user: any): Promise<{ id: string, access_token: string }> {
    const payload = { email: user.email, sub: user.id };
    return {
      id: user.id,
      access_token: this.JwtService.sign(payload),
    };
  }

}