import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { systemsService } from '../../services/systemsService';
import { requestsService } from '../../services/requestsService';
import { 
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  FileText,
  Building,
  Save,
  Edit,
  Clock,
  Image,
  Database,
  Server,
  Paperclip,
} from 'lucide-react';
import { TestCase, System, Document } from '../../types';
import { documentsService } from '../../services/documentsService';
import { departmentsService } from '../../services/departmentsService';

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

interface FormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  
  // Información de sistemas
  systemToIntegrate: string;
  sourceSystem: string;
  targetSystem: string;
  intermediarySystem: string;
  
  // Requerimientos funcionales
  businessGoals: string;
  functionalRequirements: string;
  acceptanceCriteria: string;
  businessRules: string;
  
  // Requerimientos técnicos
  architecture: string;
  technologies: string;
  integrationPoints: string;
  dataFlow: string;
  securityRequirements: string;
  performanceRequirements: string;
  serviceUrl: string;
  credentials: string;
  
  // Requerimientos no funcionales
  availability: string;
  scalability: string;
  usability: string;
  reliability: string;
  maintenance: string;
}

const NewRequest: React.FC = () => {
  const [activeTab, setActiveTab] = useState('functional');
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [architectureDiagram, setArchitectureDiagram] = useState<string | null>(null);
  const [availableSystems, setAvailableSystems] = useState<System[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>();

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Función para validar campos obligatorios y navegar al tab correspondiente
  const validateAndNavigateToErrors = (data: FormData) => {
    const requiredFields = [
      // Información general
      { field: 'title', tab: 'functional', label: 'Título de la Solicitud' },
      { field: 'description', tab: 'functional', label: 'Descripción' },
      { field: 'priority', tab: 'functional', label: 'Prioridad' },
      { field: 'systemToIntegrate', tab: 'functional', label: 'Sistema a Integrar' },
      { field: 'sourceSystem', tab: 'functional', label: 'Sistema Origen' },
      { field: 'targetSystem', tab: 'functional', label: 'Sistema Destino' },
      
      // Requerimientos funcionales
      { field: 'businessGoals', tab: 'functional', label: 'Objetivos del Negocio' },
      { field: 'functionalRequirements', tab: 'functional', label: 'Requerimientos Funcionales' },
      { field: 'acceptanceCriteria', tab: 'functional', label: 'Criterios de Aceptación' },
      
      // Requerimientos técnicos
      { field: 'architecture', tab: 'technical', label: 'Arquitectura' },
      { field: 'technologies', tab: 'technical', label: 'Tecnologías' },
      { field: 'integrationPoints', tab: 'technical', label: 'Puntos de Integración' }
    ];

    const missingFields: { field: string; tab: string; label: string }[] = [];

    requiredFields.forEach(({ field, tab, label }) => {
      const value = (data as any)[field];
      if (!value || (typeof value === 'string' && !value.trim())) {
        missingFields.push({ field, tab, label });
      }
    });

    if (missingFields.length > 0) {
      // Navegar al primer tab con errores
      const firstErrorTab = missingFields[0].tab;
      setActiveTab(firstErrorTab);
      
      // Mostrar notificación con los campos faltantes
      const fieldsList = missingFields.map(f => f.label).join(', ');
      showNotification(
        'warning',
        'Campos obligatorios faltantes',
        `Por favor completa los siguientes campos: ${fieldsList}`
      );
      
      return false;
    }

    return true;
  };

  React.useEffect(() => {
    loadSystems();
    loadDepartments();
  }, []);

  const loadSystems = async () => {
    try {
      await systemsService.initializeDefaultSystems();
      const systems = await systemsService.getActiveSystems();
      setAvailableSystems(systems);
    } catch (error) {
      console.error('Error loading systems:', error);
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

  const tabs = [
    { id: 'functional', name: 'Funcionales', icon: FileText },
    { id: 'technical', name: 'Técnicos', icon: Code },
    { id: 'non-functional', name: 'No Funcionales', icon: Settings },
    { id: 'testing', name: 'Casos de Prueba', icon: TestTube },
    { id: 'documents', name: 'Documentos', icon: Paperclip }
  ];

  const getSystemIcon = (type: string) => {
    switch (type) {
      case 'cloud': return Cloud;
      case 'legacy': return Database;
      case 'external': return Zap;
      default: return Server;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setArchitectureDiagram(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Por favor selecciona un archivo de imagen');
      }
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
    setTestCases([...testCases, newTestCase]);
  };

  const removeTestCase = (id: string) => {
    setTestCases(testCases.filter(tc => tc.id !== id));
  };

  const updateTestCase = (id: string, field: string, value: any) => {
    setTestCases(testCases.map(tc => 
      tc.id === id ? { ...tc, [field]: value } : tc
    ));
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !currentUser) return;

    setUploadingDocument(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Validar tamaño (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`);
          continue;
        }
        
        const document = await documentsService.uploadDocument(file, 'temp', currentUser.id);
        setDocuments(prev => [...prev, document]);
      }
      showNotification(
        'success',
        'Documentos subidos exitosamente',
        `Se ${files.length === 1 ? 'subió' : 'subieron'} ${files.length} documento${files.length === 1 ? '' : 's'} correctamente.`
      );
    } catch (error) {
      console.error('Error uploading document:', error);
      showNotification(
        'error',
        'Error al subir documentos',
        'Hubo un problema al subir los documentos. Verifica el tamaño y formato.'
      );
    } finally {
      setUploadingDocument(false);
      if (documentInputRef.current) {
        documentInputRef.current.value = '';
      }
    }
  };

  const removeDocument = async (documentId: string) => {
    try {
      const document = documents.find(doc => doc.id === documentId);
      if (document) {
        await documentsService.deleteDocument(document.url);
        setDocuments(documents.filter(doc => doc.id !== documentId));
        showNotification(
          'info',
          'Documento eliminado',
          'El documento ha sido eliminado de la solicitud.'
        );
      }
    } catch (error) {
      console.error('Error removing document:', error);
      showNotification(
        'error',
        'Error al eliminar documento',
        'No se pudo eliminar el documento. Intenta nuevamente.'
      );
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!currentUser) return;

    // Validar campos obligatorios antes de enviar
    if (!validateAndNavigateToErrors(data)) {
      return;
    }
    
    setLoading(true);
    try {
      const requestData = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        systemToIntegrate: data.systemToIntegrate,
        sourceSystem: data.sourceSystem,
        targetSystem: data.targetSystem,
        intermediarySystem: data.intermediarySystem,
        architectureDiagram,
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        department: currentUser.department || departments.find(d => d.name === 'IT')?.name || 'IT',
        status: 'submitted' as const,
        functionalRequirements: {
          businessGoals: data.businessGoals,
          functionalRequirements: data.functionalRequirements,
          acceptanceCriteria: data.acceptanceCriteria,
          businessRules: data.businessRules
        },
        technicalRequirements: {
          architecture: data.architecture,
          technologies: data.technologies,
          integrationPoints: data.integrationPoints,
          dataFlow: data.dataFlow,
          securityRequirements: data.securityRequirements,
          performanceRequirements: data.performanceRequirements,
          serviceUrl: data.serviceUrl,
          credentials: data.credentials ? btoa(data.credentials) : '' // Encriptar credenciales con base64
        },
        nonFunctionalRequirements: {
          availability: data.availability,
          scalability: data.scalability,
          usability: data.usability,
          reliability: data.reliability,
          maintenance: data.maintenance
        },
        testCases,
        documents,
        approvalHistory: []
      };
      
      await requestsService.createRequest(requestData);
      
      showNotification(
        'success',
        '¡Solicitud enviada exitosamente!',
        'Tu solicitud ha sido enviada y está siendo revisada por el equipo de aprobaciones.'
      );
      
      // Redirigir después de un breve delay para que el usuario vea la notificación
      setTimeout(() => {
        navigate('/requests');
      }, 2000);
    } catch (error) {
      console.error('Error saving request:', error);
      showNotification(
        'error',
        'Error al guardar la solicitud',
        'Hubo un problema al enviar tu solicitud. Por favor, intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
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
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Selección de Sistema a Integrar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Database className="h-6 w-6 mr-2 text-blue-600" />
            Sistema a Integrar
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selecciona el sistema principal que necesita integración *
            </label>
            <select
              {...register('systemToIntegrate', { required: 'Debes seleccionar un sistema' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecciona un sistema...</option>
              {availableSystems.map((system) => {
                const Icon = getSystemIcon(system.type);
                return (
                  <option key={system.id} value={system.id}>
                    {system.name} - {system.description}
                  </option>
                );
              })}
            </select>
            {errors.systemToIntegrate && (
              <p className="mt-1 text-sm text-red-600">{errors.systemToIntegrate.message}</p>
            )}
          </div>
        </div>

        {/* Información General */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Información General</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Solicitud *
              </label>
              <input
                type="text"
                {...register('title', { required: 'El título es requerido' })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Ej: Integración entre SAP ERP y Salesforce CRM"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                {...register('description', { required: 'La descripción es requerida' })}
                rows={4}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Describe el propósito y alcance de la integración..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad *
              </label>
              <select
                {...register('priority', { required: 'La prioridad es requerida' })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.priority ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona una prioridad</option>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.priority.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Límite
              </label>
              <input
                type="date"
                {...register('dueDate')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Arquitectura de Integración */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <ArrowRight className="h-6 w-6 mr-2 text-green-600" />
            Arquitectura de Integración
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sistema Origen *
              </label>
              <select
                {...register('sourceSystem', { required: 'Selecciona el sistema origen' })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.sourceSystem ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona sistema origen...</option>
                {availableSystems.map((system) => (
                  <option key={system.id} value={system.id}>
                    {system.name}
                  </option>
                ))}
              </select>
              {errors.sourceSystem && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.sourceSystem.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sistema Intermediario (Opcional)
              </label>
              <select
                {...register('intermediarySystem')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sin intermediario...</option>
                {availableSystems.map((system) => (
                  <option key={system.id} value={system.id}>
                    {system.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sistema Destino *
              </label>
              <select
                {...register('targetSystem', { required: 'Selecciona el sistema destino' })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.targetSystem ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona sistema destino...</option>
                {availableSystems.map((system) => (
                  <option key={system.id} value={system.id}>
                    {system.name}
                  </option>
                ))}
              </select>
              {errors.targetSystem && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.targetSystem.message}
                </p>
              )}
            </div>
          </div>

          {/* Diagrama de Arquitectura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagrama de Arquitectura
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {architectureDiagram ? (
                <div className="space-y-4">
                  <img 
                    src={architectureDiagram} 
                    alt="Diagrama de arquitectura" 
                    className="max-w-full h-auto rounded-lg shadow-sm"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Diagrama cargado exitosamente</p>
                    <button
                      type="button"
                      onClick={() => setArchitectureDiagram(null)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Sube un diagrama de la arquitectura propuesta</p>
                  <p className="text-sm text-gray-500 mb-4">PNG, JPG, SVG hasta 5MB</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Subir Diagrama</span>
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Tabs para Requerimientos */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            <div className="space-y-6" style={{ display: activeTab === 'functional' ? 'block' : 'none' }}>
                <h3 className="text-lg font-semibold text-gray-900">Requerimientos Funcionales</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objetivos del Negocio *
                  </label>
                  <textarea
                    {...register('businessGoals', { required: 'Los objetivos son requeridos' })}
                    rows={3}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.businessGoals ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Describe los objetivos de negocio que debe cumplir la integración..."
                  />
                  {errors.businessGoals && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.businessGoals.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requerimientos Funcionales *
                  </label>
                  <textarea
                    {...register('functionalRequirements', { required: 'Los requerimientos funcionales son requeridos' })}
                    rows={4}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.functionalRequirements ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Describe los requerimientos funcionales específicos que debe cumplir la integración..."
                  />
                  {errors.functionalRequirements && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.functionalRequirements.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Criterios de Aceptación *
                  </label>
                  <textarea
                    {...register('acceptanceCriteria', { required: 'Los criterios son requeridos' })}
                    rows={4}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.acceptanceCriteria ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Dado que [contexto], cuando [acción], entonces [resultado]..."
                  />
                  {errors.acceptanceCriteria && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.acceptanceCriteria.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reglas de Negocio
                  </label>
                  <textarea
                    {...register('businessRules')}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Especifica las reglas de negocio que deben cumplirse..."
                  />
                </div>
            </div>

            <div className="space-y-6" style={{ display: activeTab === 'technical' ? 'block' : 'none' }}>
                <h3 className="text-lg font-semibold text-gray-900">Requerimientos Técnicos</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arquitectura *
                  </label>
                  <textarea
                    {...register('architecture', { required: 'La arquitectura es requerida' })}
                    rows={3}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.architecture ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Describe la arquitectura propuesta..."
                  />
                  {errors.architecture && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.architecture.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tecnologías *
                  </label>
                  <textarea
                    {...register('technologies', { required: 'Las tecnologías son requeridas' })}
                    rows={3}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.technologies ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Lista las tecnologías, frameworks, y herramientas necesarias..."
                  />
                  {errors.technologies && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.technologies.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Puntos de Integración *
                  </label>
                  <textarea
                    {...register('integrationPoints', { required: 'Los puntos de integración son requeridos' })}
                    rows={3}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.integrationPoints ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Describe los sistemas y APIs que se conectarán..."
                  />
                  {errors.integrationPoints && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.integrationPoints.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flujo de Datos
                  </label>
                  <textarea
                    {...register('dataFlow')}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe cómo fluirán los datos entre sistemas..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requerimientos de Seguridad
                  </label>
                  <textarea
                    {...register('securityRequirements')}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Especifica los requerimientos de seguridad..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requerimientos de Rendimiento
                  </label>
                  <textarea
                    {...register('performanceRequirements')}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Especifica los requerimientos de rendimiento..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL del Servicio (Opcional)
                  </label>
                  <input
                    type="url"
                    {...register('serviceUrl')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://api.ejemplo.com/endpoint"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    URL del servicio web o API que se va a consumir
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credenciales (Opcional)
                  </label>
                  <textarea
                    {...register('credentials')}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Usuario/contraseña, token, API key, etc."
                  />
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Información Sensible</p>
                        <p className="text-sm text-amber-700">
                          Esta información será encriptada automáticamente y solo será visible en el detalle de la solicitud.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
            </div>

            <div className="space-y-6" style={{ display: activeTab === 'non-functional' ? 'block' : 'none' }}>
                <h3 className="text-lg font-semibold text-gray-900">Requerimientos No Funcionales</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disponibilidad
                  </label>
                  <textarea
                    {...register('availability')}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: 99.9% de disponibilidad, 24/7..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escalabilidad
                  </label>
                  <textarea
                    {...register('scalability')}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe los requerimientos de escalabilidad..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usabilidad
                  </label>
                  <textarea
                    {...register('usability')}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe los requerimientos de usabilidad..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confiabilidad
                  </label>
                  <textarea
                    {...register('reliability')}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe los requerimientos de confiabilidad..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mantenibilidad
                  </label>
                  <textarea
                    {...register('maintenance')}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe los requerimientos de mantenimiento..."
                  />
                </div>
            </div>

            <div className="space-y-6" style={{ display: activeTab === 'testing' ? 'block' : 'none' }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Casos de Prueba</h3>
                  <button
                    type="button"
                    onClick={addTestCase}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar Caso</span>
                  </button>
                </div>

                {testCases.length === 0 ? (
                  <div className="text-center py-8">
                    <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay casos de prueba definidos</p>
                    <p className="text-sm text-gray-500">Haz clic en "Agregar Caso" para comenzar</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {testCases.map((testCase, index) => (
                      <div key={testCase.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">Caso de Prueba #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeTestCase(testCase.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Título
                            </label>
                            <input
                              type="text"
                              value={testCase.title}
                              onChange={(e) => updateTestCase(testCase.id, 'title', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Título del caso de prueba"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Prioridad
                            </label>
                            <select
                              value={testCase.priority}
                              onChange={(e) => updateTestCase(testCase.id, 'priority', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="low">Baja</option>
                              <option value="medium">Media</option>
                              <option value="high">Alta</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción
                          </label>
                          <textarea
                            value={testCase.description}
                            onChange={(e) => updateTestCase(testCase.id, 'description', e.target.value)}
                            rows={2}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Describe el caso de prueba"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Precondiciones
                            </label>
                            <textarea
                              value={testCase.preconditions}
                              onChange={(e) => updateTestCase(testCase.id, 'preconditions', e.target.value)}
                              rows={2}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Condiciones previas necesarias"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Resultado Esperado
                            </label>
                            <textarea
                              value={testCase.expectedResult}
                              onChange={(e) => updateTestCase(testCase.id, 'expectedResult', e.target.value)}
                              rows={2}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Resultado esperado del caso"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            <div className="space-y-6" style={{ display: activeTab === 'documents' ? 'block' : 'none' }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Documentos Adjuntos</h3>
                  <button
                    type="button"
                    onClick={() => documentInputRef.current?.click()}
                    disabled={uploadingDocument}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingDocument ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Subir Documentos</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  ref={documentInputRef}
                  type="file"
                  multiple
                  onChange={handleDocumentUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Tipos de archivo permitidos
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        PDF, Word, Excel, PowerPoint, imágenes (JPG, PNG, GIF), archivos de texto. Máximo 10MB por archivo.
                      </p>
                    </div>
                  </div>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <Paperclip className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay documentos adjuntos</p>
                    <p className="text-sm text-gray-500">Haz clic en "Subir Documentos" para agregar archivos</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((document) => (
                      <div key={document.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {documentsService.getFileIcon(document.type)}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">{document.name}</p>
                            <p className="text-sm text-gray-500">
                              {documentsService.formatFileSize(document.size)} • 
                              Subido el {document.uploadedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a
                            href={document.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <Download className="h-4 w-4" />
                            <span>Descargar</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => removeDocument(document.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={loading}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
          >
            <Save className="h-4 w-4" />
            <span>Guardar Borrador</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => navigate('/requests')}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Enviar Solicitud</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewRequest;