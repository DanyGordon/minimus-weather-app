import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { LocalstorageService } from "./localStorage.service";
import { AuthService } from "./auth.service";

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CitiesService {

  private readonly baseUrl: string = environment.backendUrl;

  constructor(private Storage: LocalstorageService, private auth: AuthService, private http: HttpClient) { }

  public getCities(): Observable<any> {
    const uid = this.Storage.getItem('uid') || this.auth.getUid();
    if(uid) {
      return this.http.get(this.baseUrl + 'users/' + uid + '/cities')
        .pipe(map((response: { cities: Array<any> }) => response.cities));
    }
  }

  public addCity(city: string): Observable<any> {
    const uid = this.Storage.getItem('uid') || this.auth.getUid();
    if (uid) {
      return this.http.post(this.baseUrl + 'users/' + uid + '/cities', { city });
    }
  }

  public removeCity(city: string): Observable<any> {
    const uid = this.Storage.getItem('uid') || this.auth.getUid();
    if (uid) {
      return this.http.delete(this.baseUrl + 'users/' + uid + '/cities/' + city);
    }
  }

}