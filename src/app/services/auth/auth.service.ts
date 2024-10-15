import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  deleteUser,
  onAuthStateChanged
 } from '@angular/fire/auth';

 export interface LoginInfo {
   email: string;
   password: string;
 }

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth) { }


    register({email, password}: LoginInfo) : Promise<any> {
      return createUserWithEmailAndPassword(this.auth, email, password);
    }

    login({email, password}: LoginInfo) : Promise<any> {
      return signInWithEmailAndPassword(this.auth, email, password);
    }

    logout() : Promise<any> {
      return signOut(this.auth).then(() => {
        console.log('Sesión cerrada exitosamente');
        // Limpia cualquier estado adicional del usuario si lo manejas aquí
      }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
    }

    getCurrentUser() : User | null {
      return this.auth.currentUser;
    }

    deleteRegister(uid: string) : Promise<any> {
      let user : User = {uid} as User;
      return deleteUser(user);
    }

      // Nuevo método para escuchar cambios de autenticación
    onAuthStateChanged(callback: (user: User | null) => void): void {
    onAuthStateChanged(this.auth, callback);
  }
  
}
