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
import { ResultadosService } from '../../services/resultados/resultados.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { jsPDF } from 'jspdf';

interface Encuesta {
  id: string;
  nombre: string;
  descripcion: string;
}

interface Resultado {
  name: string;
  value: number;
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
  encuestas$: Observable<Encuesta[]> | undefined;
  encuestaSeleccionada: Encuesta | null = null;
  datosGrafico: Resultado[] = [];
  tipoGrafico: 'pastel' | 'barra' = 'pastel';
  colorScheme = { domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'] };

  constructor(private resultadosService: ResultadosService, private message: NzMessageService) {}

  ngOnInit(): void {
    this.encuestas$ = this.resultadosService.obtenerEncuestas();
  }

  cargarResultados(): void {
    if (this.encuestaSeleccionada) {
      this.resultadosService.obtenerResultados(this.encuestaSeleccionada.id).subscribe((resultados: Resultado[]) => {
        this.datosGrafico = resultados;
        this.message.success(`Resultados cargados de ${this.encuestaSeleccionada?.nombre}`);
      });
    }
  }

  imprimirResultados(): void {
    const doc = new jsPDF();
    doc.text('Resultados de la Encuesta', 10, 10);
    doc.save('resultados-encuesta.pdf');
  }
}
