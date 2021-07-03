import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { WeatherService } from '../../services/weather.service';
import { CitiesService } from '../../services/cities.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit, OnDestroy {

  private city: string = 'Rome';
  private followedCM: Boolean;
  public cityOfMonthStatus: string;

  public temp: number;
  public condition: string;

  public capitals: Array<string> = [];

  public selectedCity: any;
  public cardCity: any;
  public showNote: Boolean = false;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(public http: HttpClient, public weather: WeatherService, public authService: AuthService, public citiesService: CitiesService) { }

  ngOnInit(): void {
    this.citiesService.getCities().pipe(takeUntil(this.destroy$)).subscribe(cities => {
      if (cities.length) {
        this.followedCM = cities.some(city => city === this.city);
        this.cityOfMonthStatus = this.followedCM ? 'Unfollow' : 'Follow';
      } else {
        this.followedCM = false;
        this.cityOfMonthStatus = 'Follow';
      }
    })

    this.weather.getWeather(this.city, 'metric').pipe(takeUntil(this.destroy$)).subscribe(weather => {
      this.temp = Math.round(weather.main.temp);    
      this.condition = weather.weather[0].main;
    })
    
    this.http.get('https://restcountries.eu/rest/v2/all').pipe(takeUntil(this.destroy$)).pipe(first()).subscribe((countries: Array<any>) => {
      countries.forEach((country: any) => {
        if (country.capital.length) {
          this.capitals.push(country.capital);
        }
      });
      this.capitals.sort();
    });
  }

  private selectCity(city: string): void {
    this.cardCity = city;
    this.showNote = false;
  }

  public toggleCityOfTheMonth(): void {
    if (this.followedCM) {
      this.citiesService.removeCity('Rome').pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.followedCM = false;
        this.cityOfMonthStatus = 'Follow';
      });
    } else {
      this.citiesService.addCity('Rome').pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.followedCM = true;
        this.cityOfMonthStatus = 'Unfollow';
      });
    }
  }

  public isCityValid(city: string): void {
    this.weather.getWeather(city, 'metric').pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        if(resp["cod"] === '404') {
          this.showNote = true;
          this.cardCity = null;
        } else {
          this.selectCity(city);
        }
      }, err => {
        if(err) {
          this.showNote = true;
          this.cardCity = null;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
