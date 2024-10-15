import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { FooterComponent } from './pages/footer/footer.component';

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

  constructor(private router: Router) { 
    this.router.events.subscribe(() => {
      // Verifica si estás en la página de encuestas
      this.mostrarFooter = this.router.url !== '/encuesta' && this.router.url !== '/resultados';
    });
  }

  title = 'segut';
}
