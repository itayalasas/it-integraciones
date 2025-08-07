import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  Save, 
  Send, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  X,
  Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { requestsService } from '../../services/requestsService';
import { systemsService } from '../../services/systemsService';
import { departmentsService } from '../../services/departmentsService';
import { IntegrationRequest, TestCase } from '../../types';
import DocumentUploader from './DocumentUploader';
import { ProcessedRequestData } from '../../services/excelProcessorService';
import { excelTemplateService } from '../../services/excelTemplateService';

// Componente para notificaciones
interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, title, message, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'info': return <AlertCircle className="h-5 w-5 text-blue-400" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColors = () => {
    switch (type) {
      case 'success': return 'text-green-800';
      case 'error': return 'text-red-800';
      case 'warning': return 'text-yellow-800';
      case 'info': return 'text-blue-800';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md w-full ${getColors()} border rounded-lg p-4 shadow-lg animate-in slide-in-from-top-2 duration-300`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${getTextColors()}`}>
            {title}
          </h3>
          <p className={`mt-1 text-sm ${getTextColors()} opacity-90`}>
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onClose}
            className={`inline-flex ${getTextColors()} hover:opacity-75`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const NewRequest: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const [systems, setSystems] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDocumentUploader, setShowDocumentUploader] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    workFront: 'INSIS' as 'INSIS' | 'Mulesoft' | 'BAU' | 'IA' | 'CCM' | 'Nuevas iniciativas',
    dueDate: '',
    systemToIntegrate: '',
    sourceSystem: '',
    targetSystem: '',
    intermediarySystem: '',
    architectureDiagram: '',
    functionalRequirements: {
      businessGoals: '',
      functionalRequirements: '',
      acceptanceCriteria: '',
      businessRules: ''
    },
    technicalRequirements: {
      architecture: '',
      technologies: [] as string[],
      integrationPoints: '',
      dataFlow: '',
      securityRequirements: '',
      performanceRequirements: '',
      serviceUrl: '',
      credentials: ''
    },
    nonFunctionalRequirements: {
      availability: '',
      scalability: '',
      usability: '',
      reliability: '',
      maintenance: ''
    },
    testCases: [] as TestCase[]
  });

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    loadSystems();
    loadDepartments();
  }, []);

  const loadSystems = async () => {
    try {
      setLoading(true);
      await systemsService.initializeDefaultSystems();
      const systemsList = await systemsService.getActiveSystems();
      setSystems(systemsList);
    } catch (error) {
      console.error('Error loading systems:', error);
      showNotification(
        'error',
        'Error al cargar sistemas',
        'No se pudieron cargar los sistemas disponibles.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      await departmentsService.initializeDefaultDepartments();
      const departmentsList = await departmentsService.getActiveDepartments();
      setDepartments(departmentsList);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleDocumentDataProcessed = (data: ProcessedRequestData) => {
    // Función para encontrar sistema por nombre
    const findSystemByName = (systemName: string) => {
      if (!systemName) return '';
      return systems.find(s => 
        s.name.toLowerCase() === systemName.toLowerCase() ||
        s.name.toLowerCase().includes(systemName.toLowerCase())
      )?.id || '';
    };

    // Mapear los datos procesados al estado del formulario
    setFormData(prev => ({
      ...prev,
      title: data.title || prev.title,
      description: data.description || prev.description,
      priority: data.priority || prev.priority,
      dueDate: data.dueDate ? data.dueDate.toISOString().split('T')[0] : prev.dueDate,
      systemToIntegrate: findSystemByName(data.systemToIntegrate) || prev.systemToIntegrate,
      sourceSystem: findSystemByName(data.sourceSystem) || prev.sourceSystem,
      targetSystem: findSystemByName(data.targetSystem) || prev.targetSystem,
      intermediarySystem: findSystemByName(data.intermediarySystem || '') || prev.intermediarySystem,
      functionalRequirements: {
        businessGoals: data.functionalRequirements.businessGoals || prev.functionalRequirements.businessGoals,
        functionalRequirements: data.functionalRequirements.functionalRequirements || prev.functionalRequirements.functionalRequirements,
        acceptanceCriteria: data.functionalRequirements.acceptanceCriteria || prev.functionalRequirements.acceptanceCriteria,
        businessRules: data.functionalRequirements.businessRules || prev.functionalRequirements.businessRules
      },
      technicalRequirements: {
        ...prev.technicalRequirements,
        architecture: data.technicalRequirements.architecture || prev.technicalRequirements.architecture,
        technologies: data.technicalRequirements.technologies.length > 0 ? data.technicalRequirements.technologies : prev.technicalRequirements.technologies,
        integrationPoints: data.technicalRequirements.integrationPoints || prev.technicalRequirements.integrationPoints,
        dataFlow: data.technicalRequirements.dataFlow || prev.technicalRequirements.dataFlow,
        securityRequirements: data.technicalRequirements.securityRequirements || prev.technicalRequirements.securityRequirements,
        performanceRequirements: data.technicalRequirements.performanceRequirements || prev.technicalRequirements.performanceRequirements,
        serviceUrl: data.technicalRequirements.serviceUrl || prev.technicalRequirements.serviceUrl,
        credentials: data.technicalRequirements.credentials || prev.technicalRequirements.credentials
      },
      nonFunctionalRequirements: {
        availability: data.nonFunctionalRequirements.availability || prev.nonFunctionalRequirements.availability,
        scalability: data.nonFunctionalRequirements.scalability || prev.nonFunctionalRequirements.scalability,
        usability: data.nonFunctionalRequirements.usability || prev.nonFunctionalRequirements.usability,
        reliability: data.nonFunctionalRequirements.reliability || prev.nonFunctionalRequirements.reliability,
        maintenance: data.nonFunctionalRequirements.maintenance || prev.nonFunctionalRequirements.maintenance
      },
      testCases: data.testCases.length > 0 ? data.testCases.map(tc => ({
        ...tc,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      })) : prev.testCases
    }));

    showNotification(
      'success',
      'Datos cargados exitosamente',
      'Los datos de la plantilla han sido cargados en el formulario. Revisa y completa los campos faltantes.'
    );
  };

  const handleDownloadTemplate = async (simple: boolean = false) => {
    setDownloadingTemplate(true);
    try {
      if (simple) {
        await excelTemplateService.generateSimpleTemplate();
        showNotification(
          'success',
          'Plantilla descargada',
          'La plantilla simplificada ha sido descargada exitosamente'
        );
      } else {
        await excelTemplateService.generateTemplate();
        showNotification(
          'success',
          'Plantilla descargada',
          'La plantilla completa ha sido descargada exitosamente'
        );
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      showNotification(
        'error',
        'Error al descargar plantilla',
        'No se pudo descargar la plantilla. Intenta nuevamente.'
      );
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    
    if (!currentUser) return;

    // Validaciones básicas
    if (!isDraft) {
      if (!formData.title.trim()) {
        showNotification('error', 'Campo requerido', 'El título es obligatorio');
        return;
      }
      if (!formData.description.trim()) {
        showNotification('error', 'Campo requerido', 'La descripción es obligatoria');
        return;
      }
      if (!formData.systemToIntegrate) {
        showNotification('error', 'Campo requerido', 'Debe seleccionar el sistema a integrar');
        return;
      }
      if (!formData.sourceSystem) {
        showNotification('error', 'Campo requerido', 'Debe seleccionar el sistema origen');
        return;
      }
      if (!formData.targetSystem) {
        showNotification('error', 'Campo requerido', 'Debe seleccionar el sistema destino');
        return;
      }
    }

    setSaving(true);
    try {
      const requestData: Omit<IntegrationRequest, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title,
        description: formData.description,
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        department: currentUser.department,
        status: isDraft ? 'draft' : 'submitted',
        priority: formData.priority,
        workFront: formData.workFront,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        systemToIntegrate: formData.systemToIntegrate,
        sourceSystem: formData.sourceSystem,
        targetSystem: formData.targetSystem,
        intermediarySystem: formData.intermediarySystem || undefined,
        architectureDiagram: formData.architectureDiagram || undefined,
        functionalRequirements: formData.functionalRequirements,
        technicalRequirements: {
          ...formData.technicalRequirements,
          credentials: formData.technicalRequirements.credentials ? btoa(formData.technicalRequirements.credentials) : ''
        },
        nonFunctionalRequirements: formData.nonFunctionalRequirements,
        testCases: formData.testCases,
        documents: [],
        approvalHistory: []
      };

      await requestsService.createRequest(requestData);
      
      showNotification(
        'success',
        isDraft ? 'Borrador guardado' : 'Solicitud enviada',
        isDraft ? 'El borrador ha sido guardado exitosamente' : 'La solicitud ha sido enviada para revisión'
      );
      
      setTimeout(() => {
        navigate('/requests');
      }, 1500);
      
    } catch (error) {
      console.error('Error saving request:', error);
      showNotification(
        'error',
        'Error al guardar',
        'No se pudo guardar la solicitud. Intenta nuevamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  const addTestCase = () => {
    const newTestCase: TestCase = {
      id: Date.now().toString(),
      title: '',
      description: '',
      preconditions: '',
      steps: [''],
      expectedResult: '',
      priority: 'medium'
    };
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, newTestCase]
    }));
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: any) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.map((tc, i) => 
        i === index ? { ...tc, [field]: value } : tc
      )
    }));
  };

  const removeTestCase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index)
    }));
  };

  const addTestStep = (testCaseIndex: number) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.map((tc, i) => 
        i === testCaseIndex ? { ...tc, steps: [...tc.steps, ''] } : tc
      )
    }));
  };

  const updateTestStep = (testCaseIndex: number, stepIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.map((tc, i) => 
        i === testCaseIndex ? {
          ...tc,
          steps: tc.steps.map((step, j) => j === stepIndex ? value : step)
        } : tc
      )
    }));
  };

  const removeTestStep = (testCaseIndex: number, stepIndex: number) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.map((tc, i) => 
        i === testCaseIndex ? {
          ...tc,
          steps: tc.steps.filter((_, j) => j !== stepIndex)
        } : tc
      )
    }));
  };

  const toggleTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technicalRequirements: {
        ...prev.technicalRequirements,
        technologies: prev.technicalRequirements.technologies.includes(tech)
          ? prev.technicalRequirements.technologies.filter(t => t !== tech)
          : [...prev.technicalRequirements.technologies, tech]
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Notificación */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Solicitud de Integración</h1>
          <p className="text-gray-600 mt-1">
            Completa todos los campos para crear una solicitud detallada
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleDownloadTemplate(true)}
            disabled={downloadingTemplate}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{downloadingTemplate ? 'Descargando...' : 'Plantilla Simple'}</span>
          </button>
          <button
            onClick={() => handleDownloadTemplate(false)}
            disabled={downloadingTemplate}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{downloadingTemplate ? 'Descargando...' : 'Plantilla Completa'}</span>
          </button>
          <button
            onClick={() => setShowDocumentUploader(true)}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Cargar Plantilla</span>
          </button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
        {/* Información General */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Información General</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Integración *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Integración SAP con Salesforce para sincronización de clientes"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción Detallada *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe detalladamente el proyecto de integración, sus objetivos y alcance..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad *
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Límite
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sistemas Involucrados */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sistemas Involucrados</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona el sistema principal que necesita integración *
              </label>
              <select
                required
                value={formData.systemToIntegrate}
                onChange={(e) => setFormData(prev => ({ ...prev, systemToIntegrate: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona un sistema</option>
                {systems.map((system) => (
                  <option key={system.id} value={system.id}>
                    {system.name} - {system.technology}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sistema Origen (envía datos) *
              </label>
              <select
                required
                value={formData.sourceSystem}
                onChange={(e) => setFormData(prev => ({ ...prev, sourceSystem: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona sistema origen</option>
                {systems.map((system) => (
                  <option key={system.id} value={system.id}>
                    {system.name} - {system.technology}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sistema Destino (recibe datos) *
              </label>
              <select
                required
                value={formData.targetSystem}
                onChange={(e) => setFormData(prev => ({ ...prev, targetSystem: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona sistema destino</option>
                {systems.map((system) => (
                  <option key={system.id} value={system.id}>
                    {system.name} - {system.technology}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sistema Intermediario (opcional)
              </label>
              <select
                value={formData.intermediarySystem}
                onChange={(e) => setFormData(prev => ({ ...prev, intermediarySystem: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sin sistema intermediario</option>
                {systems.map((system) => (
                  <option key={system.id} value={system.id}>
                    {system.name} - {system.technology}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Requerimientos Funcionales */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Requerimientos Funcionales</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objetivos de Negocio *
              </label>
              <textarea
                required
                rows={3}
                value={formData.functionalRequirements.businessGoals}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  functionalRequirements: {
                    ...prev.functionalRequirements,
                    businessGoals: e.target.value
                  }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe los objetivos de negocio que se buscan alcanzar con esta integración..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requerimientos Funcionales Específicos *
              </label>
              <textarea
                required
                rows={3}
                value={formData.functionalRequirements.functionalRequirements}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  functionalRequirements: {
                    ...prev.functionalRequirements,
                    functionalRequirements: e.target.value
                  }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Lista los requerimientos funcionales específicos que debe cumplir la integración..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Criterios de Aceptación *
              </label>
              <textarea
                required
                rows={3}
                value={formData.functionalRequirements.acceptanceCriteria}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  functionalRequirements: {
                    ...prev.functionalRequirements,
                    acceptanceCriteria: e.target.value
                  }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Define los criterios que deben cumplirse para considerar la integración como exitosa..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reglas de Negocio
              </label>
              <textarea
                rows={3}
                value={formData.functionalRequirements.businessRules}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  functionalRequirements: {
                    ...prev.functionalRequirements,
                    businessRules: e.target.value
                  }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Especifica las reglas de negocio que deben aplicarse en la integración..."
              />
            </div>
          </div>
        </div>

        {/* Requerimientos Técnicos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Requerimientos Técnicos</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arquitectura Propuesta
              </label>
              <select
                value={formData.technicalRequirements.architecture}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  technicalRequirements: {
                    ...prev.technicalRequirements,
                    architecture: e.target.value
                  }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona una arquitectura</option>
                <option value="API REST">API REST</option>
                <option value="SOAP">SOAP</option>
                <option value="Microservicios">Microservicios</option>
                <option value="ETL">ETL</option>
                <option value="Batch">Batch</option>
                <option value="Tiempo Real">Tiempo Real</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tecnologías Requeridas
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Java', '.NET', 'Python', 'Node.js', 'SQL Server', 'Oracle', 'MongoDB', 'PostgreSQL'].map((tech) => (
                  <label key={tech} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.technicalRequirements.technologies.includes(tech)}
                      onChange={() => toggleTechnology(tech)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{tech}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puntos de Integración
              </label>
              <textarea
                rows={3}
                value={formData.technicalRequirements.integrationPoints}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  technicalRequirements: {
                    ...prev.technicalRequirements,
                    integrationPoints: e.target.value
                  }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe los puntos específicos donde se realizará la integración..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flujo de Datos
              </label>
              <textarea
                rows={3}
                value={formData.technicalRequirements.dataFlow}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  technicalRequirements: {
                    ...prev.technicalRequirements,
                    dataFlow: e.target.value
                  }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe cómo fluirán los datos entre los sistemas..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del Servicio
                </label>
                <input
                  type="url"
                  value={formData.technicalRequirements.serviceUrl}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    technicalRequirements: {
                      ...prev.technicalRequirements,
                      serviceUrl: e.target.value
                    }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://api.ejemplo.com/endpoint"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credenciales/Autenticación
                </label>
                <div className="relative">
                  <input
                    type={showCredentials ? "text" : "password"}
                    value={formData.technicalRequirements.credentials}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      technicalRequirements: {
                        ...prev.technicalRequirements,
                        credentials: e.target.value
                      }
                    }))}
                    className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="API Key, Token, etc."
                  />
                  <button
                    type="button"
                    onClick={() => setShowCredentials(!showCredentials)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showCredentials ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requerimientos de Seguridad
              </label>
              <textarea
                rows={2}
                value={formData.technicalRequirements.securityRequirements}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  technicalRequirements: {
                    ...prev.technicalRequirements,
                    securityRequirements: e.target.value
                  }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Especifica los requerimientos de seguridad..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requerimientos de Rendimiento
              </label>
              <textarea
                rows={2}
                value={formData.technicalRequirements.performanceRequirements}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  technicalRequirements: {
                    ...prev.technicalRequirements,
                    performanceRequirements: e.target.value
                  }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Especifica los requerimientos de rendimiento..."
              />
            </div>
          </div>
        </div>

        {/* Requerimientos No Funcionales */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Requerimientos No Funcionales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disponibilidad
              </label>
              <input
                type="text"
                value={formData.nonFunctionalRequirements.availability}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  nonFunctionalRequirements: {
                    ...prev.nonFunctionalRequirements,
                    availability: e.target.value
                  }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: 99.9% uptime"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Escalabilidad
              </label>
              <input
                type="text"
                value={formData.nonFunctionalRequirements.scalability}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  nonFunctionalRequirements: {
                    ...prev.nonFunctionalRequirements,
                    scalability: e.target.value
                  }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Soportar hasta 1000 usuarios concurrentes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usabilidad
              </label>
              <input
                type="text"
                value={formData.nonFunctionalRequirements.usability}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  nonFunctionalRequirements: {
                    ...prev.nonFunctionalRequirements,
                    usability: e.target.value
                  }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Interfaz intuitiva y fácil de usar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confiabilidad
              </label>
              <input
                type="text"
                value={formData.nonFunctionalRequirements.reliability}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  nonFunctionalRequirements: {
                    ...prev.nonFunctionalRequirements,
                    reliability: e.target.value
                  }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Tasa de error menor al 0.1%"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mantenibilidad
              </label>
              <input
                type="text"
                value={formData.nonFunctionalRequirements.maintenance}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  nonFunctionalRequirements: {
                    ...prev.nonFunctionalRequirements,
                    maintenance: e.target.value
                  }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Código bien documentado y modular"
              />
            </div>
          </div>
        </div>

        {/* Casos de Prueba */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Casos de Prueba</h2>
            <button
              type="button"
              onClick={addTestCase}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Caso</span>
            </button>
          </div>

          {formData.testCases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay casos de prueba definidos</p>
              <p className="text-sm">Haz clic en "Agregar Caso" para comenzar</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.testCases.map((testCase, index) => (
                <div key={testCase.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Caso de Prueba #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeTestCase(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título del Caso
                      </label>
                      <input
                        type="text"
                        value={testCase.title}
                        onChange={(e) => updateTestCase(index, 'title', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Validar sincronización de datos"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prioridad
                      </label>
                      <select
                        value={testCase.priority}
                        onChange={(e) => updateTestCase(index, 'priority', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      rows={2}
                      value={testCase.description}
                      onChange={(e) => updateTestCase(index, 'description', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe qué se va a probar..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precondiciones
                      </label>
                      <textarea
                        rows={2}
                        value={testCase.preconditions}
                        onChange={(e) => updateTestCase(index, 'preconditions', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Condiciones que deben cumplirse antes de la prueba..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resultado Esperado
                      </label>
                      <textarea
                        rows={2}
                        value={testCase.expectedResult}
                        onChange={(e) => updateTestCase(index, 'expectedResult', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Qué resultado se espera obtener..."
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Pasos a Ejecutar
                      </label>
                      <button
                        type="button"
                        onClick={() => addTestStep(index)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Agregar Paso
                      </button>
                    </div>
                    <div className="space-y-2">
                      {testCase.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 w-8">{stepIndex + 1}.</span>
                          <input
                            type="text"
                            value={step}
                            onChange={(e) => updateTestStep(index, stepIndex, e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Describe el paso..."
                          />
                          {testCase.steps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTestStep(index, stepIndex)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={(e) => handleSubmit(e as any, true)}
            disabled={saving}
            className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Borrador'}</span>
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>{saving ? 'Enviando...' : 'Enviar Solicitud'}</span>
          </button>
        </div>
      </form>

      {/* Modal de carga de documento */}
      {showDocumentUploader && (
        <DocumentUploader
          onDataProcessed={handleDocumentDataProcessed}
          onClose={() => setShowDocumentUploader(false)}
        />
      )}
    </div>
  );
};

export default NewRequest;