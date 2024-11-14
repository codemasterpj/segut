import { Injectable } from '@angular/core';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {

  constructor(private firestore: Firestore) { }

  async enviarMensajeContacto(contactoData: { nombre: string; email: string; institucion: string; mensaje: string }): Promise<void> {
    const contactRef = collection(this.firestore, 'contactMessages'); // Nombre de la colección
    await addDoc(contactRef, contactoData); // Agrega el mensaje a la colección
    console.log('Mensaje de contacto guardado en Firestore');
  }
}
