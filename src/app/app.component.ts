import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { FooterComponent } from './pages/footer/footer.component';
import { AuthService } from './services/auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Register, RegistroService } from './services/registro/registro.service';

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
  isGestor = false;
  isCollapsed = false;

  mostrarFooter = true;

  constructor(private router: Router, private authService: AuthService, private message: NzMessageService, private registroService: RegistroService) { 
    this.router.events.subscribe(() => {
      // Verifica si estás en la página de encuestas
      this.mostrarFooter = this.router.url !== '/encuesta' && this.router.url !== '/resultados';
    });

  }

  ngOnInit() {
    this.authService.onAuthStateChanged((user) => {
      this.isLoggedIn = !!user;
      if (this.isLoggedIn && user?.uid) {
        this.registroService.getRegister(user.uid).then(querySnapshot => {
          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              const register = doc.data() as Register;
              this.registroService.currentRegister = register;
  
              // Imprimir el valor del rol exacto para depuración
              console.log('Role obtenido:', register.role);
  
              // Comparar con "Administrador" y "Gestor"
              this.isAdmin = register.role.trim() === 'Administrador';
              this.isGestor = register.role.trim() === 'Gestor';
  
              // Imprimir los resultados para depuración
              console.log('isAdmin:', this.isAdmin);
              console.log('isGestor:', this.isGestor);
            });
          } else {
            console.log('No se encontró el registro del usuario.');
          }
        });
      }
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
