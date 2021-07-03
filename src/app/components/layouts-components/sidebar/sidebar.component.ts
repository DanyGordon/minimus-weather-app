import { Component, Input, Output, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LocalstorageService } from 'src/app/services/localStorage.service';
import { AuthService } from '../../../services/auth.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

  @Input() public auth: Boolean;

  @Output() public authChanged: EventEmitter<Boolean> = new EventEmitter<Boolean>();
  
  public darkModeActive: Boolean;
  private showMenu: Boolean;

  private username: string;
  private email: string;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private ui: UiService, private authService: AuthService, private Storage: LocalstorageService) { }

  ngOnInit(): void {
    this.authService.isLogedIn().pipe(takeUntil(this.destroy$)).subscribe(status => this.auth = status);

    this.email = this.Storage.getItem('email');
    this.username = this.Storage.getItem('username');

    if(!this.email || !this.username) {
      this.authService.loadUserCredential().pipe(takeUntil(this.destroy$)).subscribe(credential => {
        this.email = credential.email;
        this.username = credential.username;
      }), err => console.log(err);
    }
    
    this.ui.darkModeState.pipe(takeUntil(this.destroy$)).subscribe(status => this.darkModeActive = status);
    this.ui.showMenu.pipe(takeUntil(this.destroy$)).subscribe(status => this.showMenu = status);
  }

  public toggleMenu(): void {
    this.ui.showMenu.next(!this.showMenu);
  }

  public logout(): void {
    this.toggleMenu();
    this.authService.logOut();
    this.authChanged.emit(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
