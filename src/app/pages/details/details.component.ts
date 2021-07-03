import { isPlatformServer } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CitiesService } from '../../services/cities.service';
import { WeatherService } from '../../services/weather.service';
import { UiService } from '../../services/ui.service';
import { TwitterService } from '../../services/twitter.service';

import { SliderDirective } from '../../directives/slider-directives/slider.directive'

interface conditionProcessingOption {
  avrgTemp: boolean,
  minMaxTemp: boolean
}

interface precipitationInfo {
  pop: number, 
  rain: { "3h": number }, 
  snow: { "3h": number }, 
  dt_txt: string
}

interface computPrecipitResult {
  precipitation: number,
  time: string
}

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('slider') private slider: ElementRef;

  @ViewChild(SliderDirective) private slDir: SliderDirective;

  public duration: number = 1400;

  public darkModeActive: Boolean;

  public city: string;

  private illustrationList: Array<string> = ['Paris', 'Tokio', 'Doha', 'Tunis'];
  public illustration: String;

  public isSubscribed: boolean = true;
  public operation: string = null;

  public tweets$: Observable<any>;

  public currentTemp: number;
  public condition: string;
  public humidity: Number;
  public wind: Number;

  private conditionsList = {
    Sunny: 0,
    Storm: 0,
    Clouds: 0,
    Rain: 0,
    Drizzle: 0,
    Clear: 0,
    Fog: 0,
    Haze: 0,
    Mist: 0,
    Snow: 0
  };

  private forecastCondition = [];

  public forecastTemp = [];
  public forecastPress = [];
  public forecastPrecipitation = [];
  public forecastWind = [];
  public forecastHumidity = [];
  public forecastMinMaxTemp = [];

  public trackLength: number;
  public disable: Boolean = true;

  public $slidingValue: number = 0;

  public chartTemperature: string = 'temperature';
  public chartPressure: string = 'pressure';

  private tempChartVisibility: Boolean = false;
  private pressChartVisibility: Boolean = false;
  private weatherTableVisibility: Boolean = false;

  private interectionOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 1.0
  }
  private intersectionObserver: IntersectionObserver;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private ui: UiService, 
    private citiesService: CitiesService, 
    private weatherService: WeatherService,
    private twitter: TwitterService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID)
    private readonly platformId: any,
  ) { }

  ngOnInit(): void {
    this.ui.darkModeState.pipe(takeUntil(this.destroy$)).subscribe(isDark => this.darkModeActive = isDark);
    this.ui.$slidingValue.pipe(takeUntil(this.destroy$)).subscribe(val => this.$slidingValue = val);
    
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => this.city = params.id);
    this.illustration = this.setIllustration(this.city);

    this.citiesService.getCities().pipe(takeUntil(this.destroy$))
      .subscribe((cities: Array<any>) => cities.some(c => c.city === this.city) ? this.isSubscribed = true : this.isSubscribed = false)
    
    this.weatherService.getWeather(this.city, 'metric').pipe(takeUntil(this.destroy$)).subscribe((state) => {
      state.weather.filter(cond => this.condition = cond.main);
      this.currentTemp = Math.floor(state.main.temp);
      this.humidity = state.main.humidity;
      this.wind = Math.round(state.wind.speed);
    });

    this.weatherService.getForecast(this.city, 'metric').pipe(takeUntil(this.destroy$)).subscribe(state => this.processingForecasts(state));

    this.tweets$ = this.twitter.fetchTwitter(this.city);
    
    if(!isPlatformServer(this.platformId)) {
      this.intersectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(item => this.processIntersection(item, observer));
      }, this.interectionOptions);
    }
  }

  ngAfterViewInit(): void {
    if(!isPlatformServer(this.platformId)) {
      setTimeout(async () => {
        if(this.slider.nativeElement.getBoundingClientRect().width * this.slider.nativeElement.children.length > 0) {
          this.disable = false;
          const childrenLength = this.slider.nativeElement.children.length;
          for (let i = 0; i < childrenLength; i++) {
            if (i + 1 < childrenLength) {
              this.intersectionObserver.observe(this.slider.nativeElement.children[i+1]);
            }
          }
        }
      }, 1400);
    }
  }

  private setIllustration(city: string): string {
    return this.illustrationList.includes(city) ? city.toLowerCase() : 'default';
  }
  
  public unsubFromCity(): void {
    this.citiesService.removeCity(this.city).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.operation = 'deleted';
      this.isSubscribed = false;
      setTimeout(() => {
        this.operation = null;
        this.router.navigate(['/'])
      }, 3500);
    });
  }
  
  public subOnCity(): void {
    this.citiesService.addCity(this.city).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.operation = 'added';
      this.isSubscribed = true;
      setTimeout(() => {
        this.operation = null;
      }, 3500);
    });
  }

  private processingForecasts(state: Array<any>): void {
    this.forecastConditionsProcessing(state, { avrgTemp: true, minMaxTemp: true });
    this.forecastTemp = state
      .map(hourlyInt => ({ temp: hourlyInt.main.temp, time: hourlyInt.dt_txt }));

    this.forecastPress = state
      .map(hourlyInt => ({ pressure: hourlyInt.main.pressure, time: hourlyInt.dt_txt }));

    this.forecastWind = state
      .map(hourlyInt => ({ wind: hourlyInt.wind, time: hourlyInt.dt_txt }));

    this.forecastHumidity = state
      .map(hourlyInt => ({ humidity: hourlyInt.main.humidity, time: hourlyInt.dt_txt }));

    this.forecastPrecipitation = state
      .map(int => this.computePrecipitation(int));
      
  }

  private forecastConditionsProcessing(state: any, options: conditionProcessingOption): void {
    for(let i = 0; i < 5; i++) {
      const days = state.filter(day => this.computeDay(day, i));

      days.filter(state => this.conditionsList[state.weather[0].main]++);

      const condition = this.computeCondition();
      
      if (options.avrgTemp) {
        const temp = this.computeAvgTemp(0, days);
        this.forecastCondition.push({ time: new Date(days[0].dt_txt), temp, condition })
      }

      if (options.minMaxTemp) {
        const minTemp = this.computeMinTemp(days);
        const maxTemp = this.computeMaxTemp(days);
        this.forecastMinMaxTemp.push({ time: new Date(days[0].dt_txt), minTemp, maxTemp, condition })
      }
    }
  }
  
  private computeDay(day: { dt_txt: string }, indx: number): boolean {
    return Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(new Date().setDate(new Date().getDate() + indx)) === 
      Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(new Date(day.dt_txt));
  }
  
  private computeAvgTemp(tempAccm: number = 0, arrayOfTempValue: Array<any>): number {
    arrayOfTempValue.filter(state => tempAccm += Math.floor(state.main.temp));
    return Math.floor(tempAccm / arrayOfTempValue.length);
  }

  private computeMinTemp(arrayOfTempValue: Array<any>): number {
    return Math.round(Math.min(...arrayOfTempValue.map(weather => weather.main.temp_min)));
  }

  private computeMaxTemp(arrayOfTempValue: Array<any>): number {
    return Math.round(Math.max(...arrayOfTempValue.map(weather => weather.main.temp_min)));
  }
  
  private computeCondition(counter = 0, cond = ''): string {
    Object.entries(this.conditionsList).filter((item) => {
      if (item[1] > counter) {
        counter = item[1];
        cond = item[0];
      }
    });
    return cond;
  }
  
  private computePrecipitation(prectnInfo: precipitationInfo): computPrecipitResult {
    if(prectnInfo.pop === 0 || (!prectnInfo.rain && !prectnInfo.snow)) {
      return { precipitation: 0, time: prectnInfo.dt_txt };
    } else {
      if(prectnInfo.rain && prectnInfo.snow) {
        return { precipitation: prectnInfo.rain['3h'] + prectnInfo.snow['3h'], time: prectnInfo.dt_txt };
      } else {
        return prectnInfo.rain 
          ? { precipitation: prectnInfo.rain['3h'], time: prectnInfo.dt_txt }
          : { precipitation: prectnInfo.snow['3h'], time: prectnInfo.dt_txt }
      }
    }
  }

  public slidingLeft(): void {
    this.slDir.slidingLeft();
  }

  public slidingRight(): void {
    this.slDir.slidingRight();
  }

  private processIntersection(item: IntersectionObserverEntry, observer: IntersectionObserver): void {
    if(item.isIntersecting) {
      if (item.target.className === 'weather-parameters__card temperature') {
        this.tempChartVisibility = true;
      }
      if(item.target.className === 'weather-parameters__card pressure') {
        this.pressChartVisibility = true;
      }
      if(item.target.className === 'weather-parameters__card table') {
        this.weatherTableVisibility = true;
      }
    }
    const isAll = [this.tempChartVisibility, this.pressChartVisibility, this.weatherTableVisibility].every(item => item === true);
    if(isAll) {
      observer.disconnect();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

}