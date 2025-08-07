import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  Calendar,
  Filter,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Search,
  Wand2
} from 'lucide-react';
import { IntegrationRequest } from '../../types';
import { requestsService } from '../../services/requestsService';
import { reportsService } from '../../services/reportsService';
import { systemsService } from '../../services/systemsService';
import { pdfReportService } from '../../services/pdfReportService';

const Reports: React.FC = () => {
  const [requests, setRequests] = useState<IntegrationRequest[]>([]);
  const [systems, setSystems] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sprintFilter, setSprintFilter] = useState('all'); // 'all' | 'with-sprint' | 'without-sprint'
  const [userStoryFilter, setUserStoryFilter] = useState('all'); // 'all' | 'generated' | 'pending'

  useEffect(() => {
    loadRequests();
    loadSystems();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const requestsList = await requestsService.getRequests();
      setRequests(requestsList);
    } catch (error) {
      console.error('Error loading requests:', error);
      alert('Error al cargar las solicitudes');
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

  const handleExportToExcel = async () => {
    setExporting(true);
    try {
      const filteredRequests = getFilteredRequests();
      await reportsService.exportToExcel(filteredRequests, systems);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error al exportar a Excel');
    } finally {
      setExporting(false);
    }
  };

  const handleExportToPdf = async () => {
    setExportingPdf(true);
    try {
      const filteredRequests = getFilteredRequests();
      await pdfReportService.generateExecutiveReport(filteredRequests, systems);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Error al exportar a PDF');
    } finally {
      setExportingPdf(false);
    }
  };

  const getFilteredRequests = () => {
    return requests.filter(request => {
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || request.department === departmentFilter;
      
      // Filtro de Sprint
      let matchesSprint = true;
      if (sprintFilter === 'with-sprint') {
        matchesSprint = !!request.sprintInfo;
      } else if (sprintFilter === 'without-sprint') {
        matchesSprint = !request.sprintInfo;
      }
      
      // Filtro de Historia de Usuario
      let matchesUserStory = true;
      if (userStoryFilter === 'generated') {
        matchesUserStory = !!request.userStoryGenerated;
      } else if (userStoryFilter === 'pending') {
        matchesUserStory = request.status === 'approved' && !request.userStoryGenerated;
      }
      
      let matchesDateRange = true;
      if (dateRange.startDate && dateRange.endDate) {
        const requestDate = request.createdAt;
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        matchesDateRange = requestDate >= startDate && requestDate <= endDate;
      }
      
      return matchesStatus && matchesDepartment && matchesSprint && matchesUserStory && matchesDateRange;
    });
  };

  const getStats = () => {
    const filteredRequests = getFilteredRequests();
    
    return {
      total: filteredRequests.length,
      approved: filteredRequests.filter(r => r.status === 'approved').length,
      pending: filteredRequests.filter(r => ['submitted', 'in_review'].includes(r.status)).length,
      rejected: filteredRequests.filter(r => r.status === 'rejected').length,
      completed: filteredRequests.filter(r => r.status === 'completed').length,
      inDevelopment: filteredRequests.filter(r => r.status === 'in_development').length
    };
  };
  
  const getSprintStats = () => {
    const filteredRequests = getFilteredRequests();
    
    return {
      withSprint: filteredRequests.filter(r => r.sprintInfo).length,
      withoutSprint: filteredRequests.filter(r => !r.sprintInfo && r.status === 'approved').length,
      userStoriesGenerated: filteredRequests.filter(r => r.userStoryGenerated).length,
      userStoriesPending: filteredRequests.filter(r => r.status === 'approved' && !r.userStoryGenerated).length
    };
  };

  const getDepartments = () => {
    const departments = [...new Set(requests.map(r => r.department))];
    return departments.sort();
  };

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

  const stats = getStats();
  const sprintStats = getSprintStats();
  const filteredRequests = getFilteredRequests();

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
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600 mt-1">
            Análisis y exportación de solicitudes de integración
          </p>
        </div>
        <button
          onClick={handleExportToExcel}
          disabled={exporting || filteredRequests.length === 0}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>{exporting ? 'Exportando...' : 'Exportar a Excel'}</span>
        </button>
        <button
          onClick={handleExportToPdf}
          disabled={exportingPdf || filteredRequests.length === 0}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          <span>{exportingPdf ? 'Generando PDF...' : 'Reporte Ejecutivo PDF'}</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-blue-600" />
          Filtros
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="submitted">Enviada</option>
              <option value="in_review">En Revisión</option>
              <option value="approved">Aprobada</option>
              <option value="rejected">Rechazada</option>
              <option value="in_development">En Desarrollo</option>
              <option value="completed">Completada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departamento
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los departamentos</option>
              {getDepartments().map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gestión de Sprints
            </label>
            <select
              value={sprintFilter}
              onChange={(e) => setSprintFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las solicitudes</option>
              <option value="with-sprint">Con Sprint asignado</option>
              <option value="without-sprint">Sin Sprint asignado</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Historias de Usuario
            </label>
            <select
              value={userStoryFilter}
              onChange={(e) => setUserStoryFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las solicitudes</option>
              <option value="generated">Con Historia generada</option>
              <option value="pending">Pendientes de Historia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

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
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rechazadas</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Estadísticas de Sprints e Historias de Usuario */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Con Sprint</p>
              <p className="text-2xl font-bold text-blue-600">{sprintStats.withSprint}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sin Sprint</p>
              <p className="text-2xl font-bold text-orange-600">{sprintStats.withoutSprint}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">HU Generadas</p>
              <p className="text-2xl font-bold text-purple-600">{sprintStats.userStoriesGenerated}</p>
            </div>
            <Wand2 className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">HU Pendientes</p>
              <p className="text-2xl font-bold text-indigo-600">{sprintStats.userStoriesPending}</p>
            </div>
            <Clock className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Tabla de Solicitudes */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Solicitudes de Integración ({filteredRequests.length})
            </h2>
            <div className="text-sm text-gray-500">
              {filteredRequests.length !== requests.length && (
                <span>Mostrando {filteredRequests.length} de {requests.length} solicitudes</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Integración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Origen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intermediario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destino
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Solicitud
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Fin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sprint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Historia Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitante
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.title}</div>
                      <div className="text-sm text-gray-500">{getSystemName(request.systemToIntegrate)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getSystemName(request.sourceSystem)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.intermediarySystem ? getSystemName(request.intermediarySystem) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getSystemName(request.targetSystem)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.dueDate ? request.dueDate.toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {request.sprintInfo?.sprintName || 'Sin asignar'}
                      </div>
                      {request.sprintInfo && (
                        <div className="text-sm text-gray-500">
                          {request.sprintInfo.sprintStartDate.toLocaleDateString()} - {request.sprintInfo.sprintEndDate.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request.userStoryGenerated ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Wand2 className="h-3 w-3 inline mr-1" />
                        Generada
                      </span>
                    ) : request.status === 'approved' ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Pendiente
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        N/A
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.requesterName}</div>
                      <div className="text-sm text-gray-500">{request.department}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {request.workFront}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron solicitudes con los filtros aplicados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;