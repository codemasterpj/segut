import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder,FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RegistroService } from '../../services/registro/registro.service';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { CommonModule } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';



@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [NzFormModule, NzInputModule, NzButtonModule, ReactiveFormsModule, NzCheckboxModule, NzSelectModule, NzIconModule, NzDatePickerModule, CommonModule ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {

  edades: number[] = Array.from({ length: 83 }, (_, i) => i + 18); // Edades de 18 a 100

  opcionesAreas = [
    { label: 'Seguridad Empresarial', value: 'seguridad' },
    { label: 'Acoso Laboral', value: 'acosoLaboral' },
    { label: 'Acoso Escolar', value: 'acosoEscolar' },
    { label: 'Salud Mental', value: 'saludMental' },
    { label: 'Temas Variados', value: 'temasVariados' }
  ];

    // Lista de categorías de empresas
    listaCategorias: string[] = [
      'Tecnología',
      'Salud',
      'Educación',
      'Finanzas',
      'Retail',
      'Manufactura',
      'Transporte',
      'Energía',
      'Turismo',
      'Alimentos y Bebidas'
    ];

  form: FormGroup;

  constructor( private formBuilder: FormBuilder, private registerService: RegistroService,  private message: NzMessageService, private router: Router ) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [this.confirmationValidator]],
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      edad: [null, [Validators.required, Validators.min(18)]],
      telefono: ['', [Validators.required]],
      areas: [[], Validators.required],
      nombreEmpresa: ['', [Validators.required]],
      categoriaEmpresa: [null, [Validators.required]],
      role: ['Usuario'],

    })
  }

  

    // Acceso rápido al FormArray de áreas
    get areasFormArray(): FormArray {
      return this.form.get('areas') as FormArray;
    }

  onClickRegister(): void  {
    console.log(this.form.value);
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Muestra todos los errores si el formulario es inválido
      return;
    } 

    const email = this.form.value.email;
    const password = this.form.value.password;
    const areasSeleccionadas = this.form.value.areas; // Obtén las áreas seleccionadas

    console.log('Áreas seleccionadas:', areasSeleccionadas);
    
    const datosParaGuardar = {
      ...this.form.value,
      areas: areasSeleccionadas // Añade las áreas seleccionadas al objeto de datos
    };


    this.registerService.createRegister({email, password}, datosParaGuardar)
    .then((response)=>{
      console.log('Registro exitoso',response);
      this.message.success('¡Registro exitoso!'); // Muestra el mensaje de éxito
      this.form.reset();
      
      // Retrasa la redirección por 2 segundos
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
    })
    .catch((error)=>{console.log('Error al registrar',error)
    this.message.error('Error al realizar el registro, correo ya registrado.');
  });
   }

   updateConfirmValidator(): void {
    const confirmPasswordControl = this.form.get('confirmPassword');
    if (confirmPasswordControl) {
      confirmPasswordControl.updateValueAndValidity();
    }
  }
  


  confirmationValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
    const password = this.form ? this.form.get('password')?.value : '';
    if (!control.value) {
      return { required: true };
    } else if (control.value !== password) {
      return { confirm: true };
    }
    return null;
  };
  

  deshabilitarMenores = (current: Date): boolean => {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return current > minDate; // Deshabilita fechas futuras que indiquen menos de 18 años
  };

  getSelectedAreas() {
    return this.opcionesAreas
      .filter((_, i) => this.areasFormArray.at(i).value === true) // Filtra por los controles con valor `true`
      .map(area => area.label); // Mapea para obtener los nombres de las áreas seleccionadas
  }
  

}
