import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [NzCardModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent {
  
  constructor(private router: Router, private authService: AuthService) { }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

}
