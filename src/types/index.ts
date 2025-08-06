export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'requester' | 'approver' | 'viewer' | 'technical';
  department: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface IntegrationRequest {
  id: string;
  title: string;
  description: string;
  requesterId: string;
  requesterName: string;
  department: string;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'in_development' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  
  // Información de sistemas
  systemToIntegrate: string;
  sourceSystem: string;
  targetSystem: string;
  intermediarySystem?: string;
  architectureDiagram?: string; // URL o base64 del diagrama
  
  // Requerimientos funcionales
  functionalRequirements: {
    businessGoals: string;
    functionalRequirements: string;
    acceptanceCriteria: string;
    businessRules: string;
  };
  
  // Requerimientos técnicos
  technicalRequirements: {
    architecture: string;
    technologies: string[] | string;
    integrationPoints: string;
    dataFlow: string;
    securityRequirements: string;
    performanceRequirements: string;
    serviceUrl: string;
    credentials: string;
  };
  
  // Requerimientos no funcionales
  nonFunctionalRequirements: {
    availability: string;
    scalability: string;
    usability: string;
    reliability: string;
    maintenance: string;
  };
  
  // Casos de prueba
  testCases: TestCase[];
  
  // Documentos adjuntos
  documents: Document[];
  
  // Aprobación
  approvalHistory: ApprovalHistory[];
  approvedBy?: string;
  approvedAt?: Date;
  
  // Historia de usuario generada
  userStoryGenerated?: string;
  generatedAt?: Date;
  
  // Información del Sprint
  sprintInfo?: {
    sprintName: string;
    sprintStartDate: Date;
    sprintEndDate: Date;
    assignedAt: Date;
  };
}

export interface System {
  id: string;
  name: string;
  description: string;
  type: 'internal' | 'external' | 'cloud' | 'legacy';
  technology: string;
  owner: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ApprovalHistory {
  id: string;
  userId: string;
  userName: string;
  action: 'submitted' | 'approved' | 'rejected' | 'requested_changes';
  comment: string;
  timestamp: Date;
  // Información del Sprint (opcional)
  sprintName?: string;
  sprintStartDate?: Date;
  sprintEndDate?: Date;
}

export interface Comment {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}