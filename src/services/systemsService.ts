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
import { System } from '../types';

const COLLECTION_NAME = 'systems';

export const systemsService = {
  // Obtener todos los sistemas
  async getSystems(): Promise<System[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('name'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as System));
    } catch (error) {
      console.error('Error fetching systems:', error);
      throw error;
    }
  },

  // Crear un nuevo sistema
  async createSystem(system: Omit<System, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...system,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating system:', error);
      throw error;
    }
  },

  // Actualizar un sistema
  async updateSystem(id: string, updates: Partial<System>): Promise<void> {
    try {
      const systemRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(systemRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating system:', error);
      throw error;
    }
  },

  // Desactivar un sistema
  async deactivateSystem(id: string): Promise<void> {
    try {
      const systemRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(systemRef, {
        isActive: false,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error deactivating system:', error);
      throw error;
    }
  },

  // Activar un sistema
  async activateSystem(id: string): Promise<void> {
    try {
      const systemRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(systemRef, {
        isActive: true,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error activating system:', error);
      throw error;
    }
  },

  // Obtener sistemas activos
  async getActiveSystems(): Promise<System[]> {
    try {
      // Try the optimized query first
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
        } as System));
      } catch (indexError) {
        // Fallback: get all systems and filter in memory
        console.warn('Firebase index not ready, using fallback method');
        const allSystems = await this.getSystems();
        return allSystems
          .filter(system => system.isActive)
          .sort((a, b) => a.name.localeCompare(b.name));
      }
    } catch (error) {
      console.error('Error fetching active systems:', error);
      throw error;
    }
  },

  // Eliminar un sistema
  async deleteSystem(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting system:', error);
      throw error;
    }
  },

  // Obtener un sistema por ID
  async getSystemById(id: string): Promise<System | null> {
    try {
      const systems = await this.getSystems();
      return systems.find(system => system.id === id) || null;
    } catch (error) {
      console.error('Error fetching system by ID:', error);
      return null;
    }
  },

  // Obtener el nombre de un sistema por ID
  async getSystemName(id: string): Promise<string> {
    try {
      const system = await this.getSystemById(id);
      return system ? system.name : id; // Fallback al ID si no se encuentra
    } catch (error) {
      console.error('Error fetching system name:', error);
      return id;
    }
  },

  // Limpiar sistemas duplicados
  async cleanupDuplicateSystems(): Promise<void> {
    try {
      const allSystems = await this.getSystems();
      const systemNames = new Map<string, System[]>();
      
      // Agrupar sistemas por nombre
      allSystems.forEach(system => {
        const name = system.name.toLowerCase();
        if (!systemNames.has(name)) {
          systemNames.set(name, []);
        }
        systemNames.get(name)!.push(system);
      });

      // Eliminar duplicados (mantener solo el más reciente)
      for (const [name, systems] of systemNames) {
        if (systems.length > 1) {
          console.log(`Encontrados ${systems.length} sistemas duplicados para "${name}"`);
          
          // Ordenar por fecha de creación (más reciente primero)
          systems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          
          // Mantener el primero (más reciente) y eliminar el resto
          for (let i = 1; i < systems.length; i++) {
            console.log(`Eliminando sistema duplicado: ${systems[i].id}`);
            await this.deleteSystem(systems[i].id);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up duplicate systems:', error);
      throw error;
    }
  },

  // Inicializar sistemas por defecto
  async initializeDefaultSystems(): Promise<void> {
    try {
      // Primero limpiar duplicados existentes
      await this.cleanupDuplicateSystems();
      
      const existingSystems = await this.getSystems();
      if (existingSystems.length === 0) {
        const defaultSystems: Omit<System, 'id'>[] = [
          { name: 'SAP ERP', description: 'Sistema de planificación empresarial', type: 'internal', technology: 'SAP', owner: 'IT', isActive: true, createdAt: new Date(), updatedAt: new Date() },
          { name: 'Salesforce CRM', description: 'Sistema de gestión de clientes', type: 'cloud', technology: 'Salesforce', owner: 'Ventas', isActive: true, createdAt: new Date(), updatedAt: new Date() },
          { name: 'Oracle Database', description: 'Base de datos principal', type: 'internal', technology: 'Oracle', owner: 'IT', isActive: true, createdAt: new Date(), updatedAt: new Date() },
          { name: 'Microsoft Dynamics', description: 'Sistema de gestión financiera', type: 'internal', technology: 'Microsoft', owner: 'Finanzas', isActive: true, createdAt: new Date(), updatedAt: new Date() },
          { name: 'API Gateway', description: 'Gateway de APIs', type: 'internal', technology: 'Kong', owner: 'IT', isActive: true, createdAt: new Date(), updatedAt: new Date() },
          { name: 'Sistema de Facturación', description: 'Sistema legacy de facturación', type: 'legacy', technology: 'COBOL', owner: 'Finanzas', isActive: true, createdAt: new Date(), updatedAt: new Date() },
          { name: 'AWS S3', description: 'Almacenamiento en la nube', type: 'cloud', technology: 'AWS', owner: 'IT', isActive: true, createdAt: new Date(), updatedAt: new Date() },
          { name: 'Sistema de Inventario', description: 'Control de inventarios', type: 'internal', technology: 'Java', owner: 'Operaciones', isActive: true, createdAt: new Date(), updatedAt: new Date() }
        ];

        for (const system of defaultSystems) {
          await this.createSystem(system);
        }
      }
    } catch (error) {
      console.error('Error initializing default systems:', error);
      throw error;
    }
  }
};