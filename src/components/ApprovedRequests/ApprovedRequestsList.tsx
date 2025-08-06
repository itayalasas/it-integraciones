import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wand2, 
  Eye,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  FileText,
  Calendar,
  User,
  AlertCircle,
  X
} from 'lucide-react';
import { IntegrationRequest } from '../../types';
import { requestsService } from '../../services/requestsService';
import { systemsService } from '../../services/systemsService';

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

const ApprovedRequestsList: React.FC = () => {
  const [requests, setRequests] = useState<IntegrationRequest[]>([]);
  const [systems, setSystems] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending' | 'generated' | 'all'
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
    loadApprovedRequests();
    loadSystems();
  }, []);

  const loadApprovedRequests = async () => {
    try {
      setLoading(true);
      const allRequests = await requestsService.getRequests();
      const approvedRequests = allRequests.filter(request => request.status === 'approved');
      setRequests(approvedRequests);
    } catch (error) {
      console.error('Error loading approved requests:', error);
      showNotification(
        'error',
        'Error al cargar solicitudes',
        'No se pudieron cargar las solicitudes aprobadas. Intenta recargar la página.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSystems = async () => {
    try {
      const systemsList = await systemsService.getActiveSystems();
      const systemsMap = systemsList.reduce((acc, system) => {
        acc[system.id] = system.name;
        return acc;
      }, {} as any);
      setSystems(systemsMap);
    } catch (error) {
      console.error('Error loading systems:', error);
    }
  };

  const getSystemName = (systemId: string) => {
    return systems[systemId] || systemId;
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requesterName.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'pending') {
      matchesStatus = !request.userStoryGenerated;
    } else if (statusFilter === 'generated') {
      matchesStatus = !!request.userStoryGenerated;
    }
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(r => !r.userStoryGenerated).length;
  const generatedCount = requests.filter(r => r.userStoryGenerated).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Wand2 className="h-8 w-8 mr-3 text-indigo-600" />
            Historias de Usuario
          </h1>
          <p className="text-gray-600 mt-1">
            Solicitudes aprobadas listas para generar historias de usuario con IA
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
            <span className="text-sm text-gray-600">
              {pendingCount} pendientes • {generatedCount} generadas
            </span>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Aprobadas</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes de Historia</p>
              <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Historias Generadas</p>
              <p className="text-2xl font-bold text-indigo-600">{generatedCount}</p>
            </div>
            <Sparkles className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Buscar por título, descripción o solicitante..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado de Historia
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="pending">Pendientes de generar</option>
              <option value="generated">Ya generadas</option>
              <option value="all">Todas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Solicitudes */}
      <div className="bg-white rounded-xl shadow-sm border">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <Wand2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No hay solicitudes</p>
            <p className="text-sm text-gray-500">
              {requests.length === 0 ? 'No hay solicitudes aprobadas' : 'No se encontraron solicitudes con los filtros aplicados'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {request.title}
                      </h3>
                      {request.userStoryGenerated ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          <Sparkles className="h-3 w-3 inline mr-1" />
                          Historia Generada
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Pendiente
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {request.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {getSystemName(request.sourceSystem)} → {getSystemName(request.targetSystem)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{request.requesterName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Aprobada: {request.approvedAt?.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {request.userStoryGenerated && request.generatedAt && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm font-medium text-indigo-800">
                            Historia generada el {request.generatedAt.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-indigo-700 mt-1">
                          Lista para copiar en Azure DevOps
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/requests/${request.id}`}
                      className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver Detalle</span>
                    </Link>
                    
                    <Link
                      to={`/requests/${request.id}`}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        request.userStoryGenerated
                          ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      <Wand2 className="h-4 w-4" />
                      <span>
                        {request.userStoryGenerated ? 'Ver/Editar Historia' : 'Generar Historia'}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información sobre IA */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Sparkles className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Generación Automática con Inteligencia Artificial
            </h3>
            <p className="text-gray-700 mb-3">
              Nuestro sistema utiliza IA para generar historias de usuario completas basadas en los requerimientos 
              funcionales, técnicos y casos de prueba de cada solicitud aprobada.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Incluye automáticamente:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Criterios de aceptación detallados</li>
                  <li>• Definición de terminado (DoD)</li>
                  <li>• Casos de prueba estructurados</li>
                  <li>• Requerimientos técnicos y no funcionales</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Formato optimizado para:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Azure DevOps Work Items</li>
                  <li>• Metodologías ágiles</li>
                  <li>• Documentación técnica</li>
                  <li>• Exportación directa</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovedRequestsList;