import { isPlatformServer } from '@angular/common';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Inject, Injectable, Injector, PLATFORM_ID } from "@angular/core";
import { Observable } from "rxjs";

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private inj: Injector, @Inject(PLATFORM_ID) private readonly platformId) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authService = this.inj.get(AuthService);

    if(isPlatformServer(this.platformId)) {
      if(authService.req && authService.req.hasOwnProperty('cookies')) {
        
        if(authService.req['cookies']['jwt_token']) {
          const cookie = authService.req['cookies']['jwt_token'];
          
          const authReq = req.clone({ headers: req.headers.set('Cookies', cookie)});
          
          return next.handle(authReq);
        }
      }
    }

    return next.handle(req);
  }

}