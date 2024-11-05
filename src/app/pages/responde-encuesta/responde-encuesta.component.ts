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
  resultadoFinal: string = ''; // Almacena el resultado final

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
          console.log('Encuesta cargada:', this.encuesta); // Verifica que la encuesta se cargue
          console.log('Resultados cargados:', this.encuesta.resultados); // Verifica que resultados esté presente
  
          // Inicializar respuestas vacías según el número de preguntas
          if (this.encuesta && this.encuesta.preguntas) {
            this.respuestas = Array(this.encuesta.preguntas.length).fill(null);
          }
        });
      }
    });
  }

  calcularCalificacionTotal(): number {
    let total = 0;
  
    this.respuestas.forEach((respuesta) => {
      switch (respuesta) {
        case 'Nunca':
        case 'Totalmente en desacuerdo':
          total += 0;
          break;
        case 'A veces':
        case 'En desacuerdo':
          total += 1;
          break;
        case 'Frecuentemente':
        case 'De acuerdo':
          total += 2;
          break;
        case 'Siempre':
        case 'Totalmente de acuerdo':
          total += 3;
          break;
        default:
          total += 0;
      }
    });
  
    console.log('Calificación total calculada:', total); // Verificar el valor de calificación total
    return total;
  }
  

  determinarResultado(calificacionTotal: number): void {
    // Verifica que 'resultados' esté definido
    const resultados = this.encuesta?.resultados;
    if (!resultados) {
      console.log("No hay resultados definidos en la encuesta.");
      this.resultadoFinal = 'Sin resultado';
      return;
    }
  
    // Busca el resultado adecuado
    const resultado = resultados.find((r, index) => {
      const calificacionMinima = index === 0 
        ? 0 
        : Number(resultados[index - 1].calificacionMaxima ?? 0) + 1;
      const calificacionMaxima = Number(r.calificacionMaxima ?? 0);
  
      console.log(`Comparando: calificación total ${calificacionTotal} con rango ${calificacionMinima}-${calificacionMaxima}`);
      
      return calificacionTotal >= calificacionMinima && calificacionTotal <= calificacionMaxima;
    });
  
    // Asigna el resultado final
    this.resultadoFinal = resultado ? resultado.descripcion : 'Sin resultado';
    console.log('Resultado determinado:', this.resultadoFinal);
  }
  
  
  

  enviarRespuestas(): void {
    if (!this.formularioCompleto()) {
      alert('Por favor, responda todas las preguntas antes de enviar.');
      return;
    }
    if (!this.encuesta || !this.encuesta.preguntas || !this.encuestadorId) {
      alert('No se pudo enviar la encuesta. Faltan datos de la encuesta o del encuestador.');
      return;
    }
  
    const calificacionTotal = this.calcularCalificacionTotal();
    this.determinarResultado(calificacionTotal);
  
    console.log('Calificación total antes de enviar:', calificacionTotal);
    console.log('Resultado final antes de enviar:', this.resultadoFinal);
  
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
      respuestas: preguntasYRespuestas,
      calificacionTotal: calificacionTotal,
      resultadoFinal: this.resultadoFinal
    };
  
    const respuestasRef = collection(this.firestore, 'respuestas');
    addDoc(respuestasRef, respuesta)
      .then(() => {
        alert('Respuestas enviadas con éxito. ' + this.resultadoFinal);
        this.limpiarFormulario();
      })
      .catch(error => {
        console.error('Error al enviar las respuestas:', error);
        alert('Hubo un problema al enviar las respuestas.');
      });
  }
  
  

  limpiarFormulario(): void {
    this.respuestas = Array(this.encuesta?.preguntas?.length).fill(null);  // Limpiar las respuestas
    this.resultadoFinal = '';  // Limpiar el resultado final
  }

  formularioCompleto(): boolean {
    // Verifica si cada respuesta en el arreglo tiene un valor
    const preguntasCompletas = this.respuestas.every((respuesta) => respuesta !== null && respuesta !== '');
  
    // Asegura que todos los campos adicionales estén completos
    const camposAdicionalesCompletos = !!this.nombre && !!this.apellido && !!this.areaCurso && !!this.edad && !!this.sexo;
  
    return preguntasCompletas && camposAdicionalesCompletos;
  }
  
  
}