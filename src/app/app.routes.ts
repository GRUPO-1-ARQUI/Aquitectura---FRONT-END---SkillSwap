import { Routes } from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import {RegistrarseComponent} from './pages/registrarse/registrarse.component';
import {AlianzasComponent} from './pages/alianzas/alianzas.component';
import {ProyectosComponent} from './pages/proyectos/proyectos.component';
import {SobreNosotrosComponent} from './pages/sobre-nosotros/sobre-nosotros.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registrarse', component: RegistrarseComponent },
  { path: 'alianzas', component: AlianzasComponent },
  { path: 'proyectos', component: ProyectosComponent },
  { path: 'sobre-nosotros', component: SobreNosotrosComponent },

];
