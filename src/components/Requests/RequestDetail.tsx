import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Building, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Edit,
  Save,
  X,
  PlayCircle,
  Zap,
  Loader2,
  Wand2,
  Eye,
  Copy,
  Download,
  Sparkles
} from 'lucide-react';
import { IntegrationRequest } from '../../types';
import { requestsService } from '../../services/requestsService';
import { systemsService } from '../../services/systemsService';
import UserStoryGenerator from './UserStoryGenerator';
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

const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<IntegrationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [systems, setSystems] = useState<{ [key: string]: string }>({});
  const [showSprintEditor, setShowSprintEditor] = useState(false);
  const [sprintData, setSprintData] = useState({
    sprintName: '',
    sprintStartDate: '',
    sprintEndDate: ''
  });
  const [savingSprint, setSavingSprint] = useState(false);
  const [showUserStoryGenerator, setShowUserStoryGenerator] = useState(false);
  const [showUserStoryViewer, setShowUserStoryViewer] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [requestData, systemsList] = await Promise.all([
          requestsService.getRequest(id),
          systemsService.getActiveSystems()
        ]);
        
        setRequest(requestData);
        
        // Convert systems array to map for easy lookup
        const systemsMap = systemsList.reduce((acc, system) => {
          acc[system.id] = system.name;
          return acc;
        }, {} as { [key: string]: string });
        setSystems(systemsMap);
        
        // Initialize sprint data if exists
        if (requestData?.sprintInfo) {
          setSprintData({
            sprintName: requestData.sprintInfo.sprintName,
            sprintStartDate: requestData.sprintInfo.sprintStartDate?.toISOString().split('T')[0] || '',
            sprintEndDate: requestData.sprintInfo.sprintEndDate?.toISOString().split('T')[0] || ''
          });
        }
      } catch (error) {
        console.error('Error loading request:', error);
       showNotification(
         'error',
         'Error al cargar solicitud',
         'No se pudo cargar la información de la solicitud.'
       );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSprintSave = async () => {
    if (!request || !sprintData.sprintName.trim()) return;

    try {
      setSavingSprint(true);
      
      const sprintInfo = {
        sprintName: sprintData.sprintName,
        sprintStartDate: sprintData.sprintStartDate ? new Date(sprintData.sprintStartDate) : undefined,
        sprintEndDate: sprintData.sprintEndDate ? new Date(sprintData.sprintEndDate) : undefined
      };

      await requestsService.updateSprintInfo(request.id, sprintInfo);
      
      // Update local state
      setRequest(prev => prev ? { ...prev, sprintInfo } : null);
      setShowSprintEditor(false);
     
     showNotification(
       'success',
       'Sprint actualizado',
       `El sprint "${sprintData.sprintName}" ha sido asignado exitosamente.`
     );
    } catch (error) {
      console.error('Error saving sprint:', error);
     showNotification(
       'error',
       'Error al guardar sprint',
       'No se pudo guardar la información del sprint. Intenta nuevamente.'
     );
    } finally {
      setSavingSprint(false);
    }
  };

  const handleUserStoryGenerated = async (userStory: string) => {
    if (!request) return;
    
    try {
      await requestsService.updateRequest(request.id, {
        userStoryGenerated: userStory,
        generatedAt: new Date()
      });
      
      // Update local state
      setRequest(prev => prev ? { 
        ...prev, 
        userStoryGenerated: userStory,
        generatedAt: new Date()
      } : null);
      
      setShowUserStoryGenerator(false);
      
      showNotification(
        'success',
        'Historia de usuario generada',
        'La historia ha sido generada y guardada exitosamente.'
      );
    } catch (error) {
      console.error('Error saving user story:', error);
      showNotification(
        'error',
        'Error al guardar historia',
        'No se pudo guardar la historia generada. Intenta nuevamente.'
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_development': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'submitted': return 'Enviada';
      case 'in_review': return 'En Revisión';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'in_development': return 'En Desarrollo';
      case 'completed': return 'Completada';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Solicitud no encontrada</h2>
        <p className="text-gray-600 mb-4">La solicitud que buscas no existe o ha sido eliminada.</p>
        <button
          onClick={() => navigate('/requests')}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a Solicitudes</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Notificación */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/requests')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
            {getStatusText(request.status)}
          </span>
          <span className={`text-sm font-medium ${getPriorityColor(request.priority)}`}>
            {getPriorityText(request.priority)}
          </span>
        </div>
      </div>

      {/* Sprint Info */}
      {request.status === 'approved' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  {request.sprintInfo ? 'Sprint Asignado' : 'Asignar Sprint'}
                </h3>
                {request.sprintInfo ? (
                  <div className="text-sm text-blue-700 mt-1">
                    <p><strong>{request.sprintInfo.sprintName}</strong></p>
                    {request.sprintInfo.sprintStartDate && request.sprintInfo.sprintEndDate && (
                      <p>
                        {request.sprintInfo.sprintStartDate.toLocaleDateString('es-ES')} - {' '}
                        {request.sprintInfo.sprintEndDate.toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-blue-700">Esta solicitud necesita ser asignada a un sprint para comenzar el desarrollo.</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowSprintEditor(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {request.sprintInfo ? <Edit className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
              <span>{request.sprintInfo ? 'Editar Sprint' : 'Asignar Sprint'}</span>
            </button>
          </div>
        </div>
      )}
      {/* Historia de Usuario Generada */}
      {request.status === 'approved' && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wand2 className="h-6 w-6 text-indigo-600" />
              <div>
                <h3 className="text-lg font-semibold text-indigo-900">
                  {request.userStoryGenerated ? 'Historia de Usuario Generada' : 'Generar Historia de Usuario'}
                </h3>
                {request.userStoryGenerated ? (
                  <div className="text-sm text-indigo-700 mt-1">
                    <p>Historia generada el {request.generatedAt?.toLocaleDateString('es-ES')}</p>
                    <p>Lista para copiar en Azure DevOps</p>
                  </div>
                ) : (
                  <p className="text-sm text-indigo-700">
                    Esta solicitud está lista para generar una historia de usuario con IA.
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {request.userStoryGenerated && (
                <button
                  onClick={() => setShowUserStoryViewer(true)}
                  className="flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver Historia</span>
                </button>
              )}
              <button
                onClick={() => setShowUserStoryGenerator(true)}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Wand2 className="h-4 w-4" />
                <span>{request.userStoryGenerated ? 'Regenerar' : 'Generar'} Historia</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información General */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Descripción */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Descripción</h2>
            <p className="text-gray-700 leading-relaxed">{request.description}</p>
          </div>

          {/* Requerimientos Funcionales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Requerimientos Funcionales</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Objetivos de Negocio</h3>
                <p className="text-gray-700">{request.functionalRequirements.businessGoals}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Requerimientos Funcionales</h3>
                <p className="text-gray-700">{request.functionalRequirements.functionalRequirements}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Criterios de Aceptación</h3>
                <p className="text-gray-700">{request.functionalRequirements.acceptanceCriteria}</p>
              </div>
              {request.functionalRequirements.businessRules && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Reglas de Negocio</h3>
                  <p className="text-gray-700">{request.functionalRequirements.businessRules}</p>
                </div>
              )}
            </div>
          </div>

          {/* Requerimientos Técnicos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Requerimientos Técnicos</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Arquitectura</h3>
                <p className="text-gray-700">{request.technicalRequirements.architecture}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Tecnologías</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(request.technicalRequirements.technologies) 
                    ? request.technicalRequirements.technologies.map((tech, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {tech}
                        </span>
                      ))
                    : <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {request.technicalRequirements.technologies}
                      </span>
                  }
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Puntos de Integración</h3>
                <p className="text-gray-700">{request.technicalRequirements.integrationPoints}</p>
              </div>
              {request.technicalRequirements.dataFlow && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Flujo de Datos</h3>
                  <p className="text-gray-700">{request.technicalRequirements.dataFlow}</p>
                </div>
              )}
              {request.technicalRequirements.securityRequirements && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Requerimientos de Seguridad</h3>
                  <p className="text-gray-700">{request.technicalRequirements.securityRequirements}</p>
                </div>
              )}
              {request.technicalRequirements.performanceRequirements && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Requerimientos de Rendimiento</h3>
                  <p className="text-gray-700">{request.technicalRequirements.performanceRequirements}</p>
                </div>
              )}
            </div>
          </div>

          {/* Casos de Prueba */}
          {request.testCases.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Casos de Prueba</h2>
              <div className="space-y-6">
                {request.testCases.map((testCase, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">{testCase.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(testCase.priority)}`}>
                        {getPriorityText(testCase.priority)}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{testCase.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Precondiciones:</h4>
                        <p className="text-gray-600">{testCase.preconditions}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Resultado Esperado:</h4>
                        <p className="text-gray-600">{testCase.expectedResult}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <h4 className="font-medium text-gray-900 mb-1">Pasos:</h4>
                      <ol className="list-decimal list-inside text-gray-600 space-y-1">
                        {testCase.steps.map((step, stepIndex) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Información del Solicitante */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Solicitante</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Solicitante</p>
                  <p className="font-medium text-gray-900">{request.requesterName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Departamento</p>
                  <p className="font-medium text-gray-900">{request.department}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Fecha de Solicitud</p>
                  <p className="font-medium text-gray-900">
                    {request.createdAt.toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              {request.dueDate && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha Límite</p>
                    <p className="font-medium text-gray-900">
                      {request.dueDate.toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              )}
              {request.approvedAt && (
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Aprobación</p>
                    <p className="font-medium text-gray-900">
                      {request.approvedAt.toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sistemas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistemas Involucrados</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Sistema a Integrar</p>
                <p className="font-medium text-gray-900">{systems[request.systemToIntegrate] || request.systemToIntegrate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sistema Origen</p>
                <p className="font-medium text-gray-900">{systems[request.sourceSystem] || request.sourceSystem}</p>
              </div>
              {request.intermediarySystem && (
                <div>
                  <p className="text-sm text-gray-500">Sistema Intermediario</p>
                  <p className="font-medium text-gray-900">{systems[request.intermediarySystem] || request.intermediarySystem}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Sistema Destino</p>
                <p className="font-medium text-gray-900">{systems[request.targetSystem] || request.targetSystem}</p>
              </div>
            </div>
          </div>

          {/* Requerimientos No Funcionales */}
          {Object.values(request.nonFunctionalRequirements).some(value => value) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Requerimientos No Funcionales</h3>
              <div className="space-y-3">
                {request.nonFunctionalRequirements.availability && (
                  <div>
                    <p className="text-sm text-gray-500">Disponibilidad</p>
                    <p className="font-medium text-gray-900">{request.nonFunctionalRequirements.availability}</p>
                  </div>
                )}
                {request.nonFunctionalRequirements.scalability && (
                  <div>
                    <p className="text-sm text-gray-500">Escalabilidad</p>
                    <p className="font-medium text-gray-900">{request.nonFunctionalRequirements.scalability}</p>
                  </div>
                )}
                {request.nonFunctionalRequirements.usability && (
                  <div>
                    <p className="text-sm text-gray-500">Usabilidad</p>
                    <p className="font-medium text-gray-900">{request.nonFunctionalRequirements.usability}</p>
                  </div>
                )}
                {request.nonFunctionalRequirements.reliability && (
                  <div>
                    <p className="text-sm text-gray-500">Confiabilidad</p>
                    <p className="font-medium text-gray-900">{request.nonFunctionalRequirements.reliability}</p>
                  </div>
                )}
                {request.nonFunctionalRequirements.maintenance && (
                  <div>
                    <p className="text-sm text-gray-500">Mantenibilidad</p>
                    <p className="font-medium text-gray-900">{request.nonFunctionalRequirements.maintenance}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor de Sprint */}
      {showSprintEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {request?.sprintInfo ? 'Editar Sprint' : 'Asignar Sprint'}
              </h3>
              <button
                onClick={() => setShowSprintEditor(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Sprint *
                </label>
                <input
                  type="text"
                  value={sprintData.sprintName}
                  onChange={(e) => setSprintData({ ...sprintData, sprintName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Sprint 2024-01, Sprint Q1, etc."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={sprintData.sprintStartDate}
                    onChange={(e) => setSprintData({ ...sprintData, sprintStartDate: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    value={sprintData.sprintEndDate}
                    onChange={(e) => setSprintData({ ...sprintData, sprintEndDate: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min={sprintData.sprintStartDate}
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Si la fecha de inicio es hoy o anterior, 
                  la solicitud cambiará automáticamente a estado "En Desarrollo".
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowSprintEditor(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSprintSave}
                disabled={savingSprint || !sprintData.sprintName.trim()}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingSprint ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Guardar Sprint</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generador de Historia de Usuario */}
      {showUserStoryGenerator && request && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Generar Historia de Usuario con IA
              </h3>
              <button
                onClick={() => setShowUserStoryGenerator(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <UserStoryGenerator 
                request={request} 
                onGenerate={handleUserStoryGenerated}
              />
            </div>
          </div>
        </div>
      )}

      {/* Visor de Historia de Usuario */}
      {showUserStoryViewer && request?.userStoryGenerated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wand2 className="h-6 w-6 text-indigo-600" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Historia de Usuario Generada
                  </h3>
                  <p className="text-sm text-gray-600">
                    Generada el {request.generatedAt?.toLocaleDateString('es-ES')} • Lista para Azure DevOps
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(request.userStoryGenerated!);
                      showNotification(
                        'success',
                        'Historia copiada',
                        'La historia de usuario ha sido copiada al portapapeles.'
                      );
                    } catch (error) {
                      showNotification(
                        'error',
                        'Error al copiar',
                        'No se pudo copiar la historia al portapapeles.'
                      );
                    }
                  }}
                  className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copiar</span>
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([request.userStoryGenerated!], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `historia-usuario-${request.title.replace(/\s+/g, '-').toLowerCase()}.md`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    showNotification(
                      'success',
                      'Archivo descargado',
                      'La historia de usuario ha sido descargada como archivo Markdown.'
                    );
                  }}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Descargar</span>
                </button>
                <button
                  onClick={() => setShowUserStoryViewer(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Historia de Usuario - Formato Markdown</h4>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                    Optimizada para Azure DevOps
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                    {request.userStoryGenerated}
                  </pre>
                </div>
              </div>
              
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">
                      Lista para Azure DevOps
                    </h4>
                    <p className="text-blue-800 mb-3">
                      Esta historia de usuario está optimizada para Azure DevOps Work Items con formato Markdown.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-blue-900 mb-1">✅ Incluye:</h5>
                        <ul className="text-blue-800 space-y-1">
                          <li>• Formato "Como... Quiero... Para..."</li>
                          <li>• Criterios de aceptación detallados</li>
                          <li>• Definición de terminado (DoD)</li>
                          <li>• Casos de prueba estructurados</li>
                          <li>• Información del Sprint</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-blue-900 mb-1">🚀 Instrucciones:</h5>
                        <ul className="text-blue-800 space-y-1">
                          <li>• Copia el contenido completo</li>
                          <li>• Crea un nuevo Work Item en Azure DevOps</li>
                          <li>• Pega en la descripción</li>
                          <li>• El Markdown se renderizará automáticamente</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetail;