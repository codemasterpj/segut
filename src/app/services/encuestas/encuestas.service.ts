import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Encuesta {
  id?: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  preguntas?: { texto: string, tipoRespuesta: string }[]; 
  resultados?: {
    descripcion: string;
    calificacionMinima: number;
    calificacionMaxima: number;
  }[]; // Añade la propiedad 'resultados' al modelo
}

@Injectable({
  providedIn: 'root'
})
export class EncuestasService { 
  

  constructor(private firestore: Firestore) {}

  crearEncuesta(encuesta: Encuesta): Promise<any> {
    const encuestaRef = collection(this.firestore, 'encuestas');
    return addDoc(encuestaRef, encuesta);
  }

  

  obtenerEncuestas(): Observable<Encuesta[]> {
    const encuestasRef = collection(this.firestore, 'encuestas');
    return collectionData(encuestasRef, { idField: 'id' }) as Observable<Encuesta[]>;

  }

    // Método para obtener una encuesta específica por su ID
    obtenerEncuestaPorId(encuestaId: string): Observable<Encuesta> {
      const encuestaRef = doc(this.firestore, `encuestas/${encuestaId}`);
      return docData(encuestaRef, { idField: 'id' }) as Observable<Encuesta>;
    }

  actualizarEncuesta(encuesta: Encuesta): Promise<void> {
    const docRef = doc(this.firestore, `encuestas/${encuesta.id}`);
    return updateDoc(docRef, {nombre: encuesta.titulo, descripcion: encuesta.descripcion, tipo: encuesta.tipo, preguntas: encuesta.preguntas, resultados: encuesta.resultados});
    
  }

  eliminarEncuesta(encuesta : Encuesta): Promise<void> {
    const productoRef = doc(this.firestore, `encuestas/${encuesta.id}`);
    return deleteDoc(productoRef);
  }

  // Método para obtener todos los resultados almacenados en "respuestas"
  obtenerResultados(): Observable<any[]> {
    const respuestasRef = collection(this.firestore, 'respuestas');
    return collectionData(respuestasRef, { idField: 'id' });
  }
}