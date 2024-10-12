import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EncuestasService {

  constructor(private firestore: AngularFirestore) { }

  obtenerEncuestas(): Observable<any[]> {
    return this.firestore.collection('encuestas').valueChanges({ idField: 'id' });
  }

  crearEncuesta(encuesta: any) {
    return this.firestore.collection('encuestas').add(encuesta);
  }

  editarEncuesta(id: string, encuesta: any) {
    return this.firestore.collection('encuestas').doc(id).update(encuesta);
  }

  eliminarEncuesta(id: string) {
    return this.firestore.collection('encuestas').doc(id).delete();
  }

}
