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
import { Encuesta, EncuestasService } from '../../services/encuestas/encuestas.service';


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

  opcionesEncuestas: Encuesta[] = [];
  opcionesEncuestasFiltradas: Encuesta[] = [];
  

  constructor(private registroService: RegistroService, private fb: FormBuilder, 
    private message: NzMessageService, private authService: AuthService,
    private encuestasService: EncuestasService ) {
    this.usuarioForm = this.fb.group({
      email: [{ value: '', disabled: true }, Validators.email],
      nombre: [''],
      apellido: [''],
      edad: [''],
      telefono: [''],
      areas: [''],
      encuestasAsignadas: [[]], 
      nombreEmpresa: [''],
      categoriaEmpresa: [''],
      role: ['']
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarEncuestas(); 
    this.verificarAdmin();
    // Cuando el usuario elige (o quita) áreas en el formulario, filtrar encuestas
    this.usuarioForm.get('areas')?.valueChanges.subscribe((selectedAreas: string[]) => {
    this.filtrarEncuestasPorAreas(selectedAreas);
  });
  }

   // Carga la lista de encuestas desde Firestore
   cargarEncuestas(): void {
    this.encuestasService.obtenerEncuestas().subscribe((encuestas: Encuesta[]) => {
      // Guardamos todas las encuestas en memoria
      this.opcionesEncuestas = encuestas;
  
      // Filtrar en base a lo que ya esté seleccionado en 'areas' (si es que ya hay algo)
      const currentAreas = this.usuarioForm.get('areas')?.value as string[] || [];
      this.filtrarEncuestasPorAreas(currentAreas);
    });
  }

  filtrarEncuestasPorAreas(selectedAreas: string[]): void {
    // Si no hay áreas seleccionadas, podrías mostrar un array vacío o todas,
    // según tu preferencia. Aquí, mostraremos un array vacío.
    if (!selectedAreas || selectedAreas.length === 0) {
      this.opcionesEncuestasFiltradas = [];
      return;
    }
  
    // Filtramos únicamente las encuestas cuyo 'tipo' coincida con al menos
    // una de las áreas seleccionadas.
    this.opcionesEncuestasFiltradas = this.opcionesEncuestas.filter(encuesta =>
      selectedAreas.includes(encuesta.tipo)
    );
  }
  

  // Verifica si el usuario actual es administrador
  verificarAdmin(): void {
    const user = this.authService.getCurrentUser();
    if (user?.uid) {
      this.registroService.getRegister(user.uid).then(querySnapshot => {
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const register = doc.data() as Register;
            this.isAdmin = register.role?.trim() === 'Administrador';
          });
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