import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {nombre: string = '';
  email: string = '';
  institucion: string = '';
  mensaje: string = '';

  enviarFormulario() {
    if (this.nombre && this.email && this.institucion && this.mensaje) {
      // Lógica para enviar el formulario (puedes integrar un servicio de correo electrónico o almacenamiento)
      alert('Mensaje enviado con éxito. Nos pondremos en contacto contigo pronto.');
      
      // Resetea los campos del formulario
      this.nombre = '';
      this.email = '';
      this.institucion = '';
      this.mensaje = '';
    } else {
      alert('Por favor, completa todos los campos.');
    }
  }
}