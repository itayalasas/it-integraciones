import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  MessageSquare,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react';
import { IntegrationRequest } from '../../types';
import { requestsService } from '../../services/requestsService';
import { useAuth } from '../../contexts/AuthContext';
import { systemsService } from '../../services/systemsService';
import { usersService } from '../../services/usersService';

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

const ApprovalsList: React.FC = () => {
  const [requests, setRequests] = useState<IntegrationRequest[]>([]);
  const [systems, setSystems] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<IntegrationRequest | null>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [sprintData, setSprintData] = useState({
    sprintName: '',
    sprintStartDate: '',
    sprintEndDate: ''
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);
  const [processingApproval, setProcessingApproval] = useState(false);
  const { currentUser } = useAuth();

  // Verificar permisos del usuario
  const isAdmin = usersService.isAdmin(currentUser);
  const canApprove = usersService.canApprove(currentUser);

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    if (currentUser && (isAdmin || canApprove)) {
      loadPendingApprovals();
      loadSystems();
    } else if (currentUser && !canApprove && !isAdmin) {
      setLoading(false);
    }
  }, []);

  const loadPendingApprovals = async () => {
    try {
      setLoading(true);
      const pendingRequests = await requestsService.getPendingApprovals();
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Error loading pending approvals:', error);
      showNotification(
        'error',
        'Error al cargar solicitudes',
        'No se pudieron cargar las solicitudes pendientes. Intenta recargar la página.'
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

  const handleApprovalAction = async () => {
    if (!selectedRequest || !currentUser) return;

    setProcessingApproval(true);
    try {
      const sprintInfo = sprintData.sprintName ? {
        sprintName: sprintData.sprintName,
        sprintStartDate: sprintData.sprintStartDate ? new Date(sprintData.sprintStartDate) : undefined,
        sprintEndDate: sprintData.sprintEndDate ? new Date(sprintData.sprintEndDate) : undefined
      } : {};

      if (approvalAction === 'approve') {
        await requestsService.approveRequest(
          selectedRequest.id,
          currentUser.id,
          currentUser.name,
          approvalComment,
          sprintInfo
        );
      } else {
        await requestsService.rejectRequest(
          selectedRequest.id,
          currentUser.id,
          currentUser.name,
          approvalComment,
          sprintInfo
        );
      }

      await loadPendingApprovals();
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setApprovalComment('');
      setSprintData({ sprintName: '', sprintStartDate: '', sprintEndDate: '' });
      
      showNotification(
        'success',
        `Solicitud ${approvalAction === 'approve' ? 'aprobada' : 'rechazada'}`,
        `La solicitud "${selectedRequest.title}" ha sido ${approvalAction === 'approve' ? 'aprobada' : 'rechazada'} exitosamente.`
      );
    } catch (error) {
      console.error('Error processing approval:', error);
      showNotification(
        'error',
        'Error al procesar aprobación',
        'Hubo un problema al procesar la aprobación. Por favor, intenta nuevamente.'
      );
    } finally {
      setProcessingApproval(false);
    }
  };

  const openApprovalModal = (request: IntegrationRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setSprintData({ sprintName: '', sprintStartDate: '', sprintEndDate: '' });
    setShowApprovalModal(true);
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

  // Si el usuario no tiene permisos, mostrar mensaje de acceso denegado
  if (!loading && currentUser && !canApprove && !isAdmin) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Acceso Denegado</p>
        <p className="text-sm text-gray-500">
          No tienes permisos para acceder a las aprobaciones
        </p>
      </div>
    );
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requesterName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    
    return matchesSearch && matchesPriority;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aprobaciones...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Aprobaciones</h1>
          <p className="text-gray-600 mt-1">
            Solicitudes pendientes de aprobación
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
          <span className="text-sm text-gray-600">
            {filteredRequests.length} solicitudes pendientes
          </span>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Buscar por título, descripción o solicitante..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las prioridades</option>
              <option value="urgent">Urgente</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Solicitudes */}
      <div className="bg-white rounded-xl shadow-sm border">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No hay solicitudes pendientes</p>
            <p className="text-sm text-gray-500">
              {requests.length === 0 ? 'Todas las solicitudes han sido procesadas' : 'No se encontraron solicitudes con los filtros aplicados'}
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                        {getPriorityText(request.priority)}
                      </span>
                      {request.dueDate && new Date(request.dueDate) < new Date() && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          Vencida
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {request.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Solicitante</p>
                        <p className="text-sm font-medium text-gray-900">{request.requesterName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Departamento</p>
                        <p className="text-sm font-medium text-gray-900">{request.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Sistema</p>
                        <p className="text-sm font-medium text-gray-900">{getSystemName(request.systemToIntegrate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Creada: {request.createdAt.toLocaleDateString()}</span>
                      {request.dueDate && (
                        <>
                          <span>•</span>
                          <span>Vence: {request.dueDate.toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/requests/${request.id}`}
                      className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver</span>
                    </Link>
                    
                    <button
                      onClick={() => openApprovalModal(request, 'approve')}
                      className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Aprobar</span>
                    </button>
                    
                    <button
                      onClick={() => openApprovalModal(request, 'reject')}
                      className="flex items-center space-x-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Rechazar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Aprobación */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {approvalAction === 'approve' ? 'Aprobar' : 'Rechazar'} Solicitud
            </h3>
            
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que quieres {approvalAction === 'approve' ? 'aprobar' : 'rechazar'} la solicitud "{selectedRequest.title}"?
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario {approvalAction === 'reject' ? '(requerido)' : '(opcional)'}
              </label>
              <textarea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Agrega un comentario sobre la ${approvalAction === 'approve' ? 'aprobación' : 'razón del rechazo'}...`}
                required={approvalAction === 'reject'}
              />
            </div>
            
            {approvalAction === 'approve' && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-3">
                  Información del Sprint (Opcional)
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Sprint
                    </label>
                    <input
                      type="text"
                      value={sprintData.sprintName}
                      onChange={(e) => setSprintData({ ...sprintData, sprintName: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Sprint 2024-01, Sprint Q1, etc."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Inicio
                      </label>
                      <input
                        type="date"
                        value={sprintData.sprintStartDate}
                        onChange={(e) => setSprintData({ ...sprintData, sprintStartDate: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Fin
                      </label>
                      <input
                        type="date"
                        value={sprintData.sprintEndDate}
                        onChange={(e) => setSprintData({ ...sprintData, sprintEndDate: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min={sprintData.sprintStartDate}
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-blue-700">
                    Esta información será incluida en los reportes y ayudará a planificar el desarrollo.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleApprovalAction}
                disabled={approvalAction === 'reject' && !approvalComment.trim()}
                disabled={processingApproval}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  approvalAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processingApproval ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Procesando...</span>
                  </>
                ) : approvalAction === 'approve' ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Aprobar</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    <span>Rechazar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalsList;