import { Routes } from '@angular/router';
import {HomeComponent} from './componentes/home-component/home-component';
import {IndexComponent} from './componentes/index-login-component/index-component';

export const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'home', component: HomeComponent },

];
