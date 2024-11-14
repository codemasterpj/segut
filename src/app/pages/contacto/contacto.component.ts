import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Firestore,addDoc, collection } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { ContactoService } from '../../services/contacto/contacto.service';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {
  nombre: string = '';
  email: string = '';
  institucion: string = '';
  mensaje: string = '';

  constructor(private contactoServicio: ContactoService) {}
  enviarFormulario() {
    if (this.nombre && this.email && this.institucion && this.mensaje) {
      const contactoData = {
        nombre: this.nombre,
        email: this.email,
        institucion: this.institucion,
        mensaje: this.mensaje
      };

      this.contactoServicio.enviarMensajeContacto(contactoData).then(() => {
        alert('Mensaje enviado con éxito. Nos pondremos en contacto contigo pronto.');
        this.limpiarFormulario();
      }).catch(error => {
        console.error('Error al enviar el mensaje de contacto:', error);
        alert('Hubo un error al enviar el mensaje. Inténtalo de nuevo.');
      });
    } else {
      alert('Por favor, completa todos los campos.');
    }
  }

  limpiarFormulario() {
    this.nombre = '';
    this.email = '';
    this.institucion = '';
    this.mensaje = '';
  }
}