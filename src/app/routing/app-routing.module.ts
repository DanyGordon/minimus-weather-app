import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from '../pages/home/home.component';
import { AddComponent } from '../pages/add/add.component';
import { DetailsComponent } from '../pages/details/details.component';
import { LoginComponent } from '../pages/login/login.component';
import { SignupComponent } from '../pages/signup/signup.component';
import { AppGuard } from '../guards/app.guard';
import { AuthGuard } from '../guards/auth.guard';
import { PageNotFoundComponent } from '../pages/page-not-found/page-not-found.component';

const routes: Routes = [
  { path: 'home',  component: HomeComponent, canActivate:[AppGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'add', component: AddComponent, canActivate:[AppGuard] },
  { path: 'details/:id', component: DetailsComponent, canActivate:[AppGuard] },
  { path: 'login', component: LoginComponent, canActivate:[AuthGuard] },
  { path: 'signup', component: SignupComponent, canActivate:[AuthGuard] },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled',
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }