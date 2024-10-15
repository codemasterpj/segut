import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { FooterComponent } from './pages/footer/footer.component';
import { AuthService } from './services/auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, NzIconModule, NzLayoutModule, NzMenuModule, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isLoggedIn = false;
  isAdmin = false;
  isCollapsed = false;

  mostrarFooter = true;

  constructor(private router: Router, private authService: AuthService, private message: NzMessageService) { 
    this.router.events.subscribe(() => {
      // Verifica si estás en la página de encuestas
      this.mostrarFooter = this.router.url !== '/encuesta' && this.router.url !== '/resultados';
    });

      // Escucha el cambio de usuario actual para actualizar isLoggedIn
      this.authService.onAuthStateChanged((user) => {
      this.isLoggedIn = !!user;

      });
  }

   // Método para manejar el login y logout
   handleAuthAction() {
    if (this.isLoggedIn) {
      this.authService.logout()
        .then(() => {
          // Mostrar el mensaje y esperar a que finalice antes de redirigir
          this.message.success('¡Sesión cerrada con éxito!', { nzDuration: 1500 }).onClose!.subscribe(() => {
            window.location.href = '/welcome';  // Redirige y recarga una vez que el mensaje se cierra
          });
        })
        .catch(error => {
          console.error('Error al cerrar sesión:', error);
          this.message.error('Error al cerrar sesión, intenta de nuevo.');
        });
    } else {
      this.router.navigate(['/login']);
    }
  }
  
  
  

  

  title = 'segut';
}
