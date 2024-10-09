import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';



interface Encuesta {
  nombre: string;
  descripcion: string;
}

interface Pregunta{
  texto: string;
  opciones: Opcion[];
}

interface Opcion{
  texto: string;
  valor: number;
}
@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule, NzLayoutModule, NzGridModule,  NzButtonModule, NzFormModule, NzCardModule, NzRadioModule, ReactiveFormsModule],
  templateUrl: './encuesta.component.html',
  styleUrl: './encuesta.component.css'
})
export class EncuestaComponent implements OnInit {
  encuestas: Encuesta[] = [
    { nombre: 'Seguridad de la Información', descripcion: 'Encuesta sobre seguridad en la información' },
    { nombre: 'Acoso Laboral', descripcion: 'Encuesta sobre acoso en el trabajo' },
    { nombre: 'Acoso Estudiantil', descripcion: 'Encuesta sobre acoso en el ámbito educativo' },
    { nombre: 'Phishing', descripcion: 'Encuesta sobre métodos de phishing' },
    { nombre: 'Salud Mental', descripcion: 'Encuesta sobre bienestar mental' }
  ];
  encuestaSeleccionada: Encuesta | null = null;
  preguntas: Pregunta[] = [];
  formularioEncuesta!: FormGroup;
  opciones = [
    { texto: '1', valor: 1 },
    { texto: '2', valor: 2 },
    { texto: '3', valor: 3 },
    { texto: '4', valor: 4 },
    { texto: '5', valor: 5 }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formularioEncuesta = this.fb.group({});
  }

  seleccionarEncuesta(encuesta: Encuesta): void {
    this.encuestaSeleccionada = encuesta;
    this.preguntas = this.generarPreguntas();
    this.cargarFormulario();
  }

  generarPreguntas(): Pregunta[] {
    return Array.from({ length: 15 }, (_, i) => ({
      texto: `Pregunta ${i + 1}`,
      opciones: this.opciones
    }));
  }

  cargarFormulario(): void {
    this.formularioEncuesta = this.fb.group({});
    this.preguntas.forEach((pregunta, index) => {
      this.formularioEncuesta.addControl(`pregunta${index}`, this.fb.control(null, Validators.required));
    });
  }

  enviarEncuesta(): void {
    if (this.formularioEncuesta.valid) {
      const respuestas = this.formularioEncuesta.value;
      console.log('Respuestas enviadas:', respuestas);
      // Lógica para guardar en Firebase
    }
  }
}