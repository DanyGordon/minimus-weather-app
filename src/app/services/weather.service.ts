import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private readonly baseURL = 'https://api.openweathermap.org/data/2.5/weather?q=';
  private readonly appID = '';
  private readonly forecastURL = 'https://api.openweathermap.org/data/2.5/forecast?q=';

  constructor(public http: HttpClient) { }

  public getWeather(city: string, metric: 'metric' | 'imperial' = 'metric'): Observable<any> {
    return this.http.get(
      `${this.baseURL}${city}&units=${metric}&APPID=${this.appID}`).pipe((first()));
  }

  public getForecast(city: string, metric: 'metric' | 'imperial' = 'metric'): Observable<any> {
    return this.http
      .get(`${this.forecastURL}${city}&units=${metric}&APPID=${this.appID}`)
      .pipe(first(), map((weather) => weather['list']));
  }
}
