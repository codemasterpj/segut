import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { EncuestaComponent } from './pages/encuesta/encuesta.component';
import { ResultadosComponent } from './pages/resultados/resultados.component';
import { AdministrarComponent } from './pages/administrar/administrar.component';
import { ContactoComponent } from './pages/contacto/contacto.component';

import { RegistroComponent } from './pages/registro/registro.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel.component';
import { RespondeEncuestaComponent } from './pages/responde-encuesta/responde-encuesta.component';
import { LeyProteccionDatosComponent } from './pages/ley-proteccion-datos/ley-proteccion-datos.component';
import { TerminosCondicionesComponent } from './pages/terminos-condiciones/terminos-condiciones.component';
import { ReporteEncuestasComponent } from './pages/reporte-encuestas/reporte-encuestas.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES) },
  
  { path: 'encuesta', component: EncuestaComponent},
  { path: 'responde-encuesta', component: RespondeEncuestaComponent},
  { path: 'resultados', component: ResultadosComponent},
  { path: 'panel', component: AdminPanelComponent},
  { path: 'administrar', component: AdministrarComponent},
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'contacto', component: ContactoComponent},
  { path: 'reporte-encuestas', component: ReporteEncuestasComponent},

  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'proteccion-datos', component: LeyProteccionDatosComponent },
  { path: 'terminos', component: TerminosCondicionesComponent },
  { path: '**', redirectTo: '/welcome', pathMatch: 'full' } 
];
