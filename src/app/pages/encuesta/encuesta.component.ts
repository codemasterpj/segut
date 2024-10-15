import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Encuesta, EncuestasService } from '../../services/encuestas/encuestas.service';
import { RegistroService } from '../../services/registro/registro.service';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { Firestore, collection, addDoc } from '@angular/fire/firestore'; 
import { NzSelectModule } from 'ng-zorro-antd/select';
import { TituloEncuestaPipe } from '../../pipe/titulo-encuesta.pipe';


@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [    CommonModule,
    NzLayoutModule,
    NzGridModule,
    NzButtonModule,
    NzFormModule,
    NzCardModule,
    NzRadioModule,
    ReactiveFormsModule,
    NzListModule,
    FormsModule,
    NzRateModule,NzSelectModule, TituloEncuestaPipe
  ],
  templateUrl: './encuesta.component.html',
  styleUrl: './encuesta.component.css'
})
export class EncuestaComponent implements OnInit {
  encuestasPorTipo: { [tipo: string]: Encuesta[] } = {};
  tiposDeInteres: string[] = [];
  tipoSeleccionado: string | null = null;
  encuestaSeleccionada: Encuesta | null = null;
  respuestas: (string | null)[] = [];
  nombre: string = '';
  apellido: string = '';
  areaCurso: string = '';
  proposito: string = '';
  edad: number | string = ''; 
  sexo: string = '';
  

  constructor(
    private firestore: Firestore,
    private encuestasService: EncuestasService,
    private registroService: RegistroService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.tiposDeInteres = this.registroService.obtenerAreasPreferidas() || [];
    this.cargarEncuestas();
  }

  cargarEncuestas(): void {
    this.encuestasService.obtenerEncuestas().subscribe((encuestas) => {
      const encuestasFiltradas = encuestas.filter((encuesta) => 
        this.tiposDeInteres.includes(encuesta.tipo)
      );
      this.encuestasPorTipo = this.agruparPorTipo(encuestasFiltradas);
    });
  }

  agruparPorTipo(encuestas: Encuesta[]): { [tipo: string]: Encuesta[] } {
    return encuestas.reduce((grupos, encuesta) => {
      const tipo = encuesta.tipo || 'Sin tipo';
      if (!grupos[tipo]) {
        grupos[tipo] = [];
      }
      grupos[tipo].push(encuesta);
      return grupos;
    }, {} as { [tipo: string]: Encuesta[] });
  }

  obtenerClaves(obj: { [key: string]: any }): string[] {
    return Object.keys(obj);
  }

  toggleTipo(tipo: string): void {
    this.tipoSeleccionado = this.tipoSeleccionado === tipo ? null : tipo;
  }

  seleccionarEncuesta(encuesta: Encuesta, event: Event): void {
    event.stopPropagation();
    this.encuestaSeleccionada = encuesta;
    this.respuestas = Array(encuesta.preguntas?.length).fill(null);
  }

  enviarEncuesta(): void {
    const userId = this.registroService.getUserId();

      // Verifica si userId está disponible
  if (!userId) {
    console.error('No se pudo obtener el ID del usuario.');
    alert('Hubo un problema con la autenticación del usuario. Por favor, intenta iniciar sesión nuevamente.');
    return;
  }
    const respuesta = {
      encuestaId: this.encuestaSeleccionada?.id,
      userId: userId,
      nombre: this.nombre,
      apellido: this.apellido,
      edad: this.edad,
      sexo: this.sexo,
      areaCurso: this.areaCurso,
      proposito: this.proposito,
      respuestas: this.respuestas
    };

    const respuestasRef = collection(this.firestore, 'respuestas');
    addDoc(respuestasRef, respuesta)
      .then(() => {
        alert('Encuesta enviada con éxito.');
        this.limpiarFormulario();
      })
      .catch(error => {
        console.error('Error al enviar la encuesta:', error);
        alert('Hubo un problema al enviar la encuesta.');
      });
  }

  limpiarFormulario(): void {
    this.nombre = '';
    this.apellido = '';
    this.edad = '';
    this.sexo = '';
    this.areaCurso = '';
    this.proposito = '';
    this.respuestas = Array(this.encuestaSeleccionada?.preguntas?.length).fill(null);
  }
}