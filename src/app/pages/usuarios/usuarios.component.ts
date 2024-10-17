import { Component, OnInit } from '@angular/core';
import { Register, RegistroService } from '../../services/registro/registro.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { TituloEncuestaPipe } from '../../pipe/titulo-encuesta.pipe';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [NzTableModule, CommonModule, FormsModule, NzPaginationModule, NzModalModule, ReactiveFormsModule, NzSelectModule, TituloEncuestaPipe],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit{
  usuarios: Register[] = [];
  usuarioSeleccionado: Register | null = null;
  editMode: boolean = false;
  usuarioForm: FormGroup;
  rolesDisponibles: string[] = ['Administrador', 'Gestor', 'Encuestador', 'Usuario'];

  opcionesAreas = [
    { label: 'Seguridad Empresarial', value: 'seguridad' },
    { label: 'Acoso Laboral', value: 'acosoLaboral' },
    { label: 'Acoso Escolar', value: 'acosoEscolar' },
    { label: 'Salud Mental', value: 'saludMental' },
    { label: 'Temas Variados', value: 'temasVariados' }
  ];
  

  constructor(private registroService: RegistroService, private fb: FormBuilder, private message: NzMessageService) {
    this.usuarioForm = this.fb.group({
      email: ['', Validators.email],
      nombre: [''],
      apellido: [''],
      edad: [''],
      telefono: [''],
      areas: [''],
      nombreEmpresa: [''],
      categoriaEmpresa: [''],
      role: ['']
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.registroService.getRegisters().subscribe((data: Register[]) => {
      this.usuarios = data;
    });
  }

  verDetalles(usuario: Register): void {
    this.usuarioSeleccionado = usuario;
    this.editMode = false;
  
    // Solo aplica patchValue si usuarioSeleccionado no es null
    if (this.usuarioSeleccionado) {
      this.usuarioForm.patchValue(this.usuarioSeleccionado);
    }
  }
  

  activarEdicion(): void {
    this.editMode = true;
  }

  cancelarEdicion(): void {
    this.editMode = false;
    this.usuarioForm.patchValue(this.usuarioSeleccionado!);
  }

  guardarCambios(): void {
    if (this.usuarioSeleccionado) {
      const updatedUsuario = { ...this.usuarioSeleccionado, ...this.usuarioForm.value };
      
      this.registroService.updateRegister(updatedUsuario)
        .then(() => {
          console.log('Usuario actualizado exitosamente');
          this.message.success('Usuario actualizado exitosamente'); 
          
          // Actualizar `usuarioSeleccionado` con los datos actualizados
          this.usuarioSeleccionado = updatedUsuario;
          
          this.editMode = false;
          this.cargarUsuarios(); // Recargar la lista de usuarios para reflejar los cambios globalmente
        })
        .catch((error) => console.error('Error al actualizar usuario:', error));
    }
  }
  

  eliminarUsuario(usuario: Register): void {
    if (confirm(`¿Estás seguro de eliminar a ${usuario.nombre} ${usuario.apellido}?`)) {
      this.registroService.deleteRegister(usuario)
        .then(() => {
          console.log('Usuario eliminado exitosamente');
          this.cargarUsuarios();
        })
        .catch((error) => console.error('Error al eliminar usuario:', error));
    }
  }

  isLast(item: any, array: any[]): boolean {
    return array.indexOf(item) === array.length - 1;
  }
}