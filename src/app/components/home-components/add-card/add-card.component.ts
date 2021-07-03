import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss']
})
export class AddCardComponent implements OnInit, OnDestroy {

  public darkModeActive: Boolean;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private ui: UiService) { }

  ngOnInit(): void {
    this.ui.darkModeState.pipe(takeUntil(this.destroy$)).subscribe(isDark => this.darkModeActive = isDark);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
