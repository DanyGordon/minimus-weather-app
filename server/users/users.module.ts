import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EncryptionModule } from '../encryption/encryption.module';

import { UsersController } from './controllers/users.controller';

import { UsersService } from './services/users.service';

import { User, UserSchema } from './schemas/user.schema';
import { City, CitySchema } from './schemas/city.schema';

@Module({
  imports: [
    EncryptionModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: City.name, schema: CitySchema }
    ])
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService, MongooseModule, EncryptionModule]
})
export class UsersModule { }