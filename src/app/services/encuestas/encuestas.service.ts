import { Injectable } from '@angular/core';
import { addDoc, collectionData, deleteDoc, doc, docData, Firestore, updateDoc } from '@angular/fire/firestore';
import { catchError, from, map, Observable, of } from 'rxjs';
import { collection, query, where, getDocs } from '@angular/fire/firestore';


import axios from 'axios';
import { environment } from '../../../environments/environment';

export interface Encuesta {
  id?: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  preguntas?: { texto: string, tipoRespuesta: string, imgUrl?: string }[]; 
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
  private cloudinaryUrl = `https://api.cloudinary.com/v1_1/${environment.cloudinaryConfig.cloudName}/upload`;

  constructor(private firestore: Firestore) {  }

  // Subir imagen a Cloudinary
  async subirImagen(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', environment.cloudinaryConfig.uploadPreset);

    try {
      console.log('Subiendo imagen a Cloudinary...');
      const response = await axios.post(this.cloudinaryUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const urlGenerado = response.data.secure_url;

      // Agregar logs para depurar el URL generado
      console.log('Imagen subida correctamente. URL generado:', urlGenerado);
      console.log('Tamaño del URL generado:', urlGenerado.length);

      if (urlGenerado.length > 1000) {
        console.warn(
          'El URL generado supera los 1000 caracteres. Verifica los parámetros de Cloudinary.'
        );
      }

      return urlGenerado; // Devuelve el URL generado
    } catch (error) {
      console.error('Error al subir la imagen a Cloudinary:', error);
      throw new Error('No se pudo subir la imagen a Cloudinary.');
    }
  }
  
   
  


    // Crear encuesta con manejo de imágenes
    async crearEncuesta(encuesta: Encuesta): Promise<void> {
      const encuestaRef = collection(this.firestore, 'encuestas');
  
      // Subir imágenes asociadas a las preguntas
      const uploadPromises = (encuesta.preguntas || []).map(async (pregunta, index) => {
        if (pregunta.imgUrl && typeof pregunta.imgUrl !== 'string') {
          const file = pregunta.imgUrl as File;
          const imgUrl = await this.subirImagen(file); // Subir imagen a Cloudinary
          console.log(`URL generado para la imagen de la pregunta ${index}:`, imgUrl);
          pregunta.imgUrl = imgUrl; // Asignar URL al campo imgUrl
        }
      });
  
      await Promise.all(uploadPromises);
  
      try {
        console.log('Imágenes subidas. Creando encuesta en Firebase...');
        console.log('Datos de la encuesta antes de guardar:', encuesta);
  
        await addDoc(encuestaRef, encuesta);
        console.log('Encuesta creada con éxito en Firebase:', encuesta);
      } catch (error) {
        console.error('Error al guardar la encuesta en Firebase:', error);
        throw new Error('No se pudo guardar la encuesta en Firebase.');
      }
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

    // Actualizar encuesta con imágenes 
    async actualizarEncuesta(encuesta: Encuesta): Promise<void> {
  const docRef = doc(this.firestore, `encuestas/${encuesta.id}`);

  try {
    // Subir imágenes asociadas a las preguntas solo si son archivos nuevos
    const uploadPromises = (encuesta.preguntas || []).map(async (pregunta) => {
      // Verificar si imgUrl es un archivo
      if (pregunta.imgUrl && typeof pregunta.imgUrl !== 'string' && (pregunta.imgUrl as File).name) {
        const file = pregunta.imgUrl as File; // Si es un archivo, lo subimos
        const imgUrl = await this.subirImagen(file); // Subir imagen a Cloudinary
        pregunta.imgUrl = imgUrl; // Actualizar con el nuevo URL
        console.log('Nueva URL de imagen:', imgUrl);
      }
      // Si ya es un string (URL de imagen), no subimos nada
      else if (typeof pregunta.imgUrl === 'string' && pregunta.imgUrl !== '') {
        console.log('La imagen ya existe, no se sube nuevamente.');
      }
    });

    await Promise.all(uploadPromises); // Esperar a que todas las imágenes se procesen
    console.log('Imágenes procesadas. Actualizando encuesta en Firebase...');

    // Actualizar la encuesta en Firebase
    await updateDoc(docRef, {
      titulo: encuesta.titulo,
      descripcion: encuesta.descripcion,
      tipo: encuesta.tipo,
      preguntas: encuesta.preguntas, // Actualizar preguntas con URLs de imágenes nuevas o existentes
      resultados: encuesta.resultados,
    });

    console.log('Encuesta actualizada con éxito en Firebase:', encuesta);
  } catch (error) {
    console.error('Error al actualizar la encuesta en Firebase:', error);
    throw new Error('No se pudo actualizar la encuesta en Firebase.');
  }
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

  obtenerNombreEncuestador(encuestadorId: string): Observable<string> {
    const registersRef = collection(this.firestore, 'registers');
    const q = query(registersRef, where('uid', '==', encuestadorId));
  
    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        if (querySnapshot.empty) {
          console.warn(`No se encontraron datos para el encuestador con ID: ${encuestadorId}`);
          return 'Nombre desconocido';
        }
        const data = querySnapshot.docs[0].data();
        return `${data['nombre']} ${data['apellido']}`; // Acceso con notación de índice
      }),
      catchError(error => {
        console.error(`Error obteniendo nombre para encuestador ID ${encuestadorId}:`, error);
        return of('Nombre desconocido');
      })
    );
  }

  // Método para eliminar imagen en Cloudinary



async obtenerImagenesDisponibles(): Promise<string[]> {
  const cloudinaryListUrl = `https://api.cloudinary.com/v1_1/${environment.cloudinaryConfig.cloudName}/resources/image`;

  try {
    const response = await axios.get(cloudinaryListUrl, {
      headers: {
        'Authorization': `Basic ${btoa(environment.cloudinaryConfig.apiKey + ':' + environment.cloudinaryConfig.apiSecret)}`
      }
    });

    return response.data.resources.map((resource: any) => resource.secure_url);
  } catch (error) {
    console.error('Error al obtener imágenes de Cloudinary:', error);
    return [];
  }
}



  
  
  
}