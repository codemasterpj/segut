import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, NzFormModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recuperar-password.component.html',
  styleUrl: './recuperar-password.component.css'
})
export class RecuperarPasswordComponent {
  form: FormGroup;
  mensaje: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private message: NzMessageService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  recuperarContrasena(): void {
    if (this.form.valid) {
      const email = this.form.get('email')?.value;
      this.authService.recuperarContrasena(email).then(() => {
        this.mensaje = 'Se ha enviado un enlace de recuperación a su correo.';
        this.message.success(this.mensaje);
      }).catch(error => {
        console.error('Error en la recuperación:', error);
        this.mensaje = 'Hubo un error al enviar el enlace. Inténtelo de nuevo.';
        this.message.error(this.mensaje);
      });
    }
  }
}