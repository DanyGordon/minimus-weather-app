import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CitiesService } from '../../../services/cities.service';
import { UiService } from '../../../services/ui.service';
import { WeatherService } from '../../../services/weather.service';

@Component({
  selector: 'app-weather-card',
  templateUrl: './weather-card.component.html',
  styleUrls: ['./weather-card.component.scss']
})
export class WeatherCardComponent implements OnInit, OnDestroy {

  @Input() public city: string;

  @Input() public addMode: boolean;

  @Output() private cityStored: EventEmitter<any> = new EventEmitter();

  public currentTemp: number;
  public condition: string;
  public minTemp: number;
  public maxTemp: number;

  public errorMessage: string;

  public darkModeActive: Boolean;

  public cityAdded = false;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private ui: UiService, private weatherService: WeatherService, private citiesService: CitiesService, private router: Router) { }

  ngOnInit(): void {
    this.ui.darkModeState.pipe(takeUntil(this.destroy$)).subscribe(isDark => this.darkModeActive = isDark);

    this.weatherService.getWeather(this.city, 'metric').pipe(takeUntil(this.destroy$)).subscribe((state) => {
      state.weather.filter(cond => this.condition = cond.main);
      this.currentTemp = Math.floor(state.main.temp);
      this.maxTemp = Math.floor(state.main.temp_max);
      this.minTemp = Math.floor(state.main.temp_min);
    }, err => setTimeout(() => this.errorMessage = err.message, 3000));

    this.weatherService.getForecast(this.city, 'metric').pipe(takeUntil(this.destroy$)).subscribe(state => {
      for (const res of state) {
        if (new Date().toLocaleDateString('en-GB') === new Date(res.dt_txt).toLocaleDateString('en-GB')) {
          this.maxTemp = res.main.temp > this.maxTemp ? Math.round(res.main.temp) : this.maxTemp;
          this.minTemp = res.main.temp < this.minTemp ? Math.round(res.main.temp) : this.minTemp;
        }
      }
    }, err => setTimeout(() => this.errorMessage = err.message, 3000));
  }

  public openDetails($event: Event): void {
    if(!this.addMode || !$event.target['classList'].contains('add-city-btn')) {
      this.router.navigate([`/details/${this.city}`]);
    }
  }

  public addCity(): void {
    this.citiesService.addCity(this.city).pipe(takeUntil(this.destroy$)).subscribe(status => {
      this.city = null;
      this.maxTemp = null;
      this.minTemp = null;
      this.condition = null;
      this.currentTemp = null;
      this.cityAdded = true;
      this.cityStored.emit();
      
      setTimeout(() => this.cityAdded = false, 2000);
    }, err => console.log(err));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
