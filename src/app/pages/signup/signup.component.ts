import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {

  public errorMessage: string = '';
  public isMessage: boolean = false;

  public isFadedOut: boolean = false;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(): void {}

  public register(e): void {
    this.auth.registr({ firstname: e.target.firstname.value, lastname: e.target.lastname.value, 
      email: e.target.email.value, password: e.target.password.value})
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.isFadedOut = true;
        this.router.navigateByUrl('/login')
      }, err => {
        this.errorMessage = err.error;
        this.isMessage = true;
      });
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
