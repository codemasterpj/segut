import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Encuesta, EncuestasService } from '../../services/encuestas/encuestas.service';
import { RegistroService } from '../../services/registro/registro.service';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { Firestore, collection, addDoc } from '@angular/fire/firestore'; 
import { NzSelectModule } from 'ng-zorro-antd/select';
import { TituloEncuestaPipe } from '../../pipe/titulo-encuesta.pipe';
import { NzModalModule } from 'ng-zorro-antd/modal';



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
    NzRateModule,NzSelectModule, TituloEncuestaPipe,
    NzModalModule
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
  linkGenerado: string | null = null;  // Variable para almacenar el link generado
  isModalVisible = false;
  puntuacionTotal = 0;
  recomendacion: string = '';

  constructor(
    private firestore: Firestore,
    private encuestasService: EncuestasService,
    private registroService: RegistroService,
    
    
  ) {}

  ngOnInit(): void {
    this.tiposDeInteres = this.registroService.obtenerAreasPreferidas() || [];
    this.cargarEncuestas();
  }

  cargarEncuestas(): void {
    this.encuestasService.obtenerEncuestas().subscribe((encuestas) => {
      const encuestasLibre = encuestas.filter((encuesta) => encuesta.tipo === 'libre');

      if (this.registroService.getUserId()) {
      const encuestasFiltradas = encuestas.filter((encuesta) => 
        this.tiposDeInteres.includes(encuesta.tipo) && encuesta.tipo !== 'libre'
      );
      this.encuestasPorTipo = this.agruparPorTipo(encuestasFiltradas);
    } else {

      this.encuestasPorTipo = this.agruparPorTipo(encuestasLibre);
    }
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
    console.log('Tipo Seleccionado:', this.tipoSeleccionado);
  }

  seleccionarEncuesta(encuesta: Encuesta, event: Event): void {
    event.stopPropagation();
    this.encuestaSeleccionada = encuesta;
    console.log('Encuesta Seleccionada:', this.encuestaSeleccionada);
    this.respuestas = Array(encuesta.preguntas?.length).fill(null);
    this.linkGenerado = null;  // Reiniciar el link cuando se selecciona una nueva encuesta
  }

  generarLinkEncuesta(encuesta: Encuesta): string {
    const encuestadorId = this.registroService.getUserId();  // Asegúrate de obtener el ID del encuestador correctamente
  
    if (!encuestadorId || !encuesta?.id) {
      alert('No se puede generar el link, falta información.');
      return '';
    }
  
    // Genera el enlace con los parámetros de encuestaId y encuestadorId
    const link = `${window.location.origin}/responde-encuesta?encuestaId=${encuesta.id}&encuestadorId=${encuestadorId}`;
    return link;
  }
  
  

  enviarEncuesta(): void {
    const userId = this.registroService.getUserId();
  
    if (!userId) {
      console.error('No se pudo obtener el ID del usuario.');
      alert('Hubo un problema con la autenticación del usuario. Por favor, intenta iniciar sesión nuevamente.');
      return;
    }
  
    if (!this.encuestaSeleccionada || !this.encuestaSeleccionada.preguntas) {
      console.error('No se ha seleccionado una encuesta o faltan preguntas en la encuesta seleccionada.');
      alert('Por favor selecciona una encuesta válida.');
      return;
    }
  
    // Mapeo para incluir tanto la pregunta como la respuesta
    const preguntasYRespuestas = this.encuestaSeleccionada.preguntas.map((pregunta, index) => ({
      pregunta: pregunta,
      respuesta: this.respuestas[index] || null
    }));
  
    const respuesta = {
      encuestaId: this.encuestaSeleccionada.id,
      userId: userId,
      nombre: this.nombre,
      apellido: this.apellido,
      edad: this.edad,
      sexo: this.sexo,
      areaCurso: this.areaCurso,
      proposito: this.proposito,
      respuestas: preguntasYRespuestas // Aquí se guardan tanto preguntas como respuestas
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
    this.linkGenerado = null;  // Limpiar el link después de enviar la encuesta
  }

  mostrarResultadoModal(): void {
    // Definimos las puntuaciones para respuestas tipo frecuencia
    const puntuacionesFrecuencia: { [key in 'Nunca' | 'A veces' | 'Frecuentemente' | 'Siempre']: number } = {
      'Nunca': 1,
      'A veces': 2,
      'Frecuentemente': 4,
      'Siempre': 5
    };
  
    this.puntuacionTotal = this.respuestas.reduce((total, respuesta) => {
      let puntuacion = 0;
  
      // Convertir la respuesta a número si está en una escala de 1 a 5
      if (!isNaN(Number(respuesta))) {
        puntuacion = Number(respuesta);
      } 
      // Si es una respuesta de frecuencia, buscar su puntuación
      else if (respuesta && puntuacionesFrecuencia[respuesta as keyof typeof puntuacionesFrecuencia] !== undefined) {
        puntuacion = puntuacionesFrecuencia[respuesta as keyof typeof puntuacionesFrecuencia];
      }
  
      return total + puntuacion;
    }, 0);
  
    // Determinamos la recomendación en base al total de puntos
    if (this.puntuacionTotal >= 1 && this.puntuacionTotal <= 10) {
      this.recomendacion = 'Refleja áreas significativas para mejorar, sugiriendo revisar hábitos de sueño, actividad física y conexiones sociales.';
    } else if (this.puntuacionTotal >= 11 && this.puntuacionTotal <= 20) {
      this.recomendacion = 'Indica un equilibrio moderado, pero con áreas que podrían optimizarse, como satisfacción personal o relajación emocional.';
    } else {
      this.recomendacion = 'Bienestar Alto: Señala un bienestar integral, con hábitos saludables y un manejo adecuado del estrés, relaciones y emociones positivas.';
    }
  
    this.isModalVisible = true;
  }
  

  cerrarModal(): void {
    this.isModalVisible = false;
  }

  // Obtener la puntuación basada en la respuesta
  
  obtenerPuntuacion(respuesta: string | null, puntuaciones: { [key: string]: number }): number | null {
    return respuesta ? puntuaciones[respuesta.toLowerCase() as keyof typeof puntuaciones] : null;
  }

  

  mostrarLink(): void {
    if (this.encuestaSeleccionada) {
      // Si la encuesta es de tipo 'gratis', muestra el modal con el resultado
      if (this.encuestaSeleccionada.tipo === 'libre' && !this.registroService.getUserId()) {
        this.mostrarResultadoModal();
      } else {
        // Si no es gratis o el usuario está logueado, generar el link de la encuesta
        this.linkGenerado = this.generarLinkEncuesta(this.encuestaSeleccionada);
      }
    } else {
      alert('Selecciona una encuesta para continuar.');
    }
  }



}