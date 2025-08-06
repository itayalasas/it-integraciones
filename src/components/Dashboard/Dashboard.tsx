import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Users,
  GitBranch,
  Activity,
  Wand2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { systemsService } from '../../services/systemsService';
import { requestsService } from '../../services/requestsService';
import { IntegrationRequest } from '../../types';
import { usersService } from '../../services/usersService';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [systems, setSystems] = useState<any>({});
  const [userRequests, setUserRequests] = useState<IntegrationRequest[]>([]);
  const [allRequests, setAllRequests] = useState<IntegrationRequest[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<IntegrationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Verificar permisos del usuario
  const isAdmin = usersService.isAdmin(currentUser);
  const canApprove = usersService.canApprove(currentUser);
  const canCreateRequests = usersService.canCreateRequests(currentUser);
  const isTechnical = usersService.isTechnical(currentUser);

  useEffect(() => {
    loadSystems();
    loadRequests();
  }, [currentUser]);

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

  const loadRequests = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Cargar solicitudes del usuario actual
      const userRequestsList = await requestsService.getRequestsByUser(currentUser.id);
      setUserRequests(userRequestsList);
      
      // Si es admin o aprobador, cargar también todas las solicitudes
      if (isAdmin || canApprove) {
        const allRequestsList = await requestsService.getRequests();
        setAllRequests(allRequestsList);
        
        // Filtrar solicitudes aprobadas pendientes de historia de usuario
        const approved = allRequestsList.filter(request => 
          request.status === 'approved' && !request.userStoryGenerated
        );
        setApprovedRequests(approved);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSystemName = (systemId: string) => {
    return systems[systemId] || systemId;
  };

  // Estadísticas para usuarios regulares (solo sus solicitudes)
  const getUserStats = () => {
    return [
      {
        title: 'Mis Solicitudes',
        value: userRequests.length.toString(),
        change: '+' + userRequests.filter(r => {
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          return r.createdAt >= lastMonth;
        }).length,
        changeType: 'increase',
        icon: FileText,
        color: 'bg-blue-500'
      },
      {
        title: 'Borradores',
        value: userRequests.filter(r => r.status === 'draft').length.toString(),
        change: '0%',
        changeType: 'neutral',
        icon: FileText,
        color: 'bg-yellow-500'
      },
      {
        title: 'En Revisión',
        value: userRequests.filter(r => ['submitted', 'in_review'].includes(r.status)).length.toString(),
        change: '0%',
        changeType: 'neutral',
        icon: Clock,
        color: 'bg-orange-500'
      },
      {
        title: 'Aprobadas',
        value: userRequests.filter(r => r.status === 'approved').length.toString(),
        change: '+' + userRequests.filter(r => r.status === 'approved').length,
        changeType: 'increase',
        icon: CheckCircle,
        color: 'bg-green-500'
      }
    ];
  };

  // Estadísticas para administradores y aprobadores (todas las solicitudes)
  const getAdminStats = () => {
    return [
      {
        title: 'Solicitudes Totales',
        value: allRequests.length.toString(),
        change: '+' + Math.round((allRequests.length / Math.max(allRequests.length - 5, 1)) * 100 - 100) + '%',
        changeType: 'increase',
        icon: FileText,
        color: 'bg-blue-500'
      },
      {
        title: isTechnical ? 'En Desarrollo' : 'Pendientes Aprobación',
        value: isTechnical 
          ? allRequests.filter(r => r.status === 'in_development').length.toString()
          : allRequests.filter(r => ['submitted', 'in_review'].includes(r.status)).length.toString(),
        change: '+5%',
        changeType: 'increase',
        icon: isTechnical ? Activity : Clock,
        color: isTechnical ? 'bg-purple-500' : 'bg-orange-500'
      },
      {
        title: 'Aprobadas',
        value: allRequests.filter(r => r.status === 'approved').length.toString(),
        change: '+8%',
        changeType: 'increase',
        icon: CheckCircle,
        color: 'bg-green-500'
      },
      {
        title: 'Completadas',
        value: allRequests.filter(r => r.status === 'completed').length.toString(),
        change: '+2%',
        changeType: 'increase',
        icon: CheckCircle,
        color: 'bg-emerald-500'
      }
    ];
  };

  // Obtener estadísticas según el rol del usuario
  const stats = (isAdmin || canApprove) ? getAdminStats() : getUserStats();

  // Solicitudes recientes según el rol
  const getRecentRequests = () => {
    if (isAdmin || canApprove) {
      // Para admins/aprobadores: mostrar las últimas solicitudes de todos
      return allRequests.slice(0, 3).map(request => ({
        id: request.id,
        title: request.title,
        status: request.status,
        priority: request.priority,
        requester: request.requesterName,
        createdAt: request.createdAt.toLocaleDateString()
      }));
    } else {
      // Para usuarios regulares: mostrar solo sus solicitudes
      return userRequests.slice(0, 3).map(request => ({
        id: request.id,
        title: request.title,
        status: request.status,
        priority: request.priority,
        requester: 'Tú',
        createdAt: request.createdAt.toLocaleDateString()
      }));
    }
  };

  const recentRequests = getRecentRequests();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_development': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'draft': 'Borrador',
      'submitted': 'Enviada',
      'in_review': 'En Revisión',
      'approved': 'Aprobada',
      'rejected': 'Rechazada',
      'in_development': 'En Desarrollo',
      'completed': 'Completada'
    };
    return statusMap[status] || status;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido, {currentUser?.name}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-2">
              <GitBranch className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                Departamento: {currentUser?.department}
              </span>
            </div>
          </div>
          {(isAdmin || canApprove) && (
            <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-blue-800">
                {isAdmin ? 'Administrador' : 'Aprobador'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-2">vs mes anterior</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {(isAdmin || canApprove) ? 'Solicitudes Recientes' : 'Mis Solicitudes Recientes'}
          </h2>
        </div>
        <div className="p-6">
          {recentRequests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No hay solicitudes</p>
              <p className="text-sm text-gray-500">
                {canCreateRequests ? 'Crea tu primera solicitud de integración' : 'No tienes solicitudes registradas'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{request.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Solicitado por {request.requester} • {request.createdAt}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {getPriorityText(request.priority)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 text-center">
            <Link 
              to="/requests" 
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {(isAdmin || canApprove) ? 'Ver todas las solicitudes' : 'Ver mis solicitudes'} →
            </Link>
          </div>
        </div>
      </div>

      {/* Solicitudes Aprobadas Pendientes de Historia de Usuario - Solo para Admins/Aprobadores */}
      {(canApprove || isAdmin) && approvedRequests.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Wand2 className="h-5 w-5 mr-2 text-indigo-600" />
                Solicitudes Listas para Historia de Usuario
              </h2>
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                {approvedRequests.length} pendientes
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {approvedRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{request.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {getSystemName(request.sourceSystem)} → {getSystemName(request.targetSystem)}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Aprobada: {request.approvedAt?.toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Solicitante: {request.requesterName}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/requests/${request.id}`}
                      className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Wand2 className="h-4 w-4" />
                      <span>Generar Historia</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {approvedRequests.length > 5 && (
              <div className="mt-4 text-center">
                <Link 
                  to="/approved-requests" 
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  Ver todas las solicitudes aprobadas ({approvedRequests.length}) →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            {canCreateRequests && (
              <>
                <Link
                  to="/requests/new"
                  className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                >
                  Nueva Solicitud de Integración
                </Link>
                <Link
                  to="/requests"
                  className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
                >
                  Ver Mis Solicitudes
                </Link>
              </>
            )}
            {(canApprove || isAdmin) && (
              <>
                <Link
                  to="/approvals"
                  className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors text-center"
                >
                  Revisar Aprobaciones
                </Link>
                <Link
                  to="/approved-requests"
                  className="block w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center"
                >
                  Generar Historias de Usuario
                </Link>
              </>
            )}
            {isTechnical && (
              <Link
                to="/technical"
                className="block w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors text-center"
              >
                Panel Técnico
              </Link>
            )}
            {!canCreateRequests && !(canApprove || isAdmin) && (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No tienes permisos para realizar acciones</p>
                <p className="text-xs mt-1">Contacta al administrador si necesitas acceso</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            {isAdmin || canApprove || isTechnical ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">
                    {isTechnical ? 'Integración completada' : 'Solicitud aprobada recientemente'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">
                    {isTechnical ? 'Desarrollo en progreso' : 'Nueva solicitud recibida'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">
                    {isTechnical ? 'Sprint asignado' : 'Solicitud en desarrollo'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">Tu solicitud fue enviada</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">Solicitud en revisión</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">Solicitud aprobada</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;