import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Department } from '../types';

const COLLECTION_NAME = 'departments';

export const departmentsService = {
  // Obtener todos los departamentos
  async getDepartments(): Promise<Department[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('name'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as Department));
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },

  // Obtener departamentos activos
  async getActiveDepartments(): Promise<Department[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('isActive', '==', true),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as Department));
    } catch (error) {
      console.error('Error fetching active departments:', error);
      throw error;
    }
  },

  // Crear un nuevo departamento
  async createDepartment(department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Verificar si ya existe un departamento con el mismo nombre
      const existingDepartments = await this.getDepartments();
      const duplicateDepartment = existingDepartments.find(
        d => d.name.toLowerCase() === department.name.toLowerCase()
      );
      
      if (duplicateDepartment) {
        throw new Error(`Ya existe un departamento con el nombre "${department.name}"`);
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...department,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  },

  // Actualizar un departamento
  async updateDepartment(id: string, updates: Partial<Department>): Promise<void> {
    try {
      // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
      if (updates.name) {
        const existingDepartments = await this.getDepartments();
        const duplicateDepartment = existingDepartments.find(
          d => d.name.toLowerCase() === updates.name!.toLowerCase() && d.id !== id
        );
        
        if (duplicateDepartment) {
          throw new Error(`Ya existe un departamento con el nombre "${updates.name}"`);
        }
      }

      const departmentRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(departmentRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  },

  // Eliminar un departamento (desactivar)
  async deactivateDepartment(id: string): Promise<void> {
    try {
      const departmentRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(departmentRef, {
        isActive: false,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error deactivating department:', error);
      throw error;
    }
  },

  // Activar un departamento
  async activateDepartment(id: string): Promise<void> {
    try {
      const departmentRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(departmentRef, {
        isActive: true,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error activating department:', error);
      throw error;
    }
  },

  // Eliminar departamento completamente (solo para limpiar duplicados)
  async deleteDepartment(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  },

  // Limpiar departamentos duplicados
  async cleanupDuplicateDepartments(): Promise<void> {
    try {
      const allDepartments = await this.getDepartments();
      const departmentNames = new Map<string, Department[]>();
      
      // Agrupar departamentos por nombre
      allDepartments.forEach(dept => {
        const name = dept.name.toLowerCase();
        if (!departmentNames.has(name)) {
          departmentNames.set(name, []);
        }
        departmentNames.get(name)!.push(dept);
      });

      // Eliminar duplicados (mantener solo el más reciente)
      for (const [name, departments] of departmentNames) {
        if (departments.length > 1) {
          console.log(`Encontrados ${departments.length} departamentos duplicados para "${name}"`);
          
          // Ordenar por fecha de creación (más reciente primero)
          departments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          
          // Mantener el primero (más reciente) y eliminar el resto
          for (let i = 1; i < departments.length; i++) {
            console.log(`Eliminando departamento duplicado: ${departments[i].id}`);
            await this.deleteDepartment(departments[i].id);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up duplicate departments:', error);
      throw error;
    }
  },

  // Inicializar departamentos por defecto (mejorado para evitar duplicados)
  async initializeDefaultDepartments(): Promise<void> {
    try {
      // Primero limpiar duplicados existentes
      await this.cleanupDuplicateDepartments();
      
      const existingDepartments = await this.getDepartments();
      
      const defaultDepartments: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>[] = [
        { name: 'IT', description: 'Tecnologías de la Información', isActive: true },
        { name: 'Finanzas', description: 'Departamento Financiero', isActive: true },
        { name: 'Ventas', description: 'Departamento de Ventas', isActive: true },
        { name: 'Marketing', description: 'Departamento de Marketing', isActive: true },
        { name: 'Recursos Humanos', description: 'Gestión de Personal', isActive: true },
        { name: 'Operaciones', description: 'Operaciones y Logística', isActive: true },
        { name: 'Compras', description: 'Departamento de Compras', isActive: true },
        { name: 'Legal', description: 'Departamento Legal', isActive: true },
        { name: 'Calidad', description: 'Control de Calidad', isActive: true },
        { name: 'Producción', description: 'Departamento de Producción', isActive: true }
      ];

      // Solo crear departamentos que no existan
      for (const defaultDept of defaultDepartments) {
        const exists = existingDepartments.some(
          existing => existing.name.toLowerCase() === defaultDept.name.toLowerCase()
        );
        
        if (!exists) {
          console.log(`Creando departamento: ${defaultDept.name}`);
          await this.createDepartment(defaultDept);
        }
      }
    } catch (error) {
      console.error('Error initializing default departments:', error);
      throw error;
    }
  }
};