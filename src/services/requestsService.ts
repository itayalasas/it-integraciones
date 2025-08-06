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
import { db } from '../config/firebase';
import { IntegrationRequest } from '../types';

const COLLECTION_NAME = 'integration_requests';

export const requestsService = {
  // Obtener todas las solicitudes
  async getRequests(): Promise<IntegrationRequest[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        dueDate: doc.data().dueDate?.toDate(),
        approvedAt: doc.data().approvedAt?.toDate(),
        sprintInfo: doc.data().sprintInfo ? {
          ...doc.data().sprintInfo,
          sprintStartDate: doc.data().sprintInfo.sprintStartDate?.toDate(),
          sprintEndDate: doc.data().sprintInfo.sprintEndDate?.toDate(),
          assignedAt: doc.data().sprintInfo.assignedAt?.toDate()
        } : undefined,
        generatedAt: doc.data().generatedAt?.toDate(),
        approvalHistory: doc.data().approvalHistory?.map((approval: any) => ({
          ...approval,
          timestamp: approval.timestamp?.toDate ? approval.timestamp.toDate() : new Date(approval.timestamp),
          sprintStartDate: approval.sprintStartDate?.toDate ? approval.sprintStartDate.toDate() : approval.sprintStartDate,
          sprintEndDate: approval.sprintEndDate?.toDate ? approval.sprintEndDate.toDate() : approval.sprintEndDate
        })) || []
      } as IntegrationRequest));
    } catch (error) {
      console.error('Error fetching requests:', error);
      throw error;
    }
  },

  // Obtener solicitudes por usuario
  async getRequestsByUser(userId: string): Promise<IntegrationRequest[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('requesterId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        dueDate: doc.data().dueDate?.toDate(),
        approvedAt: doc.data().approvedAt?.toDate(),
        sprintInfo: doc.data().sprintInfo ? {
          ...doc.data().sprintInfo,
          sprintStartDate: doc.data().sprintInfo.sprintStartDate?.toDate(),
          sprintEndDate: doc.data().sprintInfo.sprintEndDate?.toDate(),
          assignedAt: doc.data().sprintInfo.assignedAt?.toDate()
        } : undefined,
        generatedAt: doc.data().generatedAt?.toDate(),
        approvalHistory: doc.data().approvalHistory?.map((approval: any) => ({
          ...approval,
          timestamp: approval.timestamp?.toDate ? approval.timestamp.toDate() : new Date(approval.timestamp),
          sprintStartDate: approval.sprintStartDate?.toDate ? approval.sprintStartDate.toDate() : approval.sprintStartDate,
          sprintEndDate: approval.sprintEndDate?.toDate ? approval.sprintEndDate.toDate() : approval.sprintEndDate
        })) || []
      } as IntegrationRequest));
    } catch (error) {
      console.error('Error fetching user requests:', error);
      throw error;
    }
  },

  // Obtener solicitudes pendientes de aprobación
  async getPendingApprovals(): Promise<IntegrationRequest[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('status', 'in', ['submitted', 'in_review']),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        dueDate: doc.data().dueDate?.toDate(),
        approvedAt: doc.data().approvedAt?.toDate(),
        sprintInfo: doc.data().sprintInfo ? {
          ...doc.data().sprintInfo,
          sprintStartDate: doc.data().sprintInfo.sprintStartDate?.toDate(),
          sprintEndDate: doc.data().sprintInfo.sprintEndDate?.toDate(),
          assignedAt: doc.data().sprintInfo.assignedAt?.toDate()
        } : undefined,
        generatedAt: doc.data().generatedAt?.toDate(),
        approvalHistory: doc.data().approvalHistory?.map((approval: any) => ({
          ...approval,
          timestamp: approval.timestamp?.toDate ? approval.timestamp.toDate() : new Date(approval.timestamp),
          sprintStartDate: approval.sprintStartDate?.toDate ? approval.sprintStartDate.toDate() : approval.sprintStartDate,
          sprintEndDate: approval.sprintEndDate?.toDate ? approval.sprintEndDate.toDate() : approval.sprintEndDate
        })) || []
      } as IntegrationRequest));
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }
  },

  // Obtener una solicitud por ID
  async getRequestById(id: string): Promise<IntegrationRequest | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          dueDate: data.dueDate?.toDate(),
          approvedAt: data.approvedAt?.toDate(),
          sprintInfo: data.sprintInfo ? {
            ...data.sprintInfo,
            sprintStartDate: data.sprintInfo.sprintStartDate?.toDate(),
            sprintEndDate: data.sprintInfo.sprintEndDate?.toDate(),
            assignedAt: data.sprintInfo.assignedAt?.toDate()
          } : undefined,
          generatedAt: data.generatedAt?.toDate(),
          functionalRequirements: data.functionalRequirements || {
            businessGoals: '',
            functionalRequirements: '',
            acceptanceCriteria: '',
            businessRules: ''
          },
          technicalRequirements: data.technicalRequirements || {
            architecture: '',
            technologies: '',
            integrationPoints: '',
            dataFlow: '',
            securityRequirements: '',
            performanceRequirements: ''
          },
          nonFunctionalRequirements: data.nonFunctionalRequirements || {
            availability: '',
            scalability: '',
            usability: '',
            reliability: '',
            maintenance: ''
          },
          testCases: data.testCases || [],
          documents: data.documents || [],
          approvalHistory: data.approvalHistory?.map((approval: any) => ({
            ...approval,
            timestamp: approval.timestamp?.toDate ? approval.timestamp.toDate() : approval.timestamp,
            sprintStartDate: approval.sprintStartDate?.toDate ? approval.sprintStartDate.toDate() : approval.sprintStartDate,
            sprintEndDate: approval.sprintEndDate?.toDate ? approval.sprintEndDate.toDate() : approval.sprintEndDate
          })) || []
        } as IntegrationRequest;
      }
      return null;
    } catch (error) {
      console.error('Error fetching request:', error);
      throw error;
    }
  },

  // Crear una nueva solicitud
  async createRequest(request: Omit<IntegrationRequest, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...request,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  },

  // Actualizar una solicitud
  async updateRequest(id: string, updates: Partial<IntegrationRequest>): Promise<void> {
    try {
      const requestRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(requestRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating request:', error);
      throw error;
    }
  },

  // Aprobar una solicitud
  async approveRequest(
    id: string, 
    approverId: string, 
    approverName: string, 
    comment: string,
    sprintInfo?: {
      sprintName?: string;
      sprintStartDate?: Date;
      sprintEndDate?: Date;
    }
  ): Promise<void> {
    try {
      const requestRef = doc(db, COLLECTION_NAME, id);
      const approvalEntry = {
        id: Date.now().toString(),
        userId: approverId,
        userName: approverName,
        action: 'approved' as const,
        comment,
        timestamp: new Date(),
        ...(sprintInfo?.sprintName && {
          sprintName: sprintInfo.sprintName,
          sprintStartDate: sprintInfo.sprintStartDate,
          sprintEndDate: sprintInfo.sprintEndDate
        })
      };
      
      await updateDoc(requestRef, {
        status: 'approved',
        approvedBy: approverId,
        approvedAt: new Date(),
        updatedAt: new Date(),
        approvalHistory: [approvalEntry]
      });
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  },

  // Actualizar información del sprint
  async updateSprintInfo(
    id: string, 
    sprintInfo: {
      sprintName: string;
      sprintStartDate?: Date;
      sprintEndDate?: Date;
    }
  ): Promise<void> {
    try {
      const requestRef = doc(db, COLLECTION_NAME, id);
      
      // Determinar si debe cambiar a "En Desarrollo"
      const shouldStartDevelopment = sprintInfo.sprintStartDate && 
        sprintInfo.sprintStartDate <= new Date();
      
      const updateData: any = {
        sprintInfo: {
          ...sprintInfo,
          assignedAt: new Date()
        },
        updatedAt: new Date()
      };
      
      // Si la fecha de inicio es hoy o anterior, cambiar estado
      if (shouldStartDevelopment) {
        updateData.status = 'in_development';
      }
      
      await updateDoc(requestRef, updateData);
    } catch (error) {
      console.error('Error updating sprint info:', error);
      throw error;
    }
  },

  // Obtener una solicitud por ID (método simplificado)
  async getRequest(id: string): Promise<IntegrationRequest | null> {
    return this.getRequestById(id);
  },

  // Rechazar una solicitud
  async rejectRequest(
    id: string, 
    approverId: string, 
    approverName: string, 
    comment: string,
    sprintInfo?: {
      sprintName?: string;
      sprintStartDate?: Date;
      sprintEndDate?: Date;
    }
  ): Promise<void> {
    try {
      const requestRef = doc(db, COLLECTION_NAME, id);
      const approvalEntry = {
        id: Date.now().toString(),
        userId: approverId,
        userName: approverName,
        action: 'rejected' as const,
        comment,
        timestamp: new Date(),
        ...(sprintInfo?.sprintName && {
          sprintName: sprintInfo.sprintName,
          sprintStartDate: sprintInfo.sprintStartDate,
          sprintEndDate: sprintInfo.sprintEndDate
        })
      };
      
      await updateDoc(requestRef, {
        status: 'rejected',
        updatedAt: new Date(),
        approvalHistory: [approvalEntry]
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  }
};