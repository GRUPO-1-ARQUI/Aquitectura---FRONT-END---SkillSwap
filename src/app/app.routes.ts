import { Routes } from '@angular/router';
import { HomeComponent } from './componentes/home-component/home-component';
import { LoginComponent } from './componentes/login-component/login-component';
import { RegistrarComponent } from './componentes/registrar-component/registrar-component';
import { ProyectosComponent } from './componentes/proyectos-component/proyectos-component';
import { NosotrosComponent } from './componentes/nosotros-component/nosotros-component';
import { BeneficiosComponent } from './componentes/beneficios-component/beneficios-component';
import { ContactoComponent } from './componentes/contacto-component/contacto-component';
import { UniAfiliadasComponent } from './componentes/uni-afiliadas-component/uni-afiliadas-component';
import {AlianzasComponent} from './componentes/alianzas-component/alianzas-component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registrar', component: RegistrarComponent },
  { path: 'proyectos', component: ProyectosComponent },
  { path: 'alianzas', component: AlianzasComponent },
  { path: 'nosotros', component: NosotrosComponent },
  { path: 'beneficios', component: BeneficiosComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'uni-afiliadas', component: UniAfiliadasComponent },
];
