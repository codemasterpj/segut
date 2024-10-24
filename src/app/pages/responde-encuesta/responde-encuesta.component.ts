import { Component, OnInit } from '@angular/core';
import { Encuesta, EncuestasService } from '../../services/encuestas/encuestas.service';
import { ActivatedRoute } from '@angular/router';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRateModule } from 'ng-zorro-antd/rate';

@Component({
  selector: 'app-responde-encuesta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NzSelectModule, NzRateModule],
  templateUrl: './responde-encuesta.component.html',
  styleUrl: './responde-encuesta.component.css'
})
export class RespondeEncuestaComponent implements OnInit {
  encuestaId: string | null = null;
  encuestadorId: string | null = null;
  encuesta: Encuesta | null = null;
  respuestas: (string | null)[] = [];  // Arreglo para almacenar respuestas
  nombre: string = '';
  apellido: string = '';
  areaCurso: string = '';
  edad: number | string = ''; 
  sexo: string = '';

  constructor(
    private route: ActivatedRoute,
    private encuestasService: EncuestasService,
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    // Obtener parámetros desde la URL
    this.route.queryParams.subscribe(params => {
      this.encuestaId = params['encuestaId'];
      this.encuestadorId = params['encuestadorId'];

      // Cargar la encuesta usando el encuestaId
      if (this.encuestaId) {
        this.encuestasService.obtenerEncuestaPorId(this.encuestaId).subscribe((encuesta) => {
          this.encuesta = encuesta;
          // Inicializar respuestas vacías según el número de preguntas
          if (this.encuesta && this.encuesta.preguntas) {
            this.respuestas = Array(this.encuesta.preguntas.length).fill(null);
          }
        });
      }
    });
  }

  enviarRespuestas(): void {
    if (!this.encuesta || !this.encuesta.preguntas || !this.encuestadorId) {
      alert('No se pudo enviar la encuesta. Faltan datos de la encuesta o del encuestador.');
      return;
    }
  
    // Mapeo para incluir tanto la pregunta como la respuesta
    const preguntasYRespuestas = this.encuesta.preguntas.map((pregunta, index) => ({
      pregunta: pregunta.texto,
      respuesta: this.respuestas[index] || null
    }));
  
    const respuesta = {
      encuestaId: this.encuesta.id,
      encuestadorId: this.encuestadorId,
      nombre: this.nombre,
      apellido: this.apellido,
      edad: this.edad,
      sexo: this.sexo,
      areaCurso: this.areaCurso,
      respuestas: preguntasYRespuestas  // Guardar preguntas y respuestas
    };
  
    const respuestasRef = collection(this.firestore, 'respuestas');
    addDoc(respuestasRef, respuesta)
      .then(() => {
        alert('Respuestas enviadas con éxito.');
        this.limpiarFormulario();
      })
      .catch(error => {
        console.error('Error al enviar las respuestas:', error);
        alert('Hubo un problema al enviar las respuestas.');
      });
  }
  

  limpiarFormulario(): void {
    this.respuestas = Array(this.encuesta?.preguntas?.length).fill(null);  // Limpiar las respuestas
  }
}