import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NzMessageService } from 'ng-zorro-antd/message';
import { collection, collectionData, Firestore,query, where } from '@angular/fire/firestore';
import { EncuestasService } from '../../services/encuestas/encuestas.service';
import { RegistroService } from '../../services/registro/registro.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; 







interface Encuesta {
  id: string;
  nombre: string;
  descripcion: string;
}

interface Respuesta {
  encuestaId: string;
  encuestadorId: string;
  nombre: string;
  apellido: string;
  edad: string;
  sexo: string;
  areaCurso: string;
  respuestas: { pregunta: string; respuesta: string | null }[];
}


@Component({
  selector: 'app-encuesta',
  standalone: true,
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.css'],
  imports: [
    CommonModule,
    NzLayoutModule, // Asegúrate de que esté aquí
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzDividerModule,
    NzCardModule,
    FormsModule,
    NgxChartsModule
  ]

})
export class ResultadosComponent implements OnInit {
  
  respuestas: Respuesta[] = [];
  filtroEdad: string = '';
  filtroSexo: string = '';
  filtroArea: string = '';
  respuestaSeleccionada: Respuesta | null = null;
  puntuaciones: { [key: string]: number } = {
    'nunca': 0,
    'a veces': 1,
    'frecuentemente': 2,
    'siempre': 3
  };

  constructor(
    private firestore: Firestore,
    private encuestasService: EncuestasService,
    private message: NzMessageService,
    private registroService: RegistroService 
  ) {}

  async ngOnInit(): Promise<void> {
    const userId = await this.registroService.getUserId();
    if (userId) {
      try {
        await this.cargarRespuestas(userId);
      } catch (error) {
        console.error('Error al cargar respuestas:', error);
      }
    } else {
      console.error('No se pudo obtener el ID del usuario.');
    }
  }
  
 
  calcularPuntuacion(respuesta: Respuesta): number {
    let puntuacionTotal = 0;
    respuesta.respuestas.forEach(resp => {
      const puntuacion = this.puntuaciones[resp.respuesta?.toLowerCase() ?? ''];
      if (puntuacion !== undefined) {
        puntuacionTotal += puntuacion;
      }
    });
    return puntuacionTotal;
  }
  

  obtenerPuntuacion(respuestaTexto: string | null): number | null {
    if (respuestaTexto === null) {
      return null;
    }
    const puntuacion = this.puntuaciones[respuestaTexto.toLowerCase()];
    return puntuacion !== undefined ? puntuacion : null;
  }
  
  
  
  
  
  
  
  

  cargarRespuestas(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const respuestasRef = collection(this.firestore, 'respuestas');
      const q = query(respuestasRef, where('encuestadorId', '==', userId));

      collectionData(q).subscribe(
        (respuestas: any[]) => {
          this.respuestas = respuestas;
          resolve();
        },
        (error: unknown) => {
          console.error('Error al cargar respuestas:', error);
          reject(error);
        }
      );
    });
  }
  
  

  
  
  
  
  

  filtrarRespuestas(): Respuesta[] {
    return this.respuestas.filter(respuesta => {
      return (!this.filtroEdad || respuesta.edad === this.filtroEdad) &&
             (!this.filtroSexo || respuesta.sexo === this.filtroSexo) &&
             (!this.filtroArea || respuesta.areaCurso === this.filtroArea);
    });
  }

  buscarRespuestas(): void {
    // Lógica de búsqueda basada en los filtros aplicados
    this.filtrarRespuestas();
  }

  verDetalles(respuesta: Respuesta): void {
    this.respuestaSeleccionada = respuesta;
  }

  exportarPDF(): void {
    const doc = new jsPDF();
    const encuestadorData = this.registroService.currentRegister;

    if (!encuestadorData) {
      console.error('No se encontró la información del encuestador.');
      return;
    }

    // Encabezado con los datos del encuestador obtenidos de currentRegister
    doc.setFontSize(12);
    doc.text('Informe de Resultados de Encuestas', 14, 20);
    doc.text(`Nombre: ${encuestadorData.nombre} ${encuestadorData.apellido}`, 14, 30);
    doc.text(`Correo: ${encuestadorData.email}`, 14, 36);
    doc.text(`Fecha y Hora: ${new Date().toLocaleString()}`, 14, 42);
    doc.text(`Cargo: ${encuestadorData.role}`, 14, 48);
    doc.text(`Empresa: ${encuestadorData.nombreEmpresa}`, 14, 54);

    // Generar PDF individual o global
    if (this.respuestaSeleccionada) {
      this.generarPDFIndividual(this.respuestaSeleccionada);
    } else {
      this.generarPDFGlobal(doc);
    }
  }

  generarPDFIndividual(respuesta: Respuesta): void {
    const doc = new jsPDF();
    const encuestadorData = this.registroService.currentRegister;
  
    if (!encuestadorData) {
      console.error('No se encontró la información del encuestador.');
      return;
    }
  
    // Encabezado del PDF
    doc.setFontSize(12);
    doc.text('Informe de Resultados de Encuesta Individual', 14, 20);
    doc.text(`Nombre del Encuestador: ${encuestadorData.nombre} ${encuestadorData.apellido}`, 14, 30);
    doc.text(`Correo: ${encuestadorData.email}`, 14, 36);
    doc.text(`Fecha y Hora: ${new Date().toLocaleString()}`, 14, 42);
    doc.text(`Cargo: ${encuestadorData.role}`, 14, 48);
    doc.text(`Empresa: ${encuestadorData.nombreEmpresa}`, 14, 54);
  
    // Detalles del encuestado
    doc.text('Detalles del Encuestado:', 14, 70);
    doc.text(`ID de Encuesta: ${respuesta.encuestaId}`, 14, 76);
    doc.text(`Nombre: ${respuesta.nombre}`, 14, 82);
    doc.text(`Apellido: ${respuesta.apellido}`, 14, 88);
    doc.text(`Edad: ${respuesta.edad}`, 14, 94);
    doc.text(`Sexo: ${respuesta.sexo}`, 14, 100);
    doc.text(`Área: ${respuesta.areaCurso}`, 14, 106);


    // Puntuación cuantitativa
  const puntuacion = this.calcularPuntuacion(respuesta);
  doc.text(`Puntuación: ${puntuacion.toFixed(2)}`, 14, 112);
  
    // Verificar que `respuesta.respuestas` sea un array y contenga preguntas válidas
    if (Array.isArray(respuesta.respuestas) && respuesta.respuestas.length > 0) {
      
      const respuestaData = respuesta.respuestas.map((resp, index) => [
        index + 1,
        resp.pregunta,
        resp.respuesta || '',
        `${this.obtenerPuntuacion(resp.respuesta) ?? 'N/A'}`
        
      ]);

      if (respuestaData.length > 0) {
        autoTable(doc, {
          head: [['#', 'Pregunta', 'Respuesta', 'Puntuación']],
          body: respuestaData,
          startY: 118
        });
      } else {
        doc.text('No se encontraron preguntas y respuestas.', 14, 118);
      }
    } else {
      doc.text('No se encontraron preguntas y respuestas.', 14, 112);
    }
  
    doc.save(`Informe_Individual_${respuesta.encuestaId}.pdf`);
  }
  
  

  generarPDFGlobal(doc: jsPDF): void {
    doc.text('Resumen de Encuestas Globales', 14, 70);

    const allData = this.respuestas.map((respuesta, index) => [
      index + 1,
      respuesta.nombre,
      respuesta.apellido,
      respuesta.edad,
      respuesta.sexo,
      respuesta.areaCurso
    ]);

    // Tabla global con todas las encuestas
    autoTable(doc,{
      head: [['#', 'Nombre', 'Apellido', 'Edad', 'Sexo', 'Área']],
      body: allData,
      startY: 80
    });

    doc.save('Informe_Global_Encuestas.pdf');
  }

  limpiarFiltros(): void {
    this.filtroEdad = '';
    this.filtroSexo = '';
    this.filtroArea = '';
    this.respuestaSeleccionada = null;  // Opcional, para deseleccionar cualquier detalle activo
    this.buscarRespuestas();  // Vuelve a filtrar las respuestas con todos los filtros vacíos
  }
  
}