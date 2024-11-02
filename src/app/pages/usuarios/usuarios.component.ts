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
import { AuthService } from '../../services/auth/auth.service';
import { NzInputModule } from 'ng-zorro-antd/input';


@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [NzTableModule, CommonModule, FormsModule, NzPaginationModule, NzModalModule, ReactiveFormsModule, 
    NzSelectModule, TituloEncuestaPipe, NzInputModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit{
  usuarios: Register[] = [];
  usuarioSeleccionado: Register | null = null;
  editMode: boolean = false;
  usuarioForm: FormGroup;
  isAdmin= false;
  rolesDisponibles: string[] = ['Administrador', 'Gestor', 'Encuestador', 'Usuario'];

  opcionesAreas = [
    { label: 'Seguridad Empresarial', value: 'seguridad' },
    { label: 'Acoso Laboral', value: 'acosoLaboral' },
    { label: 'Acoso Escolar', value: 'acosoEscolar' },
    { label: 'Salud Mental', value: 'saludMental' },
    { label: 'Temas Variados', value: 'temasVariados' }
  ];
  

  constructor(private registroService: RegistroService, private fb: FormBuilder, 
    private message: NzMessageService, private authService: AuthService) {
    this.usuarioForm = this.fb.group({
      email: [{ value: '', disabled: true }, Validators.email],
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
  // Verifica si el usuario actual es administrador
  const user = this.authService.getCurrentUser();
  if (user?.uid) {
    this.registroService.getRegister(user.uid).then(querySnapshot => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const register = doc.data() as Register;

          // Asigna el valor de `isAdmin` basado en el rol
          this.isAdmin = register.role?.trim() === 'Administrador';

          // Mensaje de depuración
          console.log('Rol del usuario:', register.role);
          console.log('isAdmin:', this.isAdmin);
        });
      } else {
        console.log('No se encontró el registro del usuario.');
      }
    }).catch(error => {
      console.error('Error al obtener el registro del usuario:', error);
    });
  }
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
    if (!this.isAdmin) {
      this.message.warning('No tienes permiso para eliminar usuarios.');
      return;
    }
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