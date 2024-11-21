import { Component } from '@angular/core';
import { Encuesta, EncuestasService } from '../../services/encuestas/encuestas.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
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
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { updateDoc } from '@angular/fire/firestore';

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
    NzSelectModule,
    NzPaginationModule  
  ],
  templateUrl: './administrar.component.html',
  styleUrls: ['./administrar.component.css']
})
export class AdministrarComponent {
  form: FormGroup;
  encuestas: Encuesta[] = [];
  paginatedEncuestas: Encuesta[] = [];
  pageIndex = 1;
  pageSize = 5;
  isEditMode = false;
  encuestaSeleccionadaId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private encuestasService: EncuestasService,
    private message: NzMessageService,
    private modal: NzModalService // Inyecta NzModalService aquí
  ) {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      tipo: ['', Validators.required],
      preguntas: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      resultados: this.fb.array([], [Validators.required, Validators.minLength(1)], )
    });
    this.cargarEncuestas();
  }

  get preguntas(): FormArray {
    return this.form.get('preguntas') as FormArray;
  }

  get resultados(): FormArray {
    return this.form.get('resultados') as FormArray;
  }

  nuevaPregunta(): FormGroup {
    return this.fb.group({
      texto: ['', Validators.required],
      tipoRespuesta: [null, Validators.required],
      imgUrl: [''], // Cambiado a imgUrl
    });
  }

  nuevaResultado(minCalificacion: number = 0): FormGroup {
    return this.fb.group({
      descripcion: ['', Validators.required],
      calificacionMinima: [{ value: minCalificacion, disabled: true }, Validators.required],
      calificacionMaxima: [30, Validators.required]
    });
  }

  agregarPregunta(): void {
    this.preguntas.push(this.nuevaPregunta());
  }

  agregarResultado(): void {
    const minCalificacion = this.resultados.length > 0
      ? this.resultados.at(this.resultados.length - 1).get('calificacionMaxima')?.value
      : 0;

    const nuevoResultado = this.nuevaResultado(minCalificacion);
    this.resultados.push(nuevoResultado);

    // Llamar a actualizar los valores mínimos de todos los resultados
    this.actualizarMinimosAutomaticamente();
  }

  eliminarPregunta(index: number, event: Event): void {
    event.preventDefault();  // Evita el envío del formulario

    this.preguntas.removeAt(index);

    if (this.preguntas.length === 0) {
      this.form.get('preguntas')?.setErrors({ 'minlength': true }); // Marca error si no hay preguntas
    }
}


  eliminarResultado(index: number): void {
    this.resultados.removeAt(index);
    this.actualizarMinimosAutomaticamente();
  }

  actualizarMinimosAutomaticamente(): void {
    this.resultados.controls.forEach((control, i) => {
      if (i > 0) {
        const prevMax = this.resultados.at(i - 1).get('calificacionMaxima')?.value;
        control.get('calificacionMinima')?.setValue(prevMax);
        control.get('calificacionMinima')?.disable();
      } else {
        control.get('calificacionMinima')?.setValue(0); // Asegura que el primer resultado tenga 0 como mínimo
        control.get('calificacionMinima')?.disable();
      }

      // Suscripción a cambios en calificacionMaxima para mantener actualizados los valores mínimos
      control.get('calificacionMaxima')?.valueChanges.subscribe(() => {
        this.actualizarMinimosAutomaticamente();
      });
    });
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
        this.resultados.clear();
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
      this.actualizarPaginacion();
    });
  }

  actualizarPaginacion(): void {
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEncuestas = this.encuestas.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.actualizarPaginacion();
  }

  eliminarEncuesta(id: string): void {
    this.modal.confirm({
      nzTitle: '¿Estás seguro de que quieres eliminar esta encuesta?',
      nzContent: 'Esta acción no se puede deshacer',
      nzOkText: 'Sí',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.encuestasService.eliminarEncuesta({ id } as Encuesta)
          .then(() => {
            this.message.success('Encuesta eliminada con éxito.');
            this.cargarEncuestas();
          })
          .catch((error) => {
            console.error('Error al eliminar la encuesta:', error);
            this.message.error('Error al eliminar la encuesta.');
          });
      },
      nzCancelText: 'No',
      nzOnCancel: () => {
        this.message.info('Eliminación cancelada');
      },
    });
  }

  editarEncuesta(encuesta: Encuesta): void {
    this.isEditMode = true;
    this.encuestaSeleccionadaId = encuesta.id || null;
  
    this.form.patchValue({
      titulo: encuesta.titulo,
      tipo: encuesta.tipo,
      descripcion: encuesta.descripcion,
    });
  
    this.preguntas.clear();
    this.resultados.clear();
  
    if (encuesta.preguntas) {
      encuesta.preguntas.forEach((pregunta: any) => {
        const preguntaForm = this.fb.group({
          texto: [pregunta.texto, Validators.required],
          tipoRespuesta: [pregunta.tipoRespuesta, Validators.required],
          imgUrl: [pregunta.imgUrl || ''], // Asegurarse de cargar el imgUrl
        });
        this.preguntas.push(preguntaForm);
      });
    }
  
    if (encuesta.resultados) {
      encuesta.resultados.forEach((resultado: any) => {
        const resultadoForm = this.fb.group({
          descripcion: [resultado.descripcion, Validators.required],
          calificacionMinima: [resultado.calificacionMinima, Validators.required],
          calificacionMaxima: [resultado.calificacionMaxima, Validators.required],
        });
        this.resultados.push(resultadoForm);
      });
  
      this.actualizarMinimosAutomaticamente();
    }
  }
  

  actualizarEncuesta(): void {
    if (!this.isEditMode || !this.encuestaSeleccionadaId) return;
    if (this.form.invalid || !this.preguntasCompletas()) {
      this.form.markAllAsTouched();
      return;
    }
  
    const encuestaActualizada: Encuesta = {
      id: this.encuestaSeleccionadaId,
      ...this.form.value, // Valores del formulario
      preguntas: this.preguntas.value, // Asegurarse de incluir las preguntas completas
    };
  
    console.log('Encuesta antes de enviar para actualizar:', encuestaActualizada);
  
    this.encuestasService.actualizarEncuesta(encuestaActualizada)
      .then(() => {
        this.message.success('Encuesta actualizada con éxito.');
        this.form.reset();
        this.preguntas.clear();
        this.resultados.clear();
        this.isEditMode = false;
        this.cargarEncuestas();
        this.encuestaSeleccionadaId = null;
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
    this.resultados.clear();
  }

  preguntasCompletas(): boolean {
    return this.preguntas.controls.every((pregunta) => {
      return pregunta.get('texto')?.value && pregunta.get('tipoRespuesta')?.value;
    });
  }

  obtenerResultado(calificacion: number): string {
    const resultado = this.resultados.controls.find((control) => {
      const min = control.get('calificacionMinima')?.value;
      const max = control.get('calificacionMaxima')?.value;
      return calificacion >= min && calificacion <= max;
    });

    return resultado ? resultado.get('descripcion')?.value : 'Sin resultado';
  }
  
  async cargarImagen(event: Event, preguntaIndex: number): Promise<void> {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files[0]) {
      const file = input.files[0];
      console.log('Archivo seleccionado:', file);
  
      try {
        const imgUrl = await this.encuestasService.subirImagen(file);
        console.log('URL devuelto al cargar la imagen:', imgUrl);
  
        // Asigna el URL generado al campo imgUrl de la pregunta
        this.preguntas.at(preguntaIndex).get('imgUrl')?.setValue(imgUrl);
      } catch (error) {
        console.error('Error al cargar la imagen:', error);
      }
    } else {
      console.warn('No se seleccionó ningún archivo.');
    }
  }
  
  



  
  
}
