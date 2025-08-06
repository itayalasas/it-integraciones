import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  getDoc
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

const COLLECTION_NAME = 'users';

export const usersService = {
  // Obtener todos los usuarios
  async getUsers(): Promise<User[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('name'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as User));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Obtener un usuario por ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Crear un nuevo usuario
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, password: string): Promise<string> {
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
      const firebaseUser = userCredential.user;

      // Crear documento de usuario en Firestore
      const userDoc = {
        ...userData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, COLLECTION_NAME, firebaseUser.uid), userDoc);

      return firebaseUser.uid;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Actualizar un usuario
  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Desactivar un usuario (no eliminar completamente)
  async deactivateUser(id: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(userRef, {
        isActive: false,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  },

  // Activar un usuario
  async activateUser(id: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(userRef, {
        isActive: true,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  },

  // Verificar si un usuario es administrador
  isAdmin(user: User | null): boolean {
    return user?.role === 'admin' || user?.email === 'pedro.ayala@segurossura.com.uy';
  },

  // Verificar si un usuario puede aprobar solicitudes
  canApprove(user: User | null): boolean {
    return user?.role === 'admin' || user?.role === 'approver' || user?.email === 'pedro.ayala@segurossura.com.uy';
  },

  // Verificar si un usuario puede crear solicitudes
  canCreateRequests(user: User | null): boolean {
    return user?.role === 'admin' || user?.role === 'requester' || user?.email === 'pedro.ayala@segurossura.com.uy';
  },

  // Verificar si un usuario es técnico
  isTechnical(user: User | null): boolean {
    return user?.role === 'admin' || user?.role === 'technical' || user?.email === 'pedro.ayala@segurossura.com.uy';
  },

  // Obtener texto del rol
  getRoleText(role: string): string {
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrador',
      'requester': 'Solicitante',
      'approver': 'Aprobador',
      'viewer': 'Visualizador',
      'technical': 'Técnico'
    };
    return roleMap[role] || role;
  },

  // Obtener color del rol
  getRoleColor(role: string): string {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'approver': return 'bg-blue-100 text-blue-800';
      case 'requester': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      case 'technical': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
};