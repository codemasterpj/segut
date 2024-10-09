import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs
} from '@angular/fire/firestore';
import { AuthService, LoginInfo } from '../auth/auth.service';
import { UserCredential } from '@angular/fire/auth';
import { Observable } from 'rxjs';


export interface Register {
  uid: string;
  email: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: Date;
  telefono: string;
  areas: string[];
  nombreEmpresa: string;
  categoriaEmpresa: string;
  role: string;
}

  


@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  currentRegister?: Register;

  constructor(private firestore: Firestore, private usersService: AuthService) { }

  async login(loginInfo: LoginInfo) : Promise<any> {
    let userCredential : UserCredential = await this.usersService.login(loginInfo)
      .then((response) => {
        return response;
      })
      .catch(error => {
        console.log(error);
        return error;
      });
    const uid = userCredential.user.uid;
    this.getRegister(uid).then(query => {
      query.forEach(element => this.currentRegister = element.data() as Register);      
    });
    return this.currentRegister;
  }

  getRegisters(): Observable<Register[]> {
    const registersRef = collection(this.firestore, 'registers');
    return collectionData(registersRef, {idField: 'uid'});
  }

  getRegister(uid: string) {
    const registersRef = collection(this.firestore, 'registers');
    const q = query(registersRef, where('uid', '==', uid));
    return getDocs(q);
  }

  async createRegister(loginInfo: LoginInfo, {email, nombre, apellido, fechaNacimiento, telefono, areas, nombreEmpresa, categoriaEmpresa, role}: Register) : Promise<any> {
    let userCredential : UserCredential = await this.usersService.register(loginInfo)
      .then((response) => {
        return response;
      })
      .catch(error => {
        console.log(error);
        return error;
      });
    const uid = userCredential.user.uid;
    this.currentRegister = {uid, email, nombre, apellido, fechaNacimiento, telefono, areas, nombreEmpresa, categoriaEmpresa, role};
    const registersRef = collection(this.firestore, 'registers');
    return addDoc(registersRef, {uid, email, nombre, apellido, fechaNacimiento, telefono, areas, nombreEmpresa, categoriaEmpresa, role});
  }

  updateRegister({uid, email, nombre, apellido, fechaNacimiento, telefono, areas, nombreEmpresa, categoriaEmpresa, role}: Register) : Promise<any> {
    const docRef = doc(this.firestore, `registers/${uid}`);
    return updateDoc(docRef, {uid, email, nombre, apellido, fechaNacimiento, telefono, areas, nombreEmpresa, categoriaEmpresa, role});
  }
 
  async deleteRegister(register: Register) : Promise<any> {
    await this.usersService.deleteRegister(register.uid);
    const docRef = doc(this.firestore, `registers/${register.uid}`);
    return deleteDoc(docRef);
  }
}
