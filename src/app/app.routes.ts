import { Routes } from '@angular/router';
import {HomeComponent} from './componentes/home-component/home-component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },

];
