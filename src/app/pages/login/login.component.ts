import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  public errorMessage: string = '';
  public isMessage: boolean = false;

  public isFadedOut: boolean = false;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private auth: AuthService) { }

  ngOnInit(): void { }

  public login(e): void {
    this.auth.logIn({ email: e.target.email.value, password: e.target.password.value }).pipe(takeUntil(this.destroy$)).subscribe((status: boolean) => {
      this.isFadedOut = true;
    }, err => {
      this.errorMessage = err.error;
      this.isMessage = true;
    })
  }

  public hideToast(): void {
    this.isFadedOut = true;
    setTimeout(() => {
      this.isMessage = false;
      this.isFadedOut = false;
    }, 1200);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}