import { Component } from '@angular/core';
import { EncuestasService } from '../../services/encuestas/encuestas.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzListModule } from 'ng-zorro-antd/list';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-administrar',
  standalone: true,
  imports: [  CommonModule, 
    FormsModule,
    ReactiveFormsModule,    NzButtonModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzLayoutModule,
    NzModalModule,
    NzRadioModule,
    NzListModule],
  templateUrl: './administrar.component.html',
  styleUrl: './administrar.component.css'
})
export class AdministrarComponent {

  encuestas: any[] = [];
  isModalVisible = false;
  formularioEncuesta: FormGroup;
  encuestaEditando: any = null;

  constructor(private encuestasService: EncuestasService, private fb: FormBuilder) { 
    this.formularioEncuesta = this.fb.group ({
      label: [''],
      descripcion: [''],
      //añadir mas campos
    });
  }ngOnInit(): void {
    this.encuestasService.obtenerEncuestas().subscribe(data => {
      this.encuestas = data;
    });
  }

  mostrarModalCrear() {
    this.isModalVisible = true;
    this.encuestaEditando = null;
    this.formularioEncuesta.reset();
  }

  mostrarModalEditar(encuesta: any) {
    this.isModalVisible = true;
    this.encuestaEditando = encuesta;
    this.formularioEncuesta.patchValue({
      label: encuesta.label,
      descripcion: encuesta.descripcion
      // Rellena otros campos según sea necesario
    });
  }

  cancelarModal() {
    this.isModalVisible = false;
    this.formularioEncuesta.reset();
  }

  confirmarModal() {
    if (this.encuestaEditando) {
      // Editar encuesta
      this.encuestasService.editarEncuesta(this.encuestaEditando.id, this.formularioEncuesta.value)
        .then(() => this.cancelarModal());
    } else {
      // Crear nueva encuesta
      this.encuestasService.crearEncuesta(this.formularioEncuesta.value)
        .then(() => this.cancelarModal());
    }
  }

  eliminarEncuesta(id: string) {
    this.encuestasService.eliminarEncuesta(id);
  }
}