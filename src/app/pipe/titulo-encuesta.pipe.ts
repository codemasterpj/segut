import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tituloEncuesta',
  standalone: true
})
export class TituloEncuestaPipe implements PipeTransform {

  transform(tipo: string): string {
    const titulosAmigables: { [key: string]: string } = {
      'seguridad': 'Seguridad Empresarial',
      'acosoLaboral': 'Acoso Laboral',
      'acosoEscolar': 'Acoso Escolar',
      'saludMental': 'Salud Mental',
      'temasVariados': 'Otros',
      'libre': 'Encuesta Libre'
    };
    return titulosAmigables[tipo] || tipo;
  }
}
