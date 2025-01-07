import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { RouterLink } from '@angular/router';
import { RegistroService } from '../../services/registro/registro.service';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NzFormModule, NzButtonModule, NzInputModule, ReactiveFormsModule, RouterLink,  NzCheckboxModule,  RouterLink, NzIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form: FormGroup;
  loginExitoso = false;
  
  constructor( private registerService: RegistroService, private formBuilder: FormBuilder, private message: NzMessageService, private router: Router ) {
      this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      remember: [false]
    })
  }

  passwordVisible: boolean = false;

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }


  onClickLogin(): void  {
    if(this.form.invalid) return;
    this.registerService.login(this.form.value)
    .then((response)=>{
      
      this.message.success('¡Ingreso exitoso!'); // Muestra el mensaje de éxito
        // Retrasa la redirección por 2 segundos
        setTimeout(() => {
          this.router.navigate(['/encuesta']);
        }, 1500);
      
    })
    .catch((error)=>{
      
      this.message.error('Error: Usuario o contraseña incorrecto');
    })
   }

  }