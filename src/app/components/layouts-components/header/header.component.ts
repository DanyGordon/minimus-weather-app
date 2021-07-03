import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  @Input() public auth: Boolean;

  public today: String;
  private showMenu: Boolean;
  public darkModeActive: Boolean;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private ui: UiService) { }

  ngOnInit(): void {
    this.today = this.getCurrentDate();
    this.ui.darkModeState.pipe(takeUntil(this.destroy$)).subscribe((status) => this.darkModeActive = status);
    this.ui.showMenu.pipe(takeUntil(this.destroy$)).subscribe(status => this.showMenu = status);
  }

  public toggleMenu(): void {
    this.ui.showMenu.next(!this.showMenu);
  }

  public modeToggleSwitch(): void {
    this.ui.darkModeState.next(!this.darkModeActive);
  }

  private getCurrentDate(): string {
    const date = new Date();
    return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
