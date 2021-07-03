import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { REQUEST } from '@nestjs/ng-universal/dist/tokens';

import { LocalstorageService } from './localStorage.service';

import { environment } from '../../environments/environment';

interface loginParams {
  email: string,
  password: string
}

interface registrParams {
  email: string,
  firstname: string,
  lastname: string,
  password: string
}

interface loginResponse {
  uid: string,
  status: string
}

interface logoutResponse {
  success: boolean
}

interface validateJwtResponse {
  uid?: string,
  status: boolean
}

interface loadCredentialResponse {
  email: string,
  firstname: string,
  lastname: string,
  uid: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl: string = environment.backendUrl;

  private readonly cookieKey: string = 'jwt_token';

  public isAuth: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private userId: string = null;

  constructor(private http: HttpClient, private router: Router, private Storage: LocalstorageService, 
    @Optional() @Inject(REQUEST) public req: Request
  ) {}

  public getUid(): string {
    return this.userId;
  }

  public logIn(credentials: loginParams): Observable<any> {
    return this.http.post(this.baseUrl + 'auth/login', credentials, { headers: {'withCredentials': 'true'} })
      .pipe(map((response: loginResponse) => {
        if(response.status === 'Success') {
          this.userId = response.uid;
          this.Storage.setItem('uid', this.userId);
          this.isAuth.next(true);
          this.router.navigateByUrl('/');
          this.validateJwtToken();
        }
      }));                    
  }

  public registr(credentials: registrParams): Observable<any> {
    return this.http.post(this.baseUrl + 'users/signup', credentials);
  }

  public logOut(): void {
    this.http.get(this.baseUrl + 'auth/logout').subscribe((response: logoutResponse) => {
      if(response.success) {
        this.isAuth.next(false);
        this.destroyUserCredential();
        this.router.navigateByUrl('/login')
      }
    }, err => console.log('Logout: ' + err));
  }

  public isLogedIn(): Observable<boolean> {
    return this.validateJwtToken().pipe(map((response: validateJwtResponse) => {
      if(response.status) {
        this.userId = response.uid;
        this.isAuth.next(true);
      }
      return response.status;
    }));
  }

  private validateJwtToken(): Observable<any> {
    return this.http.get(this.baseUrl + 'auth/verify');
  }

  public loadUserCredential(): Observable<any> {
    return this.http.get(this.baseUrl + 'users/' + this.userId).pipe(map((response: loadCredentialResponse) => {
      this.Storage.setItem('email', response.email);
      this.Storage.setItem('username', response.firstname + ' ' + response.lastname);
      return { email: response.email, username: response.firstname + ' ' + response.lastname };
    }));
  }

  private destroyUserCredential(): void {
    this.userId = null;
    this.Storage.removeItem('uid');
    this.Storage.removeItem('email');
    this.Storage.removeItem('username');
  }

}