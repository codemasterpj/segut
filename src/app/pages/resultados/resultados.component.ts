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
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import { Register, RegistroService } from '../../services/registro/registro.service';



interface Encuesta {
  id: string;
  nombre: string;
  descripcion: string;
}

interface Respuesta {
  encuestaId: string;
  userId: string;
  nombre: string;
  apellido: string;
  edad: string;
  sexo: string;
  areaCurso: string;
  proposito: string;
  respuestas: any[];  // Ajusta el tipo según la estructura de tus respuestas
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
  
  currentRegister?: Register;
  respuestas: Respuesta[] = [];
  filtroEdad: string = '';
  filtroSexo: string = '';
  filtroArea: string = '';
  chart: any;

  constructor(
    private firestore: Firestore,
    private encuestasService: EncuestasService,
    private message: NzMessageService,
    private registroService: RegistroService 
  ) {}

  ngOnInit(): void {
    // Registra los componentes específicos de Chart.js que necesitas
    Chart.register(PieController, ArcElement, Tooltip, Legend);
    this.cargarRespuestas();
  }

  ngAfterViewInit(): void {
    // Deja el gráfico en blanco hasta que lleguen los datos
  }

    // Método para obtener el ID del usuario actual
    getUserId(): string | undefined {
      return this.currentRegister?.uid;
    }

  // En el componente donde se filtran resultados
  cargarRespuestas(): void {
    const userId = this.registroService.getUserId();  // Obtiene el ID del usuario actual
    if (!userId) {
      console.error('No se pudo obtener el ID del usuario.');
      return;
    }

    const respuestasRef = collection(this.firestore, 'respuestas');
    const q = query(respuestasRef, where('userId', '==', userId));

    collectionData(q).subscribe((respuestas: any[]) => {
      this.respuestas = respuestas;
      this.generarGraficoGlobal();
    });
  }

  

  generarGraficoGlobal(): void {
    const ctx = document.getElementById('resultadosChart') as HTMLCanvasElement;
    if (this.chart) this.chart.destroy();

    if (!ctx) {
      console.error("No se pudo encontrar el elemento 'canvas' con el ID 'resultadosChart'.");
      return;
    }

    const dataConteo = this.respuestas.reduce((conteo: { [key: string]: number }, respuesta) => {
      respuesta.respuestas.forEach((valor: string) => {
        conteo[valor] = (conteo[valor] || 0) + 1;
      });
      return conteo;
    }, {});

    const labels = Object.keys(dataConteo);
    const data = Object.values(dataConteo);

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#f79f1f'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      }
    });
  }

  filtrarRespuestas(): Respuesta[] {
    return this.respuestas.filter(respuesta => {
      return (this.filtroEdad ? respuesta.edad === this.filtroEdad : true) &&
             (this.filtroSexo ? respuesta.sexo === this.filtroSexo : true) &&
             (this.filtroArea ? respuesta.areaCurso === this.filtroArea : true);
    });
  }

  exportarPDF(): void {
    // Implementación de generación de PDF
  }
}