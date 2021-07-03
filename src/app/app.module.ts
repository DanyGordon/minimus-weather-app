import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { TransferHttpCacheModule } from '@nguniversal/common';

import { HammerGestureConfig } from '@angular/platform-browser';

import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './routing/app-routing.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { DetailsComponent } from './pages/details/details.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { AddComponent } from './pages/add/add.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

import { WeatherCardComponent } from './components/home-components/weather-card/weather-card.component';
import { AddCardComponent } from './components/home-components/add-card/add-card.component';
import { HeaderComponent } from './components/layouts-components/header/header.component';
import { SidebarComponent } from './components/layouts-components/sidebar/sidebar.component';
import { LineChartComponent } from './components/charts-components/line-chart/line-chart.component';
import { WeatherTableComponent } from './components/details-components/weather-table/weather-table.component';

import { AuthService } from './services/auth.service';
import { CitiesService } from './services/cities.service';
import { UiService } from './services/ui.service';
import { WeatherService } from './services/weather.service';
import { TwitterService } from './services/twitter.service';
import { LocalstorageService } from './services/localStorage.service';

import { AuthInterceptor } from './interceptors/auth.interceptor';

import { ChartDirective } from './directives/details-directives/chart.directive';
import { SliderDirective } from './directives/slider-directives/slider.directive';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DetailsComponent,
    LoginComponent,
    SignupComponent,
    AddComponent,
    PageNotFoundComponent,
    HeaderComponent,
    SidebarComponent,
    WeatherCardComponent,
    AddCardComponent,
    LineChartComponent,
    WeatherTableComponent,
    ChartDirective,
    SliderDirective
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    TransferHttpCacheModule,
    AppRoutingModule,
    HttpClientModule,
    NguiAutoCompleteModule,
    FormsModule,
  ],
  providers: [
    LocalstorageService,
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    UiService,
    WeatherService,
    AuthService,
    CitiesService,
    TwitterService,
    HammerGestureConfig
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }