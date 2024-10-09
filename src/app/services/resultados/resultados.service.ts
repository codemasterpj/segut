import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root' // Inyecta el servicio en el nivel root
})
export class ResultadosService {
  constructor(private firestore: AngularFirestore) {}

  obtenerResultados(encuestaId: string): Observable<any[]> {
    return this.firestore
      .collection(`encuestas/${encuestaId}/resultados`)
      .valueChanges()
      .pipe(
        map((resultados: any[]) => resultados.map(res => ({ name: res.pregunta, value: res.puntaje })))
      );
  }

  obtenerEncuestas(): Observable<any[]> {
    return this.firestore.collection('encuestas').valueChanges();
  }
}
