import { Component, OnInit } from '@angular/core';
import { Encuesta, EncuestasService } from '../../services/encuestas/encuestas.service';
import { Firestore, doc, deleteDoc } from '@angular/fire/firestore';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CommonModule } from '@angular/common';
import { groupBy } from 'rxjs';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-reporte-encuestas',
  standalone: true,
  imports: [NzCardModule, CommonModule, NzModalModule],
  templateUrl: './reporte-encuestas.component.html',
  styleUrl: './reporte-encuestas.component.css'
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

  constructor(
    private encuestasService: EncuestasService,
    private firestore: Firestore,
    private messageService: NzMessageService,
    private modal: NzModalService
    
    
  ) {}

  ngOnInit(): void {
    this.cargarResultados();
  }

  cargarResultados(): void {
    this.encuestasService.obtenerResultados().subscribe(resultados => {
      this.resultadosAgrupados = {};

      resultados.forEach(resultado => {
        const encuestadorId = resultado.encuestadorId;
        if (!this.resultadosAgrupados[encuestadorId]) {
          this.resultadosAgrupados[encuestadorId] = [];
        }
        this.resultadosAgrupados[encuestadorId].push(resultado);
      });

      this.encuestadores = Object.keys(this.resultadosAgrupados);
    });
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
      this.cargarResultados();
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
}