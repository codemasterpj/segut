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
import { NzModalModule } from 'ng-zorro-antd/modal';



@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [NzFormModule, NzInputModule, NzButtonModule, ReactiveFormsModule, NzCheckboxModule, 
    NzSelectModule, NzIconModule, NzDatePickerModule, CommonModule, NzModalModule ],
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
    { label: 'Seguridad Digital Niños y Jovenes', value: 'temasVariados' },
    

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
  termsForm: FormGroup; 
  isTermsModalVisible = false;


  constructor( private formBuilder: FormBuilder, private registerService: RegistroService,  private message: NzMessageService, private router: Router ) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [this.confirmationValidator]],
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      edad: [null, [Validators.required, Validators.min(18)]],
      telefono: ['', [
        Validators.required,
        Validators.pattern(/^(09\d{8}|(02|03|04|05|06|07)\d{7})$/) // Solo 09 para celulares y 02-07 para convencionales
      ]],
      areas: [[], Validators.required],
      nombreEmpresa: ['', ],
      categoriaEmpresa: [null, ],
      role: ['Usuario'],

    })

    this.termsForm = this.formBuilder.group({
      termsAccepted: [false, Validators.requiredTrue]
    });
  }

  validateNumberInput(event: KeyboardEvent): void {
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    if (!allowedKeys.includes(event.key)) {
      event.preventDefault(); // Evita que se escriban caracteres no numéricos
    }
  }
  

    // Acceso rápido al FormArray de áreas
    get areasFormArray(): FormArray {
      return this.form.get('areas') as FormArray;
    }

     // Función para abrir el modal
  openTermsModal(): void {
    this.isTermsModalVisible = true;
  }

  // Función para manejar el botón "Cancelar"
  handleCancel(): void {
    this.isTermsModalVisible = false;
    this.form.get('termsAccepted')?.setValue(false); // Reinicia el checkbox
  }

  // Función para manejar el botón "Aceptar" en el modal
  handleOk(): void {
    if (this.termsForm.get('termsAccepted')?.value) { // Verifica que el checkbox esté marcado
      this.isTermsModalVisible = false; // Cierra el modal
      this.onClickRegister(); // Llama a la función de registro
    }
  }


  onClickRegister(): void  {
    
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Muestra todos los errores si el formulario es inválido
      return;
    } 

    const email = this.form.value.email;
    const password = this.form.value.password;
    const areasSeleccionadas = this.form.value.areas; // Obtén las áreas seleccionadas

    
    
    const datosParaGuardar = {
      ...this.form.value,
      areas: areasSeleccionadas // Añade las áreas seleccionadas al objeto de datos
    };


    this.registerService.createRegister({email, password}, datosParaGuardar)
    .then((response)=>{
      
      this.message.success('¡Registro exitoso!'); // Muestra el mensaje de éxito
      this.form.reset();
      
      // Retrasa la redirección por 2 segundos
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1000);
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

  get nombreEmpresa() {
  return this.form.get('nombreEmpresa');
}

  

}
