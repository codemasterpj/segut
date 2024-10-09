import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RegistroService } from '../../services/registro/registro.service';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [NzFormModule, NzInputModule, NzButtonModule, ReactiveFormsModule, NzCheckboxModule, NzSelectModule, NzIconModule, NzDatePickerModule, CommonModule ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {

  opcionesAreas = [
    { label: 'Tecnologia', value: 'tecnologia' },
    { label: 'Area 2', value: 'area2' },
    { label: 'Area 3', value: 'area3' },
    // Agrega más áreas según sea necesario
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

  constructor( private formBuilder: FormBuilder, private registerService: RegistroService) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [this.confirmationValidator]],
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      fechaNacimiento: [ null, [Validators.required]],
      telefono: ['', [Validators.required]],
      areas: this.formBuilder.array(this.opcionesAreas.map(() => false), Validators.required),
      nombreEmpresa: ['', [Validators.required]],
      categoria: ['', [Validators.required]],
      role: ['Usuario'],

    })
  }

    // Acceso rápido al FormArray de áreas
    get areasFormArray(): FormArray {
      return this.form.get('areas') as FormArray;
    }

  onClickRegister(): void  {
    console.log(this.form.value);
    if (this.form.invalid) return;
    const email = this.form.value.email;
    const password = this.form.value.password;
    this.registerService.createRegister({email, password}, this.form.value)
    .then((response)=>{
      console.log(response);
    })
    .catch((error)=>{console.log(error)});
   }

  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() => this.form.value.confirmPassword.updateValueAndValidity());
  }


  confirmationValidator: ValidatorFn = (control: AbstractControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value === this.form.value.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  deshabilitarMenores = (current: Date): boolean => {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return current > minDate; // Deshabilita fechas futuras que indiquen menos de 18 años
  };

  getSelectedAreas() {
    return this.opcionesAreas
      .filter((_, i) => this.areasFormArray.at(i).value)
      .map(area => area.value);
  }
  
  

}
