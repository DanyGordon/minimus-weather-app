import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from './services/auth.service';
import { UiService } from './services/ui.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  static isBrowser: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  public auth: Boolean;
  public darkModeActive: Boolean;

  private destroy$: Subject<void> = new Subject<void>();

  constructor (private ui: UiService, private authService: AuthService, @Inject(PLATFORM_ID) private platformId: any) {
    AppComponent.isBrowser.next(isPlatformBrowser(this.platformId));
  }

  ngOnInit(): void {
    this.authService.isAuth.pipe(takeUntil(this.destroy$)).subscribe(status => this.auth = status);
    this.ui.darkModeState.pipe(takeUntil(this.destroy$)).subscribe(status => this.darkModeActive = status);
  }

  public authChangedHandler(changedStatus: Boolean): void {
    this.auth = changedStatus;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}