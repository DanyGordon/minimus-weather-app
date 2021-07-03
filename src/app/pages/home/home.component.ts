import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CitiesService } from 'src/app/services/cities.service';
import { UiService } from 'src/app/services/ui.service';

import { SliderDirective } from 'src/app/directives/slider-directives/slider.directive';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  @ViewChild(SliderDirective) private slider: SliderDirective;

  public duration: number = 1250;

  public error: string;

  public darkModeActive: Boolean;
  
  public cities: Array<string>;
  public citiesNames: Array<string>;

  public $slidingValue: number = 0;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private ui: UiService, public citiesService: CitiesService) {}

  ngOnInit(): void {
    this.citiesService.getCities().pipe(takeUntil(this.destroy$)).subscribe(cities => {
      const listOfCities = cities.map(c => c.city);
      if(listOfCities && listOfCities.length) {
        this.cities = listOfCities;
        this.ui.$slidingValue.pipe(takeUntil(this.destroy$)).subscribe(val => this.$slidingValue = val);
      }
    }, err => {
      this.error = err;
    });
  }

  public slidingLeft(): void {
    this.slider.slidingLeft();
  }

  public slidingRight(): void {
    this.slider.slidingRight();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
}
