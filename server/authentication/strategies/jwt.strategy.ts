import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { jwtSecret } from './jwt.constanse'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req) => {
        if(req && req.cookies && req.cookies['jwt_token']) {
          return req.cookies['jwt_token'];
        } else if(req && req.headers.cookies) {
          return req.headers.cookies;
        } else {
          return null;
        }
      }]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}