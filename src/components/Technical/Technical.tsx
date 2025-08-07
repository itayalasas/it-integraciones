import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Code, 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Save,
  X,
  Calendar,
  User,
  ArrowRight,
  Zap,
  Activity,
  FileText,
  GitBranch
} from 'lucide-react';
import { IntegrationRequest } from '../../types';
import { requestsService } from '../../services/requestsService';
import { systemsService } from '../../services/systemsService';
import { useAuth } from '../../contexts/AuthContext';
import { usersService } from '../../services/usersService';
import { Link } from 'react-router-dom';

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

const Technical: React.FC = () => {
  const [requests, setRequests] = useState<IntegrationRequest[]>([]);
  const [systems, setSystems] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<IntegrationRequest | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusComment, setStatusComment] = useState('');
  const [updating, setUpdating] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);
  const { currentUser } = useAuth();

  // Verificar permisos del usuario
  const isAdmin = usersService.isAdmin(currentUser);
  const isTechnical = usersService.isTechnical(currentUser);

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    if (currentUser && (isAdmin || isTechnical)) {
      loadTechnicalRequests();
      loadSystems();
    } else if (currentUser && !isTechnical && !isAdmin) {
      setLoading(false);
    }
  }, [currentUser]);

  const loadTechnicalRequests = async () => {
    try {
      setLoading(true);
      const allRequests = await requestsService.getRequests();
      // Filtrar solicitudes que están en desarrollo o completadas
      const technicalRequests = allRequests.filter(request => 
        ['approved', 'in_development', 'completed', 'blocked', 'delivered'].includes(request.status)
      );
      setRequests(technicalRequests);
    } catch (error) {
      console.error('Error loading technical requests:', error);
      showNotification(
        'error',
        'Error al cargar solicitudes',
        'No se pudieron cargar las solicitudes técnicas. Intenta recargar la página.'
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

  const handleStatusUpdate = async () => {
    if (!selectedRequest || !currentUser || !newStatus) return;

    setUpdating(true);
    try {
      // Crear entrada en el historial de aprobación
      const approvalEntry = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'status_update' as const,
        comment: statusComment || `Estado actualizado a ${getStatusText(newStatus)}`,
        timestamp: new Date()
      };

      await requestsService.updateRequest(selectedRequest.id, {
        status: newStatus as any,
        approvalHistory: [...(selectedRequest.approvalHistory || []), approvalEntry]
      });

      await loadTechnicalRequests();
      setShowStatusModal(false);
      setSelectedRequest(null);
      setNewStatus('');
      setStatusComment('');
      
      showNotification(
        'success',
        'Estado actualizado',
        `La solicitud "${selectedRequest.title}" ha sido actualizada a ${getStatusText(newStatus)}.`
      );
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification(
        'error',
        'Error al actualizar estado',
        'Hubo un problema al actualizar el estado. Por favor, intenta nuevamente.'
      );
    } finally {
      setUpdating(false);
    }
  };

  const openStatusModal = (request: IntegrationRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setStatusComment('');
    setShowStatusModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in_development': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'approved': 'Aprobada',
      'in_development': 'En Desarrollo',
      'completed': 'Completada',
      'blocked': 'Bloqueada',
      'delivered': 'Entregada'
    };
    return statusMap[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    const priorityMap: { [key: string]: string } = {
      'urgent': 'Urgente',
      'high': 'Alta',
      'medium': 'Media',
      'low': 'Baja'
    };
    return priorityMap[priority] || priority;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'in_development': return Activity;
      case 'completed': return CheckCircle;
      case 'blocked': return AlertCircle;
      case 'delivered': return CheckCircle;
      default: return Clock;
    }
  };

  // Si el usuario no tiene permisos, mostrar mensaje de acceso denegado
  if (!loading && currentUser && !isTechnical && !isAdmin) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Acceso Denegado</p>
        <p className="text-sm text-gray-500">
          No tienes permisos para acceder al panel técnico
        </p>
      </div>
    );
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requesterName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStats = () => {
    return {
      approved: requests.filter(r => r.status === 'approved').length,
      inDevelopment: requests.filter(r => r.status === 'in_development').length,
      completed: requests.filter(r => r.status === 'completed').length,
      blocked: requests.filter(r => r.status === 'blocked').length,
      delivered: requests.filter(r => r.status === 'delivered').length,
      withSprint: requests.filter(r => r.sprintInfo).length,
      withoutSprint: requests.filter(r => r.status === 'approved' && !r.sprintInfo).length
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel técnico...</p>
        </div>
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
            <Code className="h-8 w-8 mr-3 text-orange-600" />
            Panel Técnico
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión técnica de solicitudes en desarrollo y completadas
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg">
          <span className="text-sm font-medium text-orange-800">
            Rol: Técnico
          </span>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aprobadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Desarrollo</p>
              <p className="text-2xl font-bold text-purple-600">{stats.inDevelopment}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bloqueadas</p>
              <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entregadas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.delivered}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Con Sprint</p>
              <p className="text-2xl font-bold text-blue-600">{stats.withSprint}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sin Sprint</p>
              <p className="text-2xl font-bold text-orange-600">{stats.withoutSprint}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Buscar por título, descripción o solicitante..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Todos los estados</option>
              <option value="approved">Aprobadas</option>
              <option value="in_development">En Desarrollo</option>
              <option value="completed">Completadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Solicitudes */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Solicitudes Técnicas ({filteredRequests.length})
          </h2>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No hay solicitudes técnicas</p>
            <p className="text-sm text-gray-500">
              {requests.length === 0 ? 'No hay solicitudes en desarrollo o completadas' : 'No se encontraron solicitudes con los filtros aplicados'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRequests.map((request) => {
              const StatusIcon = getStatusIcon(request.status);
              return (
                <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {request.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          <StatusIcon className="h-3 w-3 inline mr-1" />
                          {getStatusText(request.status)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {getPriorityText(request.priority)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {request.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
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
                            {request.approvedAt ? `Aprobada: ${request.approvedAt.toLocaleDateString()}` : 'Sin fecha'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <GitBranch className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {request.sprintInfo?.sprintName || 'Sin Sprint'}
                          </span>
                        </div>
                      </div>
                      
                      {request.sprintInfo && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              Sprint: {request.sprintInfo.sprintName}
                            </span>
                          </div>
                          {request.sprintInfo.sprintStartDate && request.sprintInfo.sprintEndDate && (
                            <p className="text-sm text-blue-700 mt-1">
                              {request.sprintInfo.sprintStartDate.toLocaleDateString()} - {request.sprintInfo.sprintEndDate.toLocaleDateString()}
                            </p>
                          )}
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
                      
                      <button
                        onClick={() => openStatusModal(request)}
                        className="flex items-center space-x-2 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Actualizar Estado</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Actualización de Estado */}
      {showStatusModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Actualizar Estado Técnico
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Solicitud:</p>
                <p className="font-medium text-gray-900">{selectedRequest.title}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Estado actual:</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                  {getStatusText(selectedRequest.status)}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo Estado *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="approved">Aprobada (Lista para desarrollo)</option>
                  <option value="in_development">En Desarrollo</option>
                  <option value="completed">Completada</option>
                  <option value="blocked">Bloqueada</option>
                  <option value="delivered">Entregada</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentario Técnico
                </label>
                <textarea
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Agrega comentarios sobre el progreso técnico, problemas encontrados, etc..."
                />
              </div>
              
              {newStatus === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>Nota:</strong> Al marcar como completada, la integración se considerará 
                    finalizada y lista para producción.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || !newStatus}
                className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Actualizando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Actualizar Estado</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información sobre el rol técnico */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Code className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Panel Técnico - Gestión de Desarrollo
            </h3>
            <p className="text-gray-700 mb-3">
              Como usuario técnico, puedes gestionar el ciclo de vida de las integraciones desde 
              la aprobación hasta la finalización del desarrollo.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Responsabilidades:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Revisar solicitudes aprobadas</li>
                  <li>• Actualizar estado de desarrollo</li>
                  <li>• Gestionar sprints técnicos</li>
                  <li>• Marcar integraciones como completadas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Estados que puedes gestionar:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• <span className="text-green-600">Aprobada</span>: Lista para desarrollo</li>
                  <li>• <span className="text-purple-600">En Desarrollo</span>: Trabajo en progreso</li>
                  <li>• <span className="text-emerald-600">Completada</span>: Lista para producción</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Technical;