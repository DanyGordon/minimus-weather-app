import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AngularUniversalModule } from '@nestjs/ng-universal';

import { join } from 'path';

import { AppServerModule } from '../src/main.server';
import { AuthenticationModule } from './authentication/authentication.module';
import { UsersModule } from './users/users.module';
import { TwitterModule } from './twitter/twitter.module';

import { AuthenticationController } from './authentication/controllers/authentication.controller';
import { UsersController } from './users/controllers/users.controller';
import { TwitterController } from './twitter/twitter.controller';

import { AuthenticationService } from './authentication/services/authentication.service';
import { UsersService } from './users/services/users.service';
import { TwitterService } from './twitter/twitter.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/minimus'),
    UsersModule,
    AuthenticationModule,
    TwitterModule,
    AngularUniversalModule.forRoot({
      bootstrap: AppServerModule,
      viewsPath: join(process.cwd(), 'dist/minimus/browser')
    })
  ],
  controllers: [UsersController, AuthenticationController, TwitterController],
  providers: [UsersService, AuthenticationService, TwitterService]
})
export class AppModule {}
