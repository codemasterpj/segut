import { Component } from '@angular/core';
import { Encuesta, EncuestasService } from '../../services/encuestas/encuestas.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzListModule } from 'ng-zorro-antd/list';

import { CommonModule } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-administrar',
  standalone: true,
  imports: [  
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzLayoutModule,
    NzModalModule,
    NzRadioModule,
    NzListModule,
    NzIconModule,
    NzSelectModule  
  ],
  templateUrl: './administrar.component.html',
  styleUrls: ['./administrar.component.css']
})
export class AdministrarComponent {
  form: FormGroup;
  encuestas: Encuesta[] = [];
  isEditMode = false;
  encuestaSeleccionadaId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private encuestasService: EncuestasService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      tipo: ['', Validators.required],
      preguntas: this.fb.array([], [Validators.required, Validators.minLength(1)])
    });
    this.cargarEncuestas();
  }

  get preguntas(): FormArray {
    return this.form.get('preguntas') as FormArray;
  }

  nuevaPregunta(): FormGroup {
    return this.fb.group({
      texto: ['', Validators.required],
      tipoRespuesta: [null, Validators.required]
    });
  }

  agregarPregunta(): void {
    this.preguntas.push(this.nuevaPregunta());
  }

  eliminarPregunta(index: number): void {
    this.preguntas.removeAt(index);
    if (this.preguntas.length === 0) {
      this.form.get('preguntas')?.setErrors({ 'minlength': true }); // Marca error si no hay preguntas
    }
  }
  

  crearEncuesta(): void {
    if (this.form.invalid || !this.preguntasCompletas()) {
      this.form.markAllAsTouched();
      return;
    }

    const encuesta: Encuesta = this.form.value;
    this.encuestasService.crearEncuesta(encuesta)
      .then(() => {
        this.message.success('Encuesta creada con éxito.');
        this.form.reset();
        this.preguntas.clear();
        this.cargarEncuestas();
      })
      .catch((error) => {
        console.error('Error al crear la encuesta:', error);
        this.message.error('Error al crear la encuesta.');
      });
  }

  cargarEncuestas(): void {
    this.encuestasService.obtenerEncuestas().subscribe((encuestas) => {
      this.encuestas = encuestas;
    });
  }

  eliminarEncuesta(id: string): void {
    this.encuestasService.eliminarEncuesta({id} as Encuesta)
      .then(() => {
        this.message.success('Encuesta eliminada con éxito.');
        this.cargarEncuestas();
      })
      .catch((error) => {
        console.error('Error al eliminar la encuesta:', error);
        this.message.error('Error al eliminar la encuesta.');
      });
  }

  editarEncuesta(encuesta: Encuesta): void {
    this.isEditMode = true;
    this.encuestaSeleccionadaId = encuesta.id || null;
    this.form.patchValue({
      titulo: encuesta.titulo,
      tipo: encuesta.tipo,
      descripcion: encuesta.descripcion
    });
    this.preguntas.clear();
    if (encuesta.preguntas) {
      encuesta.preguntas.forEach((pregunta: any) => {
        const preguntaForm = this.fb.group({
          texto: [pregunta.texto, Validators.required],
          tipoRespuesta: [pregunta.tipoRespuesta, Validators.required]
        });
        this.preguntas.push(preguntaForm);
      });
    }
  }

  actualizarEncuesta(): void {
    if (!this.encuestaSeleccionadaId) {
      this.message.error('No se ha seleccionado ninguna encuesta para actualizar.');
      return;
    }
    if (this.form.invalid || !this.preguntasCompletas()) {
      this.form.markAllAsTouched();
      return;
    }
  
    const encuestaActualizada: Encuesta = {
      id: this.encuestaSeleccionadaId,
      ...this.form.value
    };
  
    this.encuestasService.actualizarEncuesta(encuestaActualizada)
      .then(() => {
        this.message.success('Encuesta actualizada con éxito.');
        this.form.reset();
        this.preguntas.clear();
        this.isEditMode = false;
        this.cargarEncuestas();
        this.encuestaSeleccionadaId = null; // Limpia el ID seleccionado
      })
      .catch((error) => {
        console.error('Error al actualizar la encuesta:', error);
        this.message.error('Error al actualizar la encuesta.');
      });
  }
  

  cancelarEdicion(): void {
    this.isEditMode = false;
    this.form.reset();
    this.preguntas.clear();
  }

  preguntasCompletas(): boolean {
    return this.preguntas.controls.every((pregunta) => {
      return pregunta.get('texto')?.value && pregunta.get('tipoRespuesta')?.value;
    });
  }
  
}
