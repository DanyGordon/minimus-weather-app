import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit, OnDestroy {

  public darkModeActive: Boolean;
  public mode: string;
  public url: string;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private ui: UiService, private router: Router) { }

  ngOnInit(): void {
    this.ui.darkModeState.pipe(takeUntil(this.destroy$)).subscribe(state => {
      this.darkModeActive = state;
      state ? this.mode = 'dark' : this.mode = 'light';
    });
    this.url = this.router.url;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
