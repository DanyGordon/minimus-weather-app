import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  public darkModeState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public showMenu: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  
  public $slidingValue: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor() { }

}
