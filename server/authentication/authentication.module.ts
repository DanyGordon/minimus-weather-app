import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { EncryptionModule } from '../encryption/encryption.module';
import { UsersModule } from '../users/users.module';

import { AuthenticationController } from './controllers/authentication.controller';

import { AuthenticationService } from './services/authentication.service';

import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    EncryptionModule,
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    })
  ],
  providers: [AuthenticationService, LocalStrategy, JwtStrategy],
  controllers: [AuthenticationController],
  exports: [AuthenticationService, JwtModule]
})
export class AuthenticationModule {}