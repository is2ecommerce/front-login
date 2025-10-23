
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { UserProfile } from './pages/user-profile/user-profile';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'profile',
    component: UserProfile
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
