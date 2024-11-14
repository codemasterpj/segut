import { Component, OnInit } from '@angular/core';
import { Encuesta, EncuestasService } from '../../services/encuestas/encuestas.service';
import { Firestore, doc, deleteDoc } from '@angular/fire/firestore';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CommonModule } from '@angular/common';
import { catchError, combineLatest, groupBy, map, of, switchMap } from 'rxjs';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';



interface Resultado {
  id: string;
  encuestadorId: string;
  nombre: string;
  apellido: string;
  calificacionTotal?: number;
  respuestas: { pregunta: string; puntuacion: number }[];
}
@Component({
  selector: 'app-reporte-encuestas',
  standalone: true,
  imports: [NzCardModule, CommonModule, NzModalModule, NgxChartsModule],
  templateUrl: './reporte-encuestas.component.html',
  styleUrl: './reporte-encuestas.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class ReporteEncuestasComponent implements OnInit {
  resultadosAgrupados: any = {}; // Resultados agrupados por encuestador
  encuestadores: string[] = []; // Lista de encuestadores
  resultadoSeleccionado: any = null; // Resultado específico seleccionado
  detallesModalVisible = false; // Control de visibilidad del modal
  encuestaSeleccionada: Encuesta = { // Inicialización de encuestaSeleccionada con preguntas vacías
    titulo: '',
    descripcion: '',
    tipo: '',
    preguntas: []
  };
  graficosVisibles: { [key: string]: boolean } = {};
  tipoGraficoSeleccionado: { [key: string]: 'pastel' | 'barras' } = {};
 

  

  constructor(
    private encuestasService: EncuestasService,
    private firestore: Firestore,
    private messageService: NzMessageService,
    private modal: NzModalService
    
    
  ) {}

  ngOnInit(): void {
    this.cargarResultadosConNombres();
    
  }

  cargarResultadosConNombres(): void {
    this.encuestasService.obtenerResultados().pipe(
      switchMap(resultados => {
        const observables = resultados.map(resultado => {
          if (!resultado.encuestadorId) {
            console.warn(`El resultado con ID ${resultado.id} no tiene encuestadorId.`);
            return of({ ...resultado, nombreEncuestador: 'Nombre desconocido' });
          }
          
          return this.encuestasService.obtenerNombreEncuestador(resultado.encuestadorId).pipe(
            map(nombre => ({
              ...resultado,
              nombreEncuestador: nombre
            })),
            catchError(error => {
              console.error(`Error obteniendo nombre para encuestador ID ${resultado.encuestadorId}:`, error);
              return of({ ...resultado, nombreEncuestador: 'Nombre desconocido' });
            })
          );
        });
        return combineLatest(observables);
      })
    ).subscribe(resultadosConNombres => {
      this.resultadosAgrupados = this.agruparResultadosPorEncuestador(resultadosConNombres);
      this.encuestadores = Object.keys(this.resultadosAgrupados);
    });
  }
  

  agruparResultadosPorEncuestador(resultados: any[]): any {
    const agrupados: any = {};
    resultados.forEach(resultado => {
      const encuestadorId = resultado.encuestadorId;
      if (!agrupados[encuestadorId]) {
        agrupados[encuestadorId] = [];
      }
      agrupados[encuestadorId].push(resultado);
    });
    return agrupados;
  }

  verDetalles(encuestadorId: string, resultadoId: string): void {
    // Encuentra el resultado seleccionado
    this.resultadoSeleccionado = this.resultadosAgrupados[encuestadorId].find(
      (resultado: any) => resultado.id === resultadoId
    );
    this.detallesModalVisible = true;

    // Cargar la encuesta completa con preguntas y respuestas
    this.encuestasService.obtenerEncuestaPorId(this.resultadoSeleccionado.encuestaId).subscribe(encuesta => {
      this.encuestaSeleccionada = encuesta;
    });
  }

  confirmarEliminacion(resultadoId: string): void {
    this.modal.confirm({
      nzTitle: '¿Estás seguro de que deseas eliminar este resultado?',
      nzContent: 'Esta acción no se puede deshacer.',
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzOnOk: () => this.eliminarResultado(resultadoId),
      nzCancelText: 'Cancelar',
      nzOnCancel: () => console.log('Eliminación cancelada')
    });
  }

  

  eliminarResultado(resultadoId: string): void {
    const docRef = doc(this.firestore, `respuestas/${resultadoId}`);
    deleteDoc(docRef).then(() => {
      this.messageService.success('Resultado eliminado correctamente.');
      this.cargarResultadosConNombres();
      this.detallesModalVisible = false;
    }).catch(error => {
      this.messageService.error('Error al eliminar el resultado.');
      console.error(error);
    });
  }

  enviarPorCorreo(resultado: any): void {
    console.log('Enviar por correo:', resultado);
  }

  generarGraficoIndividual(resultado: any): void {
    console.log('Generar gráfico individual para:', resultado);
  }

  generarGraficoGlobal(encuestadorId: string): void {
    console.log('Generar gráfico global para encuestador:', encuestadorId);
  }

  seleccionarTipoGrafico(encuestadorId: string, tipo: 'pastel' | 'barras'): void {
    this.tipoGraficoSeleccionado[encuestadorId] = tipo;
    this.graficosVisibles[encuestadorId] = true;   
  }

// Distribución de puntuaciones
mostrarGraficos(encuestadorId: string): void {
  this.graficosVisibles[encuestadorId] = true;
}

obtenerDistribucionPuntuacionFinal(encuestadorId: string): any[] {
  const resultados = this.resultadosAgrupados[encuestadorId];
  const conteoRangos = { '0-10': 0, '11-20': 0, '21-30': 0 };

  resultados.forEach((resultado: Resultado) => {
    const calificacion = resultado.calificacionTotal || 0;
    if (calificacion <= 10) conteoRangos['0-10']++;
    else if (calificacion <= 20) conteoRangos['11-20']++;
    else conteoRangos['21-30']++;
  });

  const total = resultados.length;
  return Object.keys(conteoRangos).map(rango => ({
    name: `Rango ${rango}`,
    value: (conteoRangos[rango as keyof typeof conteoRangos] / total) * 100
  }));
  
}



obtenerDistribucionPorPregunta(encuestadorId: string): any[] {
  const resultados = this.resultadosAgrupados[encuestadorId];
  const preguntas = resultados[0].respuestas.map((_: any, i: number) => `Pregunta ${i + 1}`);

  return preguntas.map((pregunta: string, index: number) => {
    const total = resultados.reduce((acc: number, resultado: Resultado) => 
      acc + (resultado.respuestas[index]?.puntuacion || 0), 0
    );
    const promedio = total / resultados.length;
    return { name: pregunta, value: promedio };
  });
}


}



  
